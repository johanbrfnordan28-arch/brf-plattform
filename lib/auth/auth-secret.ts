/**
 * Hemlighet för session, BankID-cookies och lösenordskuvert.
 * I Vercel-produktion krävs AUTH_SECRET (eller NEXTAUTH_SECRET) —
 * det inbyggda reservvärdet får bara användas lokalt.
 */

const LOKALT_RESERV = "brf-dev-secret-byt-i-produktion";

function lasKonfigureradSecret(): string {
  return process.env.AUTH_SECRET?.trim() || process.env.NEXTAUTH_SECRET?.trim() || "";
}

export function arVercelProduktion(): boolean {
  return process.env.VERCEL_ENV === "production";
}

/** HMAC-/krypteringsnyckel. Kastar i produktion om miljövariabeln saknas. */
export function lasAuthSecret(): string {
  const secret = lasKonfigureradSecret();
  if (secret) return secret;
  if (arVercelProduktion()) {
    throw new Error(
      "AUTH_SECRET saknas i produktion. Sätt den i Vercel (Production) innan sajten startar.",
    );
  }
  return LOKALT_RESERV;
}
