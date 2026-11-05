import type { ForeningsDokument } from "@/components/dokumentbank/forening-dokumenter-lager";
import {
  STANDARD_DOKUMENT_LAYOUT,
  oppnaDokumentForhandsgranska,
  type DokumentLayoutTema,
} from "@/components/dokumentbank/dokument-layout";
import { hamtaForeningsDokumentInnehall } from "@/components/dokumentbank/forening-dokument-innehall";
import {
  dokumentFilnamn,
  hamtaDokumentFilUrl,
  harDokumentFil,
} from "@/components/dokumentbank/forening-dokument-fil-lager";
import { oppnaFilIFlik } from "@/lib/forening-fil-lagring";
import { arEntreprenadAvtalDokument } from "@/components/dokumentbank/forening-dokument-avtal";
import { oppnaTextSomPdf } from "@/components/forening/avtal-pdf";
import { standardPdfUndertecknareBlock } from "@/components/forening/pdf-undertecknare-block";

export function oppnaForeningsDokumentPreview(dok: ForeningsDokument): boolean {
  const tema: DokumentLayoutTema =
    dok.layoutTema ?? STANDARD_DOKUMENT_LAYOUT;
  const text = hamtaForeningsDokumentInnehall(dok, { medSignaturer: false });
  if (!text.trim() && dok.dokumentKalla === "fil") {
    if (!harDokumentFil(dok)) return false;
    void oppnaFilIFlik(() => hamtaDokumentFilUrl(dok));
    return true;
  }

  if (arEntreprenadAvtalDokument(dok)) {
    const entreprenor = dok.entreprenor;
    const entreprenorPdf = [
      {
        namn: entreprenor?.namn ?? "",
        epost: entreprenor?.epost ?? "",
        roll: "Entreprenör",
      },
      {
        namn: entreprenor?.kontakt ?? "",
        epost: "",
        roll: "Entreprenör",
      },
    ];
    return oppnaTextSomPdf(dok.titel, text, {
      undertecknare: standardPdfUndertecknareBlock(entreprenorPdf),
    });
  }

  return oppnaDokumentForhandsgranska({
    titel: dok.titel,
    text,
    tema,
    meta: dok.mallTitel,
  });
}

export async function laddaNedForeningsDokumentFil(
  dok: ForeningsDokument,
): Promise<boolean> {
  const url = await hamtaDokumentFilUrl(dok);
  if (!url) return false;
  const a = document.createElement("a");
  a.href = url;
  a.download = dokumentFilnamn(dok);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return true;
}
