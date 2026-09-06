import type { ArshjulHandelse } from "@/components/arshjul/arshjul";
import {
  normaliseraHandelse,
  skapaHandelseId,
  STANDARD_PAMINNELSE_DAGAR,
} from "@/components/arshjul/arshjul";
import type { Projekt } from "@/components/projekt/projekt";
import { formatDatum, type TidsplanMilstolpe } from "@/components/projekt/tidsplan";

function milstolpeTillHandelse(
  p: Projekt,
  m: TidsplanMilstolpe,
): ArshjulHandelse | null {
  const datum = m.planeratDatum ?? m.entreprenorDatum;
  if (!datum) return null;
  const [ar, manad, dag] = datum.split("-").map(Number);
  if (!ar || !manad) return null;

  return normaliseraHandelse({
    id: skapaHandelseId(),
    titel: `${m.titel} — ${p.titel}`,
    beskrivning: [
      `Projekt: ${p.titel}.`,
      m.ansvarig ? `Ansvarig: ${m.ansvarig}.` : "",
      m.protokollReferens ? `Källa: ${m.protokollReferens}.` : "",
      `Planerat: ${formatDatum(datum)}.`,
    ]
      .filter(Boolean)
      .join(" "),
    kategori: "underhall",
    typ: "engang",
    datum,
    startAr: ar,
    manad,
    dag: dag || 1,
    paminnelseDagar: [...STANDARD_PAMINNELSE_DAGAR],
    klar: m.klar,
    skapad: new Date().toLocaleDateString("sv-SE"),
    externKalla: "projekt",
    externId: `projekt-tidsplan-${p.id}-${m.id}`,
  });
}

export function tidsplanMilstolparTillArshjul(
  projekt: Projekt,
): ArshjulHandelse[] {
  return projekt.tidsplan.milstolpar
    .map((m) => milstolpeTillHandelse(projekt, m))
    .filter((h): h is ArshjulHandelse => h !== null);
}

export function importeraTidsplanerFranProjekt(
  befintliga: ArshjulHandelse[],
  projektLista: Projekt[],
): ArshjulHandelse[] {
  const harId = new Set(
    befintliga
      .filter((h) => h.externId?.startsWith("projekt-tidsplan-"))
      .map((h) => h.externId),
  );

  const nya: ArshjulHandelse[] = [];
  for (const p of projektLista) {
    for (const h of tidsplanMilstolparTillArshjul(p)) {
      if (!harId.has(h.externId)) nya.push(h);
    }
  }
  return nya;
}
