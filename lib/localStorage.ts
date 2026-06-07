export type LocalStorageSetError = "quota" | "unavailable";

export function safeSetLocalStorage(
  key: string,
  value: string,
): { ok: true } | { ok: false; error: LocalStorageSetError } {
  if (typeof window === "undefined") {
    return { ok: false, error: "unavailable" };
  }
  try {
    localStorage.setItem(key, value);
    return { ok: true };
  } catch (error) {
    if (
      error instanceof DOMException &&
      (error.name === "QuotaExceededError" || error.code === 22)
    ) {
      return { ok: false, error: "quota" };
    }
    return { ok: false, error: "unavailable" };
  }
}

export function localStorageFelMeddelande(error: LocalStorageSetError): string {
  if (error === "quota") {
    return "Webbläsarens lagring är full. Ta bort gamla bilder eller rensa webbplatsdata och försök igen.";
  }
  return "Kunde inte spara lokalt. Kontrollera att lagring är tillåten i webbläsaren.";
}
