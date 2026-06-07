"use client";

import { normaliseraFastighetsYtor } from "@/components/underhallsplan/fastighets-ytor";
import { YtaOchMaterialAiHjalp } from "@/components/underhallsplan/YtaOchMaterialAiHjalp";
import type { Grunduppgifter } from "@/components/underhallsplan/types";

type Steg1YtaAiHjalpProps = {
  grund: Grunduppgifter;
  onGrundChange: (grund: Grunduppgifter) => void;
};

export function Steg1YtaAiHjalp({ grund, onGrundChange }: Steg1YtaAiHjalpProps) {
  const ytor = normaliseraFastighetsYtor(grund.fastighetsYtor);

  function sattTotalFasad(kvm: string) {
    onGrundChange({
      ...grund,
      fastighetsYtor: {
        ...ytor,
        endastTotalFasad: true,
        totalFasadKvm: kvm,
      },
    });
  }

  function sattTotalTak(kvm: string) {
    onGrundChange({
      ...grund,
      fastighetsYtor: {
        ...ytor,
        endastTotalTak: true,
        totalTakKvm: kvm,
      },
    });
  }

  return (
    <div className="mt-6 space-y-4">
      <p className="text-sm font-semibold text-foreground">
        Kart- och AI-stöd (fasad & tak)
      </p>
      <p className="text-xs text-muted">
        Redan i steg 1: mät eller uppskatta ytor med Google Earth, Street View
        eller egen bild. Värdena följer med till steg 2 och 3. Du kan också bara
        ange klumpsumma (total m²) i matrisen ovan.
      </p>
      <YtaOchMaterialAiHjalp
        typ="Fasad"
        grund={grund}
        registerKvm={ytor.endastTotalFasad ? ytor.totalFasadKvm : ""}
        onApplyKvm={sattTotalFasad}
      />
      <YtaOchMaterialAiHjalp
        typ="Tak"
        grund={grund}
        registerKvm={ytor.endastTotalTak ? ytor.totalTakKvm : ""}
        onApplyKvm={sattTotalTak}
      />
    </div>
  );
}
