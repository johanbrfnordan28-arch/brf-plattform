import {
  STAMMAR_KOMPONENT_NAMN,
  type UnderhallBesiktningStatus,
} from "@/components/underhallsplan/komponentregister";
import type {
  BalkongAtgardId,
  BalkongTypId,
} from "@/components/underhallsplan/balkonger";
import type { RenoveringSammanfattning } from "@/components/underhallsplan/types";

export type RenoveringKalla = "ekonomisk_forvaltare" | "styrelse";

/** Andel av klumpsumman (0–1). Summan normaliseras till 1. */
export type RenoveringDelpost = {
  komponent: string;
  del: string;
  andel: number;
  atgardTyp?: string;
  underkomponentId?: string;
  omfattning?: string;
};

/** Flerårigt arbete under samma projekt (t.ex. fönster per väderstreck). */
export type RenoveringEtapp = {
  ar?: number;
  andel: number;
  omfattning?: string;
  del?: string;
  komponent?: string;
};

/** Renoveringar kopplade till borttagen komponent visas under VVS. */
export function normaliseraRenoveringKomponent(komponent: string): string {
  return komponent === STAMMAR_KOMPONENT_NAMN ? "VVS" : komponent;
}

/** Utförd renovering kopplad till en komponent i registret. */
export type UtfördRenovering = {
  id: string;
  komponent: string;
  /** Vald underkomponent i registret (t.ex. balkonger, hiss). */
  underkomponentId?: string;
  /** Etikett för underkomponenten — visas i listor och budget. */
  del?: string;
  /** Balkonger — typ och åtgärd vid utfört arbete. */
  balkongTyp?: BalkongTypId;
  balkongAtgard?: BalkongAtgardId;
  /** Koppling till rad i balkongregistret (steg 3). */
  balkongRadId?: string;
  ar: number;
  titel: string;
  /** Material/ytskikt vid utfört arbete, t.ex. bandtäckt plåt eller puts. */
  material?: string;
  omfattning: string;
  kostnadKr?: number;
  /**
   * Avdrag i % på kostnaden som inte ska följa med till nästa upprepning
   * (t.ex. engångskostnader: håltagning, schakt, akuta åtgärder).
   * Dras av innan kostnaden indexas och fördelas.
   */
  avdragProcent?: number;
  /** Valfri motivering till avdraget. */
  avdragAnledning?: string;
  entreprenor?: string;
  /** Besiktning efter åtgärd — förs till registret vid sparning i steg 2. */
  underhallBesiktning?: UnderhallBesiktningStatus;
  garantiAr?: number;
  ansvarAr?: number;
  kalla: RenoveringKalla;
  /** ISO-datum när posten hämtades från förvaltaren. */
  importeradDatum?: string;
  notering?: string;
  /** Faktura/projekt som omfattar flera delar — kostnad fördelas automatiskt eller via delposter. */
  klumpsumma?: boolean;
  /** Vid stambyte som klumpsumma — antal våtutrymmen kostnaden avser. */
  klumpsummaAntalBadrum?: number;
  klumpsummaAntalKok?: number;
  klumpsummaAntalWc?: number;
  delposter?: RenoveringDelpost[];
  etapper?: RenoveringEtapp[];
  /**
   * Överstyrt planerat år för nästa åtgärd per fördelningsdel
   * (nyckel = renoveringId från fordelRenovering).
   */
  nastaAtgardArOverrides?: Record<string, number>;
  /**
   * Avvikande kommande åtgärd per fördelningsdel (nyckel = renoveringId).
   * T.ex. målning med kortare intervall och lägre kostnad efter fönsterbyte.
   */
  kommandeAtgardOverrides?: Record<string, KommandeAtgardOverride>;
  /**
   * Underkomponenter (samma komponent) som ingick i projektet utan egen kostnadsandel.
   * T.ex. skorstenar vid takomläggning — kopplas i registret till huvudrenoveringen.
   */
  inkluderadeUnderkomponenter?: string[];
};

export type KommandeAtgardLäge = "standard" | "avvikande";

export type KommandeAtgardOverride = {
  läge: KommandeAtgardLäge;
  /** Åtgärd från katalogen när läge är avvikande. */
  atgardId?: string;
  intervallAr?: number;
  nastaAr?: number;
  /** Andel av indexerad kostnad för större åtgärd (0–1). */
  kostnadAndel?: number;
  /** Explicit kostnad (kr) — överstyr andel. */
  kostnadKr?: number;
};

/**
 * Demo-underlag som motsvarar export från ekonomisk förvaltare.
 * Bygg vidare med API/import — samma fält och struktur.
 */
export const demoRenoveringarFranForvaltare: UtfördRenovering[] = [
  {
    id: "forv-tak-2019",
    komponent: "Tak",
    ar: 2019,
    titel: "Omläggning tak",
    material: "bitumen-tatskiktsmatta",
    omfattning: "Byte av takbeläggning, kompletterande plåtarbeten.",
    kostnadKr: 1_850_000,
    entreprenor: "Tak & Plåt AB",
    kalla: "ekonomisk_forvaltare",
    importeradDatum: "2026-01-15",
  },
  {
    id: "forv-fasad-2016",
    komponent: "Fasad",
    ar: 2016,
    titel: "Ommålning fasad",
    material: "puts",
    omfattning: "Tvätt och ommålning av putsad fasad, reparation av sprickor.",
    kostnadKr: 620_000,
    entreprenor: "Fasadpartner Syd",
    kalla: "ekonomisk_forvaltare",
    importeradDatum: "2026-01-15",
  },
  {
    id: "forv-stammar-2021",
    komponent: "VVS",
    ar: 2021,
    titel: "Stambyte etapp 1",
    omfattning: "Stambyte våning 1–3, badrum och kök.",
    kostnadKr: 4_200_000,
    kalla: "ekonomisk_forvaltare",
    importeradDatum: "2026-01-15",
    notering: "Etapp 2 planerad enligt underhållsplan.",
  },
  {
    id: "forv-trapphus-2018",
    komponent: "Trapphus",
    ar: 2018,
    titel: "Målning trapphus",
    omfattning: "Spackling, målning väggar och snickerier i samtliga trapphus.",
    kostnadKr: 285_000,
    kalla: "ekonomisk_forvaltare",
    importeradDatum: "2026-01-15",
  },
  {
    id: "forv-tvatt-2020",
    komponent: "Källare",
    ar: 2020,
    titel: "Renovering tvättstuga",
    omfattning: "Nya maskiner, bänkskivor, golv och belysning.",
    kostnadKr: 410_000,
    entreprenor: "Tvätt & Service i Stockholm",
    kalla: "ekonomisk_forvaltare",
    importeradDatum: "2026-01-15",
  },
  {
    id: "forv-fonster-2014",
    komponent: "Fasad",
    ar: 2014,
    titel: "Fönsterbyte gårdshus",
    omfattning: "Treglasfönster, gårdshus och gemensamma utrymmen.",
    kostnadKr: 890_000,
    kalla: "ekonomisk_forvaltare",
    importeradDatum: "2026-01-15",
  },
  {
    id: "forv-vent-2017",
    komponent: "Ventilation",
    ar: 2017,
    titel: "Ventilationsbalansering",
    omfattning: "Injustering och filterbyte i centralt system.",
    kostnadKr: 95_000,
    kalla: "ekonomisk_forvaltare",
    importeradDatum: "2026-01-15",
  },
];

export function filterRenoveringarForKomponenter(
  renoveringar: UtfördRenovering[],
  komponenter: string[],
): UtfördRenovering[] {
  if (komponenter.length === 0) return [];
  const set = new Set(komponenter);
  return renoveringar.filter((item) =>
    set.has(normaliseraRenoveringKomponent(item.komponent)),
  );
}

export function sammanstallRenoveringar(
  renoveringar: UtfördRenovering[],
): RenoveringSammanfattning {
  const medKostnad = renoveringar.filter((r) => (r.kostnadKr ?? 0) > 0);
  const summaKr = medKostnad.reduce((s, r) => s + (r.kostnadKr ?? 0), 0);
  const sorterade = [...renoveringar].sort((a, b) => b.ar - a.ar);
  return {
    antal: renoveringar.length,
    summaKr,
    senaste: sorterade.slice(0, 5).map((r) => ({
      ar: r.ar,
      titel: r.titel,
      komponent: normaliseraRenoveringKomponent(r.komponent),
      kostnadKr: r.kostnadKr ?? 0,
    })),
  };
}

export function formatKostnad(kr?: number): string {
  if (kr === undefined) return "—";
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    maximumFractionDigits: 0,
  }).format(kr);
}

export function createRenoveringId(): string {
  return `styrelse-${Date.now()}`;
}
