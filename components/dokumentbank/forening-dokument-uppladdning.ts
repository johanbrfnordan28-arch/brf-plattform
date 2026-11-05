import {
  skapaForeningsDokumentId,
  type ForeningsDokument,
} from "@/components/dokumentbank/forening-dokumenter-lager";
import {
  lasFilSomText,
  sparaDokumentFil,
} from "@/components/dokumentbank/forening-dokument-fil-lager";
import type { DokumentLayoutTema } from "@/components/dokumentbank/dokument-layout";
import type { DokumentMallOmrade } from "@/components/dokumentbank/mallar";

export type UppladdningResult =
  | { ok: true; dokument: ForeningsDokument }
  | { ok: false; fel: string };

export type ForeningsDokumentUppladdningMeta = {
  titel?: string;
  mallId?: string;
  mallTitel?: string;
  mallFilnamn?: string;
  omrade?: DokumentMallOmrade;
};

export async function skapaForeningsDokumentFranFil(
  fil: File,
  titel?: string,
  meta?: ForeningsDokumentUppladdningMeta,
  onProgress?: (procent: number) => void,
): Promise<UppladdningResult> {
  const id = skapaForeningsDokumentId();
  const nu = new Date().toISOString();
  const namn =
    meta?.titel?.trim() || titel?.trim() || fil.name.replace(/\.[^.]+$/, "");
  const arText =
    fil.type.startsWith("text/") || /\.txt$/i.test(fil.name);

  let innehall: string | undefined;
  let filPlats: ForeningsDokument["fil"];
  if (arText) {
    try {
      innehall = (await lasFilSomText(fil)).trim();
    } catch {
      return { ok: false, fel: "Kunde inte läsa textfilen." };
    }
  } else {
    const sparat = await sparaDokumentFil(id, fil, onProgress);
    if (!sparat.ok) return sparat;
    filPlats = { filnamn: fil.name, ...(sparat.moln ? { moln: sparat.moln } : {}) };
  }

  const dokument: ForeningsDokument = {
    id,
    mallId: meta?.mallId?.trim() || "uppladdad-fil",
    mallTitel: meta?.mallTitel?.trim() || "Eget uppladdat dokument",
    mallFilnamn: meta?.mallFilnamn?.trim() || fil.name,
    titel: namn,
    status: "utkast",
    skapadDatum: nu,
    uppdateradDatum: nu,
    notering: "",
    omrade: meta?.omrade ?? "ovrig",
    dokumentKalla: "fil",
    ...(innehall ? { innehall } : {}),
    ...(filPlats ? { fil: filPlats } : {}),
    koppladeProjektId: [],
  };

  return { ok: true, dokument };
}

export function uppdateraLayoutPaDokument(
  dok: ForeningsDokument,
  layoutTema: DokumentLayoutTema,
): ForeningsDokument {
  return { ...dok, layoutTema };
}
