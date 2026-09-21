import { NextResponse } from "next/server";
import { loggaInStyrelseMedPersonnummerNyckel } from "@/lib/auth/auth-tjanst";
import {
  hamtaIduraRedirectUri,
  iduraArKonfigurerad,
} from "@/lib/auth/idura-konfig";
import { bytIduraCodeMotIdToken } from "@/lib/auth/idura-oidc";
import {
  lasIduraOAuthState,
  lasIduraReturnTo,
  pendingFranClaims,
  rensaIduraOAuthCookies,
  sparaIduraPendingPersonnummer,
  valideraReturnTo,
} from "@/lib/auth/idura-oauth-cookies";
import { hamtaRequestMeta } from "@/lib/auth/server-hjalp";
import { skrivSessionCookie } from "@/lib/auth/session";
import { databasArKonfigurerad } from "@/lib/db";

function felRedirect(origin: string, meddelande: string): NextResponse {
  const params = new URLSearchParams({
    bankid: "fel",
    meddelande,
  });
  return NextResponse.redirect(
    new URL(`/styrelse-login?${params.toString()}`, origin),
  );
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  if (!iduraArKonfigurerad()) {
    return felRedirect(url.origin, "BankID är inte konfigurerat.");
  }
  if (!databasArKonfigurerad()) {
    return felRedirect(
      url.origin,
      "Databasen saknas — BankID-inloggning kräver server.",
    );
  }

  const error = url.searchParams.get("error");
  if (error) {
    const desc = url.searchParams.get("error_description") ?? error;
    return felRedirect(url.origin, desc);
  }

  const code = url.searchParams.get("code");
  const stateParam = url.searchParams.get("state");
  const sparad = await lasIduraOAuthState();
  if (!code || !stateParam || !sparad || stateParam !== sparad.state) {
    await rensaIduraOAuthCookies();
    return felRedirect(
      url.origin,
      "Ogiltig eller utgången BankID-session. Försök igen.",
    );
  }

  try {
    const redirectUri = hamtaIduraRedirectUri();
    const { claims } = await bytIduraCodeMotIdToken({ code, redirectUri });

    const nonceClaim = claims.nonce;
    if (typeof nonceClaim !== "string" || nonceClaim !== sparad.nonce) {
      throw new Error("Nonce matchade inte — avbryt inloggning.");
    }

    const pending = pendingFranClaims(claims as Record<string, unknown>);
    if (!pending) {
      throw new Error("Kunde inte läsa personnummer från BankID.");
    }

    const returnTo = valideraReturnTo(await lasIduraReturnTo());
    await rensaIduraOAuthCookies();

    const meta = hamtaRequestMeta(req);
    try {
      const resultat = await loggaInStyrelseMedPersonnummerNyckel({
        personnummerNyckel: pending.personnummerNyckel,
        ...meta,
      });
      await skrivSessionCookie(resultat.token);
      const mal = new URL(returnTo, url.origin);
      mal.searchParams.set("bankid", "ok");
      return NextResponse.redirect(mal);
    } catch (e) {
      if (e instanceof Error && e.message === "BANKID_KOPPLA") {
        await sparaIduraPendingPersonnummer(pending);
        const koppla = new URL("/styrelse-login", url.origin);
        koppla.searchParams.set("bankid", "koppla");
        if (pending.namn) koppla.searchParams.set("namn", pending.namn);
        return NextResponse.redirect(koppla);
      }
      throw e;
    }
  } catch (e) {
    await rensaIduraOAuthCookies();
    return felRedirect(
      url.origin,
      e instanceof Error ? e.message : "BankID-inloggning misslyckades.",
    );
  }
}
