"use client";

import { useEffect, useState } from "react";
import { arInloggadPaEgenForening } from "@/lib/forening-behorighet-klient";
import { FORENING_AKTIV_EVENT } from "@/lib/forening-registry";

/** Etikett ovanför hubb-rubriken — föreningsnamnet står i H1. */
export function ForeningHeroEtikett() {
  const [inloggad, setInloggad] = useState(false);

  useEffect(() => {
    function uppdatera() {
      setInloggad(arInloggadPaEgenForening());
    }
    uppdatera();
    window.addEventListener(FORENING_AKTIV_EVENT, uppdatera);
    return () => window.removeEventListener(FORENING_AKTIV_EVENT, uppdatera);
  }, []);

  return (
    <p className="inline-flex rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-primary-dark">
      {inloggad
        ? "Inloggad · er föreningssida"
        : "Er föreningssida · inte inloggad än"}
    </p>
  );
}
