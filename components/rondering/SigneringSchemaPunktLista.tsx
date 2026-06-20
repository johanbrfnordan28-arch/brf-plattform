"use client";

import { OppnaStangIkon } from "@/components/OppnaStangKnapp";
import { useMemo, useState } from "react";
import {
  grupperaSchemaPunkter,
  type SigneringSchemaGrupp,
  type SigneringSchemaPunkt,
} from "@/components/rondering/signering-schema";
import type { SigneringRoll } from "@/components/rondering/signering";

type SigneringSchemaPunktListaProps = {
  roll: SigneringRoll;
  punkter: SigneringSchemaPunkt[];
  valdaIds: Set<string>;
  onToggle: (punktId: string) => void;
  onToggleGrupp?: (punktIds: string[], skaVaraValda: boolean) => void;
  onTaBortEget?: (punktId: string) => void;
  readonly?: boolean;
  /** Öppna alla sektioner från start */
  oppnaAlla?: boolean;
};

export function SigneringSchemaPunktLista({
  roll,
  punkter,
  valdaIds,
  onToggle,
  onToggleGrupp,
  onTaBortEget,
  readonly = false,
  oppnaAlla = true,
}: SigneringSchemaPunktListaProps) {
  const grupper = useMemo(
    () => grupperaSchemaPunkter(punkter, roll),
    [punkter, roll],
  );

  const [oppna, setOppna] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const g of grupper) {
      init[g.namn] = oppnaAlla;
    }
    return init;
  });

  function toggleGrupp(grupp: SigneringSchemaGrupp) {
    setOppna((prev) => ({ ...prev, [grupp.namn]: !prev[grupp.namn] }));
  }

  function allaIOppna() {
    const next: Record<string, boolean> = {};
    for (const g of grupper) next[g.namn] = true;
    setOppna(next);
  }

  function allaStangda() {
    const next: Record<string, boolean> = {};
    for (const g of grupper) next[g.namn] = false;
    setOppna(next);
  }

  if (punkter.length === 0) {
    return (
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
        Inga moment valda i schemat.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 text-xs">
        <button
          type="button"
          onClick={allaIOppna}
          className="rounded-lg border border-border px-2.5 py-1 text-muted hover:border-primary/40"
        >
          Öppna alla sektioner
        </button>
        <button
          type="button"
          onClick={allaStangda}
          className="rounded-lg border border-border px-2.5 py-1 text-muted hover:border-primary/40"
        >
          Stäng alla
        </button>
      </div>

      <ul className="space-y-2">
        {grupper.map((grupp) => {
          const arOppen = oppna[grupp.namn] ?? oppnaAlla;
          const gruppIds = grupp.punkter.map((p) => p.id);
          const antalValda = grupp.punkter.filter((p) => valdaIds.has(p.id)).length;

          return (
            <li
              key={grupp.namn}
              className="overflow-hidden rounded-xl border border-border bg-white"
            >
              <div className="flex flex-wrap items-center gap-2 border-b border-border/80 bg-background/60 px-3 py-2.5 sm:px-4">
                <button
                  type="button"
                  onClick={() => toggleGrupp(grupp)}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  aria-expanded={arOppen}
                >
                  <OppnaStangIkon oppen={arOppen} storlek="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-foreground">
                      {grupp.namn}
                    </span>
                    <span className="text-xs text-muted">
                      {antalValda} av {grupp.punkter.length} valda
                    </span>
                  </span>
                </button>
                {!readonly && onToggleGrupp && (
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => onToggleGrupp(gruppIds, true)}
                      className="rounded border border-border px-2 py-0.5 text-[10px] font-medium text-primary-dark hover:bg-[#eef6f0]"
                    >
                      Alla
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleGrupp(gruppIds, false)}
                      className="rounded border border-border px-2 py-0.5 text-[10px] text-muted hover:bg-background"
                    >
                      Inga
                    </button>
                  </div>
                )}
              </div>

              {arOppen && (
                <ul className="divide-y divide-border/60 px-2 py-1 sm:px-3">
                  {grupp.punkter.map((punkt) => {
                    const vald = valdaIds.has(punkt.id);
                    return (
                      <li key={punkt.id}>
                        <label
                          className={`flex items-start gap-3 rounded-lg px-2 py-2.5 ${
                            readonly
                              ? ""
                              : vald
                                ? "bg-[#eef6f0]/50"
                                : "hover:bg-background/80"
                          } ${readonly ? "" : "cursor-pointer"}`}
                        >
                          <input
                            type="checkbox"
                            checked={vald}
                            disabled={readonly}
                            onChange={() => onToggle(punkt.id)}
                            className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-primary focus:ring-primary disabled:opacity-60"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-medium text-foreground">
                                {punkt.etikett}
                              </span>
                              {punkt.egen && (
                                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium uppercase text-amber-900">
                                  Eget
                                </span>
                              )}
                            </span>
                            {punkt.beskrivning && (
                              <span className="mt-0.5 block text-xs leading-relaxed text-muted">
                                {punkt.beskrivning}
                              </span>
                            )}
                          </span>
                          {punkt.egen && onTaBortEget && !readonly && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                onTaBortEget(punkt.id);
                              }}
                              className="shrink-0 rounded border border-border px-2 py-1 text-xs text-muted hover:border-red-300 hover:text-red-700"
                            >
                              Ta bort
                            </button>
                          )}
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
