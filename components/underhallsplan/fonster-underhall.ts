/** Fönster — åtgärder, intervall och utsatthet (läge påverkar slitage). */

import type {
  FonsterDorrPost,
  FonsterLageId,
  TraUnderhallId,
} from "@/components/underhallsplan/fonster-dorrar";

export type FonsterExponeringId = "hart-utsatt" | "normal" | "skyddat";

export const fonsterExponeringAlternativ: {
  id: FonsterExponeringId;
  etikett: string;
  beskrivning: string;
  faktor: number;
}[] = [
  {
    id: "hart-utsatt",
    etikett: "Hårt utsatt",
    beskrivning:
      "Sol, slagregn eller vind (ofta söder/väster, höga våningar, kust) — slits mer, tätare intervall.",
    faktor: 0.7,
  },
  {
    id: "normal",
    etikett: "Normalt läge",
    beskrivning: "Vanlig exponering — standardintervall.",
    faktor: 1,
  },
  {
    id: "skyddat",
    etikett: "Skyddat läge",
    beskrivning:
      "Skuggat eller i lä (ofta norr, gård, under takfot) — längre intervall.",
    faktor: 1.3,
  },
];

/** Grundintervall i normalt läge (år). */
export const FONSTER_BAS_INTERVALL_AR: Record<TraUnderhallId | "tatningslister", number> = {
  malning: 10,
  renovering: 25,
  utbyte: 45,
  tatningslister: 10,
};

/** Underhållskatalogens id per fönsteråtgärd. */
export const FONSTER_KATALOG_ID: Record<TraUnderhallId | "tatningslister", string> = {
  malning: "fonster-malning",
  renovering: "fonster-renovering",
  utbyte: "fonster-byte",
  tatningslister: "fonster-tatning",
};

export function foreslagenExponeringForLage(
  lage: FonsterLageId | "" | undefined,
): FonsterExponeringId {
  if (lage === "soder" || lage === "vaster") return "hart-utsatt";
  if (lage === "norr" || lage === "gard") return "skyddat";
  return "normal";
}

export function effektivExponering(post: FonsterDorrPost): FonsterExponeringId {
  return post.exponering || foreslagenExponeringForLage(post.lage);
}

export function exponeringEtikett(id: FonsterExponeringId): string {
  return fonsterExponeringAlternativ.find((e) => e.id === id)?.etikett ?? id;
}

function exponeringFaktor(id: FonsterExponeringId): number {
  return fonsterExponeringAlternativ.find((e) => e.id === id)?.faktor ?? 1;
}

export function fonsterIntervallAr(
  atgard: TraUnderhallId | "tatningslister",
  exponering: FonsterExponeringId,
): number {
  return Math.max(
    1,
    Math.round(FONSTER_BAS_INTERVALL_AR[atgard] * exponeringFaktor(exponering)),
  );
}

/** Planerad åtgärd för posten — material utan målning planeras för utbyte. */
export function fonsterPlaneradAtgard(post: FonsterDorrPost): TraUnderhallId {
  if ((post.material ?? "tra") !== "tra") return "utbyte";
  return post.traUnderhall ?? "malning";
}

export function fonsterNastaRekommendation(atgard: TraUnderhallId): string {
  if (atgard === "malning") {
    return "Efter 2–3 målningsomgångar rekommenderas normalt en renovering. Notera målarens rekommendation när målningen registreras i steg 3.";
  }
  if (atgard === "renovering") {
    return "Efter renovering räcker oftast målning i nästa omgång.";
  }
  return "Nya fönster — nästa åtgärd är normalt målning eller översyn av tätningslister.";
}

/** Antalsvägd intervallfaktor för alla fönsterrader. */
export function fonsterViktadExponeringFaktor(poster: FonsterDorrPost[]): number {
  let summaAntal = 0;
  let summaVikt = 0;
  for (const p of poster) {
    const antal = Number.parseInt(p.antal, 10);
    const n = Number.isFinite(antal) && antal > 0 ? antal : 0;
    if (n === 0) continue;
    summaAntal += n;
    summaVikt += n * exponeringFaktor(effektivExponering(p));
  }
  return summaAntal > 0 ? summaVikt / summaAntal : 1;
}

export function fonsterHarTatningslister(poster: FonsterDorrPost[]): boolean {
  return poster.some((p) => p.bytTatningslister);
}

/** Vanligaste planerade åtgärden (antalsvägd). */
export function fonsterDominerandeAtgard(poster: FonsterDorrPost[]): TraUnderhallId {
  const summa: Record<TraUnderhallId, number> = { malning: 0, renovering: 0, utbyte: 0 };
  for (const p of poster) {
    const antal = Number.parseInt(p.antal, 10);
    summa[fonsterPlaneradAtgard(p)] += Number.isFinite(antal) && antal > 0 ? antal : 1;
  }
  return (Object.entries(summa) as [TraUnderhallId, number][]).sort(
    (a, b) => b[1] - a[1],
  )[0][0];
}
