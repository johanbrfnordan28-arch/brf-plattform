/**
 * Plattformsadmin — syns aldrig för styrelsen.
 * Adresser kan bytas senare via env PLATTFORM_ADMIN_EPOSTER (kommaseparerat).
 */

export const PLATTFORM_ADMIN_EPOST_STANDARD = [
  "johancarlsen@icloud.com",
  "admin2@styrelse-navet.se",
  "admin3@styrelse-navet.se",
  "admin4@styrelse-navet.se",
  "admin5@styrelse-navet.se",
  "admin6@styrelse-navet.se",
] as const;

export function listaPlattformAdminEposter(): string[] {
  const franEnv = process.env.PLATTFORM_ADMIN_EPOSTER?.trim();
  if (franEnv) {
    return franEnv
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
  }
  return [...PLATTFORM_ADMIN_EPOST_STANDARD];
}

export function arPlattformAdminEpost(epost: string): boolean {
  const nyckel = epost.trim().toLowerCase();
  return listaPlattformAdminEposter().includes(nyckel);
}

export const PLATTFORM_LOGIN_PATH = "/plattform-login";
export const PLATTFORM_START_PATH = "/plattform";
