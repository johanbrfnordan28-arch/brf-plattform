/**
 * Kundstatus: testförening → sparade uppgifter → godkänt avtal → kund.
 * Kundinloggning visar endast föreningar med tecknat avtal.
 */

import {
  arEgenTestForening,
  listaEgnaTestForeningar,
} from "@/lib/forening-inloggning";
import {
  FORENING_AKTIV_EVENT,
  lasAktivForeningId,
  lasForeningProfil,
  normaliseraForeningProfil,
  sparaForeningProfil,
  type ForeningProfil,
} from "@/lib/forening-registry";
import {
  arStyrelseKontaktKomplett,
  styrelseKontaktFranProfil,
} from "@/lib/styrelse-kontakt";

export const KUND_LOGIN_PATH = "/kund-login";
export const TEST_LOGIN_PATH = "/styrelse-login";

/** Visningsnamn på publika knappen (bättre än «befintlig kund»). */
export const KUND_LOGIN_KNAPP_RUBRIK = "Logga in till er BRF";
export const KUND_LOGIN_KNAPP_UNDERTEXT = "För er med tecknat avtal";

export function arKundForening(profil: ForeningProfil | null | undefined): boolean {
  return Boolean(profil?.avtalGodkant);
}

export function arAktivKundForening(foreningId?: string): boolean {
  if (typeof window === "undefined") return false;
  const id = foreningId ?? lasAktivForeningId();
  return arKundForening(lasForeningProfil(id));
}

/** Endast egna föreningar som godkänt avtal — aldrig demos eller andras test. */
export function listaKundForeningar(): ForeningProfil[] {
  return listaEgnaTestForeningar().filter((f) => arKundForening(f));
}

/** Egna testföreningar som ännu inte tecknat avtal. */
export function listaTestperiodForeningar(): ForeningProfil[] {
  return listaEgnaTestForeningar().filter((f) => !arKundForening(f));
}

export function antalKundForeningar(): number {
  return listaKundForeningar().length;
}

export function kanGodkannaAvtal(profil: ForeningProfil): {
  ok: boolean;
  saknas: string[];
} {
  const saknas: string[] = [];
  if (!profil.namn.trim()) saknas.push("föreningsnamn");
  if (!profil.grundinfoPaborjad) {
    saknas.push("sparade föreningsuppgifter");
  }
  const kontakt = styrelseKontaktFranProfil(profil);
  if (!arStyrelseKontaktKomplett(kontakt)) {
    if (!kontakt.epost) saknas.push("e-post");
    if (!kontakt.kontaktperson) saknas.push("kontaktperson");
    if (!kontakt.postadress) saknas.push("postadress");
  }
  if (!profil.organisationsnummer.trim()) {
    saknas.push("organisationsnummer");
  }
  // Unika saknas
  const unika = [...new Set(saknas)];
  return { ok: unika.length === 0, saknas: unika };
}

/**
 * Godkänner ettårsavtalet för aktiv (eller angiven) förening → blir kund.
 * Isolerad till den föreningens profil — påverkar inte andra.
 */
export function godkannForeningsAvtal(foreningId?: string): ForeningProfil {
  const id = foreningId ?? lasAktivForeningId();
  const profil = lasForeningProfil(id);
  if (!profil || !arEgenTestForening(profil.id)) {
    throw new Error(
      "Avtal kan bara godkännas för er skapade testförening — inte för demoföreningar.",
    );
  }
  if (arKundForening(profil)) {
    return normaliseraForeningProfil(profil);
  }
  const check = kanGodkannaAvtal(profil);
  if (!check.ok) {
    throw new Error(
      `Fyll i och spara föreningsuppgifter först (saknas: ${check.saknas.join(", ")}).`,
    );
  }
  const uppdaterad = normaliseraForeningProfil({
    ...profil,
    grundinfoPaborjad: true,
    avtalGodkant: true,
    avtalGodkantTidpunkt: new Date().toISOString(),
  });
  sparaForeningProfil(uppdaterad, { synkaServer: false });
  window.dispatchEvent(new Event(FORENING_AKTIV_EVENT));
  return uppdaterad;
}
