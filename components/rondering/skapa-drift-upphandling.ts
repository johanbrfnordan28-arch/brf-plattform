import {
  driftUpphandlingsKategorier,
  schemaRollForDriftKategori,
  type DriftUpphandlingsKategori,
} from "@/components/rondering/drift-upphandling-koppling";
import { genereraSchemaTextFranPunkter } from "@/components/rondering/exporteraSigneringSchema";
import { lasBestamtSchema } from "@/components/rondering/signering-schema";
import { genereraDriftUpphandlingsVillkorText } from "@/components/rondering/upphandlingsvillkor-drift";
import { sparaSchemaBilaga } from "@/components/upphandling/schema-bilagor-lager";
import { kategoriId } from "@/components/upphandling/kategorier";
import {
  lasUpphandlingLager,
  loggaHandelse,
  sparaUpphandlingLager,
  uppdateraKategoriMeta,
} from "@/components/upphandling/upphandling-lager";
import {
  formateraStyrelseKontaktBlock,
  hamtaAvtalssignerare,
  hamtaStyrelseKontakt,
} from "@/lib/styrelse-kontakt";

export function genereraAnbudsformularText(
  kategori: DriftUpphandlingsKategori,
): string {
  const kontakt = hamtaStyrelseKontakt();
  const signerare = hamtaAvtalssignerare();
  const roll = schemaRollForDriftKategori(kategori);
  const bestamt = lasBestamtSchema();
  const schema = bestamt
    ? genereraSchemaTextFranPunkter(roll, bestamt.punkter[roll])
    : "";
  const signerRad =
    signerare.length > 0
      ? signerare.map((person) => `${person.namn} (${person.roll})`).join(", ")
      : "Inte angiven — markera avtalsundertecknare under föreningens uppgifter.";

  return [
    `ANBUDSFORMULÄR — ${kategori}`,
    "",
    "Föreningens uppgifter är hämtade från föreningens grunduppgifter.",
    formateraStyrelseKontaktBlock(kontakt).trimEnd(),
    `Avtalet undertecknas för föreningen av: ${signerRad}`,
    "Entreprenören signerar avtalet först. Därefter signerar styrelsen. Avtalet sparas på plattformen.",
    "",
    "Fyll i och skicka tillbaka:",
    "Företag:",
    "Organisationsnummer:",
    "Kontaktperson:",
    "E-post:",
    "Pris (kr, ange om det är per månad eller per tillfälle):",
    "Personal som ska utföra arbetet (namn):",
    "Underentreprenör används: Ja / Nej",
    "Underentreprenörens namn, om ja:",
    "",
    "Vid varje rondering eller städ signerar den som utför arbetet med BankID.",
    "Då anges vilken personal som är på plats, om någon byts ut, och om underentreprenör används.",
    "",
    genereraDriftUpphandlingsVillkorText(),
    "",
    schema,
  ].join("\n");
}

export function skapaDriftUpphandling(
  kategori: DriftUpphandlingsKategori,
): { ok: true; titel: string } | { ok: false; fel: string } {
  const bestamt = lasBestamtSchema();
  if (!bestamt) {
    return {
      ok: false,
      fel: "Bestäm schemat först, så upphandlingen utgår från det ni granskat.",
    };
  }
  const roll = schemaRollForDriftKategori(kategori);
  const kontakt = hamtaStyrelseKontakt();
  const schemaText = genereraSchemaTextFranPunkter(roll, bestamt.punkter[roll]);
  const villkorText = genereraDriftUpphandlingsVillkorText();
  const anbudsformularText = genereraAnbudsformularText(kategori);
  sparaSchemaBilaga(kategori, roll, schemaText, villkorText, anbudsformularText);

  const key = kategoriId(kategori);
  const titel = kontakt?.foreningsnamn
    ? `${kontakt.foreningsnamn} — ${kategori}`
    : kategori;
  let lager = lasUpphandlingLager();
  lager = uppdateraKategoriMeta(lager, key, {
    titel,
    ort: kontakt?.ort ?? "",
    förfrågningsunderlagKomplett: true,
  });
  lager = loggaHandelse(lager, {
    upphandlingId: key,
    typ: "underlag_komplett",
    av: hamtaAvtalssignerare()[0]?.namn || kontakt?.kontaktperson || "Styrelsen",
    beskrivning: `Upphandling skapad för ${kategori}. Schema, avtalsvillkor och anbudsformulär är flyttade hit från ronderingen. Föreningens uppgifter och avtalsundertecknare är hämtade från föreningens uppgifter.`,
  });
  sparaUpphandlingLager(lager);
  return { ok: true, titel };
}

export function skapaDriftUpphandlingar():
  | { ok: true; titlar: string[] }
  | { ok: false; fel: string } {
  const titlar: string[] = [];
  for (const kategori of driftUpphandlingsKategorier) {
    const resultat = skapaDriftUpphandling(kategori);
    if (!resultat.ok) return resultat;
    titlar.push(resultat.titel);
  }
  return { ok: true, titlar };
}
