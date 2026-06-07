import { safeSetLocalStorage } from "@/lib/localStorage";
import { foreningStorageKey } from "@/lib/foreningStorage";

const NYCKEL_KVITTENSER_BASE = "brf-nyckel-kvittenser";
const EGNA_NYCKLAR_BASE = "brf-egna-nycklar";

export function nyckelKvittenserStorageKey(): string {
  return foreningStorageKey(NYCKEL_KVITTENSER_BASE);
}

export function egnaNycklarStorageKey(): string {
  return foreningStorageKey(EGNA_NYCKLAR_BASE);
}

export type NyckelKvittensRoll = "styrelse" | "medlem" | "entreprenor";

export type NyckelDefinition = {
  id: string;
  etikett: string;
  beskrivning: string;
  /** Nyckel tillagd av styrelsen i gränssnittet */
  egen?: boolean;
};

/** Standardnycklar som kan bockas i vid kvittering. */
export const standardNycklar: NyckelDefinition[] = [
  {
    id: "huvudnyckel",
    etikett: "Huvudnyckel — port och gemensamma ytor",
    beskrivning: "Huvudnyckel till port, entré och gemensamma utrymmen.",
  },
  {
    id: "tvattstuga",
    etikett: "Tvättstuga",
    beskrivning: "Nyckel eller bricka till tvättstugan.",
  },
  {
    id: "soprum",
    etikett: "Soprum / miljörum",
    beskrivning: "Nyckel till soprum eller miljörum.",
  },
  {
    id: "kallare",
    etikett: "Förråd / källare",
    beskrivning: "Nyckel till källarförråd eller gemensam källare.",
  },
  {
    id: "teknikrum",
    etikett: "Teknikrum / undercentral",
    beskrivning: "Nyckel till teknikrum, undercentral eller elrum.",
  },
  {
    id: "hiss-service",
    etikett: "Hiss — service",
    beskrivning: "Service- eller maskinnyckel till hiss.",
  },
  {
    id: "cykelrum",
    etikett: "Cykelrum",
    beskrivning: "Nyckel till cykelrum eller cykelförråd.",
  },
  {
    id: "porttelefon",
    etikett: "Porttelefon / bricka",
    beskrivning: "Bricka, tagg eller kodbricka till porttelefon.",
  },
  {
    id: "garage",
    etikett: "Garage / carport",
    beskrivning: "Nyckel till garage, carport eller parkeringsplats.",
  },
  {
    id: "tak",
    etikett: "Tak / taklucka",
    beskrivning: "Nyckel till tak, taklucka eller takutrustning.",
  },
];

/** @deprecated Använd hamtaAllaNycklar() */
export const tillgangligaNycklar = standardNycklar;

export type NyckelKvittensTyp = "mottagning" | "aterlamning";

export type NyckelKvittens = {
  id: string;
  roll: NyckelKvittensRoll;
  namn: string;
  komplettering: string;
  typ: NyckelKvittensTyp;
  nycklar: string[];
  signerad: string;
  signeradTidpunkt: string;
  metod: "bankid";
};

export function skapaNyckelKvittensId(): string {
  return `nyckel-kv-${Date.now()}`;
}

export function skapaEgenNyckelId(): string {
  return `nyckel-egen-${Date.now()}`;
}

export function lasEgnaNycklar(): NyckelDefinition[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(egnaNycklarStorageKey());
    if (!raw) return [];
    const parsed = JSON.parse(raw) as NyckelDefinition[];
    return parsed.filter((n) => n?.id && n?.etikett);
  } catch {
    return [];
  }
}

export function sparaEgenNyckel(nyckel: NyckelDefinition): NyckelDefinition[] {
  const lista = [...lasEgnaNycklar(), { ...nyckel, egen: true }];
  if (typeof window !== "undefined") {
    if (safeSetLocalStorage(egnaNycklarStorageKey(), JSON.stringify(lista)).ok) {
      window.dispatchEvent(new CustomEvent("nyckel-kvittenser-uppdaterad"));
    }
  }
  return lista;
}

export function taBortEgenNyckel(nyckelId: string): NyckelDefinition[] {
  const lista = lasEgnaNycklar().filter((n) => n.id !== nyckelId);
  if (typeof window !== "undefined") {
    if (safeSetLocalStorage(egnaNycklarStorageKey(), JSON.stringify(lista)).ok) {
      window.dispatchEvent(new CustomEvent("nyckel-kvittenser-uppdaterad"));
    }
  }
  return lista;
}

export function hamtaAllaNycklar(): NyckelDefinition[] {
  return [...standardNycklar, ...lasEgnaNycklar()];
}

export function lasNyckelKvittenser(): NyckelKvittens[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(nyckelKvittenserStorageKey());
    return raw ? (JSON.parse(raw) as NyckelKvittens[]) : [];
  } catch {
    return [];
  }
}

export function sparaNyckelKvittens(kvittens: NyckelKvittens): NyckelKvittens[] {
  const lista = [...lasNyckelKvittenser(), kvittens].sort(
    (a, b) =>
      new Date(b.signeradTidpunkt).getTime() - new Date(a.signeradTidpunkt).getTime(),
  );
  if (typeof window !== "undefined") {
    if (safeSetLocalStorage(nyckelKvittenserStorageKey(), JSON.stringify(lista)).ok) {
      window.dispatchEvent(new CustomEvent("nyckel-kvittenser-uppdaterad"));
    }
  }
  return lista;
}

export function rollEtikett(roll: NyckelKvittensRoll): string {
  switch (roll) {
    case "styrelse":
      return "Styrelse";
    case "medlem":
      return "Medlem";
    case "entreprenor":
      return "Entreprenör";
  }
}

export function typEtikett(typ: NyckelKvittensTyp): string {
  return typ === "mottagning" ? "Mottagning" : "Återlämning";
}

export function hamtaNyckelEtikett(nyckelId: string): string {
  return hamtaAllaNycklar().find((n) => n.id === nyckelId)?.etikett ?? nyckelId;
}

export function formatKvittensTid(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("sv-SE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** En nyckeltyp som för närvarande är utlämnad enligt kvittenshistoriken. */
export type UtlamnadNyckel = {
  nyckelId: string;
  nyckelEtikett: string;
  namn: string;
  roll: NyckelKvittensRoll;
  komplettering: string;
  utlamnadTidpunkt: string;
  kvittensId: string;
};

export function hamtaMottagareEtikett(kvittens: Pick<
  NyckelKvittens,
  "namn" | "roll" | "komplettering"
>): string {
  const delar = [kvittens.namn.trim()];
  if (kvittens.komplettering.trim()) {
    if (kvittens.roll === "entreprenor") {
      delar.push(kvittens.komplettering.trim());
    } else if (kvittens.roll === "medlem") {
      delar.push(`lgh ${kvittens.komplettering.trim()}`);
    } else {
      delar.push(kvittens.komplettering.trim());
    }
  }
  return delar.filter(Boolean).join(" · ");
}

export function hamtaForetagEllerKomplettering(
  kvittens: Pick<NyckelKvittens, "roll" | "komplettering">,
): string | null {
  const text = kvittens.komplettering.trim();
  if (!text) return null;
  if (kvittens.roll === "entreprenor") return text;
  if (kvittens.roll === "medlem") return `Lägenhet ${text}`;
  return text;
}

/**
 * Räknar ut vilka nyckeltyper som är utlämnade utifrån kvittenser i tidsordning.
 * Senaste händelse per nyckeltyp (mottagning / återlämning) avgör status.
 */
export function beraknaUtlamnadeNycklar(
  kvittenser: NyckelKvittens[] = lasNyckelKvittenser(),
): UtlamnadNyckel[] {
  const kronologisk = [...kvittenser].sort(
    (a, b) =>
      new Date(a.signeradTidpunkt).getTime() -
      new Date(b.signeradTidpunkt).getTime(),
  );

  const senasteMottagning = new Map<string, NyckelKvittens>();

  for (const kvittens of kronologisk) {
    for (const nyckelId of kvittens.nycklar) {
      if (kvittens.typ === "mottagning") {
        senasteMottagning.set(nyckelId, kvittens);
      } else {
        senasteMottagning.delete(nyckelId);
      }
    }
  }

  return [...senasteMottagning.entries()]
    .map(([nyckelId, kvittens]) => ({
      nyckelId,
      nyckelEtikett: hamtaNyckelEtikett(nyckelId),
      namn: kvittens.namn,
      roll: kvittens.roll,
      komplettering: kvittens.komplettering,
      utlamnadTidpunkt: kvittens.signeradTidpunkt,
      kvittensId: kvittens.id,
    }))
    .sort(
      (a, b) =>
        new Date(b.utlamnadTidpunkt).getTime() -
        new Date(a.utlamnadTidpunkt).getTime(),
    );
}

export function antalUtlamnadeNycklar(
  kvittenser?: NyckelKvittens[],
): number {
  return beraknaUtlamnadeNycklar(kvittenser).length;
}
