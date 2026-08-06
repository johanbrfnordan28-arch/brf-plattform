import { foreningStorageKey } from "@/lib/foreningStorage";

export type ArshjulKategori =
  | "besiktning"
  | "ekonomi"
  | "ekonomimote"
  | "stamma"
  | "styrelsemote"
  | "byggmote"
  | "projekteringsmote"
  | "upphandlingsmote"
  | "deklaration"
  | "underhall"
  | "juridik"
  | "medlemmar"
  | "ovrigt";

/** Intervall för händelser i årshjul och kalender. */
export type ArshjulIntervall =
  | "engang"
  | "veckovis"
  | "manadsvis"
  | "manadsvis_veckodag"
  | "kvartalsvis"
  | "arlig"
  | "vart_3_ar"
  | "vart_6_ar"
  | "vart_10_ar";

/** Äldre typ — migreras till intervall. */
export type ArshjulHandelseTyp = "engang" | "arlig" | "intervall";

/** 1 = måndag … 7 = söndag. */
export type ArshjulVeckodag = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** 1–4 = 1:a–4:e veckan i månaden, -1 = sista veckan. */
export type ArshjulVeckodagOrdning = 1 | 2 | 3 | 4 | -1;

export type ArshjulMotesPunkt = {
  id: string;
  text: string;
  klar: boolean;
  /**
   * Månader (1–12) då punkten ska tas upp på möten.
   * Saknas eller tom lista = varje möte tills punkten är klar.
   * Exempel ekonomi: [1,3,5,7,8,9,10,11,12] = varannan mån först, sedan varje.
   */
  manader?: number[];
};

/** Förval för ojämna intervaller på mötespunkter/uppföljning. */
export const punkterManadsForval: {
  id: string;
  etikett: string;
  manader: number[];
  beskrivning: string;
}[] = [
  {
    id: "varje",
    etikett: "Varje möte",
    manader: [],
    beskrivning: "Visas på alla möten tills klart",
  },
  {
    id: "varannan",
    etikett: "Varannan månad",
    manader: [1, 3, 5, 7, 9, 11],
    beskrivning: "Jan, mar, maj, jul, sep, nov",
  },
  {
    id: "varannan_var",
    etikett: "Varannan månad (jämna)",
    manader: [2, 4, 6, 8, 10, 12],
    beskrivning: "Feb, apr, jun, aug, okt, dec",
  },
  {
    id: "ekonomi_ojamnt",
    etikett: "Ekonomi (ojämnt)",
    manader: [1, 3, 5, 7, 8, 9, 10, 11, 12],
    beskrivning: "Varannan i början, varje månad från juli",
  },
  {
    id: "kvartal",
    etikett: "Kvartalsvis",
    manader: [3, 6, 9, 12],
    beskrivning: "Mar, jun, sep, dec",
  },
  {
    id: "var_terminen",
    etikett: "Några gånger per år",
    manader: [2, 5, 9, 11],
    beskrivning: "Feb, maj, sep, nov",
  },
];

export const intervallEtiketter: Record<ArshjulIntervall, string> = {
  engang: "Engång",
  veckovis: "Veckovis",
  manadsvis: "Månadsvis (fast dag)",
  manadsvis_veckodag: "Månadsvis (vecka + veckodag)",
  kvartalsvis: "Kvartalsvis",
  arlig: "Årligen",
  vart_3_ar: "Vart 3:e år",
  vart_6_ar: "Vart 6:e år",
  vart_10_ar: "Vart 10:e år",
};

export const intervallAlternativ: ArshjulIntervall[] = [
  "engang",
  "veckovis",
  "manadsvis",
  "manadsvis_veckodag",
  "kvartalsvis",
  "arlig",
  "vart_3_ar",
  "vart_6_ar",
  "vart_10_ar",
];

export const veckodagEtiketter: Record<ArshjulVeckodag, string> = {
  1: "Måndag",
  2: "Tisdag",
  3: "Onsdag",
  4: "Torsdag",
  5: "Fredag",
  6: "Lördag",
  7: "Söndag",
};

export const veckodagOrdningEtiketter: Record<string, string> = {
  "1": "1:a veckan",
  "2": "2:a veckan",
  "3": "3:e veckan",
  "4": "4:e veckan",
  "-1": "Sista veckan",
};

/** Föreslagna dagar före händelse för påminnelser (rullgardin). */
export const paminnelseDagarAlternativ: number[] = [
  365, 180, 90, 60, 30, 14, 7, 3, 1,
];

export const foreslagnMotesPunkter: string[] = [
  "OVK",
  "SBA",
  "Budget inför kommande år",
  "Årsstämma — förberedelse",
  "Underhållsplan — uppföljning",
  "Upphandling",
  "Fastighetsskador — status",
  "Brandskydd / SBA-uppföljning",
  "Ekonomisk uppföljning",
  "Medlemsärenden",
];

/** Föreslagna underkategorier som visas som snabbval i formuläret. */
export const foreslagnUnderkategorier: string[] = [
  "Projekteringsmöte",
  "OVK Besiktning",
  "OVK bostäder",
  "OVK verksamheter",
  "Statusbesiktning",
  "Slutbesiktning",
  "Garantibesiktning",
  "Energideklaration",
  "Fastighetsdeklaration",
  "Radonmätning",
  "Upphandling",
];

/** Standard: planera innevarande år + kommande år (inte hela tidslinjen). */
export const STANDARD_PLANERING_AR_FRAM = 1;

/** Intervall som behöver slutår så möten inte fyller tidslinjen i flera år. */
export function behoverPlaneringsperiod(intervall: ArshjulIntervall): boolean {
  return (
    intervall === "veckovis" ||
    intervall === "manadsvis" ||
    intervall === "manadsvis_veckodag" ||
    intervall === "kvartalsvis"
  );
}

export function arMotesKategori(kategori: ArshjulKategori): boolean {
  return (
    kategori === "styrelsemote" ||
    kategori === "byggmote" ||
    kategori === "ekonomimote" ||
    kategori === "stamma" ||
    kategori === "projekteringsmote" ||
    kategori === "upphandlingsmote"
  );
}

/** Fördefinierade möten som kan läggas till med påminnelser. */
export const motesTypAlternativ: {
  id: ArshjulKategori | "eget";
  etikett: string;
  standardIntervall: ArshjulIntervall;
  standardManad?: number;
  hoppaSemester?: boolean;
}[] = [
  {
    id: "styrelsemote",
    etikett: "Styrelsemöte",
    standardIntervall: "manadsvis_veckodag",
    hoppaSemester: true,
  },
  {
    id: "byggmote",
    etikett: "Byggmöte",
    standardIntervall: "manadsvis_veckodag",
    hoppaSemester: true,
  },
  {
    id: "ekonomimote",
    etikett: "Ekonomimöte",
    standardIntervall: "manadsvis_veckodag",
    hoppaSemester: true,
  },
  {
    id: "stamma",
    etikett: "Årsstämma",
    standardIntervall: "arlig",
    standardManad: 4,
  },
  {
    id: "projekteringsmote",
    etikett: "Projekteringsmöte",
    standardIntervall: "engang",
  },
  {
    id: "upphandlingsmote",
    etikett: "Upphandlingsmöte",
    standardIntervall: "engang",
  },
  {
    id: "eget",
    etikett: "Lägg till möte",
    standardIntervall: "manadsvis_veckodag",
    hoppaSemester: true,
  },
];

/** Myndighetskrav (tidigare OVK-knappen) med intervall och påminnelser. */
export const myndighetskravAlternativ: {
  id: string;
  etikett: string;
  standardIntervall: ArshjulIntervall;
  standardManad?: number;
  beskrivning?: string;
  kategori?: ArshjulKategori;
}[] = [
  {
    id: "ovk_3",
    etikett: "OVK (3 år)",
    standardIntervall: "vart_3_ar",
    standardManad: 6,
    beskrivning: "Obligatorisk ventilationskontroll — ofta verksamheter.",
    kategori: "besiktning",
  },
  {
    id: "ovk_6",
    etikett: "OVK (6 år)",
    standardIntervall: "vart_6_ar",
    standardManad: 6,
    beskrivning: "Obligatorisk ventilationskontroll — ofta bostäder.",
    kategori: "besiktning",
  },
  {
    id: "radon",
    etikett: "Radonmätning (10 år)",
    standardIntervall: "vart_10_ar",
    standardManad: 10,
    beskrivning: "Radonmätning enligt krav — vanligen vart 10:e år.",
    kategori: "besiktning",
  },
  {
    id: "energideklaration",
    etikett: "Energideklaration (10 år)",
    standardIntervall: "vart_10_ar",
    standardManad: 9,
    beskrivning: "Energideklaration — giltig i 10 år.",
    kategori: "deklaration",
  },
  {
    id: "sba",
    etikett: "Systematisk brandskyddskontroll (årligen)",
    standardIntervall: "arlig",
    standardManad: 3,
    beskrivning: "Krav: dokumentation av systematisk brandskyddskontroll (SBA).",
    kategori: "besiktning",
  },
  {
    id: "eget",
    etikett: "Lägg till myndighetskrav",
    standardIntervall: "arlig",
    standardManad: 6,
    beskrivning: "Eget myndighetskrav med valfritt intervall.",
    kategori: "besiktning",
  },
];

/** Övrigt — sociala/gemensamma aktiviteter. */
export const ovrigtAlternativ: {
  id: string;
  etikett: string;
  standardIntervall: ArshjulIntervall;
  standardManad?: number;
  beskrivning?: string;
}[] = [
  {
    id: "staddag",
    etikett: "Städdag",
    standardIntervall: "arlig",
    standardManad: 5,
    beskrivning: "Gemensam städ- och ordningsdag.",
  },
  {
    id: "gardsfest",
    etikett: "Gårdsfest",
    standardIntervall: "arlig",
    standardManad: 8,
    beskrivning: "Gemensam fest på gården.",
  },
  {
    id: "grillkvall",
    etikett: "Grillkväll",
    standardIntervall: "arlig",
    standardManad: 6,
  },
  {
    id: "bastukvall",
    etikett: "Bastukväll",
    standardIntervall: "arlig",
    standardManad: 10,
  },
  {
    id: "arbetsdag",
    etikett: "Arbetsdag / underhållsdag",
    standardIntervall: "arlig",
    standardManad: 4,
  },
  {
    id: "julpynt",
    etikett: "Julpyntning",
    standardIntervall: "arlig",
    standardManad: 12,
  },
  {
    id: "eget",
    etikett: "Lägg till",
    standardIntervall: "engang",
    beskrivning: "Egen aktivitet eller övrig händelse.",
  },
];

export type ArsPlaneringSammanfattning = {
  ar: number;
  tillfallen: number;
  installda: number;
  klara: number;
  oppnaPunkter: number;
  koppladeAtgarder: number;
  besiktningar: number;
};

export type ArshjulHandelse = {
  id: string;
  titel: string;
  beskrivning: string;
  kategori: ArshjulKategori;
  /** Valfri underkategori — t.ex. "OVK Besiktning", "Styrelsemöte". */
  underkategori?: string;
  intervall: ArshjulIntervall;
  /** Äldre fält — läses vid migrering. */
  typ?: ArshjulHandelseTyp;
  /** Engång / veckovis start — YYYY-MM-DD. */
  datum?: string;
  /** Månad 1–12 (årlig, kvartal, flerårs, månadsvis start). */
  manad?: number;
  dag?: number;
  /** Flerårsintervall — första planerade år. */
  startAr?: number;
  /**
   * Första år återkommande möten/händelser ska läggas in.
   * T.ex. styrelsemöte bara innevarande år.
   */
  planerasFranAr?: number;
  /**
   * Sista år återkommande möten/händelser ska läggas in.
   * Saknas för månads-/veckomöten → samma år som planerasFranAr.
   */
  planerasTillAr?: number;
  /**
   * Koppla besiktning/åtgärd till en mötes-serie (styrelse- eller byggmöte).
   * Påminnelse visas på möten även om besiktningsdatum är nästa år,
   * och även innan konkreta mötesdatum är inlagda.
   */
  koppladTillHandelseId?: string;
  /** År då åtgärden ska tas upp på kopplade möten (ofta innevarande år). */
  kopplaTillMotesAr?: number;
  /** Synkas från intervall (3/6/10) för kompatibilitet. */
  intervallAr?: number;
  /** Månadsvis vecka + veckodag — t.ex. 2:a veckan, måndag. */
  veckodag?: ArshjulVeckodag;
  /** Vilken vecka i månaden (1–4 eller -1 = sista). */
  veckodagOrdning?: ArshjulVeckodagOrdning;
  /** Hoppa över dessa månader (t.ex. 7–8 under semester). */
  undantagnaManader?: number[];
  /** Enskilda tillfällen som ställts in tillfälligt (kan återställas). YYYY-MM-DD. */
  installdaDatum?: string[];
  /** Tillfällen som tagits bort permanent (kan inte återställas). YYYY-MM-DD. */
  permanentBorttagnaDatum?: string[];
  /** Tillfällen markerade som genomförda (YYYY-MM-DD). */
  klarDatum?: string[];
  /**
   * Manuellt ändrade datum för enskilda tillfällen.
   * Nyckel = ursprungligt planerat datum (YYYY-MM-DD), värde = nytt datum.
   */
  datumAndringar?: Record<string, string>;
  /** Ärenden/punkter att hantera på mötet (OVK, SBA, budget …). */
  motesPunkter?: ArshjulMotesPunkt[];
  /** Senast markerad som genomförd (kalenderår) — nästa tillfälle räknas därifrån. */
  senastKlarAr?: number;
  /** Dagar före händelsen att visa påminnelse (t.ex. 365, 90, 30). */
  paminnelseDagar: number[];
  klar: boolean;
  skapad: string;
  externKalla?: "underhallsplan" | "projekt" | "manuell";
  externId?: string;
  /** Binder ihop t.ex. OVK verksamheter + bostäder som en enhet i UI. */
  gruppNyckel?: string;
};

/** Styrelse-/bygg-/ekonomi-möten m.m. inklusive egna möten. */
export function arMotesHandelse(h: ArshjulHandelse): boolean {
  return arMotesKategori(h.kategori) || h.underkategori === "Möte";
}

export type ArshjulTillfalle = {
  handelseId: string;
  titel: string;
  kategori: ArshjulKategori;
  ar: number;
  manad: number;
  dag: number;
  datumIso: string;
  /** Ursprungligt planerat datum innan manuell flytt (YYYY-MM-DD). */
  planeratDatumIso?: string;
  beskrivning: string;
  arManatlig: boolean;
  installd?: boolean;
  arKlar?: boolean;
  oppnaPunkter?: number;
  /** Öppna punkter som gäller just detta möte (efter månadsfilter). */
  punkterPaTillfalle?: string[];
  /** Titlar på besiktningar/åtgärder kopplade till detta möte. */
  koppladeAtgarder?: string[];
};

export type ArshjulPaminnelse = {
  handelseId: string;
  tillfalleDatum: string;
  titel: string;
  kategori: ArshjulKategori;
  dagarKvar: number;
  rubrik: string;
  text: string;
  nivå: "info" | "varning" | "kritisk";
};

const ARSHJUL_STORAGE_BASE = "brf-arshjul-handelser";

export function arshjulStorageKey(): string {
  return foreningStorageKey(ARSHJUL_STORAGE_BASE);
}

export const STANDARD_PAMINNELSE_DAGAR = [365, 180, 90, 30, 14, 7];

export const kategoriEtiketter: Record<ArshjulKategori, string> = {
  besiktning: "Besiktning",
  ekonomi: "Ekonomi",
  ekonomimote: "Ekonomimöte",
  stamma: "Årsstämma",
  styrelsemote: "Styrelsemöte",
  byggmote: "Byggmöte",
  projekteringsmote: "Projekteringsmöte",
  upphandlingsmote: "Upphandlingsmöte",
  deklaration: "Deklaration",
  underhall: "Underhåll",
  juridik: "Juridik",
  medlemmar: "Medlemmar",
  ovrigt: "Övrigt",
};

export const kategoriFarger: Record<ArshjulKategori, string> = {
  besiktning: "bg-sky-100 text-sky-950 border-sky-200",
  ekonomi: "bg-emerald-100 text-emerald-950 border-emerald-200",
  ekonomimote: "bg-emerald-100 text-emerald-950 border-emerald-200",
  stamma: "bg-violet-100 text-violet-950 border-violet-200",
  styrelsemote: "bg-indigo-100 text-indigo-950 border-indigo-200",
  byggmote: "bg-orange-100 text-orange-950 border-orange-200",
  projekteringsmote: "bg-orange-50 text-orange-950 border-orange-200",
  upphandlingsmote: "bg-amber-100 text-amber-950 border-amber-200",
  deklaration: "bg-teal-100 text-teal-950 border-teal-200",
  underhall: "bg-amber-100 text-amber-950 border-amber-200",
  juridik: "bg-slate-100 text-slate-900 border-slate-200",
  medlemmar: "bg-rose-100 text-rose-950 border-rose-200",
  ovrigt: "bg-stone-100 text-stone-900 border-stone-200",
};

export const manadsnamn = [
  "Januari",
  "Februari",
  "Mars",
  "April",
  "Maj",
  "Juni",
  "Juli",
  "Augusti",
  "September",
  "Oktober",
  "November",
  "December",
] as const;

/** Om punkten ska tas upp på möte i given månad. */
export function punktGallerManad(
  p: ArshjulMotesPunkt,
  manad: number,
): boolean {
  if (!p.manader || p.manader.length === 0) return true;
  return p.manader.includes(manad);
}

export function oppnaPunkterForManad(
  h: ArshjulHandelse,
  manad: number,
): ArshjulMotesPunkt[] {
  return (h.motesPunkter ?? []).filter(
    (p) => !p.klar && punktGallerManad(p, manad),
  );
}

export function manaderEtikettKort(manader?: number[]): string {
  if (!manader || manader.length === 0) return "Varje möte";
  if (manader.length === 12) return "Varje möte";
  const sorterad = [...manader].sort((a, b) => a - b);
  const forval = punkterManadsForval.find(
    (f) =>
      f.manader.length === sorterad.length &&
      f.manader.every((m, i) => m === sorterad[i]),
  );
  if (forval) return forval.etikett;
  return sorterad.map((m) => manadsnamn[m - 1]?.slice(0, 3) ?? String(m)).join(", ");
}

export function skapaHandelseId(): string {
  return `arshjul-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function intervallTillAr(intervall: ArshjulIntervall): number | null {
  switch (intervall) {
    case "arlig":
      return 1;
    case "vart_3_ar":
      return 3;
    case "vart_6_ar":
      return 6;
    case "vart_10_ar":
      return 10;
    default:
      return null;
  }
}

export function arFlerarsIntervall(intervall: ArshjulIntervall): boolean {
  return (
    intervall === "vart_3_ar" ||
    intervall === "vart_6_ar" ||
    intervall === "vart_10_ar"
  );
}

function arGiltigtIntervall(v: unknown): v is ArshjulIntervall {
  return (
    typeof v === "string" &&
    (intervallAlternativ as string[]).includes(v)
  );
}

/** Migrerar äldre typ/intervallAr till nytt intervallfält. */
export function migreraTillIntervall(raw: {
  intervall?: unknown;
  typ?: unknown;
  intervallAr?: unknown;
}): ArshjulIntervall {
  if (arGiltigtIntervall(raw.intervall)) return raw.intervall;

  if (raw.typ === "engang") return "engang";
  if (raw.typ === "arlig") return "arlig";
  if (raw.typ === "intervall") {
    const ar =
      typeof raw.intervallAr === "number" && raw.intervallAr >= 1
        ? raw.intervallAr
        : 1;
    if (ar === 1) return "arlig";
    if (ar === 3) return "vart_3_ar";
    if (ar === 6) return "vart_6_ar";
    if (ar === 10) return "vart_10_ar";
    if (ar >= 8) return "vart_10_ar";
    if (ar >= 5) return "vart_6_ar";
    return "vart_3_ar";
  }
  return "engang";
}

export function normaliseraHandelse(
  raw: Partial<ArshjulHandelse> & {
    id?: string;
    typ?: ArshjulHandelseTyp;
  },
): ArshjulHandelse {
  const paminnelseDagar =
    Array.isArray(raw.paminnelseDagar) && raw.paminnelseDagar.length > 0
      ? [...new Set(raw.paminnelseDagar.filter((d) => d > 0))].sort((a, b) => b - a)
      : [...STANDARD_PAMINNELSE_DAGAR];

  const intervall = migreraTillIntervall(raw);
  const synkAr = intervallTillAr(intervall);
  const undantagna = Array.isArray(raw.undantagnaManader)
    ? raw.undantagnaManader.filter((m) => m >= 1 && m <= 12)
    : [];
  const installda = Array.isArray(raw.installdaDatum)
    ? raw.installdaDatum.filter((d) => typeof d === "string")
    : [];
  const permanente = Array.isArray(raw.permanentBorttagnaDatum)
    ? raw.permanentBorttagnaDatum.filter((d) => typeof d === "string")
    : [];
  const klarDatum = Array.isArray(raw.klarDatum)
    ? raw.klarDatum.filter((d) => typeof d === "string")
    : [];
  const datumAndringar: Record<string, string> = {};
  if (raw.datumAndringar && typeof raw.datumAndringar === "object") {
    for (const [fran, till] of Object.entries(raw.datumAndringar)) {
      if (
        typeof fran === "string" &&
        typeof till === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(fran) &&
        /^\d{4}-\d{2}-\d{2}$/.test(till)
      ) {
        datumAndringar[fran] = till;
      }
    }
  }
  const motesPunkter = Array.isArray(raw.motesPunkter)
    ? raw.motesPunkter
        .filter((p) => p && typeof p.text === "string")
        .map((p) => {
          const manader = Array.isArray(p.manader)
            ? [...new Set(p.manader.filter((m) => m >= 1 && m <= 12))].sort(
                (a, b) => a - b,
              )
            : undefined;
          return {
            id: p.id || `punkt-${Math.random().toString(36).slice(2, 7)}`,
            text: p.text.trim(),
            klar: Boolean(p.klar),
            manader:
              manader && manader.length > 0 && manader.length < 12
                ? manader
                : undefined,
          };
        })
        .filter((p) => p.text)
    : [];

  return {
    ...raw,
    id: raw.id ?? skapaHandelseId(),
    titel: raw.titel?.trim() ?? "Utan titel",
    beskrivning: raw.beskrivning?.trim() ?? "",
    kategori: (raw.kategori && raw.kategori in kategoriEtiketter)
      ? raw.kategori
      : "ovrigt",
    underkategori: raw.underkategori?.trim() || undefined,
    intervall,
    paminnelseDagar,
    klar: Boolean(raw.klar),
    skapad: raw.skapad ?? new Date().toLocaleDateString("sv-SE"),
    manad:
      raw.manad != null && raw.manad >= 1 && raw.manad <= 12
        ? raw.manad
        : undefined,
    intervallAr: synkAr ?? undefined,
    veckodag:
      raw.veckodag != null && raw.veckodag >= 1 && raw.veckodag <= 7
        ? (raw.veckodag as ArshjulVeckodag)
        : undefined,
    veckodagOrdning:
      raw.veckodagOrdning === -1 ||
      raw.veckodagOrdning === 1 ||
      raw.veckodagOrdning === 2 ||
      raw.veckodagOrdning === 3 ||
      raw.veckodagOrdning === 4
        ? raw.veckodagOrdning
        : undefined,
    undantagnaManader: undantagna,
    installdaDatum: installda,
    permanentBorttagnaDatum: permanente,
    klarDatum,
    datumAndringar,
    motesPunkter,
    planerasFranAr:
      typeof raw.planerasFranAr === "number" && raw.planerasFranAr >= 1990
        ? raw.planerasFranAr
        : undefined,
    planerasTillAr:
      typeof raw.planerasTillAr === "number" && raw.planerasTillAr >= 1990
        ? raw.planerasTillAr
        : undefined,
    koppladTillHandelseId:
      typeof raw.koppladTillHandelseId === "string" &&
      raw.koppladTillHandelseId.trim()
        ? raw.koppladTillHandelseId.trim()
        : undefined,
    kopplaTillMotesAr:
      typeof raw.kopplaTillMotesAr === "number" && raw.kopplaTillMotesAr >= 1990
        ? raw.kopplaTillMotesAr
        : undefined,
    gruppNyckel:
      typeof raw.gruppNyckel === "string" && raw.gruppNyckel.trim()
        ? raw.gruppNyckel.trim()
        : undefined,
  };
}

/** Gruppera händelser (t.ex. OVK) så UI kan visa dem som en enhet. */
export function grupperaHandelser(handelser: ArshjulHandelse[]): {
  nyckel: string;
  poster: ArshjulHandelse[];
}[] {
  const sedda = new Set<string>();
  const grupper: { nyckel: string; poster: ArshjulHandelse[] }[] = [];
  for (const h of handelser) {
    if (h.gruppNyckel) {
      if (sedda.has(h.gruppNyckel)) continue;
      sedda.add(h.gruppNyckel);
      grupper.push({
        nyckel: h.gruppNyckel,
        poster: handelser.filter((x) => x.gruppNyckel === h.gruppNyckel),
      });
      continue;
    }
    grupper.push({ nyckel: h.id, poster: [h] });
  }
  return grupper;
}

/** Planeringsfönster — månads-/veckomöten begränsas till valt slutår. */
export function effektivPlanering(
  h: ArshjulHandelse,
  fallbackAr: number,
): { fran: number; till: number | null } {
  const fran = h.planerasFranAr ?? h.startAr ?? fallbackAr;
  if (behoverPlaneringsperiod(h.intervall)) {
    // Saknas slutår → innevarande + kommande år (inte oändligt framåt).
    const till = h.planerasTillAr ?? fran + STANDARD_PLANERING_AR_FRAM;
    return { fran, till: Math.max(fran, till) };
  }
  if (h.planerasTillAr != null) {
    return { fran, till: Math.max(fran, h.planerasTillAr) };
  }
  return { fran: h.planerasFranAr ?? fran, till: null };
}

/** Kort översikt för styrelsens planering ett givet år. */
export function sammanfattaArsPlanering(
  handelser: ArshjulHandelse[],
  ar: number,
): ArsPlaneringSammanfattning {
  const tillfallen = expanderaTillfallen(handelser, ar, ar);
  const installda = tillfallen.filter((t) => t.installd).length;
  const klara = tillfallen.filter((t) => t.arKlar && !t.installd).length;
  const aktiva = tillfallen.filter((t) => !t.installd && !t.arKlar);
  const oppnaPunkter = aktiva.reduce((sum, t) => {
    const h = handelser.find((x) => x.id === t.handelseId);
    const punkter = (h?.motesPunkter ?? []).filter((p) => !p.klar).length;
    return sum + punkter;
  }, 0);
  const koppladeAtgarder = handelser.filter(
    (h) =>
      Boolean(h.koppladTillHandelseId) &&
      !h.klar &&
      (h.kopplaTillMotesAr == null || h.kopplaTillMotesAr === ar),
  ).length;
  const besiktningar = aktiva.filter((t) => t.kategori === "besiktning").length;
  return {
    ar,
    tillfallen: aktiva.length,
    installda,
    klara,
    oppnaPunkter,
    koppladeAtgarder,
    besiktningar,
  };
}

function arInomPlanering(h: ArshjulHandelse, ar: number, fallbackAr: number): boolean {
  const { fran, till } = effektivPlanering(h, fallbackAr);
  if (ar < fran) return false;
  if (till != null && ar > till) return false;
  return true;
}

/** Besiktningar/åtgärder kopplade till en mötes-serie för givet år. */
export function hamtaKoppladeAtgarderForMote(
  handelser: ArshjulHandelse[],
  motesHandelseId: string,
  ar: number,
): ArshjulHandelse[] {
  return handelser.filter(
    (h) =>
      h.koppladTillHandelseId === motesHandelseId &&
      !h.klar &&
      (h.kopplaTillMotesAr == null || h.kopplaTillMotesAr === ar),
  );
}

export function berikaTillfallenMedKopplingar(
  tillfallen: ArshjulTillfalle[],
  handelser: ArshjulHandelse[],
): ArshjulTillfalle[] {
  return tillfallen.map((t) => {
    if (!arMotesKategori(t.kategori)) return t;
    const kopplade = hamtaKoppladeAtgarderForMote(
      handelser,
      t.handelseId,
      t.ar,
    ).map((h) => h.titel);
    if (kopplade.length === 0) return t;
    return {
      ...t,
      koppladeAtgarder: kopplade,
      oppnaPunkter: (t.oppnaPunkter ?? 0) + kopplade.length,
    };
  });
}

/** Skapa två OVK-händelser som en enhet: verksamheter (3 år) + bostäder (6 år). */
export function skapaOvkDubbelHandelser(opts: {
  startArVerksamhet: number;
  startArBostader: number;
  manad?: number;
  dag?: number;
  koppladTillHandelseId?: string;
  kopplaTillMotesAr?: number;
}): ArshjulHandelse[] {
  const manad = opts.manad ?? 6;
  const dag = opts.dag ?? 15;
  const gruppNyckel = `ovk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const gemensamt = {
    kategori: "besiktning" as const,
    manad,
    dag,
    paminnelseDagar: [365, 180, 90, 30],
    klar: false,
    skapad: new Date().toLocaleDateString("sv-SE"),
    externKalla: "manuell" as const,
    koppladTillHandelseId: opts.koppladTillHandelseId,
    kopplaTillMotesAr: opts.kopplaTillMotesAr,
    gruppNyckel,
  };
  return [
    skapaTomHandelse({
      ...gemensamt,
      titel: "OVK verksamheter",
      underkategori: "OVK verksamheter",
      beskrivning: "OVK verksamheter — vart 3:e år.",
      intervall: "vart_3_ar",
      startAr: opts.startArVerksamhet,
    }),
    skapaTomHandelse({
      ...gemensamt,
      titel: "OVK bostäder",
      underkategori: "OVK bostäder",
      beskrivning: "OVK bostäder — vart 6:e år.",
      intervall: "vart_6_ar",
      startAr: opts.startArBostader,
    }),
  ];
}

/** Lägg till punkt på ett möte för en enda månad. */
export function laggTillPunktForManad(
  h: ArshjulHandelse,
  text: string,
  manad: number,
): ArshjulHandelse {
  const t = text.trim();
  if (!t || manad < 1 || manad > 12) return h;
  const finns = (h.motesPunkter ?? []).some(
    (p) =>
      p.text === t &&
      !p.klar &&
      Array.isArray(p.manader) &&
      p.manader.length === 1 &&
      p.manader[0] === manad,
  );
  if (finns) return h;
  return normaliseraHandelse({
    ...h,
    motesPunkter: [
      ...(h.motesPunkter ?? []),
      {
        id: skapaMotesPunktId(),
        text: t,
        klar: false,
        manader: [manad],
      },
    ],
  });
}

function parseDatum(iso: string): Date | null {
  const d = new Date(iso + "T12:00:00");
  return Number.isNaN(d.getTime()) ? null : d;
}

function datumIso(ar: number, manad: number, dag: number): string {
  const sista = new Date(ar, manad, 0).getDate();
  const safeDag = Math.min(Math.max(dag, 1), sista);
  const m = String(manad).padStart(2, "0");
  const d = String(safeDag).padStart(2, "0");
  return `${ar}-${m}-${d}`;
}

function dagarMellan(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / 86400000);
}

function pushTillfalle(
  lista: ArshjulTillfalle[],
  h: ArshjulHandelse,
  ar: number,
  manad: number,
  dag: number,
  arManatlig: boolean,
) {
  if (h.undantagnaManader?.includes(manad)) return;
  const planerat = datumIso(ar, manad, dag);
  const andrat = h.datumAndringar?.[planerat];
  let slutAr = ar;
  let slutManad = manad;
  let slutDag = dag;
  let iso = planerat;
  if (andrat) {
    const parsad = parseDatum(andrat);
    if (parsad) {
      slutAr = parsad.getFullYear();
      slutManad = parsad.getMonth() + 1;
      slutDag = parsad.getDate();
      iso = andrat;
    }
  }
  if (
    h.permanentBorttagnaDatum?.includes(planerat) ||
    h.permanentBorttagnaDatum?.includes(iso)
  ) {
    return;
  }
  const installd = Boolean(
    h.installdaDatum?.includes(planerat) || h.installdaDatum?.includes(iso),
  );
  const punkterNu = oppnaPunkterForManad(h, slutManad);
  lista.push({
    handelseId: h.id,
    titel: h.titel,
    kategori: h.kategori,
    ar: slutAr,
    manad: slutManad,
    dag: slutDag,
    datumIso: iso,
    planeratDatumIso: planerat,
    beskrivning: h.beskrivning,
    arManatlig,
    installd,
    arKlar: Boolean(
      h.klar ||
        h.klarDatum?.includes(iso) ||
        h.klarDatum?.includes(planerat),
    ),
    oppnaPunkter: punkterNu.length,
    punkterPaTillfalle: punkterNu.map((p) => p.text),
  });
}

/**
 * Hitta given veckodag inom vald vecka i månaden.
 * Vecka 1 = dag 1–7, vecka 2 = 8–14, osv. -1 = sista 7 dagarna.
 * Exempel: 2:a veckan + måndag.
 */
export function nthVeckodagIManad(
  ar: number,
  manad: number,
  veckodag: ArshjulVeckodag,
  ordning: ArshjulVeckodagOrdning,
): number | null {
  const jsDay = veckodag === 7 ? 0 : veckodag; // JS: 0=sön
  const sistaDag = new Date(ar, manad, 0).getDate();
  let start: number;
  let end: number;
  if (ordning === -1) {
    start = Math.max(1, sistaDag - 6);
    end = sistaDag;
  } else {
    start = (ordning - 1) * 7 + 1;
    end = Math.min(ordning * 7, sistaDag);
  }
  if (start > end) return null;
  for (let d = start; d <= end; d++) {
    const date = new Date(ar, manad - 1, d, 12, 0, 0);
    if (date.getDay() === jsDay) return d;
  }
  return null;
}

export function andraTillfalleDatum(
  h: ArshjulHandelse,
  planeratIso: string,
  nyttIso: string,
): ArshjulHandelse {
  const andringar = { ...(h.datumAndringar ?? {}) };
  if (!nyttIso || nyttIso === planeratIso) {
    delete andringar[planeratIso];
  } else {
    andringar[planeratIso] = nyttIso;
  }
  return normaliseraHandelse({ ...h, datumAndringar: andringar });
}

export function stallInTillfalle(
  h: ArshjulHandelse,
  datumIsoStr: string,
): ArshjulHandelse {
  const installda = [...(h.installdaDatum ?? [])];
  if (!installda.includes(datumIsoStr)) installda.push(datumIsoStr);
  return normaliseraHandelse({ ...h, installdaDatum: installda });
}

/** Återställ ett tillfälligt inställt möte så det körs som planerat igen. */
export function aterstallTillfalle(
  h: ArshjulHandelse,
  ...datumIsoLista: string[]
): ArshjulHandelse {
  const taBort = new Set(datumIsoLista.filter(Boolean));
  const installda = (h.installdaDatum ?? []).filter((d) => !taBort.has(d));
  return normaliseraHandelse({ ...h, installdaDatum: installda });
}

/**
 * Ta bort ett enskilt tillfälle permanent — syns inte igen och kan inte
 * återställas (till skillnad från "ställ in").
 */
export function taBortTillfallePermanent(
  h: ArshjulHandelse,
  planeratIso: string,
  aktuelltIso?: string,
): ArshjulHandelse {
  const permanente = [...(h.permanentBorttagnaDatum ?? [])];
  if (!permanente.includes(planeratIso)) permanente.push(planeratIso);
  if (aktuelltIso && aktuelltIso !== planeratIso && !permanente.includes(aktuelltIso)) {
    permanente.push(aktuelltIso);
  }
  const taBort = new Set([planeratIso, aktuelltIso].filter(Boolean) as string[]);
  const installda = (h.installdaDatum ?? []).filter((d) => !taBort.has(d));
  const andringar = { ...(h.datumAndringar ?? {}) };
  delete andringar[planeratIso];
  return normaliseraHandelse({
    ...h,
    permanentBorttagnaDatum: permanente,
    installdaDatum: installda,
    datumAndringar: andringar,
  });
}

export function markeraTillfalleKlar(
  h: ArshjulHandelse,
  datumIsoStr: string,
): ArshjulHandelse {
  if (h.intervall === "engang") {
    return normaliseraHandelse({ ...h, klar: true });
  }
  const klarDatum = [...(h.klarDatum ?? [])];
  if (!klarDatum.includes(datumIsoStr)) klarDatum.push(datumIsoStr);
  return normaliseraHandelse({ ...h, klarDatum });
}

/** Återställ ett tillfälle som markerats klart (t.ex. av misstag). */
export function aterstallTillfalleKlar(
  h: ArshjulHandelse,
  ...datumIsoLista: string[]
): ArshjulHandelse {
  if (h.intervall === "engang") {
    return normaliseraHandelse({ ...h, klar: false });
  }
  const taBort = new Set(datumIsoLista.filter(Boolean));
  const klarDatum = (h.klarDatum ?? []).filter((d) => !taBort.has(d));
  return normaliseraHandelse({ ...h, klarDatum, klar: false });
}

export function toggleMotesPunkt(
  h: ArshjulHandelse,
  punktId: string,
): ArshjulHandelse {
  const punkter = (h.motesPunkter ?? []).map((p) =>
    p.id === punktId ? { ...p, klar: !p.klar } : p,
  );
  return normaliseraHandelse({ ...h, motesPunkter: punkter });
}

export function uppdateraMotesPunktManader(
  h: ArshjulHandelse,
  punktId: string,
  manader: number[] | undefined,
): ArshjulHandelse {
  const punkter = (h.motesPunkter ?? []).map((p) =>
    p.id === punktId
      ? {
          ...p,
          manader:
            manader && manader.length > 0 && manader.length < 12
              ? [...new Set(manader)].sort((a, b) => a - b)
              : undefined,
        }
      : p,
  );
  return normaliseraHandelse({ ...h, motesPunkter: punkter });
}

export function skapaMotesPunktId(): string {
  return `mp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function nastaIntervallAr(h: ArshjulHandelse): number | null {
  const steg = intervallTillAr(h.intervall);
  if (!steg || !arFlerarsIntervall(h.intervall)) return null;
  const bas = h.senastKlarAr ?? h.startAr;
  if (bas == null) return null;
  if (!h.klar && h.startAr != null) return h.startAr;
  return bas + steg;
}

export function handelseIntervallText(h: ArshjulHandelse): string {
  const undantag =
    h.undantagnaManader && h.undantagnaManader.length > 0
      ? ` (ej ${h.undantagnaManader.map((m) => manadsnamn[m - 1].slice(0, 3)).join(", ")})`
      : "";
  const period =
    h.planerasFranAr != null || h.planerasTillAr != null
      ? ` · ${h.planerasFranAr ?? "…"}–${h.planerasTillAr ?? "…"}`
      : behoverPlaneringsperiod(h.intervall)
        ? ` · ${effektivPlanering(h, new Date().getFullYear()).fran}`
        : "";
  switch (h.intervall) {
    case "engang":
      return h.datum ? formatDatumKort(h.datum) : "Engång";
    case "veckovis":
      return h.datum
        ? `Veckovis från ${formatDatumKort(h.datum)}${period}`
        : `Veckovis${period}`;
    case "manadsvis":
      return `Månadsvis (dag ${h.dag ?? 1})${undantag}${period}`;
    case "manadsvis_veckodag": {
      const ord =
        veckodagOrdningEtiketter[String(h.veckodagOrdning ?? 1)] ?? "1:a veckan";
      const dag =
        h.veckodag != null ? veckodagEtiketter[h.veckodag] : "måndag";
      return `${ord.toLowerCase()}, ${dag.toLowerCase()} varje månad${undantag}${period}`;
    }
    case "kvartalsvis":
      return `Kvartalsvis från ${manadsnamn[(h.manad ?? 1) - 1]}${undantag}${period}`;
    case "arlig":
      return `Varje år i ${manadsnamn[(h.manad ?? 1) - 1]}${period}`;
    case "vart_3_ar":
    case "vart_6_ar":
    case "vart_10_ar":
      return `${intervallEtiketter[h.intervall]} från ${h.startAr ?? "—"}`;
    default:
      return intervallEtiketter[h.intervall];
  }
}

/** Alla tillfällen för ett år (och valfritt år-intervall för tidslinje). */
export function expanderaTillfallen(
  handelser: ArshjulHandelse[],
  franAr: number,
  tillAr: number,
): ArshjulTillfalle[] {
  const lista: ArshjulTillfalle[] = [];
  const fallbackAr = franAr;

  for (const h of handelser) {
    if (h.klar && h.intervall === "engang") continue;
    const plan = effektivPlanering(h, fallbackAr);
    const effektivFran = Math.max(franAr, plan.fran);
    const effektivTill =
      plan.till != null ? Math.min(tillAr, plan.till) : tillAr;
    if (effektivFran > effektivTill) continue;

    if (h.intervall === "engang" && h.datum) {
      const d = parseDatum(h.datum);
      if (!d) continue;
      const ar = d.getFullYear();
      if (ar >= effektivFran && ar <= effektivTill) {
        pushTillfalle(
          lista,
          h,
          ar,
          d.getMonth() + 1,
          d.getDate(),
          false,
        );
      }
      continue;
    }

    if (h.intervall === "veckovis" && h.datum) {
      const start = parseDatum(h.datum);
      if (!start) continue;
      const slut = new Date(effektivTill, 11, 31, 12, 0, 0);
      let cursor = new Date(start);
      while (cursor.getFullYear() < effektivFran) {
        cursor.setDate(cursor.getDate() + 7);
      }
      while (cursor <= slut && cursor.getFullYear() <= effektivTill) {
        if (
          cursor.getFullYear() >= effektivFran &&
          arInomPlanering(h, cursor.getFullYear(), fallbackAr)
        ) {
          pushTillfalle(
            lista,
            h,
            cursor.getFullYear(),
            cursor.getMonth() + 1,
            cursor.getDate(),
            false,
          );
        }
        cursor = new Date(cursor);
        cursor.setDate(cursor.getDate() + 7);
      }
      continue;
    }

    if (h.intervall === "manadsvis") {
      const dag = h.dag && h.dag >= 1 && h.dag <= 28 ? h.dag : 1;
      for (let ar = effektivFran; ar <= effektivTill; ar++) {
        for (let manad = 1; manad <= 12; manad++) {
          pushTillfalle(lista, h, ar, manad, dag, true);
        }
      }
      continue;
    }

    if (h.intervall === "manadsvis_veckodag" && h.veckodag) {
      const ordning = h.veckodagOrdning ?? 1;
      for (let ar = effektivFran; ar <= effektivTill; ar++) {
        for (let manad = 1; manad <= 12; manad++) {
          const dag = nthVeckodagIManad(ar, manad, h.veckodag, ordning);
          if (dag == null) continue;
          pushTillfalle(lista, h, ar, manad, dag, true);
        }
      }
      continue;
    }

    if (h.intervall === "kvartalsvis") {
      const startManad = h.manad ?? 1;
      const dag = h.dag && h.dag >= 1 && h.dag <= 28 ? h.dag : 1;
      const sedda = new Set<string>();
      for (let ar = effektivFran; ar <= effektivTill; ar++) {
        for (let q = 0; q < 4; q++) {
          let manad = startManad + q * 3;
          let tillfalleAr = ar;
          while (manad > 12) {
            manad -= 12;
            tillfalleAr += 1;
          }
          if (tillfalleAr < effektivFran || tillfalleAr > effektivTill) continue;
          const nyckel = datumIso(tillfalleAr, manad, dag);
          if (sedda.has(nyckel)) continue;
          sedda.add(nyckel);
          pushTillfalle(lista, h, tillfalleAr, manad, dag, true);
        }
      }
      continue;
    }

    if (h.intervall === "arlig" && h.manad) {
      const dag = h.dag && h.dag >= 1 && h.dag <= 28 ? h.dag : 1;
      for (let ar = effektivFran; ar <= effektivTill; ar++) {
        pushTillfalle(lista, h, ar, h.manad, dag, true);
      }
      continue;
    }

    if (arFlerarsIntervall(h.intervall)) {
      const steg = intervallTillAr(h.intervall) ?? 1;
      let ar = h.startAr ?? effektivFran;
      if (h.senastKlarAr != null) {
        ar = h.senastKlarAr + steg;
      }
      while (ar <= effektivTill) {
        if (ar >= effektivFran && arInomPlanering(h, ar, fallbackAr)) {
          const manad = h.manad ?? 6;
          const dag = h.dag ?? 15;
          pushTillfalle(lista, h, ar, manad, dag, false);
        }
        ar += steg;
      }
    }
  }

  return berikaTillfallenMedKopplingar(
    lista.sort((a, b) => a.datumIso.localeCompare(b.datumIso)),
    handelser,
  );
}

export function hamtaPaminnelser(
  handelser: ArshjulHandelse[],
  franDatum: Date,
  tillDatum: Date,
): ArshjulPaminnelse[] {
  const idag = new Date();
  idag.setHours(12, 0, 0, 0);
  const franAr = franDatum.getFullYear() - 1;
  const tillAr = tillDatum.getFullYear() + 1;
  const tillfallen = expanderaTillfallen(handelser, franAr, tillAr);
  const poster: ArshjulPaminnelse[] = [];

  for (const t of tillfallen) {
    const h = handelser.find((x) => x.id === t.handelseId);
    if (!h || h.klar || t.arKlar || t.installd) continue;

    const mål = parseDatum(t.datumIso);
    if (!mål) continue;
    if (mål < franDatum || mål > tillDatum) continue;

    const dagarKvar = dagarMellan(idag, mål);
    const agenda = [
      ...(t.punkterPaTillfalle ??
        oppnaPunkterForManad(h, t.manad).map((p) => p.text)),
      ...(t.koppladeAtgarder ?? []),
    ];
    const agendaText =
      agenda.length > 0
        ? ` På mötet: ${agenda.join(", ")}.`
        : "";

    if (dagarKvar < 0) {
      poster.push({
        handelseId: h.id,
        tillfalleDatum: t.datumIso,
        titel: h.titel,
        kategori: h.kategori,
        dagarKvar,
        rubrik: `${h.titel} — försenad`,
        text:
          (h.beskrivning || `Planerat ${formatDatumKort(t.datumIso)}.`) +
          agendaText,
        nivå: "kritisk",
      });
      continue;
    }

    for (const d of h.paminnelseDagar) {
      if (dagarKvar <= d) {
        const nivå: ArshjulPaminnelse["nivå"] =
          dagarKvar <= 7 ? "kritisk" : dagarKvar <= 30 ? "varning" : "info";
        poster.push({
          handelseId: h.id,
          tillfalleDatum: t.datumIso,
          titel: h.titel,
          kategori: h.kategori,
          dagarKvar,
          rubrik:
            dagarKvar === 0
              ? `${h.titel} — idag`
              : `${h.titel} — om ${dagarKvar} dagar`,
          text:
            (h.beskrivning ||
              `Planerat ${formatDatumKort(t.datumIso)}. Börja förbereda i god tid.`) +
            agendaText,
          nivå,
        });
        break;
      }
    }
  }

  // Kopplade åtgärder utan mötesdatum ännu — påminnelse ändå.
  for (const h of handelser) {
    if (!h.koppladTillHandelseId || h.klar) continue;
    const mote = handelser.find((x) => x.id === h.koppladTillHandelseId);
    if (!mote || mote.klar) continue;
    const motesAr = h.kopplaTillMotesAr ?? idag.getFullYear();
    const harMotesDatum = tillfallen.some(
      (t) =>
        t.handelseId === mote.id &&
        t.ar === motesAr &&
        !t.installd &&
        !t.arKlar,
    );
    if (harMotesDatum) continue;
    const redan = poster.some(
      (p) => p.handelseId === h.id && p.rubrik.includes("kopplad till"),
    );
    if (redan) continue;
    poster.push({
      handelseId: h.id,
      tillfalleDatum: `${motesAr}-01-01`,
      titel: h.titel,
      kategori: h.kategori,
      dagarKvar: Math.max(
        0,
        dagarMellan(idag, new Date(motesAr, 0, 1, 12, 0, 0)),
      ),
      rubrik: `${h.titel} — kopplad till ${mote.titel}`,
      text: `Åtgärden ska tas upp på ${kategoriEtiketter[mote.kategori].toLowerCase()} under ${motesAr}. Mötesdatum är inte inlagda ännu — lägg in möten för året så dyker punkten upp där automatiskt.`,
      nivå: "info",
    });
  }

  return poster.sort((a, b) => a.dagarKvar - b.dagarKvar);
}

export function formatDatumKort(iso: string): string {
  const d = parseDatum(iso);
  if (!d) return iso;
  return d.toLocaleDateString("sv-SE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function skapaTomHandelse(overrides?: Partial<ArshjulHandelse>): ArshjulHandelse {
  return normaliseraHandelse({
    id: skapaHandelseId(),
    titel: "",
    beskrivning: "",
    kategori: "ovrigt",
    intervall: "arlig",
    manad: 1,
    dag: 1,
    paminnelseDagar: [...STANDARD_PAMINNELSE_DAGAR],
    klar: false,
    skapad: new Date().toLocaleDateString("sv-SE"),
    externKalla: "manuell",
    ...overrides,
  });
}
