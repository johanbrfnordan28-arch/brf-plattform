import type { ArshjulHandelse } from "@/components/arshjul/arshjul";
import {
  normaliseraHandelse,
  skapaHandelseId,
  STANDARD_PAMINNELSE_DAGAR,
} from "@/components/arshjul/arshjul";
import { lasUnderhallsplanState } from "@/components/underhallsplan/underhallsplan-lager";
import type { Besiktning } from "@/components/underhallsplan/besiktningar";
import {
  normaliseraProjekt,
  projektStorageKey,
  type Projekt,
} from "@/components/projekt/projekt";
import { beraknaSenastGarantibesiktning } from "@/components/projekt/garantibesiktning";
import { importeraTidsplanerFranProjekt } from "@/components/projekt/tidsplan-arshjul";

function besiktningTillHandelse(b: Besiktning): ArshjulHandelse {
  const ar = b.intervallAr >= 1 ? b.intervallAr : 1;
  const intervall =
    ar === 10
      ? "vart_10_ar"
      : ar === 6
        ? "vart_6_ar"
        : ar === 3
          ? "vart_3_ar"
          : ar === 1
            ? "arlig"
            : ar >= 8
              ? "vart_10_ar"
              : ar >= 5
                ? "vart_6_ar"
                : "vart_3_ar";
  return normaliseraHandelse({
    id: skapaHandelseId(),
    titel: b.namn,
    beskrivning: `Importerat från underhållsplanen. Nästa planerat år: ${b.nastaBesiktningAr}, ${intervall === "arlig" ? "årligen" : `intervall ${ar} år`}.`,
    kategori: "besiktning",
    intervall,
    startAr: b.nastaBesiktningAr,
    senastKlarAr: b.senastUtförtAr,
    manad: 6,
    dag: 1,
    paminnelseDagar: [...STANDARD_PAMINNELSE_DAGAR],
    klar: false,
    skapad: new Date().toLocaleDateString("sv-SE"),
    externKalla: "underhallsplan",
    externId: b.id,
  });
}

function garantiTillHandelse(p: Projekt): ArshjulHandelse | null {
  const g = p.garantibesiktning;
  if (!g.slutbesiktningDatum || g.utförd) return null;
  const senast = beraknaSenastGarantibesiktning(
    g.slutbesiktningDatum,
    g.garantiAr,
  );
  if (!senast) return null;
  const [ar, manad, dag] = senast.split("-").map(Number);
  return normaliseraHandelse({
    id: skapaHandelseId(),
    titel: `Garantibesiktning — ${p.titel}`,
    beskrivning: `2-årsbesiktning för projekt ${p.titel}. Senast ${senast}.`,
    kategori: "besiktning",
    intervall: "engang",
    datum: senast,
    startAr: ar,
    manad,
    dag,
    paminnelseDagar: [365, 180, 90, 60, 30, 14],
    klar: false,
    skapad: new Date().toLocaleDateString("sv-SE"),
    externKalla: "projekt",
    externId: p.id,
  });
}

export function importeraFranUnderhallsplan(
  befintliga: ArshjulHandelse[],
): ArshjulHandelse[] {
  const state = lasUnderhallsplanState();
  if (!state?.besiktningar?.length) return [];

  const harId = new Set(
    befintliga
      .filter((h) => h.externKalla === "underhallsplan" && h.externId)
      .map((h) => h.externId),
  );

  const nya = state.besiktningar
    .filter((b) => b.aktiv && !harId.has(b.id))
    .map(besiktningTillHandelse);

  return nya;
}

export function importeraFranProjekt(
  befintliga: ArshjulHandelse[],
): ArshjulHandelse[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(projektStorageKey());
    if (!raw) return [];
    const projekt = (JSON.parse(raw) as Projekt[]).map((p) => normaliseraProjekt(p));
    const harId = new Set(
      befintliga
        .filter((h) => h.externKalla === "projekt" && h.externId)
        .map((h) => h.externId),
    );
    const nya: ArshjulHandelse[] = [];
    for (const p of projekt) {
      if (!harId.has(p.id)) {
        const h = garantiTillHandelse(p);
        if (h) nya.push(h);
      }
    }
    nya.push(...importeraTidsplanerFranProjekt(befintliga, projekt));
    return nya;
  } catch {
    return [];
  }
}
