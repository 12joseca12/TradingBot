import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import argon2 from "argon2";
import { prisma } from "@/lib/prisma";
import { signJWT } from "@/lib/jwt";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const { email, password } = LoginSchema.parse(json);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { error: "Credenciales incorrectas" },
        { status: 401 }
      );
    }

    const ok = await argon2.verify(user.password, password);
    if (!ok) {
      return NextResponse.json(
        { error: "Credenciales incorrectas" },
        { status: 401 }
      );
    }

    const token = await signJWT({ uid: user.id, email: user.email }, "7d");
    return NextResponse.json({ token }, { status: 200 });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "Error en login" },
      { status: 400 }
    );
  }
}

