"use client";

import type { TestplanDefinition, TestplanId } from "@/components/underhallsplan/testplaner";

type TestplanValjareProps = {
  planer: TestplanDefinition[];
  /** Visas i central grundmall — epokmallar för vårt arbete. */
  visaGrundmallDemo?: boolean;
  aktivPlan: TestplanId | null;
  onLadda: (id: TestplanId) => void;
  onRensa: () => void;
  onGotoSlutsida: () => void;
};

export function TestplanValjare({
  planer,
  visaGrundmallDemo = false,
  aktivPlan,
  onLadda,
  onRensa,
  onGotoSlutsida,
}: TestplanValjareProps) {
  if (planer.length === 0) return null;

  return (
    <div className="rounded-2xl border border-dashed border-primary/50 bg-[#eef6f0] p-5 sm:p-6">
      <p className="text-sm font-semibold text-primary-dark">
        {visaGrundmallDemo
          ? "Central grundmall för underhållsplanen"
          : "Föreningens underhållsplan"}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-foreground">
        {visaGrundmallDemo ? (
          <>
            Det här är grunden som nya föreningsplaner utgår från. Epokmallarna
            (sekelskifte, 50-, 70- och 90-tal) är centrala arbetsverktyg — inte
            färdiga föreningsplaner. Endast ni centralt ska ändra här;
            styrelserna bygger och ändrar i sin egen plan och kan importera
            saknade delar från er.
          </>
        ) : (
          <>
            Här arbetar styrelsen i <strong>er egen</strong> underhållsplan —
            den ska bli enkel, överskådlig och anpassad för er. Den centrala
            grundmallen ändras bara centralt; ni kan importera saknade delar till
            er plan i steg 3.
          </>
        )}
      </p>
      {!visaGrundmallDemo && (
        <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted">
          Startunderlag (valfritt)
        </p>
      )}
      {visaGrundmallDemo && (
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
      )}
      <div className={`${visaGrundmallDemo ? "mt-4" : "mt-2"} flex flex-wrap gap-2`}>
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
            {visaGrundmallDemo
              ? `Epokmall · ${plan.kortNamn}`
              : `Ladda startunderlag · ${plan.kortNamn}`}
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
              {visaGrundmallDemo ? "Rensa malldata" : "Rensa startunderlag"}
            </button>
          </>
        )}
      </div>
      {aktivPlan && (
        <p className="mt-3 text-xs text-muted">
          Aktiv: {planer.find((p) => p.id === aktivPlan)?.namn}.
          {visaGrundmallDemo
            ? " Detta är central malldata — inte en förenings färdiga plan."
            : " Startunderlaget kan ni anpassa fritt; det blir er förenings plan."}
        </p>
      )}
    </div>
  );
}
