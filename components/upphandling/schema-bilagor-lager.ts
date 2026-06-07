import type { SigneringRoll } from "@/components/rondering/signering";
import { kategoriId } from "@/components/upphandling/kategorier";
import {
  schemaFilnamnForDriftKategori,
  type DriftUpphandlingsKategori,
} from "@/components/rondering/drift-upphandling-koppling";
import { safeSetLocalStorage } from "@/lib/localStorage";
import { foreningStorageKey } from "@/lib/foreningStorage";

const SCHEMA_BILAGOR_BASE = "brf-upphandling-schema-bilagor";

export function schemaBilagorStorageKey(): string {
  return foreningStorageKey(SCHEMA_BILAGOR_BASE);
}

export type SparadSchemaBilaga = {
  kategoriKey: string;
  kategoriNamn: DriftUpphandlingsKategori;
  roll: SigneringRoll;
  filnamn: string;
  genereradTidpunkt: string;
  schemaText: string;
  villkorText: string;
};

export type SchemaBilagorLager = {
  bilagor: Record<string, SparadSchemaBilaga>;
};

function tomtLager(): SchemaBilagorLager {
  return { bilagor: {} };
}

export function lasSchemaBilagorLager(): SchemaBilagorLager {
  if (typeof window === "undefined") return tomtLager();
  try {
    const raw = localStorage.getItem(schemaBilagorStorageKey());
    if (!raw) return tomtLager();
    const parsed = JSON.parse(raw) as SchemaBilagorLager;
    if (!parsed.bilagor || typeof parsed.bilagor !== "object") return tomtLager();
    return parsed;
  } catch {
    return tomtLager();
  }
}

export function sparaSchemaBilagorLager(lager: SchemaBilagorLager): boolean {
  if (typeof window === "undefined") return false;
  const ok = safeSetLocalStorage(schemaBilagorStorageKey(), JSON.stringify(lager)).ok;
  if (ok) {
    window.dispatchEvent(new Event("upphandling-schema-bilagor-uppdaterad"));
  }
  return ok;
}

export function hamtaSchemaBilaga(
  kategoriNamn: DriftUpphandlingsKategori,
): SparadSchemaBilaga | undefined {
  const key = kategoriId(kategoriNamn);
  return lasSchemaBilagorLager().bilagor[key];
}

export function sparaSchemaBilaga(
  kategoriNamn: DriftUpphandlingsKategori,
  roll: SigneringRoll,
  schemaText: string,
  villkorText: string,
): SparadSchemaBilaga {
  const key = kategoriId(kategoriNamn);
  const bilaga: SparadSchemaBilaga = {
    kategoriKey: key,
    kategoriNamn,
    roll,
    filnamn: schemaFilnamnForDriftKategori(kategoriNamn),
    genereradTidpunkt: new Date().toISOString(),
    schemaText,
    villkorText,
  };
  const lager = lasSchemaBilagorLager();
  lager.bilagor[key] = bilaga;
  sparaSchemaBilagorLager(lager);
  return bilaga;
}

export function laddaNedBilaga(bilaga: SparadSchemaBilaga, del: "schema" | "villkor" | "komplett"): void {
  if (typeof window === "undefined") return;
  let text: string;
  let filnamn: string;
  if (del === "schema") {
    text = bilaga.schemaText;
    filnamn = bilaga.filnamn;
  } else if (del === "villkor") {
    text = bilaga.villkorText;
    filnamn = `Avtalsvillkor_drift_${bilaga.kategoriKey}.txt`;
  } else {
    text = `${bilaga.villkorText}\n\n${"=".repeat(60)}\n\n${bilaga.schemaText}`;
    filnamn = `Upphandling_${bilaga.kategoriKey}_komplett.txt`;
  }
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filnamn;
  a.click();
  URL.revokeObjectURL(url);
}
