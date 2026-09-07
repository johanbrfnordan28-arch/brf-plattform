/**
 * Hämtar inloggningskontext för Konto-sidor — server-session, lokal session
 * eller sparat konto för aktiv förening (t.ex. direkt efter skapande).
 */

import {
  hamtaLokalKonto,
  listaLokalaKontonForForening,
  type LokalKonto,
} from "@/lib/auth/lokal-konto";
import { lasLokalSession } from "@/lib/auth/lokal-session";
import {
  lasAktivForeningId,
  lasForeningProfil,
} from "@/lib/forening-registry";

export type KontoKontext = {
  epost: string;
  foreningId: string;
  namn: string;
  losenord: string | null;
  /** Server-cookie, lokal session eller sparat konto i webbläsaren. */
  kalla: "server" | "lokal-session" | "lokal-konto";
};

function kontoTillKontext(
  konto: LokalKonto,
  kalla: KontoKontext["kalla"],
): KontoKontext {
  return {
    epost: konto.epost,
    foreningId: konto.foreningId,
    namn: konto.namn,
    losenord: konto.losenord || null,
    kalla,
  };
}

function hamtaLokalKontoForAktivForening(): LokalKonto | null {
  const foreningId = lasAktivForeningId();
  if (!foreningId) return null;

  const lokalSession = lasLokalSession();
  if (lokalSession?.foreningId === foreningId) {
    const match = hamtaLokalKonto(lokalSession.epost, foreningId);
    if (match) return match;
  }

  const forForening = listaLokalaKontonForForening(foreningId);
  if (forForening.length === 1) return forForening[0]!;
  if (forForening.length > 1 && lokalSession?.epost) {
    return (
      forForening.find((k) => k.epost === lokalSession.epost) ??
      forForening[forForening.length - 1]!
    );
  }

  const profil = lasForeningProfil(foreningId);
  const profilEpost = profil?.epost?.trim().toLowerCase();
  if (profilEpost) {
    return hamtaLokalKonto(profilEpost, foreningId);
  }

  return forForening[forForening.length - 1] ?? null;
}

/** Hämtar e-post + lösenord för den som arbetar i aktiv förening. */
export async function hamtaKontoKontext(): Promise<KontoKontext | null> {
  if (typeof window === "undefined") return null;

  try {
    const sessionRes = await fetch("/api/auth/session");
    const session = (await sessionRes.json()) as {
      inloggad?: boolean;
      epost?: string;
      foreningId?: string | null;
      namn?: string;
    };

    if (session.inloggad && session.epost) {
      const epost = session.epost.trim().toLowerCase();
      const foreningId =
        session.foreningId || lasAktivForeningId() || "";

      let losenord: string | null = null;
      const losRes = await fetch("/api/auth/mitt-losenord");
      if (losRes.ok) {
        const data = (await losRes.json()) as { losenord?: string | null };
        losenord = data.losenord ?? null;
      }
      if (!losenord) {
        losenord = hamtaLokalKonto(epost, foreningId)?.losenord ?? null;
      }

      return {
        epost,
        foreningId,
        namn: session.namn?.trim() || "",
        losenord,
        kalla: "server",
      };
    }
  } catch {
    /* fall through till lokal */
  }

  const lokalSession = lasLokalSession();
  if (lokalSession?.epost) {
    const konto = hamtaLokalKonto(lokalSession.epost, lokalSession.foreningId);
    if (konto) return kontoTillKontext(konto, "lokal-session");
    return {
      epost: lokalSession.epost,
      foreningId: lokalSession.foreningId,
      namn: lokalSession.namn,
      losenord: null,
      kalla: "lokal-session",
    };
  }

  const lokalt = hamtaLokalKontoForAktivForening();
  if (lokalt) return kontoTillKontext(lokalt, "lokal-konto");

  return null;
}
