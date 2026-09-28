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

/**
 * Byggs från domänen anropet kom in på: OAuth-state-kakan sätts där, så
 * callback måste landa på samma domän. Måste matcha en rad i Idura → Allowed redirects.
 */
export function hamtaIduraRedirectUri(req: Request): string {
  const url = new URL(req.url);
  const host =
    req.headers.get("x-forwarded-host")?.split(",")[0]?.trim() || url.host;
  const proto =
    req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
    url.protocol.replace(/:$/, "");
  return `${proto}://${host}/api/auth/idura/callback`;
}

/** Svensk BankID i Idura Verify (test eller prod). */
export const IDURA_ACR_BANKID = "urn:grn:authn:se:bankid";

export function iduraIssuerUrl(): string {
  const domain = hamtaIduraDomain();
  return domain ? `https://${domain}` : "";
}
