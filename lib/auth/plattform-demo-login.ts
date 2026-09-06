/**
 * Personalinloggning när DATABASE_URL saknas (t.ex. demosida på mässan).
 * Tillåter allowlist + startkod / fasta personallösenord utan Prisma.
 */

import {
  arPlattformAdminEpost,
  hamtaPersonalStartkonto,
  hamtaPlattformStartkod,
} from "@/lib/auth/projekt-admin";
import {
  skapaId,
  skapaSessionToken,
  type SessionPayload,
} from "@/lib/auth/session";
import { normaliseraEpost } from "@/lib/auth/epost";

export type PlattformDemoKonto = {
  epost: string;
  namn: string;
  kontoId: string;
};

/**
 * Verifierar personalinloggning utan databas.
 * Godkänner allowlist-epost med startkod eller personligt startlösenord (t.ex. Seif2026).
 */
export function verifieraPlattformDemoInloggning(
  epostRaa: string,
  losenord: string,
): PlattformDemoKonto | null {
  const epost = normaliseraEpost(epostRaa);
  if (!epost || !losenord || losenord.length < 8) return null;
  if (!arPlattformAdminEpost(epost)) return null;

  const special = hamtaPersonalStartkonto(epost);
  const startkod = hamtaPlattformStartkod();
  const matcharSpecial = !!special && losenord === special.losenord;
  const matcharStartkod = losenord === startkod;

  if (!matcharSpecial && !matcharStartkod) return null;

  return {
    epost,
    namn: special?.namn || "Plattformsadmin",
    kontoId: `demo-plattform-${epost.replace(/[^a-z0-9]/gi, "-")}`,
  };
}

export function skapaPlattformDemoSession(konto: PlattformDemoKonto): {
  session: Omit<SessionPayload, "exp">;
  token: string;
} {
  const session: Omit<SessionPayload, "exp"> = {
    kontoId: konto.kontoId || skapaId("demo"),
    epost: konto.epost,
    namn: konto.namn,
    typ: "PLATTFORM",
    foreningId: null,
  };
  return { session, token: skapaSessionToken(session) };
}

/** Lösenord som kan visas under «mitt lösenord» i demoläge. */
export function hamtaPlattformDemoLosenord(epostRaa: string): string | null {
  const epost = normaliseraEpost(epostRaa);
  const special = hamtaPersonalStartkonto(epost);
  if (special) return special.losenord;
  if (arPlattformAdminEpost(epost)) return hamtaPlattformStartkod();
  return null;
}
