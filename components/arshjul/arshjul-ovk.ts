import {
  normaliseraHandelse,
  OVK_INTERVALL_BOSTAD_AR,
  OVK_INTERVALL_VERKSAMHET_AR,
  skapaHandelseId,
  STANDARD_PAMINNELSE_DAGAR,
  type ArshjulHandelse,
} from "@/components/arshjul/arshjul";

export const OVK_BOSTAD_STANDARD_ID = "std-ovk-bostad";
export const OVK_VERKSAMHET_STANDARD_ID = "std-ovk-butik";

export type OvkDualConfig = {
  bostadAktiv: boolean;
  bostadIntervallAr: 3 | 6;
  bostadStartAr: number;
  verksamhetAktiv: boolean;
  verksamhetStartAr: number;
};

export function skapaDefaultOvkDual(basAr: number): OvkDualConfig {
  return {
    bostadAktiv: true,
    bostadIntervallAr: OVK_INTERVALL_BOSTAD_AR,
    bostadStartAr: basAr,
    verksamhetAktiv: true,
    verksamhetStartAr: basAr,
  };
}

export function arOvkBostadHandelse(h: ArshjulHandelse): boolean {
  if (h.kategori !== "ovk" || h.typ !== "intervall") return false;
  if (h.id === OVK_BOSTAD_STANDARD_ID) return true;
  if (h.externId?.endsWith("-bostad")) return true;
  const titel = h.titel.toLowerCase();
  return (
    titel.includes("bostad") &&
    !titel.includes("verksamhet") &&
    !titel.includes("butik")
  );
}

export function arOvkVerksamhetHandelse(h: ArshjulHandelse): boolean {
  if (h.kategori !== "ovk" || h.typ !== "intervall") return false;
  if (h.id === OVK_VERKSAMHET_STANDARD_ID) return true;
  if (h.externId?.endsWith("-verksamhet")) return true;
  const titel = h.titel.toLowerCase();
  return titel.includes("verksamhet") || titel.includes("butik");
}

export function arOvkIntervallHandelse(h: ArshjulHandelse): boolean {
  return h.kategori === "ovk" && h.typ === "intervall";
}

export function hittaOvkBostad(
  handelser: ArshjulHandelse[],
): ArshjulHandelse | undefined {
  return handelser.find(arOvkBostadHandelse);
}

export function hittaOvkVerksamhet(
  handelser: ArshjulHandelse[],
): ArshjulHandelse | undefined {
  return handelser.find(arOvkVerksamhetHandelse);
}

/** Läser in befintliga OVK-rader till dual-formulär (vid redigering). */
export function ovkDualFranHandelser(
  handelser: ArshjulHandelse[],
  redigera?: ArshjulHandelse,
  basAr = new Date().getFullYear(),
): OvkDualConfig {
  const bostad = hittaOvkBostad(handelser);
  const verksamhet = hittaOvkVerksamhet(handelser);

  if (bostad || verksamhet) {
    return {
      bostadAktiv: Boolean(bostad),
      bostadIntervallAr:
        bostad?.intervallAr === 3 || bostad?.intervallAr === 6
          ? bostad.intervallAr
          : OVK_INTERVALL_BOSTAD_AR,
      bostadStartAr: bostad?.startAr ?? basAr,
      verksamhetAktiv: Boolean(verksamhet),
      verksamhetStartAr: verksamhet?.startAr ?? bostad?.startAr ?? basAr,
    };
  }

  if (redigera && arOvkIntervallHandelse(redigera)) {
    const intervall =
      redigera.intervallAr === 3 || redigera.intervallAr === 6
        ? redigera.intervallAr
        : OVK_INTERVALL_BOSTAD_AR;
    const arVerksamhet = arOvkVerksamhetHandelse(redigera);
    return {
      bostadAktiv: !arVerksamhet,
      bostadIntervallAr: arVerksamhet ? OVK_INTERVALL_BOSTAD_AR : intervall,
      bostadStartAr: redigera.startAr ?? basAr,
      verksamhetAktiv: arVerksamhet,
      verksamhetStartAr: redigera.startAr ?? basAr,
    };
  }

  return skapaDefaultOvkDual(basAr);
}

function nyttOvkId(
  typ: "bostad" | "verksamhet",
  handelser: ArshjulHandelse[],
): string {
  const standard =
    typ === "bostad" ? OVK_BOSTAD_STANDARD_ID : OVK_VERKSAMHET_STANDARD_ID;
  if (!handelser.some((h) => h.id === standard)) return standard;
  return skapaHandelseId();
}

/** Skapar/uppdaterar OVK-rader utifrån dual-formulär. */
export function byggOvkHandelser(opts: {
  config: OvkDualConfig;
  handelser: ArshjulHandelse[];
  mall: Pick<
    ArshjulHandelse,
    "utanFastDatum" | "paminnelseDagar" | "manad" | "dag" | "skapad" | "externKalla" | "externId"
  >;
}): { spara: ArshjulHandelse[]; taBortIds: string[] } {
  const { config, handelser, mall } = opts;
  const bostadBefintlig = hittaOvkBostad(handelser);
  const verksamBefintlig = hittaOvkVerksamhet(handelser);
  const spara: ArshjulHandelse[] = [];
  const taBortIds: string[] = [];

  if (config.bostadAktiv) {
    spara.push(
      normaliseraHandelse({
        ...(bostadBefintlig ?? {}),
        id: bostadBefintlig?.id ?? nyttOvkId("bostad", handelser),
        titel: "OVK — bostäder",
        beskrivning:
          "Obligatorisk ventilationskontroll för bostäder. Intervall 3 eller 6 år beroende på ventilationssystem. Ange planerat år — exakt datum bestäms under året.",
        kategori: "ovk",
        typ: "intervall",
        startAr: config.bostadStartAr,
        intervallAr: config.bostadIntervallAr,
        utanFastDatum: mall.utanFastDatum ?? true,
        paminnelseDagar: mall.paminnelseDagar ?? [...STANDARD_PAMINNELSE_DAGAR],
        klar: bostadBefintlig?.klar ?? false,
        senastKlarAr: bostadBefintlig?.senastKlarAr,
        klarDatum: bostadBefintlig?.klarDatum,
        skapad: bostadBefintlig?.skapad ?? mall.skapad,
        externKalla: bostadBefintlig?.externKalla ?? mall.externKalla,
        externId: bostadBefintlig?.externId ?? mall.externId,
      }),
    );
  } else if (bostadBefintlig) {
    taBortIds.push(bostadBefintlig.id);
  }

  if (config.verksamhetAktiv) {
    spara.push(
      normaliseraHandelse({
        ...(verksamBefintlig ?? {}),
        id: verksamBefintlig?.id ?? nyttOvkId("verksamhet", handelser),
        titel: "OVK — verksamhet",
        beskrivning:
          "OVK för verksamhetslokaler och butiker — vart 3:e år. Ange planerat år — exakt datum bestäms under året.",
        kategori: "ovk",
        typ: "intervall",
        startAr: config.verksamhetStartAr,
        intervallAr: OVK_INTERVALL_VERKSAMHET_AR,
        utanFastDatum: mall.utanFastDatum ?? true,
        paminnelseDagar: mall.paminnelseDagar ?? [...STANDARD_PAMINNELSE_DAGAR],
        klar: verksamBefintlig?.klar ?? false,
        senastKlarAr: verksamBefintlig?.senastKlarAr,
        klarDatum: verksamBefintlig?.klarDatum,
        skapad: verksamBefintlig?.skapad ?? mall.skapad,
        externKalla: verksamBefintlig?.externKalla ?? mall.externKalla,
        externId: verksamBefintlig?.externId ?? mall.externId,
      }),
    );
  } else if (verksamBefintlig) {
    taBortIds.push(verksamBefintlig.id);
  }

  return { spara, taBortIds };
}
