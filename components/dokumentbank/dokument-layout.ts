export type DokumentLayoutTema = "klassisk" | "modern" | "kompakt";

export const DOKUMENT_LAYOUT_ETIKETTER: Record<
  DokumentLayoutTema,
  { titel: string; beskrivning: string }
> = {
  klassisk: {
    titel: "Klassisk",
    beskrivning: "Seriff, avtalsliknande utskrift — trygg och formell.",
  },
  modern: {
    titel: "Modern",
    beskrivning: "Tydlig rubrik, luftig layout och grön accent.",
  },
  kompakt: {
    titel: "Kompakt",
    beskrivning: "Mindre marginaler — fler rader synliga på skärmen.",
  },
};

export const STANDARD_DOKUMENT_LAYOUT: DokumentLayoutTema = "modern";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Enkel strukturering av plain text → HTML (rubriker vid === och numrerade avsnitt). */
export function struktureraDokumentText(text: string): string {
  const rader = text.replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];
  let i = 0;
  while (i < rader.length) {
    const rad = rader[i];
    const next = rader[i + 1] ?? "";
    const trim = rad.trim();
    if (!trim) {
      i += 1;
      continue;
    }
    if (/^=+$/.test(next.trim()) && trim.length < 120) {
      html.push(`<h1 class="doc-h1">${escapeHtml(trim)}</h1>`);
      i += 2;
      continue;
    }
    if (/^-+$/.test(next.trim()) && trim.length < 80) {
      html.push(`<h2 class="doc-h2">${escapeHtml(trim)}</h2>`);
      i += 2;
      continue;
    }
    if (/^\d+\.\s+[A-ZÅÄÖ]/.test(trim)) {
      html.push(`<h3 class="doc-h3">${escapeHtml(trim)}</h3>`);
      i += 1;
      continue;
    }
    if (trim.endsWith(":") && trim.length < 60 && !trim.includes("http")) {
      html.push(`<p class="doc-label">${escapeHtml(trim)}</p>`);
      i += 1;
      continue;
    }
    html.push(`<p class="doc-p">${escapeHtml(trim)}</p>`);
    i += 1;
  }
  return html.join("\n");
}

function temaCss(tema: DokumentLayoutTema): string {
  const gemensamt = `
    .doc-body { line-height: 1.55; color: #1a2e22; }
    .doc-h1 { font-size: 1.35rem; font-weight: 700; margin: 0 0 1rem; letter-spacing: -0.02em; }
    .doc-h2 { font-size: 1.1rem; font-weight: 650; margin: 1.25rem 0 0.5rem; }
    .doc-h3 { font-size: 1rem; font-weight: 600; margin: 1rem 0 0.35rem; }
    .doc-p { margin: 0.35rem 0; font-size: 0.95rem; }
    .doc-label { margin: 0.5rem 0 0.15rem; font-weight: 600; font-size: 0.88rem; color: #3d5246; }
    .doc-meta { font-size: 0.82rem; color: #5a6b60; margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 1px solid #d8e4dc; }
  `;
  switch (tema) {
    case "klassisk":
      return `${gemensamt}
        body.doc-root { font-family: Georgia, "Times New Roman", serif; background: #faf9f6; }
        .doc-sheet { max-width: 720px; margin: 0 auto; padding: 2.5rem 2rem; background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
      `;
    case "kompakt":
      return `${gemensamt}
        body.doc-root { font-family: system-ui, sans-serif; background: #f4f6f5; font-size: 0.9rem; }
        .doc-sheet { max-width: 680px; margin: 0 auto; padding: 1.25rem 1rem; background: #fff; border: 1px solid #e0e8e3; border-radius: 8px; }
        .doc-h1 { font-size: 1.15rem; }
        .doc-p { font-size: 0.88rem; }
      `;
    default:
      return `${gemensamt}
        body.doc-root { font-family: system-ui, -apple-system, sans-serif; background: linear-gradient(180deg, #eef6f0 0%, #f7faf8 120px); }
        .doc-sheet { max-width: 760px; margin: 0 auto; padding: 2rem 1.75rem; background: #fff; border-radius: 12px; border: 1px solid #c5d9cc; box-shadow: 0 4px 24px rgba(26,46,34,0.06); }
        .doc-header { background: #1a2e22; color: #fff; margin: -2rem -1.75rem 1.5rem; padding: 1.25rem 1.75rem; border-radius: 12px 12px 0 0; }
        .doc-header .doc-h1 { color: #fff; margin: 0; font-size: 1.25rem; }
        .doc-header .doc-meta { color: rgba(255,255,255,0.85); border: none; margin: 0.35rem 0 0; padding: 0; }
      `;
  }
}

export type ByggDokumentPreviewOptions = {
  titel: string;
  text: string;
  tema?: DokumentLayoutTema;
  meta?: string;
  printToolbar?: boolean;
};

export function byggDokumentPreviewHtml(options: ByggDokumentPreviewOptions): string {
  const tema = options.tema ?? STANDARD_DOKUMENT_LAYOUT;
  const innehall = struktureraDokumentText(options.text);
  const meta = options.meta
    ? `<p class="doc-meta">${escapeHtml(options.meta)}</p>`
    : "";
  const toolbar = options.printToolbar
    ? `<p class="doc-verktyg"><button type="button" onclick="window.print()">Spara som PDF</button> <span>Välj ”Spara som PDF” i utskriften.</span></p>`
    : "";

  const header =
    tema === "modern"
      ? `<header class="doc-header"><h1 class="doc-h1">${escapeHtml(options.titel)}</h1>${meta}</header>`
      : `<h1 class="doc-h1">${escapeHtml(options.titel)}</h1>${meta}`;

  return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(options.titel)}</title>
  <style>
    * { box-sizing: border-box; }
    body.doc-root { margin: 0; min-height: 100vh; padding: 1.5rem 1rem; }
    .doc-verktyg { font-family: system-ui, sans-serif; font-size: 0.85rem; margin-bottom: 1rem; }
    .doc-verktyg button { padding: 0.45rem 0.9rem; cursor: pointer; border-radius: 8px; border: 1px solid #5a9a6e; background: #eef6f0; font-weight: 600; }
    @media print { .doc-verktyg { display: none; } body.doc-root { padding: 0; background: #fff; } .doc-sheet { box-shadow: none; border: none; } }
    ${temaCss(tema)}
  </style>
</head>
<body class="doc-root">
  ${toolbar}
  <article class="doc-sheet">
    ${header}
    <div class="doc-body">${innehall}</div>
  </article>
</body>
</html>`;
}

/** CSS för formaterad redigering i appen (samma typografi som förhandsgranska). */
export function dokumentRedigerareCss(tema: DokumentLayoutTema): string {
  return `
    .doc-edit-root { ${tema === "klassisk" ? "font-family: Georgia, serif;" : "font-family: system-ui, sans-serif;"} }
    ${temaCss(tema)}
    .doc-edit-root .doc-sheet { margin: 0; max-width: none; box-shadow: none; }
    .doc-edit-root .doc-header { border-radius: 12px 12px 0 0; }
    .doc-avsnitt-wrap { margin-top: 1rem; border-top: 1px dashed #c5d9cc; padding-top: 1rem; }
    .doc-avsnitt-rad { margin-bottom: 0.75rem; }
    .doc-avsnitt-rad textarea {
      width: 100%; min-height: 4.5rem; resize: vertical;
      border: 1px solid #d8e4dc; border-radius: 8px; padding: 0.65rem 0.75rem;
      font-family: inherit; font-size: 0.92rem; line-height: 1.5; color: #1a2e22;
      background: #fcfdfc;
    }
    .doc-avsnitt-rad textarea:focus { outline: 2px solid rgba(90,154,110,0.35); border-color: #5a9a6e; }
  `;
}

export function byggDokumentPreviewSrcDoc(options: ByggDokumentPreviewOptions): string {
  return byggDokumentPreviewHtml({ ...options, printToolbar: false });
}

export function oppnaDokumentForhandsgranska(
  options: ByggDokumentPreviewOptions,
): boolean {
  if (typeof window === "undefined") return false;
  const w = window.open("", "_blank");
  if (!w) return false;
  w.document.open();
  w.document.write(byggDokumentPreviewHtml({ ...options, printToolbar: true }));
  w.document.close();
  return true;
}
