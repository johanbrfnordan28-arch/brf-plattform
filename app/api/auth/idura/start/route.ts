import { NextResponse } from "next/server";
import {
  hamtaIduraRedirectUri,
  iduraArKonfigurerad,
} from "@/lib/auth/idura-konfig";
import { byggIduraAuthorizeUrl } from "@/lib/auth/idura-oidc";
import {
  skapaIduraNonce,
  skapaIduraState,
  sparaIduraOAuthCookies,
  valideraReturnTo,
} from "@/lib/auth/idura-oauth-cookies";

export async function GET(req: Request) {
  if (!iduraArKonfigurerad()) {
    return NextResponse.json(
      { fel: "BankID (Idura) är inte konfigurerat på servern." },
      { status: 503 },
    );
  }

  const url = new URL(req.url);
  const returnTo = valideraReturnTo(url.searchParams.get("returnTo"));
  const state = skapaIduraState();
  const nonce = skapaIduraNonce();

  await sparaIduraOAuthCookies({ state, nonce, returnTo });

  const redirectUri = hamtaIduraRedirectUri();
  const authorizeUrl = await byggIduraAuthorizeUrl({
    state,
    nonce,
    redirectUri,
  });

  return NextResponse.redirect(authorizeUrl);
}
