/**
 * Stomme och grund — registrering, FAR-fördelning och frivillig uppdelning.
 *
 * Redovisningsmässig komponentindelning (K3/FAR) skiljs från underhållsansvar
 * och från planerade framtida underhållskostnader.
 */

export const STOMME_UNDERKOMPONENT_ID = "stomme";

/** FAR:s vägledande intervall 60–70 % — förslaget i UI är mittvärdet. */
export const FAR_STOMME_ANDEL_MIN = 60;
export const FAR_STOMME_ANDEL_MAX = 70;
export const FAR_STOMME_FORESLAGEN_PROCENT = 65;

export const STOMME_KONSTRUKTIONSDELAR = [
  {
    id: "grundlaggning",
    etikett: "Grundläggning och grundkonstruktion",
  },
  {
    id: "barande-yttervaggar",
    etikett: "Bärande ytterväggar",
  },
  {
    id: "barande-lagenhetsskiljande",
    etikett: "Bärande lägenhetsskiljande väggar",
  },
  {
    id: "barande-trapphus",
    etikett: "Bärande väggar mot trapphus",
  },
  {
    id: "bjalklag",
    etikett: "Bjälklag",
  },
  {
    id: "pelare-balkar",
    etikett: "Pelare och balkar",
  },
  {
    id: "ovrig-barande",
    etikett: "Övriga bärande konstruktioner",
  },
] as const;

export type StommeKonstruktionsdelId =
  (typeof STOMME_KONSTRUKTIONSDELAR)[number]["id"];

export const STOMME_MATERIAL = [
  { id: "betong", etikett: "Betong" },
  { id: "tegel", etikett: "Tegel" },
  { id: "tra", etikett: "Trä" },
  { id: "stal", etikett: "Stål" },
  { id: "lattbetong", etikett: "Lättbetong" },
  { id: "annat", etikett: "Annat" },
] as const;

export type StommeMaterialId = (typeof STOMME_MATERIAL)[number]["id"];

/** Frivillig uppdelning — inte en officiell FAR-schablon. */
export const STOMME_UNDERKOMPONENTER = [
  { id: "grundlaggning", etikett: "Grundläggning" },
  { id: "barande-vaggar", etikett: "Bärande väggar" },
  { id: "bjalklag", etikett: "Bjälklag" },
  { id: "pelare-balkar", etikett: "Pelare och balkar" },
  { id: "ovrig-stomme", etikett: "Övrig stomme" },
] as const;

export type StommeUnderkomponentId =
  (typeof STOMME_UNDERKOMPONENTER)[number]["id"];

export type StommeAnskaffningskalla =
  | "ekonomisk-plan"
  | "arsredovisning"
  | "anlaggningsregister"
  | "annat"
  | "";

export const STOMME_ANSKAFFNINGSKALLOR: {
  id: Exclude<StommeAnskaffningskalla, "">;
  etikett: string;
}[] = [
  { id: "ekonomisk-plan", etikett: "Föreningens ekonomiska plan" },
  { id: "arsredovisning", etikett: "Årsredovisningen" },
  { id: "anlaggningsregister", etikett: "Anläggningsregistret" },
  { id: "annat", etikett: "Annat dokumenterat underlag" },
];

export type StommeSkickId =
  | "bra"
  | "normalt"
  | "anmarkningar"
  | "allvarligt"
  | "";

export const STOMME_SKICK: { id: Exclude<StommeSkickId, "">; etikett: string }[] =
  [
    { id: "bra", etikett: "Bra — inga kända skador" },
    { id: "normalt", etikett: "Normalt för åldern" },
    { id: "anmarkningar", etikett: "Anmärkningar som bör följas upp" },
    { id: "allvarligt", etikett: "Allvarliga skador / åtgärdsbehov" },
  ];

export type StommeKonstruktionsdelRad = {
  id: StommeKonstruktionsdelId;
  vald: boolean;
  materialId: StommeMaterialId | "";
  materialAnnat?: string;
};

export type StommeUnderkomponentAndel = {
  id: StommeUnderkomponentId;
  procent: string;
};

export type StommeData = {
  konstruktionsdelar: StommeKonstruktionsdelRad[];
  kommentar?: string;
  /** Byggnadens historiska anskaffningsvärde (exkl. mark). Får lämnas tomt. */
  byggnadsAnskaffningsvardeKr?: string;
  /** Markvärde — hålls separat från byggnadens anskaffningsvärde. */
  markAnskaffningsvardeKr?: string;
  anskaffningskalla?: StommeAnskaffningskalla;
  anskaffningskallaAnnat?: string;
  anskaffningsAr?: string;
  anskaffningsKommentar?: string;
  /**
   * FAR-förslag (redigerbart). Standard 65 — inte ett fastställt värde
   * för föreningen.
   */
  farAndelProcent?: string;
  /**
   * Eget dokumenterat komponentvärde. Om ifyllt används det i stället för
   * FAR-procent × byggnadsanskaffning.
   */
  egetKomponentvardeKr?: string;
  /** Standard: samlad komponent. */
  uppdelning: "samlad" | "uppdelad";
  underkomponentAndelar?: StommeUnderkomponentAndel[];
  skick?: StommeSkickId;
  skadorAnteckning?: string;
  undersokningarAnteckning?: string;
  fortsattKontroll?: boolean;
  fortsattKontrollAnteckning?: string;
  atgarderAnteckning?: string;
  underhallsansvarAnteckning?: string;
};

export type StommeRegister = Record<string, StommeData>;

function tomKonstruktionsdelar(): StommeKonstruktionsdelRad[] {
  return STOMME_KONSTRUKTIONSDELAR.map((d) => ({
    id: d.id,
    vald: false,
    materialId: "" as const,
    materialAnnat: "",
  }));
}

function tomUnderkomponentAndelar(): StommeUnderkomponentAndel[] {
  return STOMME_UNDERKOMPONENTER.map((u) => ({
    id: u.id,
    procent: "",
  }));
}

export function tomStommeData(): StommeData {
  return {
    konstruktionsdelar: tomKonstruktionsdelar(),
    kommentar: "",
    byggnadsAnskaffningsvardeKr: "",
    markAnskaffningsvardeKr: "",
    anskaffningskalla: "",
    anskaffningskallaAnnat: "",
    anskaffningsAr: "",
    anskaffningsKommentar: "",
    farAndelProcent: String(FAR_STOMME_FORESLAGEN_PROCENT),
    egetKomponentvardeKr: "",
    uppdelning: "samlad",
    underkomponentAndelar: tomUnderkomponentAndelar(),
    skick: "",
    skadorAnteckning: "",
    undersokningarAnteckning: "",
    fortsattKontroll: false,
    fortsattKontrollAnteckning: "",
    atgarderAnteckning: "",
    underhallsansvarAnteckning: "",
  };
}

export function parseKrBelopp(text?: string | null): number {
  const n = Number.parseFloat(
    String(text ?? "")
      .replace(/\s/g, "")
      .replace(",", "."),
  );
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export function parseProcent(text?: string | null): number {
  const n = Number.parseFloat(
    String(text ?? "")
      .replace(/\s/g, "")
      .replace(",", "."),
  );
  return Number.isFinite(n) ? n : NaN;
}

export function formateraKr(belopp: number): string {
  return new Intl.NumberFormat("sv-SE", {
    maximumFractionDigits: 0,
  }).format(Math.round(belopp));
}

/**
 * Beräknar komponentvärde för stomme och grund.
 * Prioritet: eget dokumenterat värde → FAR-% av byggnadsanskaffning → 0.
 */
export function beraknaStommeKomponentvarde(data: StommeData): {
  komponentvardeKr: number;
  kalla: "eget" | "far-procent" | "saknas";
  farProcent: number;
  byggnadsAnskaffningKr: number;
} {
  const eget = parseKrBelopp(data.egetKomponentvardeKr);
  const byggnad = parseKrBelopp(data.byggnadsAnskaffningsvardeKr);
  const farRaw = parseProcent(data.farAndelProcent);
  const farProcent = Number.isFinite(farRaw)
    ? farRaw
    : FAR_STOMME_FORESLAGEN_PROCENT;

  if (eget > 0) {
    return {
      komponentvardeKr: Math.round(eget),
      kalla: "eget",
      farProcent,
      byggnadsAnskaffningKr: byggnad,
    };
  }
  if (byggnad > 0 && farProcent > 0) {
    return {
      komponentvardeKr: Math.round((byggnad * farProcent) / 100),
      kalla: "far-procent",
      farProcent,
      byggnadsAnskaffningKr: byggnad,
    };
  }
  return {
    komponentvardeKr: 0,
    kalla: "saknas",
    farProcent,
    byggnadsAnskaffningKr: byggnad,
  };
}

export function summeraUnderkomponentProcent(data: StommeData): number {
  const andelar = data.underkomponentAndelar ?? tomUnderkomponentAndelar();
  return andelar.reduce((s, a) => {
    const p = parseProcent(a.procent);
    return s + (Number.isFinite(p) && p > 0 ? p : 0);
  }, 0);
}

export function underkomponentFordelningOk(data: StommeData): boolean {
  if (data.uppdelning !== "uppdelad") return true;
  const summa = summeraUnderkomponentProcent(data);
  return Math.abs(summa - 100) < 0.05;
}

export type StommeUnderkomponentBerakning = {
  id: StommeUnderkomponentId;
  etikett: string;
  procent: number;
  beloppKr: number;
};

export function beraknaUnderkomponentBelopp(
  data: StommeData,
): StommeUnderkomponentBerakning[] {
  const { komponentvardeKr } = beraknaStommeKomponentvarde(data);
  const andelar = data.underkomponentAndelar ?? tomUnderkomponentAndelar();
  return STOMME_UNDERKOMPONENTER.map((u) => {
    const rad = andelar.find((a) => a.id === u.id);
    const procent = parseProcent(rad?.procent);
    const p = Number.isFinite(procent) && procent > 0 ? procent : 0;
    return {
      id: u.id,
      etikett: u.etikett,
      procent: p,
      beloppKr:
        komponentvardeKr > 0 && p > 0
          ? Math.round((komponentvardeKr * p) / 100)
          : 0,
    };
  });
}

function arKonstruktionsdelId(id: string): id is StommeKonstruktionsdelId {
  return STOMME_KONSTRUKTIONSDELAR.some((d) => d.id === id);
}

function arMaterialId(id: string): id is StommeMaterialId {
  return STOMME_MATERIAL.some((m) => m.id === id);
}

function arUnderkomponentId(id: string): id is StommeUnderkomponentId {
  return STOMME_UNDERKOMPONENTER.some((u) => u.id === id);
}

export function normaliseraStommeData(raw?: Partial<StommeData>): StommeData {
  const bas = tomStommeData();
  if (!raw) return bas;

  const delarFranRaw = Array.isArray(raw.konstruktionsdelar)
    ? raw.konstruktionsdelar
    : [];
  const konstruktionsdelar = STOMME_KONSTRUKTIONSDELAR.map((def) => {
    const hittad = delarFranRaw.find((d) => d?.id === def.id);
    const materialId =
      hittad?.materialId && arMaterialId(hittad.materialId)
        ? hittad.materialId
        : ("" as const);
    return {
      id: def.id,
      vald: Boolean(hittad?.vald),
      materialId,
      materialAnnat: String(hittad?.materialAnnat ?? ""),
    };
  });

  const andelarFranRaw = Array.isArray(raw.underkomponentAndelar)
    ? raw.underkomponentAndelar
    : [];
  const underkomponentAndelar = STOMME_UNDERKOMPONENTER.map((def) => {
    const hittad = andelarFranRaw.find((a) => a?.id === def.id);
    return {
      id: def.id,
      procent: String(hittad?.procent ?? ""),
    };
  });

  const kalla = raw.anskaffningskalla;
  const skick = raw.skick;
  const uppdelning =
    raw.uppdelning === "uppdelad" ? "uppdelad" : ("samlad" as const);

  return {
    konstruktionsdelar,
    kommentar: String(raw.kommentar ?? ""),
    byggnadsAnskaffningsvardeKr: String(raw.byggnadsAnskaffningsvardeKr ?? ""),
    markAnskaffningsvardeKr: String(raw.markAnskaffningsvardeKr ?? ""),
    anskaffningskalla:
      kalla === "ekonomisk-plan" ||
      kalla === "arsredovisning" ||
      kalla === "anlaggningsregister" ||
      kalla === "annat"
        ? kalla
        : "",
    anskaffningskallaAnnat: String(raw.anskaffningskallaAnnat ?? ""),
    anskaffningsAr: String(raw.anskaffningsAr ?? ""),
    anskaffningsKommentar: String(raw.anskaffningsKommentar ?? ""),
    farAndelProcent:
      String(raw.farAndelProcent ?? "").trim() ||
      String(FAR_STOMME_FORESLAGEN_PROCENT),
    egetKomponentvardeKr: String(raw.egetKomponentvardeKr ?? ""),
    uppdelning,
    underkomponentAndelar,
    skick:
      skick === "bra" ||
      skick === "normalt" ||
      skick === "anmarkningar" ||
      skick === "allvarligt"
        ? skick
        : "",
    skadorAnteckning: String(raw.skadorAnteckning ?? ""),
    undersokningarAnteckning: String(raw.undersokningarAnteckning ?? ""),
    fortsattKontroll: Boolean(raw.fortsattKontroll),
    fortsattKontrollAnteckning: String(raw.fortsattKontrollAnteckning ?? ""),
    atgarderAnteckning: String(raw.atgarderAnteckning ?? ""),
    underhallsansvarAnteckning: String(raw.underhallsansvarAnteckning ?? ""),
  };
}

export function materialEtikett(
  materialId: StommeMaterialId | "",
  materialAnnat?: string,
): string {
  if (!materialId) return "";
  if (materialId === "annat") {
    const annat = materialAnnat?.trim();
    return annat || "Annat";
  }
  return STOMME_MATERIAL.find((m) => m.id === materialId)?.etikett ?? materialId;
}

export function konstruktionsdelEtikett(id: string): string {
  if (!arKonstruktionsdelId(id)) return id;
  return STOMME_KONSTRUKTIONSDELAR.find((d) => d.id === id)?.etikett ?? id;
}

export function underkomponentEtikett(id: string): string {
  if (!arUnderkomponentId(id)) return id;
  return STOMME_UNDERKOMPONENTER.find((u) => u.id === id)?.etikett ?? id;
}

export function anskaffningskallaEtikett(data: StommeData): string {
  if (!data.anskaffningskalla) return "";
  if (data.anskaffningskalla === "annat") {
    return data.anskaffningskallaAnnat?.trim() || "Annat underlag";
  }
  return (
    STOMME_ANSKAFFNINGSKALLOR.find((k) => k.id === data.anskaffningskalla)
      ?.etikett ?? ""
  );
}

export function skickEtikett(skick: StommeSkickId | undefined): string {
  if (!skick) return "";
  return STOMME_SKICK.find((s) => s.id === skick)?.etikett ?? "";
}

/** Rader till steg 2-sammanställning — undviker dubbelräkning. */
export function formateraStommeSammanstallning(data: StommeData): {
  benamning: string;
  varde: string;
}[] {
  const d = normaliseraStommeData(data);
  const rader: { benamning: string; varde: string }[] = [];

  const valda = d.konstruktionsdelar.filter((k) => k.vald);
  if (valda.length > 0) {
    for (const del of valda) {
      const mat = materialEtikett(del.materialId, del.materialAnnat);
      rader.push({
        benamning: konstruktionsdelEtikett(del.id),
        varde: mat || "Material ej angivet",
      });
    }
  } else {
    rader.push({
      benamning: "Konstruktionsdelar",
      varde: "Inga delar valda ännu",
    });
  }

  if (d.kommentar?.trim()) {
    rader.push({ benamning: "Kommentar", varde: d.kommentar.trim() });
  }

  const beraknat = beraknaStommeKomponentvarde(d);
  if (beraknat.byggnadsAnskaffningKr > 0) {
    rader.push({
      benamning: "Byggnadens anskaffningsvärde",
      varde: `${formateraKr(beraknat.byggnadsAnskaffningKr)} kr`,
    });
  }
  const mark = parseKrBelopp(d.markAnskaffningsvardeKr);
  if (mark > 0) {
    rader.push({
      benamning: "Markvärde (separat)",
      varde: `${formateraKr(mark)} kr`,
    });
  }
  const kalla = anskaffningskallaEtikett(d);
  if (kalla) {
    rader.push({
      benamning: "Källa anskaffningsvärde",
      varde: d.anskaffningsAr?.trim()
        ? `${kalla} (${d.anskaffningsAr.trim()})`
        : kalla,
    });
  }

  if (beraknat.komponentvardeKr > 0) {
    if (beraknat.kalla === "far-procent") {
      rader.push({
        benamning: `Stomme och grund (${formateraKr(beraknat.farProcent)} % FAR-förslag)`,
        varde: `${formateraKr(beraknat.komponentvardeKr)} kr`,
      });
    } else {
      rader.push({
        benamning: "Stomme och grund (dokumenterat värde)",
        varde: `${formateraKr(beraknat.komponentvardeKr)} kr`,
      });
    }
  } else {
    rader.push({
      benamning: "Komponentvärde",
      varde: "Ej angivet",
    });
  }

  if (d.uppdelning === "uppdelad") {
    const ford = beraknaUnderkomponentBelopp(d);
    const summa = summeraUnderkomponentProcent(d);
    rader.push({
      benamning: "Uppdelning",
      varde:
        Math.abs(summa - 100) < 0.05
          ? "Underkomponenter (100 %)"
          : `Underkomponenter (summa ${formateraKr(summa)} % — ska bli 100 %)`,
    });
    for (const u of ford) {
      if (u.procent <= 0 && u.beloppKr <= 0) continue;
      rader.push({
        benamning: `  ${u.etikett}`,
        varde:
          u.beloppKr > 0
            ? `${formateraKr(u.procent)} % · ${formateraKr(u.beloppKr)} kr`
            : `${formateraKr(u.procent)} %`,
      });
    }
  } else {
    rader.push({
      benamning: "Registrering",
      varde: "Samlad komponent — stomme och grund",
    });
  }

  const skick = skickEtikett(d.skick);
  if (skick) {
    rader.push({ benamning: "Skick", varde: skick });
  }
  if (d.skadorAnteckning?.trim()) {
    rader.push({
      benamning: "Skador / observationer",
      varde: d.skadorAnteckning.trim(),
    });
  }
  if (d.undersokningarAnteckning?.trim()) {
    rader.push({
      benamning: "Undersökningar",
      varde: d.undersokningarAnteckning.trim(),
    });
  }
  if (d.fortsattKontroll) {
    rader.push({
      benamning: "Fortsatt kontroll",
      varde: d.fortsattKontrollAnteckning?.trim() || "Ja",
    });
  }
  if (d.atgarderAnteckning?.trim()) {
    rader.push({
      benamning: "Planerade åtgärder",
      varde: d.atgarderAnteckning.trim(),
    });
  }
  if (d.underhallsansvarAnteckning?.trim()) {
    rader.push({
      benamning: "Underhållsansvar",
      varde: d.underhallsansvarAnteckning.trim(),
    });
  }

  return rader;
}

export function stommeHarInnehall(data: StommeData): boolean {
  const d = normaliseraStommeData(data);
  if (d.konstruktionsdelar.some((k) => k.vald)) return true;
  if (d.kommentar?.trim()) return true;
  if (parseKrBelopp(d.byggnadsAnskaffningsvardeKr) > 0) return true;
  if (parseKrBelopp(d.egetKomponentvardeKr) > 0) return true;
  if (d.skick) return true;
  if (d.skadorAnteckning?.trim()) return true;
  if (d.undersokningarAnteckning?.trim()) return true;
  if (d.atgarderAnteckning?.trim()) return true;
  if (d.uppdelning === "uppdelad") return true;
  return false;
}
