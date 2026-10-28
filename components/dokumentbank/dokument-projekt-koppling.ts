import type { DokumentMallOmrade } from "@/components/dokumentbank/mallar";
import {
  lasForeningsDokument,
  sparaForeningsDokument,
  tomDokumentEntreprenor,
  type DokumentEntreprenor,
  type ForeningsDokument,
} from "@/components/dokumentbank/forening-dokumenter-lager";
import type { DokumentRef } from "@/components/upphandling/upphandling-dokument-lager";
import {
  normaliseraProjekt,
  projektStorageKey,
  skapaDokumentId,
  type Projekt,
  type ProjektDokument,
  type StandardUndermappId,
} from "@/components/projekt/projekt";
import { safeSetLocalStorage } from "@/lib/localStorage";

export function lasProjektLista(): Projekt[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(projektStorageKey());
    return raw
      ? (JSON.parse(raw) as Projekt[]).map((p) => normaliseraProjekt(p))
      : [];
  } catch {
    return [];
  }
}

export function sparaProjektLista(lista: Projekt[]): boolean {
  if (typeof window === "undefined") return false;
  return safeSetLocalStorage(projektStorageKey(), JSON.stringify(lista)).ok;
}

export function foreslagenMappForOmrade(
  omrade: string,
): StandardUndermappId {
  switch (omrade as DokumentMallOmrade) {
    case "avtal":
      return "kontrakt";
    case "upphandling":
      return "underlag";
    case "juridik":
      return "underlag";
    case "styrelse":
      return "byggmotesprotokoll";
    default:
      return "underlag";
  }
}

export function projektDokumentFranForeningsDokument(
  fdok: ForeningsDokument,
): ProjektDokument {
  return {
    id: skapaDokumentId(),
    filnamn: fdok.titel.endsWith(".txt")
      ? fdok.titel
      : `${fdok.titel.replace(/\s+/g, "_")}.txt`,
    uppladdad: new Date().toLocaleDateString("sv-SE"),
    kalla: "foreningsdokument",
    foreningsDokumentId: fdok.id,
    bankId: fdok.mallId,
  };
}

export function projektDokumentFranBank(
  bankId: string,
  filnamn: string,
  titel: string,
): ProjektDokument {
  return {
    id: skapaDokumentId(),
    filnamn: filnamn || `${titel.replace(/\s+/g, "_")}.txt`,
    uppladdad: new Date().toLocaleDateString("sv-SE"),
    kalla: "bank",
    bankId,
  };
}

export function dokumentRefFranForeningsDokument(
  fdok: ForeningsDokument,
): DokumentRef {
  return {
    filnamn: fdok.mallFilnamn || `${fdok.titel}.txt`,
    källa: "foreningsdokument",
    bankId: fdok.mallId,
    foreningsDokumentId: fdok.id,
  };
}

export function dokumentRefFranProjektDokument(
  dok: ProjektDokument,
): DokumentRef | null {
  if (dok.kalla === "foreningsdokument" && dok.foreningsDokumentId) {
    return {
      filnamn: dok.filnamn,
      källa: "foreningsdokument",
      foreningsDokumentId: dok.foreningsDokumentId,
      bankId: dok.bankId,
    };
  }
  if (dok.kalla === "bank" && dok.bankId) {
    return {
      filnamn: dok.filnamn,
      källa: "bank",
      bankId: dok.bankId,
    };
  }
  return null;
}

function entreprenorFranProjekt(p: Projekt): DokumentEntreprenor | undefined {
  if (!p.entreprenorNamn?.trim()) return undefined;
  return {
    namn: p.entreprenorNamn.trim(),
    orgNr: p.entreprenorOrgNr?.trim() ?? "",
    kontakt: p.entreprenorKontakt?.trim() ?? "",
    epost: p.entreprenorEpost?.trim() ?? "",
  };
}

export function laggForeningsDokumentIProjekt(
  projektId: string,
  mappId: string,
  fdok: ForeningsDokument,
): { ok: true } | { ok: false; fel: string } {
  const lista = lasProjektLista();
  const index = lista.findIndex((p) => p.id === projektId);
  if (index < 0) return { ok: false, fel: "Projektet hittades inte." };
  const p = lista[index];
  const mapp = p.mappar[mappId];
  if (!mapp) return { ok: false, fel: "Mappen finns inte i projektet." };

  const franProjekt = entreprenorFranProjekt(p);
  const fdokMedEntreprenor: ForeningsDokument = franProjekt
    ? { ...fdok, entreprenor: franProjekt }
    : fdok;

  const projDok = projektDokumentFranForeningsDokument(fdokMedEntreprenor);
  const fdState = lasForeningsDokument();
  const befintligt = fdState.dokument.find((d) => d.id === fdok.id);
  const kopplade = [...(befintligt?.koppladeProjektId ?? fdok.koppladeProjektId ?? [])];
  if (!kopplade.includes(projektId)) kopplade.push(projektId);
  const entreprenor = franProjekt ?? befintligt?.entreprenor ?? fdok.entreprenor ?? tomDokumentEntreprenor();

  lista[index] = normaliseraProjekt({
    ...p,
    mappar: {
      ...p.mappar,
      [mappId]: {
        ...mapp,
        öppen: true,
        dokument: [...mapp.dokument, projDok],
      },
    },
  });

  if (!sparaProjektLista(lista)) {
    return { ok: false, fel: "Kunde inte spara projektet." };
  }

  sparaForeningsDokument({
    ...fdState,
    dokument: fdState.dokument.map((d) =>
      d.id === fdok.id
        ? { ...d, koppladeProjektId: kopplade, entreprenor }
        : d,
    ),
  });

  return { ok: true };
}

export type ProjektDokumentRef = {
  projektId: string;
  projektTitel: string;
  mappId: string;
  mappTitel: string;
  dokument: ProjektDokument;
};

/** Alla bank-/dokumentbank-kopior i projekten — för import till upphandling. */
export function listaImporterbaraProjektDokument(): ProjektDokumentRef[] {
  const ut: ProjektDokumentRef[] = [];
  for (const p of lasProjektLista()) {
    for (const def of p.mappDefinitioner) {
      const mapp = p.mappar[def.id];
      if (!mapp) continue;
      for (const dok of mapp.dokument) {
        if (dok.kalla === "bank" || dok.kalla === "foreningsdokument") {
          ut.push({
            projektId: p.id,
            projektTitel: p.titel,
            mappId: def.id,
            mappTitel: def.titel,
            dokument: dok,
          });
        }
      }
    }
  }
  return ut;
}
