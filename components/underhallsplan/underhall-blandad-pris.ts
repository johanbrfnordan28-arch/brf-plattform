import type { BlandadStyckPost } from "@/components/underhallsplan/blandad-styck-poster";
import {
  fordelaStyckBudgetPaPoster,
  normaliseraStyckPoster,
  summeraStyckPosterAntal,
  summeraStyckPosterKr,
} from "@/components/underhallsplan/blandad-styck-poster";
import type { UnderkomponentRad } from "@/components/underhallsplan/komponentregister";
import { parseKrText, parseMangd } from "@/components/underhallsplan/underhall-kostnad";

export type { BlandadStyckPost } from "@/components/underhallsplan/blandad-styck-poster";

export type BlandadPrisDelar = {
  kvm: number;
  krPerKvm: number;
  styckPoster: BlandadStyckPost[];
  totalKr: number;
};

export type BlandadPrisSummering = {
  delKvmKr: number;
  delStKr: number;
  beraknadSummaKr: number;
  effektivTotalKr: number;
  totalSkiljerSig: boolean;
  restKr: number;
};

export type ImplikeradEnhetspris = {
  krPerKvm: number | null;
  styckPoster: BlandadStyckPost[] | null;
  forklaring: string;
};

export const UNDERHALL_BLANDAD_RESERVATION =
  "Total kostnad kan inkludera ställning, etablering, bortforsling m.m. Uppdelning per m² och per styck är därför en planeringshjälp — summan av delarna behöver inte motsvara totalen.";

export function hamtaStyckPosterFranUnderkomponent(
  rad: UnderkomponentRad,
): BlandadStyckPost[] {
  return normaliseraStyckPoster(rad.underhallStyckPoster, {
    antal: rad.underhallPrisAntal,
    enhetsprisKr: rad.underhallStyckEnhetsprisKr,
    etikett: "Styck",
  });
}

export function parseBlandadFranUnderkomponent(
  rad: UnderkomponentRad,
): BlandadPrisDelar {
  return {
    kvm: parseMangd(rad.värde),
    krPerKvm: parseKrText(rad.underhallEnhetsprisKr),
    styckPoster: hamtaStyckPosterFranUnderkomponent(rad),
    totalKr: parseKrText(rad.underhallKostnadKr),
  };
}

export function summeraBlandadPris(
  delar: BlandadPrisDelar,
): BlandadPrisSummering {
  const delKvmKr =
    delar.kvm > 0 && delar.krPerKvm > 0
      ? Math.round(delar.kvm * delar.krPerKvm)
      : 0;
  const delStKr = summeraStyckPosterKr(delar.styckPoster);
  const beraknadSummaKr = delKvmKr + delStKr;
  const effektivTotalKr =
    delar.totalKr > 0 ? delar.totalKr : beraknadSummaKr;
  const totalSkiljerSig =
    delar.totalKr > 0 &&
    beraknadSummaKr > 0 &&
    delar.totalKr !== beraknadSummaKr;
  const restKr =
    delar.totalKr > 0 ? delar.totalKr - beraknadSummaKr : 0;

  return {
    delKvmKr,
    delStKr,
    beraknadSummaKr,
    effektivTotalKr,
    totalSkiljerSig,
    restKr,
  };
}

export function beraknaImplikeradeEnhetspriser(
  delar: BlandadPrisDelar,
): ImplikeradEnhetspris | null {
  if (delar.totalKr <= 0) return null;

  const harKvm = delar.kvm > 0;
  const delStKr = summeraStyckPosterKr(delar.styckPoster);
  const totalAntalSt = summeraStyckPosterAntal(delar.styckPoster);
  const harSt = totalAntalSt > 0;
  const saknarStPris = delar.styckPoster.some(
    (p) => parseMangd(p.antal) > 0 && parseKrText(p.enhetsprisKr) <= 0,
  );

  if (!harKvm && !harSt) return null;

  if (harKvm && harSt && delStKr > 0 && delar.krPerKvm <= 0) {
    const rest = delar.totalKr - delStKr;
    if (rest > 0) {
      return {
        krPerKvm: Math.round(rest / delar.kvm),
        styckPoster: null,
        forklaring: `Om totalen minus styckdelar (${delStKr.toLocaleString("sv-SE")} kr) fördelas på ytan.`,
      };
    }
  }

  if (harKvm && harSt && delar.krPerKvm > 0 && (delStKr <= 0 || saknarStPris)) {
    const kvmSumma = Math.round(delar.kvm * delar.krPerKvm);
    const rest = delar.totalKr - kvmSumma;
    if (rest > 0 && totalAntalSt > 0) {
      return {
        krPerKvm: delar.krPerKvm,
        styckPoster: fordelaStyckBudgetPaPoster(delar.styckPoster, rest),
        forklaring: `Om totalen minus ytdel (${kvmSumma.toLocaleString("sv-SE")} kr) fördelas på styckposterna.`,
      };
    }
  }

  if (harKvm && !harSt) {
    return {
      krPerKvm: Math.round(delar.totalKr / delar.kvm),
      styckPoster: null,
      forklaring: "Om hela totalen vore fördelad enbart på ytan (m²).",
    };
  }

  if (harSt && !harKvm) {
    return {
      krPerKvm: null,
      styckPoster: fordelaStyckBudgetPaPoster(
        delar.styckPoster,
        delar.totalKr,
      ),
      forklaring: "Om hela totalen fördelas på styckposterna (jämnt per styck).",
    };
  }

  if (harKvm && harSt && saknarStPris && delar.krPerKvm <= 0) {
    const halva = delar.totalKr / 2;
    return {
      krPerKvm: Math.round(halva / delar.kvm),
      styckPoster: fordelaStyckBudgetPaPoster(delar.styckPoster, halva),
      forklaring:
        "Schablon: hälften av totalen på yta, hälften fördelat på styckposterna.",
    };
  }

  return null;
}

export function patchFordelaTotalHalvaHalva(
  rad: UnderkomponentRad,
): Partial<UnderkomponentRad> {
  const delar = parseBlandadFranUnderkomponent(rad);
  if (delar.totalKr <= 0) return {};
  const halva = delar.totalKr / 2;
  const patch: Partial<UnderkomponentRad> = {
    underhallPrisEnhet: "blandad",
  };
  if (delar.kvm > 0) {
    patch.underhallEnhetsprisKr = String(Math.round(halva / delar.kvm));
  }
  const poster = fordelaStyckBudgetPaPoster(delar.styckPoster, halva);
  if (summeraStyckPosterAntal(poster) > 0) {
    patch.underhallStyckPoster = poster;
  }
  return patch;
}

export type FasadBlandadPrisDelar = BlandadPrisDelar;

export function hamtaStyckPosterFranFasadRad(rad: {
  styckPoster?: BlandadStyckPost[];
  mangdStyck?: string;
  enhetsprisStyckKr?: string;
}): BlandadStyckPost[] {
  return normaliseraStyckPoster(rad.styckPoster, {
    antal: rad.mangdStyck,
    enhetsprisKr: rad.enhetsprisStyckKr,
    etikett: "Styck",
  });
}

export function parseBlandadFranFasadRad(rad: {
  prisEnhet?: string;
  mangd: string;
  mangdStyck?: string;
  enhetsprisKr: string;
  enhetsprisStyckKr?: string;
  totalKr?: string;
  styckPoster?: BlandadStyckPost[];
}): FasadBlandadPrisDelar {
  const total =
    parseKrText(rad.totalKr) ||
    (rad.prisEnhet === "total" ? parseKrText(rad.enhetsprisKr) : 0);
  return {
    kvm: parseMangd(rad.mangd),
    krPerKvm: parseKrText(rad.enhetsprisKr),
    styckPoster: hamtaStyckPosterFranFasadRad(rad),
    totalKr: total,
  };
}

export function summeraFasadBlandadPris(
  delar: FasadBlandadPrisDelar,
): BlandadPrisSummering {
  return summeraBlandadPris(delar);
}

export function patchFordelaFasadTotalHalvaHalva(rad: {
  mangd: string;
  mangdStyck?: string;
  enhetsprisKr: string;
  enhetsprisStyckKr?: string;
  totalKr?: string;
  styckPoster?: BlandadStyckPost[];
}): Partial<{
  enhetsprisKr: string;
  enhetsprisStyckKr: string;
  styckPoster: BlandadStyckPost[];
}> {
  const delar = parseBlandadFranFasadRad(rad);
  if (delar.totalKr <= 0) return {};
  const halva = delar.totalKr / 2;
  const patch: Partial<{
    enhetsprisKr: string;
    enhetsprisStyckKr: string;
    styckPoster: BlandadStyckPost[];
  }> = {};
  if (delar.kvm > 0) {
    patch.enhetsprisKr = String(Math.round(halva / delar.kvm));
  }
  const poster = fordelaStyckBudgetPaPoster(delar.styckPoster, halva);
  if (summeraStyckPosterAntal(poster) > 0) {
    patch.styckPoster = poster;
  }
  return patch;
}
