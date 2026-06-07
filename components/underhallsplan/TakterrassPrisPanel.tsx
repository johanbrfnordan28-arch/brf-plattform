"use client";

import { formatKr } from "@/components/underhallsplan/besiktningar";
import type { TakterrassData } from "@/components/underhallsplan/takterrass";
import { skapaTomTakterrassPriser } from "@/components/underhallsplan/takterrass";
import {
  beraknaTakterrassPris,
  takterrassPrisRadDef,
  type TakterrassPrisFaltId,
} from "@/components/underhallsplan/takterrass-pris";

type TakterrassPrisPanelProps = {
  data: TakterrassData;
  onChange: (data: TakterrassData) => void;
};

export function TakterrassPrisPanel({ data, onChange }: TakterrassPrisPanelProps) {
  const priser = data.priser ?? skapaTomTakterrassPriser();
  const { rader, totaltKr } = beraknaTakterrassPris(data);

  function uppdateraPris(id: TakterrassPrisFaltId, värde: string) {
    onChange({
      ...data,
      priser: { ...priser, [id]: värde },
    });
  }

  const raderMedInnehall = rader.filter(
    (r) => r.mangd > 0 || r.enhetsprisKr > 0,
  );

  return (
    <fieldset className="rounded-lg border border-primary/30 bg-[#eef6f0]/50 p-3 sm:p-4">
      <legend className="px-1 text-xs font-semibold text-primary-dark">
        Prissättning
      </legend>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        Ange enhetspris per del — summan räknas ut från mängderna du fyllt i
        ovan (löpmeter, m² eller antal).
      </p>

      <div className="mt-3 overflow-x-auto rounded-lg border border-border bg-white">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="bg-background text-xs text-muted">
            <tr>
              <th className="px-3 py-2 font-medium">Del</th>
              <th className="px-3 py-2 font-medium">Mängd</th>
              <th className="px-3 py-2 font-medium">Enhetspris</th>
              <th className="px-3 py-2 text-right font-medium">Summa</th>
            </tr>
          </thead>
          <tbody>
            {takterrassPrisRadDef.map((def) => {
              const rad = rader.find((r) => r.id === def.id)!;
              return (
                <tr key={def.id} className="border-t border-border">
                  <td className="px-3 py-2 text-foreground">{def.etikett}</td>
                  <td className="px-3 py-2 text-muted">{rad.mangdText}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={0}
                        step={def.enhet === "st" ? 1 : 1}
                        value={priser[def.id]}
                        onChange={(e) => uppdateraPris(def.id, e.target.value)}
                        placeholder="0"
                        className="w-24 rounded-lg border border-border px-2 py-1.5 text-sm"
                      />
                      <span className="text-xs text-muted">{def.enhetKort}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right font-medium text-foreground">
                    {rad.summaKr > 0 ? formatKr(rad.summaKr) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="border-t-2 border-primary/20 bg-[#eef6f0]/60">
            <tr>
              <td
                colSpan={3}
                className="px-3 py-2.5 text-right text-sm font-semibold text-primary-dark"
              >
                Totalt takterrass
              </td>
              <td className="px-3 py-2.5 text-right text-sm font-bold text-primary-dark">
                {totaltKr > 0 ? formatKr(totaltKr) : "—"}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {raderMedInnehall.length === 0 && (
        <p className="mt-2 text-xs text-muted">
          Fyll i mängder ovan (t.ex. golvyta 20 m²) för att kunna prissätta.
        </p>
      )}
    </fieldset>
  );
}
