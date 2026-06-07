"use client";

import { useState } from "react";
import {
  beraknaAiYtaForslag,
  type FasadVaderstreckId,
} from "@/components/underhallsplan/fastighets-ytor";
import type { Grunduppgifter } from "@/components/underhallsplan/types";

type YtaAiForslagKnappProps = {
  grund: Grunduppgifter;
  husId: string;
  vaderstreck: FasadVaderstreckId;
  typ: "fasad" | "tak";
  onApply: (kvm: string) => void;
  className?: string;
};

/** Regelbaserat ytförslag — AI-hjälp utifrån boarea, våningar och läge. */
export function YtaAiForslagKnapp({
  grund,
  husId,
  vaderstreck,
  typ,
  onApply,
  className = "",
}: YtaAiForslagKnappProps) {
  const [visar, setVisar] = useState(false);
  const forslag = beraknaAiYtaForslag({ grund, husId, vaderstreck, typ });

  if (forslag.kvm <= 0) {
    return (
      <span className={`text-[10px] text-muted ${className}`} title={forslag.forklaring}>
        AI-hjälp kräver boarea
      </span>
    );
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setVisar((v) => !v)}
        className="text-[10px] font-medium text-primary-dark underline decoration-primary/40 hover:decoration-primary"
      >
        AI-förslag
      </button>
      {visar && (
        <div className="mt-1 rounded-md border border-[#d4e8da] bg-[#eef6f0]/80 px-2 py-1.5 text-[10px] text-foreground">
          <p className="font-semibold text-primary-dark">
            Förslag: {forslag.kvm.toLocaleString("sv-SE")} m²
          </p>
          <p className="mt-0.5 text-muted">{forslag.forklaring}</p>
          <button
            type="button"
            onClick={() => {
              onApply(String(forslag.kvm));
              setVisar(false);
            }}
            className="mt-1.5 rounded border border-primary bg-white px-2 py-0.5 text-[10px] font-medium text-primary-dark hover:bg-[#e2f0e6]"
          >
            Använd förslag
          </button>
        </div>
      )}
    </div>
  );
}
