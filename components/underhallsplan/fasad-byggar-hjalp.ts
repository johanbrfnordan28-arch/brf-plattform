/** Kort vägledning utifrån byggår — fasader varierar starkt över tid. */
export function fasadMaterialTipsFranByggar(byggar: string): string {
  const ar = Number.parseInt(byggar.trim(), 10);
  if (!Number.isFinite(ar) || ar < 1000) {
    return "Ange byggår i grunduppgifterna för vägledning om typiska fasadmaterial.";
  }
  if (ar < 1930) {
    return `${ar}: ofta tegel med putsband, massiv tegel eller natursten. Träfasader förekommer i enklare bebyggelse.`;
  }
  if (ar < 1960) {
    return `${ar}: vanligt med tegel, puts (kalkcement) och trä. Funkishus har ofta putsade fasader.`;
  }
  if (ar < 1980) {
    return `${ar}: ofta betongelement, platta fasader med puts eller plåt, tegel i flerbostadshus.`;
  }
  if (ar < 2000) {
    return `${ar}: tunnputs på isolerade fasader, tegel, trä och plåt.`;
  }
  return `${ar}: ofta puts (tunnputs), tegel, trä eller plåt — ofta med tilläggsisolering.`;
}
