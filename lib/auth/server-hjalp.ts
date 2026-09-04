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
  arPlattformAdminEpost,
  listaPlattformAdminEposter,
} from "@/lib/auth/projekt-admin";
import { skickaMejl } from "@/lib/auth/mejl";

let seedPromise: Promise<void> | null = null;

/**
 * Säkerställer att plattformsadmin-konton finns.
 * Tillfälliga lösenord mejlas/outboxas endast första gången kontot skapas.
 */
export async function sakraPlattformAdminKonton(
  basUrl?: string,
): Promise<void> {
  if (!seedPromise) {
    seedPromise = (async () => {
      for (const epost of listaPlattformAdminEposter()) {
        const epostNyckel = normaliseraEpost(epost);
        const finns = await prisma.konto.findUnique({
          where: { epostNyckel },
        });
        if (finns) continue;

        const losenord = genereraTillfalligtLosenord(14);
        await prisma.konto.create({
          data: {
            id: skapaId("konto"),
            epost: epostNyckel,
            epostNyckel,
            namn: arPlattformAdminEpost(epostNyckel)
              ? "Plattformsadmin"
              : "",
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
            `Tillfälligt lösenord: ${losenord}`,
            "",
            "Kontot syns inte för styrelser. Byt lösenord efter inloggning.",
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
