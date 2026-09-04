import type { Besiktning } from "@/components/underhallsplan/besiktningar";
import type { KomponentDetaljData } from "@/components/underhallsplan/komponentregister";
import { parseHeltalFranText } from "@/components/underhallsplan/parse-grundtal";
import {
  normaliseraFastighetsYtor,
  type FastighetsYtorData,
} from "@/components/underhallsplan/fastighets-ytor";
import { synkaGrundByggnaderOchAdresser } from "@/components/underhallsplan/grund-byggnad-adress";
import type {
  Grunduppgifter,
  VerksamhetsLokal,
} from "@/components/underhallsplan/types";
import { synkaStambyteMedAntalLagenheter } from "@/components/underhallsplan/vvs-stambyte";

const STAMBYTE_UNDERKOMPONENT_ID = "stambyte";

export type GrunduppgifterNormaliserad = Grunduppgifter & {
  lokaler: VerksamhetsLokal[];
  fastighetsYtor: FastighetsYtorData;
};

export function normaliseraGrund(grund: Grunduppgifter): GrunduppgifterNormaliserad {
  const synkad = synkaGrundByggnaderOchAdresser(grund);
  return {
    ...synkad,
    lokaler: Array.isArray(synkad.lokaler) ? synkad.lokaler : [],
    fastighetsYtor: normaliseraFastighetsYtor(synkad.fastighetsYtor),
  };
}

export function hamtaAntalLagenheterFranGrund(grund: Grunduppgifter): number {
  return parseHeltalFranText(grund.antalLagenheter);
}

const PLAN_TITEL_LGH_RE =
  /\s*\(\s*\d+[\s\u00a0]*(?:lägenheter|lgh|bostäder)\s*\)\s*/gi;

/** Tar bort inbakad lägenhetssiffra i testplansnamn, t.ex. "(18 lägenheter)". */
export function rensaPlanTitelFranLagenhetsantal(planNamn: string): string {
  return planNamn.replace(PLAN_TITEL_LGH_RE, " ").replace(/\s+/g, " ").trim();
}

export function uppdateraPlanTitelMedLagenheter(
  planNamn: string,
  antalLgh: number,
): string {
  const bas = rensaPlanTitelFranLagenhetsantal(planNamn);
  if (antalLgh > 0) {
    return `${bas} (${antalLgh} lägenheter)`;
  }
  return bas;
}

const PLAN_TITEL_PREFIX_RE =
  /^(?:föreningens\s+underhållsplan|central\s+grundmall|underhållsplan)\s*[—–-]\s*/i;

/** Tar bort visningsprefix så vi inte dubblerar dem. */
export function rensaPlanTitelPrefix(planNamn: string): string {
  return planNamn.replace(PLAN_TITEL_PREFIX_RE, "").trim();
}

/** Rubrik på slutsidan — tydlig skillnad mellan central grundmall och föreningens plan. */
export function hamtaPlanVisningstitel(
  planNamn: string | null,
  grund: Grunduppgifter,
  foreningsnamn?: string | null,
  options?: { arCentralGrundmall?: boolean },
): string {
  const grundNorm = normaliseraGrund(grund);
  const antalLgh = hamtaAntalLagenheterFranGrund(grundNorm);
  const radNamn =
    rensaPlanTitelPrefix(foreningsnamn?.trim() || "") ||
    (planNamn?.trim()
      ? rensaPlanTitelPrefix(rensaPlanTitelFranLagenhetsantal(planNamn.trim()))
      : "") ||
    grundNorm.fastighetsbeteckning.trim() ||
    "";

  const bas = options?.arCentralGrundmall
    ? radNamn
      ? `Central grundmall — ${radNamn}`
      : "Central grundmall — underhållsplan"
    : radNamn
      ? `Föreningens underhållsplan — ${radNamn}`
      : "Föreningens underhållsplan — utkast";

  if (antalLgh > 0) {
    return uppdateraPlanTitelMedLagenheter(bas, antalLgh);
  }
  return rensaPlanTitelFranLagenhetsantal(bas);
}

/** Bygger plantitel från aktivt föreningsnamn (utan demoplan-namn). */
export function planNamnFranForeningsnamn(
  foreningsnamn: string | null | undefined,
  antalLgh = 0,
): string | null {
  const bas = foreningsnamn?.trim();
  if (!bas) return null;
  return uppdateraPlanTitelMedLagenheter(bas, antalLgh);
}

export function hamtaAntalVerksamhetslokaler(grund: Grunduppgifter): number {
  const lokaler = normaliseraGrund(grund).lokaler;
  return lokaler.filter((l) => l.namn.trim()).length;
}

/** Uppdaterar stambyte m.m. när antal lägenheter ändras i grunduppgifter. */
export function synkaRegisterMedAntalLagenheter(
  lgh: number,
  register: Record<string, KomponentDetaljData>,
): Record<string, KomponentDetaljData> {
  if (lgh <= 0) return register;
  const vvs = register.VVS;
  const stamData = vvs?.vvsStambyteRegister?.[STAMBYTE_UNDERKOMPONENT_ID];
  if (!vvs || !stamData) return register;
  const stamAktiv = vvs.underkomponenter.some(
    (r) => r.id === STAMBYTE_UNDERKOMPONENT_ID && r.aktiv,
  );
  if (!stamAktiv) return register;
  const synkat = synkaStambyteMedAntalLagenheter(stamData, lgh);
  if (
    synkat.antalBadrum === stamData.antalBadrum &&
    synkat.stamventilLagenhetAntal === stamData.stamventilLagenhetAntal
  ) {
    return register;
  }
  return {
    ...register,
    VVS: {
      ...vvs,
      vvsStambyteRegister: {
        ...vvs.vvsStambyteRegister,
        [STAMBYTE_UNDERKOMPONENT_ID]: synkat,
      },
    },
  };
}

/** Kopplar OVK verksamhet till registrerade lokaler och bostäder till lägenhetsantalet. */
export function synkaBesiktningarMedGrund(
  lista: Besiktning[],
  grund: Grunduppgifter,
  antalLgh: number,
): Besiktning[] {
  const antalLokaler = hamtaAntalVerksamhetslokaler(grund);
  return lista.map((b) => {
    if (b.id !== "ovk") return b;
    const next = { ...b };
    if (antalLgh > 0 && b.prismodell === "per_lagenhet") {
      next.kostnadPerLagenhetKr = b.kostnadPerLagenhetKr;
    }
    if (antalLokaler > 0) {
      next.ovkInkluderaVerksamhet = true;
      if ((next.antalVerksamheter ?? 0) !== antalLokaler) {
        next.antalVerksamheter = antalLokaler;
      }
    }
    return next;
  });
}

export function registerBehoverLagenhetsSynk(
  lgh: number,
  register: Record<string, KomponentDetaljData>,
): boolean {
  if (lgh <= 0) return false;
  const vvs = register.VVS;
  const stamData = vvs?.vvsStambyteRegister?.[STAMBYTE_UNDERKOMPONENT_ID];
  if (!vvs || !stamData) return false;
  const stamAktiv = vvs.underkomponenter.some(
    (r) => r.id === STAMBYTE_UNDERKOMPONENT_ID && r.aktiv,
  );
  if (!stamAktiv) return false;
  const synkat = synkaStambyteMedAntalLagenheter(stamData, lgh);
  return (
    synkat.antalBadrum !== stamData.antalBadrum ||
    synkat.stamventilLagenhetAntal !== stamData.stamventilLagenhetAntal
  );
}

export function besiktningarBehoverGrundSynk(
  lista: Besiktning[],
  grund: Grunduppgifter,
  antalLgh: number,
): boolean {
  const synkat = synkaBesiktningarMedGrund(lista, grund, antalLgh);
  return JSON.stringify(synkat) !== JSON.stringify(lista);
}
