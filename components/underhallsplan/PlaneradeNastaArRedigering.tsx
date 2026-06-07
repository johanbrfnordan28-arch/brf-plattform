"use client";

import { useMemo } from "react";
import { formatKostnad } from "@/components/underhallsplan/renoveringar";
import {
  hamtaUnderhallAtgardKatalog,
  hamtaUnderhallTillfallenPlanNyckel,
} from "@/components/underhallsplan/underhall-atgard-katalog";
import {
  beraknaKommandeKostnad,
  hamtaForvaldAvvikandeAtgard,
  hamtaForvaldStorAtgardId,
  tomKommandeAtgardOverride,
} from "@/components/underhallsplan/renovering-kommande-atgard";
import type { KommandeAtgardOverride } from "@/components/underhallsplan/renoveringar";
import type { PlaneradAtgardPreview } from "@/components/underhallsplan/renovering-planering";
import type { PlanKostnaderNormaliserade } from "@/components/underhallsplan/plan-kostnader";

const STANDARD_ATGARD = "__standard__";

type PlaneradeNastaArRedigeringProps = {
  planerade: PlaneradAtgardPreview[];
  arInputs: Record<string, string>;
  overrides: Record<string, KommandeAtgardOverride>;
  underkomponentId?: string;
  onArChange: (renoveringId: string, ar: string) => void;
  onOverrideChange: (renoveringId: string, override: KommandeAtgardOverride) => void;
  planKostnader?: PlanKostnaderNormaliserade;
};

function sparadOverride(
  overrides: Record<string, KommandeAtgardOverride>,
  renoveringId: string,
): KommandeAtgardOverride {
  return overrides[renoveringId] ?? { läge: "standard" };
}

export function PlaneradeNastaArRedigering({
  planerade,
  arInputs,
  overrides,
  underkomponentId,
  onArChange,
  onOverrideChange,
  planKostnader,
}: PlaneradeNastaArRedigeringProps) {
  const rader = useMemo(() => {
    return planerade.map((p) => {
      const override = sparadOverride(overrides, p.renoveringId);
      const planAr =
        Number.parseInt(arInputs[p.renoveringId] ?? "", 10) ||
        override.nastaAr ||
        p.nastaAr;
      const overrideMedAr = { ...override, nastaAr: planAr };
      const uppskattadKostnadKr = beraknaKommandeKostnad(
        p,
        overrideMedAr,
        planKostnader,
      );
      return {
        ...p,
        planAr,
        override: overrideMedAr,
        uppskattadKostnadKr,
        ärAvvikande: overrideMedAr.läge === "avvikande",
      };
    });
  }, [planerade, arInputs, overrides, planKostnader]);

  if (planerade.length === 0) return null;

  const rubrik =
    planerade.length === 1
      ? "Kommande åtgärd i underhållsplanen"
      : "Kommande åtgärder i underhållsplanen";

  return (
    <div className="rounded-lg border border-[#e2f0e6] bg-[#eef6f0]/50 px-3 py-3">
      <p className="text-xs font-semibold text-primary-dark">{rubrik}</p>
      <p className="mt-1 text-xs text-muted">
        Justera planerat år här. Vill du planera en annan åtgärd än samma typ som
        det utförda arbetet (t.ex. målning efter fönsterrenovering eller takmålning
        efter takbyte) — välj under <strong className="font-medium">Föreslå annan åtgärd</strong>.
        Intervall och pris finjusterar du i steg 3 (tillfällen).
      </p>
      <ul className="mt-3 space-y-3">
        {rader.map((rad) => {
          const planNyckel =
            hamtaUnderhallTillfallenPlanNyckel(
              rad.komponent,
              underkomponentId ?? rad.atgardTyp,
            ) ?? "typ-ovrigt";
          const katalog = hamtaUnderhallAtgardKatalog(planNyckel);
          const storAtgardId = hamtaForvaldStorAtgardId(rad.atgardTyp, katalog);
          const storEtikett =
            katalog.find((a) => a.id === storAtgardId)?.etikett ??
            "Samma typ som utfört";
          const valtId = rad.ärAvvikande
            ? (rad.override.atgardId ?? "")
            : STANDARD_ATGARD;
          const alternativ = katalog.filter((a) => a.id !== storAtgardId);

          return (
            <li
              key={rad.renoveringId}
              className="rounded-md border border-border/80 bg-white px-3 py-3"
            >
              <p className="text-sm font-medium text-foreground">{rad.titel}</p>
              <p className="mt-0.5 text-[10px] text-muted">
                Utfört {rad.utförtAr} · standard ca vart {rad.intervallAr}:e år
              </p>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="text-xs font-medium text-muted">Planerat år</span>
                  <input
                    type="number"
                    min={rad.utförtAr + 1}
                    value={arInputs[rad.renoveringId] ?? String(rad.nastaAr)}
                    onChange={(e) => onArChange(rad.renoveringId, e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border px-2.5 py-1.5 text-sm tabular-nums"
                  />
                </label>

                <label className="block text-sm sm:col-span-1">
                  <span className="text-xs font-medium text-muted">
                    Föreslå annan åtgärd
                  </span>
                  <select
                    value={valtId || STANDARD_ATGARD}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === STANDARD_ATGARD) {
                        onOverrideChange(rad.renoveringId, {
                          läge: "standard",
                          nastaAr: rad.planAr,
                        });
                        return;
                      }
                      const bas = tomKommandeAtgardOverride(
                        { ...rad, nastaAr: rad.planAr },
                        underkomponentId,
                      );
                      onOverrideChange(rad.renoveringId, {
                        ...bas,
                        läge: "avvikande",
                        atgardId: v,
                        nastaAr: rad.planAr,
                      });
                    }}
                    className="mt-1 w-full rounded-lg border border-border px-2.5 py-1.5 text-sm"
                  >
                    <option value={STANDARD_ATGARD}>
                      — {storEtikett} (standard)
                    </option>
                    {alternativ.length > 0 && (
                      <optgroup label="Annan åtgärd">
                        {alternativ.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.etikett}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                  {rad.ärAvvikande && (
                    <p className="mt-1 text-[10px] text-muted">
                      {katalog.find((a) => a.id === rad.override.atgardId)
                        ?.beskrivning ??
                        hamtaForvaldAvvikandeAtgard(rad.atgardTyp, katalog)
                          ?.beskrivning}
                    </p>
                  )}
                </label>
              </div>

              <p className="mt-2 text-xs text-primary-dark">
                Uppskattat i plan: {formatKostnad(rad.uppskattadKostnadKr)}
                {rad.ärAvvikande && (
                  <span className="text-muted">
                    {" "}
                    (lättare åtgärd — större projekt planeras separat i steg 3)
                  </span>
                )}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
