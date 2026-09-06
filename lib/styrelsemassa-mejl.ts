import { PROVA_GRATIS_PATH } from "@/lib/skapa-testforening-lank";

export function byggStyrelsemassaLankMejl(opts: {
  till: string;
  foreningsNamn: string;
  kontaktperson?: string;
  basUrl: string;
}): { till: string; amne: string; brodtext: string } {
  const lank = `${opts.basUrl.replace(/\/$/, "")}${PROVA_GRATIS_PATH}`;
  const hälsning = opts.kontaktperson?.trim()
    ? `Hej ${opts.kontaktperson.trim()},`
    : "Hej,";

  return {
    till: opts.till,
    amne: `Prova Styrelse-Navet — ${opts.foreningsNamn}`,
    brodtext: [
      hälsning,
      "",
      `Tack för att ni visade intresse för Styrelse-Navet (${opts.foreningsNamn}).`,
      "",
      "Här kan ni skapa er förening och prova plattformen gratis i 30 dagar —",
      "underhållsplan, upphandling och styrelsestöd samlat på ett ställe:",
      "",
      lank,
      "",
      "Ingen bindning under provperioden. När ni är redo kan ni teckna avtal.",
      "",
      "Hör av er om ni har frågor.",
      "",
      "Med vänlig hälsning",
      "Styrelse-Navet",
    ].join("\n"),
  };
}
