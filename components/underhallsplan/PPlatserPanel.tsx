"use client";

import { ListaSummeringPanel } from "@/components/underhallsplan/ListaSummeringPanel";
import {
  pPlatsTyper,
  summeraPPlatser,
  type PPlatsTypId,
  type PPlatserData,
} from "@/components/underhallsplan/p-platser";

type PPlatserPanelProps = {
  data: PPlatserData;
  onChange: (data: PPlatserData) => void;
};

export function PPlatserPanel({ data, onChange }: PPlatserPanelProps) {
  function uppdateraTyp(typId: PPlatsTypId, antal: string) {
    onChange({ ...data, [typId]: antal });
  }

  return (
    <div className="space-y-4">
      <p className="text-xs leading-relaxed text-muted">
        Ange antal platser per typ. Summan används som underlag för planering
        och summering.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {pPlatsTyper.map((typ) => (
          <label key={typ.id} className="block text-sm">
            <span className="text-xs font-medium text-foreground">
              {typ.etikett}
            </span>
            <span className="mt-0.5 block text-xs text-muted">
              {typ.beskrivning}
            </span>
            <input
              type="number"
              min={0}
              step={1}
              value={data[typ.id]}
              onChange={(e) => uppdateraTyp(typ.id, e.target.value)}
              placeholder="st"
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
            />
          </label>
        ))}
      </div>

      {(() => {
        const mangdRader = summeraPPlatser(data);
        if (mangdRader.length === 0) return null;
        return (
          <ListaSummeringPanel titel="Summering P-platser" rader={mangdRader} />
        );
      })()}
    </div>
  );
}
