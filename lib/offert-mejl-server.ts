import { skickaMejl, skickaMejlDirekt, type MejlMeddelande } from "@/lib/auth/mejl";
import { KONTAKT_EPOST } from "@/lib/kontakt-epost";
import { databasArKonfigurerad } from "@/lib/db";

/** Synliga mottagare när kunden inte väljer kontaktperson. */
export const OFFERT_EPOST_MOTTAGARE = [
  KONTAKT_EPOST.offert,
  KONTAKT_EPOST.johan,
  "seif@styrelse-navet.se",
] as const;

export type OffertMejlResultat = {
  skickade: number;
  levererade: number;
  via: "resend" | "outbox" | "demo" | "ingen";
  varning?: string;
};

/**
 * Reservmottagare tills styrelse-navet-adresserna är aktiva.
 * Sätts via OFFERT_EPOST_RESERV i miljö — syns aldrig i klienten.
 */
function hamtaReservMottagare(): string[] {
  const fromEnv = process.env.OFFERT_EPOST_RESERV?.trim();
  if (fromEnv) {
    return fromEnv
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
  }
  return [KONTAKT_EPOST.johan];
}

export function hamtaAllaOffertMottagare(): string[] {
  return [
    ...new Set([
      ...OFFERT_EPOST_MOTTAGARE,
      ...hamtaReservMottagare(),
    ]),
  ];
}

/** Primär kontakt + offert@, eller hela teamet om inget val gjorts. */
export function hamtaOffertMottagare(valdKontaktEpost?: string): string[] {
  const offert = KONTAKT_EPOST.offert;
  const vald = valdKontaktEpost?.trim().toLowerCase();
  if (vald) {
    return [...new Set([vald, offert])];
  }
  return hamtaAllaOffertMottagare();
}

async function skickaEnOffertMejl(
  meddelande: MejlMeddelande,
): Promise<"resend" | "outbox" | "ingen"> {
  if (databasArKonfigurerad()) {
    const resultat = await skickaMejl(meddelande);
    return resultat.via;
  }
  const resultat = await skickaMejlDirekt(meddelande);
  return resultat.via === "resend" ? "resend" : "ingen";
}

export async function skickaOffertMejlTillTeam(
  meddelande: Pick<MejlMeddelande, "amne" | "brodtext"> & { replyTo?: string },
  valdKontaktEpost?: string,
): Promise<OffertMejlResultat> {
  const mottagare = hamtaOffertMottagare(valdKontaktEpost);
  let levererade = 0;
  let via: OffertMejlResultat["via"] = databasArKonfigurerad()
    ? "outbox"
    : "demo";

  for (const till of mottagare) {
    const resultat = await skickaEnOffertMejl({ ...meddelande, till });
    if (resultat === "resend") {
      levererade += 1;
      via = "resend";
    } else if (resultat === "outbox" && via !== "resend") {
      via = "outbox";
    } else if (resultat === "ingen" && !databasArKonfigurerad()) {
      via = "demo";
    }
  }

  if (levererade === 0 && process.env.NODE_ENV !== "production") {
    console.info(
      `[offert/mejl] levererade=0 till=${mottagare.join(", ")} amne=${meddelande.amne}\n${meddelande.brodtext}`,
    );
  }

  const varning =
    levererade === 0
      ? "Mejlet kunde inte skickas (kontrollera RESEND_API_KEY och MEJL_FRAN i Vercel)."
      : levererade < mottagare.length
        ? "Mejlet skickades till minst en mottagare men inte till alla."
        : undefined;

  return {
    skickade: mottagare.length,
    levererade,
    via: levererade > 0 ? "resend" : via,
    varning,
  };
}
