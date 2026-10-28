"use client";

import {
  formateraMattPartier,
  normaliseraMattPartier,
  skapaTomMattParti,
  summeraMattPartier,
  mattPartiPlaceholder,
  type UnderkomponentMattParti,
} from "@/components/underhallsplan/underkomponent-matt-partier";
import {
  måttenhetEtiketter,
  type Måttenhet,
} from "@/components/underhallsplan/komponentregister";

type UnderkomponentMattPartierPanelProps = {
  etikett: string;
  måttenhet: Måttenhet;
  partier: UnderkomponentMattParti[];
  onChange: (partier: UnderkomponentMattParti[]) => void;
};

export function UnderkomponentMattPartierPanel({
  etikett,
  måttenhet,
  partier,
  onChange,
}: UnderkomponentMattPartierPanelProps) {
  const enhet = måttenhetEtiketter[måttenhet];
  const lista = normaliseraMattPartier(partier);
  const summa = summeraMattPartier(lista);

  function uppdatera(id: string, patch: Partial<UnderkomponentMattParti>) {
    onChange(
      lista.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    );
  }

  function laggTill() {
    onChange([...lista, skapaTomMattParti("")]);
  }

  function taBort(id: string) {
    const kvar = lista.filter((p) => p.id !== id);
    onChange(kvar.length > 0 ? kvar : [skapaTomMattParti("")]);
  }

  return (
    <div className="mt-2 space-y-2">
      <ul className="space-y-1.5">
        {lista.map((parti, index) => (
          <li
            key={parti.id}
            className="flex flex-wrap items-end gap-2 rounded-md border border-border/80 bg-white px-2 py-2"
          >
            <label className="min-w-[7rem] flex-1 text-xs">
              <span className="text-muted">Benämning</span>
              <input
                type="text"
                value={parti.namn}
                onChange={(e) =>
                  uppdatera(parti.id, { namn: e.target.value })
                }
                placeholder={mattPartiPlaceholder(index)}
                className="mt-0.5 w-full rounded border border-border px-2 py-1.5 text-sm"
              />
            </label>
            <label className="w-24 shrink-0 text-xs">
              <span className="text-muted">{enhet.etikett}</span>
              <input
                type="text"
                inputMode="decimal"
                value={parti.mangd}
                onChange={(e) =>
                  uppdatera(parti.id, { mangd: e.target.value })
                }
                className="mt-0.5 w-full rounded border border-border px-2 py-1.5 text-sm"
              />
            </label>
            <span className="pb-1.5 text-xs text-muted">{enhet.enhet}</span>
            {lista.length > 1 && (
              <button
                type="button"
                onClick={() => taBort(parti.id)}
                className="pb-1.5 text-xs text-red-700 hover:underline"
              >
                Ta bort
              </button>
            )}
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={laggTill}
        className="text-xs font-medium text-primary-dark hover:underline"
      >
        + Lägg till rad ({etikett.toLowerCase()})
      </button>
      {summa > 0 && lista.some((p) => p.namn.trim()) && (
        <p className="text-[11px] text-muted">
          {formateraMattPartier(lista, enhet.enhet)}
        </p>
      )}
      {summa > 0 && (
        <p className="text-[11px] font-medium text-foreground">
          Summa: {summa.toLocaleString("sv-SE")} {enhet.enhet}
        </p>
      )}
    </div>
  );
}
