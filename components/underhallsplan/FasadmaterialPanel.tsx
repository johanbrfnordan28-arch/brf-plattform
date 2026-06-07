"use client";

import { FasadAtgardTillfallenPanel } from "@/components/underhallsplan/FasadAtgardTillfallenPanel";
import { FasadYtaKostnadSammanstallning } from "@/components/underhallsplan/FasadYtaKostnadSammanstallning";
import { YtaOchMaterialAiHjalp } from "@/components/underhallsplan/YtaOchMaterialAiHjalp";
import type { Grunduppgifter } from "@/components/underhallsplan/types";
import type { FasadAtgardData } from "@/components/underhallsplan/fasad-atgard";
import type { FasadAtgardPrisRegister } from "@/components/underhallsplan/fasad-atgard-pris";
import {
  allaDeltyper,
  deltypEtikett,
  måttenhetEtiketter,
  type DeltypDefinition,
  type KomponentDetaljData,
  type KomponentMall,
  type Måttenhet,
} from "@/components/underhallsplan/komponentregister";

type FasadmaterialPanelProps = {
  mall: KomponentMall;
  data: KomponentDetaljData;
  måttenhet: Måttenhet;
  värde: string;
  fasadAtgard: FasadAtgardData;
  fasadAtgardPriser: FasadAtgardPrisRegister;
  planStartAr: number;
  planLangdAr: number;
  grund: Grunduppgifter;
  onValdaDeltyperChange: (valdaDeltyper: string[]) => void;
  onMåttChange: (patch: { måttenhet?: Måttenhet; värde?: string }) => void;
  onFasadAtgardChange: (atgard: FasadAtgardData) => void;
  onFasadAtgardPriserChange: (priser: FasadAtgardPrisRegister) => void;
};

export function FasadmaterialPanel({
  mall,
  data,
  måttenhet,
  värde,
  fasadAtgard,
  fasadAtgardPriser,
  planStartAr,
  planLangdAr,
  grund,
  onValdaDeltyperChange,
  onMåttChange,
  onFasadAtgardChange,
  onFasadAtgardPriserChange,
}: FasadmaterialPanelProps) {
  const deltyper = allaDeltyper(data, mall);
  const enhetInfo = måttenhetEtiketter[måttenhet];

  function toggleDeltyp(id: string) {
    onValdaDeltyperChange(
      data.valdaDeltyper.includes(id)
        ? data.valdaDeltyper.filter((d) => d !== id)
        : [...data.valdaDeltyper, id],
    );
  }

  return (
    <div className="space-y-4">
      <fieldset>
        <legend className="text-xs font-semibold text-primary-dark">
          Fasadmaterial — välj ett eller flera
        </legend>
        <p className="mt-1 text-xs text-muted">
          T.ex. puts, tunnputs, tegel, trä eller plåt. Flera val om fasaden har
          olika material.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {deltyper.map((del: DeltypDefinition) => {
            const vald = data.valdaDeltyper.includes(del.id);
            return (
              <button
                key={del.id}
                type="button"
                onClick={() => toggleDeltyp(del.id)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                  vald
                    ? "border-primary bg-[#e2f0e6] text-primary-dark"
                    : "border-border bg-white text-foreground hover:border-primary/50"
                }`}
              >
                {vald ? "✓ " : ""}
                {del.etikett}
              </button>
            );
          })}
        </div>
        {data.valdaDeltyper.length > 0 && (
          <p className="mt-2 text-xs font-medium text-primary-dark">
            Valt:{" "}
            {data.valdaDeltyper
              .map((id) => deltypEtikett(id, data, mall))
              .join(", ")}
          </p>
        )}
      </fieldset>

      <YtaOchMaterialAiHjalp
        typ="Fasad"
        grund={grund}
        komponentData={data}
        registerKvm={värde}
        onApplyKvm={(kvm) => onMåttChange({ värde: kvm })}
      />

      <label className="block max-w-xs text-sm">
        <span className="text-xs font-medium text-muted">
          Total fasadyta ({enhetInfo.enhet})
        </span>
        <input
          type="number"
          min={0}
          step={0.1}
          value={värde}
          onChange={(e) => onMåttChange({ värde: e.target.value })}
          placeholder="m²"
          className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
        />
        <span className="mt-1 block text-[10px] text-muted">
          Används som yta (m²) vid blandad prissättning i kommande underhåll och
          per fasadåtgärd nedan. Kan fyllas från grunduppgifter (hus och vädersträck).
        </span>
      </label>

      <FasadYtaKostnadSammanstallning
        grund={grund}
        registerFasadKvm={värde}
        fasadAtgard={fasadAtgard}
        priser={fasadAtgardPriser}
        planStartAr={planStartAr}
        planLangdAr={planLangdAr}
        onApplyGrundSummaTillRegister={(kvm) => onMåttChange({ värde: kvm })}
      />

      <FasadAtgardTillfallenPanel
        fasadAtgard={fasadAtgard}
        priser={fasadAtgardPriser}
        defaultKvm={värde}
        planStartAr={planStartAr}
        planLangdAr={planLangdAr}
        onFasadAtgardChange={onFasadAtgardChange}
        onPriserChange={onFasadAtgardPriserChange}
      />
    </div>
  );
}
