import { BANKID_KRAV_SIGNATURER } from "@/lib/bankid-signering";
import {
  hamtaAvtalssignerare,
  hamtaStyrelseKontakt,
} from "@/lib/styrelse-kontakt";
import { lasAktivForeningId, lasForeningProfil } from "@/lib/forening-registry";

export type PdfForeningUndertecknare = {
  namn: string;
  roll: string;
  epost?: string;
};

export type PdfEntreprenorUndertecknare = {
  namn: string;
  epost?: string;
  roll?: string;
};

export type PdfUndertecknareBlockData = {
  forening: PdfForeningUndertecknare[];
  entreprenor: PdfEntreprenorUndertecknare[];
  /** Visas under blocket — t.ex. styrelsens mejl för inbjudan till signering. */
  mejlForSignering?: string;
  instruktion?: string;
};

function fyllForeningSlots(
  lista: PdfForeningUndertecknare[],
): PdfForeningUndertecknare[] {
  const ut = [...lista].slice(0, BANKID_KRAV_SIGNATURER);
  while (ut.length < BANKID_KRAV_SIGNATURER) {
    ut.push({ namn: "", roll: "", epost: "" });
  }
  return ut;
}

function fyllEntreprenorSlots(
  lista: PdfEntreprenorUndertecknare[],
): PdfEntreprenorUndertecknare[] {
  const ut = [...lista].slice(0, BANKID_KRAV_SIGNATURER);
  while (ut.length < BANKID_KRAV_SIGNATURER) {
    ut.push({ namn: "", epost: "", roll: "" });
  }
  return ut;
}

/** Föreningens två BankID-platser — från markerade styrelseledamöter. */
export function hamtaForeningUndertecknareForPdf(
  foreningId?: string,
): PdfForeningUndertecknare[] {
  if (typeof window === "undefined") {
    return fyllForeningSlots([]);
  }
  const id = foreningId ?? lasAktivForeningId();
  const profil = lasForeningProfil(id);
  const markerade = (profil?.styrelseledamoter ?? []).filter(
    (l) => l.signerarAvtal && l.namn.trim(),
  );
  if (markerade.length > 0) {
    return fyllForeningSlots(
      markerade.map((l) => ({
        namn: l.namn.trim(),
        roll: l.roll.trim() || "Styrelseledamot",
        epost: l.epost.trim() || undefined,
      })),
    );
  }
  const franKontakt = hamtaAvtalssignerare(id).map((p) => ({
    namn: p.namn,
    roll: p.roll,
    epost: hamtaStyrelseKontakt(id)?.epost,
  }));
  return fyllForeningSlots(franKontakt);
}

export function standardMejlForSignering(foreningId?: string): string {
  const forening = hamtaForeningUndertecknareForPdf(foreningId);
  const medEpost = forening.find((p) => p.epost?.trim())?.epost?.trim();
  if (medEpost) return medEpost;
  return hamtaStyrelseKontakt(foreningId)?.epost.trim() ?? "";
}

export function standardPdfUndertecknareBlock(
  entreprenorer: PdfEntreprenorUndertecknare[] = [],
  foreningId?: string,
): PdfUndertecknareBlockData {
  const forening = hamtaForeningUndertecknareForPdf(foreningId);
  return {
    forening,
    entreprenor: fyllEntreprenorSlots(entreprenorer),
    mejlForSignering: standardMejlForSignering(foreningId),
    instruktion:
      "Entreprenören signerar först med BankID (två personer). Därefter signerar föreningen (två personer). Personnummer binds till varje signatur.",
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export const PDF_UNDERTECKNARE_PRINT_CSS = `
  .undertecknare-block { margin-top: 2.5rem; padding-top: 1.25rem; border-top: 2px solid #1a2e22; page-break-inside: avoid; }
  .undertecknare-block h2 { font-size: 1.05rem; margin: 0 0 0.35rem; }
  .undertecknare-block .intro { font-size: 0.88rem; color: #3d5246; margin: 0 0 1rem; }
  .undertecknare-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
  @media (max-width: 560px) { .undertecknare-grid { grid-template-columns: 1fr; } }
  .undertecknare-kolumn h3 { font-size: 0.95rem; margin: 0 0 0.5rem; border-bottom: 1px solid #c5d5cb; padding-bottom: 0.2rem; }
  .signatur-rad { margin: 0.65rem 0; font-size: 0.88rem; }
  .signatur-rad .namn { font-weight: 600; min-height: 1.2em; }
  .signatur-rad .meta { color: #3d5246; font-size: 0.82rem; margin-top: 0.1rem; }
  .signatur-linje { margin-top: 0.45rem; border-bottom: 1px solid #1a2e22; height: 1.6rem; }
  .signatur-etikett { font-size: 0.75rem; color: #5a6b60; margin-top: 0.15rem; }
  .mejl-signering { margin-top: 1rem; font-size: 0.88rem; }
`;

function signaturRadHtml(opts: {
  index: number;
  namn: string;
  meta: string;
  partEtikett: string;
}): string {
  const namnHtml = opts.namn.trim()
    ? escapeHtml(opts.namn)
    : `<span class="meta">Person ${opts.index + 1} — namn vid signering</span>`;
  const meta = opts.meta.trim()
    ? `<div class="meta">${escapeHtml(opts.meta)}</div>`
    : "";
  return `<div class="signatur-rad">
    <div class="namn">${namnHtml}</div>
    ${meta}
    <div class="signatur-linje" aria-hidden="true"></div>
    <div class="signatur-etikett">BankID — ${escapeHtml(opts.partEtikett)}</div>
  </div>`;
}

export function byggPdfUndertecknareHtml(
  data: PdfUndertecknareBlockData,
): string {
  const forening = fyllForeningSlots(data.forening);
  const entreprenor = fyllEntreprenorSlots(data.entreprenor);
  const intro =
    data.instruktion?.trim() ||
    "Undertecknande sker med BankID enligt ordningen nedan.";

  const entreprenorHtml = entreprenor
    .map((p, i) =>
      signaturRadHtml({
        index: i,
        namn: p.namn,
        meta: [p.roll, p.epost].filter(Boolean).join(" · "),
        partEtikett: "entreprenör",
      }),
    )
    .join("");

  const foreningHtml = forening
    .map((p, i) =>
      signaturRadHtml({
        index: i,
        namn: p.namn,
        meta: [p.roll, p.epost].filter(Boolean).join(" · "),
        partEtikett: "förening",
      }),
    )
    .join("");

  const mejl = data.mejlForSignering?.trim()
    ? `<p class="mejl-signering"><strong>Mejl för undertecknande / inbjudan:</strong> ${escapeHtml(data.mejlForSignering.trim())}</p>`
    : "";

  return `<section class="undertecknare-block">
  <h2>Undertecknande med BankID</h2>
  <p class="intro">${escapeHtml(intro)}</p>
  <div class="undertecknare-grid">
    <div class="undertecknare-kolumn">
      <h3>Entreprenör</h3>
      ${entreprenorHtml}
    </div>
    <div class="undertecknare-kolumn">
      <h3>Föreningens representanter</h3>
      ${foreningHtml}
    </div>
  </div>
  ${mejl}
</section>`;
}

export function byggPdfUndertecknareText(
  data: PdfUndertecknareBlockData,
): string {
  const forening = fyllForeningSlots(data.forening);
  const entreprenor = fyllEntreprenorSlots(data.entreprenor);
  const rader = [
    "",
    "UNDERTECKNANDE MED BANKID",
    data.instruktion?.trim() ||
      "Entreprenören signerar först (två personer). Därefter föreningen (två personer).",
    "",
    "Entreprenör:",
  ];
  entreprenor.forEach((p, i) => {
    rader.push(
      `  ${i + 1}. ${p.namn.trim() || "(namn vid signering)"}${p.epost ? ` · ${p.epost}` : ""}`,
    );
    rader.push("     ___________________________  BankID");
  });
  rader.push("", "Föreningens representanter:");
  forening.forEach((p, i) => {
    rader.push(
      `  ${i + 1}. ${p.namn.trim() || "(namn vid signering)"} · ${p.roll || "Styrelse"}${p.epost ? ` · ${p.epost}` : ""}`,
    );
    rader.push("     ___________________________  BankID");
  });
  if (data.mejlForSignering?.trim()) {
    rader.push("", `Mejl för undertecknande: ${data.mejlForSignering.trim()}`);
  }
  return rader.join("\n");
}
