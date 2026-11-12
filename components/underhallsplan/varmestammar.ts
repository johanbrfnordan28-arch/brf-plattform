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
import type { RadiatorTypPost } from "@/components/underhallsplan/radiator-typer";
import {
  formateraVarmeStamHojd,
  normaliseraVarmeRadiatorGrupp,
  varmeAvstandMeter,
  varmeBjalklagAlternativ,
  varmeBjalklagMeter,
  varmeGruppRorMeter,
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

/** Systemtyp för värmeledningar — sparas och kan ändras. */
export type VarmeSystemTypId = "tva-ror" | "en-ror";

export const varmeSystemTypAlternativ: {
  id: VarmeSystemTypId;
  etikett: string;
  beskrivning: string;
}[] = [
  {
    id: "tva-ror",
    etikett: "Tvårörssystem",
    beskrivning:
      "Separata tillopps- och returledningar. Vanligast i flerbostadshus.",
  },
  {
    id: "en-ror",
    etikett: "Enrörssystem",
    beskrivning:
      "Slingor där radiatorerna ansluts i serie på samma cirkulationsledning.",
  },
];

export type VarmeRormaterialId =
  | "svartstal"
  | "galvaniserat"
  | "koppar"
  | "rostfritt"
  | "pex"
  | "annat";

export const varmeRormaterialAlternativ: {
  id: VarmeRormaterialId;
  etikett: string;
}[] = [
  { id: "svartstal", etikett: "Svartstål" },
  { id: "galvaniserat", etikett: "Galvaniserat stål" },
  { id: "koppar", etikett: "Koppar" },
  { id: "rostfritt", etikett: "Rostfritt stål" },
  { id: "pex", etikett: "PEX / multilayer" },
  { id: "annat", etikett: "Annat material" },
];

/**
 * Vad den uppmätta längden avser — avgör hur summering räknar.
 * Gemensam sträckning räknas en gång (ej tillopp + retur dubbelt).
 */
export type VarmeHorisontellLangdAvser =
  | "enkel-ledning"
  | "tillopp"
  | "retur"
  | "gemensam-strackning";

export const varmeHorisontellLangdAvserAlternativ: {
  id: VarmeHorisontellLangdAvser;
  etikett: string;
  beskrivning: string;
  system: "bada" | "tva-ror" | "en-ror";
}[] = [
  {
    id: "enkel-ledning",
    etikett: "Enkel ledning",
    beskrivning: "En enskild rörsträcka (t.ex. enrörsslinga).",
    system: "en-ror",
  },
  {
    id: "tillopp",
    etikett: "Tilloppsledning",
    beskrivning: "Endast tilloppet — räkna separat från retur.",
    system: "tva-ror",
  },
  {
    id: "retur",
    etikett: "Returledning",
    beskrivning: "Endast returen — räkna separat från tillopp.",
    system: "tva-ror",
  },
  {
    id: "gemensam-strackning",
    etikett: "Gemensam sträckning (tillopp + retur)",
    beskrivning:
      "Uppmätt sträcka där tillopp och retur går tillsammans. Räknas en gång — inte dubbelt.",
    system: "tva-ror",
  },
];

/** Horisontell fördelningsledning, vanligtvis i källaren. */
export type VarmeHorisontellLedning = {
  id: string;
  placering: string;
  lopmeter: string;
  langdAvser: VarmeHorisontellLangdAvser;
  rordimension: VarmeRorDimensionId | "";
  rordimensionAnnan: string;
  /** Ytterdiameter i mm när materialet anges så. */
  ytterdiameterMm: string;
  rormaterial: VarmeRormaterialId | "";
  rormaterialAnnan: string;
  kommentar: string;
};

export type VarmestamPost = {
  id: string;
  /**
   * Unikt stamnummer (1, 2, 3…). Ger märkning VS-01 / VS-01-T / VS-01-R.
   * Tillopp och retur med samma nummer tillhör samma stampar.
   */
  stamnummer: number;
  /** Valfritt eget namn utöver stamnummer, t.ex. Trapphus A. */
  namn: string;
  /** Placering i byggnaden. */
  placering: string;
  trapphus: string;
  /** Eventuell schaktbeteckning. */
  schakt: string;
  /** Betjänade våningsplan eller lägenheter. */
  betjanar: string;
  vaningar: string;
  takhojd: VarmeTakhojdId | "";
  takhojdAnnan: string;
  bjalklag: VarmeBjalklagId | "";
  bjalklagAnnan: string;
  /**
   * Legacy: gemensam rördimension. Migreras till tillopp (och retur om tom).
   * @deprecated
   */
  rordimension: VarmeRorDimensionId | "";
  rordimensionAnnan: string;
  rordimensionTillopp: VarmeRorDimensionId | "";
  rordimensionTilloppAnnan: string;
  ytterdiameterTilloppMm: string;
  rordimensionRetur: VarmeRorDimensionId | "";
  rordimensionReturAnnan: string;
  ytterdiameterReturMm: string;
  rormaterial: VarmeRormaterialId | "";
  rormaterialAnnan: string;
  kommentar: string;
  /** Kommentar om skick — för stamförteckning / framtida stamkarta. */
  skickKommentar: string;
  /** Ritningsreferens för framtida stamkarta. */
  ritningsreferens: string;
  /** Enrörssystem: slinga / radiatoranslutning. */
  slingaBeskrivning: string;
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
   * Oftast TA-STAD / injusteringsventil. Vid enrör: ofta samma slinga.
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

/** Sparad översikt för utskrift / PDF. */
export type VarmeSammanstallningSnapshot = {
  id: string;
  sparadDatum: string;
  foreningNamn: string;
  text: string;
};

/**
 * Värmestammar inkl. horisontella fördelningsledningar
 * och valt system (tvårör / enrör).
 */
export type VarmestammarData = {
  /** Tvårör (förvalt) eller enrör. */
  systemTyp: VarmeSystemTypId;
  /** Horisontella fördelningsledningar (ofta i källaren). */
  horisontellaLedningar: VarmeHorisontellLedning[];
  /**
   * Legacy: horisontell tillopp i meter. Migreras till horisontellaLedningar.
   * @deprecated
   */
  stamledningTilloppLopmeter: string;
  /**
   * Legacy: horisontell retur i meter. Migreras till horisontellaLedningar.
   * @deprecated
   */
  stamledningReturLopmeter: string;
  poster: VarmestamPost[];
  /** Senast sparade sammanställningen (för PDF/utskrift). */
  sparadSammanstallning?: VarmeSammanstallningSnapshot | null;
};
export type VarmeStamOversiktFakta = {
  etikett: string;
  varde: string;
};

export type VarmeStamOversikt = {
  id: string;
  rubrik: string;
  underrubrik: string;
  fakta: VarmeStamOversiktFakta[];
  tilloppsventil: string;
  returventil: string;
  tilloppHarBild: boolean;
  returHarBild: boolean;
  radiatorer: VarmeStamOversiktFakta[];
};

export function skapaVarmestamPostId(): string {
  return `varmestam-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function skapaHorisontellLedningId(): string {
  return `varme-horisontell-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

/** VS-01, VS-02, … */
export function formateraVarmestamNummer(stamnummer: number): string {
  const n = Number.isFinite(stamnummer) && stamnummer > 0 ? Math.floor(stamnummer) : 0;
  if (n <= 0) return "";
  return `VS-${String(n).padStart(2, "0")}`;
}

/** VS-01-T / VS-01-R / VS-01 beroende på systemdel. */
export function formateraVarmestamMarkning(
  stamnummer: number,
  del: "stam" | "tillopp" | "retur" = "stam",
): string {
  const bas = formateraVarmestamNummer(stamnummer);
  if (!bas) return "";
  if (del === "tillopp") return `${bas}-T`;
  if (del === "retur") return `${bas}-R`;
  return bas;
}

export function nastastaStamnummer(poster: VarmestamPost[]): number {
  const max = poster.reduce(
    (m, p) => Math.max(m, Number.isFinite(p.stamnummer) ? p.stamnummer : 0),
    0,
  );
  return max + 1;
}

export function varmeRormaterialEtikett(
  id: VarmeRormaterialId | "",
  annan: string,
): string {
  if (!id) return "";
  if (id === "annat") return annan.trim() || "Annat material";
  return varmeRormaterialAlternativ.find((a) => a.id === id)?.etikett ?? id;
}

export function formateraRorDimensionMedYtter(
  dimensionId: VarmeRorDimensionId | "",
  dimensionAnnan: string,
  ytterdiameterMm: string,
): string {
  const dim = varmeRorEtikett(dimensionId, dimensionAnnan);
  const ytter = ytterdiameterMm.trim();
  if (dim && ytter) return `${dim} (Ø ${ytter} mm)`;
  if (dim) return dim;
  if (ytter) return `Ø ${ytter} mm`;
  return "";
}

export function skapaTomHorisontellLedning(
  langdAvser: VarmeHorisontellLangdAvser = "tillopp",
): VarmeHorisontellLedning {
  return {
    id: skapaHorisontellLedningId(),
    placering: "",
    lopmeter: "",
    langdAvser,
    rordimension: "",
    rordimensionAnnan: "",
    ytterdiameterMm: "",
    rormaterial: "",
    rormaterialAnnan: "",
    kommentar: "",
  };
}

export function skapaTomVarmestamPost(
  stamnummer = 1,
  namn = "",
): VarmestamPost {
  return {
    id: skapaVarmestamPostId(),
    stamnummer,
    namn,
    placering: "",
    trapphus: "",
    schakt: "",
    betjanar: "",
    vaningar: "",
    takhojd: "2.6",
    takhojdAnnan: "",
    bjalklag: "0.4",
    bjalklagAnnan: "",
    rordimension: "",
    rordimensionAnnan: "",
    rordimensionTillopp: "",
    rordimensionTilloppAnnan: "",
    ytterdiameterTilloppMm: "",
    rordimensionRetur: "",
    rordimensionReturAnnan: "",
    ytterdiameterReturMm: "",
    rormaterial: "",
    rormaterialAnnan: "",
    kommentar: "",
    skickKommentar: "",
    ritningsreferens: "",
    slingaBeskrivning: "",
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
    systemTyp: "tva-ror",
    horisontellaLedningar: [],
    stamledningTilloppLopmeter: "",
    stamledningReturLopmeter: "",
    poster: [],
    sparadSammanstallning: null,
  };
}
function normaliseraSparadSammanstallning(
  raw: unknown,
): VarmeSammanstallningSnapshot | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as Partial<VarmeSammanstallningSnapshot>;
  if (typeof s.id !== "string" || typeof s.text !== "string") return null;
  return {
    id: s.id,
    sparadDatum:
      typeof s.sparadDatum === "string" ? s.sparadDatum : new Date().toISOString(),
    foreningNamn: typeof s.foreningNamn === "string" ? s.foreningNamn : "",
    text: s.text,
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

function arSystemTyp(v: unknown): v is VarmeSystemTypId {
  return v === "tva-ror" || v === "en-ror";
}

function arRormaterial(v: unknown): v is VarmeRormaterialId {
  return varmeRormaterialAlternativ.some((a) => a.id === v);
}

function arLangdAvser(v: unknown): v is VarmeHorisontellLangdAvser {
  return varmeHorisontellLangdAvserAlternativ.some((a) => a.id === v);
}

function parseStamnummer(raw: unknown, fallback: number): number {
  if (typeof raw === "number" && Number.isFinite(raw) && raw > 0) {
    return Math.floor(raw);
  }
  if (typeof raw === "string" && raw.trim()) {
    const n = Number.parseInt(raw.trim(), 10);
    if (Number.isFinite(n) && n > 0) return n;
    const match = raw.match(/(\d+)/);
    if (match) {
      const fromText = Number.parseInt(match[1], 10);
      if (Number.isFinite(fromText) && fromText > 0) return fromText;
    }
  }
  return fallback;
}

function tillVarmeStamForHojd(post: VarmestamPost): VvsVarmeStam {
  const dim =
    post.rordimensionTillopp ||
    post.rordimension ||
    ("" as VarmeRorDimensionId | "");
  const dimAnnan =
    post.rordimensionTillopp === "annat" || post.rordimension === "annat"
      ? post.rordimensionTilloppAnnan || post.rordimensionAnnan
      : "";
  return {
    id: post.id,
    namn: post.namn || formateraVarmestamNummer(post.stamnummer),
    markningKallare: formateraVarmestamMarkning(post.stamnummer, "stam"),
    adress: post.placering,
    betjanar: post.betjanar,
    vaningar: post.vaningar,
    takhojd: post.takhojd,
    takhojdAnnan: post.takhojdAnnan,
    bjalklag: post.bjalklag,
    bjalklagAnnan: post.bjalklagAnnan,
    rumStorlek: post.rumBeskrivning,
    radiatorAntal: "",
    stamRordimension: dim,
    stamRordimensionAnnan: dimAnnan,
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

export function normaliseraHorisontellLedning(
  raw: Partial<VarmeHorisontellLedning> & { id?: string },
  index = 0,
): VarmeHorisontellLedning {
  const langdAvser = arLangdAvser(raw.langdAvser)
    ? raw.langdAvser
    : "enkel-ledning";
  const rordimension = arRorDimension(raw.rordimension) ? raw.rordimension : "";
  const rormaterial = arRormaterial(raw.rormaterial) ? raw.rormaterial : "";
  return {
    id:
      typeof raw.id === "string" && raw.id
        ? raw.id
        : `varme-horisontell-migrerad-${index}`,
    placering: raw.placering?.trim() ?? "",
    lopmeter: raw.lopmeter?.trim() ?? "",
    langdAvser,
    rordimension,
    rordimensionAnnan:
      rordimension === "annat" ? raw.rordimensionAnnan?.trim() ?? "" : "",
    ytterdiameterMm: raw.ytterdiameterMm?.trim() ?? "",
    rormaterial,
    rormaterialAnnan:
      rormaterial === "annat" ? raw.rormaterialAnnan?.trim() ?? "" : "",
    kommentar: raw.kommentar?.trim() ?? "",
  };
}

export function normaliseraVarmestamPost(
  post: Partial<VarmestamPost> & { id: string },
  index = 0,
): VarmestamPost {
  const takhojd = arTakhojd(post.takhojd) ? post.takhojd : "";
  const bjalklag = arBjalklag(post.bjalklag) ? post.bjalklag : "";
  const legacyDim = arRorDimension(post.rordimension) ? post.rordimension : "";
  // Tom sträng ska falla tillbaka till legacy — behåll befintliga uppgifter
  const harTillopp =
    typeof post.rordimensionTillopp === "string" &&
    post.rordimensionTillopp.trim() !== "";
  const harRetur =
    typeof post.rordimensionRetur === "string" &&
    post.rordimensionRetur.trim() !== "";
  const rordimensionTillopp = harTillopp && arRorDimension(post.rordimensionTillopp)
    ? post.rordimensionTillopp
    : legacyDim;
  const rordimensionRetur = harRetur && arRorDimension(post.rordimensionRetur)
    ? post.rordimensionRetur
    : legacyDim;
  const rormaterial = arRormaterial(post.rormaterial) ? post.rormaterial : "";
  const tilloppsventil = arVentilModell(post.tilloppsventil)
    ? post.tilloppsventil
    : VARMESTAM_TILLOPP_VENTIL_DEFAULT;
  const returventil = arVentilModell(post.returventil)
    ? post.returventil
    : VARMESTAM_RETUR_VENTIL_DEFAULT;
  const stamnummer = parseStamnummer(post.stamnummer, index + 1);
  return {
    id: post.id,
    stamnummer,
    namn: post.namn?.trim() ?? "",
    placering: post.placering?.trim() ?? "",
    trapphus: post.trapphus?.trim() ?? "",
    schakt: post.schakt?.trim() ?? "",
    betjanar: post.betjanar?.trim() ?? "",
    vaningar: post.vaningar?.trim() ?? "",
    takhojd,
    takhojdAnnan: takhojd === "annat" ? post.takhojdAnnan?.trim() ?? "" : "",
    bjalklag,
    bjalklagAnnan: bjalklag === "annat" ? post.bjalklagAnnan?.trim() ?? "" : "",
    rordimension: legacyDim,
    rordimensionAnnan:
      legacyDim === "annat" ? post.rordimensionAnnan?.trim() ?? "" : "",
    rordimensionTillopp,
    rordimensionTilloppAnnan:
      rordimensionTillopp === "annat"
        ? (post.rordimensionTilloppAnnan?.trim() ||
            post.rordimensionAnnan?.trim() ||
            "")
        : "",
    ytterdiameterTilloppMm: post.ytterdiameterTilloppMm?.trim() ?? "",
    rordimensionRetur,
    rordimensionReturAnnan:
      rordimensionRetur === "annat"
        ? (post.rordimensionReturAnnan?.trim() ||
            post.rordimensionAnnan?.trim() ||
            "")
        : "",
    ytterdiameterReturMm: post.ytterdiameterReturMm?.trim() ?? "",
    rormaterial,
    rormaterialAnnan:
      rormaterial === "annat" ? post.rormaterialAnnan?.trim() ?? "" : "",
    kommentar: post.kommentar?.trim() ?? "",
    skickKommentar: post.skickKommentar?.trim() ?? "",
    ritningsreferens: post.ritningsreferens?.trim() ?? "",
    slingaBeskrivning: post.slingaBeskrivning?.trim() ?? "",
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
          .map((grupp, i) =>
            normaliseraVarmeRadiatorGrupp(
              grupp as Partial<VarmeRadiatorGrupp>,
              i,
            ),
          )
      : [],
    vertikalLopmeter: post.vertikalLopmeter?.trim() ?? "",
  };
}

function migreraLegacyStamledning(
  tillopp: string,
  retur: string,
  befintliga: VarmeHorisontellLedning[],
): VarmeHorisontellLedning[] {
  if (befintliga.length > 0) return befintliga;
  const ledningar: VarmeHorisontellLedning[] = [];
  if (tillopp.trim()) {
    ledningar.push(
      normaliseraHorisontellLedning({
        ...skapaTomHorisontellLedning("tillopp"),
        id: "varme-horisontell-legacy-tillopp",
        placering: "Källare",
        lopmeter: tillopp.trim(),
        langdAvser: "tillopp",
      }),
    );
  }
  if (retur.trim()) {
    ledningar.push(
      normaliseraHorisontellLedning({
        ...skapaTomHorisontellLedning("retur"),
        id: "varme-horisontell-legacy-retur",
        placering: "Källare",
        lopmeter: retur.trim(),
        langdAvser: "retur",
      }),
    );
  }
  return ledningar;
}

/** Accepterar både ny struktur och äldre array av stammar. */
export function normaliseraVarmestammarData(raw: unknown): VarmestammarData {
  if (Array.isArray(raw)) {
    const poster = raw
      .filter(
        (post): post is VarmestamPost =>
          Boolean(post) &&
          typeof post === "object" &&
          typeof (post as VarmestamPost).id === "string",
      )
      .map((post, index) =>
        normaliseraVarmestamPost(
          { ...skapaTomVarmestamPost(index + 1), ...post },
          index,
        ),
      );
    return {
      systemTyp: "tva-ror",
      horisontellaLedningar: [],
      stamledningTilloppLopmeter: "",
      stamledningReturLopmeter: "",
      poster,
      sparadSammanstallning: null,
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
  const tilloppLegacy =
    (typeof kalla.stamledningTilloppLopmeter === "string"
      ? kalla.stamledningTilloppLopmeter
      : typeof kalla.tilloppLopmeter === "string"
        ? kalla.tilloppLopmeter
        : ""
    ).trim();
  const returLegacy =
    (typeof kalla.stamledningReturLopmeter === "string"
      ? kalla.stamledningReturLopmeter
      : typeof kalla.returLopmeter === "string"
        ? kalla.returLopmeter
        : ""
    ).trim();
  const ledningarRaw = Array.isArray(kalla.horisontellaLedningar)
    ? kalla.horisontellaLedningar
        .filter((l) => Boolean(l) && typeof l === "object")
        .map((l, i) =>
          normaliseraHorisontellLedning(
            l as Partial<VarmeHorisontellLedning>,
            i,
          ),
        )
    : [];
  const horisontellaLedningar = migreraLegacyStamledning(
    tilloppLegacy,
    returLegacy,
    ledningarRaw,
  );
  const poster = posterRaw
    .filter(
      (post): post is VarmestamPost =>
        Boolean(post) &&
        typeof post === "object" &&
        typeof (post as VarmestamPost).id === "string",
    )
    .map((post, index) =>
      normaliseraVarmestamPost(
        { ...skapaTomVarmestamPost(index + 1), ...post },
        index,
      ),
    );

  return {
    systemTyp: arSystemTyp(kalla.systemTyp) ? kalla.systemTyp : "tva-ror",
    horisontellaLedningar,
    // Behåll legacy-fält synkade för äldre konsumenter / migrering
    stamledningTilloppLopmeter: tilloppLegacy,
    stamledningReturLopmeter: returLegacy,
    poster,
    sparadSammanstallning: normaliseraSparadSammanstallning(
      kalla.sparadSammanstallning,
    ),
  };
}

/** Summerar registrerade horisontella längder utan dubbelräkning. */
export function summeraHorisontellaLedningarMeter(
  ledningar: VarmeHorisontellLedning[],
): {
  totalt: number;
  tillopp: number;
  retur: number;
  gemensam: number;
  enkel: number;
} {
  let tillopp = 0;
  let retur = 0;
  let gemensam = 0;
  let enkel = 0;
  for (const l of ledningar) {
    const m = parseNummerSumma([l.lopmeter]);
    if (m <= 0) continue;
    switch (l.langdAvser) {
      case "tillopp":
        tillopp += m;
        break;
      case "retur":
        retur += m;
        break;
      case "gemensam-strackning":
        gemensam += m;
        break;
      default:
        enkel += m;
        break;
    }
  }
  return {
    totalt: tillopp + retur + gemensam + enkel,
    tillopp,
    retur,
    gemensam,
    enkel,
  };
}
export function varmestamRubrik(
  post: VarmestamPost,
  systemTyp: VarmeSystemTypId = "tva-ror",
): string {
  const p = normaliseraVarmestamPost(post);
  const markning =
    systemTyp === "tva-ror"
      ? `${formateraVarmestamMarkning(p.stamnummer, "tillopp")} / ${formateraVarmestamMarkning(p.stamnummer, "retur")}`
      : formateraVarmestamMarkning(p.stamnummer, "stam");
  if (p.namn && p.namn !== markning && !p.namn.startsWith("VS-")) {
    return `${markning} · ${p.namn}`;
  }
  if (p.namn) return p.namn.startsWith("VS-") ? p.namn : `${markning} · ${p.namn}`;
  return markning || "Värmestam";
}

export function formateraVarmestamPost(
  post: VarmestamPost,
  systemTyp: VarmeSystemTypId = "tva-ror",
): string {
  const p = normaliseraVarmestamPost(post);
  const rubrik = varmestamRubrik(p, systemTyp);
  const delar: string[] = [];
  if (p.placering) delar.push(p.placering);
  if (p.trapphus) delar.push(`trapphus ${p.trapphus}`);
  if (p.schakt) delar.push(`schakt ${p.schakt}`);
  if (p.betjanar) delar.push(p.betjanar);
  if (p.vaningar) delar.push(`${p.vaningar} våningar`);
  const hojd = formateraVarmeStamHojd(tillVarmeStamForHojd(p));
  if (hojd) delar.push(`höjd ${hojd}`);
  else if (p.vertikalLopmeter) delar.push(`vertikal ${p.vertikalLopmeter} m`);
  if (systemTyp === "tva-ror") {
    const dimT = formateraRorDimensionMedYtter(
      p.rordimensionTillopp,
      p.rordimensionTilloppAnnan,
      p.ytterdiameterTilloppMm,
    );
    const dimR = formateraRorDimensionMedYtter(
      p.rordimensionRetur,
      p.rordimensionReturAnnan,
      p.ytterdiameterReturMm,
    );
    if (dimT) delar.push(`tillopp ${dimT}`);
    if (dimR) delar.push(`retur ${dimR}`);
  } else {
    const dim = formateraRorDimensionMedYtter(
      p.rordimensionTillopp || p.rordimension,
      p.rordimensionTilloppAnnan || p.rordimensionAnnan,
      p.ytterdiameterTilloppMm,
    );
    if (dim) delar.push(`rördimension ${dim}`);
    if (p.slingaBeskrivning) delar.push(p.slingaBeskrivning);
  }
  const material = varmeRormaterialEtikett(p.rormaterial, p.rormaterialAnnan);
  if (material) delar.push(material);
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
  if (systemTyp === "tva-ror") {
    delar.push(
      `tillopp ${tillopp}${p.tilloppsventilBildDataUrl ? " (bild)" : ""}`,
    );
    delar.push(`retur ${retur}${p.returventilBildDataUrl ? " (bild)" : ""}`);
  } else {
    delar.push(`ventil ${tillopp}${p.tilloppsventilBildDataUrl ? " (bild)" : ""}`);
  }
  return delar.length > 0 ? `${rubrik}: ${delar.join(", ")}` : rubrik;
}

export function summeraVarmestammarData(
  data: VarmestammarData,
): ListaSummeringRad[] {
  const d = normaliseraVarmestammarData(data);
  const rader = d.poster;
  const summering: ListaSummeringRad[] = [];

  const systemEtikett =
    varmeSystemTypAlternativ.find((a) => a.id === d.systemTyp)?.etikett ??
    d.systemTyp;
  summering.push({ etikett: "Systemtyp", varde: systemEtikett });

  const horisontell = summeraHorisontellaLedningarMeter(d.horisontellaLedningar);
  if (horisontell.tillopp > 0) {
    summering.push({
      etikett: "Horisontella ledningar — tillopp",
      varde: `${formatSummeringTal(horisontell.tillopp)} m`,
    });
  }
  if (horisontell.retur > 0) {
    summering.push({
      etikett: "Horisontella ledningar — retur",
      varde: `${formatSummeringTal(horisontell.retur)} m`,
    });
  }
  if (horisontell.gemensam > 0) {
    summering.push({
      etikett: "Horisontella ledningar — gemensam sträckning",
      varde: `${formatSummeringTal(horisontell.gemensam)} m (räknas en gång)`,
    });
  }
  if (horisontell.enkel > 0) {
    summering.push({
      etikett: "Horisontella ledningar — enkel ledning",
      varde: `${formatSummeringTal(horisontell.enkel)} m`,
    });
  }
  if (horisontell.totalt > 0) {
    summering.push({
      etikett: "Horisontella ledningar — registrerad längd totalt",
      varde: `${formatSummeringTal(horisontell.totalt)} m`,
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
      etikett:
        d.systemTyp === "tva-ror"
          ? "Stamhöjd totalt (per stampar, ej tillopp+retur dubbelt)"
          : "Stamhöjd totalt",
      varde: `${formatSummeringTal(vertikal)} m`,
    });
  }

  const perDimension = new Map<string, { antal: number; meter: number }>();
  for (const stam of rader) {
    if (d.systemTyp === "tva-ror") {
      const dimT = formateraRorDimensionMedYtter(
        stam.rordimensionTillopp,
        stam.rordimensionTilloppAnnan,
        stam.ytterdiameterTilloppMm,
      );
      const dimR = formateraRorDimensionMedYtter(
        stam.rordimensionRetur,
        stam.rordimensionReturAnnan,
        stam.ytterdiameterReturMm,
      );
      for (const etikett of [dimT && `T ${dimT}`, dimR && `R ${dimR}`].filter(
        Boolean,
      ) as string[]) {
        const aktuell = perDimension.get(etikett) ?? { antal: 0, meter: 0 };
        aktuell.antal += 1;
        aktuell.meter += varmestamVertikalMeter(stam);
        perDimension.set(etikett, aktuell);
      }
    } else {
      const etikett =
        formateraRorDimensionMedYtter(
          stam.rordimensionTillopp || stam.rordimension,
          stam.rordimensionTilloppAnnan || stam.rordimensionAnnan,
          stam.ytterdiameterTilloppMm,
        ) ||
        varmeRorEtikett(stam.rordimension, stam.rordimensionAnnan);
      if (!etikett) continue;
      const aktuell = perDimension.get(etikett) ?? { antal: 0, meter: 0 };
      aktuell.antal += 1;
      aktuell.meter += varmestamVertikalMeter(stam);
      perDimension.set(etikett, aktuell);
    }
  }
  for (const [etikett, tal] of perDimension) {
    const delar = [`${tal.antal} st`];
    if (tal.meter > 0) delar.push(`${formatSummeringTal(tal.meter)} m höjd`);
    summering.push({
      etikett: `Rördimension ${etikett}`,
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
  if (medReturbild > 0 && d.systemTyp === "tva-ror") {
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
    systemTyp: "tva-ror",
    horisontellaLedningar: [],
    stamledningTilloppLopmeter: "",
    stamledningReturLopmeter: "",
    poster,
  });
}
export function formateraVarmestammarData(data: VarmestammarData): string {
  const d = normaliseraVarmestammarData(data);
  const texter = d.poster
    .map((p) => formateraVarmestamPost(p, d.systemTyp))
    .filter((t) => t && !t.match(/^Värmestam$/));
  const summering = summeraVarmestammarData(d);
  const ledning = summering
    .filter((r) => r.etikett.includes("Horisontella"))
    .map((r) => `${r.etikett} ${r.varde}`);
  if (texter.length > 0) {
    return [...ledning, ...texter].join(" · ");
  }
  return formateraSummeringRader(summering);
}

/** @deprecated Använd formateraVarmestammarData. */
export function formateraVarmestamPoster(poster: VarmestamPost[]): string {
  return formateraVarmestammarData({
    systemTyp: "tva-ror",
    horisontellaLedningar: [],
    stamledningTilloppLopmeter: "",
    stamledningReturLopmeter: "",
    poster,
  });
}

/** Migrerar äldre VVS → Värme-stammar till Värmestammar-modellen. */
export function varmestamFranVvsVarmeStam(
  stam: VvsVarmeStam,
  index = 0,
): VarmestamPost {
  const ytaFranText = parseNummerSumma([stam.rumStorlek ?? ""]);
  const stamnummer = parseStamnummer(stam.namn, index + 1);
  return normaliseraVarmestamPost(
    {
      ...skapaTomVarmestamPost(stamnummer, stam.namn || ""),
      id: stam.id,
      stamnummer,
      namn: stam.namn,
      placering: stam.adress?.trim() || "",
      schakt: stam.markningKallare?.trim() || "",
      betjanar: stam.betjanar ?? "",
      vaningar: stam.vaningar ?? "",
      takhojd: stam.takhojd ?? "",
      takhojdAnnan: stam.takhojdAnnan ?? "",
      bjalklag: stam.bjalklag ?? "",
      bjalklagAnnan: stam.bjalklagAnnan ?? "",
      rordimension: stam.stamRordimension ?? "",
      rordimensionAnnan: stam.stamRordimensionAnnan ?? "",
      rordimensionTillopp: stam.stamRordimension ?? "",
      rordimensionTilloppAnnan: stam.stamRordimensionAnnan ?? "",
      rordimensionRetur: stam.stamRordimension ?? "",
      rordimensionReturAnnan: stam.stamRordimensionAnnan ?? "",
      rumYtaKvm: ytaFranText > 0 ? String(ytaFranText) : "",
      rumBeskrivning: stam.rumStorlek ?? "",
      radiatorGrupper: stam.radiatorGrupper ?? [],
      vertikalLopmeter: "",
    },
    index,
  );
}

/** Strukturerad översikt per stam — ventiler, radiatorer och nyckeltal. */
export function byggVarmeStamOversikt(
  post: VarmestamPost,
  radiatorTyper?: RadiatorTypPost[],
  systemTyp: VarmeSystemTypId = "tva-ror",
): VarmeStamOversikt {
  const p = normaliseraVarmestamPost(post);
  const rubrik = varmestamRubrik(p, systemTyp);
  const underrubrik = [
    p.placering,
    p.trapphus ? `Trapphus ${p.trapphus}` : "",
    p.schakt ? `Schakt ${p.schakt}` : "",
    p.betjanar,
  ]
    .filter(Boolean)
    .join(" · ");
  const fakta: VarmeStamOversiktFakta[] = [];

  fakta.push({
    etikett: "Stamnummer",
    varde: formateraVarmestamNummer(p.stamnummer) || String(p.stamnummer),
  });
  if (systemTyp === "tva-ror") {
    fakta.push({
      etikett: "Märkning",
      varde: `${formateraVarmestamMarkning(p.stamnummer, "tillopp")} / ${formateraVarmestamMarkning(p.stamnummer, "retur")}`,
    });
  }

  const hojd = formateraVarmeStamHojd(tillVarmeStamForHojd(p));
  const total = varmestamVertikalMeter(p);
  if (hojd) fakta.push({ etikett: "Stamhöjd", varde: hojd });
  else if (total > 0) {
    fakta.push({ etikett: "Stamhöjd", varde: `${formatSummeringTal(total)} m` });
  }

  if (systemTyp === "tva-ror") {
    const dimT = formateraRorDimensionMedYtter(
      p.rordimensionTillopp,
      p.rordimensionTilloppAnnan,
      p.ytterdiameterTilloppMm,
    );
    const dimR = formateraRorDimensionMedYtter(
      p.rordimensionRetur,
      p.rordimensionReturAnnan,
      p.ytterdiameterReturMm,
    );
    if (dimT) fakta.push({ etikett: "Rördimension tillopp", varde: dimT });
    if (dimR) fakta.push({ etikett: "Rördimension retur", varde: dimR });
  } else {
    const dim = formateraRorDimensionMedYtter(
      p.rordimensionTillopp || p.rordimension,
      p.rordimensionTilloppAnnan || p.rordimensionAnnan,
      p.ytterdiameterTilloppMm,
    );
    if (dim) fakta.push({ etikett: "Rördimension", varde: dim });
    if (p.slingaBeskrivning) {
      fakta.push({ etikett: "Slinga / anslutning", varde: p.slingaBeskrivning });
    }
  }

  const material = varmeRormaterialEtikett(p.rormaterial, p.rormaterialAnnan);
  if (material) fakta.push({ etikett: "Rörmaterial", varde: material });
  if (p.ritningsreferens) {
    fakta.push({ etikett: "Ritningsreferens", varde: p.ritningsreferens });
  }
  if (p.skickKommentar) {
    fakta.push({ etikett: "Skick", varde: p.skickKommentar });
  }
  if (p.kommentar) fakta.push({ etikett: "Kommentar", varde: p.kommentar });

  const yta = varmestamRumYtaKvm(p);
  const volym = varmestamRumVolymKbm(p);
  if (yta > 0) fakta.push({ etikett: "Golvyta", varde: `${formatSummeringTal(yta)} m²` });
  if (volym > 0) {
    fakta.push({ etikett: "Rumvolym", varde: `${formatSummeringTal(volym)} m³` });
  }
  if (p.rumBeskrivning) {
    fakta.push({ etikett: "Rum", varde: p.rumBeskrivning });
  }

  const tilloppsventil = stamventilModellEtikett(
    p.tilloppsventil || VARMESTAM_TILLOPP_VENTIL_DEFAULT,
    p.tilloppsventilAnnan,
  );
  const returventil = stamventilModellEtikett(
    p.returventil || VARMESTAM_RETUR_VENTIL_DEFAULT,
    p.returventilAnnan,
  );

  const radiatorer: VarmeStamOversiktFakta[] = p.radiatorGrupper.map((grupp) => {
    const element = varmeGruppElement(grupp);
    const storlek = varmeStorlekEtikett(grupp, radiatorTyper);
    const avstand = varmeAvstandMeter(grupp);
    const ror = varmeGruppRorMeter(grupp);
    const rordim = varmeRorEtikett(grupp.rordimension, grupp.rordimensionAnnan);
    const delar = [
      `${formatSummeringTal(element, 0)} st`,
      storlek,
      avstand > 0 ? `${formatSummeringTal(avstand)} m från stam` : "",
      rordim ? `anslutning ${rordim}` : "",
      ror > 0 ? `${formatSummeringTal(ror)} m rör` : "",
    ].filter(Boolean);
    return {
      etikett: storlek || "Radiator",
      varde: delar.join(" · "),
    };
  });

  return {
    id: p.id,
    rubrik,
    underrubrik,
    fakta,
    tilloppsventil,
    returventil,
    tilloppHarBild: Boolean(p.tilloppsventilBildDataUrl),
    returHarBild: Boolean(p.returventilBildDataUrl),
    radiatorer,
  };
}
export function formateraVarmeStamOversiktRader(
  oversikt: VarmeStamOversikt,
  systemTyp: VarmeSystemTypId = "tva-ror",
): string[] {
  const rader: string[] = [`### ${oversikt.rubrik}`];
  if (oversikt.underrubrik) rader.push(oversikt.underrubrik);
  for (const f of oversikt.fakta) {
    rader.push(`${f.etikett}: ${f.varde}`);
  }
  if (systemTyp === "tva-ror") {
    rader.push(
      `Tilloppsventil: ${oversikt.tilloppsventil}${oversikt.tilloppHarBild ? " (bild)" : ""}`,
    );
    rader.push(
      `Returventil: ${oversikt.returventil}${oversikt.returHarBild ? " (bild)" : ""}`,
    );
  } else {
    rader.push(
      `Stamventil: ${oversikt.tilloppsventil}${oversikt.tilloppHarBild ? " (bild)" : ""}`,
    );
  }
  if (oversikt.radiatorer.length > 0) {
    rader.push("Radiatorer:");
    for (const r of oversikt.radiatorer) {
      rader.push(`  · ${r.varde}`);
    }
  } else {
    rader.push("Radiatorer: ej angivna");
  }
  return rader;
}

export const VARME_LIVSLANGD_INFO = [
  "Rörledningar i ett slutet vattenburet värmesystem kan under gynnsamma förhållanden ha en teknisk livslängd som överstiger 100 år.",
  "Eftersom systemet är slutet och samma vatten huvudsakligen cirkulerar begränsas normalt tillförseln av nytt syre. Det minskar risken för invändig korrosion.",
  "Grundprincipen är att fungerande värmeledningar inte ska bytas enbart på grund av ålder.",
  "Så länge systemet fungerar och det inte finns dokumenterade läckage, korrosionsskador eller andra tekniska brister bör fortsatt drift och kontroll normalt prioriteras framför ett generellt ledningsbyte.",
  "Den faktiska livslängden beror på rörmaterial, vattenkvalitet, installationens utförande och driftförhållanden.",
].join("\n\n");

export const VARME_TRYCKFALL_INFO = [
  "Ett slutet värmesystem ska normalt hålla ett stabilt drifttryck, med naturliga variationer beroende på temperatur och drift.",
  "Om systemet återkommande tappar tryck eller behöver fyllas på med nytt vatten kan detta indikera läckage.",
  "Även fel på expansionskärl, säkerhetsventiler eller avluftning kan orsaka tryckförändringar och ska kontrolleras.",
  "Återkommande påfyllning av nytt vatten kan tillföra syre och öka risken för invändig korrosion.",
].join("\n\n");

export const VARME_BADRUMSSCHAKT_INFO = [
  "Det är normalt mindre lämpligt att placera värmeledningar i svårtillgängliga installationsschakt tillsammans med spillvattenledningar, kallvatten och tappvarmvatten.",
  "Läckage kan förekomma i sådana schakt och det kan vara svårt att identifiera vilken installation som läcker.",
  "Gemensamma schakt kan också försvåra framtida reparationer och stambyten, särskilt om badrummets tätskikt och ytskikt måste öppnas.",
  "Vid nyinstallation eller större ombyggnad bör man eftersträva god åtkomlighet och, där det är praktiskt möjligt, separera värmeledningarna från övriga installationer.",
  "Om gemensamma schakt används ska isolering, värmeöverföring till kallvatten, läckagesäkerhet, brandskydd och gällande installationskrav beaktas.",
].join("\n\n");

/** Full text för sparad sammanställning / PDF. */
export function byggVarmeSammanstallningText(
  data: VarmestammarData,
  options?: {
    radiatorTyper?: RadiatorTypPost[];
    foreningNamn?: string;
    datum?: string;
  },
): string {
  const d = normaliseraVarmestammarData(data);
  const datum =
    options?.datum?.trim() || new Date().toLocaleDateString("sv-SE");
  const systemEtikett =
    varmeSystemTypAlternativ.find((a) => a.id === d.systemTyp)?.etikett ??
    d.systemTyp;
  const rader: string[] = [
    "VÄRMESAMMANSTÄLLNING",
    `Datum: ${datum}`,
  ];
  if (options?.foreningNamn?.trim()) {
    rader.push(`Förening: ${options.foreningNamn.trim()}`);
  }
  rader.push(`Systemtyp: ${systemEtikett}`);
  rader.push("");

  rader.push("## Horisontella värmeledningar");
  if (d.horisontellaLedningar.length === 0) {
    rader.push("Inga horisontella ledningar registrerade.");
  } else {
    for (const ledning of d.horisontellaLedningar) {
      const avser =
        varmeHorisontellLangdAvserAlternativ.find(
          (a) => a.id === ledning.langdAvser,
        )?.etikett ?? ledning.langdAvser;
      const dim = formateraRorDimensionMedYtter(
        ledning.rordimension,
        ledning.rordimensionAnnan,
        ledning.ytterdiameterMm,
      );
      const material = varmeRormaterialEtikett(
        ledning.rormaterial,
        ledning.rormaterialAnnan,
      );
      const meter = parseNummerSumma([ledning.lopmeter]);
      const delar = [
        ledning.placering || "Placering ej angiven",
        avser,
        meter > 0 ? `${formatSummeringTal(meter)} m` : "längd ej angiven",
        dim,
        material,
        ledning.kommentar,
      ].filter(Boolean);
      rader.push(`· ${delar.join(" · ")}`);
    }
  }
  rader.push("");

  rader.push("## Stamförteckning / värmestammar");
  rader.push(
    d.systemTyp === "tva-ror"
      ? "Varje stampar räknas en gång. Tillopp (VS-xx-T) och retur (VS-xx-R) tillhör samma stam."
      : "Enrörssystem: varje slinga/stam registreras med sitt stamnummer (VS-xx).",
  );
  rader.push("");
  if (d.poster.length === 0) {
    rader.push("Inga värmestammar registrerade.");
  } else {
    for (const stam of d.poster) {
      rader.push(
        ...formateraVarmeStamOversiktRader(
          byggVarmeStamOversikt(stam, options?.radiatorTyper, d.systemTyp),
          d.systemTyp,
        ),
      );
      rader.push("");
    }
  }

  rader.push("## Summering");
  for (const rad of summeraVarmestammarData(d)) {
    rader.push(`${rad.etikett}: ${rad.varde}`);
  }

  return rader.join("\n");
}
export function skapaVarmeSammanstallningSnapshot(
  data: VarmestammarData,
  options?: {
    radiatorTyper?: RadiatorTypPost[];
    foreningNamn?: string;
  },
): VarmeSammanstallningSnapshot {
  const sparadDatum = new Date().toISOString();
  return {
    id: `varme-sammanstallning-${Date.now().toString(36)}`,
    sparadDatum,
    foreningNamn: options?.foreningNamn?.trim() || "",
    text: byggVarmeSammanstallningText(data, {
      radiatorTyper: options?.radiatorTyper,
      foreningNamn: options?.foreningNamn,
      datum: new Date(sparadDatum).toLocaleDateString("sv-SE"),
    }),
  };
}

export function formateraVarmeSammanstallningDatum(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("sv-SE");
}
