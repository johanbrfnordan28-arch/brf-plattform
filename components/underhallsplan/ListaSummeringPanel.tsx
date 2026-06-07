"use client";

import type { ListaSummeringRad } from "@/components/underhallsplan/lista-summering";

type ListaSummeringPanelProps = {
  titel?: string;
  rader: ListaSummeringRad[];
  /** Sista rad i tabellen — t.ex. "Totalt antal fönster" */
  totaletikett?: string;
  totaltVarde?: string;
};

export function ListaSummeringPanel({
  titel = "Summering",
  rader,
  totaletikett,
  totaltVarde,
}: ListaSummeringPanelProps) {
  if (rader.length === 0 && !totaltVarde) return null;

  const visaFot = Boolean(totaletikett && totaltVarde);

  return (
    <fieldset className="rounded-lg border border-primary/30 bg-[#eef6f0]/50 p-3 sm:p-4">
      <legend className="px-1 text-xs font-semibold text-primary-dark">
        {titel}
      </legend>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        Summor från alla rader ovan — samma upplägg som summering på takterrass.
      </p>

      <div className="mt-3 overflow-x-auto rounded-lg border border-border bg-white">
        <table className="w-full min-w-[280px] text-left text-sm">
          <thead className="bg-background text-xs text-muted">
            <tr>
              <th className="px-3 py-2 font-medium">Del</th>
              <th className="px-3 py-2 text-right font-medium">Summa</th>
            </tr>
          </thead>
          <tbody>
            {rader.map((rad) => (
              <tr key={rad.etikett} className="border-t border-border">
                <td className="px-3 py-2 text-foreground">{rad.etikett}</td>
                <td className="px-3 py-2 text-right font-medium text-foreground">
                  {rad.varde}
                </td>
              </tr>
            ))}
          </tbody>
          {visaFot && (
            <tfoot className="border-t-2 border-primary/20 bg-[#eef6f0]/60">
              <tr>
                <td className="px-3 py-2.5 text-sm font-semibold text-primary-dark">
                  {totaletikett}
                </td>
                <td className="px-3 py-2.5 text-right text-sm font-bold text-primary-dark">
                  {totaltVarde}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </fieldset>
  );
}
