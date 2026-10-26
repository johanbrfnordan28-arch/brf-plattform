import {
  formateraStyrelseKontaktBlock,
  hamtaStyrelseKontakt,
} from "@/lib/styrelse-kontakt";
import { signeringRollInfo } from "@/components/rondering/signering";
import type { SigneringRoll } from "@/components/rondering/signering";
import {
  grupperaSchemaPunkter,
  hamtaAktivaSchemaPunkter,
  type SigneringSchemaPunkt,
} from "@/components/rondering/signering-schema";

function formateraPunkt(punkt: SigneringSchemaPunkt, index: number): string {
  const rader = [`${index}. ${punkt.etikett}`];
  if (punkt.beskrivning) {
    rader.push(`   ${punkt.beskrivning}`);
  }
  return rader.join("\n");
}

export function genereraSchemaTextFranPunkter(
  roll: SigneringRoll,
  aktiva: SigneringSchemaPunkt[],
): string {
  const info = signeringRollInfo[roll];
  const grupper = grupperaSchemaPunkter(aktiva, roll);
  const kontakt =
    typeof window !== "undefined" ? hamtaStyrelseKontakt() : null;
  const rader: string[] = [
    info.dokument.toUpperCase(),
    `Roll: ${info.titel} (${info.entreprenorTyp})`,
    `Genererad: ${new Date().toLocaleString("sv-SE")}`,
    "",
    formateraStyrelseKontaktBlock(kontakt).trimEnd(),
    "Aktiva moment:",
    "",
  ];

  let nr = 1;
  for (const grupp of grupper) {
    rader.push(`[${grupp.namn}]`);
    for (const punkt of grupp.punkter) {
      rader.push(formateraPunkt(punkt, nr));
      nr += 1;
    }
    rader.push("");
  }

  if (aktiva.length === 0) {
    rader.push("(Inga aktiva moment — konfigurera schemat ovan innan export.)");
  }

  return rader.join("\n");
}

/** Textversion av aktivt månadsschema — för upphandling och arkiv. */
export function genereraSchemaText(roll: SigneringRoll): string {
  const aktiva =
    typeof window !== "undefined" ? hamtaAktivaSchemaPunkter(roll) : [];
  return genereraSchemaTextFranPunkter(roll, aktiva);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Öppnar båda scheman i ett fönster som sparas som PDF via utskrift. */
export function oppnaSchemaGranskningPdf(
  punkter: Record<SigneringRoll, SigneringSchemaPunkt[]>,
  foreningsNamn: string,
): boolean {
  const roller: SigneringRoll[] = ["fastighetsskotare", "stadning"];
  const sektioner = roller
    .map((roll) => {
      const info = signeringRollInfo[roll];
      const grupper = grupperaSchemaPunkter(punkter[roll], roll);
      const block =
        grupper.length === 0
          ? "<p>Inga moment valda.</p>"
          : grupper
              .map((grupp) => {
                const poster = grupp.punkter
                  .map(
                    (punkt) =>
                      `<li><strong>${escapeHtml(punkt.etikett)}</strong>${
                        punkt.beskrivning
                          ? `<div class="beskrivning">${escapeHtml(punkt.beskrivning)}</div>`
                          : ""
                      }</li>`,
                  )
                  .join("");
                return `<h3>${escapeHtml(grupp.namn)}</h3><ol>${poster}</ol>`;
              })
              .join("");
      return `<section><h2>${escapeHtml(info.dokument)}</h2><p class="roll">${escapeHtml(info.titel)} · ${punkter[roll].length} moment</p>${block}</section>`;
    })
    .join("");

  const html = `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="utf-8" />
  <title>Granska schema — ${escapeHtml(foreningsNamn)}</title>
  <style>
    body { font-family: Georgia, "Times New Roman", serif; color: #1a2e22; margin: 2rem auto; max-width: 760px; line-height: 1.45; }
    h1 { font-size: 1.45rem; margin-bottom: 0.2rem; }
    h2 { font-size: 1.15rem; margin: 1.6rem 0 0.2rem; border-bottom: 1px solid #c5d5cb; padding-bottom: 0.2rem; }
    h3 { font-size: 1rem; margin: 1rem 0 0.3rem; }
    .meta, .roll { color: #3d5246; font-size: 0.92rem; }
    ol { padding-left: 1.2rem; }
    li { margin: 0.45rem 0; }
    .beskrivning { font-size: 0.92rem; margin-top: 0.15rem; }
    p.verktyg { font-family: system-ui, sans-serif; font-size: 0.9rem; }
    button { font: inherit; padding: 0.4rem 0.8rem; }
    @media print { .verktyg { display: none; } body { margin: 0; } }
  </style>
</head>
<body>
  <p class="verktyg">
    <button type="button" onclick="window.print()">Spara som PDF</button>
    Välj ”Spara som PDF” i utskriftsdialogen.
  </p>
  <h1>Ronderings- och städschema</h1>
  <p class="meta">${escapeHtml(foreningsNamn)} · ${escapeHtml(new Date().toLocaleString("sv-SE"))}</p>
  ${sektioner}
</body>
</html>`;

  const w = window.open("", "_blank");
  if (!w) return false;
  w.document.open();
  w.document.write(html);
  w.document.close();
  return true;
}

export function laddaNedTextfil(text: string, filnamn: string): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filnamn;
  a.click();
  URL.revokeObjectURL(url);
}

export function laddaNedSchemaText(roll: SigneringRoll, filnamn: string): void {
  laddaNedTextfil(genereraSchemaText(roll), filnamn);
}

export function kopieraTillUrklipp(text: string): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.clipboard) {
    return Promise.resolve(false);
  }
  return navigator.clipboard.writeText(text).then(
    () => true,
    () => false,
  );
}
