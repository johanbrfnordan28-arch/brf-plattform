/**
 * Plattformsadmin — syns aldrig för styrelsen.
 * Adresser kan bytas senare via env PLATTFORM_ADMIN_EPOSTER (kommaseparerat).
 */

export const PLATTFORM_ADMIN_EPOST_STANDARD = [
  "johancarlsen@icloud.com",
  "s.alamerison@sveabygg.se",
  "admin2@styrelse-navet.se",
  "admin3@styrelse-navet.se",
  "admin4@styrelse-navet.se",
  "admin5@styrelse-navet.se",
  "admin6@styrelse-navet.se",
] as const;

/** Fast startlösenord för namngivna personalanvändare (skapas/uppdateras vid seed). */
export const PLATTFORM_PERSONAL_STARTLOSENORD: Record<
  string,
  { namn: string; losenord: string }
> = {
  "s.alamerison@sveabygg.se": {
    namn: "Seif Alameri",
    losenord: "Seif2026",
  },
};

/** Startkod tills BankID finns — byt via env i produktion. */
export const PLATTFORM_STARTKOD_STANDARD = "Semester12345";

export function listaPlattformAdminEposter(): string[] {
  const franEnv = process.env.PLATTFORM_ADMIN_EPOSTER?.trim();
  if (franEnv) {
    const lista = franEnv
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    // Seif ska alltid finnas även när env override används.
    if (!lista.includes("s.alamerison@sveabygg.se")) {
      lista.push("s.alamerison@sveabygg.se");
    }
    return lista;
  }
  return [...PLATTFORM_ADMIN_EPOST_STANDARD];
}

export function arPlattformAdminEpost(epost: string): boolean {
  const nyckel = epost.trim().toLowerCase();
  return listaPlattformAdminEposter().includes(nyckel);
}

/** Kod för plattformsinloggning (innan BankID). */
export function hamtaPlattformStartkod(): string {
  const franEnv = process.env.PLATTFORM_STARTKOD?.trim();
  if (franEnv && franEnv.length >= 8) return franEnv;
  return PLATTFORM_STARTKOD_STANDARD;
}

export function hamtaPersonalStartkonto(epost: string): {
  namn: string;
  losenord: string;
} | null {
  const nyckel = epost.trim().toLowerCase();
  return PLATTFORM_PERSONAL_STARTLOSENORD[nyckel] ?? null;
}

export const PLATTFORM_LOGIN_PATH = "/plattform-login";
export const PLATTFORM_START_PATH = "/plattform";
