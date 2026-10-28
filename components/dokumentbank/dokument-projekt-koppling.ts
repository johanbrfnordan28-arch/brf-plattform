import { hamtaMall, type DokumentMallOmrade } from "@/components/dokumentbank/mallar";
import {
  arEgenkontrollDokument,
  skapaForeningsDokumentEgenkontroll,
} from "@/components/dokumentbank/forening-dokument-egenkontroll";
import { arEgenkontrollMallId } from "@/components/dokumentbank/mallar/egenkontroll-mallar";
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
    case "egenkontroll":
      return "egenkontroller-in";
    default:
      return "underlag";
  }
}

export function arEgenkontrollProjektMapp(mappId: string): boolean {
  return mappId === "egenkontroller-in" || mappId === "egenkontroller-signerad";
}

function titelFranProjektDokument(dok: ProjektDokument): string {
  const base = dok.filnamn.replace(/\.(txt|pdf)$/i, "").replace(/_/g, " ");
  return base.trim() || "Egenkontroll VVS";
}

/** Skapar föreningens egenkontrolldokument vid behov och kopplar till projektmappen. */
export function skapaOchLaggEgenkontrollIProjekt(
  projektId: string,
  mappId: string,
  opts: {
    titel: string;
    mallId?: string;
    befintligForeningsDokumentId?: string;
    entreprenorNamn?: string;
  },
): { ok: true; projDok: ProjektDokument } | { ok: false; fel: string } {
  const lista = lasProjektLista();
  const projekt = lista.find((p) => p.id === projektId);
  if (!projekt) return { ok: false, fel: "Projektet hittades inte." };

  const entreprenorNamn =
    opts.entreprenorNamn?.trim() ||
    projekt.entreprenorNamn?.trim() ||
    "";

  if (opts.befintligForeningsDokumentId) {
    const fd = lasForeningsDokument().dokument.find(
      (d) => d.id === opts.befintligForeningsDokumentId,
    );
    if (!fd || !arEgenkontrollDokument(fd)) {
      return { ok: false, fel: "Egenkontrolldokumentet hittades inte." };
    }
    const result = laggForeningsDokumentIProjekt(projektId, mappId, fd);
    if (!result.ok) return result;
    const mapp = lasProjektLista().find((p) => p.id === projektId)?.mappar[
      mappId
    ];
    const projDok = mapp?.dokument.find(
      (d) => d.foreningsDokumentId === fd.id,
    );
    if (!projDok) return { ok: false, fel: "Kunde inte läsa projektets dokument." };
    return { ok: true, projDok };
  }

  const mallId = opts.mallId ?? "";
  if (!arEgenkontrollMallId(mallId)) {
    return { ok: false, fel: "Ogiltig egenkontrollmall." };
  }
  const mall = hamtaMall(mallId);
  if (!mall) return { ok: false, fel: "Mallen hittades inte." };

  const fdok = skapaForeningsDokumentEgenkontroll(mall, {
    docTitel: opts.titel.trim() || mall.titel,
    koppladeProjektId: [projektId],
    egenkontrollInput: {
      huvudentreprenorNamn: entreprenorNamn,
      huvudArbetsledareNamn: "",
      underentreprenorNamn: "",
      underArbetsledareNamn: "",
      utforareNamn: [],
    },
  });

  const fdState = lasForeningsDokument();
  sparaForeningsDokument({
    ...fdState,
    dokument: [fdok, ...fdState.dokument],
  });

  const result = laggForeningsDokumentIProjekt(projektId, mappId, fdok);
  if (!result.ok) return result;

  const uppdaterad = lasProjektLista().find((p) => p.id === projektId);
  const mapp = uppdaterad?.mappar[mappId];
  const projDok = mapp?.dokument.find(
    (d) => d.foreningsDokumentId === fdok.id,
  );
  if (!projDok) return { ok: false, fel: "Kunde inte läsa projektets dokument." };
  return { ok: true, projDok };
}

export function importeraDokumentTillProjekt(
  projektId: string,
  mappId: string,
  dokument: ProjektDokument,
): { ok: true; projDok: ProjektDokument } | { ok: false; fel: string } {
  if (
    dokument.kalla === "foreningsdokument" &&
    dokument.foreningsDokumentId
  ) {
    const fd = lasForeningsDokument().dokument.find(
      (d) => d.id === dokument.foreningsDokumentId,
    );
    if (!fd) return { ok: false, fel: "Dokumentet hittades inte." };
    if (arEgenkontrollDokument(fd)) {
      return skapaOchLaggEgenkontrollIProjekt(projektId, mappId, {
        titel: fd.titel,
        befintligForeningsDokumentId: fd.id,
      });
    }
    const result = laggForeningsDokumentIProjekt(projektId, mappId, fd);
    if (!result.ok) return result;
    const mapp = lasProjektLista().find((p) => p.id === projektId)?.mappar[
      mappId
    ];
    const projDok = mapp?.dokument[mapp.dokument.length - 1];
    if (!projDok) return { ok: false, fel: "Kunde inte läsa projektets dokument." };
    return { ok: true, projDok };
  }

  if (dokument.kalla === "bank" && dokument.bankId) {
    if (arEgenkontrollMallId(dokument.bankId)) {
      return skapaOchLaggEgenkontrollIProjekt(projektId, mappId, {
        titel: titelFranProjektDokument(dokument),
        mallId: dokument.bankId,
      });
    }
  }

  return { ok: false, fel: "Importera via projektmodulen för övriga filer." };
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
