"use client";

import type { Grunduppgifter, VerksamhetsLokal } from "@/components/underhallsplan/types";
import { parseHeltalFranText } from "@/components/underhallsplan/parse-grundtal";

export function skapaVerksamhetsLokalId(): string {
  return `lokal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function tomVerksamhetsLokal(): VerksamhetsLokal {
  return { id: skapaVerksamhetsLokalId(), namn: "", ytaM2: "" };
}

function summaLokalytaM2(lokaler: VerksamhetsLokal[]): number {
  return lokaler.reduce((sum, l) => sum + parseHeltalFranText(l.ytaM2), 0);
}

type VerksamhetsLokalerPanelProps = {
  lokaler: VerksamhetsLokal[];
  lokalyta: string;
  onChange: (lokaler: VerksamhetsLokal[]) => void;
  onLokalytaChange: (yta: string) => void;
};

export function VerksamhetsLokalerPanel({
  lokaler,
  lokalyta,
  onChange,
  onLokalytaChange,
}: VerksamhetsLokalerPanelProps) {
  const summa = summaLokalytaM2(lokaler);

  function uppdatera(id: string, patch: Partial<VerksamhetsLokal>) {
    onChange(lokaler.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  function taBort(id: string) {
    onChange(lokaler.filter((l) => l.id !== id));
  }

  function anvandSummaSomLokalyta() {
    if (summa <= 0) return;
    onLokalytaChange(String(summa));
  }

  return (
    <div className="mt-6 rounded-xl border border-border bg-background/80 p-4 sm:p-5">
      <p className="text-sm font-semibold text-foreground">Verksamhetslokaler</p>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        Lägg till lokaler som ska synas i planen (t.ex. butik, kontor, garage).
        Antalet styr OVK för verksamhetslokaler i besiktningar. Fältet Lokalyta (m²)
        ovan används till avsättning tillsammans med boarea.
      </p>

      {lokaler.length === 0 ? (
        <p className="mt-3 text-sm text-muted">
          Inga lokaler registrerade — lägg till om föreningen har verksamhetsytor.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {lokaler.map((lokal, index) => (
            <li
              key={lokal.id}
              className="rounded-lg border border-border bg-white p-3 sm:p-4"
            >
              <div className="grid gap-3 sm:grid-cols-[1fr_8rem_auto] sm:items-end">
                <label className="block text-sm">
                  <span className="text-xs font-medium text-muted">
                    Lokal {index + 1}
                  </span>
                  <input
                    type="text"
                    value={lokal.namn}
                    onChange={(e) => uppdatera(lokal.id, { namn: e.target.value })}
                    placeholder="t.ex. Butik, Kontor, Garage"
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-xs font-medium text-muted">Yta (m²)</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={lokal.ytaM2}
                    onChange={(e) => uppdatera(lokal.id, { ytaM2: e.target.value })}
                    placeholder="t.ex. 85"
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => taBort(lokal.id)}
                  className="rounded-lg border border-border px-3 py-2 text-sm text-muted hover:border-red-300 hover:text-red-700"
                >
                  Ta bort
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => onChange([...lokaler, tomVerksamhetsLokal()])}
          className="rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
        >
          + Lägg till lokal
        </button>
        {summa > 0 && (
          <>
            <span className="text-sm text-muted">
              Summa lokalytor:{" "}
              <span className="font-medium text-foreground">
                {summa.toLocaleString("sv-SE")} m²
              </span>
            </span>
            {parseHeltalFranText(lokalyta) !== summa && (
              <button
                type="button"
                onClick={anvandSummaSomLokalyta}
                className="text-sm font-medium text-primary-dark underline-offset-2 hover:underline"
              >
                Använd summan som lokalyta (avsättning)
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
