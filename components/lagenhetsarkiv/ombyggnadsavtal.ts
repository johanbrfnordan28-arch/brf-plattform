import {
  grupperaMedlemsKrav,
  type MedlemsKravPunkt,
} from "@/components/lagenhetsarkiv/medlems-krav";

export type OmbyggnadsavtalMeta = {
  foreningsnamn: string;
  lagenhetsnummer: string;
  mappNamn: string;
  mallEtikett: string;
  datum: string;
};

/** Bygger läsbart ombyggnadsavtal från valda kravmoment. */
export function byggOmbyggnadsavtalText(
  punkter: MedlemsKravPunkt[],
  meta: OmbyggnadsavtalMeta,
): string {
  const grupper = grupperaMedlemsKrav(punkter);
  const rader: string[] = [
    "OMBYGGNADSAVTAL",
    "================",
    "",
    `Förening: ${meta.foreningsnamn || "(ej angiven)"}`,
    `Lägenhet: ${meta.lagenhetsnummer}`,
    `Renovering: ${meta.mappNamn} (${meta.mallEtikett})`,
    `Datum: ${meta.datum}`,
    "",
    "Detta avtal anger vilka krav medlemmen ska uppfylla före, under och efter",
    "renoveringen. Styrelsen har granskat utkastet innan det skickas till medlemmen",
    "för godkännande och signering med BankID.",
    "",
    "KRAVMOMENT",
    "----------",
  ];

  if (grupper.length === 0) {
    rader.push("(Inga moment valda.)");
  } else {
    for (const grupp of grupper) {
      rader.push("");
      rader.push(grupp.sektionEtikett.toUpperCase());
      for (const punkt of grupp.punkter) {
        rader.push(`• ${punkt.text}`);
      }
    }
  }

  rader.push(
    "",
    "ÖVRIGT",
    "------",
    "• Skriftlig beställning/avtal med entreprenör ska finnas innan arbetet startar.",
    "• Handlingar som ska lämnas före respektive efter renoveringen följs upp i",
    "  renoveringsmappen (se avsnittet Handlingar).",
    "• Medlemmen bekräftar kraven genom BankID-signering.",
    "",
  );

  return rader.join("\n");
}
