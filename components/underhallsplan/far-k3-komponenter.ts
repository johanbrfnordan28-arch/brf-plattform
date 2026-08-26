/**
 * FAR:s vägledning vid övergång K2→K3 — komponentindelning i BRF.
 * Tabell 1 (väsentliga komponenter) och Tabell 2 (exempel nyttjandeperioder).
 * Källa: FAR, "Komponentindelning i bostadsrättsförening".
 */

export type FarK3KomponentId =
  | "stomme"
  | "stam-varme"
  | "stam-va"
  | "fasad"
  | "fonster"
  | "yttertak"
  | "el"
  | "balkong"
  | "ventilation"
  | "hiss"
  | "styr";

export type FarK3Komponent = {
  id: FarK3KomponentId;
  /** FAR:s benämning */
  namn: string;
  /** Ungefärlig andel av anskaffningsvärdet (vägledning) */
  andelMinProcent: number;
  andelMaxProcent: number;
  /** Om komponenten bara finns i vissa byggnader */
  ejAlltid: boolean;
  /** Standard nyttjandeperiod (år) — exempelbyggnad enligt FAR tabell 2 */
  standardNyttjandeperiodAr: number;
  /** Varierar med material/utförande */
  periodAlternativ?: { etikett: string; ar: number }[];
  /**
   * Koppling till underhållsplanens register:
   * komponentnamn + underkomponent-id (första träff används).
   */
  registerKopplingar: { komponentNamn: string; underkomponentId: string }[];
};

/**
 * FAR Tabell 1 — de komponenter som normalt är väsentliga i en BRF.
 * Antal: 8 alltid + upp till 3 villkorliga = max 11.
 */
export const FAR_K3_KOMPONENTER: FarK3Komponent[] = [
  {
    id: "stomme",
    namn: "Stomme och grund",
    andelMinProcent: 60,
    andelMaxProcent: 70,
    ejAlltid: false,
    standardNyttjandeperiodAr: 120,
    periodAlternativ: [
      { etikett: "Betongstomme", ar: 120 },
      { etikett: "Trästomme på betonggrund", ar: 75 },
    ],
    registerKopplingar: [{ komponentNamn: "Stomme", underkomponentId: "stomme" }],
  },
  {
    id: "stam-varme",
    namn: "Stamledning värme",
    andelMinProcent: 6,
    andelMaxProcent: 8,
    ejAlltid: false,
    standardNyttjandeperiodAr: 80,
    registerKopplingar: [
      { komponentNamn: "Värmecentral", underkomponentId: "varmestammar" },
    ],
  },
  {
    id: "stam-va",
    namn: "Stamledning VA",
    andelMinProcent: 6,
    andelMaxProcent: 8,
    ejAlltid: false,
    standardNyttjandeperiodAr: 50,
    registerKopplingar: [{ komponentNamn: "VVS", underkomponentId: "stambyte" }],
  },
  {
    id: "fasad",
    namn: "Fasad",
    andelMinProcent: 5,
    andelMaxProcent: 8,
    ejAlltid: false,
    standardNyttjandeperiodAr: 40,
    periodAlternativ: [
      { etikett: "Trä / puts / betongelement", ar: 40 },
      { etikett: "Murtegel", ar: 100 },
    ],
    registerKopplingar: [
      { komponentNamn: "Fasad", underkomponentId: "fasadmaterial" },
    ],
  },
  {
    id: "fonster",
    namn: "Fönster",
    andelMinProcent: 3,
    andelMaxProcent: 5,
    ejAlltid: false,
    standardNyttjandeperiodAr: 40,
    periodAlternativ: [
      { etikett: "Trä / plast", ar: 40 },
      { etikett: "Trä beklädd / aluminium", ar: 60 },
    ],
    registerKopplingar: [
      { komponentNamn: "Fasad", underkomponentId: "fonster" },
      { komponentNamn: "Fönster", underkomponentId: "fonster" },
    ],
  },
  {
    id: "yttertak",
    namn: "Yttertak",
    andelMinProcent: 4,
    andelMaxProcent: 10,
    ejAlltid: false,
    standardNyttjandeperiodAr: 40,
    periodAlternativ: [
      { etikett: "Papp", ar: 30 },
      { etikett: "Tegel", ar: 40 },
      { etikett: "Plåt / skiffer", ar: 60 },
    ],
    registerKopplingar: [{ komponentNamn: "Tak", underkomponentId: "takyta" }],
  },
  {
    id: "el",
    namn: "El",
    andelMinProcent: 6,
    andelMaxProcent: 8,
    ejAlltid: false,
    standardNyttjandeperiodAr: 50,
    registerKopplingar: [
      { komponentNamn: "Elcentral", underkomponentId: "central" },
    ],
  },
  {
    id: "balkong",
    namn: "Balkong",
    andelMinProcent: 3,
    andelMaxProcent: 5,
    ejAlltid: true,
    standardNyttjandeperiodAr: 50,
    periodAlternativ: [
      { etikett: "Betong", ar: 50 },
      { etikett: "Trä", ar: 30 },
      { etikett: "Inglasning", ar: 25 },
    ],
    registerKopplingar: [
      { komponentNamn: "Balkonger", underkomponentId: "balkonger" },
      { komponentNamn: "Fasad", underkomponentId: "balkonger" },
    ],
  },
  {
    id: "ventilation",
    namn: "Ventilation",
    andelMinProcent: 2,
    andelMaxProcent: 3,
    ejAlltid: false,
    standardNyttjandeperiodAr: 20,
    periodAlternativ: [
      { etikett: "Från- och tilluft", ar: 20 },
      { etikett: "Självdrag", ar: 100 },
    ],
    registerKopplingar: [
      { komponentNamn: "Ventilation", underkomponentId: "aggregat" },
    ],
  },
  {
    id: "hiss",
    namn: "Hiss",
    andelMinProcent: 1,
    andelMaxProcent: 2,
    ejAlltid: true,
    standardNyttjandeperiodAr: 40,
    periodAlternativ: [
      { etikett: "Linhiss", ar: 40 },
      { etikett: "Hydraulhiss", ar: 30 },
      { etikett: "Plattformshiss", ar: 20 },
    ],
    registerKopplingar: [{ komponentNamn: "Trapphus", underkomponentId: "hiss" }],
  },
  {
    id: "styr",
    namn: "Styr och övervakning",
    andelMinProcent: 1,
    andelMaxProcent: 2,
    ejAlltid: true,
    standardNyttjandeperiodAr: 25,
    registerKopplingar: [
      {
        komponentNamn: "Styr och övervakning",
        underkomponentId: "system",
      },
    ],
  },
];

/** Komponentnamn som bör vara aktiva för en FAR-baserad K3-plan. */
export const FAR_REGISTER_KOMPONENTER = [
  "Stomme",
  "Fasad",
  "Tak",
  "Fönster",
  "Trapphus",
  "VVS",
  "Värmecentral",
  "Ventilation",
  "Elcentral",
  "Balkonger",
  "Styr och övervakning",
] as const;

export function farAndelText(k: FarK3Komponent): string {
  return `${k.andelMinProcent}–${k.andelMaxProcent} %`;
}
