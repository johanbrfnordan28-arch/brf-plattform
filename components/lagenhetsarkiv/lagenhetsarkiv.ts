import {
  egenkontrollPunkterForMall,
  hamtaRenoveringsMall,
  undermappTyperForMall,
  type RenoveringsMallId,
  type RenoveringsUndermappTyp,
} from "@/components/lagenhetsarkiv/renoverings-mallar";

export type LagenhetsDokument = {
  id: string;
  filnamn: string;
  uppladdad: string;
};

export type RenoveringsUndermapp = {
  id: string;
  typ: RenoveringsUndermappTyp;
  dokument: LagenhetsDokument[];
};

export type EgenkontrollPunkt = {
  id: string;
  text: string;
  signerad: boolean;
  signeradDatum?: string;
  signeradAv?: string;
  /** Bilder på befintliga skador — krävs vid startbesiktning före BankID-signering. */
  skadebilder?: LagenhetsDokument[];
};

export type RenoveringsMapp = {
  id: number;
  name: string;
  mallId?: RenoveringsMallId;
  undermappar: RenoveringsUndermapp[];
  egenkontroller: EgenkontrollPunkt[];
};

/** @deprecated Använd RenoveringsMapp */
export type RenovationFolder = RenoveringsMapp;

/** Värmesystem i lägenheten — flera alternativ möjliga. */
export type LagenhetVarme =
  | "golvvarme-vatten"
  | "golvvarme-el"
  | "radiatorer"
  | "elradiatorer"
  | "varmepump-luft"
  | "fjarvarmepanel";

export const LAGENHET_VARME_ETIKETTER: Record<LagenhetVarme, string> = {
  "golvvarme-vatten": "Golvvärme (vattenburen)",
  "golvvarme-el": "Golvvärme (elektrisk)",
  radiatorer: "Radiatorer (vattenburen)",
  elradiatorer: "Elradiatorer",
  "varmepump-luft": "Luftvärmepump",
  fjarvarmepanel: "Fjärrvärme (direktpanel)",
};

export type ApartmentFolder = {
  /** Stabil nyckel — ändras aldrig vid nummerbyte. */
  id: number;
  lagenhetsnummer: string;
  basePages: string[];
  folders: RenoveringsMapp[];

  // ── Ny lägenhetsinfo ───────────────────────────────────────────────────────
  /** Gatuadress för lägenheten (kan skilja sig från byggnadens). */
  adress?: string;
  /** Våningsplan, t.ex. "3" eller "BV" (bottenvåning). */
  vaning?: string;
  /** Antal rum, t.ex. "3 rum och kök". */
  antalRum?: string;
  /** Registrerad bostadsyta (BOA) i m². */
  boyta?: string;
  /** Biarea (BIA) i m², t.ex. förråd, garage. */
  biyta?: string;
  /** Uppmätt yta — kan avvika från registrerad. */
  uppmattYta?: string;
  /** Andelstal/insats, t.ex. "0,7842 %" eller "550 000 kr". */
  andelstal?: string;
  /** Referens till ritning — filnamn eller länk. */
  ritning?: string;
  /** Värmesystem i lägenheten. */
  varme?: LagenhetVarme[];
  /** Ventilationssystem, t.ex. "FTX", "F", "Självdrag". */
  ventilation?: string;
  /** Balkong/terrass, t.ex. "Ja, 7 m² mot söder". */
  balkong?: string;
  /** Källarförråd — nummer eller beskrivning. */
  kallareForrad?: string;
  /** P-plats — nummer eller info. */
  pPlats?: string;
  /** År för senast utfört stambyte. */
  senastStambyte?: string;
  /** Övrig notering om lägenheten. */
  lagenhetNotering?: string;
};

export const lagenhetsBasSidor = ["Anmälningar", "Beslut", "Slutdokument"] as const;

export function skapaLagenhetsDokumentId(): string {
  return `lagenhet-doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function skapaRenoveringsMapp(
  mallId: RenoveringsMallId,
  options?: { namn?: string; ar?: number; id?: number },
): RenoveringsMapp {
  const mall = hamtaRenoveringsMall(mallId);
  const ar = options?.ar ?? new Date().getFullYear();
  const mappId = options?.id ?? Date.now();
  const name = options?.namn?.trim() || `${mall.standardNamn} ${ar}`;

  return {
    id: mappId,
    name,
    mallId,
    undermappar: undermappTyperForMall(mall).map((typ) => ({
      id: `${mappId}-${typ}`,
      typ,
      dokument: [],
    })),
    egenkontroller: egenkontrollPunkterForMall(mall).map((p) => ({
      ...p,
      signerad: false,
      skadebilder: [],
    })),
  };
}

export function antalDokumentRenoveringsMapp(mapp: RenoveringsMapp): number {
  return mapp.undermappar.reduce((sum, u) => sum + u.dokument.length, 0);
}

export function formatLagenhetEtikett(lagenhetsnummer: string): string {
  const nr = normaliseraLagenhetsnummer(lagenhetsnummer);
  return nr ? `Lägenhet ${nr}` : "Lägenhet";
}

export function normaliseraLagenhetsnummer(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

export function hamtaNastaLagenhetsnummer(apartments: ApartmentFolder[]): number {
  const tal = apartments
    .map((a) => Number.parseInt(a.lagenhetsnummer, 10))
    .filter((n) => Number.isFinite(n));
  return tal.length > 0 ? Math.max(...tal) + 1 : 1001;
}

export function hittaLagenhetEfterNummer(
  apartments: ApartmentFolder[],
  lagenhetsnummer: string,
): ApartmentFolder | undefined {
  const sökt = normaliseraLagenhetsnummer(lagenhetsnummer);
  if (!sökt) return undefined;
  return apartments.find(
    (a) => normaliseraLagenhetsnummer(a.lagenhetsnummer) === sökt,
  );
}

export type BytLagenhetsnummerResult =
  | { ok: true; apartmentId: number; från: string; till: string }
  | { ok: false; fel: string };

export function bytLagenhetsnummer(
  apartments: ApartmentFolder[],
  frånNummer: string,
  tillNummer: string,
): BytLagenhetsnummerResult {
  const från = normaliseraLagenhetsnummer(frånNummer);
  const till = normaliseraLagenhetsnummer(tillNummer);

  if (!från || !till) {
    return { ok: false, fel: "Ange både aktuellt nummer och nytt nummer." };
  }

  if (från === till) {
    return { ok: false, fel: "Nytt nummer är samma som det aktuella." };
  }

  const lägenhet = hittaLagenhetEfterNummer(apartments, från);
  if (!lägenhet) {
    return { ok: false, fel: `Ingen lägenhet med nummer ${från} hittades.` };
  }

  const upptaget = hittaLagenhetEfterNummer(apartments, till);
  if (upptaget && upptaget.id !== lägenhet.id) {
    return {
      ok: false,
      fel: `Nummer ${till} används redan av ${formatLagenhetEtikett(till)}.`,
    };
  }

  return { ok: true, apartmentId: lägenhet.id, från, till };
}

export function appliceraLagenhetsnummerByte(
  apartments: ApartmentFolder[],
  apartmentId: number,
  nyttNummer: string,
): ApartmentFolder[] {
  const till = normaliseraLagenhetsnummer(nyttNummer);
  return apartments.map((apartment) =>
    apartment.id === apartmentId
      ? { ...apartment, lagenhetsnummer: till }
      : apartment,
  );
}
