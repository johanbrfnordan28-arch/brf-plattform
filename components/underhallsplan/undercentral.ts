import { type ListaSummeringRad } from "@/components/underhallsplan/lista-summering";

/**
 * Undercentralen ligger vanligtvis i källaren — oftast en per hus.
 * Huvudsystem väljs i rullista. Kompletterande återvinning och andra
 * delar i källaren kan läggas till separat.
 */

export const UNDERCENTRAL_UNDERKOMPONENT_ID = "undercentral";

/** Huvudsystem för uppvärmning — ett val. */
export const uppvarmningHuvudsystem: {
  id: string;
  etikett: string;
  beskrivning: string;
}[] = [
  {
    id: "fjarrvarme",
    etikett: "Fjärrvärme",
    beskrivning:
      "Vanligast i flerbostadshus. Undercentral med växlare mot fjärrvärmenätet för både värme och tappvarmvatten.",
  },
  {
    id: "narvarme",
    etikett: "Närvärme",
    beskrivning:
      "Lokalt fjärrvärmeliknande nät, ofta inom ett kvarter eller område.",
  },
  {
    id: "bergvarme",
    etikett: "Bergvärme",
    beskrivning:
      "Värmepump med energibrunnar. Kräver ofta flera borrhål i flerbostadshus.",
  },
  {
    id: "franluftsvarmepump",
    etikett: "Frånluftsvärmepump",
    beskrivning:
      "Återvinner värme ur frånluften till värme och/eller varmvatten. Kräver mekanisk frånluft.",
  },
  {
    id: "luftvatten",
    etikett: "Luft-vattenvärmepump",
    beskrivning: "Utedel och värmepump mot vattenburet värmesystem.",
  },
  {
    id: "jordvarme",
    etikett: "Jordvärme / ytjordvärme",
    beskrivning: "Värmepump med kollektorslang i marken.",
  },
  {
    id: "sjovarme",
    etikett: "Sjö- / ytvattenvärme",
    beskrivning: "Värmepump som tar värme ur sjö eller vattendrag.",
  },
  {
    id: "pellet",
    etikett: "Pelletspanna",
    beskrivning: "Panna med pelletsförråd, kopplad till vattenburet system.",
  },
  {
    id: "vedpanna",
    etikett: "Vedpanna",
    beskrivning: "Äldre eller mindre anläggningar med vedeldning.",
  },
  {
    id: "elpanna",
    etikett: "Elpanna",
    beskrivning: "Elpanna som huvudsystem eller reserv/spets.",
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
    id: "direktverkande-el",
    etikett: "Direktverkande el",
    beskrivning:
      "Elelement eller elgolvvärme utan gemensam undercentral. Ofta egna varmvattenberedare i lägenheterna.",
  },
  {
    id: "annat",
    etikett: "Annat huvudsystem",
    beskrivning: "Beskriv systemet i fritext.",
  },
];

/**
 * Kompletterande delar som ofta sitter i eller hör till undercentralen /
 * källaren — kan kombineras med huvudsystemet.
 */
export const uppvarmningKompletterande: {
  id: string;
  etikett: string;
  beskrivning: string;
}[] = [
  {
    id: "franlufts-atervinning",
    etikett: "Frånluftsåtervinning (FX)",
    beskrivning:
      "Värmeåtervinning ur frånluft via batteri/växlare, ofta som komplement till fjärrvärme.",
  },
  {
    id: "spillvattenatervinning",
    etikett: "Spillvattenvärmeåtervinning",
    beskrivning: "Återvinner värme ur avloppsvatten.",
  },
  {
    id: "solvarme",
    etikett: "Solvärme (solfångare)",
    beskrivning: "Solfångare som komplement till varmvatten eller värme.",
  },
  {
    id: "solceller",
    etikett: "Solceller",
    beskrivning:
      "Elproduktion som ofta samverkar med värmepump, elpatron eller fastighetsel.",
  },
  {
    id: "bergvarme-komplement",
    etikett: "Bergvärme som komplement",
    beskrivning: "Bergvärme tillsammans med t.ex. fjärrvärme eller sol.",
  },
  {
    id: "ackumulatortank",
    etikett: "Ackumulatortank",
    beskrivning: "Lagring av värme i tank, vanligt vid panna eller solvärme.",
  },
  {
    id: "elpatron",
    etikett: "Elpatron / spetsvärme",
    beskrivning: "Elspets vid högt effektbehov eller som reserv.",
  },
  {
    id: "individuella-vvb",
    etikett: "Egna varmvattenberedare",
    beskrivning:
      "Varmvattenberedare per lägenhet — vanligt vid direktverkande el.",
  },
  {
    id: "luftluft",
    etikett: "Luft-luftvärmepump",
    beskrivning:
      "Komplement, oftast i mindre hus eller till direktverkande el — sällan huvudsystem i stora flerbostadshus.",
  },
  {
    id: "annat-komplement",
    etikett: "Annat komplement",
    beskrivning: "Beskriv tillägget i fritext.",
  },
];

/** Bakåtkompatibilitet: äldre checklista med alla system. */
export const uppvarmningSystem = [
  ...uppvarmningHuvudsystem,
  ...uppvarmningKompletterande.filter(
    (k) => !uppvarmningHuvudsystem.some((h) => h.id === k.id),
  ),
];

export type UndercentralBild = {
  id: string;
  dataUrl: string;
  filnamn: string;
};

export type UndercentralData = {
  /**
   * Äldre fält — flyttat till Värmestammar som horisontell stamledning värme.
   * @deprecated
   */
  tilloppLopmeter?: string;
  /**
   * Äldre fält — flyttat till Värmestammar som horisontell stamledning värme.
   * @deprecated
   */
  returLopmeter?: string;
  /** Ett huvudsystem (rullista). */
  huvudsystem: string;
  /** Fritext när huvudsystem är «Annat». */
  huvudsystemAnnat: string;
  /** Kompletterande återvinning och källardelar. */
  kompletterande: string[];
  /** Fritext när «Annat komplement» är valt. */
  kompletterandeAnnat: string;
  bilder: UndercentralBild[];
  /**
   * Äldre fält — migreras till huvudsystemAnnat.
   * @deprecated
   */
  systemAnnat?: string;
};

export function skapaTomUndercentralData(): UndercentralData {
  return {
    huvudsystem: "",
    huvudsystemAnnat: "",
    kompletterande: [],
    kompletterandeAnnat: "",
    bilder: [],
  };
}

function arHuvudsystemId(id: string): boolean {
  return uppvarmningHuvudsystem.some((s) => s.id === id);
}

function arKompletterandeId(id: string): boolean {
  return uppvarmningKompletterande.some((s) => s.id === id);
}

/** Mappar äldre system-id till nytt huvud- eller komplement-id. */
function mappaLegacySystemId(id: string): {
  huvud?: string;
  komplement?: string;
} {
  if (id === "solvarme") return { komplement: "solvarme" };
  if (id === "bergvarme") return { huvud: "bergvarme" };
  if (arHuvudsystemId(id)) return { huvud: id };
  if (arKompletterandeId(id)) return { komplement: id };
  return {};
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

/**
 * Normaliserar undercentraldata och kan ta in äldre valdaDeltyper
 * (från när system sparades på komponentnivå).
 */
export function normaliseraUndercentralData(
  raw?: Partial<UndercentralData> | null,
  legacySystem: string[] = [],
): UndercentralData {
  const legacyAnnat =
    typeof raw?.systemAnnat === "string" ? raw.systemAnnat.trim() : "";
  let huvudsystem =
    typeof raw?.huvudsystem === "string" ? raw.huvudsystem.trim() : "";
  let huvudsystemAnnat =
    typeof raw?.huvudsystemAnnat === "string"
      ? raw.huvudsystemAnnat.trim()
      : legacyAnnat;
  let kompletterande = Array.isArray(raw?.kompletterande)
    ? raw.kompletterande.filter((id) => typeof id === "string" && id.trim())
    : [];
  const kompletterandeAnnat =
    typeof raw?.kompletterandeAnnat === "string"
      ? raw.kompletterandeAnnat.trim()
      : "";

  if (!huvudsystem && legacySystem.length > 0) {
    for (const id of legacySystem) {
      const mappad = mappaLegacySystemId(id);
      if (mappad.huvud && !huvudsystem) huvudsystem = mappad.huvud;
      else if (mappad.komplement) kompletterande.push(mappad.komplement);
      else if (mappad.huvud && huvudsystem) {
        // Redan har huvud — övriga huvudsystem blir komplement om möjligt
        if (mappad.huvud === "bergvarme") {
          kompletterande.push("bergvarme-komplement");
        }
      }
    }
  }

  if (huvudsystem && !arHuvudsystemId(huvudsystem)) {
    if (!huvudsystemAnnat) huvudsystemAnnat = huvudsystem;
    huvudsystem = "annat";
  }

  kompletterande = [
    ...new Set(
      kompletterande
        .map((id) => {
          if (arKompletterandeId(id)) return id;
          const mappad = mappaLegacySystemId(id);
          return mappad.komplement ?? "";
        })
        .filter(Boolean),
    ),
  ];

  // Undvik dubbel bergvärme om det redan är huvudsystem
  if (huvudsystem === "bergvarme") {
    kompletterande = kompletterande.filter((id) => id !== "bergvarme-komplement");
  }

  return {
    // Behåll legacy-värden så de kan migreras till Värmestammar.
    tilloppLopmeter: raw?.tilloppLopmeter?.trim() ?? "",
    returLopmeter: raw?.returLopmeter?.trim() ?? "",
    huvudsystem,
    huvudsystemAnnat: huvudsystem === "annat" ? huvudsystemAnnat : "",
    kompletterande,
    kompletterandeAnnat: kompletterande.includes("annat-komplement")
      ? kompletterandeAnnat
      : "",
    bilder: normaliseraUndercentralBilder(raw?.bilder),
  };
}

export function uppvarmningHuvudsystemEtikett(
  id: string,
  annat = "",
): string {
  if (id === "annat") return annat.trim() || "Annat huvudsystem";
  return uppvarmningHuvudsystem.find((s) => s.id === id)?.etikett ?? id;
}

export function uppvarmningKompletterandeEtikett(
  id: string,
  annat = "",
): string {
  if (id === "annat-komplement") return annat.trim() || "Annat komplement";
  return uppvarmningKompletterande.find((s) => s.id === id)?.etikett ?? id;
}

/** Bakåtkompatibilitet för äldre anrop. */
export function uppvarmningSystemEtikett(id: string, systemAnnat = ""): string {
  if (arHuvudsystemId(id) || id === "annat") {
    return uppvarmningHuvudsystemEtikett(id, systemAnnat);
  }
  return uppvarmningKompletterandeEtikett(id, systemAnnat);
}

/** Alla valda system-id (huvud + komplement) — för legacy valdaDeltyper. */
export function undercentralValdaSystemId(data: UndercentralData): string[] {
  const d = normaliseraUndercentralData(data);
  const idn: string[] = [];
  if (d.huvudsystem) idn.push(d.huvudsystem);
  idn.push(...d.kompletterande);
  return idn;
}

export function summeraUndercentral(_data: UndercentralData): ListaSummeringRad[] {
  // Horisontell stamledning värme registreras under Värmestammar.
  return [];
}

export function formateraUndercentral(
  data: UndercentralData,
  legacySystem: string[] = [],
): string {
  const d = normaliseraUndercentralData(data, legacySystem);
  const delar: string[] = [];
  if (d.huvudsystem) {
    delar.push(uppvarmningHuvudsystemEtikett(d.huvudsystem, d.huvudsystemAnnat));
  }
  if (d.kompletterande.length > 0) {
    delar.push(
      d.kompletterande
        .map((id) =>
          uppvarmningKompletterandeEtikett(id, d.kompletterandeAnnat),
        )
        .join(", "),
    );
  } else if (!d.huvudsystem && d.huvudsystemAnnat) {
    delar.push(d.huvudsystemAnnat);
  }
  const rader = summeraUndercentral(d);
  delar.push(...rader.map((r) => `${r.etikett} ${r.varde}`));
  if (d.bilder.length > 0) {
    delar.push(d.bilder.length === 1 ? "med bild" : `${d.bilder.length} bilder`);
  }
  return delar.join(", ");
}

export function undercentralArDirektverkandeEl(data: UndercentralData): boolean {
  return normaliseraUndercentralData(data).huvudsystem === "direktverkande-el";
}
