"use client";

import { useSyncExternalStore } from "react";
import {
  FORENING_AKTIV_EVENT,
  hamtaAktivForeningsNamn,
} from "@/lib/forening-registry";

/**
 * Neutralt namn vid serverrendering och första hydreringsframen — det aktiva
 * föreningsnamnet finns bara i webbläsaren (localStorage). Undviker att kort
 * visa fel namn (t.ex. «Grundmall föreningar») innan klienten hunnit läsa.
 */
export const FORENINGS_NAMN_PLACEHOLDER = "Föreningsportal";

function subscribeNamn(onStoreChange: () => void) {
  window.addEventListener(FORENING_AKTIV_EVENT, onStoreChange);
  return () => window.removeEventListener(FORENING_AKTIV_EVENT, onStoreChange);
}

export function useAktivForeningsNamn(): string {
  return useSyncExternalStore(
    subscribeNamn,
    hamtaAktivForeningsNamn,
    () => FORENINGS_NAMN_PLACEHOLDER,
  );
}
