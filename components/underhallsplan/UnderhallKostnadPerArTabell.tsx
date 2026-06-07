"use client";

import { formatKr } from "@/components/underhallsplan/besiktningar";
import type { UnderhallKostnadPerArRad } from "@/components/underhallsplan/underhall-plan-ar";

type UnderhallKostnadPerArTabellProps = {
  rader: UnderhallKostnadPerArRad[];
  titel?: string;
};

export function UnderhallKostnadPerArTabell({
  rader,
  titel = "Planerad kostnad per år",
}: UnderhallKostnadPerArTabellProps) {
  if (rader.length === 0) return null;

  const totaltPlan = rader.reduce((s, r) => s + r.summaKr, 0);

  return (
    <div className="rounded-lg border border-border bg-white p-3">
      <p className="text-xs font-semibold text-primary-dark">{titel}</p>
      <p className="mt-0.5 text-[10px] text-muted">
        Samma belopp summeras per år när flera åtgärder infaller samma år.
      </p>
      <table className="mt-2 w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-muted">
            <th className="pb-1 font-medium">År</th>
            <th className="pb-1 text-right font-medium">Summa</th>
          </tr>
        </thead>
        <tbody>
          {rader.map((rad) => (
            <tr key={rad.ar} className="border-t border-border/80">
              <td className="py-1.5 font-medium text-foreground">{rad.ar}</td>
              <td className="py-1.5 text-right font-semibold text-primary-dark">
                {formatKr(rad.summaKr)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-primary/20">
            <td className="pt-2 text-xs font-semibold text-primary-dark">
              Totalt i planen
            </td>
            <td className="pt-2 text-right text-sm font-bold text-primary-dark">
              {formatKr(totaltPlan)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
