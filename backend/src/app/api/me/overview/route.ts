import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser(req);

    const [openPositions, recentOrders, subs] = await Promise.all([
      prisma.position.count({
        where: { userId: user.uid, status: "open" }
      }),
      prisma.order.count({
        where: {
          userId: user.uid,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      }),
      prisma.subscription.findMany({
        where: { userId: user.uid, status: "active" }
      })
    ]);

    return NextResponse.json(
      {
        email: user.email,
        openPositions,
        recentOrders24h: recentOrders,
        activeSubscriptions: subs
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /api/me/overview error:", err);
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}
