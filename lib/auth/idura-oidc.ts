import {
  createRemoteJWKSet,
  jwtVerify,
  type JWTPayload,
} from "jose";
import {
  hamtaIduraClientId,
  hamtaIduraClientSecret,
  iduraIssuerUrl,
  IDURA_ACR_BANKID,
} from "@/lib/auth/idura-konfig";

type OidcDiscovery = {
  authorization_endpoint: string;
  token_endpoint: string;
  jwks_uri: string;
  issuer: string;
};

let discoveryCache: OidcDiscovery | null = null;

async function hamtaDiscovery(): Promise<OidcDiscovery> {
  if (discoveryCache) return discoveryCache;
  const issuer = iduraIssuerUrl();
  if (!issuer) throw new Error("IDURA_DOMAIN saknas.");
  const res = await fetch(`${issuer}/.well-known/openid-configuration`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Kunde inte hämta Idura OpenID-konfiguration.");
  }
  discoveryCache = (await res.json()) as OidcDiscovery;
  return discoveryCache;
}

export async function byggIduraAuthorizeUrl(opts: {
  state: string;
  nonce: string;
  redirectUri: string;
  loginHint?: string;
}): Promise<string> {
  const discovery = await hamtaDiscovery();
  const params = new URLSearchParams({
    client_id: hamtaIduraClientId(),
    redirect_uri: opts.redirectUri,
    response_type: "code",
    scope: "openid",
    state: opts.state,
    nonce: opts.nonce,
    acr_values: IDURA_ACR_BANKID,
  });
  if (opts.loginHint?.trim()) {
    params.set("login_hint", opts.loginHint.trim());
  }
  return `${discovery.authorization_endpoint}?${params.toString()}`;
}

export async function bytIduraCodeMotIdToken(opts: {
  code: string;
  redirectUri: string;
}): Promise<{ idToken: string; claims: JWTPayload }> {
  const discovery = await hamtaDiscovery();
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: opts.code,
    redirect_uri: opts.redirectUri,
    client_id: hamtaIduraClientId(),
    client_secret: hamtaIduraClientSecret(),
  });

  const tokenRes = await fetch(discovery.token_endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!tokenRes.ok) {
    const text = await tokenRes.text();
    throw new Error(`Idura token-fel: ${text.slice(0, 200)}`);
  }

  const tokenJson = (await tokenRes.json()) as { id_token?: string };
  const idToken = tokenJson.id_token?.trim();
  if (!idToken) throw new Error("Idura svarade utan id_token.");

  const jwks = createRemoteJWKSet(new URL(discovery.jwks_uri));
  const { payload } = await jwtVerify(idToken, jwks, {
    issuer: discovery.issuer,
    audience: hamtaIduraClientId(),
  });

  return { idToken, claims: payload };
}
