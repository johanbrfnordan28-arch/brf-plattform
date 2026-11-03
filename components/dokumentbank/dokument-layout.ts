export type DokumentLayoutTema = "klassisk" | "modern" | "kompakt";

/** Varumärke i utskrift och förhandsgranska — även utanför plattformen. */
export const STYRELSE_NAVET_DOC = {
  namn: "Styrelse-Navet",
  tagline: "Stöd för styrelsearbete i bostadsrättsföreningar",
  webb: "styrelse-navet.se",
} as const;

export const DOKUMENT_LAYOUT_ETIKETTER: Record<
  DokumentLayoutTema,
  { titel: string; beskrivning: string }
> = {
  klassisk: {
    titel: "Klassisk",
    beskrivning:
      "Seriff och formell typografi — samma Styrelse-Navet-ram och sidfot som övriga.",
  },
  modern: {
    titel: "Modern",
    beskrivning:
      "Grön accent, tydlig ram och Styrelse-Navet — rekommenderad för PDF.",
  },
  kompakt: {
    titel: "Kompakt",
    beskrivning:
      "Tätare text och marginaler — samma ram och sidnummer som modern.",
  },
};

export const STANDARD_DOKUMENT_LAYOUT: DokumentLayoutTema = "modern";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Plain text → HTML. Tom rad (dubbel radbrytning i källan) = nytt stycke.
 * Rubriker: rad följt av === eller ---, eller numrerade avsnitt.
 */
export function struktureraDokumentText(text: string): string {
  const normaliserad = text.replace(/\r\n/g, "\n").trim();
  if (!normaliserad) return "";

  const block = normaliserad.split(/\n\n+/);
  const html: string[] = [];

  for (const chunk of block) {
    const trim = chunk.trim();
    if (!trim) continue;

    const rader = trim.split("\n");
    let i = 0;
    while (i < rader.length) {
      const rad = rader[i];
      const next = rader[i + 1] ?? "";
      const radTrim = rad.trim();
      if (!radTrim) {
        i += 1;
        continue;
      }
      if (/^=+$/.test(next.trim()) && radTrim.length < 120) {
        html.push(`<h1 class="doc-h1">${escapeHtml(radTrim)}</h1>`);
        i += 2;
        continue;
      }
      if (/^-+$/.test(next.trim()) && radTrim.length < 80) {
        html.push(`<h2 class="doc-h2">${escapeHtml(radTrim)}</h2>`);
        i += 2;
        continue;
      }
      if (/^\d+\.\s+[A-ZÅÄÖ]/.test(radTrim)) {
        html.push(`<h3 class="doc-h3">${escapeHtml(radTrim)}</h3>`);
        i += 1;
        continue;
      }
      if (
        radTrim.endsWith(":") &&
        radTrim.length < 60 &&
        !radTrim.includes("http")
      ) {
        html.push(`<p class="doc-label">${escapeHtml(radTrim)}</p>`);
        i += 1;
        continue;
      }
      const para: string[] = [radTrim];
      i += 1;
      while (i < rader.length) {
        const folj = rader[i].trim();
        if (!folj) break;
        if (
          /^=+$/.test((rader[i + 1] ?? "").trim()) ||
          /^-+$/.test((rader[i + 1] ?? "").trim()) ||
          /^\d+\.\s+[A-ZÅÄÖ]/.test(folj)
        ) {
          break;
        }
        para.push(folj);
        i += 1;
      }
      const inre = para.map((l) => escapeHtml(l)).join("<br />\n");
      html.push(`<p class="doc-p doc-para">${inre}</p>`);
    }
  }

  return html.join("\n");
}

function temaVariabler(tema: DokumentLayoutTema): string {
  switch (tema) {
    case "klassisk":
      return `
        --doc-font: Georgia, "Times New Roman", serif;
        --doc-pad-x: 2rem;
        --doc-pad-y: 2.25rem;
        --doc-base: 1rem;
        --doc-h1: 1.35rem;
      `;
    case "kompakt":
      return `
        --doc-font: system-ui, -apple-system, sans-serif;
        --doc-pad-x: 1.15rem;
        --doc-pad-y: 1.15rem;
        --doc-base: 0.88rem;
        --doc-h1: 1.12rem;
      `;
    default:
      return `
        --doc-font: system-ui, -apple-system, sans-serif;
        --doc-pad-x: 1.75rem;
        --doc-pad-y: 1.75rem;
        --doc-base: 0.95rem;
        --doc-h1: 1.28rem;
      `;
  }
}

function gemensamDokumentCss(tema: DokumentLayoutTema): string {
  const { namn, tagline, webb } = STYRELSE_NAVET_DOC;
  return `
    .doc-tema { ${temaVariabler(tema)} font-family: var(--doc-font); font-size: var(--doc-base); }
    body.doc-root { line-height: 1.55; color: #1a2e22; }
    .doc-sheet { max-width: 760px; margin: 0 auto; }
    .doc-ram {
      border: 2px solid #5a9a6e;
      border-radius: 12px;
      background: #fff;
      box-shadow:
        0 4px 28px rgba(26, 46, 34, 0.08),
        inset 0 0 0 4px #eef6f0;
      overflow: hidden;
    }
    .doc-header {
      background: linear-gradient(120deg, #1a2e22 0%, #2a6b42 55%, #3d8f5c 100%);
      color: #fff;
      padding: 1rem var(--doc-pad-x) 1.15rem;
      border-bottom: 4px solid #7bc995;
    }
    .doc-brand-rad {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      justify-content: space-between;
      gap: 0.35rem 1rem;
      margin-bottom: 0.85rem;
      padding-bottom: 0.65rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.22);
    }
    .doc-brand-namn {
      font-size: 0.95rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      color: #fff;
    }
    .doc-brand-tag {
      font-size: 0.72rem;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.82);
    }
    .doc-header .doc-h1 {
      color: #fff;
      margin: 0;
      font-size: var(--doc-h1);
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .doc-header .doc-meta {
      color: rgba(255, 255, 255, 0.88);
      border: none;
      margin: 0.4rem 0 0;
      padding: 0;
      font-size: 0.82rem;
    }
    .doc-body {
      padding: var(--doc-pad-y) var(--doc-pad-x);
      background: linear-gradient(180deg, #fcfdfc 0%, #fff 48px);
    }
    .doc-h1 { font-size: var(--doc-h1); font-weight: 700; margin: 0 0 1rem; }
    .doc-h2 { font-size: 1.08rem; font-weight: 650; margin: 1.35rem 0 0.55rem; color: #1a3d28; }
    .doc-h3 { font-size: 1rem; font-weight: 600; margin: 1.1rem 0 0.4rem; color: #234832; }
    .doc-p { margin: 0; font-size: inherit; }
    .doc-para { margin: 0.65rem 0; text-align: left; }
    .doc-para:first-child { margin-top: 0; }
    .doc-label { margin: 0.85rem 0 0.2rem; font-weight: 600; font-size: 0.88rem; color: #2d5a3d; }
    .doc-meta { font-size: 0.82rem; color: #5a6b60; margin-bottom: 1rem; }
    .doc-sid-info {
      font-family: system-ui, sans-serif;
      font-size: 0.82rem;
      color: #2d5a3d;
      background: #eef6f0;
      border: 1px solid #c5d9cc;
      border-radius: 8px;
      padding: 0.5rem 0.75rem;
      margin: 0 auto 1rem;
      max-width: 760px;
      text-align: center;
    }
    .doc-sheet-footer {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 0.5rem;
      padding: 0.65rem var(--doc-pad-x);
      font-size: 0.75rem;
      color: #5a6b60;
      background: #f4f9f6;
      border-top: 1px solid #d8e8de;
    }
    .doc-sheet-footer strong { color: #1a3d28; font-weight: 650; }
    @media print {
      body.doc-root {
        padding: 0 !important;
        background: #fff !important;
      }
      .doc-verktyg, .doc-sid-info { display: none !important; }
      .doc-sheet { max-width: none; margin: 0; }
      .doc-ram {
        box-shadow: none;
        border-radius: 0;
        border: 1.5pt solid #5a9a6e;
        box-shadow: inset 0 0 0 3pt #eef6f0;
      }
      .doc-body { background: #fff; }
      .doc-sheet-footer { display: none !important; }
      .doc-print-sidfot {
        display: flex !important;
        position: fixed;
        bottom: 6mm;
        left: 12mm;
        right: 12mm;
        justify-content: space-between;
        align-items: center;
        font-size: 8.5pt;
        color: #3d5246;
        border-top: 0.5pt solid #5a9a6e;
        padding-top: 2mm;
        font-family: system-ui, sans-serif;
      }
      .doc-print-sidhuvud {
        display: flex !important;
        position: fixed;
        top: 6mm;
        left: 12mm;
        right: 12mm;
        justify-content: space-between;
        font-size: 8pt;
        color: #2d5a3d;
        border-bottom: 0.5pt solid #c5d9cc;
        padding-bottom: 2mm;
        font-family: system-ui, sans-serif;
      }
      .doc-print-sidnummer::after {
        content: "Sida " counter(page) " av " counter(pages);
      }
    }
    @media screen {
      .doc-print-sidfot, .doc-print-sidhuvud { display: none; }
    }
    /* ${namn} · ${tagline} · ${webb} — referens i genererad CSS */
  `;
}

export type ByggDokumentPreviewOptions = {
  titel: string;
  text: string;
  tema?: DokumentLayoutTema;
  meta?: string;
  printToolbar?: boolean;
  /** Visa Styrelse-Navet i sidhuvud/sidfot (standard på). */
  visaVarumarke?: boolean;
};

function dokumentSidantalScript(): string {
  return `<script>
(function(){
  function uppdatera(){
    var ram = document.querySelector(".doc-ram");
    var banner = document.getElementById("doc-sid-info-text");
    var totEl = document.getElementById("doc-sidantal");
    if(!ram || !banner) return;
    var pageH = 980;
    var h = ram.getBoundingClientRect().height;
    var total = Math.max(1, Math.ceil(h / pageH));
    banner.textContent = total === 1
      ? "Dokumentet omfattar 1 sida vid utskrift (A4)."
      : "Dokumentet omfattar cirka " + total + " sidor vid utskrift (A4).";
    if(totEl) totEl.textContent = String(total);
  }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", uppdatera);
  else uppdatera();
  window.addEventListener("resize", uppdatera);
  if(typeof ResizeObserver !== "undefined") {
    var ram = document.querySelector(".doc-ram");
    if(ram) new ResizeObserver(uppdatera).observe(ram);
  }
})();
</script>`;
}

function byggDokumentHeader(
  titel: string,
  meta: string,
  visaVarumarke: boolean,
): string {
  const brand = visaVarumarke
    ? `<div class="doc-brand-rad">
        <span class="doc-brand-namn">${escapeHtml(STYRELSE_NAVET_DOC.namn)}</span>
        <span class="doc-brand-tag">${escapeHtml(STYRELSE_NAVET_DOC.tagline)}</span>
      </div>`
    : "";

  return `<header class="doc-header">
    ${brand}
    <h1 class="doc-h1">${escapeHtml(titel)}</h1>
    ${meta}
  </header>`;
}

export function byggDokumentPreviewHtml(options: ByggDokumentPreviewOptions): string {
  const tema = options.tema ?? STANDARD_DOKUMENT_LAYOUT;
  const visaVarumarke = options.visaVarumarke !== false;
  const innehall = struktureraDokumentText(options.text);
  const meta = options.meta
    ? `<p class="doc-meta">${escapeHtml(options.meta)}</p>`
    : "";
  const toolbar = options.printToolbar
    ? `<p class="doc-verktyg"><button type="button" onclick="window.print()">Spara som PDF</button> <span>Välj ”Spara som PDF” i utskriften — sidnummer och ${escapeHtml(STYRELSE_NAVET_DOC.namn)} följer med på varje sida.</span></p>`
    : "";

  const sheetFooter = visaVarumarke
    ? `<footer class="doc-sheet-footer">
        <span><strong>${escapeHtml(STYRELSE_NAVET_DOC.namn)}</strong> · ${escapeHtml(STYRELSE_NAVET_DOC.webb)}</span>
        <span>Utskrift: sida <span id="doc-sidantal">…</span> (A4)</span>
      </footer>`
    : "";

  const printHeader = visaVarumarke
    ? `<div class="doc-print-sidhuvud" aria-hidden="true">
        <span>${escapeHtml(STYRELSE_NAVET_DOC.namn)}</span>
        <span>${escapeHtml(options.titel)}</span>
      </div>`
    : "";
  const printFooter = visaVarumarke
    ? `<div class="doc-print-sidfot" aria-hidden="true">
        <span>${escapeHtml(STYRELSE_NAVET_DOC.namn)} · ${escapeHtml(STYRELSE_NAVET_DOC.webb)}</span>
        <span class="doc-print-sidnummer"></span>
      </div>`
    : "";

  return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(options.titel)} — ${escapeHtml(STYRELSE_NAVET_DOC.namn)}</title>
  <style>
    * { box-sizing: border-box; }
    body.doc-root { margin: 0; min-height: 100vh; padding: 1.25rem 1rem 2rem; background: linear-gradient(180deg, #e8f2ec 0%, #f4f8f5 160px); }
    .doc-verktyg { font-family: system-ui, sans-serif; font-size: 0.85rem; margin: 0 auto 1rem; max-width: 760px; }
    .doc-verktyg button { padding: 0.45rem 0.9rem; cursor: pointer; border-radius: 8px; border: 1px solid #5a9a6e; background: #eef6f0; font-weight: 600; color: #1a3d28; }
    @page { size: A4; margin: 18mm 14mm 22mm 14mm; }
    ${gemensamDokumentCss(tema)}
  </style>
</head>
<body class="doc-root doc-tema">
  ${toolbar}
  <p class="doc-sid-info" id="doc-sid-info-text">Beräknar sidantal …</p>
  ${printHeader}
  ${printFooter}
  <article class="doc-sheet">
    <div class="doc-ram">
      ${byggDokumentHeader(options.titel, meta, visaVarumarke)}
      <main class="doc-body">${innehall}</main>
      ${sheetFooter}
    </div>
  </article>
  ${dokumentSidantalScript()}
</body>
</html>`;
}

/** CSS för formaterad redigering i appen (samma typografi som förhandsgranska). */
export function dokumentRedigerareCss(tema: DokumentLayoutTema): string {
  return `
    .doc-edit-root { font-family: var(--doc-font, system-ui, sans-serif); }
    .doc-tema { ${temaVariabler(tema)} }
    ${gemensamDokumentCss(tema)}
    .doc-edit-root .doc-sheet { margin: 0; max-width: none; }
    .doc-edit-root .doc-ram { box-shadow: none; }
    .doc-edit-root .doc-sid-info { display: none; }
    .doc-avsnitt-wrap { margin-top: 1rem; border-top: 1px dashed #c5d9cc; padding-top: 1rem; }
    .doc-avsnitt-rad { margin-bottom: 0.75rem; }
    .doc-avsnitt-rad textarea {
      width: 100%; min-height: 4.5rem; resize: vertical;
      border: 1px solid #d8e4dc; border-radius: 8px; padding: 0.65rem 0.75rem;
      font-family: inherit; font-size: 0.92rem; line-height: 1.5; color: #1a2e22;
      background: #fcfdfc;
    }
    .doc-avsnitt-rad textarea:focus { outline: 2px solid rgba(90,154,110,0.35); border-color: #5a9a6e; }
    .doc-avsnitt-hint { font-size: 0.75rem; color: #5a6b60; margin-top: 0.25rem; }
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
