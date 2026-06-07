import type { KomponentDetaljData } from "@/components/underhallsplan/komponentregister";
import {
  beraknaTakfonsterPris,
  normaliseraTakfonsterData,
  TAKFONSTER_UNDERKOMPONENT_ID,
} from "@/components/underhallsplan/takfonster";

export function hamtaTakfonsterKostnadTak(
  takDetalj: KomponentDetaljData | undefined,
): number {
  if (!takDetalj) return 0;
  const rad = takDetalj.underkomponenter.find(
    (r) => r.id === TAKFONSTER_UNDERKOMPONENT_ID,
  );
  if (!rad?.aktiv) return 0;
  const data = normaliseraTakfonsterData(
    takDetalj.takfonsterRegister?.[TAKFONSTER_UNDERKOMPONENT_ID],
  );
  return beraknaTakfonsterPris(data).totaltKr;
}
