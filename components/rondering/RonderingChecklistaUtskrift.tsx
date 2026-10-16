"use client";

import {
  byggEffektivChecklista,
  type ChecklistaAnpassning,
} from "@/components/rondering/checklist-effektiv";
import {
  checklistaPunktNyckel,
  ronderingChecklistaEtiketter,
  type RonderingChecklistaTyp,
} from "@/components/rondering/checklist-mallar";
import type { ForeningEgenskaper } from "@/components/rondering/forening-egenskaper";

type RonderingChecklistaUtskriftProps = {
  typer: RonderingChecklistaTyp[];
  egenskaper: ForeningEgenskaper;
  anpassning: ChecklistaAnpassning;
  klaraPunkter: string[];
  foreningNamn?: string;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function byggChecklistaHtml(opts: RonderingChecklistaUtskriftProps): string {
  const klaraSet = new Set(opts.klaraPunkter);
  const datum = new Date().toLocaleDateString("sv-SE");
  const forening = opts.foreningNamn
    ? `<p>${escapeHtml(opts.foreningNamn)}</p>`
    : "";

  const sidor = opts.typer.map((typ, idx) => {
    const mall = byggEffektivChecklista(typ, opts.egenskaper, opts.anpassning);
    const sektioner = mall.sektioner
      .map((sektion) => {
        const punkter = sektion.punkter
          .map((punkt) => {
            const nyckel = checklistaPunktNyckel(typ, sektion.id, punkt.id);
            const klar = klaraSet.has(nyckel);
            return `<li style="display:flex;gap:10px;margin:0 0 8px;page-break-inside:avoid;">
  <span style="display:inline-block;width:14px;height:14px;border:2px solid #000;text-align:center;font-size:10px;line-height:12px;flex-shrink:0;margin-top:2px;">${klar ? "✓" : ""}</span>
  <span>${escapeHtml(punkt.text)}</span>
</li>`;
          })
          .join("");
        const beskrivning = sektion.beskrivning
          ? `<p style="font-size:11px;color:#444;margin:4px 0 8px;">${escapeHtml(sektion.beskrivning)}</p>`
          : "";
        return `<section style="margin:18px 0;">
  <h2 style="font-size:13pt;margin:0 0 4px;">${escapeHtml(sektion.etikett)}</h2>
  ${beskrivning}
  <ul style="list-style:none;padding:0;margin:0;">${punkter}</ul>
</section>`;
      })
      .join("");

    return `<article style="padding:8px 4px;${idx < opts.typer.length - 1 ? "page-break-after:always;" : ""}">
  <header style="border-bottom:2px solid #000;padding-bottom:12px;margin-bottom:16px;">
    <p style="font-size:11px;text-transform:uppercase;letter-spacing:.04em;margin:0;">Underhålls- och städchecklista</p>
    <h1 style="font-size:20pt;margin:6px 0 8px;">${escapeHtml(mall.titel)}</h1>
    ${forening}
    <p style="margin:4px 0;">Datum: ${escapeHtml(datum)}</p>
    <p style="font-size:11px;line-height:1.4;">${escapeHtml(mall.beskrivning)}</p>
  </header>
  ${sektioner}
  <footer style="border-top:1px solid #888;margin-top:28px;padding-top:12px;font-size:11px;">
    <p>Utförd av: _________________________ Datum: _____________</p>
    <p>Signatur / attest (entreprenör): _________________________</p>
    <p style="color:#555;margin-top:12px;">${escapeHtml(ronderingChecklistaEtiketter[typ])} — anpassad checklista för föreningen.</p>
  </footer>
</article>`;
  });

  return `<!DOCTYPE html>
<html lang="sv">
<head>
<meta charset="utf-8"/>
<title>Rondering — utskrift</title>
<style>
  body { font-family: Georgia, "Times New Roman", serif; font-size: 11pt; line-height: 1.4; color: #111; background: #fff; margin: 24px; }
  @media print { body { margin: 12mm; } }
</style>
</head>
<body>
${sidor.join("\n")}
</body>
</html>`;
}

/** Öppnar utskriftsvänlig HTML med text — spara som PDF i utskriftsdialogen. */
export function skrivUtChecklista(opts: RonderingChecklistaUtskriftProps): void {
  const html = byggChecklistaHtml(opts);
  const w = window.open("", "_blank", "width=900,height=700");
  if (!w) {
    const blob = new Blob(["\ufeff", html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Rondering_checklista_${new Date().toISOString().slice(0, 10)}.html`;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
  w.focus();
  window.setTimeout(() => {
    w.print();
  }, 400);
}

