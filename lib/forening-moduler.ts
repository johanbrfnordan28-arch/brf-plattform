/** De 12 styrelsemodulerna — samma lista överallt på föreningssidor. */

export type ForeningModulDef = {
  /** Stabil id (sökväg utan /forening) */
  id: string;
  title: string;
  description: string;
  path: string;
  icon: string;
};

export const FORENING_MODULER: ForeningModulDef[] = [
  {
    id: "arshjul",
    title: "Årshjul",
    description:
      "Årets uppgifter och påminnelser i en tydlig översikt.",
    path: "/arshjul",
    icon: "📅",
  },
  {
    id: "foreningsinformation",
    title: "Styrning och Dokument",
    description:
      "Styrelsearkiv, stadgar, protokoll och andra dokument, samlade och sökbara.",
    path: "/foreningsinformation",
    icon: "📁",
  },
  {
    id: "medlemmar",
    title: "Medlemmar & lägenhetsarkiv",
    description:
      "Lägenhetsarkiv, renoveringsanmälningar och utskick, med information och historik för varje lägenhet.",
    path: "/medlemmar",
    icon: "👥",
  },
  {
    id: "underhallsplan",
    title: "Underhållsplan",
    description:
      "Komponentregister, renoveringshistorik och planerat underhåll som underlag för styrelsens beslut.",
    path: "/underhallsplan",
    icon: "🔧",
  },
  {
    id: "felanmalan",
    title: "Felanmälan",
    description:
      "Medlemmar anmäler fel, och förvaltaren prioriterar och skickar vidare till entreprenör eller fastighetsskötare.",
    path: "/felanmalan",
    icon: "📨",
  },
  {
    id: "rondering",
    title: "Rondering & avvikelser",
    description:
      "Checklistor, signering och avvikelser som gör städning och skötsel lättare att följa upp.",
    path: "/rondering",
    icon: "✅",
  },
  {
    id: "upphandling",
    title: "Upphandling",
    description:
      "Aktuella uppdrag via Styrelse-Navet. Inbjudna entreprenörer får underlaget och skickar sina anbud till oss.",
    path: "/upphandling",
    icon: "📋",
  },
  {
    id: "projekt",
    title: "Projekt",
    description:
      "En mapp per år för handlingar från pågående och avslutade projekt.",
    path: "/projekt",
    icon: "📐",
  },
  {
    id: "entreprenorer",
    title: "Entreprenörer",
    description:
      "Egna kontakter och rekommenderade entreprenörer som ni kan söka bland, lägga till och ta bort.",
    path: "/entreprenorer",
    icon: "🏗️",
  },
  {
    id: "uppgifter",
    title: "Föreningsuppgifter",
    description:
      "Adress, styrelse och andra grundfakta om föreningen.",
    path: "/uppgifter",
    icon: "🏢",
  },
  {
    id: "juridik",
    title: "Juridik",
    description: "Vägledning och mallar för styrelseärenden och avtal.",
    path: "/juridik",
    icon: "⚖️",
  },
  {
    id: "guider",
    title: "Guider & tips",
    description:
      "Korta filmer och råd om funktionerna, upphandling och entreprenörer.",
    path: "/guider",
    icon: "🎬",
  },
];

export const SNABBVAG_ANTAL = 4;

/** Standard: de fyra översta modulerna i 12-listan. */
export const STANDARD_SNABBVAG_IDS = FORENING_MODULER.slice(
  0,
  SNABBVAG_ANTAL,
).map((m) => m.id);

export function hamtaModul(id: string): ForeningModulDef | undefined {
  return FORENING_MODULER.find((m) => m.id === id);
}
