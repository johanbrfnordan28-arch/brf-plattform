import { foreningStorageKey } from "@/lib/foreningStorage";

export type ArshjulKategori =
  | "besiktning"
  | "ekonomi"
  | "stamma"
  | "styrelsemote"
  | "byggmote"
  | "deklaration"
  | "underhall"
  | "juridik"
  | "medlemmar"
  | "ovrigt";

export type ArshjulHandelseTyp = "engang" | "arlig" | "intervall";

/** Föreslagna underkategorier som visas som snabbval i formuläret. */
export const foreslagnUnderkategorier: string[] = [
  "Projekteringsmöte",
  "OVK Besiktning",
  "Statusbesiktning",
  "Slutbesiktning",
  "Garantibesiktning",
  "Energideklaration",
  "Fastighetsdeklaration",
  "Radonmätning",
  "Upphandling",
];

export type ArshjulHandelse = {
  id: string;
  titel: string;
  beskrivning: string;
  kategori: ArshjulKategori;
  /** Valfri underkategori — t.ex. "OVK Besiktning", "Styrelsemöte". */
  underkategori?: string;
  typ: ArshjulHandelseTyp;
  /** Engång — YYYY-MM-DD. */
  datum?: string;
  /** Årlig — månad 1–12, valfri dag. */
  manad?: number;
  dag?: number;
  /** Intervall — första planerade år och år mellan tillfällen (t.ex. OVK vart 6:e år). */
  startAr?: number;
  intervallAr?: number;
  /** Senast markerad som genomförd (kalenderår) — nästa tillfälle räknas därifrån. */
  senastKlarAr?: number;
  /** Dagar före händelsen att visa påminnelse (t.ex. 365, 90, 30). */
  paminnelseDagar: number[];
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
  stamma: "Stämma",
  styrelsemote: "Styrelsemöte",
  byggmote: "Byggmöte",
  deklaration: "Deklaration",
  underhall: "Underhåll",
  juridik: "Juridik",
  medlemmar: "Medlemmar",
  ovrigt: "Övrigt",
};

export const kategoriFarger: Record<ArshjulKategori, string> = {
  besiktning: "bg-sky-100 text-sky-950 border-sky-200",
  ekonomi: "bg-emerald-100 text-emerald-950 border-emerald-200",
  stamma: "bg-violet-100 text-violet-950 border-violet-200",
  styrelsemote: "bg-indigo-100 text-indigo-950 border-indigo-200",
  byggmote: "bg-orange-100 text-orange-950 border-orange-200",
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

export function skapaHandelseId(): string {
  return `arshjul-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function normaliseraHandelse(raw: ArshjulHandelse): ArshjulHandelse {
  const paminnelseDagar =
    Array.isArray(raw.paminnelseDagar) && raw.paminnelseDagar.length > 0
      ? [...new Set(raw.paminnelseDagar.filter((d) => d > 0))].sort((a, b) => b - a)
      : [...STANDARD_PAMINNELSE_DAGAR];

  return {
    ...raw,
    titel: raw.titel?.trim() ?? "Utan titel",
    beskrivning: raw.beskrivning?.trim() ?? "",
    kategori: (raw.kategori && raw.kategori in kategoriEtiketter)
      ? raw.kategori
      : "ovrigt",
    underkategori: raw.underkategori?.trim() || undefined,
    typ: raw.typ ?? "engang",
    paminnelseDagar,
    klar: Boolean(raw.klar),
    manad:
      raw.manad != null && raw.manad >= 1 && raw.manad <= 12
        ? raw.manad
        : undefined,
    intervallAr:
      raw.intervallAr != null && raw.intervallAr >= 1 ? raw.intervallAr : undefined,
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
  return Math.round((to.getTime() - from.getTime()) / (86400000));
}

export function nastaIntervallAr(h: ArshjulHandelse): number | null {
  if (h.typ !== "intervall" || !h.intervallAr || h.intervallAr < 1) return null;
  const bas = h.senastKlarAr ?? h.startAr;
  if (bas == null) return null;
  if (!h.klar && h.startAr != null) return h.startAr;
  return bas + h.intervallAr;
}

/** Alla tillfällen för ett år (och valfritt år-intervall för tidslinje). */
export function expanderaTillfallen(
  handelser: ArshjulHandelse[],
  franAr: number,
  tillAr: number,
): ArshjulTillfalle[] {
  const lista: ArshjulTillfalle[] = [];

  for (const h of handelser) {
    if (h.klar && h.typ === "engang") continue;

    if (h.typ === "engang" && h.datum) {
      const d = parseDatum(h.datum);
      if (!d) continue;
      const ar = d.getFullYear();
      if (ar >= franAr && ar <= tillAr) {
        lista.push({
          handelseId: h.id,
          titel: h.titel,
          kategori: h.kategori,
          ar,
          manad: d.getMonth() + 1,
          dag: d.getDate(),
          datumIso: h.datum,
          beskrivning: h.beskrivning,
          arManatlig: false,
        });
      }
      continue;
    }

    if (h.typ === "arlig" && h.manad) {
      const dag = h.dag && h.dag >= 1 && h.dag <= 28 ? h.dag : 1;
      for (let ar = franAr; ar <= tillAr; ar++) {
        lista.push({
          handelseId: h.id,
          titel: h.titel,
          kategori: h.kategori,
          ar,
          manad: h.manad!,
          dag,
          datumIso: datumIso(ar, h.manad!, dag),
          beskrivning: h.beskrivning,
          arManatlig: true,
        });
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
          const dag = h.dag ?? 15;
          lista.push({
            handelseId: h.id,
            titel: h.titel,
            kategori: h.kategori,
            ar,
            manad,
            dag,
            datumIso: datumIso(ar, manad, dag),
            beskrivning: h.beskrivning,
            arManatlig: false,
          });
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
    if (!h || h.klar) continue;

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
