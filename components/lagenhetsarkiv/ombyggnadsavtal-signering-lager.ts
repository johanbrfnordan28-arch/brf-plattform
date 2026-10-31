import {
  lasLagenhetsarkiv,
  sparaLagenhetsarkiv,
} from "@/components/lagenhetsarkiv/lagenhetsarkiv-lager";
import { sparaOmbyggnadsavtalDokumentIMapp } from "@/components/medlemmar/renoverings-projekt-arkiv";
import { uppdateraRenoveringsProjekt } from "@/components/medlemmar/renoverings-projekt-lager";
import type { MedlemsKravPunkt } from "@/components/lagenhetsarkiv/medlems-krav";
import {
  allaUndertecknareKlara,
  ombyggnadsavtalPdfFilnamn,
  skapaLagenhetOmbyggnadsavtal,
  type LagenhetOmbyggnadsavtal,
  type OmbyggnadsavtalUndertecknare,
} from "@/components/lagenhetsarkiv/lagenhet-ombyggnadsavtal";
import { safeSetLocalStorage } from "@/lib/localStorage";
import { foreningStorageKey } from "@/lib/foreningStorage";

const OMBYGGNADSAVTAL_SIGNERING_BASE = "brf-ombyggnadsavtal-signering";

export const OMBYGGNADSAVTAL_SIGNERING_EVENT =
  "ombyggnadsavtal-signering-uppdaterad";

export type OmbyggnadsavtalSignering = {
  id: string;
  foreningId: string;
  apartmentId: number;
  lagenhetsnummer: string;
  mallEtikett: string;
  foreningsnamn: string;
  organisationsnummer?: string;
  postadress?: string;
  ort?: string;
  punkter: Pick<MedlemsKravPunkt, "id" | "text" | "sektionEtikett">[];
  undertecknare: OmbyggnadsavtalUndertecknare[];
  skapad: string;
  status: "vantar" | "signerad";
  /** Renoveringsmapp där signerat avtal ska sparas. */
  koppladMappId?: number;
  renoveringsProjektId?: string;
};

function storageKey(foreningId: string): string {
  return foreningStorageKey(`${OMBYGGNADSAVTAL_SIGNERING_BASE}-${foreningId}`);
}

function lasAlla(foreningId: string): OmbyggnadsavtalSignering[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey(foreningId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function sparaAlla(
  foreningId: string,
  poster: OmbyggnadsavtalSignering[],
): boolean {
  if (typeof window === "undefined") return false;
  const ok = safeSetLocalStorage(
    storageKey(foreningId),
    JSON.stringify(poster),
  ).ok;
  if (ok) {
    window.dispatchEvent(new Event(OMBYGGNADSAVTAL_SIGNERING_EVENT));
  }
  return ok;
}

export function skapaOmbyggnadsavtalSigneringId(): string {
  return `oa-sig-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function skapaOmbyggnadsavtalSignering(
  data: Omit<OmbyggnadsavtalSignering, "id" | "skapad" | "status"> & {
    id?: string;
  },
): OmbyggnadsavtalSignering {
  const id = data.id ?? skapaOmbyggnadsavtalSigneringId();
  const signering: OmbyggnadsavtalSignering = {
    ...data,
    id,
    skapad: new Date().toISOString(),
    status: "vantar",
  };
  const poster = lasAlla(data.foreningId).filter((p) => p.id !== id);
  sparaAlla(data.foreningId, [signering, ...poster]);
  return signering;
}

export function lasOmbyggnadsavtalSignering(
  foreningId: string,
  id: string,
): OmbyggnadsavtalSignering | null {
  return lasAlla(foreningId).find((p) => p.id === id) ?? null;
}

function uppdateraAvtalPaLagenhet(
  foreningId: string,
  apartmentId: number,
  uppdatera: (avtal: LagenhetOmbyggnadsavtal) => LagenhetOmbyggnadsavtal,
  fallback?: LagenhetOmbyggnadsavtal,
): boolean {
  const state = lasLagenhetsarkiv(foreningId);
  if (!state) return false;
  const apartments = state.apartments.map((apt) => {
    if (apt.id !== apartmentId) return apt;
    const underlag = apt.ombyggnadsavtal ?? fallback ?? skapaLagenhetOmbyggnadsavtal();
    return { ...apt, ombyggnadsavtal: uppdatera(underlag) };
  });
  return sparaLagenhetsarkiv({ ...state, apartments }, foreningId).ok;
}

export function signeraOmbyggnadsavtalUndertecknare(
  foreningId: string,
  id: string,
  personnummerNyckel: string,
  signeradAv: string,
):
  | { ok: true; signering: OmbyggnadsavtalSignering }
  | { ok: false; fel: string } {
  const poster = lasAlla(foreningId);
  const index = poster.findIndex((p) => p.id === id);
  if (index < 0) {
    return { ok: false, fel: "Kunde inte hitta avtalet. Kontakta styrelsen." };
  }

  const signering = poster[index];
  const undertecknareIndex = signering.undertecknare.findIndex(
    (u) => u.personnummerNyckel === personnummerNyckel,
  );
  if (undertecknareIndex < 0) {
    return {
      ok: false,
      fel: "Ditt personnummer matchar inte någon som styrelsen lagt till som undertecknare.",
    };
  }

  const undertecknare = signering.undertecknare[undertecknareIndex];
  if (undertecknare.signerad) {
    return {
      ok: false,
      fel: "Du har redan godkänt detta ombyggnadsavtal med BankID.",
    };
  }

  const nu = new Date();
  const signerad: OmbyggnadsavtalUndertecknare = {
    ...undertecknare,
    namn: signeradAv.trim() || undertecknare.namn,
    signerad: {
      datum: nu.toLocaleDateString("sv-SE"),
      tidpunkt: nu.toISOString(),
      metod: "bankid",
    },
  };

  const undertecknareUppdaterade = signering.undertecknare.map((u, i) =>
    i === undertecknareIndex ? signerad : u,
  );
  const allaKlara =
    undertecknareUppdaterade.length > 0 &&
    undertecknareUppdaterade.every((u) => Boolean(u.signerad));

  const uppdaterad: OmbyggnadsavtalSignering = {
    ...signering,
    undertecknare: undertecknareUppdaterade,
    status: allaKlara ? "signerad" : "vantar",
  };
  poster[index] = uppdaterad;
  sparaAlla(foreningId, poster);

  const datum = signerad.signerad!.datum;
  const fallbackAvtal: LagenhetOmbyggnadsavtal = {
    ...skapaLagenhetOmbyggnadsavtal(),
    punkter: signering.punkter.map((p) => ({
      id: p.id,
      sektionId: p.sektionEtikett,
      sektionEtikett: p.sektionEtikett,
      text: p.text,
      ingar: true,
    })),
    undertecknare: signering.undertecknare,
    signeringId: signering.id,
    skickadTillMedlem: signering.skapad.slice(0, 10),
  };
  uppdateraAvtalPaLagenhet(
    foreningId,
    signering.apartmentId,
    (avtal) => {
      const nasta: LagenhetOmbyggnadsavtal = {
        ...avtal,
        signeringId: avtal.signeringId ?? signering.id,
        undertecknare:
          avtal.undertecknare.length > 0
            ? avtal.undertecknare.map((u) =>
                u.personnummerNyckel === personnummerNyckel ? signerad : u,
              )
            : undertecknareUppdaterade,
      };
      if (allaUndertecknareKlara(nasta)) {
        nasta.klarDatum = datum;
        nasta.sparadPdfFilnamn = ombyggnadsavtalPdfFilnamn(
          signering.lagenhetsnummer,
          datum,
        );
      }
      return nasta;
    },
    fallbackAvtal,
  );

  if (allaKlara) {
    const pdfNamn = ombyggnadsavtalPdfFilnamn(
      signering.lagenhetsnummer,
      datum,
    );
    if (signering.koppladMappId) {
      sparaOmbyggnadsavtalDokumentIMapp(
        signering.apartmentId,
        signering.koppladMappId,
        pdfNamn,
      );
    }
    if (signering.renoveringsProjektId) {
      uppdateraRenoveringsProjekt(signering.renoveringsProjektId, {
        status: "avtal_signerat",
      });
    }
  }

  return { ok: true, signering: uppdaterad };
}

export function ombyggnadsavtalSigneringLank(
  signeringId: string,
  foreningId: string,
): string {
  const path = `/signering/ombyggnadsavtal?id=${encodeURIComponent(signeringId)}&forening=${encodeURIComponent(foreningId)}`;
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path}`;
}
