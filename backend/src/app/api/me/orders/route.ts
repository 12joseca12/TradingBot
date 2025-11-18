import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser(req);

    const orders = await prisma.order.findMany({
      where: { userId: user.uid },
      orderBy: { createdAt: "desc" },
      take: 50
    });

    return NextResponse.json(orders, { status: 200 });
  } catch (err) {
    console.error("GET /api/me/orders error:", err);
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}
