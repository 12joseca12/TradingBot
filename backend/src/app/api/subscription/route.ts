import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { z } from "zod";

const PlanSchema = z.object({
  plan: z.enum(["free", "weekly", "monthly", "annual"])
});

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser(req);

    const sub = await prisma.subscription.findFirst({
      where: {
        userId: user.uid,
        status: "active"
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(sub || null, { status: 200 });
  } catch (err) {
    console.error("GET /api/subscription error:", err);
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const json = await req.json();
    const { plan } = PlanSchema.parse(json);

    const now = new Date();
    const expiresAt = new Date(now);

    if (plan === "weekly") {
      expiresAt.setDate(now.getDate() + 7);
    } else if (plan === "monthly") {
      expiresAt.setMonth(now.getMonth() + 1);
    } else if (plan === "annual") {
      expiresAt.setFullYear(now.getFullYear() + 1);
    } else {
      expiresAt.setDate(now.getDate() + 7);
    }

    const sub = await prisma.subscription.create({
      data: {
        userId: user.uid,
        plan,
        status: "active",
        expiresAt
      }
    });

    return NextResponse.json(sub, { status: 201 });
  } catch (err) {
    console.error("POST /api/subscription error:", err);
    return NextResponse.json(
      { error: "Error creando suscripción" },
      { status: 400 }
    );
  }
}

