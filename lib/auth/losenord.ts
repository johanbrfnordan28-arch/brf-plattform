import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEYLEN = 64;

/** Genererar ett tillfälligt lösenord som skickas vid skapande / återställning. */
export function genereraTillfalligtLosenord(langd = 12): string {
  const alfabet =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = randomBytes(langd);
  let ut = "";
  for (let i = 0; i < langd; i += 1) {
    ut += alfabet[bytes[i]! % alfabet.length];
  }
  return ut;
}

export function hashLosenord(losenord: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(losenord, salt, KEYLEN, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
  }).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifieraLosenord(
  losenord: string,
  lagratHash: string,
): boolean {
  const delar = lagratHash.split("$");
  if (delar.length !== 3 || delar[0] !== "scrypt") return false;
  const salt = delar[1]!;
  const forvantad = Buffer.from(delar[2]!, "hex");
  const kandidat = scryptSync(losenord, salt, KEYLEN, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
  });
  if (kandidat.length !== forvantad.length) return false;
  return timingSafeEqual(kandidat, forvantad);
}

export function valideraLosenordStyrka(losenord: string): string | null {
  if (losenord.length < 8) {
    return "Lösenordet måste vara minst 8 tecken.";
  }
  if (losenord.length > 128) {
    return "Lösenordet är för långt.";
  }
  return null;
}
