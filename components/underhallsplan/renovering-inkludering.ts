import {
  hamtaKomponentMall,
  type KomponentMall,
} from "@/components/underhallsplan/komponentregister";
import { hamtaVanligaInkluderadeUnderkomponenter } from "@/components/underhallsplan/underhall-atgard-katalog";
import { fordelRenovering } from "@/components/underhallsplan/renovering-fordelning";
import type { PlaneradAtgardPreview } from "@/components/underhallsplan/renovering-planering";
import type { UtfördRenovering } from "@/components/underhallsplan/renoveringar";

export type LankbarUnderkomponent = {
  id: string;
  etikett: string;
};

export function hamtaHuvudUnderkomponentIdForRenovering(
  komponent: string,
  _underkomponentId?: string,
): string | null {
  if (komponent === "Tak") return "takyta";
  return _underkomponentId ?? null;
}

export function hamtaLankbaraUnderkomponenter(
  komponent: string,
  huvudUnderkomponentId: string,
): LankbarUnderkomponent[] {
  const mall = hamtaKomponentMall(komponent);
  if (!mall) return [];
  const ids = hamtaVanligaInkluderadeUnderkomponenter(
    komponent,
    huvudUnderkomponentId,
  );
  return ids
    .map((id) => {
      const def = mall.underkomponenter.find((u) => u.id === id);
      return def ? { id, etikett: def.etikett } : null;
    })
    .filter((x): x is LankbarUnderkomponent => x != null);
}

function normaliseraText(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ");
}

/** Föreslå kryssrutor utifrån titel/omfattning (t.ex. skorsten i fakturatext). */
export function gissaInkluderadeUnderkomponenter(
  renovering: Pick<UtfördRenovering, "komponent" | "titel" | "omfattning">,
  huvudUnderkomponentId: string,
): string[] {
  if (renovering.komponent !== "Tak" || huvudUnderkomponentId !== "takyta") {
    return [];
  }
  const text = normaliseraText(`${renovering.titel} ${renovering.omfattning}`);
  const träffar: string[] = [];
  if (text.includes("skorsten")) träffar.push("skorsten");
  if (text.includes("takterrass") || text.includes("gemensam terrass")) {
    träffar.push("takterrass");
  }
  if (text.includes("medlemstakterrass") || text.includes("medlems terrass")) {
    träffar.push("medlemstakterrass");
  }
  return träffar.filter((id) =>
    hamtaVanligaInkluderadeUnderkomponenter("Tak", "takyta").includes(id),
  );
}

export function sammanstallInkluderadeUnderkomponenter(
  renovering: Pick<UtfördRenovering, "komponent" | "titel" | "omfattning" | "inkluderadeUnderkomponenter">,
  huvudUnderkomponentId: string,
): string[] {
  const manuella = renovering.inkluderadeUnderkomponenter ?? [];
  const gissade = gissaInkluderadeUnderkomponenter(renovering, huvudUnderkomponentId);
  const tillåtna = new Set(
    hamtaVanligaInkluderadeUnderkomponenter(renovering.komponent, huvudUnderkomponentId),
  );
  return [...new Set([...manuella, ...gissade])].filter((id) => tillåtna.has(id));
}

/** Endast huvuddelen får egen kommande åtgärd — inte inkluderade delar. */
export function filtreraPlaneradeForKommandeAtgard(
  renovering: UtfördRenovering,
  planerade: PlaneradAtgardPreview[],
): PlaneradAtgardPreview[] {
  if (planerade.length <= 1) return planerade;

  const delar = fordelRenovering(renovering);
  const takDel = delar.find((d) => d.atgardTyp === "tak");
  if (takDel) {
    const träff = planerade.filter((p) => p.renoveringId === takDel.renoveringId);
    if (träff.length > 0) return träff;
  }
  return [planerade[0]];
}

export function visaInkluderadePanel(komponent: string): boolean {
  const huvud = hamtaHuvudUnderkomponentIdForRenovering(komponent);
  if (!huvud) return false;
  return hamtaLankbaraUnderkomponenter(komponent, huvud).length > 0;
}

export function etiketterForInkluderade(
  mall: KomponentMall,
  ids: string[],
): string[] {
  return ids.map((id) => mall.underkomponenter.find((u) => u.id === id)?.etikett ?? id);
}
