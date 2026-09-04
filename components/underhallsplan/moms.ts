/** Standard svensk moms vid avdrag från inkl-moms-belopp. */
export const STANDARD_MOMS_SATS = 0.25;

export type MomsUppdelning = {
  /** Belopp exklusive moms (används i planen/budgeten). */
  exklMoms: number;
  /** Momsbelopp som särredovisas. */
  moms: number;
  /** Ursprungligt belopp inklusive moms. */
  inklMoms: number;
};

/** Delar upp ett belopp inkl. moms till exkl. + moms (avrundat till hela kronor). */
export function delaUppInklMoms(
  inklMoms: number,
  sats: number = STANDARD_MOMS_SATS,
): MomsUppdelning {
  const inkl = Math.max(0, Math.round(inklMoms));
  if (inkl <= 0 || sats <= 0) {
    return { exklMoms: inkl, moms: 0, inklMoms: inkl };
  }
  const exklMoms = Math.round(inkl / (1 + sats));
  const moms = inkl - exklMoms;
  return { exklMoms, moms, inklMoms: inkl };
}

export function parseKrBelopp(text: string | number | undefined | null): number {
  if (typeof text === "number") {
    return Number.isFinite(text) ? Math.round(text) : 0;
  }
  if (!text?.trim()) return 0;
  const n = Number.parseFloat(text.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) ? Math.round(n) : 0;
}
