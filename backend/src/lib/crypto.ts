// backend/src/lib/crypto.ts
import crypto from "crypto";

const ENC_KEY_HEX = process.env.ENC_KEY_HEX;

if (!ENC_KEY_HEX || ENC_KEY_HEX.length !== 64) {
  throw new Error(
    "ENC_KEY_HEX inválido o no definido. Debe ser 32 bytes en hex (64 caracteres)."
  );
}

const ENC_KEY = Buffer.from(ENC_KEY_HEX, "hex"); // 32 bytes

export function encryptToB64(plain: string): string {
  const iv = crypto.randomBytes(12); // 96-bit IV para GCM
  const cipher = crypto.createCipheriv("aes-256-gcm", ENC_KEY, iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, enc]).toString("base64");
}

export function decryptFromB64(b64: string): string {
  const raw = Buffer.from(b64, "base64");
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const enc = raw.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", ENC_KEY, iv);
  decipher.setAuthTag(tag);

  const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
  return dec.toString("utf8");
}
