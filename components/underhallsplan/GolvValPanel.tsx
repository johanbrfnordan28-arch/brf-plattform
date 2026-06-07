"use client";

import {
  trapphusGolvMaterialLista,
  måttenhetEtiketter,
  type TrapphusGolvMaterialId,
} from "@/components/underhallsplan/komponentregister";

export const trapphusGolvBrandsakerhetText =
  "I trapphus och utrymningsvägar ska golvet vara brandsäkert — normalt ytskiktsklass Cfl-s1 eller bättre enligt BBR. Välj material med dokumenterat brandprovningsintyg.";

type GolvValPanelProps = {
  material: TrapphusGolvMaterialId;
  värde: string;
  onMaterialChange: (material: TrapphusGolvMaterialId) => void;
  onVärdeChange: (värde: string) => void;
};

export function GolvValPanel({
  material,
  värde,
  onMaterialChange,
  onVärdeChange,
}: GolvValPanelProps) {
  const kvm = måttenhetEtiketter.kvm;

  return (
    <div className="space-y-3">
      <fieldset>
        <legend className="text-xs font-semibold text-primary-dark">
          Golvmaterial (offentlig miljö)
        </legend>
        <div className="mt-2 space-y-2">
          {trapphusGolvMaterialLista.map((alt) => (
            <label
              key={alt.id}
              className="flex cursor-pointer gap-3 rounded-lg border border-border bg-white px-3 py-2"
            >
              <input
                type="radio"
                name="trapphus-golv"
                checked={material === alt.id}
                onChange={() => onMaterialChange(alt.id)}
                className="mt-1 h-4 w-4 border-border text-primary"
              />
              <span>
                <span className="block text-sm font-medium text-foreground">
                  {alt.etikett}
                </span>
                <span className="block text-xs text-muted">{alt.beskrivning}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="block max-w-xs text-sm">
        <span className="text-xs font-medium text-muted">
          Golvyta ({kvm.enhet})
        </span>
        <input
          type="number"
          min={0}
          step={0.1}
          value={värde}
          onChange={(e) => onVärdeChange(e.target.value)}
          placeholder="t.ex. 240"
          className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
        />
      </label>

      <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-950">
        {trapphusGolvBrandsakerhetText}
      </p>
    </div>
  );
}
