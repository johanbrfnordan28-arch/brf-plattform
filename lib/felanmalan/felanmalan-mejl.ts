import type { FelanmalanArendeDto } from "@/lib/felanmalan/felanmalan-typer";
import {
  FELANMALAN_ORSAK_ETIKETT,
  FELANMALAN_PRIORITET_ETIKETT,
} from "@/lib/felanmalan/felanmalan-typer";

export function byggFelanmalanMejl(opts: {
  foreningsNamn: string;
  arende: FelanmalanArendeDto;
  styrelsePanelUrl: string;
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
