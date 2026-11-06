/**
 * Avgör om den här webbläsaren får öppna en förenings styrelsesidor.
 * En sökträff sparar bara namn och id lokalt och räknas inte som behörighet.
 */

import { listaLokalaKontonForForening } from "@/lib/auth/lokal-konto";
import { lasLokalSession, rensaLokalSession } from "@/lib/auth/lokal-session";
import {
  arStandardTestForening,
  GRUNDMALL_FORENING_ID,
} from "@/lib/forening-konstanter";
import { hamtaServerAccessNyckel } from "@/lib/forening-server-sync";

/** Grundmallen och de gemensamma demoföreningarna är öppna för alla. */
export function arOppenForening(foreningId: string): boolean {
  return foreningId === GRUNDMALL_FORENING_ID || arStandardTestForening(foreningId);
}

/** Inloggad just nu på en egen skapad förening (inte bara att kontot finns sparat). */
export function arInloggadPaEgenForening(): boolean {
  if (typeof window === "undefined") return false;
  const session = lasLokalSession();
  if (!session) return false;
  return !arOppenForening(session.foreningId);
}

type ServerSession = {
  inloggad: boolean;
  databas: boolean;
  typ?: string;
  foreningId?: string;
};

/** Serverns session, eller null om servern inte gick att nå. */
async function lasServerSession(): Promise<ServerSession | null> {
  try {
    const res = await fetch("/api/auth/session", { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as Partial<ServerSession>;
    const session: ServerSession = {
      inloggad: data.inloggad === true,
      databas: data.databas === true,
      typ: data.typ,
      foreningId: data.foreningId,
    };
    // Utloggad på servern: en kvarglömd lokal session får inte se inloggad ut.
    if (session.databas && !session.inloggad) rensaLokalSession();
    return session;
  } catch {
    return null;
  }
}

/**
 * Menyn på huvudsidan. När databasen svarar gäller bara serverns session,
 * så en gammal lokal session inte visar «Logga ut» för den som inte är inloggad.
 */
export async function arInloggadIMenyn(): Promise<boolean> {
  const session = await lasServerSession();
  if (session?.databas) return session.inloggad;
  return arInloggadPaEgenForening();
}

/**
 * Lokala uppgifter (sparat konto, åtkomstnyckel) räcker bara när servern saknar
 * databas, t.ex. lokal utveckling. I drift krävs serverns inloggning.
 */
export function harLokalForeningBehorighet(foreningId: string): boolean {
  if (!foreningId) return false;
  if (arOppenForening(foreningId)) return true;
  if (typeof window === "undefined") return false;
  if (hamtaServerAccessNyckel(foreningId)) return true;
  if (lasLokalSession()?.foreningId === foreningId) return true;
  try {
    return listaLokalaKontonForForening(foreningId).length > 0;
  } catch {
    return false;
  }
}

/** Behörighet till föreningens styrelsesidor. */
export async function harForeningBehorighet(foreningId: string): Promise<boolean> {
  if (!foreningId) return false;
  if (arOppenForening(foreningId)) return true;
  const session = await lasServerSession();
  if (!session) {
    // Servern gick inte att nå: bara en aktiv inloggning i den här webbläsaren gäller.
    return lasLokalSession()?.foreningId === foreningId;
  }
  if (!session.databas) return harLokalForeningBehorighet(foreningId);
  if (!session.inloggad) return false;
  if (session.typ === "PLATTFORM" || session.foreningId === foreningId) return true;
  try {
    const mina = await fetch("/api/auth/mina-foreningar", { cache: "no-store" });
    if (!mina.ok) return false;
    const data = (await mina.json()) as { foreningar?: Array<{ id?: string }> };
    return Boolean(data.foreningar?.some((f) => f.id === foreningId));
  } catch {
    return false;
  }
}
