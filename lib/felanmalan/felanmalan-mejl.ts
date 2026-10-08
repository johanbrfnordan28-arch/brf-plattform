import type { FelanmalanArendeDto } from "@/lib/felanmalan/felanmalan-typer";
import {
  FELANMALAN_ORSAK_ETIKETT,
  FELANMALAN_PRIORITET_ETIKETT,
} from "@/lib/felanmalan/felanmalan-typer";

export function byggFelanmalanMejl(opts: {
  foreningsNamn: string;
  arende: FelanmalanArendeDto;
  styrelsePanelUrl: string;
  antalBilder?: number;
}): { amne: string; brodtext: string } {
  const a = opts.arende;
  const debitering = a.debiteringKan
    ? [
        "Debitering kan bli aktuell enligt medlemmens uppgift.",
        a.debiteringAnteckning ? `Anteckning: ${a.debiteringAnteckning}` : "",
        a.boendeEjHemma ? "Boende angav att de inte är hemma vid åtgärd." : "",
        a.nyckelPlats ? `Nyckel/plats: ${a.nyckelPlats}` : "",
      ]
        .filter(Boolean)
        .join("\n")
    : "Ingen särskild debiteringsinfo angiven.";

  const brodtext = [
    `Ny felanmälan till ${opts.foreningsNamn}`,
    "",
    `Ärendenummer: ${a.arendeNummer}`,
    `Prioritet: ${FELANMALAN_PRIORITET_ETIKETT[a.prioritet]}`,
    `Orsak/typ: ${FELANMALAN_ORSAK_ETIKETT[a.orsak]}`,
    "",
    `Rubrik: ${a.rubrik}`,
    "",
    a.beskrivning,
    "",
    `Medlem: ${a.medlemNamn}`,
    `E-post: ${a.medlemEpost}`,
    a.medlemTelefon ? `Telefon: ${a.medlemTelefon}` : "",
    a.lagenhetsnummer ? `Lägenhet: ${a.lagenhetsnummer}` : "",
    "",
    debitering,
    "",
    opts.antalBilder
      ? `${opts.antalBilder} ${opts.antalBilder === 1 ? "bild bifogad" : "bilder bifogade"} — visas i ärendet i Styrelse-Navet.`
      : "",
    `Hantera ärendet i Styrelse-Navet: ${opts.styrelsePanelUrl}`,
    "",
    "— Styrelse-Navet (automatisk avisering)",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    amne: `[${a.arendeNummer}] Felanmälan — ${a.rubrik}`,
    brodtext,
  };
}

export function byggFelanmalanVidareMejl(opts: {
  foreningsNamn: string;
  arende: FelanmalanArendeDto;
  mottagareRoll: string;
}): { amne: string; brodtext: string } {
  const a = opts.arende;
  const brodtext = [
    `Ärende ${a.arendeNummer} — ${opts.foreningsNamn}`,
    "",
    `Ni har fått ärendet som ${opts.mottagareRoll}.`,
    "",
    `Rubrik: ${a.rubrik}`,
    `Prioritet: ${FELANMALAN_PRIORITET_ETIKETT[a.prioritet]}`,
    `Orsak: ${FELANMALAN_ORSAK_ETIKETT[a.orsak]}`,
    "",
    a.beskrivning,
    "",
    `Lägenhet: ${a.lagenhetsnummer || "—"}`,
    `Kontakt medlem: ${a.medlemNamn}, ${a.medlemEpost}, ${a.medlemTelefon || "—"}`,
    a.debiteringKan
      ? `\nDebitering kan bli aktuell. ${a.debiteringAnteckning}`
      : "",
    a.nyckelPlats ? `Nyckel/plats: ${a.nyckelPlats}` : "",
    "",
    "— Styrelse-Navet",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    amne: `[${a.arendeNummer}] Uppdrag — ${a.rubrik}`,
    brodtext,
  };
}

type BoendeMejlOpts = {
  foreningsNamn: string;
  arende: FelanmalanArendeDto;
};

function jourRad(jourTelefon: string, jourText: string): string {
  if (!jourTelefon) return "";
  return `Vid akut fel (t.ex. vattenläcka, inget vatten, ingen värme eller el): ring ${jourText || "jouren"} på ${jourTelefon}.`;
}

/** Bekräftelse till boende direkt efter inskickad felanmälan. */
export function byggFelanmalanKvittoMejl(
  opts: BoendeMejlOpts & { jourTelefon: string; jourText: string },
): { amne: string; brodtext: string } {
  const a = opts.arende;
  const brodtext = [
    `Hej ${a.medlemNamn},`,
    "",
    `Tack för din felanmälan till ${opts.foreningsNamn}. Den har tagits emot och skickats vidare till styrelsen och förvaltaren.`,
    "",
    `Ärendenummer: ${a.arendeNummer}`,
    `Rubrik: ${a.rubrik}`,
    `Typ: ${FELANMALAN_ORSAK_ETIKETT[a.orsak]}`,
    "",
    "Du får ett mejl när ärendet är avslutat. Har du frågor kan du svara på det här mejlet och ange ärendenumret.",
    "",
    jourRad(opts.jourTelefon, opts.jourText),
    "",
    `Vänliga hälsningar`,
    opts.foreningsNamn,
  ]
    .filter((rad, i, alla) => rad !== "" || alla[i - 1] !== "")
    .join("\n");
  return { amne: `[${a.arendeNummer}] Vi har tagit emot din felanmälan`, brodtext };
}

/** Meddelande från styrelsen/förvaltaren till boende, t.ex. när ärendet avslutas. */
export function byggFelanmalanBoendeMejl(
  opts: BoendeMejlOpts & { meddelande: string; avslutat: boolean },
): { amne: string; brodtext: string } {
  const a = opts.arende;
  const brodtext = [
    `Hej ${a.medlemNamn},`,
    "",
    opts.avslutat
      ? `Din felanmälan ${a.arendeNummer} (${a.rubrik}) är nu avslutad.`
      : `Uppdatering om din felanmälan ${a.arendeNummer} (${a.rubrik}).`,
    "",
    opts.meddelande.trim(),
    "",
    opts.avslutat
      ? "Kvarstår felet? Svara på det här mejlet så tittar vi på det igen."
      : "Har du frågor kan du svara på det här mejlet.",
    "",
    "Vänliga hälsningar",
    opts.foreningsNamn,
  ]
    .filter((rad, i, alla) => rad !== "" || alla[i - 1] !== "")
    .join("\n");
  return {
    amne: opts.avslutat
      ? `[${a.arendeNummer}] Din felanmälan är avslutad`
      : `[${a.arendeNummer}] Uppdatering om din felanmälan`,
    brodtext,
  };
}
