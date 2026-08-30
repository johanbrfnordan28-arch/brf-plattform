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
      "Här ingår bland annat Högsta domstolens avgörande T 2062-06 (NJA 2007 s. 709, »Fiolbackens vattenskada«): tidigare ägare tog bort fuktspärr i badrummet; nya medlemmar blev inte skadeståndsskyldiga mot föreningen för skadan utanför lägenheten. Domar i mappen handlar ofta om våtrum, läckage, fördelning mellan förening och medlem och när vårdslöshet krävs. Använd som underlag inför styrelsebeslut — inte som färdigt beslut.",
  },
  {
    id: "grannfastighet",
    titel: "Skada på grannfastighet",
    beskrivning:
      "När läckage eller bristfällig anläggning på föreningens fastighet skadar granne — gård, dagvatten och grannelagsrätt.",
    vägledning:
      "Här ingår bland annat Högsta domstolens avgörande T 3372-20 (NJA 2021 s. 473, »Grannhusets vattenskada«): trasig dagvattenledning på BRF:s gård orsakade vatteninträngning hos grannen. Föreningen blev skadeståndsskyldig för att den inte i tillräcklig utsträckning kontrollerat en gammal anläggning — hänsynskravet i jordabalken. Domar i mappen handlar ofta om grannansvar, underhåll av ledningar på gården och när oaktsam underlåtenhet räcker för ersättning. Använd som underlag inför styrelsebeslut — inte som färdigt beslut.",
  },
  {
    id: "varmesystem",
    titel: "Värmesystem",
    beskrivning:
      "Ansvar för radiatorer, värmeledningar och golvvärme — gränsen mellan förening och medlem.",
    vägledning:
      "Här ingår bland annat HD Ö 4023-05 (NJA 2006 s. 732): läckage från värmeledning/radiator är inte »vattenledningsskada« — undantaget i bostadsrättslagen gäller bara tappvatten. Samt HD T 2948-19 (NJA 2020 s. 822, »Knoppens golvvärmesystem«): vattenburen golvvärme under golvbeläggningen hörde till föreningens underhåll. Domar i mappen handlar ofta om värmeledningar, radiatorer och golvvärme. Jämför alltid med era stadgar — använd som underlag inför styrelsebeslut, inte som färdigt beslut.",
  },
  {
    id: "forvaltning",
    titel: "Förvaltning",
    beskrivning:
      "Avtal med förvaltare, reklamation, skadestånd och styrelsens uppföljning av ekonomiska tjänster.",
    vägledning:
      "Här ingår bland annat Högsta domstolens avgörande T 9030-23 (NJA 2025 s. 374, »Brf Ida«): en reklamationsfrist i förvaltningsavtalet ABFF 04 utan angiven påföljd innebar inte att föreningens skadeståndskrav föll. Domar i mappen handlar ofta om förvaltningsavtal, tidsfrister och när krav mot förvaltare behålls. Läs alltid avtalet noga — använd som underlag inför styrelsebeslut, inte som färdigt beslut.",
  },
  {
    id: "foreningsstamma",
    titel: "Föreningsstämma",
    beskrivning:
      "Stämmobeslut, majoritetskrav, klander och vad stämman får — och inte får — besluta.",
    vägledning:
      "Här ingår bland annat HD T 1829-10 (NJA 2012 s. 198): föreningen har bevisbördan för att kvalificerad majoritet krävs vid beslut som menligt påverkar bostadsrätt. Samt HD T 6332-20 (NJA 2021 s. 776): stämman kan inte ensam avbryta särskild granskning i förtid utan samtycke från alla berörda. Domar i mappen handlar ofta om kallelse, röstning, klander och stämmans behörighet. Använd som underlag inför styrelsebeslut — inte som färdigt beslut.",
  },
];

export function skapaDokumentId(): string {
  return `dom-${Date.now()}`;
}
