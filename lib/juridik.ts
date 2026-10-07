import { KONTAKT_EPOST } from "@/lib/kontakt-epost";

/** Personuppgiftsansvarig / leverantör — visas i integritetspolicy och villkor. */
export const LEVERANTOR = {
  namn: "Styrelse-Navet",
  /** Tomt värde döljs i texterna. */
  organisationsnummer: "",
  postadress: "",
  dataskyddEpost: KONTAKT_EPOST.info,
} as const;

/**
 * Höj versionen när villkor, personuppgiftsbiträdesavtal eller integritetspolicy
 * ändras i sak — servern sparar vilken version varje förening godkänt.
 */
export const VILLKOR_VERSION = "2026-10-07";
export const VILLKOR_VERSION_DATUM = "7 oktober 2026";

/** Automatisk gallring — körs dagligen av /api/cron/gallring. */
export const GALLRING_MANADER = {
  inloggningshistorik: 12,
  intresseanmalningar: 12,
  mejlOutbox: 3,
} as const;

export const VILLKOR_PATH = "/villkor";
export const PUB_PATH = "/villkor#personuppgiftsbitradesavtal";
export const INTEGRITETSPOLICY_PATH = "/integritetspolicy";

export type Underbitrade = {
  namn: string;
  syfte: string;
  plats: string;
};

export const UNDERBITRADEN: Underbitrade[] = [
  {
    namn: "Vercel Inc.",
    syfte: "Drift av webbapplikationen (servrar och nätverk)",
    plats:
      "USA/EU — överföring enligt EU–US Data Privacy Framework och EU-kommissionens standardavtalsklausuler",
  },
  {
    namn: "Neon Inc.",
    syfte: "Databas för konton, föreningsuppgifter och ärenden",
    plats:
      "Enligt vald serverregion — vid överföring till USA gäller standardavtalsklausuler",
  },
  {
    namn: "Resend Inc.",
    syfte: "Utskick av e-post (lösenord, inbjudningar, felanmälan)",
    plats:
      "USA — överföring enligt EU–US Data Privacy Framework och standardavtalsklausuler",
  },
  {
    namn: "Idura A/S",
    syfte: "Inloggning och signering med BankID",
    plats: "EU (Danmark)",
  },
];

export function leverantorRad(): string {
  return [
    LEVERANTOR.namn,
    LEVERANTOR.organisationsnummer && `org.nr ${LEVERANTOR.organisationsnummer}`,
    LEVERANTOR.postadress,
  ]
    .filter(Boolean)
    .join(", ");
}
