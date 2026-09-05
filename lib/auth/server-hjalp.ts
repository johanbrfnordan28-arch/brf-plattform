import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { skapaId } from "@/lib/auth/session";
import {
  genereraTillfalligtLosenord,
  hashLosenord,
} from "@/lib/auth/losenord";
import { krypteraLosenordForVisning } from "@/lib/auth/losenord-kuvert";
import { normaliseraEpost } from "@/lib/auth/epost";
import {
  hamtaPersonalStartkonto,
  hamtaPlattformStartkod,
  listaPlattformAdminEposter,
} from "@/lib/auth/projekt-admin";
import { skickaMejl } from "@/lib/auth/mejl";

let seedPromise: Promise<void> | null = null;

/**
 * Säkerställer att plattformsadmin-konton finns.
 * Befintliga styrelsekonton på allowlist uppgraderas till PLATTFORM (behåller lösenord).
 * Nya konton får startkod (eller tillfälligt lösenord om startkod saknas).
 * Namngiven personal (t.ex. Seif) får sitt fasta startlösenord.
 */
export async function sakraPlattformAdminKonton(
  basUrl?: string,
): Promise<void> {
  if (!seedPromise) {
    seedPromise = (async () => {
      const startkod = hamtaPlattformStartkod();
      for (const epost of listaPlattformAdminEposter()) {
        const epostNyckel = normaliseraEpost(epost);
        const special = hamtaPersonalStartkonto(epostNyckel);
        const finns = await prisma.konto.findUnique({
          where: { epostNyckel },
        });

        if (finns) {
          if (finns.typ !== "PLATTFORM" || special) {
            await prisma.konto.update({
              where: { id: finns.id },
              data: {
                typ: "PLATTFORM",
                namn:
                  special?.namn ||
                  finns.namn?.trim() ||
                  "Plattformsadmin",
                aktiv: true,
                ...(special
                  ? {
                      losnordHash: hashLosenord(special.losenord),
                      losenordKuvert: krypteraLosenordForVisning(
                        special.losenord,
                      ),
                    }
                  : {}),
              },
            });
          }
          continue;
        }

        const losenord =
          special?.losenord || startkod || genereraTillfalligtLosenord(14);
        await prisma.konto.create({
          data: {
            id: skapaId("konto"),
            epost: epostNyckel,
            epostNyckel,
            namn: special?.namn || "Plattformsadmin",
            losnordHash: hashLosenord(losenord),
            losenordKuvert: krypteraLosenordForVisning(losenord),
            typ: "PLATTFORM",
            aktiv: true,
          },
        });

        const login =
          (basUrl?.replace(/\/$/, "") || "http://127.0.0.1:3010") +
          "/plattform-login";
        await skickaMejl({
          till: epostNyckel,
          amne: "Plattformsadmin — Styrelse-Navet",
          brodtext: [
            "Ditt plattformsadmin-konto är skapat.",
            `Inloggning: ${login}`,
            `E-post: ${epostNyckel}`,
            `Kod: ${losenord}`,
            "",
            "Logga in med e-post och kod. BankID kommer snart.",
            "Byt kod/lösenord efter inloggning. Kontot syns inte för styrelser.",
          ].join("\n"),
        });
      }
    })().catch((e) => {
      seedPromise = null;
      throw e;
    });
  }
  await seedPromise;
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export function skapaAterstallningsToken(): string {
  return randomBytes(32).toString("base64url");
}

export async function loggaInloggning(opts: {
  kontoId?: string | null;
  epost: string;
  typ: "STYRELSE" | "PLATTFORM";
  foreningId?: string | null;
  lyckad: boolean;
  ip?: string;
  userAgent?: string;
}): Promise<void> {
  await prisma.inloggningsHistorik.create({
    data: {
      id: skapaId("log"),
      kontoId: opts.kontoId || null,
      epost: normaliseraEpost(opts.epost),
      typ: opts.typ,
      foreningId: opts.foreningId || null,
      lyckad: opts.lyckad,
      ip: opts.ip?.slice(0, 120) || "",
      userAgent: opts.userAgent?.slice(0, 300) || "",
    },
  });
}

export function hamtaRequestMeta(req: Request): {
  ip: string;
  userAgent: string;
} {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "";
  return {
    ip,
    userAgent: req.headers.get("user-agent") || "",
  };
}
