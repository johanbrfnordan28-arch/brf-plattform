import {
  lasLagenhetsarkiv,
  sparaLagenhetsarkiv,
} from "@/components/lagenhetsarkiv/lagenhetsarkiv-lager";
import {
  skapaLagenhetsDokumentId,
  type LagenhetsDokument,
} from "@/components/lagenhetsarkiv/lagenhetsarkiv";
import type { MedlemsKravPunkt } from "@/components/lagenhetsarkiv/medlems-krav";
import { safeSetLocalStorage } from "@/lib/localStorage";
import { foreningStorageKey } from "@/lib/foreningStorage";

const RENOVERING_SIGNERING_BASE = "brf-renovering-medlem-signering";

export const RENOVERING_MEDLEM_SIGNERING_EVENT =
  "renovering-medlem-signering-uppdaterad";

export type RenoveringMedlemsSignering = {
  id: string;
  foreningId: string;
  lagenhetsnummer: string;
  mappNamn: string;
  mappId: number;
  apartmentId: number;
  mallEtikett: string;
  punkter: Pick<MedlemsKravPunkt, "id" | "text" | "sektionEtikett">[];
  skapad: string;
  status: "vantar" | "signerad";
  signeradDatum?: string;
  signeradAv?: string;
};

function storageKey(foreningId: string): string {
  return foreningStorageKey(`${RENOVERING_SIGNERING_BASE}-${foreningId}`);
}

function lasAlla(foreningId: string): RenoveringMedlemsSignering[] {
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
  poster: RenoveringMedlemsSignering[],
): boolean {
  if (typeof window === "undefined") return false;
  const ok = safeSetLocalStorage(
    storageKey(foreningId),
    JSON.stringify(poster),
  ).ok;
  if (ok) {
    window.dispatchEvent(new Event(RENOVERING_MEDLEM_SIGNERING_EVENT));
  }
  return ok;
}

export function skapaRenoveringSigneringId(): string {
  return `ren-sig-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function skapaRenoveringMedlemsSignering(
  data: Omit<RenoveringMedlemsSignering, "id" | "skapad" | "status">,
): RenoveringMedlemsSignering {
  const signering: RenoveringMedlemsSignering = {
    ...data,
    id: skapaRenoveringSigneringId(),
    skapad: new Date().toISOString(),
    status: "vantar",
  };
  const poster = lasAlla(data.foreningId);
  sparaAlla(data.foreningId, [
    signering,
    ...poster.filter((p) => p.id !== signering.id),
  ]);
  return signering;
}

export function lasRenoveringMedlemsSignering(
  foreningId: string,
  id: string,
): RenoveringMedlemsSignering | null {
  return lasAlla(foreningId).find((p) => p.id === id) ?? null;
}

function skapaOverenskommelseDokument(
  signering: RenoveringMedlemsSignering,
): LagenhetsDokument {
  const datum = signering.signeradDatum ?? new Date().toLocaleDateString("sv-SE");
  return {
    id: skapaLagenhetsDokumentId(),
    filnamn: `Överenskommelse BankID — ${signering.mappNamn} — ${datum}.pdf`,
    uppladdad: datum,
  };
}

export function signeraRenoveringMedlemsKrav(
  foreningId: string,
  id: string,
  signeradAv: string,
): RenoveringMedlemsSignering | null {
  const poster = lasAlla(foreningId);
  const index = poster.findIndex((p) => p.id === id);
  if (index < 0) return null;

  const signerad: RenoveringMedlemsSignering = {
    ...poster[index],
    status: "signerad",
    signeradDatum: new Date().toLocaleDateString("sv-SE"),
    signeradAv,
  };
  poster[index] = signerad;
  sparaAlla(foreningId, poster);

  const state = lasLagenhetsarkiv();
  if (state) {
    const dokument = skapaOverenskommelseDokument(signerad);
    const apartments = state.apartments.map((apt) => {
      if (apt.id !== signerad.apartmentId) return apt;
      return {
        ...apt,
        folders: apt.folders.map((m) => {
          if (m.id !== signerad.mappId) return m;
          if (!m.medlemsKrav) return m;

          // Spara i handlingar-undermappen, skapa den om den saknas.
          let undermappar = m.undermappar;
          const handlingar = undermappar.find((u) => u.typ === "handlingar");
          if (handlingar) {
            undermappar = undermappar.map((u) =>
              u.typ === "handlingar"
                ? { ...u, dokument: [dokument, ...u.dokument] }
                : u,
            );
          } else {
            undermappar = [
              {
                id: `${m.id}-handlingar-${Date.now()}`,
                typ: "handlingar" as const,
                dokument: [dokument],
              },
              ...undermappar,
            ];
          }

          return {
            ...m,
            undermappar,
            medlemsKrav: {
              ...m.medlemsKrav,
              medlemSignerad: {
                datum: signerad.signeradDatum!,
                av: signeradAv,
                metod: "bankid" as const,
              },
              sparadOverenskommelseFilnamn: dokument.filnamn,
            },
          };
        }),
      };
    });
    sparaLagenhetsarkiv({ ...state, apartments });
  }

  return signerad;
}

export function renoveringSigneringLank(
  signeringId: string,
  foreningId: string,
): string {
  if (typeof window === "undefined") {
    return `/signering/renovering?id=${encodeURIComponent(signeringId)}&forening=${encodeURIComponent(foreningId)}`;
  }
  const origin = window.location.origin;
  return `${origin}/signering/renovering?id=${encodeURIComponent(signeringId)}&forening=${encodeURIComponent(foreningId)}`;
}
