import {
  formatSummeringTal,
  formateraSummeringRader,
  parseNummerSumma,
  type ListaSummeringRad,
} from "@/components/underhallsplan/lista-summering";

export type FonsterMaterialId = "tra" | "alu-kldd" | "pvc" | "aluminium";

export type TraUnderhallId = "malning" | "renovering";

/** Var på fastigheten fönstren sitter — för uppdelning per adress och väderstreck. */
export type FonsterLageId =
  | "norr"
  | "soder"
  | "vaster"
  | "oster"
  | "gard"
  | "gata";

export const FONSTER_ADRESS_ANNAN = "__annan_adress__";

export const fonsterLageAlternativ: {
  id: FonsterLageId;
  etikett: string;
}[] = [
  { id: "norr", etikett: "Norr" },
  { id: "soder", etikett: "Söder" },
  { id: "vaster", etikett: "Väster" },
  { id: "oster", etikett: "Öster" },
  { id: "gard", etikett: "Gård" },
  { id: "gata", etikett: "Gata" },
];

/** Dörrmaterial på fastighet */
export type DorrMaterialId = "ek" | "malad-tra" | "aluminium" | "plat";

export type DorrTraUnderhallId = "malning" | "renovering";

export type DorrPlatAlderId = "aldre" | "ny";

export type DorrPlatUnderhallId = "malning" | "kontroll";

/** Löpande lås- och beslagsåtgärder (planeras i underhållsplanen) */
export type DorrLasUnderhallId =
  | "gangjarn"
  | "cylinder-lasspray"
  | "kontroll-beslag";

export type FonsterDorrPost = {
  id: string;
  modulmatt: string;
  antal: string;
  /** Fönster — adress/byggnad (från grunduppgifter eller egen text). */
  adress?: string;
  /** Fönster — läge: väderstreck, gård eller gata. */
  lage?: FonsterLageId | "";
  /** Fönster */
  material?: FonsterMaterialId;
  /** Gäller träfönster — renovering inkluderar målning */
  traUnderhall?: TraUnderhallId;
  /** Dörrar */
  dorrMaterial?: DorrMaterialId;
  dorrTraUnderhall?: DorrTraUnderhallId;
  platAlder?: DorrPlatAlderId;
  dorrPlatUnderhall?: DorrPlatUnderhallId;
  harKodlas?: boolean;
  harElsutbleck?: boolean;
  lasUnderhall?: DorrLasUnderhallId[];
  /** Kr/st — tom = riktpris enligt material/åtgärd */
  enhetsprisKr?: string;
};

export const fonsterMaterial: {
  id: FonsterMaterialId;
  etikett: string;
  beskrivning: string;
}[] = [
  {
    id: "tra",
    etikett: "Trä (ofta handmålat på äldre hus)",
    beskrivning:
      "Äldre fönster i trä. Underhåll: målning eller full renovering (byte av skadat trä, kittning, nya tätninglister — målning ingår).",
  },
  {
    id: "alu-kldd",
    etikett: "Aluminiumklädd (utsida) / lackad insida",
    beskrivning:
      "Vanligt på nyare hus — aluminium utåt, lackad insida. Ofta lågt underhåll — följ tillverkarens råd.",
  },
  {
    id: "pvc",
    etikett: "PVC / plast",
    beskrivning:
      "Plastprofiler — i regel underhållsfritt utvändigt. Kontrollera tillverkarens anvisningar.",
  },
  {
    id: "aluminium",
    etikett: "Aluminium",
    beskrivning:
      "Profiler i aluminium — ofta låg servicefrekvens. Se tillverkarens underhållsplan.",
  },
];

export const traUnderhallAlternativ: {
  id: TraUnderhallId;
  etikett: string;
  beskrivning: string;
}[] = [
  {
    id: "malning",
    etikett: "Fönstermålning",
    beskrivning: "Enbart ommålning — inget byte av trä eller kitt.",
  },
  {
    id: "renovering",
    etikett: "Fönsterrenovering",
    beskrivning:
      "Byte av skadat trä, kittning om, nya tätninglister — målning ingår i renoveringen.",
  },
];

export function skapaFonsterDorrPostId(): string {
  return `fd-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function skapaTomFonsterPost(): FonsterDorrPost {
  return {
    id: skapaFonsterDorrPostId(),
    modulmatt: "",
    material: "tra",
    antal: "",
    adress: "",
    lage: "",
    enhetsprisKr: "",
  };
}

export function skapaTomDorrPost(): FonsterDorrPost {
  return {
    id: skapaFonsterDorrPostId(),
    modulmatt: "",
    dorrMaterial: "malad-tra",
    antal: "",
    dorrTraUnderhall: "malning",
    harKodlas: true,
    lasUnderhall: ["gangjarn", "cylinder-lasspray"],
    enhetsprisKr: "",
  };
}

/** @deprecated Använd skapaTomFonsterPost eller skapaTomDorrPost */
export function skapaTomFonsterDorrPost(): FonsterDorrPost {
  return skapaTomFonsterPost();
}

export function materialEtikett(id: FonsterMaterialId): string {
  return fonsterMaterial.find((m) => m.id === id)?.etikett ?? id;
}

export function traUnderhallEtikett(id: TraUnderhallId): string {
  return traUnderhallAlternativ.find((a) => a.id === id)?.etikett ?? id;
}

export function fonsterLageEtikett(id: FonsterLageId | "" | undefined): string {
  if (!id) return "";
  return fonsterLageAlternativ.find((l) => l.id === id)?.etikett ?? id;
}

function parseLageFranText(text: string): FonsterLageId | "" {
  const lower = text.trim().toLowerCase();
  if (/^nord\b|^norr\b/.test(lower)) return "norr";
  if (/^syd\b|^söder\b|^soder\b/.test(lower)) return "soder";
  if (/^väster\b|^vaster\b|^väst\b/.test(lower)) return "vaster";
  if (/^öst\b|^oster\b|^öster\b/.test(lower)) return "oster";
  if (/^gård\b|^gard\b/.test(lower)) return "gard";
  if (/^gata\b/.test(lower)) return "gata";
  return "";
}

/** Flyttar väderstreck/gård/gata från modulmått-rad till lage (äldre data). */
export function normaliseraFonsterDorrPost(post: FonsterDorrPost): FonsterDorrPost {
  let lage = post.lage ?? "";
  let modulmatt = post.modulmatt.trim();

  if (!lage && modulmatt) {
    const match = modulmatt.match(
      /^(norr|nord|söder|soder|syd|väster|vaster|väst|öster|oster|öst|gård|gard|gata)\s+(.+)$/i,
    );
    if (match) {
      lage = parseLageFranText(match[1]);
      modulmatt = match[2].trim();
    } else {
      const enbartLage = parseLageFranText(modulmatt);
      if (enbartLage && !/\d/.test(modulmatt)) {
        lage = enbartLage;
        modulmatt = "";
      }
    }
  }

  return {
    ...post,
    modulmatt,
    lage,
    adress: post.adress?.trim() ?? "",
  };
}

function fonsterPlatsEtikett(post: FonsterDorrPost): string {
  const delar: string[] = [];
  const lage = fonsterLageEtikett(post.lage);
  const adress = post.adress?.trim();
  if (adress) delar.push(adress);
  if (lage) delar.push(lage);
  return delar.join(" · ");
}

export const dorrMaterial: {
  id: DorrMaterialId;
  etikett: string;
  beskrivning: string;
}[] = [
  {
    id: "ek",
    etikett: "Ekdörr",
    beskrivning:
      "Massiv ek — lackas vanligtvis (skyddande lack), inte ommålning som målade trädörrar.",
  },
  {
    id: "malad-tra",
    etikett: "Målad trädörr",
    beskrivning:
      "Trädörr med färg. Underhåll: ommålning eller renovering (byte av skadat trä, nya tätningar — målning ingår), i linje med träfönster.",
  },
  {
    id: "aluminium",
    etikett: "Aluminiumdörr",
    beskrivning:
      "Profiler i aluminium — ofta låg underhållsfrekvens utvändigt. Följ tillverkarens anvisningar för lack/pulverbeläggning.",
  },
  {
    id: "plat",
    etikett: "Plåtdörr",
    beskrivning:
      "Stålplåt — äldre plåtdörrar målas ofta vid underhåll; nyare plåtdörrar målas mer sällan (fabriksfinish).",
  },
];

export const dorrTraUnderhallAlternativ: {
  id: DorrTraUnderhallId;
  etikett: string;
  beskrivning: string;
}[] = [
  {
    id: "malning",
    etikett: "Dörrmålning",
    beskrivning: "Enbart ommålning — inget byte av trä eller beslag.",
  },
  {
    id: "renovering",
    etikett: "Dörrrenovering",
    beskrivning:
      "Byte av skadat trä, nya tätningar och beslag vid behov — målning ingår i renoveringen.",
  },
];

export const dorrLasUnderhallAlternativ: {
  id: DorrLasUnderhallId;
  etikett: string;
  beskrivning: string;
}[] = [
  {
    id: "gangjarn",
    etikett: "Smörj gångjärn",
    beskrivning:
      "Gångjärn och rörliga beslag — smörj med lämpligt medel enligt tillverkare (1–2 gånger/år).",
  },
  {
    id: "cylinder-lasspray",
    etikett: "Cylinder — låsspray",
    beskrivning:
      "Rengör och behandla cylindern med tillverkargodkänd låsspray ca 2 gånger/år. Cylindern får aldrig smörjas med olja, fett eller grafit.",
  },
  {
    id: "kontroll-beslag",
    etikett: "Kontroll lås och beslag",
    beskrivning:
      "Dra åt lösa skruvar, kontrollera glapp och att dörrblad/karm har rätt avstånd.",
  },
];

export const underhallElsutbleckVarning =
  "Dörr med elslutbleck: smörj aldrig låscylindern eller låshusets inre delar med olja eller fett — det kan låsa cylindern och störa elslutblecket. Underhåll elslutbleckets glidyta separat med tillverkargodkänt fett (ofta ca 2 gånger/år).";

export const underhallAllaFonsterText =
  "På fönster: välj skötselråd efter material (trä, aluminiumklätt trä, PVC/plast eller aluminium). Smörj beslag och rörliga delar regelbundet — det ingår i löpande skötsel oavsett material.";

export const underhallAllaDorrarText =
  "På dörrar och lås: skilj på vanlig cylinder/låshus, kodlås och elslutbleck. Välj löpande låsåtgärder nedan och följ tillverkarens råd; cylindern får inte oljas.";

export function hamtaDorrMaterialId(p: FonsterDorrPost): DorrMaterialId | undefined {
  if (p.dorrMaterial) return p.dorrMaterial;
  if (p.material === "tra") return "malad-tra";
  if (p.material === "aluminium" || p.material === "alu-kldd") return "aluminium";
  return undefined;
}

export function dorrMaterialEtikett(id: DorrMaterialId): string {
  return dorrMaterial.find((m) => m.id === id)?.etikett ?? id;
}

export function dorrTraUnderhallEtikett(id: DorrTraUnderhallId): string {
  return dorrTraUnderhallAlternativ.find((a) => a.id === id)?.etikett ?? id;
}

export function dorrLasUnderhallEtikett(id: DorrLasUnderhallId): string {
  return dorrLasUnderhallAlternativ.find((a) => a.id === id)?.etikett ?? id;
}

export function summeraFonsterPoster(poster: FonsterDorrPost[]): ListaSummeringRad[] {
  const aktiva = poster.filter((p) => p.modulmatt.trim() || p.antal.trim());
  if (aktiva.length === 0) return [];

  const rader: ListaSummeringRad[] = [
    { etikett: "Antal modulrader", varde: `${aktiva.length} st` },
  ];

  const totalt = parseNummerSumma(aktiva.map((p) => p.antal));
  if (totalt > 0) {
    rader.push({
      etikett: "Fönster totalt",
      varde: `${formatSummeringTal(totalt, 0)} st`,
    });
  }

  for (const mat of fonsterMaterial) {
    const summa = parseNummerSumma(
      aktiva
        .filter((p) => (p.material ?? "tra") === mat.id)
        .map((p) => p.antal),
    );
    if (summa > 0) {
      const etikett = mat.etikett.split(" (")[0];
      rader.push({ etikett, varde: `${formatSummeringTal(summa, 0)} st` });
    }
  }

  for (const lage of fonsterLageAlternativ) {
    const summa = parseNummerSumma(
      aktiva.filter((p) => p.lage === lage.id).map((p) => p.antal),
    );
    if (summa > 0) {
      rader.push({
        etikett: `Läge ${lage.etikett}`,
        varde: `${formatSummeringTal(summa, 0)} st`,
      });
    }
  }

  const adresser = [
    ...new Set(aktiva.map((p) => p.adress?.trim()).filter(Boolean) as string[]),
  ].sort((a, b) => a.localeCompare(b, "sv"));
  for (const adress of adresser) {
    const summa = parseNummerSumma(
      aktiva.filter((p) => p.adress?.trim() === adress).map((p) => p.antal),
    );
    if (summa > 0) {
      rader.push({
        etikett: adress,
        varde: `${formatSummeringTal(summa, 0)} st`,
      });
    }
  }

  return rader;
}

export function formateraFonsterSummering(poster: FonsterDorrPost[]): string {
  return formateraSummeringRader(summeraFonsterPoster(poster));
}

export function summeraDorrPoster(poster: FonsterDorrPost[]): ListaSummeringRad[] {
  const aktiva = poster.filter((p) => p.modulmatt.trim() || p.antal.trim());
  if (aktiva.length === 0) return [];

  const rader: ListaSummeringRad[] = [
    { etikett: "Antal modulrader", varde: `${aktiva.length} st` },
  ];

  const totalt = parseNummerSumma(aktiva.map((p) => p.antal));
  if (totalt > 0) {
    rader.push({
      etikett: "Dörrar totalt",
      varde: `${formatSummeringTal(totalt, 0)} st`,
    });
  }

  for (const mat of dorrMaterial) {
    const summa = parseNummerSumma(
      aktiva
        .filter((p) => hamtaDorrMaterialId(p) === mat.id)
        .map((p) => p.antal),
    );
    if (summa > 0) {
      rader.push({
        etikett: mat.etikett,
        varde: `${formatSummeringTal(summa, 0)} st`,
      });
    }
  }

  const kodlas = aktiva.filter((p) => p.harKodlas).length;
  if (kodlas > 0) {
    rader.push({ etikett: "Med kodlås (rader)", varde: `${kodlas} st` });
  }

  return rader;
}

export function formateraDorrSummering(poster: FonsterDorrPost[]): string {
  return formateraSummeringRader(summeraDorrPoster(poster));
}

export function formateraFonsterPoster(poster: FonsterDorrPost[]): string {
  return formateraFonsterSummering(poster);
}

export function formateraFonsterPosterDetalj(poster: FonsterDorrPost[]): string {
  if (poster.length === 0) return "";
  const rader = poster
    .filter((p) => p.modulmatt.trim() || p.antal.trim())
    .map((p) => {
      const antal = p.antal.trim() || "?";
      const modul = p.modulmatt.trim() || "modul ej angiven";
      const mat = p.material ?? "tra";
      const plats = fonsterPlatsEtikett(p);
      let rad = `${antal} st ${modul} (${materialEtikett(mat).split(" (")[0]})`;
      if (plats) rad = `${plats}: ${rad}`;
      if (mat === "tra" && p.traUnderhall) {
        rad += ` — ${traUnderhallEtikett(p.traUnderhall)}`;
      }
      return rad;
    });
  return rader.join("; ");
}

export function formateraDorrPoster(poster: FonsterDorrPost[]): string {
  return formateraDorrSummering(poster);
}

export function formateraDorrPosterDetalj(poster: FonsterDorrPost[]): string {
  if (poster.length === 0) return "";
  const rader = poster
    .filter((p) => p.modulmatt.trim() || p.antal.trim())
    .map((p) => {
      const antal = p.antal.trim() || "?";
      const modul = p.modulmatt.trim() || "modul ej angiven";
      const mat = hamtaDorrMaterialId(p);
      if (!mat) return `${antal} st ${modul}`;
      let rad = `${antal} st ${modul} (${dorrMaterialEtikett(mat)})`;
      if (mat === "malad-tra" && p.dorrTraUnderhall) {
        rad += ` — ${dorrTraUnderhallEtikett(p.dorrTraUnderhall)}`;
      }
      if (mat === "ek") {
        rad += " — lackning";
      }
      if (mat === "plat") {
        const alder = p.platAlder ?? "aldre";
        if (alder === "aldre" || p.dorrPlatUnderhall === "malning") {
          rad += " — målning";
        } else {
          rad += " — kontroll (målning sällan)";
        }
      }
      if (p.harKodlas) rad += ", kodlås";
      if (p.harElsutbleck) rad += ", elslutbleck";
      if (p.lasUnderhall && p.lasUnderhall.length > 0) {
        rad += ` · lås: ${p.lasUnderhall.map(dorrLasUnderhallEtikett).join(", ")}`;
      }
      return rad;
    });
  return rader.join("; ");
}

export function formateraFonsterDorrPoster(
  poster: FonsterDorrPost[],
  typ: ModulmattTyp = "fonster",
): string {
  return typ === "dorr" ? formateraDorrPoster(poster) : formateraFonsterPoster(poster);
}

/** Välj eget mått i listan */
export const MODULMATT_EGEN = "__egen__";

export type ModulmattTyp = "fonster" | "dorr";

export type ModulmattAlternativ = {
  id: string;
  etikett: string;
  /** Bredd × höjd i decimeter (modulmått) */
  bredd: number;
  hojd: number;
};

/** Vanliga fönstermoduler (dm × dm) */
export const fonsterModulmatt: ModulmattAlternativ[] = [
  { id: "8×8", etikett: "8×8 dm", bredd: 8, hojd: 8 },
  { id: "8×10", etikett: "8×10 dm", bredd: 8, hojd: 10 },
  { id: "8×12", etikett: "8×12 dm", bredd: 8, hojd: 12 },
  { id: "8×14", etikett: "8×14 dm", bredd: 8, hojd: 14 },
  { id: "8×16", etikett: "8×16 dm", bredd: 8, hojd: 16 },
  { id: "8×19", etikett: "8×19 dm", bredd: 8, hojd: 19 },
  { id: "8×21", etikett: "8×21 dm", bredd: 8, hojd: 21 },
  { id: "9×9", etikett: "9×9 dm", bredd: 9, hojd: 9 },
  { id: "9×12", etikett: "9×12 dm", bredd: 9, hojd: 12 },
  { id: "9×14", etikett: "9×14 dm", bredd: 9, hojd: 14 },
  { id: "9×16", etikett: "9×16 dm", bredd: 9, hojd: 16 },
  { id: "9×19", etikett: "9×19 dm", bredd: 9, hojd: 19 },
  { id: "9×21", etikett: "9×21 dm", bredd: 9, hojd: 21 },
  { id: "10×10", etikett: "10×10 dm", bredd: 10, hojd: 10 },
  { id: "10×12", etikett: "10×12 dm", bredd: 10, hojd: 12 },
  { id: "10×14", etikett: "10×14 dm", bredd: 10, hojd: 14 },
  { id: "10×16", etikett: "10×16 dm", bredd: 10, hojd: 16 },
  { id: "10×19", etikett: "10×19 dm", bredd: 10, hojd: 19 },
  { id: "10×21", etikett: "10×21 dm", bredd: 10, hojd: 21 },
  { id: "12×12", etikett: "12×12 dm", bredd: 12, hojd: 12 },
  { id: "12×14", etikett: "12×14 dm", bredd: 12, hojd: 14 },
  { id: "12×16", etikett: "12×16 dm", bredd: 12, hojd: 16 },
  { id: "12×18", etikett: "12×18 dm", bredd: 12, hojd: 18 },
  { id: "12×21", etikett: "12×21 dm", bredd: 12, hojd: 21 },
  { id: "14×14", etikett: "14×14 dm", bredd: 14, hojd: 14 },
  { id: "16×16", etikett: "16×16 dm", bredd: 16, hojd: 16 },
];

/** Vanliga dörrmoduler (dm × dm) */
export const dorrModulmatt: ModulmattAlternativ[] = [
  { id: "8×19", etikett: "8×19 dm", bredd: 8, hojd: 19 },
  { id: "8×21", etikett: "8×21 dm", bredd: 8, hojd: 21 },
  { id: "9×19", etikett: "9×19 dm", bredd: 9, hojd: 19 },
  { id: "9×21", etikett: "9×21 dm", bredd: 9, hojd: 21 },
  { id: "10×19", etikett: "10×19 dm", bredd: 10, hojd: 19 },
  { id: "10×21", etikett: "10×21 dm", bredd: 10, hojd: 21 },
  { id: "12×19", etikett: "12×19 dm", bredd: 12, hojd: 19 },
  { id: "12×21", etikett: "12×21 dm", bredd: 12, hojd: 21 },
  { id: "14×21", etikett: "14×21 dm", bredd: 14, hojd: 21 },
];

export function hamtaModulmattLista(typ: ModulmattTyp): ModulmattAlternativ[] {
  return typ === "dorr" ? dorrModulmatt : fonsterModulmatt;
}

export function ärKäntModulmatt(modulmatt: string, typ: ModulmattTyp): boolean {
  return hamtaModulmattLista(typ).some((m) => m.id === modulmatt);
}

export function modulmattSelectVarde(
  modulmatt: string,
  typ: ModulmattTyp,
): string {
  if (!modulmatt.trim()) return "";
  if (ärKäntModulmatt(modulmatt, typ)) return modulmatt;
  return MODULMATT_EGEN;
}
