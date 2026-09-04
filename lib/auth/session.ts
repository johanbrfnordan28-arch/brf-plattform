import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "brf_session";
const SESSION_TTL_SEKUNDER = 60 * 60 * 24 * 14; // 14 dagar

export type SessionPayload = {
  kontoId: string;
  epost: string;
  namn: string;
  typ: "STYRELSE" | "PLATTFORM";
  foreningId: string | null;
  exp: number;
};

function authSecret(): string {
  return (
    process.env.AUTH_SECRET?.trim() ||
    process.env.NEXTAUTH_SECRET?.trim() ||
    "brf-dev-secret-byt-i-produktion"
  );
}

function signera(data: string): string {
  return createHmac("sha256", authSecret()).update(data).digest("base64url");
}

export function skapaSessionToken(payload: Omit<SessionPayload, "exp">): string {
  const full: SessionPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SEKUNDER,
  };
  const body = Buffer.from(JSON.stringify(full), "utf8").toString("base64url");
  const sign = signera(body);
  return `${body}.${sign}`;
}

export function lasSessionFranToken(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const [body, sign] = token.split(".");
  if (!body || !sign) return null;
  const forvantad = signera(body);
  try {
    const a = Buffer.from(sign);
    const b = Buffer.from(forvantad);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as SessionPayload;
    if (!payload?.kontoId || !payload.epost || !payload.exp) return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    if (payload.typ !== "STYRELSE" && payload.typ !== "PLATTFORM") return null;
    return payload;
  } catch {
    return null;
  }
}

export async function lasSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  return lasSessionFranToken(jar.get(SESSION_COOKIE)?.value);
}

export async function skrivSessionCookie(token: string): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SEKUNDER,
  });
}

export async function rensaSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export function skapaId(prefix: string): string {
  return `${prefix}_${randomBytes(12).toString("hex")}`;
}
