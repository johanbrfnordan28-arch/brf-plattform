"use client";

/**
 * PlanDelSektion / GrunduppgifterDelSektion — mönster för underhållsplanen:
 * - När ett wizard-steg öppnas ska delavsnitt vara ihopfällda (grön knapp).
 * - När en del öppnas visas allt hängande innehåll i delen — inga extra fällbara
 *   fält inuti (steg 1: planinställningar + kostnadspanel t.ex. visas tillsammans).
 * - Delspara-knapp finns bara i steg 1 där onSparaDel anges.
 */

import { useState } from "react";
import { OppnaStangKnapp } from "@/components/OppnaStangKnapp";

type Props = {
  stegLabel?: string;
  titel: string;
  intro?: string;
  sparadVid?: string;
  onSparaDel?: () => void;
  defaultOpen?: boolean;
  children: React.ReactNode;
};

export function PlanDelSektion({
  stegLabel,
  titel,
  intro,
  sparadVid,
  onSparaDel,
  defaultOpen = false,
  children,
}: Props) {
  const [oppen, setOppen] = useState(defaultOpen);
  const visaDelSpara = Boolean(onSparaDel);

  return (
    <section className="rounded-xl border border-border bg-white shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/80 px-4 py-3 sm:px-5">
        <div className="min-w-0 flex-1">
          {stegLabel ? (
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">
              {stegLabel}
            </p>
          ) : null}
          <h3
            className={`${stegLabel ? "mt-0.5" : ""} text-base font-semibold text-foreground`}
          >
            {titel}
          </h3>
          {intro && (
            <p className="mt-1 text-sm leading-relaxed text-muted">{intro}</p>
          )}
          {sparadVid && (
            <p className="mt-2 text-xs font-medium text-primary-dark">
              Del sparad {sparadVid}
            </p>
          )}
        </div>
        <OppnaStangKnapp
          oppen={oppen}
          onClick={() => setOppen((v) => !v)}
          ariaLabel={oppen ? `Fäll ihop ${titel}` : `Visa ${titel}`}
        />
      </div>
      {oppen && (
        <div className="space-y-4 px-4 py-4 sm:px-5 sm:py-5">
          {children}
          {visaDelSpara && onSparaDel && (
            <div className="flex flex-wrap items-center gap-3 border-t border-border/60 pt-4">
              <button
                type="button"
                onClick={onSparaDel}
                className="rounded-lg border border-primary bg-white px-4 py-2 text-sm font-medium text-primary-dark hover:bg-[#eef6f0]"
              >
                Spara denna del
              </button>
              <p className="text-xs text-muted">
                Sparar till planen utan att stänga steg 1. Nästa del kan fyllas i direkt.
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

/** @deprecated Använd PlanDelSektion — behålls för befintliga importer. */
export const GrunduppgifterDelSektion = PlanDelSektion;
