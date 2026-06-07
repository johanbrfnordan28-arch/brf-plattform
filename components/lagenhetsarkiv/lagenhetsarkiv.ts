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

export type ApartmentFolder = {
  /** Stabil nyckel — ändras aldrig vid nummerbyte. */
  id: number;
  lagenhetsnummer: string;
  basePages: string[];
  folders: RenoveringsMapp[];
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
