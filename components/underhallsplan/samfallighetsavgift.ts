export type SamfallighetsPost = {
  id: string;
  namn: string;
  vald: boolean;
  /** Användarskapad post — bevaras vid normalisering. */
  egen?: boolean;
};

export type Samfallighetsavgift = {
  aktiv: boolean;
  /** Total årlig avgift till samfälligheten (kr). */
  arligAvgiftKr: number;
  poster: SamfallighetsPost[];
  notering?: string;
};

export const STANDARD_SAMFALLIGHETS_POSTER: readonly {
  id: string;
  namn: string;
}[] = [
  { id: "renhallning", namn: "Renhållning" },
  { id: "snorojning", namn: "Snöröjning" },
  { id: "tradgard", namn: "Trädgårdsskötsel" },
  { id: "vagunderhall", namn: "Vägunderhåll / gemensamma ytor" },
  { id: "belysning", namn: "Gemensam belysning" },
  { id: "forsakring", namn: "Gemensam försäkring (samfällighet)" },
  { id: "skotsel", namn: "Skötsel av grönytor / lekplatser" },
] as const;

export function skapaStandardSamfallighetsavgift(): Samfallighetsavgift {
  return {
    aktiv: false,
    arligAvgiftKr: 0,
    poster: STANDARD_SAMFALLIGHETS_POSTER.map((p) => ({
      id: p.id,
      namn: p.namn,
      vald: false,
      egen: false,
    })),
  };
}

/** Slår ihop sparade poster med standardlista utan att tappa egna val. */
export function normaliseraSamfallighetsavgift(
  raw?: Partial<Samfallighetsavgift> | null,
): Samfallighetsavgift {
  const sparade = raw?.poster ?? [];
  const byId = new Map<string, SamfallighetsPost>();

  for (const std of STANDARD_SAMFALLIGHETS_POSTER) {
    const saved = sparade.find((p) => p.id === std.id);
    byId.set(std.id, {
      id: std.id,
      namn: saved?.namn?.trim() || std.namn,
      vald: Boolean(saved?.vald),
      egen: false,
    });
  }

  for (const post of sparade) {
    if (!post?.id) continue;
    const arStandard = STANDARD_SAMFALLIGHETS_POSTER.some((s) => s.id === post.id);
    if (arStandard && !post.egen) continue;
    byId.set(post.id, {
      id: post.id,
      namn: post.namn?.trim() || "Egen post",
      vald: Boolean(post.vald),
      egen: true,
    });
  }

  const arlig =
    typeof raw?.arligAvgiftKr === "number" && !Number.isNaN(raw.arligAvgiftKr)
      ? Math.max(0, Math.round(raw.arligAvgiftKr))
      : 0;

  return {
    aktiv: Boolean(raw?.aktiv),
    arligAvgiftKr: arlig,
    poster: Array.from(byId.values()),
    notering: raw?.notering?.trim() || undefined,
  };
}

export function hamtaValdaSamfallighetsPoster(
  avgift: Samfallighetsavgift,
): SamfallighetsPost[] {
  return avgift.poster.filter((p) => p.vald);
}

export function beraknaSamfallighetsavgiftPerAr(
  avgift: Samfallighetsavgift | undefined | null,
): number {
  if (!avgift?.aktiv) return 0;
  return Math.max(0, Math.round(avgift.arligAvgiftKr));
}

export function skapaEgenSamfallighetsPostId(): string {
  return `egen-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
