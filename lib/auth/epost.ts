export function normaliseraEpost(epost: string): string {
  return epost.trim().toLowerCase();
}

export function arGiltigEpost(epost: string): boolean {
  const e = normaliseraEpost(epost);
  // Enkel praktisk kontroll — räcker för formulärvalidering
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e.length <= 254;
}
