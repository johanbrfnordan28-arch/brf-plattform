import {
  formatSummeringTal,
  parseNummerSumma,
  type ListaSummeringRad,
} from "@/components/underhallsplan/lista-summering";

/**
 * Undercentralen ligger vanligtvis i källaren.
 * Löpmeter avser de horisontella ledningarna där — tillopp och retur var för sig.
 */

export const UNDERCENTRAL_UNDERKOMPONENT_ID = "undercentral";

export type UndercentralData = {
  /** Horisontell tilloppsledning i källaren, meter. */
  tilloppLopmeter: string;
  /** Horisontell returledning i källaren, meter. */
  returLopmeter: string;
};

export function skapaTomUndercentralData(): UndercentralData {
  return { tilloppLopmeter: "", returLopmeter: "" };
}

export function normaliseraUndercentralData(
  raw?: Partial<UndercentralData> | null,
): UndercentralData {
  return {
    tilloppLopmeter: raw?.tilloppLopmeter?.trim() ?? "",
    returLopmeter: raw?.returLopmeter?.trim() ?? "",
  };
}

export function summeraUndercentral(data: UndercentralData): ListaSummeringRad[] {
  const rader: ListaSummeringRad[] = [];
  const tillopp = parseNummerSumma([data.tilloppLopmeter]);
  const retur = parseNummerSumma([data.returLopmeter]);
  if (tillopp > 0) {
    rader.push({
      etikett: "Horisontell tillopp",
      varde: `${formatSummeringTal(tillopp)} m`,
    });
  }
  if (retur > 0) {
    rader.push({
      etikett: "Horisontell retur",
      varde: `${formatSummeringTal(retur)} m`,
    });
  }
  return rader;
}

export function formateraUndercentral(data: UndercentralData): string {
  const rader = summeraUndercentral(normaliseraUndercentralData(data));
  if (rader.length === 0) return "";
  return rader.map((r) => `${r.etikett} ${r.varde}`).join(", ");
}
