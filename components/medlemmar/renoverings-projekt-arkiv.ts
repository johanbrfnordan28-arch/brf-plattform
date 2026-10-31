import {
  foreslagetMappNamn,
  renoveringsMallar,
  type RenoveringsMallId,
} from "@/components/lagenhetsarkiv/renoverings-mallar";
import {
  skapaRenoveringsMapp,
  skapaLagenhetsDokumentId,
  type LagenhetsDokument,
} from "@/components/lagenhetsarkiv/lagenhetsarkiv";
import {
  lasLagenhetsarkiv,
  sparaLagenhetsarkiv,
} from "@/components/lagenhetsarkiv/lagenhetsarkiv-lager";
import type { RenoveringsProjekt } from "@/components/medlemmar/renoverings-projekt-lager";

export function mallIdForRenoveringsTyp(typId: string): RenoveringsMallId {
  if (renoveringsMallar.some((m) => m.id === typId)) {
    return typId as RenoveringsMallId;
  }
  if (typId === "vvs") return "renovering";
  return "renovering";
}

export function skapaRenoveringsMapparForProjekt(
  projekt: RenoveringsProjekt,
): { ok: true; mappIds: number[] } | { ok: false; fel: string } {
  const state = lasLagenhetsarkiv();
  if (!state) {
    return { ok: false, fel: "Lägenhetsarkivet kunde inte läsas." };
  }
  const apartment = state.apartments.find((a) => a.id === projekt.apartmentId);
  if (!apartment) {
    return { ok: false, fel: "Lägenheten finns inte i arkivet." };
  }
  if (projekt.valdaTyper.length === 0) {
    return { ok: false, fel: "Välj minst en renoveringstyp först." };
  }

  const ar = projekt.planeratStart
    ? Number(projekt.planeratStart.slice(0, 4))
    : new Date().getFullYear();
  const arSafe =
    Number.isFinite(ar) && ar >= 1900 && ar <= 2100
      ? ar
      : new Date().getFullYear();

  const mallIds = [
    ...new Set(projekt.valdaTyper.map(mallIdForRenoveringsTyp)),
  ] as RenoveringsMallId[];

  let tempFolders = [...apartment.folders];
  const nyaMappIds: number[] = [];
  const nyaMappar = mallIds.map((mallId) => {
    const namn = foreslagetMappNamn(mallId, tempFolders, arSafe);
    const mapp = skapaRenoveringsMapp(mallId, {
      namn: `${namn} (lgh ${projekt.lagenhetsnummer})`,
      ar: arSafe,
      skapad: projekt.skapad.slice(0, 10),
      planeratStart: projekt.planeratStart,
      planeratSlut: projekt.planeratSlut,
      renoveringsProjektId: projekt.id,
    });
    tempFolders = [mapp, ...tempFolders];
    nyaMappIds.push(mapp.id);
    return mapp;
  });

  const apartments = state.apartments.map((apt) => {
    if (apt.id !== projekt.apartmentId) return apt;
    return { ...apt, folders: [...nyaMappar, ...apt.folders] };
  });

  const sparat = sparaLagenhetsarkiv({ ...state, apartments });
  if (!sparat.ok) {
    return { ok: false, fel: "Kunde inte spara mapparna i lägenhetsarkivet." };
  }
  return { ok: true, mappIds: nyaMappIds };
}

export function sparaOmbyggnadsavtalDokumentIMapp(
  apartmentId: number,
  mappId: number,
  filnamn: string,
): boolean {
  const state = lasLagenhetsarkiv();
  if (!state) return false;
  const dokument: LagenhetsDokument = {
    id: skapaLagenhetsDokumentId(),
    filnamn,
    uppladdad: new Date().toISOString().slice(0, 10),
  };
  const apartments = state.apartments.map((apt) => {
    if (apt.id !== apartmentId) return apt;
    return {
      ...apt,
      folders: apt.folders.map((m) => {
        if (m.id !== mappId) return m;
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
        return { ...m, undermappar };
      }),
    };
  });
  return sparaLagenhetsarkiv({ ...state, apartments }).ok;
}
