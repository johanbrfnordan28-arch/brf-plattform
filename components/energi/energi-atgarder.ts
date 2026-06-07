export type EnergiAtgard = {
  id: string;
  titel: string;
  beskrivning: string;
  /** Påverkar främst driftkostnad, livslängd eller båda */
  effekt: "drift" | "livslangd" | "bade";
  tips?: string;
};

export const energiVarmeAtgarder: EnergiAtgard[] = [
  {
    id: "injustering",
    titel: "Injustering och balansering",
    beskrivning:
      "Radiatorer och stamventiler justeras så värme fördelas jämnt — mindre onödig gångtid och färre klagomål om kyla.",
    effekt: "bade",
    tips: "Koppla till rondering av undercentral (tryck, läckage) och planerat stamventilsbyte i underhållsplanen.",
  },
  {
    id: "styrning",
    titel: "Styrning och natt-/helgsänkning",
    beskrivning:
      "Tidsprogram i trapphus, garage och gemensamma utrymmen — värme där det behövs, inte mer.",
    effekt: "drift",
  },
  {
    id: "tryck-lackage",
    titel: "Tryck och läckage i systemet",
    beskrivning:
      "Tappar systemet tryck ofta behövs utredning — onödig påfyllning kostar både energi och slitage.",
    effekt: "bade",
    tips: "Se moment Teknikutrymmen i ronderingsschemat.",
  },
  {
    id: "isolering-ror",
    titel: "Isolering av stamledningar",
    beskrivning:
      "Oisolerade rör i källare och teknikutrymmen ger värmeförluster året om.",
    effekt: "drift",
  },
];

export const energiBelysningAtgarder: EnergiAtgard[] = [
  {
    id: "led-trapphus",
    titel: "LED i trapphus och garage",
    beskrivning:
      "Byte till LED sänker elförbrukningen kraftigt jämfört med äldre lysrör och glödlampor.",
    effekt: "bade",
    tips: "Tekniskt armaturbyte planeras i underhållsplanen; energibesparingen kommer direkt.",
  },
  {
    id: "rorelse-styrning",
    titel: "Rörelsevakt och dagsljusstyrning",
    beskrivning:
      "Entréer, källargångar och garage — ljus när någon är där, annars dämpat eller av.",
    effekt: "drift",
  },
  {
    id: "underhall-armatur",
    titel: "Rengöring och byte av trasiga armaturer",
    beskrivning:
      "Smutsiga armaturer och flimrande lampor ger sämre ljus och ibland högre förbrukning.",
    effekt: "livslangd",
    tips: "Kontrolleras vid rondering (Belysning utvändigt/invändigt) och städ.",
  },
  {
    id: "styrning-tid",
    titel: "Rätt tider för utomhusbelysning",
    beskrivning:
      "Gård och fasad — anpassa tider efter säsong så belysning inte står på i onödan.",
    effekt: "drift",
  },
];
