"use client";

import { useSyncExternalStore } from "react";
import {
  FORENING_AKTIV_EVENT,
  hamtaAktivForeningsNamn,
  INGEN_AKTIV_FORENING_ETIKETT,
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

function lasKlientNamn(): string {
  return hamtaAktivForeningsNamn().trim() || INGEN_AKTIV_FORENING_ETIKETT;
}

export function useAktivForeningsNamn(): string {
  return useSyncExternalStore(
    subscribeNamn,
    lasKlientNamn,
    () => FORENINGS_NAMN_PLACEHOLDER,
  );
}
