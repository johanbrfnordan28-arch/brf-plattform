import {
  formatSummeringTal,
  formateraSummeringRader,
  parseNummerSumma,
  type ListaSummeringRad,
} from "@/components/underhallsplan/lista-summering";

export const KALLARE_RUM_UNDERKOMPONENT_ID = "rum";

/** Rum / utrymmen i källaren. */
export type KallareRumTypId =
  | "skyddsrum"
  | "barnvagnsforrad"
  | "medlemsforrad"
  | "cykelrum"
  | "teknikrum"
  | "undercentral"
  | "korridor"
  | "garage"
  | "soprum"
  | "tvattstuga"
  | "allmant"
  | "annat";

/** Vad som kan finnas i ett rum. */
export type KallareInnehallTypId =
  | "armatur"
  | "traforrad"
  | "gallerforrad"
  | "dorr"
  | "eluttag"
  | "golvbrunn"
  | "ytskikt"
  | "hylla"
  | "annat";

export type KallareInnehallMangdEnhet = "antal" | "kvm" | "löpmeter";

export type KallareInnehallPost = {
  id: string;
  typ: KallareInnehallTypId;
  typAnnan: string;
  /** Antal / mängd — enhet styrs av typens standard eller vald enhet. */
  mangd: string;
  mangdEnhet: KallareInnehallMangdEnhet;
  anteckning: string;
};

export type KallareRumPost = {
  id: string;
  typ: KallareRumTypId;
  typAnnan: string;
  /** Valfritt eget namn, t.ex. «Skyddsrum hus A». */
  namn: string;
  innehall: KallareInnehallPost[];
};

export const kallareRumTyper: {
  id: KallareRumTypId;
  etikett: string;
  beskrivning: string;
}[] = [
  {
    id: "skyddsrum",
    etikett: "Skyddsrum",
    beskrivning: "Skyddsrum / civilförsvar.",
  },
  {
    id: "barnvagnsforrad",
    etikett: "Barnvagnsförråd",
    beskrivning: "Utrymme för barnvagnar.",
  },
  {
    id: "medlemsforrad",
    etikett: "Medlemsförråd",
    beskrivning: "Individuella förråd för medlemmar.",
  },
  {
    id: "cykelrum",
    etikett: "Cykelrum",
    beskrivning: "Cykelparkering i källare.",
  },
  {
    id: "teknikrum",
    etikett: "Teknikrum",
    beskrivning: "El, styrsystem, teknik.",
  },
  {
    id: "undercentral",
    etikett: "Undercentral",
    beskrivning: "Rum för värmeundercentral.",
  },
  {
    id: "korridor",
    etikett: "Korridor / gång",
    beskrivning: "Gemensam källargång.",
  },
  {
    id: "garage",
    etikett: "Garage",
    beskrivning: "Garage i källarplan.",
  },
  {
    id: "soprum",
    etikett: "Soprum",
    beskrivning: "Avfallsrum i källaren.",
  },
  {
    id: "tvattstuga",
    etikett: "Tvättstuga",
    beskrivning: "Tvättstuga — detaljer kan också finnas under Tvättstuga.",
  },
  {
    id: "allmant",
    etikett: "Allmänt utrymme",
    beskrivning: "Övrigt gemensamt rum.",
  },
  {
    id: "annat",
    etikett: "Annat rum…",
    beskrivning: "Ange eget rumnamn.",
  },
];

export const kallareInnehallTyper: {
  id: KallareInnehallTypId;
  etikett: string;
  beskrivning: string;
  defaultEnhet: KallareInnehallMangdEnhet;
}[] = [
  {
    id: "armatur",
    etikett: "Armaturer / belysning",
    beskrivning: "Belysningsarmaturer i rummet.",
    defaultEnhet: "antal",
  },
  {
    id: "traforrad",
    etikett: "Träförråd",
    beskrivning: "Förråd med träväggar / träväggspartier.",
    defaultEnhet: "antal",
  },
  {
    id: "gallerforrad",
    etikett: "Gallerförråd",
    beskrivning: "Förråd med gallerpartier.",
    defaultEnhet: "antal",
  },
  {
    id: "dorr",
    etikett: "Dörrar",
    beskrivning: "Dörrar till eller i rummet.",
    defaultEnhet: "antal",
  },
  {
    id: "eluttag",
    etikett: "Eluttag",
    beskrivning: "Vägguttag eller laddplatser.",
    defaultEnhet: "antal",
  },
  {
    id: "golvbrunn",
    etikett: "Golvbrunnar",
    beskrivning: "Golvbrunnar och avlopp.",
    defaultEnhet: "antal",
  },
  {
    id: "ytskikt",
    etikett: "Ytskikt",
    beskrivning: "Yta för målning eller ytskiktsbyte (kvm).",
    defaultEnhet: "kvm",
  },
  {
    id: "hylla",
    etikett: "Hyllor / inredning",
    beskrivning: "Hyllsystem eller fast inredning.",
    defaultEnhet: "antal",
  },
  {
    id: "annat",
    etikett: "Annat innehåll…",
    beskrivning: "Ange eget innehåll.",
    defaultEnhet: "antal",
  },
];

export const kallareMangdEnheter: {
  id: KallareInnehallMangdEnhet;
  etikett: string;
  enhet: string;
}[] = [
  { id: "antal", etikett: "Antal", enhet: "st" },
  { id: "kvm", etikett: "Yta", enhet: "m²" },
  { id: "löpmeter", etikett: "Löpmeter", enhet: "m" },
];

export function kallareRumTypEtikett(id: KallareRumTypId, annan = ""): string {
  if (id === "annat") return annan.trim() || "Annat rum";
  return kallareRumTyper.find((t) => t.id === id)?.etikett ?? id;
}

export function kallareInnehallTypEtikett(
  id: KallareInnehallTypId,
  annan = "",
): string {
  if (id === "annat") return annan.trim() || "Annat innehåll";
  return kallareInnehallTyper.find((t) => t.id === id)?.etikett ?? id;
}

export function kallareMangdEnhetEtikett(id: KallareInnehallMangdEnhet): string {
  return kallareMangdEnheter.find((e) => e.id === id)?.enhet ?? id;
}

export function skapaKallareRumId(): string {
  return `kallare-rum-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function skapaKallareInnehallId(): string {
  return `kallare-innehall-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function skapaTomKallareInnehallPost(
  typ: KallareInnehallTypId = "armatur",
): KallareInnehallPost {
  const def = kallareInnehallTyper.find((t) => t.id === typ);
  return {
    id: skapaKallareInnehallId(),
    typ,
    typAnnan: "",
    mangd: "",
    mangdEnhet: def?.defaultEnhet ?? "antal",
    anteckning: "",
  };
}

export function skapaTomKallareRumPost(
  typ: KallareRumTypId = "allmant",
): KallareRumPost {
  return {
    id: skapaKallareRumId(),
    typ,
    typAnnan: "",
    namn: "",
    innehall: [],
  };
}

function arRumTyp(v: unknown): v is KallareRumTypId {
  return kallareRumTyper.some((t) => t.id === v);
}

function arInnehallTyp(v: unknown): v is KallareInnehallTypId {
  return kallareInnehallTyper.some((t) => t.id === v);
}

function arMangdEnhet(v: unknown): v is KallareInnehallMangdEnhet {
  return kallareMangdEnheter.some((e) => e.id === v);
}

export function normaliseraKallareInnehallPost(
  raw: Partial<KallareInnehallPost> & { id?: string },
  index = 0,
): KallareInnehallPost {
  const typ = arInnehallTyp(raw.typ) ? raw.typ : "annat";
  const defaultEnhet =
    kallareInnehallTyper.find((t) => t.id === typ)?.defaultEnhet ?? "antal";
  return {
    id: raw.id?.trim() || `kallare-innehall-${index + 1}`,
    typ,
    typAnnan: typ === "annat" ? raw.typAnnan?.trim() ?? "" : "",
    mangd: raw.mangd?.trim() ?? "",
    mangdEnhet: arMangdEnhet(raw.mangdEnhet) ? raw.mangdEnhet : defaultEnhet,
    anteckning: raw.anteckning?.trim() ?? "",
  };
}

export function normaliseraKallareRumPost(
  raw: Partial<KallareRumPost> & { id?: string },
  index = 0,
): KallareRumPost {
  const typ = arRumTyp(raw.typ) ? raw.typ : "annat";
  return {
    id: raw.id?.trim() || `kallare-rum-${index + 1}`,
    typ,
    typAnnan: typ === "annat" ? raw.typAnnan?.trim() ?? "" : "",
    namn: raw.namn?.trim() ?? "",
    innehall: Array.isArray(raw.innehall)
      ? raw.innehall
          .filter((p) => Boolean(p) && typeof p === "object")
          .map((p, i) =>
            normaliseraKallareInnehallPost(
              p as Partial<KallareInnehallPost>,
              i,
            ),
          )
      : [],
  };
}

export function normaliseraKallareRumPoster(raw: unknown): KallareRumPost[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((p) => Boolean(p) && typeof p === "object")
    .map((p, i) =>
      normaliseraKallareRumPost(p as Partial<KallareRumPost>, i),
    );
}

export function kallareRumRubrik(rum: KallareRumPost): string {
  const p = normaliseraKallareRumPost(rum);
  if (p.namn) return p.namn;
  return kallareRumTypEtikett(p.typ, p.typAnnan);
}

export function formateraKallareInnehallPost(post: KallareInnehallPost): string {
  const p = normaliseraKallareInnehallPost(post);
  const typ = kallareInnehallTypEtikett(p.typ, p.typAnnan);
  const mangd = p.mangd.trim();
  const enhet = kallareMangdEnhetEtikett(p.mangdEnhet);
  const bas = mangd ? `${typ}: ${mangd} ${enhet}` : typ;
  return p.anteckning ? `${bas} (${p.anteckning})` : bas;
}

export function formateraKallareRumPost(rum: KallareRumPost): string {
  const p = normaliseraKallareRumPost(rum);
  const rubrik = kallareRumRubrik(p);
  if (p.innehall.length === 0) return rubrik;
  return `${rubrik}: ${p.innehall.map(formateraKallareInnehallPost).join(", ")}`;
}

export function formateraKallareRumPoster(poster: KallareRumPost[]): string {
  const texter = poster.map(formateraKallareRumPost).filter(Boolean);
  return texter.join(" · ");
}

/** Summering per innehållstyp, valfritt filtrerad. */
export function summeraKallareRumPoster(
  poster: KallareRumPost[],
  filterTyper?: KallareInnehallTypId[],
): ListaSummeringRad[] {
  const rum = poster.map(normaliseraKallareRumPost);
  const filter =
    filterTyper && filterTyper.length > 0 ? new Set(filterTyper) : null;

  const rader: ListaSummeringRad[] = [
    { etikett: "Antal rum", varde: `${rum.length} st` },
  ];

  const perTyp = new Map<
    string,
    { etikett: string; perEnhet: Map<KallareInnehallMangdEnhet, number> }
  >();

  for (const r of rum) {
    for (const innehall of r.innehall) {
      if (filter && !filter.has(innehall.typ)) continue;
      const etikett = kallareInnehallTypEtikett(innehall.typ, innehall.typAnnan);
      const nyckel =
        innehall.typ === "annat" ? `annat:${etikett}` : innehall.typ;
      const aktuell = perTyp.get(nyckel) ?? {
        etikett,
        perEnhet: new Map(),
      };
      const n = parseNummerSumma([innehall.mangd]);
      if (n > 0) {
        aktuell.perEnhet.set(
          innehall.mangdEnhet,
          (aktuell.perEnhet.get(innehall.mangdEnhet) ?? 0) + n,
        );
      } else if (!aktuell.perEnhet.has(innehall.mangdEnhet)) {
        aktuell.perEnhet.set(innehall.mangdEnhet, 0);
      }
      perTyp.set(nyckel, aktuell);
    }
  }

  for (const { etikett, perEnhet } of perTyp.values()) {
    const delar: string[] = [];
    for (const [enhet, tal] of perEnhet) {
      if (tal > 0) {
        delar.push(`${formatSummeringTal(tal)} ${kallareMangdEnhetEtikett(enhet)}`);
      }
    }
    rader.push({
      etikett,
      varde: delar.length > 0 ? delar.join(", ") : "angivet utan mängd",
    });
  }

  return rader;
}

export function formateraKallareSammanstallning(
  poster: KallareRumPost[],
  filterTyper?: KallareInnehallTypId[],
): string {
  return formateraSummeringRader(summeraKallareRumPoster(poster, filterTyper));
}

/** Detaljrader till steg 2 / filtrerad vy. */
export function kallareSammanstallningDetaljer(
  poster: KallareRumPost[],
  filterTyper?: KallareInnehallTypId[],
): { rum: string; innehall: string; mangd: string }[] {
  const filter =
    filterTyper && filterTyper.length > 0 ? new Set(filterTyper) : null;
  const rader: { rum: string; innehall: string; mangd: string }[] = [];

  for (const rum of poster.map(normaliseraKallareRumPost)) {
    const rubrik = kallareRumRubrik(rum);
    for (const innehall of rum.innehall) {
      if (filter && !filter.has(innehall.typ)) continue;
      const mangd = innehall.mangd.trim();
      rader.push({
        rum: rubrik,
        innehall: kallareInnehallTypEtikett(innehall.typ, innehall.typAnnan),
        mangd: mangd
          ? `${mangd} ${kallareMangdEnhetEtikett(innehall.mangdEnhet)}`
          : "—",
      });
    }
  }
  return rader;
}
