import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

function nyckelFranSecret(): Buffer {
  const secret =
    process.env.AUTH_SECRET?.trim() ||
    process.env.NEXTAUTH_SECRET?.trim() ||
    "brf-dev-secret-byt-i-produktion";
  return createHash("sha256").update(secret, "utf8").digest();
}

/** Krypterar lösenord så endast servern (för ägarens session) kan visa det. */
export function krypteraLosenordForVisning(losenord: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", nyckelFranSecret(), iv);
  const krypterat = Buffer.concat([
    cipher.update(losenord, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return [
    iv.toString("base64url"),
    tag.toString("base64url"),
    krypterat.toString("base64url"),
  ].join(".");
}

export function dekrypteraLosenordForVisning(kuvert: string): string | null {
  if (!kuvert || !kuvert.includes(".")) return null;
  try {
    const [ivB64, tagB64, dataB64] = kuvert.split(".");
    if (!ivB64 || !tagB64 || !dataB64) return null;
    const iv = Buffer.from(ivB64, "base64url");
    const tag = Buffer.from(tagB64, "base64url");
    const data = Buffer.from(dataB64, "base64url");
    const decipher = createDecipheriv("aes-256-gcm", nyckelFranSecret(), iv);
    decipher.setAuthTag(tag);
    const klar = Buffer.concat([decipher.update(data), decipher.final()]);
    return klar.toString("utf8");
  } catch {
    return null;
  }
}
