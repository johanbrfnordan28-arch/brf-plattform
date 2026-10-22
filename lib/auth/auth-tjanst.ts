import { prisma } from "@/lib/db";
import { arGiltigEpost, normaliseraEpost } from "@/lib/auth/epost";
import {
  genereraTillfalligtLosenord,
  hashLosenord,
  valideraLosenordStyrka,
  verifieraLosenord,
} from "@/lib/auth/losenord";
import { krypteraLosenordForVisning } from "@/lib/auth/losenord-kuvert";
import { byggLosenordMejl, skickaMejl, type MejlLeveransVia } from "@/lib/auth/mejl";
import {
  skapaSessionToken,
  skapaId,
  type SessionPayload,
} from "@/lib/auth/session";
import {
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
  avtalSignaturerTillJson,
  hashAccessNyckel,
  skapaAccessNyckel,
  normaliseraNamnNyckel,
  tillDto,
  type ForeningServerDto,
} from "@/lib/forening-server";
import { markeraStyrelsemassaLeadSomSkapadeTest } from "@/lib/styrelsemassa-lead-server";
import { VILLKOR_VERSION } from "@/lib/juridik";
import {
  harTillrackligaBankIdSignaturer,
  laggTillBankIdSignatur,
  normaliseraBankIdSignaturer,
  sammanfattaBankIdSignaturer,
} from "@/lib/bankid-signering";
import { personnummerTillNyckel } from "@/lib/auth/personnummer-nyckel";
import {
  arGiltigtPersonnummer,
  maskeraPersonnummer,
} from "@/lib/personnummer-format";

export type SkapaForeningAuthInput = {
  foreningId: string;
  foreningsNamn: string;
  skapareNamn: string;
  skapareEpost: string;
  skapareRoll: string;
  villkorVersion: string;
  basUrl: string;
  /** Kontot i aktuell session — krävs för att återkoppla en befintlig förening. */
  inloggadKontoId?: string | null;
  organisationsnummer?: string;
  postadress?: string;
  postnummer?: string;
  ort?: string;
};

export type SkapaForeningAuthResultat = {
  forening: ForeningServerDto;
  accessNyckel: string;
  epost: string;
  tillfalligtLosenord: string;
  mejlVia: MejlLeveransVia;
  kontoId: string;
  /** Föreningen fanns redan på servern — hämtad till webbläsaren. */
  aterkopplad?: boolean;
};

/** Hämtar befintlig förening till samma e-post (t.ex. efter rensad webbläsare). */
async function aterkopplaBefintligForening(opts: {
  forening: { id: string; namn: string; epost: string };
  epost: string;
  skapareNamn: string;
  roll: string;
  konto: { id: string; namn: string } | null;
  inloggadKontoId?: string | null;
}): Promise<SkapaForeningAuthResultat | null> {
  if (!opts.konto) return null;
  // Utan inloggning räcker inte e-postadressen: den kan vara känd för vem som helst.
  if (!opts.inloggadKontoId || opts.inloggadKontoId !== opts.konto.id) return null;

  const foreningEpost = normaliseraEpost(opts.forening.epost || "");
  const medlem = await prisma.foreningMedlem.findUnique({
    where: {
      foreningId_kontoId: {
        foreningId: opts.forening.id,
        kontoId: opts.konto.id,
      },
    },
  });

  const farAterkoppla =
    Boolean(medlem) || (foreningEpost.length > 0 && foreningEpost === opts.epost);

  if (!farAterkoppla) return null;

  const accessNyckel = skapaAccessNyckel();
  const uppdaterad = await prisma.$transaction(async (tx) => {
    const forening = await tx.forening.update({
      where: { id: opts.forening.id },
      data: { accessNyckelHash: hashAccessNyckel(accessNyckel) },
    });

    if (!medlem) {
      const antal = await tx.foreningMedlem.count({
        where: { foreningId: opts.forening.id },
      });
      if (antal >= MAX_STYRELSE_LEDAMOTER) {
        throw new Error(
          `Styrelsen får ha högst ${MAX_STYRELSE_LEDAMOTER} personer.`,
        );
      }
      await tx.foreningMedlem.create({
        data: {
          id: skapaId("medlem"),
          foreningId: opts.forening.id,
          kontoId: opts.konto!.id,
          roll: opts.roll,
        },
      });
    }

    if (opts.skapareNamn && opts.skapareNamn !== opts.konto!.namn) {
      await tx.konto.update({
        where: { id: opts.konto!.id },
        data: { namn: opts.skapareNamn },
      });
    }

    return forening;
  });

  return {
    forening: tillDto(uppdaterad),
    accessNyckel,
    epost: opts.epost,
    tillfalligtLosenord: "",
    mejlVia: "ingen",
    kontoId: opts.konto.id,
    aterkopplad: true,
  };
}

/** Ny åtkomstnyckel för webbläsare efter inloggning (samma mönster som återkoppling). */
export async function utfardaAccessNyckelForMedlem(
  foreningId: string,
  kontoId: string,
): Promise<string> {
  const medlem = await prisma.foreningMedlem.findUnique({
    where: {
      foreningId_kontoId: { foreningId, kontoId },
    },
  });
  if (!medlem) {
    throw new Error("Ingen åtkomst till föreningen.");
  }

  const accessNyckel = skapaAccessNyckel();
  await prisma.forening.update({
    where: { id: foreningId },
    data: { accessNyckelHash: hashAccessNyckel(accessNyckel) },
  });
  return accessNyckel;
}

/** Föreningar kopplade till kontot — för inloggningssidan efter session. */
export async function hamtaMinaForeningar(
  kontoId: string,
): Promise<ForeningServerDto[]> {
  const medlemskap = await prisma.foreningMedlem.findMany({
    where: { kontoId },
    include: { forening: true },
    orderBy: { skapadTidpunkt: "desc" },
  });
  return medlemskap.map((m) => tillDto(m.forening));
}

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

  if (input.villkorVersion !== VILLKOR_VERSION) {
    throw new Error(
      "Godkänn villkoren och personuppgiftsbiträdesavtalet för att skapa föreningen. Ladda om sidan om du redan kryssat i rutan.",
    );
  }

  const namnNyckel = normaliseraNamnNyckel(namn);
  const befintlig = await prisma.forening.findUnique({ where: { namnNyckel } });

  const befintligtKonto = await prisma.konto.findUnique({
    where: { epostNyckel: epost },
  });

  if (befintlig) {
    const aterkopplad = await aterkopplaBefintligForening({
      forening: befintlig,
      epost,
      skapareNamn,
      roll,
      konto: befintligtKonto,
      inloggadKontoId: input.inloggadKontoId,
    });
    if (aterkopplad) {
      await markeraStyrelsemassaLeadSomSkapadeTest({
        epost,
        foreningId: aterkopplad.forening.id,
      }).catch(() => {});
      return aterkopplad;
    }
    throw new Error(
      `Föreningen «${befintlig.namn}» finns redan. Är du med i styrelsen? Logga in med e-post och lösenord eller BankID för att öppna den — annars välj ett annat namn.`,
    );
  }

  const accessNyckel = skapaAccessNyckel();
  const medlemId = skapaId("medlem");

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
        organisationsnummer: input.organisationsnummer?.trim() ?? "",
        postadress: input.postadress?.trim() ?? "",
        postnummer: input.postnummer?.trim() ?? "",
        ort: input.ort?.trim() ?? "",
        grundinfoPaborjad: Boolean(
          input.postadress?.trim() || input.organisationsnummer?.trim(),
        ),
        accessNyckelHash: hashAccessNyckel(accessNyckel),
        villkorVersion: VILLKOR_VERSION,
        villkorGodkantTidpunkt: new Date(),
        villkorGodkantAvEpost: epost,
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
  const arPlattformKonto = befintligtKonto?.typ === "PLATTFORM";
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
            arPlattformKonto
              ? `Föreningen «${namn}» är kopplad till ditt befintliga konto (samma e-post som plattformsadmin).`
              : `Föreningen «${namn}» är kopplad till ditt befintliga konto.`,
            `Logga in med samma e-post och lösenord: ${loginUrl}`,
            "",
            "Styrelse-Navet",
          ].join("\n"),
        },
  ).catch((error) => {
    console.error("[auth] Mejl vid skapa förening misslyckades:", error);
    return { via: "ingen" as const, id: "" };
  });

  await markeraStyrelsemassaLeadSomSkapadeTest({
    epost,
    foreningId: rad.forening.id,
  }).catch(() => {
    /* valfri uppföljning — ska inte stoppa skapande */
  });

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
}): Promise<{
  session: SessionPayload;
  token: string;
  foreningId: string;
  forening: ForeningServerDto;
  accessNyckel: string;
}> {
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
    orderBy: { skapadTidpunkt: "desc" },
  });
  if (medlemskap.length === 0) {
    throw new Error("Kontot saknar koppling till en förening.");
  }

  const foreningId = medlemskap[0]!.foreningId;
  const foreningRad = await prisma.forening.findUnique({
    where: { id: foreningId },
  });
  if (!foreningRad) {
    throw new Error("Föreningen hittades inte.");
  }
  if (foreningRad.borttagenTidpunkt) {
    throw new Error(
      "Föreningen är borttagen och kan inte logga in. Kontakta plattformsadmin om detta är fel.",
    );
  }

  const accessNyckel = await utfardaAccessNyckelForMedlem(
    foreningId,
    konto.id,
  );

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
    forening: tillDto(foreningRad),
    accessNyckel,
  };
}

/** Inloggning efter verifierad Idura/BankID (personnummer redan hashat). */
export async function loggaInStyrelseMedPersonnummerNyckel(opts: {
  personnummerNyckel: string;
  ip?: string;
  userAgent?: string;
}): Promise<{
  token: string;
  foreningId: string;
  forening: ForeningServerDto;
  accessNyckel: string;
  epost: string;
}> {
  const konto = await prisma.konto.findFirst({
    where: {
      personnummerNyckel: opts.personnummerNyckel,
      aktiv: true,
    },
  });
  if (!konto) {
    throw new Error("BANKID_KOPPLA");
  }
  if (konto.typ !== "STYRELSE" && konto.typ !== "PLATTFORM") {
    throw new Error("Kontot kan inte logga in som styrelse.");
  }

  const epost = konto.epost;
  const medlemskap = await prisma.foreningMedlem.findMany({
    where: { kontoId: konto.id },
    orderBy: { skapadTidpunkt: "desc" },
  });
  if (medlemskap.length === 0) {
    throw new Error("Kontot saknar koppling till en förening.");
  }

  const foreningId = medlemskap[0]!.foreningId;
  const foreningRad = await prisma.forening.findUnique({
    where: { id: foreningId },
  });
  if (!foreningRad) {
    throw new Error("Föreningen hittades inte.");
  }
  if (foreningRad.borttagenTidpunkt) {
    throw new Error(
      "Föreningen är borttagen och kan inte logga in. Kontakta plattformsadmin om detta är fel.",
    );
  }

  const accessNyckel = await utfardaAccessNyckelForMedlem(
    foreningId,
    konto.id,
  );

  await prisma.konto.update({
    where: { id: konto.id },
    data: { senasteInloggning: new Date() },
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
    token,
    foreningId,
    forening: tillDto(foreningRad),
    accessNyckel,
    epost,
  };
}

/** Inloggning för personal efter verifierad Idura/BankID. */
export async function loggaInPlattformMedPersonnummerNyckel(opts: {
  personnummerNyckel: string;
  ip?: string;
  userAgent?: string;
}): Promise<{ token: string }> {
  const konto = await prisma.konto.findFirst({
    where: {
      personnummerNyckel: opts.personnummerNyckel,
      aktiv: true,
    },
  });
  if (!konto) throw new Error("BANKID_KOPPLA");
  if (konto.typ !== "PLATTFORM") {
    throw new Error(
      "Detta BankID är kopplat till en förening, inte till personal.",
    );
  }

  await prisma.konto.update({
    where: { id: konto.id },
    data: { senasteInloggning: new Date() },
  });
  await loggaInloggning({
    kontoId: konto.id,
    epost: konto.epost,
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
  return { token: skapaSessionToken(session) };
}

/** Kopplar BankID till konto efter lyckad e-postinloggning (engångs pending-cookie). */
export async function kopplaPersonnummerTillKonto(opts: {
  kontoId: string;
  personnummerNyckel: string;
}): Promise<void> {
  const befintlig = await prisma.konto.findFirst({
    where: {
      personnummerNyckel: opts.personnummerNyckel,
      NOT: { id: opts.kontoId },
    },
  });
  if (befintlig) {
    throw new Error(
      "Detta BankID är redan kopplat till ett annat konto.",
    );
  }
  await prisma.konto.update({
    where: { id: opts.kontoId },
    data: { personnummerNyckel: opts.personnummerNyckel },
  });
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
  /** Sant när personnumret från BankID är knutet till kontot. Själva nyckeln lämnas inte ut. */
  bankidKopplad: boolean;
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
    bankidKopplad: Boolean(k.personnummerNyckel),
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
      bankidKopplad: Boolean(uppdaterad.personnummerNyckel),
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
    bankidKopplad: false,
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
    bankidKopplad: Boolean(uppdaterad.personnummerNyckel),
  };
}

export async function bytLosenord(opts: {
  kontoId: string;
  /** Om utelämnat: anroparen är redan inloggad och behöver inte det gamla. */
  nuvarande?: string;
  nytt: string;
}): Promise<void> {
  const fel = valideraLosenordStyrka(opts.nytt);
  if (fel) throw new Error(fel);

  const konto = await prisma.konto.findUnique({ where: { id: opts.kontoId } });
  if (!konto) throw new Error("Kontot hittades inte.");
  if (opts.nuvarande) {
    if (!verifieraLosenord(opts.nuvarande, konto.losnordHash)) {
      throw new Error("Nuvarande lösenord stämmer inte.");
    }
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
}): Promise<{
  skickat: boolean;
  mejlVia?: MejlLeveransVia;
  tillfalligtLosenord?: string;
}> {
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
        "Logga in eller använd «Glömt lösenord» för att få ett nytt lösenord.",
      );
    }
  }

  return mejlaNyttTillfalligtLosenord({
    kontoId: konto.id,
    epost: konto.epost,
    namn: konto.namn,
    basUrl: opts.basUrl,
  });
}

async function mejlaNyttTillfalligtLosenord(opts: {
  kontoId: string;
  epost: string;
  namn: string;
  basUrl: string;
  foreningsNamn?: string;
}): Promise<{
  skickat: boolean;
  mejlVia: MejlLeveransVia;
  tillfalligtLosenord: string;
}> {
  const medlemskap = await prisma.foreningMedlem.findFirst({
    where: { kontoId: opts.kontoId },
    include: { forening: true },
    orderBy: { skapadTidpunkt: "asc" },
  });
  const foreningsNamn =
    opts.foreningsNamn?.trim() || medlemskap?.forening.namn || "er förening";

  const tillfalligt = genereraTillfalligtLosenord(12);
  await prisma.konto.update({
    where: { id: opts.kontoId },
    data: {
      losnordHash: hashLosenord(tillfalligt),
      losenordKuvert: krypteraLosenordForVisning(tillfalligt),
    },
  });

  const loginUrl = `${opts.basUrl.replace(/\/$/, "")}/styrelse-login`;
  const mejl = await skickaMejl(
    byggLosenordMejl({
      foreningsNamn,
      mottagarNamn: opts.namn,
      epost: opts.epost,
      losenord: tillfalligt,
      loginUrl,
      arSkickaIgen: true,
    }),
  ).catch((error) => {
    console.error("[auth] Mejl vid nytt lösenord misslyckades:", error);
    return { via: "ingen" as const, id: "" };
  });

  return {
    skickat: true,
    mejlVia: mejl.via,
    tillfalligtLosenord: tillfalligt,
  };
}

export async function begärAterstallning(opts: {
  epost: string;
  basUrl: string;
  foreningsNamn?: string;
}): Promise<{
  skickat: boolean;
  tillfalligtLosenord?: string;
  mejlVia?: MejlLeveransVia;
}> {
  const epost = normaliseraEpost(opts.epost);
  const konto = await prisma.konto.findUnique({ where: { epostNyckel: epost } });
  // Samma svar oavsett om kontot finns (undvik e-postläckage)
  if (!konto || !konto.aktiv || konto.typ !== "STYRELSE") {
    return { skickat: true };
  }

  return mejlaNyttTillfalligtLosenord({
    kontoId: konto.id,
    epost: konto.epost,
    namn: konto.namn,
    basUrl: opts.basUrl,
    foreningsNamn: opts.foreningsNamn,
  });
}

export async function aterstallLosenordMedToken(opts: {
  token: string;
  nytt: string;
}): Promise<{ epost: string }> {
  const fel = valideraLosenordStyrka(opts.nytt);
  if (fel) throw new Error(fel);

  const tokenHash = hashToken(opts.token);
  const rad = await prisma.losnordAterstallning.findUnique({
    where: { tokenHash },
    include: { konto: true },
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

  return { epost: rad.konto.epost };
}

export async function signeraAvtalMedBankId(opts: {
  foreningId: string;
  signerNamn: string;
  personnummer: string;
}): Promise<ForeningServerDto> {
  const namn = opts.signerNamn.trim();
  if (!namn) throw new Error("Ange namn för BankID-signering.");
  if (!arGiltigtPersonnummer(opts.personnummer)) {
    throw new Error("Ange ett giltigt personnummer för den som ska signera.");
  }
  const personnummerNyckel = personnummerTillNyckel(opts.personnummer);
  if (!personnummerNyckel) {
    throw new Error("Kunde inte läsa personnummer från BankID.");
  }

  const rad = await prisma.forening.findUnique({
    where: { id: opts.foreningId },
  });
  if (!rad) throw new Error("Föreningen hittades inte.");
  if (!rad.epost?.trim()) {
    throw new Error("Fyll i e-post innan avtalssignering.");
  }

  const tillagd = laggTillBankIdSignatur(
    normaliseraBankIdSignaturer(rad.avtalSignaturer),
    {
      namn,
      personnummerMaskerat: maskeraPersonnummer(opts.personnummer),
      personnummerNyckel,
      tidpunkt: new Date().toISOString(),
      part: "kund",
    },
  );
  if (!tillagd.ok) throw new Error(tillagd.fel);

  const klar = harTillrackligaBankIdSignaturer(tillagd.signaturer);
  const nu = new Date();
  const uppdaterad = await prisma.forening.update({
    where: { id: opts.foreningId },
    data: {
      avtalGodkant: klar ? true : rad.avtalGodkant,
      avtalGodkantTidpunkt: klar ? nu : rad.avtalGodkantTidpunkt,
      avtalBankidTidpunkt: nu,
      avtalBankidNamn: sammanfattaBankIdSignaturer(tillagd.signaturer),
      avtalSignaturer: avtalSignaturerTillJson(tillagd.signaturer),
    },
  });

  return tillDto(uppdaterad);
}
