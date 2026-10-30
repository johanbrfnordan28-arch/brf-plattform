import { foreningStorageKey } from "@/lib/foreningStorage";
import {
  normaliseraArshjulSignering,
  type ArshjulDokumentSignering,
} from "@/components/arshjul/arshjul-dokument-signering";

export type { ArshjulDokumentSignering };

export type ArshjulKategori =
  | "styrelsemote"
  | "projekteringsmote"
  | "upphandlingsmote"
  | "startmote"
  | "byggmote"
  | "besiktningEntreprenad"
  | "garantbesiktning"
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

/** engang = ett datum · arlig = samma månad varje år · manatlig = varje månad · intervall = vart N:e år · serie = numrerade möten med intervall + antal */
export type ArshjulHandelseTyp =
  | "engang"
  | "arlig"
  | "manatlig"
  | "intervall"
  | "serie";

/** Hur ofta möten i en serie återkommer. */
export type SerieIntervallEnhet = "vecka" | "manad";

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
  /** Serie — antal möten (Byggmöte 1, 2, …). Kan utökas senare. */
  serieAntal?: number;
  /** Serie — vart N:e vecka/månad. */
  serieIntervallVarje?: number;
  serieIntervallEnhet?: SerieIntervallEnhet;
  /** Serie — datum för första mötet (YYYY-MM-DD). */
  serieStartDatum?: string;
  /** Serie — sparade datum om serien har utökats eller ett möte tagits bort. */
  serieDatum?: string[];
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
  /**
   * Intervall utan bestämt datum — planeras under året (visas i januari som påminnelse).
   * Exakt tidpunkt (ev. upphandling) bestäms senare under året.
   */
  utanFastDatum?: boolean;
  skapad: string;
  externKalla?: "underhallsplan" | "projekt" | "manuell";
  externId?: string;
  /**
   * Styrelsemöten m.m.: ansvarig inom styrelsen.
   * OVK, sotning, energi m.m.: senast anlitad entreprenör/leverantör.
   */
  leverantor?: string;
  /** Senaste besiktning (OVK m.m.) — ISO-datum. */
  besiktningSenastDatum?: string;
  /** Saker som ska hanteras, en rad per punkt. */
  attHantera?: string[];
  /** Dagordningar och liknande, sparade i webbläsaren. */
  bilagor?: ArshjulBilaga[];
  /** @deprecated Använd signering — behålls för äldre data. */
  bankid?: ArshjulBankidForberedelse;
  /** BankID kopplat till bilaga: läsning, undertecknare, signaturer, sparat dokument. */
  signering?: ArshjulDokumentSignering;
};

export type ArshjulBilaga = {
  id: string;
  filnamn: string;
  /** Data-URL för små filer. */
  dataUrl: string;
};

export type ArshjulBankidForberedelse = {
  namn: string;
  epost: string;
  /** Punkten är markerad så att den kan godkännas med BankID senare. */
  forberedd: boolean;
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
  /** Planerat år utan fast kalenderdatum — tidpunkt bestäms under året. */
  planerasUnderAr?: boolean;
  /** Ordningsnummer i en möteserie (Byggmöte 1, 2, …). */
  serieNummer?: number;
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

/** Hur långt fram årshjulet planerar (tidslinje, årsväljare, intervallhändelser). */
export const ARSHJUL_PLANERING_AR = 50;

/** Föreslaget intervall för sotning i BRF med eldstäder (kan vara 1–4 år beroende på eldstad). */
export const SOTNING_FORESLAGET_INTERVALL_AR = 3;

/** OVK-intervall enligt lag — bostäder 3 eller 6 år, verksamhet 3 år. */
export const OVK_INTERVALL_BOSTAD_AR = 6;
export const OVK_INTERVALL_VERKSAMHET_AR = 3;

export const kategoriEtiketter: Record<ArshjulKategori, string> = {
  styrelsemote: "Styrelsemöte",
  projekteringsmote: "Projekteringsmöte",
  upphandlingsmote: "Upphandlingsmöte",
  startmote: "Startmöte",
  byggmote: "Byggmöte",
  besiktningEntreprenad: "Slutbesiktning",
  garantbesiktning: "Garantibesiktning (2-årsbesiktning)",
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
  projekteringsmote: "bg-blue-100 text-blue-950 border-blue-200",
  upphandlingsmote: "bg-violet-100 text-violet-950 border-violet-200",
  startmote: "bg-sky-100 text-sky-950 border-sky-200",
  byggmote: "bg-cyan-100 text-cyan-950 border-cyan-200",
  besiktningEntreprenad: "bg-teal-100 text-teal-950 border-teal-200",
  garantbesiktning: "bg-orange-100 text-orange-950 border-orange-200",
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

/** Möteskedjan i projekt — en händelse per steg, med inre numrerad möteslista. */
export const MOTESKEDJA_KATEGORIER: ArshjulKategori[] = [
  "projekteringsmote",
  "upphandlingsmote",
  "startmote",
  "byggmote",
  "besiktningEntreprenad",
  "garantbesiktning",
];

/** Möteskedjan sist, i ordning från projektering till garantibesiktning. Styrelsemöten hålls ihop först. */
export function sorteraHandelser(lista: ArshjulHandelse[]): ArshjulHandelse[] {
  const styrelseOrdning = (h: ArshjulHandelse): number => {
    if (h.id === "std-styrelsemote") return 0;
    if (h.id === "std-konstituerande") return 1;
    if (h.id === "std-overlamning") return 2;
    if (h.kategori === "styrelsemote") return 3;
    return 10;
  };
  return lista
    .map((h, index) => ({ h, index }))
    .sort((a, b) => {
      const ai = MOTESKEDJA_KATEGORIER.indexOf(a.h.kategori);
      const bi = MOTESKEDJA_KATEGORIER.indexOf(b.h.kategori);
      const aSist = ai >= 0;
      const bSist = bi >= 0;
      if (aSist !== bSist) return aSist ? 1 : -1;
      if (aSist && bSist && ai !== bi) return ai - bi;
      const sa = styrelseOrdning(a.h);
      const sb = styrelseOrdning(b.h);
      if (sa !== sb) return sa - sb;
      return a.index - b.index;
    })
    .map((rad) => rad.h);
}

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
    t === "engang" ||
    t === "arlig" ||
    t === "manatlig" ||
    t === "intervall" ||
    t === "serie"
  );
}

function arGiltigSerieEnhet(e: string | undefined): e is SerieIntervallEnhet {
  return e === "vecka" || e === "manad";
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

  const serieDatum = Array.isArray(raw.serieDatum)
    ? raw.serieDatum.filter(
        (d) => typeof d === "string" && /^\d{4}-\d{2}-\d{2}/.test(d),
      ).map((d) => d.slice(0, 10))
    : undefined;

  const typ = arGiltigTyp(raw.typ) ? raw.typ : "engang";

  return {
    ...raw,
    titel: raw.titel?.trim() ?? "Utan titel",
    beskrivning: raw.beskrivning?.trim() ?? "",
    kategori: arGiltigKategori(raw.kategori) ? raw.kategori : "ovrigt",
    typ,
    paminnelseDagar,
    // Serier bockas per tillfälle via klarDatum — gammal serie-klar nollställs.
    klar: typ !== "engang" ? false : Boolean(raw.klar),
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
    serieAntal:
      raw.serieAntal != null && raw.serieAntal >= 0
        ? Math.min(200, Math.floor(raw.serieAntal))
        : typ === "serie"
          ? 1
          : undefined,
    serieIntervallVarje:
      raw.serieIntervallVarje != null && raw.serieIntervallVarje >= 1
        ? Math.min(52, Math.floor(raw.serieIntervallVarje))
        : typ === "serie"
          ? 1
          : undefined,
    serieIntervallEnhet: arGiltigSerieEnhet(raw.serieIntervallEnhet)
      ? raw.serieIntervallEnhet
      : typ === "serie"
        ? "vecka"
        : undefined,
    serieStartDatum:
      typeof raw.serieStartDatum === "string" &&
      /^\d{4}-\d{2}-\d{2}/.test(raw.serieStartDatum)
        ? raw.serieStartDatum.slice(0, 10)
        : undefined,
    serieDatum:
      serieDatum && serieDatum.length > 0 ? serieDatum : undefined,
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
    utanFastDatum: Boolean(raw.utanFastDatum),
    leverantor: raw.leverantor?.trim() || undefined,
    besiktningSenastDatum:
      typeof raw.besiktningSenastDatum === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(raw.besiktningSenastDatum.trim())
        ? raw.besiktningSenastDatum.trim()
        : undefined,
    attHantera: rensaAttHantera(raw.attHantera),
    bilagor: rensaBilagor(raw.bilagor),
    bankid: rensaBankid(raw.bankid),
    signering: rensaSignering(raw.signering),
  };
}

function rensaSignering(value: unknown): ArshjulDokumentSignering | undefined {
  return normaliseraArshjulSignering(value);
}

function rensaAttHantera(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const rader = value
    .filter((rad): rad is string => typeof rad === "string")
    .map((rad) => rad.trim())
    .filter(Boolean)
    .slice(0, 40);
  return rader.length > 0 ? rader : undefined;
}

function rensaBilagor(value: unknown): ArshjulBilaga[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const bilagor = value
    .map((rad) => {
      if (!rad || typeof rad !== "object") return null;
      const post = rad as Partial<ArshjulBilaga>;
      const dataUrl =
        typeof post.dataUrl === "string" && post.dataUrl.startsWith("data:")
          ? post.dataUrl.slice(0, 400_000)
          : "";
      const filnamn =
        typeof post.filnamn === "string" ? post.filnamn.trim().slice(0, 180) : "";
      const id = typeof post.id === "string" ? post.id.slice(0, 40) : "";
      if (!id || !filnamn || !dataUrl) return null;
      return { id, filnamn, dataUrl };
    })
    .filter((rad): rad is ArshjulBilaga => rad !== null)
    .slice(0, 6);
  return bilagor.length > 0 ? bilagor : undefined;
}

function rensaBankid(
  value: ArshjulBankidForberedelse | undefined,
): ArshjulBankidForberedelse | undefined {
  if (!value || typeof value !== "object") return undefined;
  const namn = typeof value.namn === "string" ? value.namn.trim().slice(0, 120) : "";
  const epost =
    typeof value.epost === "string" ? value.epost.trim().slice(0, 160) : "";
  if (!namn && !epost && !value.forberedd) return undefined;
  return { namn, epost, forberedd: Boolean(value.forberedd) };
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

export function arSerieHandelse(h: ArshjulHandelse): boolean {
  return h.typ === "serie";
}

function idagIso(): string {
  const d = new Date();
  return datumIso(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

function plusDagarIso(iso: string, dagar: number): string {
  const d = parseDatum(iso);
  if (!d) return iso;
  d.setDate(d.getDate() + dagar);
  return datumIso(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

function plusManaderIso(iso: string, manader: number): string {
  const d = parseDatum(iso);
  if (!d) return iso;
  d.setMonth(d.getMonth() + manader);
  return datumIso(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

function nastaVeckodagPaEllerEfter(iso: string, veckodag: Veckodag): string {
  const d = parseDatum(iso);
  if (!d) return iso;
  const nu = jsTillSvenskVeckodag(d.getDay());
  const delta = (veckodag - nu + 7) % 7;
  d.setDate(d.getDate() + delta);
  return datumIso(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

function serieSteg(
  iso: string,
  varje: number,
  enhet: SerieIntervallEnhet,
): string {
  return enhet === "vecka"
    ? plusDagarIso(iso, varje * 7)
    : plusManaderIso(iso, varje);
}

/** Nästa månads N:e veckodag, t.ex. andra tisdagen. */
function nastaManadsVeckodag(
  iso: string,
  veckodag: Veckodag,
  ordinal: number,
  varje: number,
): string {
  const d = parseDatum(iso);
  if (!d) return iso;
  let ar = d.getFullYear();
  let manad = d.getMonth() + 1 + varje;
  while (manad > 12) {
    manad -= 12;
    ar += 1;
  }
  return (
    datumForVeckodagIManad(ar, manad, veckodag, ordinal)?.datumIso ??
    plusManaderIso(iso, varje)
  );
}

function nastaSerieDatum(iso: string, h: ArshjulHandelse): string {
  const varje = Math.max(1, h.serieIntervallVarje ?? 1);
  const enhet: SerieIntervallEnhet =
    h.serieIntervallEnhet === "manad" ? "manad" : "vecka";
  if (enhet === "manad" && h.veckodag) {
    return nastaManadsVeckodag(iso, h.veckodag, h.veckodagOrdinal ?? 1, varje);
  }
  return serieSteg(iso, varje, enhet);
}

function forstaVeckodagManadPaEllerEfter(
  iso: string,
  veckodag: Veckodag,
  ordinal: number,
): string {
  const startAr = Number(iso.slice(0, 4));
  const startManad = Number(iso.slice(5, 7));
  for (let i = 0; i < 18; i++) {
    let manad = startManad + i;
    let ar = startAr;
    while (manad > 12) {
      manad -= 12;
      ar += 1;
    }
    const traff = datumForVeckodagIManad(ar, manad, veckodag, ordinal);
    if (traff && traff.datumIso >= iso) return traff.datumIso;
  }
  return iso;
}

function hoppaExkluderadeSerieDatum(iso: string, h: ArshjulHandelse): string {
  let current = iso;
  for (let i = 0; i < 48; i++) {
    const manad = Number(current.slice(5, 7));
    if (!manadArExkluderad(h, manad)) return current;
    current = nastaSerieDatum(current, h);
  }
  return current;
}

export function moteNamn(basTitel: string, nummer: number): string {
  const bas = basTitel.trim() || "Möte";
  return `${bas} ${nummer}`;
}

export function serieIntervallText(h: ArshjulHandelse): string {
  const varje = h.serieIntervallVarje ?? 1;
  if (h.serieIntervallEnhet === "manad" && varje === 12) return "Varje år";
  const enhet = h.serieIntervallEnhet === "manad" ? "månad" : "vecka";
  if (varje === 1) return `Varje ${enhet}`;
  return `Var ${varje}:e ${enhet}`;
}

/** Alla möten i en serie, numrerade i ordning. */
export function byggSerieTillfallen(h: ArshjulHandelse): ArshjulTillfalle[] {
  if (h.typ !== "serie") return [];
  const antal = Math.max(0, h.serieAntal ?? 0);
  if (antal === 0) return [];

  const enhet: SerieIntervallEnhet =
    h.serieIntervallEnhet === "manad" ? "manad" : "vecka";

  let datumLista: string[] = [];
  if (h.serieDatum && h.serieDatum.length > 0) {
    datumLista = h.serieDatum.map((d) => d.slice(0, 10));
    while (datumLista.length < antal) {
      const last = datumLista[datumLista.length - 1] ?? idagIso();
      datumLista.push(
        hoppaExkluderadeSerieDatum(nastaSerieDatum(last, h), h),
      );
    }
    datumLista = datumLista.slice(0, antal);
  } else {
    let cursor = (h.serieStartDatum ?? h.datum ?? idagIso()).slice(0, 10);
    if (h.veckodag && enhet === "manad") {
      cursor = forstaVeckodagManadPaEllerEfter(
        cursor,
        h.veckodag,
        h.veckodagOrdinal ?? 1,
      );
    } else if (h.veckodag) {
      cursor = nastaVeckodagPaEllerEfter(cursor, h.veckodag);
    }
    cursor = hoppaExkluderadeSerieDatum(cursor, h);
    for (let i = 0; i < antal; i++) {
      if (i > 0) {
        cursor = hoppaExkluderadeSerieDatum(nastaSerieDatum(cursor, h), h);
      }
      datumLista.push(cursor);
    }
  }

  return datumLista.map((iso, i) => {
    const nummer = i + 1;
    const d = parseDatum(iso);
    const ar = d ? d.getFullYear() : Number(iso.slice(0, 4));
    const manad = d ? d.getMonth() + 1 : Number(iso.slice(5, 7));
    const dag = d ? d.getDate() : Number(iso.slice(8, 10));
    return {
      handelseId: h.id,
      titel: moteNamn(h.titel, nummer),
      kategori: h.kategori,
      ar: Number.isFinite(ar) ? ar : new Date().getFullYear(),
      manad: Number.isFinite(manad) && manad >= 1 ? manad : 1,
      dag: Number.isFinite(dag) && dag >= 1 ? dag : 1,
      datumIso: iso,
      beskrivning: h.beskrivning,
      arManatlig: false,
      arKlar: tillfalleArKlar(h, iso),
      serieNummer: nummer,
    };
  });
}

export function nastaOppnaSerieTillfalle(
  h: ArshjulHandelse,
): ArshjulTillfalle | null {
  return byggSerieTillfallen(h).find((t) => !t.arKlar) ?? null;
}

export function senastKlaraSerieTillfalle(
  h: ArshjulHandelse,
): ArshjulTillfalle | null {
  const klara = byggSerieTillfallen(h).filter((t) => t.arKlar);
  return klara[klara.length - 1] ?? null;
}

export function utokaSerie(
  h: ArshjulHandelse,
  extra = 1,
): ArshjulHandelse {
  const tillagg = Math.max(1, Math.min(50, Math.floor(extra)));
  return normaliseraHandelse({
    ...h,
    typ: "serie",
    serieAntal: (h.serieAntal ?? byggSerieTillfallen(h).length) + tillagg,
    serieDatum: byggSerieTillfallen(
      normaliseraHandelse({
        ...h,
        typ: "serie",
        serieAntal: (h.serieAntal ?? 0) + tillagg,
      }),
    ).map((t) => t.datumIso),
  });
}

export function sattSerieMoteDatum(
  h: ArshjulHandelse,
  nummer: number,
  iso: string,
): ArshjulHandelse {
  const datumIso = iso.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datumIso)) return h;
  const datum = byggSerieTillfallen(h).map((t) => t.datumIso);
  const index = nummer - 1;
  if (index < 0 || index >= datum.length) return h;
  const nasta = [...datum];
  nasta[index] = datumIso;
  return normaliseraHandelse({
    ...h,
    typ: "serie",
    serieAntal: nasta.length,
    serieDatum: nasta,
    serieStartDatum: nasta[0] ?? h.serieStartDatum,
  });
}

export function taBortSerieMote(
  h: ArshjulHandelse,
  nummer: number,
): ArshjulHandelse {
  const kvar = byggSerieTillfallen(h).filter((t) => t.serieNummer !== nummer);
  const datum = kvar.map((t) => t.datumIso);
  const klarNycklar = new Set(datum);
  return normaliseraHandelse({
    ...h,
    typ: "serie",
    serieAntal: datum.length,
    serieDatum: datum,
    serieStartDatum: datum[0] ?? h.serieStartDatum,
    klarDatum: (h.klarDatum ?? []).filter((d) => klarNycklar.has(d.slice(0, 10))),
  });
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
  const planerasUnderAr = Boolean(h.utanFastDatum && h.typ === "intervall");
  const dagInfo = planerasUnderAr
    ? { dag: 1, datumIso: datumIso(ar, 1, 1) }
    : dagIManadForHandelse(h, ar, manad);
  if (!dagInfo) return;
  lista.push({
    handelseId: h.id,
    titel: h.titel,
    kategori: h.kategori,
    ar,
    manad: planerasUnderAr ? 1 : manad,
    dag: dagInfo.dag,
    datumIso: dagInfo.datumIso,
    beskrivning: h.beskrivning,
    arManatlig,
    arKlar: tillfalleArKlar(h, dagInfo.datumIso),
    planerasUnderAr,
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

    if (h.typ === "serie") {
      for (const t of byggSerieTillfallen(h)) {
        if (t.ar >= franAr && t.ar <= tillAr && !manadArExkluderad(h, t.manad)) {
          lista.push(t);
        }
      }
      continue;
    }

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
          const manad = h.utanFastDatum ? 1 : (h.manad ?? 6);
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
        rubrik: `${t.titel} — försenad`,
        text: t.planerasUnderAr
          ? h.beskrivning ||
            `Planerades under ${t.ar} — bocka av när utfört eller sätt nytt år.`
          : h.beskrivning || `Planerat ${formatDatumKort(t.datumIso)}.`,
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
            ? `${t.titel} — idag`
            : `${t.titel} — om ${dagarKvar} dagar`,
          text: t.planerasUnderAr
            ? h.beskrivning ||
              `Planerat under ${t.ar} — bestäm exakt tidpunkt (ev. upphandling) under året.`
            : h.beskrivning ||
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

function skapaSerieMall(opts: {
  id: string;
  titel: string;
  beskrivning: string;
  kategori: ArshjulKategori;
  antal: number;
  varje: number;
  enhet: SerieIntervallEnhet;
  startIso: string;
  veckodag?: Veckodag;
  veckodagOrdinal?: number;
  exkluderaManader?: number[];
  paminnelseDagar?: number[];
  attHantera?: string[];
}): ArshjulHandelse {
  const mall = normaliseraHandelse({
    id: opts.id,
    titel: opts.titel,
    beskrivning: opts.beskrivning,
    kategori: opts.kategori,
    typ: "serie",
    serieAntal: opts.antal,
    serieIntervallVarje: opts.varje,
    serieIntervallEnhet: opts.enhet,
    serieStartDatum: opts.startIso,
    veckodag: opts.veckodag,
    veckodagOrdinal: opts.veckodagOrdinal,
    exkluderaManader: opts.exkluderaManader,
    attHantera: opts.attHantera,
    paminnelseDagar: opts.paminnelseDagar ?? [14, 7, 1],
    klar: false,
    skapad: "standard",
    externKalla: "manuell",
  });
  return normaliseraHandelse({
    ...mall,
    serieDatum: byggSerieTillfallen(mall).map((t) => t.datumIso),
  });
}

/** Standardhändelser för årshjulet — läggs in som mall / kan fyllas på. */
export function skapaStandardHandelser(basAr = innevarandeAr()): ArshjulHandelse[] {
  const start = idagIso();
  const projekteringStart = plusDagarIso(start, 14);
  const upphandlingStart = plusDagarIso(start, 56);
  const startmoteStart = plusDagarIso(start, 112);
  const byggStart = plusDagarIso(start, 126);
  const besiktningStart = plusDagarIso(byggStart, 6 * 28 + 14);
  const garantStart = plusManaderIso(besiktningStart, 24);

  const idag = idagIso();
  const overlamningIAr = datumIso(basAr, 4, 8);
  const overlamning =
    overlamningIAr >= idag ? overlamningIAr : datumIso(basAr + 1, 4, 8);
  const konstituerandeIAr = datumIso(basAr, 4, 22);
  const konstituerande =
    konstituerandeIAr >= idag
      ? konstituerandeIAr
      : datumIso(basAr + 1, 4, 22);

  return [
    skapaSerieMall({
      id: "std-styrelsemote",
      titel: "Styrelsemöte",
      beskrivning:
        "Ordinarie styrelsemöte, andra tisdagen. Börjar med ett möte — lägg till fler efter hand. Uppehåll juli–augusti.",
      kategori: "styrelsemote",
      antal: 1,
      varje: 1,
      enhet: "manad",
      startIso: idag,
      veckodag: 2,
      veckodagOrdinal: 2,
      exkluderaManader: [...SOMMAR_EXKLUDERADE_MANADER],
      paminnelseDagar: [14, 7, 1],
    }),
    skapaSerieMall({
      id: "std-konstituerande",
      titel: "Konstituerande möte",
      beskrivning:
        "Styrelsemötet direkt efter årsstämman. Här bestäms rollerna. Protokollet anmäls till Bolagsverket. Den godkända årsredovisningen tas med till banken och skickas också in till Bolagsverket.",
      kategori: "styrelsemote",
      antal: 1,
      varje: 12,
      enhet: "manad",
      startIso: konstituerande,
      paminnelseDagar: [30, 14, 7],
      attHantera: [
        "Bestäm roller: ordförande, kassör, sekreterare och firmatecknare",
        "Anmäl styrelsen till Bolagsverket med protokoll från stämman och från det här mötet",
        "Skicka in den fastställda årsredovisningen och fastställelseintyg till Bolagsverket senast en månad efter stämman",
        "Ta med den godkända årsredovisningen till banken",
      ],
    }),
    skapaSerieMall({
      id: "std-overlamning",
      titel: "Överlämning till ny styrelse",
      beskrivning:
        "Här samlas allt nästa styrelse behöver: planerade händelser resten av året, pågående ärenden samt beslut och riktlinjer från avgående styrelse. Listan fylls på löpande — överlämningen genomförs vid styrelsebyte efter stämman.",
      kategori: "styrelsemote",
      antal: 1,
      varje: 12,
      enhet: "manad",
      startIso: overlamning,
      paminnelseDagar: [30, 14, 7],
      attHantera: [
        "Sammanställ planerade händelser resten av året (årshjul, stämma, OVK, projekt och möten)",
        "Beskriv beslut och riktlinjer från avgående styrelse (protokoll, budget, arvoden och rutiner)",
        "Lista pågående ärenden och öppna frågor som nästa styrelse ska driva vidare",
        "Översikt avtal, försäkring, bank, ekonomisk förvaltning och viktiga leverantörskontakter",
        "Pågående och planerade projekt samt var underlag finns (dokumentbank, projektmappar)",
        "Nycklar, behörigheter och inloggningar till system som styrelsen använder",
        "Genomför överlämningsmöte, gå igenom listan och protokollför",
        "Bekräfta att nästa styrelse har tillgång till årshjul, dokument och projekt",
      ],
    }),
    normaliseraHandelse({
      id: "std-ovk-bostad",
      titel: "OVK — bostäder",
      beskrivning:
        "Obligatorisk ventilationskontroll för bostäder. Intervall 3 eller 6 år beroende på ventilationssystem (S/F/FX ofta 6 år, FT/FTX 3 år). Ange senast anlitad entreprenör och planerat år — vid byte, använd Skapa upphandling för enkel anbudsrunda.",
      kategori: "ovk",
      typ: "intervall",
      startAr: basAr,
      intervallAr: OVK_INTERVALL_BOSTAD_AR,
      utanFastDatum: true,
      paminnelseDagar: [365, 180, 90, 30],
      klar: false,
      skapad: "standard",
      externKalla: "manuell",
    }),
    normaliseraHandelse({
      id: "std-ovk-butik",
      titel: "OVK — verksamhet",
      beskrivning:
        "OVK för verksamhetslokaler och butiker — vart 3:e år. Ange senast anlitad entreprenör och planerat år — vid byte, använd Skapa upphandling för enkel anbudsrunda.",
      kategori: "ovk",
      typ: "intervall",
      startAr: basAr,
      intervallAr: OVK_INTERVALL_VERKSAMHET_AR,
      utanFastDatum: true,
      paminnelseDagar: [180, 90, 30],
      klar: false,
      skapad: "standard",
      externKalla: "manuell",
    }),
    normaliseraHandelse({
      id: "std-sotning",
      titel: "Sotning",
      beskrivning: `Föreslaget intervall: vart ${SOTNING_FORESLAGET_INTERVALL_AR}:e år (vanligt i BRF med eldstäder). Kan vara 1–4 år beroende på eldstad och bränsle — stäm av med skorstensfejarmästaren. Ange senast anlitad sotare. Upphandling behövs sällan; vid egen entreprenör utanför brandförsvarets avtal — kontakta Stockholms brandförsvar.`,
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
      beskrivning:
        "Lagkrav — energideklaration vart 10:e år. Ange vem som utförde senast. Skapa upphandling när ni ska byta — senaste handlingar och anbudsformulär räcker normalt för att mejla ut och ta in anbud.",
      kategori: "energideklaration",
      typ: "intervall",
      startAr: basAr,
      intervallAr: 10,
      utanFastDatum: true,
      paminnelseDagar: [365, 180, 90],
      klar: false,
      skapad: "standard",
      externKalla: "manuell",
    }),
    normaliseraHandelse({
      id: "std-radon",
      titel: "Radonmätning",
      beskrivning:
        "Rekommenderas / krav i många fall vart 10:e år (mätperiod oftast under eldningssäsong). Ange senast anlitad utförare — Skapa upphandling vid byte av entreprenör.",
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
      beskrivning:
        "Förberedelserna börjar i januari: datum för stämman, årsredovisning, kallelse och underlag till medlemmarna. Stämman ska normalt hållas senast 31 maj — kallelsefrister i veckor framgår av stadgarna.",
      kategori: "stamma",
      typ: "arlig",
      manad: 4,
      dag: 15,
      startAr: basAr,
      paminnelseDagar: [90, 60, 30, 14],
      attHantera: [
        "Besluta datum för årsstämman (påbörja i januari; stämman ska normalt hållas senast 31 maj)",
        "Följ upp när ekonomisk förvaltare meddelar att årsredovisningen är klar",
        "Granska årsredovisningen i styrelsen innan den skickas till revisorn",
        "Skicka kallelse till medlemmarna med årsredovisning, budget och eventuella motioner (tider i veckor enligt stadgarna)",
        "Skicka valberedningens förslag tillsammans med kallelsen",
        "Om stämman inte kan hållas på planerat datum — besluta nytt datum och kalla om enligt stadgarna",
        "Genomför stämman och protokollför",
      ],
      klar: false,
      skapad: "standard",
      externKalla: "manuell",
    }),
    normaliseraHandelse({
      id: "std-bokslut",
      titel: "Bokslut & budget",
      beskrivning:
        "Bokslut och budget inför nästa verksamhetsår. Budgeten ligger till grund för styrelsens beslut och kan innebära justering av avgiften.",
      kategori: "ekonomi",
      typ: "arlig",
      manad: 11,
      dag: 30,
      startAr: basAr,
      paminnelseDagar: [60, 30, 14],
      attHantera: [
        "Slutför bokslut enligt föreningens rutiner (ofta tillsammans med ekonomisk förvaltare eller revisor)",
        "Ta fram budget för kommande år — vanligtvis ansvarar ordförande och kassör",
        "Sammanställ underlag: resultat, kassaflöde, planerat underhåll och investeringar",
        "Besluta om budgeten på styrelsemöte och protokollför beslutet",
        "Beskriv i budgeten om avgiften ska höjas — som riktlinje brukar KPI (konsumentprisindex) användas",
      ],
      klar: false,
      skapad: "standard",
      externKalla: "manuell",
    }),
    skapaSerieMall({
      id: "std-projektering",
      titel: "Projekteringsmöte",
      beskrivning:
        "Första steget i möteskedjan. Börjar med ett möte — lägg till fler om projekteringen behöver det.",
      kategori: "projekteringsmote",
      antal: 1,
      varje: 2,
      enhet: "vecka",
      startIso: projekteringStart,
      veckodag: 2,
    }),
    skapaSerieMall({
      id: "std-upphandling",
      titel: "Upphandlingsmöte",
      beskrivning:
        "Upphandling efter projektering. Börjar med ett möte — lägg till fler om anbudsrundan behöver det.",
      kategori: "upphandlingsmote",
      antal: 1,
      varje: 2,
      enhet: "vecka",
      startIso: upphandlingStart,
      veckodag: 2,
    }),
    skapaSerieMall({
      id: "std-startmote",
      titel: "Startmöte",
      beskrivning:
        "Startmöte innan produktion. Lägg till fler i samma händelse om det behövs.",
      kategori: "startmote",
      antal: 1,
      varje: 2,
      enhet: "vecka",
      startIso: startmoteStart,
      veckodag: 4,
    }),
    skapaSerieMall({
      id: "std-byggmote",
      titel: "Byggmöte",
      beskrivning:
        "Byggmöte under entreprenaden. Börjar med ett möte — lägg till fler när byggtiden behöver det.",
      kategori: "byggmote",
      antal: 1,
      varje: 4,
      enhet: "vecka",
      startIso: byggStart,
      veckodag: 4,
      paminnelseDagar: [7, 1],
    }),
    skapaSerieMall({
      id: "std-besiktning-entreprenad",
      titel: "Slutbesiktning",
      beskrivning:
        "Ett möte. Lägg till ett till bara om det behövs en delbesiktning, och redigera datumet.",
      kategori: "besiktningEntreprenad",
      antal: 1,
      varje: 2,
      enhet: "vecka",
      startIso: besiktningStart,
      veckodag: 2,
      paminnelseDagar: [30, 14, 7],
    }),
    skapaSerieMall({
      id: "std-garant",
      titel: "Garantibesiktning (2-årsbesiktning)",
      beskrivning:
        "Ett möte, två år efter slutbesiktningen. Justera datumet. Lägg till ett möte bara om det behövs en extra besiktning, och redigera det datumet.",
      kategori: "garantbesiktning",
      antal: 1,
      varje: 24,
      enhet: "manad",
      startIso: garantStart,
      paminnelseDagar: [180, 90, 30, 14],
    }),
  ];
}

/** Tidigare standardmall öppnade flera möten. De kortas till ett om inget är avklarat. */
const GAMMAL_STANDARD_SERIE_ANTAL: Record<string, number> = {
  "std-projektering": 2,
  "std-upphandling": 2,
  "std-byggmote": 6,
};

function ettMoteOmGammalStandard(h: ArshjulHandelse): ArshjulHandelse {
  const gammaltAntal = GAMMAL_STANDARD_SERIE_ANTAL[h.id];
  if (gammaltAntal == null || h.typ !== "serie") return h;
  if ((h.klarDatum?.length ?? 0) > 0) return h;
  if (h.serieAntal !== gammaltAntal) return h;
  const forsta = h.serieDatum?.[0] ?? h.serieStartDatum;
  return normaliseraHandelse({
    ...h,
    serieAntal: 1,
    serieDatum: forsta ? [forsta.slice(0, 10)] : undefined,
  });
}

/**
 * Flyttar gammal månadsvis byggmötesmall och gammal garant-etikett
 * till möteserie, utan att duplicera händelser.
 */
export function migreraArshjulHandelser(
  lista: ArshjulHandelse[],
): ArshjulHandelse[] {
  const mallar = new Map(skapaStandardHandelser().map((h) => [h.id, h]));
  return lista.map((h) => {
    const mall = mallar.get(h.id);
    if (h.id === "std-styrelsemote" && h.typ === "manatlig" && mall) {
      if ((h.klarDatum?.length ?? 0) > 0) return h;
      return normaliseraHandelse({
        ...mall,
        id: h.id,
        paminnelseDagar: h.paminnelseDagar,
      });
    }
    if (h.id === "std-byggmote" && h.typ === "manatlig" && mall) {
      return normaliseraHandelse({
        ...mall,
        id: h.id,
        klarDatum: h.klarDatum,
        paminnelseDagar: h.paminnelseDagar,
      });
    }
    if (h.id === "std-garant" && h.typ === "engang" && mall) {
      return normaliseraHandelse({
        ...mall,
        id: h.id,
        klarDatum: h.klarDatum,
        serieStartDatum: h.datum ?? mall.serieStartDatum,
        paminnelseDagar: h.paminnelseDagar,
      });
    }
    if (h.id === "std-bokslut" && mall) {
      const gammalBeskrivning =
        h.beskrivning === "Ekonomisk plan och budget inför nästa år.";
      return normaliseraHandelse({
        ...h,
        beskrivning: gammalBeskrivning ? mall.beskrivning : h.beskrivning,
        attHantera:
          (h.attHantera?.length ?? 0) > 0 ? h.attHantera : mall.attHantera,
      });
    }
    if (h.id === "std-stamma" && mall) {
      const gammalBeskrivning = h.beskrivning === "Kallelse, underlag och protokoll.";
      return normaliseraHandelse({
        ...h,
        beskrivning: gammalBeskrivning ? mall.beskrivning : h.beskrivning,
        attHantera:
          (h.attHantera?.length ?? 0) > 0 ? h.attHantera : mall.attHantera,
      });
    }
    if (
      (h.id === "std-konstituerande" || h.id === "std-overlamning") &&
      mall
    ) {
      const gammalKonstituerande =
        h.beskrivning.startsWith("Första styrelsemötet efter årsstämman");
      const gammalOverlamning =
        h.id === "std-overlamning" &&
        (h.beskrivning.startsWith("Avgående styrelse lämnar över") ||
          h.beskrivning.startsWith("Själva överlämningen."));
      return normaliseraHandelse({
        ...h,
        beskrivning:
          gammalKonstituerande || gammalOverlamning
            ? mall.beskrivning
            : h.beskrivning,
        attHantera:
          (h.attHantera?.length ?? 0) > 0 ? h.attHantera : mall.attHantera,
      });
    }
    if (
      h.id === "std-garant" &&
      h.typ === "serie" &&
      h.serieIntervallEnhet === "manad" &&
      h.serieIntervallVarje === 1 &&
      (h.klarDatum?.length ?? 0) === 0 &&
      mall
    ) {
      const forsta = h.serieDatum?.[0] ?? h.serieStartDatum;
      return normaliseraHandelse({
        ...h,
        beskrivning: mall.beskrivning,
        serieAntal: 1,
        serieIntervallVarje: mall.serieIntervallVarje,
        serieIntervallEnhet: mall.serieIntervallEnhet,
        serieDatum: forsta ? [forsta.slice(0, 10)] : h.serieDatum,
      });
    }
    let next = h;
    if (h.titel === "Garantbesiktning") {
      next = normaliseraHandelse({
        ...h,
        titel: "Garantibesiktning (2-årsbesiktning)",
      });
    } else if (
      h.kategori === "besiktningEntreprenad" &&
      h.titel === "Besiktning entreprenad"
    ) {
      next = normaliseraHandelse({ ...h, titel: "Slutbesiktning" });
    }
    return ettMoteOmGammalStandard(next);
  });
}

/** Lägger till saknade standardhändelser (matchar på id). */
export function fyllPaStandardHandelser(
  befintliga: ArshjulHandelse[],
): ArshjulHandelse[] {
  const migrerade = migreraArshjulHandelser(befintliga);
  const ids = new Set(migrerade.map((h) => h.id));
  const tillagg = skapaStandardHandelser().filter((h) => !ids.has(h.id));
  return sorteraHandelser([...migrerade, ...tillagg]);
}

/** Förval när styrelsen väljer en möteskedje-kategori i formuläret. */
export function defaultSerieFalt(
  kategori: ArshjulKategori,
): Partial<ArshjulHandelse> {
  const mall = skapaStandardHandelser().find((h) => h.kategori === kategori);
  if (mall?.typ === "serie") {
    return {
      typ: "serie",
      titel: mall.titel,
      beskrivning: mall.beskrivning,
      serieAntal: mall.serieAntal,
      serieIntervallVarje: mall.serieIntervallVarje,
      serieIntervallEnhet: mall.serieIntervallEnhet,
      serieStartDatum: mall.serieStartDatum,
      veckodag: mall.veckodag,
      paminnelseDagar: mall.paminnelseDagar,
    };
  }
  return {
    typ: "serie",
    serieAntal: 1,
    serieIntervallVarje: 2,
    serieIntervallEnhet: "vecka",
    serieStartDatum: idagIso(),
  };
}
