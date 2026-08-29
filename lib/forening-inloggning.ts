/**
 * Inloggning till test- och skapade föreningar från publika Styrelse-Navet.
 */

import { GRUNDMALL_FORENING_ID } from "@/lib/forening-konstanter";
import {
  listaForeningar,
  normaliseraForeningsNamn,
  type ForeningProfil,
} from "@/lib/forening-registry";
import {
  listaInloggningsTestForeningar,
  arStandardTestForening,
} from "@/lib/testforeningar";

/** Prefill i sökfältet på inloggningssidan. */
export const INLOGGNING_BRF_PREFIX = "Brf ";

/**
 * Alla föreningar man kan logga in på i den här webbläsaren:
 * skapade testföreningar först, sedan de fasta demoföreningarna.
 */
export function listaInloggningsForeningar(): ForeningProfil[] {
  const standard = listaInloggningsTestForeningar();
  const standardIds = new Set(standard.map((f) => f.id));
  const egna = listaForeningar()
    .filter(
      (f) =>
        f.id !== GRUNDMALL_FORENING_ID &&
        !standardIds.has(f.id) &&
        f.namn.trim().length > 0,
    )
    .sort((a, b) => a.namn.localeCompare(b.namn, "sv"));
  return [...egna, ...standard];
}

export function antalInloggningsForeningar(): number {
  return listaInloggningsForeningar().length;
}

export function arEgenTestForening(foreningId: string): boolean {
  return !arStandardTestForening(foreningId) && foreningId !== GRUNDMALL_FORENING_ID;
}

/** Filtrerar på bokstäver efter «Brf » — ju fler tecken, desto snävare urval. */
export function filtreraForeningarPaSok(
  foreningar: ForeningProfil[],
  soktext: string,
): ForeningProfil[] {
  const q = soktext.trim();
  if (!q || normaliseraForeningsNamn(q) === "brf") {
    return foreningar;
  }
  const nyckel = normaliseraForeningsNamn(q);
  return foreningar.filter((f) => {
    const namn = normaliseraForeningsNamn(f.namn);
    return namn.includes(nyckel) || namn.replace(/^brf\s+/, "").includes(nyckel.replace(/^brf\s+/, ""));
  });
}

/** Säkerställer att söktexten börjar med «Brf » (behåller användarens fortsättning). */
export function normaliseraBrfSoktext(varde: string): string {
  const utanPrefix = varde.replace(/^brf\s*/i, "");
  return `${INLOGGNING_BRF_PREFIX}${utanPrefix}`;
}
