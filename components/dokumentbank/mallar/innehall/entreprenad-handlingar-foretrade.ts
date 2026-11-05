/**
 * Rangordning vid motsägelser mellan handlingar (högsta prioritet först).
 * Anbudsgenomgång överst — entreprenörens anbud sist.
 */
export const ENTREPRENAD_HANDLINGAR_FORETRADE = [
  "Anbudsgenomgång",
  "Detta entreprenadkontrakt",
  "Allmänna bestämmelser (AB 04 eller ABT 06 enligt avtal)",
  "Administrativa föreskrifter (AF)",
  "Förfrågningsunderlag / teknisk beskrivning",
  "Ritningar och tekniska specifikationer",
  "Bilaga tidsplan entreprenad",
  "Bilaga lyftplan entreprenad",
  "Kontrollplan / egenkontroll",
  "Entreprenörens anbud",
] as const;

export function entreprenadHandlingarForetradeText(): string {
  return ENTREPRENAD_HANDLINGAR_FORETRADE.map(
    (rad, index) => `${index + 1}. ${rad}`,
  ).join("\n");
}

export const ENTREPRENAD_HANDLINGAR_FORKLARING =
  "Vid motsägelser gäller handlingarna i ovan ordning (1 har företräde framför 2, osv.). Entreprenörens anbud har lägst prioritet.";
