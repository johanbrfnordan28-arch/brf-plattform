import type { ArshjulHandelse } from "@/components/arshjul/arshjul";
import {
  normaliseraHandelse,
  skapaHandelseId,
  STANDARD_PAMINNELSE_DAGAR,
} from "@/components/arshjul/arshjul";
import { lasUnderhallsplanState } from "@/components/underhallsplan/underhallsplan-lager";
import type { Besiktning } from "@/components/underhallsplan/besiktningar";
import { OVK_INTERVALL_VERKSAMHET_AR } from "@/components/underhallsplan/besiktningar";
import {
  normaliseraProjekt,
  projektStorageKey,
  type Projekt,
} from "@/components/projekt/projekt";
import { beraknaSenastGarantibesiktning } from "@/components/projekt/garantibesiktning";
import { importeraTidsplanerFranProjekt } from "@/components/projekt/tidsplan-arshjul";

function kategoriFranBesiktning(id: string): ArshjulHandelse["kategori"] {
  if (id === "ovk") return "ovk";
  if (id === "sotning") return "sotning";
  if (id === "radon") return "radon";
  if (id === "energideklaration") return "energideklaration";
  return "besiktning";
}

function besiktningTillHandelse(b: Besiktning): ArshjulHandelse {
  const intervall = b.intervallAr >= 1 ? b.intervallAr : 1;
  const arsPlanering = b.id === "energideklaration" || b.id === "radon";
  return normaliseraHandelse({
    id: skapaHandelseId(),
    titel: b.namn,
    beskrivning: arsPlanering
      ? `Importerat från underhållsplanen. Planerat år ${b.nastaBesiktningAr} — exakt datum bestäms under året. Intervall ${intervall} år.`
      : `Importerat från underhållsplanen. Nästa planerat år: ${b.nastaBesiktningAr}, intervall ${intervall} år.`,
    kategori: kategoriFranBesiktning(b.id),
    typ: "intervall",
    startAr: b.nastaBesiktningAr,
    intervallAr: intervall,
    senastKlarAr: b.senastUtförtAr,
    utanFastDatum: arsPlanering,
    manad: arsPlanering ? undefined : 6,
    dag: arsPlanering ? undefined : 1,
    paminnelseDagar: [...STANDARD_PAMINNELSE_DAGAR],
    klar: false,
    skapad: new Date().toLocaleDateString("sv-SE"),
    externKalla: "underhallsplan",
    externId: b.id,
  });
}

/** OVK kan ha två parallella intervall — bostäder (3/6 år) och verksamhet (3 år). */
function ovkTillHandelser(b: Besiktning): ArshjulHandelse[] {
  const bostadIntervall = b.intervallAr === 3 || b.intervallAr === 6 ? b.intervallAr : 6;
  const poster: ArshjulHandelse[] = [
    normaliseraHandelse({
      id: skapaHandelseId(),
      titel: "OVK — bostäder",
      beskrivning: `Importerat från underhållsplanen. Planerat år ${b.nastaBesiktningAr}, intervall ${bostadIntervall} år (bostäder). Exakt datum bestäms under året.`,
      kategori: "ovk",
      typ: "intervall",
      startAr: b.nastaBesiktningAr,
      intervallAr: bostadIntervall,
      senastKlarAr: b.senastUtförtAr,
      utanFastDatum: true,
      paminnelseDagar: [...STANDARD_PAMINNELSE_DAGAR],
      klar: false,
      skapad: new Date().toLocaleDateString("sv-SE"),
      externKalla: "underhallsplan",
      externId: `${b.id}-bostad`,
    }),
  ];

  if (b.ovkInkluderaVerksamhet) {
    const verksamIntervall =
      b.ovkIntervallVerksamhetAr === 3 || b.ovkIntervallVerksamhetAr === 6
        ? b.ovkIntervallVerksamhetAr
        : OVK_INTERVALL_VERKSAMHET_AR;
    poster.push(
      normaliseraHandelse({
        id: skapaHandelseId(),
        titel: "OVK — verksamhet",
        beskrivning: `Importerat från underhållsplanen. Planerat år ${b.ovkNastaVerksamhetAr ?? b.nastaBesiktningAr}, intervall ${verksamIntervall} år (verksamhetslokaler). Exakt datum bestäms under året.`,
        kategori: "ovk",
        typ: "intervall",
        startAr: b.ovkNastaVerksamhetAr ?? b.nastaBesiktningAr,
        intervallAr: verksamIntervall,
        senastKlarAr: b.ovkSenastVerksamhetAr,
        utanFastDatum: true,
        paminnelseDagar: [...STANDARD_PAMINNELSE_DAGAR],
        klar: false,
        skapad: new Date().toLocaleDateString("sv-SE"),
        externKalla: "underhallsplan",
        externId: `${b.id}-verksamhet`,
      }),
    );
  }

  return poster;
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
    titel: `Garantbesiktning — ${p.titel}`,
    beskrivning: `2-årsbesiktning för projekt ${p.titel}. Senast ${senast}.`,
    kategori: "garantbesiktning",
    typ: "engang",
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

  const nya: ArshjulHandelse[] = [];
  for (const b of state.besiktningar) {
    if (!b.aktiv) continue;
    if (b.id === "ovk") {
      const ovkPoster = ovkTillHandelser(b).filter((h) => !harId.has(h.externId));
      nya.push(...ovkPoster);
      continue;
    }
    if (harId.has(b.id)) continue;
    nya.push(besiktningTillHandelse(b));
  }

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
