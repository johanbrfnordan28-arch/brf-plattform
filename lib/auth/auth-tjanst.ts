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
  arPlattformAdminEpost,
  hamtaPlattformStartkod,
} from "@/lib/auth/projekt-admin";
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

  if (!konto || !konto.aktiv) {
    await loggaInloggning({
      epost,
      typ: "STYRELSE",
      lyckad: false,
      ip: opts.ip,
      userAgent: opts.userAgent,
    });
    throw new Error("Fel e-post eller lösenord.");
  }

  // Plattformsadmin kan även ha styrelsemedlemskap — tillåt inloggning till förening.
  if (konto.typ !== "STYRELSE" && konto.typ !== "PLATTFORM") {
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
  const startkod = hamtaPlattformStartkod();
  const arAllowlist = arPlattformAdminEpost(epost);

  if (!konto || !konto.aktiv) {
    await loggaInloggning({
      epost,
      typ: "PLATTFORM",
      lyckad: false,
      ip: opts.ip,
      userAgent: opts.userAgent,
    });
    throw new Error("Fel e-post eller kod.");
  }

  // Allowlist eller redan plattformskonto (skapade av personal).
  if (konto.typ !== "PLATTFORM" && !arAllowlist) {
    await loggaInloggning({
      epost,
      typ: "PLATTFORM",
      lyckad: false,
      ip: opts.ip,
      userAgent: opts.userAgent,
    });
    throw new Error("Fel e-post eller kod.");
  }

  const matcharLagrat = verifieraLosenord(opts.losenord, konto.losnordHash);
  const matcharStartkod =
    arAllowlist &&
    opts.losenord.length >= 8 &&
    opts.losenord === startkod;

  if (!matcharLagrat && !matcharStartkod) {
    await loggaInloggning({
      kontoId: konto.id,
      epost,
      typ: "PLATTFORM",
      lyckad: false,
      ip: opts.ip,
      userAgent: opts.userAgent,
    });
    throw new Error("Fel e-post eller kod.");
  }

  const uppdatering: {
    senasteInloggning: Date;
    typ: string;
    losnordHash?: string;
    losenordKuvert?: string;
    namn?: string;
  } = {
    senasteInloggning: new Date(),
    typ: "PLATTFORM",
    namn: konto.namn?.trim() || "Plattformsadmin",
  };

  // Startkod eller lyckad inloggning — synka kuvert så koden syns under «mitt lösenord».
  if (matcharStartkod || matcharLagrat) {
    uppdatering.losnordHash = hashLosenord(opts.losenord);
    uppdatering.losenordKuvert = krypteraLosenordForVisning(opts.losenord);
  }

  await prisma.konto.update({
    where: { id: konto.id },
    data: uppdatering,
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
    namn: uppdatering.namn || konto.namn,
    typ: "PLATTFORM",
    foreningId: null,
  };
  const token = skapaSessionToken(session);
  return { session: { ...session, exp: 0 }, token };
}

export type PlattformAnvandareRad = {
  id: string;
  epost: string;
  namn: string;
  aktiv: boolean;
  senasteInloggning: string | null;
  skapadTidpunkt: string;
  arAllowlist: boolean;
};

export async function listaPlattformAnvandare(): Promise<PlattformAnvandareRad[]> {
  const rader = await prisma.konto.findMany({
    where: { typ: "PLATTFORM" },
    orderBy: { skapadTidpunkt: "asc" },
  });
  return rader.map((k) => ({
    id: k.id,
    epost: k.epost,
    namn: k.namn,
    aktiv: k.aktiv,
    senasteInloggning: k.senasteInloggning?.toISOString() ?? null,
    skapadTidpunkt: k.skapadTidpunkt.toISOString(),
    arAllowlist: arPlattformAdminEpost(k.epost),
  }));
}

export async function skapaPlattformAnvandare(opts: {
  epost: string;
  namn?: string;
  losenord: string;
}): Promise<PlattformAnvandareRad> {
  const epost = normaliseraEpost(opts.epost);
  if (!arGiltigEpost(epost)) {
    throw new Error("Ogiltig e-postadress.");
  }
  const fel = valideraLosenordStyrka(opts.losenord);
  if (fel) throw new Error(fel);

  const finns = await prisma.konto.findUnique({ where: { epostNyckel: epost } });
  if (finns) {
    if (finns.typ === "PLATTFORM") {
      throw new Error("Det finns redan en personalanvändare med den e-posten.");
    }
    // Uppgradera styrelsekonto till personal (behåll medlemskap).
    const uppdaterad = await prisma.konto.update({
      where: { id: finns.id },
      data: {
        typ: "PLATTFORM",
        namn: opts.namn?.trim() || finns.namn || "Plattformsadmin",
        losnordHash: hashLosenord(opts.losenord),
        losenordKuvert: krypteraLosenordForVisning(opts.losenord),
        aktiv: true,
      },
    });
    return {
      id: uppdaterad.id,
      epost: uppdaterad.epost,
      namn: uppdaterad.namn,
      aktiv: uppdaterad.aktiv,
      senasteInloggning: uppdaterad.senasteInloggning?.toISOString() ?? null,
      skapadTidpunkt: uppdaterad.skapadTidpunkt.toISOString(),
      arAllowlist: arPlattformAdminEpost(uppdaterad.epost),
    };
  }

  const skapad = await prisma.konto.create({
    data: {
      id: skapaId("konto"),
      epost,
      epostNyckel: epost,
      namn: opts.namn?.trim() || "Plattformsadmin",
      losnordHash: hashLosenord(opts.losenord),
      losenordKuvert: krypteraLosenordForVisning(opts.losenord),
      typ: "PLATTFORM",
      aktiv: true,
    },
  });

  return {
    id: skapad.id,
    epost: skapad.epost,
    namn: skapad.namn,
    aktiv: skapad.aktiv,
    senasteInloggning: null,
    skapadTidpunkt: skapad.skapadTidpunkt.toISOString(),
    arAllowlist: arPlattformAdminEpost(skapad.epost),
  };
}

export async function uppdateraPlattformAnvandare(opts: {
  kontoId: string;
  namn?: string;
  losenord?: string;
  aktiv?: boolean;
}): Promise<PlattformAnvandareRad> {
  const konto = await prisma.konto.findUnique({ where: { id: opts.kontoId } });
  if (!konto || konto.typ !== "PLATTFORM") {
    throw new Error("Personalanvändaren hittades inte.");
  }

  const data: {
    namn?: string;
    aktiv?: boolean;
    losnordHash?: string;
    losenordKuvert?: string;
  } = {};

  if (opts.namn !== undefined) {
    data.namn = opts.namn.trim();
  }
  if (opts.aktiv !== undefined) {
    data.aktiv = opts.aktiv;
  }
  if (opts.losenord !== undefined && opts.losenord.length > 0) {
    const fel = valideraLosenordStyrka(opts.losenord);
    if (fel) throw new Error(fel);
    data.losnordHash = hashLosenord(opts.losenord);
    data.losenordKuvert = krypteraLosenordForVisning(opts.losenord);
  }

  const uppdaterad = await prisma.konto.update({
    where: { id: konto.id },
    data,
  });

  return {
    id: uppdaterad.id,
    epost: uppdaterad.epost,
    namn: uppdaterad.namn,
    aktiv: uppdaterad.aktiv,
    senasteInloggning: uppdaterad.senasteInloggning?.toISOString() ?? null,
    skapadTidpunkt: uppdaterad.skapadTidpunkt.toISOString(),
    arAllowlist: arPlattformAdminEpost(uppdaterad.epost),
  };
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

/**
 * Genererar nytt tillfälligt lösenord, sparar hash+kuvert och mejlar det.
 * Används vid «Skicka lösenord igen» efter skapande eller från kontot.
 */
export async function skickaTillfalligtLosenord(opts: {
  epost: string;
  basUrl: string;
  /** Om satt: endast detta konto (inloggad användare). */
  kontoId?: string;
}): Promise<{ skickat: boolean; mejlVia?: "resend" | "outbox" }> {
  const epost = normaliseraEpost(opts.epost);
  if (!arGiltigEpost(epost)) {
    throw new Error("Ogiltig e-postadress.");
  }

  const konto = await prisma.konto.findUnique({ where: { epostNyckel: epost } });
  // Undvik e-postläckage när anropet är publikt
  if (!konto || !konto.aktiv || konto.typ !== "STYRELSE") {
    return { skickat: true };
  }
  if (opts.kontoId && konto.id !== opts.kontoId) {
    throw new Error("Du kan bara skicka lösenord till ditt eget konto.");
  }

  // Utan inloggning: endast nya konton som inte loggat in ännu (efter skapa förening).
  if (!opts.kontoId) {
    const skapadMs = konto.skapadTidpunkt.getTime();
    const maxAlderMs = 2 * 60 * 60 * 1000;
    if (konto.senasteInloggning != null || Date.now() - skapadMs > maxAlderMs) {
      throw new Error(
        "Logga in eller använd «Glömt lösenord» för att få en återställningslänk.",
      );
    }
  }

  const medlemskap = await prisma.foreningMedlem.findFirst({
    where: { kontoId: konto.id },
    include: { forening: true },
    orderBy: { skapadTidpunkt: "asc" },
  });
  const foreningsNamn = medlemskap?.forening.namn || "er förening";

  const tillfalligt = genereraTillfalligtLosenord(12);
  await prisma.konto.update({
    where: { id: konto.id },
    data: {
      losnordHash: hashLosenord(tillfalligt),
      losenordKuvert: krypteraLosenordForVisning(tillfalligt),
    },
  });

  const loginUrl = `${opts.basUrl.replace(/\/$/, "")}/styrelse-login`;
  const mejl = await skickaMejl(
    byggLosenordMejl({
      foreningsNamn,
      mottagarNamn: konto.namn,
      epost: konto.epost,
      losenord: tillfalligt,
      loginUrl,
      arSkickaIgen: true,
    }),
  );

  return { skickat: true, mejlVia: mejl.via };
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
