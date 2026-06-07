"use client";

import { useEffect } from "react";
import { korPlattformMigreringarForAllaForeningar } from "@/lib/forening-plattform-migrering";

/**
 * Körs på alla föreningssidor: plattformsuppdateringar slås ihop per förening
 * utan att radera ifyllda uppgifter.
 */
export function ForeningPlattformSync() {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      korPlattformMigreringarForAllaForeningar();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  return null;
}
