/** Kort länk för styrelsemässa — QR och muntlig delning. */
export const MASSA_PATH = "/massa";

/** Sökväg + query på huvudsidan när besökare kommer från mässan. */
export const HUVUDSIDA_MASSA_QUERY = "/?kalla=massa";

export function massaUrl(host = "http://127.0.0.1:3010"): string {
  const bas = host.replace(/\/$/, "");
  return `${bas}${MASSA_PATH}`;
}

/** Publik demo — kräver att /massa finns på main och är deployad till demo. */
export const MASSA_PUBLIK_URL = "https://demo.styrelse-navet.se/massa";
