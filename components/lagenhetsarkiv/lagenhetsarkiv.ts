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
import type { LagenhetOmbyggnadsavtal } from "@/components/lagenhetsarkiv/lagenhet-ombyggnadsavtal";

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
  /** När styrelsen skapade mappen (ISO-datum). */
  skapad?: string;
  planeratStart?: string;
  planeratSlut?: string;
  /** Koppling till renoveringsprojekt i styrelsens checklista. */
  renoveringsProjektId?: string;
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
  /** Antal kök. */
  antalKok?: string;
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
  /**
   * Golvyta (m²) — används ofta för vindsvåningar där boyta mäts som golvyta
   * under snedtak snarare än BOA.
   */
  golvyta?: string;
  /** Mätbevis för uppmätt yta (krav när uppmätt yta anges). */
  matbevis?: LagenhetsDokument;
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
  /**
   * Ombyggnadsavtal / överenskommelse på lägenhetskortet.
   * Styrelsen sätter villkor, lägger till undertecknare och mejlar BankID-länk.
   */
  ombyggnadsavtal?: LagenhetOmbyggnadsavtal;
  /** Tidigare signerade ombyggnadsavtal — sparas för historik. */
  ombyggnadsavtalHistorik?: LagenhetOmbyggnadsavtal[];
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
    skapad?: string;
    planeratStart?: string;
    planeratSlut?: string;
    renoveringsProjektId?: string;
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
    skapad: options?.skapad,
    planeratStart: options?.planeratStart,
    planeratSlut: options?.planeratSlut,
    renoveringsProjektId: options?.renoveringsProjektId,
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

/** Text som rullgardinen söker mot (nummer, adress, våning m.m.). */
export function lagenhetSoktext(apartment: ApartmentFolder): string {
  return [
    apartment.lagenhetsnummer,
    formatLagenhetEtikett(apartment.lagenhetsnummer),
    apartment.adress,
    apartment.vaning ? `vån ${apartment.vaning}` : "",
    apartment.vaning,
    apartment.antalRum,
    apartment.boyta,
  ]
    .map((v) => (typeof v === "string" ? v.trim() : ""))
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function lagenhetRullgardinEtikett(apartment: ApartmentFolder): string {
  const delar = [
    formatLagenhetEtikett(apartment.lagenhetsnummer),
    apartment.adress?.trim(),
    apartment.vaning?.trim() ? `vån ${apartment.vaning.trim()}` : "",
  ].filter(Boolean);
  return delar.join(" · ");
}

export function sorteraLagenheter(
  apartments: ApartmentFolder[],
): ApartmentFolder[] {
  return [...apartments].sort((a, b) => {
    const na = Number.parseInt(a.lagenhetsnummer, 10);
    const nb = Number.parseInt(b.lagenhetsnummer, 10);
    if (Number.isFinite(na) && Number.isFinite(nb) && na !== nb) return na - nb;
    return a.lagenhetsnummer.localeCompare(b.lagenhetsnummer, "sv");
  });
}

export const ADRESS_EJ_ANGIVEN = "Adress ej angiven";
export const VANING_EJ_ANGIVEN = "Våning ej angiven";

export function lagenhetAdressGrupp(apartment: ApartmentFolder): string {
  return apartment.adress?.trim() || ADRESS_EJ_ANGIVEN;
}

export function lagenhetVaningGrupp(apartment: ApartmentFolder): string {
  return apartment.vaning?.trim() || VANING_EJ_ANGIVEN;
}

function vaningRang(vaning: string): number {
  if (vaning === VANING_EJ_ANGIVEN) return 10_000;
  const text = vaning.trim().toLowerCase();
  if (
    text === "bv" ||
    text === "bottenvåning" ||
    text === "bottenvaning" ||
    text === "entré" ||
    text === "entre"
  ) {
    return -1;
  }
  if (text.startsWith("vind")) return 9_000;
  const tal = Number.parseInt(text, 10);
  if (Number.isFinite(tal) && String(tal) === text) return tal;
  return 5_000;
}

export function jamforVaning(a: string, b: string): number {
  const diff = vaningRang(a) - vaningRang(b);
  if (diff !== 0) return diff;
  return a.localeCompare(b, "sv");
}

export function unikaGrupper(
  values: string[],
  jamfor: (a: string, b: string) => number = (a, b) => a.localeCompare(b, "sv"),
): string[] {
  return [...new Set(values)].sort(jamfor);
}

function adressHarVaningsindelning(lista: ApartmentFolder[]): boolean {
  return lista.some((a) => lagenhetVaningGrupp(a) !== VANING_EJ_ANGIVEN);
}

export type LagenhetVisningsNod =
  | {
      typ: "grupp";
      nyckel: string;
      rubrik: string;
      antal: number;
      niva: number;
    }
  | { typ: "lagenhet"; apartment: ApartmentFolder; niva: number };

/** Nycklar för adress- och våningsgrupper när alla lägenheter ska kunna öppnas. */
export function nycklarForOppnaAlla(apartments: ApartmentFolder[]): string[] {
  const nycklar: string[] = [];
  for (const adress of unikaGrupper(apartments.map(lagenhetAdressGrupp))) {
    const iAdress = apartments.filter((a) => lagenhetAdressGrupp(a) === adress);
    const adressNyckel = `adress:${encodeURIComponent(adress)}`;
    nycklar.push(adressNyckel);
    if (!adressHarVaningsindelning(iAdress)) continue;
    for (const vaning of unikaGrupper(
      iAdress.map(lagenhetVaningGrupp),
      jamforVaning,
    )) {
      nycklar.push(`${adressNyckel}|vaning:${encodeURIComponent(vaning)}`);
    }
  }
  return nycklar;
}

/**
 * Lägenheter visas inte alla på en gång. Välj en adress, ett våningsplan
 * eller alla — bara öppnade grupper tar med sina lägenheter.
 */
export function byggLagenhetsVisning(
  apartments: ApartmentFolder[],
  omfattning: string,
  oppna: ReadonlySet<string>,
): LagenhetVisningsNod[] {
  const sorterade = sorteraLagenheter(apartments);
  if (!omfattning) return [];

  if (omfattning.startsWith("vaning:")) {
    const vaning = decodeURIComponent(omfattning.slice("vaning:".length));
    const lista = sorterade.filter((a) => lagenhetVaningGrupp(a) === vaning);
    const noder: LagenhetVisningsNod[] = [
      {
        typ: "grupp",
        nyckel: omfattning,
        rubrik: vaning === VANING_EJ_ANGIVEN ? vaning : `Våning ${vaning}`,
        antal: lista.length,
        niva: 0,
      },
    ];
    if (oppna.has(omfattning)) {
      for (const apartment of lista) {
        noder.push({ typ: "lagenhet", apartment, niva: 1 });
      }
    }
    return noder;
  }

  const adresser =
    omfattning === "alla"
      ? unikaGrupper(sorterade.map(lagenhetAdressGrupp))
      : omfattning.startsWith("adress:")
        ? [decodeURIComponent(omfattning.slice("adress:".length))]
        : [];

  const noder: LagenhetVisningsNod[] = [];
  for (const adress of adresser) {
    const iAdress = sorterade.filter((a) => lagenhetAdressGrupp(a) === adress);
    const adressNyckel = `adress:${encodeURIComponent(adress)}`;
    noder.push({
      typ: "grupp",
      nyckel: adressNyckel,
      rubrik: adress,
      antal: iAdress.length,
      niva: 0,
    });
    if (!oppna.has(adressNyckel)) continue;
    if (adressHarVaningsindelning(iAdress)) {
      for (const vaning of unikaGrupper(
        iAdress.map(lagenhetVaningGrupp),
        jamforVaning,
      )) {
        const iVaning = iAdress.filter((a) => lagenhetVaningGrupp(a) === vaning);
        const vaningNyckel = `${adressNyckel}|vaning:${encodeURIComponent(vaning)}`;
        noder.push({
          typ: "grupp",
          nyckel: vaningNyckel,
          rubrik: vaning === VANING_EJ_ANGIVEN ? vaning : `Våning ${vaning}`,
          antal: iVaning.length,
          niva: 1,
        });
        if (!oppna.has(vaningNyckel)) continue;
        for (const apartment of iVaning) {
          noder.push({ typ: "lagenhet", apartment, niva: 2 });
        }
      }
      continue;
    }
    for (const apartment of iAdress) {
      noder.push({ typ: "lagenhet", apartment, niva: 1 });
    }
  }
  return noder;
}

export function filtreraLagenheter(
  apartments: ApartmentFolder[],
  sok: string,
): ApartmentFolder[] {
  const q = sok.trim().toLowerCase().replace(/\s+/g, " ");
  const lista = sorteraLagenheter(apartments);
  if (!q) return lista;
  const delar = q.split(" ");
  return lista.filter((a) => {
    const text = lagenhetSoktext(a);
    return delar.every((del) => text.includes(del));
  });
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
