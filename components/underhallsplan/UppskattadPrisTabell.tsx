"use client";

import { formatKr } from "@/components/underhallsplan/besiktningar";

export type UppskattadPrisRad = {
  id: string;
  etikett: string;
  mangdText: string;
  enhet: string;
  enhetspris: string;
  summaKr: number;
  anvanderRiktpris?: boolean;
};

type UppskattadPrisTabellProps = {
  titel: string;
  beskrivning?: string;
  rader: UppskattadPrisRad[];
  totaltKr: number;
  totaltEtikett?: string;
  onEnhetsprisChange?: (id: string, varde: string) => void;
};

export function UppskattadPrisTabell({
  titel,
  beskrivning,
  rader,
  totaltKr,
  totaltEtikett = "Totalt",
  onEnhetsprisChange,
}: UppskattadPrisTabellProps) {
  if (rader.length === 0 && totaltKr <= 0) return null;

  return (
    <fieldset className="rounded-lg border border-primary/30 bg-[#eef6f0]/50 p-3 sm:p-4">
      <legend className="px-1 text-xs font-semibold text-primary-dark">
        {titel}
      </legend>
      {beskrivning && (
        <p className="mt-1 text-xs leading-relaxed text-muted">{beskrivning}</p>
      )}

      <div className="mt-3 overflow-x-auto rounded-lg border border-border bg-white">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="bg-background text-xs text-muted">
            <tr>
              <th className="px-3 py-2 font-medium">Post</th>
              <th className="px-3 py-2 font-medium">Mängd</th>
              <th className="px-3 py-2 font-medium">Enhetspris</th>
              <th className="px-3 py-2 text-right font-medium">Summa</th>
            </tr>
          </thead>
          <tbody>
            {rader.map((rad) => (
              <tr key={rad.id} className="border-t border-border">
                <td className="px-3 py-2 text-foreground">
                  {rad.etikett}
                  {rad.anvanderRiktpris && (
                    <span className="mt-0.5 block text-xs text-muted">
                      Riktpris
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-muted">{rad.mangdText}</td>
                <td className="px-3 py-2">
                  {onEnhetsprisChange ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={0}
                        step={100}
                        value={rad.enhetspris}
                        onChange={(e) =>
                          onEnhetsprisChange(rad.id, e.target.value)
                        }
                        placeholder="Riktpris"
                        className="w-24 rounded-lg border border-border px-2 py-1.5 text-sm"
                      />
                      <span className="text-xs text-muted">{rad.enhet}</span>
                    </div>
                  ) : (
                    <span className="text-muted">
                      {formatKr(Number(rad.enhetspris) || 0)}
                      <span className="text-xs"> {rad.enhet}</span>
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-right font-medium text-foreground">
                  {rad.summaKr > 0 ? formatKr(rad.summaKr) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t-2 border-primary/20 bg-[#eef6f0]/60">
            <tr>
              <td
                colSpan={3}
                className="px-3 py-2.5 text-right text-sm font-semibold text-primary-dark"
              >
                {totaltEtikett}
              </td>
              <td className="px-3 py-2.5 text-right text-sm font-bold text-primary-dark">
                {totaltKr > 0 ? formatKr(totaltKr) : "—"}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </fieldset>
  );
}
