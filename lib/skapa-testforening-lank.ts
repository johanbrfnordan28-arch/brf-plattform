/** Kort adress för Safari — startsida med skapa-formulär. */
export const PROVA_GRATIS_PATH = "/prova-gratis";

/** Formulär på startsidan (välj namn). */
export const SKAPA_TESTFORENING_PATH = "/skapa-testforening";

/** Skapar testförening direkt och öppnar /forening. */
export const SKAPA_TESTFORENING_START_PATH = "/skapa-testforening/start";

/** Adress att spara i Safari — öppnar sidan där du skapar föreningen. */
export function provaGratisUrl(host = "http://localhost:3010"): string {
  const bas = host.replace(/\/$/, "");
  return `${bas}${PROVA_GRATIS_PATH}`;
}

export function skapaTestforeningUrl(host = "http://localhost:3010"): string {
  const bas = host.replace(/\/$/, "");
  return `${bas}${SKAPA_TESTFORENING_PATH}`;
}

export function skapaTestforeningStartUrl(host = "http://localhost:3010"): string {
  const bas = host.replace(/\/$/, "");
  return `${bas}${SKAPA_TESTFORENING_START_PATH}`;
}
