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

export type MedlemsKravState = {
  punkter: MedlemsKravPunkt[];
  skickadTillMedlem?: string;
  signeringId?: string;
  medlemSignerad?: {
    datum: string;
    av: string;
    metod: "bankid";
  };
};

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

  return { punkter };
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

export function taBortMedlemsKravPunkt(
  state: MedlemsKravState,
  punktId: string,
): MedlemsKravState {
  return {
    ...state,
    punkter: state.punkter.filter((p) => p.id !== punktId || !p.egen),
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
  return {
    punkter: data.punkter.map((p) => ({
      id: String(p.id),
      sektionId: String(p.sektionId),
      sektionEtikett: String(p.sektionEtikett),
      text: String(p.text),
      ingar: Boolean(p.ingar),
      egen: p.egen === true,
    })),
    skickadTillMedlem: data.skickadTillMedlem,
    signeringId: data.signeringId,
    medlemSignerad: data.medlemSignerad,
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
