/** Standardavtal för konsulttjänster — ABK 09, utan avvikelser. */

export const ABK_09_KORT =
  "Konsulttjänster avtalas enligt ABK 09. Inga avvikelser från någon part.";

export const ABK_09_LANG =
  "Våra konsulttjänster (bland annat teknisk förvaltning, projektledning, skadeutredning, besiktning och upphandlingsstöd) utförs enligt ABK 09 — Allmänna bestämmelser för konsultuppdrag inom arkitekt- och ingenjörsverksamhet. Inga avvikelser från ABK 09 accepteras från någon part.";

export function offertMejlMedAbk09(opts: {
  mottagareNamn?: string;
  forening?: string;
  tjanster: string;
  prisText: string;
  giltigTill?: string;
}): string {
  const namn = opts.mottagareNamn?.trim() || "ni";
  const forening = opts.forening?.trim() || "er förening";
  const giltig = opts.giltigTill?.trim()
    ? `Offerten gäller till ${opts.giltigTill.trim()}.`
    : "Offerten gäller i 30 dagar från detta mejl om inget annat anges.";

  return [
    `Hej ${namn},`,
    "",
    `Tack för er förfrågan gällande ${forening}.`,
    "",
    `Tjänster: ${opts.tjanster}`,
    `Pris / upplägg: ${opts.prisText}`,
    "",
    ABK_09_LANG,
    "",
    giltig,
    "",
    "Hör av er om ni vill gå vidare.",
    "",
    "Med vänlig hälsning",
    "Styrelse-Navet",
  ].join("\n");
}
