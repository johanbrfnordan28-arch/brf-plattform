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
  "brf-upphandling-kategori-dokument",
  "brf-forenklad-upphandling",
  "brf-mindre-byggarbeten",
  "brf-arshjul-handelser",
  "brf-grundmall-projekt",
  "brf-tidsplan-bibliotek",
  "brf-forening-sotning-protokoll",
  "brf-nyckel-kvittenser",
  "brf-egna-nycklar",
  "brf-lagenhetsarkiv-v2",
  "brf-medlemmar-renovering",
  "brf-dokumentbank-egna",
  "brf-forenings-dokument",
  "brf-kommunikation",
  "brf-entreprenorer-lista",
  "brf-hus-entreprenorer",
  "brf-prislistor",
  "brf-plan-registry",
  "brf-sba-arbete",
  "brf-projektutvardering",
  "brf-juridik-egna-mappar",
  "brf-juridik-domar-egna-mappar",
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

/**
 * Kopierar demo-data från grundmall till en förening.
 * Som standard skrivs bara saknade nycklar — med `skrivOver: true` ersätts allt.
 */
export function kopieraGrundmallDataTillForening(
  foreningId: string,
  val?: { skrivOver?: boolean },
): void {
  if (typeof window === "undefined") return;
  if (!foreningId || foreningId === GRUNDMALL_FORENING_ID) return;

  seedMinimalTillForening(foreningId);

  for (const baseKey of GRUNDMALL_DATA_NYCKLAR) {
    const kalla = localStorage.getItem(baseKey);
    if (!kalla) continue;
    const malKey = foreningStorageKey(baseKey, foreningId);
    if (!val?.skrivOver && localStorage.getItem(malKey)) continue;
    try {
      localStorage.setItem(malKey, kalla);
    } catch {
      break;
    }
  }
}
