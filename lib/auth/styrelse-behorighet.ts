import { lasSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { verifieraAccessNyckel } from "@/lib/forening-server";

export type StyrelseBehorighet = {
  ok: boolean;
  /** Visningsnamn för loggar och historik. */
  av: string;
  /** Tom när behörigheten kommer från åtkomstnyckel utan session. */
  epost: string;
};

/** Styrelsesession för föreningen, plattformspersonal eller föreningens åtkomstnyckel. */
export async function harStyrelseBehorighet(
  req: Request,
  foreningId: string,
): Promise<StyrelseBehorighet> {
  const session = await lasSession();
  if (session?.typ === "PLATTFORM") {
    return { ok: true, av: session.epost || "Plattform", epost: session.epost };
  }
  if (session?.typ === "STYRELSE" && session.foreningId === foreningId) {
    return {
      ok: true,
      av: session.namn || session.epost,
      epost: session.epost,
    };
  }
  const access =
    req.headers.get("x-access-nyckel") ||
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (access) {
    const rad = await prisma.forening.findUnique({ where: { id: foreningId } });
    if (rad && verifieraAccessNyckel(access, rad.accessNyckelHash)) {
      return { ok: true, av: "Styrelse (access)", epost: "" };
    }
  }
  return { ok: false, av: "", epost: "" };
}
