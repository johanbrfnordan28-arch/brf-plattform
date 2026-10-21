/**
 * Felanmälan i webbläsaren när databasen inte svarar.
 * På den publicerade sidan sparas ärendet i databasen i stället.
 */

import { foreningStorageKey } from "@/lib/foreningStorage";
import type {
  FelanmalanArendeDto,
  FelanmalanOrsak,
  FelanmalanPrioritet,
} from "@/lib/felanmalan/felanmalan-typer";

const BAS = "brf-felanmalan-lokal-v1";

export type NyLokalFelanmalan = {
  foreningId: string;
  rubrik: string;
  beskrivning: string;
  medlemNamn: string;
  medlemEpost: string;
  medlemTelefon?: string;
  lagenhetsnummer?: string;
  prioritet?: string;
  orsak?: string;
  debiteringKan?: boolean;
  debiteringAnteckning?: string;
  nyckelPlats?: string;
  boendeEjHemma?: boolean;
};

function lasLista(foreningId: string): FelanmalanArendeDto[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(foreningStorageKey(BAS, foreningId));
    if (!raw) return [];
    const data = JSON.parse(raw) as FelanmalanArendeDto[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function skrivLista(foreningId: string, lista: FelanmalanArendeDto[]) {
  localStorage.setItem(
    foreningStorageKey(BAS, foreningId),
    JSON.stringify(lista),
  );
}

export function listaLokalFelanmalan(foreningId: string): FelanmalanArendeDto[] {
  return lasLista(foreningId);
}

export function sparaLokalFelanmalan(
  foreningId: string,
  lista: FelanmalanArendeDto[],
) {
  skrivLista(foreningId, lista);
}

export function skapaLokalFelanmalan(
  opts: NyLokalFelanmalan,
): FelanmalanArendeDto {
  const lista = lasLista(opts.foreningId);
  const ar = new Date().getFullYear();
  const arendeNummer = `FM-${ar}-${String(lista.length + 1).padStart(4, "0")}`;
  const nu = new Date().toISOString();
  const prioritet = (opts.prioritet || "normal") as FelanmalanPrioritet;
  const orsak = (opts.orsak || "ovrigt") as FelanmalanOrsak;
  const arende: FelanmalanArendeDto = {
    id: `lokal-${Date.now()}`,
    foreningId: opts.foreningId,
    arendeNummer,
    status: "inkommen",
    prioritet,
    orsak,
    rubrik: opts.rubrik.trim(),
    beskrivning: opts.beskrivning.trim(),
    medlemNamn: opts.medlemNamn.trim(),
    medlemEpost: opts.medlemEpost.trim().toLowerCase(),
    medlemTelefon: opts.medlemTelefon?.trim() ?? "",
    lagenhetsnummer: opts.lagenhetsnummer?.trim() ?? "",
    debiteringKan: Boolean(opts.debiteringKan),
    debiteringAnteckning: opts.debiteringAnteckning?.trim() ?? "",
    nyckelPlats: opts.nyckelPlats?.trim() ?? "",
    boendeEjHemma: Boolean(opts.boendeEjHemma),
    tilldeladRoll: "forvaltare",
    vidareEpost: "",
    historik: [
      {
        tidpunkt: nu,
        av: opts.medlemNamn.trim() || "Medlem",
        text: "Felanmälan sparad i den här webbläsaren. Databasen svarade inte.",
      },
    ],
    skapadTidpunkt: nu,
    uppdateradTidpunkt: nu,
  };
  skrivLista(opts.foreningId, [arende, ...lista]);
  return arende;
}
