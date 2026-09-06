/**
 * Lokal fallback när servern saknar databas (t.ex. Vercel utan DATABASE_URL).
 * Lösenord sparas endast i den här webbläsaren.
 */

import { safeSetLocalStorage } from "@/lib/localStorage";

const LOKAL_KONTON_KEY = "brf-lokal-konton-v1";

export type LokalKonto = {
  epost: string;
  /** Base64 av lösenordet — endast för offline-demo tills DB finns. */
  losenord: string;
  foreningId: string;
  namn: string;
  roll: string;
};

function lasAlla(): LokalKonto[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOKAL_KONTON_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LokalKonto[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function sparaAlla(konton: LokalKonto[]): void {
  safeSetLocalStorage(LOKAL_KONTON_KEY, JSON.stringify(konton));
}

export function genereraLokalLosenord(langd = 12): string {
  const alfabet =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = new Uint8Array(langd);
  crypto.getRandomValues(bytes);
  let ut = "";
  for (let i = 0; i < langd; i += 1) {
    ut += alfabet[bytes[i]! % alfabet.length];
  }
  return ut;
}

export function sparaLokalKonto(konto: LokalKonto): void {
  const epost = konto.epost.trim().toLowerCase();
  const ovriga = lasAlla().filter((k) => k.epost !== epost);
  sparaAlla([...ovriga, { ...konto, epost }]);
}

export function uppdateraLokalLosenord(
  epost: string,
  nuvarande: string,
  nytt: string,
): { ok: true } | { ok: false; fel: string } {
  const konto = hamtaLokalKonto(epost);
  if (!konto) {
    return { ok: false, fel: "Inget lokalt konto hittades i den här webbläsaren." };
  }
  if (konto.losenord !== nuvarande) {
    return { ok: false, fel: "Nuvarande lösenord stämmer inte." };
  }
  if (nytt.trim().length < 8) {
    return { ok: false, fel: "Nytt lösenord måste vara minst 8 tecken." };
  }
  sparaLokalKonto({ ...konto, losenord: nytt });
  return { ok: true };
}

export function verifieraLokalKonto(
  epost: string,
  losenord: string,
): LokalKonto | null {
  const hittad = hamtaLokalKonto(epost);
  if (!hittad) return null;
  if (hittad.losenord !== losenord) return null;
  return hittad;
}

export function hamtaLokalKonto(epost: string): LokalKonto | null {
  const nyckel = epost.trim().toLowerCase();
  return lasAlla().find((k) => k.epost === nyckel) ?? null;
}

export function listaLokalaKontonForForening(foreningId: string): LokalKonto[] {
  return lasAlla().filter((k) => k.foreningId === foreningId);
}
