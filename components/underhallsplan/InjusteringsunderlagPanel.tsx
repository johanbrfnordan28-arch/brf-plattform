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
    w.document.write(`<!doctype html><html lang="sv"><head><meta charset="utf-8"/><title>Injusteringsunderlag</title>
<style>
  body { font-family: ui-sans-serif, system-ui, sans-serif; padding: 24px; color: #111; line-height: 1.45; }
  pre { white-space: pre-wrap; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; }
</style></head><body><pre>${text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")}</pre></body></html>`);
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
