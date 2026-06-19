import { safeSetLocalStorage } from "@/lib/localStorage";
import { foreningStorageKey } from "@/lib/foreningStorage";
import {
  sbaChecklistaPunkter,
  type SbaChecklistaPunkt,
} from "@/components/guider/sba-checklista";

const LAGER_NYCKEL = "brf-sba-arbete";

export type SbaProjektTyp = "inget" | "medlem" | "forening-mindre" | "forening-storre";

export type SbaArbeteState = {
  ansvarig: string;
  senastArligKontroll: string;
  nastaKontrollPlanerad: string;
  antalBrandvarnare: number;
  antalBrandslackare: number;
  senastBatteribyteAr: string;
  projektTyp: SbaProjektTyp;
  projektNamn: string;
  entreprenorInformerad: boolean;
  dokumentationLevererad: boolean;
  medlemsRenoveringAnteckning: string;
  avvikelser: string;
  projektKommunikation: string;
  checklista: Record<string, boolean>;
};

export function tomSbaArbete(): SbaArbeteState {
  return {
    ansvarig: "",
    senastArligKontroll: "",
    nastaKontrollPlanerad: "",
    antalBrandvarnare: 0,
    antalBrandslackare: 0,
    senastBatteribyteAr: "",
    projektTyp: "inget",
    projektNamn: "",
    entreprenorInformerad: false,
    dokumentationLevererad: false,
    medlemsRenoveringAnteckning: "",
    avvikelser: "",
    projektKommunikation: "",
    checklista: {},
  };
}

function storageKey(): string {
  return foreningStorageKey(LAGER_NYCKEL);
}

export function normaliseraSbaArbete(raw: unknown): SbaArbeteState {
  const tom = tomSbaArbete();
  if (!raw || typeof raw !== "object") return tom;
  const d = raw as Partial<SbaArbeteState>;
  const projektTyp = d.projektTyp;
  const giltigProjektTyp: SbaProjektTyp =
    projektTyp === "medlem" ||
    projektTyp === "forening-mindre" ||
    projektTyp === "forening-storre"
      ? projektTyp
      : "inget";

  return {
    ansvarig: String(d.ansvarig ?? ""),
    senastArligKontroll: String(d.senastArligKontroll ?? ""),
    nastaKontrollPlanerad: String(d.nastaKontrollPlanerad ?? ""),
    antalBrandvarnare: Math.max(0, Number(d.antalBrandvarnare) || 0),
    antalBrandslackare: Math.max(0, Number(d.antalBrandslackare) || 0),
    senastBatteribyteAr: String(d.senastBatteribyteAr ?? ""),
    projektTyp: giltigProjektTyp,
    projektNamn: String(d.projektNamn ?? ""),
    entreprenorInformerad: Boolean(d.entreprenorInformerad),
    dokumentationLevererad: Boolean(d.dokumentationLevererad),
    medlemsRenoveringAnteckning: String(d.medlemsRenoveringAnteckning ?? ""),
    avvikelser: String(d.avvikelser ?? ""),
    projektKommunikation: String(d.projektKommunikation ?? ""),
    checklista:
      d.checklista && typeof d.checklista === "object"
        ? Object.fromEntries(
            Object.entries(d.checklista).map(([k, v]) => [k, Boolean(v)]),
          )
        : {},
  };
}

export function lasSbaArbete(): SbaArbeteState {
  if (typeof window === "undefined") return tomSbaArbete();
  try {
    const raw = localStorage.getItem(storageKey());
    if (!raw) return tomSbaArbete();
    return normaliseraSbaArbete(JSON.parse(raw));
  } catch {
    return tomSbaArbete();
  }
}

export function sparaSbaArbete(state: SbaArbeteState): boolean {
  if (typeof window === "undefined") return false;
  return safeSetLocalStorage(storageKey(), JSON.stringify(state)).ok;
}

export type SbaArbeteStatistik = {
  totalt: number;
  klara: number;
  procent: number;
  klaraPunkter: SbaChecklistaPunkt[];
  saknadePunkter: SbaChecklistaPunkt[];
  arligKontrollOk: boolean;
  projektStatus: "ok" | "varning" | "neutral";
  projektMeddelande: string | null;
};

export function beraknaSbaStatistik(state: SbaArbeteState): SbaArbeteStatistik {
  const alla = sbaChecklistaPunkter();
  const klaraPunkter = alla.filter((p) => state.checklista[p.id]);
  const saknadePunkter = alla.filter((p) => !state.checklista[p.id]);
  const totalt = alla.length;
  const klara = klaraPunkter.length;
  const procent = totalt > 0 ? Math.round((klara / totalt) * 100) : 0;

  const arligKontrollOk = Boolean(state.senastArligKontroll.trim());

  let projektStatus: SbaArbeteStatistik["projektStatus"] = "neutral";
  let projektMeddelande: string | null = null;

  if (state.projektTyp === "forening-storre") {
    if (state.entreprenorInformerad && state.dokumentationLevererad) {
      projektStatus = "ok";
      projektMeddelande = "Entreprenören är informerad och brandskyddsdokumentation är levererad.";
    } else {
      projektStatus = "varning";
      projektMeddelande =
        "Större projekt kräver att entreprenören informerats och att brandskyddsdokumentation finns.";
    }
  } else if (state.projektTyp === "forening-mindre") {
    projektStatus = state.entreprenorInformerad ? "ok" : "varning";
    projektMeddelande = state.entreprenorInformerad
      ? "Enklare brandskyddsinformation är given till entreprenören."
      : "Informera entreprenören skriftligt om utrymningsvägar och branddörrar.";
  } else if (state.projektTyp === "medlem") {
    projektStatus = state.medlemsRenoveringAnteckning.trim() ? "ok" : "varning";
    projektMeddelande = state.medlemsRenoveringAnteckning.trim()
      ? "Medlemsrenovering är dokumenterad."
      : "Dokumentera enkel brandskyddsinformation till medlemmen.";
  }

  return {
    totalt,
    klara,
    procent,
    klaraPunkter,
    saknadePunkter,
    arligKontrollOk,
    projektStatus,
    projektMeddelande,
  };
}

export const sbaProjektTypEtiketter: Record<SbaProjektTyp, string> = {
  inget: "Inget pågående projekt",
  medlem: "Medlemmars renovering",
  "forening-mindre": "Föreningens mindre projekt",
  "forening-storre": "Föreningens större projekt",
};
