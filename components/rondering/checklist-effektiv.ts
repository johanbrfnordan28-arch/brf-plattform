import {
  checklistaPunktNyckel,
  hamtaRonderingChecklista,
  type RonderingChecklistaMall,
  type RonderingChecklistaPunkt,
  type RonderingChecklistaSektion,
  type RonderingChecklistaTyp,
} from "@/components/rondering/checklist-mallar";
import {
  checklistSektionKrav,
  hamtaPunktKrav,
} from "@/components/rondering/checklist-punkt-taggar";
import {
  foreningHarEgenskap,
  type ForeningEgenskaper,
} from "@/components/rondering/forening-egenskaper";
import type { RonderingEgnaPunkt } from "@/components/rondering/rondering-lager";

export type ChecklistaAnpassning = {
  doldaPunkter: string[];
  egnaPunkter: RonderingEgnaPunkt[];
};

function punktSkallVisas(
  nyckel: string,
  egenskaper: ForeningEgenskaper,
  dolda: Set<string>,
): boolean {
  if (dolda.has(nyckel)) return false;
  const krav = hamtaPunktKrav(nyckel);
  return foreningHarEgenskap(egenskaper, krav);
}

function sektionSkallVisas(
  typ: RonderingChecklistaTyp,
  sektionId: string,
  egenskaper: ForeningEgenskaper,
  harSynligaPunkter: boolean,
): boolean {
  const sektionNyckel = `${typ}:${sektionId}`;
  const krav = checklistSektionKrav[sektionNyckel];
  if (krav && !foreningHarEgenskap(egenskaper, krav)) return false;
  return harSynligaPunkter;
}

export function byggEffektivChecklista(
  typ: RonderingChecklistaTyp,
  egenskaper: ForeningEgenskaper,
  anpassning: ChecklistaAnpassning,
): RonderingChecklistaMall {
  const bas = hamtaRonderingChecklista(typ);
  const dolda = new Set(anpassning.doldaPunkter);

  const sektioner: RonderingChecklistaSektion[] = [];

  for (const sektion of bas.sektioner) {
    const punkter: RonderingChecklistaPunkt[] = sektion.punkter.filter((p) => {
      const nyckel = checklistaPunktNyckel(typ, sektion.id, p.id);
      return punktSkallVisas(nyckel, egenskaper, dolda);
    });

    const egnaISektion = anpassning.egnaPunkter
      .filter((e) => e.typ === typ && e.sektionId === sektion.id)
      .map((e) => ({ id: e.id, text: e.text }));

    const allaPunkter = [...punkter, ...egnaISektion];

    if (
      sektionSkallVisas(typ, sektion.id, egenskaper, allaPunkter.length > 0)
    ) {
      sektioner.push({
        ...sektion,
        punkter: allaPunkter,
      });
    }
  }

  const egnaSektioner = new Map<string, RonderingChecklistaPunkt[]>();
  for (const e of anpassning.egnaPunkter) {
    if (e.typ !== typ) continue;
    if (bas.sektioner.some((s) => s.id === e.sektionId)) continue;
    const lista = egnaSektioner.get(e.sektionId) ?? [];
    lista.push({ id: e.id, text: e.text });
    egnaSektioner.set(e.sektionId, lista);
  }
  for (const [sektionId, punkter] of egnaSektioner) {
    sektioner.push({
      id: sektionId,
      etikett: "Egna tillägg",
      beskrivning: "Tillagt för er förening.",
      punkter,
    });
  }

  return { ...bas, sektioner };
}

export function allaEffektivaPunktNycklar(
  typ: RonderingChecklistaTyp,
  egenskaper: ForeningEgenskaper,
  anpassning: ChecklistaAnpassning,
): string[] {
  const mall = byggEffektivChecklista(typ, egenskaper, anpassning);
  return mall.sektioner.flatMap((s) =>
    s.punkter.map((p) => checklistaPunktNyckel(typ, s.id, p.id)),
  );
}

export function beraknaEffektivFramsteg(
  typ: RonderingChecklistaTyp,
  klaraPunkter: string[],
  egenskaper: ForeningEgenskaper,
  anpassning: ChecklistaAnpassning,
): { klara: number; totalt: number; procent: number } {
  const alla = allaEffektivaPunktNycklar(typ, egenskaper, anpassning);
  const klaraSet = new Set(klaraPunkter);
  const klara = alla.filter((k) => klaraSet.has(k)).length;
  const totalt = alla.length;
  return {
    klara,
    totalt,
    procent: totalt > 0 ? Math.round((klara / totalt) * 100) : 0,
  };
}

export function hittaEffektivPunktText(
  typ: RonderingChecklistaTyp,
  nyckel: string,
  egenskaper: ForeningEgenskaper,
  anpassning: ChecklistaAnpassning,
): string | undefined {
  const mall = byggEffektivChecklista(typ, egenskaper, anpassning);
  for (const sektion of mall.sektioner) {
    for (const punkt of sektion.punkter) {
      if (checklistaPunktNyckel(typ, sektion.id, punkt.id) === nyckel) {
        return punkt.text;
      }
    }
  }
  return undefined;
}
