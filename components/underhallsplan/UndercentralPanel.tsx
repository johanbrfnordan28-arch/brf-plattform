"use client";

import { ListaSummeringPanel } from "@/components/underhallsplan/ListaSummeringPanel";
import {
  normaliseraUndercentralData,
  summeraUndercentral,
  type UndercentralData,
} from "@/components/underhallsplan/undercentral";

type UndercentralPanelProps = {
  data: UndercentralData;
  /** Antal undercentraler — samma fält som radens mängd. */
  antal: string;
  onChange: (data: UndercentralData) => void;
  onAntalChange: (antal: string) => void;
};

function MeterFalt({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="text-xs font-medium text-muted">{label}</span>
      <span className="mt-0.5 block text-[11px] text-muted">{hint}</span>
      <div className="mt-1 flex items-center gap-2">
        <input
          type="number"
          min={0}
          step={0.1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="t.ex. 40"
          className="w-full max-w-xs rounded-lg border border-border bg-white px-3 py-2 text-sm"
        />
        <span className="text-xs text-muted">löpmeter</span>
      </div>
    </label>
  );
}

export function UndercentralPanel({
  data,
  antal,
  onChange,
  onAntalChange,
}: UndercentralPanelProps) {
  const d = normaliseraUndercentralData(data);
  const summering = summeraUndercentral(d);

  return (
    <div className="space-y-4">
      <p className="text-xs leading-relaxed text-muted">
        Undercentralen ligger vanligtvis i källaren. Uppgifterna här avser
        källaren: antal undercentraler och de horisontella ledningarna, tillopp
        och retur var för sig. Stamventiler läggs inte in här — de registreras
        bara under Stamventiler.
      </p>

      <label className="block max-w-xs text-sm">
        <span className="text-xs font-medium text-muted">
          Antal undercentraler
        </span>
        <input
          type="number"
          min={0}
          step={1}
          value={antal}
          onChange={(e) => onAntalChange(e.target.value)}
          className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <MeterFalt
          label="Horisontell tillopp"
          hint="Ledningen som går ut från undercentralen i källaren."
          value={d.tilloppLopmeter}
          onChange={(tilloppLopmeter) => onChange({ ...d, tilloppLopmeter })}
        />
        <MeterFalt
          label="Horisontell retur"
          hint="Returledningen tillbaka till undercentralen i källaren."
          value={d.returLopmeter}
          onChange={(returLopmeter) => onChange({ ...d, returLopmeter })}
        />
      </div>

      {summering.length > 0 && (
        <ListaSummeringPanel titel="Horisontella ledningar" rader={summering} />
      )}
    </div>
  );
}
