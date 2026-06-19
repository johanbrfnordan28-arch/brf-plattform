export type SbaChecklistaPunkt = {
  id: string;
  text: string;
};

export type SbaChecklistaSektion = {
  id: string;
  etikett: string;
  beskrivning?: string;
  punkter: SbaChecklistaPunkt[];
};

/** Checklista för systematiskt brandskyddsarbete (SBA) — delad av guider och formulär. */
export const sbaChecklistaSektioner: SbaChecklistaSektion[] = [
  {
    id: "forbyggande",
    etikett: "Löpande förbyggande",
    beskrivning: "Årlig kontroll och vid behov utökning — brandvarnare, släckutrustning och skyltning.",
    punkter: [
      {
        id: "brandvarnare-arlig",
        text: "Brandvarnare kontrolleras årligen — funktion, signal och batteribyte enligt tillverkarens anvisning.",
      },
      {
        id: "brandvarnare-utoka",
        text: "Behov av fler brandvarnare eller uppgradering bedöms vid kontroll — särskilt efter ombyggnad eller ändrad planlösning.",
      },
      {
        id: "brandslackare-arlig",
        text: "Handbrandsläckare och brandsläckare kontrolleras årligen — giltighet, tryck, plombering och att utrustningen finns kvar på rätt plats.",
      },
      {
        id: "slack-skyltning",
        text: "Skyltning vid brandsläckare och brandpost är synlig och korrekt.",
      },
      {
        id: "rokgas-test",
        text: "Rökgasevakuering i trapphus — fläktar, spjäll och styrning testade enligt anvisning.",
      },
    ],
  },
  {
    id: "utrymning",
    etikett: "Utrymning och skyltning",
    beskrivning: "Vägvisning på vägg och golv — fria utrymningsvägar.",
    punkter: [
      {
        id: "utrymning-vagg",
        text: "Utrymningsskyltar på väggen är synliga, hela och korrekt placerade.",
      },
      {
        id: "utrymning-golv",
        text: "Vägvisning på golvet (golvmärkning) leder tydligt längs utrymningsvägen.",
      },
      {
        id: "nod-belysning",
        text: "Nödbelysning längs utrymningsvägar fungerar vid prov.",
      },
      {
        id: "utrymning-fri",
        text: "Utrymningsvägar i trapphus, korridorer och källare är fria — inga cyklar, möbler eller förråd blockerar.",
      },
      {
        id: "trapphus-forvaring",
        text: "Ingen förvaring i trapphus som kan orsaka brand eller försvåra utrymning — inga brandfarliga vätskor, sopor eller brännbart material.",
      },
    ],
  },
  {
    id: "branddorrar",
    etikett: "Branddörrar och brandceller",
    punkter: [
      {
        id: "branddorr-funktion",
        text: "Branddörrar och ståldörrar stänger och låser som de ska — inga kilar, tejp eller permanenta dörrstopp.",
      },
      {
        id: "branddorr-rok",
        text: "Röktäthet kontrollerad: branddörrar ska hindra både eld och rökgasspridning mellan brandceller.",
      },
    ],
  },
  {
    id: "brandfarligt",
    etikett: "Brandfarliga vätskor",
    punkter: [
      {
        id: "brandfarlig-forvaring",
        text: "Brandfarliga vätskor förvaras godkänt — låst/skilda utrymmen enligt regler och föreningens rutiner.",
      },
      {
        id: "brandfarlig-skylt",
        text: "Skylt visar var brandfarlig förvaring finns — synlig vid entré till utrymmet.",
      },
    ],
  },
  {
    id: "organisation",
    etikett: "Organisation och rutiner",
    punkter: [
      {
        id: "sba-plan",
        text: "SBA-plan och ansvarsfördelning är uppdaterad och känd i styrelsen.",
      },
      {
        id: "utbildning-rutiner",
        text: "Styrelse och fastighetsskötare känner till rutiner vid larm, utrymning och vem som kontaktas.",
      },
      {
        id: "avvikelse-uppfoljning",
        text: "Avvikelser från kontroll dokumenteras, åtgärdas och följs upp till nästa rond.",
      },
    ],
  },
  {
    id: "medlemsrenovering",
    etikett: "Medlemmars renovering",
    beskrivning: "Brandskydd ska beaktas när lägenheter renoveras — enklare information räcker ofta vid mindre ingrepp.",
    punkter: [
      {
        id: "medlem-brandcell",
        text: "Ingrepp i brandcellsgränser, branddörrar eller utrymningsvägar kräver styrelsens godkännande enligt SBA-plan.",
      },
      {
        id: "medlem-brandfarligt",
        text: "Medlemmen informeras om hantering av brandfarliga produkter (t.ex. färg, thinner, lack) och ventilation vid renovering.",
      },
      {
        id: "medlem-trapphus",
        text: "Renovering får inte blockera utrymningsvägar eller medföra förvaring/brännbart material i trapphus.",
      },
      {
        id: "medlem-enkel-info",
        text: "Enkel brandskyddsinformation ges till medlemmen vid mindre renovering — risker och vad som kräver styrelsens godkännande.",
      },
    ],
  },
  {
    id: "forening-projekt",
    etikett: "Föreningens projekt",
    beskrivning: "Större projekt kräver brandskyddsdokumentation från entreprenören — mindre projekt kan hanteras med enklare kommunikation.",
    punkter: [
      {
        id: "projekt-mindre-info",
        text: "Vid föreningens mindre projekt: entreprenören informeras skriftligt om fria utrymningsvägar, skydd av branddörrar och tillfällig brandskyddsinformation.",
      },
      {
        id: "projekt-storre-krav",
        text: "Vid större projekt: entreprenören informeras om krav på brandskyddsdokumentation innan arbetet startar.",
      },
      {
        id: "projekt-dokumentation",
        text: "Brandskyddsdokumentation beskriver hur brand förhindras och hur brandspridning minimeras vid brand — levereras före eller under projektet.",
      },
      {
        id: "projekt-dok-sparas",
        text: "Brandskyddsdokumentation och protokoll sparas i rätt projektmapp och under Föreningsinformation → SBA.",
      },
    ],
  },
];

export function sbaChecklistaPunkter(): SbaChecklistaPunkt[] {
  return sbaChecklistaSektioner.flatMap((s) => s.punkter);
}

export function sbaChecklistaPunkterSomText(): string[] {
  return sbaChecklistaPunkter().map((p) => p.text);
}

export function hamtaSbaPunkt(id: string): SbaChecklistaPunkt | undefined {
  return sbaChecklistaPunkter().find((p) => p.id === id);
}
