import type { UtfördRenovering } from "@/components/underhallsplan/renoveringar";

export type TestplanRenoveringId =
  | "test-1900"
  | "test-50"
  | "test-70"
  | "test-90"
  | "test-sailor"
  | "test-nordan-28"
  | "test-nordan-30";

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

/** Brf Nordan 28 — tidigt 1900-tal, 18 lgh */
const renoveringarNordan28: UtfördRenovering[] = [
  forv({
    id: "n28-stambyte-1996",
    komponent: "VVS",
    ar: 1996,
    titel: "Stambyte (klumpsumma)",
    omfattning:
      "Klumpsumma: byte av tappvatten och avlopp, radiatoråtgärder samt etablering i samtliga lägenheter.",
    kostnadKr: 3_650_000,
    entreprenor: "Rör & Bad AB",
    klumpsumma: true,
  }),
  forv({
    id: "n28-tak-2011",
    komponent: "Tak",
    ar: 2011,
    titel: "Takomläggning (klumpsumma)",
    material: "tegel",
    omfattning:
      "Samlad faktura: omläggning tegeltak, plåtdetaljer och åtgärd skorstenar.",
    kostnadKr: 1_180_000,
    entreprenor: "Tak & Mur AB",
    klumpsumma: true,
    inkluderadeUnderkomponenter: ["skorsten"],
    kommandeAtgardOverrides: {
      "n28-tak-2011": {
        läge: "avvikande",
        atgardId: "takmalning",
        intervallAr: 10,
        nastaAr: 2026,
        kostnadAndel: 0.15,
      },
    },
  }),
  forv({
    id: "n28-fonster-2016",
    komponent: "Fönster",
    underkomponentId: "fonster",
    ar: 2016,
    titel: "Fönsterrenovering",
    omfattning: "Renovering av träfönster i gatufasad, målning och tätning.",
    kostnadKr: 540_000,
    kommandeAtgardOverrides: {
      "n28-fonster-2016": {
        läge: "avvikande",
        atgardId: "fonster-malning",
        intervallAr: 12,
        nastaAr: 2028,
        kostnadAndel: 0.18,
      },
    },
  }),
  forv({
    id: "n28-fasad-2019",
    komponent: "Fasad",
    ar: 2019,
    titel: "Fasadtvätt och putsreparation",
    material: "tegel-putsband",
    omfattning: "Tvätt, lagning sprickor och ommålning sockel.",
    kostnadKr: 320_000,
  }),
];

/** Brf Nordan 30 — tidigt 1900-tal, 24 lgh */
const renoveringarNordan30: UtfördRenovering[] = [
  forv({
    id: "n30-stambyte-2002",
    komponent: "VVS",
    ar: 2002,
    titel: "Stambyte etapp 1–2 (klumpsumma)",
    omfattning:
      "Klumpsumma: stambyte i två etapper inkl. tappvatten, avlopp och radiatorinjustering.",
    kostnadKr: 4_450_000,
    entreprenor: "Stamprojekt i Norden",
    klumpsumma: true,
  }),
  forv({
    id: "n30-tak-2010",
    komponent: "Tak",
    ar: 2010,
    titel: "Takomläggning (klumpsumma)",
    omfattning: "Samlad faktura: omläggning tak, plåt, rännor och säkerhetsdetaljer.",
    kostnadKr: 1_520_000,
    klumpsumma: true,
  }),
  forv({
    id: "n30-balkonger-2018",
    komponent: "Balkonger",
    ar: 2018,
    titel: "Balkongtätning",
    omfattning: "Tätning och fallspackel på balkonger mot gård.",
    kostnadKr: 390_000,
  }),
  forv({
    id: "n30-trapphus-2020",
    komponent: "Trapphus",
    ar: 2020,
    titel: "Målning trapphus",
    omfattning: "Spackling och målning väggar och snickerier.",
    kostnadKr: 260_000,
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
    material: "bitumen-tatskiktsmatta",
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

/** Brf Sailor — nyproduktion 2013, 36 lgh */
const renoveringarSailor: UtfördRenovering[] = [
  forv({
    id: "sailor-vent-2023",
    komponent: "Ventilation",
    ar: 2023,
    titel: "FTX-filter och kanalrengöring",
    omfattning: "Filterbyte, kanalinspektion och injustering i alla tre hus.",
    kostnadKr: 142_000,
  }),
  forv({
    id: "sailor-tvatt-2021",
    komponent: "Källare",
    ar: 2021,
    titel: "Uppgradering tvättstuga",
    omfattning: "Nya maskiner, betalterminal och LED-belysning gemensam tvätt.",
    kostnadKr: 385_000,
    entreprenor: "Tvätt & Service i Stockholm",
  }),
  forv({
    id: "sailor-mark-2020",
    komponent: "Mark och gård",
    ar: 2020,
    titel: "Gård och lekplats",
    omfattning: "Ny asfalt infart, komplettering lekplats och belysning.",
    kostnadKr: 295_000,
  }),
  forv({
    id: "sailor-trapphus-2019",
    komponent: "Trapphus",
    ar: 2019,
    titel: "Målning trapphus",
    omfattning: "Spackling och målning väggar i samtliga trapphus.",
    kostnadKr: 168_000,
  }),
  forv({
    id: "sailor-fasad-2018",
    komponent: "Fasad",
    ar: 2018,
    titel: "Fasadtvätt och balkonger",
    material: "tunnputs",
    omfattning: "Tvätt tunnputs, kontroll fogar och tätning balkonger väster och syd.",
    kostnadKr: 215_000,
    entreprenor: "Fasadpartner Syd",
  }),
  forv({
    id: "sailor-garage-2017",
    komponent: "Komplement byggnad och P-platser",
    ar: 2017,
    titel: "Underhåll garage",
    omfattning: "Målning väggar, ny belysning och märkning p-platser.",
    kostnadKr: 125_000,
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
  "test-nordan-28": renoveringarNordan28,
  "test-nordan-30": renoveringarNordan30,
  "test-50": renoveringar50,
  "test-70": renoveringar70,
  "test-90": renoveringar90,
  "test-sailor": renoveringarSailor,
};

export function hamtaTestplanRenoveringar(
  id: TestplanRenoveringId,
): UtfördRenovering[] {
  return renoveringarPerTestplan[id] ?? [];
}
