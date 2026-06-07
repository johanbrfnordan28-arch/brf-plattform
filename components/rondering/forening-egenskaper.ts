import { lasUnderhallsplanState } from "@/components/underhallsplan/underhallsplan-lager";
import { parseHeltalFranText } from "@/components/underhallsplan/parse-grundtal";
import type { Grunduppgifter } from "@/components/underhallsplan/types";

/** Egenskaper som styr vilka checklistpunkter som är relevanta. */
export type ForeningEgenskap = keyof ForeningEgenskaper;

export type ForeningEgenskaper = {
  trapphus: boolean;
  kallare: boolean;
  soprum: boolean;
  tvattstuga: boolean;
  hiss: boolean;
  balkonger: boolean;
  tak: boolean;
  markOchGard: boolean;
  lekplats: boolean;
  cykelforrad: boolean;
  foreningslokal: boolean;
  garage: boolean;
  verksamhetslokaler: boolean;
  fleraByggnader: boolean;
  gemensamToalett: boolean;
};

export const standardForeningEgenskaper = (): ForeningEgenskaper => ({
  trapphus: true,
  kallare: true,
  soprum: true,
  tvattstuga: false,
  hiss: false,
  balkonger: true,
  tak: true,
  markOchGard: true,
  lekplats: false,
  cykelforrad: true,
  foreningslokal: false,
  garage: false,
  verksamhetslokaler: false,
  fleraByggnader: false,
  gemensamToalett: false,
});

export const foreningEgenskapEtiketter: Record<ForeningEgenskap, string> = {
  trapphus: "Trapphus och entréer",
  kallare: "Källare och förråd",
  soprum: "Soprum / miljörum",
  tvattstuga: "Tvättstuga",
  hiss: "Hiss",
  balkonger: "Balkonger / altaner",
  tak: "Tak och takavvattning",
  markOchGard: "Mark, gård och parkering",
  lekplats: "Lekplats på gård",
  cykelforrad: "Cykelrum / cykelparkering",
  foreningslokal: "Föreningslokal / gym / bastu",
  garage: "Garage / P-platser / komplementbyggnad",
  verksamhetslokaler: "Verksamhetslokaler i fastigheten",
  fleraByggnader: "Flera byggnader",
  gemensamToalett: "Gemensam toalett (städ)",
};

export function normaliseraForeningEgenskaper(
  raw?: Partial<ForeningEgenskaper> | null,
): ForeningEgenskaper {
  const std = standardForeningEgenskaper();
  if (!raw) return std;
  const out = { ...std };
  for (const key of Object.keys(std) as ForeningEgenskap[]) {
    if (typeof raw[key] === "boolean") out[key] = raw[key]!;
  }
  return out;
}

function komponentMatchar(komponenter: string[], ...nyckelord: string[]): boolean {
  const lower = komponenter.map((c) => c.toLowerCase());
  return nyckelord.some((ord) =>
    lower.some((c) => c.includes(ord.toLowerCase())),
  );
}

/** Föreslå egenskaper utifrån underhållsplan (steg 1–3) om den finns sparad. */
export function foreslaEgenskaperFranUnderhallsplan(
  activeComponents: string[],
  grund: Grunduppgifter,
): ForeningEgenskaper {
  const bas = standardForeningEgenskaper();
  const antalByggnader = parseHeltalFranText(grund.antalByggnader);
  const lokaler = grund.lokaler?.filter((l) => l.namn.trim()).length ?? 0;

  return {
    ...bas,
    trapphus: true,
    kallare:
      komponentMatchar(activeComponents, "källare", "kallare") || bas.kallare,
    soprum: true,
    tvattstuga: komponentMatchar(activeComponents, "tvätt", "tvatt"),
    hiss: komponentMatchar(activeComponents, "hiss"),
    balkonger: komponentMatchar(activeComponents, "balkong"),
    tak: komponentMatchar(activeComponents, "tak") || bas.tak,
    markOchGard: komponentMatchar(activeComponents, "mark", "gård", "gard"),
    lekplats: komponentMatchar(activeComponents, "mark", "gård", "gard"),
    cykelforrad: komponentMatchar(activeComponents, "källare", "kallare"),
    foreningslokal: false,
    garage: komponentMatchar(
      activeComponents,
      "komplement",
      "p-plat",
      "garage",
    ),
    verksamhetslokaler: lokaler > 0,
    fleraByggnader: antalByggnader > 1,
    gemensamToalett: false,
  };
}

export function hamtaForeslaEgenskaperFranLager(): ForeningEgenskaper | null {
  const plan = lasUnderhallsplanState();
  if (!plan?.grundSaved) return null;
  return foreslaEgenskaperFranUnderhallsplan(
    plan.activeComponents,
    plan.grund,
  );
}

/** Minst en av listade egenskaper ska vara aktiv (t.ex. parkering = gård eller garage). */
export function foreningHarEgenskap(
  egenskaper: ForeningEgenskaper,
  krav: ForeningEgenskap[] | undefined,
): boolean {
  if (!krav?.length) return true;
  return krav.some((k) => egenskaper[k]);
}
