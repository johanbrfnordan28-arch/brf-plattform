/** Kort länk för styrelsemässa — mejla provlänk till besökare. */
export const MASSA_PATH = "/massa";

export function massaUrl(host = "http://127.0.0.1:3010"): string {
  const bas = host.replace(/\/$/, "");
  return `${bas}${MASSA_PATH}`;
}

/** Publik demo (sätt NEXT_PUBLIC_APP_URL i produktion om annan domän). */
export const MASSA_PUBLIK_URL = "https://demo.styrelse-navet.se/massa";
