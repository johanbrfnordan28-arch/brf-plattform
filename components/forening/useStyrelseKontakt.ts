"use client";

import { useSyncExternalStore } from "react";
import { lasAktivForeningId } from "@/lib/forening-registry";
import {
  FORENING_AKTIV_EVENT,
  hamtaStyrelseKontakt,
  type StyrelseKontakt,
} from "@/lib/styrelse-kontakt";

function subscribeKontakt(onStoreChange: () => void) {
  window.addEventListener(FORENING_AKTIV_EVENT, onStoreChange);
  window.addEventListener("underhallsplan-state-uppdaterad", onStoreChange);
  return () => {
    window.removeEventListener(FORENING_AKTIV_EVENT, onStoreChange);
    window.removeEventListener("underhallsplan-state-uppdaterad", onStoreChange);
  };
}

let cachedKey = "";
let cachedKontakt: StyrelseKontakt | null = null;

function lasKontaktSnapshot(): StyrelseKontakt | null {
  const id = lasAktivForeningId();
  const kontakt = hamtaStyrelseKontakt(id);
  const key = kontakt
    ? [
        id,
        kontakt.foreningsnamn,
        kontakt.organisationsnummer,
        kontakt.epost,
        kontakt.kontaktperson,
        kontakt.postadress,
        kontakt.ort,
      ].join("|")
    : `${id}|null`;

  if (key === cachedKey) {
    return cachedKontakt;
  }

  cachedKey = key;
  cachedKontakt = kontakt;
  return kontakt;
}

export function useStyrelseKontakt(): StyrelseKontakt | null {
  return useSyncExternalStore(subscribeKontakt, lasKontaktSnapshot, () => null);
}
