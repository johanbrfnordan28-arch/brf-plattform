/** Planerade underhållsåtgärder på fasad — steg 3. */

export type FasadAtgardId =
  | "putsreparation"
  | "ommalning"
  | "fasadtvatt"
  | "fogning"
  | "tra-behandling"
  | "plat-underhall";

/** Ett planerat tillfälle — vilka åtgärder som görs och när det upprepas. */
export type FasadAtgardTillfalle = {
  id: string;
  /** T.ex. «Större underhåll» eller «Ommålning». */
  titel: string;
  nastaAr: string;
  intervallAr: string;
  atgarder: FasadAtgardId[];
};

export type FasadAtgardData = {
  tillfallen: FasadAtgardTillfalle[];
};

export const fasadAtgarder: {
  id: FasadAtgardId;
  etikett: string;
  beskrivning: string;
  vanligaMaterial: string;
}[] = [
  {
    id: "putsreparation",
    etikett: "Putsreparation (lagning av puts)",
    beskrivning:
      "Lagning av sprickor, utfyllnad och lokal reparationsputs. Branschen säger putsreparation eller lagning av puts — inte «putslagning».",
    vanligaMaterial: "Puts, tunnputs",
  },
  {
    id: "ommalning",
    etikett: "Ommålning (färgning)",
    beskrivning:
      "Ny färgyta efter tvätt och ev. reparation. I underhållsplaner kallas det oftast ommålning; färgning är samma typ av åtgärd.",
    vanligaMaterial: "Puts, trä, tegel med putsband",
  },
  {
    id: "fasadtvatt",
    etikett: "Fasadtvätt",
    beskrivning:
      "Rengöring före ommålning eller som egen åtgärd — alger, sot och smuts.",
    vanligaMaterial: "Alla material",
  },
  {
    id: "fogning",
    etikett: "Fogning",
    beskrivning:
      "Uppfräschning eller byte av fogmassa i tegel- eller putsband.",
    vanligaMaterial: "Tegel, tegel med putsband",
  },
  {
    id: "tra-behandling",
    etikett: "Ytbehandling träfasad",
    beskrivning:
      "Slipning, grundning och målning eller olja/lasyr på träpanel.",
    vanligaMaterial: "Trä",
  },
  {
    id: "plat-underhall",
    etikett: "Underhåll plåtfasad",
    beskrivning:
      "Kontroll, lagning av plåtskruv, omlackering eller byte av plåtdetaljer.",
    vanligaMaterial: "Plåt",
  },
];

const giltigaAtgardIds = new Set(fasadAtgarder.map((a) => a.id));

function normaliseraAtgardLista(raw: unknown): FasadAtgardId[] {
  if (!Array.isArray(raw)) return [];
  return [...new Set(
    raw.filter((id): id is FasadAtgardId =>
      typeof id === "string" && giltigaAtgardIds.has(id as FasadAtgardId),
    ),
  )];
}

function normaliseraTillfalle(
  raw: Partial<FasadAtgardTillfalle>,
  index: number,
): FasadAtgardTillfalle {
  return {
    id: raw.id?.trim() || `tillfalle-${index + 1}`,
    titel: raw.titel?.trim() ?? "",
    nastaAr: raw.nastaAr?.trim() ?? "",
    intervallAr: raw.intervallAr?.trim() ?? "",
    atgarder: normaliseraAtgardLista(raw.atgarder),
  };
}

export function skapaTomFasadAtgardTillfalle(
  planStartAr: number,
  standardIntervallAr = "30",
): FasadAtgardTillfalle {
  return {
    id: `tillfalle-${Date.now().toString(36)}`,
    titel: "",
    nastaAr: String(planStartAr),
    intervallAr: standardIntervallAr,
    atgarder: [],
  };
}

export function skapaTomFasadAtgardData(): FasadAtgardData {
  return { tillfallen: [] };
}

type LegacyFasadAtgardData = FasadAtgardData & {
  valdaAtgarder?: FasadAtgardId[];
};

export function normaliseraFasadAtgardData(
  raw?: Partial<LegacyFasadAtgardData>,
): FasadAtgardData {
  if (raw?.tillfallen && raw.tillfallen.length > 0) {
    return {
      tillfallen: raw.tillfallen.map((t, i) => normaliseraTillfalle(t, i)),
    };
  }

  const legacy = normaliseraAtgardLista(raw?.valdaAtgarder);
  if (legacy.length > 0) {
    return {
      tillfallen: [
        {
          id: "tillfalle-legacy",
          titel: "Planerat underhåll",
          nastaAr: "",
          intervallAr: "30",
          atgarder: legacy,
        },
      ],
    };
  }

  return { tillfallen: [] };
}

export function harFasadAtgardPlan(data: FasadAtgardData): boolean {
  return normaliseraFasadAtgardData(data).tillfallen.some(
    (t) => t.atgarder.length > 0,
  );
}

export function fasadAtgardEtikett(id: FasadAtgardId): string {
  return fasadAtgarder.find((a) => a.id === id)?.etikett ?? id;
}

export function formateraFasadAtgarder(data: FasadAtgardData): string {
  const normaliserad = normaliseraFasadAtgardData(data);
  if (normaliserad.tillfallen.length === 0) return "";

  return normaliserad.tillfallen
    .filter((t) => t.atgarder.length > 0)
    .map((t) => {
      const atgarder = t.atgarder.map(fasadAtgardEtikett).join(", ");
      const ar = t.nastaAr ? ` från ${t.nastaAr}` : "";
      const intervall = t.intervallAr ? ` vart ${t.intervallAr}:e år` : "";
      const titel = t.titel ? `${t.titel}: ` : "";
      return `${titel}${atgarder}${ar}${intervall}`;
    })
    .join(" · ");
}

export function formateraFasadMaterialOchAtgard(args: {
  material: string;
  yta?: string;
  atgarder: FasadAtgardData;
}): string {
  const delar: string[] = [];
  if (args.material.trim()) delar.push(args.material.trim());
  const atgardText = formateraFasadAtgarder(args.atgarder);
  if (atgardText) delar.push(atgardText);
  if (args.yta?.trim()) delar.push(args.yta.trim());
  return delar.join(" · ");
}
