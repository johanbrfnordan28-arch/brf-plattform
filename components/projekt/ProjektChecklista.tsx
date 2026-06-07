"use client";

import { useMemo } from "react";
import {
  beraknaChecklistaFramsteg,
  checklistaPunktId,
  hamtaProjektChecklista,
  projektStorlekBeskrivning,
  projektStorlekEtiketter,
  type ProjektStorlek,
} from "@/components/projekt/projekt-checklistor";

type ProjektChecklistaProps = {
  storlek: ProjektStorlek;
  klaraPunkter: string[];
  onTogglePunkt: (punktKey: string) => void;
  onStorlekChange?: (storlek: ProjektStorlek) => void;
  visaStorlekVal?: boolean;
  /** Öppna undermapp och bocka punkt (om ej redan klar). */
  onÖppnaMapp?: (mappId: string, punktKey: string) => void;
  /** Visar mappnamn vid länk — om undefined används mappId. */
  mappEtiketter?: Record<string, string>;
  /** Rullgardin öppen från start (t.ex. vid skapa projekt). */
  defaultÖppen?: boolean;
  /** Kompakt summary utan yttre ram (inuti annan ruta). */
  inbäddad?: boolean;
};

export function ProjektChecklista({
  storlek,
  klaraPunkter,
  onTogglePunkt,
  onStorlekChange,
  visaStorlekVal = false,
  onÖppnaMapp,
  mappEtiketter,
  defaultÖppen = false,
  inbäddad = false,
}: ProjektChecklistaProps) {
  const { start, avslut } = useMemo(
    () => hamtaProjektChecklista(storlek),
    [storlek],
  );

  const framsteg = useMemo(
    () => beraknaChecklistaFramsteg(storlek, klaraPunkter),
    [storlek, klaraPunkter],
  );

  const klaraSet = useMemo(() => new Set(klaraPunkter), [klaraPunkter]);

  const startKlart =
    framsteg.start.totalt > 0 && framsteg.start.klara === framsteg.start.totalt;
  const avslutKlart =
    framsteg.avslut.totalt > 0 && framsteg.avslut.klara === framsteg.avslut.totalt;

  const totaltKlara = framsteg.start.klara + framsteg.avslut.klara;
  const totaltAntal = framsteg.start.totalt + framsteg.avslut.totalt;

  function renderSektion(
    sektion: typeof start,
    fas: "start" | "avslut",
    stat: { klara: number; totalt: number },
    klart: boolean,
  ) {
    return (
      <section key={sektion.id} className="rounded-xl border border-border bg-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h4 className="text-base font-semibold text-foreground">{sektion.etikett}</h4>
            {sektion.beskrivning && (
              <p className="mt-1 text-xs leading-relaxed text-muted">
                {sektion.beskrivning}
              </p>
            )}
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              klart
                ? "bg-[#eef6f0] text-primary-dark"
                : "bg-amber-50 text-amber-950"
            }`}
          >
            {stat.klara} av {stat.totalt} klara
          </span>
        </div>

        <ul className="mt-4 space-y-2">
          {sektion.punkter.map((punkt) => {
            const key = checklistaPunktId(fas, punkt.id);
            const klar = klaraSet.has(key);
            const mappEtikett =
              punkt.mappId &&
              (mappEtiketter?.[punkt.mappId] ?? punkt.mappId);
            return (
              <li key={key}>
                <div
                  className={`rounded-lg border transition-colors ${
                    klar
                      ? "border-primary/40 bg-[#eef6f0]"
                      : "border-border bg-background/50"
                  }`}
                >
                  <label className="flex cursor-pointer gap-3 px-3 py-2.5">
                    <input
                      type="checkbox"
                      checked={klar}
                      onChange={() => onTogglePunkt(key)}
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
                  {punkt.mappId && onÖppnaMapp && (
                    <div className="border-t border-border/60 px-3 pb-2.5 pt-0">
                      <button
                        type="button"
                        onClick={() => onÖppnaMapp(punkt.mappId!, key)}
                        className="text-xs font-medium text-primary-dark underline-offset-2 hover:underline"
                      >
                        → Öppna mappen {mappEtikett}
                        {!klar && " (bockas av)"}
                      </button>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    );
  }

  const innehåll = (
    <div className="space-y-4 pt-2">
      {visaStorlekVal && onStorlekChange && (
        <fieldset>
          <legend className="text-sm font-medium text-foreground">Projektstorlek</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {(["litet", "stort"] as const).map((id) => (
              <label
                key={id}
                className={`cursor-pointer rounded-lg border p-3 ${
                  storlek === id
                    ? "border-primary bg-white"
                    : "border-border bg-background/80"
                }`}
              >
                <input
                  type="radio"
                  name="projekt-storlek"
                  value={id}
                  checked={storlek === id}
                  onChange={() => onStorlekChange(id)}
                  className="sr-only"
                />
                <span className="block text-sm font-semibold text-foreground">
                  {projektStorlekEtiketter[id]}
                </span>
                <span className="mt-1 block text-xs text-muted">
                  {projektStorlekBeskrivning[id]}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {!visaStorlekVal && (
        <p className="text-xs text-muted">
          {projektStorlekEtiketter[storlek]} — {projektStorlekBeskrivning[storlek]}
        </p>
      )}

      <p className="text-xs leading-relaxed text-muted">
        Klicka på länken under en punkt för att hoppa till rätt undermapp. När du
        laddar upp dokument bockas punkten av automatiskt.
      </p>

      <div className="space-y-4">
        {renderSektion(start, "start", framsteg.start, startKlart)}
        {renderSektion(avslut, "avslut", framsteg.avslut, avslutKlart)}
      </div>

      {startKlart && !avslutKlart && (
        <p className="rounded-lg border border-primary/30 bg-white px-3 py-2 text-sm text-primary-dark">
          Startkraven är uppfyllda — entreprenören kan påbörja enligt plan.
        </p>
      )}
      {avslutKlart && (
        <p className="rounded-lg border border-primary/30 bg-white px-3 py-2 text-sm text-primary-dark">
          Avslutskraven är uppfyllda — projektet kan markeras som avslutat.
        </p>
      )}
    </div>
  );

  const wrapperClass = inbäddad
    ? ""
    : "rounded-2xl border border-primary/20 bg-[#eef6f0]/40";

  return (
    <details
      className={`group ${wrapperClass} ${inbäddad ? "" : "p-0 sm:p-0"}`}
      open={defaultÖppen || undefined}
    >
      <summary
        className={`cursor-pointer list-none [&::-webkit-details-marker]:hidden ${
          inbäddad ? "px-0 py-2" : "rounded-2xl px-4 py-4 sm:px-5 sm:py-5"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-primary-dark">Projektchecklista</p>
            <p className="mt-0.5 text-xs text-muted">
              {totaltKlara} av {totaltAntal} klara · Start{" "}
              {framsteg.start.klara}/{framsteg.start.totalt} · Avslut{" "}
              {framsteg.avslut.klara}/{framsteg.avslut.totalt}
            </p>
          </div>
          <span className="shrink-0 text-sm text-muted group-open:hidden">Visa ▼</span>
          <span className="hidden shrink-0 text-sm text-muted group-open:inline">
            Dölj ▲
          </span>
        </div>
      </summary>
      <div className={inbäddad ? "pb-2" : "border-t border-primary/15 px-4 pb-5 sm:px-5"}>
        {innehåll}
      </div>
    </details>
  );
}
