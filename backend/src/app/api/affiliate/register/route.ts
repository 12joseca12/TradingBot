// backend/src/app/api/affiliate/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import crypto from "crypto";

function generateAffiliateCode(): string {
  return crypto.randomBytes(4).toString("hex"); // 8 chars
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);

    const existingUser = await prisma.user.findUnique({
      where: { id: user.uid },
      include: { settings: true }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    if (existingUser.isAffiliate) {
      const existingAffiliate = await prisma.affiliate.findFirst({
        where: { userId: user.uid }
      });

      return NextResponse.json(
        {
          ok: true,
          affiliateCode: existingUser.affiliateCode,
          affiliateId: existingAffiliate?.id
        },
        { status: 200 }
      );
    }

    let code: string;
    while (true) {
      const candidate = generateAffiliateCode();
      const exists = await prisma.user.findFirst({
        where: { affiliateCode: candidate }
      });
      if (!exists) {
        code = candidate;
        break;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.uid },
      data: {
        isAffiliate: true,
        affiliateCode: code
      }
    });

    const affiliate = await prisma.affiliate.create({
      data: {
        userId: user.uid
      }
    });

    return NextResponse.json(
      {
        ok: true,
        affiliateCode: updatedUser.affiliateCode,
        affiliateId: affiliate.id
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /affiliate/register error:", err);
    return NextResponse.json(
      { error: "Error registrando afiliado" },
      { status: 400 }
    );
  }
}
