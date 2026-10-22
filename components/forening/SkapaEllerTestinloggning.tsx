"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SkapaForeningPanel } from "@/components/forening/SkapaForeningPanel";
import { FORENING_AKTIV_EVENT } from "@/lib/forening-registry";
import { antalEgnaTestForeningar } from "@/lib/forening-inloggning";
import { TEST_LOGIN_PATH } from "@/lib/forening-kund";

/** Skapa förening, eller tydlig testinloggning när en förening redan finns. */
export function SkapaEllerTestinloggning({
  kompakt = false,
}: {
  kompakt?: boolean;
}) {
  const [harSkapad, setHarSkapad] = useState<boolean | null>(null);
  const [visaSkapa, setVisaSkapa] = useState(false);

  useEffect(() => {
    function uppdatera() {
      setHarSkapad(antalEgnaTestForeningar() > 0);
    }
    uppdatera();
    window.addEventListener(FORENING_AKTIV_EVENT, uppdatera);
    return () => window.removeEventListener(FORENING_AKTIV_EVENT, uppdatera);
  }, []);

  if (harSkapad === null) {
    return <p className="text-sm text-muted">Laddar …</p>;
  }

  if (harSkapad && !visaSkapa) {
    return (
      <div className={`brf-panel-gron ${kompakt ? "p-5" : "p-6 sm:p-8"}`}>
        <h2 className="text-lg font-bold text-foreground sm:text-xl">
          Pröva på föreningen
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Föreningen är skapad. Öppna den för att fortsätta provperioden.
          Knappen Logga in i menyn är för föreningar som har tecknat avtal.
        </p>
        <Link
          href={TEST_LOGIN_PATH}
          className="brf-knapp-gron mt-5 inline-flex px-6 py-3 text-base"
        >
          Pröva på förening
        </Link>
        <button
          type="button"
          onClick={() => setVisaSkapa(true)}
          className="mt-4 block text-sm font-medium text-primary-dark hover:underline"
        >
          Skapa en förening till
        </button>
      </div>
    );
  }

  return <SkapaForeningPanel kompakt={kompakt} />;
}
