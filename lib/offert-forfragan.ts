import type { OffertKontaktpersonId } from "@/lib/kontakt-epost";

export const OFFERT_TJANSTER = [
  "Underhållsplan",
  "Teknisk förvaltning",
  "Projektledning",
  "Skadeutredning",
  "Besiktning",
  "Upphandling",
  "Övrig konsulttjänst",
] as const;

export type OffertTjanst = (typeof OFFERT_TJANSTER)[number];

export const OFFERT_STATUS = [
  "ny",
  "kontaktad",
  "offert-skickad",
  "avslutad",
] as const;

export type OffertForfraganStatus = (typeof OFFERT_STATUS)[number];

export const OFFERT_STATUS_ETIKETT: Record<OffertForfraganStatus, string> = {
  ny: "Ny",
  kontaktad: "Kontaktad",
  "offert-skickad": "Offert skickad",
  avslutad: "Avslutad",
};

export const OFFERT_MAXLANGD = {
  foreningsNamn: 150,
  kontaktperson: 120,
  epost: 200,
  telefon: 40,
  antalLagenheter: 20,
  meddelande: 3000,
  internAnteckning: 3000,
} as const;

export type OffertForfragan = {
  id: string;
  foreningsNamn: string;
  kontaktperson: string;
  /** Vem kunden vill ha kontakt med hos Styrelse-Navet. */
  oonskadKontaktId: OffertKontaktpersonId;
  epost: string;
  telefon: string;
  antalLagenheter: string;
  tjanster: OffertTjanst[];
  meddelande: string;
  status: OffertForfraganStatus;
  skapad: string;
  senastOffertSkickad?: string;
  internAnteckning: string;
};

export type OffertForfraganInput = {
  foreningsNamn: string;
  kontaktperson: string;
  oonskadKontaktId: string;
  epost: string;
  telefon?: string;
  antalLagenheter?: string;
  tjanster: string[];
  meddelande?: string;
};

export function arOffertStatus(v: unknown): v is OffertForfraganStatus {
  return (
    typeof v === "string" &&
    (OFFERT_STATUS as readonly string[]).includes(v)
  );
}

export function arOffertTjanst(v: unknown): v is OffertTjanst {
  return (
    typeof v === "string" &&
    (OFFERT_TJANSTER as readonly string[]).includes(v)
  );
}

export function mailtoOffertTillKund(opts: {
  forfragan: OffertForfragan;
  brodtext: string;
}): string {
  const amne = encodeURIComponent(
    `Offert — Styrelse-Navet (${opts.forfragan.foreningsNamn})`,
  );
  const body = encodeURIComponent(opts.brodtext);
  return `mailto:${encodeURIComponent(opts.forfragan.epost)}?subject=${amne}&body=${body}`;
}
