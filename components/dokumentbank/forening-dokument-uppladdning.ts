import {
  skapaForeningsDokumentId,
  type ForeningsDokument,
} from "@/components/dokumentbank/forening-dokumenter-lager";
import {
  MAX_UPPLADDAD_FIL_STORLEK,
  lasFilSomDataUrl,
  lasFilSomText,
  sparaDokumentFil,
} from "@/components/dokumentbank/forening-dokument-fil-lager";
import type { DokumentLayoutTema } from "@/components/dokumentbank/dokument-layout";

export type UppladdningResult =
  | { ok: true; dokument: ForeningsDokument }
  | { ok: false; fel: string };

export async function skapaForeningsDokumentFranFil(
  fil: File,
  titel?: string,
): Promise<UppladdningResult> {
  if (fil.size > MAX_UPPLADDAD_FIL_STORLEK) {
    return {
      ok: false,
      fel: "Filen är för stor (max cirka 2,5 MB i demo-lagring).",
    };
  }

  const id = skapaForeningsDokumentId();
  const nu = new Date().toISOString();
  const namn = titel?.trim() || fil.name.replace(/\.[^.]+$/, "");
  const arText =
    fil.type.startsWith("text/") || /\.txt$/i.test(fil.name);

  let innehall: string | undefined;
  if (arText) {
    try {
      innehall = (await lasFilSomText(fil)).trim();
    } catch {
      return { ok: false, fel: "Kunde inte läsa textfilen." };
    }
  } else {
    try {
      const dataUrl = await lasFilSomDataUrl(fil);
      const sparat = sparaDokumentFil(id, {
        filnamn: fil.name,
        mime: fil.type || "application/octet-stream",
        dataUrl,
        storlek: fil.size,
        uppladdad: new Date().toLocaleDateString("sv-SE"),
      });
      if (!sparat) {
        return { ok: false, fel: "Kunde inte spara filen lokalt." };
      }
    } catch {
      return { ok: false, fel: "Kunde inte läsa filen." };
    }
  }

  const dokument: ForeningsDokument = {
    id,
    mallId: "uppladdad-fil",
    mallTitel: "Eget uppladdat dokument",
    mallFilnamn: fil.name,
    titel: namn,
    status: "utkast",
    skapadDatum: nu,
    uppdateradDatum: nu,
    notering: "",
    omrade: "ovrig",
    dokumentKalla: "fil",
    ...(innehall ? { innehall } : {}),
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
