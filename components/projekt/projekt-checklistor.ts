export type ProjektStorlek = "litet" | "stort";

export type ChecklistaPunkt = {
  id: string;
  text: string;
  /** Undermapp att öppna via länk — dokument i mappen kan auto-bocka punkten. */
  mappId?: string;
};

export type ChecklistaSektion = {
  id: string;
  etikett: string;
  beskrivning?: string;
  punkter: ChecklistaPunkt[];
};

/** Gemensamma krav vid projektstart — alla projekt. */
const gemensammaStart: ChecklistaPunkt[] = [
  {
    id: "tidsplan",
    mappId: "tidsplan",
    text: "Tidsplan är upprättad, godkänd av styrelsen och delad med entreprenör.",
  },
  {
    id: "betalplan",
    mappId: "betalplan",
    text: "Betalplan (delfakturor / milestones) är fastställd och kopplad till avtal.",
  },
  {
    id: "offert",
    mappId: "offert",
    text: "Offert eller anbud är granskat, jämfört vid behov och arkiverat.",
  },
  {
    id: "kontrakt",
    mappId: "kontrakt",
    text: "Kontrakt / entreprenadavtal är undertecknat av styrelse och entreprenör.",
  },
  {
    id: "f-skatt",
    mappId: "f-skatt",
    text: "F-skatt är intygad (kontroll av giltigt registreringsbevis).",
  },
  {
    id: "forsakring",
    mappId: "forsakring",
    text: "Försäkringsbevis för entreprenören är inlämnat och kontrollerat.",
  },
  {
    id: "egenkontroll-in",
    mappId: "egenkontroller-in",
    text: "Egenkontroller / kontrollplan är inlämnade av entreprenör inför start.",
  },
];

/** Extra vid start — endast större projekt. */
const stortProjektStartExtra: ChecklistaPunkt[] = [
  {
    id: "bygglov",
    mappId: "bygglov",
    text: "Bygglov eller anmälan är sökt/godkänd och handlingar är arkiverade.",
  },
  {
    id: "startbevis",
    mappId: "startbevis",
    text: "Startbevis från kommun är erhållet innan byggstart.",
  },
];

/** Gemensamma krav vid projektavslut — alla projekt. */
const gemensammaAvslut: ChecklistaPunkt[] = [
  {
    id: "utvardering",
    mappId: "utvardering",
    text: "Utvärdering av entreprenör och projektutfall är genomförd och dokumenterad.",
  },
  {
    id: "egenkontroll-signerad",
    mappId: "egenkontroller-signerad",
    text: "Signerade egenkontroller / slutkontroller från entreprenör är inlämnade.",
  },
  {
    id: "slutbesiktning",
    mappId: "besiktningar",
    text: "Slutbesiktning eller motsvarande genomgång är utförd och protokoll sparat.",
  },
  {
    id: "ekonomi-avslut",
    mappId: "betalplan",
    text: "Slutfaktura, garantier och eventuella återbetalningar är hanterade enligt betalplan.",
  },
];

/** Extra vid avslut — endast större projekt. */
const stortProjektAvslutExtra: ChecklistaPunkt[] = [
  {
    id: "slutbevis",
    mappId: "slutbevis",
    text: "Slutbevis från kommun är erhållet och arkiverat.",
  },
];

export const projektStorlekEtiketter: Record<ProjektStorlek, string> = {
  litet: "Mindre projekt",
  stort: "Större projekt",
};

export const projektStorlekBeskrivning: Record<ProjektStorlek, string> = {
  litet:
    "Renoveringar och mindre entreprenader — standardkrav utan bygglov och start-/slutbevis.",
  stort:
    "Större entreprenader — inkluderar bygglov, startbevis vid start och slutbevis vid avslut.",
};

export function hamtaProjektChecklista(storlek: ProjektStorlek): {
  start: ChecklistaSektion;
  avslut: ChecklistaSektion;
} {
  const startPunkter = [
    ...gemensammaStart,
    ...(storlek === "stort" ? stortProjektStartExtra : []),
  ];
  const avslutPunkter = [
    ...gemensammaAvslut,
    ...(storlek === "stort" ? stortProjektAvslutExtra : []),
  ];

  return {
    start: {
      id: "start",
      etikett: "Innan projektstart",
      beskrivning:
        "Alla punkter ska vara uppfyllda innan entreprenören får påbörja arbetet.",
      punkter: startPunkter,
    },
    avslut: {
      id: "avslut",
      etikett: "Projektavslut",
      beskrivning:
        "Checklista när projektet ska stängas och markeras som avslutat.",
      punkter: avslutPunkter,
    },
  };
}

export function checklistaPunktId(fas: "start" | "avslut", punktId: string): string {
  return `${fas}:${punktId}`;
}

export function hamtaMappIdForChecklistaPunkt(
  storlek: ProjektStorlek,
  fas: "start" | "avslut",
  punktId: string,
): string | undefined {
  const { start, avslut } = hamtaProjektChecklista(storlek);
  const sektion = fas === "start" ? start : avslut;
  return sektion.punkter.find((p) => p.id === punktId)?.mappId;
}

/** Checklistnycklar som kan bockas när dokument laddas upp i mappen. */
export function hamtaChecklistaKeysForMapp(
  storlek: ProjektStorlek,
  mappId: string,
): string[] {
  const { start, avslut } = hamtaProjektChecklista(storlek);
  const keys: string[] = [];
  for (const punkt of start.punkter) {
    if (punkt.mappId === mappId) keys.push(checklistaPunktId("start", punkt.id));
  }
  for (const punkt of avslut.punkter) {
    if (punkt.mappId === mappId) keys.push(checklistaPunktId("avslut", punkt.id));
  }
  return keys;
}

export function normaliseraKlaraChecklistaPunkter(
  storlek: ProjektStorlek,
  klara?: string[] | null,
): string[] {
  const { start, avslut } = hamtaProjektChecklista(storlek);
  const allaKeys = new Set([
    ...start.punkter.map((p) => checklistaPunktId("start", p.id)),
    ...avslut.punkter.map((p) => checklistaPunktId("avslut", p.id)),
  ]);
  return (klara ?? []).filter((key) => allaKeys.has(key));
}

export function beraknaChecklistaFramsteg(
  storlek: ProjektStorlek,
  klara: string[],
): {
  start: { klara: number; totalt: number };
  avslut: { klara: number; totalt: number };
} {
  const { start, avslut } = hamtaProjektChecklista(storlek);
  const startIds = start.punkter.map((p) => checklistaPunktId("start", p.id));
  const avslutIds = avslut.punkter.map((p) => checklistaPunktId("avslut", p.id));
  const klaraSet = new Set(klara);
  return {
    start: {
      klara: startIds.filter((id) => klaraSet.has(id)).length,
      totalt: startIds.length,
    },
    avslut: {
      klara: avslutIds.filter((id) => klaraSet.has(id)).length,
      totalt: avslutIds.length,
    },
  };
}
