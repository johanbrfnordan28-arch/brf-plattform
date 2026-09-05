"use client";

import type { TestplanDefinition, TestplanId } from "@/components/underhallsplan/testplaner";

type TestplanValjareProps = {
  planer: TestplanDefinition[];
  aktivPlan: TestplanId | null;
  onLadda: (id: TestplanId) => void;
  onRensa: () => void;
  onGotoSlutsida: () => void;
};

/** Epokmallar — endast i central grundmall. */
export function TestplanValjare({
  planer,
  aktivPlan,
  onLadda,
  onRensa,
  onGotoSlutsida,
}: TestplanValjareProps) {
  if (planer.length === 0) return null;

  return (
    <div className="rounded-2xl border border-dashed border-primary/50 bg-[#eef6f0] p-5 sm:p-6">
      <p className="text-sm font-semibold text-primary-dark">
        Central grundmall för underhållsplanen
      </p>
      <p className="mt-2 text-sm leading-relaxed text-foreground">
        Det här är grunden som nya föreningsplaner utgår från. Epokmallarna
        (sekelskifte, 50-, 70- och 90-tal) är centrala arbetsverktyg — inte
        färdiga föreningsplaner. Endast ni centralt ska ändra här; styrelserna
        bygger och ändrar i sin egen plan. De kan öppna grundmallen skrivskyddat,
        importera saknade delar och ta bort det som inte är aktuellt för deras
        fastighet.
      </p>
      <div className="mt-4 rounded-xl border border-amber-300/70 bg-amber-50/80 px-4 py-3">
        <p className="text-sm font-semibold text-amber-950">
          Test av kostnadsfördelning (klumpsummor)
        </p>
        <p className="mt-1 text-sm text-amber-950/90">
          <strong>Tallvinden (50-tal)</strong> — stambyte som klumpsumma fördelas på
          VVS-delar; fönster i etapper per väderstreck.{" "}
          <strong>Parklyckan (70-tal)</strong> — totalentreprenad tak + fasad som delas
          automatiskt. Lägg till egna poster under steg 4.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {(["test-50", "test-70"] as const).map((id) => {
            const plan = planer.find((p) => p.id === id);
            if (!plan) return null;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onLadda(id)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  aktivPlan === id
                    ? "bg-amber-800 text-white"
                    : "border border-amber-700/40 bg-white text-amber-950 hover:bg-amber-100"
                }`}
              >
                {plan.kortNamn} — fördelning
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {planer.map((plan) => (
          <button
            key={plan.id}
            type="button"
            onClick={() => onLadda(plan.id)}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              aktivPlan === plan.id
                ? "bg-primary text-white"
                : "border border-primary bg-white text-primary-dark hover:bg-[#e2f0e6]"
            }`}
          >
            Epokmall · {plan.kortNamn}
          </button>
        ))}
        {aktivPlan && (
          <>
            <button
              type="button"
              onClick={onGotoSlutsida}
              className="rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-foreground hover:border-primary/50"
            >
              Gå till slutsida ↓
            </button>
            <button
              type="button"
              onClick={onRensa}
              className="rounded-lg border border-border px-3 py-2 text-sm text-muted hover:text-foreground"
            >
              Rensa malldata
            </button>
          </>
        )}
      </div>
      {aktivPlan && (
        <p className="mt-3 text-xs text-muted">
          Aktiv: {planer.find((p) => p.id === aktivPlan)?.namn}. Detta är central
          malldata — inte en förenings färdiga plan.
        </p>
      )}
    </div>
  );
}
