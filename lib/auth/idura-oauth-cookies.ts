import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import {
  hamtaPersonnummerFranClaims,
  hamtaVisningsNamnFranClaims,
} from "@/lib/auth/personnummer-nyckel";

const STATE_COOKIE = "brf_idura_oauth_state";
const RETURN_COOKIE = "brf_idura_oauth_return";
const PENDING_COOKIE = "brf_idura_pending";
const TTL_SEK = 60 * 15;

function signera(data: string): string {
  const secret =
    process.env.AUTH_SECRET?.trim() ||
    process.env.NEXTAUTH_SECRET?.trim() ||
    "brf-dev-secret-byt-i-produktion";
  return createHmac("sha256", secret).update(data).digest("base64url");
}

function pack(payload: object): string {
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url",
  );
  return `${body}.${signera(body)}`;
}

function unpack<T extends Record<string, unknown>>(token: string): T | null {
  const [body, sign] = token.split(".");
  if (!body || !sign) return null;
  const forvantad = signera(body);
  try {
    const a = Buffer.from(sign);
    const b = Buffer.from(forvantad);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    return JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as T;
  } catch {
    return null;
  }
}

export function skapaIduraState(): string {
  return randomBytes(24).toString("base64url");
}

export function skapaIduraNonce(): string {
  return randomBytes(24).toString("base64url");
}

const LOGIN_SIDOR = ["/styrelse-login", "/kund-login"] as const;
export type IduraLoginSida = (typeof LOGIN_SIDOR)[number];

/** Inloggningssidan BankID startades från — dit skickas fel och kopplingssteg tillbaka. */
export function valideraLoginSida(
  varde: string | null | undefined,
): IduraLoginSida {
  return LOGIN_SIDOR.find((sida) => sida === varde?.trim()) ?? "/styrelse-login";
}

export async function sparaIduraOAuthCookies(opts: {
  state: string;
  nonce: string;
  returnTo: string;
  loginSida: IduraLoginSida;
}): Promise<void> {
  const jar = await cookies();
  const base = {
    exp: Math.floor(Date.now() / 1000) + TTL_SEK,
    state: opts.state,
    nonce: opts.nonce,
  };
  jar.set(STATE_COOKIE, pack(base), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TTL_SEK,
  });
  const retur = {
    exp: base.exp,
    returnTo: opts.returnTo,
    loginSida: opts.loginSida,
  };
  jar.set(RETURN_COOKIE, pack(retur), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TTL_SEK,
  });
}

export async function lasIduraOAuthState(): Promise<{
  state: string;
  nonce: string;
} | null> {
  const jar = await cookies();
  const raw = jar.get(STATE_COOKIE)?.value;
  if (!raw) return null;
  const data = unpack<{ exp: number; state: string; nonce: string }>(raw);
  if (!data?.state || !data.nonce || data.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }
  return { state: data.state, nonce: data.nonce };
}

export async function lasIduraReturnTo(): Promise<string> {
  const jar = await cookies();
  const raw = jar.get(RETURN_COOKIE)?.value;
  const data = unpack<{ exp: number; returnTo: string }>(raw ?? "");
  if (!data?.returnTo || data.exp < Math.floor(Date.now() / 1000)) {
    return "/auth/idura/klar";
  }
  return data.returnTo;
}

export async function lasIduraLoginSida(): Promise<IduraLoginSida> {
  const jar = await cookies();
  const raw = jar.get(RETURN_COOKIE)?.value;
  const data = unpack<{ loginSida?: string }>(raw ?? "");
  return valideraLoginSida(data?.loginSida);
}

export async function rensaIduraOAuthCookies(): Promise<void> {
  const jar = await cookies();
  jar.set(STATE_COOKIE, "", { path: "/", maxAge: 0 });
  jar.set(RETURN_COOKIE, "", { path: "/", maxAge: 0 });
}

export async function sparaIduraPendingPersonnummer(opts: {
  personnummerNyckel: string;
  namn: string;
}): Promise<void> {
  const jar = await cookies();
  jar.set(
    PENDING_COOKIE,
    pack({
      exp: Math.floor(Date.now() / 1000) + TTL_SEK,
      personnummerNyckel: opts.personnummerNyckel,
      namn: opts.namn,
    }),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: TTL_SEK,
    },
  );
}

export async function lasOchRensaIduraPending(): Promise<{
  personnummerNyckel: string;
  namn: string;
} | null> {
  const jar = await cookies();
  const raw = jar.get(PENDING_COOKIE)?.value;
  jar.set(PENDING_COOKIE, "", { path: "/", maxAge: 0 });
  if (!raw) return null;
  const data = unpack<{
    exp: number;
    personnummerNyckel: string;
    namn: string;
  }>(raw);
  if (
    !data?.personnummerNyckel ||
    data.exp < Math.floor(Date.now() / 1000)
  ) {
    return null;
  }
  return {
    personnummerNyckel: data.personnummerNyckel,
    namn: data.namn ?? "",
  };
}

export function valideraReturnTo(returnTo: string | null | undefined): string {
  const fallback = "/auth/idura/klar";
  if (!returnTo?.trim()) return fallback;
  const path = returnTo.trim();
  if (!path.startsWith("/") || path.startsWith("//")) return fallback;
  if (path.includes("://")) return fallback;
  return path;
}

export function pendingFranClaims(claims: Record<string, unknown>): {
  personnummerNyckel: string;
  namn: string;
} | null {
  const personnummerNyckel = hamtaPersonnummerFranClaims(claims);
  if (!personnummerNyckel) return null;
  return {
    personnummerNyckel,
    namn: hamtaVisningsNamnFranClaims(claims),
  };
}
