"use client";

import { useSyncExternalStore } from "react";
import {
  FORENING_AKTIV_EVENT,
  GRUNDMALL_NAMN,
  hamtaAktivForeningsNamn,
} from "@/lib/forening-registry";

function subscribeNamn(onStoreChange: () => void) {
  window.addEventListener(FORENING_AKTIV_EVENT, onStoreChange);
  return () => window.removeEventListener(FORENING_AKTIV_EVENT, onStoreChange);
}

export function useAktivForeningsNamn(): string {
  return useSyncExternalStore(
    subscribeNamn,
    hamtaAktivForeningsNamn,
    () => GRUNDMALL_NAMN,
  );
}
