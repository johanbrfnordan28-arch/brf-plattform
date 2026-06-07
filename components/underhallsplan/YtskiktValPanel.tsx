"use client";

import {
  hamtaYtskiktAlternativ,
  måttenhetEtiketter,
  type Måttenhet,
  type YtskiktGruppId,
} from "@/components/underhallsplan/komponentregister";

type YtskiktValPanelProps = {
  grupp: YtskiktGruppId;
  ytskikt: string;
  måttenhet: Måttenhet;
  värde: string;
  annanAtgardText?: string;
  onYtskiktChange: (ytskikt: string) => void;
  onMåttChange: (patch: { måttenhet?: Måttenhet; värde?: string }) => void;
  onAnnanAtgardChange?: (text: string) => void;
  visaYta?: boolean;
};

export function YtskiktValPanel({
  grupp,
  ytskikt,
  måttenhet,
  värde,
  annanAtgardText = "",
  onYtskiktChange,
  onMåttChange,
  onAnnanAtgardChange,
  visaYta = true,
}: YtskiktValPanelProps) {
  const alternativ = hamtaYtskiktAlternativ(grupp);
  const enhetInfo = måttenhetEtiketter[måttenhet];
  const visaAnnanFalt = ytskikt === "annan" && onAnnanAtgardChange;

  return (
    <div className="space-y-3">
      <fieldset>
        <legend className="text-xs font-semibold text-primary-dark">Ytskikt</legend>
        <div className="mt-2 flex flex-wrap gap-3">
          {alternativ.map((alt) => (
            <label
              key={alt.id}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-sm"
            >
              <input
                type="radio"
                name={`ytskikt-${grupp}`}
                checked={ytskikt === alt.id}
                onChange={() => onYtskiktChange(alt.id)}
                className="h-4 w-4 border-border text-primary"
              />
              {alt.etikett}
            </label>
          ))}
        </div>
      </fieldset>

      {visaAnnanFalt && (
        <label className="block text-sm">
          <span className="text-xs font-medium text-muted">Beskriv annan åtgärd</span>
          <input
            type="text"
            value={annanAtgardText}
            onChange={(e) => onAnnanAtgardChange(e.target.value)}
            placeholder="t.ex. Spackling och målning av betongväggar"
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
          />
        </label>
      )}

      {visaYta && (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-xs font-medium text-muted">Mått som (valfritt)</span>
            <select
              value={måttenhet}
              onChange={(e) =>
                onMåttChange({ måttenhet: e.target.value as Måttenhet })
              }
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
            >
              {(Object.keys(måttenhetEtiketter) as Måttenhet[]).map((key) => (
                <option key={key} value={key}>
                  {måttenhetEtiketter[key].etikett} ({måttenhetEtiketter[key].enhet})
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-xs font-medium text-muted">
              {enhetInfo.etikett} ({enhetInfo.enhet})
            </span>
            <input
              type="number"
              min={0}
              step={måttenhet === "antal" ? 1 : 0.1}
              value={värde}
              onChange={(e) => onMåttChange({ värde: e.target.value })}
              placeholder={måttenhet === "kvm" ? "t.ex. 24" : "t.ex. 8"}
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
            />
          </label>
        </div>
      )}
    </div>
  );
}
