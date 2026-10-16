/** Validering och maskering av svenskt personnummer — kan köras i webbläsaren. */

export function normaliseraPersonnummerSiffror(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10 || digits.length === 12) return digits;
  return null;
}

function luhnOk(tioSiffror: string): boolean {
  let sum = 0;
  for (let i = 0; i < 10; i += 1) {
    let n = Number(tioSiffror[i]);
    if (i % 2 === 0) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
  }
  return sum % 10 === 0;
}

/** Godkänner 10 eller 12 siffror, med eller utan bindestreck. Samordningsnummer tillåts. */
export function arGiltigtPersonnummer(raw: string): boolean {
  const digits = normaliseraPersonnummerSiffror(raw);
  if (!digits) return false;
  const tio = digits.length === 12 ? digits.slice(2) : digits;
  const mm = Number(tio.slice(2, 4));
  let dd = Number(tio.slice(4, 6));
  if (dd > 60) dd -= 60;
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return false;
  return luhnOk(tio);
}

/** Visningsform utan de fyra sista siffrorna — fullständigt personnummer sparas inte. */
export function maskeraPersonnummer(raw: string): string {
  const digits = normaliseraPersonnummerSiffror(raw);
  if (!digits) return "";
  if (digits.length === 12) return `${digits.slice(0, 8)}-****`;
  return `${digits.slice(0, 6)}-****`;
}

export function personnummerFelmeddelande(raw: string): string | null {
  const trim = raw.trim();
  if (!trim) return "Ange personnummer för den som ska signera.";
  if (!arGiltigtPersonnummer(trim)) {
    return "Ange ett giltigt svenskt personnummer (10 eller 12 siffror).";
  }
  return null;
}

/** SHA-256 av normaliserade siffror — samma algoritm som serverns personnummerTillNyckel. */
export async function hashaPersonnummer(raw: string): Promise<string | null> {
  const digits = normaliseraPersonnummerSiffror(raw);
  if (!digits) return null;
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(digits),
  );
  return Array.from(new Uint8Array(buf), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}
