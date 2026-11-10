import {
  formatSummeringTal,
  parseNummerSumma,
  type ListaSummeringRad,
} from "@/components/underhallsplan/lista-summering";

/**
 * Undercentralen ligger vanligtvis i källaren.
 * Löpmeter avser de horisontella ledningarna där — tillopp och retur var för sig.
 */

export const UNDERCENTRAL_UNDERKOMPONENT_ID = "undercentral";

/** Värmesystem som är vanliga i flerbostadshus. Flera kan gälla samtidigt. */
export const uppvarmningSystem: {
  id: string;
  etikett: string;
  beskrivning: string;
}[] = [
  {
    id: "fjarrvarme",
    etikett: "Fjärrvärme",
    beskrivning: "Vanligast. Undercentral med växlare mot fjärrvärmenätet.",
  },
  {
    id: "bergvarme",
    etikett: "Bergvärme",
    beskrivning: "Värmepump med borrhål.",
  },
  {
    id: "franluftsvarmepump",
    etikett: "Frånluftsvärmepump",
    beskrivning: "Återvinner värme ur frånluften.",
  },
  {
    id: "luftvatten",
    etikett: "Luft-vattenvärmepump",
    beskrivning: "Utedel och värmepump mot värmesystemet.",
  },
  {
    id: "pellet",
    etikett: "Pelletspanna",
    beskrivning: "Panna med pelletsförråd.",
  },
  {
    id: "elpanna",
    etikett: "Elpanna",
    beskrivning: "Elpanna, ofta som spets eller eget system.",
  },
  {
    id: "gaspanna",
    etikett: "Gaspanna",
    beskrivning: "Gaspanna där gasnät finns.",
  },
  {
    id: "olja",
    etikett: "Oljepanna",
    beskrivning: "Äldre anläggning som fortfarande kan finnas kvar.",
  },
  {
    id: "solvarme",
    etikett: "Solvärme",
    beskrivning: "Ofta ett komplement till ett annat system.",
  },
  {
    id: "annat",
    etikett: "Annat system",
    beskrivning: "Beskriv systemet i fritext.",
  },
];

export type UndercentralBild = {
  id: string;
  dataUrl: string;
  filnamn: string;
};

export type UndercentralData = {
  /** Horisontell tilloppsledning i källaren, meter. */
  tilloppLopmeter: string;
  /** Horisontell returledning i källaren, meter. */
  returLopmeter: string;
  /** Fritext när systemet är «Annat system». */
  systemAnnat: string;
  bilder: UndercentralBild[];
};

export function skapaTomUndercentralData(): UndercentralData {
  return {
    tilloppLopmeter: "",
    returLopmeter: "",
    systemAnnat: "",
    bilder: [],
  };
}

function normaliseraUndercentralBilder(raw: unknown): UndercentralBild[] {
  if (!Array.isArray(raw)) return [];
  const bilder: UndercentralBild[] = [];
  raw.forEach((post, index) => {
    if (!post || typeof post !== "object") return;
    const kalla = post as Partial<UndercentralBild>;
    const dataUrl =
      typeof kalla.dataUrl === "string" && kalla.dataUrl.startsWith("data:image/")
        ? kalla.dataUrl
        : "";
    if (!dataUrl) return;
    bilder.push({
      id:
        typeof kalla.id === "string" && kalla.id.trim()
          ? kalla.id
          : `uc-bild-${index + 1}`,
      dataUrl,
      filnamn: typeof kalla.filnamn === "string" ? kalla.filnamn : "",
    });
  });
  return bilder;
}

export function normaliseraUndercentralData(
  raw?: Partial<UndercentralData> | null,
): UndercentralData {
  return {
    tilloppLopmeter: raw?.tilloppLopmeter?.trim() ?? "",
    returLopmeter: raw?.returLopmeter?.trim() ?? "",
    systemAnnat: raw?.systemAnnat?.trim() ?? "",
    bilder: normaliseraUndercentralBilder(raw?.bilder),
  };
}

export function uppvarmningSystemEtikett(id: string, systemAnnat = ""): string {
  if (id === "annat") return systemAnnat.trim() || "Annat system";
  return uppvarmningSystem.find((s) => s.id === id)?.etikett ?? id;
}

export function summeraUndercentral(data: UndercentralData): ListaSummeringRad[] {
  const rader: ListaSummeringRad[] = [];
  const tillopp = parseNummerSumma([data.tilloppLopmeter]);
  const retur = parseNummerSumma([data.returLopmeter]);
  if (tillopp > 0) {
    rader.push({
      etikett: "Horisontell tillopp",
      varde: `${formatSummeringTal(tillopp)} m`,
    });
  }
  if (retur > 0) {
    rader.push({
      etikett: "Horisontell retur",
      varde: `${formatSummeringTal(retur)} m`,
    });
  }
  return rader;
}

export function formateraUndercentral(
  data: UndercentralData,
  system: string[] = [],
): string {
  const d = normaliseraUndercentralData(data);
  const rader = summeraUndercentral(d);
  const delar = rader.map((r) => `${r.etikett} ${r.varde}`);
  const systemText = system
    .filter((id) => uppvarmningSystem.some((s) => s.id === id))
    .map((id) => uppvarmningSystemEtikett(id, d.systemAnnat))
    .join(", ");
  if (systemText) delar.unshift(systemText);
  else if (d.systemAnnat) delar.push(d.systemAnnat);
  if (d.bilder.length > 0) {
    delar.push(d.bilder.length === 1 ? "med bild" : `${d.bilder.length} bilder`);
  }
  return delar.join(", ");
}
