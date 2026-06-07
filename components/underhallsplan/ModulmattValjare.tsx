"use client";

import {
  hamtaModulmattLista,
  MODULMATT_EGEN,
  modulmattSelectVarde,
  type ModulmattTyp,
} from "@/components/underhallsplan/fonster-dorrar";

type ModulmattValjareProps = {
  typ: ModulmattTyp;
  varde: string;
  onChange: (modulmatt: string) => void;
};

export function ModulmattValjare({ typ, varde, onChange }: ModulmattValjareProps) {
  const lista = hamtaModulmattLista(typ);
  const selectVarde = modulmattSelectVarde(varde, typ);
  const visarEgetFalt = selectVarde === MODULMATT_EGEN;

  return (
    <div className="space-y-2">
      <label className="block text-sm">
        <span className="text-xs font-medium text-muted">Modulmått</span>
        <select
          value={selectVarde}
          onChange={(e) => {
            const ny = e.target.value;
            if (ny === "") onChange("");
            else if (ny === MODULMATT_EGEN) onChange(varde.trim() || "");
            else onChange(ny);
          }}
          className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
        >
          <option value="">Välj modulmått</option>
          {lista.map((m) => (
            <option key={m.id} value={m.id}>
              {m.etikett}
            </option>
          ))}
          <option value={MODULMATT_EGEN}>Annat mått…</option>
        </select>
      </label>

      {visarEgetFalt && (
        <label className="block text-sm">
          <span className="text-xs font-medium text-muted">Eget modulmått</span>
          <input
            value={varde}
            onChange={(e) => onChange(e.target.value)}
            placeholder="t.ex. 11×17"
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </label>
      )}

      {selectVarde && selectVarde !== MODULMATT_EGEN && (
        <p className="text-xs text-muted">
          Modul {selectVarde} dm (bredd × höjd i decimeter).
        </p>
      )}
    </div>
  );
}
