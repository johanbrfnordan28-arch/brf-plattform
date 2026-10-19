import {
  kompileraMedlemsKrav,
  normaliseraMedlemsKrav,
  skapaMedlemsKravForTyp,
  type MedlemsKravPunkt,
} from "@/components/lagenhetsarkiv/medlems-krav";
import type { OmbyggnadsavtalMeta } from "@/components/lagenhetsarkiv/ombyggnadsavtal";
import type { RenoveringsMallId } from "@/components/lagenhetsarkiv/renoverings-mallar";
import { hamtaRenoveringsMall } from "@/components/lagenhetsarkiv/renoverings-mallar";
import { lasForeningProfil } from "@/lib/forening-registry";

export type OmbyggnadsavtalUndertecknare = {
  id: string;
  namn: string;
  epost: string;
  personnummerMaskerat: string;
  personnummerNyckel: string;
  signerad?: {
    datum: string;
    tidpunkt: string;
    metod: "bankid";
  };
};

export type LagenhetOmbyggnadsavtal = {
  punkter: MedlemsKravPunkt[];
  mallId: RenoveringsMallId;
  undertecknare: OmbyggnadsavtalUndertecknare[];
  skickadTillMedlem?: string;
  signeringId?: string;
  sparadPdfFilnamn?: string;
  klarDatum?: string;
};

export type OmbyggnadsavtalStatus =
  | "saknas"
  | "utkast"
  | "skickat"
  | "delvis"
  | "klart";

export function skapaLagenhetOmbyggnadsavtal(
  mallId: RenoveringsMallId = "renovering",
): LagenhetOmbyggnadsavtal {
  return {
    punkter: skapaMedlemsKravForTyp(mallId).punkter,
    mallId,
    undertecknare: [],
  };
}

export function normaliseraLagenhetOmbyggnadsavtal(
  raw: unknown,
  fallbackMall: RenoveringsMallId = "renovering",
): LagenhetOmbyggnadsavtal {
  if (!raw || typeof raw !== "object") {
    return skapaLagenhetOmbyggnadsavtal(fallbackMall);
  }
  const data = raw as Partial<LagenhetOmbyggnadsavtal>;
  const mallId = (data.mallId ?? fallbackMall) as RenoveringsMallId;
  const krav = normaliseraMedlemsKrav({ punkter: data.punkter }, mallId);
  return {
    punkter: krav.punkter,
    mallId,
    undertecknare: Array.isArray(data.undertecknare)
      ? data.undertecknare
          .filter((u) => u && typeof u === "object")
          .map((u) => ({
            id: String(u.id),
            namn: String(u.namn ?? ""),
            epost: String(u.epost ?? ""),
            personnummerMaskerat: String(u.personnummerMaskerat ?? ""),
            personnummerNyckel: String(u.personnummerNyckel ?? ""),
            signerad: u.signerad
              ? {
                  datum: String(u.signerad.datum),
                  tidpunkt: String(u.signerad.tidpunkt),
                  metod: "bankid" as const,
                }
              : undefined,
          }))
      : [],
    skickadTillMedlem: data.skickadTillMedlem,
    signeringId: data.signeringId,
    sparadPdfFilnamn: data.sparadPdfFilnamn,
    klarDatum: data.klarDatum,
  };
}

export function ombyggnadsavtalStatus(
  avtal: LagenhetOmbyggnadsavtal | undefined,
): OmbyggnadsavtalStatus {
  if (!avtal) return "saknas";
  const totalt = avtal.undertecknare.length;
  const signerade = avtal.undertecknare.filter((u) => u.signerad).length;
  if (totalt > 0 && signerade === totalt) return "klart";
  if (signerade > 0) return "delvis";
  if (avtal.skickadTillMedlem) return "skickat";
  return "utkast";
}

export function ombyggnadsavtalStatusEtikett(
  status: OmbyggnadsavtalStatus,
): string {
  switch (status) {
    case "klart":
      return "Ombyggnadsavtal signerat";
    case "delvis":
      return "Avtal delvis godkänt";
    case "skickat":
      return "Avtal väntar på BankID";
    case "utkast":
      return "Avtal utkast";
    default:
      return "";
  }
}

export function allaUndertecknareKlara(
  avtal: LagenhetOmbyggnadsavtal,
): boolean {
  return (
    avtal.undertecknare.length > 0 &&
    avtal.undertecknare.every((u) => Boolean(u.signerad))
  );
}

export function valdaOmbyggnadsavtalPunkter(
  avtal: LagenhetOmbyggnadsavtal,
): MedlemsKravPunkt[] {
  return kompileraMedlemsKrav({ punkter: avtal.punkter });
}

export function byggLagenhetOmbyggnadsavtalMeta(
  apartment: { lagenhetsnummer: string; adress?: string },
  avtal: LagenhetOmbyggnadsavtal,
  foreningId?: string,
): OmbyggnadsavtalMeta {
  const profil = lasForeningProfil(foreningId);
  const mall = hamtaRenoveringsMall(avtal.mallId);
  return {
    foreningsnamn: profil?.namn ?? "",
    organisationsnummer: profil?.organisationsnummer || undefined,
    lagenhetsnummer: apartment.lagenhetsnummer,
    mappNamn: "Ombyggnadsavtal",
    mallEtikett: mall.etikett,
    datum:
      avtal.klarDatum ??
      avtal.skickadTillMedlem ??
      new Date().toLocaleDateString("sv-SE"),
    postadress: apartment.adress || profil?.postadress || undefined,
    ort: profil?.ort || undefined,
    undertecknare: avtal.undertecknare.map((u) => ({
      namn: u.namn,
      personnummerMaskerat: u.personnummerMaskerat,
      signeradDatum: u.signerad?.datum,
    })),
  };
}

export function ombyggnadsavtalPdfFilnamn(
  lagenhetsnummer: string,
  datum = new Date().toLocaleDateString("sv-SE"),
): string {
  return `Ombyggnadsavtal-lght-${lagenhetsnummer}-${datum}.pdf`;
}

export function skapaUndertecknareId(): string {
  return `oa-u-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}
