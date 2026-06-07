export type Punkt2D = { x: number; y: number };

export function avstandPx(a: Punkt2D, b: Punkt2D): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

/** Shoelace-formel — area i px². */
export function polygonAreaPx(punkter: Punkt2D[]): number {
  if (punkter.length < 3) return 0;
  let sum = 0;
  for (let i = 0; i < punkter.length; i++) {
    const j = (i + 1) % punkter.length;
    sum += punkter[i].x * punkter[j].y - punkter[j].x * punkter[i].y;
  }
  return Math.abs(sum) / 2;
}

/** m² utifrån px² och skala m/px. */
export function pxAreaTillKvm(areaPx: number, meterPerPx: number): number {
  return areaPx * meterPerPx * meterPerPx;
}

export function beraknaKvmFranMatning(
  punkter: Punkt2D[],
  kalibrering: { punktA: Punkt2D; punktB: Punkt2D; langdMeter: number } | null,
  lutningsfaktor = 1,
): number | null {
  if (!kalibrering || kalibrering.langdMeter <= 0) return null;
  const dPx = avstandPx(kalibrering.punktA, kalibrering.punktB);
  if (dPx <= 0) return null;
  const mPerPx = kalibrering.langdMeter / dPx;
  const kvm = pxAreaTillKvm(polygonAreaPx(punkter), mPerPx);
  return Math.round(kvm * lutningsfaktor * 10) / 10;
}
