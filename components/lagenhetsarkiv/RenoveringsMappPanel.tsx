"use client";

import { useState } from "react";
import {
  arStartbesiktningPunkt,
  forvantadeDokumentForMall,
  hamtaRenoveringsMall,
  renoveringsMallar,
  renoveringsUndermappTyper,
  undermappTyperForMall,
  type RenoveringsMallId,
  type RenoveringsUndermappTyp,
} from "@/components/lagenhetsarkiv/renoverings-mallar";
import {
  antalDokumentRenoveringsMapp,
  mappDelEtikett,
  mappHarDel,
  saknadeMappDelar,
  skapaLagenhetsDokumentId,
  type EgenkontrollPunkt,
  type LagenhetsDokument,
  type RenoveringsMapp,
  type RenoveringsMappDel,
} from "@/components/lagenhetsarkiv/lagenhetsarkiv";
import { OppnaStangKnapp } from "@/components/OppnaStangKnapp";
import { MedlemsKravPanel } from "@/components/lagenhetsarkiv/MedlemsKravPanel";
import type { MedlemsKravState } from "@/components/lagenhetsarkiv/medlems-krav";

type EgenkontrollListaProps = {
  mapp: RenoveringsMapp;
  onSignera: (punktId: string) => void;
  onLaddaUpSkadebild: (punktId: string, filnamn: string) => void;
};

function EgenkontrollLista({
  mapp,
  onSignera,
  onLaddaUpSkadebild,
}: EgenkontrollListaProps) {
  const signerade = mapp.egenkontroller.filter((p) => p.signerad).length;
  const totalt = mapp.egenkontroller.length;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-xs leading-relaxed text-muted">
          Signera varje punkt med BankID. Vid startbesiktning ska befintliga
          skador fotograferas och laddas upp innan signering — för skador som
          inte dokumenterats ansvarar entreprenören.
        </p>
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
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function MappDelSektion({
  etikett,
  sammanfattning,
  onTaBort,
  defaultOppen = false,
  children,
}: {
  etikett: string;
  sammanfattning?: string;
  onTaBort: () => void;
  defaultOppen?: boolean;
  children: React.ReactNode;
}) {
  const [oppen, setOppen] = useState(defaultOppen);

  return (
    <div className="rounded-xl border border-border bg-white">
      <div className="flex flex-wrap items-center gap-2 px-3 py-2.5">
        <div className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-foreground">{etikett}</span>
          {sammanfattning && (
            <span className="block truncate text-xs text-muted">{sammanfattning}</span>
          )}
        </div>
        <OppnaStangKnapp
          oppen={oppen}
          onClick={() => setOppen((v) => !v)}
          storlek="sm"
          ariaLabel={oppen ? `Stäng ${etikett.toLowerCase()}` : `Öppna ${etikett.toLowerCase()}`}
        />
        <button
          type="button"
          onClick={onTaBort}
          className="shrink-0 text-xs text-muted hover:text-red-800"
          title={`Ta bort ${etikett.toLowerCase()}`}
        >
          Ta bort
        </button>
      </div>
      {oppen && (
        <div className="border-t border-border px-3 pb-3 pt-2">{children}</div>
      )}
    </div>
  );
}

function HandlingarDel({
  forvantadeHandlingar,
  dokument,
  onUppdateraForvantade,
  onLäggTillDokument,
  onTaBortDokument,
}: {
  forvantadeHandlingar: string[];
  dokument: LagenhetsDokument[];
  onUppdateraForvantade: (handlingar: string[]) => void;
  onLäggTillDokument: (filnamn: string) => void;
  onTaBortDokument: (docId: string) => void;
}) {
  const [nyHandling, setNyHandling] = useState("");
  const [nyttDokument, setNyttDokument] = useState("");

  function läggTillHandling() {
    const text = nyHandling.trim();
    if (!text) return;
    if (
      forvantadeHandlingar.some(
        (h) => h.toLowerCase() === text.toLowerCase(),
      )
    ) {
      setNyHandling("");
      return;
    }
    onUppdateraForvantade([...forvantadeHandlingar, text]);
    setNyHandling("");
  }

  function taBortHandling(index: number) {
    onUppdateraForvantade(
      forvantadeHandlingar.filter((_, i) => i !== index),
    );
  }

  function läggTillDokument() {
    const namn = nyttDokument.trim();
    if (!namn) return;
    onLäggTillDokument(namn);
    setNyttDokument("");
  }

  const uppladdade = forvantadeHandlingar.filter((guide) =>
    dokument.some((d) =>
      d.filnamn.toLowerCase().includes(guide.toLowerCase().slice(0, 6)),
    ),
  ).length;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-medium text-primary-dark">
          Handlingar som ska in
        </p>
        <p className="mt-0.5 text-xs text-muted">
          Lägg till eller ta bort handlingar efter projektets behov.
        </p>
        {forvantadeHandlingar.length > 0 ? (
          <ul className="mt-2 space-y-1">
            {forvantadeHandlingar.map((handling, index) => {
              const finns = dokument.some((d) =>
                d.filnamn
                  .toLowerCase()
                  .includes(handling.toLowerCase().slice(0, 6)),
              );
              return (
                <li
                  key={`${handling}-${index}`}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border bg-[#fafcfa] px-2.5 py-1.5"
                >
                  <span
                    className={`text-xs ${finns ? "text-primary-dark" : "text-foreground"}`}
                  >
                    {finns ? "✓ " : "○ "}
                    {handling}
                  </span>
                  <button
                    type="button"
                    onClick={() => taBortHandling(index)}
                    className="shrink-0 text-xs text-muted hover:text-red-800"
                  >
                    Ta bort
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-2 text-xs text-muted">
            Inga handlingar angivna ännu — lägg till nedan.
          </p>
        )}
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            value={nyHandling}
            onChange={(e) => setNyHandling(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                läggTillHandling();
              }
            }}
            placeholder="Ny handling, t.ex. Entreprenörsavtal"
            className="min-w-0 flex-1 rounded-lg border border-border px-2.5 py-1.5 text-sm"
          />
          <button
            type="button"
            onClick={läggTillHandling}
            className="rounded-lg border border-primary px-3 py-1.5 text-xs font-medium text-primary-dark hover:bg-[#eef6f0]"
          >
            Lägg till handling
          </button>
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-foreground">
          Uppladdade dokument ({dokument.length}
          {forvantadeHandlingar.length > 0 &&
            ` · ${uppladdade} av ${forvantadeHandlingar.length} hanterade`}
          )
        </p>
        {dokument.length > 0 ? (
          <ul className="mt-2 space-y-1.5">
            {dokument.map((doc) => (
              <li
                key={doc.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-border px-2.5 py-1.5 text-sm"
              >
                <span className="min-w-0 text-foreground">
                  {doc.filnamn}
                  <span className="ml-2 text-xs text-muted">{doc.uppladdad}</span>
                </span>
                <button
                  type="button"
                  onClick={() => onTaBortDokument(doc.id)}
                  className="shrink-0 text-xs text-muted hover:text-red-800"
                >
                  Ta bort
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-xs text-muted">Inga dokument uppladdade ännu.</p>
        )}
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            value={nyttDokument}
            onChange={(e) => setNyttDokument(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                läggTillDokument();
              }
            }}
            placeholder="Filnamn eller beskrivning"
            className="min-w-0 flex-1 rounded-lg border border-border px-2.5 py-1.5 text-sm"
          />
          <button
            type="button"
            onClick={läggTillDokument}
            className="rounded-lg border border-primary px-3 py-1.5 text-xs font-medium text-primary-dark hover:bg-[#eef6f0]"
          >
            Lägg till dokument
          </button>
        </div>
      </div>
    </div>
  );
}

function UndermappInnehall({
  typ,
  beskrivning,
  forvantadeDokument,
  dokument,
  onLäggTillDokument,
  onTaBortDokument,
}: {
  typ: RenoveringsUndermappTyp;
  beskrivning: string;
  forvantadeDokument: string[];
  dokument: LagenhetsDokument[];
  onLäggTillDokument: (filnamn: string) => void;
  onTaBortDokument: (docId: string) => void;
}) {
  const [nyttNamn, setNyttNamn] = useState("");

  function läggTill() {
    const namn = nyttNamn.trim();
    if (!namn) return;
    onLäggTillDokument(namn);
    setNyttNamn("");
  }

  return (
    <div>
      <p className="text-xs text-muted">{beskrivning}</p>

      {forvantadeDokument.length > 0 && (
        <div className="mt-2 rounded-lg bg-[#fafcfa] px-2.5 py-2">
          <p className="text-xs font-medium text-primary-dark">
            Exempel enligt mall
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
              className="flex items-center justify-between gap-2 rounded-lg border border-border px-2.5 py-1.5 text-sm"
            >
              <span className="min-w-0 text-foreground">
                {doc.filnamn}
                <span className="ml-2 text-xs text-muted">{doc.uppladdad}</span>
              </span>
              <button
                type="button"
                onClick={() => onTaBortDokument(doc.id)}
                className="shrink-0 text-xs text-muted hover:text-red-800"
              >
                Ta bort
              </button>
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
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              läggTill();
            }
          }}
          placeholder="Filnamn eller beskrivning"
          className="min-w-0 flex-1 rounded-lg border border-border px-2.5 py-1.5 text-sm"
        />
        <button
          type="button"
          onClick={läggTill}
          className="rounded-lg border border-primary px-3 py-1.5 text-xs font-medium text-primary-dark hover:bg-[#eef6f0]"
        >
          Lägg till dokument
        </button>
      </div>
    </div>
  );
}

type RenoveringsMappPanelProps = {
  mapp: RenoveringsMapp;
  apartmentId: number;
  lagenhetsnummer: string;
  onTaBort: () => void;
  onBytTyp: (mallId: RenoveringsMallId) => void;
  onLäggTillDel: (del: RenoveringsMappDel) => void;
  onTaBortDel: (del: RenoveringsMappDel) => void;
  onUppdateraForvantadeHandlingar: (handlingar: string[]) => void;
  onUppdateraMedlemsKrav: (krav: MedlemsKravState) => void;
  onLäggTillDokument: (undermappId: string, filnamn: string) => void;
  onTaBortDokument: (undermappId: string, docId: string) => void;
  onSigneraEgenkontroll: (punktId: string) => void;
  onLaddaUpSkadebild: (punktId: string, filnamn: string) => void;
};

export function RenoveringsMappPanel({
  mapp,
  apartmentId,
  lagenhetsnummer,
  onTaBort,
  onBytTyp,
  onLäggTillDel,
  onTaBortDel,
  onUppdateraForvantadeHandlingar,
  onUppdateraMedlemsKrav,
  onLäggTillDokument,
  onTaBortDokument,
  onSigneraEgenkontroll,
  onLaddaUpSkadebild,
}: RenoveringsMappPanelProps) {
  const [oppen, setOppen] = useState(false);
  const [bekraftarBorttagning, setBekraftarBorttagning] = useState(false);
  const mall = hamtaRenoveringsMall(mapp.mallId ?? "ovrigt");
  const forvantade = forvantadeDokumentForMall(mall);
  const totaltDokument = antalDokumentRenoveringsMapp(mapp);
  const saknade = saknadeMappDelar(mapp);
  const harIngetInnehall =
    mapp.egenkontroller.length === 0 && mapp.undermappar.length === 0;

  const forvantadeHandlingar =
    mapp.forvantadeHandlingar ?? forvantade.handlingar ?? [];

  const sorteradeUndermappar = [...mapp.undermappar].sort((a, b) => {
    const ordning = undermappTyperForMall(mall);
    return ordning.indexOf(a.typ) - ordning.indexOf(b.typ);
  });

  function vaxlaOppen() {
    setOppen((v) => {
      if (v) setBekraftarBorttagning(false);
      return !v;
    });
  }

  function hanteraTaBortMapp() {
    onTaBort();
    setBekraftarBorttagning(false);
    setOppen(false);
  }

  return (
    <article className="rounded-2xl border border-border bg-background">
      <div className="flex flex-wrap items-start justify-between gap-3 p-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-semibold text-foreground">{mapp.name}</h4>
            <span className="rounded-full bg-muted/10 px-2 py-0.5 text-xs font-medium text-muted">
              {mall.etikett}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted">
            {totaltDokument} dokument uppladdade
            {!harIngetInnehall &&
              ` · ${mapp.egenkontroller.length > 0 ? "egenkontroller" : ""}${
                mapp.undermappar.length > 0
                  ? `${mapp.egenkontroller.length > 0 ? ", " : ""}${mapp.undermappar.length} del${mapp.undermappar.length > 1 ? "ar" : ""}`
                  : ""
              }`}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <OppnaStangKnapp
            oppen={oppen}
            onClick={vaxlaOppen}
            ariaLabel={
              oppen ? `Stäng mappen ${mapp.name}` : `Öppna mappen ${mapp.name}`
            }
          />
        </div>
      </div>

      {oppen && (
        <div className="space-y-4 border-t border-border px-4 pb-4 pt-4">
          <label className="block text-xs">
            <span className="font-medium text-muted">Typ av renovering</span>
            <select
              value={mapp.mallId ?? "ovrigt"}
              onChange={(e) => onBytTyp(e.target.value as RenoveringsMallId)}
              className="mt-1 w-full max-w-xs rounded-lg border border-border bg-white px-2.5 py-1.5 text-sm text-foreground"
            >
              {renoveringsMallar.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.etikett}
                </option>
              ))}
            </select>
          </label>

          <MedlemsKravPanel
            medlemsKrav={mapp.medlemsKrav}
            mallId={mapp.mallId ?? "ovrigt"}
            mappNamn={mapp.name}
            mappId={mapp.id}
            apartmentId={apartmentId}
            lagenhetsnummer={lagenhetsnummer}
            mallEtikett={mall.etikett}
            onUppdatera={onUppdateraMedlemsKrav}
          />

      {saknade.length > 0 && (
        <div className="mt-4 rounded-lg border border-dashed border-primary/30 bg-[#fafcfa] p-3">
          <p className="text-xs font-medium text-primary-dark">Lägg till del</p>
          <p className="mt-0.5 text-xs text-muted">
            Välj vilka delar som ska ingå i projektet — t.ex. handlingar,
            egenkontroller eller ritning.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {saknade.map((del) => (
              <button
                key={del}
                type="button"
                onClick={() => onLäggTillDel(del)}
                className="rounded-lg border border-primary bg-white px-3 py-1.5 text-sm font-medium text-primary-dark hover:bg-[#eef6f0]"
              >
                + {mappDelEtikett(del)}
              </button>
            ))}
          </div>
        </div>
      )}

      {harIngetInnehall && (
        <p className="mt-4 rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted">
          Mappen är tom. Lägg till delar ovan när projektet tar form.
        </p>
      )}

      <div className="mt-4 space-y-2">
        {mappHarDel(mapp, "egenkontroller") && (
          <MappDelSektion
            etikett="Egenkontroller"
            sammanfattning={`${mapp.egenkontroller.filter((p) => p.signerad).length} av ${mapp.egenkontroller.length} signerade`}
            onTaBort={() => onTaBortDel("egenkontroller")}
          >
            <EgenkontrollLista
              mapp={mapp}
              onSignera={onSigneraEgenkontroll}
              onLaddaUpSkadebild={onLaddaUpSkadebild}
            />
          </MappDelSektion>
        )}

        {sorteradeUndermappar.map((undermapp) => {
          const def = renoveringsUndermappTyper.find(
            (d) => d.typ === undermapp.typ,
          );
          const etikett = def?.etikett ?? undermapp.typ;

          if (undermapp.typ === "handlingar") {
            return (
              <MappDelSektion
                key={undermapp.id}
                etikett={etikett}
                sammanfattning={`${forvantadeHandlingar.length} handlingar · ${undermapp.dokument.length} dokument`}
                onTaBort={() => onTaBortDel("handlingar")}
              >
                <HandlingarDel
                  forvantadeHandlingar={forvantadeHandlingar}
                  dokument={undermapp.dokument}
                  onUppdateraForvantade={onUppdateraForvantadeHandlingar}
                  onLäggTillDokument={(filnamn) =>
                    onLäggTillDokument(undermapp.id, filnamn)
                  }
                  onTaBortDokument={(docId) =>
                    onTaBortDokument(undermapp.id, docId)
                  }
                />
              </MappDelSektion>
            );
          }

          const guider = forvantade[undermapp.typ] ?? [];
          return (
            <MappDelSektion
              key={undermapp.id}
              etikett={etikett}
              sammanfattning={`${undermapp.dokument.length} dokument`}
              onTaBort={() => onTaBortDel(undermapp.typ)}
            >
              <UndermappInnehall
                typ={undermapp.typ}
                beskrivning={def?.beskrivning ?? ""}
                forvantadeDokument={guider}
                dokument={undermapp.dokument}
                onLäggTillDokument={(filnamn) =>
                  onLäggTillDokument(undermapp.id, filnamn)
                }
                onTaBortDokument={(docId) =>
                  onTaBortDokument(undermapp.id, docId)
                }
              />
            </MappDelSektion>
          );
        })}
      </div>

          <div className="mt-6 border-t border-border pt-4">
            {bekraftarBorttagning ? (
              <div
                className="rounded-lg border border-red-200 bg-red-50/60 p-4"
                role="alertdialog"
                aria-labelledby={`bekrafta-borttagning-mapp-${mapp.id}`}
              >
                <p
                  id={`bekrafta-borttagning-mapp-${mapp.id}`}
                  className="text-sm font-semibold text-foreground"
                >
                  Bekräfta borttagning av renoveringsmapp
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  Renoveringsmappen «{mapp.name}» och all tillhörande
                  dokumentation raderas permanent. Åtgärden kan inte ångras.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setBekraftarBorttagning(false)}
                    className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/5"
                  >
                    Avbryt
                  </button>
                  <button
                    type="button"
                    onClick={hanteraTaBortMapp}
                    className="rounded-lg bg-red-800 px-4 py-2 text-sm font-medium text-white hover:bg-red-900"
                  >
                    Ja, ta bort mappen
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setBekraftarBorttagning(true)}
                className="text-sm font-medium text-red-800 hover:text-red-900"
              >
                Ta bort renoveringsmapp…
              </button>
            )}
          </div>
        </div>
      )}
    </article>
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
