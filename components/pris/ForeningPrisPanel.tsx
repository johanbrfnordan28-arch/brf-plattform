"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  hamtaAntalLagenheterFranGrund,
} from "@/components/underhallsplan/grund-synk";
import {
  lasUnderhallsplanState,
  UNDERHALLSPLAN_STATE_EVENT,
} from "@/components/underhallsplan/underhallsplan-lager";
import { FORENING_AKTIV_EVENT } from "@/lib/forening-registry";
import {
  ARSAVTAL_RABATT_PROCENT,
  avtalsVillkorKort,
  beraknaPris,
  formatKr,
  type BeraknatPris,
} from "@/lib/prislista";

type Variant = "hubb" | "avtal" | "kompakt";

type Props = {
  variant?: Variant;
  /** Visa länk till underhållsplanens grunduppgifter. */
  visaLankTillGrund?: boolean;
};

/**
 * Visar föreningens kostnad först när antal lägenheter är ifyllt.
 * Prislistans belopp är dolda tills dess.
 */
export function ForeningPrisPanel({
  variant = "hubb",
  visaLankTillGrund = true,
}: Props) {
  const [antal, setAntal] = useState(0);
  const [redo, setRedo] = useState(false);

  const ladda = useCallback(() => {
    const plan = lasUnderhallsplanState();
    const n = plan?.grund
      ? hamtaAntalLagenheterFranGrund(plan.grund)
      : 0;
    setAntal(n);
    setRedo(true);
  }, []);

  useEffect(() => {
    ladda();
    window.addEventListener(FORENING_AKTIV_EVENT, ladda);
    window.addEventListener(UNDERHALLSPLAN_STATE_EVENT, ladda);
    window.addEventListener("storage", ladda);
    return () => {
      window.removeEventListener(FORENING_AKTIV_EVENT, ladda);
      window.removeEventListener(UNDERHALLSPLAN_STATE_EVENT, ladda);
      window.removeEventListener("storage", ladda);
    };
  }, [ladda]);

  if (!redo) {
    return (
      <p className="text-sm text-muted">Laddar prisuppgifter …</p>
    );
  }

  const pris: BeraknatPris | null = antal > 0 ? beraknaPris(antal) : null;

  if (antal <= 0) {
    return (
      <div
        className={
          variant === "kompakt"
            ? "rounded-lg border border-dashed border-border bg-surface/60 px-3 py-3 text-sm text-muted"
            : "rounded-xl border border-dashed border-border bg-white/70 px-4 py-4 text-sm text-muted"
        }
      >
        <p className="font-medium text-foreground">Er kostnad visas här</p>
        <p className="mt-1">
          Ange antal lägenheter i underhållsplanens grunduppgifter — då räknas
          ert pris ut automatiskt. Prislistan är dold tills dess.
        </p>
        {visaLankTillGrund && (
          <Link
            href="/forening/underhallsplan#grund"
            className="mt-2 inline-block font-medium text-primary-dark underline hover:no-underline"
          >
            Fyll i antal lägenheter →
          </Link>
        )}
        <ul className="mt-3 space-y-1 text-xs text-muted">
          {avtalsVillkorKort()
            .filter((r) => !r.includes("exkl."))
            .slice(0, 3)
            .map((rad) => (
              <li key={rad}>{rad}</li>
            ))}
        </ul>
      </div>
    );
  }

  if (!pris) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950">
        <p className="font-semibold">
          {antal} lägenheter — kontakta oss för offert
        </p>
        <p className="mt-1">
          Standardprislistan gäller upp till 100 lägenheter. För större
          föreningar tar vi fram ett anpassat pris.
        </p>
      </div>
    );
  }

  return (
    <div
      className={
        variant === "avtal"
          ? "mt-4 rounded-xl border border-primary/30 bg-[#eef6f0] px-4 py-4"
          : "rounded-xl border border-primary/30 bg-white/80 px-4 py-4"
      }
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">
        Er kostnad · {pris.antalLagenheter} lägenheter
      </p>
      <p className="mt-1 text-2xl font-bold text-foreground">
        {formatKr(pris.arsPrisPerManad)}
        <span className="text-base font-semibold text-muted">
          {" "}
          / mån exkl. moms
        </span>
      </p>
      <p className="mt-1 text-sm text-muted">
        Årsavtal ({pris.niva.etikett}) · {ARSAVTAL_RABATT_PROCENT}&nbsp;% rabatt
        mot ordinarie {formatKr(pris.ordinariePrisPerManad)}/mån
      </p>
      <ul className="mt-3 space-y-1 text-sm text-muted">
        <li>
          Kvartalsfaktura i förskott:{" "}
          <strong className="text-foreground">
            {formatKr(pris.kvartalsbelopp)}
          </strong>{" "}
          exkl. moms
        </li>
        <li>Uppsägningstid årsavtal: 6 månader</li>
        <li>
          Månadsbetalning utan årsavtal: {formatKr(pris.ordinariePrisPerManad)}
          /mån · 1 månads uppsägningstid
        </li>
      </ul>
    </div>
  );
}
