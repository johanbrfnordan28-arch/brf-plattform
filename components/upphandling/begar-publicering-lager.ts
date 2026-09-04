import {
  localStorageFelMeddelande,
  safeSetLocalStorage,
} from "@/lib/localStorage";

const STORAGE_KEY = "brf-begar-publicering-lager";
const EVENT_NAME = "begar-publicering-lager-uppdaterad";

export type BegarPubliceringStatus = "ny" | "hanterad";

export type BegarPublicering = {
  id: string;
  foreningsNamn: string;
  kontakt: string;
  kategori: string;
  beskrivning: string;
  onskadSistaAnbudsdag: string;
  skapad: string;
  status: BegarPubliceringStatus;
};

type BegarPubliceringLager = {
  forfragningar: BegarPublicering[];
};

function tomtLager(): BegarPubliceringLager {
  return { forfragningar: [] };
}

export function begarPubliceringStorageKey(): string {
  return STORAGE_KEY;
}

export function lasBegarPubliceringLager(): BegarPubliceringLager {
  if (typeof window === "undefined") return tomtLager();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return tomtLager();
    const parsed = JSON.parse(raw) as BegarPubliceringLager;
    if (!parsed || !Array.isArray(parsed.forfragningar)) return tomtLager();
    return {
      forfragningar: parsed.forfragningar.filter(
        (f) =>
          typeof f?.id === "string" &&
          typeof f?.foreningsNamn === "string" &&
          typeof f?.kontakt === "string",
      ),
    };
  } catch {
    return tomtLager();
  }
}

function sparaLager(lager: BegarPubliceringLager): void {
  const result = safeSetLocalStorage(STORAGE_KEY, JSON.stringify(lager));
  if (!result.ok) {
    throw new Error(localStorageFelMeddelande(result.error));
  }
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function hamtaBegarPubliceringar(): BegarPublicering[] {
  return [...lasBegarPubliceringLager().forfragningar].sort((a, b) =>
    b.skapad.localeCompare(a.skapad),
  );
}

export function sparaBegarPublicering(input: {
  foreningsNamn: string;
  kontakt: string;
  kategori: string;
  beskrivning: string;
  onskadSistaAnbudsdag?: string;
}): BegarPublicering {
  const lager = lasBegarPubliceringLager();
  const ny: BegarPublicering = {
    id: `begar-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    foreningsNamn: input.foreningsNamn.trim(),
    kontakt: input.kontakt.trim(),
    kategori: input.kategori.trim(),
    beskrivning: input.beskrivning.trim(),
    onskadSistaAnbudsdag: (input.onskadSistaAnbudsdag ?? "").trim(),
    skapad: new Date().toISOString(),
    status: "ny",
  };
  lager.forfragningar = [ny, ...lager.forfragningar];
  sparaLager(lager);
  return ny;
}

export function markeraBegarPubliceringHanterad(id: string): void {
  const lager = lasBegarPubliceringLager();
  lager.forfragningar = lager.forfragningar.map((f) =>
    f.id === id ? { ...f, status: "hanterad" as const } : f,
  );
  sparaLager(lager);
}

export function begarPubliceringEventName(): string {
  return EVENT_NAME;
}
