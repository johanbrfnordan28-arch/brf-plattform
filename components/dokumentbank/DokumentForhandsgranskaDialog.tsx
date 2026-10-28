"use client";

import { useEffect, useMemo, useState } from "react";
import type { DokumentbankMall } from "@/components/dokumentbank/mallar";
import {
  DOKUMENT_LAYOUT_ETIKETTER,
  STANDARD_DOKUMENT_LAYOUT,
  byggDokumentPreviewHtml,
  oppnaDokumentForhandsgranska,
  type DokumentLayoutTema,
} from "@/components/dokumentbank/dokument-layout";
import { skapaInnehallFranMall } from "@/components/dokumentbank/forening-dokument-innehall";

type Props = {
  mall: DokumentbankMall;
  open: boolean;
  onStang: () => void;
  onSkapaKopia?: (titel: string, tema: DokumentLayoutTema) => void;
};

export function DokumentForhandsgranskaDialog({
  mall,
  open,
  onStang,
  onSkapaKopia,
}: Props) {
  const [titel, setTitel] = useState(mall.titel);
  const [tema, setTema] = useState<DokumentLayoutTema>(STANDARD_DOKUMENT_LAYOUT);

  useEffect(() => {
    if (open) {
      setTitel(mall.titel);
      setTema(STANDARD_DOKUMENT_LAYOUT);
    }
  }, [open, mall.titel]);

  const text = useMemo(() => {
    if (!mall.textInnehall?.trim()) {
      return "Den här mallen har inget textinnehåll att förhandsgranska. Du kan fortfarande skapa en kopia och ladda upp eget innehåll.";
    }
    return skapaInnehallFranMall(mall, titel);
  }, [mall, titel]);

  const previewSrcDoc = useMemo(
    () =>
      byggDokumentPreviewHtml({
        titel: titel.trim() || mall.titel,
        text,
        tema,
        meta: mall.beskrivning,
      }),
    [titel, text, tema, mall],
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dok-forhandsgranska-rubrik"
    >
      <div className="flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl border border-border bg-surface shadow-xl sm:rounded-2xl">
        <header className="flex shrink-0 flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <p
              id="dok-forhandsgranska-rubrik"
              className="text-lg font-semibold text-foreground"
            >
              Förhandsgranska
            </p>
            <p className="mt-0.5 text-sm text-muted">{mall.titel}</p>
          </div>
          <button
            type="button"
            onClick={onStang}
            className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted hover:text-foreground"
          >
            Stäng
          </button>
        </header>

        <div className="grid shrink-0 gap-4 border-b border-border bg-[#f7fbf8]/80 px-4 py-4 sm:grid-cols-2 sm:px-6">
          <label className="block text-xs font-medium text-muted">
            Namn på er kopia (projektnamn)
            <input
              type="text"
              value={titel}
              onChange={(e) => setTitel(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
            />
          </label>
          <fieldset>
            <legend className="text-xs font-medium text-muted">Layout</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {(Object.keys(DOKUMENT_LAYOUT_ETIKETTER) as DokumentLayoutTema[]).map(
                (key) => (
                  <button
                    key={key}
                    type="button"
                    title={DOKUMENT_LAYOUT_ETIKETTER[key].beskrivning}
                    onClick={() => setTema(key)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
                      tema === key
                        ? "border-primary bg-[#e2f0e6] text-primary-dark"
                        : "border-border bg-white text-muted hover:text-foreground"
                    }`}
                  >
                    {DOKUMENT_LAYOUT_ETIKETTER[key].titel}
                  </button>
                ),
              )}
            </div>
          </fieldset>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden bg-[#e8ece9] p-3 sm:p-4">
          <iframe
            title="Förhandsgranskning av dokument"
            className="h-[min(52vh,520px)] w-full rounded-lg border border-border bg-white shadow-inner"
            srcDoc={previewSrcDoc}
          />
        </div>

        <footer className="flex shrink-0 flex-wrap gap-2 border-t border-border px-4 py-4 sm:px-6">
          <button
            type="button"
            onClick={() =>
              oppnaDokumentForhandsgranska({
                titel: titel.trim() || mall.titel,
                text,
                tema,
                meta: mall.beskrivning,
              })
            }
            className="rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary-dark hover:bg-[#eef6f0]"
          >
            Öppna i ny flik / PDF
          </button>
          {onSkapaKopia && (
            <button
              type="button"
              onClick={() => {
                onSkapaKopia(titel.trim() || mall.titel, tema);
                onStang();
              }}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              Skapa kopia med vald layout
            </button>
          )}
          <button
            type="button"
            onClick={onStang}
            className="rounded-lg border border-border px-4 py-2 text-sm text-muted"
          >
            Avbryt
          </button>
        </footer>
      </div>
    </div>
  );
}
