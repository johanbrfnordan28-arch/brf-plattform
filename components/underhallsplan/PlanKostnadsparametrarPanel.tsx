"use client";

import { useMemo, useState } from "react";
import {
  STANDARD_INDEX_PROCENT,
  synkaIndexProcentPerAr,
} from "@/components/underhallsplan/plan-kostnader";
import {
  hamtaPlanSlutAr,
  normaliseraPlanLangdAr,
  normaliseraPlanStartAr,
  type Planinstallningar,
} from "@/components/underhallsplan/planinstallningar";

type PlanKostnadsparametrarPanelProps = {
  installningar: Planinstallningar;
  onChange: (next: Planinstallningar) => void;
};

export function PlanKostnadsparametrarPanel({
  installningar,
  onChange,
}: PlanKostnadsparametrarPanelProps) {
  const planStartAr = normaliseraPlanStartAr(installningar.planStartAr);
  const planLangdAr = normaliseraPlanLangdAr(installningar.planLangdAr);
  const planSlutAr = hamtaPlanSlutAr(planStartAr, planLangdAr);
  const [fyllIndexVarde, setFyllIndexVarde] = useState(String(STANDARD_INDEX_PROCENT));
  const [visaIndexTabell, setVisaIndexTabell] = useState(true);

  const planAr = useMemo(() => {
    const ar: number[] = [];
    for (let y = planStartAr; y <= planSlutAr; y++) ar.push(y);
    return ar;
  }, [planStartAr, planSlutAr]);

  function uppdatera(patch: Partial<Planinstallningar>) {
    onChange({ ...installningar, ...patch });
  }

  function uppdateraIndexForAr(ar: number, varde: string) {
    uppdatera({
      indexProcentPerAr: {
        ...installningar.indexProcentPerAr,
        [String(ar)]: varde,
      },
    });
  }

  function fyllAllaIndex() {
    const standard = fyllIndexVarde.trim() || String(STANDARD_INDEX_PROCENT);
    const next: Record<string, string> = {};
    for (const ar of planAr) {
      next[String(ar)] = standard;
    }
    uppdatera({ indexProcentPerAr: next });
  }

  return (
    <div className="rounded-xl border border-[#d4e8da] bg-[#eef6f0]/40 p-4 sm:p-5">
      <p className="text-sm font-semibold text-primary-dark">
        Kostnadsparametrar för planering
      </p>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        Används när framtida åtgärder beräknas från renoveringshistorik: årligt
        byggindex, samt tillägg för upphandling och projektledning på
        entreprenadkostnaden.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block">
          <span className="text-sm font-medium text-foreground">
            Upphandling (%)
          </span>
          <input
            type="number"
            min={0}
            max={50}
            step={0.5}
            value={installningar.upphandlingProcent}
            onChange={(e) =>
              uppdatera({ upphandlingProcent: e.target.value })
            }
            className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
          />
          <span className="mt-1 block text-xs text-muted">
            Påslag på entreprenad
          </span>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-foreground">
            Projektledning (%)
          </span>
          <input
            type="number"
            min={0}
            max={50}
            step={0.5}
            value={installningar.projektledningProcent}
            onChange={(e) =>
              uppdatera({ projektledningProcent: e.target.value })
            }
            className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
          />
          <span className="mt-1 block text-xs text-muted">
            Påslag på entreprenad
          </span>
        </label>
        <label className="block sm:col-span-2 lg:col-span-2">
          <span className="text-sm font-medium text-foreground">
            Index före planstart (%/år)
          </span>
          <input
            type="number"
            min={0}
            max={30}
            step={0.1}
            value={installningar.indexForePlanProcent}
            onChange={(e) =>
              uppdatera({ indexForePlanProcent: e.target.value })
            }
            className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
          />
          <span className="mt-1 block text-xs text-muted">
            År mellan utförd renovering och planstart (t.ex. stambyte 1998 → plan
            från {planStartAr})
          </span>
        </label>
      </div>

      <div className="mt-5 border-t border-[#d4e8da] pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Byggindex per år i planen
            </p>
            <p className="text-xs text-muted">
              {planStartAr}–{planSlutAr} — uppräkning år för år
            </p>
          </div>
          <button
            type="button"
            onClick={() => setVisaIndexTabell((v) => !v)}
            className="text-sm font-medium text-primary-dark hover:underline"
          >
            {visaIndexTabell ? "Dölj tabell" : "Visa tabell"}
          </button>
        </div>

        {visaIndexTabell && (
          <>
            <div className="mt-3 flex flex-wrap items-end gap-2">
              <label className="block text-sm">
                <span className="text-xs font-medium text-muted">
                  Fyll alla år med (%)
                </span>
                <input
                  type="number"
                  min={0}
                  max={30}
                  step={0.1}
                  value={fyllIndexVarde}
                  onChange={(e) => setFyllIndexVarde(e.target.value)}
                  className="mt-1 w-24 rounded-lg border border-border bg-white px-2 py-1.5 text-sm"
                />
              </label>
              <button
                type="button"
                onClick={fyllAllaIndex}
                className="rounded-lg border border-primary bg-white px-3 py-1.5 text-sm font-medium text-primary-dark hover:bg-[#eef6f0]"
              >
                Fyll alla år
              </button>
            </div>

            <div className="mt-3 max-h-56 overflow-auto rounded-lg border border-border bg-white">
              <table className="w-full min-w-[280px] text-left text-sm">
                <thead className="sticky top-0 bg-background text-xs text-muted">
                  <tr>
                    <th className="px-3 py-2 font-medium">År</th>
                    <th className="px-3 py-2 font-medium">Index %</th>
                  </tr>
                </thead>
                <tbody>
                  {planAr.map((ar) => (
                    <tr key={ar} className="border-t border-border">
                      <td className="px-3 py-1.5 font-medium text-foreground">
                        {ar}
                      </td>
                      <td className="px-3 py-1.5">
                        <input
                          type="number"
                          min={0}
                          max={30}
                          step={0.1}
                          value={
                            installningar.indexProcentPerAr[String(ar)] ?? ""
                          }
                          onChange={(e) =>
                            uppdateraIndexForAr(ar, e.target.value)
                          }
                          className="w-20 rounded border border-border px-2 py-1 text-sm"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/** Anropas när planstart eller längd ändras — behåller ifyllda värden. */
export function synkaPlaninstallningarIndex(
  installningar: Planinstallningar,
): Planinstallningar {
  const planStartAr = normaliseraPlanStartAr(installningar.planStartAr);
  const planLangdAr = normaliseraPlanLangdAr(installningar.planLangdAr);
  return {
    ...installningar,
    indexProcentPerAr: synkaIndexProcentPerAr(
      installningar.indexProcentPerAr,
      planStartAr,
      planLangdAr,
      Number.parseFloat(installningar.indexForePlanProcent.replace(",", ".")) ||
        STANDARD_INDEX_PROCENT,
    ),
  };
}
