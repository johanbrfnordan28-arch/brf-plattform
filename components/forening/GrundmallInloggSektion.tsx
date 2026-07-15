"use client";

import Link from "next/link";
import {
  GRUNDMALL_FORENING_ID,
  GRUNDMALL_NAMN,
  markeraPendingAktivForening,
  sattAktivForeningId,
} from "@/lib/forening-registry";

export function GrundmallInloggSektion() {
  function loggaInGrundmall() {
    markeraPendingAktivForening(GRUNDMALL_FORENING_ID);
    sattAktivForeningId(GRUNDMALL_FORENING_ID);
    window.location.assign("/forening");
  }

  return (
    <div className="mx-auto max-w-lg px-4">
      <div className="rounded-2xl border border-dashed border-border bg-surface/60 p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Internt · Utveckling av plattformen
        </p>
        <h2 className="mt-2 text-lg font-bold text-foreground">{GRUNDMALL_NAMN}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          För er som jobbar med masterkopian — demo-innehåll, mallar och
          plattformsfunktioner som nya föreningssidor kopieras från. Styrelser i
          test ska välja testförening ovan i stället.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={loggaInGrundmall}
            className="rounded-xl border border-border bg-white px-5 py-2.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:border-primary/50 hover:bg-[#eef6f0]"
          >
            Logga in · {GRUNDMALL_NAMN}
          </button>
          <Link
            href="/intern"
            className="inline-flex items-center rounded-xl px-3 py-2.5 text-sm font-medium text-muted hover:text-primary-dark"
          >
            Intern portal →
          </Link>
        </div>
      </div>
    </div>
  );
}
