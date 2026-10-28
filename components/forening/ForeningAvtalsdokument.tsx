"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AVTAL_KPI_TEXT,
  AVTAL_LANGD_AR,
  AVTAL_UPPSAGNING_MANADER,
  PROVOPERIODE_DAGAR,
  byggAvtalsSektioner,
  byggAvtalsText,
  dagarKvarAvProvoperiod,
  formatAvtalsDatum,
  type AvtalsPart,
} from "@/lib/forening-avtal";
import { formateraBankIdSignatur, type BankIdSignatur } from "@/lib/bankid-signering";
import { SvenskAdressBlock } from "@/components/forening/SvenskAdressBlock";
import { oppnaTextSomPdf } from "@/components/forening/avtal-pdf";
import type { PdfUndertecknareBlockData } from "@/components/forening/pdf-undertecknare-block";
import { sparaKundavtal } from "@/components/foreningsinformation/kundavtal-lager";
import { LEVERANTOR } from "@/lib/leverantor";
import { ARSAVTAL_RABATT_PROCENT } from "@/lib/prislista";
import { KONTAKT_EPOST } from "@/lib/kontakt-epost";

type Props = {
  part: AvtalsPart;
  /** ISO när föreningen skapades — för prövoperiod. */
  skapadTidpunkt?: string;
  /** Redan signerat avtal. */
  signerat?: {
    namn: string;
    tidpunkt: string;
    signaturer?: BankIdSignatur[];
  } | null;
};

/**
 * Visuellt avtalsdokument — föreningens namn, villkor och KPI.
 */
export function ForeningAvtalsdokument({
  part,
  skapadTidpunkt,
  signerat,
}: Props) {
  const [sparatMeddelande, setSparatMeddelande] = useState<string | null>(null);
  const sektioner = byggAvtalsSektioner(part);
  const avtalText = byggAvtalsText(part, {
    statusrad: signerat?.tidpunkt
      ? `Status: signerat med BankID ${formatAvtalsDatum(signerat.tidpunkt)}.`
      : "Status: utkast — väntar på BankID-signering av två företrädare.",
  });
  const undertecknare = (part.foretradare ?? [])
    .filter((p) => p.namn.trim() || p.epost?.trim())
    .map((p) => ({ namn: p.namn, epost: p.epost?.trim() ?? "" }));

  function oppnaPdf() {
    const undertecknare: PdfUndertecknareBlockData = {
      forening: (part.foretradare ?? [])
        .filter((p) => p.namn.trim())
        .slice(0, 2)
        .map((p) => ({
          namn: p.namn.trim(),
          roll: p.roll?.trim() || "Styrelseledamot",
          epost: p.epost?.trim(),
        })),
      entreprenor: [
        { namn: "Styrelse-Navet", roll: "Leverantör", epost: "" },
        { namn: "", epost: "" },
      ],
      instruktion:
        "Avtalet signeras med BankID av två behöriga företrädare för föreningen. Personerna nedan ska underteckna enligt PDF:en.",
    };
    while (undertecknare.forening.length < 2) {
      undertecknare.forening.push({ namn: "", roll: "", epost: "" });
    }
    undertecknare.mejlForSignering =
      undertecknare.forening.find((p) => p.epost?.trim())?.epost ?? "";

    const ok = oppnaTextSomPdf(
      `Kundavtal ${part.foreningsNamn.trim() || "föreningen"}`,
      avtalText,
      { undertecknare },
    );
    if (!ok) {
      setSparatMeddelande(
        "Webbläsaren blockerade det nya fönstret. Tillåt popup och öppna avtalet igen.",
      );
    }
  }

  function sparaAvtalet() {
    sparaKundavtal({
      foreningsNamn: part.foreningsNamn,
      text: avtalText,
      status: signerat?.tidpunkt ? "signerat" : "utkast",
      undertecknare,
    });
    setSparatMeddelande(
      signerat?.tidpunkt
        ? "Det signerade avtalet ligger i Styrning och Dokument, under Styrelse Arkiv → Avtal."
        : "Avtalet är sparat som utkast i Styrning och Dokument, under Styrelse Arkiv → Avtal.",
    );
  }
  const dagarKvar =
    skapadTidpunkt && !signerat
      ? dagarKvarAvProvoperiod(skapadTidpunkt)
      : null;

  return (
    <article
      className="overflow-hidden rounded-2xl border border-[#c5d9cc] bg-gradient-to-b from-[#f7fbf8] to-white shadow-sm"
      aria-labelledby="avtalsdokument-rubrik"
    >
      <header className="border-b border-[#c5d9cc] bg-[#eef6f0] px-5 py-5 sm:px-7 sm:py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-dark">
          Kundavtal · Styrelse-Navet
        </p>
        <h3
          id="avtalsdokument-rubrik"
          className="mt-2 font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
        >
          Avtal för {part.foreningsNamn}
        </h3>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Ett tydligt årsavtal för styrelser som vill ha struktur, översikt och
          beslutsstöd — med en gratis prövoperiod innan ni binder er.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-primary/20 bg-white/90 px-3 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-primary-dark">
              Prövoperiod
            </p>
            <p className="mt-1 text-lg font-bold text-foreground">
              {PROVOPERIODE_DAGAR} dagar
            </p>
            <p className="text-xs text-muted">Ingen uppsägningstid</p>
          </div>
          <div className="rounded-xl border border-primary/20 bg-white/90 px-3 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-primary-dark">
              Avtalstid
            </p>
            <p className="mt-1 text-lg font-bold text-foreground">
              {AVTAL_LANGD_AR} år
            </p>
            <p className="text-xs text-muted">Automatisk förlängning</p>
          </div>
          <div className="rounded-xl border border-primary/20 bg-white/90 px-3 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-primary-dark">
              Uppsägning
            </p>
            <p className="mt-1 text-lg font-bold text-foreground">
              {AVTAL_UPPSAGNING_MANADER} mån
            </p>
            <p className="text-xs text-muted">Efter tecknat årsavtal</p>
          </div>
        </div>

        {dagarKvar != null && (
          <p className="mt-4 rounded-lg border border-amber-200/80 bg-amber-50/90 px-3 py-2 text-sm text-amber-950">
            {dagarKvar > 0 ? (
              <>
                <strong>{dagarKvar} dagar</strong> kvar av prövoperioden. Tecknas
                inget avtal raderas {part.foreningsNamn} automatiskt.
              </>
            ) : (
              <>
                Prövoperioden har löpt ut. Tecknas inte avtal tas föreningen
                bort.
              </>
            )}
          </p>
        )}
      </header>

      <div className="space-y-5 px-5 py-5 sm:px-7 sm:py-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-white px-4 py-4 text-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-dark">
              Leverantör
            </p>
            <p className="mt-1 font-serif text-lg font-semibold text-foreground">
              {LEVERANTOR.namn}
            </p>
            <p className="mt-1 text-muted">
              Org.nr {LEVERANTOR.organisationsnummer}
            </p>
            <SvenskAdressBlock
              className="mt-3 text-sm leading-relaxed text-foreground"
              gata={LEVERANTOR.gatuadress}
              postnummer={LEVERANTOR.postnummer}
              ort={LEVERANTOR.ort}
            />
            <p className="mt-3 text-xs text-muted">
              Plattform: {LEVERANTOR.varumarke}
            </p>
            <p className="mt-1 text-xs text-muted">{KONTAKT_EPOST.info}</p>
          </div>
          <div className="rounded-xl border border-border bg-white px-4 py-4 text-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-dark">
              Kund
            </p>
            <p className="mt-1 font-serif text-lg font-semibold text-foreground">
              {part.foreningsNamn}
            </p>
            {part.organisationsnummer?.trim() ? (
              <p className="mt-1 text-muted">
                Org.nr {part.organisationsnummer.trim()}
              </p>
            ) : null}
            <SvenskAdressBlock
              className="mt-3 text-sm leading-relaxed text-foreground"
              gator={part.gatadresser}
              gata={part.postadress}
              postnummer={part.postnummer}
              ort={part.ort}
            />
            {part.epost?.trim() ? (
              <p className="mt-3 text-sm text-muted">{part.epost.trim()}</p>
            ) : null}
            {part.fakturaEpost?.trim() ? (
              <p className="mt-1 text-xs text-muted">
                Faktura: {part.fakturaEpost.trim()}
              </p>
            ) : null}
            <div className="mt-4 border-t border-border pt-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                Två personer som tecknar avtalet
              </p>
              <ul className="mt-2 space-y-2">
                {[0, 1].map((index) => {
                  const person = part.foretradare?.[index];
                  const saknas = !person?.namn?.trim();
                  return (
                    <li
                      key={index}
                      className={
                        saknas
                          ? "rounded-lg border border-amber-200 bg-amber-50 px-2 py-1.5"
                          : undefined
                      }
                    >
                      {saknas ? (
                        <p className="text-sm text-amber-950">
                          Person {index + 1} — en person saknas
                        </p>
                      ) : (
                        <>
                          <p className="font-medium text-foreground">
                            {person?.namn.trim()}
                          </p>
                          {person?.roll?.trim() ? (
                            <p className="text-xs text-muted">{person.roll.trim()}</p>
                          ) : null}
                          {person?.epost?.trim() ? (
                            <p className="text-xs text-muted">{person.epost.trim()}</p>
                          ) : null}
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

        {sektioner.map((s) => (
          <section key={s.rubrik}>
            <h4 className="text-sm font-bold text-foreground">{s.rubrik}</h4>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-muted">
              {s.punkter.map((p) => (
                <li key={p} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span className="whitespace-pre-line">{p}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <aside className="rounded-xl border border-primary/25 bg-[#eef6f0]/80 px-4 py-3 text-sm text-primary-dark">
          <p className="font-semibold">Pris &amp; KPI</p>
          <p className="mt-1 text-muted">
            Årsavtal ger {ARSAVTAL_RABATT_PROCENT}&nbsp;% rabatt mot
            månadsdebitering. {AVTAL_KPI_TEXT}
          </p>
        </aside>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={oppnaPdf}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Öppna avtalet som PDF
          </button>
          <button
            type="button"
            onClick={sparaAvtalet}
            className="rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary-dark hover:bg-[#eef6f0]"
          >
            Spara i Styrning och Dokument
          </button>
        </div>
        {sparatMeddelande ? (
          <p className="text-sm text-primary-dark" role="status">
            {sparatMeddelande}{" "}
            <Link
              href="/forening/foreningsinformation"
              className="font-medium underline"
            >
              Öppna biblioteket
            </Link>
          </p>
        ) : (
          <p className="text-xs text-muted">
            PDF:en öppnas i ett nytt fönster. Välj ”Spara som PDF” i
            utskriften. Samma text mejlas till undertecknarna och sparas under
            Styrelse Arkiv → Avtal.
          </p>
        )}

        {signerat?.tidpunkt ? (
          <div className="rounded-lg border border-primary/30 bg-white px-3 py-2 text-sm text-foreground">
            <p>
              Signerat med BankID av två företrädare den{" "}
              {formatAvtalsDatum(signerat.tidpunkt)}.
            </p>
            {signerat.signaturer && signerat.signaturer.length > 0 ? (
              <ul className="mt-2 space-y-1 text-muted">
                {signerat.signaturer.map((s) => (
                  <li key={s.personnummerNyckel}>
                    {formateraBankIdSignatur(s)}
                  </li>
                ))}
              </ul>
            ) : signerat.namn ? (
              <p className="mt-1 text-muted">{signerat.namn}</p>
            ) : null}
            <p className="mt-2 text-muted">
              Det signerade avtalet ligger i Styrning och Dokument, under
              Styrelse Arkiv → Avtal.
            </p>
          </div>
        ) : (
          <p className="text-xs text-muted">
            Avtalet blir bindande när två behöriga företrädare signerar med
            BankID — personnummer på den som ska signera anges i BankID.
          </p>
        )}
      </div>
    </article>
  );
}
