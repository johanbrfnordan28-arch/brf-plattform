"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  arGrundmallForening,
  FORENING_AKTIV_EVENT,
  lasAktivForeningId,
} from "@/lib/forening-registry";
import { PROVA_GRATIS_PATH } from "@/lib/skapa-testforening-lank";
import { SkapaForeningPanel } from "@/components/forening/SkapaForeningPanel";

/**
 * Visar skapa-formulär på /forening när användaren fortfarande är på grundmall
 * (t.ex. efter "logga in" utan att ha skapat egen förening).
 */
export function SkapaForeningPaForeningssidan() {
  const [visaSkapa, setVisaSkapa] = useState(false);

  useEffect(() => {
    function uppdatera() {
      const nySkapad =
        new URLSearchParams(window.location.search).get("ny") === "1";
      setVisaSkapa(!nySkapad && arGrundmallForening(lasAktivForeningId()));
    }
    uppdatera();
    window.addEventListener(FORENING_AKTIV_EVENT, uppdatera);
    return () => window.removeEventListener(FORENING_AKTIV_EVENT, uppdatera);
  }, []);

  if (!visaSkapa) return null;

  return (
    <div className="border-b border-primary/30 bg-[#eef6f0]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <p className="text-sm font-semibold text-primary-dark">Ny förening</p>
        <h2 className="mt-1 text-2xl font-bold text-foreground">Skapa vår förening</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Ni är inne på demo-grundmallen. För att prova med <strong className="text-foreground">er</strong>{" "}
          förening: skapa sidan här nedan eller gå till{" "}
          <Link href={PROVA_GRATIS_PATH} className="font-medium text-primary-dark underline hover:no-underline">
            prova gratis
          </Link>
          .
        </p>
        <div className="mt-6">
          <SkapaForeningPanel visaSnabbstart />
        </div>
      </div>
    </div>
  );
}
