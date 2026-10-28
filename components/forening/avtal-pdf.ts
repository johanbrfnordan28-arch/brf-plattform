import {
  byggPdfUndertecknareHtml,
  PDF_UNDERTECKNARE_PRINT_CSS,
  type PdfUndertecknareBlockData,
} from "@/components/forening/pdf-undertecknare-block";

export { byggPdfUndertecknareText } from "@/components/forening/pdf-undertecknare-block";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

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

  const html = `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(titel)}</title>
  <style>
    body { font-family: Georgia, "Times New Roman", serif; color: #1a2e22; margin: 2rem auto; max-width: 720px; line-height: 1.45; }
    h1 { font-size: 1.4rem; margin-bottom: 0.25rem; }
    p.verktyg { font-family: system-ui, sans-serif; font-size: 0.9rem; }
    button { font: inherit; padding: 0.4rem 0.8rem; }
    pre { white-space: pre-wrap; font-family: inherit; font-size: 0.95rem; }
    @media print { .verktyg { display: none; } body { margin: 0; } }
    ${PDF_UNDERTECKNARE_PRINT_CSS}
  </style>
</head>
<body>
  <p class="verktyg">
    <button type="button" onclick="window.print()">Spara som PDF</button>
    Välj ”Spara som PDF” i utskriftsdialogen.
  </p>
  <h1>${escapeHtml(titel)}</h1>
  <pre>${escapeHtml(text)}</pre>
  ${undertecknareHtml}
</body>
</html>`;

  const w = window.open("", "_blank");
  if (!w) return false;
  w.document.open();
  w.document.write(html);
  w.document.close();
  return true;
}
