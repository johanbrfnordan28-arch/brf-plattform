"use client";

import {
  hamtaAntalByggnader,
  synkaGrundByggnaderOchAdresser,
  uppdateraGrundAdress,
  laggTillGrundByggnadAdress,
  taBortGrundByggnadAdress,
} from "@/components/underhallsplan/grund-byggnad-adress";
import type { Grunduppgifter } from "@/components/underhallsplan/types";

type GrundByggnadAdressPanelProps = {
  grund: Grunduppgifter;
  onChange: (grund: Grunduppgifter) => void;
};

export function GrundByggnadAdressPanel({
  grund: rawGrund,
  onChange,
}: GrundByggnadAdressPanelProps) {
  const grund = synkaGrundByggnaderOchAdresser(rawGrund);
  const antal = hamtaAntalByggnader(grund);

  function uppdateraAdress(index: number, value: string) {
    onChange(uppdateraGrundAdress(grund, index, value));
  }

  return (
    <div className="mt-6 rounded-xl border border-border bg-background/80 p-4 sm:p-5">
      <p className="text-sm font-semibold text-foreground">
        Byggnader och adresser ({antal})
      </p>
      <p className="mt-1 text-xs text-muted">
        En adress per byggnad. Lägg till eller ta bort byggnader med knapparna
        nedan — antalet uppdateras automatiskt. Direkt under väljer du{" "}
        <a href="#grund-fasader" className="font-medium text-primary-dark underline">
          vilka fasader
        </a>{" "}
        varje hus har (gata, gård, väderstreck).
      </p>

      <div className="mt-4 space-y-3">
        {grund.adresser.map((adress, index) => (
          <div
            key={index}
            className="flex flex-col gap-2 sm:flex-row sm:items-end"
          >
            <label className="min-w-0 flex-1 block">
              <span className="text-sm font-medium text-foreground">
                Byggnad {index + 1} — adress
              </span>
              <input
                type="text"
                required={index === 0}
                value={adress}
                onChange={(e) => uppdateraAdress(index, e.target.value)}
                placeholder="t.ex. Exempelgatan 12 A"
                className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              />
            </label>
            {antal > 1 && (
              <button
                type="button"
                onClick={() => onChange(taBortGrundByggnadAdress(grund, index))}
                className="shrink-0 rounded-lg border border-border px-3 py-2 text-sm text-muted hover:border-red-300 hover:text-red-700"
              >
                Ta bort byggnad
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onChange(laggTillGrundByggnadAdress(grund))}
        className="mt-4 rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
      >
        + Lägg till byggnad
      </button>
    </div>
  );
}
