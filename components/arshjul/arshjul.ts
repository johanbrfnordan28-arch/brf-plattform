import { foreningStorageKey } from "@/lib/foreningStorage";

export type ArshjulKategori =
  | "styrelsemote"
  | "garantbesiktning"
  | "byggmote"
  | "ovk"
  | "sotning"
  | "energideklaration"
  | "radon"
  | "besiktning"
  | "ekonomi"
  | "stamma"
  | "underhall"
  | "juridik"
  | "medlemmar"
  | "ovrigt";

/** engang = ett datum · arlig = samma månad varje år · manatlig = varje månad · intervall = vart N:e år */
export type ArshjulHandelseTyp =
  | "engang"
  | "arlig"
  | "manatlig"
  | "intervall";

/** 1 = måndag … 7 = söndag (svensk vecka). */
export type Veckodag = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type ArshjulHandelse = {
  id: string;
  titel: string;
  beskrivning: string;
  kategori: ArshjulKategori;
  typ: ArshjulHandelseTyp;
  /** Engång — YYYY-MM-DD. */
  datum?: string;
  /** Årlig / intervall — månad 1–12. */
  manad?: number;
  /** Fast dag i månaden (1–28). Används om veckodag saknas. */
  dag?: number;
  /** Månadsvis / årlig: veckodag i stället för datumdag (t.ex. tisdag = 2). */
  veckodag?: Veckodag;
  /** Vilken förekomst av veckodagen: 1 = första, 2 = andra … (standard 1). */
  veckodagOrdinal?: number;
  /** Intervall — första planerade år och år mellan tillfällen. */
  startAr?: number;
  intervallAr?: number;
  /** Senast markerad som genomförd (kalenderår) — nästa tillfälle räknas därifrån. */
  senastKlarAr?: number;
  /** Avklarade enskilda tillfällen (YYYY-MM-DD) — gäller månads-/årsvisa serier. */
  klarDatum?: string[];
  /** Månader som hoppas över (t.ex. juli–augusti = [7, 8]). */
  exkluderaManader?: number[];
  /** Dagar före händelsen att visa påminnelse. */
  paminnelseDagar: number[];
  /** Engångshändelse helt avklarad (serier använder klarDatum i stället). */
  klar: boolean;
  skapad: string;
  externKalla?: "underhallsplan" | "projekt" | "manuell";
  externId?: string;
};

export type ArshjulTillfalle = {
  handelseId: string;
  titel: string;
  kategori: ArshjulKategori;
  ar: number;
  manad: number;
  dag: number;
  datumIso: string;
  beskrivning: string;
  arManatlig: boolean;
  /** Detta enskilda tillfälle är avbockat. */
  arKlar: boolean;
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

/** Föreslaget intervall för sotning i BRF med eldstäder (kan vara 1–4 år beroende på eldstad). */
export const SOTNING_FORESLAGET_INTERVALL_AR = 3;

export const kategoriEtiketter: Record<ArshjulKategori, string> = {
  styrelsemote: "Styrelsemöte",
  garantbesiktning: "Garantbesiktning",
  byggmote: "Byggmöte",
  ovk: "OVK-besiktning",
  sotning: "Sotning",
  energideklaration: "Energideklaration",
  radon: "Radonmätning",
  besiktning: "Besiktning",
  ekonomi: "Ekonomi",
  stamma: "Stämma",
  underhall: "Underhåll",
  juridik: "Juridik",
  medlemmar: "Medlemmar",
  ovrigt: "Övrigt",
};

export const kategoriFarger: Record<ArshjulKategori, string> = {
  styrelsemote: "bg-indigo-100 text-indigo-950 border-indigo-200",
  garantbesiktning: "bg-orange-100 text-orange-950 border-orange-200",
  byggmote: "bg-cyan-100 text-cyan-950 border-cyan-200",
  ovk: "bg-teal-100 text-teal-950 border-teal-200",
  sotning: "bg-stone-200 text-stone-950 border-stone-300",
  energideklaration: "bg-lime-100 text-lime-950 border-lime-200",
  radon: "bg-yellow-100 text-yellow-950 border-yellow-200",
  besiktning: "bg-sky-100 text-sky-950 border-sky-200",
  ekonomi: "bg-emerald-100 text-emerald-950 border-emerald-200",
  stamma: "bg-violet-100 text-violet-950 border-violet-200",
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

export const veckodagsnamn: Record<Veckodag, string> = {
  1: "Måndag",
  2: "Tisdag",
  3: "Onsdag",
  4: "Torsdag",
  5: "Fredag",
  6: "Lördag",
  7: "Söndag",
};

/** Standard: hoppa över juli och augusti (sommaruppehåll). */
export const SOMMAR_EXKLUDERADE_MANADER = [7, 8] as const;

export function skapaHandelseId(): string {
  return `arshjul-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function arGiltigKategori(k: string): k is ArshjulKategori {
  return k in kategoriEtiketter;
}

function arGiltigTyp(t: string): t is ArshjulHandelseTyp {
  return (
    t === "engang" || t === "arlig" || t === "manatlig" || t === "intervall"
  );
}

export function normaliseraHandelse(raw: ArshjulHandelse): ArshjulHandelse {
  const paminnelseDagar =
    Array.isArray(raw.paminnelseDagar) && raw.paminnelseDagar.length > 0
      ? [...new Set(raw.paminnelseDagar.filter((d) => d > 0))].sort((a, b) => b - a)
      : [...STANDARD_PAMINNELSE_DAGAR];

  const exkluderaManader = Array.isArray(raw.exkluderaManader)
    ? [
        ...new Set(
          raw.exkluderaManader.filter((m) => m >= 1 && m <= 12),
        ),
      ].sort((a, b) => a - b)
    : undefined;

  const klarDatum = Array.isArray(raw.klarDatum)
    ? [
        ...new Set(
          raw.klarDatum.filter(
            (d) => typeof d === "string" && /^\d{4}-\d{2}-\d{2}/.test(d),
          ),
        ),
      ].sort()
    : undefined;

  const veckodag =
    raw.veckodag != null && raw.veckodag >= 1 && raw.veckodag <= 7
      ? (raw.veckodag as Veckodag)
      : undefined;

  return {
    ...raw,
    titel: raw.titel?.trim() ?? "Utan titel",
    beskrivning: raw.beskrivning?.trim() ?? "",
    kategori: arGiltigKategori(raw.kategori) ? raw.kategori : "ovrigt",
    typ: arGiltigTyp(raw.typ) ? raw.typ : "engang",
    paminnelseDagar,
    // Serier bockas per tillfälle via klarDatum — gammal serie-klar nollställs.
    klar: arGiltigTyp(raw.typ) && raw.typ !== "engang" ? false : Boolean(raw.klar),
    klarDatum:
      klarDatum && klarDatum.length > 0 ? klarDatum : undefined,
    manad:
      raw.manad != null && raw.manad >= 1 && raw.manad <= 12
        ? raw.manad
        : undefined,
    startAr:
      raw.startAr != null && raw.startAr >= 1990 && raw.startAr <= 2200
        ? raw.startAr
        : undefined,
    intervallAr:
      raw.intervallAr != null && raw.intervallAr >= 1 ? raw.intervallAr : undefined,
    veckodag,
    veckodagOrdinal:
      raw.veckodagOrdinal != null && raw.veckodagOrdinal >= 1 && raw.veckodagOrdinal <= 5
        ? raw.veckodagOrdinal
        : veckodag
          ? 1
          : undefined,
    exkluderaManader:
      exkluderaManader && exkluderaManader.length > 0
        ? exkluderaManader
        : undefined,
  };
}

function parseDatum(iso: string): Date | null {
  const d = new Date(iso + "T12:00:00");
  return Number.isNaN(d.getTime()) ? null : d;
}

function datumIso(ar: number, manad: number, dag: number): string {
  const m = String(manad).padStart(2, "0");
  const d = String(dag).padStart(2, "0");
  return `${ar}-${m}-${d}`;
}

function dagarMellan(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / 86400000);
}

/** JS getDay(): 0=sön … 6=lör → svensk 1=mån … 7=sön. */
function jsTillSvenskVeckodag(jsDay: number): Veckodag {
  return (jsDay === 0 ? 7 : jsDay) as Veckodag;
}

/**
 * Hitta datumet för N:e veckodagen i en månad (t.ex. 2:a tisdagen).
 */
export function datumForVeckodagIManad(
  ar: number,
  manad: number,
  veckodag: Veckodag,
  ordinal = 1,
): { dag: number; datumIso: string } | null {
  const forsta = new Date(ar, manad - 1, 1, 12, 0, 0);
  const forstaVeckodag = jsTillSvenskVeckodag(forsta.getDay());
  let dag = 1 + ((veckodag - forstaVeckodag + 7) % 7);
  dag += (Math.max(1, ordinal) - 1) * 7;
  const sistaDag = new Date(ar, manad, 0).getDate();
  if (dag > sistaDag) return null;
  return { dag, datumIso: datumIso(ar, manad, dag) };
}

function dagIManadForHandelse(
  h: ArshjulHandelse,
  ar: number,
  manad: number,
): { dag: number; datumIso: string } | null {
  if (h.veckodag) {
    return datumForVeckodagIManad(
      ar,
      manad,
      h.veckodag,
      h.veckodagOrdinal ?? 1,
    );
  }
  const dag = h.dag && h.dag >= 1 && h.dag <= 28 ? h.dag : 1;
  return { dag, datumIso: datumIso(ar, manad, dag) };
}

function manadArExkluderad(h: ArshjulHandelse, manad: number): boolean {
  return Boolean(h.exkluderaManader?.includes(manad));
}

/** Om ett enskilt tillfälle är avbockat. */
export function tillfalleArKlar(h: ArshjulHandelse, datumIso: string): boolean {
  if (h.typ === "engang" && h.klar) return true;
  const nyckel = datumIso.slice(0, 10);
  return Boolean(h.klarDatum?.some((d) => d.slice(0, 10) === nyckel));
}

export function nastaIntervallAr(h: ArshjulHandelse): number | null {
  if (h.typ !== "intervall" || !h.intervallAr || h.intervallAr < 1) return null;
  const bas = h.senastKlarAr ?? h.startAr;
  if (bas == null) return null;
  if (!h.klar && h.startAr != null && h.senastKlarAr == null) return h.startAr;
  return bas + h.intervallAr;
}

function pushTillfalle(
  lista: ArshjulTillfalle[],
  h: ArshjulHandelse,
  ar: number,
  manad: number,
  arManatlig: boolean,
): void {
  if (manadArExkluderad(h, manad)) return;
  const dagInfo = dagIManadForHandelse(h, ar, manad);
  if (!dagInfo) return;
  lista.push({
    handelseId: h.id,
    titel: h.titel,
    kategori: h.kategori,
    ar,
    manad,
    dag: dagInfo.dag,
    datumIso: dagInfo.datumIso,
    beskrivning: h.beskrivning,
    arManatlig,
    arKlar: tillfalleArKlar(h, dagInfo.datumIso),
  });
}

/** Alla tillfällen för ett år (och valfritt år-intervall för tidslinje). */
export function expanderaTillfallen(
  handelser: ArshjulHandelse[],
  franAr: number,
  tillAr: number,
): ArshjulTillfalle[] {
  const lista: ArshjulTillfalle[] = [];

  for (const h of handelser) {
    // Helt avklarad engångshändelse visas inte igen.
    if (h.typ === "engang" && h.klar) continue;

    if (h.typ === "engang" && h.datum) {
      const d = parseDatum(h.datum.slice(0, 10));
      if (!d) continue;
      const ar = d.getFullYear();
      const manad = d.getMonth() + 1;
      if (ar >= franAr && ar <= tillAr && !manadArExkluderad(h, manad)) {
        const datumIso = h.datum.slice(0, 10);
        lista.push({
          handelseId: h.id,
          titel: h.titel,
          kategori: h.kategori,
          ar,
          manad,
          dag: d.getDate(),
          datumIso,
          beskrivning: h.beskrivning,
          arManatlig: false,
          arKlar: tillfalleArKlar(h, datumIso),
        });
      }
      continue;
    }

    if (h.typ === "manatlig") {
      const start = h.startAr ?? franAr;
      for (let ar = franAr; ar <= tillAr; ar++) {
        if (ar < start) continue;
        for (let manad = 1; manad <= 12; manad++) {
          pushTillfalle(lista, h, ar, manad, true);
        }
      }
      continue;
    }

    if (h.typ === "arlig" && (h.manad || h.veckodag)) {
      const manad = h.manad ?? 1;
      const start = h.startAr ?? franAr;
      for (let ar = franAr; ar <= tillAr; ar++) {
        if (ar < start) continue;
        pushTillfalle(lista, h, ar, manad, false);
      }
      continue;
    }

    if (h.typ === "intervall" && h.intervallAr && h.intervallAr >= 1) {
      let ar = h.startAr ?? franAr;
      if (h.senastKlarAr != null) {
        ar = h.senastKlarAr + h.intervallAr;
      }
      while (ar <= tillAr) {
        if (ar >= franAr) {
          const manad = h.manad ?? 6;
          pushTillfalle(lista, h, ar, manad, false);
        }
        ar += h.intervallAr;
      }
    }
  }

  return lista.sort((a, b) => a.datumIso.localeCompare(b.datumIso));
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
    if (!h || t.arKlar) continue;

    const mål = parseDatum(t.datumIso);
    if (!mål) continue;
    if (mål < franDatum || mål > tillDatum) continue;

    const dagarKvar = dagarMellan(idag, mål);
    if (dagarKvar < 0) {
      poster.push({
        handelseId: h.id,
        tillfalleDatum: t.datumIso,
        titel: h.titel,
        kategori: h.kategori,
        dagarKvar,
        rubrik: `${h.titel} — försenad`,
        text: h.beskrivning || `Planerat ${formatDatumKort(t.datumIso)}.`,
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
            h.beskrivning ||
            `Planerat ${formatDatumKort(t.datumIso)}. Börja förbereda i god tid.`,
          nivå,
        });
        break;
      }
    }
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
    typ: "engang",
    paminnelseDagar: [...STANDARD_PAMINNELSE_DAGAR],
    klar: false,
    skapad: new Date().toLocaleDateString("sv-SE"),
    externKalla: "manuell",
    ...overrides,
  });
}

const innevarandeAr = () => new Date().getFullYear();

/** Standardhändelser för årshjulet — läggs in som mall / kan fyllas på. */
export function skapaStandardHandelser(basAr = innevarandeAr()): ArshjulHandelse[] {
  return [
    normaliseraHandelse({
      id: "std-styrelsemote",
      titel: "Styrelsemöte",
      beskrivning:
        "Ordinarie styrelsemöte — andra tisdagen varje månad. Uppehåll juli–augusti.",
      kategori: "styrelsemote",
      typ: "manatlig",
      veckodag: 2,
      veckodagOrdinal: 2,
      exkluderaManader: [...SOMMAR_EXKLUDERADE_MANADER],
      paminnelseDagar: [14, 7, 1],
      klar: false,
      skapad: "standard",
      externKalla: "manuell",
    }),
    normaliseraHandelse({
      id: "std-byggmote",
      titel: "Byggmöte",
      beskrivning:
        "Bygg- / entreprenadmöte under pågående projekt. Justera eller ta bort månader utan projekt.",
      kategori: "byggmote",
      typ: "manatlig",
      veckodag: 4,
      veckodagOrdinal: 1,
      exkluderaManader: [...SOMMAR_EXKLUDERADE_MANADER],
      paminnelseDagar: [7, 1],
      klar: false,
      skapad: "standard",
      externKalla: "manuell",
    }),
    normaliseraHandelse({
      id: "std-garant",
      titel: "Garantbesiktning",
      beskrivning:
        "Lägg in konkret datum när garantitiden närmar sig (eller importera från projekt).",
      kategori: "garantbesiktning",
      typ: "engang",
      datum: `${basAr + 2}-09-15`,
      paminnelseDagar: [180, 90, 30, 14],
      klar: false,
      skapad: "standard",
      externKalla: "manuell",
    }),
    normaliseraHandelse({
      id: "std-ovk-bostad",
      titel: "OVK — bostäder",
      beskrivning:
        "Obligatorisk ventilationskontroll för bostäder. Intervall 3 eller 6 år beroende på ventilationssystem (S/F/FX ofta 6 år, FT/FTX 3 år).",
      kategori: "ovk",
      typ: "intervall",
      startAr: basAr,
      intervallAr: 6,
      manad: 9,
      dag: 1,
      paminnelseDagar: [365, 180, 90, 30],
      klar: false,
      skapad: "standard",
      externKalla: "manuell",
    }),
    normaliseraHandelse({
      id: "std-ovk-butik",
      titel: "OVK — butiker / verksamhet",
      beskrivning:
        "OVK för verksamhetslokaler och butiker — normalt vart 3:e år.",
      kategori: "ovk",
      typ: "intervall",
      startAr: basAr,
      intervallAr: 3,
      manad: 9,
      dag: 15,
      paminnelseDagar: [180, 90, 30],
      klar: false,
      skapad: "standard",
      externKalla: "manuell",
    }),
    normaliseraHandelse({
      id: "std-sotning",
      titel: "Sotning",
      beskrivning: `Föreslaget intervall: vart ${SOTNING_FORESLAGET_INTERVALL_AR}:e år (vanligt i BRF med eldstäder). Kan vara 1–4 år beroende på eldstad och bränsle — stäm av med skorstensfejarmästaren.`,
      kategori: "sotning",
      typ: "intervall",
      startAr: basAr,
      intervallAr: SOTNING_FORESLAGET_INTERVALL_AR,
      manad: 10,
      dag: 1,
      paminnelseDagar: [90, 30, 14],
      klar: false,
      skapad: "standard",
      externKalla: "manuell",
    }),
    normaliseraHandelse({
      id: "std-energi",
      titel: "Energideklaration",
      beskrivning: "Lagkrav — energideklaration ska göras vart 10:e år.",
      kategori: "energideklaration",
      typ: "intervall",
      startAr: basAr,
      intervallAr: 10,
      manad: 5,
      dag: 1,
      paminnelseDagar: [365, 180, 90],
      klar: false,
      skapad: "standard",
      externKalla: "manuell",
    }),
    normaliseraHandelse({
      id: "std-radon",
      titel: "Radonmätning",
      beskrivning:
        "Rekommenderas / krav i många fall vart 10:e år (mätperiod oftast under eldningssäsong).",
      kategori: "radon",
      typ: "intervall",
      startAr: basAr,
      intervallAr: 10,
      manad: 10,
      dag: 15,
      paminnelseDagar: [365, 180, 90],
      klar: false,
      skapad: "standard",
      externKalla: "manuell",
    }),
    normaliseraHandelse({
      id: "std-stamma",
      titel: "Årsstämma",
      beskrivning: "Kallelse, underlag och protokoll.",
      kategori: "stamma",
      typ: "arlig",
      manad: 4,
      dag: 15,
      startAr: basAr,
      paminnelseDagar: [90, 60, 30, 14],
      klar: false,
      skapad: "standard",
      externKalla: "manuell",
    }),
    normaliseraHandelse({
      id: "std-bokslut",
      titel: "Bokslut & budget",
      beskrivning: "Ekonomisk plan och budget inför nästa år.",
      kategori: "ekonomi",
      typ: "arlig",
      manad: 11,
      dag: 30,
      startAr: basAr,
      paminnelseDagar: [60, 30, 14],
      klar: false,
      skapad: "standard",
      externKalla: "manuell",
    }),
  ];
}

/** Lägger till saknade standardhändelser (matchar på id). */
export function fyllPaStandardHandelser(
  befintliga: ArshjulHandelse[],
): ArshjulHandelse[] {
  const ids = new Set(befintliga.map((h) => h.id));
  const tillagg = skapaStandardHandelser().filter((h) => !ids.has(h.id));
  return [...befintliga, ...tillagg];
}
