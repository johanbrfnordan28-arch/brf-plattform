/**
 * Lokal återställning av lösenord när databasen saknas.
 * Token och länkar sparas i webbläsaren — fungerar utan SMTP/DB.
 */

import {
  genereraLokalLosenord,
  hamtaLokalKonto,
  sattLokalLosenord,
  sparaLokalKonto,
} from "@/lib/auth/lokal-konto";
import { lasAktivForeningId } from "@/lib/forening-registry";
import { safeSetLocalStorage } from "@/lib/localStorage";

const LOKAL_RESET_KEY = "brf-lokal-aterstall-v1";
const TOKEN_GILTIG_MS = 60 * 60 * 1000; // 1 timme

type LokalResetPost = {
  token: string;
  epost: string;
  expires: number;
  foreningId?: string;
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
  const foreningId = konto?.foreningId || lasAktivForeningId() || "";

  const token = skapaToken();
  const post: LokalResetPost = {
    token,
    epost: nyckel,
    expires: Date.now() + TOKEN_GILTIG_MS,
    foreningId,
  };
  sparaAlla([post, ...lasAlla().filter((p) => p.epost !== nyckel)]);

  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  const lank = `${origin}/konto/aterstall?token=${encodeURIComponent(token)}&lokal=1`;

  return {
    ok: true,
    lank,
    meddelande:
      "Öppna länken nedan inom en timme. Den fungerar i den här webbläsaren även om mejlet inte kommer fram.",
  };
}

/** Sparar lösenordet som servern mejlade så lokal inloggning matchar. */
export function sparaNyttLosenordFranServer(
  epost: string,
  losenord: string,
  foreningId?: string,
  namn?: string,
): void {
  const konto = hamtaLokalKonto(epost, foreningId);
  const id = foreningId || konto?.foreningId || lasAktivForeningId() || "";
  if (!id && !konto) return;
  sattLokalLosenord(
    epost,
    losenord,
    id || konto?.foreningId || "",
    namn || konto?.namn || "",
  );
}

/** Nytt tillfälligt lösenord när servern saknar konto men webbläsaren har ett. */
export function begärLokaltNyttLosenord(epost: string):
  | {
      ok: true;
      losenord: string;
      foreningId: string;
      meddelande: string;
    }
  | { ok: false; fel: string } {
  const nyckel = epost.trim().toLowerCase();
  if (!nyckel || !nyckel.includes("@")) {
    return { ok: false, fel: "Ange en giltig e-postadress." };
  }
  const konto = hamtaLokalKonto(nyckel);
  const foreningId = konto?.foreningId || lasAktivForeningId() || "";
  if (!konto && !foreningId) {
    return {
      ok: false,
      fel: "Inget lokalt konto hittades för den e-postadressen i den här webbläsaren.",
    };
  }
  const losenord = genereraLokalLosenord(12);
  const sparat = sattLokalLosenord(
    nyckel,
    losenord,
    foreningId,
    konto?.namn || "",
  );
  if (!sparat.ok) return sparat;
  return {
    ok: true,
    losenord,
    foreningId,
    meddelande:
      "Ett nytt tillfälligt lösenord är sparat i den här webbläsaren.",
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
  const foreningId = konto?.foreningId || post.foreningId || lasAktivForeningId() || "";
  sparaLokalKonto({
    epost: post.epost,
    losenord: nytt.trim(),
    foreningId,
    namn: konto?.namn || "",
    roll: konto?.roll || "Ledamot",
  });
  sparaAlla(poster.filter((p) => p.token !== trimmed));
  return { ok: true, epost: post.epost };
}
