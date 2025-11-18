// backend/src/app/api/credentials/kraken/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { encryptToB64 } from "@/lib/crypto";

const CredsSchema = z.object({
  apiKey: z.string().min(10),
  apiSecret: z.string().min(10)
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const json = await req.json();
    const { apiKey, apiSecret } = CredsSchema.parse(json);

    const apiKeyEnc = encryptToB64(apiKey);
    const apiSecEnc = encryptToB64(apiSecret);

    const existing = await prisma.apiCredential.findFirst({
      where: {
        userId: user.uid,
        exchange: "kraken"
      }
    });

    if (existing) {
      await prisma.apiCredential.update({
        where: { id: existing.id },
        data: {
          apiKeyEnc,
          apiSecEnc
        }
      });
    } else {
      await prisma.apiCredential.create({
        data: {
          userId: user.uid,
          exchange: "kraken",
          apiKeyEnc,
          apiSecEnc
        }
      });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("POST /credentials/kraken error:", err);
    return NextResponse.json(
      { error: "Error guardando credenciales" },
      { status: 400 }
    );
  }
}
