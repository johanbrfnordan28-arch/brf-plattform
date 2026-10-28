import { hamtaStyrelseKontakt } from "@/lib/styrelse-kontakt";
import { lasAktivForeningId, lasForeningProfil } from "@/lib/forening-registry";
import { hamtaMall, type DokumentbankMall } from "@/components/dokumentbank/mallar";
import {
  arEgenkontrollDokument,
  byggEgenkontrollText,
  hamtaEgenkontroll,
  normaliseraEgenkontroll,
  skapaVvsEgenkontroll,
} from "@/components/dokumentbank/forening-dokument-egenkontroll";
import {
  tomDokumentEntreprenor,
  type DokumentEntreprenor,
  type ForeningsDokument,
} from "@/components/dokumentbank/forening-dokumenter-lager";
import { appendSignaturSammanfattning } from "@/components/dokumentbank/forening-dokument-avtal";

export type ForeningMallIfyllnad = {
  foreningsNamn: string;
  organisationsnummer: string;
  postadress: string;
  postnummer: string;
  ort: string;
  postnummerOrt: string;
  kontaktperson: string;
  epost: string;
  datum: string;
  projektNamn: string;
};

export function hamtaForeningMallIfyllnad(
  projektNamn = "",
  foreningId?: string,
): ForeningMallIfyllnad {
  const id = foreningId ?? (typeof window !== "undefined" ? lasAktivForeningId() : "");
  const profil = typeof window !== "undefined" ? lasForeningProfil(id) : null;
  const kontakt = typeof window !== "undefined" ? hamtaStyrelseKontakt(id) : null;
  const postnummer = profil?.postnummer.trim() || kontakt?.postnummer.trim() || "";
  const ort = profil?.ort.trim() || kontakt?.ort.trim() || "";
  return {
    foreningsNamn:
      profil?.namn.trim() ||
      kontakt?.foreningsnamn.trim() ||
      "[Föreningens namn]",
    organisationsnummer:
      profil?.organisationsnummer.trim() ||
      kontakt?.organisationsnummer.trim() ||
      "[org.nr]",
    postadress: profil?.postadress.trim() || kontakt?.postadress.trim() || "",
    postnummer,
    ort,
    postnummerOrt: [postnummer, ort].filter(Boolean).join(" ") || "[postnr ort]",
    kontaktperson:
      profil?.kontaktperson.trim() || kontakt?.kontaktperson.trim() || "[Namn]",
    epost: profil?.epost.trim() || kontakt?.epost.trim() || "[e-post]",
    datum: new Date().toISOString().slice(0, 10),
    projektNamn: projektNamn.trim() || "[Projektets namn]",
  };
}

const FORENINGS_ERSATTNINGAR: {
  pattern: RegExp;
  nyckel: keyof ForeningMallIfyllnad;
}[] = [
  { pattern: /\[Föreningens namn\]/gi, nyckel: "foreningsNamn" },
  { pattern: /\[föreningens namn\]/g, nyckel: "foreningsNamn" },
  { pattern: /\[Projektets namn\]/gi, nyckel: "projektNamn" },
  { pattern: /\[projektets namn\]/g, nyckel: "projektNamn" },
  { pattern: /\[ÅÅÅÅ-MM-DD\]/g, nyckel: "datum" },
  { pattern: /\[datum\]/gi, nyckel: "datum" },
  { pattern: /\[Namn, telefon, e-post\]/gi, nyckel: "kontaktperson" },
  { pattern: /\[Namn, telefon\]/gi, nyckel: "kontaktperson" },
  { pattern: /\[Namn\]/g, nyckel: "kontaktperson" },
  { pattern: /\[e-post\]/gi, nyckel: "epost" },
  { pattern: /\[xxx\]/gi, nyckel: "organisationsnummer" },
  { pattern: /\[XXXXXX-XXXX\]/g, nyckel: "organisationsnummer" },
  { pattern: /\[org\.nr\]/gi, nyckel: "organisationsnummer" },
  { pattern: /\[Adress\]/g, nyckel: "postadress" },
  { pattern: /\[år\]/g, nyckel: "datum" },
];

/** Endast styrelse/förening — inte entreprenör (per projekt). */
export function ifyllForeningsfalt(
  text: string,
  data: ForeningMallIfyllnad,
): string {
  let ut = text;
  for (const { pattern, nyckel } of FORENINGS_ERSATTNINGAR) {
    const varde = data[nyckel];
    if (nyckel === "datum" && pattern.source.includes("år")) {
      ut = ut.replace(pattern, String(new Date().getFullYear()));
    } else {
      ut = ut.replace(pattern, varde);
    }
  }
  if (data.postadress && ut.includes("[postnr ort]")) {
    ut = ut.replace(/\[postnr ort\]/g, data.postnummerOrt);
  }
  return ut;
}

const ENTREPRENOR_PLATSHALLARE: {
  pattern: RegExp;
  nyckel: keyof DokumentEntreprenor;
  fallback: string;
}[] = [
  { pattern: /\[Entreprenörens namn\]/gi, nyckel: "namn", fallback: "[Entreprenörens namn]" },
  { pattern: /\[Entreprenör org\.nr\]/gi, nyckel: "orgNr", fallback: "[Entreprenör org.nr]" },
  { pattern: /\[Entreprenör kontakt\]/gi, nyckel: "kontakt", fallback: "[Entreprenör kontakt]" },
  { pattern: /\[Entreprenör e-post\]/gi, nyckel: "epost", fallback: "[Entreprenör e-post]" },
];

export function ifyllEntreprenorFalt(
  text: string,
  entreprenor: DokumentEntreprenor | undefined,
): string {
  const data = entreprenor ?? tomDokumentEntreprenor();
  let ut = text;
  for (const { pattern, nyckel, fallback } of ENTREPRENOR_PLATSHALLARE) {
    const varde = data[nyckel].trim() || fallback;
    ut = ut.replace(pattern, varde);
  }
  return ut;
}

/** Uppdatera föreningsfält från registret utan att röra entreprenörsplatshållare. */
export function synkroniseraForeningsfaltInnehall(
  innehall: string,
  projektNamn?: string,
): string {
  return ifyllForeningsfalt(innehall, hamtaForeningMallIfyllnad(projektNamn));
}

export function skapaInnehallFranMall(
  mall: DokumentbankMall,
  projektNamn?: string,
): string {
  const bas = mall.textInnehall?.trim() ?? "";
  if (!bas) return "";
  return ifyllForeningsfalt(bas, hamtaForeningMallIfyllnad(projektNamn));
}

export function hamtaForeningsDokumentInnehall(
  dok: ForeningsDokument,
  options?: { medSignaturer?: boolean },
): string {
  if (arEgenkontrollDokument(dok)) {
    const ek =
      hamtaEgenkontroll(dok) ??
      normaliseraEgenkontroll(dok.egenkontroll) ??
      skapaVvsEgenkontroll({
        huvudentreprenorNamn: dok.entreprenor?.namn ?? "",
        huvudArbetsledareNamn: "",
        utforareNamn: [],
      });
    return byggEgenkontrollText(dok, ek);
  }

  let text: string;
  if (dok.innehall?.trim()) {
    text = dok.innehall;
  } else {
    const mall = hamtaMall(dok.mallId);
    if (!mall?.textInnehall) return "";
    text = skapaInnehallFranMall(mall);
  }
  text = ifyllEntreprenorFalt(text, dok.entreprenor);
  if (options?.medSignaturer !== false) {
    text = appendSignaturSammanfattning(text, dok);
  }
  return text;
}

/** Bakåtkompatibilitet — samma som ifyllForeningsfalt. */
export function ifyllMallText(
  text: string,
  data: ForeningMallIfyllnad,
): string {
  return ifyllForeningsfalt(text, data);
}
