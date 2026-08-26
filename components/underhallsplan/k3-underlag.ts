/**
 * Samlar föreningsvänligt K3-underlag: komponent + uppskattat installationsvärde + år.
 * Visar inte taxering/mark/anskaffning.
 */

import { beraknaKomponentInstallationsvarden } from "@/components/underhallsplan/fastighets-vardering";
import type { FastighetsVarderingsUnderlag } from "@/components/underhallsplan/fastighets-vardering";
import type { KomponentDetaljData } from "@/components/underhallsplan/komponentregister";

export type K3UnderlagRad = {
  komponent: string;
  underkomponentId: string;
  etikett: string;
  avskrivningAr: number;
  installationskostnadKr: number;
  /** Kort källa — inte känsliga totalsummor */
  kallaEtikett: string;
  iRegistret: boolean;
};

function kallaEtikett(
  kalla: "far-andel" | "register-uppskattning" | "manuellt",
): string {
  switch (kalla) {
    case "manuellt":
      return "Angivet i planen";
    case "register-uppskattning":
      return "Uppskattat från register";
    default:
      return "Uppskattat installationsvärde";
  }
}

/**
 * Endast komponenter som finns aktiva i föreningens register
 * (sådant som inte är aktuellt kan tas bort i steg 3).
 */
export function samlaK3Underlag(
  activeComponents: string[],
  komponentDetaljer: Record<string, KomponentDetaljData>,
  varderingsUnderlag?: FastighetsVarderingsUnderlag | null,
): K3UnderlagRad[] {
  return beraknaKomponentInstallationsvarden(
    varderingsUnderlag,
    activeComponents,
    komponentDetaljer,
  ).map((rad) => ({
    komponent: rad.komponent,
    underkomponentId: rad.underkomponentId,
    etikett: rad.etikett,
    avskrivningAr: rad.avskrivningAr,
    installationskostnadKr: rad.installationskostnadKr,
    kallaEtikett: kallaEtikett(rad.kalla),
    iRegistret: rad.iRegistret,
  }));
}
