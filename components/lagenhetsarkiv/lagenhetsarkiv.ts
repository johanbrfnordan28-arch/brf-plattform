import {
  egenkontrollPunkterForMall,
  forvantadeDokumentForMall,
  hamtaRenoveringsMall,
  undermappEtikett,
  undermappTyperForMall,
  type RenoveringsMallId,
  type RenoveringsUndermappTyp,
} from "@/components/lagenhetsarkiv/renoverings-mallar";
import {
  skapaMedlemsKravForTyp,
  type MedlemsKravState,
} from "@/components/lagenhetsarkiv/medlems-krav";

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
  /** År då renoveringen utfördes eller planeras. */
  ar?: number;
  /** True om mappen lagts till i efterhand (historisk renovering). */
  historisk?: boolean;
  undermappar: RenoveringsUndermapp[];
  egenkontroller: EgenkontrollPunkt[];
  /** Redigerbar checklista — handlingar som ska laddas upp. */
  forvantadeHandlingar?: string[];
  /** Krav/överenskommelse som medlemmen ska godkänna (checkpunkter + BankID). */
  medlemsKrav?: MedlemsKravState;
};

export type RenoveringsMappDel = "egenkontroller" | RenoveringsUndermappTyp;

/** @deprecated Använd RenoveringsMapp */
export type RenovationFolder = RenoveringsMapp;

/** Snabbval vid registrering av tekniska installationer i lägenheten. */
export const LAGENHET_INSTALLATION_SNABBVAL = [
  "Golvvärme (vattenburen)",
  "Golvvärme (elektrisk)",
  "Radiatorer (vattenburen)",
  "Elradiatorer",
  "Luftvärmepump",
] as const;

/** @deprecated Använd installationer */
export type LagenhetVarme =
  | "golvvarme-vatten"
  | "golvvarme-el"
  | "radiatorer"
  | "elradiatorer"
  | "varmepump-luft"
  | "fjarvarmepanel";

const LEGACY_VARME_ETIKETTER: Record<LagenhetVarme, string> = {
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
  /** Antal badrum. */
  antalBadrum?: string;
  /** Antal WC (toaletter). */
  antalWC?: string;
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
  /** Tekniska installationer i lägenheten, t.ex. golvvärme, luftvärmepump. */
  installationer?: string[];
  /** @deprecated Använd installationer */
  varme?: LagenhetVarme[];
  /** Balkong/terrass, t.ex. "Ja, 7 m² mot söder". */
  balkong?: string;
  /** Källarförråd — nummer eller beskrivning. */
  kallareForrad?: string;
  /** P-plats — nummer eller info. */
  pPlats?: string;
  /** Övrig notering om lägenheten. */
  lagenhetNotering?: string;
  /** Hall, kök, badrum och övriga rum med uppvärmning m.m. */
  lagenhetsRum?: import("@/components/lagenhetsarkiv/lagenhet-info").LagenhetsRumsInfo;
  /** Eldstäder i lägenheten — godkännande per eldstad. */
  eldstader?: import("@/components/lagenhetsarkiv/lagenhet-info").LagenhetEldstad[];
  /** Fläkt som endast betjänar denna lägenhet. */
  flakt?: import("@/components/lagenhetsarkiv/lagenhet-info").LagenhetFlakt;
  /** @deprecated Använd eldstader */
  eldstadAntal?: string;
  /** @deprecated Använd eldstader */
  eldstadGodkand?: boolean;
  /** @deprecated Använd flakt */
  harEgenFlaktVentilation?: boolean;
  /** @deprecated Använd flakt */
  harRokgasFlakt?: boolean;
  /** @deprecated Använd flakt */
  ventilation?: string;
  /** @deprecated Borttagen — använd lagenhetsRum */
  senastStambyte?: string;
};

/** Returnerar sparade installationer, med migrering från äldre varme-fält. */
export function hamtaInstallationer(apartment: ApartmentFolder): string[] {
  if (apartment.installationer?.length) {
    return apartment.installationer;
  }
  if (apartment.varme?.length) {
    return apartment.varme
      .filter((v) => v !== "fjarvarmepanel")
      .map((v) => LEGACY_VARME_ETIKETTER[v] ?? v);
  }
  return [];
}

export const lagenhetsBasSidor = ["Anmälningar", "Beslut", "Slutdokument"] as const;

export function skapaLagenhetsDokumentId(): string {
  return `lagenhet-doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function skapaRenoveringsMapp(
  mallId: RenoveringsMallId,
  options?: {
    namn?: string;
    ar?: number;
    id?: number;
    historisk?: boolean;
  },
): RenoveringsMapp {
  const mall = hamtaRenoveringsMall(mallId);
  const ar = options?.ar ?? new Date().getFullYear();
  const mappId = options?.id ?? Date.now();
  const name = options?.namn?.trim() || `${mall.standardNamn} ${ar}`;

  // Renoveringsmapp får färdiga undermappar för badrum och kök direkt.
  const startUndermappar =
    mallId === "renovering" || mallId === "ovrigt"
      ? (["badrum", "kok"] as const).map((typ) => ({
          id: `${mappId}-${typ}`,
          typ: typ as RenoveringsUndermappTyp,
          dokument: [] as LagenhetsDokument[],
        }))
      : mallId === "badrum"
        ? [
            {
              id: `${mappId}-badrum`,
              typ: "badrum" as RenoveringsUndermappTyp,
              dokument: [] as LagenhetsDokument[],
            },
          ]
        : mallId === "kok"
          ? [
              {
                id: `${mappId}-kok`,
                typ: "kok" as RenoveringsUndermappTyp,
                dokument: [] as LagenhetsDokument[],
              },
            ]
          : [];

  return {
    id: mappId,
    name,
    mallId,
    ar,
    historisk: options?.historisk === true,
    undermappar: startUndermappar,
    egenkontroller: [],
    medlemsKrav: skapaMedlemsKravForTyp(mallId),
  };
}

/** Kort etikett för översikt: "2024 · Badrum". */
export function renoveringsMappOversiktEtikett(mapp: RenoveringsMapp): string {
  const mall = hamtaRenoveringsMall(mapp.mallId ?? "ovrigt");
  const ar =
    mapp.ar ??
    (() => {
      const match = mapp.name.match(/\b(19|20)\d{2}\b/);
      return match ? Number(match[0]) : undefined;
    })();
  const typ = mall.etikett;
  return ar ? `${ar} · ${typ}` : typ;
}

export function mappDelEtikett(del: RenoveringsMappDel): string {
  if (del === "egenkontroller") return "Egenkontroller";
  return undermappEtikett(del);
}

export function tilgangligaMappDelar(mallId: RenoveringsMallId): RenoveringsMappDel[] {
  const mall = hamtaRenoveringsMall(mallId);
  return ["egenkontroller", ...undermappTyperForMall(mall)];
}

export function mappHarDel(mapp: RenoveringsMapp, del: RenoveringsMappDel): boolean {
  if (del === "egenkontroller") return mapp.egenkontroller.length > 0;
  return mapp.undermappar.some((u) => u.typ === del);
}

export function saknadeMappDelar(mapp: RenoveringsMapp): RenoveringsMappDel[] {
  const mallId = mapp.mallId ?? "ovrigt";
  return tilgangligaMappDelar(mallId).filter((del) => !mappHarDel(mapp, del));
}

export function laggaTillMappDel(
  mapp: RenoveringsMapp,
  del: RenoveringsMappDel,
): RenoveringsMapp {
  if (mappHarDel(mapp, del)) return mapp;
  const mall = hamtaRenoveringsMall(mapp.mallId ?? "ovrigt");

  if (del === "egenkontroller") {
    return {
      ...mapp,
      egenkontroller: egenkontrollPunkterForMall(mall).map((p) => ({
        ...p,
        signerad: false,
        skadebilder: [],
      })),
    };
  }

  const next: RenoveringsMapp = {
    ...mapp,
    undermappar: [
      ...mapp.undermappar,
      {
        id: `${mapp.id}-${del}-${Date.now()}`,
        typ: del,
        dokument: [],
      },
    ],
  };

  if (del === "handlingar" && !next.forvantadeHandlingar?.length) {
    next.forvantadeHandlingar = [
      ...forvantadeDokumentForMall(mall).handlingar,
    ];
  }

  return next;
}

/** Byter renoveringstyp på befintlig mapp — behåller namn och dokument i kvarvarande delar. */
export function bytRenoveringsMappMall(
  mapp: RenoveringsMapp,
  nyMallId: RenoveringsMallId,
): RenoveringsMapp {
  if ((mapp.mallId ?? "ovrigt") === nyMallId) return mapp;

  const mall = hamtaRenoveringsMall(nyMallId);
  const tillgangligaUndermappar = undermappTyperForMall(mall);
  const next: RenoveringsMapp = {
    ...mapp,
    mallId: nyMallId,
    undermappar: mapp.undermappar.filter((u) =>
      tillgangligaUndermappar.includes(u.typ),
    ),
    medlemsKrav: mapp.medlemsKrav?.medlemSignerad
      ? mapp.medlemsKrav
      : skapaMedlemsKravForTyp(nyMallId),
  };

  if (mappHarDel(mapp, "egenkontroller")) {
    next.egenkontroller = egenkontrollPunkterForMall(mall).map((p) => ({
      ...p,
      signerad: false,
      skadebilder: [],
    }));
  }

  if (mappHarDel(mapp, "handlingar")) {
    next.forvantadeHandlingar = [
      ...forvantadeDokumentForMall(mall).handlingar,
    ];
  }

  return next;
}

export function taBortMappDel(
  mapp: RenoveringsMapp,
  del: RenoveringsMappDel,
): RenoveringsMapp {
  if (del === "egenkontroller") {
    return { ...mapp, egenkontroller: [] };
  }
  const next: RenoveringsMapp = {
    ...mapp,
    undermappar: mapp.undermappar.filter((u) => u.typ !== del),
  };
  if (del === "handlingar") {
    next.forvantadeHandlingar = undefined;
  }
  return next;
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
