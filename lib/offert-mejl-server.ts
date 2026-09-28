import { skickaMejl, skickaMejlDirekt, type MejlMeddelande, type MejlLeveransVia } from "@/lib/auth/mejl";
import { hamtaMejlTransportStatus } from "@/lib/auth/mejl-konfiguration";
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
  via: MejlLeveransVia | "demo";
  varning?: string;
};

function arMejlLevererat(via: MejlLeveransVia): boolean {
  return via === "resend" || via === "smtp";
}

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
): Promise<MejlLeveransVia> {
  if (databasArKonfigurerad()) {
    const resultat = await skickaMejl(meddelande);
    return resultat.via;
  }
  const resultat = await skickaMejlDirekt(meddelande);
  return arMejlLevererat(resultat.via) ? resultat.via : "ingen";
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
    if (arMejlLevererat(resultat)) {
      levererade += 1;
      via = resultat;
    } else if (resultat === "outbox" && via !== "resend" && via !== "smtp") {
      via = "outbox";
    } else if (resultat === "ingen" && !databasArKonfigurerad()) {
      via = "demo";
    }
  }

  const transport = hamtaMejlTransportStatus();
  const varning =
    levererade === 0 && via === "outbox"
      ? "Mejlet sparades i outbox — ingen mejltjänst levererade (sätt RESEND_API_KEY eller SMTP_* i Vercel)."
      : levererade === 0
        ? transport.aktivTransport === "ingen"
          ? "Ingen mejltjänst konfigurerad — lägg till RESEND_API_KEY (rekommenderat) eller SMTP_HOST/SMTP_USER/SMTP_PASS i Vercel Production."
          : "Mejlet kunde inte skickas — kontrollera MEJL_FRAN och att domänen är verifierad i Resend."
        : levererade < mottagare.length
          ? "Mejlet skickades till minst en mottagare men inte till alla."
          : undefined;

  return {
    skickade: mottagare.length,
    levererade,
    via: levererade > 0 ? via : via,
    varning,
  };
}
