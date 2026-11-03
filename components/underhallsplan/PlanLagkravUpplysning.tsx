"use client";

import { useEffect, useId, useState } from "react";
import {
  PLAN_LAGKRAV_AVSATTNING,
  PLAN_LAGKRAV_K3,
  PLAN_LAGKRAV_KALLOR,
  PLAN_LAGKRAV_KNAPP_OPPNA,
  PLAN_LAGKRAV_KNAPP_STANG,
  PLAN_LAGKRAV_MODUL_ANKAR_ID,
  PLAN_LAGKRAV_STYRELSE_INGANG,
  PLAN_LAGKRAV_STYRELSE_RUBRIK,
  PLAN_LAGKRAV_TEKNISK_PLAN,
} from "@/components/underhallsplan/plan-lagkrav";

type PlanLagkravUpplysningProps = {
  className?: string;
};

/**
 * Informationsruta på modulnivå (ej wizard-steg). Styrelsen öppnar den vid behov.
 */
export function PlanLagkravUpplysning({ className = "" }: PlanLagkravUpplysningProps) {
  const panelId = useId();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hash = `#${PLAN_LAGKRAV_MODUL_ANKAR_ID}`;
    const syncFromHash = () => {
      if (window.location.hash === hash) {
        setOpen(true);
      }
    };
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  return (
    <section
      id={PLAN_LAGKRAV_MODUL_ANKAR_ID}
      className={`scroll-mt-24 rounded-2xl border border-primary/35 bg-gradient-to-b from-[#eef6f0] to-white px-4 py-4 shadow-sm sm:px-5 sm:py-5 ${className}`}
      aria-labelledby={panelId}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary-dark">
            Modulinformation — inte ett steg i planen
          </p>
          <h2
            id={panelId}
            className="mt-1 text-lg font-semibold text-foreground"
          >
            {PLAN_LAGKRAV_STYRELSE_RUBRIK}
          </h2>
          {!open && (
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {PLAN_LAGKRAV_STYRELSE_INGANG}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            setOpen((wasOpen) => {
              const next = !wasOpen;
              if (
                !next &&
                typeof window !== "undefined" &&
                window.location.hash === `#${PLAN_LAGKRAV_MODUL_ANKAR_ID}`
              ) {
                const url =
                  window.location.pathname + window.location.search;
                window.history.replaceState(null, "", url);
              }
              return next;
            });
          }}
          aria-expanded={open}
          aria-controls={`${panelId}-innehall`}
          className="shrink-0 rounded-lg border border-primary bg-primary px-3 py-2.5 text-left text-sm font-medium text-white hover:bg-primary-dark sm:max-w-xs sm:text-center"
        >
          {open ? PLAN_LAGKRAV_KNAPP_STANG : PLAN_LAGKRAV_KNAPP_OPPNA}
        </button>
      </div>

      {open && (
        <div id={`${panelId}-innehall`} className="mt-4 text-sm">
          <p className="text-xs leading-relaxed text-muted">
            Förenklad vägledning utifrån gällande regler. Kontrollera alltid mot
            stadgar, ekonomisk plan och er rådgivare — detta ersätter inte
            juridisk rådgivning.
          </p>

          <div className="mt-4 space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">
                Teknisk underhållsplan
              </p>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 leading-relaxed text-muted">
                {PLAN_LAGKRAV_TEKNISK_PLAN.map((rad) => (
                  <li key={rad.slice(0, 56)}>{rad}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">
                Avsättning och budget
              </p>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 leading-relaxed text-muted">
                {PLAN_LAGKRAV_AVSATTNING.map((rad) => (
                  <li key={rad.slice(0, 56)}>{rad}</li>
                ))}
              </ul>
            </div>
            <p className="leading-relaxed text-muted">{PLAN_LAGKRAV_K3}</p>
          </div>

          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">
              Officiella källor och länkar
            </p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {PLAN_LAGKRAV_KALLOR.map((k) => (
                <li key={k.url}>
                  <a
                    href={k.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-full flex-col rounded-xl border border-border bg-white px-3 py-2.5 transition-colors hover:border-primary/40 hover:bg-[#fafdfb]"
                  >
                    <span className="font-medium text-primary-dark">
                      {k.etikett}
                      <span className="ml-1 text-xs font-normal text-muted">
                        (öppnas i ny flik)
                      </span>
                    </span>
                    {k.beskrivning ? (
                      <span className="mt-1 text-xs leading-snug text-muted">
                        {k.beskrivning}
                      </span>
                    ) : null}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
