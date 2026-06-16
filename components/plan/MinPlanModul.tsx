"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  lasUnderhallsplanState,
  sparaUnderhallsplanState,
  type UnderhallsplanLagratState,
} from "@/components/underhallsplan/underhallsplan-lager";
import {
  foreslagnaKomponenter,
  skapaTomKomponentDetalj,
  synkaUnderhallsplanState,
} from "@/components/underhallsplan/komponentregister";
import { standardPlaninstallningar } from "@/components/underhallsplan/planinstallningar";
import type { Grunduppgifter } from "@/components/underhallsplan/types";

const tomGrund: Grunduppgifter = {
  boarea: "",
  lokalyta: "",
  antalLagenheter: "",
  byggar: "",
  tomtstorlek: "",
  antalVaningar: "",
  antalByggnader: "",
  adresser: [],
  uppvarmning: "",
  ventilationssystem: "",
  fastighetsbeteckning: "",
};

function skapaInitialtState(): UnderhallsplanLagratState {
  return {
    version: 1,
    sparad: new Date().toISOString(),
    aktivTestplan: null,
    planNamn: null,
    planNotering: null,
    grund: tomGrund,
    planinstallningar: standardPlaninstallningar(),
    grundSaved: false,
    renoveringarSaved: false,
    komponenterSaved: false,
    besiktningarSaved: false,
    activeComponents: [],
    komponentDetaljer: {},
    besiktningar: [],
    renoveringarLista: [],
    renoveringSammanfattning: null,
    krPerKvmAr: 0,
  };
}

export function MinPlanModul() {
  const [hydrated, setHydrated] = useState(false);
  const [planNamn, setPlanNamn] = useState("");
  const [planNotering, setPlanNotering] = useState("");
  const [activeComponents, setActiveComponents] = useState<string[]>([]);
  const [egetNamn, setEgetNamn] = useState("");
  const [sparatMeddelande, setSparatMeddelande] = useState<string | null>(null);
  const sparatTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const state = lasUnderhallsplanState() ?? skapaInitialtState();
    setPlanNamn(state.planNamn ?? "");
    setPlanNotering(state.planNotering ?? "");
    setActiveComponents(state.activeComponents);
    setHydrated(true);
  }, []);

  const sparaState = useCallback(
    (
      nyttNamn: string,
      nyNotering: string,
      nyaKomponenter: string[],
    ) => {
      const befintlig = lasUnderhallsplanState() ?? skapaInitialtState();
      const { activeComponents: synkadeKomponenter, register } =
        synkaUnderhallsplanState(nyaKomponenter, befintlig.komponentDetaljer);

      const nyaDetaljer = { ...register };
      for (const namn of synkadeKomponenter) {
        if (!nyaDetaljer[namn]) {
          nyaDetaljer[namn] = skapaTomKomponentDetalj(namn);
        }
      }

      const uppdaterad: UnderhallsplanLagratState = {
        ...befintlig,
        sparad: new Date().toISOString(),
        planNamn: nyttNamn.trim() || null,
        planNotering: nyNotering.trim() || null,
        activeComponents: synkadeKomponenter,
        komponentDetaljer: nyaDetaljer,
      };

      sparaUnderhallsplanState(uppdaterad);

      if (sparatTimerRef.current) clearTimeout(sparatTimerRef.current);
      setSparatMeddelande("Planen sparad");
      sparatTimerRef.current = setTimeout(() => setSparatMeddelande(null), 2500);
    },
    [],
  );

  const laggTillKomponent = useCallback(
    (namn: string) => {
      const trimmat = namn.trim();
      if (!trimmat || activeComponents.includes(trimmat)) return;
      const ny = [...activeComponents, trimmat];
      setActiveComponents(ny);
      sparaState(planNamn, planNotering, ny);
    },
    [activeComponents, planNamn, planNotering, sparaState],
  );

  const taBortKomponent = useCallback(
    (namn: string) => {
      const ny = activeComponents.filter((k) => k !== namn);
      setActiveComponents(ny);
      sparaState(planNamn, planNotering, ny);
    },
    [activeComponents, planNamn, planNotering, sparaState],
  );

  const sparaMetadata = useCallback(() => {
    sparaState(planNamn, planNotering, activeComponents);
  }, [activeComponents, planNamn, planNotering, sparaState]);

  const laggTillEgetNamn = useCallback(() => {
    if (!egetNamn.trim()) return;
    laggTillKomponent(egetNamn.trim());
    setEgetNamn("");
  }, [egetNamn, laggTillKomponent]);

  const ejAktiveForeslagnaKomponenter = foreslagnaKomponenter.filter(
    (k) => !activeComponents.includes(k),
  );

  if (!hydrated) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 rounded-lg bg-border/40" />
        <div className="h-24 rounded-lg bg-border/40" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Plannamn och notering */}
      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Planens namn och beskrivning
        </h2>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="plan-namn"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Plannamn
            </label>
            <input
              id="plan-namn"
              type="text"
              value={planNamn}
              onChange={(e) => setPlanNamn(e.target.value)}
              onBlur={sparaMetadata}
              placeholder="t.ex. Underhållsplan 2025–2075"
              className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label
              htmlFor="plan-notering"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Notering (valfri)
            </label>
            <textarea
              id="plan-notering"
              value={planNotering}
              onChange={(e) => setPlanNotering(e.target.value)}
              onBlur={sparaMetadata}
              placeholder="Kortfattad beskrivning av planen, syfte eller status..."
              rows={3}
              className="w-full resize-none rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          {sparatMeddelande && (
            <p className="text-sm font-medium text-primary-dark">
              {sparatMeddelande}
            </p>
          )}
        </div>
      </section>

      {/* Aktiva komponenter */}
      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Planens komponenter
          </h2>
          <span className="rounded-full bg-[#e2f0e6] px-3 py-0.5 text-sm font-medium text-primary-dark">
            {activeComponents.length} st
          </span>
        </div>

        {activeComponents.length === 0 ? (
          <p className="text-sm text-muted">
            Inga komponenter tillagda ännu. Lägg till komponenter nedan.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {activeComponents.map((namn) => (
              <li key={namn}>
                <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-1.5 text-sm font-medium text-foreground shadow-sm">
                  {namn}
                  <button
                    type="button"
                    onClick={() => taBortKomponent(namn)}
                    aria-label={`Ta bort ${namn}`}
                    className="flex h-4 w-4 items-center justify-center rounded-full text-muted transition-colors hover:bg-red-100 hover:text-red-600"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="h-3 w-3"
                      aria-hidden
                    >
                      <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
                    </svg>
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Lägg till komponenter */}
      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Lägg till komponent
        </h2>

        {/* Föreslagna standardkomponenter */}
        {ejAktiveForeslagnaKomponenter.length > 0 && (
          <div className="mb-6">
            <p className="mb-3 text-sm font-medium text-muted">
              Standardkomponenter
            </p>
            <div className="flex flex-wrap gap-2">
              {ejAktiveForeslagnaKomponenter.map((namn) => (
                <button
                  key={namn}
                  type="button"
                  onClick={() => laggTillKomponent(namn)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-[#eef6f0] px-3 py-1.5 text-sm font-medium text-primary-dark transition-colors hover:bg-[#daeee1] hover:border-primary/50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="h-3.5 w-3.5"
                    aria-hidden
                  >
                    <path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
                  </svg>
                  {namn}
                </button>
              ))}
            </div>
          </div>
        )}

        {ejAktiveForeslagnaKomponenter.length === 0 && (
          <p className="mb-6 text-sm text-muted">
            Alla standardkomponenter är redan tillagda i planen.
          </p>
        )}

        {/* Eget komponentnamn */}
        <div>
          <p className="mb-3 text-sm font-medium text-muted">
            Eget komponentnamn
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={egetNamn}
              onChange={(e) => setEgetNamn(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  laggTillEgetNamn();
                }
              }}
              placeholder="t.ex. Pool, Lekplats, Flaggstång..."
              className="flex-1 rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="button"
              onClick={laggTillEgetNamn}
              disabled={!egetNamn.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-40"
            >
              Lägg till
            </button>
          </div>
        </div>
      </section>

      {/* Länk till underhållsplansguiden */}
      <div className="rounded-xl border border-primary/20 bg-[#eef6f0] p-5">
        <p className="text-sm font-semibold text-primary-dark">
          Vill du lägga till mer detaljer?
        </p>
        <p className="mt-1 text-sm text-foreground">
          I underhållsplanen kan du fylla i byggnadens grunduppgifter,
          underkomponenter, renoveringshistorik, besiktningar och 50-årsbudget
          för varje komponent.
        </p>
        <a
          href="/forening/underhallsplan"
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-white px-4 py-2 text-sm font-medium text-primary-dark transition-colors hover:bg-[#daeee1]"
        >
          Gå till underhållsplanen
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="h-3.5 w-3.5"
            aria-hidden
          >
            <path
              fillRule="evenodd"
              d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </a>
      </div>
    </div>
  );
}
