"use client";

import { useMemo, useState } from "react";
import type { RadiatorTypPost } from "@/components/underhallsplan/radiator-typer";
import {
  byggVarmeSammanstallningText,
  byggVarmeStamOversikt,
  formateraVarmeSammanstallningDatum,
  skapaVarmeSammanstallningSnapshot,
  summeraVarmestammarData,
  type VarmeSammanstallningSnapshot,
  type VarmestammarData,
} from "@/components/underhallsplan/varmestammar";

type Props = {
  data: VarmestammarData;
  radiatorTyper?: RadiatorTypPost[];
  foreningNamn?: string;
  onSpara: (snapshot: VarmeSammanstallningSnapshot) => void;
  onRensaSparat?: () => void;
};

function escapaHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function byggPrintHtml(
  data: VarmestammarData,
  radiatorTyper: RadiatorTypPost[],
  foreningNamn: string,
  sparadText?: string,
): string {
  if (sparadText) {
    const stycken = sparadText
      .split("\n")
      .map((rad) => {
        if (rad.startsWith("## ")) {
          return `<h2>${escapaHtml(rad.slice(3))}</h2>`;
        }
        if (rad.startsWith("### ")) {
          return `<h3>${escapaHtml(rad.slice(4))}</h3>`;
        }
        if (!rad.trim()) return "<div class='gap'></div>";
        return `<p>${escapaHtml(rad)}</p>`;
      })
      .join("\n");
    return stycken;
  }

  const summering = summeraVarmestammarData(data);
  const systemTyp = data.systemTyp ?? "tva-ror";
  const stammar = data.poster.map((p) =>
    byggVarmeStamOversikt(p, radiatorTyper, systemTyp),
  );
  const forening = foreningNamn.trim()
    ? `<p class="meta">Förening: ${escapaHtml(foreningNamn.trim())}</p>`
    : "";

  const stamHtml = stammar
    .map((s) => {
      const fakta = s.fakta
        .map(
          (f) =>
            `<div class="kv"><span>${escapaHtml(f.etikett)}</span><strong>${escapaHtml(f.varde)}</strong></div>`,
        )
        .join("");
      const radiatorer =
        s.radiatorer.length > 0
          ? `<ul class="lista">${s.radiatorer
              .map((r) => `<li>${escapaHtml(r.varde)}</li>`)
              .join("")}</ul>`
          : `<p class="tom">Radiatorer ej angivna</p>`;
      const ventiler =
        systemTyp === "tva-ror"
          ? `<div class="ventiler">
    <div><span>Tillopp</span><strong>${escapaHtml(s.tilloppsventil)}${s.tilloppHarBild ? " · bild" : ""}</strong></div>
    <div><span>Retur</span><strong>${escapaHtml(s.returventil)}${s.returHarBild ? " · bild" : ""}</strong></div>
  </div>`
          : `<div class="ventiler">
    <div><span>Stamventil</span><strong>${escapaHtml(s.tilloppsventil)}${s.tilloppHarBild ? " · bild" : ""}</strong></div>
  </div>`;
      return `<article class="stam">
  <header>
    <h3>${escapaHtml(s.rubrik)}</h3>
    ${s.underrubrik ? `<p class="under">${escapaHtml(s.underrubrik)}</p>` : ""}
  </header>
  <div class="grid">${fakta}</div>
  ${ventiler}
  <h4>Radiatorer</h4>
  ${radiatorer}
</article>`;
    })
    .join("\n");

  const sumHtml = summering
    .map(
      (r) =>
        `<tr><td>${escapaHtml(r.etikett)}</td><td>${escapaHtml(r.varde)}</td></tr>`,
    )
    .join("");

  const horisontella = summering
    .filter((r) => r.etikett.includes("Horisontella"))
    .map(
      (r) =>
        `<div class="kv"><span>${escapaHtml(r.etikett.replace("Horisontella ledningar — ", ""))}</span><strong>${escapaHtml(r.varde)}</strong></div>`,
    )
    .join("");

  return `
<header class="doc-head">
  <p class="eyebrow">Underhållsplan · Värmesystem</p>
  <h1>Värmesammanställning</h1>
  <p class="meta">Datum: ${escapaHtml(new Date().toLocaleDateString("sv-SE"))}</p>
  ${forening}
  <p class="meta">Systemtyp: ${escapaHtml(
    summering.find((r) => r.etikett === "Systemtyp")?.varde ?? systemTyp,
  )}</p>
</header>
<section>
  <h2>Horisontella värmeledningar</h2>
  <div class="grid">${horisontella || '<p class="tom">Ej angivna</p>'}</div>
</section>
<section>
  <h2>Stamförteckning</h2>
  ${stamHtml || "<p class='tom'>Inga stammar registrerade.</p>"}
</section>
<section>
  <h2>Summering</h2>
  <table><tbody>${sumHtml}</tbody></table>
</section>`;
}
const PRINT_CSS = `
  @page { margin: 16mm; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif;
    color: #1c1917;
    background: #f7f5f2;
    line-height: 1.45;
  }
  .sheet {
    max-width: 820px;
    margin: 0 auto;
    padding: 28px 32px 40px;
    background:
      linear-gradient(180deg, rgba(15, 76, 58, 0.06), transparent 120px),
      #fffefb;
    border: 1px solid #d6ddd7;
  }
  .doc-head { margin-bottom: 28px; padding-bottom: 16px; border-bottom: 2px solid #0f4c3a; }
  .eyebrow { margin: 0 0 6px; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: #0f4c3a; font-family: ui-sans-serif, system-ui, sans-serif; }
  h1 { margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.02em; }
  h2 { margin: 28px 0 12px; font-size: 16px; font-family: ui-sans-serif, system-ui, sans-serif; color: #0f4c3a; letter-spacing: 0.02em; text-transform: uppercase; }
  h3 { margin: 0; font-size: 18px; }
  h4 { margin: 14px 0 6px; font-size: 12px; font-family: ui-sans-serif, system-ui, sans-serif; text-transform: uppercase; letter-spacing: 0.06em; color: #57534e; }
  .meta, .under, p { margin: 4px 0; font-size: 13px; color: #44403c; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; }
  .kv span, .ventiler span { display: block; font-size: 11px; color: #78716c; font-family: ui-sans-serif, system-ui, sans-serif; text-transform: uppercase; letter-spacing: 0.04em; }
  .kv strong, .ventiler strong { font-size: 14px; font-weight: 600; color: #1c1917; }
  .stam {
    break-inside: avoid;
    margin: 0 0 14px;
    padding: 14px 16px;
    border: 1px solid #d6ddd7;
    border-left: 3px solid #0f4c3a;
    background: #fcfbf8;
  }
  .ventiler { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 12px; padding-top: 10px; border-top: 1px solid #e7e5e4; }
  .lista { margin: 0; padding-left: 18px; }
  .lista li { margin: 3px 0; font-size: 13px; }
  .tom { font-style: italic; color: #78716c; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  td { padding: 8px 0; border-bottom: 1px solid #e7e5e4; }
  td:last-child { text-align: right; font-variant-numeric: tabular-nums; font-weight: 600; }
  .gap { height: 8px; }
  @media print {
    body { background: white; }
    .sheet { border: none; max-width: none; padding: 0; }
  }
`;

export function VarmeSammanstallningPanel({
  data,
  radiatorTyper = [],
  foreningNamn = "",
  onSpara,
  onRensaSparat,
}: Props) {
  const [visaSparat, setVisaSparat] = useState(false);
  const [kopierat, setKopierat] = useState(false);
  const sparat = data.sparadSammanstallning ?? null;

  const liveText = useMemo(
    () =>
      byggVarmeSammanstallningText(data, {
        radiatorTyper,
        foreningNamn,
      }),
    [data, radiatorTyper, foreningNamn],
  );

  const oversikter = useMemo(
    () =>
      data.poster.map((p) =>
        byggVarmeStamOversikt(p, radiatorTyper, data.systemTyp ?? "tva-ror"),
      ),
    [data.poster, data.systemTyp, radiatorTyper],
  );
  const summering = useMemo(() => summeraVarmestammarData(data), [data]);
  const systemTyp = data.systemTyp ?? "tva-ror";

  const text = visaSparat && sparat ? sparat.text : liveText;

  async function kopiera() {
    try {
      await navigator.clipboard.writeText(text);
      setKopierat(true);
      window.setTimeout(() => setKopierat(false), 2000);
    } catch {
      setKopierat(false);
    }
  }

  function skrivUtEllerPdf() {
    const w = window.open("", "_blank", "noopener,noreferrer");
    if (!w) return;
    const bodyHtml = byggPrintHtml(
      data,
      radiatorTyper,
      foreningNamn,
      visaSparat && sparat ? sparat.text : undefined,
    );
    w.document.write(`<!doctype html><html lang="sv"><head><meta charset="utf-8"/>
<title>Värmesammanställning</title>
<style>${PRINT_CSS}</style></head>
<body><div class="sheet">${bodyHtml}</div></body></html>`);
    w.document.close();
    w.focus();
    w.print();
  }

  if (
    data.poster.length === 0 &&
    !(data.horisontellaLedningar?.length > 0) &&
    !data.stamledningTilloppLopmeter &&
    !data.stamledningReturLopmeter
  ) {
    return null;
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-[#c5d9cc] bg-gradient-to-b from-[#f3f8f5] to-white shadow-sm">
      <div className="border-b border-[#d4e8da] px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-primary-dark">
              Värmesystem
            </p>
            <h3 className="mt-0.5 text-lg font-semibold tracking-tight text-stone-900">
              Sammanställning
            </h3>
            <p className="mt-1 max-w-xl text-xs leading-relaxed text-stone-600">
              Översikt per stam med ventiler och radiatorer. Spara, skriv ut
              eller spara som PDF via utskriftsdialogen.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                onSpara(
                  skapaVarmeSammanstallningSnapshot(data, {
                    radiatorTyper,
                    foreningNamn,
                  }),
                )
              }
              className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary/90"
            >
              Spara
            </button>
            <button
              type="button"
              onClick={() => void kopiera()}
              className="rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-primary-dark hover:bg-[#eef6f0]"
            >
              {kopierat ? "Kopierat" : "Kopiera"}
            </button>
            <button
              type="button"
              onClick={skrivUtEllerPdf}
              className="rounded-lg border border-primary/40 bg-white px-3 py-2 text-sm font-medium text-primary-dark hover:bg-[#eef6f0]"
            >
              Skriv ut / PDF
            </button>
          </div>
        </div>

        {sparat ? (
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-border/80 bg-white/80 px-3 py-2 text-xs">
            <span className="text-muted">
              Sparad {formateraVarmeSammanstallningDatum(sparat.sparadDatum)}
            </span>
            <button
              type="button"
              onClick={() => setVisaSparat((v) => !v)}
              className="rounded-md border border-border px-2 py-1 font-medium text-primary-dark hover:bg-[#eef6f0]"
            >
              {visaSparat ? "Visa aktuell" : "Öppna sparad"}
            </button>
            {onRensaSparat ? (
              <button
                type="button"
                onClick={onRensaSparat}
                className="text-muted underline hover:text-red-700"
              >
                Ta bort sparad
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      {visaSparat && sparat ? (
        <pre className="max-h-[28rem] overflow-auto whitespace-pre-wrap px-4 py-4 text-[11px] leading-relaxed text-stone-800 sm:px-5">
          {sparat.text}
        </pre>
      ) : (
        <div className="space-y-4 px-4 py-4 sm:px-5">
          {summering.length > 0 ? (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {summering.slice(0, 6).map((rad) => (
                <div
                  key={rad.etikett}
                  className="rounded-xl border border-[#e2ebe5] bg-white px-3 py-2.5"
                >
                  <p className="text-[10px] font-medium uppercase tracking-wide text-stone-500">
                    {rad.etikett}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold tabular-nums text-stone-900">
                    {rad.varde}
                  </p>
                </div>
              ))}
            </div>
          ) : null}

          <ul className="space-y-3">
            {oversikter.map((s) => (
              <li
                key={s.id}
                className="rounded-xl border border-[#d4e8da] border-l-[3px] border-l-primary bg-white px-3 py-3 sm:px-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-stone-900">
                      {s.rubrik}
                    </p>
                    {s.underrubrik ? (
                      <p className="text-xs text-stone-500">{s.underrubrik}</p>
                    ) : null}
                  </div>
                  <p className="text-[11px] text-stone-500">
                    {s.radiatorer.length > 0
                      ? `${s.radiatorer.length} radiatortyp${s.radiatorer.length === 1 ? "" : "er"}`
                      : "Inga radiatorer"}
                  </p>
                </div>

                {s.fakta.length > 0 ? (
                  <dl className="mt-2 grid gap-x-4 gap-y-1 sm:grid-cols-2">
                    {s.fakta.map((f) => (
                      <div
                        key={`${s.id}-${f.etikett}`}
                        className="flex justify-between gap-3 text-xs"
                      >
                        <dt className="text-stone-500">{f.etikett}</dt>
                        <dd className="text-right font-medium text-stone-800">
                          {f.varde}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : null}

                <div
                  className={`mt-3 grid gap-2 border-t border-stone-100 pt-2 ${systemTyp === "tva-ror" ? "sm:grid-cols-2" : ""}`}
                >
                  <p className="text-xs text-stone-700">
                    <span className="block text-[10px] font-medium uppercase tracking-wide text-stone-500">
                      {systemTyp === "tva-ror"
                        ? "Tilloppsventil"
                        : "Stamventil"}
                    </span>
                    {s.tilloppsventil}
                    {s.tilloppHarBild ? " · bild" : ""}
                  </p>
                  {systemTyp === "tva-ror" ? (
                    <p className="text-xs text-stone-700">
                      <span className="block text-[10px] font-medium uppercase tracking-wide text-stone-500">
                        Returventil
                      </span>
                      {s.returventil}
                      {s.returHarBild ? " · bild" : ""}
                    </p>
                  ) : null}
                </div>

                {s.radiatorer.length > 0 ? (
                  <ul className="mt-2 space-y-1 border-t border-stone-100 pt-2">
                    {s.radiatorer.map((r, i) => (
                      <li
                        key={`${s.id}-rad-${i}`}
                        className="text-xs leading-relaxed text-stone-700"
                      >
                        {r.varde}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
