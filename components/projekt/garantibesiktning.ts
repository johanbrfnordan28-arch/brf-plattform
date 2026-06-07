/** Garantibesiktning / 2-årsbesiktning — ska utföras inom garantitid efter slutbesiktning. */

export const GARANTI_BESIKTNING_STANDARD_AR = 2;

/** Månader före senaste datum — påminn om bokning och entreprenör i god tid. */
export const GARANTI_PÅMINNELSE_MÅNADER = [18, 12, 6, 3, 1] as const;

export type GarantibesiktningStatus = {
  /** Datum för genomförd slutbesiktning (YYYY-MM-DD). */
  slutbesiktningDatum: string | null;
  garantiAr: number;
  utförd: boolean;
  utfördDatum: string | null;
  /** Förberedelse — boka besiktningsman. */
  besiktningsmanBokad: boolean;
  /** Förberedelse — kalla entreprenör. */
  entreprenorKallad: boolean;
  /** Avfärdade påminnelse-id (t.ex. "påminn-12"). */
  avfärdadePåminnelser: string[];
  anteckning: string;
};

export type PåminnelseNivå = "info" | "varning" | "kritisk" | "försenad";

export type GarantibesiktningPåminnelse = {
  id: string;
  månaderFöre: number;
  rubrik: string;
  text: string;
  nivå: PåminnelseNivå;
};

export function skapaTomGarantibesiktning(): GarantibesiktningStatus {
  return {
    slutbesiktningDatum: null,
    garantiAr: GARANTI_BESIKTNING_STANDARD_AR,
    utförd: false,
    utfördDatum: null,
    besiktningsmanBokad: false,
    entreprenorKallad: false,
    avfärdadePåminnelser: [],
    anteckning: "",
  };
}

export function normaliseraGarantibesiktning(
  raw?: Partial<GarantibesiktningStatus> | null,
): GarantibesiktningStatus {
  const tom = skapaTomGarantibesiktning();
  if (!raw) return tom;
  const garantiAr =
    typeof raw.garantiAr === "number" && raw.garantiAr >= 1 && raw.garantiAr <= 5
      ? raw.garantiAr
      : GARANTI_BESIKTNING_STANDARD_AR;
  return {
    slutbesiktningDatum:
      typeof raw.slutbesiktningDatum === "string" && raw.slutbesiktningDatum.trim()
        ? raw.slutbesiktningDatum.trim()
        : null,
    garantiAr,
    utförd: Boolean(raw.utförd),
    utfördDatum:
      typeof raw.utfördDatum === "string" && raw.utfördDatum.trim()
        ? raw.utfördDatum.trim()
        : null,
    besiktningsmanBokad: Boolean(raw.besiktningsmanBokad),
    entreprenorKallad: Boolean(raw.entreprenorKallad),
    avfärdadePåminnelser: Array.isArray(raw.avfärdadePåminnelser)
      ? raw.avfärdadePåminnelser.filter((id) => typeof id === "string")
      : [],
    anteckning: typeof raw.anteckning === "string" ? raw.anteckning : "",
  };
}

function parseDatum(datum: string): Date | null {
  const d = new Date(datum + "T12:00:00");
  return Number.isNaN(d.getTime()) ? null : d;
}

export function idagIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function beraknaSenastGarantibesiktning(
  slutbesiktningDatum: string,
  garantiAr: number,
): string | null {
  const start = parseDatum(slutbesiktningDatum);
  if (!start) return null;
  const slut = new Date(start);
  slut.setFullYear(slut.getFullYear() + garantiAr);
  return slut.toISOString().slice(0, 10);
}

export function dagarMellan(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export function månaderKvarTill(datumIso: string): number | null {
  const mål = parseDatum(datumIso);
  if (!mål) return null;
  const idag = new Date();
  idag.setHours(12, 0, 0, 0);
  const dagar = dagarMellan(idag, mål);
  return Math.round(dagar / 30.44);
}

const PÅMINNELSE_TEXTER: Record<
  (typeof GARANTI_PÅMINNELSE_MÅNADER)[number],
  { rubrik: string; text: string; nivå: PåminnelseNivå }
> = {
  18: {
    rubrik: "18 månader kvar — börja planera",
    text: "Garantibesiktningen ska vara utförd inom 2 år. Börja undersöka besiktningsman och lediga tider — det kan ta lång tid att få bokning.",
    nivå: "info",
  },
  12: {
    rubrik: "12 månader kvar — boka besiktningsman",
    text: "Boka besiktningsman i god tid. Kontrollera att entreprenören är informerad om kommande garantibesiktning.",
    nivå: "info",
  },
  6: {
    rubrik: "6 månader kvar",
    text: "Säkerställ att besiktningsman är bokad och att entreprenören är kallad till garantibesiktningen.",
    nivå: "varning",
  },
  3: {
    rubrik: "3 månader kvar — deadline närmar sig",
    text: "Garantibesiktningen måste vara utförd inom garantitiden. Bekräfta datum med besiktningsman och entreprenör.",
    nivå: "varning",
  },
  1: {
    rubrik: "1 månad kvar",
    text: "Sista chansen att boka och genomföra garantibesiktningen inom 2-årsfristen.",
    nivå: "kritisk",
  },
};

function påminnelseId(månader: number): string {
  return `påminn-${månader}`;
}

/** Vilka påminnelser är aktuella just nu (ej avfärdade, ej utförd). */
export function hamtaAktivaGarantiPåminnelser(
  status: GarantibesiktningStatus,
): GarantibesiktningPåminnelse[] {
  if (status.utförd || !status.slutbesiktningDatum) return [];

  const senast = beraknaSenastGarantibesiktning(
    status.slutbesiktningDatum,
    status.garantiAr,
  );
  if (!senast) return [];

  const månader = månaderKvarTill(senast);
  if (månader === null) return [];

  const avfärdade = new Set(status.avfärdadePåminnelser);
  const poster: GarantibesiktningPåminnelse[] = [];

  if (månader < 0) {
    if (!avfärdade.has("påminn-försenad")) {
      poster.push({
        id: "påminn-försenad",
        månaderFöre: 0,
        rubrik: "Försenad — garantibesiktning ej utförd i tid",
        text: "2-årsfristen kan vara passerad. Kontakta besiktningsman och entreprenör omedelbart och dokumentera åtgärder.",
        nivå: "försenad",
      });
    }
    return poster;
  }

  for (const gräns of GARANTI_PÅMINNELSE_MÅNADER) {
    if (månader <= gräns) {
      const id = påminnelseId(gräns);
      if (!avfärdade.has(id)) {
        const meta = PÅMINNELSE_TEXTER[gräns];
        poster.push({
          id,
          månaderFöre: gräns,
          ...meta,
        });
      }
    }
  }

  return poster.sort((a, b) => a.månaderFöre - b.månaderFöre);
}

/** Högsta prioritet — visas i projektkort. */
export function hamtaPrimarGarantiPåminnelse(
  status: GarantibesiktningStatus,
): GarantibesiktningPåminnelse | null {
  const aktiva = hamtaAktivaGarantiPåminnelser(status);
  if (aktiva.length === 0) return null;
  const prioritet: Record<PåminnelseNivå, number> = {
    försenad: 4,
    kritisk: 3,
    varning: 2,
    info: 1,
  };
  return [...aktiva].sort(
    (a, b) => prioritet[b.nivå] - prioritet[a.nivå] || a.månaderFöre - b.månaderFöre,
  )[0];
}

export function formatSvensktDatum(datumIso: string): string {
  const d = parseDatum(datumIso);
  if (!d) return datumIso;
  return d.toLocaleDateString("sv-SE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function garantiBehöverUppmärksamhet(status: GarantibesiktningStatus): boolean {
  if (status.utförd) return false;
  if (!status.slutbesiktningDatum) return false;
  return hamtaPrimarGarantiPåminnelse(status) !== null;
}
