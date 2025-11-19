import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "open";

    const where: any = { userId: user.uid };
    if (status !== "all") {
      where.status = status;
    }

    const positions = await prisma.position.findMany({
      where,
      orderBy: { openedAt: "desc" },
      take: 50
    });

    return NextResponse.json(positions, { status: 200 });
  } catch (err) {
    console.error("GET /api/me/positions error:", err);
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}

