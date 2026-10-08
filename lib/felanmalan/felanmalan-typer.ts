export const FELANMALAN_STATUS = [
  "inkommen",
  "under_granskning",
  "till_entreprenor",
  "till_fastighetsskotare",
  "avslutad",
] as const;

export type FelanmalanStatus = (typeof FELANMALAN_STATUS)[number];

export const FELANMALAN_PRIORITET = [
  "akut",
  "hog",
  "normal",
  "lag",
] as const;

export type FelanmalanPrioritet = (typeof FELANMALAN_PRIORITET)[number];

export const FELANMALAN_ORSAK = [
  "vvs",
  "avlopp",
  "el",
  "varme",
  "ventilation",
  "hiss",
  "skada",
  "las_passage",
  "skadedjur",
  "ovrigt",
] as const;

export type FelanmalanOrsak = (typeof FELANMALAN_ORSAK)[number];

export const FELANMALAN_ROLL = [
  "forvaltare",
  "entreprenor",
  "fastighetsskotare",
] as const;

export type FelanmalanTilldeladRoll = (typeof FELANMALAN_ROLL)[number];

export type FelanmalanHistorikRad = {
  tidpunkt: string;
  av: string;
  text: string;
};

export type FelanmalanArendeDto = {
  id: string;
  foreningId: string;
  arendeNummer: string;
  status: FelanmalanStatus;
  prioritet: FelanmalanPrioritet;
  orsak: FelanmalanOrsak;
  rubrik: string;
  beskrivning: string;
  medlemNamn: string;
  medlemEpost: string;
  medlemTelefon: string;
  lagenhetsnummer: string;
  debiteringKan: boolean;
  debiteringAnteckning: string;
  nyckelPlats: string;
  boendeEjHemma: boolean;
  tilldeladRoll: FelanmalanTilldeladRoll;
  vidareEpost: string;
  historik: FelanmalanHistorikRad[];
  skapadTidpunkt: string;
  uppdateradTidpunkt: string;
};

export const FELANMALAN_STATUS_ETIKETT: Record<FelanmalanStatus, string> = {
  inkommen: "Inkommen",
  under_granskning: "Under granskning (förvaltare)",
  till_entreprenor: "Vidare till entreprenör",
  till_fastighetsskotare: "Vidare till fastighetsskötare",
  avslutad: "Avslutad",
};

export const FELANMALAN_PRIORITET_ETIKETT: Record<FelanmalanPrioritet, string> = {
  akut: "Akut",
  hog: "Hög",
  normal: "Normal",
  lag: "Låg",
};

export const FELANMALAN_ORSAK_ETIKETT: Record<FelanmalanOrsak, string> = {
  vvs: "VVS / vatten",
  avlopp: "Avlopp / stopp",
  el: "El",
  varme: "Värme",
  ventilation: "Ventilation",
  hiss: "Hiss",
  skada: "Skada i lägenhet/gemensam yta",
  las_passage: "Lås / passage",
  skadedjur: "Skadedjur",
  ovrigt: "Övrigt",
};

export const FELANMALAN_ROLL_ETIKETT: Record<FelanmalanTilldeladRoll, string> = {
  forvaltare: "Förvaltare",
  entreprenor: "Entreprenör",
  fastighetsskotare: "Fastighetsskötare",
};

export function arGiltigStatus(v: string): v is FelanmalanStatus {
  return (FELANMALAN_STATUS as readonly string[]).includes(v);
}

export function arGiltigPrioritet(v: string): v is FelanmalanPrioritet {
  return (FELANMALAN_PRIORITET as readonly string[]).includes(v);
}

export function arGiltigOrsak(v: string): v is FelanmalanOrsak {
  return (FELANMALAN_ORSAK as readonly string[]).includes(v);
}

export function arGiltigRoll(v: string): v is FelanmalanTilldeladRoll {
  return (FELANMALAN_ROLL as readonly string[]).includes(v);
}

export const FELANMALAN_MAXLANGD = {
  rubrik: 150,
  beskrivning: 4000,
  medlemNamn: 120,
  medlemEpost: 200,
  medlemTelefon: 40,
  lagenhetsnummer: 20,
  nyckelPlats: 300,
  debiteringAnteckning: 500,
  meddelande: 2000,
} as const;

/** Per förening — styr mottagare och vad boende ser i felanmälan. */
export type FelanmalanInstallningar = {
  extraEpost: string[];
  jourTelefon: string;
  jourText: string;
  info: string;
};

export const FELANMALAN_INSTALLNING_MAX = {
  extraEpost: 5,
  jourTelefon: 40,
  jourText: 200,
  info: 1500,
} as const;

/** Publik del av inställningarna — det boende ser i formuläret. */
export type FelanmalanPublikInfo = Omit<FelanmalanInstallningar, "extraEpost">;
