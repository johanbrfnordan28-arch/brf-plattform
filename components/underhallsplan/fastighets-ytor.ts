import type { FonsterLageId } from "@/components/underhallsplan/fonster-dorrar";
import { fonsterLageAlternativ } from "@/components/underhallsplan/fonster-dorrar";
import { parseHeltalFranText } from "@/components/underhallsplan/parse-grundtal";
import type { Grunduppgifter } from "@/components/underhallsplan/types";

/** Vädersträck och lägen för fasadytor (samma som fönster). */
export type FasadVaderstreckId = FonsterLageId;

export const fasadVaderstreckLista = fonsterLageAlternativ;

/** Ett hus har högst fyra fasader. Vanligast är gata och gård. */
export const MAX_ANTAL_FASADER = 4;

export const FASAD_STANDARD: FasadVaderstreckId[] = ["gata", "gard"];

/** Sidor som kan väljas på huset: gata, gård och vid behov norr eller söder. */
export const FASAD_VALBARA: { id: FasadVaderstreckId; etikett: string }[] = [
  { id: "gata", etikett: "Gata" },
  { id: "gard", etikett: "Gård" },
  { id: "norr", etikett: "Norr" },
  { id: "soder", etikett: "Söder" },
];

export type FastighetsHus = {
  id: string;
  husnummer: string;
  etikett: string;
  /**
   * Vilka fasader som finns på huset.
   * Saknas eller tom → gata och gård. Högst fyra sidor.
   */
  aktivaFasader?: Partial<Record<FasadVaderstreckId, boolean>>;
};

export type HusFasadYtor = {
  husId: string;
  norr: string;
  soder: string;
  vaster: string;
  oster: string;
  gata: string;
  gard: string;
};

export type FastighetsYtorData = {
  hus: FastighetsHus[];
  fasadPerHus: HusFasadYtor[];
  takPerHus: Record<string, string>;
  /** När true — använd endast totalFasadKvm istället för matrisen. */
  endastTotalFasad: boolean;
  totalFasadKvm: string;
  endastTotalTak: boolean;
  totalTakKvm: string;
};

export function skapaTomFastighetsYtorData(): FastighetsYtorData {
  return {
    hus: [],
    fasadPerHus: [],
    takPerHus: {},
    endastTotalFasad: false,
    totalFasadKvm: "",
    endastTotalTak: false,
    totalTakKvm: "",
  };
}

function parseKvm(text: string | undefined): number {
  if (!text?.trim()) return 0;
  const n = Number.parseFloat(text.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function skapaHusId(): string {
  return `hus-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function skapaTomHus(index: number, adress?: string): FastighetsHus {
  return {
    id: skapaHusId(),
    husnummer: adress?.trim() || `Hus ${index + 1}`,
    etikett: "",
  };
}

export function skapaTomHusFasadYtor(husId: string): HusFasadYtor {
  return {
    husId,
    norr: "",
    soder: "",
    vaster: "",
    oster: "",
    gata: "",
    gard: "",
  };
}

export function normaliseraFastighetsYtor(
  raw?: Partial<FastighetsYtorData> | null,
): FastighetsYtorData {
  if (!raw) return skapaTomFastighetsYtorData();
  const hus = (raw.hus ?? []).map((h, i) => ({
    id: h.id?.trim() || `hus-${i + 1}`,
    husnummer: h.husnummer?.trim() ?? "",
    etikett: h.etikett?.trim() ?? "",
    aktivaFasader: h.aktivaFasader,
  }));
  const husIds = new Set(hus.map((h) => h.id));
  const fasadPerHus: HusFasadYtor[] = hus.map((h) => {
    const befintlig = raw.fasadPerHus?.find((f) => f.husId === h.id);
    const bas = befintlig ?? skapaTomHusFasadYtor(h.id);
    return {
      husId: h.id,
      norr: bas.norr ?? "",
      soder: bas.soder ?? "",
      vaster: bas.vaster ?? "",
      oster: bas.oster ?? "",
      gata: bas.gata ?? "",
      gard: bas.gard ?? "",
    };
  });
  const takPerHus: Record<string, string> = {};
  for (const h of hus) {
    takPerHus[h.id] = raw.takPerHus?.[h.id] ?? "";
  }
  return {
    hus,
    fasadPerHus,
    takPerHus,
    endastTotalFasad: Boolean(raw.endastTotalFasad),
    totalFasadKvm: raw.totalFasadKvm?.trim() ?? "",
    endastTotalTak: Boolean(raw.endastTotalTak),
    totalTakKvm: raw.totalTakKvm?.trim() ?? "",
  };
}

/** Skapar/uppdaterar hus utifrån antal byggnader och adresser. */
export function synkaHusFranGrund(
  data: FastighetsYtorData,
  grund: Grunduppgifter,
): FastighetsYtorData {
  const antal = Math.max(1, parseHeltalFranText(grund.antalByggnader) || 1);
  const adresser = grund.adresser.filter((a) => a.trim());
  const hus: FastighetsHus[] = [];
  for (let i = 0; i < antal; i++) {
    const befintlig = data.hus[i];
    hus.push(
      befintlig
        ? {
            ...befintlig,
            husnummer:
              befintlig.husnummer.trim() ||
              adresser[i]?.trim() ||
              `Hus ${i + 1}`,
          }
        : skapaTomHus(i, adresser[i]),
    );
  }
  return normaliseraFastighetsYtor({ ...data, hus });
}

export function sattHusFasadKvm(
  data: FastighetsYtorData,
  husId: string,
  vaderstreck: FasadVaderstreckId,
  värde: string,
): FastighetsYtorData {
  const norm = normaliseraFastighetsYtor(data);
  const fasadPerHus = norm.fasadPerHus.map((rad) =>
    rad.husId === husId ? { ...rad, [vaderstreck]: värde } : rad,
  );
  if (!fasadPerHus.some((rad) => rad.husId === husId)) {
    fasadPerHus.push({ ...skapaTomHusFasadYtor(husId), [vaderstreck]: värde });
  }
  return { ...norm, fasadPerHus };
}

export function hamtaHusFasadRad(
  data: FastighetsYtorData,
  husId: string,
): HusFasadYtor {
  return (
    data.fasadPerHus.find((f) => f.husId === husId) ?? skapaTomHusFasadYtor(husId)
  );
}

export function summeraFasadKvm(data: FastighetsYtorData): number {
  const norm = normaliseraFastighetsYtor(data);
  if (norm.endastTotalFasad) {
    return parseKvm(norm.totalFasadKvm);
  }
  return norm.fasadPerHus.reduce((sum, rad) => {
    const hus = norm.hus.find((h) => h.id === rad.husId);
    const aktiva = hus ? hamtaAktivaFasaderForHus(hus) : fasadVaderstreckLista.map((l) => l.id);
    return (
      sum +
      aktiva.reduce((s, id) => s + parseKvm(rad[id]), 0)
    );
  }, 0);
}

/** Fasadytor som är markerade för huset. Tomt val betyder gata och gård. */
export function hamtaAktivaFasaderForHus(hus: FastighetsHus): FasadVaderstreckId[] {
  const alla = fasadVaderstreckLista.map((l) => l.id);
  const val = hus.aktivaFasader;
  if (!val || Object.keys(val).length === 0) return [...FASAD_STANDARD];
  const harUttryckligtVal = Object.values(val).some((v) => v === true);
  const aktiva = harUttryckligtVal
    ? alla.filter((id) => val[id] === true)
    : alla.filter((id) => val[id] !== false);
  return begransaFasader(aktiva);
}

function begransaFasader(ids: FasadVaderstreckId[]): FasadVaderstreckId[] {
  const unika = [...new Set(ids)];
  if (unika.length <= MAX_ANTAL_FASADER) return unika;
  const forst = FASAD_STANDARD.filter((id) => unika.includes(id));
  const resten = unika.filter((id) => !forst.includes(id));
  return [...forst, ...resten].slice(0, MAX_ANTAL_FASADER);
}

export function fasadSidorForHus(
  hus: FastighetsHus,
): { id: FasadVaderstreckId; etikett: string; aktiv: boolean }[] {
  const aktiva = new Set(hamtaAktivaFasaderForHus(hus));
  const bas = FASAD_VALBARA.map((l) => ({
    ...l,
    aktiv: aktiva.has(l.id),
  }));
  const extra = fasadVaderstreckLista
    .filter((l) => !FASAD_VALBARA.some((b) => b.id === l.id) && aktiva.has(l.id))
    .map((l) => ({ ...l, aktiv: true }));
  return [...bas, ...extra];
}

export function arFasadAktivForHus(
  hus: FastighetsHus,
  fasad: FasadVaderstreckId,
): boolean {
  return hamtaAktivaFasaderForHus(hus).includes(fasad);
}

export function uppdateraHusAktivFasad(
  data: FastighetsYtorData,
  husId: string,
  fasad: FasadVaderstreckId,
  aktiv: boolean,
): FastighetsYtorData {
  const norm = normaliseraFastighetsYtor(data);
  const husNu = norm.hus.find((h) => h.id === husId);
  if (!husNu) return norm;
  const nu = new Set(hamtaAktivaFasaderForHus(husNu));
  if (aktiv) {
    if (nu.has(fasad)) return norm;
    if (nu.size >= MAX_ANTAL_FASADER) return norm;
    nu.add(fasad);
  } else {
    nu.delete(fasad);
  }
  const aktivaFasader = Object.fromEntries(
    fasadVaderstreckLista.map((l) => [l.id, nu.has(l.id)]),
  ) as Record<FasadVaderstreckId, boolean>;
  const hus = norm.hus.map((h) =>
    h.id === husId ? { ...h, aktivaFasader } : h,
  );
  let fasadPerHus = norm.fasadPerHus;
  if (!aktiv) {
    fasadPerHus = norm.fasadPerHus.map((rad) =>
      rad.husId === husId ? { ...rad, [fasad]: "" } : rad,
    );
  }
  return { ...norm, hus, fasadPerHus };
}

export function hamtaHusForAdress(
  grund: Grunduppgifter,
  adress: string,
): FastighetsHus | undefined {
  const norm = normaliseraFastighetsYtor(grund.fastighetsYtor);
  const sok = adress.trim().toLowerCase();
  if (!sok) return undefined;
  const franHus = norm.hus.find((h) => h.husnummer.trim().toLowerCase() === sok);
  if (franHus) return franHus;
  const idx = grund.adresser.findIndex((a) => a.trim().toLowerCase() === sok);
  if (idx >= 0) return norm.hus[idx];
  return undefined;
}

export function hamtaTillgangligaFonsterLage(
  grund: Grunduppgifter,
  adress: string,
): typeof fasadVaderstreckLista {
  const hus = hamtaHusForAdress(grund, adress);
  if (!hus) return fasadVaderstreckLista;
  const aktiva = new Set(hamtaAktivaFasaderForHus(hus));
  return fasadVaderstreckLista.filter((l) => aktiva.has(l.id));
}

export function summeraTakKvm(data: FastighetsYtorData): number {
  const norm = normaliseraFastighetsYtor(data);
  if (norm.endastTotalTak) {
    return parseKvm(norm.totalTakKvm);
  }
  return norm.hus.reduce(
    (sum, h) => sum + parseKvm(norm.takPerHus[h.id]),
    0,
  );
}

export type FasadKvmPerVaderstreck = {
  vaderstreck: FasadVaderstreckId;
  etikett: string;
  kvm: number;
};

export function summeraFasadPerVaderstreck(
  data: FastighetsYtorData,
): FasadKvmPerVaderstreck[] {
  const norm = normaliseraFastighetsYtor(data);
  return fasadVaderstreckLista.map(({ id, etikett }) => {
    const kvm = norm.fasadPerHus.reduce((sum, rad) => {
      const hus = norm.hus.find((h) => h.id === rad.husId);
      if (hus && !arFasadAktivForHus(hus, id)) return sum;
      return sum + parseKvm(rad[id]);
    }, 0);
    return { vaderstreck: id, etikett, kvm };
  }).filter((r) => r.kvm > 0);
}

export type HusFasadSummeringRad = {
  husId: string;
  husnummer: string;
  etikett: string;
  kvm: number;
  perVaderstreck: Partial<Record<FasadVaderstreckId, number>>;
};

export function summeraFasadPerHus(
  data: FastighetsYtorData,
): HusFasadSummeringRad[] {
  const norm = normaliseraFastighetsYtor(data);
  return norm.hus.map((h) => {
    const rad = hamtaHusFasadRad(norm, h.id);
    const perVaderstreck: Partial<Record<FasadVaderstreckId, number>> = {};
    let kvm = 0;
    const aktiva = hamtaAktivaFasaderForHus(h);
    for (const id of aktiva) {
      const v = parseKvm(rad[id]);
      if (v > 0) {
        perVaderstreck[id] = v;
        kvm += v;
      }
    }
    return {
      husId: h.id,
      husnummer: h.husnummer,
      etikett: h.etikett,
      kvm,
      perVaderstreck,
    };
  });
}

export type AiYtaForslag = {
  kvm: number;
  forklaring: string;
};

/** Regelbaserat ytförslag (AI-hjälp) utifrån boarea, våningar och väderstreck. */
export function beraknaAiYtaForslag(args: {
  grund: Grunduppgifter;
  husId: string;
  vaderstreck: FasadVaderstreckId;
  typ: "fasad" | "tak";
}): AiYtaForslag {
  const boarea = parseHeltalFranText(args.grund.boarea);
  const byggnader = Math.max(1, parseHeltalFranText(args.grund.antalByggnader) || 1);
  const vaningar = Math.max(1, parseHeltalFranText(args.grund.antalVaningar) || 1);
  const lageEtikett =
    fasadVaderstreckLista.find((l) => l.id === args.vaderstreck)?.etikett ??
    args.vaderstreck;

  if (boarea <= 0) {
    return {
      kvm: 0,
      forklaring:
        "Fyll i boarea i grunduppgifterna för att få ett förslag.",
    };
  }

  const boareaPerHus = boarea / byggnader;
  const fotavtryck = boareaPerHus / (vaningar * 0.85);
  const sida = Math.sqrt(Math.max(fotavtryck, 1));

  if (args.typ === "tak") {
    const kvm = Math.round(fotavtryck);
    return {
      kvm,
      forklaring: `Schablon: boarea ${Math.round(boareaPerHus).toLocaleString("sv-SE")} m² per hus ÷ (${vaningar} vån × 0,85) ≈ ${kvm.toLocaleString("sv-SE")} m² tak per hus. Justera efter verklig takform.`,
    };
  }

  const fasadHojd = vaningar * 2.7;
  let faktor = 1;
  if (args.vaderstreck === "gata" || args.vaderstreck === "gard") {
    faktor = 1.08;
  }
  const kvm = Math.round(sida * fasadHojd * faktor);

  return {
    kvm,
    forklaring: `Schablon för ${lageEtikett}: fasadbredd ca ${Math.round(sida).toLocaleString("sv-SE")} m (√ fotavtryck) × ${fasadHojd.toFixed(1)} m höjd${faktor > 1 ? " (+8 % för gata/gård)" : ""}. Baserat på boarea per hus och antal våningar — verifiera mot kartor.`,
  };
}
