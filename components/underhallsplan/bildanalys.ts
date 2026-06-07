/** Demo-bild av tak (Unsplash, öppen licens för visning i demo). */
export const demoTakBildFranNatet =
  "https://images.unsplash.com/photo-1600047509807-ba8f99d2cd7e?auto=format&fit=crop&w=900&q=80";

export type StyrelseBedömning = "stammer" | "stammer_inte" | "kontroll_behovs";

export type BildanalysResultat = {
  komponent: string;
  bedömdTyp: string;
  observationer: string[];
  osakerhetsgrad: "låg" | "medel" | "hög";
  förslag: string;
};

export const bildKomponenter = ["Tak", "Fasad", "Trapphus"] as const;

export type BildKomponent = (typeof bildKomponenter)[number];

export function bildKomponentAktiv(
  name: string,
  activeComponents: string[],
): name is BildKomponent {
  return (
    bildKomponenter.includes(name as BildKomponent) &&
    activeComponents.includes(name)
  );
}

export function skapaDemoAnalys(komponent: string): BildanalysResultat {
  if (komponent === "Tak") {
    return {
      komponent: "Tak",
      bedömdTyp: "Tegel- eller betongpannor (demo)",
      observationer: [
        "Möjlig mossa eller missfärgning längs takfot",
        "Ingen uppenbar skada på nock synlig i bilden",
        "Plåtdetaljer kring skorsten bör kontrolleras på plats",
      ],
      osakerhetsgrad: "medel",
      förslag:
        "Jämför med senaste takrenovering i historiken. Boka besiktning om taket inte är dokumenterat nyligen.",
    };
  }
  if (komponent === "Fasad") {
    return {
      komponent: "Fasad",
      bedömdTyp: "Putsad fasad (demo)",
      observationer: [
        "Sprickor eller flagning kan inte uteslutas i nedre del",
        "Färgton avviker möjligen mellan partier",
      ],
      osakerhetsgrad: "hög",
      förslag: "Komplettera med närbilder och fuktmätning vid tveksamhet.",
    };
  }
  if (komponent === "Trapphus") {
    return {
      komponent: "Trapphus",
      bedömdTyp: "Målat trapphus, betong/sten (demo)",
      observationer: ["Slitage i golv kan förekomma i trafikerade zoner"],
      osakerhetsgrad: "låg",
      förslag: "Koppla till planerat underhåll av trapphus enligt komponentregister.",
    };
  }
  return {
    komponent,
    bedömdTyp: "Byggnadsdel (demo)",
    observationer: ["Automatisk analys har begränsad säkerhet utan fler bilder"],
    osakerhetsgrad: "hög",
    förslag: "Föreningen bör verifiera på plats innan beslut.",
  };
}
