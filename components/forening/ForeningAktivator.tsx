"use client";

import { useLayoutEffect, useRef } from "react";
import {
  aktiveraForeningVidSidladdning,
  FORENING_AKTIV_EVENT,
  GRUNDMALL_FORENING_ID,
  hamtaAktivForeningId,
} from "@/lib/forening-registry";
import { korPlattformMigreringarForForening } from "@/lib/forening-plattform-migrering";
import { rensaSkapaParametrarFranUrl } from "@/lib/skapa-forening-navigering";

/**
 * Bootstrapar aktiv förening en gång vid sidladdning — innan övriga komponenter läser lagring.
 */
export function ForeningAktivator() {
  const gjort = useRef(false);

  useLayoutEffect(() => {
    if (gjort.current) return;
    gjort.current = true;

    const profil = aktiveraForeningVidSidladdning();

    const id = hamtaAktivForeningId();
    if (id && id !== GRUNDMALL_FORENING_ID) {
      if (profil && new URLSearchParams(window.location.search).get("ny") === "1") {
        korPlattformMigreringarForForening(id);
      }
      rensaSkapaParametrarFranUrl();
      window.dispatchEvent(new Event(FORENING_AKTIV_EVENT));
    }
  }, []);

  return null;
}
