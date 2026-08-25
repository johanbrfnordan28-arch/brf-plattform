import {
  byggChecklista,
  checklistaPunktId,
  type ChecklistaPunkt,
} from "@/components/medlemmar/renoveringschecklistor";
import type { RenoveringsMallId } from "@/components/lagenhetsarkiv/renoverings-mallar";

export type MedlemsKravPunkt = {
  id: string;
  sektionId: string;
  sektionEtikett: string;
  text: string;
  /** Styrelsen har valt att punkten ska ingå i medlemmens krav. */
  ingar: boolean;
  /** Tillagd manuellt i mappen — kan tas bort. */
  egen?: boolean;
};

/** Flöde för ombyggnadsavtal: utkast → styrelse → medlem → signerad. */
export type OmbyggnadsavtalStatus =
  | "utkast"
  | "styrelsegranskning"
  | "skickad"
  | "signerad";

export type MedlemsKravState = {
  punkter: MedlemsKravPunkt[];
  status?: OmbyggnadsavtalStatus;
  /** Genererad avtalstext vid skick till styrelse/medlem. */
  avtalText?: string;
  styrelseSkickad?: string;
  skickadTillMedlem?: string;
  signeringId?: string;
  medlemSignerad?: {
    datum: string;
    av: string;
    metod: "bankid";
  };
};

export const OMBYGGNADSAVTAL_STATUS_ETIKETT: Record<
  OmbyggnadsavtalStatus,
  string
> = {
  utkast: "Utkast",
  styrelsegranskning: "Granskas av styrelsen",
  skickad: "Skickad till medlem",
  signerad: "Signerad",
};

export function hamtaOmbyggnadsavtalStatus(
  state: MedlemsKravState | undefined,
): OmbyggnadsavtalStatus {
  if (!state) return "utkast";
  if (state.medlemSignerad || state.status === "signerad") return "signerad";
  if (state.status === "skickad" || state.skickadTillMedlem) return "skickad";
  if (state.status === "styrelsegranskning" || state.styrelseSkickad) {
    return "styrelsegranskning";
  }
  return state.status ?? "utkast";
}

export function skapaMedlemsKravForTyp(mallId: RenoveringsMallId): MedlemsKravState {
  const sektioner = byggChecklista([mallId]);
  const punkter: MedlemsKravPunkt[] = [];

  for (const { sektion, punkter: sektionPunkter } of sektioner) {
    for (const punkt of sektionPunkter) {
      punkter.push({
        id: checklistaPunktId(sektion.id, punkt.id),
        sektionId: sektion.id,
        sektionEtikett: sektion.etikett,
        text: punkt.text,
        ingar: true,
      });
    }
  }

  return { punkter, status: "utkast" };
}

export function kompileraMedlemsKrav(
  state: MedlemsKravState | undefined,
): MedlemsKravPunkt[] {
  if (!state) return [];
  return state.punkter.filter((p) => p.ingar);
}

export function grupperaMedlemsKrav(
  punkter: MedlemsKravPunkt[],
): { sektionId: string; sektionEtikett: string; punkter: MedlemsKravPunkt[] }[] {
  const map = new Map<
    string,
    { sektionId: string; sektionEtikett: string; punkter: MedlemsKravPunkt[] }
  >();

  for (const punkt of punkter) {
    const key = punkt.sektionId;
    if (!map.has(key)) {
      map.set(key, {
        sektionId: punkt.sektionId,
        sektionEtikett: punkt.sektionEtikett,
        punkter: [],
      });
    }
    map.get(key)!.punkter.push(punkt);
  }

  return [...map.values()];
}

export function laggTillEgenMedlemsKravPunkt(
  state: MedlemsKravState,
  sektionId: string,
  sektionEtikett: string,
  text: string,
): MedlemsKravState {
  const trimmed = text.trim();
  if (!trimmed) return state;

  const id = `egen-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  return {
    ...state,
    status: hamtaOmbyggnadsavtalStatus(state) === "signerad" ? "signerad" : "utkast",
    styrelseSkickad: undefined,
    skickadTillMedlem: undefined,
    signeringId: undefined,
    punkter: [
      ...state.punkter,
      {
        id,
        sektionId,
        sektionEtikett,
        text: trimmed,
        ingar: true,
        egen: true,
      },
    ],
  };
}

/** Tar bort ett moment (egen eller mallpunkt) från utkastet. */
export function taBortMedlemsKravPunkt(
  state: MedlemsKravState,
  punktId: string,
): MedlemsKravState {
  return {
    ...state,
    status: "utkast",
    styrelseSkickad: undefined,
    skickadTillMedlem: undefined,
    signeringId: undefined,
    punkter: state.punkter.filter((p) => p.id !== punktId),
  };
}

export function normaliseraMedlemsKrav(
  raw: unknown,
  mallId: RenoveringsMallId,
): MedlemsKravState {
  if (!raw || typeof raw !== "object") return skapaMedlemsKravForTyp(mallId);
  const data = raw as Partial<MedlemsKravState>;
  if (!Array.isArray(data.punkter) || data.punkter.length === 0) {
    return skapaMedlemsKravForTyp(mallId);
  }
  const base: MedlemsKravState = {
    punkter: data.punkter.map((p) => ({
      id: String(p.id),
      sektionId: String(p.sektionId),
      sektionEtikett: String(p.sektionEtikett),
      text: String(p.text),
      ingar: Boolean(p.ingar),
      egen: p.egen === true,
    })),
    status: data.status,
    avtalText: typeof data.avtalText === "string" ? data.avtalText : undefined,
    styrelseSkickad: data.styrelseSkickad,
    skickadTillMedlem: data.skickadTillMedlem,
    signeringId: data.signeringId,
    medlemSignerad: data.medlemSignerad,
  };
  return {
    ...base,
    status: hamtaOmbyggnadsavtalStatus(base),
  };
}

export function punktFranChecklista(
  sektionId: string,
  sektionEtikett: string,
  punkt: ChecklistaPunkt,
  ingar = true,
): MedlemsKravPunkt {
  return {
    id: checklistaPunktId(sektionId, punkt.id),
    sektionId,
    sektionEtikett,
    text: punkt.text,
    ingar,
  };
}
