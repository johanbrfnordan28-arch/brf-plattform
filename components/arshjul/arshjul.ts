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

/** Intervall för händelser i årshjul och kalender. */
export type ArshjulIntervall =
  | "engang"
  | "veckovis"
  | "manadsvis"
  | "kvartalsvis"
  | "arlig"
  | "vart_3_ar"
  | "vart_6_ar"
  | "vart_10_ar";

/** Äldre typ — migreras till intervall. */
export type ArshjulHandelseTyp = "engang" | "arlig" | "intervall";

export const intervallEtiketter: Record<ArshjulIntervall, string> = {
  engang: "Engång",
  veckovis: "Veckovis",
  manadsvis: "Månadsvis",
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
  "kvartalsvis",
  "arlig",
  "vart_3_ar",
  "vart_6_ar",
  "vart_10_ar",
];

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
  /** Synkas från intervall (3/6/10) för kompatibilitet. */
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
  };
}

function parseDatum(iso: string): Date | null {
  const d = new Date(iso + "T12:00:00");
  return Number.isNaN(d.getTime()) ? null : d;
}

function datumIso(ar: number, manad: number, dag: number): string {
  const m = String(manad).padStart(2, "0");
  const d = String(Math.min(Math.max(dag, 1), 28)).padStart(2, "0");
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
  lista.push({
    handelseId: h.id,
    titel: h.titel,
    kategori: h.kategori,
    ar,
    manad,
    dag,
    datumIso: datumIso(ar, manad, dag),
    beskrivning: h.beskrivning,
    arManatlig,
  });
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
  switch (h.intervall) {
    case "engang":
      return h.datum ? formatDatumKort(h.datum) : "Engång";
    case "veckovis":
      return h.datum
        ? `Veckovis från ${formatDatumKort(h.datum)}`
        : "Veckovis";
    case "manadsvis":
      return `Månadsvis (dag ${h.dag ?? 1})`;
    case "kvartalsvis":
      return `Kvartalsvis från ${manadsnamn[(h.manad ?? 1) - 1]}`;
    case "arlig":
      return `Varje år i ${manadsnamn[(h.manad ?? 1) - 1]}`;
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

  for (const h of handelser) {
    if (h.klar && h.intervall === "engang") continue;

    if (h.intervall === "engang" && h.datum) {
      const d = parseDatum(h.datum);
      if (!d) continue;
      const ar = d.getFullYear();
      if (ar >= franAr && ar <= tillAr) {
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
      const slut = new Date(tillAr, 11, 31, 12, 0, 0);
      let cursor = new Date(start);
      // Hoppa fram till fönstret om start ligger före
      while (cursor.getFullYear() < franAr) {
        cursor.setDate(cursor.getDate() + 7);
      }
      while (cursor <= slut && cursor.getFullYear() <= tillAr) {
        if (cursor.getFullYear() >= franAr) {
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
      for (let ar = franAr; ar <= tillAr; ar++) {
        for (let manad = 1; manad <= 12; manad++) {
          pushTillfalle(lista, h, ar, manad, dag, true);
        }
      }
      continue;
    }

    if (h.intervall === "kvartalsvis") {
      const startManad = h.manad ?? 1;
      const dag = h.dag && h.dag >= 1 && h.dag <= 28 ? h.dag : 1;
      const sedda = new Set<string>();
      for (let ar = franAr; ar <= tillAr; ar++) {
        for (let q = 0; q < 4; q++) {
          let manad = startManad + q * 3;
          let tillfalleAr = ar;
          while (manad > 12) {
            manad -= 12;
            tillfalleAr += 1;
          }
          if (tillfalleAr < franAr || tillfalleAr > tillAr) continue;
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
      for (let ar = franAr; ar <= tillAr; ar++) {
        pushTillfalle(lista, h, ar, h.manad, dag, true);
      }
      continue;
    }

    if (arFlerarsIntervall(h.intervall)) {
      const steg = intervallTillAr(h.intervall) ?? 1;
      let ar = h.startAr ?? franAr;
      if (h.senastKlarAr != null) {
        ar = h.senastKlarAr + steg;
      }
      while (ar <= tillAr) {
        if (ar >= franAr) {
          const manad = h.manad ?? 6;
          const dag = h.dag ?? 15;
          pushTillfalle(lista, h, ar, manad, dag, false);
        }
        ar += steg;
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
