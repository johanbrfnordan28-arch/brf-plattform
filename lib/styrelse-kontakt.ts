import {
  arGrundmallForening,
  FORENING_AKTIV_EVENT,
  lasAktivForeningId,
  lasForeningProfil,
  sparaForeningProfil,
  type ForeningProfil,
} from "@/lib/forening-registry";
import { normaliseraGrund } from "@/components/underhallsplan/grund-synk";
import type { Grunduppgifter } from "@/components/underhallsplan/types";

export type StyrelseKontakt = {
  foreningsnamn: string;
  organisationsnummer: string;
  epost: string;
  kontaktperson: string;
  postadress: string;
  ort: string;
};

export function styrelseKontaktFranProfil(
  profil: ForeningProfil,
): StyrelseKontakt {
  return {
    foreningsnamn: profil.namn.trim(),
    organisationsnummer: profil.organisationsnummer.trim(),
    epost: profil.epost.trim(),
    kontaktperson: profil.kontaktperson.trim(),
    postadress: profil.postadress.trim(),
    ort: profil.ort.trim(),
  };
}

export function hamtaStyrelseKontakt(
  foreningId?: string,
): StyrelseKontakt | null {
  if (typeof window === "undefined") return null;
  const id = foreningId ?? lasAktivForeningId();
  if (arGrundmallForening(id)) return null;
  const profil = lasForeningProfil(id);
  if (!profil || arGrundmallForening(profil.id)) return null;
  return styrelseKontaktFranProfil(profil);
}

export function arStyrelseKontaktKomplett(kontakt: StyrelseKontakt): boolean {
  return Boolean(
    kontakt.foreningsnamn &&
      kontakt.epost &&
      kontakt.kontaktperson &&
      kontakt.postadress,
  );
}

export function formateraStyrelseKontaktBlock(
  kontakt: StyrelseKontakt | null,
): string {
  if (!kontakt?.foreningsnamn) {
    return [
      "STYRELSENS KONTAKTUPPGIFTER",
      "(Ej ifyllda — lägg in under Föreningsuppgifter i portalen.)",
      "",
    ].join("\n");
  }
  const rader = ["STYRELSENS KONTAKTUPPGIFTER", kontakt.foreningsnamn];
  if (kontakt.organisationsnummer) {
    rader.push(`Org.nr: ${kontakt.organisationsnummer}`);
  }
  if (kontakt.postadress || kontakt.ort) {
    rader.push(
      `Postadress: ${[kontakt.postadress, kontakt.ort].filter(Boolean).join(", ")}`,
    );
  }
  if (kontakt.kontaktperson) {
    rader.push(`Kontaktperson: ${kontakt.kontaktperson}`);
  }
  if (kontakt.epost) {
    rader.push(`E-post: ${kontakt.epost}`);
  }
  rader.push("");
  return rader.join("\n");
}

/** Förifyller underhållsplanens grunduppgifter från styrelsens profil. */
export function appliceraKontaktPaGrund(
  grund: Grunduppgifter,
  kontakt: StyrelseKontakt | null,
): Grunduppgifter {
  if (!kontakt) return grund;
  let next = { ...grund };
  if (!next.adresser[0]?.trim() && kontakt.postadress) {
    next = {
      ...next,
      adresser: [kontakt.postadress, ...next.adresser.slice(1)],
    };
  }
  return normaliseraGrund(next);
}

export function planNamnFranKontakt(kontakt: StyrelseKontakt | null): string | null {
  return kontakt?.foreningsnamn || null;
}

export function markeraGrundinfoPaborjad(): void {
  if (typeof window === "undefined") return;
  const profil = lasForeningProfil();
  if (!profil || arGrundmallForening(profil.id) || profil.grundinfoPaborjad) {
    return;
  }
  sparaForeningProfil({ ...profil, grundinfoPaborjad: true }, { tyst: true });
  window.dispatchEvent(new Event(FORENING_AKTIV_EVENT));
}

export { FORENING_AKTIV_EVENT };
