/**
 * Uppskattade installationsvärden för K3-komponenter.
 *
 * Taxeringsvärde, markvärde och anskaffningskostnad är internt underlag —
 * får aldrig visas för föreningen. Endast beräknade komponentvärden visas.
 */

import {
  FAR_K3_KOMPONENTER,
  type FarK3Komponent,
  type FarK3KomponentId,
} from "@/components/underhallsplan/far-k3-komponenter";
import { effektivAvskrivningAr } from "@/components/underhallsplan/komponent-avskrivning";
import type { KomponentDetaljData } from "@/components/underhallsplan/komponentregister";
import { sammanstallRegisterKostnader } from "@/components/underhallsplan/register-kostnad";

/** Internt — aldrig i PDF eller föreningsvy. */
export type FastighetsVarderingsUnderlag = {
  taxeringsvardeByggnadKr: number;
  taxeringsvardeMarkKr: number;
  /** Byggnad + mark */
  anskaffningsvardeTotaltKr: number;
  markAnskaffningsvardeKr: number;
};

export type KomponentInstallationsRad = {
  farId: FarK3KomponentId;
  etikett: string;
  komponent: string;
  underkomponentId: string;
  installationskostnadKr: number;
  avskrivningAr: number;
  /** far-andel | register-uppskattning | manuellt */
  kalla: "far-andel" | "register-uppskattning" | "manuellt";
  iRegistret: boolean;
};

export function byggnadsAnskaffningsvarde(
  underlag: FastighetsVarderingsUnderlag,
): number {
  return Math.max(
    0,
    underlag.anskaffningsvardeTotaltKr - underlag.markAnskaffningsvardeKr,
  );
}

export function farAndelMidProcent(far: FarK3Komponent): number {
  return (far.andelMinProcent + far.andelMaxProcent) / 2;
}

function parseKr(text?: string | null): number {
  const n = Number.parseInt(String(text ?? "").replace(/\s/g, ""), 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** Mappar FAR-id → register-kostnad id-prefix. */
function registerUppskattningForFar(
  farId: FarK3KomponentId,
  activeComponents: string[],
  komponentDetaljer: Record<string, KomponentDetaljData>,
): number {
  const { rader } = sammanstallRegisterKostnader(
    activeComponents,
    komponentDetaljer,
  );
  const summera = (...ids: string[]) =>
    rader
      .filter((r) => ids.some((id) => r.id === id || r.id.startsWith(id)))
      .reduce((s, r) => s + r.beloppKr, 0);

  switch (farId) {
    case "fonster":
      return summera("fonster-fonster");
    case "hiss":
      return summera("trapphus-hiss");
    case "balkong":
      return rader
        .filter((r) => r.komponent === "Balkonger" || r.id.startsWith("balkonger"))
        .reduce((s, r) => s + r.beloppKr, 0);
    case "stam-va":
      return summera("vvs-stambyte");
    default:
      return 0;
  }
}

function hittaRegisterKoppling(
  far: FarK3Komponent,
  activeComponents: string[],
  komponentDetaljer: Record<string, KomponentDetaljData>,
): {
  komponentNamn: string;
  underkomponentId: string;
  installationskostnadKr: number;
  avskrivningAr: number;
} | null {
  for (const koppling of far.registerKopplingar) {
    if (!activeComponents.includes(koppling.komponentNamn)) continue;
    const data = komponentDetaljer[koppling.komponentNamn];
    if (!data) continue;
    const rad = data.underkomponenter.find(
      (r) => r.id === koppling.underkomponentId,
    );
    if (!rad || (!rad.aktiv && !rad.ärEgen)) continue;

    return {
      komponentNamn: koppling.komponentNamn,
      underkomponentId: koppling.underkomponentId,
      installationskostnadKr: parseKr(rad.installationskostnadKr),
      avskrivningAr: effektivAvskrivningAr(
        koppling.komponentNamn,
        koppling.underkomponentId,
        rad.avskrivningAr,
      ),
    };
  }
  return null;
}

/**
 * Beräknar uppskattade installationsvärden för aktiva FAR-komponenter.
 * Prioritet: manuellt sparat → registeruppskattning → FAR-andel av byggnadsanskaffning.
 */
export function beraknaKomponentInstallationsvarden(
  underlag: FastighetsVarderingsUnderlag | null | undefined,
  activeComponents: string[],
  komponentDetaljer: Record<string, KomponentDetaljData>,
): KomponentInstallationsRad[] {
  const inkluderade = FAR_K3_KOMPONENTER.filter((far) => {
    const hittad = hittaRegisterKoppling(
      far,
      activeComponents,
      komponentDetaljer,
    );
    return Boolean(hittad);
  });

  const byggnadKr = underlag ? byggnadsAnskaffningsvarde(underlag) : 0;
  const rawSum = inkluderade.reduce((s, far) => s + farAndelMidProcent(far), 0);

  const rader: KomponentInstallationsRad[] = [];

  for (const far of inkluderade) {
    const koppling = hittaRegisterKoppling(
      far,
      activeComponents,
      komponentDetaljer,
    );
    if (!koppling) continue;

    const manuellt = koppling.installationskostnadKr;
    const registerUppsk = registerUppskattningForFar(
      far.id,
      activeComponents,
      komponentDetaljer,
    );
    const farAndelKr =
      byggnadKr > 0 && rawSum > 0
        ? Math.round((byggnadKr * farAndelMidProcent(far)) / rawSum)
        : 0;

    let installationskostnadKr = 0;
    let kalla: KomponentInstallationsRad["kalla"] = "far-andel";

    if (manuellt > 0) {
      installationskostnadKr = manuellt;
      kalla = "manuellt";
    } else if (farAndelKr > 0) {
      // Anskaffningsunderlag finns — fördela byggnadsvärdet (inte moderniseringspris)
      installationskostnadKr = farAndelKr;
      kalla = "far-andel";
    } else if (registerUppsk > 0) {
      installationskostnadKr = registerUppsk;
      kalla = "register-uppskattning";
    }

    rader.push({
      farId: far.id,
      etikett: far.namn,
      komponent: koppling.komponentNamn,
      underkomponentId: koppling.underkomponentId,
      installationskostnadKr,
      avskrivningAr:
        koppling.avskrivningAr > 0
          ? koppling.avskrivningAr
          : far.standardNyttjandeperiodAr,
      kalla,
      iRegistret: true,
    });
  }

  return rader;
}

/**
 * Skriver uppskattade installationskostnader in i registret (tomma fält fylls).
 * Skriver inte över manuellt angivna värden om skrivOver är false.
 */
export function appliceraInstallationsvardenPaRegister(
  underlag: FastighetsVarderingsUnderlag | null | undefined,
  activeComponents: string[],
  komponentDetaljer: Record<string, KomponentDetaljData>,
  options?: { skrivOver?: boolean },
): Record<string, KomponentDetaljData> {
  const skrivOver = options?.skrivOver ?? false;
  const varden = beraknaKomponentInstallationsvarden(
    underlag,
    activeComponents,
    komponentDetaljer,
  );
  const next: Record<string, KomponentDetaljData> = { ...komponentDetaljer };

  for (const rad of varden) {
    if (rad.installationskostnadKr <= 0) continue;
    const data = next[rad.komponent];
    if (!data) continue;
    next[rad.komponent] = {
      ...data,
      underkomponenter: data.underkomponenter.map((uk) => {
        if (uk.id !== rad.underkomponentId) return uk;
        const befintlig = parseKr(uk.installationskostnadKr);
        if (!skrivOver && befintlig > 0) return uk;
        return {
          ...uk,
          installationskostnadKr: String(rad.installationskostnadKr),
        };
      }),
    };
  }

  return next;
}
