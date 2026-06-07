"use client";

import { useEffect, useState } from "react";
import {
  FORENING_AKTIV_EVENT,
  lasAktivForeningId,
} from "@/lib/forening-registry";

/**
 * Remountar sidinnehåll när aktiv förening byts så moduler läser rätt localStorage
 * i stället för att behålla state från föregående förening.
 */
export function ForeningDataScope({ children }: { children: React.ReactNode }) {
  const [scopeKey, setScopeKey] = useState(() => lasAktivForeningId());

  useEffect(() => {
    function synka() {
      setScopeKey(lasAktivForeningId());
    }
    synka();
    window.addEventListener(FORENING_AKTIV_EVENT, synka);
    return () => window.removeEventListener(FORENING_AKTIV_EVENT, synka);
  }, []);

  return <div key={scopeKey}>{children}</div>;
}
