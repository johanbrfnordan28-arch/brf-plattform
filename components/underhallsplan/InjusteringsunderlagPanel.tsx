"use client";

import { useMemo, useState } from "react";
import {
  byggInjusteringsunderlagText,
  formateraSnapshotDatum,
  skapaInjusteringsunderlagSnapshot,
  type InjusteringsunderlagKalla,
  type InjusteringsunderlagSnapshot,
} from "@/components/underhallsplan/injusteringsunderlag";

type InjusteringsunderlagPanelProps = {
  kalla: InjusteringsunderlagKalla;
  sparat: InjusteringsunderlagSnapshot | null;
  onSpara: (snapshot: InjusteringsunderlagSnapshot) => void;
  onRensaSparat?: () => void;
};

export function InjusteringsunderlagPanel({
  kalla,
  sparat,
  onSpara,
  onRensaSparat,
}: InjusteringsunderlagPanelProps) {
  const [visaSparat, setVisaSparat] = useState(false);
  const [kopierat, setKopierat] = useState(false);

  const liveText = useMemo(
    () => byggInjusteringsunderlagText(kalla),
    [kalla],
  );
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

  function skrivUt() {
    const w = window.open("", "_blank", "noopener,noreferrer");
    if (!w) return;
    const html = text
      .split("\n")
      .map((rad) => {
        const e = rad
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        if (rad.startsWith("## ")) return `<h2>${e.slice(3)}</h2>`;
        if (rad.startsWith("### ")) return `<h3>${e.slice(4)}</h3>`;
        if (!rad.trim()) return `<div class="gap"></div>`;
        return `<p>${e}</p>`;
      })
      .join("");
    w.document.write(`<!doctype html><html lang="sv"><head><meta charset="utf-8"/><title>Injusteringsunderlag</title>
<style>
  @page { margin: 16mm; }
  body { margin: 0; font-family: Georgia, "Times New Roman", serif; color: #1c1917; background: #f7f5f2; line-height: 1.45; }
  .sheet { max-width: 820px; margin: 0 auto; padding: 28px 32px; background: #fffefb; border: 1px solid #d6ddd7; }
  h2 { margin: 24px 0 10px; font-size: 14px; font-family: ui-sans-serif, system-ui, sans-serif; color: #0f4c3a; text-transform: uppercase; letter-spacing: 0.04em; }
  h3 { margin: 18px 0 6px; font-size: 17px; border-left: 3px solid #0f4c3a; padding-left: 10px; }
  p { margin: 3px 0; font-size: 13px; }
  .gap { height: 8px; }
  @media print { body { background: white; } .sheet { border: none; max-width: none; padding: 0; } }
</style></head><body><div class="sheet">${html}</div></body></html>`);
    w.document.close();
    w.focus();
    w.print();
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold text-primary-dark">
          Injusteringsunderlag
        </p>
        <p className="mt-1 text-[11px] leading-relaxed text-muted">
          Samlar undercentral, horisontell stamledning, stamhöjd per våning,
          radiatorstorlek samt golvyta och rumvolym (yta × takhöjd). Sparat
          underlag kan lämnas till den som tar fram injusteringshandlingen.
        </p>
      </div>

      {sparat && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-xs">
          <span className="text-muted">
            Senast sparat: {formateraSnapshotDatum(sparat.sparadDatum)}
          </span>
          <button
            type="button"
            onClick={() => setVisaSparat((v) => !v)}
            className="rounded-md border border-border px-2 py-1 font-medium text-primary-dark hover:bg-[#eef6f0]"
          >
            {visaSparat ? "Visa aktuell data" : "Visa sparad version"}
          </button>
          {onRensaSparat && (
            <button
              type="button"
              onClick={onRensaSparat}
              className="text-muted underline hover:text-red-700"
            >
              Ta bort sparad
            </button>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onSpara(skapaInjusteringsunderlagSnapshot(kalla))}
          className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          Spara underlag
        </button>
        <button
          type="button"
          onClick={() => void kopiera()}
          className="rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-primary-dark hover:bg-[#eef6f0]"
        >
          {kopierat ? "Kopierat" : "Kopiera text"}
        </button>
        <button
          type="button"
          onClick={skrivUt}
          className="rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-primary-dark hover:bg-[#eef6f0]"
        >
          Skriv ut / PDF
        </button>
      </div>

      <pre className="max-h-[32rem] overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-white p-3 text-[11px] leading-relaxed text-foreground">
        {text}
      </pre>
    </div>
  );
}
