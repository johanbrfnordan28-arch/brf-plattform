"use client";

import {
  hamtaHuvudYtaUnderkomponentId,
  harHuvudYtaUnderkomponent,
} from "@/components/underhallsplan/komponent-vy";
import {
  skapaTomKomponentDetalj,
  type KomponentDetaljData,
} from "@/components/underhallsplan/komponentregister";
import { YtaOchMaterialAiHjalp } from "@/components/underhallsplan/YtaOchMaterialAiHjalp";
import type { Grunduppgifter } from "@/components/underhallsplan/types";

type RenoveringYtaAiSektionProps = {
  grund: Grunduppgifter;
  activeComponents: string[];
  komponentDetaljer: Record<string, KomponentDetaljData>;
  onKomponentDetaljerChange: (
    register: Record<string, KomponentDetaljData>,
  ) => void;
};

export function RenoveringYtaAiSektion({
  grund,
  activeComponents,
  komponentDetaljer,
  onKomponentDetaljerChange,
}: RenoveringYtaAiSektionProps) {
  const visaFasad = activeComponents.includes("Fasad");
  const visaTak = activeComponents.includes("Tak");

  if (!visaFasad && !visaTak) return null;

  function applyKvm(komponent: "Fasad" | "Tak", kvm: string) {
    const uk = hamtaHuvudYtaUnderkomponentId(komponent);
    if (!uk) return;
    const befintlig =
      komponentDetaljer[komponent] ?? skapaTomKomponentDetalj(komponent);
    onKomponentDetaljerChange({
      ...komponentDetaljer,
      [komponent]: {
        ...befintlig,
        underkomponenter: befintlig.underkomponenter.map((r) =>
          r.id === uk ? { ...r, värde: kvm, aktiv: true } : r,
        ),
      },
    });
  }

  return (
    <div className="mb-6 space-y-4 rounded-xl border border-[#b8d4c4] bg-[#f7fbf8] p-4 sm:p-5">
      <p className="text-sm font-semibold text-primary-dark">
        Kart- och AI-stöd inför historik
      </p>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        Använd samma hjälp som i steg 1 och 3 för att uppskatta ytor.{" "}
        <strong className="font-medium text-foreground">
          Utförd faktura behöver inte delas per underkomponent
        </strong>{" "}
        — ange total kostnad och titel i listan nedan. Detaljer per styck är valfritt
        och passar främst kommande underhåll i steg 3.
      </p>
      {visaFasad && harHuvudYtaUnderkomponent("Fasad") && (
        <YtaOchMaterialAiHjalp
          typ="Fasad"
          grund={grund}
          komponentData={komponentDetaljer.Fasad}
          registerKvm={
            komponentDetaljer.Fasad?.underkomponenter.find(
              (r) => r.id === "fasadmaterial",
            )?.värde ?? ""
          }
          onApplyKvm={(kvm) => applyKvm("Fasad", kvm)}
        />
      )}
      {visaTak && harHuvudYtaUnderkomponent("Tak") && (
        <YtaOchMaterialAiHjalp
          typ="Tak"
          grund={grund}
          komponentData={komponentDetaljer.Tak}
          registerKvm={
            komponentDetaljer.Tak?.underkomponenter.find((r) => r.id === "takyta")
              ?.värde ?? ""
          }
          onApplyKvm={(kvm) => applyKvm("Tak", kvm)}
        />
      )}
    </div>
  );
}
