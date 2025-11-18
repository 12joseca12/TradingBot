import { NextRequest, NextResponse } from "next/server";

const SAMPLE_SIGNALS = [
  {
    id: "sig1",
    symbol: "BTC/USDT",
    direction: "long",
    confidence: 0.71,
    rr: 1.8,
    createdAt: new Date().toISOString()
  },
  {
    id: "sig2",
    symbol: "ETH/USDT",
    direction: "short",
    confidence: 0.63,
    rr: 1.5,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString()
  },
  {
    id: "sig3",
    symbol: "SOL/USDT",
    direction: "long",
    confidence: 0.68,
    rr: 2.0,
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString()
  }
];

export async function GET(_req: NextRequest) {
  return NextResponse.json(SAMPLE_SIGNALS, { status: 200 });
}
