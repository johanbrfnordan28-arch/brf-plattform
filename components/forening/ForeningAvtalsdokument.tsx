"use client";

import {
  AVTAL_KPI_TEXT,
  AVTAL_LANGD_AR,
  AVTAL_UPPSAGNING_MANADER,
  PROVOPERIODE_DAGAR,
  byggAvtalsSektioner,
  dagarKvarAvProvoperiod,
  formatAvtalsDatum,
  type AvtalsPart,
} from "@/lib/forening-avtal";
import { formateraBankIdSignatur, type BankIdSignatur } from "@/lib/bankid-signering";
import { AvtalsForetradareLista } from "@/components/forening/AvtalsForetradareLista";
import { SvenskAdressBlock } from "@/components/forening/SvenskAdressBlock";
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
  const sektioner = byggAvtalsSektioner(part);
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
            {(part.foretradare?.some((p) => p.namn.trim()) ?? false) ? (
              <div className="mt-4 border-t border-border pt-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                  Företrädare som tecknar / beställer
                </p>
                <div className="mt-2">
                  <AvtalsForetradareLista personer={part.foretradare ?? []} />
                </div>
              </div>
            ) : null}
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
