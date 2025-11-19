import { SignJWT, jwtVerify } from "jose";

const secret = process.env.JWT_SECRET || "dev-secret-change-me";

const JWT_SECRET = new TextEncoder().encode(secret);

export async function signJWT(
  payload: Record<string, unknown>,
  exp: string | number = "7d"
) {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(exp)
    .sign(JWT_SECRET);
}

export async function verifyJWT<T = any>(token: string): Promise<T> {
  const { payload } = await jwtVerify(token, JWT_SECRET);
  return payload as T;
}

