import { safeSetLocalStorage } from "@/lib/localStorage";

const STORAGE_KEY = "brf-offert-forfragan-v1";
export const OFFERT_FORFRAGAN_EVENT = "offert-forfragan-uppdaterad";

export const OFFERT_TJANSTER = [
  "Teknisk förvaltning",
  "Projektledning",
  "Skadeutredning",
  "Besiktning",
  "Upphandling",
  "Övrig konsulttjänst",
] as const;

export type OffertTjanst = (typeof OFFERT_TJANSTER)[number];

export type OffertForfraganStatus =
  | "ny"
  | "kontaktad"
  | "offert-skickad"
  | "avslutad";

export type OffertForfragan = {
  id: string;
  foreningsNamn: string;
  kontaktperson: string;
  epost: string;
  telefon: string;
  antalLagenheter: string;
  tjanster: OffertTjanst[];
  meddelande: string;
  status: OffertForfraganStatus;
  skapad: string;
  senastOffertSkickad?: string;
  internAnteckning?: string;
};

function skapaId(): string {
  return `offert-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function las(): OffertForfragan[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as OffertForfragan[]) : [];
  } catch {
    return [];
  }
}

function spara(lista: OffertForfragan[]): void {
  if (typeof window === "undefined") return;
  safeSetLocalStorage(STORAGE_KEY, JSON.stringify(lista));
  window.dispatchEvent(new Event(OFFERT_FORFRAGAN_EVENT));
}

export function listaOffertForfragningar(): OffertForfragan[] {
  return las().sort((a, b) => b.skapad.localeCompare(a.skapad));
}

export function skapaOffertForfragan(input: {
  foreningsNamn: string;
  kontaktperson: string;
  epost: string;
  telefon?: string;
  antalLagenheter?: string;
  tjanster: OffertTjanst[];
  meddelande?: string;
}): OffertForfragan {
  const epost = input.epost.trim().toLowerCase();
  const foreningsNamn = input.foreningsNamn.trim();
  const kontaktperson = input.kontaktperson.trim();
  if (!epost || !foreningsNamn || !kontaktperson) {
    throw new Error("Fyll i föreningsnamn, kontaktperson och e-post.");
  }
  if (!input.tjanster.length) {
    throw new Error("Välj minst en tjänst.");
  }

  const rad: OffertForfragan = {
    id: skapaId(),
    foreningsNamn,
    kontaktperson,
    epost,
    telefon: (input.telefon ?? "").trim(),
    antalLagenheter: (input.antalLagenheter ?? "").trim(),
    tjanster: input.tjanster,
    meddelande: (input.meddelande ?? "").trim(),
    status: "ny",
    skapad: new Date().toISOString(),
  };
  spara([rad, ...las()]);
  return rad;
}

export function uppdateraOffertForfragan(
  id: string,
  patch: Partial<
    Pick<
      OffertForfragan,
      "status" | "internAnteckning" | "senastOffertSkickad"
    >
  >,
): OffertForfragan {
  const lista = las();
  const index = lista.findIndex((r) => r.id === id);
  if (index < 0) throw new Error("Förfrågan hittades inte.");
  const nasta = { ...lista[index]!, ...patch };
  lista[index] = nasta;
  spara(lista);
  return nasta;
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
