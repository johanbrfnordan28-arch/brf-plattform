import {
  kategoriId,
  skapaDokumentId,
  standardDokumentPlatser,
  upphandlingsKategorier,
} from "@/components/upphandling/kategorier";
import { safeSetLocalStorage } from "@/lib/localStorage";
import { foreningStorageKey } from "@/lib/foreningStorage";

const UPPHANDLING_KATEGORI_DOKUMENT_BASE = "brf-upphandling-kategori-dokument";

export const UPPHANDLING_KATEGORI_DOKUMENT_EVENT =
  "upphandling-kategori-dokument-uppdaterad";

export function upphandlingKategoriDokumentStorageKey(): string {
  return foreningStorageKey(UPPHANDLING_KATEGORI_DOKUMENT_BASE);
}

export type DokumentRef = {
  filnamn: string;
  källa: "upload" | "bank";
  bankId?: string;
};

export type KategoriDokumentState = {
  öppen: boolean;
  platser: Record<string, DokumentRef | null>;
  extra: { id: string; etikett: string; dokument: DokumentRef | null }[];
};

export function skapaTomKategoriDokument(): KategoriDokumentState {
  const platser = Object.fromEntries(
    standardDokumentPlatser.map((plats) => [plats.id, null]),
  ) as Record<string, DokumentRef | null>;
  return { öppen: false, platser, extra: [] };
}

export function skapaTommaKategoriDokument(): Record<string, KategoriDokumentState> {
  return Object.fromEntries(
    upphandlingsKategorier.map((namn) => [
      kategoriId(namn),
      skapaTomKategoriDokument(),
    ]),
  );
}

function normaliseraKategori(raw: unknown): KategoriDokumentState {
  const tom = skapaTomKategoriDokument();
  if (!raw || typeof raw !== "object") return tom;
  const data = raw as Partial<KategoriDokumentState>;
  return {
    öppen: Boolean(data.öppen),
    platser: { ...tom.platser, ...(data.platser ?? {}) },
    extra: Array.isArray(data.extra)
      ? data.extra.map((rad) => ({
          id: rad.id ?? skapaDokumentId(),
          etikett: rad.etikett ?? "Kompletterande dokument",
          dokument: rad.dokument ?? null,
        }))
      : [],
  };
}

export function lasUpphandlingKategoriDokument(): Record<
  string,
  KategoriDokumentState
> {
  if (typeof window === "undefined") return skapaTommaKategoriDokument();
  try {
    const raw = localStorage.getItem(upphandlingKategoriDokumentStorageKey());
    if (!raw) return skapaTommaKategoriDokument();
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const tomma = skapaTommaKategoriDokument();
    for (const key of Object.keys(tomma)) {
      tomma[key] = normaliseraKategori(parsed[key]);
    }
    return tomma;
  } catch {
    return skapaTommaKategoriDokument();
  }
}

export function sparaUpphandlingKategoriDokument(
  kategorier: Record<string, KategoriDokumentState>,
): boolean {
  if (typeof window === "undefined") return false;
  const ok = safeSetLocalStorage(
    upphandlingKategoriDokumentStorageKey(),
    JSON.stringify(kategorier),
  ).ok;
  if (ok) {
    window.dispatchEvent(new Event(UPPHANDLING_KATEGORI_DOKUMENT_EVENT));
  }
  return ok;
}
