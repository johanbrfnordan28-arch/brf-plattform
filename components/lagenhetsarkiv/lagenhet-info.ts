import type { ApartmentFolder } from "@/components/lagenhetsarkiv/lagenhetsarkiv";

export type UppvarmningTyp =
  | ""
  | "radiator"
  | "golvvarme-vatten"
  | "golvvarme-el"
  | "elradiator";

export const UPPVARMNING_ETIKETTER: Record<UppvarmningTyp, string> = {
  "": "— Välj typ —",
  radiator: "Radiator",
  "golvvarme-vatten": "Golvvärme (vatten)",
  "golvvarme-el": "Golvvärme (el)",
  elradiator: "Elradiator",
};

export type BesiktningStatus = "" | "ok" | "observera" | "daligt";

export const BESIKTNING_STATUS_ETIKETTER: Record<BesiktningStatus, string> = {
  "": "Ej bedömd",
  ok: "OK",
  observera: "Observera",
  daligt: "Dåligt skick",
};

/** Enkel besiktning per rum — kan kompletteras löpande. */
export type RumBesiktning = {
  status?: BesiktningStatus;
  /** Kryssas i t.ex. vid dåligt skick — utlöser fördjupad undersökning. */
  fordjupadUndersokning?: boolean;
  senastBesiktad?: string;
  notering?: string;
};

export type LagenhetUppvarmning = {
  typ?: UppvarmningTyp;
  antal?: string;
};

export type SenasteRenovering = {
  ar?: string;
  harDokumentation?: boolean;
  harBilder?: boolean;
};

export type KokLackagekydd = {
  diskmaskin?: boolean;
  kylFrys?: boolean;
  diskbankslada?: boolean;
};

export type LagenhetKok = {
  senasteRenovering?: SenasteRenovering;
  lackagekydd?: KokLackagekydd;
  uppvarmning?: LagenhetUppvarmning;
  besiktning?: RumBesiktning;
};

export type LagenhetBadrum = {
  senasteRenovering?: SenasteRenovering;
  uppvarmning?: LagenhetUppvarmning;
  besiktning?: RumBesiktning;
};

export type LagenhetHall = {
  uppvarmning?: LagenhetUppvarmning;
  besiktning?: RumBesiktning;
};

export type LagenhetOvrigtRum = {
  id: string;
  namn: string;
  uppvarmning?: LagenhetUppvarmning;
  besiktning?: RumBesiktning;
};

export type LagenhetsRumsInfo = {
  hall: LagenhetHall;
  kok: LagenhetKok;
  badrum: LagenhetBadrum;
  ovrigaRum: LagenhetOvrigtRum[];
};

export type LagenhetEldstad = {
  id: string;
  godkand?: boolean;
};

/** Fläkt som endast betjänar denna lägenhet — inte fastighetens gemensamma system. */
export type LagenhetFlakt = {
  aktiv?: boolean;
  beskrivning?: string;
  rokgasflakt?: boolean;
};

export function skapaLagenhetRumId(): string {
  return `rum-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function skapaEldstadId(): string {
  return `eldstad-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function skapaStandardLagenhetsRum(): LagenhetsRumsInfo {
  return {
    hall: {},
    kok: { lackagekydd: {} },
    badrum: {},
    ovrigaRum: [],
  };
}

export function mergeBesiktning(
  befintlig: RumBesiktning | undefined,
  patch: Partial<RumBesiktning> | undefined,
): RumBesiktning | undefined {
  if (!patch) return befintlig;
  const next = { ...befintlig, ...patch };
  if (
    !next.status &&
    !next.fordjupadUndersokning &&
    !next.senastBesiktad?.trim() &&
    !next.notering?.trim()
  ) {
    return undefined;
  }
  return next;
}

export function normaliseraLagenhetsRum(
  apartment: ApartmentFolder,
): LagenhetsRumsInfo {
  if (apartment.lagenhetsRum) {
    return {
      hall: apartment.lagenhetsRum.hall ?? {},
      kok: {
        ...apartment.lagenhetsRum.kok,
        lackagekydd: {
          ...apartment.lagenhetsRum.kok?.lackagekydd,
        },
      },
      badrum: apartment.lagenhetsRum.badrum ?? {},
      ovrigaRum: apartment.lagenhetsRum.ovrigaRum ?? [],
    };
  }
  return skapaStandardLagenhetsRum();
}

export function normaliseraEldstader(apartment: ApartmentFolder): LagenhetEldstad[] {
  if (apartment.eldstader?.length) {
    return apartment.eldstader;
  }
  if (apartment.eldstadAntal?.trim()) {
    const antal = Number.parseInt(apartment.eldstadAntal, 10);
    const n = Number.isFinite(antal) && antal > 0 ? antal : 1;
    return Array.from({ length: n }, (_, i) => ({
      id: `eldstad-migr-${i + 1}`,
      godkand: apartment.eldstadGodkand,
    }));
  }
  return [];
}

export function normaliseraFlakt(apartment: ApartmentFolder): LagenhetFlakt {
  if (apartment.flakt) return apartment.flakt;
  const aktiv =
    apartment.harEgenFlaktVentilation || apartment.harRokgasFlakt;
  if (!aktiv && !apartment.ventilation?.trim()) return {};
  return {
    aktiv: aktiv || undefined,
    beskrivning: apartment.ventilation,
    rokgasflakt: apartment.harRokgasFlakt || undefined,
  };
}

export function formateraUppvarmning(u?: LagenhetUppvarmning): string | undefined {
  if (!u?.typ) return undefined;
  const etikett = UPPVARMNING_ETIKETTER[u.typ] ?? u.typ;
  if (u.antal?.trim()) return `${etikett} (${u.antal} st)`;
  return etikett;
}

export function formateraRenovering(r?: SenasteRenovering): string | undefined {
  if (!r?.ar?.trim()) return undefined;
  const delar = [r.ar];
  if (r.harDokumentation) delar.push("dokumentation");
  if (r.harBilder) delar.push("bilder");
  return delar.join(" · ");
}

export function besiktningBehoverAtgard(b?: RumBesiktning): boolean {
  return (
    b?.status === "daligt" ||
    b?.status === "observera" ||
    b?.fordjupadUndersokning === true
  );
}

export function räknaBesiktningAtgarder(rum: LagenhetsRumsInfo): number {
  const utrymmen = [
    rum.hall.besiktning,
    rum.kok.besiktning,
    rum.badrum.besiktning,
    ...rum.ovrigaRum.map((r) => r.besiktning),
  ];
  return utrymmen.filter(besiktningBehoverAtgard).length;
}

export function sammanfattaRumsstatus(
  titel: string,
  opts: {
    besiktning?: RumBesiktning;
    renovering?: SenasteRenovering;
    uppvarmning?: LagenhetUppvarmning;
  },
): string {
  const delar: string[] = [];
  if (opts.besiktning?.status) {
    delar.push(BESIKTNING_STATUS_ETIKETTER[opts.besiktning.status]);
  }
  const ren = formateraRenovering(opts.renovering);
  if (ren) delar.push(`Renovering ${ren}`);
  const varme = formateraUppvarmning(opts.uppvarmning);
  if (varme) delar.push(varme);
  if (opts.besiktning?.fordjupadUndersokning) {
    delar.push("Fördjupad undersökning");
  }
  return delar.length > 0 ? delar.join(" · ") : `${titel} — komplettera vid behov`;
}

export function lagenhetHarIfylldInfo(apartment: ApartmentFolder): boolean {
  const rum = normaliseraLagenhetsRum(apartment);
  const eldstader = normaliseraEldstader(apartment);
  const flakt = normaliseraFlakt(apartment);
  return !!(
    apartment.adress ||
    apartment.vaning ||
    apartment.boyta ||
    apartment.andelstal ||
    formateraRenovering(rum.kok.senasteRenovering) ||
    formateraRenovering(rum.badrum.senasteRenovering) ||
    rum.hall.besiktning?.status ||
    rum.kok.besiktning?.status ||
    rum.badrum.besiktning?.status ||
    formateraUppvarmning(rum.hall.uppvarmning) ||
    formateraUppvarmning(rum.kok.uppvarmning) ||
    formateraUppvarmning(rum.badrum.uppvarmning) ||
    rum.ovrigaRum.some(
      (r) =>
        r.namn.trim() ||
        formateraUppvarmning(r.uppvarmning) ||
        r.besiktning?.status,
    ) ||
    eldstader.length > 0 ||
    flakt.aktiv
  );
}
