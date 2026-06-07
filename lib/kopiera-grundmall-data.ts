import { GRUNDMALL_FORENING_ID } from "@/lib/forening-konstanter";
import { foreningStorageKey } from "@/lib/foreningStorage";

/** Nycklar som grundmallen använder utan prefix — kopieras till ny förening vid skapande. */
const GRUNDMALL_DATA_NYCKLAR = [
  "brf-underhallsplan-state",
  "brf-underhallsplan-bildstod",
  "brf-underhallsplan-kommande-projekt",
  "brf-rondering-state",
  "brf-rondering-signering-schema",
  "brf-rondering-manadssignering",
  "brf-upphandling-lager",
  "brf-upphandling-schema-bilagor",
  "brf-arshjul-handelser",
  "brf-grundmall-projekt",
  "brf-tidsplan-bibliotek",
  "brf-forening-sotning-protokoll",
  "brf-nyckel-kvittenser",
  "brf-egna-nycklar",
  "brf-lagenhetsarkiv",
  "brf-medlemmar-renovering",
  "brf-dokumentbank-egna",
  "brf-upphandling-kategori-dokument",
] as const;

/** Minimal demo om användaren skapar utan att besökt grundmallen först. */
const GRUNDMALL_MINIMAL_SEED: Record<string, string> = {
  "brf-rondering-state": JSON.stringify({
    klaraPunkter: [],
    avvikelser: [],
    egenskaper: {
      trapphus: true,
      kallare: true,
      soprum: true,
      tvattstuga: false,
      hiss: false,
      balkonger: true,
      tak: true,
      markOchGard: true,
      lekplats: false,
      cykelforrad: true,
      foreningslokal: false,
      garage: false,
      verksamhetslokaler: false,
      fleraByggnader: false,
      gemensamToalett: false,
    },
    doldaPunkter: [],
    egnaPunkter: [],
  }),
};

/** Minimal startdata direkt på ny förening — skriver aldrig till grundmallens nycklar. */
export function forberedNyForening(foreningId: string): void {
  seedMinimalTillForening(foreningId);
}

function seedMinimalTillForening(foreningId: string): void {
  if (typeof window === "undefined") return;
  for (const [baseKey, json] of Object.entries(GRUNDMALL_MINIMAL_SEED)) {
    const malKey = foreningStorageKey(baseKey, foreningId);
    if (localStorage.getItem(malKey)) continue;
    try {
      localStorage.setItem(malKey, json);
    } catch {
      break;
    }
  }
}

/** Kopierar demo-data från grundmall till ny förening (endast saknade nycklar). */
export function kopieraGrundmallDataTillForening(foreningId: string): void {
  if (typeof window === "undefined") return;
  if (!foreningId || foreningId === GRUNDMALL_FORENING_ID) return;

  seedMinimalTillForening(foreningId);

  for (const baseKey of GRUNDMALL_DATA_NYCKLAR) {
    const kalla = localStorage.getItem(baseKey);
    if (!kalla) continue;
    const malKey = foreningStorageKey(baseKey, foreningId);
    if (localStorage.getItem(malKey)) continue;
    try {
      localStorage.setItem(malKey, kalla);
    } catch {
      break;
    }
  }
}
