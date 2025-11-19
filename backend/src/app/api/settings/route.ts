import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { z } from "zod";

const SettingsSchema = z.object({
  symbols: z.string().optional(),
  riskMode: z.enum(["ultraModerado", "moderado", "normal", "agresivo", "ultra"]).optional(),
  minRiskPct: z.number().optional(),
  maxRiskPct: z.number().optional(),
  autoScaleEnabled: z.boolean().optional(),
  rrTP: z.number().optional(),
  slMult: z.number().optional(),
  dailyStopPct: z.number().optional(),
  maxSimultaneous: z.number().optional(),
  forceFlatTime: z.string().optional(),
  botEnabled: z.boolean().optional()
});

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const settings = await prisma.strategySetting.findUnique({
      where: { userId: user.uid }
    });
    return NextResponse.json(settings, { status: 200 });
  } catch (err) {
    console.error("GET /settings error:", err);
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const json = await req.json();
    const body = SettingsSchema.parse(json);

    const updated = await prisma.strategySetting.upsert({
      where: { userId: user.uid },
      create: {
        userId: user.uid,
        ...body
      },
      update: {
        ...body
      }
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    console.error("POST /settings error:", err);
    return NextResponse.json({ error: "Error en settings" }, { status: 400 });
  }
}

