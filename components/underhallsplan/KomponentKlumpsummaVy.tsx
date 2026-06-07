"use client";

import {
  hamtaHuvudYtaUnderkomponentId,
  harHuvudYtaUnderkomponent,
} from "@/components/underhallsplan/komponent-vy";
import type { KomponentDetaljData } from "@/components/underhallsplan/komponentregister";
import { UnderhallBlandadPrisFalt } from "@/components/underhallsplan/UnderhallBlandadPrisFalt";
import { YtaOchMaterialAiHjalp } from "@/components/underhallsplan/YtaOchMaterialAiHjalp";
import type { Grunduppgifter } from "@/components/underhallsplan/types";

type KomponentKlumpsummaVyProps = {
  komponentNamn: string;
  data: KomponentDetaljData;
  grund: Grunduppgifter;
  onChange: (data: KomponentDetaljData) => void;
};

export function KomponentKlumpsummaVy({
  komponentNamn,
  data,
  grund,
  onChange,
}: KomponentKlumpsummaVyProps) {
  const huvudId = hamtaHuvudYtaUnderkomponentId(komponentNamn);
  const huvudRad = huvudId
    ? data.underkomponenter.find((r) => r.id === huvudId)
    : undefined;

  function uppdateraHuvud(patch: Partial<NonNullable<typeof huvudRad>>) {
    if (!huvudId) return;
    onChange({
      ...data,
      underkomponenter: data.underkomponenter.map((r) =>
        r.id === huvudId ? { ...r, ...patch, aktiv: true } : r,
      ),
    });
  }

  return (
    <div className="space-y-4 rounded-xl border border-[#d4e8da] bg-[#eef6f0]/40 p-4">
      <p className="text-sm font-semibold text-primary-dark">
        Enkel vy — klumpsumma
      </p>
      <p className="text-xs text-muted">
        Arbeta med total yta och total kostnad utan att fylla i varje
        underkomponent. Öppna listan nedan när du vill planera per styck (t.ex.
        fönster, skorsten).
      </p>

      {harHuvudYtaUnderkomponent(komponentNamn) && huvudRad && (
        <>
          <label className="block max-w-xs text-sm">
            <span className="text-xs font-medium text-muted">
              Total {komponentNamn === "Tak" ? "takyta" : "fasadyta"} (m²)
            </span>
            <input
              type="number"
              min={0}
              step={0.1}
              value={huvudRad.värde}
              onChange={(e) => uppdateraHuvud({ värde: e.target.value })}
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
            />
          </label>

          <YtaOchMaterialAiHjalp
            typ={komponentNamn === "Tak" ? "Tak" : "Fasad"}
            grund={grund}
            komponentData={data}
            registerKvm={huvudRad.värde}
            onApplyKvm={(kvm) => uppdateraHuvud({ värde: kvm })}
          />
        </>
      )}

      {!harHuvudYtaUnderkomponent(komponentNamn) && (
        <YtaOchMaterialAiHjalp
          typ="Fasad"
          grund={grund}
          komponentData={data}
        />
      )}

      <div className="border-t border-[#d4e8da] pt-3">
        <p className="text-xs font-semibold text-primary-dark">
          Planerad kostnad (klumpsumma)
        </p>
        <p className="mt-0.5 text-[10px] text-muted">
          En total summa för kommande underhåll — motsvarar inte alltid en
          faktura rad för rad.
        </p>
        {huvudRad ? (
          <div className="mt-2">
            <UnderhallBlandadPrisFalt
              rad={{ ...huvudRad, underhallPrisEnhet: huvudRad.underhallPrisEnhet ?? "blandad" }}
              onChange={(patch) => uppdateraHuvud(patch)}
            />
          </div>
        ) : (
          <label className="mt-2 block max-w-xs text-sm">
            <span className="text-xs text-muted">Total kostnad (kr)</span>
            <input
              type="number"
              min={0}
              step={1000}
              value={data.klumpsummaPlaneradKostnadKr ?? ""}
              onChange={(e) =>
                onChange({ ...data, klumpsummaPlaneradKostnadKr: e.target.value })
              }
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </label>
        )}
      </div>
    </div>
  );
}
