"use client";

import { useState } from "react";
import {
  arStartbesiktningPunkt,
  forvantadeDokumentForMall,
  hamtaRenoveringsMall,
  renoveringsUndermappTyper,
} from "@/components/lagenhetsarkiv/renoverings-mallar";
import {
  antalDokumentRenoveringsMapp,
  skapaLagenhetsDokumentId,
  type EgenkontrollPunkt,
  type LagenhetsDokument,
  type RenoveringsMapp,
} from "@/components/lagenhetsarkiv/lagenhetsarkiv";

type EgenkontrollListaProps = {
  mapp: RenoveringsMapp;
  onSignera: (punktId: string) => void;
  onLaddaUpSkadebild: (punktId: string, filnamn: string) => void;
};

export function EgenkontrollLista({
  mapp,
  onSignera,
  onLaddaUpSkadebild,
}: EgenkontrollListaProps) {
  const signerade = mapp.egenkontroller.filter((p) => p.signerad).length;
  const totalt = mapp.egenkontroller.length;

  return (
    <div className="rounded-xl border border-primary/25 bg-[#fafcfa] p-3 sm:p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-foreground">
            Mall — egenkontroller
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Signera varje punkt med BankID. Vid startbesiktning ska befintliga
            skador fotograferas och laddas upp innan signering — för ej
            dokumenterade skador ansvarar entreprenören.
          </p>
        </div>
        <span className="rounded-full bg-[#e2f0e6] px-2.5 py-0.5 text-xs font-medium text-primary-dark">
          {signerade} av {totalt} signerade
        </span>
      </div>

      <ul className="mt-3 space-y-2">
        {mapp.egenkontroller.map((punkt) => {
          const ärStartbesiktning = arStartbesiktningPunkt(punkt.id);
          const bilder = punkt.skadebilder ?? [];
          const kanSignera =
            !ärStartbesiktning || bilder.length > 0 || punkt.signerad;

          return (
          <li
            key={punkt.id}
            className={`rounded-lg border px-3 py-2.5 ${
              punkt.signerad
                ? "border-primary/30 bg-white"
                : "border-border bg-white"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p
                className={`text-sm leading-relaxed ${
                  punkt.signerad ? "text-primary-dark" : "text-foreground"
                }`}
              >
                {ärStartbesiktning && (
                  <span className="mr-1 font-semibold text-primary-dark">
                    Startbesiktning —
                  </span>
                )}
                {punkt.text}
              </p>
              {punkt.signerad ? (
                <span className="shrink-0 text-xs font-medium text-primary-dark">
                  BankID ✓ {punkt.signeradDatum}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onSignera(punkt.id)}
                  disabled={!kanSignera}
                  title={
                    !kanSignera
                      ? "Ladda upp minst en bild på befintliga skador innan signering"
                      : undefined
                  }
                  className="shrink-0 rounded-lg bg-[#1e3a5f] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#152a45] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Signera med BankID
                </button>
              )}
            </div>

            {ärStartbesiktning && !punkt.signerad && (
              <div className="mt-3 rounded-lg border border-dashed border-border bg-[#fafcfa] p-2.5">
                <p className="text-xs font-medium text-foreground">
                  Dokumentera skador med bilder
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  Fotografera skador i lägenheten, i fastigheten (t.ex. trapphus)
                  och angränsande lägenheter där det är möjligt.
                </p>
                {bilder.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {bilder.map((bild) => (
                      <li
                        key={bild.id}
                        className="text-xs text-primary-dark"
                      >
                        📷 {bild.filnamn}{" "}
                        <span className="text-muted">({bild.uppladdad})</span>
                      </li>
                    ))}
                  </ul>
                )}
                <label className="mt-2 inline-flex cursor-pointer rounded-lg border border-primary px-3 py-1.5 text-xs font-medium text-primary-dark hover:bg-[#eef6f0]">
                  Ladda upp bild
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const fil = e.target.files?.[0];
                      if (fil) onLaddaUpSkadebild(punkt.id, fil.name);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
            )}

            {punkt.signerad && punkt.signeradAv && (
              <p className="mt-1 text-xs text-muted">{punkt.signeradAv}</p>
            )}
            {ärStartbesiktning && punkt.signerad && bilder.length > 0 && (
              <p className="mt-1 text-xs text-muted">
                {bilder.length} skadebild{bilder.length > 1 ? "er" : ""}{" "}
                dokumenterade vid signering.
              </p>
            )}
          </li>
          );
        })}
      </ul>
    </div>
  );
}

type RenoveringsMappPanelProps = {
  mapp: RenoveringsMapp;
  onTaBort: () => void;
  onLäggTillDokument: (
    undermappId: string,
    filnamn: string,
  ) => void;
  onSigneraEgenkontroll: (punktId: string) => void;
  onLaddaUpSkadebild: (punktId: string, filnamn: string) => void;
};

export function RenoveringsMappPanel({
  mapp,
  onTaBort,
  onLäggTillDokument,
  onSigneraEgenkontroll,
  onLaddaUpSkadebild,
}: RenoveringsMappPanelProps) {
  const mall = hamtaRenoveringsMall(mapp.mallId ?? "ovrigt");
  const forvantade = forvantadeDokumentForMall(mall);
  const totaltDokument = antalDokumentRenoveringsMapp(mapp);
  const forvantadeTotalt = Object.values(forvantade).flat().length;

  return (
    <article className="rounded-2xl border border-border bg-background p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-semibold text-foreground">{mapp.name}</h4>
            <span className="rounded-full bg-[#eef6f0] px-2 py-0.5 text-xs font-medium text-primary-dark">
              {mall.etikett}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted">
            {totaltDokument} dokument uppladdade
            {forvantadeTotalt > 0 &&
              ` · ${forvantadeTotalt} exempel i mallen`}
          </p>
        </div>
        <button
          type="button"
          onClick={onTaBort}
          className="text-xs font-medium text-muted hover:text-primary-dark"
        >
          Ta bort mapp
        </button>
      </div>

      <EgenkontrollLista
        mapp={mapp}
        onSignera={onSigneraEgenkontroll}
        onLaddaUpSkadebild={onLaddaUpSkadebild}
      />

      <div className="mt-4 space-y-3">
        {mapp.undermappar.map((undermapp) => {
          const def = renoveringsUndermappTyper.find(
            (d) => d.typ === undermapp.typ,
          );
          const guider = forvantadeDokumentForMall(mall)[undermapp.typ] ?? [];
          return (
            <UndermappRad
              key={undermapp.id}
              etikett={def?.etikett ?? undermapp.typ}
              beskrivning={def?.beskrivning ?? ""}
              forvantadeDokument={guider}
              dokument={undermapp.dokument}
              onLäggTill={(filnamn) =>
                onLäggTillDokument(undermapp.id, filnamn)
              }
            />
          );
        })}
      </div>
    </article>
  );
}

function UndermappRad({
  etikett,
  beskrivning,
  forvantadeDokument,
  dokument,
  onLäggTill,
}: {
  etikett: string;
  beskrivning: string;
  forvantadeDokument: string[];
  dokument: { id: string; filnamn: string; uppladdad: string }[];
  onLäggTill: (filnamn: string) => void;
}) {
  const [öppen, setÖppen] = useState(false);
  const [nyttNamn, setNyttNamn] = useState("");

  function läggTill() {
    const namn = nyttNamn.trim();
    if (!namn) return;
    onLäggTill(namn);
    setNyttNamn("");
  }

  const saknade = forvantadeDokument.filter(
    (guide) =>
      !dokument.some((d) =>
        d.filnamn.toLowerCase().includes(guide.toLowerCase().slice(0, 8)),
      ),
  );

  return (
    <div className="rounded-xl border border-border bg-white">
      <button
        type="button"
        onClick={() => setÖppen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left"
        aria-expanded={öppen}
      >
        <span>
          <span className="block text-sm font-medium text-foreground">
            {etikett}
          </span>
          <span className="text-xs text-muted">
            {dokument.length} dokument
            {saknade.length > 0 && öppen === false && (
              <span className="ml-1 text-amber-800">
                · {saknade.length} exempel kvar
              </span>
            )}
          </span>
        </span>
        <span className="text-xs text-muted">{öppen ? "−" : "+"}</span>
      </button>

      {öppen && (
        <div className="border-t border-border px-3 pb-3 pt-2">
          <p className="text-xs text-muted">{beskrivning}</p>

          {forvantadeDokument.length > 0 && (
            <div className="mt-2 rounded-lg bg-[#fafcfa] px-2.5 py-2">
              <p className="text-xs font-medium text-primary-dark">
                Dokument som ska in (mall)
              </p>
              <ul className="mt-1 space-y-0.5">
                {forvantadeDokument.map((guide) => {
                  const finns = dokument.some((d) =>
                    d.filnamn.toLowerCase().includes(guide.toLowerCase().slice(0, 6)),
                  );
                  return (
                    <li
                      key={guide}
                      className={`text-xs ${finns ? "text-primary-dark" : "text-muted"}`}
                    >
                      {finns ? "✓ " : "○ "}
                      {guide}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {dokument.length > 0 ? (
            <ul className="mt-2 space-y-1.5">
              {dokument.map((doc) => (
                <li
                  key={doc.id}
                  className="rounded-lg border border-border px-2.5 py-1.5 text-sm text-foreground"
                >
                  {doc.filnamn}
                  <span className="ml-2 text-xs text-muted">
                    {doc.uppladdad}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-xs text-muted">Inga dokument ännu.</p>
          )}

          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              value={nyttNamn}
              onChange={(e) => setNyttNamn(e.target.value)}
              placeholder="Filnamn eller beskrivning"
              className="min-w-0 flex-1 rounded-lg border border-border px-2.5 py-1.5 text-sm"
            />
            <button
              type="button"
              onClick={läggTill}
              className="rounded-lg border border-primary px-3 py-1.5 text-xs font-medium text-primary-dark hover:bg-[#eef6f0]"
            >
              Lägg till
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function skapaSigneratEgenkontrollDokument(
  punkt: EgenkontrollPunkt,
  mappNamn: string,
): { id: string; filnamn: string; uppladdad: string } {
  const kort = punkt.text.slice(0, 40).replace(/\s+/g, " ");
  return {
    id: skapaLagenhetsDokumentId(),
    filnamn: `Egenkontroll (BankID) — ${kort}.pdf`,
    uppladdad: new Date().toLocaleDateString("sv-SE"),
  };
}
