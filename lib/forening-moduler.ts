/** Styrelsemodulerna — samma lista överallt. Föreningsuppgifter ligger i menyn, inte som hubb-kort. */

export type ForeningModulDef = {
  /** Stabil id (sökväg utan /forening) */
  id: string;
  title: string;
  description: string;
  path: string;
  icon: string;
  /** False = syns i menyn/sidan men inte som modul-kort på föreningshubben. */
  visaPaHubb?: boolean;
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
    title: "Medlemmar & lägenhetsarkiv",
    description:
      "Lägenhetsarkiv, renoveringsanmälan och utskick — aktuell information och historik per lägenhet.",
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
    id: "felanmalan",
    title: "Felanmälan",
    description:
      "Medlemmar mejlar in fel — förvaltaren prioriterar, tilldelar och skickar vidare till entreprenör eller fastighetsskötare.",
    path: "/felanmalan",
    icon: "📨",
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
      "Egna entreprenörer med de uppgifter ni behöver — och mejl till Styrelse-Navet om ni vill fråga om en entreprenör.",
    path: "/entreprenorer",
    icon: "🏗️",
    visaPaHubb: false,
  },
  {
    id: "dokumentbank",
    title: "Dokumentbank",
    description:
      "Mallar och avtal (ABT 06, AB 04, ABK 09 m.m.) — skapa kopior med föreningsuppgifter ifyllda.",
    path: "/dokumentbank",
    icon: "📄",
    visaPaHubb: false,
  },
  {
    id: "uppgifter",
    title: "Föreningsuppgifter",
    description:
      "Adress, styrelse och övriga fakta om föreningen — samlade på ett ställe.",
    path: "/uppgifter",
    icon: "🏢",
    visaPaHubb: false,
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

/** Moduler som visas som kort på föreningshubben. Entreprenörer och föreningsuppgifter ligger i menyn. */
export function hubbModuler(): ForeningModulDef[] {
  return FORENING_MODULER.filter((m) => m.visaPaHubb !== false);
}

/** Standard: de fyra översta hubb-modulerna. */
export const STANDARD_SNABBVAG_IDS = hubbModuler()
  .slice(0, SNABBVAG_ANTAL)
  .map((m) => m.id);

export function hamtaModul(id: string): ForeningModulDef | undefined {
  return FORENING_MODULER.find((m) => m.id === id);
}
