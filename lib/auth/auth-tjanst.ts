import { prisma } from "@/lib/db";
import { arGiltigEpost, normaliseraEpost } from "@/lib/auth/epost";
import {
  genereraTillfalligtLosenord,
  hashLosenord,
  valideraLosenordStyrka,
  verifieraLosenord,
} from "@/lib/auth/losenord";
import { krypteraLosenordForVisning } from "@/lib/auth/losenord-kuvert";
import { byggAterstallningsMejl, byggLosenordMejl, skickaMejl } from "@/lib/auth/mejl";
import {
  skapaSessionToken,
  skapaId,
  type SessionPayload,
} from "@/lib/auth/session";
import {
  skapaAterstallningsToken,
  hashToken,
  loggaInloggning,
  sakraPlattformAdminKonton,
} from "@/lib/auth/server-hjalp";
import {
  MAX_STYRELSE_LEDAMOTER,
  arGiltigStyrelseRoll,
} from "@/lib/styrelse-ledamot";
import {
  hashAccessNyckel,
  skapaAccessNyckel,
  normaliseraNamnNyckel,
  tillDto,
  type ForeningServerDto,
} from "@/lib/forening-server";

export type SkapaForeningAuthInput = {
  foreningId: string;
  foreningsNamn: string;
  skapareNamn: string;
  skapareEpost: string;
  skapareRoll: string;
  basUrl: string;
};

export type SkapaForeningAuthResultat = {
  forening: ForeningServerDto;
  accessNyckel: string;
  epost: string;
  tillfalligtLosenord: string;
  mejlVia: "resend" | "outbox";
  kontoId: string;
};

export async function skapaForeningMedKonto(
  input: SkapaForeningAuthInput,
): Promise<SkapaForeningAuthResultat> {
  const namn = input.foreningsNamn.trim();
  if (!namn) throw new Error("Ange ett namn på föreningen.");

  const epost = normaliseraEpost(input.skapareEpost);
  if (!arGiltigEpost(epost)) {
    throw new Error("Ange en giltig e-postadress.");
  }

  const skapareNamn = input.skapareNamn.trim();
  if (!skapareNamn) throw new Error("Ange ditt namn.");

  const roll = input.skapareRoll.trim() || "Ordförande";
  if (!arGiltigStyrelseRoll(roll)) {
    throw new Error("Välj en giltig styrelseroll.");
  }

  const namnNyckel = normaliseraNamnNyckel(namn);
  const befintlig = await prisma.forening.findUnique({ where: { namnNyckel } });
  if (befintlig) {
    throw new Error(`Föreningen «${befintlig.namn}» finns redan på servern.`);
  }

  const accessNyckel = skapaAccessNyckel();
  const medlemId = skapaId("medlem");

  const befintligtKonto = await prisma.konto.findUnique({
    where: { epostNyckel: epost },
  });
  if (befintligtKonto?.typ === "PLATTFORM") {
    throw new Error(
      "Den e-postadressen är reserverad och kan inte användas för en förening.",
    );
  }

  const nyttKonto = !befintligtKonto;
  const tillfalligtLosenord = nyttKonto
    ? genereraTillfalligtLosenord(12)
    : "";

  const rad = await prisma.$transaction(async (tx) => {
    let konto = befintligtKonto;
    if (!konto) {
      konto = await tx.konto.create({
        data: {
          id: skapaId("konto"),
          epost,
          epostNyckel: epost,
          namn: skapareNamn,
          losnordHash: hashLosenord(tillfalligtLosenord),
          losenordKuvert: krypteraLosenordForVisning(tillfalligtLosenord),
          typ: "STYRELSE",
          aktiv: true,
        },
      });
    } else if (skapareNamn && skapareNamn !== konto.namn) {
      konto = await tx.konto.update({
        where: { id: konto.id },
        data: { namn: skapareNamn },
      });
    }

    const forening = await tx.forening.create({
      data: {
        id: input.foreningId,
        namn,
        namnNyckel,
        epost,
        kontaktperson: skapareNamn,
        accessNyckelHash: hashAccessNyckel(accessNyckel),
      },
    });

    const antal = await tx.foreningMedlem.count({
      where: { foreningId: forening.id },
    });
    if (antal >= MAX_STYRELSE_LEDAMOTER) {
      throw new Error(
        `Styrelsen får ha högst ${MAX_STYRELSE_LEDAMOTER} personer.`,
      );
    }

    const redanMedlem = await tx.foreningMedlem.findUnique({
      where: {
        foreningId_kontoId: {
          foreningId: forening.id,
          kontoId: konto.id,
        },
      },
    });
    if (!redanMedlem) {
      await tx.foreningMedlem.create({
        data: {
          id: medlemId,
          foreningId: forening.id,
          kontoId: konto.id,
          roll,
        },
      });
    }

    return { forening, konto };
  });

  const loginUrl = `${input.basUrl.replace(/\/$/, "")}/styrelse-login`;
  const mejl = await skickaMejl(
    nyttKonto
      ? byggLosenordMejl({
          foreningsNamn: namn,
          mottagarNamn: skapareNamn,
          epost,
          losenord: tillfalligtLosenord,
          loginUrl,
        })
      : {
          till: epost,
          amne: `Ny förening «${namn}» — Styrelse-Navet`,
          brodtext: [
            `Hej ${skapareNamn},`,
            "",
            `Föreningen «${namn}» är kopplad till ditt befintliga konto.`,
            `Logga in med samma e-post och lösenord: ${loginUrl}`,
            "",
            "Styrelse-Navet",
          ].join("\n"),
        },
  );

  return {
    forening: tillDto(rad.forening),
    accessNyckel,
    epost,
    tillfalligtLosenord,
    mejlVia: mejl.via,
    kontoId: rad.konto.id,
  };
}

export async function loggaInStyrelse(opts: {
  epost: string;
  losenord: string;
  ip?: string;
  userAgent?: string;
}): Promise<{ session: SessionPayload; token: string; foreningId: string }> {
  const epost = normaliseraEpost(opts.epost);
  const konto = await prisma.konto.findUnique({ where: { epostNyckel: epost } });

  if (!konto || konto.typ !== "STYRELSE" || !konto.aktiv) {
    await loggaInloggning({
      epost,
      typ: "STYRELSE",
      lyckad: false,
      ip: opts.ip,
      userAgent: opts.userAgent,
    });
    throw new Error("Fel e-post eller lösenord.");
  }

  if (!verifieraLosenord(opts.losenord, konto.losnordHash)) {
    await loggaInloggning({
      kontoId: konto.id,
      epost,
      typ: "STYRELSE",
      lyckad: false,
      ip: opts.ip,
      userAgent: opts.userAgent,
    });
    throw new Error("Fel e-post eller lösenord.");
  }

  const medlemskap = await prisma.foreningMedlem.findMany({
    where: { kontoId: konto.id },
    orderBy: { skapadTidpunkt: "asc" },
  });
  if (medlemskap.length === 0) {
    throw new Error("Kontot saknar koppling till en förening.");
  }

  const foreningId = medlemskap[0]!.foreningId;
  await prisma.konto.update({
    where: { id: konto.id },
    data: {
      senasteInloggning: new Date(),
      // Säkerställ att lösenordet kan visas för ägaren under Konto
      losenordKuvert: krypteraLosenordForVisning(opts.losenord),
    },
  });
  await loggaInloggning({
    kontoId: konto.id,
    epost,
    typ: "STYRELSE",
    foreningId,
    lyckad: true,
    ip: opts.ip,
    userAgent: opts.userAgent,
  });

  const session: Omit<SessionPayload, "exp"> = {
    kontoId: konto.id,
    epost: konto.epost,
    namn: konto.namn,
    typ: "STYRELSE",
    foreningId,
  };
  const token = skapaSessionToken(session);
  return {
    session: { ...session, exp: 0 },
    token,
    foreningId,
  };
}

export async function loggaInPlattform(opts: {
  epost: string;
  losenord: string;
  ip?: string;
  userAgent?: string;
  basUrl?: string;
}): Promise<{ session: SessionPayload; token: string }> {
  await sakraPlattformAdminKonton(opts.basUrl);

  const epost = normaliseraEpost(opts.epost);
  const konto = await prisma.konto.findUnique({ where: { epostNyckel: epost } });

  if (!konto || konto.typ !== "PLATTFORM" || !konto.aktiv) {
    await loggaInloggning({
      epost,
      typ: "PLATTFORM",
      lyckad: false,
      ip: opts.ip,
      userAgent: opts.userAgent,
    });
    throw new Error("Fel e-post eller lösenord.");
  }

  if (!verifieraLosenord(opts.losenord, konto.losnordHash)) {
    await loggaInloggning({
      kontoId: konto.id,
      epost,
      typ: "PLATTFORM",
      lyckad: false,
      ip: opts.ip,
      userAgent: opts.userAgent,
    });
    throw new Error("Fel e-post eller lösenord.");
  }

  await prisma.konto.update({
    where: { id: konto.id },
    data: { senasteInloggning: new Date() },
  });
  await loggaInloggning({
    kontoId: konto.id,
    epost,
    typ: "PLATTFORM",
    lyckad: true,
    ip: opts.ip,
    userAgent: opts.userAgent,
  });

  const session: Omit<SessionPayload, "exp"> = {
    kontoId: konto.id,
    epost: konto.epost,
    namn: konto.namn,
    typ: "PLATTFORM",
    foreningId: null,
  };
  const token = skapaSessionToken(session);
  return { session: { ...session, exp: 0 }, token };
}

export async function bytLosenord(opts: {
  kontoId: string;
  nuvarande: string;
  nytt: string;
}): Promise<void> {
  const fel = valideraLosenordStyrka(opts.nytt);
  if (fel) throw new Error(fel);

  const konto = await prisma.konto.findUnique({ where: { id: opts.kontoId } });
  if (!konto) throw new Error("Kontot hittades inte.");
  if (!verifieraLosenord(opts.nuvarande, konto.losnordHash)) {
    throw new Error("Nuvarande lösenord stämmer inte.");
  }

  await prisma.konto.update({
    where: { id: konto.id },
    data: {
      losnordHash: hashLosenord(opts.nytt),
      losenordKuvert: krypteraLosenordForVisning(opts.nytt),
    },
  });
}

export async function begärAterstallning(opts: {
  epost: string;
  basUrl: string;
}): Promise<{ skickat: boolean }> {
  const epost = normaliseraEpost(opts.epost);
  const konto = await prisma.konto.findUnique({ where: { epostNyckel: epost } });
  // Samma svar oavsett om kontot finns (undvik e-postläckage)
  if (!konto || !konto.aktiv) {
    return { skickat: true };
  }

  const token = skapaAterstallningsToken();
  await prisma.losnordAterstallning.create({
    data: {
      id: skapaId("reset"),
      kontoId: konto.id,
      tokenHash: hashToken(token),
      utgar: new Date(Date.now() + 60 * 60 * 1000),
      anvand: false,
    },
  });

  const länk = `${opts.basUrl.replace(/\/$/, "")}/konto/aterstall?token=${encodeURIComponent(token)}`;
  await skickaMejl(
    byggAterstallningsMejl({
      epost: konto.epost,
      namn: konto.namn,
      länk,
    }),
  );

  return { skickat: true };
}

export async function aterstallLosenordMedToken(opts: {
  token: string;
  nytt: string;
}): Promise<void> {
  const fel = valideraLosenordStyrka(opts.nytt);
  if (fel) throw new Error(fel);

  const tokenHash = hashToken(opts.token);
  const rad = await prisma.losnordAterstallning.findUnique({
    where: { tokenHash },
  });
  if (!rad || rad.anvand || rad.utgar.getTime() < Date.now()) {
    throw new Error("Länken är ogiltig eller har gått ut.");
  }

  await prisma.$transaction([
    prisma.konto.update({
      where: { id: rad.kontoId },
      data: {
        losnordHash: hashLosenord(opts.nytt),
        losenordKuvert: krypteraLosenordForVisning(opts.nytt),
      },
    }),
    prisma.losnordAterstallning.update({
      where: { id: rad.id },
      data: { anvand: true },
    }),
  ]);
}

export async function signeraAvtalMedBankId(opts: {
  foreningId: string;
  signerNamn: string;
}): Promise<ForeningServerDto> {
  const namn = opts.signerNamn.trim();
  if (!namn) throw new Error("Ange namn för BankID-signering.");

  const rad = await prisma.forening.findUnique({
    where: { id: opts.foreningId },
  });
  if (!rad) throw new Error("Föreningen hittades inte.");
  if (!rad.epost?.trim()) {
    throw new Error("Fyll i e-post innan avtalssignering.");
  }

  const uppdaterad = await prisma.forening.update({
    where: { id: opts.foreningId },
    data: {
      avtalGodkant: true,
      avtalGodkantTidpunkt: new Date(),
      avtalBankidTidpunkt: new Date(),
      avtalBankidNamn: namn,
    },
  });

  return tillDto(uppdaterad);
}
