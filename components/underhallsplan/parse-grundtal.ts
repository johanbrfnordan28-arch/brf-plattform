import type { Grunduppgifter } from "@/components/underhallsplan/types";

/** Tolka heltal från svenska fält (mellanslag, nbsp, tusentalsavgränsare). */
export function parseHeltalFranText(text: string): number {
  let s = text.trim().replace(/[\s\u00a0]/g, "");
  if (!s) return 0;
  if (/^\d{1,3}([.,]\d{3})+$/.test(s)) {
    s = s.replace(/[.,]/g, "");
  } else if (s.includes(",")) {
    s = s.replace(",", ".");
  }
  const n = Number.parseFloat(s);
  return Number.isFinite(n) ? Math.round(n) : 0;
}

/** Yta som avsättning kr/m²/år baseras på — boarea + lokalyta. */
export function hamtaAvsattningsYtaM2(grund: Pick<Grunduppgifter, "boarea" | "lokalyta">): number {
  const boarea = parseHeltalFranText(grund.boarea);
  const lokalyta = parseHeltalFranText(grund.lokalyta);
  return boarea + lokalyta;
}
