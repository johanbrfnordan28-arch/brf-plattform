/**
 * Lokal återställning av lösenord när databasen saknas.
 * Token och länkar sparas i webbläsaren — fungerar utan SMTP/DB.
 */

import {
  hamtaLokalKonto,
  sparaLokalKonto,
} from "@/lib/auth/lokal-konto";
import { safeSetLocalStorage } from "@/lib/localStorage";

const LOKAL_RESET_KEY = "brf-lokal-aterstall-v1";
const TOKEN_GILTIG_MS = 60 * 60 * 1000; // 1 timme

type LokalResetPost = {
  token: string;
  epost: string;
  expires: number;
};

function lasAlla(): LokalResetPost[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOKAL_RESET_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function sparaAlla(poster: LokalResetPost[]): void {
  const nu = Date.now();
  safeSetLocalStorage(
    LOKAL_RESET_KEY,
    JSON.stringify(poster.filter((p) => p.expires > nu).slice(0, 20)),
  );
}

function skapaToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Skapar återställning om e-post matchar ett lokalt konto.
 * Returnerar länk som visas i UI (mejlas inte utan SMTP).
 */
export function begärLokalAterstallning(epost: string): {
  ok: true;
  lank: string;
  meddelande: string;
} | { ok: false; fel: string } {
  const nyckel = epost.trim().toLowerCase();
  if (!nyckel || !nyckel.includes("@")) {
    return { ok: false, fel: "Ange en giltig e-postadress." };
  }
  const konto = hamtaLokalKonto(nyckel);
  if (!konto) {
    // Samma svar som servern — avslöja inte om kontot finns
    return {
      ok: true,
      lank: "",
      meddelande:
        "Om kontot finns i den här webbläsaren visas en återställningslänk nedan. Annars logga in med lösenordet från när föreningen skapades, eller skapa föreningen på nytt.",
    };
  }

  const token = skapaToken();
  const post: LokalResetPost = {
    token,
    epost: nyckel,
    expires: Date.now() + TOKEN_GILTIG_MS,
  };
  sparaAlla([post, ...lasAlla().filter((p) => p.epost !== nyckel)]);

  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  const lank = `${origin}/konto/aterstall?token=${encodeURIComponent(token)}&lokal=1`;

  return {
    ok: true,
    lank,
    meddelande:
      "Databasen är inte konfigurerad på servern — återställning sker i den här webbläsaren. Öppna länken nedan inom en timme.",
  };
}

export function aterstallLokalMedToken(
  token: string,
  nytt: string,
): { ok: true; epost: string } | { ok: false; fel: string } {
  const trimmed = token.trim();
  if (!trimmed) return { ok: false, fel: "Saknar återställningstoken." };
  if (nytt.trim().length < 8) {
    return { ok: false, fel: "Nytt lösenord måste vara minst 8 tecken." };
  }

  const poster = lasAlla();
  const post = poster.find((p) => p.token === trimmed);
  if (!post) {
    return {
      ok: false,
      fel: "Ogiltig eller gammal länk. Begär en ny återställning.",
    };
  }
  if (post.expires < Date.now()) {
    sparaAlla(poster.filter((p) => p.token !== trimmed));
    return { ok: false, fel: "Länken har gått ut. Begär en ny återställning." };
  }

  const konto = hamtaLokalKonto(post.epost);
  if (!konto) {
    return { ok: false, fel: "Kontot hittades inte i den här webbläsaren." };
  }

  sparaLokalKonto({ ...konto, losenord: nytt });
  sparaAlla(poster.filter((p) => p.token !== trimmed));
  return { ok: true, epost: post.epost };
}
