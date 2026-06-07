"use client";

import { ListaSummeringPanel } from "@/components/underhallsplan/ListaSummeringPanel";
import {
  normaliseraVvsRadiatorData,
  radiatorAtgardFalt,
  radiatorHusTyper,
  radiatorRorsystemAlternativ,
  summeraVvsRadiator,
  type RadiatorHusGrupp,
  type RadiatorHusTypId,
  type RadiatorRorsystemId,
  type VvsRadiatorData,
} from "@/components/underhallsplan/vvs-radiatorer";

type VvsRadiatorPanelProps = {
  data: VvsRadiatorData;
  onChange: (data: VvsRadiatorData) => void;
};

export function VvsRadiatorPanel({ data, onChange }: VvsRadiatorPanelProps) {
  const normaliserad = normaliseraVvsRadiatorData(data);

  function uppdatera(patch: Partial<VvsRadiatorData>) {
    onChange(normaliseraVvsRadiatorData({ ...normaliserad, ...patch }));
  }

  function uppdateraHus(
    husTyp: RadiatorHusTypId,
    patch: Partial<RadiatorHusGrupp>,
  ) {
    uppdatera({
      [husTyp]: { ...normaliserad[husTyp], ...patch },
    });
  }

  return (
    <div className="space-y-4">
      <p className="text-xs leading-relaxed text-muted">
        På radiatorn sitter termostat (regulator) och radiatorventil
        (ventilunderdel) — inte samma som styrventil på värmestam. Radiatorkoppel
        och packbox är separata delar. Ange planerade åtgärder per styck.
      </p>

      <label className="block max-w-md text-sm">
        <span className="text-xs font-semibold text-primary-dark">
          Rörsystem i fastigheten
        </span>
        <select
          value={normaliserad.rorsystem}
          onChange={(e) =>
            uppdatera({ rorsystem: e.target.value as RadiatorRorsystemId })
          }
          className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
        >
          {radiatorRorsystemAlternativ.map((alt) => (
            <option key={alt.id || "tom"} value={alt.id}>
              {alt.etikett}
            </option>
          ))}
        </select>
        {radiatorRorsystemAlternativ.find((a) => a.id === normaliserad.rorsystem)
          ?.beskrivning && (
          <span className="mt-1 block text-xs text-muted">
            {
              radiatorRorsystemAlternativ.find(
                (a) => a.id === normaliserad.rorsystem,
              )?.beskrivning
            }
          </span>
        )}
      </label>

      {radiatorHusTyper.map((hus) => {
        const grupp = normaliserad[hus.id];
        return (
          <fieldset
            key={hus.id}
            className="rounded-lg border border-[#e2f0e6] bg-[#eef6f0]/40 p-3"
          >
            <legend className="px-1 text-xs font-semibold text-primary-dark">
              {hus.etikett}
            </legend>
            <p className="mb-3 text-xs text-muted">{hus.beskrivning}</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {radiatorAtgardFalt.map((falt) => (
                <label key={falt.key} className="block text-sm">
                  <span className="text-xs font-medium text-foreground">
                    {falt.etikett}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted">
                    {falt.beskrivning}
                  </span>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={grupp[falt.key]}
                    onChange={(e) =>
                      uppdateraHus(hus.id, { [falt.key]: e.target.value })
                    }
                    placeholder="st"
                    className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                  />
                </label>
              ))}
            </div>
          </fieldset>
        );
      })}

      <label className="block max-w-xs text-sm">
        <span className="text-xs font-semibold text-primary-dark">
          Värmerör (m)
        </span>
        <span className="mt-0.5 block text-xs text-muted">
          Planerat byte eller underhåll av värmrör — anges i löpmeter, inte per
          styck.
        </span>
        <input
          type="number"
          min={0}
          step={0.1}
          value={normaliserad.varmerorMeter}
          onChange={(e) => uppdatera({ varmerorMeter: e.target.value })}
          placeholder="t.ex. 420"
          className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
        />
      </label>

      {(() => {
        const mangdRader = summeraVvsRadiator(normaliserad);
        if (mangdRader.length === 0) return null;
        return (
          <ListaSummeringPanel titel="Summering radiatorer" rader={mangdRader} />
        );
      })()}
    </div>
  );
}
