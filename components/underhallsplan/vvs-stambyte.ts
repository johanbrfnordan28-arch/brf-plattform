import {
  formatSummeringTal,
  parseNummerSumma,
  type ListaSummeringRad,
} from "@/components/underhallsplan/lista-summering";

/** Stambyte — badrum per lägenhet/våning. */

export type StambyteSanitetDel = {
  id: string;
  etikett: string;
  beskrivning: string;
};

export type StambyteSanitetRad = {
  delId: string;
  aktiv: boolean;
  antal: string;
};

export type StambytePriser = {
  vattenVertikalKallvatten: string;
  vattenVertikalVarmvatten: string;
  vattenVertikalCirkulation: string;
  vattenHorisontellKallvatten: string;
  vattenHorisontellVarmvatten: string;
  vattenHorisontellCirkulation: string;
  teknikskap: string;
  stamventiler: string;
  stamventilLagenhet: string;
  avloppVertikalStam: string;
  avloppHorisontellStam: string;
  avloppAvstick: string;
  avloppGrenBadrum: string;
  avloppGrenWc: string;
  brandmanschett: string;
};

export type AvloppMaterialId =
  | "plast"
  | "plast-ljudklassad"
  | "gjutjarn"
  | "annat";

export type VattenMaterialId =
  | "koppar"
  | "rostfritt-stal"
  | "pex"
  | "stal-galvaniserat"
  | "annat";

export type StambyteVattenLpmFalt =
  | "vattenVertikalKallvattenLpm"
  | "vattenVertikalVarmvattenLpm"
  | "vattenVertikalCirkulationLpm"
  | "vattenHorisontellKallvattenLpm"
  | "vattenHorisontellVarmvattenLpm"
  | "vattenHorisontellCirkulationLpm";

export type VvsStambyteData = {
  /** Antal badrum / lägenheter i stambytesomgången */
  antalBadrum: string;
  golvKvm: string;
  vaggarKvm: string;
  takKvm: string;
  /** Väggstomme / konstruktion som rivs och byggs om */
  stommeKvm: string;
  sanitet: StambyteSanitetRad[];
  vattenVertikalKallvattenLpm: string;
  vattenVertikalVarmvattenLpm: string;
  vattenVertikalCirkulationLpm: string;
  vattenHorisontellKallvattenLpm: string;
  vattenHorisontellVarmvattenLpm: string;
  vattenHorisontellCirkulationLpm: string;
  /** Rörmaterial för vattenstammar */
  vattenMaterial: VattenMaterialId;
  vattenMaterialAnnanText: string;
  /** Stamventiler i trapphus / vid stam */
  stamventilerAntal: string;
  /** Avstängningsventil per lägenhet */
  stamventilLagenhetAntal: string;
  teknikskapAntal: string;
  avloppVertikalStamLpm: string;
  avloppHorisontellStamLpm: string;
  avloppAvstickAntal: string;
  avloppGrenBadrumAntal: string;
  avloppGrenWcAntal: string;
  /** Rörmaterial för avloppsstammar och grenar */
  avloppMaterial: AvloppMaterialId;
  avloppMaterialAnnanText: string;
  /** Brandmanschett / brandtätning — oftast en mellan varje lägenhet */
  brandmanschettAntal: string;
  priser?: StambytePriser;
};

export const stambyteSanitetDelar: StambyteSanitetDel[] = [
  {
    id: "wc",
    etikett: "WC",
    beskrivning: "Toalett, ofta vägghängd vid stambyte.",
  },
  {
    id: "handfat",
    etikett: "Handfat / tvättställ",
    beskrivning: "Tvättställ med blandare.",
  },
  {
    id: "dusch",
    etikett: "Dusch",
    beskrivning: "Duschplats eller duschväggar.",
  },
  {
    id: "badkar",
    etikett: "Badkar",
    beskrivning: "Badkar om det finns i planlösningen.",
  },
  {
    id: "bide",
    etikett: "Bidé",
    beskrivning: "Bidé där det ingår i badrummet.",
  },
  {
    id: "tvattmaskin",
    etikett: "Tvättmaskin (i badrum)",
    beskrivning: "Anslutning för tvättmaskin i våtrum.",
  },
  {
    id: "golvvärme",
    etikett: "Golvvärme",
    beskrivning: "Golvvärme i badrum — ofta nytt vid stambyte.",
  },
];

export const vattenMaterialAlternativ: {
  id: VattenMaterialId;
  etikett: string;
  beskrivning?: string;
}[] = [
  {
    id: "rostfritt-stal",
    etikett: "Rostfritt stål (press)",
    beskrivning: "Presskopplingar — vanligt vid stambyte i flerbostadshus.",
  },
  {
    id: "koppar",
    etikett: "Koppar",
    beskrivning: "Lödning eller press — förekommer i äldre och nyare stammar.",
  },
  {
    id: "pex",
    etikett: "PEX / multilayer (MLP)",
    beskrivning: "Flexibelt plaströr, ofta med aluminiumskikt.",
  },
  {
    id: "stal-galvaniserat",
    etikett: "Galvaniserat stål",
    beskrivning: "Äldre vattenstammar — byte till koppar, rostfritt eller PEX är vanligt.",
  },
  { id: "annat", etikett: "Annat material…" },
];

export function standardVattenMaterial(): VattenMaterialId {
  return "rostfritt-stal";
}

export function vattenMaterialEtikett(
  id: VattenMaterialId,
  annanText: string,
): string {
  if (id === "annat") {
    const text = annanText.trim();
    return text || "Annat material";
  }
  return vattenMaterialAlternativ.find((a) => a.id === id)?.etikett ?? id;
}

export const stambyteVattenSektioner: {
  rubrik: string;
  beskrivning: string;
  falt: { falt: StambyteVattenLpmFalt; etikett: string }[];
}[] = [
  {
    rubrik: "Vertikal ledning",
    beskrivning: "Stamledning i vägg — kallvatten, varmvatten och cirkulation.",
    falt: [
      { falt: "vattenVertikalKallvattenLpm", etikett: "Kallvatten" },
      { falt: "vattenVertikalVarmvattenLpm", etikett: "Varmvatten" },
      { falt: "vattenVertikalCirkulationLpm", etikett: "Cirkulationsledning" },
    ],
  },
  {
    rubrik: "Horisontell ledning",
    beskrivning: "Ledning i bjälklag eller undertak mellan våningar.",
    falt: [
      { falt: "vattenHorisontellKallvattenLpm", etikett: "Kallvatten" },
      { falt: "vattenHorisontellVarmvattenLpm", etikett: "Varmvatten" },
      { falt: "vattenHorisontellCirkulationLpm", etikett: "Cirkulationsledning" },
    ],
  },
];

export const stambyteTappvattenAntalDelar: {
  falt: "stamventilerAntal" | "stamventilLagenhetAntal";
  etikett: string;
  beskrivning: string;
}[] = [
  {
    falt: "stamventilerAntal",
    etikett: "Stamventiler",
    beskrivning:
      "Huvudventiler vid stam i trapphus eller teknikutrymme — antal stycken.",
  },
  {
    falt: "stamventilLagenhetAntal",
    etikett: "Stamventil lägenhet",
    beskrivning:
      "Avstängningsventil inne i lägenhet — vanligtvis en per lägenhet vid stambyte.",
  },
];

export const avloppMaterialAlternativ: {
  id: AvloppMaterialId;
  etikett: string;
  beskrivning?: string;
}[] = [
  {
    id: "plast",
    etikett: "Plast (PP/PE)",
    beskrivning: "Vanligast vid stambyte i flerbostadshus.",
  },
  {
    id: "plast-ljudklassad",
    etikett: "Ljudklassade plaströr",
    beskrivning: "Tätare och ljuddämpande — vanligt i trapphus mot lägenheter.",
  },
  {
    id: "gjutjarn",
    etikett: "Gjutjärn",
    beskrivning: "Äldre stammar — byte till plast är vanligt.",
  },
  { id: "annat", etikett: "Annat material…" },
];

export function standardAvloppMaterial(): AvloppMaterialId {
  return "plast";
}

export function avloppMaterialEtikett(
  id: AvloppMaterialId,
  annanText: string,
): string {
  if (id === "annat") {
    const text = annanText.trim();
    return text || "Annat material";
  }
  return avloppMaterialAlternativ.find((a) => a.id === id)?.etikett ?? id;
}

export const stambyteAvloppDelar: {
  falt:
    | "avloppVertikalStamLpm"
    | "avloppHorisontellStamLpm"
    | "avloppAvstickAntal"
    | "avloppGrenBadrumAntal"
    | "avloppGrenWcAntal"
    | "brandmanschettAntal";
  etikett: string;
  beskrivning: string;
  enhet: "m" | "st";
}[] = [
  {
    falt: "avloppVertikalStamLpm",
    etikett: "Vertikal stam",
    beskrivning: "Stamledning i badrumsvägg (fallrör).",
    enhet: "m",
  },
  {
    falt: "avloppHorisontellStamLpm",
    etikett: "Horisontell stam",
    beskrivning:
      "Horisontell avloppsledning i bjälklag — ofta åtkomlig från undertak i lägenheten under.",
    enhet: "m",
  },
  {
    falt: "avloppAvstickAntal",
    etikett: "Avstick",
    beskrivning: "Avstick från stam till lägenhet.",
    enhet: "st",
  },
  {
    falt: "avloppGrenBadrumAntal",
    etikett: "Avloppsgren badrum",
    beskrivning: "Gren till badrum (dusch, golvbrunn, handfat).",
    enhet: "st",
  },
  {
    falt: "avloppGrenWcAntal",
    etikett: "Avloppsgren WC",
    beskrivning: "Gren till WC.",
    enhet: "st",
  },
  {
    falt: "brandmanschettAntal",
    etikett: "Brandmanschett",
    beskrivning:
      "Brandtätning vid genomföring i bjälklag/vägg — vanligtvis en mellan varje lägenhet.",
    enhet: "st",
  },
];

export function skapaTomStambytePriser(): StambytePriser {
  return {
    vattenVertikalKallvatten: "",
    vattenVertikalVarmvatten: "",
    vattenVertikalCirkulation: "",
    vattenHorisontellKallvatten: "",
    vattenHorisontellVarmvatten: "",
    vattenHorisontellCirkulation: "",
    teknikskap: "",
    stamventiler: "",
    stamventilLagenhet: "",
    avloppVertikalStam: "",
    avloppHorisontellStam: "",
    avloppAvstick: "",
    avloppGrenBadrum: "",
    avloppGrenWc: "",
    brandmanschett: "",
  };
}

export function skapaTomStambyteSanitet(): StambyteSanitetRad[] {
  return stambyteSanitetDelar.map((del) => ({
    delId: del.id,
    aktiv: false,
    antal: "",
  }));
}

/** Uppdaterar lägenhetsberoende mängder när antal lägenheter ändras i grunduppgifter. */
export function synkaStambyteMedAntalLagenheter(
  data: VvsStambyteData,
  lgh: number,
): VvsStambyteData {
  if (lgh <= 0) return data;
  const vert = String(Math.round(lgh * 7));
  const horis = String(Math.round(lgh * 3.5));
  const sanitet = data.sanitet.map((r) => {
    if (r.delId === "wc" || r.delId === "handfat")
      return { ...r, aktiv: true, antal: String(lgh) };
    if (r.delId === "dusch")
      return { ...r, aktiv: true, antal: String(Math.max(1, lgh - 2)) };
    if (r.delId === "golvvärme")
      return { ...r, aktiv: lgh >= 20, antal: lgh >= 20 ? String(lgh) : r.antal };
    return r;
  });
  return {
    ...data,
    antalBadrum: String(lgh),
    sanitet,
    vattenVertikalKallvattenLpm: vert,
    vattenVertikalVarmvattenLpm: vert,
    vattenVertikalCirkulationLpm: vert,
    vattenHorisontellKallvattenLpm: horis,
    vattenHorisontellVarmvattenLpm: horis,
    vattenHorisontellCirkulationLpm: horis,
    stamventilerAntal: String(Math.max(2, Math.ceil(lgh / 12))),
    stamventilLagenhetAntal: String(lgh),
    teknikskapAntal: lgh >= 40 ? "2" : "1",
    avloppVertikalStamLpm: String(Math.round(lgh * 16)),
    avloppHorisontellStamLpm: String(Math.round(lgh * 11)),
    avloppAvstickAntal: String(lgh),
    avloppGrenBadrumAntal: String(lgh),
    avloppGrenWcAntal: String(lgh),
    brandmanschettAntal: String(Math.max(0, lgh - 1)),
  };
}

export function skapaTomVvsStambyteData(): VvsStambyteData {
  return {
    antalBadrum: "",
    golvKvm: "",
    vaggarKvm: "",
    takKvm: "",
    stommeKvm: "",
    sanitet: skapaTomStambyteSanitet(),
    vattenVertikalKallvattenLpm: "",
    vattenVertikalVarmvattenLpm: "",
    vattenVertikalCirkulationLpm: "",
    vattenHorisontellKallvattenLpm: "",
    vattenHorisontellVarmvattenLpm: "",
    vattenHorisontellCirkulationLpm: "",
    vattenMaterial: standardVattenMaterial(),
    vattenMaterialAnnanText: "",
    stamventilerAntal: "",
    stamventilLagenhetAntal: "",
    teknikskapAntal: "",
    avloppVertikalStamLpm: "",
    avloppHorisontellStamLpm: "",
    avloppAvstickAntal: "",
    avloppGrenBadrumAntal: "",
    avloppGrenWcAntal: "",
    avloppMaterial: standardAvloppMaterial(),
    avloppMaterialAnnanText: "",
    brandmanschettAntal: "",
    priser: skapaTomStambytePriser(),
  };
}

function sanitetEtikett(delId: string): string {
  return stambyteSanitetDelar.find((d) => d.id === delId)?.etikett ?? delId;
}

/** Bakåtkompatibilitet — tidigare fältnamn. */
export function normaliseraVvsStambyteData(
  raw: VvsStambyteData & {
    vattenledningLpm?: string;
    avloppStamLpm?: string;
    avloppBjalklagLpm?: string;
    priser?: StambytePriser & { vattenledning?: string };
  },
): VvsStambyteData {
  const tom = skapaTomVvsStambyteData();
  const legacyVatten = raw.vattenledningLpm?.trim() ?? "";
  const priserTom = skapaTomStambytePriser();
  const legacyPris = raw.priser?.vattenledning?.trim() ?? "";

  const priser: StambytePriser = {
    ...priserTom,
    ...raw.priser,
    vattenVertikalKallvatten:
      raw.priser?.vattenVertikalKallvatten?.trim() ||
      legacyPris ||
      priserTom.vattenVertikalKallvatten,
  };

  return {
    ...tom,
    ...raw,
    sanitet: raw.sanitet?.length > 0 ? raw.sanitet : tom.sanitet,
    vattenVertikalKallvattenLpm:
      raw.vattenVertikalKallvattenLpm?.trim() || legacyVatten || "",
    vattenVertikalVarmvattenLpm: raw.vattenVertikalVarmvattenLpm ?? "",
    vattenVertikalCirkulationLpm: raw.vattenVertikalCirkulationLpm ?? "",
    vattenHorisontellKallvattenLpm: raw.vattenHorisontellKallvattenLpm ?? "",
    vattenHorisontellVarmvattenLpm: raw.vattenHorisontellVarmvattenLpm ?? "",
    vattenHorisontellCirkulationLpm: raw.vattenHorisontellCirkulationLpm ?? "",
    vattenMaterial:
      raw.vattenMaterial &&
      vattenMaterialAlternativ.some((a) => a.id === raw.vattenMaterial)
        ? raw.vattenMaterial
        : standardVattenMaterial(),
    vattenMaterialAnnanText:
      raw.vattenMaterial === "annat" ? (raw.vattenMaterialAnnanText ?? "") : "",
    stamventilerAntal: raw.stamventilerAntal ?? "",
    stamventilLagenhetAntal: raw.stamventilLagenhetAntal ?? "",
    teknikskapAntal: raw.teknikskapAntal ?? "",
    avloppVertikalStamLpm:
      raw.avloppVertikalStamLpm?.trim() || raw.avloppStamLpm?.trim() || "",
    avloppHorisontellStamLpm:
      raw.avloppHorisontellStamLpm?.trim() || raw.avloppBjalklagLpm?.trim() || "",
    avloppAvstickAntal: raw.avloppAvstickAntal ?? "",
    avloppGrenBadrumAntal: raw.avloppGrenBadrumAntal ?? "",
    avloppGrenWcAntal: raw.avloppGrenWcAntal ?? "",
    avloppMaterial:
      raw.avloppMaterial &&
      avloppMaterialAlternativ.some((a) => a.id === raw.avloppMaterial)
        ? raw.avloppMaterial
        : standardAvloppMaterial(),
    avloppMaterialAnnanText:
      raw.avloppMaterial === "annat" ? (raw.avloppMaterialAnnanText ?? "") : "",
    brandmanschettAntal: raw.brandmanschettAntal ?? "",
    priser,
  };
}

function formateraTappvattenMangder(d: VvsStambyteData): string[] {
  const rader: string[] = [];
  for (const sektion of stambyteVattenSektioner) {
    const delar: string[] = [];
    for (const { falt, etikett } of sektion.falt) {
      const v = d[falt].trim();
      if (v) delar.push(`${etikett.toLowerCase()} ${v} m`);
    }
    if (delar.length > 0) {
      rader.push(`${sektion.rubrik.toLowerCase()}: ${delar.join(", ")}`);
    }
  }
  for (const def of stambyteTappvattenAntalDelar) {
    const v = d[def.falt].trim();
    if (v) rader.push(`${def.etikett.toLowerCase()} ${v} st`);
  }
  if (d.teknikskapAntal.trim()) {
    rader.push(`teknikskåp ${d.teknikskapAntal.trim()} st`);
  }
  return rader;
}

/** Summerar ifyllda mängder i stambyte (före prissättning). */
export function summeraStambyteMangder(data: VvsStambyteData): ListaSummeringRad[] {
  const d = normaliseraVvsStambyteData(data);
  const rader: ListaSummeringRad[] = [];

  if (d.antalBadrum.trim()) {
    rader.push({ etikett: "Badrum i omgång", varde: `${d.antalBadrum.trim()} st` });
  }

  const ytaKvm = parseNummerSumma([
    d.golvKvm,
    d.vaggarKvm,
    d.takKvm,
    d.stommeKvm,
  ]);
  if (ytaKvm > 0) {
    rader.push({
      etikett: "Ytor badrum (summa)",
      varde: `${formatSummeringTal(ytaKvm)} m²`,
    });
  }

  for (const rad of d.sanitet.filter((s) => s.aktiv && s.antal.trim())) {
    const etikett =
      stambyteSanitetDelar.find((x) => x.id === rad.delId)?.etikett ?? rad.delId;
    rader.push({ etikett, varde: `${rad.antal.trim()} st` });
  }

  const tappvattenLpm = parseNummerSumma([
    d.vattenVertikalKallvattenLpm,
    d.vattenVertikalVarmvattenLpm,
    d.vattenVertikalCirkulationLpm,
    d.vattenHorisontellKallvattenLpm,
    d.vattenHorisontellVarmvattenLpm,
    d.vattenHorisontellCirkulationLpm,
  ]);
  if (tappvattenLpm > 0) {
    rader.push({
      etikett: "Tappvatten (löpmeter totalt)",
      varde: `${formatSummeringTal(tappvattenLpm)} m`,
    });
  }

  for (const def of stambyteTappvattenAntalDelar) {
    const v = d[def.falt].trim();
    if (v) rader.push({ etikett: def.etikett, varde: `${v} st` });
  }

  if (d.teknikskapAntal.trim()) {
    rader.push({ etikett: "Teknikskåp", varde: `${d.teknikskapAntal.trim()} st` });
  }

  const avloppLpm = parseNummerSumma([
    d.avloppVertikalStamLpm,
    d.avloppHorisontellStamLpm,
  ]);
  if (avloppLpm > 0) {
    rader.push({
      etikett: "Avlopp stammar (löpmeter totalt)",
      varde: `${formatSummeringTal(avloppLpm)} m`,
    });
  }

  for (const def of stambyteAvloppDelar) {
    if (def.falt === "avloppVertikalStamLpm" || def.falt === "avloppHorisontellStamLpm") {
      continue;
    }
    const v = d[def.falt].trim();
    if (v) rader.push({ etikett: def.etikett, varde: `${v} ${def.enhet}` });
  }

  return rader;
}

export function formateraVvsStambyte(data: VvsStambyteData): string {
  const d = normaliseraVvsStambyteData(data);
  const delar: string[] = [];

  if (d.antalBadrum.trim()) {
    delar.push(`${d.antalBadrum.trim()} badrum`);
  }

  const ytor: string[] = [];
  if (d.golvKvm.trim()) ytor.push(`golv ${d.golvKvm.trim()} m²`);
  if (d.vaggarKvm.trim()) ytor.push(`väggar ${d.vaggarKvm.trim()} m²`);
  if (d.takKvm.trim()) ytor.push(`tak ${d.takKvm.trim()} m²`);
  if (d.stommeKvm.trim()) ytor.push(`stomme ${d.stommeKvm.trim()} m²`);
  if (ytor.length > 0) delar.push(ytor.join(", "));

  const sanitets = d.sanitet
    .filter((r) => r.aktiv && r.antal.trim())
    .map((r) => `${sanitetEtikett(r.delId)} ${r.antal.trim()} st`);
  if (sanitets.length > 0) delar.push(sanitets.join(", "));

  const matVatten = vattenMaterialEtikett(
    d.vattenMaterial,
    d.vattenMaterialAnnanText,
  );
  const tappvattenMangder = formateraTappvattenMangder(d);
  if (tappvattenMangder.length > 0) {
    delar.push(`tappvatten (${matVatten}): ${tappvattenMangder.join("; ")}`);
  }

  const mat = avloppMaterialEtikett(d.avloppMaterial, d.avloppMaterialAnnanText);
  const avloppMangder: string[] = [];
  for (const def of stambyteAvloppDelar) {
    const v = d[def.falt].trim();
    if (v) {
      avloppMangder.push(`${def.etikett.toLowerCase()} ${v} ${def.enhet}`);
    }
  }
  if (avloppMangder.length > 0) {
    delar.push(`avlopp (${mat}): ${avloppMangder.join(", ")}`);
  }

  return delar.join(" · ");
}
