"use client";

import { ListaSummeringPanel } from "@/components/underhallsplan/ListaSummeringPanel";
import {
  lokalInventarMallar,
  summeraLokalInventar,
  type LokalInventarRad,
  type LokalTypId,
} from "@/components/underhallsplan/lokal-inventar";

type LokalInventarPanelProps = {
  typ: LokalTypId;
  titel: string;
  antalRum: string;
  rader: LokalInventarRad[];
  onAntalRumChange: (antal: string) => void;
  onChange: (rader: LokalInventarRad[]) => void;
};

export function LokalInventarPanel({
  typ,
  titel,
  antalRum,
  rader,
  onAntalRumChange,
  onChange,
}: LokalInventarPanelProps) {
  const mall = lokalInventarMallar[typ];

  function uppdateraRad(delId: string, patch: Partial<LokalInventarRad>) {
    onChange(
      rader.map((r) => (r.delId === delId ? { ...r, ...patch } : r)),
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-muted">
        Inventarier och installationer i {titel.toLowerCase()} — utöver
        byggnadens väggar, golv och tak ovan.
      </p>

      <label className="block max-w-xs text-sm">
        <span className="text-xs font-medium text-muted">Antal rum (st)</span>
        <input
          type="number"
          min={0}
          step={1}
          value={antalRum}
          onChange={(e) => onAntalRumChange(e.target.value)}
          placeholder="t.ex. 2"
          className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
        />
      </label>

      <fieldset>
        <legend className="text-xs font-semibold text-primary-dark">
          Invändiga delar
        </legend>
        <ul className="mt-2 space-y-2">
          {mall.map((del) => {
            const rad = rader.find((r) => r.delId === del.id) ?? {
              delId: del.id,
              aktiv: false,
              antal: "",
            };
            return (
              <li
                key={del.id}
                className="rounded-lg border border-border bg-white p-3"
              >
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={rad.aktiv}
                    onChange={(e) =>
                      uppdateraRad(del.id, { aktiv: e.target.checked })
                    }
                    className="mt-1 h-4 w-4 rounded border-border text-primary"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-foreground">
                      {del.etikett}
                    </span>
                    <span className="block text-xs text-muted">
                      {del.beskrivning}
                    </span>
                  </span>
                </label>
                {rad.aktiv && (
                  <label className="mt-2 block text-sm sm:max-w-xs">
                    <span className="text-xs font-medium text-muted">Antal</span>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={rad.antal}
                      onChange={(e) =>
                        uppdateraRad(del.id, { antal: e.target.value })
                      }
                      placeholder="t.ex. 24"
                      className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                    />
                  </label>
                )}
              </li>
            );
          })}
        </ul>
      </fieldset>

      {(() => {
        const mangdRader = summeraLokalInventar(typ, rader, antalRum);
        if (mangdRader.length === 0) return null;
        return (
          <ListaSummeringPanel titel="Summering inventar" rader={mangdRader} />
        );
      })()}
    </div>
  );
}
