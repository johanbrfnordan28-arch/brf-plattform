import {
  formatSummeringTal,
  formateraSummeringRader,
  parseNummerSumma,
  type ListaSummeringRad,
} from "@/components/underhallsplan/lista-summering";
import {
  stamventilModellEtikett,
  stamventilModeller,
  type StamventilModellId,
} from "@/components/underhallsplan/stamventiler";
import {
  formateraVarmeStamHojd,
  normaliseraVarmeRadiatorGrupp,
  varmeBjalklagAlternativ,
  varmeBjalklagMeter,
  varmeRorDimensioner,
  varmeRorEtikett,
  varmeStorlekEtikett,
  varmeTakhojdAlternativ,
  varmeTakhojdMeter,
  varmeVaningarAntal,
  varmeGruppElement,
  varmeStamVertikalMeter,
  type VarmeBjalklagId,
  type VarmeRadiatorGrupp,
  type VarmeRorDimensionId,
  type VarmeTakhojdId,
  type VvsVarmeStam,
} from "@/components/underhallsplan/vvs-varme";

export const VARMESTAMMAR_UNDERKOMPONENT_ID = "varmestammar";

/** Standard: avstängning på tillopp så stammen kan stängas utan att tömma hela systemet. */
export const VARMESTAM_TILLOPP_VENTIL_DEFAULT: StamventilModellId =
  "avstangningsventil";

/**
 * Standard: TA-STAD på retur — injustering, mätning och avstängning
 * (vanlig placering i flerbostadshus).
 */
export const VARMESTAM_RETUR_VENTIL_DEFAULT: StamventilModellId = "ta-stad";

export type VarmestamPost = {
  id: string;
  /** Namn styrelsen ger stammen, t.ex. Stam 1 / Trapphus A. */
  namn: string;
  /** Placering / trapphus / adress. */
  placering: string;
  /** Vad stammen betjänar, t.ex. 3 rum och kök, vardagsrum. */
  betjanar: string;
  vaningar: string;
  takhojd: VarmeTakhojdId | "";
  takhojdAnnan: string;
  bjalklag: VarmeBjalklagId | "";
  bjalklagAnnan: string;
  rordimension: VarmeRorDimensionId | "";
  rordimensionAnnan: string;
  /**
   * Ventil där stammen går upp från horisontell stamledning (tillopp).
   * Oftast avstängningsventil.
   */
  tilloppsventil: StamventilModellId | "";
  tilloppsventilAnnan: string;
  tilloppsventilBildDataUrl: string;
  tilloppsventilBildFilnamn: string;
  /**
   * Ventil där stammen kommer tillbaka (retur).
   * Oftast TA-STAD / injusteringsventil.
   */
  returventil: StamventilModellId | "";
  returventilAnnan: string;
  returventilBildDataUrl: string;
  returventilBildFilnamn: string;
  /**
   * Golvyta (m²) som stammen betjänar — underlag för effektbehov.
   * Rumvolym (m³) räknas som yta × takhöjd.
   */
  rumYtaKvm: string;
  /** Fritext om rummen, t.ex. vardagsrum + två sovrum. */
  rumBeskrivning: string;
  /** Radiatorer på stammen — storlek, antal och avstånd. */
  radiatorGrupper: VarmeRadiatorGrupp[];
  /** Äldre fält — behålls som fallback om höjd inte kan räknas. */
  vertikalLopmeter: string;
  /**
   * Äldre per-stam horisontell gren — ersatt av gemensam stamledning.
   * @deprecated
   */
  horisontellLopmeter?: string;
};

/**
 * Värmestammar inkl. den gemensamma horisontella stamledningen
 * som alla stammar går upp från.
 */
export type VarmestammarData = {
  /** Horisontell stamledning värme — tillopp i källaren, meter. */
  stamledningTilloppLopmeter: string;
  /** Horisontell stamledning värme — retur i källaren, meter. */
  stamledningReturLopmeter: string;
  poster: VarmestamPost[];
};

export function skapaVarmestamPostId(): string {
  return `varmestam-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function skapaTomVarmestamPost(namn = ""): VarmestamPost {
  return {
    id: skapaVarmestamPostId(),
    namn,
    placering: "",
    betjanar: "",
    vaningar: "",
    takhojd: "2.6",
    takhojdAnnan: "",
    bjalklag: "0.4",
    bjalklagAnnan: "",
    rordimension: "mm30",
    rordimensionAnnan: "",
    tilloppsventil: VARMESTAM_TILLOPP_VENTIL_DEFAULT,
    tilloppsventilAnnan: "",
    tilloppsventilBildDataUrl: "",
    tilloppsventilBildFilnamn: "",
    returventil: VARMESTAM_RETUR_VENTIL_DEFAULT,
    returventilAnnan: "",
    returventilBildDataUrl: "",
    returventilBildFilnamn: "",
    rumYtaKvm: "",
    rumBeskrivning: "",
    radiatorGrupper: [],
    vertikalLopmeter: "",
  };
}

export function skapaTomVarmestammarData(): VarmestammarData {
  return {
    stamledningTilloppLopmeter: "",
    stamledningReturLopmeter: "",
    poster: [],
  };
}

function arTakhojd(v: unknown): v is VarmeTakhojdId {
  return varmeTakhojdAlternativ.some((a) => a.id === v);
}

function arBjalklag(v: unknown): v is VarmeBjalklagId {
  return varmeBjalklagAlternativ.some((a) => a.id === v);
}

function arRorDimension(v: unknown): v is VarmeRorDimensionId {
  return varmeRorDimensioner.some((d) => d.id === v);
}

function arVentilModell(v: unknown): v is StamventilModellId {
  return stamventilModeller.some((m) => m.id === v);
}

function tillVarmeStamForHojd(post: VarmestamPost): VvsVarmeStam {
  return {
    id: post.id,
    namn: post.namn,
    markningKallare: "",
    adress: post.placering,
    betjanar: post.betjanar,
    vaningar: post.vaningar,
    takhojd: post.takhojd,
    takhojdAnnan: post.takhojdAnnan,
    bjalklag: post.bjalklag,
    bjalklagAnnan: post.bjalklagAnnan,
    rumStorlek: post.rumBeskrivning,
    radiatorAntal: "",
    stamRordimension: post.rordimension,
    stamRordimensionAnnan: post.rordimensionAnnan,
    radiatorGrupper: post.radiatorGrupper ?? [],
  };
}

export function varmestamVertikalMeter(post: VarmestamPost): number {
  const beraknad = varmeStamVertikalMeter(tillVarmeStamForHojd(post));
  if (beraknad > 0) return beraknad;
  return parseNummerSumma([post.vertikalLopmeter]);
}

export function varmestamRumYtaKvm(post: VarmestamPost): number {
  return parseNummerSumma([post.rumYtaKvm]);
}

/** Rumvolym (m³) = golvyta × takhöjd. Används vid förenklad effektuppskattning. */
export function varmestamRumVolymKbm(post: VarmestamPost): number {
  const yta = varmestamRumYtaKvm(post);
  const tak = varmeTakhojdMeter(tillVarmeStamForHojd(post));
  if (yta <= 0 || tak <= 0) return 0;
  return yta * tak;
}

export type VarmestamVaningsLangd = {
  vaning: number;
  /** Löpmeter stamledning inom våningen (takhöjd). */
  inomVaningMeter: number;
  /** Kumulativ höjd från källare/start upp till våningens tak. */
  kumulativMeter: number;
};

/**
 * Längd per våningsplan: inom våning = takhöjd, mellan våningar läggs bjälklag till.
 */
export function varmestamVaningsLangder(
  post: VarmestamPost,
): VarmestamVaningsLangd[] {
  const vaningar = varmeVaningarAntal(tillVarmeStamForHojd(post));
  const tak = varmeTakhojdMeter(tillVarmeStamForHojd(post));
  const bjalk = varmeBjalklagMeter(tillVarmeStamForHojd(post));
  if (vaningar <= 0 || tak <= 0) return [];
  const rader: VarmestamVaningsLangd[] = [];
  let kumulativ = 0;
  for (let i = 1; i <= vaningar; i += 1) {
    if (i > 1) kumulativ += bjalk;
    kumulativ += tak;
    rader.push({
      vaning: i,
      inomVaningMeter: tak,
      kumulativMeter: kumulativ,
    });
  }
  return rader;
}

export function varmestamRadiatorElement(post: VarmestamPost): number {
  return (post.radiatorGrupper ?? []).reduce(
    (sum, grupp) => sum + varmeGruppElement(grupp),
    0,
  );
}

export function normaliseraVarmestamPost(post: VarmestamPost): VarmestamPost {
  const takhojd = arTakhojd(post.takhojd) ? post.takhojd : "";
  const bjalklag = arBjalklag(post.bjalklag) ? post.bjalklag : "";
  const rordimension = arRorDimension(post.rordimension) ? post.rordimension : "";
  const tilloppsventil = arVentilModell(post.tilloppsventil)
    ? post.tilloppsventil
    : VARMESTAM_TILLOPP_VENTIL_DEFAULT;
  const returventil = arVentilModell(post.returventil)
    ? post.returventil
    : VARMESTAM_RETUR_VENTIL_DEFAULT;
  return {
    id: post.id,
    namn: post.namn.trim(),
    placering: post.placering?.trim() ?? "",
    betjanar: post.betjanar?.trim() ?? "",
    vaningar: post.vaningar?.trim() ?? "",
    takhojd,
    takhojdAnnan: takhojd === "annat" ? post.takhojdAnnan?.trim() ?? "" : "",
    bjalklag,
    bjalklagAnnan: bjalklag === "annat" ? post.bjalklagAnnan?.trim() ?? "" : "",
    rordimension,
    rordimensionAnnan:
      rordimension === "annat" ? post.rordimensionAnnan?.trim() ?? "" : "",
    tilloppsventil,
    tilloppsventilAnnan:
      tilloppsventil === "annat" ? post.tilloppsventilAnnan?.trim() ?? "" : "",
    tilloppsventilBildDataUrl: post.tilloppsventilBildDataUrl?.startsWith(
      "data:image/",
    )
      ? post.tilloppsventilBildDataUrl
      : "",
    tilloppsventilBildFilnamn: post.tilloppsventilBildFilnamn?.trim() ?? "",
    returventil,
    returventilAnnan:
      returventil === "annat" ? post.returventilAnnan?.trim() ?? "" : "",
    returventilBildDataUrl: post.returventilBildDataUrl?.startsWith("data:image/")
      ? post.returventilBildDataUrl
      : "",
    returventilBildFilnamn: post.returventilBildFilnamn?.trim() ?? "",
    rumYtaKvm: post.rumYtaKvm?.trim() ?? "",
    rumBeskrivning: post.rumBeskrivning?.trim() ?? "",
    radiatorGrupper: Array.isArray(post.radiatorGrupper)
      ? post.radiatorGrupper
          .filter((grupp) => Boolean(grupp) && typeof grupp === "object")
          .map((grupp, index) =>
            normaliseraVarmeRadiatorGrupp(
              grupp as Partial<VarmeRadiatorGrupp>,
              index,
            ),
          )
      : [],
    vertikalLopmeter: post.vertikalLopmeter?.trim() ?? "",
  };
}

/** Accepterar både ny struktur och äldre array av stammar. */
export function normaliseraVarmestammarData(raw: unknown): VarmestammarData {
  if (Array.isArray(raw)) {
    return {
      stamledningTilloppLopmeter: "",
      stamledningReturLopmeter: "",
      poster: raw
        .filter(
          (post): post is VarmestamPost =>
            Boolean(post) &&
            typeof post === "object" &&
            typeof (post as VarmestamPost).id === "string",
        )
        .map((post) =>
          normaliseraVarmestamPost({ ...skapaTomVarmestamPost(), ...post }),
        ),
    };
  }

  if (!raw || typeof raw !== "object") {
    return skapaTomVarmestammarData();
  }

  const kalla = raw as Partial<VarmestammarData> & {
    tilloppLopmeter?: string;
    returLopmeter?: string;
  };
  const posterRaw = Array.isArray(kalla.poster) ? kalla.poster : [];
  return {
    stamledningTilloppLopmeter:
      (typeof kalla.stamledningTilloppLopmeter === "string"
        ? kalla.stamledningTilloppLopmeter
        : typeof kalla.tilloppLopmeter === "string"
          ? kalla.tilloppLopmeter
          : ""
      ).trim(),
    stamledningReturLopmeter:
      (typeof kalla.stamledningReturLopmeter === "string"
        ? kalla.stamledningReturLopmeter
        : typeof kalla.returLopmeter === "string"
          ? kalla.returLopmeter
          : ""
      ).trim(),
    poster: posterRaw
      .filter(
        (post): post is VarmestamPost =>
          Boolean(post) &&
          typeof post === "object" &&
          typeof (post as VarmestamPost).id === "string",
      )
      .map((post) =>
        normaliseraVarmestamPost({ ...skapaTomVarmestamPost(), ...post }),
      ),
  };
}

export function formateraVarmestamPost(post: VarmestamPost): string {
  const p = normaliseraVarmestamPost(post);
  const rubrik = p.namn || "Värmestam";
  const delar: string[] = [];
  if (p.placering) delar.push(p.placering);
  if (p.betjanar) delar.push(p.betjanar);
  if (p.vaningar) delar.push(`${p.vaningar} våningar`);
  const hojd = formateraVarmeStamHojd(tillVarmeStamForHojd(p));
  if (hojd) delar.push(`höjd ${hojd}`);
  else if (p.vertikalLopmeter) delar.push(`vertikal ${p.vertikalLopmeter} m`);
  const dim = varmeRorEtikett(p.rordimension, p.rordimensionAnnan);
  if (dim) delar.push(dim);
  const yta = varmestamRumYtaKvm(p);
  const volym = varmestamRumVolymKbm(p);
  if (yta > 0) delar.push(`${formatSummeringTal(yta)} m²`);
  if (volym > 0) delar.push(`${formatSummeringTal(volym)} m³`);
  const element = varmestamRadiatorElement(p);
  if (element > 0) {
    const storlekar = [
      ...new Set(p.radiatorGrupper.map((g) => varmeStorlekEtikett(g))),
    ].filter(Boolean);
    delar.push(
      `${element} radiatorer${storlekar.length ? ` (${storlekar.join(", ")})` : ""}`,
    );
  }
  const tillopp = stamventilModellEtikett(
    p.tilloppsventil || VARMESTAM_TILLOPP_VENTIL_DEFAULT,
    p.tilloppsventilAnnan,
  );
  const retur = stamventilModellEtikett(
    p.returventil || VARMESTAM_RETUR_VENTIL_DEFAULT,
    p.returventilAnnan,
  );
  delar.push(
    `tillopp ${tillopp}${p.tilloppsventilBildDataUrl ? " (bild)" : ""}`,
  );
  delar.push(`retur ${retur}${p.returventilBildDataUrl ? " (bild)" : ""}`);
  return delar.length > 0 ? `${rubrik}: ${delar.join(", ")}` : rubrik;
}

export function summeraVarmestammarData(
  data: VarmestammarData,
): ListaSummeringRad[] {
  const d = normaliseraVarmestammarData(data);
  const rader = d.poster;

  const summering: ListaSummeringRad[] = [];

  const tillopp = parseNummerSumma([d.stamledningTilloppLopmeter]);
  const retur = parseNummerSumma([d.stamledningReturLopmeter]);
  if (tillopp > 0) {
    summering.push({
      etikett: "Horisontell stamledning värme — tillopp",
      varde: `${formatSummeringTal(tillopp)} m`,
    });
  }
  if (retur > 0) {
    summering.push({
      etikett: "Horisontell stamledning värme — retur",
      varde: `${formatSummeringTal(retur)} m`,
    });
  }

  if (rader.length === 0) return summering;

  summering.push({
    etikett: "Antal värmestammar",
    varde: `${rader.length} st`,
  });

  const vertikal = rader.reduce((sum, p) => sum + varmestamVertikalMeter(p), 0);
  if (vertikal > 0) {
    summering.push({
      etikett: "Stamhöjd totalt",
      varde: `${formatSummeringTal(vertikal)} m`,
    });
  }

  const perDimension = new Map<string, { antal: number; meter: number }>();
  for (const stam of rader) {
    const etikett = varmeRorEtikett(stam.rordimension, stam.rordimensionAnnan);
    if (!etikett) continue;
    const aktuell = perDimension.get(etikett) ?? { antal: 0, meter: 0 };
    aktuell.antal += 1;
    aktuell.meter += varmestamVertikalMeter(stam);
    perDimension.set(etikett, aktuell);
  }
  for (const [etikett, tal] of perDimension) {
    const delar = [`${tal.antal} st`];
    if (tal.meter > 0) delar.push(`${formatSummeringTal(tal.meter)} m höjd`);
    summering.push({
      etikett: `Dimension ${etikett}`,
      varde: delar.join(", "),
    });
  }

  const medTilloppsbild = rader.filter((p) => p.tilloppsventilBildDataUrl).length;
  const medReturbild = rader.filter((p) => p.returventilBildDataUrl).length;
  if (medTilloppsbild > 0) {
    summering.push({
      etikett: "Bilder tilloppsventil",
      varde: `${medTilloppsbild} st`,
    });
  }
  if (medReturbild > 0) {
    summering.push({
      etikett: "Bilder returventil",
      varde: `${medReturbild} st`,
    });
  }

  const ytaTot = rader.reduce((sum, p) => sum + varmestamRumYtaKvm(p), 0);
  const volymTot = rader.reduce((sum, p) => sum + varmestamRumVolymKbm(p), 0);
  if (ytaTot > 0) {
    summering.push({
      etikett: "Golvyta totalt",
      varde: `${formatSummeringTal(ytaTot)} m²`,
    });
  }
  if (volymTot > 0) {
    summering.push({
      etikett: "Rumvolym totalt",
      varde: `${formatSummeringTal(volymTot)} m³`,
    });
  }
  const elementTot = rader.reduce(
    (sum, p) => sum + varmestamRadiatorElement(p),
    0,
  );
  if (elementTot > 0) {
    summering.push({
      etikett: "Radiatorelement",
      varde: `${elementTot} st`,
    });
  }

  return summering;
}

/** @deprecated Använd summeraVarmestammarData. */
export function summeraVarmestamPoster(poster: VarmestamPost[]): ListaSummeringRad[] {
  return summeraVarmestammarData({
    stamledningTilloppLopmeter: "",
    stamledningReturLopmeter: "",
    poster,
  });
}

export function formateraVarmestammarData(data: VarmestammarData): string {
  const d = normaliseraVarmestammarData(data);
  const texter = d.poster
    .map(formateraVarmestamPost)
    .filter((t) => t && !t.match(/^Värmestam$/));
  const summering = summeraVarmestammarData(d);
  const ledning = summering
    .filter((r) => r.etikett.includes("stamledning"))
    .map((r) => `${r.etikett} ${r.varde}`);
  if (texter.length > 0) {
    return [...ledning, ...texter].join(" · ");
  }
  return formateraSummeringRader(summering);
}

/** @deprecated Använd formateraVarmestammarData. */
export function formateraVarmestamPoster(poster: VarmestamPost[]): string {
  return formateraVarmestammarData({
    stamledningTilloppLopmeter: "",
    stamledningReturLopmeter: "",
    poster,
  });
}

/** Migrerar äldre VVS → Värme-stammar till Värmestammar-modellen. */
export function varmestamFranVvsVarmeStam(stam: VvsVarmeStam): VarmestamPost {
  const ytaFranText = parseNummerSumma([stam.rumStorlek ?? ""]);
  return normaliseraVarmestamPost({
    ...skapaTomVarmestamPost(stam.namn || ""),
    id: stam.id,
    namn: stam.namn,
    placering: stam.adress?.trim() || stam.markningKallare?.trim() || "",
    betjanar: stam.betjanar ?? "",
    vaningar: stam.vaningar ?? "",
    takhojd: stam.takhojd ?? "",
    takhojdAnnan: stam.takhojdAnnan ?? "",
    bjalklag: stam.bjalklag ?? "",
    bjalklagAnnan: stam.bjalklagAnnan ?? "",
    rordimension: stam.stamRordimension ?? "",
    rordimensionAnnan: stam.stamRordimensionAnnan ?? "",
    rumYtaKvm: ytaFranText > 0 ? String(ytaFranText) : "",
    rumBeskrivning: stam.rumStorlek ?? "",
    radiatorGrupper: stam.radiatorGrupper ?? [],
    vertikalLopmeter: "",
  });
}
