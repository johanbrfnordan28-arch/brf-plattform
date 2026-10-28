import { EGENKONTROLL_INTROS } from "@/components/dokumentbank/mallar/innehall/egenkontroll-intros";
import {
  EGENKONTROLL_PUNKTER_PER_BRANSCH,
  punkterForBransch,
  VVS_EGENKONTROLL_PUNKTER,
} from "@/components/dokumentbank/mallar/egenkontroll-punkter";
import type {
  EgenkontrollBransch,
  EgenkontrollPunktMall,
} from "@/components/dokumentbank/mallar/egenkontroll-typer";
import {
  ALLA_EGENKONTROLL_BRANSCHER,
  arGiltigEgenkontrollBransch,
  EGENKONTROLL_BRANSCH_ETIKETTER,
} from "@/components/dokumentbank/mallar/egenkontroll-typer";

export type { EgenkontrollBransch, EgenkontrollPunktMall };
export {
  ALLA_EGENKONTROLL_BRANSCHER,
  arGiltigEgenkontrollBransch,
  EGENKONTROLL_BRANSCH_ETIKETTER,
  VVS_EGENKONTROLL_PUNKTER,
  punkterForBransch,
};

export const EGENKONTROLL_VVS_MALL_ID = "egenkontroll-vvs";
export const EGENKONTROLL_EL_MALL_ID = "egenkontroll-el";
export const EGENKONTROLL_MALNING_MALL_ID = "egenkontroll-malning";
export const EGENKONTROLL_BYGG_MALL_ID = "egenkontroll-bygg";
export const EGENKONTROLL_FASAD_MALL_ID = "egenkontroll-fasad";
export const EGENKONTROLL_TAK_MALL_ID = "egenkontroll-tak";
export const EGENKONTROLL_BADRUM_STAM_MALL_ID = "egenkontroll-badrum-stam";

export type EgenkontrollMallDef = {
  id: string;
  bransch: EgenkontrollBransch;
  titel: string;
  filnamn: string;
  beskrivning: string;
};

export const EGENKONTROLL_MALL_DEFS: EgenkontrollMallDef[] = [
  {
    id: EGENKONTROLL_VVS_MALL_ID,
    bransch: "vvs",
    titel: "Egenkontroll VVS",
    filnamn: "Egenkontroll_VVS.txt",
    beskrivning:
      "Kontrollplan VVS — provtryckning, infästning, läck ut m.m. Föreningen granskar; entreprenören signerar med BankID.",
  },
  {
    id: EGENKONTROLL_EL_MALL_ID,
    bransch: "el",
    titel: "Egenkontroll El",
    filnamn: "Egenkontroll_El.txt",
    beskrivning:
      "Elarbeten — behörig auktoriserad installatör, isolationsmätning, jordning och dokumentation enligt elregler.",
  },
  {
    id: EGENKONTROLL_MALNING_MALL_ID,
    bransch: "malning",
    titel: "Egenkontroll Målning",
    filnamn: "Egenkontroll_Malning.txt",
    beskrivning:
      "Målningsarbeten — montageanvisning, skötselråd och dokumenterade torktider mellan skikt.",
  },
  {
    id: EGENKONTROLL_BYGG_MALL_ID,
    bransch: "bygg",
    titel: "Egenkontroll Bygg",
    filnamn: "Egenkontroll_Bygg.txt",
    beskrivning:
      "Byggarbeten — infästning, brand, fuktsäkerhet, torktider och tillverkarens anvisningar.",
  },
  {
    id: EGENKONTROLL_FASAD_MALL_ID,
    bransch: "fasad",
    titel: "Egenkontroll Fasad",
    filnamn: "Egenkontroll_Fasad.txt",
    beskrivning:
      "Fasadarbeten — infästning, luftspalt, tätning, torktider och systemdokumentation.",
  },
  {
    id: EGENKONTROLL_TAK_MALL_ID,
    bransch: "tak",
    titel: "Egenkontroll Tak",
    filnamn: "Egenkontroll_Tak.txt",
    beskrivning:
      "Takarbeten — fall, täthet, infästning, torktider och snörasskydd.",
  },
  {
    id: EGENKONTROLL_BADRUM_STAM_MALL_ID,
    bransch: "badrum_stam",
    titel: "Egenkontroll Badrum och stambyte",
    filnamn: "Egenkontroll_Badrum_Stam.txt",
    beskrivning:
      "Badrum och stambyte — BKR/GVK, Säker Vatten, provtryckning, torktider och våtrumskontroller.",
  },
];

const MALL_ID_SET = new Set(EGENKONTROLL_MALL_DEFS.map((m) => m.id));

export function arEgenkontrollMallId(mallId: string): boolean {
  return MALL_ID_SET.has(mallId);
}

export function branschFranMallId(mallId: string): EgenkontrollBransch | undefined {
  return EGENKONTROLL_MALL_DEFS.find((m) => m.id === mallId)?.bransch;
}

export function introForBransch(bransch: EgenkontrollBransch): string {
  return EGENKONTROLL_INTROS[bransch] ?? EGENKONTROLL_INTROS.vvs;
}

export function kravSpecifikPlatsForRubrik(
  bransch: EgenkontrollBransch,
  rubrik: string,
): boolean {
  const mall = punkterForBransch(bransch).find((m) => m.rubrik === rubrik.trim());
  return mall?.kravSpecifikPlats === true;
}

export { EGENKONTROLL_PUNKTER_PER_BRANSCH };
