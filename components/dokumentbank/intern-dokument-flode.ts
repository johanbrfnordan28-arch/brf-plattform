import type { ArshjulBilaga, ArshjulHandelse } from "@/components/arshjul/arshjul";
import { arshjulStorageKey } from "@/components/arshjul/arshjul";
import {
  lasForeningsDokument,
  skapaForeningsDokumentId,
  sparaForeningsDokument,
  type ForeningsDokument,
} from "@/components/dokumentbank/forening-dokumenter-lager";
import {
  hamtaDokumentFil,
  sparaDokumentFil,
} from "@/components/dokumentbank/forening-dokument-fil-lager";

export type ArshjulBilagaRef = {
  handelseId: string;
  handelseRubrik: string;
  bilagaId: string;
  filnamn: string;
};

export function lasArshjulHandelser(): ArshjulHandelse[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(arshjulStorageKey());
    if (!raw) return [];
    return JSON.parse(raw) as ArshjulHandelse[];
  } catch {
    return [];
  }
}

export function listaArshjulBilagor(): ArshjulBilagaRef[] {
  const rader: ArshjulBilagaRef[] = [];
  for (const h of lasArshjulHandelser()) {
    for (const b of h.bilagor ?? []) {
      if (!b.filnamn?.trim()) continue;
      rader.push({
        handelseId: h.id,
        handelseRubrik: h.titel?.trim() || "Årshjul",
        bilagaId: b.id,
        filnamn: b.filnamn,
      });
    }
  }
  return rader;
}

function hittaArshjulBilaga(
  handelseId: string,
  bilagaId: string,
): ArshjulBilaga | null {
  const h = lasArshjulHandelser().find((x) => x.id === handelseId);
  return h?.bilagor?.find((b) => b.id === bilagaId) ?? null;
}

/** Kopiera årshjulsbilaga till föreningens dokument. */
export function skapaForeningsDokumentFranArshjul(
  ref: ArshjulBilagaRef,
): { ok: true; dokument: ForeningsDokument } | { ok: false; fel: string } {
  const bilaga = hittaArshjulBilaga(ref.handelseId, ref.bilagaId);
  if (!bilaga?.dataUrl) {
    return { ok: false, fel: "Bilagan kunde inte hittas." };
  }
  const id = skapaForeningsDokumentId();
  const nu = new Date().toISOString();
  const sparat = sparaDokumentFil(id, {
    filnamn: bilaga.filnamn,
    mime: "application/octet-stream",
    dataUrl: bilaga.dataUrl,
    storlek: bilaga.dataUrl.length,
    uppladdad: new Date().toLocaleDateString("sv-SE"),
  });
  if (!sparat) {
    return { ok: false, fel: "Kunde inte spara filen." };
  }
  const dokument: ForeningsDokument = {
    id,
    mallId: "uppladdad-fil",
    mallTitel: "Från årshjul",
    mallFilnamn: bilaga.filnamn,
    titel: bilaga.filnamn.replace(/\.[^.]+$/, ""),
    status: "utkast",
    skapadDatum: nu,
    uppdateradDatum: nu,
    notering: "",
    omrade: "styrelse",
    dokumentKalla: "fil",
    koppladeProjektId: [],
  };
  const lager = lasForeningsDokument();
  sparaForeningsDokument({
    ...lager,
    dokument: [dokument, ...lager.dokument],
  });
  return { ok: true, dokument };
}

/** Kopiera föreningsdokument (fil) till en årshjulsbilaga — sparas via onSpara i årshjulet. */
export function kopieraForeningsDokumentTillBilaga(
  dokId: string,
): { ok: true; bilaga: ArshjulBilaga } | { ok: false; fel: string } {
  const fil = hamtaDokumentFil(dokId);
  if (!fil?.dataUrl) {
    return { ok: false, fel: "Dokumentet har ingen sparad fil att kopiera." };
  }
  return {
    ok: true,
    bilaga: {
      id: `bil-import-${Date.now().toString(36)}`,
      filnamn: fil.filnamn,
      dataUrl: fil.dataUrl,
    },
  };
}

/** Uppladdade föreningsdokument med fil som kan kopieras till årshjul. */
export function listaForeningsDokumentMedFil(): ForeningsDokument[] {
  return lasForeningsDokument().dokument.filter(
    (d) => d.dokumentKalla === "fil" && hamtaDokumentFil(d.id),
  );
}
