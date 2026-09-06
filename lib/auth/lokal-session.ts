/**
 * Klient-session när servern saknar databas — så Konto kan visa/byta lösenord.
 * Endast i den här webbläsaren; aldrig andras lösenord.
 */

import { safeSetLocalStorage } from "@/lib/localStorage";

const LOKAL_SESSION_KEY = "brf-lokal-session-v1";

export type LokalSession = {
  epost: string;
  foreningId: string;
  namn: string;
  inloggadTidpunkt: string;
};

export function lasLokalSession(): LokalSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOKAL_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<LokalSession>;
    if (
      typeof parsed.epost !== "string" ||
      !parsed.epost.trim() ||
      typeof parsed.foreningId !== "string"
    ) {
      return null;
    }
    return {
      epost: parsed.epost.trim().toLowerCase(),
      foreningId: parsed.foreningId,
      namn: typeof parsed.namn === "string" ? parsed.namn : "",
      inloggadTidpunkt:
        typeof parsed.inloggadTidpunkt === "string"
          ? parsed.inloggadTidpunkt
          : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function sparaLokalSession(session: LokalSession): void {
  if (typeof window === "undefined") return;
  safeSetLocalStorage(
    LOKAL_SESSION_KEY,
    JSON.stringify({
      ...session,
      epost: session.epost.trim().toLowerCase(),
      inloggadTidpunkt: session.inloggadTidpunkt || new Date().toISOString(),
    }),
  );
}

export function rensaLokalSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(LOKAL_SESSION_KEY);
  } catch {
    /* ignore */
  }
}
