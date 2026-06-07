"use client";

import { useMemo } from "react";
import {
  sammanstallKommandeUnderhall,
  type KommandeUnderhallRad,
} from "@/components/underhallsplan/kommande-underhall";
import type { KomponentDetaljData } from "@/components/underhallsplan/komponentregister";
import { formatKostnad } from "@/components/underhallsplan/renoveringar";

type KommandeUnderhallSammanfattningProps = {
  komponentDetaljer: Record<string, KomponentDetaljData>;
  planStartAr: number;
  planLangdAr: number;
  maxRader?: number;
};

export function KommandeUnderhallSammanfattning({
  komponentDetaljer,
  planStartAr,
  planLangdAr,
  maxRader = 12,
}: KommandeUnderhallSammanfattningProps) {
  const rader = useMemo(
    () => sammanstallKommandeUnderhall(komponentDetaljer, planStartAr, planLangdAr),
    [komponentDetaljer, planStartAr, planLangdAr],
  );

  if (rader.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-background px-4 py-3 text-sm text-muted">
        Inga planerade åtgärder med år ännu — fyll i kommande underhåll per del nedan
        eller spara utförda arbeten i steg 2 först.
      </p>
    );
  }

  const visade = rader.slice(0, maxRader);
  const rest = rader.length - visade.length;

  return (
    <div className="rounded-xl border border-[#d4e8da] bg-[#eef6f0]/50 p-4">
      <p className="text-sm font-semibold text-primary-dark">
        Kommande underhåll i planen ({rader.length})
      </p>
      <p className="mt-1 text-xs text-muted">
        Sorterat efter planerat år. Poster från steg 2 är markerade.
      </p>
      <ul className="mt-3 space-y-1.5 text-sm">
        {visade.map((rad) => (
          <KommandeRad key={`${rad.komponent}-${rad.underkomponentId}`} rad={rad} />
        ))}
      </ul>
      {rest > 0 && (
        <p className="mt-2 text-xs text-muted">… och {rest} till i registret.</p>
      )}
    </div>
  );
}

function KommandeRad({ rad }: { rad: KommandeUnderhallRad }) {
  return (
    <li className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
      <span className="text-foreground">
        <span className="font-medium tabular-nums">{rad.nastaAr}</span>
        {" · "}
        {rad.komponent} — {rad.etikett}
        {rad.franHistorik && (
          <span className="ml-1 text-xs text-primary-dark">(från historik)</span>
        )}
      </span>
      <span className="text-xs font-medium tabular-nums text-muted">
        {formatKostnad(rad.kostnadKr)}
      </span>
    </li>
  );
}
