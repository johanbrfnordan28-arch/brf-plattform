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
      "Översikt över året med påminnelser — så planeringen av styrelsearbetet blir mer överskådlig.",
    path: "/arshjul",
    icon: "📅",
  },
  {
    id: "foreningsinformation",
    title: "Styrning och Dokument",
    description:
      "Styrelsearkiv, stadgar, protokoll och övriga dokument — samlade och sökbara.",
    path: "/foreningsinformation",
    icon: "📁",
  },
  {
    id: "medlemmar",
    title: "Medlemmar",
    description:
      "Renoveringsanmälan, utskick och lägenhetsarkiv med aktuell information och historik per lägenhet.",
    path: "/medlemmar",
    icon: "👥",
  },
  {
    id: "underhallsplan",
    title: "Underhållsplan",
    description:
      "Komponentregister, renoveringshistorik och framtida underhåll — beslutsunderlag som håller över tid.",
    path: "/underhallsplan",
    icon: "🔧",
  },
  {
    id: "energi",
    title: "Energi & drift",
    description:
      "Värme och belysning — energiåtgärder kopplade till teknisk livslängd i underhållsplanen.",
    path: "/energi",
    icon: "⚡",
  },
  {
    id: "rondering",
    title: "Rondering & avvikelser",
    description:
      "Checklistor, signering och avvikelser — så städning och skötsel blir enklare att följa upp.",
    path: "/rondering",
    icon: "✅",
  },
  {
    id: "upphandling",
    title: "Upphandling",
    description:
      "Aktuella uppdrag via Styrelse-Navet — underlag till inbjudna entreprenörer, anbud till oss.",
    path: "/upphandling",
    icon: "📋",
  },
  {
    id: "projekt",
    title: "Projekt",
    description:
      "Projektmappar per år — spara handlingar från pågående och avslutade projekt på ett ställe.",
    path: "/projekt",
    icon: "📐",
  },
  {
    id: "entreprenorer",
    title: "Entreprenörer",
    description:
      "Egna kontakter och rekommenderade entreprenörer — sök, lägg till och ta bort.",
    path: "/entreprenorer",
    icon: "🏗️",
  },
  {
    id: "uppgifter",
    title: "Föreningsuppgifter",
    description:
      "Adress, styrelse och övriga fakta om föreningen — samlade på ett ställe.",
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
