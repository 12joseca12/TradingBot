import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import argon2 from "argon2";
import { prisma } from "@/lib/prisma";
import { signJWT } from "@/lib/jwt";

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  affiliateCode: z.string().optional()
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const { email, password, affiliateCode } = RegisterSchema.parse(json);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Usuario ya existe" },
        { status: 409 }
      );
    }

    const hash = await argon2.hash(password);

    let referredById: string | undefined = undefined;
    if (affiliateCode) {
      const affiliate = await prisma.affiliate.findFirst({
        where: { code: affiliateCode }
      });
      if (affiliate) {
        referredById = affiliate.id;
      }
    }

    const user = await prisma.user.create({
      data: {
        email,
        password: hash,
        referredById,
        settings: {
          create: {}
        }
      }
    });

    const token = await signJWT({ uid: user.id, email: user.email }, "7d");

    return NextResponse.json({ token }, { status: 201 });
  } catch (err: unknown) {
    console.error("Register error:", err);
    return NextResponse.json(
      { error: "Error en registro" },
      { status: 400 }
    );
  }
}

