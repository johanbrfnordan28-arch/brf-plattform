import type { KomponentDetaljData } from "@/components/underhallsplan/komponentregister";
import type { RenoveringDelpost } from "@/components/underhallsplan/renoveringar";
import { TAK_YTSKIKT_ID } from "@/components/underhallsplan/tak-enheter";

/** En rad i fördelningen av ett anbud för hela taket. */
export type TakFordelningRad = {
  underkomponentId: string;
  del: string;
  /** Andel i procent som text (redigerbar). */
  procent: string;
};

/** Ungefärliga styckpriser — endast för att föreslå fördelning, kan justeras. */
const VIKT_PER_ENHET: Record<string, number> = {
  [TAK_YTSKIKT_ID]: 850,
  skorsten: 35_000,
  ventilationshuv: 18_000,
  takkupa: 85_000,
  takstegar: 6_000,
  "avluftning-avlopp": 8_000,
  nock: 700,
  ranndal: 700,
  "snoras-skydd": 700,
  takbryggor: 700,
};

const FAST_VIKT: Record<string, number> = {
  takfonster: 100_000,
  takterrass: 150_000,
  medlemstakterrass: 150_000,
};

/** Takytan får minst denna andel när ingen yta är angiven. */
const TAKYTA_STANDARDANDEL = 0.7;

/** Antagen längd när löpmeter saknas (nock, ränndal m.m.). */
const TYPISK_LOPMETER = 20;

function tal(text: string | undefined): number {
  if (!text?.trim()) return 0;
  const n = Number.parseFloat(text.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function avrundaTill100(vikter: number[]): number[] {
  const summa = vikter.reduce((s, v) => s + v, 0);
  if (summa <= 0) return vikter.map(() => 0);
  const exakt = vikter.map((v) => (v / summa) * 100);
  const heltal = exakt.map((v) => Math.floor(v));
  let rest = 100 - heltal.reduce((s, v) => s + v, 0);
  const ordning = exakt
    .map((v, i) => ({ i, decimal: v - Math.floor(v) }))
    .sort((a, b) => b.decimal - a.decimal);
  for (const { i } of ordning) {
    if (rest <= 0) break;
    heltal[i] += 1;
    rest -= 1;
  }
  // Varje del som ingår ska synas med minst 1 %.
  for (let i = 0; i < heltal.length; i++) {
    if (vikter[i] > 0 && heltal[i] === 0) {
      const storst = heltal.indexOf(Math.max(...heltal));
      if (heltal[storst] <= 1) break;
      heltal[storst] -= 1;
      heltal[i] = 1;
    }
  }
  return heltal;
}

/** Föreslår fördelning på takets delar utifrån yta, antal och ungefärliga priser. */
export function foreslaTakFordelning(data: KomponentDetaljData): TakFordelningRad[] {
  const rader = data.underkomponenter.filter((r) => r.medIPlan !== false);
  if (rader.length === 0) return [];

  const vikter = rader.map((rad) => {
    if (rad.id === TAK_YTSKIKT_ID) return tal(rad.värde) * VIKT_PER_ENHET[TAK_YTSKIKT_ID];
    if (FAST_VIKT[rad.id]) return FAST_VIKT[rad.id];
    const perEnhet = VIKT_PER_ENHET[rad.id] ?? 10_000;
    const typiskMangd = rad.måttenhet === "löpmeter" ? TYPISK_LOPMETER : 1;
    return perEnhet * (tal(rad.värde) || typiskMangd);
  });

  const takIndex = rader.findIndex((r) => r.id === TAK_YTSKIKT_ID);
  if (takIndex >= 0 && vikter[takIndex] <= 0) {
    const ovriga = vikter.reduce((s, v, i) => (i === takIndex ? s : s + v), 0);
    vikter[takIndex] =
      ovriga > 0 ? (ovriga * TAKYTA_STANDARDANDEL) / (1 - TAKYTA_STANDARDANDEL) : 1;
  }

  const procent = avrundaTill100(vikter);
  return rader.map((rad, i) => ({
    underkomponentId: rad.id,
    del: rad.id === TAK_YTSKIKT_ID ? "Takbeläggning" : rad.etikett,
    procent: String(procent[i]),
  }));
}

export function summaProcent(rader: TakFordelningRad[]): number {
  return rader.reduce((s, r) => s + tal(r.procent), 0);
}

export function takFordelningTillDelposter(
  komponent: string,
  rader: TakFordelningRad[],
): RenoveringDelpost[] {
  return rader
    .filter((r) => tal(r.procent) > 0)
    .map((r) => ({
      komponent,
      del: r.del,
      andel: tal(r.procent) / 100,
      atgardTyp: "tak",
      underkomponentId: r.underkomponentId,
    }));
}

export function delposterTillTakFordelning(
  delposter: RenoveringDelpost[] | undefined,
): TakFordelningRad[] {
  if (!delposter?.length) return [];
  const summa = delposter.reduce((s, p) => s + p.andel, 0) || 1;
  return delposter.map((p) => ({
    underkomponentId: p.underkomponentId ?? "",
    del: p.del,
    procent: String(Math.round((p.andel / summa) * 100)),
  }));
}
