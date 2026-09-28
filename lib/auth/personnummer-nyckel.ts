import { createHash } from "crypto";

/** Normaliserar till siffror (10 eller 12 tecken) för svenskt personnummer. */
export function normaliseraPersonnummerSiffror(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10 || digits.length === 12) return digits;
  return null;
}

/** Stabil nyckel för databassökning — lagrar inte klartext personnummer. */
export function personnummerTillNyckel(raw: string): string | null {
  const digits = normaliseraPersonnummerSiffror(raw);
  if (!digits) return null;
  return createHash("sha256").update(digits, "utf8").digest("hex");
}

/** Hämtar personnummer från Idura/Criipto JWT-claims. */
export function hamtaPersonnummerFranClaims(
  claims: Record<string, unknown>,
): string | null {
  const kandidater = [
    claims.ssn,
    claims.socialno,
    claims.personalnumber,
    claims["https://docs.idura.app/claims/ssn"],
  ];
  for (const v of kandidater) {
    if (typeof v === "string" && v.trim()) {
      const nyckel = personnummerTillNyckel(v);
      if (nyckel) return nyckel;
    }
  }
  if (typeof claims.sub === "string") {
    const nyckel = personnummerTillNyckel(claims.sub);
    if (nyckel) return nyckel;
  }
  return null;
}

export function hamtaVisningsNamnFranClaims(
  claims: Record<string, unknown>,
): string {
  if (typeof claims.name === "string" && claims.name.trim()) {
    return claims.name.trim();
  }
  const given =
    typeof claims.given_name === "string" ? claims.given_name.trim() : "";
  const family =
    typeof claims.family_name === "string" ? claims.family_name.trim() : "";
  return [given, family].filter(Boolean).join(" ").trim();
}
