/** Flera tak i underhållsplanen — "Tak" plus ett extra tak per separat hus. */

import type { FastighetsHus } from "@/components/underhallsplan/fastighets-ytor";

export const TAK_KOMPONENT_NAMN = "Tak";
const EXTRA_TAK_PREFIX = "Tak – ";

/** Underkomponent med takpartier (ytskikt, kulör, yta). */
export const TAK_YTSKIKT_ID = "takyta";

/** Större tilläggsdelar med eget formulär — visas som egna delar på taket. */
export const TAK_EGNA_DELAR_IDS = ["takfonster", "takterrass", "medlemstakterrass"];

export type TakEnhet = {
  /** Komponentnamn i planen, t.ex. "Tak" eller "Tak – Storgatan 5". */
  namn: string;
  /** Hus som ingår i taket. Tomt = inget hus valt. */
  husIds: string[];
  adress?: string;
};

export function arTakKomponent(namn: string): boolean {
  return namn === TAK_KOMPONENT_NAMN || namn.startsWith(EXTRA_TAK_PREFIX);
}

/** Mall- och regelnamn — alla tak delar "Tak"-mallen. */
export function komponentTypNamn(namn: string): string {
  return arTakKomponent(namn) ? TAK_KOMPONENT_NAMN : namn;
}

export function takKomponenterIPlan(aktiva: string[]): string[] {
  return aktiva.filter(arTakKomponent);
}

export function nyttTakNamn(upptagna: string[], husnamn?: string): string {
  const bas = husnamn?.trim();
  if (bas) {
    const namn = `${EXTRA_TAK_PREFIX}${bas}`;
    if (!upptagna.includes(namn)) return namn;
  }
  for (let i = 2; ; i++) {
    const namn = `${EXTRA_TAK_PREFIX}nr ${i}`;
    if (!upptagna.includes(namn)) return namn;
  }
}

/** Sammanbyggda hus — ett gemensamt tak över alla hus. */
export function slaIhopTillEttTak(
  befintliga: TakEnhet[],
  hus: FastighetsHus[],
): TakEnhet[] {
  return [
    {
      namn: TAK_KOMPONENT_NAMN,
      husIds: hus.map((h) => h.id),
      adress: befintliga.find((t) => t.namn === TAK_KOMPONENT_NAMN)?.adress,
    },
  ];
}

/** Fristående hus — ett tak per hus. Befintliga tak återanvänds för sitt hus. */
export function ettTakPerHus(
  befintliga: TakEnhet[],
  hus: FastighetsHus[],
): TakEnhet[] {
  const anvanda = new Set<string>();
  const resultat: TakEnhet[] = [];
  hus.forEach((h, index) => {
    const befintligt =
      index === 0
        ? befintliga.find((t) => t.namn === TAK_KOMPONENT_NAMN)
        : befintliga.find(
            (t) =>
              t.namn !== TAK_KOMPONENT_NAMN &&
              !anvanda.has(t.namn) &&
              t.husIds.includes(h.id),
          );
    const namn =
      befintligt?.namn ??
      (index === 0
        ? TAK_KOMPONENT_NAMN
        : nyttTakNamn(
            [...befintliga.map((t) => t.namn), ...resultat.map((t) => t.namn)],
            h.husnummer,
          ));
    anvanda.add(namn);
    resultat.push({
      namn,
      husIds: [h.id],
      adress: befintligt?.adress || h.husnummer.trim() || undefined,
    });
  });
  return resultat;
}

/** Ett hus kan bara ligga under ett tak — kryss flyttar huset dit. */
export function flyttaHusTillTak(
  tak: TakEnhet[],
  takNamn: string,
  husId: string,
  med: boolean,
): TakEnhet[] {
  return tak.map((t) => {
    const utan = t.husIds.filter((id) => id !== husId);
    if (t.namn !== takNamn) return { ...t, husIds: med ? utan : t.husIds };
    return { ...t, husIds: med ? [...utan, husId] : utan };
  });
}

export function husNamnForTak(
  husIds: string[] | undefined,
  hus: FastighetsHus[],
): string[] {
  if (!husIds?.length) return [];
  return hus
    .filter((h) => husIds.includes(h.id))
    .map((h) => h.husnummer.trim() || "Byggnad");
}
