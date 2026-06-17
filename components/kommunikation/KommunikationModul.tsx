"use client";

import { useEffect, useState } from "react";
import {
  KOMMUNIKATION_EVENT,
  lasKommunikationState,
  sparaKommunikationState,
  type KommunikationState,
} from "@/components/kommunikation/kommunikation-lager";
import { UtskickModul } from "@/components/kommunikation/UtskickModul";
import { ArendeModul } from "@/components/kommunikation/ArendeModul";
import { MedlemsRegisterModul } from "@/components/kommunikation/MedlemsRegisterModul";

type Flik = "utskick" | "arenden" | "medlemmar";

export function KommunikationModul() {
  const [flik, setFlik] = useState<Flik>("arenden");
  const [state, setState] = useState<KommunikationState>({
    version: 1,
    medlemmar: [],
    utskick: [],
    arenden: [],
    arendeRaknare: {},
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(lasKommunikationState());
    setHydrated(true);
    const h = () => setState(lasKommunikationState());
    window.addEventListener(KOMMUNIKATION_EVENT, h);
    return () => window.removeEventListener(KOMMUNIKATION_EVENT, h);
  }, []);

  function uppdatera(ny: KommunikationState) {
    setState(ny);
    sparaKommunikationState(ny);
  }

  if (!hydrated) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-10 rounded-lg bg-border/40" />
        <div className="h-32 rounded-xl bg-border/40" />
      </div>
    );
  }

  const oppnaArenden = state.arenden.filter(
    (a) => a.status === "oppet" || a.status === "pagaende",
  ).length;

  const tabs: { id: Flik; label: string; badge?: number }[] = [
    { id: "arenden", label: "Ärenden", badge: oppnaArenden || undefined },
    { id: "utskick", label: "Utskick", badge: state.utskick.length || undefined },
    { id: "medlemmar", label: "Medlemsregister", badge: state.medlemmar.filter((m) => m.aktiv).length || undefined },
  ];

  return (
    <div className="space-y-6">
      {/* Flikar */}
      <div className="flex flex-wrap gap-1 rounded-xl border border-border bg-surface p-1">
        {tabs.map(({ id, label, badge }) => (
          <button
            key={id}
            type="button"
            onClick={() => setFlik(id)}
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors ${flik === id ? "bg-white text-foreground shadow-sm" : "text-muted hover:text-foreground"}`}
          >
            {label}
            {badge !== undefined && badge > 0 && (
              <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs font-bold ${flik === id ? "bg-primary text-white" : "bg-border/50 text-muted"}`}>
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Innehåll */}
      {flik === "arenden" && (
        <ArendeModul state={state} onUppdatera={uppdatera} />
      )}
      {flik === "utskick" && (
        <UtskickModul state={state} onUppdatera={uppdatera} />
      )}
      {flik === "medlemmar" && (
        <MedlemsRegisterModul state={state} onUppdatera={uppdatera} />
      )}
    </div>
  );
}
