"use client";

import { useMemo, useState } from "react";
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
import {
  arEntreprenadAvtalDokument,
  byggSignaturStatusText,
  normaliseraAvtalSignering,
} from "@/components/dokumentbank/forening-dokument-avtal";
import { oppnaTextSomPdf } from "@/components/forening/avtal-pdf";
import { standardPdfUndertecknareBlock } from "@/components/forening/pdf-undertecknare-block";
import { BankIdAvtalSignering } from "@/components/bankid/BankIdAvtalSignering";
import {
  laggTillBankIdSignatur,
  type BankIdSignatur,
} from "@/lib/bankid-signering";
import { lasForeningProfil } from "@/lib/forening-registry";

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
  const [meddelande, setMeddelande] = useState<string | null>(null);

  const signering = useMemo(
    () => normaliseraAvtalSignering(dokument),
    [dokument],
  );

  const profil = typeof window !== "undefined" ? lasForeningProfil() : null;
  const ledamoter = profil?.styrelseledamoter ?? [];

  function sparaBas() {
    onSpara({
      titel: titel.trim() || dokument.titel,
      status,
      notering,
      innehall,
      entreprenor,
    });
    setMeddelande("Sparat.");
  }

  function uppdateraEntreprenor(patch: Partial<DokumentEntreprenor>) {
    setEntreprenor((prev) => ({ ...prev, ...patch }));
  }

  function synkaForening() {
    const ny = synkroniseraForeningsfaltInnehall(innehall);
    setInnehall(ny);
    setMeddelande("Föreningsuppgifter hämtade från registret (entreprenör oförändrad).");
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

  function signeraEntreprenor(signatur: BankIdSignatur) {
    const result = laggTillBankIdSignatur(
      signering.entreprenorSignaturer,
      { ...signatur, part: "foretag" },
    );
    if (!result.ok) {
      setMeddelande(result.fel);
      return;
    }
    onSpara({
      entreprenorSignaturer: result.signaturer,
      status: "utkast",
    });
    setMeddelande("Entreprenörssignatur registrerad.");
  }

  function signeraForening(signatur: BankIdSignatur) {
    const result = laggTillBankIdSignatur(
      signering.foreningSignaturer,
      { ...signatur, part: "forening" },
    );
    if (!result.ok) {
      setMeddelande(result.fel);
      return;
    }
    const next = result.signaturer;
    const ent = signering.entreprenorSignaturer;
    const klar =
      ent.length >= 2 && next.length >= 2;
    onSpara({
      foreningSignaturer: next,
      status: klar ? "klar" : "utkast",
    });
    setMeddelande("Föreningssignatur registrerad.");
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
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <label className="text-xs font-medium text-muted">Avtalstext</label>
          <button
            type="button"
            onClick={synkaForening}
            className="rounded-lg border border-border px-2 py-1 text-xs font-medium text-primary-dark hover:bg-[#eef6f0]"
          >
            Uppdatera föreningsuppgifter från registret
          </button>
        </div>
        <textarea
          value={innehall}
          onChange={(e) => setInnehall(e.target.value)}
          rows={14}
          className="w-full rounded-lg border border-border bg-white px-3 py-2 font-mono text-xs leading-relaxed"
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
        <div className="rounded-xl border border-border bg-surface/80 p-4">
          <p className="text-sm font-semibold text-foreground">
            Signering med BankID
          </p>
          <p className="mt-1 text-xs text-muted">{byggSignaturStatusText(dokument)}</p>
          <div className="mt-4 space-y-4">
            <BankIdAvtalSignering
              part="foretag"
              partEtikett="entreprenören"
              signaturer={signering.entreprenorSignaturer}
              onSignera={async (s) => signeraEntreprenor(s)}
            />
            <BankIdAvtalSignering
              part="forening"
              partEtikett="föreningen"
              signaturer={signering.foreningSignaturer}
              disabled={!signering.entreprenorKlart}
              disabledOrsak="Entreprenören måste signera med två BankID först."
              ledamoter={ledamoter}
              onSignera={async (s) => signeraForening(s)}
            />
          </div>
        </div>
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
        {arAvtal && (
          <button
            type="button"
            onClick={() => {
              sparaBas();
              oppnaPdf();
            }}
            className="rounded-lg border border-primary px-3 py-1.5 text-xs font-medium text-primary-dark"
          >
            Spara och öppna PDF
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
