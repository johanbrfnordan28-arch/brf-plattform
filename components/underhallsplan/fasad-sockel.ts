import {
  formatSummeringTal,
  formateraSummeringRader,
  type ListaSummeringRad,
} from "@/components/underhallsplan/lista-summering";

export type FasadSockelSegment = {
  id: string;
  /** T.ex. Norr, garage, innergård */
  namn: string;
  /** Sockelhöjd i mm */
  hojdMm: string;
  /** Horisontell omfattning i löpmeter */
  lopmeter: string;
};

export type FasadSockelRegister = Record<string, FasadSockelSegment[]>;

function skapaId(): string {
  return `sockel-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function skapaTomFasadSockelSegment(namn = ""): FasadSockelSegment {
  return {
    id: skapaId(),
    namn,
    hojdMm: "",
    lopmeter: "",
  };
}

export function normaliseraFasadSockelSegment(
  raw: FasadSockelSegment,
): FasadSockelSegment {
  return {
    id: raw.id?.trim() || skapaId(),
    namn: raw.namn?.trim() ?? "",
    hojdMm: raw.hojdMm?.trim() ?? "",
    lopmeter: raw.lopmeter?.trim() ?? "",
  };
}

export function normaliseraFasadSockelPoster(
  raw: FasadSockelSegment[] | undefined,
): FasadSockelSegment[] {
  if (!raw?.length) return [];
  return raw.map(normaliseraFasadSockelSegment);
}

function parsePositiv(text: string): number {
  const n = Number.parseFloat(text.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** Yta i m² = höjd (m) × löpmeter. */
export function beraknaFasadSockelSegmentKvm(segment: FasadSockelSegment): number {
  const hojdM = parsePositiv(segment.hojdMm) / 1000;
  const lpm = parsePositiv(segment.lopmeter);
  if (hojdM <= 0 || lpm <= 0) return 0;
  return hojdM * lpm;
}

export function beraknaFasadSockelTotalKvm(
  poster: FasadSockelSegment[],
): number {
  return normaliseraFasadSockelPoster(poster).reduce(
    (s, p) => s + beraknaFasadSockelSegmentKvm(p),
    0,
  );
}

export function beraknaFasadSockelTotalLopmeter(
  poster: FasadSockelSegment[],
): number {
  return normaliseraFasadSockelPoster(poster).reduce(
    (s, p) => s + parsePositiv(p.lopmeter),
    0,
  );
}

export function formateraFasadSockelPoster(
  poster: FasadSockelSegment[],
): string {
  const norm = normaliseraFasadSockelPoster(poster).filter(
    (p) => p.hojdMm.trim() || p.lopmeter.trim(),
  );
  if (norm.length === 0) return "";
  const kvm = beraknaFasadSockelTotalKvm(norm);
  const lpm = beraknaFasadSockelTotalLopmeter(norm);
  const detalj = norm
    .slice(0, 3)
    .map((p) => {
      const h = p.hojdMm.trim() || "?";
      const l = p.lopmeter.trim() || "?";
      const etikett = p.namn.trim() ? `${p.namn}: ` : "";
      return `${etikett}${h} mm × ${l} m`;
    })
    .join("; ");
  const fler = norm.length > 3 ? ` (+${norm.length - 3} partier)` : "";
  return `${detalj}${fler} → ${Math.round(kvm * 10) / 10} m² (${lpm.toLocaleString("sv-SE")} m lpm)`;
}

export function summeraFasadSockelPoster(
  poster: FasadSockelSegment[],
): ListaSummeringRad[] {
  const norm = normaliseraFasadSockelPoster(poster);
  const kvm = beraknaFasadSockelTotalKvm(norm);
  const lpm = beraknaFasadSockelTotalLopmeter(norm);
  const rader: ListaSummeringRad[] = [
    {
      etikett: "Antal partier",
      varde: `${norm.filter((p) => p.hojdMm.trim() || p.lopmeter.trim()).length} st`,
    },
  ];
  if (lpm > 0) {
    rader.push({
      etikett: "Löpmeter totalt",
      varde: `${formatSummeringTal(lpm)} m`,
    });
  }
  if (kvm > 0) {
    rader.push({
      etikett: "Sockelyta beräknad",
      varde: `${formatSummeringTal(kvm)} m²`,
    });
  }
  return rader;
}

export function formateraFasadSockelSummering(
  poster: FasadSockelSegment[],
): string {
  return formateraSummeringRader(summeraFasadSockelPoster(poster));
}
