export type ListaSummeringRad = {
  etikett: string;
  varde: string;
};

export function parseNummerSumma(values: string[]): number {
  return values.reduce((sum, v) => {
    const n = Number.parseFloat(v.replace(/\s/g, "").replace(",", "."));
    return sum + (Number.isFinite(n) && n > 0 ? n : 0);
  }, 0);
}

export function formatSummeringTal(n: number, maxDecimals = 1): string {
  if (n <= 0) return "0";
  return n.toLocaleString("sv-SE", {
    maximumFractionDigits: maxDecimals,
    minimumFractionDigits: 0,
  });
}

export function formateraSummeringRader(rader: ListaSummeringRad[]): string {
  if (rader.length === 0) return "";
  return rader.map((r) => `${r.etikett} ${r.varde}`).join(", ");
}

/** Summerar ifyllda mängdfält (löpmeter, m², st) till tabellrader. */
export function summeraMangderFranFalt<T>(
  data: T,
  falt: {
    etikett: string;
    enhet: string;
    hamtaMangd: (d: T) => string;
  }[],
): ListaSummeringRad[] {
  const rader: ListaSummeringRad[] = [];
  for (const def of falt) {
    const text = def.hamtaMangd(data).trim();
    if (!text) continue;
    const n = parseNummerSumma([text]);
    rader.push({
      etikett: def.etikett,
      varde:
        n > 0
          ? `${formatSummeringTal(n)} ${def.enhet}`
          : `${text} ${def.enhet}`.trim(),
    });
  }
  return rader;
}
