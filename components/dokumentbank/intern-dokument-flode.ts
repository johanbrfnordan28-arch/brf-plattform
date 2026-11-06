import type { ArshjulBilaga, ArshjulHandelse } from "@/components/arshjul/arshjul";
import { arshjulStorageKey } from "@/components/arshjul/arshjul";
import {
  lasForeningsDokument,
  skapaForeningsDokumentId,
  sparaForeningsDokument,
  type ForeningsDokument,
} from "@/components/dokumentbank/forening-dokumenter-lager";
import {
  dokumentFilnamn,
  dokumentDeladFil,
  hamtaDokumentFilUrl,
  harDokumentFil,
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
export async function skapaForeningsDokumentFranArshjul(
  ref: ArshjulBilagaRef,
): Promise<{ ok: true; dokument: ForeningsDokument } | { ok: false; fel: string }> {
  const bilaga = hittaArshjulBilaga(ref.handelseId, ref.bilagaId);
  if (!bilaga || (!bilaga.dataUrl && !bilaga.fil)) {
    return { ok: false, fel: "Bilagan kunde inte hittas." };
  }
  const id = skapaForeningsDokumentId();
  const nu = new Date().toISOString();
  let delad = bilaga.fil;
  if (!delad) {
    const blob = await (await fetch(bilaga.dataUrl)).blob();
    const fil = new File([blob], bilaga.filnamn, { type: blob.type });
    const sparat = await sparaDokumentFil(fil);
    if (!sparat.ok) return sparat;
    delad = sparat.fil;
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
    fil: delad,
    koppladeProjektId: [],
  };
  const lager = lasForeningsDokument();
  sparaForeningsDokument({
    ...lager,
    dokument: [dokument, ...lager.dokument],
  });
  return { ok: true, dokument };
}

/** Årshjulets bilagor bäddas in i webbläsarlagringen och måste därför vara små. */
const MAX_ARSHJUL_BILAGA_BYTE = 280_000;

function lasSomDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Kunde inte läsa filen."));
    reader.readAsDataURL(blob);
  });
}

/** Kopiera föreningsdokument (fil) till en årshjulsbilaga — sparas via onSpara i årshjulet. */
export async function kopieraForeningsDokumentTillBilaga(
  dokId: string,
): Promise<{ ok: true; bilaga: ArshjulBilaga } | { ok: false; fel: string }> {
  const dok = lasForeningsDokument().dokument.find((d) => d.id === dokId);
  const delad = dok ? dokumentDeladFil(dok) : null;
  if (delad) {
    return {
      ok: true,
      bilaga: {
        id: `bil-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
        filnamn: delad.filnamn,
        dataUrl: "",
        fil: delad,
      },
    };
  }
  const url = dok ? await hamtaDokumentFilUrl(dok) : null;
  if (!dok || !url) {
    return { ok: false, fel: "Dokumentet har ingen sparad fil att kopiera." };
  }
  try {
    const blob = await (await fetch(url)).blob();
    if (blob.size > MAX_ARSHJUL_BILAGA_BYTE) {
      return {
        ok: false,
        fel: "Filen är för stor för en årshjulsbilaga (max 280 kB). Öppna den från dokumentbanken i stället.",
      };
    }
    return {
      ok: true,
      bilaga: {
        id: `bil-import-${Date.now().toString(36)}`,
        filnamn: dokumentFilnamn(dok),
        dataUrl: await lasSomDataUrl(blob),
      },
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Uppladdade föreningsdokument med fil som kan kopieras till årshjul. */
export function listaForeningsDokumentMedFil(): ForeningsDokument[] {
  return lasForeningsDokument().dokument.filter(
    (d) => d.dokumentKalla === "fil" && harDokumentFil(d),
  );
}
