import { prisma } from "@/lib/db";
import { klassificeraInternForeningStatus } from "@/lib/plattform-forening-status";
import { skapaId } from "@/lib/auth/session";

export type PlattformMalTyp = "avtal" | "test";

export type PlattformMalDto = {
  id: string;
  typ: PlattformMalTyp;
  titel: string;
  malAntal: number;
  tidpunkt: string;
  uppfylld: boolean;
  uppfylldTidpunkt: string | null;
  aktiv: boolean;
  skapadTidpunkt: string;
  skapadAvEpost: string;
  /** Beräknat: aktuellt antal mot målet. */
  aktuellt: number;
  procent: number;
  /** Deadline passerad utan uppfyllelse. */
  forsenad: boolean;
};

export type PlattformInstallningDto = {
  varningTestAntal: number;
  uppdateradTidpunkt: string;
  uppdateradAvEpost: string;
};

export type ForeningSiffror = {
  avtal: number;
  test: number;
  utgangen: number;
  totalt: number;
};

export async function hamtaForeningSiffror(): Promise<ForeningSiffror> {
  const rader = await prisma.forening.findMany({
    select: { avtalGodkant: true, skapadTidpunkt: true },
  });
  const siffror: ForeningSiffror = {
    avtal: 0,
    test: 0,
    utgangen: 0,
    totalt: rader.length,
  };
  for (const f of rader) {
    const status = klassificeraInternForeningStatus({
      avtalGodkant: f.avtalGodkant,
      skapadTidpunkt: f.skapadTidpunkt.toISOString(),
    }).status;
    if (status === "kund") siffror.avtal += 1;
    else if (status === "test") siffror.test += 1;
    else siffror.utgangen += 1;
  }
  return siffror;
}

function progressProcent(aktuellt: number, mal: number): number {
  if (mal <= 0) return aktuellt > 0 ? 100 : 0;
  return Math.min(100, Math.round((aktuellt / mal) * 100));
}

function tillMalDto(
  rad: {
    id: string;
    typ: string;
    titel: string;
    malAntal: number;
    tidpunkt: Date;
    uppfylld: boolean;
    uppfylldTidpunkt: Date | null;
    aktiv: boolean;
    skapadTidpunkt: Date;
    skapadAvEpost: string;
  },
  siffror: ForeningSiffror,
  nu = new Date(),
): PlattformMalDto {
  const typ: PlattformMalTyp = rad.typ === "test" ? "test" : "avtal";
  const aktuellt = typ === "avtal" ? siffror.avtal : siffror.test;
  const tidpunktPasserad = rad.tidpunkt.getTime() < nu.getTime();
  return {
    id: rad.id,
    typ,
    titel: rad.titel,
    malAntal: rad.malAntal,
    tidpunkt: rad.tidpunkt.toISOString(),
    uppfylld: rad.uppfylld,
    uppfylldTidpunkt: rad.uppfylldTidpunkt?.toISOString() ?? null,
    aktiv: rad.aktiv,
    skapadTidpunkt: rad.skapadTidpunkt.toISOString(),
    skapadAvEpost: rad.skapadAvEpost,
    aktuellt,
    procent: progressProcent(aktuellt, rad.malAntal),
    forsenad: !rad.uppfylld && tidpunktPasserad,
  };
}

/** Markerar mål som uppfyllda när aktuell siffra når målantaltet. */
export async function synkaUppfylldaMal(
  siffror: ForeningSiffror,
): Promise<void> {
  const aktiva = await prisma.plattformMalRad.findMany({
    where: { aktiv: true, uppfylld: false },
  });
  const nu = new Date();
  for (const rad of aktiva) {
    const aktuellt = rad.typ === "test" ? siffror.test : siffror.avtal;
    if (aktuellt >= rad.malAntal) {
      await prisma.plattformMalRad.update({
        where: { id: rad.id },
        data: { uppfylld: true, uppfylldTidpunkt: nu },
      });
    }
  }
}

export async function listaPlattformMal(): Promise<{
  mal: PlattformMalDto[];
  installning: PlattformInstallningDto;
  siffror: ForeningSiffror;
  varningTest: boolean;
}> {
  const siffror = await hamtaForeningSiffror();
  await synkaUppfylldaMal(siffror);

  const [rader, installning] = await Promise.all([
    prisma.plattformMalRad.findMany({
      where: { aktiv: true },
      orderBy: [{ uppfylld: "asc" }, { tidpunkt: "asc" }],
    }),
    prisma.plattformInstallning.upsert({
      where: { id: "default" },
      create: { id: "default" },
      update: {},
    }),
  ]);

  const mal = rader.map((r) => tillMalDto(r, siffror));
  return {
    mal,
    installning: {
      varningTestAntal: installning.varningTestAntal,
      uppdateradTidpunkt: installning.uppdateradTidpunkt.toISOString(),
      uppdateradAvEpost: installning.uppdateradAvEpost,
    },
    siffror,
    varningTest: siffror.test >= installning.varningTestAntal,
  };
}

export async function skapaPlattformMal(opts: {
  typ: PlattformMalTyp;
  titel?: string;
  malAntal: number;
  tidpunkt: string;
  skapadAvEpost: string;
}): Promise<PlattformMalDto> {
  if (opts.typ !== "avtal" && opts.typ !== "test") {
    throw new Error("Välj typ avtal eller test.");
  }
  if (!Number.isFinite(opts.malAntal) || opts.malAntal < 1) {
    throw new Error("Målantal måste vara minst 1.");
  }
  const tidpunkt = new Date(opts.tidpunkt);
  if (Number.isNaN(tidpunkt.getTime())) {
    throw new Error("Ange ett giltigt datum.");
  }

  const siffror = await hamtaForeningSiffror();
  const aktuellt = opts.typ === "avtal" ? siffror.avtal : siffror.test;
  const redanUppfylld = aktuellt >= opts.malAntal;

  const rad = await prisma.plattformMalRad.create({
    data: {
      id: skapaId("mal"),
      typ: opts.typ,
      titel: opts.titel?.trim() || "",
      malAntal: Math.floor(opts.malAntal),
      tidpunkt,
      uppfylld: redanUppfylld,
      uppfylldTidpunkt: redanUppfylld ? new Date() : null,
      skapadAvEpost: opts.skapadAvEpost,
      aktiv: true,
    },
  });

  return tillMalDto(rad, siffror);
}

export async function arkiveraPlattformMal(id: string): Promise<void> {
  const rad = await prisma.plattformMalRad.findUnique({ where: { id } });
  if (!rad || !rad.aktiv) {
    throw new Error("Målet hittades inte.");
  }
  await prisma.plattformMalRad.update({
    where: { id },
    data: { aktiv: false },
  });
}

export async function sparaVarningTestAntal(opts: {
  varningTestAntal: number;
  epost: string;
}): Promise<PlattformInstallningDto> {
  if (
    !Number.isFinite(opts.varningTestAntal) ||
    opts.varningTestAntal < 1 ||
    opts.varningTestAntal > 100000
  ) {
    throw new Error("Ange ett giltigt antal för varningen (minst 1).");
  }

  const rad = await prisma.plattformInstallning.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      varningTestAntal: Math.floor(opts.varningTestAntal),
      uppdateradAvEpost: opts.epost,
    },
    update: {
      varningTestAntal: Math.floor(opts.varningTestAntal),
      uppdateradAvEpost: opts.epost,
    },
  });

  return {
    varningTestAntal: rad.varningTestAntal,
    uppdateradTidpunkt: rad.uppdateradTidpunkt.toISOString(),
    uppdateradAvEpost: rad.uppdateradAvEpost,
  };
}
