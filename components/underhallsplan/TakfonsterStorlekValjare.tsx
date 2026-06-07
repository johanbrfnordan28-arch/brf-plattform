"use client";

import {
  hamtaTakfonsterStorlek,
  TAKFONSTER_STORLEK_ANNAT,
  takfonsterStandardStorlekar,
  takfonsterStorlekSelectVarde,
} from "@/components/underhallsplan/takfonster";

type TakfonsterStorlekValjareProps = {
  storlekId: string;
  breddMm: string;
  hojdMm: string;
  etikett?: string;
  hjalpText?: string;
  onChange: (patch: {
    storlekId: string;
    breddMm: string;
    hojdMm: string;
  }) => void;
};

export function TakfonsterStorlekValjare({
  storlekId,
  breddMm,
  hojdMm,
  etikett = "Storlek (yttre karm)",
  hjalpText = "Mått för yttre karm enligt branschens vanliga takfönsterstorlekar.",
  onChange,
}: TakfonsterStorlekValjareProps) {
  const selectVarde = takfonsterStorlekSelectVarde(storlekId);
  const visarEget = selectVarde === TAKFONSTER_STORLEK_ANNAT;

  return (
    <div className="space-y-2">
      <label className="block text-sm sm:col-span-2">
        <span className="text-xs font-medium text-muted">{etikett}</span>
        <select
          value={selectVarde}
          onChange={(e) => {
            const ny = e.target.value;
            if (ny === "") {
              onChange({ storlekId: "", breddMm: "", hojdMm: "" });
              return;
            }
            if (ny === TAKFONSTER_STORLEK_ANNAT) {
              onChange({
                storlekId: TAKFONSTER_STORLEK_ANNAT,
                breddMm,
                hojdMm,
              });
              return;
            }
            const storlek = hamtaTakfonsterStorlek(ny);
            if (storlek) {
              onChange({
                storlekId: storlek.id,
                breddMm: String(storlek.breddMm),
                hojdMm: String(storlek.hojdMm),
              });
            }
          }}
          className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
        >
          <option value="">Välj bredd och höjd</option>
          {takfonsterStandardStorlekar.map((s) => (
            <option key={s.id} value={s.id}>
              {s.etikett}
            </option>
          ))}
          <option value={TAKFONSTER_STORLEK_ANNAT}>Annat mått…</option>
        </select>
      </label>

      {visarEget && (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-xs font-medium text-muted">Bredd (mm)</span>
            <input
              type="number"
              min={0}
              step={1}
              value={breddMm}
              onChange={(e) =>
                onChange({
                  storlekId: TAKFONSTER_STORLEK_ANNAT,
                  breddMm: e.target.value,
                  hojdMm,
                })
              }
              placeholder="t.ex. 780"
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-medium text-muted">Höjd (mm)</span>
            <input
              type="number"
              min={0}
              step={1}
              value={hojdMm}
              onChange={(e) =>
                onChange({
                  storlekId: TAKFONSTER_STORLEK_ANNAT,
                  breddMm,
                  hojdMm: e.target.value,
                })
              }
              placeholder="t.ex. 980"
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
            />
          </label>
        </div>
      )}

      {!visarEget && selectVarde && hjalpText && (
        <p className="text-xs text-muted">{hjalpText}</p>
      )}
    </div>
  );
}
