import { byggDokumentPreviewHtml } from "@/components/dokumentbank/dokument-layout";
import {
  byggPdfUndertecknareHtml,
  PDF_UNDERTECKNARE_PRINT_CSS,
  type PdfUndertecknareBlockData,
} from "@/components/forening/pdf-undertecknare-block";

export { byggPdfUndertecknareText } from "@/components/forening/pdf-undertecknare-block";

export type OppnaTextSomPdfOptions = {
  undertecknare?: PdfUndertecknareBlockData;
};

/**
 * Öppnar avtalstexten i ett nytt fönster som kan sparas som PDF via utskrift.
 * Plattformen har ingen egen PDF-motor — webbläsarens ”Spara som PDF” är utskriften.
 */
export function oppnaTextSomPdf(
  titel: string,
  text: string,
  options?: OppnaTextSomPdfOptions,
): boolean {
  const undertecknareHtml = options?.undertecknare
    ? byggPdfUndertecknareHtml(options.undertecknare)
    : "";

  let html = byggDokumentPreviewHtml({
    titel,
    text,
    tema: "modern",
    printToolbar: true,
  });

  if (undertecknareHtml) {
    html = html.replace(
      "</main>",
      `<div class="doc-undertecknare">${undertecknareHtml}</div></main>`,
    );
  }
  html = html.replace(
    "</style>",
    `${PDF_UNDERTECKNARE_PRINT_CSS}\n.doc-undertecknare { padding: 0 var(--doc-pad-x) var(--doc-pad-y); }\n</style>`,
  );

  const w = window.open("", "_blank");
  if (!w) return false;
  w.document.open();
  w.document.write(html);
  w.document.close();
  return true;
}
