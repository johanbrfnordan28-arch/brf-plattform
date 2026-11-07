"use client";

import type { KomponentDetaljData } from "@/components/underhallsplan/komponentregister";
import { formatKostnad } from "@/components/underhallsplan/renoveringar";
import {
  foreslaTakFordelning,
  summaProcent,
  type TakFordelningRad,
} from "@/components/underhallsplan/tak-anbud-fordelning";

type TakAnbudFordelningPanelProps = {
  takData?: KomponentDetaljData;
  rader: TakFordelningRad[];
  kostnadKr: string;
  onChange: (rader: TakFordelningRad[]) => void;
};

function tal(text: string): number {
  const n = Number.parseFloat(text.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** Anbud för hela taket — andel per takparti och komponent. */
export function TakAnbudFordelningPanel({
  takData,
  rader,
  kostnadKr,
  onChange,
}: TakAnbudFordelningPanelProps) {
  const total = tal(kostnadKr);
  const summa = summaProcent(rader);

  if (rader.length === 0) {
    return (
      <p className="mt-2 text-xs text-muted">
        Taket har inga delar ännu — lägg till takpartier och komponenter i steg
        2 så kan anbudet fördelas.
      </p>
    );
  }

  return (
    <div className="mt-3 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold text-foreground">
          Fördelning på takets delar
        </p>
        {takData ? (
          <button
            type="button"
            onClick={() => onChange(foreslaTakFordelning(takData))}
            className="text-xs font-medium text-primary-dark underline"
          >
            Föreslå fördelning igen
          </button>
        ) : null}
      </div>
      <p className="text-[11px] leading-relaxed text-muted">
        Förslaget bygger på yta, antal och ungefärliga priser. Justera
        procenten efter anbudet. Sätt 0 % på delar som inte ingick.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[320px] text-left text-xs">
          <thead>
            <tr className="border-b border-border text-muted">
              <th className="pb-1.5 pr-3 font-semibold">Del</th>
              <th className="pb-1.5 pr-3 font-semibold">Andel</th>
              <th className="pb-1.5 text-right font-semibold">Belopp</th>
            </tr>
          </thead>
          <tbody>
            {rader.map((rad, i) => {
              const procent = tal(rad.procent);
              const belopp =
                total > 0 && summa > 0 ? Math.round((total * procent) / summa) : 0;
              return (
                <tr
                  key={`${rad.underkomponentId}-${i}`}
                  className={`border-b border-border/60 last:border-0 ${
                    procent > 0 ? "" : "text-muted"
                  }`}
                >
                  <td className="py-1.5 pr-3 font-medium">{rad.del}</td>
                  <td className="py-1.5 pr-3">
                    <label className="flex items-center gap-1">
                      <input
                        type="text"
                        inputMode="decimal"
                        aria-label={`Andel ${rad.del}`}
                        value={rad.procent}
                        onChange={(e) =>
                          onChange(
                            rader.map((r, j) =>
                              j === i ? { ...r, procent: e.target.value } : r,
                            ),
                          )
                        }
                        className="w-16 rounded-lg border border-border bg-white px-2 py-1 text-sm"
                      />
                      %
                    </label>
                  </td>
                  <td className="py-1.5 text-right tabular-nums">
                    {belopp > 0 ? formatKostnad(belopp) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p
        className={`text-xs ${
          Math.round(summa) === 100 ? "text-muted" : "text-amber-800"
        }`}
      >
        Summa {Math.round(summa)} %
        {Math.round(summa) !== 100 && summa > 0
          ? " — andelarna räknas om proportionellt så att hela beloppet fördelas."
          : ""}
      </p>
    </div>
  );
}
