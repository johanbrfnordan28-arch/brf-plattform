/**
 * Kund- och personalinloggning (demo).
 * Kundlista exponeras aldrig publikt — behörighet löses först efter BankID.
 */

import { foreningStorageKey } from "@/lib/foreningStorage";
import {
  FORENING_AKTIV_EVENT,
  GRUNDMALL_FORENING_ID,
  lasForeningProfil,
  listaForeningar,
  sparaForeningProfil,
  type ForeningProfil,
} from "@/lib/forening-registry";
import { arStandardTestForening } from "@/lib/forening-konstanter";
import { hamtaForeningStartPath } from "@/lib/styrelse-kontakt";

export const INLOGGNING_SESSION_KEY = "brf-inloggning-session";
export const INLOGGNING_SESSION_EVENT = "brf-inloggning-session";

const BEHORIGHET_BASE_KEY = "brf-inloggnings-behorigheter";

export type InloggningsRoll = "ordforande" | "ledamot" | "revisor" | "ovrigt";

export type InloggningsBehorig = {
  id: string;
  namn: string;
  /** 12 siffror utan bindestreck (demo). */
  personnummer: string;
  roll: InloggningsRoll;
  tillagdTidpunkt: string;
};

export type InloggningsSession = {
  typ: "kund" | "anstalld";
  namn: string;
  personnummer: string;
  /** Support får hjälpa kunder utan att stå på behörighetslistan. */
  support: boolean;
  foreningId?: string;
  inloggadTidpunkt: string;
};

export type DemoBankIdIdentitet = {
  id: string;
  namn: string;
  personnummer: string;
  beskrivning: string;
  typ: "kund" | "anstalld";
  support: boolean;
};

/** Demo-identiteter för BankID — inte en kundkatalog. */
export const DEMO_BANKID_IDENTITETER: DemoBankIdIdentitet[] = [
  {
    id: "demo-anna",
    namn: "Anna Andersson",
    personnummer: "198003151234",
    beskrivning: "Ordförande i en kundförening",
    typ: "kund",
    support: false,
  },
  {
    id: "demo-erik",
    namn: "Erik Eriksson",
    personnummer: "197511204321",
    beskrivning: "Ledamot i samma förening",
    typ: "kund",
    support: false,
  },
  {
    id: "demo-lisa",
    namn: "Lisa Lind",
    personnummer: "199002089876",
    beskrivning: "Har behörighet i två föreningar",
    typ: "kund",
    support: false,
  },
  {
    id: "demo-support",
    namn: "Sam Support",
    personnummer: "198501011111",
    beskrivning: "Support hos BRF Navet — kan hjälpa kunder",
    typ: "anstalld",
    support: true,
  },
  {
    id: "demo-intern",
    namn: "Ida Intern",
    personnummer: "199203033333",
    beskrivning: "Anställd hos BRF Navet",
    typ: "anstalld",
    support: false,
  },
];

type DemoKundSeed = {
  id: string;
  namn: string;
  organisationsnummer: string;
  ort: string;
  postadress: string;
  epost: string;
  kontaktperson: string;
  behariga: Array<{
    namn: string;
    personnummer: string;
    roll: InloggningsRoll;
  }>;
};

/** Betalande demokunder — skapas tyst i lagring, visas aldrig i lista. */
const DEMO_KUNDER: DemoKundSeed[] = [
  {
    id: "kund-brf-ekbacken",
    namn: "Brf Ekbacken",
    organisationsnummer: "769600-1111",
    ort: "Stockholm",
    postadress: "Ekbacken 12",
    epost: "styrelse@ekbacken.exempel",
    kontaktperson: "Anna Andersson",
    behariga: [
      {
        namn: "Anna Andersson",
        personnummer: "198003151234",
        roll: "ordforande",
      },
      {
        namn: "Erik Eriksson",
        personnummer: "197511204321",
        roll: "ledamot",
      },
      {
        namn: "Lisa Lind",
        personnummer: "199002089876",
        roll: "ledamot",
      },
    ],
  },
  {
    id: "kund-brf-strandparken",
    namn: "Brf Strandparken",
    organisationsnummer: "769600-2222",
    ort: "Göteborg",
    postadress: "Strandvägen 4",
    epost: "styrelse@strandparken.exempel",
    kontaktperson: "Lisa Lind",
    behariga: [
      {
        namn: "Lisa Lind",
        personnummer: "199002089876",
        roll: "ordforande",
      },
    ],
  },
];

export function normaliseraPersonnummer(raw: string): string {
  return raw.replace(/\D/g, "");
}

export function formateraPersonnummer(pnr: string): string {
  const n = normaliseraPersonnummer(pnr);
  if (n.length === 12) return `${n.slice(0, 8)}-${n.slice(8)}`;
  if (n.length === 10) return `${n.slice(0, 6)}-${n.slice(6)}`;
  return pnr;
}

export function maskeraPersonnummer(pnr: string): string {
  const n = normaliseraPersonnummer(pnr);
  if (n.length < 4) return "****";
  return `********-${n.slice(-4)}`;
}

export function rollEtikett(roll: InloggningsRoll): string {
  switch (roll) {
    case "ordforande":
      return "Ordförande";
    case "ledamot":
      return "Ledamot";
    case "revisor":
      return "Revisor";
    default:
      return "Övrig behörig";
  }
}

function lasJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function sparaJson(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

function behorsKey(foreningId: string): string {
  return foreningStorageKey(BEHORIGHET_BASE_KEY, foreningId);
}

export function lasInloggningsBehorigheter(
  foreningId: string,
): InloggningsBehorig[] {
  const data = lasJson<{ poster: InloggningsBehorig[] }>(behorsKey(foreningId));
  if (!data?.poster || !Array.isArray(data.poster)) return [];
  return data.poster.filter(
    (p) =>
      p &&
      typeof p.id === "string" &&
      typeof p.namn === "string" &&
      typeof p.personnummer === "string",
  );
}

export function sparaInloggningsBehorigheter(
  foreningId: string,
  poster: InloggningsBehorig[],
): void {
  sparaJson(behorsKey(foreningId), { version: 1, poster });
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(FORENING_AKTIV_EVENT));
  }
}

export function laggTillInloggningsBehorig(
  foreningId: string,
  input: {
    namn: string;
    personnummer: string;
    roll: InloggningsRoll;
  },
): { ok: true } | { ok: false; fel: string } {
  const namn = input.namn.trim();
  const personnummer = normaliseraPersonnummer(input.personnummer);
  if (!namn) return { ok: false, fel: "Ange namn." };
  if (personnummer.length !== 12 && personnummer.length !== 10) {
    return { ok: false, fel: "Ange personnummer med 10 eller 12 siffror." };
  }
  const befintliga = lasInloggningsBehorigheter(foreningId);
  if (
    befintliga.some(
      (b) => normaliseraPersonnummer(b.personnummer) === personnummer,
    )
  ) {
    return { ok: false, fel: "Personen har redan behörighet att logga in." };
  }
  const ny: InloggningsBehorig = {
    id: `beh-${personnummer}-${Date.now()}`,
    namn,
    personnummer,
    roll: input.roll,
    tillagdTidpunkt: new Date().toISOString(),
  };
  sparaInloggningsBehorigheter(foreningId, [...befintliga, ny]);
  return { ok: true };
}

export function taBortInloggningsBehorig(
  foreningId: string,
  behörigId: string,
): void {
  const kvar = lasInloggningsBehorigheter(foreningId).filter(
    (b) => b.id !== behörigId,
  );
  sparaInloggningsBehorigheter(foreningId, kvar);
}

/** Säkerställer demokunder + behörigheter utan att exponera dem i UI. */
export function sakraDemoKundForeningar(): void {
  if (typeof window === "undefined") return;
  for (const kund of DEMO_KUNDER) {
    const befintlig = lasForeningProfil(kund.id);
    if (!befintlig) {
      const profil: ForeningProfil = {
        id: kund.id,
        namn: kund.namn,
        skapadTidpunkt: new Date().toISOString(),
        organisationsnummer: kund.organisationsnummer,
        epost: kund.epost,
        postadress: kund.postadress,
        ort: kund.ort,
        kontaktperson: kund.kontaktperson,
        grundinfoPaborjad: true,
      };
      try {
        sparaForeningProfil(profil, { tyst: true });
      } catch {
        /* ignore */
      }
    }
    if (lasInloggningsBehorigheter(kund.id).length === 0) {
      sparaInloggningsBehorigheter(
        kund.id,
        kund.behariga.map((b, i) => ({
          id: `seed-${kund.id}-${i}`,
          namn: b.namn,
          personnummer: normaliseraPersonnummer(b.personnummer),
          roll: b.roll,
          tillagdTidpunkt: new Date().toISOString(),
        })),
      );
    }
  }
}

export function arBetalandeKundForening(foreningId: string): boolean {
  if (!foreningId || foreningId === GRUNDMALL_FORENING_ID) return false;
  if (arStandardTestForening(foreningId)) return false;
  return true;
}

/**
 * Hitta föreningar personen får logga in till.
 * Returnerar aldrig hela kundkatalogen — bara matchande behörigheter.
 */
export function hittaForeningarForPerson(
  personnummer: string,
): ForeningProfil[] {
  sakraDemoKundForeningar();
  const pnr = normaliseraPersonnummer(personnummer);
  if (!pnr) return [];
  const resultat: ForeningProfil[] = [];
  for (const f of listaForeningar()) {
    if (!arBetalandeKundForening(f.id)) continue;
    const beh = lasInloggningsBehorigheter(f.id);
    if (beh.some((b) => normaliseraPersonnummer(b.personnummer) === pnr)) {
      resultat.push(f);
    }
  }
  return resultat;
}

/** Support/anställd: slå upp en kund via org.nr — ingen lista visas. */
export function hittaKundViaOrganisationsnummer(
  orgNr: string,
): ForeningProfil | null {
  sakraDemoKundForeningar();
  const nyckel = orgNr.replace(/\D/g, "");
  if (nyckel.length < 6) return null;
  for (const f of listaForeningar()) {
    if (!arBetalandeKundForening(f.id)) continue;
    const fNr = (f.organisationsnummer || "").replace(/\D/g, "");
    if (fNr && fNr === nyckel) return f;
  }
  return null;
}

export function lasInloggningsSession(): InloggningsSession | null {
  return lasJson<InloggningsSession>(INLOGGNING_SESSION_KEY);
}

export function sparaInloggningsSession(session: InloggningsSession): void {
  sparaJson(INLOGGNING_SESSION_KEY, session);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(INLOGGNING_SESSION_EVENT));
  }
}

export function rensaInloggningsSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(INLOGGNING_SESSION_KEY);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(INLOGGNING_SESSION_EVENT));
}

export function startaForeningEfterInloggning(foreningId: string): string {
  return hamtaForeningStartPath(foreningId);
}

/** Initiera behörighet för den som skapat föreningen (första admin). */
export function initieraSkapareSomBehorig(
  foreningId: string,
  input: { namn: string; personnummer?: string; roll?: InloggningsRoll },
): void {
  if (!arBetalandeKundForening(foreningId)) return;
  if (lasInloggningsBehorigheter(foreningId).length > 0) return;
  const personnummer = normaliseraPersonnummer(
    input.personnummer || "190001019999",
  );
  sparaInloggningsBehorigheter(foreningId, [
    {
      id: `skap-${foreningId}`,
      namn: input.namn.trim() || "Styrelseansvarig",
      personnummer,
      roll: input.roll || "ordforande",
      tillagdTidpunkt: new Date().toISOString(),
    },
  ]);
}
