import { skickaMejl } from "@/lib/auth/mejl";
import { databasArKonfigurerad } from "@/lib/db";

/** Synliga mottagare för offerter och offertförfrågningar. */
export const OFFERT_EPOST_MOTTAGARE = [
  "offert@styrelse-navet.se",
  "johan@styrelse-navet.se",
  "seif@styrelse-navet.se",
] as const;

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
  return ["johan@styrelse-navet.se"];
}

export function hamtaAllaOffertMottagare(): string[] {
  return [
    ...new Set([
      ...OFFERT_EPOST_MOTTAGARE,
      ...hamtaReservMottagare(),
    ]),
  ];
}

export async function skickaOffertMejlTillTeam(meddelande: {
  amne: string;
  brodtext: string;
}): Promise<{ skickade: number; via: "resend" | "outbox" | "demo" }> {
  const mottagare = hamtaAllaOffertMottagare();

  if (!databasArKonfigurerad()) {
    if (process.env.NODE_ENV !== "production") {
      console.info(
        `[offert/mejl demo] till=${mottagare.join(", ")} amne=${meddelande.amne}\n${meddelande.brodtext}`,
      );
    }
    return { skickade: mottagare.length, via: "demo" };
  }

  let via: "resend" | "outbox" | "ingen" = "outbox";
  let skickade = 0;

  for (const till of mottagare) {
    const resultat = await skickaMejl({ till, ...meddelande });
    if (resultat.via === "resend") {
      via = "resend";
    } else if (resultat.via === "outbox" && via !== "resend") {
      via = "outbox";
    } else if (resultat.via === "ingen" && via === "outbox") {
      via = "ingen";
    }
    skickade += 1;
  }

  return { skickade, via: via === "ingen" ? "outbox" : via };
}
