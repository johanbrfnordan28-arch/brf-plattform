import type { UtfördRenovering } from "@/components/underhallsplan/renoveringar";

export type TestplanRenoveringId =
  | "test-1900"
  | "test-50"
  | "test-70"
  | "test-90";

const importerad = "2026-02-01";

function forv(
  post: Omit<UtfördRenovering, "kalla" | "importeradDatum">,
): UtfördRenovering {
  return {
    ...post,
    kalla: "ekonomisk_forvaltare",
    importeradDatum: importerad,
  };
}

/** Brf Hagalund — sekelskifte, 15 lgh */
const renoveringar1900: UtfördRenovering[] = [
  forv({
    id: "1900-tak-2012",
    komponent: "Tak",
    ar: 2012,
    titel: "Takomläggning tegel",
    omfattning: "Omläggning av tegeltak, skorsten och plåtdetaljer.",
    kostnadKr: 920_000,
    entreprenor: "Tak & Mur AB",
  }),
  forv({
    id: "1900-fonster-2015",
    komponent: "Fasad",
    ar: 2015,
    titel: "Fönsterrenovering fasad",
    omfattning: "Renovering av kopplade träfönster, nya beslag och tätning.",
    kostnadKr: 680_000,
    entreprenor: "Fönsterhantverkarna",
  }),
  forv({
    id: "1900-kallare-2005",
    komponent: "Källare",
    ar: 2005,
    titel: "Källarytskikt och el",
    omfattning: "Målning källargångar, nya armaturer och jordfelsbrytare.",
    kostnadKr: 395_000,
  }),
  forv({
    id: "1900-vvs-2008",
    komponent: "VVS",
    ar: 2008,
    titel: "Stamspolning och injustering",
    omfattning: "Spolning av avloppsstammar, ventiler och radiatorer.",
    kostnadKr: 185_000,
  }),
  forv({
    id: "1900-trapphus-1998",
    komponent: "Trapphus",
    ar: 1998,
    titel: "Eldragning gemensamma utrymmen",
    omfattning: "Ny el i trapphus, källare och soprum.",
    kostnadKr: 120_000,
  }),
];

/** Brf Tallvinden — 50-tal, 25 lgh */
const renoveringar50: UtfördRenovering[] = [
  forv({
    id: "50-stambyte-1998",
    komponent: "VVS",
    ar: 1998,
    titel: "Stambyte VVS (klumpsumma)",
    omfattning:
      "Samlad faktura: byte av tappvatten, avlopp, radiatorer och etablering i samtliga lägenheter.",
    kostnadKr: 2_850_000,
    entreprenor: "Rörservice Nord",
    klumpsumma: true,
  }),
  forv({
    id: "50-fonster-etapper",
    komponent: "Fasad",
    ar: 2016,
    titel: "Fönsterbyte i etapper",
    omfattning: "Väster 2016, öst 2018, syd och nord 2020.",
    kostnadKr: 1_200_000,
    entreprenor: "Fönsterhantverkarna",
    etapper: [
      { ar: 2016, andel: 0.25, omfattning: "Västerfasad", del: "Fönster väster" },
      { ar: 2018, andel: 0.25, omfattning: "Östfasad", del: "Fönster öst" },
      {
        ar: 2020,
        andel: 0.5,
        omfattning: "Syd- och nordfasad",
        del: "Fönster syd och nord",
      },
    ],
  }),
  forv({
    id: "50-tak-2010",
    komponent: "Tak",
    ar: 2010,
    titel: "Takomläggning papp",
    omfattning: "Ny pappbeläggning, skorsten och takrännor.",
    kostnadKr: 780_000,
  }),
  forv({
    id: "50-vent-2017",
    komponent: "Ventilation",
    ar: 2017,
    titel: "OVK och ventilationsfläktar",
    omfattning: "Byte av frånluftsfläktar, kanalrengöring och injustering.",
    kostnadKr: 290_000,
  }),
  forv({
    id: "50-balkong-2020",
    komponent: "Fasad",
    ar: 2020,
    titel: "Balkongtätning etapp 1",
    omfattning: "Tätning och plattbeläggning västerfasad, 12 balkonger.",
    kostnadKr: 200_000,
  }),
  forv({
    id: "50-fasad-2013",
    komponent: "Fasad",
    ar: 2013,
    titel: "Fönstermålning fasad",
    omfattning: "Målning träfönster och balkongfront.",
    kostnadKr: 340_000,
  }),
  forv({
    id: "50-tvatt-2015",
    komponent: "Källare",
    ar: 2015,
    titel: "Renovering tvättstuga",
    omfattning: "Nya maskiner, golv och belysning.",
    kostnadKr: 265_000,
  }),
];

/** Brf Parklyckan — 70-tal, 45 lgh */
const renoveringar70: UtfördRenovering[] = [
  forv({
    id: "70-klump-tak-fasad",
    komponent: "Tak",
    ar: 2019,
    titel: "Totalentreprenad tak och fasad",
    omfattning:
      "Klumpsumma: omläggning tak inkl. takfönster och plåt, samt tvätt och ommålning putsad fasad.",
    kostnadKr: 2_470_000,
    entreprenor: "Tak & Plåt AB",
    klumpsumma: true,
  }),
  forv({
    id: "70-hiss-2014",
    komponent: "Trapphus",
    ar: 2014,
    titel: "Hissmodernisering",
    omfattning: "Modernisering av hiss, nya dörrar och styrsystem.",
    kostnadKr: 795_000,
    entreprenor: "KONE Service",
  }),
  forv({
    id: "70-tvatt-2011",
    komponent: "Källare",
    ar: 2011,
    titel: "Renovering tvättstuga",
    omfattning: "Nya maskiner, kakel och belysning.",
    kostnadKr: 380_000,
  }),
  forv({
    id: "70-vvs-2008",
    komponent: "VVS",
    ar: 2008,
    titel: "Stamspolning",
    omfattning: "Spolning av avloppsstammar och injustering radiatorer.",
    kostnadKr: 220_000,
  }),
  forv({
    id: "70-vent-2017",
    komponent: "Ventilation",
    ar: 2017,
    titel: "Ventilationsbalansering",
    omfattning: "Injustering och filterbyte.",
    kostnadKr: 95_000,
  }),
];

/** Brf Strandskatan — 90-tal, 60 lgh */
const renoveringar90: UtfördRenovering[] = [
  forv({
    id: "90-vent-2022",
    komponent: "Ventilation",
    ar: 2022,
    titel: "FTX-filter och injustering",
    omfattning: "Filterbyte, kanalinspektion och injustering per trapphus.",
    kostnadKr: 185_000,
  }),
  forv({
    id: "90-mark-2019",
    komponent: "Mark och gård",
    ar: 2019,
    titel: "Asfaltering gård",
    omfattning: "Ny asfalt på gård och infart, dränering vid fasad.",
    kostnadKr: 420_000,
  }),
  forv({
    id: "90-trapphus-2016",
    komponent: "Trapphus",
    ar: 2016,
    titel: "Byte passagebelysning",
    omfattning: "LED-belysning och rörelsesensorer i trapphus.",
    kostnadKr: 285_000,
  }),
  forv({
    id: "90-tak-2012",
    komponent: "Tak",
    ar: 2012,
    titel: "Underhåll takterrass",
    omfattning: "Tätning, klinker och räcken gemensam takterrass.",
    kostnadKr: 310_000,
  }),
  forv({
    id: "90-tvatt-2018",
    komponent: "Källare",
    ar: 2018,
    titel: "Uppgradering tvättstugor",
    omfattning: "Nya tvättmaskiner och betalterminaler i båda husen.",
    kostnadKr: 520_000,
  }),
];

const renoveringarPerTestplan: Record<TestplanRenoveringId, UtfördRenovering[]> = {
  "test-1900": renoveringar1900,
  "test-50": renoveringar50,
  "test-70": renoveringar70,
  "test-90": renoveringar90,
};

export function hamtaTestplanRenoveringar(
  id: TestplanRenoveringId,
): UtfördRenovering[] {
  return renoveringarPerTestplan[id] ?? [];
}
