import crypto from "crypto";

const ENC_KEY_HEX = process.env.ENC_KEY_HEX;

if (!ENC_KEY_HEX || ENC_KEY_HEX.length !== 64) {
  throw new Error(
    "ENC_KEY_HEX inválido o no definido en worker. Debe ser 32 bytes en hex (64 chars)."
  );
}

const ENC_KEY = Buffer.from(ENC_KEY_HEX, "hex");

export function decryptFromB64(b64) {
  const raw = Buffer.from(b64, "base64");
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const enc = raw.subarray(28);

  const decipher = crypto.createDecipheriv("aes-256-gcm", ENC_KEY, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
  return dec.toString("utf8");
}

