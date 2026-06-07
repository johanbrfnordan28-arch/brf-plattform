export type TidsplanKalla = "manuell" | "protokoll" | "bibliotek" | "entreprenor";

export type TidsplanMilstolpe = {
  id: string;
  titel: string;
  planeratDatum: string | null;
  /** Entreprenörens föreslagna datum (ifylls i demo av styrelse eller via inbjudan). */
  entreprenorDatum: string | null;
  faktisktDatum: string | null;
  ansvarig: string;
  kalla: TidsplanKalla;
  protokollReferens: string;
  anteckning: string;
  klar: boolean;
};

export type ProjektTidsplan = {
  /** Datum som används när mall appliceras med offset. */
  projektStartDatum: string | null;
  godkandAvStyrelsen: boolean;
  godkandDatum: string | null;
  /** Demo: entreprenör ombeds fylla i planerade datum. */
  entreprenorInbjuden: boolean;
  entreprenorSenastUppdaterad: string | null;
  milstolpar: TidsplanMilstolpe[];
};

export function skapaMilstolpeId(): string {
  return `milstolpe-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function skapaTomProjektTidsplan(): ProjektTidsplan {
  return {
    projektStartDatum: null,
    godkandAvStyrelsen: false,
    godkandDatum: null,
    entreprenorInbjuden: false,
    entreprenorSenastUppdaterad: null,
    milstolpar: [],
  };
}

export function normaliseraMilstolpe(raw: TidsplanMilstolpe): TidsplanMilstolpe {
  return {
    id: raw.id || skapaMilstolpeId(),
    titel: raw.titel?.trim() ?? "",
    planeratDatum:
      typeof raw.planeratDatum === "string" && raw.planeratDatum.trim()
        ? raw.planeratDatum.trim()
        : null,
    entreprenorDatum:
      typeof raw.entreprenorDatum === "string" && raw.entreprenorDatum.trim()
        ? raw.entreprenorDatum.trim()
        : null,
    faktisktDatum:
      typeof raw.faktisktDatum === "string" && raw.faktisktDatum.trim()
        ? raw.faktisktDatum.trim()
        : null,
    ansvarig: raw.ansvarig?.trim() ?? "",
    kalla:
      raw.kalla === "protokoll" ||
      raw.kalla === "bibliotek" ||
      raw.kalla === "entreprenor"
        ? raw.kalla
        : "manuell",
    protokollReferens: raw.protokollReferens?.trim() ?? "",
    anteckning: raw.anteckning?.trim() ?? "",
    klar: Boolean(raw.klar),
  };
}

export function normaliseraProjektTidsplan(
  raw?: Partial<ProjektTidsplan> | null,
): ProjektTidsplan {
  const tom = skapaTomProjektTidsplan();
  if (!raw) return tom;
  return {
    projektStartDatum:
      typeof raw.projektStartDatum === "string" && raw.projektStartDatum.trim()
        ? raw.projektStartDatum.trim()
        : null,
    godkandAvStyrelsen: Boolean(raw.godkandAvStyrelsen),
    godkandDatum:
      typeof raw.godkandDatum === "string" && raw.godkandDatum.trim()
        ? raw.godkandDatum.trim()
        : null,
    entreprenorInbjuden: Boolean(raw.entreprenorInbjuden),
    entreprenorSenastUppdaterad:
      typeof raw.entreprenorSenastUppdaterad === "string"
        ? raw.entreprenorSenastUppdaterad
        : null,
    milstolpar: Array.isArray(raw.milstolpar)
      ? raw.milstolpar.map(normaliseraMilstolpe)
      : [],
  };
}

export function sorteraMilstolpar(lista: TidsplanMilstolpe[]): TidsplanMilstolpe[] {
  return [...lista].sort((a, b) => {
    const da = a.planeratDatum ?? a.entreprenorDatum ?? "9999-99-99";
    const db = b.planeratDatum ?? b.entreprenorDatum ?? "9999-99-99";
    return da.localeCompare(db);
  });
}

export function idagIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function adderaDagar(datumIso: string, dagar: number): string {
  const d = new Date(datumIso + "T12:00:00");
  d.setDate(d.getDate() + dagar);
  return d.toISOString().slice(0, 10);
}

export function formatDatum(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso + "T12:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("sv-SE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export const kallaEtiketter: Record<TidsplanKalla, string> = {
  manuell: "Manuellt",
  protokoll: "Byggmötesprotokoll",
  bibliotek: "Bibliotek",
  entreprenor: "Entreprenör",
};

export function tidsplanHarInnehall(t: ProjektTidsplan): boolean {
  return t.milstolpar.length > 0;
}

export function tidsplanKanGodkannas(t: ProjektTidsplan): boolean {
  return (
    t.milstolpar.length > 0 &&
    t.milstolpar.every((m) => m.planeratDatum || m.entreprenorDatum)
  );
}
