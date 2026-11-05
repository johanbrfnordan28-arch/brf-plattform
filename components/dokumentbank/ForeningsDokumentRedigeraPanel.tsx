"use client";

import { useState } from "react";
import {
  DOKUMENT_STATUS_ETIKETTER,
  tomDokumentEntreprenor,
  type DokumentEntreprenor,
  type DokumentStatus,
  type ForeningsDokument,
} from "@/components/dokumentbank/forening-dokumenter-lager";
import {
  hamtaForeningsDokumentInnehall,
  skapaInnehallFranMall,
  synkroniseraForeningsfaltInnehall,
} from "@/components/dokumentbank/forening-dokument-innehall";
import { hamtaMall } from "@/components/dokumentbank/mallar";
import { arEntreprenadAvtalDokument } from "@/components/dokumentbank/forening-dokument-avtal";
import {
  DOKUMENT_LAYOUT_ETIKETTER,
  STANDARD_DOKUMENT_LAYOUT,
  type DokumentLayoutTema,
} from "@/components/dokumentbank/dokument-layout";
import { oppnaForeningsDokumentPreview } from "@/components/dokumentbank/forening-dokument-visning";
import { oppnaTextSomPdf } from "@/components/forening/avtal-pdf";
import { standardPdfUndertecknareBlock } from "@/components/forening/pdf-undertecknare-block";
import { ForeningsDokumentAvtalSignering } from "@/components/dokumentbank/ForeningsDokumentAvtalSignering";
import { DokumentRedigerareMedPreview } from "@/components/dokumentbank/DokumentRedigerareMedPreview";
import { arEgenkontrollDokument } from "@/components/dokumentbank/forening-dokument-egenkontroll";
import { ForeningsDokumentEgenkontrollPanel } from "@/components/dokumentbank/ForeningsDokumentEgenkontrollPanel";

type Props = {
  dokument: ForeningsDokument;
  onSpara: (patch: Partial<ForeningsDokument>) => void;
  onStang: () => void;
};

export function ForeningsDokumentRedigeraPanel({
  dokument,
  onSpara,
  onStang,
}: Props) {
  if (arEgenkontrollDokument(dokument)) {
    return (
      <ForeningsDokumentEgenkontrollPanel
        dokument={dokument}
        onSpara={onSpara}
        onStang={onStang}
      />
    );
  }

  const arAvtal = arEntreprenadAvtalDokument(dokument);
  const [titel, setTitel] = useState(dokument.titel);
  const [status, setStatus] = useState<DokumentStatus>(dokument.status);
  const [notering, setNotering] = useState(dokument.notering);
  const [innehall, setInnehall] = useState(() => {
    if (dokument.innehall?.trim()) return dokument.innehall;
    const mall = hamtaMall(dokument.mallId);
    return mall ? skapaInnehallFranMall(mall, dokument.titel) : "";
  });
  const [entreprenor, setEntreprenor] = useState<DokumentEntreprenor>(
    dokument.entreprenor ?? tomDokumentEntreprenor(),
  );
  const [layoutTema, setLayoutTema] = useState<DokumentLayoutTema>(
    dokument.layoutTema ?? STANDARD_DOKUMENT_LAYOUT,
  );
  const [meddelande, setMeddelande] = useState<string | null>(null);

  function sparaBas() {
    onSpara({
      titel: titel.trim() || dokument.titel,
      status,
      notering,
      innehall,
      entreprenor,
      layoutTema,
    });
    setMeddelande("Sparat.");
  }

  function uppdateraEntreprenor(patch: Partial<DokumentEntreprenor>) {
    setEntreprenor((prev) => ({ ...prev, ...patch }));
  }

  function oppnaPdf() {
    const text = hamtaForeningsDokumentInnehall({
      ...dokument,
      titel,
      innehall,
      entreprenor,
    });
    const entreprenorPdf = [
      { namn: entreprenor.namn, epost: entreprenor.epost, roll: "Entreprenör" },
      { namn: entreprenor.kontakt, epost: "", roll: "Entreprenör" },
    ];
    const ok = oppnaTextSomPdf(titel, text, {
      undertecknare: standardPdfUndertecknareBlock(entreprenorPdf),
    });
    if (!ok) {
      setMeddelande("Tillåt popup för PDF.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs font-medium text-muted">
          Dokumentnamn
          <input
            type="text"
            value={titel}
            onChange={(e) => setTitel(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-xs font-medium text-muted">
          Status
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as DokumentStatus)}
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
          >
            {(Object.keys(DOKUMENT_STATUS_ETIKETTER) as DokumentStatus[]).map(
              (s) => (
                <option key={s} value={s}>
                  {DOKUMENT_STATUS_ETIKETTER[s]}
                </option>
              ),
            )}
          </select>
        </label>
      </div>

      {arAvtal && (
        <div className="rounded-lg border border-primary/25 bg-[#eef6f0]/60 p-3">
          <p className="text-xs font-semibold text-primary-dark">
            Entreprenör / konsult (per projekt)
          </p>
          <p className="mt-1 text-xs text-muted">
            Föreningens namn ligger i avtalstexten och kan uppdateras från
            registret. Entreprenören ändras här utan att påverka föreningen.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <label className="text-xs text-muted">
              Företagsnamn
              <input
                value={entreprenor.namn}
                onChange={(e) => uppdateraEntreprenor({ namn: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border px-2 py-1.5 text-sm"
              />
            </label>
            <label className="text-xs text-muted">
              Org.nr
              <input
                value={entreprenor.orgNr}
                onChange={(e) => uppdateraEntreprenor({ orgNr: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border px-2 py-1.5 text-sm"
              />
            </label>
            <label className="text-xs text-muted">
              Kontaktperson
              <input
                value={entreprenor.kontakt}
                onChange={(e) =>
                  uppdateraEntreprenor({ kontakt: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-border px-2 py-1.5 text-sm"
              />
            </label>
            <label className="text-xs text-muted">
              E-post
              <input
                value={entreprenor.epost}
                onChange={(e) => uppdateraEntreprenor({ epost: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border px-2 py-1.5 text-sm"
              />
            </label>
          </div>
          {dokument.avtalForm && (
            <p className="mt-2 text-xs text-muted">
              Avtalsform: {dokument.avtalForm}
            </p>
          )}
        </div>
      )}

      <div>
        <p className="mb-2 text-xs font-medium text-muted">
          Layout vid förhandsgranskning / PDF — alla varianter har Styrelse-Navet,
          ram och sidnummer. Tom rad mellan stycken ger bättre PDF.
        </p>
        <div className="mb-3 flex flex-wrap gap-2">
          {(Object.keys(DOKUMENT_LAYOUT_ETIKETTER) as DokumentLayoutTema[]).map(
            (key) => (
              <button
                key={key}
                type="button"
                onClick={() => setLayoutTema(key)}
                className={`rounded-lg border px-2.5 py-1 text-xs font-medium ${
                  layoutTema === key
                    ? "border-primary bg-[#e2f0e6] text-primary-dark"
                    : "border-border text-muted"
                }`}
              >
                {DOKUMENT_LAYOUT_ETIKETTER[key].titel}
              </button>
            ),
          )}
        </div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <label className="text-xs font-medium text-muted">Dokumenttext</label>
          <button
            type="button"
            onClick={() => {
              const ny = synkroniseraForeningsfaltInnehall(innehall);
              setInnehall(ny);
              setMeddelande(
                "Föreningsuppgifter hämtade från registret (entreprenör oförändrad).",
              );
            }}
            className="rounded-lg border border-border px-2 py-1 text-xs font-medium text-primary-dark hover:bg-[#eef6f0]"
          >
            Uppdatera föreningsuppgifter från registret
          </button>
        </div>
        <DokumentRedigerareMedPreview
          key={dokument.id}
          titel={titel.trim() || dokument.titel}
          meta={dokument.mallTitel}
          innehall={innehall}
          tema={layoutTema}
          onChange={setInnehall}
        />
      </div>

      <label className="block text-xs font-medium text-muted">
        Notering
        <input
          value={notering}
          onChange={(e) => setNotering(e.target.value)}
          className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
        />
      </label>

      {arAvtal && (
        <ForeningsDokumentAvtalSignering dokument={dokument} onSpara={onSpara} />
      )}

      {meddelande && (
        <p className="text-xs text-primary-dark" role="status">
          {meddelande}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            sparaBas();
          }}
          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-dark"
        >
          Spara
        </button>
        <button
          type="button"
          onClick={() => {
            sparaBas();
            oppnaForeningsDokumentPreview({
              ...dokument,
              titel,
              innehall,
              entreprenor,
              layoutTema,
            });
          }}
          className="rounded-lg border border-primary px-3 py-1.5 text-xs font-medium text-primary-dark"
        >
          Förhandsgranska
        </button>
        {arAvtal && (
          <button
            type="button"
            onClick={() => {
              sparaBas();
              oppnaPdf();
            }}
            className="rounded-lg border border-primary px-3 py-1.5 text-xs font-medium text-primary-dark"
          >
            Spara och öppna PDF (signering)
          </button>
        )}
        <button
          type="button"
          onClick={onStang}
          className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted"
        >
          Stäng
        </button>
      </div>
    </div>
  );
}
