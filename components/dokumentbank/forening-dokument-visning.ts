import type { ForeningsDokument } from "@/components/dokumentbank/forening-dokumenter-lager";
import {
  STANDARD_DOKUMENT_LAYOUT,
  oppnaDokumentForhandsgranska,
  type DokumentLayoutTema,
} from "@/components/dokumentbank/dokument-layout";
import { hamtaForeningsDokumentInnehall } from "@/components/dokumentbank/forening-dokument-innehall";
import { hamtaDokumentFil } from "@/components/dokumentbank/forening-dokument-fil-lager";

export function oppnaForeningsDokumentPreview(dok: ForeningsDokument): boolean {
  const tema: DokumentLayoutTema =
    dok.layoutTema ?? STANDARD_DOKUMENT_LAYOUT;
  const text = hamtaForeningsDokumentInnehall(dok, { medSignaturer: false });
  if (!text.trim() && dok.dokumentKalla === "fil") {
    const fil = hamtaDokumentFil(dok.id);
    if (fil?.dataUrl) {
      window.open(fil.dataUrl, "_blank");
      return true;
    }
    return false;
  }
  return oppnaDokumentForhandsgranska({
    titel: dok.titel,
    text,
    tema,
    meta: dok.mallTitel,
  });
}

export function laddaNedForeningsDokumentFil(dok: ForeningsDokument): boolean {
  const fil = hamtaDokumentFil(dok.id);
  if (!fil?.dataUrl) return false;
  const a = document.createElement("a");
  a.href = fil.dataUrl;
  a.download = fil.filnamn;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  return true;
}
