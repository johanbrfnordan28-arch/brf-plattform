"use client";

import { useSyncExternalStore } from "react";
import { STYRELSEFLOW_NAMN } from "@/lib/forening-konstanter";
import { FORENING_AKTIV_EVENT } from "@/lib/forening-registry";
import { hamtaHubbNamn } from "@/lib/hubb-namn";

function subscribeHubb(onStoreChange: () => void) {
  window.addEventListener(FORENING_AKTIV_EVENT, onStoreChange);
  return () => window.removeEventListener(FORENING_AKTIV_EVENT, onStoreChange);
}

/** «Styrelseflow» eller «Brf Sailor» beroende på aktiv förening. */
export function useHubbNamn(): string {
  return useSyncExternalStore(
    subscribeHubb,
    hamtaHubbNamn,
    () => STYRELSEFLOW_NAMN,
  );
}
