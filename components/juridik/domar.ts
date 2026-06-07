/** Dom-mapp i juridikbiblioteket — utökas med fler poster vid behov. */
export type DomMappDefinition = {
  id: string;
  titel: string;
  beskrivning: string;
  vägledning: string;
};

export const domMappar: DomMappDefinition[] = [
  {
    id: "ytskikt",
    titel: "Medlemmens ansvar för ytskikt i lägenheten",
    beskrivning:
      "Gränsen mellan föreningens och medlemmens underhållsansvar för golv, väggar och tak i lägenheten.",
    vägledning:
      "Domar i denna mapp handlar ofta om vad som räknas som ytskikt, när medlemmen ska stå för renovering och när föreningen kan kräva åtgärd. Ladda upp aktuell dom så styrelsen kan läsa hela texten.",
  },
  {
    id: "rokkanaler",
    titel: "Rökkanaler och eldstäder",
    beskrivning:
      "Ansvar för skorsten, rökkanal, inspektion och säkerhet kring eldstäder och kamin.",
    vägledning:
      "Här samlas domar om vem som ansvarar för sotning, besiktning och fel som uppstår i samband med eldstäder. Styrelsen kan jämföra med föreningens stadgar och försäkring.",
  },
  {
    id: "storningar",
    titel: "Störningar i bostaden",
    beskrivning:
      "När föreningen får ingripa vid störning, buller och brukande av lägenheten.",
    vägledning:
      "Mappen innehåller vägledande avgöranden om störningsärenden, varningar och i vissa fall åtgärder mot medlem. Ladda upp domar som är relevanta för er hantering.",
  },
  {
    id: "tilltrade",
    titel: "Tillträde till lägenhet",
    beskrivning:
      "Styrelsens och entreprenörers rätt att komma in vid underhåll, kontroll eller akut åtgärd.",
    vägledning:
      "Domar om avisering, nödtillträde och medlemmens skyldighet att medverka. Bra underlag inför stambyte, besiktning eller felanmälan.",
  },
  {
    id: "vatten-skador",
    titel: "Vatten- och fuktskador",
    beskrivning:
      "Ansvar när läckage eller fukt uppstår mellan lägenheter eller från stammar.",
    vägledning:
      "Avgöranden om skadestånd, fördelning mellan förening och medlem och bevisning vid fuktskador. Styrelsen kan spara domar som liknar aktuella ärenden i huset.",
  },
];

export function skapaDokumentId(): string {
  return `dom-${Date.now()}`;
}
