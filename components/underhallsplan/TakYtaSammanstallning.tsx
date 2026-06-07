"use client";

import {
  normaliseraFastighetsYtor,
  summeraTakKvm,
} from "@/components/underhallsplan/fastighets-ytor";
import { normaliseraGrund } from "@/components/underhallsplan/grund-synk";
import { YtaAiForslagKnapp } from "@/components/underhallsplan/YtaAiForslagKnapp";
import type { Grunduppgifter } from "@/components/underhallsplan/types";

type TakYtaSammanstallningProps = {
  grund: Grunduppgifter;
  registerTakKvm: string;
  onApplyGrundSummaTillRegister?: (kvm: string) => void;
  /** Första hus i grunden — AI-förslag för tak per hus. */
  visaAiPerHus?: boolean;
  onTakPerHusChange?: (husId: string, kvm: string) => void;
};

function parseKvm(text: string): number {
  const n = Number.parseFloat(text.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function TakYtaSammanstallning({
  grund,
  registerTakKvm,
  onApplyGrundSummaTillRegister,
  visaAiPerHus = false,
  onTakPerHusChange,
}: TakYtaSammanstallningProps) {
  const grundNorm = normaliseraGrund(grund);
  const ytor = normaliseraFastighetsYtor(grundNorm.fastighetsYtor);
  const grundKvm = summeraTakKvm(ytor);
  const registerKvm = parseKvm(registerTakKvm);

  if (grundKvm <= 0 && registerKvm <= 0) {
    return (
      <p className="mt-2 text-[10px] text-muted">
        Fyll i takytor under grunduppgifter (steg 1) eller använd «Be om hjälp»
        ovan (Google Earth och egen bild).
      </p>
    );
  }

  return (
    <div className="mt-3 rounded-lg border border-[#d4e8da] bg-[#eef6f0]/30 px-3 py-2">
      <p className="text-xs font-semibold text-primary-dark">
        Sammanställning takyta
      </p>
      {!ytor.endastTotalTak && ytor.hus.length > 0 && (
        <ul className="mt-2 space-y-0.5 text-xs">
          {ytor.hus.map((h) => {
            const kvm = parseKvm(ytor.takPerHus[h.id]);
            if (kvm <= 0 && !visaAiPerHus) return null;
            return (
              <li key={h.id} className="flex flex-wrap items-center gap-2">
                <span>
                  {h.husnummer}:{" "}
                  {kvm > 0 ? `${kvm.toLocaleString("sv-SE")} m²` : "—"}
                </span>
                {visaAiPerHus && onTakPerHusChange && (
                  <YtaAiForslagKnapp
                    grund={grund}
                    husId={h.id}
                    vaderstreck="norr"
                    typ="tak"
                    onApply={(v) => onTakPerHusChange(h.id, v)}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-2 text-sm font-medium text-foreground">
        Summa tak (grund): {grundKvm.toLocaleString("sv-SE")} m²
        {registerKvm > 0 && registerKvm !== grundKvm && (
          <span className="ml-2 font-normal text-muted">
            · Register: {registerKvm.toLocaleString("sv-SE")} m²
          </span>
        )}
      </p>
      {grundKvm > 0 &&
        onApplyGrundSummaTillRegister &&
        registerKvm !== grundKvm && (
          <button
            type="button"
            onClick={() =>
              onApplyGrundSummaTillRegister(String(Math.round(grundKvm)))
            }
            className="mt-2 rounded border border-primary px-2 py-1 text-[10px] font-medium text-primary-dark hover:bg-[#e2f0e6]"
          >
            För över grundsumma till takyta
          </button>
        )}
    </div>
  );
}
