/** Idura Verify (OpenID Connect) — test/produktion via miljövariabler. */

export function iduraArKonfigurerad(): boolean {
  return Boolean(
    hamtaIduraDomain() &&
      process.env.IDURA_CLIENT_ID?.trim() &&
      process.env.IDURA_CLIENT_SECRET?.trim(),
  );
}

export function hamtaIduraDomain(): string {
  const raw = process.env.IDURA_DOMAIN?.trim() ?? "";
  if (!raw) return "";
  return raw.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export function hamtaIduraClientId(): string {
  return process.env.IDURA_CLIENT_ID?.trim() ?? "";
}

export function hamtaIduraClientSecret(): string {
  return process.env.IDURA_CLIENT_SECRET?.trim() ?? "";
}

/** Måste matcha exakt en rad i Idura → Allowed redirects. */
export function hamtaIduraRedirectUri(basUrl?: string): string {
  const override = process.env.IDURA_REDIRECT_URI?.trim();
  if (override) return override;
  const app =
    basUrl?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    "http://127.0.0.1:3010";
  const utanSlash = app.replace(/\/$/, "");
  return `${utanSlash}/api/auth/idura/callback`;
}

/** Svensk BankID i Idura Verify (test eller prod). */
export const IDURA_ACR_BANKID = "urn:grn:authn:se:bankid";

export function iduraIssuerUrl(): string {
  const domain = hamtaIduraDomain();
  return domain ? `https://${domain}` : "";
}
