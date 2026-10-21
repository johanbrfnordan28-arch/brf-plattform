"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { arInloggadPaEgenForening } from "@/lib/forening-behorighet-klient";
import { FORENING_AKTIV_EVENT } from "@/lib/forening-registry";

/** Medlemssidan har ingen inloggning. Bara en redan inloggad styrelse ser vägen tillbaka. */
export function MedlemHeader() {
  const [styrelseInloggad, setStyrelseInloggad] = useState(false);

  useEffect(() => {
    function uppdatera() {
      setStyrelseInloggad(arInloggadPaEgenForening());
    }
    uppdatera();
    window.addEventListener(FORENING_AKTIV_EVENT, uppdatera);
    return () => window.removeEventListener(FORENING_AKTIV_EVENT, uppdatera);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white"
            style={{ backgroundColor: "var(--primary)" }}
            aria-hidden
          >
            B
          </span>
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold tracking-tight text-foreground">
              Felanmälan
            </p>
            <p className="truncate text-xs text-muted">
              För boende — ingen inloggning
            </p>
          </div>
        </div>
        {styrelseInloggad ? (
          <Link
            href="/forening"
            className="inline-flex h-9 shrink-0 items-center rounded-lg border border-primary/45 bg-white px-3.5 text-sm font-semibold text-primary-dark hover:border-primary hover:bg-[#eef6f0]"
          >
            Tillbaka till föreningen
          </Link>
        ) : null}
      </div>
    </header>
  );
}
