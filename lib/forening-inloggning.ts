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
 * Minsta antal bokstäver efter «Brf » innan skapade föreningar visas.
 * (t.ex. «Brf So» → 2 tecken)
 */
export const MIN_SOK_BOKSTAVER_EFTER_BRF = 2;

export function arEgenTestForening(foreningId: string): boolean {
  return (
    !arStandardTestForening(foreningId) && foreningId !== GRUNDMALL_FORENING_ID
  );
}

/** Endast föreningar som styrelsen skapat (prova gratis). */
export function listaEgnaTestForeningar(): ForeningProfil[] {
  return listaForeningar()
    .filter(
      (f) =>
        arEgenTestForening(f.id) && f.namn.trim().length > 0,
    )
    .sort((a, b) => a.namn.localeCompare(b.namn, "sv"));
}

/**
 * Inloggningslista:
 * - Finns skapade testföreningar → endast dem (inga övriga demoföreningar).
 * - Annars → fasta demoföreningar (tom webbläsare / plattformstest).
 */
export function listaInloggningsForeningar(): ForeningProfil[] {
  const egna = listaEgnaTestForeningar();
  if (egna.length > 0) return egna;
  return listaInloggningsTestForeningar();
}

export function antalInloggningsForeningar(): number {
  return listaInloggningsForeningar().length;
}

export function antalEgnaTestForeningar(): number {
  return listaEgnaTestForeningar().length;
}

/** Text efter «Brf » (trimmat). */
export function hamtaSokSuffix(soktext: string): string {
  return soktext.replace(/^brf\s*/i, "").trimStart();
}

export function arEndastEgnaForeningar(foreningar: ForeningProfil[]): boolean {
  return (
    foreningar.length > 0 && foreningar.every((f) => arEgenTestForening(f.id))
  );
}

/**
 * true när skapade föreningar finns i listan men användaren
 * inte skrivit tillräckligt många bokstäver ännu.
 */
export function sokKräverFlerBokstaver(
  soktext: string,
  foreningar: ForeningProfil[],
): boolean {
  if (!arEndastEgnaForeningar(foreningar)) return false;
  return hamtaSokSuffix(soktext).length < MIN_SOK_BOKSTAVER_EFTER_BRF;
}

/**
 * Filtrerar på bokstäver efter «Brf ».
 * Skapade föreningar visas först när minst MIN_SOK_BOKSTAVER_EFTER_BRF tecken skrivits.
 */
export function filtreraForeningarPaSok(
  foreningar: ForeningProfil[],
  soktext: string,
): ForeningProfil[] {
  if (sokKräverFlerBokstaver(soktext, foreningar)) {
    return [];
  }

  const q = soktext.trim();
  if (!q || normaliseraForeningsNamn(q) === "brf") {
    return foreningar;
  }

  const nyckel = normaliseraForeningsNamn(q);
  const nyckelUtanBrf = nyckel.replace(/^brf\s+/, "");

  return foreningar.filter((f) => {
    const namn = normaliseraForeningsNamn(f.namn);
    const namnUtanBrf = namn.replace(/^brf\s+/, "");
    return (
      namn.includes(nyckel) ||
      namnUtanBrf.includes(nyckelUtanBrf) ||
      namnUtanBrf.startsWith(nyckelUtanBrf)
    );
  });
}

/** Säkerställer att söktexten börjar med «Brf » (behåller användarens fortsättning). */
export function normaliseraBrfSoktext(varde: string): string {
  const utanPrefix = varde.replace(/^brf\s*/i, "");
  return `${INLOGGNING_BRF_PREFIX}${utanPrefix}`;
}
