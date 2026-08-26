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
      "Central vägledning om gränsen mellan föreningens och medlemmens underhållsansvar för golv, väggar och tak. Läs domarna i biblioteket inför dialog med medlem eller juridiskt ombud.",
  },
  {
    id: "rokkanaler",
    titel: "Rökkanaler och eldstäder",
    beskrivning:
      "Ansvar för skorsten, rökkanal, inspektion och säkerhet kring eldstäder och kamin.",
    vägledning:
      "Central vägledning om sotning, besiktning och ansvar kring eldstäder. Jämför med föreningens stadgar och försäkring innan ni fattar beslut.",
  },
  {
    id: "storningar",
    titel: "Störningar i bostaden",
    beskrivning:
      "När föreningen får ingripa vid störning, buller och brukande av lägenheten.",
    vägledning:
      "Vägledande avgöranden om störningsärenden, varningar och möjliga åtgärder. Använd som underlag — styrelsen fattar beslut i ert specifika ärende.",
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
      "Avgöranden om skadestånd, ansvarsfördelning och bevisning vid fuktskador. Jämför med liknande fall i biblioteket innan ni går vidare i processen.",
  },
];

export function skapaDokumentId(): string {
  return `dom-${Date.now()}`;
}
