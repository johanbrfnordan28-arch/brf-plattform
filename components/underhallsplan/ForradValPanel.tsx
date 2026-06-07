"use client";

import {
  forradMaterialLista,
  måttenhetEtiketter,
  type ForradMaterialId,
  type Måttenhet,
} from "@/components/underhallsplan/komponentregister";

type ForradValPanelProps = {
  material: ForradMaterialId;
  måttenhet: Måttenhet;
  värde: string;
  antalDorrar: string;
  onMaterialChange: (material: ForradMaterialId) => void;
  onMåttChange: (patch: {
    måttenhet?: Måttenhet;
    värde?: string;
    forradAntalDorrar?: string;
  }) => void;
};

const forradMåttenheter: Måttenhet[] = ["antal", "löpmeter"];

export function ForradValPanel({
  material,
  måttenhet,
  värde,
  antalDorrar,
  onMaterialChange,
  onMåttChange,
}: ForradValPanelProps) {
  const enhetInfo = måttenhetEtiketter[måttenhet];
  const visaDorrar = måttenhet === "löpmeter";

  return (
    <div className="space-y-3">
      <fieldset>
        <legend className="text-xs font-semibold text-primary-dark">Material</legend>
        <div className="mt-2 flex flex-wrap gap-3">
          {forradMaterialLista.map((alt) => (
            <label
              key={alt.id}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-sm"
            >
              <input
                type="radio"
                name="forrad-material"
                checked={material === alt.id}
                onChange={() => onMaterialChange(alt.id)}
                className="h-4 w-4 border-border text-primary"
              />
              {alt.etikett}
            </label>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted">
          {forradMaterialLista.find((m) => m.id === material)?.beskrivning}
        </p>
      </fieldset>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-xs font-medium text-muted">Mått som</span>
          <select
            value={måttenhet}
            onChange={(e) => {
              const next = e.target.value as Måttenhet;
              onMåttChange({
                måttenhet: next,
                forradAntalDorrar: next === "löpmeter" ? antalDorrar : "",
              });
            }}
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
          >
            {forradMåttenheter.map((key) => (
              <option key={key} value={key}>
                {måttenhetEtiketter[key].etikett} ({måttenhetEtiketter[key].enhet})
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-xs font-medium text-muted">
            {måttenhet === "antal" ? "Antal förråd" : "Längd"} ({enhetInfo.enhet})
          </span>
          <input
            type="number"
            min={0}
            step={måttenhet === "antal" ? 1 : 0.1}
            value={värde}
            onChange={(e) => onMåttChange({ värde: e.target.value })}
            placeholder={måttenhet === "antal" ? "t.ex. 42" : "t.ex. 85"}
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
          />
        </label>
      </div>

      {visaDorrar && (
        <label className="block text-sm">
          <span className="text-xs font-medium text-muted">Antal dörrar (st)</span>
          <input
            type="number"
            min={0}
            step={1}
            value={antalDorrar}
            onChange={(e) =>
              onMåttChange({ forradAntalDorrar: e.target.value })
            }
            placeholder="t.ex. 42"
            className="mt-1 w-full max-w-xs rounded-lg border border-border bg-white px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-muted">
            Vid gallerpartier i löpmeter är dörrarna ofta den största kostnadsposten —
            ange antal dörrar för underhållsplanen.
          </p>
        </label>
      )}
    </div>
  );
}
