import { hamtaUnderhallAtgardKatalog } from "@/components/underhallsplan/underhall-atgard-katalog";

export type UnderhallTillfalle = {
  id: string;
  titel: string;
  nastaAr: string;
  intervallAr: string;
  atgarder: string[];
  /** Andra underkomponenter i samma komponent som ingår i projektet. */
  inkluderadeUnderkomponenter?: string[];
};

export type UnderhallTillfallenData = {
  tillfallen: UnderhallTillfalle[];
};

export function skapaTomUnderhallTillfallenData(): UnderhallTillfallenData {
  return { tillfallen: [] };
}

export function skapaTomUnderhallTillfalle(
  planStartAr: number,
  standardIntervallAr = "25",
): UnderhallTillfalle {
  return {
    id: `tillfalle-${Date.now().toString(36)}`,
    titel: "",
    nastaAr: String(planStartAr),
    intervallAr: standardIntervallAr,
    atgarder: [],
    inkluderadeUnderkomponenter: [],
  };
}

function normaliseraAtgardLista(
  planNyckel: string,
  raw: unknown,
): string[] {
  const giltiga = new Set(hamtaUnderhallAtgardKatalog(planNyckel).map((a) => a.id));
  if (!Array.isArray(raw)) return [];
  return [...new Set(raw.filter((id): id is string => typeof id === "string" && giltiga.has(id)))];
}

function normaliseraTillfalle(
  planNyckel: string,
  raw: Partial<UnderhallTillfalle>,
  index: number,
): UnderhallTillfalle {
  return {
    id: raw.id?.trim() || `tillfalle-${index + 1}`,
    titel: raw.titel?.trim() ?? "",
    nastaAr: raw.nastaAr?.trim() ?? "",
    intervallAr: raw.intervallAr?.trim() ?? "",
    atgarder: normaliseraAtgardLista(planNyckel, raw.atgarder),
    inkluderadeUnderkomponenter: Array.isArray(raw.inkluderadeUnderkomponenter)
      ? raw.inkluderadeUnderkomponenter.filter((id) => typeof id === "string" && id.trim())
      : [],
  };
}

export function normaliseraUnderhallTillfallenData(
  planNyckel: string,
  raw?: UnderhallTillfallenData | null,
): UnderhallTillfallenData {
  if (!raw?.tillfallen?.length) return skapaTomUnderhallTillfallenData();
  return {
    tillfallen: raw.tillfallen.map((t, i) => normaliseraTillfalle(planNyckel, t, i)),
  };
}

export function harUnderhallTillfallenPlan(data: UnderhallTillfallenData): boolean {
  return data.tillfallen.some((t) => t.atgarder.length > 0 && t.intervallAr.trim());
}

export type TillfallenKoppling = {
  huvudUnderkomponentId: string;
  huvudEtikett: string;
  tillfalleTitel: string;
  nastaAr: string;
  atgardEtiketter: string[];
};
