/**
 * Gemensam modell för BankID-avtalssignering.
 * Två olika personer krävs. Personnummer binds in via maskerad visning + hash.
 */

export const BANKID_KRAV_SIGNATURER = 2;

export type BankIdPart = "forening" | "foretag" | "kund";

export type BankIdSignatur = {
  namn: string;
  personnummerMaskerat: string;
  personnummerNyckel: string;
  tidpunkt: string;
  part: BankIdPart;
};

export function arBankIdSignatur(value: unknown): value is BankIdSignatur {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<BankIdSignatur>;
  return (
    typeof v.namn === "string" &&
    typeof v.personnummerMaskerat === "string" &&
    typeof v.personnummerNyckel === "string" &&
    typeof v.tidpunkt === "string" &&
    (v.part === "forening" || v.part === "foretag" || v.part === "kund")
  );
}

export function normaliseraBankIdSignaturer(raw: unknown): BankIdSignatur[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(arBankIdSignatur);
}

export function harTillrackligaBankIdSignaturer(
  signaturer: BankIdSignatur[],
  krav = BANKID_KRAV_SIGNATURER,
): boolean {
  return signaturer.length >= krav;
}

export function laggTillBankIdSignatur(
  befintliga: BankIdSignatur[],
  ny: BankIdSignatur,
  krav = BANKID_KRAV_SIGNATURER,
): { ok: true; signaturer: BankIdSignatur[] } | { ok: false; fel: string } {
  const namn = ny.namn.trim();
  if (!namn) return { ok: false, fel: "Ange namn för BankID-signering." };
  if (!ny.personnummerNyckel || !ny.personnummerMaskerat) {
    return { ok: false, fel: "BankID-signering kräver personnummer på undertecknaren." };
  }
  if (befintliga.length >= krav) {
    return { ok: false, fel: "Avtalet har redan två undertecknare från denna part." };
  }
  if (befintliga.some((s) => s.personnummerNyckel === ny.personnummerNyckel)) {
    return {
      ok: false,
      fel: "Samma person kan inte signera två gånger. Den andra undertecknaren måste ha ett annat personnummer.",
    };
  }
  return {
    ok: true,
    signaturer: [
      ...befintliga,
      {
        namn,
        personnummerMaskerat: ny.personnummerMaskerat,
        personnummerNyckel: ny.personnummerNyckel,
        tidpunkt: ny.tidpunkt || new Date().toISOString(),
        part: ny.part,
      },
    ],
  };
}

export function formateraBankIdSignatur(s: BankIdSignatur): string {
  return `${s.namn} · ${s.personnummerMaskerat}`;
}

export function sammanfattaBankIdSignaturer(signaturer: BankIdSignatur[]): string {
  if (signaturer.length === 0) return "";
  return signaturer.map(formateraBankIdSignatur).join(" och ");
}
