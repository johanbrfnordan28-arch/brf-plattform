export type EntreprenorStatus =
  | "godkand"
  | "vantar_godkannande"
  | "under_utredning"
  | "borttagen";

export type Entreprenor = {
  id: string;
  foretagsnamn: string;
  organisationsnummer: string;
  kontaktperson: string;
  epost: string;
  telefon: string;
  kategorier: string[];
  referens: string;
  status: EntreprenorStatus;
  betyg: number;
  antalBetyg: number;
  registreradAv: string;
  godkandDatum?: string;
};

export type EntreprenorForm = {
  foretagsnamn: string;
  organisationsnummer: string;
  kontaktperson: string;
  epost: string;
  telefon: string;
  referens: string;
  kategorier: string[];
};

/** Uppgifter som behörig person ska lägga in vid registrering. */
export const registreringsFalt: {
  id: keyof EntreprenorForm;
  label: string;
  placeholder: string;
  obligatorisk: boolean;
  typ?: "text" | "email" | "tel";
}[] = [
  {
    id: "foretagsnamn",
    label: "Företagsnamn",
    placeholder: "t.ex. Bygg & Service AB",
    obligatorisk: true,
  },
  {
    id: "organisationsnummer",
    label: "Organisationsnummer",
    placeholder: "t.ex. 556123-4567",
    obligatorisk: true,
  },
  {
    id: "kontaktperson",
    label: "Kontaktperson",
    placeholder: "För- och efternamn",
    obligatorisk: true,
  },
  {
    id: "epost",
    label: "E-post",
    placeholder: "kontakt@foretag.se",
    obligatorisk: true,
    typ: "email",
  },
  {
    id: "telefon",
    label: "Telefon",
    placeholder: "t.ex. 08-123 45 67",
    obligatorisk: true,
    typ: "tel",
  },
  {
    id: "referens",
    label: "Referens / merit",
    placeholder: "Kort om erfarenhet från BRF-projekt, certifieringar m.m.",
    obligatorisk: true,
  },
];

export const entreprenorKategorier = [
  "Bygg",
  "Fasad",
  "Tak",
  "El",
  "Målning",
  "VVS",
  "Fastighetsskötsel",
  "Byggservice",
] as const;

export const demoEntreprenorer: Entreprenor[] = [
  {
    id: "ent-1",
    foretagsnamn: "Tak & Plåt Nord AB",
    organisationsnummer: "556201-1122",
    kontaktperson: "Anna Lindqvist",
    epost: "anna@takplattnord.se",
    telefon: "08-441 22 00",
    kategorier: ["Tak", "Bygg"],
    referens: "Omläggning tak i tre BRF:er i Stockholm 2022–2025.",
    status: "godkand",
    betyg: 4.6,
    antalBetyg: 12,
    registreradAv: "Behörig handläggare",
    godkandDatum: "2025-11-01",
  },
  {
    id: "ent-2",
    foretagsnamn: "VVS Partner Syd",
    organisationsnummer: "556334-8899",
    kontaktperson: "Erik Johansson",
    epost: "erik@vvspartner.se",
    telefon: "08-550 10 20",
    kategorier: ["VVS", "Bygg"],
    referens: "Stambyten och badrumsrenoveringar i flerbostadshus.",
    status: "godkand",
    betyg: 4.2,
    antalBetyg: 8,
    registreradAv: "Behörig handläggare",
    godkandDatum: "2025-09-15",
  },
  {
    id: "ent-3",
    foretagsnamn: "Fasadrenovering AB",
    organisationsnummer: "556778-3344",
    kontaktperson: "Maria Berg",
    epost: "maria@fasadrenovering.se",
    telefon: "08-120 33 44",
    kategorier: ["Fasad", "Målning"],
    referens: "Puts och målning, energioptimering fasad.",
    status: "godkand",
    betyg: 4.8,
    antalBetyg: 15,
    registreradAv: "Behörig handläggare",
    godkandDatum: "2026-01-10",
  },
];

export const statusEtiketter: Record<EntreprenorStatus, string> = {
  godkand: "Godkänd",
  vantar_godkannande: "Väntar godkännande",
  under_utredning: "Under utredning",
  borttagen: "Borttagen",
};

export function skapaEntreprenorId(): string {
  return `ent-${Date.now()}`;
}

export function tomForm(): EntreprenorForm {
  return {
    foretagsnamn: "",
    organisationsnummer: "",
    kontaktperson: "",
    epost: "",
    telefon: "",
    referens: "",
    kategorier: [],
  };
}
