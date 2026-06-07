import {
  formatSummeringTal,
  parseNummerSumma,
  type ListaSummeringRad,
} from "@/components/underhallsplan/lista-summering";

/** Radiatorer och värmerör under Värmecentral. */

export type RadiatorHusTypId = "aldre" | "nyare";

/** Ett-rör eller två-rör — kan variera mellan byggnadsdelar. */
export type RadiatorRorsystemId = "ett-ror" | "tva-ror" | "blandat" | "";

export type RadiatorHusGrupp = {
  /** Radiatortermostat — regulatorn ovanpå ventilen. */
  termostatAntal: string;
  /** Ventilunderdel / radiatorventil (t.ex. Danfoss RA-N) — inte styrventil på stam. */
  radiatorventilAntal: string;
  /** Radiatorkoppel — anslutning mellan rör och radiator. */
  radiatorkoppelAntal: string;
  /** Packbox — tätning i ventilskaftet, separat från ventilhuset. */
  packboxAntal: string;
  helRadiatorAntal: string;
};

/** Legacy-fält vid inläsning av äldre sparad data. */
type RadiatorHusGruppLegacy = Partial<RadiatorHusGrupp> & {
  ventilAntal?: string;
};

export type VvsRadiatorData = {
  rorsystem: RadiatorRorsystemId;
  aldre: RadiatorHusGrupp;
  nyare: RadiatorHusGrupp;
  varmerorMeter: string;
};

export const radiatorRorsystemAlternativ: {
  id: RadiatorRorsystemId;
  etikett: string;
  beskrivning: string;
}[] = [
  {
    id: "",
    etikett: "— Ej angivet —",
    beskrivning: "",
  },
  {
    id: "ett-ror",
    etikett: "Ett-rörssystem",
    beskrivning:
      "Ett cirkulationsrör — varmt vatten går i serie genom radiatorerna.",
  },
  {
    id: "tva-ror",
    etikett: "Två-rörssystem",
    beskrivning:
      "Tillrör och returrör — vanligast i nyare flerbostadshus.",
  },
  {
    id: "blandat",
    etikett: "Blandat",
    beskrivning: "Olika delar av fastigheten har ett- respektive två-rör.",
  },
];

export const radiatorHusTyper: {
  id: RadiatorHusTypId;
  etikett: string;
  beskrivning: string;
}[] = [
  {
    id: "aldre",
    etikett: "Äldre radiatorer",
    beskrivning:
      "T.ex. plåt-, gjutjärns- eller äldre panelradiatorer — andra ventiltyper och packboxar.",
  },
  {
    id: "nyare",
    etikett: "Nyare radiatorer",
    beskrivning:
      "T.ex. moderna panelradiatorer, ofta lågtemperaturanpassade från nyproduktion.",
  },
];

export const radiatorAtgardFalt: {
  key: keyof RadiatorHusGrupp;
  etikett: string;
  beskrivning: string;
}[] = [
  {
    key: "termostatAntal",
    etikett: "Byte termostat",
    beskrivning:
      "Radiatortermostat (regulatorn ovanpå ventilen) — styr rumstemperaturen.",
  },
  {
    key: "radiatorventilAntal",
    etikett: "Byte radiatorventil (ventilunderdel)",
    beskrivning:
      "Ventilens underdel där termostaten sitter (t.ex. Danfoss RA-N). Inte samma som styrventil på värmestam.",
  },
  {
    key: "radiatorkoppelAntal",
    etikett: "Byte radiatorkoppel",
    beskrivning:
      "Anslutningskoppling mellan rör och radiator — kan läcka eller sätta sig.",
  },
  {
    key: "packboxAntal",
    etikett: "Byte packbox",
    beskrivning:
      "Tätning i ventilskaftet — separat del, inte själva ventilhuset.",
  },
  {
    key: "helRadiatorAntal",
    etikett: "Byte hel radiator",
    beskrivning: "Utbyte av hela radiatorn inklusive anslutningar.",
  },
];

function normaliseraHusGrupp(raw?: RadiatorHusGruppLegacy): RadiatorHusGrupp {
  return {
    termostatAntal: raw?.termostatAntal?.trim() ?? "",
    radiatorventilAntal:
      raw?.radiatorventilAntal?.trim() ?? raw?.ventilAntal?.trim() ?? "",
    radiatorkoppelAntal: raw?.radiatorkoppelAntal?.trim() ?? "",
    packboxAntal: raw?.packboxAntal?.trim() ?? "",
    helRadiatorAntal: raw?.helRadiatorAntal?.trim() ?? "",
  };
}

export function normaliseraVvsRadiatorData(
  raw?: Partial<VvsRadiatorData> & {
    aldre?: RadiatorHusGruppLegacy;
    nyare?: RadiatorHusGruppLegacy;
  },
): VvsRadiatorData {
  const rorsystem = raw?.rorsystem ?? "";
  const giltigtRorsystem = radiatorRorsystemAlternativ.some(
    (a) => a.id === rorsystem,
  )
    ? (rorsystem as RadiatorRorsystemId)
    : "";

  return {
    rorsystem: giltigtRorsystem,
    aldre: normaliseraHusGrupp(raw?.aldre),
    nyare: normaliseraHusGrupp(raw?.nyare),
    varmerorMeter: raw?.varmerorMeter?.trim() ?? "",
  };
}

export function skapaTomRadiatorHusGrupp(): RadiatorHusGrupp {
  return normaliseraHusGrupp();
}

export function skapaTomVvsRadiatorData(): VvsRadiatorData {
  return normaliseraVvsRadiatorData();
}

function formateraHusGrupp(
  etikett: string,
  grupp: RadiatorHusGrupp,
): string | null {
  const delar: string[] = [];
  for (const falt of radiatorAtgardFalt) {
    const v = grupp[falt.key].trim();
    if (v) delar.push(`${falt.etikett} ${v} st`);
  }
  if (delar.length === 0) return null;
  return `${etikett}: ${delar.join(", ")}`;
}

function summeraFaltTotalt(
  data: VvsRadiatorData,
  key: keyof RadiatorHusGrupp,
): number {
  return parseNummerSumma([
    data.aldre[key],
    data.nyare[key],
  ]);
}

export function summeraVvsRadiator(data: VvsRadiatorData): ListaSummeringRad[] {
  const normaliserad = normaliseraVvsRadiatorData(data);
  const rader: ListaSummeringRad[] = [];

  if (normaliserad.rorsystem) {
    const etikett =
      radiatorRorsystemAlternativ.find((a) => a.id === normaliserad.rorsystem)
        ?.etikett ?? normaliserad.rorsystem;
    rader.push({ etikett: "Rörsystem", varde: etikett });
  }

  for (const hus of radiatorHusTyper) {
    const grupp = normaliserad[hus.id];
    for (const falt of radiatorAtgardFalt) {
      const v = grupp[falt.key].trim();
      if (!v) continue;
      const n = parseNummerSumma([v]);
      rader.push({
        etikett: `${hus.etikett} — ${falt.etikett}`,
        varde: n > 0 ? `${formatSummeringTal(n, 0)} st` : `${v} st`,
      });
    }
  }

  const varmeror = normaliserad.varmerorMeter.trim();
  if (varmeror) {
    const n = parseNummerSumma([varmeror]);
    rader.push({
      etikett: "Värmerör",
      varde: n > 0 ? `${formatSummeringTal(n)} m` : `${varmeror} m`,
    });
  }

  const termostatTot = summeraFaltTotalt(normaliserad, "termostatAntal");
  if (termostatTot > 0) {
    rader.push({
      etikett: "Termostater totalt",
      varde: `${formatSummeringTal(termostatTot, 0)} st`,
    });
  }

  const ventilTot = summeraFaltTotalt(normaliserad, "radiatorventilAntal");
  if (ventilTot > 0) {
    rader.push({
      etikett: "Radiatorventiler totalt",
      varde: `${formatSummeringTal(ventilTot, 0)} st`,
    });
  }

  return rader;
}

export function formateraVvsRadiator(data: VvsRadiatorData): string {
  const normaliserad = normaliseraVvsRadiatorData(data);
  const delar: string[] = [];

  if (normaliserad.rorsystem) {
    const etikett =
      radiatorRorsystemAlternativ.find((a) => a.id === normaliserad.rorsystem)
        ?.etikett ?? normaliserad.rorsystem;
    delar.push(etikett);
  }

  const aldre = formateraHusGrupp("Äldre", normaliserad.aldre);
  const nyare = formateraHusGrupp("Nyare", normaliserad.nyare);
  if (aldre) delar.push(aldre);
  if (nyare) delar.push(nyare);
  if (normaliserad.varmerorMeter.trim()) {
    delar.push(`Värmerör ${normaliserad.varmerorMeter.trim()} m`);
  }
  return delar.join(" · ");
}
