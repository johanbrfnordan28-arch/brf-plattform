"use client";

import { useMemo, useState } from "react";
import {
  delaDokumentIAvsnitt,
  sammanfogaDokumentAvsnitt,
} from "@/components/dokumentbank/dokument-avsnitt";
import {
  STYRELSE_NAVET_DOC,
  byggDokumentPreviewSrcDoc,
  dokumentRedigerareCss,
  struktureraDokumentText,
  type DokumentLayoutTema,
} from "@/components/dokumentbank/dokument-layout";

type Props = {
  titel: string;
  meta?: string;
  innehall: string;
  tema: DokumentLayoutTema;
  onChange: (text: string) => void;
};

export function DokumentRedigerareMedPreview({
  titel,
  meta,
  innehall,
  tema,
  onChange,
}: Props) {
  const [avsnitt, setAvsnitt] = useState(() => delaDokumentIAvsnitt(innehall));
  const [visning, setVisning] = useState<"delad" | "hel">("delad");

  const synkatText = useMemo(() => sammanfogaDokumentAvsnitt(avsnitt), [avsnitt]);

  function publicera(text: string) {
    onChange(text);
  }

  function uppdateraAvsnittLista(nasta: string[]) {
    setAvsnitt(nasta);
    publicera(sammanfogaDokumentAvsnitt(nasta));
  }

  const previewSrc = useMemo(
    () =>
      byggDokumentPreviewSrcDoc({
        titel,
        text: synkatText,
        tema,
        meta,
      }),
    [titel, synkatText, tema, meta],
  );

  const formateradHtml = useMemo(
    () => struktureraDokumentText(synkatText),
    [synkatText],
  );

  function uppdateraAvsnitt(index: number, varde: string) {
    const nasta = avsnitt.map((a, i) => (i === index ? varde : a));
    uppdateraAvsnittLista(nasta);
  }

  function taBortAvsnitt(index: number) {
    if (avsnitt.length <= 1) {
      uppdateraAvsnittLista([""]);
      return;
    }
    uppdateraAvsnittLista(avsnitt.filter((_, i) => i !== index));
  }

  function laggTillAvsnitt() {
    uppdateraAvsnittLista([
      ...avsnitt,
      "Nytt avsnitt\n--------------\n\n[Beskrivning]",
    ]);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setVisning("delad")}
          className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
            visning === "delad"
              ? "bg-[#e2f0e6] text-primary-dark"
              : "text-muted"
          }`}
        >
          Förhandsgranska + avsnitt
        </button>
        <button
          type="button"
          onClick={() => setVisning("hel")}
          className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
            visning === "hel"
              ? "bg-[#e2f0e6] text-primary-dark"
              : "text-muted"
          }`}
        >
          Hela texten
        </button>
      </div>

      {visning === "delad" ? (
        <>
          <iframe
            title="Live förhandsgranska"
            className="h-[min(42vh,420px)] w-full rounded-xl border border-border bg-[#e8ece9] shadow-inner"
            srcDoc={previewSrc}
          />
          <div className="doc-edit-root rounded-xl border border-border bg-[#f7faf8] p-4">
            <style>{dokumentRedigerareCss(tema)}</style>
            <p className="text-xs font-medium text-muted">
              Redigera avsnitt — samma innehåll som ovan, uppdateras direkt.
              Tom rad mellan stycken i ett avsnitt (Enter två gånger) ger bättre
              PDF-layout.
            </p>
            <div className="doc-avsnitt-wrap">
              {avsnitt.map((block, index) => (
                <div key={index} className="doc-avsnitt-rad">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-primary-dark">
                      Avsnitt {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => taBortAvsnitt(index)}
                      className="text-xs text-muted hover:text-red-700"
                    >
                      Ta bort avsnitt
                    </button>
                  </div>
                  <textarea
                    value={block}
                    onChange={(e) => uppdateraAvsnitt(index, e.target.value)}
                    rows={Math.min(12, Math.max(3, block.split("\n").length + 1))}
                  />
                  <p className="doc-avsnitt-hint">
                    Dubbel radbrytning = nytt stycke i PDF. Enkel radbrytning =
                    samma stycke (radbryt).
                  </p>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={laggTillAvsnitt}
              className="mt-2 rounded-lg border border-dashed border-primary px-3 py-2 text-xs font-medium text-primary-dark hover:bg-[#eef6f0]"
            >
              + Lägg till avsnitt
            </button>
          </div>
        </>
      ) : (
        <div className="doc-edit-root doc-tema overflow-hidden rounded-xl border border-border bg-white">
          <style>{dokumentRedigerareCss(tema)}</style>
          <article className="doc-sheet">
            <div className="doc-ram">
              <header className="doc-header">
                <div className="doc-brand-rad">
                  <span className="doc-brand-namn">{STYRELSE_NAVET_DOC.namn}</span>
                  <span className="doc-brand-tag">{STYRELSE_NAVET_DOC.tagline}</span>
                </div>
                <h1 className="doc-h1">{titel}</h1>
                {meta ? <p className="doc-meta">{meta}</p> : null}
              </header>
              <div
                className="doc-body doc-avsnitt-wrap"
                dangerouslySetInnerHTML={{ __html: formateradHtml }}
              />
            </div>
          </article>
          <div className="border-t border-border bg-[#f7faf8] p-4">
            <p className="mb-2 text-xs text-muted">
              Redigera hela källtexten. Rubriker: rad + rad med === eller ---.
              Stycken: tom rad mellan textblock. Layout och sidantal som i
              förhandsgranska ({STYRELSE_NAVET_DOC.namn}).
            </p>
            <textarea
              value={synkatText}
              onChange={(e) => {
                const nasta = delaDokumentIAvsnitt(e.target.value);
                setAvsnitt(nasta);
                publicera(e.target.value);
              }}
              rows={16}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm leading-relaxed"
            />
          </div>
        </div>
      )}
    </div>
  );
}
