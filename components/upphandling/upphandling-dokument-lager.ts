import {
  kategoriId,
  skapaDokumentId,
  standardDokumentPlatser,
  upphandlingsKategorier,
} from "@/components/upphandling/kategorier";
import { safeSetLocalStorage } from "@/lib/localStorage";
import { foreningStorageKey } from "@/lib/foreningStorage";
import { arDeladFil, type DeladFil } from "@/lib/forening-fil-lagring";

const UPPHANDLING_KATEGORI_DOKUMENT_BASE = "brf-upphandling-kategori-dokument";

export const UPPHANDLING_KATEGORI_DOKUMENT_EVENT =
  "upphandling-kategori-dokument-uppdaterad";

export function upphandlingKategoriDokumentStorageKey(): string {
  return foreningStorageKey(UPPHANDLING_KATEGORI_DOKUMENT_BASE);
}

export type DokumentRef = {
  filnamn: string;
  /** `portal` = hämtad från en annan modul i portalen. */
  källa: "upload" | "bank" | "foreningsdokument" | "portal";
  bankId?: string;
  foreningsDokumentId?: string;
  /** Själva filen; saknas för mallar och äldre uppladdningar där bara namnet sparades. */
  fil?: DeladFil;
  /** Var handlingen hämtades, t.ex. "Styrning och Dokument → Hiss → Bilder". */
  ursprung?: string;
  /** Id i portalens handlingslista, så samma handling inte kopplas två gånger. */
  portalId?: string;
};

function normaliseraRef(raw: unknown): DokumentRef | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Partial<DokumentRef>;
  if (typeof r.filnamn !== "string") return null;
  const källa =
    r.källa === "bank" || r.källa === "foreningsdokument" || r.källa === "portal"
      ? r.källa
      : "upload";
  return {
    filnamn: r.filnamn,
    källa,
    ...(r.bankId ? { bankId: r.bankId } : {}),
    ...(r.foreningsDokumentId ? { foreningsDokumentId: r.foreningsDokumentId } : {}),
    ...(arDeladFil(r.fil) ? { fil: r.fil } : {}),
    ...(typeof r.ursprung === "string" && r.ursprung ? { ursprung: r.ursprung } : {}),
    ...(typeof r.portalId === "string" && r.portalId ? { portalId: r.portalId } : {}),
  };
}

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
  const platser = { ...tom.platser };
  for (const [id, ref] of Object.entries(data.platser ?? {})) {
    platser[id] = normaliseraRef(ref);
  }
  return {
    öppen: Boolean(data.öppen),
    platser,
    extra: Array.isArray(data.extra)
      ? data.extra.map((rad) => ({
          id: rad.id ?? skapaDokumentId(),
          etikett: rad.etikett ?? "Kompletterande dokument",
          dokument: normaliseraRef(rad.dokument),
        }))
      : [],
  };
}

/** Alla handlingar med fil i upphandlingen, för att veta om en fil fortfarande används. */
export function upphandlingensFiler(): { postId: string; fil: DeladFil }[] {
  const ut: { postId: string; fil: DeladFil }[] = [];
  for (const [kategori, state] of Object.entries(lasUpphandlingKategoriDokument())) {
    for (const [platsId, ref] of Object.entries(state.platser)) {
      if (ref?.fil) ut.push({ postId: `upphandling:${kategori}:${platsId}`, fil: ref.fil });
    }
    for (const rad of state.extra) {
      if (rad.dokument?.fil) {
        ut.push({ postId: `upphandling:${kategori}:${rad.id}`, fil: rad.dokument.fil });
      }
    }
  }
  return ut;
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
