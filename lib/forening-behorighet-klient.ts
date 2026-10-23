/**
 * Avgör om den här webbläsaren får öppna en förenings styrelsesidor.
 * En sökträff sparar bara namn och id lokalt och räknas inte som behörighet.
 */

import { listaLokalaKontonForForening } from "@/lib/auth/lokal-konto";
import { lasLokalSession } from "@/lib/auth/lokal-session";
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

/**
 * Menyn på huvudsidan. När databasen svarar gäller bara serverns session,
 * så en gammal lokal session inte visar «Logga ut» för den som inte är inloggad.
 */
export async function arInloggadIMenyn(): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/session", { cache: "no-store" });
    if (res.ok) {
      const data = (await res.json()) as {
        inloggad?: boolean;
        databas?: boolean;
      };
      if (data.inloggad === true) return true;
      if (data.databas === true) return false;
    }
  } catch {
    /* nätverksfel: använd den lokala sessionen */
  }
  return arInloggadPaEgenForening();
}

/** Skapad eller inloggad i den här webbläsaren. */
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

/** Lokal behörighet, annars inloggad session (BankID eller lösenord) för föreningen. */
export async function harForeningBehorighet(foreningId: string): Promise<boolean> {
  if (harLokalForeningBehorighet(foreningId)) return true;
  try {
    const res = await fetch("/api/auth/session", { cache: "no-store" });
    if (!res.ok) return false;
    const session = (await res.json()) as {
      inloggad?: boolean;
      typ?: string;
      foreningId?: string;
    };
    if (!session.inloggad) return false;
    if (session.typ === "PLATTFORM" || session.foreningId === foreningId) return true;

    const mina = await fetch("/api/auth/mina-foreningar", { cache: "no-store" });
    if (!mina.ok) return false;
    const data = (await mina.json()) as { foreningar?: Array<{ id?: string }> };
    return Boolean(data.foreningar?.some((f) => f.id === foreningId));
  } catch {
    return false;
  }
}
