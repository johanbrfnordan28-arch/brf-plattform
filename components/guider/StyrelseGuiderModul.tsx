"use client";

import { useMemo, useState } from "react";
import { KortGuideFilm } from "@/components/guider/KortGuideFilm";
import { ProjektutvarderingForm } from "@/components/guider/ProjektutvarderingForm";
import { SbaArbeteForm } from "@/components/guider/SbaArbeteForm";
import { guideFilmer, guideTips } from "@/components/guider/guider";

type TipsFilter =
  | "alla"
  | "upphandling"
  | "entreprenor"
  | "projekt"
  | "brandskydd";

const tipsKategoriEtikett: Record<
  (typeof guideTips)[number]["kategori"],
  string
> = {
  upphandling: "Upphandling",
  entreprenor: "Entreprenörer",
  projekt: "Projekt",
  brandskydd: "Brandskydd",
};

const filterKnappar = [
  ["alla", "Alla"],
  ["upphandling", "Upphandling"],
  ["entreprenor", "Entreprenörer"],
  ["projekt", "Projekt"],
  ["brandskydd", "Brandskydd"],
] as const;

const FILMER_MED_FORMULAR = ["projektutvardering", "brandskydd-sba"] as const;

const TIPS_MED_FORMULAR = ["projektutvardering", "sba-arbete"] as const;

export function StyrelseGuiderModul() {
  const [tipsFilter, setTipsFilter] = useState<TipsFilter>("alla");

  const projektFilm = useMemo(
    () => guideFilmer.find((f) => f.id === "projektutvardering"),
    [],
  );
  const sbaFilm = useMemo(
    () => guideFilmer.find((f) => f.id === "brandskydd-sba"),
    [],
  );
  const ovrigaFilmer = useMemo(
    () => guideFilmer.filter((f) => !FILMER_MED_FORMULAR.includes(f.id as typeof FILMER_MED_FORMULAR[number])),
    [],
  );

  const filtreradeTips = guideTips.filter(
    (tips) => tipsFilter === "alla" || tips.kategori === tipsFilter,
  );

  const visaProjektSektion =
    tipsFilter === "alla" || tipsFilter === "projekt";
  const visaSbaSektion =
    tipsFilter === "alla" || tipsFilter === "brandskydd";
  const visaFilmer = tipsFilter === "alla";
  const visaTipsLista =
    tipsFilter === "alla" ||
    tipsFilter === "upphandling" ||
    tipsFilter === "entreprenor" ||
    (tipsFilter === "projekt" && filtreradeTips.length > 0) ||
    (tipsFilter === "brandskydd" && filtreradeTips.length > 0);

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <p className="max-w-2xl text-sm leading-relaxed text-muted">
          Korta filmer och praktiska råd för styrelsen. Under Projekt och
          Brandskydd finns film, formulär och checklista — payback-kalkyl
          respektive årlig SBA-kontroll.
        </p>
        <div className="flex flex-wrap gap-2">
          {filterKnappar.map(([id, etikett]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTipsFilter(id)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                tipsFilter === id
                  ? "bg-primary text-white"
                  : "border border-border bg-white text-muted hover:border-primary/50"
              }`}
            >
              {etikett}
            </button>
          ))}
        </div>
      </div>

      {visaSbaSektion && (
        <section id="sba-arbete" className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Systematiskt brandskyddsarbete (SBA)
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Se filmen om förbyggande brandskydd, fyll i formuläret med årlig
              kontroll och bocka av checklistan — brandvarnare, utrymning,
              medlemmars renovering och entreprenörens dokumentation vid större
              projekt.
            </p>
          </div>
          {sbaFilm && (
            <div className="max-w-xl">
              <KortGuideFilm film={sbaFilm} />
            </div>
          )}
          <SbaArbeteForm />
        </section>
      )}

      {visaProjektSektion && (
        <section id="projektutvardering" className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">Projektutvärdering</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Se filmen om ekonomi före och efter, fyll i formuläret med era
              siffror och bocka av checklistan — payback time och kassa-plus
              räknas automatiskt.
            </p>
          </div>
          {projektFilm && (
            <div className="max-w-xl">
              <KortGuideFilm film={projektFilm} />
            </div>
          )}
          <ProjektutvarderingForm />
        </section>
      )}

      {visaFilmer && (
        <section>
          <h2 className="text-xl font-bold text-foreground">
            AI-filmer om funktionerna
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Tryck Spela film i den mörka rutan — scenerna rullar som en kort demo
            (ca 30–60 sek). Saknas ljud och riktig video är det avsiktligt i demo.
          </p>
          <ul className="mt-6 grid gap-5 sm:grid-cols-2">
            {ovrigaFilmer.map((film) => (
              <li key={film.id}>
                <KortGuideFilm film={film} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {visaTipsLista && (
        <section>
          <h2 className="text-xl font-bold text-foreground">Tips och råd</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            {tipsFilter === "projekt" || tipsFilter === "brandskydd"
              ? "Checklistan finns också integrerad i formuläret ovan."
              : "Praktiska punkter för styrelsen — upphandling, entreprenörer, projekt och brandskydd."}
          </p>

          <ul className="mt-6 space-y-4">
            {filtreradeTips.map((tips) => (
              <li
                key={tips.id}
                className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6"
              >
                <span className="text-xs font-semibold uppercase tracking-wide text-primary-dark">
                  {tipsKategoriEtikett[tips.kategori]}
                </span>
                <h3 className="mt-2 text-lg font-semibold text-foreground">
                  {tips.titel}
                </h3>
                <p className="mt-2 text-sm text-muted">{tips.ingress}</p>
                {!TIPS_MED_FORMULAR.includes(
                  tips.id as (typeof TIPS_MED_FORMULAR)[number],
                ) && (
                  <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-foreground">
                    {tips.punkter.map((punkt) => (
                      <li key={punkt}>{punkt}</li>
                    ))}
                  </ul>
                )}
                {TIPS_MED_FORMULAR.includes(
                  tips.id as (typeof TIPS_MED_FORMULAR)[number],
                ) && (
                  <p className="mt-4 text-sm text-muted">
                    Alla {tips.punkter.length} punkter finns som bockbara i
                    formuläret ovan.
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
