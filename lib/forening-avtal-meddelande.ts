import { skickaMejl } from "@/lib/auth/mejl";
import { mejlSkickades } from "@/lib/auth/mejl-konfiguration";
import { prisma, databasArKonfigurerad } from "@/lib/db";
import {
  AVTAL_BEKRAFTELSE_EPOST,
  KONTAKT_EPOST,
} from "@/lib/kontakt-epost";
import {
  byggFakturaMejl,
  kvartalsperiod,
  type ForeningFakturaUppgifter,
} from "@/lib/forening-faktura";
import { beraknaPris } from "@/lib/prislista";

export type AvtalsUndertecknareMejl = {
  namn: string;
  epost: string;
};

/**
 * När föreningen finns och avtalet är signerat:
 * fakturaunderlag till ekonomi, bekräftelse till övrig personal.
 */
export async function meddelaSigneratKundavtal(opts: {
  foreningsNamn: string;
  organisationsnummer: string;
  faktura: ForeningFakturaUppgifter;
  antalLagenheter: number;
  undertecknare: AvtalsUndertecknareMejl[];
}): Promise<{ ok: boolean; meddelande: string }> {
  const namn = opts.foreningsNamn.trim() || "Föreningen";
  const period = kvartalsperiod();
  const pris = beraknaPris(opts.antalLagenheter);
  const undertecknare = opts.undertecknare
    .map((p) => {
      const rad = [p.namn.trim(), p.epost.trim()].filter(Boolean).join(", ");
      return rad;
    })
    .filter(Boolean);

  const ekonomiText = pris
    ? [
        `${namn} har tecknat kundavtal. Skicka fakturan till föreningen enligt underlaget.`,
        "",
        byggFakturaMejl({
          foreningsNamn: namn,
          organisationsnummer: opts.organisationsnummer,
          faktura: opts.faktura,
          pris,
          periodEtikett: period.etikett,
        }).brodtext,
        "",
        undertecknare.length
          ? `Undertecknare:\n${undertecknare.join("\n")}`
          : "",
      ]
        .filter(Boolean)
        .join("\n")
    : [
        `${namn} har tecknat kundavtal.`,
        "Fakturauppgifter eller antal lägenheter är ofullständiga, så beloppet kunde inte räknas ut.",
        "",
        opts.organisationsnummer
          ? `Organisationsnummer: ${opts.organisationsnummer}`
          : "",
        opts.faktura.epost ? `Fakturamottagare: ${opts.faktura.epost}` : "",
        opts.faktura.adress
          ? `Fakturaadress: ${opts.faktura.adress}, ${opts.faktura.postnummer} ${opts.faktura.ort}`
          : "",
        undertecknare.length
          ? `Undertecknare:\n${undertecknare.join("\n")}`
          : "",
      ]
        .filter(Boolean)
        .join("\n");

  const bekraftelse = [
    "Hej,",
    "",
    `${namn} har tecknat kundavtal med Styrelse-Navet.`,
    "",
    opts.organisationsnummer
      ? `Organisationsnummer: ${opts.organisationsnummer}`
      : "",
    opts.antalLagenheter > 0
      ? `Antal lägenheter: ${opts.antalLagenheter}`
      : "Antal lägenheter: saknas",
    opts.faktura.epost
      ? `Föreningens fakturamottagare: ${opts.faktura.epost}`
      : "Föreningens fakturamottagare: saknas",
    undertecknare.length
      ? `Undertecknare:\n${undertecknare.join("\n")}`
      : "",
    "",
    `Fakturaunderlaget är skickat till ${KONTAKT_EPOST.ekonomi}.`,
    "",
    "Vänliga hälsningar",
    "Styrelse-Navet",
  ]
    .filter((rad) => rad !== undefined)
    .join("\n");

  const ekonomi = await skickaMejl({
    till: KONTAKT_EPOST.ekonomi,
    amne: `Signerat avtal — fakturaunderlag ${namn}`,
    brodtext: ekonomiText,
  });

  const personal = await hamtaPersonalEposter();
  let personalSkickade = 0;
  for (const till of personal) {
    const resultat = await skickaMejl({
      till,
      amne: `${namn} har tecknat avtal`,
      brodtext: bekraftelse,
    });
    if (mejlSkickades(resultat.via) || resultat.via === "outbox") {
      personalSkickade += 1;
    }
  }

  const ekonomiOk = mejlSkickades(ekonomi.via) || ekonomi.via === "outbox";
  if (!ekonomiOk && personalSkickade === 0) {
    return {
      ok: false,
      meddelande:
        ekonomi.fel ||
        "Beskedet till Styrelse-Navet kunde inte skickas just nu.",
    };
  }

  return {
    ok: true,
    meddelande:
      "Styrelse-Navet har fått besked om avtalet och sköter fakturan.",
  };
}

async function hamtaPersonalEposter(): Promise<string[]> {
  const mottagare = new Set<string>(AVTAL_BEKRAFTELSE_EPOST);
  if (databasArKonfigurerad()) {
    try {
      const rader = await prisma.konto.findMany({
        where: { typ: "PLATTFORM", aktiv: true },
        select: { epost: true },
      });
      for (const rad of rader) {
        const epost = rad.epost.trim().toLowerCase();
        if (epost.includes("@")) mottagare.add(epost);
      }
    } catch {
      /* fasta mottagare räcker */
    }
  }
  mottagare.delete(KONTAKT_EPOST.ekonomi);
  return [...mottagare];
}
