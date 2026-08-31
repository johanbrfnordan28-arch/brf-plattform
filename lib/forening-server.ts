import { createHash, randomBytes } from "crypto";
import type { Forening } from "@prisma/client";
import { prisma } from "@/lib/db";

export type ForeningServerDto = {
  id: string;
  namn: string;
  organisationsnummer: string;
  epost: string;
  postadress: string;
  postnummer: string;
  ort: string;
  kontaktperson: string;
  grundinfoPaborjad: boolean;
  avtalGodkant: boolean;
  avtalGodkantTidpunkt: string;
  avtalBankidTidpunkt: string;
  avtalBankidNamn: string;
  skapadTidpunkt: string;
};

export type ForeningUpsertInput = {
  id: string;
  namn: string;
  organisationsnummer?: string;
  epost?: string;
  postadress?: string;
  postnummer?: string;
  ort?: string;
  kontaktperson?: string;
  grundinfoPaborjad?: boolean;
  avtalGodkant?: boolean;
  avtalGodkantTidpunkt?: string | null;
  skapadTidpunkt?: string;
};

/** Samma normalisering som i klienten — för unikhet på servern. */
export function normaliseraNamnNyckel(namn: string): string {
  return namn
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

export function skapaAccessNyckel(): string {
  return randomBytes(24).toString("base64url");
}

export function hashAccessNyckel(nyckel: string): string {
  return createHash("sha256").update(nyckel, "utf8").digest("hex");
}

export function verifieraAccessNyckel(
  nyckel: string | null | undefined,
  hash: string,
): boolean {
  if (!nyckel || !hash) return false;
  const kandidat = hashAccessNyckel(nyckel);
  if (kandidat.length !== hash.length) return false;
  // Jämför utan tidig retur i loop (enkel timing-safe jämförelse)
  let skiljer = 0;
  for (let i = 0; i < kandidat.length; i += 1) {
    skiljer |= kandidat.charCodeAt(i) ^ hash.charCodeAt(i);
  }
  return skiljer === 0;
}

export function tillDto(rad: Forening): ForeningServerDto {
  return {
    id: rad.id,
    namn: rad.namn,
    organisationsnummer: rad.organisationsnummer,
    epost: rad.epost,
    postadress: rad.postadress,
    postnummer: rad.postnummer,
    ort: rad.ort,
    kontaktperson: rad.kontaktperson,
    grundinfoPaborjad: rad.grundinfoPaborjad,
    avtalGodkant: rad.avtalGodkant,
    avtalGodkantTidpunkt: rad.avtalGodkantTidpunkt
      ? rad.avtalGodkantTidpunkt.toISOString()
      : "",
    avtalBankidTidpunkt: rad.avtalBankidTidpunkt
      ? rad.avtalBankidTidpunkt.toISOString()
      : "",
    avtalBankidNamn: rad.avtalBankidNamn ?? "",
    skapadTidpunkt: rad.skapadTidpunkt.toISOString(),
  };
}

export async function skapaForeningPaServer(
  input: ForeningUpsertInput,
): Promise<{ dto: ForeningServerDto; accessNyckel: string }> {
  const namn = input.namn.trim();
  if (!namn) throw new Error("Ange ett namn på föreningen.");
  const namnNyckel = normaliseraNamnNyckel(namn);
  const accessNyckel = skapaAccessNyckel();

  const befintlig = await prisma.forening.findUnique({ where: { namnNyckel } });
  if (befintlig) {
    throw new Error(
      `Föreningen «${befintlig.namn}» finns redan på servern.`,
    );
  }

  const rad = await prisma.forening.create({
    data: {
      id: input.id,
      namn,
      namnNyckel,
      organisationsnummer: input.organisationsnummer?.trim() ?? "",
      epost: input.epost?.trim() ?? "",
      postadress: input.postadress?.trim() ?? "",
      postnummer: input.postnummer?.trim() ?? "",
      ort: input.ort?.trim() ?? "",
      kontaktperson: input.kontaktperson?.trim() ?? "",
      grundinfoPaborjad: Boolean(input.grundinfoPaborjad),
      avtalGodkant: Boolean(input.avtalGodkant),
      avtalGodkantTidpunkt: input.avtalGodkantTidpunkt
        ? new Date(input.avtalGodkantTidpunkt)
        : null,
      accessNyckelHash: hashAccessNyckel(accessNyckel),
      skapadTidpunkt: input.skapadTidpunkt
        ? new Date(input.skapadTidpunkt)
        : undefined,
    },
  });

  return { dto: tillDto(rad), accessNyckel };
}

export async function uppdateraForeningPaServer(
  id: string,
  accessNyckel: string,
  input: Partial<ForeningUpsertInput>,
): Promise<ForeningServerDto> {
  const rad = await prisma.forening.findUnique({ where: { id } });
  if (!rad) throw new Error("Föreningen finns inte på servern.");
  if (!verifieraAccessNyckel(accessNyckel, rad.accessNyckelHash)) {
    throw new Error("Ogiltig åtkomstnyckel.");
  }

  let namn = rad.namn;
  let namnNyckel = rad.namnNyckel;
  if (typeof input.namn === "string" && input.namn.trim()) {
    namn = input.namn.trim();
    namnNyckel = normaliseraNamnNyckel(namn);
    if (namnNyckel !== rad.namnNyckel) {
      const krock = await prisma.forening.findUnique({ where: { namnNyckel } });
      if (krock && krock.id !== id) {
        throw new Error(`Namnet «${namn}» används redan av en annan förening.`);
      }
    }
  }

  const uppdaterad = await prisma.forening.update({
    where: { id },
    data: {
      namn,
      namnNyckel,
      organisationsnummer:
        input.organisationsnummer !== undefined
          ? input.organisationsnummer.trim()
          : undefined,
      epost: input.epost !== undefined ? input.epost.trim() : undefined,
      postadress:
        input.postadress !== undefined ? input.postadress.trim() : undefined,
      postnummer:
        input.postnummer !== undefined ? input.postnummer.trim() : undefined,
      ort: input.ort !== undefined ? input.ort.trim() : undefined,
      kontaktperson:
        input.kontaktperson !== undefined
          ? input.kontaktperson.trim()
          : undefined,
      grundinfoPaborjad:
        input.grundinfoPaborjad !== undefined
          ? Boolean(input.grundinfoPaborjad)
          : undefined,
      avtalGodkant:
        input.avtalGodkant !== undefined
          ? Boolean(input.avtalGodkant)
          : undefined,
      avtalGodkantTidpunkt:
        input.avtalGodkantTidpunkt === undefined
          ? undefined
          : input.avtalGodkantTidpunkt
            ? new Date(input.avtalGodkantTidpunkt)
            : null,
    },
  });

  return tillDto(uppdaterad);
}

export async function godkannAvtalPaServer(
  id: string,
  accessNyckel: string,
): Promise<ForeningServerDto> {
  const rad = await prisma.forening.findUnique({ where: { id } });
  if (!rad) throw new Error("Föreningen finns inte på servern.");
  if (!verifieraAccessNyckel(accessNyckel, rad.accessNyckelHash)) {
    throw new Error("Ogiltig åtkomstnyckel.");
  }
  if (!rad.grundinfoPaborjad) {
    throw new Error("Spara föreningsuppgifter innan avtalet godkänns.");
  }
  if (!rad.epost.trim() || !rad.kontaktperson.trim() || !rad.postadress.trim()) {
    throw new Error("Fyll i e-post, kontaktperson och postadress först.");
  }
  if (!rad.organisationsnummer.trim()) {
    throw new Error("Ange organisationsnummer innan avtalet godkänns.");
  }

  const uppdaterad = await prisma.forening.update({
    where: { id },
    data: {
      avtalGodkant: true,
      avtalGodkantTidpunkt: rad.avtalGodkantTidpunkt ?? new Date(),
    },
  });
  return tillDto(uppdaterad);
}

/**
 * Sök för inloggning — kräver minst 3 tecken efter normalisering.
 * Returnerar bara träffar (id + namn + kundstatus), aldrig hela registret.
 */
export async function sokForeningarPaServer(
  soktext: string,
): Promise<Array<Pick<ForeningServerDto, "id" | "namn" | "avtalGodkant">>> {
  const q = normaliseraNamnNyckel(soktext).replace(/^brf\s+/, "").trim();
  if (q.length < 3) return [];

  const rader = await prisma.forening.findMany({
    where: {
      OR: [
        { namnNyckel: { contains: q } },
        { namnNyckel: { contains: `brf ${q}` } },
      ],
    },
    take: 5,
    orderBy: { namn: "asc" },
    select: { id: true, namn: true, avtalGodkant: true },
  });

  return rader;
}

export async function hamtaForeningPaServer(
  id: string,
  accessNyckel: string,
): Promise<ForeningServerDto> {
  const rad = await prisma.forening.findUnique({ where: { id } });
  if (!rad) throw new Error("Föreningen finns inte på servern.");
  if (!verifieraAccessNyckel(accessNyckel, rad.accessNyckelHash)) {
    throw new Error("Ogiltig åtkomstnyckel.");
  }
  return tillDto(rad);
}
