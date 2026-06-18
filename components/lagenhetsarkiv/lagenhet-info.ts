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

export type BesiktningStatus = "" | "bra" | "normalt" | "observera";

/** @deprecated Migreras till normalt */
export type LegacyBesiktningStatus = "ok" | "daligt";

export const BESIKTNING_STATUS_ETIKETTER: Record<BesiktningStatus, string> = {
  "": "Ej bedömd",
  bra: "Bra skick",
  normalt: "Normalt skick",
  observera: "Observera",
};

export const BESIKTNING_STATUS_VAL: BesiktningStatus[] = [
  "",
  "bra",
  "normalt",
  "observera",
];

export function normaliseraBesiktningStatus(
  status?: BesiktningStatus | LegacyBesiktningStatus | string,
): BesiktningStatus {
  if (status === "ok") return "normalt";
  if (status === "daligt") return "observera";
  if (status === "bra" || status === "normalt" || status === "observera") {
    return status;
  }
  return "";
}

function normaliseraRumBesiktning(
  besiktning?: RumBesiktning,
): RumBesiktning | undefined {
  if (!besiktning) return undefined;
  return {
    ...besiktning,
    status: normaliseraBesiktningStatus(besiktning.status),
  };
}

/** Enkel besiktning per rum — kan kompletteras löpande. */
export type RumBesiktning = {
  status?: BesiktningStatus;
  /** Kryssas i vid observera eller osäker konstruktion — utlöser fördjupad undersökning. */
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

export type BadrumKontrollpunktStatus = "" | "ok" | "observera";

export const BADRUM_KONTROLL_ETIKETTER: Record<BadrumKontrollpunktStatus, string> =
  {
    "": "Ej bedömd",
    ok: "OK",
    observera: "Observera",
  };

export type TappvattenPlatsTyp = "" | "teknikskap" | "rorschakt";

export const TAPPVATTEN_PLATS_ETIKETTER: Record<TappvattenPlatsTyp, string> = {
  "": "— Välj plats —",
  teknikskap: "Teknikskåp",
  rorschakt: "Rörschakt med vattentät botten",
};

export type BadrumTappvatten = {
  plats?: TappvattenPlatsTyp;
  lackageIndikering?: boolean;
};

export type BadrumKontrollpunkter = {
  tatskiktGolvbrunn?: BadrumKontrollpunktStatus;
  tappvatten?: BadrumTappvatten;
};

export type LagenhetBadrum = {
  senasteRenovering?: SenasteRenovering;
  uppvarmning?: LagenhetUppvarmning;
  besiktning?: RumBesiktning;
  kontrollpunkter?: BadrumKontrollpunkter;
};

export type LagenhetHall = {
  uppvarmning?: LagenhetUppvarmning;
  besiktning?: RumBesiktning;
};

/** Rum som läggs till utöver standard hall, kök och badrum. */
export type TillagtRumTyp = "kok" | "badrum" | "wc" | "entre" | "ovrigt";

export type EntreDorrTyp = "" | "standard" | "sakerhetsdorr";

export const TILLAGT_RUM_TYP_ETIKETTER: Record<TillagtRumTyp, string> = {
  kok: "Kök",
  badrum: "Badrum",
  wc: "WC",
  entre: "Entré",
  ovrigt: "Övrigt rum",
};

export const TILLAGT_RUM_TYP_BESKRIVNINGAR: Record<TillagtRumTyp, string> = {
  kok: "Renovering, läckageskydd och besiktning — kan påverka grannar",
  badrum: "Renovering och besiktning — kan påverka grannar",
  wc: "Renovering och besiktning — kan påverka grannar",
  entre: "Dörrtyp: standard eller säkerhetsdörr",
  ovrigt: "Besiktning och uppvärmning (t.ex. sovrum)",
};

export const ENTRE_DORR_ETIKETTER: Record<EntreDorrTyp, string> = {
  "": "— Välj typ —",
  standard: "Standarddörr",
  sakerhetsdorr: "Säkerhetsdörr",
};

export type LagenhetOvrigtRum = {
  id: string;
  typ?: TillagtRumTyp;
  namn: string;
  senasteRenovering?: SenasteRenovering;
  lackagekydd?: KokLackagekydd;
  dorrTyp?: EntreDorrTyp;
  kontrollpunkter?: BadrumKontrollpunkter;
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
  /** Eldning får inte ske — t.ex. i väntan på sotares godkännande. */
  eldningsforbud?: boolean;
  /** Inväntar provtryckningsprotokoll från sotare innan eldstaden kan godkännas. */
  invantarProvtryckning?: boolean;
};

export const ELDSTAD_PROVTRYCKNING_INFO =
  "Inväntar provtryckningsprotokoll från sotare för godkännande.";

export function formateraEldstadStatus(eldstad: LagenhetEldstad): string[] {
  const delar: string[] = [];
  if (eldstad.godkand) delar.push("Godkänd");
  if (eldstad.eldningsforbud) delar.push("Eldningsförbud");
  if (eldstad.invantarProvtryckning) delar.push("Inväntar protokoll");
  return delar;
}

export function eldstadHarVarde(eldstad: LagenhetEldstad): boolean {
  return !!(
    eldstad.godkand ||
    eldstad.eldningsforbud ||
    eldstad.invantarProvtryckning
  );
}

/** Fläkt som endast betjänar denna lägenhet — inte fastighetens gemensamma system. */
export type LagenhetFlakt = {
  /** Fläkt/ventilation som endast betjänar denna lägenhet. */
  aktiv?: boolean;
  egenVentilation?: boolean;
  rokgasflakt?: boolean;
  beskrivning?: string;
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
      hall: {
        ...apartment.lagenhetsRum.hall,
        besiktning: normaliseraRumBesiktning(apartment.lagenhetsRum.hall?.besiktning),
      },
      kok: {
        ...apartment.lagenhetsRum.kok,
        lackagekydd: {
          ...apartment.lagenhetsRum.kok?.lackagekydd,
        },
        besiktning: normaliseraRumBesiktning(apartment.lagenhetsRum.kok?.besiktning),
      },
      badrum: {
        ...apartment.lagenhetsRum.badrum,
        besiktning: normaliseraRumBesiktning(
          apartment.lagenhetsRum.badrum?.besiktning,
        ),
      },
      ovrigaRum: (apartment.lagenhetsRum.ovrigaRum ?? []).map((r) => ({
        ...r,
        typ: r.typ ?? "ovrigt",
        besiktning: normaliseraRumBesiktning(r.besiktning),
      })),
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
    egenVentilation: apartment.harEgenFlaktVentilation || undefined,
    rokgasflakt: apartment.harRokgasFlakt || undefined,
    beskrivning: apartment.ventilation,
  };
}

export function flaktHarVarde(flakt: LagenhetFlakt): boolean {
  return !!(
    flakt.aktiv ||
    flakt.egenVentilation ||
    flakt.rokgasflakt ||
    flakt.beskrivning?.trim()
  );
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
    b?.status === "observera" ||
    b?.fordjupadUndersokning === true
  );
}

export function rumTypPaverkarGrannar(typ?: TillagtRumTyp): boolean {
  return typ === "kok" || typ === "badrum" || typ === "wc";
}

export function foreslagetTillagtRumsnamn(
  rum: LagenhetsRumsInfo,
  typ: TillagtRumTyp,
): string {
  const avTyp = (t: TillagtRumTyp) =>
    rum.ovrigaRum.filter((r) => (r.typ ?? "ovrigt") === t).length;

  switch (typ) {
    case "kok": {
      const n = avTyp("kok") + 2;
      return `Kök ${n}`;
    }
    case "badrum": {
      const n = avTyp("badrum") + 2;
      return `Badrum ${n}`;
    }
    case "wc": {
      const n = avTyp("wc") + 1;
      return n === 1 ? "WC" : `WC ${n}`;
    }
    case "entre": {
      const n = avTyp("entre") + 1;
      return n === 1 ? "Entré" : `Entré ${n}`;
    }
    default: {
      const n = avTyp("ovrigt") + 1;
      return `Rum ${n}`;
    }
  }
}

export function skapaTillagtRum(
  rum: LagenhetsRumsInfo,
  typ: TillagtRumTyp,
): LagenhetOvrigtRum {
  const bas: LagenhetOvrigtRum = {
    id: skapaLagenhetRumId(),
    typ,
    namn: foreslagetTillagtRumsnamn(rum, typ),
    uppvarmning: {},
  };
  if (typ === "kok") return { ...bas, lackagekydd: {} };
  if (typ === "badrum") return { ...bas, kontrollpunkter: {} };
  return bas;
}

export function formateraBadrumKontrollpunkter(
  k?: BadrumKontrollpunkter,
): string | undefined {
  if (!k) return undefined;
  const delar: string[] = [];
  if (k.tatskiktGolvbrunn) {
    delar.push(
      `Tätskikt golvbrunn: ${BADRUM_KONTROLL_ETIKETTER[k.tatskiktGolvbrunn]}`,
    );
  }
  if (k.tappvatten?.plats) {
    const plats = TAPPVATTEN_PLATS_ETIKETTER[k.tappvatten.plats];
    delar.push(
      k.tappvatten.lackageIndikering
        ? `${plats} · läckageindikering`
        : plats,
    );
  }
  return delar.length > 0 ? delar.join(" · ") : undefined;
}

export function badrumKontrollBehoverAtgard(k?: BadrumKontrollpunkter): boolean {
  return (
    k?.tatskiktGolvbrunn === "observera" ||
    (k?.tappvatten?.plats !== undefined &&
      k.tappvatten.plats !== "" &&
      !k.tappvatten.lackageIndikering)
  );
}

export function formateraEntreDorr(d?: EntreDorrTyp): string | undefined {
  if (!d) return undefined;
  return ENTRE_DORR_ETIKETTER[d];
}

export type RumsStatusRad = {
  titel: string;
  besiktning?: RumBesiktning;
  uppvarmning?: LagenhetUppvarmning;
  renovering?: SenasteRenovering;
  dorrTyp?: EntreDorrTyp;
};

export function byggRumsStatusRader(rum: LagenhetsRumsInfo): RumsStatusRad[] {
  return [
    { titel: "Hall", ...rum.hall },
    {
      titel: "Kök",
      ...rum.kok,
      renovering: rum.kok.senasteRenovering,
    },
    {
      titel: "Badrum",
      ...rum.badrum,
      renovering: rum.badrum.senasteRenovering,
    },
    ...rum.ovrigaRum.map((r) => ({
      titel: r.namn,
      besiktning: r.besiktning,
      uppvarmning: r.uppvarmning,
      renovering: r.senasteRenovering,
      dorrTyp: r.dorrTyp,
    })),
  ];
}

export function sammanfattaTillagtRum(r: LagenhetOvrigtRum): string {
  const typ = r.typ ?? "ovrigt";
  const delar: string[] = [];
  if (r.besiktning?.status) {
    delar.push(BESIKTNING_STATUS_ETIKETTER[r.besiktning.status]);
  }
  const ren = formateraRenovering(r.senasteRenovering);
  if (ren) delar.push(`Renovering ${ren}`);
  const varme = formateraUppvarmning(r.uppvarmning);
  if (varme) delar.push(varme);
  const dorr = formateraEntreDorr(r.dorrTyp);
  if (dorr) delar.push(dorr);
  const kontroll = formateraBadrumKontrollpunkter(r.kontrollpunkter);
  if (kontroll) delar.push(kontroll);
  if (r.besiktning?.fordjupadUndersokning) {
    delar.push("Fördjupad undersökning");
  }
  if (delar.length > 0) return delar.join(" · ");
  return `${TILLAGT_RUM_TYP_ETIKETTER[typ]} — komplettera vid behov`;
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
    senasteRenovering?: SenasteRenovering;
    uppvarmning?: LagenhetUppvarmning;
    kontrollpunkter?: BadrumKontrollpunkter;
  },
): string {
  const delar: string[] = [];
  if (opts.besiktning?.status) {
    delar.push(BESIKTNING_STATUS_ETIKETTER[opts.besiktning.status]);
  }
  const ren = formateraRenovering(opts.renovering ?? opts.senasteRenovering);
  if (ren) delar.push(`Renovering ${ren}`);
  const varme = formateraUppvarmning(opts.uppvarmning);
  if (varme) delar.push(varme);
  const kontroll = formateraBadrumKontrollpunkter(opts.kontrollpunkter);
  if (kontroll) delar.push(kontroll);
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
    formateraBadrumKontrollpunkter(rum.badrum.kontrollpunkter) ||
    rum.ovrigaRum.some(
      (r) =>
        r.namn.trim() ||
        formateraUppvarmning(r.uppvarmning) ||
        r.besiktning?.status ||
        formateraRenovering(r.senasteRenovering) ||
        formateraEntreDorr(r.dorrTyp) ||
        formateraBadrumKontrollpunkter(r.kontrollpunkter),
    ) ||
    eldstader.length > 0 ||
    flaktHarVarde(flakt) ||
    apartment.antalBadrum?.trim() ||
    apartment.antalWC?.trim()
  );
}
