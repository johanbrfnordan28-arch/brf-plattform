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
  listaForeningar,
  normaliseraForeningProfil,
  sparaForeningProfil,
  taBortForeningFranRegistryOchLagring,
  type ForeningProfil,
} from "@/lib/forening-registry";
import {
  harTillrackligaBankIdSignaturer,
  laggTillBankIdSignatur,
  sammanfattaBankIdSignaturer,
  type BankIdSignatur,
} from "@/lib/bankid-signering";
import { arProvoperiodUtgangen } from "@/lib/forening-avtal";
import {
  arStyrelseKontaktKomplett,
  styrelseKontaktFranProfil,
} from "@/lib/styrelse-kontakt";

export const KUND_LOGIN_PATH = "/kund-login";
export const TEST_LOGIN_PATH = "/styrelse-login";
/** Egen sida för att teckna årsavtal och bli kund. */
export const TECKNA_AVTAL_PATH = "/forening/teckna-avtal";

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

/**
 * Tar bort testföreningar vars prövoperiod (30 dagar) gått ut utan tecknat avtal.
 * Anropas vid sidladdning så ansvaret för prövotid följs automatiskt.
 */
export function rensaUtgangnaProvoperioder(): string[] {
  if (typeof window === "undefined") return [];
  const borttagna: string[] = [];
  for (const f of listaForeningar()) {
    if (!arEgenTestForening(f.id) || f.avtalGodkant) continue;
    if (
      !arProvoperiodUtgangen({
        skapadTidpunkt: f.skapadTidpunkt,
        avtalGodkant: f.avtalGodkant,
      })
    ) {
      continue;
    }
    taBortForeningFranRegistryOchLagring(f.id);
    borttagna.push(f.id);
    void fetch(`/api/foreningar/${encodeURIComponent(f.id)}/radera-provoperiod`, {
      method: "POST",
    }).catch(() => {});
  }
  if (borttagna.length > 0) {
    window.dispatchEvent(new Event(FORENING_AKTIV_EVENT));
  }
  return borttagna;
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
    if (!kontakt.kontaktperson) saknas.push("styrelsemedlem");
    if (!kontakt.postadress) saknas.push("adress (grunduppgifter)");
  }
  if (!profil.organisationsnummer.trim()) {
    saknas.push("organisationsnummer");
  }
  // Unika saknas
  const unika = [...new Set(saknas)];
  return { ok: unika.length === 0, saknas: unika };
}

/**
 * Registrerar en BankID-signatur på kundavtalet.
 * Avtalet blir bindande (föreningen blir kund) först efter två olika personer.
 */
export function registreraKundAvtalSignatur(
  signatur: BankIdSignatur,
  foreningId?: string,
): ForeningProfil {
  const id = foreningId ?? lasAktivForeningId();
  const profil = lasForeningProfil(id);
  if (!profil || !arEgenTestForening(profil.id)) {
    throw new Error(
      "Avtal kan bara godkännas för er skapade testförening — inte för demoföreningar.",
    );
  }
  if (arKundForening(profil) && harTillrackligaBankIdSignaturer(profil.avtalBankidSignaturer)) {
    return normaliseraForeningProfil(profil);
  }
  const check = kanGodkannaAvtal(profil);
  if (!check.ok) {
    throw new Error(
      `Fyll i och spara föreningsuppgifter först (saknas: ${check.saknas.join(", ")}).`,
    );
  }
  const tillagd = laggTillBankIdSignatur(profil.avtalBankidSignaturer, {
    ...signatur,
    part: "kund",
  });
  if (!tillagd.ok) throw new Error(tillagd.fel);
  const klar = harTillrackligaBankIdSignaturer(tillagd.signaturer);
  const nu = new Date().toISOString();
  const uppdaterad = normaliseraForeningProfil({
    ...profil,
    grundinfoPaborjad: true,
    avtalBankidSignaturer: tillagd.signaturer,
    avtalBankidNamn: sammanfattaBankIdSignaturer(tillagd.signaturer),
    avtalBankidTidpunkt: nu,
    avtalGodkant: klar,
    avtalGodkantTidpunkt: klar ? nu : profil.avtalGodkantTidpunkt,
  });
  sparaForeningProfil(uppdaterad, { synkaServer: false });
  window.dispatchEvent(new Event(FORENING_AKTIV_EVENT));
  return uppdaterad;
}

/**
 * Godkänner ettårsavtalet för aktiv (eller angiven) förening → blir kund.
 * Isolerad till den föreningens profil — påverkar inte andra.
 * Kräver att två BankID-signaturer redan finns.
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
  if (!harTillrackligaBankIdSignaturer(profil.avtalBankidSignaturer)) {
    throw new Error(
      "Avtalet måste signeras med BankID av två personer, vardera med sitt personnummer.",
    );
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
