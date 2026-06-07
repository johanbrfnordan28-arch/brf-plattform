"use client";

import { useEffect, useState } from "react";
import {
  KomponentAccordionLista,
  KomponentAccordionRad,
} from "@/components/underhallsplan/KomponentTrädUi";
import {
  formateraKomponentSammanfattning,
  hamtaKomponentMall,
  type KomponentDetaljData,
} from "@/components/underhallsplan/komponentregister";
import { KomponentDetaljer } from "@/components/underhallsplan/KomponentDetaljer";
import type { Grunduppgifter } from "@/components/underhallsplan/types";

type KomponentRegisterListaProps = {
  activeComponents: string[];
  komponentDetaljer: Record<string, KomponentDetaljData>;
  onKomponentChange: (namn: string, data: KomponentDetaljData) => void;
  disabled?: boolean;
  senastTillagd?: string | null;
  planStartAr: number;
  planLangdAr: number;
  /** Adresser från grunduppgifter — för fönsteruppdelning. */
  foreningsAdresser?: string[];
  grund: Grunduppgifter;
  /** Alla komponentpaneler expanderade (steg 3). */
  oppnaAlla?: boolean;
};

export function KomponentRegisterLista({
  activeComponents,
  komponentDetaljer,
  onKomponentChange,
  disabled,
  senastTillagd,
  planStartAr,
  planLangdAr,
  foreningsAdresser = [],
  grund,
  oppnaAlla = false,
}: KomponentRegisterListaProps) {
  const [öppna, setÖppna] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!senastTillagd || !activeComponents.includes(senastTillagd)) return;
    setÖppna((current) => ({ ...current, [senastTillagd]: true }));
  }, [senastTillagd, activeComponents]);

  useEffect(() => {
    setÖppna((current) => {
      const next: Record<string, boolean> = {};
      for (const namn of activeComponents) {
        if (oppnaAlla) next[namn] = true;
        else if (namn in current) next[namn] = current[namn];
      }
      return next;
    });
  }, [activeComponents, oppnaAlla]);

  function toggleÖppen(namn: string) {
    setÖppna((current) => ({ ...current, [namn]: !current[namn] }));
  }

  if (activeComponents.length === 0) {
    return (
      <p className="mt-6 rounded-lg border border-dashed border-border bg-background px-4 py-6 text-center text-sm text-muted">
        Välj minst en komponent ovan — eller lägg till en egen huvudkomponent. Klicka
        på raden för att öppna deltyper och underkomponenter.
      </p>
    );
  }

  return (
    <div className={`mt-6 space-y-3 ${disabled ? "pointer-events-none opacity-50" : ""}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        Valda komponenter — öppna för att detaljera
      </p>
      <KomponentAccordionLista>
        {activeComponents.map((namn) => {
          const isÖppen = öppna[namn] ?? false;
          const data = komponentDetaljer[namn];
          const mall = hamtaKomponentMall(namn);
          const sammanfattning = data
            ? formateraKomponentSammanfattning(data, mall)
            : null;
          const antalAktiva = data?.underkomponenter.filter((r) => r.aktiv).length ?? 0;

          return (
            <KomponentAccordionRad
              key={namn}
              namn={namn}
              undertitel={
                sammanfattning
                  ? sammanfattning
                  : `${mall.underkomponenter.length} underkomponenter${
                      antalAktiva > 0 ? ` · ${antalAktiva} aktiva` : ""
                    }`
              }
              isOpen={isÖppen}
              onToggle={() => toggleÖppen(namn)}
            >
              {data && (
                <KomponentDetaljer
                  komponentNamn={namn}
                  data={data}
                  onChange={(ny) => onKomponentChange(namn, ny)}
                  planStartAr={planStartAr}
                  planLangdAr={planLangdAr}
                  foreningsAdresser={foreningsAdresser}
                  grund={grund}
                />
              )}
            </KomponentAccordionRad>
          );
        })}
      </KomponentAccordionLista>
    </div>
  );
}
