import type { ProjektStorlek } from "@/components/projekt/projekt-checklistor";
import { normaliseraKlaraChecklistaPunkter } from "@/components/projekt/projekt-checklistor";
import {
  normaliseraGarantibesiktning,
  type GarantibesiktningStatus,
} from "@/components/projekt/garantibesiktning";
import {
  normaliseraProjektTidsplan,
  type ProjektTidsplan,
} from "@/components/projekt/tidsplan";
import { foreningStorageKey } from "@/lib/foreningStorage";

export type { ProjektTidsplan };

export type { GarantibesiktningStatus };

export type StandardUndermappId =
  | "tidsplan"
  | "betalplan"
  | "offert"
  | "kontrakt"
  | "f-skatt"
  | "forsakring"
  | "egenkontroller-in"
  | "bygglov"
  | "startbevis"
  | "utvardering"
  | "egenkontroller-signerad"
  | "slutbevis"
  | "byggmotesprotokoll"
  | "underlag"
  | "ritningar"
  | "besiktningar"
  | "garantibesiktning";

export type UndermappDefinition = {
  id: string;
  titel: string;
  beskrivning: string;
  ärStandard: boolean;
};

export const standardUndermappar: UndermappDefinition[] = [
  {
    id: "tidsplan",
    titel: "Tidsplan",
    beskrivning: "Tidsplan, milstolpar och godkännande från styrelsen.",
    ärStandard: true,
  },
  {
    id: "betalplan",
    titel: "Betalplan",
    beskrivning: "Delfakturor, slutfaktura och ekonomiskt avslut.",
    ärStandard: true,
  },
  {
    id: "offert",
    titel: "Offert",
    beskrivning: "Offerter, anbud och jämförelser.",
    ärStandard: true,
  },
  {
    id: "kontrakt",
    titel: "Kontrakt",
    beskrivning: "Avtal, tillägg och ekonomiska villkor med entreprenör.",
    ärStandard: true,
  },
  {
    id: "f-skatt",
    titel: "F-skatt",
    beskrivning: "Registreringsbevis och intyg om F-skatt.",
    ärStandard: true,
  },
  {
    id: "forsakring",
    titel: "Försäkringsbevis",
    beskrivning: "Försäkringsintyg från entreprenör.",
    ärStandard: true,
  },
  {
    id: "egenkontroller-in",
    titel: "Egenkontroller (inlämning)",
    beskrivning: "Kontrollplan och egenkontroller inför projektstart.",
    ärStandard: true,
  },
  {
    id: "bygglov",
    titel: "Bygglov",
    beskrivning: "Bygglovsansökan, beslut och myndighetshandlingar.",
    ärStandard: true,
  },
  {
    id: "startbevis",
    titel: "Startbevis",
    beskrivning: "Startbevis från kommun innan byggstart.",
    ärStandard: true,
  },
  {
    id: "utvardering",
    titel: "Utvärdering",
    beskrivning: "Utvärdering av entreprenör och projektutfall.",
    ärStandard: true,
  },
  {
    id: "egenkontroller-signerad",
    titel: "Egenkontroller (signerade)",
    beskrivning: "Signerade slutkontroller och egenkontroller vid avslut.",
    ärStandard: true,
  },
  {
    id: "slutbevis",
    titel: "Slutbevis",
    beskrivning: "Slutbevis från kommun vid projektavslut.",
    ärStandard: true,
  },
  {
    id: "byggmotesprotokoll",
    titel: "Byggmötesprotokoll",
    beskrivning: "Protokoll från byggmöten under projektets gång.",
    ärStandard: true,
  },
  {
    id: "underlag",
    titel: "Underlag",
    beskrivning: "Kalkyler, beskrivningar, beslut och övrigt underlag.",
    ärStandard: true,
  },
  {
    id: "ritningar",
    titel: "Ritningar",
    beskrivning: "Ritningar, situationsplaner och tekniska bilagor.",
    ärStandard: true,
  },
  {
    id: "besiktningar",
    titel: "Slutbesiktning",
    beskrivning: "Protokoll från slutbesiktning eller motsvarande genomgång.",
    ärStandard: true,
  },
  {
    id: "garantibesiktning",
    titel: "Garantibesiktning (2 år)",
    beskrivning:
      "Garantibesiktning / 2-årsbesiktning — protokoll och korrespondens. Ska utföras inom garantitiden efter slutbesiktning.",
    ärStandard: true,
  },
];

export type ProjektDokument = {
  id: string;
  filnamn: string;
  uppladdad: string;
};

export type UndermappState = {
  öppen: boolean;
  dokument: ProjektDokument[];
};

export type Projekt = {
  id: string;
  titel: string;
  ar: number;
  beskrivning: string;
  skapad: string;
  avslutat: boolean;
  öppen: boolean;
  /** Mindre eller större projekt — styr checklistans omfattning. */
  storlek: ProjektStorlek;
  /** Bockade checklistpunkter, t.ex. "start:tidsplan". */
  klaraChecklistaPunkter: string[];
  /** Garantibesiktning med påminnelser efter slutbesiktning. */
  garantibesiktning: GarantibesiktningStatus;
  /** Tidsplan med milstolpar, bibliotek och entreprenörsdatum. */
  tidsplan: ProjektTidsplan;
  /** Standard + egna undermappar */
  mappDefinitioner: UndermappDefinition[];
  mappar: Record<string, UndermappState>;
};

export type { ProjektStorlek };

const PROJEKT_STORAGE_BASE = "brf-grundmall-projekt";

export function projektStorageKey(): string {
  return foreningStorageKey(PROJEKT_STORAGE_BASE);
}

export function skapaProjektId(): string {
  return `projekt-${Date.now()}`;
}

export function skapaDokumentId(): string {
  return `projekt-doc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function skapaTomUndermappar(
  definitioner: UndermappDefinition[],
): Record<string, UndermappState> {
  return Object.fromEntries(
    definitioner.map((m) => [m.id, { öppen: false, dokument: [] }]),
  );
}

function normaliseraMappar(raw: Projekt): {
  mappDefinitioner: UndermappDefinition[];
  mappar: Record<string, UndermappState>;
} {
  const egen = (raw.mappDefinitioner ?? []).filter(
    (d) => !standardUndermappar.some((s) => s.id === d.id),
  );
  const mappDefinitioner = [...standardUndermappar, ...egen];
  const mappar = skapaTomUndermappar(mappDefinitioner);
  for (const def of mappDefinitioner) {
    const befintlig = raw.mappar?.[def.id];
    if (befintlig) {
      mappar[def.id] = {
        öppen: befintlig.öppen ?? false,
        dokument: befintlig.dokument ?? [],
      };
    }
  }
  return { mappDefinitioner, mappar };
}

export function normaliseraProjekt(raw: Projekt): Projekt {
  const storlek: ProjektStorlek =
    raw.storlek === "stort" || raw.storlek === "litet" ? raw.storlek : "litet";
  const { mappDefinitioner, mappar } = normaliseraMappar(raw);
  return {
    ...raw,
    storlek,
    klaraChecklistaPunkter: normaliseraKlaraChecklistaPunkter(
      storlek,
      raw.klaraChecklistaPunkter,
    ),
    garantibesiktning: normaliseraGarantibesiktning(raw.garantibesiktning),
    tidsplan: normaliseraProjektTidsplan(raw.tidsplan),
    mappDefinitioner,
    mappar,
  };
}

export function skapaTomtProjekt(input: {
  titel: string;
  ar: number;
  beskrivning: string;
  storlek?: ProjektStorlek;
  klaraChecklistaPunkter?: string[];
}): Projekt {
  const mappDefinitioner = [...standardUndermappar];
  const storlek = input.storlek ?? "litet";
  return normaliseraProjekt({
    id: skapaProjektId(),
    titel: input.titel.trim(),
    ar: input.ar,
    beskrivning: input.beskrivning.trim(),
    skapad: new Date().toLocaleDateString("sv-SE"),
    avslutat: false,
    öppen: true,
    storlek,
    klaraChecklistaPunkter: input.klaraChecklistaPunkter ?? [],
    garantibesiktning: normaliseraGarantibesiktning(),
    tidsplan: normaliseraProjektTidsplan(),
    mappDefinitioner,
    mappar: skapaTomUndermappar(mappDefinitioner),
  });
}

export function sorteraProjekt(lista: Projekt[]): Projekt[] {
  return [...lista].sort((a, b) => {
    if (b.ar !== a.ar) return b.ar - a.ar;
    return b.titel.localeCompare(a.titel, "sv");
  });
}

export function allaMappIds(projekt: Projekt): string[] {
  return projekt.mappDefinitioner.map((m) => m.id);
}

export function hamtaMappTitel(
  projekt: Projekt,
  mappId: string,
): string | undefined {
  return projekt.mappDefinitioner.find((m) => m.id === mappId)?.titel;
}
