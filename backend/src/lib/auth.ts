// backend/src/lib/auth.ts
import { NextRequest } from "next/server";
import { verifyJWT } from "./jwt";

export interface AuthPayload {
  uid: string;
  email: string;
}

export async function requireUser(req: NextRequest): Promise<AuthPayload> {
  const authHeader = req.headers.get("authorization") || "";
  const match = authHeader.match(/^Bearer (.+)$/i);

  if (!match) {
    throw new Error("NO_AUTH");
  }

  const token = match[1];
  try {
    const payload = await verifyJWT<AuthPayload>(token);
    if (!payload.uid || !payload.email) throw new Error("BAD_PAYLOAD");
    return payload;
  } catch {
    throw new Error("INVALID_TOKEN");
  }
}
