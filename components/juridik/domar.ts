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
      "Här ingår bland annat Högsta domstolens avgörande T 175-19 (NJA 2019 s. 1013) om läckande yttertak och vem som bekostar spackling och målning. Domar i mappen handlar ofta om vad som räknas som ytskikt, när medlemmen ska stå för renovering och när föreningen kan kräva åtgärd. Använd som underlag inför styrelsebeslut — inte som färdigt beslut.",
  },
  {
    id: "rokkanaler",
    titel: "Rökkanaler och eldstäder",
    beskrivning:
      "Ansvar för skorsten, rökkanal, inspektion och säkerhet kring eldstäder och kamin.",
    vägledning:
      "Här ingår bland annat Högsta domstolens avgörande Ö 3206-13 (NJA 2015 s. 566, »Trudhems skorstensstock«): rökkanal och skorstensstock hör till huset, inte till lägenheten, så medlem får inte ansluta kamin utan föreningens tillstånd. Domar i mappen handlar ofta om tillstånd vid installation, underhåll av rökgångar, sotning och brandskydd. Jämför alltid med era stadgar och försäkring — använd som underlag inför styrelsebeslut, inte som färdigt beslut.",
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
  {
    id: "grannfastighet",
    titel: "Skada på grannfastighet",
    beskrivning:
      "När läckage eller bristfällig anläggning på föreningens fastighet skadar granne — gård, dagvatten och grannelagsrätt.",
    vägledning:
      "Här ingår bland annat Högsta domstolens avgörande T 3372-20 (NJA 2021 s. 473, »Grannhusets vattenskada«): trasig dagvattenledning på BRF:s gård orsakade vatteninträngning hos grannen. Föreningen blev skadeståndsskyldig för att den inte i tillräcklig utsträckning kontrollerat en gammal anläggning — hänsynskravet i jordabalken. Domar i mappen handlar ofta om grannansvar, underhåll av ledningar på gården och när oaktsam underlåtenhet räcker för ersättning. Använd som underlag inför styrelsebeslut — inte som färdigt beslut.",
  },
];

export function skapaDokumentId(): string {
  return `dom-${Date.now()}`;
}
