import type { FasadAtgardId } from "@/components/underhallsplan/fasad-atgard";
import { fasadAtgardEtikett } from "@/components/underhallsplan/fasad-atgard";
import { summeraStyckPosterKr } from "@/components/underhallsplan/blandad-styck-poster";
import {
  hamtaStyckPosterFranFasadRad,
  parseBlandadFranFasadRad,
  summeraFasadBlandadPris,
} from "@/components/underhallsplan/underhall-blandad-pris";
import {
  parseKrText,
  parseMangd,
  type UnderhallPrisEnhet,
} from "@/components/underhallsplan/underhall-kostnad";

export type FasadAtgardPrisEnhet = UnderhallPrisEnhet;

export type FasadAtgardPrisRad = {
  prisEnhet: FasadAtgardPrisEnhet;
  enhetsprisKr: string;
  /** m² vid kvm/blandad */
  mangd: string;
  /** Antal styck vid blandad/styck */
  mangdStyck?: string;
  /** Kr per styck vid blandad (en rad — migreras till poster) */
  enhetsprisStyckKr?: string;
  /** Total kostnad vid blandad/total */
  totalKr?: string;
  /** Flera styckposter */
  styckPoster?: import("@/components/underhallsplan/blandad-styck-poster").BlandadStyckPost[];
};

export type FasadAtgardPrisRegister = Partial<
  Record<FasadAtgardId, FasadAtgardPrisRad>
>;

/** Nyckel = underkomponent-id (t.ex. fasadmaterial). */
export type FasadAtgardPrisRegisterMap = Record<string, FasadAtgardPrisRegister>;

export function skapaTomFasadAtgardPrisRad(
  defaultKvm?: string,
): FasadAtgardPrisRad {
  return {
    prisEnhet: "blandad",
    enhetsprisKr: "",
    mangd: defaultKvm?.trim() ?? "",
    mangdStyck: "",
    enhetsprisStyckKr: "",
    totalKr: "",
  };
}

export function normaliseraFasadAtgardPrisRegister(
  raw?: FasadAtgardPrisRegister | null,
  defaultKvm?: string,
): FasadAtgardPrisRegister {
  if (!raw) return {};
  const out: FasadAtgardPrisRegister = {};
  for (const [key, val] of Object.entries(raw)) {
    if (!val) continue;
    const prisEnhet =
      val.prisEnhet === "styck" ||
      val.prisEnhet === "total" ||
      val.prisEnhet === "blandad" ||
      val.prisEnhet === "kvm"
        ? val.prisEnhet
        : "blandad";
    out[key as FasadAtgardId] = {
      prisEnhet,
      enhetsprisKr: val.enhetsprisKr ?? "",
      mangd: val.mangd?.trim() || defaultKvm?.trim() || "",
      mangdStyck: val.mangdStyck ?? "",
      enhetsprisStyckKr: val.enhetsprisStyckKr ?? "",
      styckPoster: val.styckPoster,
      totalKr:
        val.totalKr?.trim() ||
        (prisEnhet === "total" ? val.enhetsprisKr?.trim() : "") ||
        "",
    };
  }
  return out;
}

export function beraknaFasadAtgardPrisRad(rad: FasadAtgardPrisRad): number {
  if (rad.prisEnhet === "total") {
    return parseKrText(rad.totalKr) || parseKrText(rad.enhetsprisKr);
  }
  if (rad.prisEnhet === "blandad") {
    return summeraFasadBlandadPris(parseBlandadFranFasadRad(rad)).effektivTotalKr;
  }
  if (rad.prisEnhet === "styck") {
    const poster = hamtaStyckPosterFranFasadRad(rad);
    const franPoster = summeraStyckPosterKr(poster);
    if (franPoster > 0) return franPoster;
    const pris = parseKrText(rad.enhetsprisKr);
    const mangd = parseMangd(rad.mangdStyck) || parseMangd(rad.mangd);
    if (pris <= 0 || mangd <= 0) return 0;
    return Math.round(pris * mangd);
  }
  const pris = parseKrText(rad.enhetsprisKr);
  const mangd = parseMangd(rad.mangd);
  if (pris <= 0 || mangd <= 0) return 0;
  return Math.round(pris * mangd);
}

export function beraknaFasadAtgardPrisSumma(
  valdaAtgarder: FasadAtgardId[],
  priser: FasadAtgardPrisRegister,
): number {
  return valdaAtgarder.reduce((sum, id) => {
    const rad = priser[id];
    if (!rad) return sum;
    return sum + beraknaFasadAtgardPrisRad(rad);
  }, 0);
}

export type FasadAtgardPrisTabellRad = {
  id: FasadAtgardId;
  etikett: string;
  prisEnhet: FasadAtgardPrisEnhet;
  enhetsprisKr: string;
  mangd: string;
  summaKr: number;
};

import type { KomponentDetaljData } from "@/components/underhallsplan/komponentregister";

export function hamtaFasadAtgardPrisRegister(
  data: KomponentDetaljData,
  underId: string,
  defaultKvm?: string,
): FasadAtgardPrisRegister {
  return normaliseraFasadAtgardPrisRegister(
    data.fasadAtgardPrisRegister?.[underId],
    defaultKvm,
  );
}

export function uppdateraFasadAtgardPrisRegister(
  data: KomponentDetaljData,
  underId: string,
  priser: FasadAtgardPrisRegister,
): KomponentDetaljData {
  return {
    ...data,
    fasadAtgardPrisRegister: {
      ...data.fasadAtgardPrisRegister,
      [underId]: priser,
    },
  };
}

export function byggFasadAtgardPrisTabell(
  valdaAtgarder: FasadAtgardId[],
  priser: FasadAtgardPrisRegister,
): FasadAtgardPrisTabellRad[] {
  return valdaAtgarder.map((id) => {
    const rad = priser[id] ?? skapaTomFasadAtgardPrisRad();
    return {
      id,
      etikett: fasadAtgardEtikett(id),
      prisEnhet: rad.prisEnhet,
      enhetsprisKr: rad.enhetsprisKr,
      mangd: rad.mangd,
      summaKr: beraknaFasadAtgardPrisRad(rad),
    };
  });
}
