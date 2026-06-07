import type { Måttenhet, UnderkomponentRad } from "@/components/underhallsplan/komponentregister";
import { summeraStyckPosterAntal } from "@/components/underhallsplan/blandad-styck-poster";
import {
  parseBlandadFranUnderkomponent,
  summeraBlandadPris,
} from "@/components/underhallsplan/underhall-blandad-pris";

export type UnderhallPrisEnhet = "total" | "kvm" | "styck" | "blandad";

export function parseKrText(text: string | undefined): number {
  if (!text?.trim()) return 0;
  const n = Number.parseInt(text.replace(/\s/g, ""), 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function parseMangd(text: string | undefined): number {
  if (!text?.trim()) return 0;
  const n = Number.parseFloat(text.replace(",", ".").replace(/\s/g, ""));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** @deprecated Använd hamtaUnderhallPrisEnhet — behålls för intern fallback. */
export function normaliseraUnderhallPrisEnhet(
  raw?: string,
  fallbackMåttenhet?: Måttenhet,
): UnderhallPrisEnhet {
  if (raw === "kvm" || raw === "styck" || raw === "total" || raw === "blandad") {
    return raw;
  }
  if (fallbackMåttenhet === "kvm") return "kvm";
  if (fallbackMåttenhet === "antal") return "styck";
  return "total";
}

function stodjerBlandadPrissattning(rad: UnderkomponentRad): boolean {
  return rad.id === "fasadmaterial" || rad.id === "takyta";
}

/**
 * Vilken prissättning som gäller. Fasadmaterial utan explicit val = total
 * (så befintliga totalsummor inte tolkas som kvm).
 */
export function hamtaUnderhallPrisEnhet(rad: UnderkomponentRad): UnderhallPrisEnhet {
  const raw = rad.underhallPrisEnhet;
  if (raw === "kvm" || raw === "styck" || raw === "total" || raw === "blandad") {
    return raw;
  }
  if (stodjerBlandadPrissattning(rad)) {
    const delar = parseBlandadFranUnderkomponent(rad);
    if (
      delar.totalKr > 0 ||
      delar.krPerKvm > 0 ||
      delar.kvm > 0 ||
      summeraStyckPosterAntal(delar.styckPoster) > 0
    ) {
      return "blandad";
    }
    return "blandad";
  }
  if (rad.id === "fasadmaterial") {
    if (parseMangd(rad.värde) > 0 || parseKrText(rad.underhallEnhetsprisKr) > 0) {
      return "kvm";
    }
    return "total";
  }
  return normaliseraUnderhallPrisEnhet(undefined, rad.måttenhet);
}

/** Mängd som används vid beräkning — kvm från värde, styck från prisAntal eller värde. */
export function hamtaUnderhallPrisMangd(rad: UnderkomponentRad): number {
  const enhet = hamtaUnderhallPrisEnhet(rad);
  if (enhet === "kvm") {
    return parseMangd(rad.värde);
  }
  if (enhet === "styck") {
    const antal = parseMangd(rad.underhallPrisAntal);
    if (antal > 0) return antal;
    if (rad.måttenhet === "antal") return parseMangd(rad.värde);
    return 0;
  }
  return 0;
}

export function beraknaUnderhallKostnadFranEnhet(rad: UnderkomponentRad): number {
  const enhet = hamtaUnderhallPrisEnhet(rad);
  if (enhet === "total") {
    return parseKrText(rad.underhallKostnadKr);
  }
  if (enhet === "blandad") {
    return summeraBlandadPris(parseBlandadFranUnderkomponent(rad)).beraknadSummaKr;
  }
  const enhetspris = parseKrText(rad.underhallEnhetsprisKr);
  const mangd = hamtaUnderhallPrisMangd(rad);
  if (enhetspris <= 0 || mangd <= 0) return 0;
  return Math.round(enhetspris * mangd);
}

/** Returnerar kostnad som ska användas i budget — beräknad eller manuell total. */
export function effektivUnderhallKostnadKr(rad: UnderkomponentRad): number {
  const enhet = hamtaUnderhallPrisEnhet(rad);
  if (enhet === "total") {
    return parseKrText(rad.underhallKostnadKr);
  }
  if (enhet === "blandad") {
    return summeraBlandadPris(parseBlandadFranUnderkomponent(rad)).effektivTotalKr;
  }
  const beraknat = beraknaUnderhallKostnadFranEnhet(rad);
  if (beraknat > 0) return beraknat;
  return parseKrText(rad.underhallKostnadKr);
}

export function synkaUnderhallKostnadKr(rad: UnderkomponentRad): string {
  const enhet = hamtaUnderhallPrisEnhet(rad);
  if (enhet === "total") {
    return rad.underhallKostnadKr ?? "";
  }
  if (enhet === "blandad") {
    const { beraknadSummaKr } = summeraBlandadPris(
      parseBlandadFranUnderkomponent(rad),
    );
    if (parseKrText(rad.underhallKostnadKr) > 0) {
      return rad.underhallKostnadKr ?? "";
    }
    return beraknadSummaKr > 0 ? String(beraknadSummaKr) : "";
  }
  const summa = beraknaUnderhallKostnadFranEnhet(rad);
  return summa > 0 ? String(summa) : "";
}

/** Patch som uppdaterar sparad total när enhetspris × mängd ändras. */
export function underhallKostnadSynkPatch(
  rad: UnderkomponentRad,
): Partial<UnderkomponentRad> {
  const enhet = hamtaUnderhallPrisEnhet(rad);
  if (enhet === "total" || enhet === "blandad") return {};
  const kr = synkaUnderhallKostnadKr(rad);
  return kr ? { underhallKostnadKr: kr } : {};
}

/** Sätt kvm-läge när användaren börjar fylla enhetspris på fasad (utan att klicka radio). */
export function infereraUnderhallPrisEnhetVidInmatning(
  rad: UnderkomponentRad,
  patch: Partial<UnderkomponentRad>,
): Partial<UnderkomponentRad> {
  if (!stodjerBlandadPrissattning(rad)) return patch;
  if (rad.underhallPrisEnhet && rad.underhallPrisEnhet !== "blandad") {
    if (patch.underhallPrisEnhet) return patch;
  }
  const merged = { ...rad, ...patch };
  const harStyckPoster =
    Array.isArray(merged.underhallStyckPoster) &&
    merged.underhallStyckPoster.some(
      (p) => parseMangd(p.antal) > 0 || parseKrText(p.enhetsprisKr) > 0,
    );
  const harInmatning =
    parseKrText(merged.underhallKostnadKr) > 0 ||
    parseKrText(merged.underhallEnhetsprisKr) > 0 ||
    parseKrText(merged.underhallStyckEnhetsprisKr) > 0 ||
    parseMangd(merged.värde) > 0 ||
    parseMangd(merged.underhallPrisAntal) > 0 ||
    harStyckPoster;
  if (harInmatning && (!merged.underhallPrisEnhet || merged.underhallPrisEnhet === "blandad")) {
    return { ...patch, underhallPrisEnhet: "blandad" };
  }
  return patch;
}

export function stodjerEnhetsprissattning(rad: UnderkomponentRad): boolean {
  return (
    rad.måttenhet === "kvm" ||
    rad.måttenhet === "antal" ||
    stodjerBlandadPrissattning(rad)
  );
}
