import {
  arVvsRenoveringsMall,
  vvsForvantadeHandlingar,
  vvsForvantadeOvrigt,
  vvsRenoveringEgenkontrollPunkter,
} from "@/components/medlemmar/vvs-renovering-krav";

export type RenoveringsUndermappTyp =
  | "ritning"
  | "handlingar"
  | "myndigheter"
  | "egenkontroller"
  | "ovrigt";

export type RenoveringsMallId =
  | "badrum"
  | "kok"
  | "malning"
  | "slipning-golv"
  | "planlosning"
  | "flytt-kok-badrum"
  | "haltagning"
  | "ovrigt";

export type RenoveringsUndermappDef = {
  typ: RenoveringsUndermappTyp;
  etikett: string;
  beskrivning: string;
};

export const renoveringsUndermappTyper: RenoveringsUndermappDef[] = [
  {
    typ: "ritning",
    etikett: "Ritning",
    beskrivning: "Skisser, planritningar och mått före och efter.",
  },
  {
    typ: "handlingar",
    etikett: "Handlingar",
    beskrivning: "Anmälan, avtal, försäkring och slutdokumentation.",
  },
  {
    typ: "myndigheter",
    etikett: "Myndigheter",
    beskrivning: "Bygglov, styrelsebeslut och myndighetsärenden.",
  },
  {
    typ: "egenkontroller",
    etikett: "Egenkontroller",
    beskrivning: "Signerade egenkontroller och protokoll (BankID).",
  },
  {
    typ: "ovrigt",
    etikett: "Övrigt",
    beskrivning: "Foton, garantier och övrigt underlag.",
  },
];

export type RenoveringsMall = {
  id: RenoveringsMallId;
  etikett: string;
  beskrivning: string;
  standardNamn: string;
  /** Vilka undermappar som skapas — standard är alla fem typer. */
  undermappTyper?: RenoveringsUndermappTyp[];
  egenkontrollPunkter: { id: string; text: string }[];
  forvantadeDokument: Record<RenoveringsUndermappTyp, string[]>;
};

export const standardRenoveringsUndermappTyper: RenoveringsUndermappTyp[] = [
  "ritning",
  "handlingar",
  "myndigheter",
  "egenkontroller",
  "ovrigt",
];

/** Målning och slipning — utan ritning och myndigheter. */
export const enklareRenoveringsUndermappTyper: RenoveringsUndermappTyp[] = [
  "handlingar",
  "egenkontroller",
  "ovrigt",
];

export function undermappTyperForMall(mall: RenoveringsMall): RenoveringsUndermappTyp[] {
  return mall.undermappTyper ?? standardRenoveringsUndermappTyper;
}

export const STARTBESIKTNING_EGENKONTROLL_ID = "startbesiktning-skador";

export const startbesiktningEgenkontrollPunkt = {
  id: STARTBESIKTNING_EGENKONTROLL_ID,
  text: "Startbesiktning: kontroll av befintliga skador i fastigheten och angränsande lägenheter. Skador ska dokumenteras med uppladdade bilder. För ej dokumenterade skador ansvarar entreprenören.",
};

export function arStartbesiktningPunkt(punktId: string): boolean {
  return punktId === STARTBESIKTNING_EGENKONTROLL_ID;
}

/** Startbesiktning ingår alltid först; VVS-krav för badrum, kök och flytt kök/badrum. */
export function egenkontrollPunkterForMall(
  mall: RenoveringsMall,
): { id: string; text: string }[] {
  const övriga = mall.egenkontrollPunkter.filter(
    (p) =>
      p.id !== STARTBESIKTNING_EGENKONTROLL_ID &&
      p.id !== "badrum-start" &&
      p.id !== "ovrig-start" &&
      !p.id.startsWith("vvs-"),
  );
  const vvs = arVvsRenoveringsMall(mall.id)
    ? vvsRenoveringEgenkontrollPunkter.map((p) => ({ ...p }))
    : [];
  return [startbesiktningEgenkontrollPunkt, ...vvs, ...övriga];
}

export function forvantadeDokumentForMall(
  mall: RenoveringsMall,
): Record<RenoveringsUndermappTyp, string[]> {
  const docs = { ...mall.forvantadeDokument };
  if (arVvsRenoveringsMall(mall.id)) {
    docs.handlingar = [...docs.handlingar, ...vvsForvantadeHandlingar];
    docs.ovrigt = [...docs.ovrigt, ...vvsForvantadeOvrigt];
    docs.egenkontroller = [
      ...docs.egenkontroller,
      "Signerad egenkontroll VVS (Säker Vatten)",
    ];
  }
  return docs;
}

const gemensammaGuider: Record<RenoveringsUndermappTyp, string[]> = {
  ritning: ["Ritning/skiss före", "Ritning/skiss efter"],
  handlingar: [
    "Renoveringsanmälan",
    "Entreprenörsavtal eller offert",
    "Försäkringsintyg",
  ],
  myndigheter: ["Styrelsens godkännande", "Eventuell bygganmälan"],
  egenkontroller: [
    "Startbesiktning — bilder på befintliga skador (signerad med BankID)",
    "Signerad egenkontroll (BankID)",
  ],
  ovrigt: [
    "Bilder — skador i lägenhet, fastighet och angränsande lägenheter",
    "Foton före/efter",
    "Garantibevis",
  ],
};

export const renoveringsMallar: RenoveringsMall[] = [
  {
    id: "badrum",
    etikett: "Badrum",
    beskrivning: "Våtrumsrenovering med våtrumsdokument och stamkoordinering.",
    standardNamn: "Badrumsrenovering",
    egenkontrollPunkter: [
      {
        id: "badrum-fukt-efter-rivning",
        text: "Fuktkontroll efter rivning — bedömning och fotodokumentation genomförd.",
      },
      {
        id: "badrum-fukt-extern",
        text: "Vid misstanke om fukt har styrelse, medlem och entreprenör vid behov begärt fuktmätning av extern part.",
      },
      {
        id: "badrum-fukt-entreprenor",
        text: "Entreprenörens egen fuktmätning genomförd och dokumenterad i egenkontroll.",
      },
      { id: "badrum-tatskikt", text: "Tätskikt och fall kontrollerat enligt våtrumsregler." },
      { id: "badrum-slut", text: "Slutbesiktning och våtrumsdokument klart." },
    ],
    forvantadeDokument: {
      ...gemensammaGuider,
      ritning: [
        "Ritning före/efter",
        "Placering golvbrunn och fall",
        "Våtrumsplan",
      ],
      handlingar: [
        ...gemensammaGuider.handlingar,
        "Våtrumsdokument / våtrumscertifikat",
        "Samordning stammar (vid behov)",
      ],
      myndigheter: [
        ...gemensammaGuider.myndigheter,
        "Anmälan till föreningen vid stam-ingrepp",
      ],
      egenkontroller: [
        "Startbesiktning — bilder på skador (BankID)",
        "Signerad egenkontroll tätskikt",
        "Signerad slutbesiktning",
      ],
    },
  },
  {
    id: "kok",
    etikett: "Kök",
    beskrivning: "Byte av skåp, bänkskiva, vitvaror och ytskikt.",
    standardNamn: "Köksrenovering",
    egenkontrollPunkter: [
      { id: "kok-el", text: "Elarbete och jordfelsbrytare kontrollerat." },
      { id: "kok-flakt", text: "Köksfläkt och ventilation enligt anvisning." },
      { id: "kok-slut", text: "Slutkontroll kök och brandskydd vid spis." },
    ],
    forvantadeDokument: {
      ...gemensammaGuider,
      ritning: ["Köksskiss före/efter", "El- och vattenschema"],
      handlingar: [
        ...gemensammaGuider.handlingar,
        "Vitvaruspecifikation",
        "Elinstallationsintyg",
      ],
      egenkontroller: [
        "Signerad egenkontroll el",
        "Signerad egenkontroll ventilation",
      ],
    },
  },
  {
    id: "malning",
    etikett: "Målning",
    beskrivning: "Målning av väggar, tak eller snickerier.",
    standardNamn: "Målning",
    undermappTyper: enklareRenoveringsUndermappTyper,
    egenkontrollPunkter: [
      { id: "malning-skydd", text: "Ventiler täckta och skydd av gemensamma ytor." },
      { id: "malning-slut", text: "Slutkontroll — inga spår i trapphus eller ventiler öppnade." },
    ],
    forvantadeDokument: {
      ritning: [],
      myndigheter: [],
      handlingar: [...gemensammaGuider.handlingar, "Produktblad färg/lack"],
      egenkontroller: ["Signerad egenkontroll ventilation och skydd"],
      ovrigt: gemensammaGuider.ovrigt,
    },
  },
  {
    id: "slipning-golv",
    etikett: "Slipning golv",
    beskrivning: "Slipning och ytbehandling av trägolv.",
    standardNamn: "Slipning golv",
    undermappTyper: enklareRenoveringsUndermappTyper,
    egenkontrollPunkter: [
      { id: "golv-buller", text: "Buller- och dammåtgärder avstämda med grannar." },
      { id: "golv-slut", text: "Slutbesiktning yta och ventilation återställd." },
    ],
    forvantadeDokument: {
      ritning: [],
      myndigheter: [],
      handlingar: [...gemensammaGuider.handlingar, "Ytbehandlingsprodukt (olja/lack)"],
      egenkontroller: gemensammaGuider.egenkontroller,
      ovrigt: gemensammaGuider.ovrigt,
    },
  },
  {
    id: "planlosning",
    etikett: "Planlösning",
    beskrivning: "Ändrad indelning — väggar rivs eller flyttas.",
    standardNamn: "Ändrad planlösning",
    egenkontrollPunkter: [
      { id: "plan-godk", text: "Styrelsens godkännande och ritning kontrollerad." },
      { id: "plan-barande", text: "Bedömning bärande konstruktion dokumenterad." },
    ],
    forvantadeDokument: {
      ...gemensammaGuider,
      ritning: ["Ritning före", "Ritning efter", "Konstruktörshandling (vid behov)"],
      myndigheter: [
        ...gemensammaGuider.myndigheter,
        "Bygglov eller bygganmälan",
        "K-stöd / konstruktörsintyg",
      ],
    },
  },
  {
    id: "flytt-kok-badrum",
    etikett: "Flytt kök/badrum",
    beskrivning: "Kök eller badrum flyttas till ny plats i lägenheten.",
    standardNamn: "Flytt kök/badrum",
    egenkontrollPunkter: [
      { id: "flytt-stam", text: "Flytt av stammar godkänd av föreningen." },
      { id: "flytt-vatzon", text: "Ny våtzon och fuktskydd kontrollerat." },
    ],
    forvantadeDokument: {
      ...gemensammaGuider,
      ritning: ["Ny placering kök/badrum", "Stam- och avloppsritning"],
      myndigheter: [
        ...gemensammaGuider.myndigheter,
        "Godkännande stamflytt",
        "Våtrumsdokument vid ny våtzon",
      ],
    },
  },
  {
    id: "haltagning",
    etikett: "Håltagning",
    beskrivning: "Hål eller öppning i bärande vägg.",
    standardNamn: "Håltagning bärande vägg",
    egenkontrollPunkter: [
      { id: "haltag-konstr", text: "Konstruktörsutredning och styrelsens godkännande." },
      { id: "haltag-slut", text: "Efterbesiktning enligt handling utförd." },
    ],
    forvantadeDokument: {
      ...gemensammaGuider,
      ritning: ["Ritning med öppning", "Konstruktörshandling"],
      myndigheter: [
        ...gemensammaGuider.myndigheter,
        "Konstruktörsintyg",
        "Bygglov (vid behov)",
      ],
    },
  },
  {
    id: "ovrigt",
    etikett: "Egen mapp",
    beskrivning: "Valfritt namn — samma undermappar och egenkontrollmall.",
    standardNamn: "Renovering",
    egenkontrollPunkter: [
      { id: "ovrig-slut", text: "Slutkontroll och dokumentation komplett." },
    ],
    forvantadeDokument: gemensammaGuider,
  },
];

export function hamtaRenoveringsMall(
  id: RenoveringsMallId,
): RenoveringsMall {
  return (
    renoveringsMallar.find((m) => m.id === id) ??
    renoveringsMallar.find((m) => m.id === "ovrigt")!
  );
}

/** Föreslår mappnamn — numrerar om flera mappar av samma typ redan finns. */
export function foreslagetMappNamn(
  mallId: RenoveringsMallId,
  befintliga: { name: string; mallId?: RenoveringsMallId }[],
  ar?: number,
): string {
  const mall = hamtaRenoveringsMall(mallId);
  const arTal = ar ?? new Date().getFullYear();
  const bas = `${mall.standardNamn} ${arTal}`;
  const liknande = befintliga.filter(
    (f) => f.mallId === mallId || f.name.startsWith(mall.standardNamn),
  );
  if (liknande.length === 0) return bas;
  return `${bas} (${liknande.length + 1})`;
}

export function undermappEtikett(typ: RenoveringsUndermappTyp): string {
  return (
    renoveringsUndermappTyper.find((u) => u.typ === typ)?.etikett ?? typ
  );
}
