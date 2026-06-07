import {
  formateraStyrelseKontaktBlock,
  hamtaStyrelseKontakt,
} from "@/lib/styrelse-kontakt";

/** Standardvillkor som ska framgå i upphandling av städ och fastighetsskötsel. */
export const driftUpphandlingsVillkorRubrik =
  "Avtalsvillkor — städning och fastighetsskötsel (ska ingå i förfrågan/kontrakt)";

export const driftUpphandlingsVillkorPunkter = [
  "Utebliven städning eller rondering enligt bifogat schema kan medföra vite enligt avtal. Omfattning och belopp anges i kontraktsunderlaget.",
  "Städning och fastighetsskötsel ska utföras av det företag som anges i anbudet, eller av godkänd underentreprenör som entreprenören redovisat och styrelsen godkänt.",
  "Städpersonal ska bära synlig ID06-legitimation i fastigheten.",
  "Fastighetsskötare ska bära synlig ID06-legitimation i fastigheten.",
  "Bifogade scheman (städschema respektive ronderingsschema) är bindande underlag för vad som ska utföras vid varje besök.",
] as const;

export function genereraDriftUpphandlingsVillkorText(): string {
  const kontakt =
    typeof window !== "undefined" ? hamtaStyrelseKontakt() : null;
  const rader = [
    driftUpphandlingsVillkorRubrik,
    "",
    ...driftUpphandlingsVillkorPunkter.map((p, i) => `${i + 1}. ${p}`),
    "",
    formateraStyrelseKontaktBlock(kontakt).trimEnd(),
    "— Genererat från BRF-plattformens rondering- och städmodul.",
  ];
  return rader.join("\n");
}
