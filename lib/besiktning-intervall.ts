/**
 * Nästa besiktning räknas från den ordinarie besiktningen,
 * inte från när den till slut blev godkänd efter en ombesiktning.
 */
export function beraknaNastaBesiktningAr(opts: {
  godkandAr?: number | null;
  ordinarieAr?: number | null;
  intervallAr?: number | null;
}): number | null {
  const intervall = opts.intervallAr ?? 0;
  if (intervall < 1) return null;
  const bas = opts.ordinarieAr ?? opts.godkandAr;
  if (!bas || !Number.isFinite(bas)) return null;
  return bas + intervall;
}

/** Besiktningsdatum + intervall, som ISO-datum. */
export function beraknaNastaBesiktningDatum(
  besiktningsdatum: string | undefined | null,
  intervallAr: number | undefined | null,
): string | null {
  if (!besiktningsdatum || !/^\d{4}-\d{2}-\d{2}$/.test(besiktningsdatum)) return null;
  if (!intervallAr || intervallAr < 1) return null;
  const [ar, manad, dag] = besiktningsdatum.split("-").map(Number);
  const sistaDag = new Date(Date.UTC(ar + intervallAr, manad, 0)).getUTCDate();
  const d = Math.min(dag, sistaDag);
  return `${ar + intervallAr}-${String(manad).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** Årtal ur ett ISO-datum (YYYY-MM-DD). */
export function arFranDatum(datum: string | undefined | null): number | null {
  const ar = Number((datum ?? "").slice(0, 4));
  return Number.isInteger(ar) && ar >= 1900 && ar <= 2100 ? ar : null;
}

function arIsoDatum(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

// ── Resultat ─────────────────────────────────────────────────────────────────

export type BesiktningTyp = "ovk" | "energideklaration" | "radon" | "sotning" | "besiktning";

export type BesiktningResultat = "godkand" | "ej_godkand";

/** Antal anmärkningar per utfall i OVK-protokollet. */
export type OvkAnmarkningar = { utfall0?: number; utfall1?: number; utfall2?: number };

export type BesiktningResultatVarden = {
  resultat?: BesiktningResultat;
  /** Datum då ombesiktningen senast ska vara gjord. */
  ombesiktningSenast?: string;
  /** Datum då ombesiktningen blev godkänd. */
  ombesiktningGodkand?: string;
  anmarkningar?: OvkAnmarkningar;
};

/** Energideklarationer godkänns eller underkänns inte. */
export function besiktningHarResultat(typ: BesiktningTyp): boolean {
  return typ !== "energideklaration";
}

export function besiktningResultatTexter(typ: BesiktningTyp) {
  if (typ === "radon") {
    return {
      godkand: "Under referensvärdet (200 Bq/m³)",
      ejGodkand: "Över referensvärdet – åtgärd och ny mätning krävs",
      senast: "Ny mätning ska vara klar senast",
      klar: "Ny mätning klar (datum)",
    };
  }
  if (typ === "sotning") {
    return {
      godkand: "Godkänd – inga anmärkningar som kräver efterkontroll",
      ejGodkand: "Anmärkning – efterkontroll krävs",
      senast: "Efterkontroll senast",
      klar: "Efterkontroll godkänd (datum)",
    };
  }
  return {
    godkand: "Godkänd",
    ejGodkand: "Ej godkänd – ombesiktning krävs",
    senast: "Ombesiktning senast",
    klar: "Ombesiktning godkänd (datum)",
  };
}

function tolkaAntal(value: unknown): number | undefined {
  const n = Number(value);
  return Number.isInteger(n) && n >= 0 && n < 10_000 ? n : undefined;
}

export function normaliseraOvkAnmarkningar(raw: unknown): OvkAnmarkningar | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const r = raw as Record<string, unknown>;
  const ut: OvkAnmarkningar = {
    utfall0: tolkaAntal(r.utfall0),
    utfall1: tolkaAntal(r.utfall1),
    utfall2: tolkaAntal(r.utfall2),
  };
  return ut.utfall0 == null && ut.utfall1 == null && ut.utfall2 == null ? undefined : ut;
}

export function normaliseraBesiktningResultat(raw: unknown): BesiktningResultatVarden {
  if (!raw || typeof raw !== "object") return {};
  const r = raw as Record<string, unknown>;
  const resultat =
    r.resultat === "godkand" || r.resultat === "ej_godkand" ? r.resultat : undefined;
  return {
    resultat,
    ombesiktningSenast:
      resultat === "ej_godkand" && arIsoDatum(r.ombesiktningSenast)
        ? r.ombesiktningSenast
        : undefined,
    ombesiktningGodkand:
      resultat === "ej_godkand" && arIsoDatum(r.ombesiktningGodkand)
        ? r.ombesiktningGodkand
        : undefined,
    anmarkningar: normaliseraOvkAnmarkningar(r.anmarkningar),
  };
}

export type SenasteBesiktningUppgifter = BesiktningResultatVarden & {
  utforsAv?: string;
  /** Datum för den ordinarie besiktningen. */
  datum?: string;
};

export function normaliseraSenasteBesiktning(
  raw: unknown,
): SenasteBesiktningUppgifter | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const r = raw as Record<string, unknown>;
  const utforsAv = typeof r.utforsAv === "string" ? r.utforsAv.trim() || undefined : undefined;
  const datum = arIsoDatum(r.datum) ? r.datum : undefined;
  if (!utforsAv && !datum) return undefined;
  return { utforsAv, datum, ...normaliseraBesiktningResultat(r) };
}

/** Kort sammanfattning, t.ex. "Ej godkänd · ombesiktning senast 2026-05-01 · 3 st utfall 2". */
export function beskrivBesiktningResultat(
  typ: BesiktningTyp,
  v: BesiktningResultatVarden,
): string {
  const delar: string[] = [];
  if (v.resultat === "godkand") delar.push("Godkänd");
  if (v.resultat === "ej_godkand") {
    delar.push(v.ombesiktningGodkand ? "Godkänd efter ombesiktning" : "Ej godkänd");
    if (v.ombesiktningGodkand) delar.push(`ombesiktning godkänd ${v.ombesiktningGodkand}`);
    else if (v.ombesiktningSenast) delar.push(`ombesiktning senast ${v.ombesiktningSenast}`);
  }
  if (typ === "ovk" && v.anmarkningar) {
    const a = v.anmarkningar;
    const anm = [
      a.utfall2 ? `${a.utfall2} st utfall 2` : "",
      a.utfall1 ? `${a.utfall1} st utfall 1` : "",
      a.utfall0 ? `${a.utfall0} st utfall 0` : "",
    ].filter(Boolean);
    if (anm.length > 0) delar.push(anm.join(", "));
  }
  return delar.join(" · ");
}

// ── Informationstexter ───────────────────────────────────────────────────────

export const BESIKTNING_INTERVALL_RUBRIK = "Om besiktningen inte blir godkänd";

export const BESIKTNING_INTERVALL_TEXT =
  "Nästa ordinarie besiktning räknas från datumet för den ordinarie besiktningen, inte från datumet då ombesiktningen godkändes. En underkänd besiktning flyttar alltså inte fram nästa besiktning.";

export const BESIKTNING_INTERVALL_EXEMPEL =
  "Exempel: en OVK gjordes 2020 men blev inte godkänd. Ombesiktningen godkändes 2021. Med 6 års intervall ska nästa OVK ändå göras 2026 – inte 2027.";

export const OVK_ANMARKNING_RUBRIK = "Så klassas anmärkningar i OVK-protokollet";

export const OVK_ANMARKNING_TEXT = [
  "Utfall 0 – information. Kräver ingen åtgärd.",
  "Utfall 1 – ska åtgärdas före nästa ordinarie OVK (inom 3 eller 6 år beroende på ventilationssystem). Kräver ingen ombesiktning.",
  "Utfall 2 – ska åtgärdas snarast. OVK:n blir inte godkänd och en ombesiktning krävs, normalt inom sex månader.",
  "Det är kommunens byggnadsnämnd som bestämmer den slutliga tidsfristen.",
];
