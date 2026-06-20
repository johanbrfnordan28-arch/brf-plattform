import { GRUNDMALL_FORENING_ID, arStandardTestForening } from "@/lib/forening-konstanter";
import {
  cookieHamtaAktivForeningId,
  cookieHamtaSenastProfil,
  cookieSattAktivForeningId,
  cookieSattSenastProfil,
} from "@/lib/forening-lagring";
import { forberedNyForening } from "@/lib/kopiera-grundmall-data";
import {
  localStorageFelMeddelande,
  safeSetLocalStorage,
} from "@/lib/localStorage";

export const FORENING_REGISTRY_KEY = "brf-forening-registry";
export const FORENING_AKTIV_ID_KEY = "brf-forening-aktiv-id";
export const FORENING_PROFIL_BASE_KEY = "brf-forening-profil";
export const FORENING_AKTIV_EVENT = "forening-aktiv-bytt";

/** Reserv om localStorage blockeras tillfälligt (t.ex. Safari). */
const SESSION_AKTIV_ID_KEY = "brf-forening-aktiv-id-session";

/** Sätts precis före sidbyte — läses av hamtaAktivForeningId på målsidan. */
export const PENDING_AKTIV_FORENING_KEY = "brf-pending-aktiv-forening-id";

/** Backup om registry inte hinner synkas vid sidbyte (Safari). */
export const SENAST_SKAPAD_PROFIL_KEY = "brf-senast-skapat-profil";

/** Välkomstbanner efter skapande — överlever URL-rensning. */
export const NYSS_SKAPAD_FLAG_KEY = "brf-nyss-skapad-forening-id";

export { GRUNDMALL_FORENING_ID } from "@/lib/forening-konstanter";

/** Befintlig demo — oförändrade localStorage-nycklar utan prefix. */
export const GRUNDMALL_NAMN = "Grundmall föreningar";

export type ForeningProfil = {
  id: string;
  namn: string;
  skapadTidpunkt: string;
  organisationsnummer: string;
  epost: string;
  postadress: string;
  ort: string;
  kontaktperson: string;
  /** Styrelsen har börjat fylla grunduppgifter (underhållsplan eller här). */
  grundinfoPaborjad: boolean;
};

type ForeningRegistry = {
  version: 1;
  poster: ForeningProfil[];
};

function profilStorageKey(foreningId: string): string {
  if (foreningId === GRUNDMALL_FORENING_ID) return FORENING_PROFIL_BASE_KEY;
  return `brf-f-${foreningId}--${FORENING_PROFIL_BASE_KEY}`;
}

function tomtRegistry(): ForeningRegistry {
  return { version: 1, poster: [] };
}

function normaliseraRegistry(raw: unknown): ForeningRegistry {
  if (!raw || typeof raw !== "object") return tomtRegistry();
  const o = raw as ForeningRegistry;
  if (!Array.isArray(o.poster)) return tomtRegistry();
  return {
    version: 1,
    poster: o.poster.filter(
      (p): p is ForeningProfil =>
        typeof p === "object" &&
        p != null &&
        typeof p.id === "string" &&
        typeof p.namn === "string",
    ),
  };
}

const PROFIL_NYCKEL_SUFFIX = `--${FORENING_PROFIL_BASE_KEY}`;

/** Jämför föreningsnamn utan skilj på versaler och extra mellanslag. */
export function normaliseraForeningsNamn(namn: string): string {
  return namn
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

export function finnForeningMedNamn(namn: string): ForeningProfil | null {
  const nyckel = normaliseraForeningsNamn(namn);
  if (!nyckel) return null;
  for (const post of lasForeningRegistryInternt().poster) {
    if (post.id === GRUNDMALL_FORENING_ID) continue;
    if (normaliseraForeningsNamn(post.namn) === nyckel) return post;
  }
  return null;
}

function profilFullhet(profil: ForeningProfil): number {
  let poang = profil.grundinfoPaborjad ? 20 : 0;
  if (profil.organisationsnummer.trim()) poang += 2;
  if (profil.epost.trim()) poang += 2;
  if (profil.postadress.trim()) poang += 1;
  if (profil.ort.trim()) poang += 1;
  if (profil.kontaktperson.trim()) poang += 1;
  return poang;
}

function valjBastaForening(
  poster: ForeningProfil[],
  aktivId?: string,
): ForeningProfil {
  const aktiv = aktivId ? poster.find((p) => p.id === aktivId) : undefined;
  if (aktiv) return aktiv;

  return poster.reduce((basta, kandidat) => {
    const skillnad = profilFullhet(kandidat) - profilFullhet(basta);
    if (skillnad !== 0) return skillnad > 0 ? kandidat : basta;
    return new Date(kandidat.skapadTidpunkt).getTime() <
      new Date(basta.skapadTidpunkt).getTime()
      ? kandidat
      : basta;
  });
}

function taBortForeningFranLagring(foreningId: string): void {
  if (typeof window === "undefined" || !foreningId) return;
  const prefix = `brf-f-${foreningId}--`;
  const nycklar: string[] = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (key?.startsWith(prefix)) nycklar.push(key);
  }
  for (const key of nycklar) {
    localStorage.removeItem(key);
  }
}

/** Tar bort all föreningspecifik data i localStorage (moduler, profil m.m.). */
export function rensaForeningLocalStorage(foreningId: string): void {
  taBortForeningFranLagring(foreningId);
}

/**
 * Behåller en förening per namn — tar bort dubbletter från registret och lagring.
 */
export function rengoraDubblettForeningar(): boolean {
  if (typeof window === "undefined") return false;

  const registry = lasForeningRegistryInternt();
  const grupper = new Map<string, ForeningProfil[]>();
  const utanNamn: ForeningProfil[] = [];
  const standardTest: ForeningProfil[] = [];

  for (const post of registry.poster) {
    if (post.id === GRUNDMALL_FORENING_ID) continue;
    if (arStandardTestForening(post.id)) {
      standardTest.push(post);
      continue;
    }
    const nyckel = normaliseraForeningsNamn(post.namn);
    if (!nyckel) {
      utanNamn.push(post);
      continue;
    }
    const lista = grupper.get(nyckel) ?? [];
    lista.push(post);
    grupper.set(nyckel, lista);
  }

  const aktivId = hamtaAktivForeningId();
  const nyaPoster: ForeningProfil[] = [...standardTest, ...utanNamn];
  const borttagna: string[] = [];

  for (const poster of grupper.values()) {
    const basta = valjBastaForening(poster, aktivId);
    nyaPoster.push(basta);
    for (const post of poster) {
      if (post.id !== basta.id) borttagna.push(post.id);
    }
  }

  if (borttagna.length === 0) return false;

  const aktivNamn =
    borttagna.includes(aktivId)
      ? registry.poster.find((p) => p.id === aktivId)?.namn
      : null;

  registry.poster = nyaPoster;

  for (const id of borttagna) {
    taBortForeningFranLagring(id);
  }

  try {
    sparaRegistry(registry);
  } catch {
    return false;
  }

  if (aktivNamn) {
    const kvar = nyaPoster.find(
      (p) =>
        normaliseraForeningsNamn(p.namn) === normaliseraForeningsNamn(aktivNamn),
    );
    if (kvar) {
      sattAktivForeningId(kvar.id, { tyst: true });
    }
  }

  window.dispatchEvent(new Event(FORENING_AKTIV_EVENT));
  return true;
}

function lasForeningRegistryInternt(): ForeningRegistry {
  if (typeof window === "undefined") return tomtRegistry();
  try {
    const raw = localStorage.getItem(FORENING_REGISTRY_KEY);
    return raw ? normaliseraRegistry(JSON.parse(raw)) : tomtRegistry();
  } catch {
    return tomtRegistry();
  }
}

export function lasForeningRegistry(): ForeningRegistry {
  return lasForeningRegistryInternt();
}

/**
 * Hittar föreningar som finns som profilnycklar men saknas i registret
 * (t.ex. efter avbrutet skapande eller full localStorage).
 */
export function repareraForeningRegistry(): boolean {
  if (typeof window === "undefined") return false;
  const registry = lasForeningRegistryInternt();
  const ids = new Set(registry.poster.map((p) => p.id));
  let andrat = false;

  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (!key?.startsWith("brf-f-") || !key.endsWith(PROFIL_NYCKEL_SUFFIX)) continue;
    const id = key.slice("brf-f-".length, key.length - PROFIL_NYCKEL_SUFFIX.length);
    if (!id || id === GRUNDMALL_FORENING_ID || ids.has(id)) continue;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const profil = JSON.parse(raw) as ForeningProfil;
      if (typeof profil.namn !== "string" || !profil.namn.trim()) continue;
      registry.poster.push({ ...profil, id });
      ids.add(id);
      andrat = true;
    } catch {
      /* hoppa över trasig post */
    }
  }

  if (andrat) {
    try {
      sparaRegistry(registry);
    } catch {
      return false;
    }
  }

  return andrat || rengoraDubblettForeningar();
}

function sparaRegistry(registry: ForeningRegistry): void {
  if (typeof window === "undefined") {
    throw new Error(localStorageFelMeddelande("unavailable"));
  }
  const result = safeSetLocalStorage(
    FORENING_REGISTRY_KEY,
    JSON.stringify(registry),
  );
  if (!result.ok) {
    throw new Error(localStorageFelMeddelande(result.error));
  }
}

export function skapaForeningIdFranNamn(namn: string): string {
  const slug = namn
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  const bas = slug || "forening";
  const registry = lasForeningRegistry();
  let id = bas;
  let n = 2;
  while (registry.poster.some((p) => p.id === id)) {
    id = `${bas}-${n}`;
    n += 1;
  }
  return id;
}

function sparaAktivIdILagring(id: string): void {
  const result = safeSetLocalStorage(FORENING_AKTIV_ID_KEY, id);
  if (!result.ok) {
    try {
      localStorage.setItem(FORENING_AKTIV_ID_KEY, id);
    } catch {
      /* cookie/URL kan fortfarande rädda flödet */
    }
  }
  try {
    sessionStorage.setItem(SESSION_AKTIV_ID_KEY, id);
  } catch {
    /* ignore */
  }
  cookieSattAktivForeningId(id);
}

function hamtaForeningIdFranUrl(): string | null {
  if (typeof window === "undefined") return null;
  const id = new URLSearchParams(window.location.search).get("foreningId");
  if (!id || id === GRUNDMALL_FORENING_ID) return null;
  return id;
}

function hamtaPendingForeningId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const id = sessionStorage.getItem(PENDING_AKTIV_FORENING_KEY);
    if (!id || id === GRUNDMALL_FORENING_ID) return null;
    return id;
  } catch {
    return null;
  }
}

function tillampaAktivForeningIdOmSkiljer(id: string): void {
  const nu =
    localStorage.getItem(FORENING_AKTIV_ID_KEY) ||
    sessionStorage.getItem(SESSION_AKTIV_ID_KEY);
  if (nu !== id) sparaAktivIdILagring(id);
}

/** Läser aktiv id utan att skriva till lagring (säker i React getSnapshot). */
export function lasAktivForeningId(): string {
  if (typeof window === "undefined") return GRUNDMALL_FORENING_ID;
  const pending = hamtaPendingForeningId();
  if (pending) return pending;
  return (
    localStorage.getItem(FORENING_AKTIV_ID_KEY) ||
    sessionStorage.getItem(SESSION_AKTIV_ID_KEY) ||
    cookieHamtaAktivForeningId() ||
    GRUNDMALL_FORENING_ID
  );
}

export function hamtaAktivForeningId(): string {
  if (typeof window === "undefined") return GRUNDMALL_FORENING_ID;

  const franUrl = hamtaForeningIdFranUrl();
  if (franUrl) {
    tillampaAktivForeningIdOmSkiljer(franUrl);
    return franUrl;
  }

  const pending = hamtaPendingForeningId();
  if (pending) {
    tillampaAktivForeningIdOmSkiljer(pending);
    try {
      sessionStorage.removeItem(PENDING_AKTIV_FORENING_KEY);
    } catch {
      /* ignore */
    }
    return pending;
  }

  return lasAktivForeningId();
}

export function markeraNyssSkapadForening(id: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(NYSS_SKAPAD_FLAG_KEY, id);
  } catch {
    /* ignore */
  }
}

export function arNyssSkapadForening(foreningId?: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const id = sessionStorage.getItem(NYSS_SKAPAD_FLAG_KEY);
    if (!id) return false;
    return foreningId ? id === foreningId : id === lasAktivForeningId();
  } catch {
    return false;
  }
}

export function rensaNyssSkapadMarkering(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(NYSS_SKAPAD_FLAG_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Enda stället som bootstrapar förening vid sidladdning (utom inline-skript).
 * Anropas från ForeningAktivator.
 */
export function aktiveraForeningVidSidladdning(): ForeningProfil | null {
  if (typeof window === "undefined") return null;

  repareraForeningRegistry();
  synkaAktivForeningFranUrl();
  const profil =
    aterstallForeningFranSenastSkapad() ?? bootstrapForeningFranUrl();

  const params = new URLSearchParams(window.location.search);
  const id = profil?.id ?? hamtaAktivForeningId();

  if (params.get("ny") === "1" && id && id !== GRUNDMALL_FORENING_ID) {
    markeraNyssSkapadForening(id);
    kopieraGrundmallOmNyForening(id);
  }

  return profil;
}

function tomProfil(id: string, namn: string): ForeningProfil {
  return {
    id,
    namn,
    skapadTidpunkt: new Date().toISOString(),
    organisationsnummer: "",
    epost: "",
    postadress: "",
    ort: "",
    kontaktperson: "",
    grundinfoPaborjad: false,
  };
}

/**
 * Skapar/aktiverar förening från URL (foreningId + namn) — fungerar även när
 * localStorage inte hann spara mellan sidor (Safari).
 */
export function bootstrapForeningFranUrl(): ForeningProfil | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const id = params.get("foreningId");
  const namn = params.get("namn");
  if (!id || id === GRUNDMALL_FORENING_ID || !namn?.trim()) return null;

  repareraForeningRegistry();
  const trimmatNamn = namn.trim();
  const medSammaNamn = finnForeningMedNamn(trimmatNamn);
  if (medSammaNamn) {
    sattAktivForeningId(medSammaNamn.id, { tyst: true });
    return medSammaNamn;
  }

  const befintlig = lasForeningProfil(id);
  if (
    befintlig &&
    befintlig.id !== GRUNDMALL_FORENING_ID &&
    normaliseraForeningsNamn(befintlig.namn) ===
      normaliseraForeningsNamn(trimmatNamn)
  ) {
    tillampaAktivForeningIdOmSkiljer(id);
    return befintlig;
  }

  const profil =
    befintlig && befintlig.id !== GRUNDMALL_FORENING_ID
      ? { ...befintlig, namn: trimmatNamn }
      : tomProfil(id, trimmatNamn);

  try {
    sparaForeningProfil(profil, { tyst: true });
    sattAktivForeningId(id, { tyst: true });
  } catch {
    tillampaAktivForeningIdOmSkiljer(id);
    cookieSattAktivForeningId(id);
    sparaSenastSkapadProfil(profil);
  }
  return profil;
}

/** Vid omladdning efter skapande — URL-param har företräde (Safari). */
export function synkaAktivForeningFranUrl(): string | null {
  const id = hamtaForeningIdFranUrl();
  if (!id) return null;
  tillampaAktivForeningIdOmSkiljer(id);
  return id;
}

export function markeraPendingAktivForening(id: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(PENDING_AKTIV_FORENING_KEY, id);
  } catch {
    /* ignore */
  }
  tillampaAktivForeningIdOmSkiljer(id);
}

export function sattAktivForeningId(id: string, val?: { tyst?: boolean }): void {
  if (typeof window === "undefined") {
    throw new Error(localStorageFelMeddelande("unavailable"));
  }
  sparaAktivIdILagring(id);
  const profil = lasForeningProfil(id);
  if (profil) {
    cookieSattSenastProfil(JSON.stringify(profil));
  }
  if (!val?.tyst) {
    window.dispatchEvent(new Event(FORENING_AKTIV_EVENT));
  }
}

/** Efter skapande — kontrollera att föreningen finns i registret. */
export function bekraftaAttForeningArSparad(foreningId: string): boolean {
  if (typeof window === "undefined") return false;
  return lasForeningRegistry().poster.some((p) => p.id === foreningId);
}

export function sparaSenastSkapadProfil(profil: ForeningProfil): void {
  if (typeof window === "undefined") return;
  const json = JSON.stringify(profil);
  try {
    sessionStorage.setItem(SENAST_SKAPAD_PROFIL_KEY, json);
  } catch {
    /* ignore */
  }
  cookieSattSenastProfil(json);
}

/** Återställ profil från session om URL har foreningId men registry saknar post. */
export function aterstallForeningFranSenastSkapad(
  foreningId?: string,
): ForeningProfil | null {
  if (typeof window === "undefined") return null;
  const id =
    foreningId ??
    hamtaForeningIdFranUrl() ??
    hamtaPendingForeningId() ??
    undefined;
  if (!id || id === GRUNDMALL_FORENING_ID) return null;

  const befintlig = lasForeningProfil(id);
  if (befintlig && befintlig.id !== GRUNDMALL_FORENING_ID) {
    return befintlig;
  }

  try {
    const raw =
      sessionStorage.getItem(SENAST_SKAPAD_PROFIL_KEY) ||
      cookieHamtaSenastProfil();
    if (!raw) return bootstrapForeningFranUrl();
    const profil = JSON.parse(raw) as ForeningProfil;
    if (profil.id !== id) return bootstrapForeningFranUrl();
    try {
      sparaForeningProfil(profil, { tyst: true });
      sattAktivForeningId(id, { tyst: true });
    } catch {
      tillampaAktivForeningIdOmSkiljer(id);
      cookieSattAktivForeningId(id);
      cookieSattSenastProfil(JSON.stringify(profil));
    }
    return profil;
  } catch {
    return bootstrapForeningFranUrl();
  }
}

export function webblasarenKanSparaIData(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const test = "__brf-lagring-test__";
    localStorage.setItem(test, "1");
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

export function lasForeningProfil(foreningId?: string): ForeningProfil | null {
  const id = foreningId ?? hamtaAktivForeningId();
  if (id === GRUNDMALL_FORENING_ID) {
    return {
      id: GRUNDMALL_FORENING_ID,
      namn: GRUNDMALL_NAMN,
      skapadTidpunkt: "",
      organisationsnummer: "",
      epost: "",
      postadress: "",
      ort: "",
      kontaktperson: "",
      grundinfoPaborjad: true,
    };
  }
  const key = profilStorageKey(id);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      const reg = lasForeningRegistry();
      const post = reg.poster.find((p) => p.id === id);
      return post ?? null;
    }
    return JSON.parse(raw) as ForeningProfil;
  } catch {
    return null;
  }
}

export function sparaForeningProfil(
  profil: ForeningProfil,
  val?: { tyst?: boolean },
): void {
  const registry = lasForeningRegistry();
  const idx = registry.poster.findIndex((p) => p.id === profil.id);
  if (idx >= 0) registry.poster[idx] = profil;
  else registry.poster.push(profil);
  sparaRegistry(registry);

  const key = profilStorageKey(profil.id);
  const result = safeSetLocalStorage(key, JSON.stringify(profil));
  if (!result.ok) {
    throw new Error(localStorageFelMeddelande(result.error));
  }
  if (!val?.tyst) {
    window.dispatchEvent(new Event(FORENING_AKTIV_EVENT));
  }
}

export function hamtaAktivForeningsNamn(): string {
  if (typeof window !== "undefined") {
    const urlNamn = new URLSearchParams(window.location.search)
      .get("namn")
      ?.trim();
    if (urlNamn) return urlNamn;
  }
  const profil = lasForeningProfil(lasAktivForeningId());
  if (profil && !arGrundmallForening(profil.id)) return profil.namn;
  return GRUNDMALL_NAMN;
}

export function arGrundmallForening(id?: string): boolean {
  return (id ?? hamtaAktivForeningId()) === GRUNDMALL_FORENING_ID;
}

export function skapaNyForening(namn: string): ForeningProfil {
  const trimmat = namn.trim();
  if (!trimmat) {
    throw new Error("Ange ett namn på föreningen.");
  }

  repareraForeningRegistry();

  const befintlig = finnForeningMedNamn(trimmat);
  if (befintlig) {
    throw new Error(
      `Föreningen «${befintlig.namn}» finns redan. Välj den i listan uppe till höger i stället för att skapa en ny.`,
    );
  }

  if (!webblasarenKanSparaIData()) {
    throw new Error(localStorageFelMeddelande("unavailable"));
  }

  const id = skapaForeningIdFranNamn(trimmat);
  const profil = tomProfil(id, trimmat);

  sparaSenastSkapadProfil(profil);
  markeraPendingAktivForening(id);
  markeraNyssSkapadForening(id);

  sparaForeningProfil(profil, { tyst: true });
  sattAktivForeningId(id, { tyst: true });
  window.dispatchEvent(new Event(FORENING_AKTIV_EVENT));

  if (!bekraftaAttForeningArSparad(id)) {
    repareraForeningRegistry();
    if (!bekraftaAttForeningArSparad(id)) {
      throw new Error(
        "Föreningen kunde inte sparas i webbläsaren. Rensa gammal webbplatsdata (Safari/Edge: Inställningar → Integritet) och försök igen.",
      );
    }
  }

  return profil;
}

/** Körs på föreningssidan efter skapande — minimal start, fyll i vartefter. */
export function kopieraGrundmallOmNyForening(foreningId: string): void {
  if (typeof window === "undefined") return;
  if (!foreningId || foreningId === GRUNDMALL_FORENING_ID) return;
  try {
    forberedNyForening(foreningId);
  } catch {
    /* ignore */
  }
}

export function listaForeningar(): ForeningProfil[] {
  return lasForeningRegistry().poster;
}

/**
 * Tar permanent bort en förening — raderar all dess data och uppdaterar
 * registret. Om föreningen var aktiv byts till grundmall.
 */
export function taBortForening(foreningId: string): void {
  if (!foreningId || foreningId === GRUNDMALL_FORENING_ID) return;
  if (arStandardTestForening(foreningId)) return;
  if (typeof window === "undefined") return;

  taBortForeningFranLagring(foreningId);

  const registry = lasForeningRegistryInternt();
  registry.poster = registry.poster.filter((p) => p.id !== foreningId);
  try {
    sparaRegistry(registry);
  } catch {
    /* borttagning lyckades ändå om registret saknar posten */
  }

  if (hamtaAktivForeningId() === foreningId) {
    try {
      sattAktivForeningId(GRUNDMALL_FORENING_ID, { tyst: true });
    } catch {
      /* ignore */
    }
  }

  window.dispatchEvent(new Event(FORENING_AKTIV_EVENT));
}

/** Grundmall + alla skapade föreningar (för migrering och växlare). */
export function listaAllaForeningIds(): string[] {
  return [
    GRUNDMALL_FORENING_ID,
    ...lasForeningRegistry().poster.map((p) => p.id),
  ];
}

export function listaAllaForeningerForVaxlare(): ForeningProfil[] {
  repareraForeningRegistry();
  rengoraDubblettForeningar();
  const grundmall = lasForeningProfil(GRUNDMALL_FORENING_ID);
  return grundmall ? [grundmall, ...listaForeningar()] : listaForeningar();
}
