import { lasAktivForeningId } from "@/lib/forening-registry";
import { safeSetLocalStorage } from "@/lib/localStorage";
import { foreningStorageKey } from "@/lib/foreningStorage";

export type SigneringRoll = "fastighetsskotare" | "stadning";

export type SigneringMetod = "bankid" | "uppladdning";

export type SigneringStatus = {
  roll: SigneringRoll;
  period: string;
  status: "vantar" | "signerad";
  metod?: SigneringMetod;
  signeradDatum?: string;
  filnamn?: string;
  foretagsnamn?: string;
  /** Moment entreprenören bockat av vid månadssignering. */
  genomfordaPunktIds?: string[];
};

const SIGNERING_BASE = "brf-rondering-manadssignering";

export function signeringStorageKey(foreningId?: string): string {
  return foreningStorageKey(SIGNERING_BASE, foreningId);
}

export const signeringRollInfo: Record<
  SigneringRoll,
  { titel: string; dokument: string; entreprenorTyp: string }
> = {
  fastighetsskotare: {
    titel: "Rondering fastighetsskötare",
    dokument: "Rondering Fastighetsskötare",
    entreprenorTyp: "Fastighetsskötare / rondering",
  },
  stadning: {
    titel: "Städning",
    dokument: "Städschema",
    entreprenorTyp: "Städföretag",
  },
};

export function aktuellPeriod(): string {
  const nu = new Date();
  const ar = nu.getFullYear();
  const manad = String(nu.getMonth() + 1).padStart(2, "0");
  return `${ar}-${manad}`;
}

export function formateraPeriod(period: string): string {
  const [ar, manad] = period.split("-");
  const namn = [
    "januari",
    "februari",
    "mars",
    "april",
    "maj",
    "juni",
    "juli",
    "augusti",
    "september",
    "oktober",
    "november",
    "december",
  ];
  const idx = Number(manad) - 1;
  return `${namn[idx] ?? manad} ${ar}`;
}

export function signeringNyckel(roll: SigneringRoll, period: string): string {
  return `${period}:${roll}`;
}

export function lasSigneringar(
  foreningId?: string,
): Record<string, SigneringStatus> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(signeringStorageKey(foreningId));
    return raw ? (JSON.parse(raw) as Record<string, SigneringStatus>) : {};
  } catch {
    return {};
  }
}

export function sparaSignering(
  entry: SigneringStatus,
  foreningId?: string,
): void {
  if (typeof window === "undefined") return;
  const all = lasSigneringar(foreningId);
  all[signeringNyckel(entry.roll, entry.period)] = entry;
  safeSetLocalStorage(signeringStorageKey(foreningId), JSON.stringify(all));
}

export function hamtaSignering(
  roll: SigneringRoll,
  period: string,
  foreningId?: string,
): SigneringStatus | null {
  return lasSigneringar(foreningId)[signeringNyckel(roll, period)] ?? null;
}

export function skapaSigneringLank(
  roll: SigneringRoll,
  period: string,
  foreningId?: string,
): string {
  const fid = foreningId ?? lasAktivForeningId();
  const params = new URLSearchParams({ roll, period, foreningId: fid });
  if (typeof window === "undefined") {
    return `/signering/rondering?${params.toString()}`;
  }
  return `${window.location.origin}/signering/rondering?${params.toString()}`;
}

export function arGiltigRoll(value: string | null): value is SigneringRoll {
  return value === "fastighetsskotare" || value === "stadning";
}
