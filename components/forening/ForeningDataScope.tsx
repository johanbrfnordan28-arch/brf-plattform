"use client";

import { useEffect, useState } from "react";
import {
  FORENING_AKTIV_EVENT,
  lasAktivForeningId,
} from "@/lib/forening-registry";
import { FORENING_DATA_AATERSTALL_EVENT } from "@/lib/forening-backup";

/** Remountar sidinnehåll när aktiv förening byts eller data återställs. */
export function ForeningDataScope({ children }: { children: React.ReactNode }) {
  const [scopeKey, setScopeKey] = useState(() => lasAktivForeningId());

  useEffect(() => {
    function synka() {
      setScopeKey(lasAktivForeningId());
    }
    function efterAterstall() {
      setScopeKey(`${lasAktivForeningId()}-${Date.now()}`);
    }
    synka();
    window.addEventListener(FORENING_AKTIV_EVENT, synka);
    window.addEventListener(FORENING_DATA_AATERSTALL_EVENT, efterAterstall);
    return () => {
      window.removeEventListener(FORENING_AKTIV_EVENT, synka);
      window.removeEventListener(FORENING_DATA_AATERSTALL_EVENT, efterAterstall);
    };
  }, []);

  return <div key={scopeKey}>{children}</div>;
}
