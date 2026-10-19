"use client";

import { useMemo, useState } from "react";
import { OppnaStangIkon } from "@/components/OppnaStangKnapp";
import {
  beraknaEffektivFramsteg,
  byggEffektivChecklista,
  type ChecklistaAnpassning,
} from "@/components/rondering/checklist-effektiv";
import {
  checklistaPunktNyckel,
  ronderingChecklistaBeskrivningar,
  ronderingChecklistaEtiketter,
  type RonderingChecklistaTyp,
} from "@/components/rondering/checklist-mallar";
import type { ForeningEgenskaper } from "@/components/rondering/forening-egenskaper";

type RonderingChecklistaProps = {
  typ: RonderingChecklistaTyp;
  egenskaper: ForeningEgenskaper;
  anpassning: ChecklistaAnpassning;
  klaraPunkter: string[];
  onTogglePunkt: (nyckel: string) => void;
  onRapporteraAvvikelse?: (nyckel: string, punktText: string) => void;
  defaultÖppen?: boolean;
};

const allaTyper: RonderingChecklistaTyp[] = [
  "rondering-utvandig",
  "rondering-invandig",
  "stadning",
];

export function RonderingChecklistaVal({
  aktivTyp,
  onTypChange,
  framstegPerTyp,
}: {
  aktivTyp: RonderingChecklistaTyp;
  onTypChange: (typ: RonderingChecklistaTyp) => void;
  framstegPerTyp: Record<RonderingChecklistaTyp, { klara: number; totalt: number }>;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {allaTyper.map((typ) => {
        const stat = framstegPerTyp[typ];
        const aktiv = typ === aktivTyp;
        return (
          <button
            key={typ}
            type="button"
            onClick={() => onTypChange(typ)}
            className={`rounded-xl border p-3 text-left transition-colors ${
              aktiv
                ? "border-primary bg-white shadow-sm"
                : "border-border bg-background/80 hover:border-primary/30"
            }`}
          >
            <span className="block text-sm font-semibold text-foreground">
              {ronderingChecklistaEtiketter[typ]}
            </span>
            <span className="mt-1 block text-xs text-muted">
              {stat.klara} av {stat.totalt} klara
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function RonderingChecklista({
  typ,
  egenskaper,
  anpassning,
  klaraPunkter,
  onTogglePunkt,
  onRapporteraAvvikelse,
  defaultÖppen = true,
}: RonderingChecklistaProps) {
  const mall = useMemo(
    () => byggEffektivChecklista(typ, egenskaper, anpassning),
    [typ, egenskaper, anpassning],
  );
  const framsteg = useMemo(
    () => beraknaEffektivFramsteg(typ, klaraPunkter, egenskaper, anpassning),
    [typ, klaraPunkter, egenskaper, anpassning],
  );
  const klaraSet = useMemo(() => new Set(klaraPunkter), [klaraPunkter]);
  const alltKlart = framsteg.totalt > 0 && framsteg.klara === framsteg.totalt;
  const [oppnaSektion, setOppnaSektion] = useState<string | null>(
    () => mall.sektioner[0]?.id ?? null,
  );

  return (
    <details
      className="rounded-2xl border border-primary/20 bg-[#eef6f0]/40"
      open={defaultÖppen || undefined}
    >
      <summary className="cursor-pointer list-none rounded-2xl px-4 py-4 sm:px-5 sm:py-5 [&::-webkit-details-marker]:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-primary-dark">{mall.titel}</p>
            <p className="mt-0.5 text-xs text-muted">
              {framsteg.klara} av {framsteg.totalt} klara ({framsteg.procent} %) ·
              anpassad för er förening
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              alltKlart
                ? "bg-[#eef6f0] text-primary-dark"
                : "bg-amber-50 text-amber-950"
            }`}
          >
            {alltKlart ? "Genomförd" : "Pågår"}
          </span>
        </div>
      </summary>

      <div className="border-t border-primary/15 px-4 pb-5 sm:px-5">
        <p className="pt-3 text-xs leading-relaxed text-muted">
          {ronderingChecklistaBeskrivningar[typ]} Bocka av vid genomgång. Vid brist:
          rapportera avvikelse.
        </p>

        {mall.sektioner.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed border-border bg-white px-3 py-4 text-sm text-muted">
            Inga punkter ingår med nuvarande egenskaper. Aktivera fler egenskaper
            ovan eller lägg till egna punkter under Anpassa.
          </p>
        ) : (
          <div className="mt-4 space-y-2">
            {mall.sektioner.map((sektion) => {
              const oppen = oppnaSektion === sektion.id;
              const klaraISektion = sektion.punkter.filter((punkt) =>
                klaraSet.has(checklistaPunktNyckel(typ, sektion.id, punkt.id)),
              ).length;
              return (
              <section
                key={sektion.id}
                className="overflow-hidden rounded-xl border border-border bg-white"
              >
                <button
                  type="button"
                  aria-expanded={oppen}
                  onClick={() =>
                    setOppnaSektion((nu) => (nu === sektion.id ? null : sektion.id))
                  }
                  className="flex w-full items-center gap-2 px-4 py-3 text-left"
                >
                  <OppnaStangIkon oppen={oppen} storlek="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-foreground">
                      {sektion.etikett}
                    </span>
                    <span className="text-xs text-muted">
                      {klaraISektion} av {sektion.punkter.length} klara
                      {sektion.beskrivning ? ` · ${sektion.beskrivning}` : ""}
                    </span>
                  </span>
                </button>
                {oppen && (
                <ul className="space-y-2 border-t border-border/70 px-3 py-3">
                  {sektion.punkter.map((punkt) => {
                    const nyckel = checklistaPunktNyckel(typ, sektion.id, punkt.id);
                    const klar = klaraSet.has(nyckel);
                    return (
                      <li key={nyckel}>
                        <div
                          className={`rounded-lg border ${
                            klar
                              ? "border-primary/40 bg-[#eef6f0]"
                              : "border-border bg-background/50"
                          }`}
                        >
                          <label className="flex cursor-pointer gap-3 px-3 py-2.5">
                            <input
                              type="checkbox"
                              checked={klar}
                              onChange={() => onTogglePunkt(nyckel)}
                              className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-primary"
                            />
                            <span
                              className={`text-sm leading-relaxed ${
                                klar ? "text-primary-dark" : "text-foreground"
                              }`}
                            >
                              {punkt.text}
                            </span>
                          </label>
                          {onRapporteraAvvikelse && (
                            <div className="border-t border-border/60 px-3 pb-2">
                              <button
                                type="button"
                                onClick={() =>
                                  onRapporteraAvvikelse(nyckel, punkt.text)
                                }
                                className="text-xs font-medium text-amber-900 underline-offset-2 hover:underline"
                              >
                                Rapportera avvikelse för denna punkt
                              </button>
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
                )}
              </section>
            );
            })}
          </div>
        )}
      </div>
    </details>
  );
}
