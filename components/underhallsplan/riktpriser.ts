/**
 * Riktvärden för uppskattning i underhållsplan (BRF, flerbostadshus).
 * Avser typiska entreprenadkostnader inkl. montage — justera per offert.
 * Källa: branschintervall för renovering/byte, avrundat för planeringsändamål.
 */

export type RiktprisEnhet = "kvm" | "styck" | "total";

export type RiktprisSpec = {
  enhet: RiktprisEnhet;
  prisKr: number;
};

export const RIKT_VENTILATION_UNDERKOMPONENT_KR: Record<string, RiktprisSpec> = {
  aggregat: { enhet: "styck", prisKr: 450_000 },
  kanaler: { enhet: "kvm", prisKr: 850 },
  don: { enhet: "styck", prisKr: 3_500 },
  "extra-flaktar": { enhet: "styck", prisKr: 45_000 },
};

export const RIKT_VENTILATION_EXTRA_TYP_KR: Record<
  | "vindflakt"
  | "rokgasflakt"
  | "takflakt"
  | "trapphusflakt"
  | "garageflakt"
  | "kallarflakt"
  | "annat",
  number
> = {
  vindflakt: 35_000,
  rokgasflakt: 28_000,
  takflakt: 22_000,
  trapphusflakt: 18_000,
  garageflakt: 25_000,
  kallarflakt: 20_000,
  annat: 22_000,
};

export const RIKT_FONSTER_KR: Record<string, number> = {
  tra_renovering: 28_000,
  tra_malning: 4_500,
  "alu-kldd": 16_000,
  pvc: 12_000,
  aluminium: 14_000,
};

export const RIKT_DORR_KR: Record<string, number> = {
  "malad-tra_renovering": 24_000,
  "malad-tra_malning": 3_800,
  ek_renovering: 32_000,
  ek_malning: 4_200,
  aluminium: 18_000,
  plat_malning: 2_800,
  plat_kontroll: 1_200,
};

export const RIKT_BALKONG_DEL_KR = {
  balkongplatta: 4_200,
  tatskikt: 1_350,
  fallspackel: 850,
  sockel: 2_400,
  "droppnasa-kantbleck": 1_750,
  avvattning: 3_200,
  rake: 8_500,
  golv: 2_800,
} as const;

/** Eftermonterad balkongmodul — fast post per balkong utöver delar */
export const RIKT_TILLBYGGD_BALKONG_KR = 195_000;

export const RIKT_HISS_MODERNISERING_KR = 950_000;

export const RIKT_TVATTSTUGA_KR = {
  tvattmaskin: 28_000,
  torktumlare: 24_000,
  torkskap: 18_000,
  mangel: 12_000,
  belysning: 4_500,
  golv: 1_200,
  vaggar: 650,
} as const;

export function parsePrisKr(text: string | undefined): number {
  if (!text?.trim()) return 0;
  const n = Number.parseFloat(text.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function effektivEnhetspris(
  anvandarVarde: string | undefined,
  riktpris: number,
): number {
  const eget = parsePrisKr(anvandarVarde);
  return eget > 0 ? eget : riktpris;
}
