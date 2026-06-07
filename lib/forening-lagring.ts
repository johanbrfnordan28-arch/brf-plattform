/** Cookie-reserv när localStorage strular (Safari). */
const COOKIE_AKTIV_ID = "brf_aktiv_fid";
const COOKIE_PROFIL = "brf_senast_profil";

function cookieSatt(namn: string, varde: string, maxAgeSekunder = 60 * 60 * 24 * 30): void {
  if (typeof document === "undefined") return;
  try {
    document.cookie = `${namn}=${encodeURIComponent(varde)};path=/;max-age=${maxAgeSekunder};SameSite=Lax`;
  } catch {
    /* ignore */
  }
}

export function cookieHamta(namn: string): string | null {
  if (typeof document === "undefined") return null;
  const del = document.cookie.split(";").map((s) => s.trim());
  const prefix = `${namn}=`;
  for (const rad of del) {
    if (rad.startsWith(prefix)) {
      return decodeURIComponent(rad.slice(prefix.length));
    }
  }
  return null;
}

export function cookieSattAktivForeningId(id: string): void {
  cookieSatt(COOKIE_AKTIV_ID, id);
}

export function cookieHamtaAktivForeningId(): string | null {
  return cookieHamta(COOKIE_AKTIV_ID);
}

export function cookieSattSenastProfil(json: string): void {
  if (json.length > 3500) return;
  cookieSatt(COOKIE_PROFIL, json, 60 * 60 * 2);
}

export function cookieHamtaSenastProfil(): string | null {
  return cookieHamta(COOKIE_PROFIL);
}
