import { standardUnderhallIntervallAr } from "@/components/underhallsplan/underhall-intervall";
import { standardAvskrivningAr } from "@/components/underhallsplan/komponent-avskrivning";
import {
  formateraFonsterDorrPoster,
  normaliseraFonsterDorrPost,
  type FonsterDorrPost,
} from "@/components/underhallsplan/fonster-dorrar";
import {
  formateraFasadAtgarder,
  normaliseraFasadAtgardData,
  skapaTomFasadAtgardData,
  type FasadAtgardData,
} from "@/components/underhallsplan/fasad-atgard";
import {
  formateraLokalInventar,
  skapaTomLokalInventar,
  type LokalInventarRad,
  type LokalTypId,
} from "@/components/underhallsplan/lokal-inventar";
import {
  formateraLokalYtskikt,
  skapaTomLokalYtskikt,
  type LokalYtskiktDelRad,
} from "@/components/underhallsplan/lokal-ytskikt";
import {
  formateraPPlatser,
  skapaTomPPlatserData,
  type PPlatserData,
} from "@/components/underhallsplan/p-platser";
import {
  formateraVvsRadiator,
  normaliseraVvsRadiatorData,
  skapaTomVvsRadiatorData,
  type VvsRadiatorData,
} from "@/components/underhallsplan/vvs-radiatorer";
import {
  formateraVarmestamPoster,
  VARMESTAMMAR_UNDERKOMPONENT_ID,
  type VarmestamPost,
} from "@/components/underhallsplan/varmestammar";
import {
  formateraStamventilPoster,
  STAMVENTILER_UNDERKOMPONENT_ID,
  type StamventilPost,
} from "@/components/underhallsplan/stamventiler";
import {
  formateraVvsStambyte,
  normaliseraVvsStambyteData,
  skapaTomVvsStambyteData,
  type AvloppMaterialId,
  type VattenMaterialId,
  type VvsStambyteData,
} from "@/components/underhallsplan/vvs-stambyte";
import {
  formateraMedlemstakterrass,
  MEDLEMS_TAKTERRASS_UNDERKOMPONENT_ID,
  normaliseraMedlemstakterrassData,
  skapaTomMedlemstakterrassData,
  type MedlemstakterrassData,
} from "@/components/underhallsplan/medlemstakterrass";
import {
  formateraTakfonsterData,
  normaliseraTakfonsterData,
  skapaTomTakfonsterData,
  TAKFONSTER_UNDERKOMPONENT_ID,
  type TakfonsterData,
  type TakfonsterRegister,
} from "@/components/underhallsplan/takfonster";
import {
  formateraTakterrass,
  normaliseraTakterrassData,
  skapaTomTakterrassData,
  TAKTERRASS_UNDERKOMPONENT_ID,
  type TakterrassData,
} from "@/components/underhallsplan/takterrass";
import {
  formateraTvattstugaPoster,
  skapaTomTvattstugaPost,
  TVATTSTUGA_UNDERKOMPONENT_ID,
  type TvattstugaPost,
  type TvattstugaUtformningId,
} from "@/components/underhallsplan/tvattstugor";
import {
  formateraBalkongPoster,
  BALKONGER_UNDERKOMPONENT_ID,
  LEGACY_BALKONGANSLUTNING_ID,
  normaliseraBalkongPost,
  skapaTomBalkongPost,
  type BalkongPost,
} from "@/components/underhallsplan/balkonger";
import {
  formateraHissPoster,
  HISS_UNDERKOMPONENT_ID,
  skapaTomHissPost,
  type HissMarkeDefinition,
  type HissPost,
} from "@/components/underhallsplan/hissar";
import {
  formateraVentilationExtraPoster,
  normaliseraVentilationExtraPost,
  VENTILATION_EXTRA_UNDERKOMPONENT_ID,
  type VentilationExtraPost,
} from "@/components/underhallsplan/ventilation-extra";
import {
  ventilationDeltyperForRegister,
  synkaLegacyVentilationDeltyper,
} from "@/components/underhallsplan/grunduppgifter-val";
import {
  formateraBrandskyddBranddorrar,
  formateraBrandskyddSba,
  normaliseraBrandskyddBranddorrarData,
  normaliseraBrandskyddSbaData,
  tomBrandskyddBranddorrarData,
  tomBrandskyddSbaData,
  SBA_UNDERKOMPONENT_ID,
  BRANDDORRAR_UNDERKOMPONENT_ID,
  UTRYMNING_UNDERKOMPONENT_ID,
  ROKGAS_UNDERKOMPONENT_ID,
  type BrandskyddBranddorrarData,
  type BrandskyddSbaData,
} from "@/components/underhallsplan/brandskydd";

export {
  TVATTSTUGA_UNDERKOMPONENT_ID,
  TAKTERRASS_UNDERKOMPONENT_ID,
  MEDLEMS_TAKTERRASS_UNDERKOMPONENT_ID,
  TAKFONSTER_UNDERKOMPONENT_ID,
  BALKONGER_UNDERKOMPONENT_ID,
  HISS_UNDERKOMPONENT_ID,
  VENTILATION_EXTRA_UNDERKOMPONENT_ID,
  SBA_UNDERKOMPONENT_ID,
  BRANDDORRAR_UNDERKOMPONENT_ID,
  UTRYMNING_UNDERKOMPONENT_ID,
  ROKGAS_UNDERKOMPONENT_ID,
};

/** Mått för underkomponenter — antal, yta eller längd. */
export type Måttenhet = "antal" | "kvm" | "löpmeter";

export type UnderkomponentDetaljPanel =
  | "fonster-lista"
  | "dorr-lista"
  | "ytskikt-val"
  | "forrad-val"
  | "golv-val"
  | "lokal-inventar"
  | "lokal-komplement-val"
  | "vvs-radiatorer"
  | "varmestammar-lista"
  | "stamventiler-lista"
  | "vvs-stambyte"
  | "tvattstuga-lista"
  | "balkong-lista"
  | "hiss-lista"
  | "ventilation-extra-lista"
  | "takterrass-val"
  | "medlemstakterrass-val"
  | "takfonster-lista"
  | "p-platser-val"
  | "fasadmaterial-val"
  | "brandskydd-sba"
  | "brandskydd-branddorrar";

export type {
  LokalTypId,
  LokalInventarRad,
  VvsRadiatorData,
  VvsStambyteData,
  PPlatserData,
  TakterrassData,
  MedlemstakterrassData,
};

/** Brandsäkra golvmaterial för trapphus / utrymningsväg */
export type TrapphusGolvMaterialId =
  | "linoleum"
  | "gummigolv"
  | "klinker-sten"
  | "terrazzo"
  | "betong";

export type YtskiktGruppId =
  | "tvattstuga-golv"
  | "tvattstuga-vagg"
  | "kallare-ytskikt";

export type ForradMaterialId = "galler" | "tra";

export type YtskiktAlternativ = {
  id: string;
  etikett: string;
};

export const ytskiktGrupper: Record<YtskiktGruppId, YtskiktAlternativ[]> = {
  "tvattstuga-golv": [
    { id: "klinker", etikett: "Klinker" },
    { id: "malat", etikett: "Målat" },
  ],
  "tvattstuga-vagg": [
    { id: "kakel", etikett: "Kakel" },
    { id: "malat", etikett: "Målat" },
  ],
  "kallare-ytskikt": [
    { id: "malning", etikett: "Målning" },
    { id: "annan", etikett: "Annan åtgärd" },
  ],
};

export const trapphusGolvMaterialLista: {
  id: TrapphusGolvMaterialId;
  etikett: string;
  beskrivning: string;
}[] = [
  {
    id: "linoleum",
    etikett: "Linoleum (brandklassat)",
    beskrivning:
      "T.ex. Marmoleum — vanligt i trapphus, ofta Cfl-s1 eller bättre för utrymningsväg.",
  },
  {
    id: "gummigolv",
    etikett: "Gummigolv (brandklassat)",
    beskrivning: "Gummi med dokumenterad brandklass för korridorer och trapplan.",
  },
  {
    id: "klinker-sten",
    etikett: "Klinker / stengolv",
    beskrivning: "Keramik eller natursten — obrännbart, vanligt i offentliga trapphus.",
  },
  {
    id: "terrazzo",
    etikett: "Terrazzo",
    beskrivning: "Stenmasa i cement — hållbart och brandsäkert golv i trapphus.",
  },
  {
    id: "betong",
    etikett: "Betong / industrigolv",
    beskrivning: "Slipat, målat eller imprägnerat betonggolv — kontrollera ytskiktsklass.",
  },
];

export const forradMaterialLista: {
  id: ForradMaterialId;
  etikett: string;
  beskrivning: string;
}[] = [
  {
    id: "galler",
    etikett: "Stålgaller (nätgaller)",
    beskrivning:
      "Gallerpartier i stål/nät för källarförråd — motsvarar typ av system som Troax men utan varumärkeskoppling.",
  },
  {
    id: "tra",
    etikett: "Trä",
    beskrivning: "Träinredning eller träväggar till förråd.",
  },
];

export function hamtaYtskiktAlternativ(grupp: YtskiktGruppId): YtskiktAlternativ[] {
  return ytskiktGrupper[grupp] ?? [];
}

export function standardYtskikt(grupp: YtskiktGruppId): string {
  return hamtaYtskiktAlternativ(grupp)[0]?.id ?? "";
}

export function ytskiktEtikett(
  grupp: YtskiktGruppId,
  id: string,
  annanAtgardText?: string,
): string {
  if (id === "annan") {
    const text = annanAtgardText?.trim();
    return text ? `Annan åtgärd: ${text}` : "Annan åtgärd";
  }
  return hamtaYtskiktAlternativ(grupp).find((a) => a.id === id)?.etikett ?? id;
}

export function forradMaterialEtikett(id: ForradMaterialId): string {
  return forradMaterialLista.find((m) => m.id === id)?.etikett ?? id;
}

export function standardForradMaterial(): ForradMaterialId {
  return "galler";
}

export function trapphusGolvMaterialEtikett(id: TrapphusGolvMaterialId): string {
  return trapphusGolvMaterialLista.find((m) => m.id === id)?.etikett ?? id;
}

export function standardTrapphusGolvMaterial(): TrapphusGolvMaterialId {
  return "linoleum";
}

export function formateraGolvRad(rad: UnderkomponentRad): string {
  const mat = rad.golvMaterial ?? standardTrapphusGolvMaterial();
  const yta = rad.värde.trim()
    ? `${rad.värde.trim()} ${måttenhetEtiketter.kvm.enhet}`
    : "";
  return yta
    ? `${trapphusGolvMaterialEtikett(mat)} · ${yta}`
    : trapphusGolvMaterialEtikett(mat);
}

export function formateraForradRad(rad: UnderkomponentRad): string {
  const mat = rad.forradMaterial ?? standardForradMaterial();
  const enhet = måttenhetEtiketter[rad.måttenhet];
  const mått = rad.värde.trim()
    ? `${rad.värde.trim()} ${enhet.enhet}`
    : "";
  const delar = [forradMaterialEtikett(mat)];
  if (mått) delar.push(mått);
  if (rad.måttenhet === "löpmeter" && rad.forradAntalDorrar?.trim()) {
    delar.push(`${rad.forradAntalDorrar.trim()} dörrar`);
  }
  return delar.join(" · ");
}

export type DeltypDefinition = {
  id: string;
  etikett: string;
  beskrivning?: string;
};

export type UnderkomponentDefinition = {
  id: string;
  etikett: string;
  defaultMåttenhet: Måttenhet;
  måttHint: string;
  /** Särskilt formulär — t.ex. fönster/dörrar med modulmått under fasad */
  detaljPanel?: UnderkomponentDetaljPanel;
  /** Gäller ytskikt-val — vilka alternativ som visas */
  ytskiktGrupp?: YtskiktGruppId;
  /** Gäller lokal-inventar (cykelförråd, soprum) */
  lokalTyp?: LokalTypId;
  /** Döljs i steg 2 (utförda arbeten) men finns kvar i komponentregistret / planering. */
  doldIRenoveringshistorik?: boolean;
};

/** Besiktning efter utfört arbete på underkomponenten. */
export type UnderhallBesiktningStatus = "ja" | "nej" | "syn-styrelse";

export function underhallBesiktningEtikett(
  status?: UnderhallBesiktningStatus | "",
): string {
  if (status === "ja") return "Besiktning ja";
  if (status === "nej") return "Besiktning nej";
  if (status === "syn-styrelse") return "Syn av styrelse";
  return "";
}

export type UnderkomponentRad = {
  id: string;
  etikett: string;
  aktiv: boolean;
  måttenhet: Måttenhet;
  värde: string;
  ärEgen: boolean;
  /** Gäller ytskikt-val (golv, väggar) */
  ytskikt?: string;
  /** Gäller källare-ytskikt när annan åtgärd valts */
  ytskiktAnnanText?: string;
  /** Gäller forrad-val i källare */
  forradMaterial?: ForradMaterialId;
  /** Antal dörrar vid löpmeter galler/trä */
  forradAntalDorrar?: string;
  /** Gäller golv-val i trapphus */
  golvMaterial?: TrapphusGolvMaterialId;
  /** Senast utförda arbetet */
  underhallUtförtAr?: string;
  underhallEntreprenor?: string;
  /** Garantitid i år (branschvanligt ca 2). */
  underhallGarantiAr?: string;
  /** Ansvarstid i år (branschvanligt ca 10). */
  underhallAnsvarAr?: string;
  underhallBesiktning?: UnderhallBesiktningStatus | "";
  /** Planerat underhåll — kan fyllas i senare */
  underhallNastaAr?: string;
  underhallIntervallAr?: string;
  /**
   * Nyttjandeperiod / avskrivningstid i år (K3-komponentavskrivning).
   * Skiljt från underhållsintervall.
   */
  avskrivningAr?: string;
  /**
   * Uppskattad installationskostnad / komponentvärde vid byggår (kr).
   * Visas för föreningen — härleds ofta från internt värderingsunderlag.
   */
  installationskostnadKr?: string;
  underhallKostnadKr?: string;
  /**
   * Ursprungligt belopp inkl. moms — sparas när moms tas bort så att avdraget kan visas/återställas.
   */
  underhallKostnadInklMomsKr?: string;
  /** Moms som tagits bort från kostnaden och särredovisas (kr per tillfälle). */
  underhallMomsAvdragenKr?: string;
  /** total | kvm | styck | blandad — styr hur kostnaden räknas ut. */
  underhallPrisEnhet?: string;
  /** Kr per m² (kvm/blandad) eller per styck (styck). */
  underhallEnhetsprisKr?: string;
  /** Antal styck (blandad/styck). */
  underhallPrisAntal?: string;
  /** Kr per styck vid blandad prissättning (en rad — migreras till poster). */
  underhallStyckEnhetsprisKr?: string;
  /** Flera styckposter, t.ex. ställning + takluckor. */
  underhallStyckPoster?: import("@/components/underhallsplan/blandad-styck-poster").BlandadStyckPost[];
  /** Förfylld från utförd renovering i steg 2 */
  underhallFranHistorik?: boolean;
  underhallHistorikAr?: number;
  underhallHistorikTitel?: string;
  /** Åtgärden ligger i kommande projekt — visas inte i plan/utskrift. */
  underhallFlyttadTillProjektId?: string;
};

export type FonsterDorrRegister = Record<string, FonsterDorrPost[]>;

export type LokalInventarRegister = Record<string, LokalInventarRad[]>;

export type LokalYtskiktRegister = Record<string, LokalYtskiktDelRad[]>;

export type FasadAtgardRegister = Record<string, FasadAtgardData>;

import type {
  FasadAtgardPrisRegister,
  FasadAtgardPrisRegisterMap,
} from "@/components/underhallsplan/fasad-atgard-pris";

export type { FasadAtgardPrisRegister, FasadAtgardPrisRegisterMap };

export type VarmestammarRegister = Record<string, VarmestamPost[]>;

export type StamventilerRegister = Record<string, StamventilPost[]>;

export type VvsRadiatorRegister = Record<string, VvsRadiatorData>;

export type VvsStambyteRegister = Record<string, VvsStambyteData>;

export type PPlatserRegister = Record<string, PPlatserData>;

export type TvattstugaRegister = Record<string, TvattstugaPost[]>;

export type BalkongRegister = Record<string, BalkongPost[]>;

export type HissRegister = Record<string, HissPost[]>;

export type VentilationExtraRegister = Record<string, VentilationExtraPost[]>;

export type TakterrassRegister = Record<string, TakterrassData>;

export type MedlemstakterrassRegister = Record<string, MedlemstakterrassData>;

export type BrandskyddSbaRegister = Record<string, BrandskyddSbaData>;
export type BrandskyddBranddorrRegister = Record<string, BrandskyddBranddorrarData>;

export type KomponentDetaljData = {
  valdaDeltyper: string[];
  egnaDeltyper: DeltypDefinition[];
  underkomponenter: UnderkomponentRad[];
  /** Poster per underkomponent-id (fonster, dorrar) */
  fonsterDorrRegister?: FonsterDorrRegister;
  /** Planerade fasadåtgärder per underkomponent-id (fasadmaterial) */
  fasadAtgardRegister?: FasadAtgardRegister;
  /** Prissättning per fasadåtgärd (kvm/st/total). */
  fasadAtgardPrisRegister?: FasadAtgardPrisRegisterMap;
  /** Underhållstillfällen (tak, fönster m.fl.) per underkomponent-id. */
  underhallTillfallenRegister?: import("@/components/underhallsplan/underhall-tillfallen-register").UnderhallTillfallenRegister;
  /** Prissättning per åtgärd i tillfällen. */
  underhallTillfallenPrisRegister?: FasadAtgardPrisRegisterMap;
  /** Invändiga delar per underkomponent-id (cykelförråd, soprum) */
  lokalInventarRegister?: LokalInventarRegister;
  /** Vägg, golv, tak — material och åtgärd (soprum, cykelrum, förråd) */
  lokalYtskiktRegister?: LokalYtskiktRegister;
  /** Radiatorer och värmerör per underkomponent-id */
  vvsRadiatorRegister?: VvsRadiatorRegister;
  /** Värmestammar per underkomponent-id */
  varmestammarRegister?: VarmestammarRegister;
  /** Stamventiler per underkomponent-id */
  stamventilerRegister?: StamventilerRegister;
  /** Stambyte badrum per underkomponent-id */
  vvsStambyteRegister?: VvsStambyteRegister;
  /** P-platser per underkomponent-id */
  pPlatserRegister?: PPlatserRegister;
  /** Tvättstugor per underkomponent-id */
  tvattstugaRegister?: TvattstugaRegister;
  /** Balkonger per underkomponent-id */
  balkongRegister?: BalkongRegister;
  /** Hissar per underkomponent-id (Trapphus) */
  hissRegister?: HissRegister;
  /** Egna hissmärken (Trapphus) */
  egnaHissMarken?: HissMarkeDefinition[];
  /** Extra fläktar per underkomponent-id (Ventilation) */
  ventilationExtraRegister?: VentilationExtraRegister;
  /** Gemensam takterrass per underkomponent-id */
  takterrassRegister?: TakterrassRegister;
  /** Medlemstakterrass per underkomponent-id */
  medlemstakterrassRegister?: MedlemstakterrassRegister;
  /** Takfönster per underkomponent-id */
  takfonsterRegister?: TakfonsterRegister;
  /** SBA per underkomponent-id (Brandskydd) */
  brandskyddSbaRegister?: BrandskyddSbaRegister;
  /** Branddörrar per underkomponent-id (Brandskydd) */
  brandskyddBranddorrRegister?: BrandskyddBranddorrRegister;
  /** Enkel vy: klumpsumma yta/kostnad utan underkomponentlista. */
  enkelKlumpsummaLage?: boolean;
  /** Visa full underkomponentlista (motverkar enkel vy). */
  visaUnderkomponenterLista?: boolean;
  /** Planerad kostnad klumpsumma när komponent saknar huvudyta-rad. */
  klumpsummaPlaneradKostnadKr?: string;
};

export type KomponentMall = {
  namn: string;
  deltypSektionTitel: string;
  deltyper: DeltypDefinition[];
  underkomponenter: UnderkomponentDefinition[];
  /** Standard true — sätt false om endast fördefinierade deltyper ska gälla */
  tillatEgenDeltyp?: boolean;
};

export const måttenhetEtiketter: Record<Måttenhet, { etikett: string; enhet: string }> = {
  antal: { etikett: "Antal", enhet: "st" },
  kvm: { etikett: "Yta", enhet: "m²" },
  löpmeter: { etikett: "Löpmeter", enhet: "m" },
};

export const foreslagnaKomponenter = [
  "Stomme",
  "Fasad",
  "Fönster",
  "Tak",
  "Trapphus",
  "VVS",
  "Värmecentral",
  "Ventilation",
  "Elcentral",
  "Balkonger",
  "Styr och övervakning",
  "Brandskydd",
  "Källare",
  "Mark och gård",
  "Komplement byggnad och P-platser",
] as const;

export const GAMLA_GARAGE_CARPORT_NAMN = "Garage / carport";
export const KOMPLEMENT_BYGGNAD_NAMN = "Komplement byggnad och P-platser";

const komponentMallar: Record<string, KomponentMall> = {
  Stomme: {
    namn: "Stomme",
    deltypSektionTitel: "Stomme / grund",
    deltyper: [
      { id: "betong", etikett: "Betongstomme" },
      { id: "tra-betonggrund", etikett: "Trästomme på betonggrund" },
      { id: "blandat", etikett: "Blandat" },
    ],
    underkomponenter: [
      {
        id: "stomme",
        etikett: "Stomme och grund",
        defaultMåttenhet: "kvm",
        måttHint:
          "FAR: stomme och grund är den största komponenten (ca 60–70 % av anskaffningsvärdet). Ange boarea eller bruttoarea som underlag.",
      },
    ],
  },
  "Styr och övervakning": {
    namn: "Styr och övervakning",
    deltypSektionTitel: "Systemtyp",
    deltyper: [
      { id: "fastighetsautomation", etikett: "Fastighetsautomation" },
      { id: "varme-styr", etikett: "Värme-/ventilationsstyrning" },
      { id: "blandat", etikett: "Blandat" },
    ],
    underkomponenter: [
      {
        id: "system",
        etikett: "Styr- och övervakningssystem",
        defaultMåttenhet: "antal",
        måttHint:
          "FAR: styr och övervakning (ca 1–2 %). Ange antal system eller 1 som klumpsumma.",
      },
    ],
  },
  Fasad: {
    namn: "Fasad",
    deltypSektionTitel: "Fasadtyp / material",
    deltyper: [
      { id: "tunnputs", etikett: "Tunnputs" },
      { id: "puts", etikett: "Puts" },
      { id: "tegel", etikett: "Tegel" },
      { id: "tegel-putsband", etikett: "Tegel med putsband" },
      { id: "tra", etikett: "Trä" },
      { id: "plat", etikett: "Plåt" },
      { id: "betong", etikett: "Betong / platta" },
    ],
    underkomponenter: [
      {
        id: "fasadmaterial",
        etikett: "Fasadmaterial",
        defaultMåttenhet: "kvm",
        måttHint:
          "Material, planerad åtgärd (putsreparation, ommålning m.m.) och total fasadarea.",
        detaljPanel: "fasadmaterial-val",
      },
      { id: "sockel", etikett: "Sockel", defaultMåttenhet: "löpmeter", måttHint: "Sockelns omfattning.", doldIRenoveringshistorik: true },
      {
        id: "dorrar",
        etikett: "Dörrar",
        defaultMåttenhet: "antal",
        måttHint: "Modulmått, material och antal — öppna för att registrera.",
        detaljPanel: "dorr-lista",
      },
    ],
  },
  "Fönster": {
    namn: "Fönster",
    deltypSektionTitel: "Fönster — material / typ",
    deltyper: [
      { id: "tra", etikett: "Trä" },
      { id: "alu-kldd", etikett: "Aluminiumklädd" },
      { id: "pvc", etikett: "PVC / plast" },
      { id: "aluminium", etikett: "Aluminium" },
    ],
    underkomponenter: [
      {
        id: "fonster",
        etikett: "Fönster",
        defaultMåttenhet: "antal",
        måttHint:
          "Modulmått, material, antal — samt adress och läge (norr, söder, gård m.m.).",
        detaljPanel: "fonster-lista",
      },
    ],
  },
  Tak: {
    namn: "Tak",
    deltypSektionTitel: "Takbeläggning / typ",
    deltyper: [
      { id: "bandlaggd-plat", etikett: "Bandlagd plåttak" },
      { id: "korrugerad-plat", etikett: "Korrugerad plåt" },
      { id: "tegel", etikett: "Tegel" },
      { id: "papp", etikett: "Papp" },
    ],
    underkomponenter: [
      {
        id: "takyta",
        etikett: "Takytor (beläggning)",
        defaultMåttenhet: "kvm",
        måttHint:
          "Total takyta i m² — kan mätas med Google Earth eller kartstöd i bildstöd (steg 5).",
      },
      { id: "skorsten", etikett: "Skorstenar", defaultMåttenhet: "antal", måttHint: "Antal skorstenar." },
      { id: "ventilationshuv", etikett: "Ventilationshuvor", defaultMåttenhet: "antal", måttHint: "Antal ventilationshuvor." },
      { id: "takkupa", etikett: "Takkupor", defaultMåttenhet: "antal", måttHint: "Antal takkupor — eller kvm." },
      {
        id: TAKFONSTER_UNDERKOMPONENT_ID,
        etikett: "Takfönster",
        defaultMåttenhet: "antal",
        måttHint:
          "Del 1 singelfönster och del 2 kombinationer (flera i rad). Prissätt per styck respektive per kombination.",
        detaljPanel: "takfonster-lista",
      },
      {
        id: TAKTERRASS_UNDERKOMPONENT_ID,
        etikett: "Gemensam takterrass",
        defaultMåttenhet: "kvm",
        måttHint:
          "Väggar, klinkergolv och sockel, tätskikt utomhus, golvbrunn och breddavlopp.",
        detaljPanel: "takterrass-val",
      },
      {
        id: MEDLEMS_TAKTERRASS_UNDERKOMPONENT_ID,
        etikett: "Medlemstakterrass",
        defaultMåttenhet: "kvm",
        måttHint:
          "Terrass som tillhör lägenhet — väggar, golv, tätskikt och avvattning. Ingen el.",
        detaljPanel: "medlemstakterrass-val",
      },
    ],
  },
  Trapphus: {
    namn: "Trapphus",
    deltypSektionTitel: "Trapphus / utformning",
    deltyper: [
      { id: "tr1", etikett: "Trapphus typ Tr1" },
      { id: "tr2", etikett: "Trapphus typ Tr2" },
      { id: "tr3", etikett: "Trapphus typ Tr3" },
    ],
    underkomponenter: [
      {
        id: HISS_UNDERKOMPONENT_ID,
        etikett: "Hiss",
        defaultMåttenhet: "antal",
        måttHint: "Märke och typ — motvikts- eller hydraulhiss per hiss.",
        detaljPanel: "hiss-lista",
      },
      {
        id: "lagenhetsdorrar",
        etikett: "Utvändig målning lägenhetsdörrar",
        defaultMåttenhet: "antal",
        måttHint: "Antal lägenhetsdörrar mot trapphus som ska målas utvändigt.",
      },
      {
        id: "vaggar-malning",
        etikett: "Målning väggar",
        defaultMåttenhet: "kvm",
        måttHint: "Väggyta som ska målas i trapphuset.",
      },
      {
        id: "tak-malning",
        etikett: "Målning tak",
        defaultMåttenhet: "kvm",
        måttHint: "Takyta som ska målas.",
      },
      {
        id: "ledstang",
        etikett: "Ledstång",
        defaultMåttenhet: "löpmeter",
        måttHint: "Total löpmeter ledstång och handräcke.",
      },
      {
        id: "golv",
        etikett: "Golv",
        defaultMåttenhet: "kvm",
        måttHint:
          "Golvmaterial i offentlig miljö — måste vara brandsäkert (Cfl-s1 eller bättre).",
        detaljPanel: "golv-val",
      },
    ],
  },
  Brandskydd: {
    namn: "Brandskydd",
    deltypSektionTitel: "Systematiskt brandskyddsarbete",
    deltyper: [
      { id: "sba", etikett: "Systematiskt brandskyddsarbete — egenkontroll" },
      { id: "konsult", etikett: "Med brandkonsult" },
    ],
    underkomponenter: [
      {
        id: SBA_UNDERKOMPONENT_ID,
        etikett: "Systematiskt brandskyddsarbete — egenkontroll",
        defaultMåttenhet: "antal",
        måttHint:
          "Systematiskt brandskyddsarbete — kontrollmall och senaste rond. Schema i Besiktningar.",
        detaljPanel: "brandskydd-sba",
      },
      {
        id: BRANDDORRAR_UNDERKOMPONENT_ID,
        etikett: "Branddörrar",
        defaultMåttenhet: "antal",
        måttHint:
          "Antal branddörrar och rökspärrade dörrar — begränsar eld- och rökspridning.",
        detaljPanel: "brandskydd-branddorrar",
      },
      {
        id: UTRYMNING_UNDERKOMPONENT_ID,
        etikett: "Utrymningsvägar",
        defaultMåttenhet: "löpmeter",
        måttHint:
          "Trapphus och korridorer — fria vägar, skyltning och nödbelysning. Ingår i underhållsplanen.",
      },
      {
        id: ROKGAS_UNDERKOMPONENT_ID,
        etikett: "Rökgasevakuering trapphus",
        defaultMåttenhet: "antal",
        måttHint:
          "Antal trapphus/fläktar för rökgasevakuering — service och funktionstest enligt SBA.",
      },
    ],
  },
  Källare: {
    namn: "Källare",
    deltypSektionTitel: "Källartyp / skick",
    deltyper: [
      { id: "uppvarmd", etikett: "Uppvärmd källare" },
      { id: "oupvarmd", etikett: "Ouppvärmd källare" },
      { id: "garage-kallare", etikett: "Garage i källarplan" },
    ],
    underkomponenter: [
      {
        id: "ytskikt",
        etikett: "Ytskikt",
        defaultMåttenhet: "kvm",
        måttHint: "Planerat underhåll: målning eller annan åtgärd. Yta i kvm valfritt.",
        detaljPanel: "ytskikt-val",
        ytskiktGrupp: "kallare-ytskikt",
      },
      {
        id: "forrad",
        etikett: "Förråd",
        defaultMåttenhet: "antal",
        måttHint:
          "Väggar, golv och tak — samt galler eller träväggar mellan förråd (samma upplägg som soprum).",
        detaljPanel: "lokal-komplement-val",
      },
      {
        id: "belysning",
        etikett: "Belysning",
        defaultMåttenhet: "antal",
        måttHint: "Antal armaturer i källaren.",
      },
      {
        id: TVATTSTUGA_UNDERKOMPONENT_ID,
        etikett: "Tvättstuga",
        defaultMåttenhet: "antal",
        måttHint:
          "En eller flera tvättstugor i källaren — maskiner, ytskikt och utformning per lokal.",
        detaljPanel: "tvattstuga-lista",
      },
    ],
  },
  Ventilation: {
    namn: "Ventilation",
    deltypSektionTitel: "Ventilationssystem",
    tillatEgenDeltyp: false,
    deltyper: ventilationDeltyperForRegister(),
    underkomponenter: [
      {
        id: VENTILATION_EXTRA_UNDERKOMPONENT_ID,
        etikett: "Övriga fläktar",
        defaultMåttenhet: "antal",
        måttHint:
          "Vindfläktar, rökgasfläktar vid öppen spis och andra fläktar utöver huvudsystemet.",
        detaljPanel: "ventilation-extra-lista",
      },
      { id: "aggregat", etikett: "Aggregat", defaultMåttenhet: "antal", måttHint: "Antal ventilationsaggregat." },
      {
        id: "filterbyte",
        etikett: "Filterbyte",
        defaultMåttenhet: "antal",
        måttHint: "Filterbyte per år — kostnad för filter till ventilationsaggregat.",
      },
      { id: "kanaler", etikett: "Kanaler / kanalnet", defaultMåttenhet: "kvm", måttHint: "Kanalyta eller schablon kvm." },
      { id: "don", etikett: "Don / ventiler", defaultMåttenhet: "antal", måttHint: "Antal don." },
    ],
  },
  VVS: {
    namn: "VVS",
    deltypSektionTitel: "Värmedistribution",
    deltyper: [
      { id: "fjarrvarme", etikett: "Fjärrvärme" },
      { id: "egen-central", etikett: "Egen värmecentral i huset" },
      { id: "blandat", etikett: "Blandat / delar av hus" },
    ],
    underkomponenter: [
      {
        id: "spolning-avlopp",
        etikett: "Spolning avlopp",
        defaultMåttenhet: "antal",
        måttHint:
          "Stamspolning/avloppsspolning. Ange antal stammar eller välj 1 och planera som klumpsumma.",
      },
      {
        id: "filmning-avlopp",
        etikett: "Filmning avlopp",
        defaultMåttenhet: "antal",
        måttHint:
          "Kamerainspektion av avloppsstammar. Bra som beslutsunderlag inför spolning eller stambyte.",
      },
      {
        id: "stambyte",
        etikett: "Stambyte",
        defaultMåttenhet: "antal",
        måttHint:
          "Badrum: golv/vägg/tak/stomme i m², sanitetsdelar, tappvatten och avloppsledningar inkl. stamventiler.",
        detaljPanel: "vvs-stambyte",
      },
    ],
  },
  Värmecentral: {
    namn: "Värmecentral",
    deltypSektionTitel: "Värmesystem",
    deltyper: [
      { id: "fjarrvarme", etikett: "Fjärrvärme" },
      { id: "bergvarme", etikett: "Bergvärme / värmepump" },
      { id: "olja", etikett: "Olja / elpanna" },
    ],
    underkomponenter: [
      {
        id: "undercentral",
        etikett: "Undercentral",
        defaultMåttenhet: "antal",
        måttHint:
          "Antal undercentraler (värmefördelning till lägenheter/stammar).",
      },
      {
        id: "radiatorer",
        etikett: "Radiatorer",
        defaultMåttenhet: "antal",
        måttHint:
          "Termostat, radiatorventil, koppel och packbox — ett/två-rör. Värmerör i meter.",
        detaljPanel: "vvs-radiatorer",
      },
      {
        id: VARMESTAMMAR_UNDERKOMPONENT_ID,
        etikett: "Värmestammar",
        defaultMåttenhet: "löpmeter",
        måttHint:
          "Vertikal och horisontell stamledning — ange löpmeter per stam eller avsnitt.",
        detaljPanel: "varmestammar-lista",
      },
      {
        id: STAMVENTILER_UNDERKOMPONENT_ID,
        etikett: "Stamventiler",
        defaultMåttenhet: "antal",
        måttHint:
          "Injusteringsventil (flöde) eller styrventil (temperatur) — modell, storlek och antal.",
        detaljPanel: "stamventiler-lista",
      },
    ],
  },
  Balkonger: {
    namn: "Balkonger",
    deltypSektionTitel: "Balkongkonstruktion",
    deltyper: [
      { id: "betong", etikett: "Betongplatta" },
      { id: "plat", etikett: "Plåt / stål" },
      { id: "tra", etikett: "Trä" },
    ],
    underkomponenter: [
      {
        id: BALKONGER_UNDERKOMPONENT_ID,
        etikett: "Balkonger",
        defaultMåttenhet: "antal",
        måttHint:
          "Typ, konstruktion, räcke, ytskikt samt tätskikt, fall och sockel per rad.",
        detaljPanel: "balkong-lista",
      },
    ],
  },
  Elcentral: {
    namn: "Elcentral",
    deltypSektionTitel: "Elnät i fastigheten",
    deltyper: [
      { id: "huvud", etikett: "Huvudcentral" },
      { id: "undercentral", etikett: "Undercentraler" },
      { id: "mätning", etikett: "Mätning / elbilsladdning" },
    ],
    underkomponenter: [
      { id: "central", etikett: "Centraler", defaultMåttenhet: "antal", måttHint: "Antal elcentraler." },
      { id: "grupper", etikett: "Gruppcentraler", defaultMåttenhet: "antal", måttHint: "Antal grupper." },
    ],
  },
  "Mark och gård": {
    namn: "Mark och gård",
    deltypSektionTitel: "Marktyp",
    deltyper: [
      { id: "asfalt", etikett: "Asfalt / hårdgjord yta" },
      { id: "sten", etikett: "Stenläggning" },
      { id: "gras", etikett: "Gräs / plantering" },
    ],
    underkomponenter: [
      { id: "gard", etikett: "Gårdyta", defaultMåttenhet: "kvm", måttHint: "Total gårdyta." },
      { id: "plantering", etikett: "Planteringar", defaultMåttenhet: "kvm", måttHint: "Yta plantering." },
      { id: "ledning", etikett: "Ledningar i mark", defaultMåttenhet: "löpmeter", måttHint: "Längd ledningar." },
    ],
  },
  "Komplement byggnad och P-platser": {
    namn: "Komplement byggnad och P-platser",
    deltypSektionTitel: "Placering",
    deltyper: [
      { id: "kallare", etikett: "I källarplan / underjordiskt" },
      { id: "mark", etikett: "Markplan / fristående" },
      { id: "blandat", etikett: "Blandat" },
    ],
    underkomponenter: [
      {
        id: "soprum",
        etikett: "Soprum",
        defaultMåttenhet: "antal",
        måttHint:
          "Väggar, golv och tak med material och åtgärd — samt kärl, belysning och ventilation.",
        detaljPanel: "lokal-komplement-val",
        lokalTyp: "soprum",
      },
      {
        id: "cykelrum",
        etikett: "Cykelrum",
        defaultMåttenhet: "antal",
        måttHint:
          "Väggar, golv och tak med material och åtgärd — samt ställ, belysning och ventilation.",
        detaljPanel: "lokal-komplement-val",
        lokalTyp: "cykelforrad",
      },
      {
        id: "forrad",
        etikett: "Förråd",
        defaultMåttenhet: "antal",
        måttHint:
          "Väggar, golv och tak — samt galler eller träväggar mellan förråd (antal eller löpmeter).",
        detaljPanel: "lokal-komplement-val",
      },
      {
        id: "p-platser",
        etikett: "P-platser",
        defaultMåttenhet: "antal",
        måttHint:
          "Antal platser per typ — motorvärmare, elbilsladdare, garage, carport m.m.",
        detaljPanel: "p-platser-val",
      },
    ],
  },
};

export function hamtaKomponentMall(namn: string): KomponentMall {
  return (
    komponentMallar[namn] ?? {
      namn,
      deltypSektionTitel: "Typ / utförande",
      deltyper: [],
      underkomponenter: [],
    }
  );
}

/** Underkomponenter som ska visas i steg 2 — dolda visas bara om det redan finns poster. */
export function underkomponenterIRenoveringshistorik(
  mall: KomponentMall,
  harPoster: (underkomponentId: string) => boolean,
): UnderkomponentDefinition[] {
  return mall.underkomponenter.filter(
    (uk) => !uk.doldIRenoveringshistorik || harPoster(uk.id),
  );
}

export function skapaKomponentId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function skapaTomFonsterDorrRegister(mall: KomponentMall): FonsterDorrRegister {
  const reg: FonsterDorrRegister = {};
  for (const def of mall.underkomponenter) {
    if (
      def.detaljPanel === "fonster-lista" ||
      def.detaljPanel === "dorr-lista"
    ) {
      reg[def.id] = [];
    }
  }
  return reg;
}

function skapaTomLokalInventarRegister(mall: KomponentMall): LokalInventarRegister {
  const reg: LokalInventarRegister = {};
  for (const def of mall.underkomponenter) {
    if (
      (def.detaljPanel === "lokal-inventar" ||
        def.detaljPanel === "lokal-komplement-val") &&
      def.lokalTyp
    ) {
      reg[def.id] = skapaTomLokalInventar(def.lokalTyp);
    }
  }
  return reg;
}

function skapaTomLokalYtskiktRegister(mall: KomponentMall): LokalYtskiktRegister {
  const reg: LokalYtskiktRegister = {};
  for (const def of mall.underkomponenter) {
    if (def.detaljPanel === "lokal-komplement-val") {
      reg[def.id] = skapaTomLokalYtskikt();
    }
  }
  return reg;
}

function skapaTomFasadAtgardRegister(mall: KomponentMall): FasadAtgardRegister {
  const reg: FasadAtgardRegister = {};
  for (const def of mall.underkomponenter) {
    if (def.detaljPanel === "fasadmaterial-val") {
      reg[def.id] = skapaTomFasadAtgardData();
    }
  }
  return reg;
}

function skapaTomVvsRadiatorRegister(mall: KomponentMall): VvsRadiatorRegister {
  const reg: VvsRadiatorRegister = {};
  for (const def of mall.underkomponenter) {
    if (def.detaljPanel === "vvs-radiatorer") {
      reg[def.id] = skapaTomVvsRadiatorData();
    }
  }
  return reg;
}

function skapaTomVarmestammarRegister(mall: KomponentMall): VarmestammarRegister {
  const reg: VarmestammarRegister = {};
  for (const def of mall.underkomponenter) {
    if (def.detaljPanel === "varmestammar-lista") {
      reg[def.id] = [];
    }
  }
  return reg;
}

function skapaTomStamventilerRegister(mall: KomponentMall): StamventilerRegister {
  const reg: StamventilerRegister = {};
  for (const def of mall.underkomponenter) {
    if (def.detaljPanel === "stamventiler-lista") {
      reg[def.id] = [];
    }
  }
  return reg;
}

function skapaTomVvsStambyteRegister(mall: KomponentMall): VvsStambyteRegister {
  const reg: VvsStambyteRegister = {};
  for (const def of mall.underkomponenter) {
    if (def.detaljPanel === "vvs-stambyte") {
      reg[def.id] = skapaTomVvsStambyteData();
    }
  }
  return reg;
}

function skapaTomPPlatserRegister(mall: KomponentMall): PPlatserRegister {
  const reg: PPlatserRegister = {};
  for (const def of mall.underkomponenter) {
    if (def.detaljPanel === "p-platser-val") {
      reg[def.id] = skapaTomPPlatserData();
    }
  }
  return reg;
}

function skapaTomTakterrassRegister(mall: KomponentMall): TakterrassRegister {
  const reg: TakterrassRegister = {};
  for (const def of mall.underkomponenter) {
    if (def.detaljPanel === "takterrass-val") {
      reg[def.id] = skapaTomTakterrassData();
    }
  }
  return reg;
}

function skapaTomMedlemstakterrassRegister(
  mall: KomponentMall,
): MedlemstakterrassRegister {
  const reg: MedlemstakterrassRegister = {};
  for (const def of mall.underkomponenter) {
    if (def.detaljPanel === "medlemstakterrass-val") {
      reg[def.id] = skapaTomMedlemstakterrassData();
    }
  }
  return reg;
}

function skapaTomTvattstugaRegister(mall: KomponentMall): TvattstugaRegister {
  const reg: TvattstugaRegister = {};
  for (const def of mall.underkomponenter) {
    if (def.detaljPanel === "tvattstuga-lista") {
      reg[def.id] = [];
    }
  }
  return reg;
}

function skapaTomBalkongRegister(mall: KomponentMall): BalkongRegister {
  const reg: BalkongRegister = {};
  for (const def of mall.underkomponenter) {
    if (def.detaljPanel === "balkong-lista") {
      reg[def.id] = [];
    }
  }
  return reg;
}

function skapaTomTakfonsterRegister(mall: KomponentMall): TakfonsterRegister {
  const reg: TakfonsterRegister = {};
  for (const def of mall.underkomponenter) {
    if (def.detaljPanel === "takfonster-lista") {
      reg[def.id] = skapaTomTakfonsterData();
    }
  }
  return reg;
}

function extraheraBalkongPoster(data: KomponentDetaljData): BalkongPost[] {
  const reg = data.balkongRegister?.[BALKONGER_UNDERKOMPONENT_ID];
  if (reg && reg.length > 0) {
    return reg.map(normaliseraBalkongPost);
  }

  const legacyRad = data.underkomponenter.find(
    (r) => r.id === LEGACY_BALKONGANSLUTNING_ID,
  );
  if (legacyRad?.värde.trim()) {
    const n = Math.max(
      0,
      Math.floor(
        Number(legacyRad.värde.replace(/\s/g, "").replace(",", ".")) || 0,
      ),
    );
    if (n > 0) {
      return Array.from({ length: n }, (_, i) =>
        skapaTomBalkongPost(`Balkong ${i + 1}`, "utvandig-balkong"),
      );
    }
  }
  return [];
}

function migreraBalkongRegister(
  data: KomponentDetaljData,
  mall: KomponentMall,
): BalkongRegister | undefined {
  const listaDef = mall.underkomponenter.find(
    (u) => u.detaljPanel === "balkong-lista",
  );
  if (!listaDef) return data.balkongRegister;

  const befintlig = data.balkongRegister?.[listaDef.id];
  if (befintlig && befintlig.length > 0) {
    return {
      ...skapaTomBalkongRegister(mall),
      ...data.balkongRegister,
      [listaDef.id]: befintlig.map(normaliseraBalkongPost),
    };
  }

  const poster = extraheraBalkongPoster(data);
  if (poster.length === 0) {
    return Object.keys(skapaTomBalkongRegister(mall)).length > 0
      ? { ...skapaTomBalkongRegister(mall), ...data.balkongRegister }
      : data.balkongRegister;
  }

  return {
    ...skapaTomBalkongRegister(mall),
    ...data.balkongRegister,
    [listaDef.id]: poster,
  };
}

function skapaTomHissRegister(mall: KomponentMall): HissRegister {
  const reg: HissRegister = {};
  for (const def of mall.underkomponenter) {
    if (def.detaljPanel === "hiss-lista") {
      reg[def.id] = [];
    }
  }
  return reg;
}

function skapaTomVentilationExtraRegister(
  mall: KomponentMall,
): VentilationExtraRegister {
  const reg: VentilationExtraRegister = {};
  for (const def of mall.underkomponenter) {
    if (def.detaljPanel === "ventilation-extra-lista") {
      reg[def.id] = [];
    }
  }
  return reg;
}

function skapaTomBrandskyddSbaRegister(mall: KomponentMall): BrandskyddSbaRegister {
  const reg: BrandskyddSbaRegister = {};
  for (const def of mall.underkomponenter) {
    if (def.detaljPanel === "brandskydd-sba") {
      reg[def.id] = tomBrandskyddSbaData();
    }
  }
  return reg;
}

function skapaTomBrandskyddBranddorrRegister(
  mall: KomponentMall,
): BrandskyddBranddorrRegister {
  const reg: BrandskyddBranddorrRegister = {};
  for (const def of mall.underkomponenter) {
    if (def.detaljPanel === "brandskydd-branddorrar") {
      reg[def.id] = tomBrandskyddBranddorrarData();
    }
  }
  return reg;
}

function posterFranAntalFalt(antal: string, prefix: string): HissPost[] {
  const n = Math.max(0, Math.floor(Number(antal.replace(/\s/g, "").replace(",", ".")) || 0));
  if (n === 0) return [];
  return Array.from({ length: n }, (_, i) =>
    skapaTomHissPost(`${prefix} ${i + 1}`),
  );
}

function extraheraHissPoster(data: KomponentDetaljData): HissPost[] {
  const reg = data.hissRegister;
  if (reg) {
    const poster = reg[HISS_UNDERKOMPONENT_ID] ?? [];
    if (poster.length > 0) return poster;
  }
  const rad = data.underkomponenter.find((r) => r.id === HISS_UNDERKOMPONENT_ID);
  if (rad?.värde.trim()) {
    return posterFranAntalFalt(rad.värde, "Hiss");
  }
  return [];
}

function migreraHissRegister(
  data: KomponentDetaljData,
  mall: KomponentMall,
): HissRegister | undefined {
  const listaDef = mall.underkomponenter.find(
    (u) => u.detaljPanel === "hiss-lista",
  );
  if (!listaDef) return data.hissRegister;

  const befintlig = data.hissRegister?.[listaDef.id];
  if (befintlig && befintlig.length > 0) {
    return { ...skapaTomHissRegister(mall), ...data.hissRegister };
  }

  const poster = extraheraHissPoster(data);
  if (poster.length === 0) {
    return Object.keys(skapaTomHissRegister(mall)).length > 0
      ? { ...skapaTomHissRegister(mall), ...data.hissRegister }
      : data.hissRegister;
  }

  return {
    ...skapaTomHissRegister(mall),
    ...data.hissRegister,
    [listaDef.id]: poster,
  };
}

const legacyTvattstugaUnderIds = [
  "tvattmaskin",
  "torktumlare",
  "torkskap",
  "mangel",
  "belysning",
  "golv",
  "vaggar",
] as const;

function extraheraLegacyTvattstugaPost(
  data: KomponentDetaljData,
): TvattstugaPost | null {
  const harLegacy = data.underkomponenter.some(
    (r) =>
      legacyTvattstugaUnderIds.includes(
        r.id as (typeof legacyTvattstugaUnderIds)[number],
      ) &&
      (r.aktiv || r.värde.trim() || r.ytskikt),
  );
  if (!harLegacy) return null;

  const rad = (id: string) => data.underkomponenter.find((r) => r.id === id);
  const utformning = (data.valdaDeltyper[0] ??
    "gemensam") as TvattstugaUtformningId;
  const golvRad = rad("golv");
  const vaggRad = rad("vaggar");

  return {
    ...skapaTomTvattstugaPost("Tvättstuga 1"),
    utformning,
    tvattmaskin: rad("tvattmaskin")?.värde ?? "",
    torktumlare: rad("torktumlare")?.värde ?? "",
    torkskap: rad("torkskap")?.värde ?? "",
    mangel: rad("mangel")?.värde ?? "",
    belysning: rad("belysning")?.värde ?? "",
    golvYtskikt: golvRad?.ytskikt ?? standardYtskikt("tvattstuga-golv"),
    golvKvm: golvRad?.värde ?? "",
    vaggarYtskikt: vaggRad?.ytskikt ?? standardYtskikt("tvattstuga-vagg"),
    vaggarKvm: vaggRad?.värde ?? "",
  };
}

function extraheraTvattstugaPoster(data: KomponentDetaljData): TvattstugaPost[] {
  const reg = data.tvattstugaRegister;
  if (reg) {
    const poster =
      reg[TVATTSTUGA_UNDERKOMPONENT_ID] ??
      reg.tvattstugor ??
      [];
    if (poster.length > 0) return poster;
  }
  const legacy = extraheraLegacyTvattstugaPost(data);
  return legacy ? [legacy] : [];
}

function migreraTvattstugaRegister(
  data: KomponentDetaljData,
  mall: KomponentMall,
): TvattstugaRegister | undefined {
  const listaDef = mall.underkomponenter.find(
    (u) => u.detaljPanel === "tvattstuga-lista",
  );
  if (!listaDef) return data.tvattstugaRegister;

  const befintlig = data.tvattstugaRegister?.[listaDef.id];
  if (befintlig && befintlig.length > 0) {
    return { ...skapaTomTvattstugaRegister(mall), ...data.tvattstugaRegister };
  }

  const poster = extraheraTvattstugaPoster(data);
  if (poster.length === 0) {
    return Object.keys(skapaTomTvattstugaRegister(mall)).length > 0
      ? { ...skapaTomTvattstugaRegister(mall), ...data.tvattstugaRegister }
      : data.tvattstugaRegister;
  }

  return {
    ...skapaTomTvattstugaRegister(mall),
    ...data.tvattstugaRegister,
    [listaDef.id]: poster,
  };
}

/** Flyttar sparad data från tidigare huvudkomponenten Tvättstuga till Källare. */
export function flyttaTvattstugaTillKallare(
  activeComponents: string[],
  register: Record<string, KomponentDetaljData>,
): {
  activeComponents: string[];
  register: Record<string, KomponentDetaljData>;
} {
  const tvattData = register["Tvättstuga"];
  const activeUtanTvatt = activeComponents.filter((n) => n !== "Tvättstuga");

  if (!tvattData) {
    return { activeComponents: activeUtanTvatt, register };
  }

  const poster = extraheraTvattstugaPoster(tvattData);
  const hadeTvattAktiv = activeComponents.includes("Tvättstuga");
  const { Tvättstuga: _, ...restRegister } = register;

  if (poster.length === 0 && !hadeTvattAktiv) {
    return { activeComponents: activeUtanTvatt, register: restRegister };
  }

  let active = activeUtanTvatt;
  if (!active.includes("Källare")) {
    active = [...active, "Källare"];
  }

  const kallareMall = hamtaKomponentMall("Källare");
  let kallare = restRegister["Källare"]
    ? synkaKomponentDetaljMedMall(restRegister["Källare"], kallareMall)
    : skapaTomKomponentDetalj("Källare");

  const befintliga =
    kallare.tvattstugaRegister?.[TVATTSTUGA_UNDERKOMPONENT_ID] ?? [];
  const sammanslagna = [...befintliga, ...poster];

  kallare = {
    ...kallare,
    tvattstugaRegister: {
      ...kallare.tvattstugaRegister,
      [TVATTSTUGA_UNDERKOMPONENT_ID]: sammanslagna,
    },
    underkomponenter: kallare.underkomponenter.map((r) =>
      r.id === TVATTSTUGA_UNDERKOMPONENT_ID ? { ...r, aktiv: true } : r,
    ),
  };

  return {
    activeComponents: active,
    register: { ...restRegister, Källare: kallare },
  };
}

/** Flyttar sparad data från tidigare huvudkomponenten Hiss till Trapphus. */
export function flyttaHissTillTrapphus(
  activeComponents: string[],
  register: Record<string, KomponentDetaljData>,
): {
  activeComponents: string[];
  register: Record<string, KomponentDetaljData>;
} {
  const hissData = register["Hiss"];
  const activeUtanHiss = activeComponents.filter((n) => n !== "Hiss");

  if (!hissData) {
    return { activeComponents: activeUtanHiss, register };
  }

  const { Hiss: _, ...restRegister } = register;

  const posterFranHiss = hissData
    ? (() => {
        const franRegister = extraheraHissPoster(hissData);
        if (franRegister.length > 0) return franRegister;
        const rad = hissData.underkomponenter.find((r) => r.id === "hiss");
        if (rad?.värde.trim()) {
          return posterFranAntalFalt(rad.värde, "Hiss");
        }
        return [];
      })()
    : [];

  if (posterFranHiss.length === 0) {
    return { activeComponents: activeUtanHiss, register: restRegister };
  }

  let active = activeUtanHiss;
  if (!active.includes("Trapphus")) {
    active = [...active, "Trapphus"];
  }

  const trapphusMall = hamtaKomponentMall("Trapphus");
  let trapphus = restRegister["Trapphus"]
    ? synkaKomponentDetaljMedMall(restRegister["Trapphus"], trapphusMall)
    : skapaTomKomponentDetalj("Trapphus");

  const befintliga = trapphus.hissRegister?.[HISS_UNDERKOMPONENT_ID] ?? [];
  const sammanslagna = [...befintliga, ...posterFranHiss];

  trapphus = {
    ...trapphus,
    hissRegister: {
      ...trapphus.hissRegister,
      [HISS_UNDERKOMPONENT_ID]: sammanslagna,
    },
    underkomponenter: trapphus.underkomponenter.map((r) =>
      r.id === HISS_UNDERKOMPONENT_ID
        ? { ...r, aktiv: true, värde: "" }
        : r,
    ),
  };

  return {
    activeComponents: active,
    register: { ...restRegister, Trapphus: trapphus },
  };
}

/** Tidigare huvudkomponent — ersatt av VVS → Stambyte. */
export const STAMMAR_KOMPONENT_NAMN = "Stammar / stamledningar";

const STAMBYTE_UNDERKOMPONENT_ID = "stambyte";

function mappaStammarDeltyp(valdaDeltyper: string[]): {
  vattenMaterial?: VattenMaterialId;
  avloppMaterial?: AvloppMaterialId;
} {
  const id = valdaDeltyper[0];
  if (id === "koppar") return { vattenMaterial: "koppar" };
  if (id === "plast") {
    return { vattenMaterial: "pex", avloppMaterial: "plast" };
  }
  if (id === "stal") {
    return { vattenMaterial: "stal-galvaniserat", avloppMaterial: "gjutjarn" };
  }
  return {};
}

function stambytePatchFranStammar(
  stammar: KomponentDetaljData,
): Partial<VvsStambyteData> | null {
  const rad = (id: string) =>
    stammar.underkomponenter.find((r) => r.id === id);
  const vatten = rad("vatten");
  const avlopp = rad("avlopp");
  const ventiler = rad("ventiler");
  const deltyper = stammar.valdaDeltyper ?? [];
  const harMangd =
    (vatten?.aktiv && vatten.värde.trim()) ||
    (avlopp?.aktiv && avlopp.värde.trim()) ||
    (ventiler?.aktiv && ventiler.värde.trim());
  if (!harMangd && deltyper.length === 0) return null;

  const patch: Partial<VvsStambyteData> = {
    ...mappaStammarDeltyp(deltyper),
  };
  if (vatten?.värde.trim()) {
    patch.vattenVertikalKallvattenLpm = vatten.värde.trim();
  }
  if (avlopp?.värde.trim()) {
    patch.avloppVertikalStamLpm = avlopp.värde.trim();
  }
  if (ventiler?.värde.trim()) {
    patch.stamventilerAntal = ventiler.värde.trim();
  }
  return patch;
}

function slåIhopStambyteData(
  befintlig: VvsStambyteData,
  patch: Partial<VvsStambyteData>,
): VvsStambyteData {
  const base = normaliseraVvsStambyteData(befintlig);
  const första = (a: string, b?: string) => (a.trim() ? a.trim() : (b?.trim() ?? ""));
  return normaliseraVvsStambyteData({
    ...base,
    ...patch,
    vattenVertikalKallvattenLpm: första(
      base.vattenVertikalKallvattenLpm,
      patch.vattenVertikalKallvattenLpm,
    ),
    avloppVertikalStamLpm: första(
      base.avloppVertikalStamLpm,
      patch.avloppVertikalStamLpm,
    ),
    stamventilerAntal: första(base.stamventilerAntal, patch.stamventilerAntal),
    vattenMaterial: patch.vattenMaterial ?? base.vattenMaterial,
    avloppMaterial: patch.avloppMaterial ?? base.avloppMaterial,
  });
}

/** Flyttar sparad data från Stammar / stamledningar till VVS → Stambyte. */
export function flyttaStammarTillVvs(
  activeComponents: string[],
  register: Record<string, KomponentDetaljData>,
): {
  activeComponents: string[];
  register: Record<string, KomponentDetaljData>;
} {
  const stammarData = register[STAMMAR_KOMPONENT_NAMN];
  const activeUtanStammar = activeComponents.filter(
    (n) => n !== STAMMAR_KOMPONENT_NAMN,
  );
  const { [STAMMAR_KOMPONENT_NAMN]: _, ...restRegister } = register;

  if (!stammarData) {
    return { activeComponents: activeUtanStammar, register: restRegister };
  }

  const patch = stambytePatchFranStammar(stammarData);
  if (!patch) {
    return { activeComponents: activeUtanStammar, register: restRegister };
  }

  let active = activeUtanStammar;
  if (!active.includes("VVS")) {
    active = [...active, "VVS"];
  }

  const vvsMall = hamtaKomponentMall("VVS");
  let vvs = restRegister.VVS
    ? synkaKomponentDetaljMedMall(restRegister.VVS, vvsMall)
    : skapaTomKomponentDetalj("VVS");

  const befintligStambyte =
    vvs.vvsStambyteRegister?.[STAMBYTE_UNDERKOMPONENT_ID] ??
    skapaTomVvsStambyteData();
  const sammanslagen = slåIhopStambyteData(befintligStambyte, patch);

  vvs = {
    ...vvs,
    vvsStambyteRegister: {
      ...vvs.vvsStambyteRegister,
      [STAMBYTE_UNDERKOMPONENT_ID]: sammanslagen,
    },
    underkomponenter: vvs.underkomponenter.map((r) =>
      r.id === STAMBYTE_UNDERKOMPONENT_ID ? { ...r, aktiv: true } : r,
    ),
  };

  return {
    activeComponents: active,
    register: { ...restRegister, VVS: vvs },
  };
}

const VARMECENTRAL_UNDERCENTRAL_ID = "undercentral";
const VARMECENTRAL_RADIATORER_ID = "radiatorer";
const GAMLA_VARMECENTRAL_UNDER_IDS = ["panna", "ackumulator", "cirkulation"] as const;

function underkomponentHarData(rad: UnderkomponentRad): boolean {
  return (
    rad.aktiv ||
    Boolean(rad.värde?.trim()) ||
    Boolean(rad.underhallNastaAr?.trim()) ||
    Boolean(rad.underhallUtförtAr?.trim())
  );
}

function slåIhopVarmecentralUnderkomponent(
  mallRad: UnderkomponentRad,
  ...källor: (UnderkomponentRad | undefined)[]
): UnderkomponentRad {
  const källa = källor.find((r) => r && underkomponentHarData(r));
  if (!källa) return mallRad;
  return {
    ...mallRad,
    aktiv: källa.aktiv || mallRad.aktiv,
    måttenhet: källa.måttenhet || mallRad.måttenhet,
    värde: källa.värde || mallRad.värde,
    underhallIntervallAr: källa.underhallIntervallAr || mallRad.underhallIntervallAr,
    avskrivningAr: källa.avskrivningAr || mallRad.avskrivningAr,
    underhallNastaAr: källa.underhallNastaAr || mallRad.underhallNastaAr,
    installationskostnadKr:
      källa.installationskostnadKr || mallRad.installationskostnadKr,
    underhallKostnadKr: källa.underhallKostnadKr || mallRad.underhallKostnadKr,
    underhallKostnadInklMomsKr:
      källa.underhallKostnadInklMomsKr || mallRad.underhallKostnadInklMomsKr,
    underhallMomsAvdragenKr:
      källa.underhallMomsAvdragenKr || mallRad.underhallMomsAvdragenKr,
    underhallPrisEnhet: källa.underhallPrisEnhet || mallRad.underhallPrisEnhet,
    underhallEnhetsprisKr: källa.underhallEnhetsprisKr || mallRad.underhallEnhetsprisKr,
    underhallPrisAntal: källa.underhallPrisAntal || mallRad.underhallPrisAntal,
    underhallStyckEnhetsprisKr:
      källa.underhallStyckEnhetsprisKr || mallRad.underhallStyckEnhetsprisKr,
    underhallStyckPoster: källa.underhallStyckPoster ?? mallRad.underhallStyckPoster,
    underhallUtförtAr: källa.underhallUtförtAr || mallRad.underhallUtförtAr,
    underhallEntreprenor: källa.underhallEntreprenor || mallRad.underhallEntreprenor,
    underhallGarantiAr: källa.underhallGarantiAr || mallRad.underhallGarantiAr,
    underhallAnsvarAr: källa.underhallAnsvarAr || mallRad.underhallAnsvarAr,
    underhallBesiktning: källa.underhallBesiktning || mallRad.underhallBesiktning,
  };
}

/** Flyttar undercentral och radiatorer från VVS till Värmecentral. */
export function flyttaVvsVarmeTillVarmecentral(
  activeComponents: string[],
  register: Record<string, KomponentDetaljData>,
): {
  activeComponents: string[];
  register: Record<string, KomponentDetaljData>;
} {
  const vvs = register.VVS;
  const varmeBefintlig = register.Värmecentral;

  const undercentralFranVvs = vvs?.underkomponenter.find(
    (r) => r.id === VARMECENTRAL_UNDERCENTRAL_ID,
  );
  const radiatorerFranVvs = vvs?.underkomponenter.find(
    (r) => r.id === VARMECENTRAL_RADIATORER_ID,
  );
  const radiatorRegisterFranVvs =
    vvs?.vvsRadiatorRegister?.[VARMECENTRAL_RADIATORER_ID];
  const pannaFranVarme = varmeBefintlig?.underkomponenter.find((r) => r.id === "panna");

  const harVvsVarme =
    Boolean(
      undercentralFranVvs &&
        (undercentralFranVvs.aktiv || undercentralFranVvs.värde?.trim()),
    ) ||
    Boolean(
      radiatorerFranVvs &&
        (radiatorerFranVvs.aktiv || radiatorRegisterFranVvs),
    ) ||
    Boolean(radiatorRegisterFranVvs);

  const harGammalVarmecentral = varmeBefintlig?.underkomponenter.some(
    (r) => GAMLA_VARMECENTRAL_UNDER_IDS.includes(r.id as (typeof GAMLA_VARMECENTRAL_UNDER_IDS)[number]) && underkomponentHarData(r),
  );

  if (!vvs && !varmeBefintlig && !harVvsVarme && !harGammalVarmecentral) {
    return { activeComponents, register };
  }

  let active = [...activeComponents];
  const nextRegister = { ...register };
  const varmeMall = hamtaKomponentMall("Värmecentral");

  let varme = varmeBefintlig
    ? synkaKomponentDetaljMedMall(varmeBefintlig, varmeMall)
    : skapaTomKomponentDetalj("Värmecentral");

  const valdaFranVvs = (vvs?.valdaDeltyper ?? []).filter((id) =>
    varmeMall.deltyper.some((d) => d.id === id),
  );
  varme = {
    ...varme,
    valdaDeltyper:
      varme.valdaDeltyper.length > 0 ? varme.valdaDeltyper : valdaFranVvs,
    underkomponenter: varme.underkomponenter.map((rad) => {
      if (rad.id === VARMECENTRAL_UNDERCENTRAL_ID) {
        return slåIhopVarmecentralUnderkomponent(
          rad,
          undercentralFranVvs,
          pannaFranVarme,
        );
      }
      if (rad.id === VARMECENTRAL_RADIATORER_ID) {
        return slåIhopVarmecentralUnderkomponent(rad, radiatorerFranVvs);
      }
      return rad;
    }),
    vvsRadiatorRegister: radiatorRegisterFranVvs
      ? {
          ...varme.vvsRadiatorRegister,
          [VARMECENTRAL_RADIATORER_ID]: radiatorRegisterFranVvs,
        }
      : varme.vvsRadiatorRegister,
  };

  const skaHaVarmecentral =
    active.includes("Värmecentral") ||
    Boolean(varmeBefintlig) ||
    harVvsVarme ||
    harGammalVarmecentral ||
    varme.underkomponenter.some((r) => underkomponentHarData(r));

  if (skaHaVarmecentral && !active.includes("Värmecentral")) {
    active = [...active, "Värmecentral"];
  }

  if (vvs) {
    const vvsMall = hamtaKomponentMall("VVS");
    const { [VARMECENTRAL_RADIATORER_ID]: _, ...vvsRadiatorUtanRadiatorer } =
      vvs.vvsRadiatorRegister ?? {};
    const vvsUtanVarme: KomponentDetaljData = {
      ...vvs,
      vvsRadiatorRegister:
        Object.keys(vvsRadiatorUtanRadiatorer).length > 0
          ? vvsRadiatorUtanRadiatorer
          : undefined,
    };
    nextRegister.VVS = synkaKomponentDetaljMedMall(vvsUtanVarme, vvsMall);
  }

  if (skaHaVarmecentral) {
    nextRegister.Värmecentral = varme;
  } else if (varmeBefintlig) {
    nextRegister.Värmecentral = varme;
  }

  return { activeComponents: active, register: nextRegister };
}

function flyttaFonsterTillEgenKomponent(
  activeComponents: string[],
  register: Record<string, KomponentDetaljData>,
): {
  activeComponents: string[];
  register: Record<string, KomponentDetaljData>;
} {
  const fasad = register.Fasad;
  const poster = fasad?.fonsterDorrRegister?.fonster ?? [];
  if (poster.length === 0) return { activeComponents, register };

  let active = activeComponents;
  if (!active.includes("Fönster")) active = [...active, "Fönster"];

  const fonsterMall = hamtaKomponentMall("Fönster");
  const befintlig =
    register["Fönster"] && fonsterMall
      ? synkaKomponentDetaljMedMall(register["Fönster"], fonsterMall)
      : skapaTomKomponentDetalj("Fönster");

  const befintligaPoster = befintlig.fonsterDorrRegister?.fonster ?? [];
  const sammanslagna = [...befintligaPoster, ...poster];

  const uppdaterad: KomponentDetaljData = {
    ...befintlig,
    fonsterDorrRegister: {
      ...befintlig.fonsterDorrRegister,
      fonster: sammanslagna,
    },
    underkomponenter: befintlig.underkomponenter.map((r) =>
      r.id === "fonster" ? { ...r, aktiv: true } : r,
    ),
  };

  // Rensa fönsterposter från fasad (historiskt läge).
  const fasadUtan = fasad
    ? {
        ...fasad,
        fonsterDorrRegister: {
          ...fasad.fonsterDorrRegister,
          fonster: [],
        },
      }
    : fasad;

  return {
    activeComponents: active,
    register: { ...register, Fasad: fasadUtan ?? register.Fasad, "Fönster": uppdaterad },
  };
}

function flyttaBalkongerTillEgenKomponent(
  activeComponents: string[],
  register: Record<string, KomponentDetaljData>,
): {
  activeComponents: string[];
  register: Record<string, KomponentDetaljData>;
} {
  const fasad = register.Fasad;
  const poster = fasad?.balkongRegister?.[BALKONGER_UNDERKOMPONENT_ID] ?? [];
  if (poster.length === 0) return { activeComponents, register };

  let active = activeComponents;
  if (!active.includes("Balkonger")) active = [...active, "Balkonger"];

  const balkongMall = hamtaKomponentMall("Balkonger");
  const befintlig =
    register.Balkonger && balkongMall
      ? synkaKomponentDetaljMedMall(register.Balkonger, balkongMall)
      : skapaTomKomponentDetalj("Balkonger");

  const befintligaPoster =
    befintlig.balkongRegister?.[BALKONGER_UNDERKOMPONENT_ID] ?? [];
  const sammanslagna = [...befintligaPoster, ...poster];

  const uppdaterad: KomponentDetaljData = {
    ...befintlig,
    balkongRegister: {
      ...befintlig.balkongRegister,
      [BALKONGER_UNDERKOMPONENT_ID]: sammanslagna,
    },
    underkomponenter: befintlig.underkomponenter.map((r) =>
      r.id === BALKONGER_UNDERKOMPONENT_ID ? { ...r, aktiv: true } : r,
    ),
  };

  const fasadUtan = fasad
    ? {
        ...fasad,
        balkongRegister: {
          ...fasad.balkongRegister,
          [BALKONGER_UNDERKOMPONENT_ID]: [],
        },
      }
    : fasad;

  return {
    activeComponents: active,
    register: { ...register, Fasad: fasadUtan ?? register.Fasad, Balkonger: uppdaterad },
  };
}

function skapaUnderkomponentRadFranDef(
  def: UnderkomponentDefinition,
  komponentNamn?: string,
): UnderkomponentRad {
  const underhallIntervallAr = komponentNamn
    ? standardUnderhallIntervallAr(komponentNamn, def.id)
    : "";
  const avskrivningAr = komponentNamn
    ? standardAvskrivningAr(komponentNamn, def.id)
    : "";
  return {
    id: def.id,
    etikett: def.etikett,
    aktiv: false,
    måttenhet: def.defaultMåttenhet,
    värde: "",
    ärEgen: false,
    underhallIntervallAr,
    avskrivningAr: avskrivningAr || undefined,
    underhallNastaAr: "",
    installationskostnadKr: "",
    underhallKostnadKr: "",
    underhallGarantiAr: "2",
    underhallAnsvarAr: "10",
    underhallBesiktning: "",
    ytskikt: def.ytskiktGrupp
      ? standardYtskikt(def.ytskiktGrupp)
      : undefined,
    forradMaterial:
      def.detaljPanel === "forrad-val" ||
      (def.detaljPanel === "lokal-komplement-val" && def.id === "forrad")
        ? standardForradMaterial()
        : undefined,
    golvMaterial: def.detaljPanel === "golv-val"
      ? standardTrapphusGolvMaterial()
      : undefined,
  };
}

function slåIhopFasadmaterialRad(
  mallRad: UnderkomponentRad,
  ...källor: (UnderkomponentRad | undefined)[]
): UnderkomponentRad {
  const källa = källor.find(
    (r) => r && (r.aktiv || Boolean(r.värde?.trim()) || Boolean(r.underhallNastaAr?.trim())),
  );
  if (!källa) return mallRad;
  return {
    ...mallRad,
    aktiv: källa.aktiv || mallRad.aktiv,
    måttenhet: källa.måttenhet || mallRad.måttenhet,
    värde: källa.värde || mallRad.värde,
    underhallIntervallAr: källa.underhallIntervallAr || mallRad.underhallIntervallAr,
    avskrivningAr: källa.avskrivningAr || mallRad.avskrivningAr,
    underhallNastaAr: källa.underhallNastaAr || mallRad.underhallNastaAr,
    installationskostnadKr:
      källa.installationskostnadKr || mallRad.installationskostnadKr,
    underhallKostnadKr: källa.underhallKostnadKr || mallRad.underhallKostnadKr,
    underhallKostnadInklMomsKr:
      källa.underhallKostnadInklMomsKr || mallRad.underhallKostnadInklMomsKr,
    underhallMomsAvdragenKr:
      källa.underhallMomsAvdragenKr || mallRad.underhallMomsAvdragenKr,
    underhallPrisEnhet: källa.underhallPrisEnhet || mallRad.underhallPrisEnhet,
    underhallEnhetsprisKr: källa.underhallEnhetsprisKr || mallRad.underhallEnhetsprisKr,
    underhallPrisAntal: källa.underhallPrisAntal || mallRad.underhallPrisAntal,
    underhallStyckEnhetsprisKr:
      källa.underhallStyckEnhetsprisKr || mallRad.underhallStyckEnhetsprisKr,
    underhallStyckPoster: källa.underhallStyckPoster ?? mallRad.underhallStyckPoster,
    underhallUtförtAr: källa.underhallUtförtAr || mallRad.underhallUtförtAr,
    underhallEntreprenor: källa.underhallEntreprenor || mallRad.underhallEntreprenor,
    underhallGarantiAr: källa.underhallGarantiAr || mallRad.underhallGarantiAr,
    underhallAnsvarAr: källa.underhallAnsvarAr || mallRad.underhallAnsvarAr,
    underhallBesiktning: källa.underhallBesiktning || mallRad.underhallBesiktning,
  };
}

/** Flyttar borttagen underkomponent puts → fasadmaterial. */
function förberedFasadData(data: KomponentDetaljData): KomponentDetaljData {
  const puts = data.underkomponenter.find((r) => r.id === "puts");
  if (!puts) return data;

  const utanPuts = data.underkomponenter.filter((r) => r.id !== "puts");
  const befintligFasadmaterial = utanPuts.find((r) => r.id === "fasadmaterial");

  if (befintligFasadmaterial) {
    return {
      ...data,
      underkomponenter: utanPuts.map((r) =>
        r.id === "fasadmaterial" ? slåIhopFasadmaterialRad(r, puts, r) : r,
      ),
    };
  }

  return {
    ...data,
    underkomponenter: [
      ...utanPuts,
      {
        ...puts,
        id: "fasadmaterial",
        etikett: "Fasadmaterial",
        måttenhet: puts.måttenhet === "antal" ? "kvm" : puts.måttenhet,
      },
    ],
  };
}

/** Slår ihop sparad detaljdata med senaste komponentmall (nya underkomponenter m.m.). */
export function synkaKomponentDetaljMedMall(
  data: KomponentDetaljData,
  mall: KomponentMall,
): KomponentDetaljData {
  const dataIn = mall.namn === "Fasad" ? förberedFasadData(data) : data;
  const tom = skapaTomKomponentDetalj(mall.namn);
  const befintligMap = new Map(dataIn.underkomponenter.map((r) => [r.id, r]));

  const underkomponenter: UnderkomponentRad[] = [
    ...mall.underkomponenter.map((def) => {
      const rad = befintligMap.get(def.id);
      if (rad) {
        const standardAvskr = standardAvskrivningAr(mall.namn, def.id);
        return {
          ...rad,
          etikett: def.etikett,
          avskrivningAr: rad.avskrivningAr?.trim() || standardAvskr || rad.avskrivningAr,
        };
      }
      return skapaUnderkomponentRadFranDef(def, mall.namn);
    }),
    ...dataIn.underkomponenter.filter((r) => r.ärEgen),
  ];

  const tillatEgenDeltyp = mall.tillatEgenDeltyp !== false;
  const mallDeltypIds = new Set(mall.deltyper.map((d) => d.id));
  const valdaDeltyperIn = tillatEgenDeltyp
    ? dataIn.valdaDeltyper
    : dataIn.valdaDeltyper.filter((id) => mallDeltypIds.has(id));
  const valdaDeltyper =
    mall.namn === "Ventilation"
      ? synkaLegacyVentilationDeltyper(valdaDeltyperIn).filter((id) =>
          mallDeltypIds.has(id),
        )
      : valdaDeltyperIn;

  return {
    valdaDeltyper,
    egnaDeltyper: tillatEgenDeltyp ? dataIn.egnaDeltyper : [],
    underkomponenter,
    fonsterDorrRegister: {
      ...tom.fonsterDorrRegister,
      ...dataIn.fonsterDorrRegister,
    },
    fasadAtgardRegister: {
      ...skapaTomFasadAtgardRegister(mall),
      ...dataIn.fasadAtgardRegister,
    },
    fasadAtgardPrisRegister: {
      ...dataIn.fasadAtgardPrisRegister,
    },
    underhallTillfallenRegister: {
      ...dataIn.underhallTillfallenRegister,
    },
    underhallTillfallenPrisRegister: {
      ...dataIn.underhallTillfallenPrisRegister,
    },
    lokalInventarRegister: {
      ...tom.lokalInventarRegister,
      ...dataIn.lokalInventarRegister,
    },
    lokalYtskiktRegister: {
      ...tom.lokalYtskiktRegister,
      ...dataIn.lokalYtskiktRegister,
    },
    vvsRadiatorRegister: {
      ...tom.vvsRadiatorRegister,
      ...dataIn.vvsRadiatorRegister,
    },
    varmestammarRegister: {
      ...skapaTomVarmestammarRegister(mall),
      ...dataIn.varmestammarRegister,
    },
    stamventilerRegister: {
      ...skapaTomStamventilerRegister(mall),
      ...dataIn.stamventilerRegister,
    },
    vvsStambyteRegister: {
      ...tom.vvsStambyteRegister,
      ...dataIn.vvsStambyteRegister,
    },
    pPlatserRegister: {
      ...tom.pPlatserRegister,
      ...dataIn.pPlatserRegister,
    },
    tvattstugaRegister: migreraTvattstugaRegister(
      {
        ...dataIn,
        underkomponenter,
      },
      mall,
    ),
    balkongRegister: migreraBalkongRegister(
      {
        ...dataIn,
        underkomponenter,
      },
      mall,
    ),
    hissRegister: migreraHissRegister(
      {
        ...dataIn,
        underkomponenter,
      },
      mall,
    ),
    ventilationExtraRegister: {
      ...skapaTomVentilationExtraRegister(mall),
      ...dataIn.ventilationExtraRegister,
    },
    brandskyddSbaRegister: {
      ...skapaTomBrandskyddSbaRegister(mall),
      ...dataIn.brandskyddSbaRegister,
    },
    brandskyddBranddorrRegister: {
      ...skapaTomBrandskyddBranddorrRegister(mall),
      ...dataIn.brandskyddBranddorrRegister,
    },
    egnaHissMarken: dataIn.egnaHissMarken ?? [],
    takterrassRegister: {
      ...tom.takterrassRegister,
      ...dataIn.takterrassRegister,
    },
    medlemstakterrassRegister: {
      ...tom.medlemstakterrassRegister,
      ...dataIn.medlemstakterrassRegister,
    },
    takfonsterRegister: {
      ...tom.takfonsterRegister,
      ...dataIn.takfonsterRegister,
    },
  };
}

export function skapaTomKomponentDetalj(namn: string): KomponentDetaljData {
  const mall = hamtaKomponentMall(namn);
  const fonsterDorrRegister = skapaTomFonsterDorrRegister(mall);
  const fasadAtgardRegister = skapaTomFasadAtgardRegister(mall);
  const lokalInventarRegister = skapaTomLokalInventarRegister(mall);
  const lokalYtskiktRegister = skapaTomLokalYtskiktRegister(mall);
  const vvsRadiatorRegister = skapaTomVvsRadiatorRegister(mall);
  const varmestammarRegister = skapaTomVarmestammarRegister(mall);
  const stamventilerRegister = skapaTomStamventilerRegister(mall);
  const vvsStambyteRegister = skapaTomVvsStambyteRegister(mall);
  const pPlatserRegister = skapaTomPPlatserRegister(mall);
  const tvattstugaRegister = skapaTomTvattstugaRegister(mall);
  const balkongRegister = skapaTomBalkongRegister(mall);
  const hissRegister = skapaTomHissRegister(mall);
  const ventilationExtraRegister = skapaTomVentilationExtraRegister(mall);
  const brandskyddSbaRegister = skapaTomBrandskyddSbaRegister(mall);
  const brandskyddBranddorrRegister = skapaTomBrandskyddBranddorrRegister(mall);
  const takterrassRegister = skapaTomTakterrassRegister(mall);
  const medlemstakterrassRegister = skapaTomMedlemstakterrassRegister(mall);
  const takfonsterRegister = skapaTomTakfonsterRegister(mall);
  return {
    valdaDeltyper: [],
    egnaDeltyper: [],
    underkomponenter: mall.underkomponenter.map((def) =>
      skapaUnderkomponentRadFranDef(def, mall.namn),
    ),
    fonsterDorrRegister:
      Object.keys(fonsterDorrRegister).length > 0 ? fonsterDorrRegister : undefined,
    fasadAtgardRegister:
      Object.keys(fasadAtgardRegister).length > 0 ? fasadAtgardRegister : undefined,
    lokalInventarRegister:
      Object.keys(lokalInventarRegister).length > 0
        ? lokalInventarRegister
        : undefined,
    lokalYtskiktRegister:
      Object.keys(lokalYtskiktRegister).length > 0
        ? lokalYtskiktRegister
        : undefined,
    vvsRadiatorRegister:
      Object.keys(vvsRadiatorRegister).length > 0
        ? vvsRadiatorRegister
        : undefined,
    varmestammarRegister:
      Object.keys(varmestammarRegister).length > 0
        ? varmestammarRegister
        : undefined,
    stamventilerRegister:
      Object.keys(stamventilerRegister).length > 0
        ? stamventilerRegister
        : undefined,
    vvsStambyteRegister:
      Object.keys(vvsStambyteRegister).length > 0
        ? vvsStambyteRegister
        : undefined,
    pPlatserRegister:
      Object.keys(pPlatserRegister).length > 0 ? pPlatserRegister : undefined,
    tvattstugaRegister:
      Object.keys(tvattstugaRegister).length > 0
        ? tvattstugaRegister
        : undefined,
    balkongRegister:
      Object.keys(balkongRegister).length > 0 ? balkongRegister : undefined,
    hissRegister:
      Object.keys(hissRegister).length > 0 ? hissRegister : undefined,
    ventilationExtraRegister:
      Object.keys(ventilationExtraRegister).length > 0
        ? ventilationExtraRegister
        : undefined,
    brandskyddSbaRegister:
      Object.keys(brandskyddSbaRegister).length > 0
        ? brandskyddSbaRegister
        : undefined,
    brandskyddBranddorrRegister:
      Object.keys(brandskyddBranddorrRegister).length > 0
        ? brandskyddBranddorrRegister
        : undefined,
    takterrassRegister:
      Object.keys(takterrassRegister).length > 0
        ? takterrassRegister
        : undefined,
    medlemstakterrassRegister:
      Object.keys(medlemstakterrassRegister).length > 0
        ? medlemstakterrassRegister
        : undefined,
    takfonsterRegister:
      Object.keys(takfonsterRegister).length > 0 ? takfonsterRegister : undefined,
  };
}

export function hamtaTakfonsterData(
  data: KomponentDetaljData,
  underId: string,
): TakfonsterData {
  return normaliseraTakfonsterData(data.takfonsterRegister?.[underId]);
}

export function uppdateraTakfonsterData(
  data: KomponentDetaljData,
  underId: string,
  takfonster: TakfonsterData,
): KomponentDetaljData {
  return {
    ...data,
    takfonsterRegister: {
      ...data.takfonsterRegister,
      [underId]: normaliseraTakfonsterData(takfonster),
    },
  };
}

export function hamtaFasadAtgardData(
  data: KomponentDetaljData,
  underId: string,
): FasadAtgardData {
  return normaliseraFasadAtgardData(data.fasadAtgardRegister?.[underId]);
}

export function uppdateraFasadAtgardData(
  data: KomponentDetaljData,
  underId: string,
  atgard: FasadAtgardData,
): KomponentDetaljData {
  return {
    ...data,
    fasadAtgardRegister: {
      ...data.fasadAtgardRegister,
      [underId]: normaliseraFasadAtgardData(atgard),
    },
  };
}

export function hamtaFonsterDorrPoster(
  data: KomponentDetaljData,
  underId: string,
): FonsterDorrPost[] {
  const poster = data.fonsterDorrRegister?.[underId] ?? [];
  return underId === "dorrar" ? poster : poster.map(normaliseraFonsterDorrPost);
}

export function uppdateraFonsterDorrPoster(
  data: KomponentDetaljData,
  underId: string,
  poster: FonsterDorrPost[],
): KomponentDetaljData {
  const normaliserade =
    underId === "dorrar"
      ? poster
      : poster.map(normaliseraFonsterDorrPost);
  return {
    ...data,
    fonsterDorrRegister: {
      ...data.fonsterDorrRegister,
      [underId]: normaliserade,
    },
  };
}

export function hamtaLokalInventar(
  data: KomponentDetaljData,
  underId: string,
  lokalTyp: LokalTypId,
): LokalInventarRad[] {
  return (
    data.lokalInventarRegister?.[underId] ?? skapaTomLokalInventar(lokalTyp)
  );
}

export function uppdateraLokalInventar(
  data: KomponentDetaljData,
  underId: string,
  rader: LokalInventarRad[],
): KomponentDetaljData {
  return {
    ...data,
    lokalInventarRegister: {
      ...data.lokalInventarRegister,
      [underId]: rader,
    },
  };
}

export function hamtaLokalYtskikt(
  data: KomponentDetaljData,
  underId: string,
): LokalYtskiktDelRad[] {
  return data.lokalYtskiktRegister?.[underId] ?? skapaTomLokalYtskikt();
}

export function uppdateraLokalYtskikt(
  data: KomponentDetaljData,
  underId: string,
  rader: LokalYtskiktDelRad[],
): KomponentDetaljData {
  return {
    ...data,
    lokalYtskiktRegister: {
      ...data.lokalYtskiktRegister,
      [underId]: rader,
    },
  };
}

export function hamtaVvsRadiatorData(
  data: KomponentDetaljData,
  underId: string,
): VvsRadiatorData {
  const raw = data.vvsRadiatorRegister?.[underId];
  return normaliseraVvsRadiatorData(raw);
}

export function uppdateraVvsRadiatorData(
  data: KomponentDetaljData,
  underId: string,
  radiatorData: VvsRadiatorData,
): KomponentDetaljData {
  return {
    ...data,
    vvsRadiatorRegister: {
      ...data.vvsRadiatorRegister,
      [underId]: normaliseraVvsRadiatorData(radiatorData),
    },
  };
}

export function hamtaVarmestamPoster(
  data: KomponentDetaljData,
  underId: string,
): VarmestamPost[] {
  return data.varmestammarRegister?.[underId] ?? [];
}

export function uppdateraVarmestamPoster(
  data: KomponentDetaljData,
  underId: string,
  poster: VarmestamPost[],
): KomponentDetaljData {
  return {
    ...data,
    varmestammarRegister: {
      ...data.varmestammarRegister,
      [underId]: poster,
    },
  };
}

export function hamtaStamventilPoster(
  data: KomponentDetaljData,
  underId: string,
): StamventilPost[] {
  return data.stamventilerRegister?.[underId] ?? [];
}

export function uppdateraStamventilPoster(
  data: KomponentDetaljData,
  underId: string,
  poster: StamventilPost[],
): KomponentDetaljData {
  return {
    ...data,
    stamventilerRegister: {
      ...data.stamventilerRegister,
      [underId]: poster,
    },
  };
}

export function hamtaPPlatserData(
  data: KomponentDetaljData,
  underId: string,
): PPlatserData {
  return data.pPlatserRegister?.[underId] ?? skapaTomPPlatserData();
}

export function uppdateraPPlatserData(
  data: KomponentDetaljData,
  underId: string,
  pPlatserData: PPlatserData,
): KomponentDetaljData {
  return {
    ...data,
    pPlatserRegister: {
      ...data.pPlatserRegister,
      [underId]: pPlatserData,
    },
  };
}

export function hamtaVvsStambyteData(
  data: KomponentDetaljData,
  underId: string,
): VvsStambyteData {
  const raw = data.vvsStambyteRegister?.[underId];
  if (!raw) return skapaTomVvsStambyteData();
  return normaliseraVvsStambyteData(raw);
}

export function hamtaTakterrassData(
  data: KomponentDetaljData,
  underId: string,
): TakterrassData {
  const raw = data.takterrassRegister?.[underId];
  if (!raw) return skapaTomTakterrassData();
  return normaliseraTakterrassData(raw);
}

export function uppdateraTakterrassData(
  data: KomponentDetaljData,
  underId: string,
  takterrass: TakterrassData,
): KomponentDetaljData {
  return {
    ...data,
    takterrassRegister: {
      ...data.takterrassRegister,
      [underId]: takterrass,
    },
  };
}

export function hamtaMedlemstakterrassData(
  data: KomponentDetaljData,
  underId: string,
): MedlemstakterrassData {
  const raw = data.medlemstakterrassRegister?.[underId];
  if (!raw) return skapaTomMedlemstakterrassData();
  return normaliseraMedlemstakterrassData(raw);
}

export function uppdateraMedlemstakterrassData(
  data: KomponentDetaljData,
  underId: string,
  medlemstakterrass: MedlemstakterrassData,
): KomponentDetaljData {
  return {
    ...data,
    medlemstakterrassRegister: {
      ...data.medlemstakterrassRegister,
      [underId]: medlemstakterrass,
    },
  };
}

export function hamtaTvattstugaPoster(
  data: KomponentDetaljData,
  underId: string,
): TvattstugaPost[] {
  return data.tvattstugaRegister?.[underId] ?? [];
}

export function uppdateraTvattstugaPoster(
  data: KomponentDetaljData,
  underId: string,
  poster: TvattstugaPost[],
): KomponentDetaljData {
  return {
    ...data,
    tvattstugaRegister: {
      ...data.tvattstugaRegister,
      [underId]: poster,
    },
  };
}

export function hamtaBalkongPoster(
  data: KomponentDetaljData,
  underId: string,
): BalkongPost[] {
  const poster = data.balkongRegister?.[underId] ?? [];
  return poster.map(normaliseraBalkongPost);
}

export function uppdateraBalkongPoster(
  data: KomponentDetaljData,
  underId: string,
  poster: BalkongPost[],
): KomponentDetaljData {
  return {
    ...data,
    balkongRegister: {
      ...data.balkongRegister,
      [underId]: poster.map(normaliseraBalkongPost),
    },
  };
}

export function hamtaHissPoster(
  data: KomponentDetaljData,
  underId: string,
): HissPost[] {
  return data.hissRegister?.[underId] ?? [];
}

export function uppdateraHissPoster(
  data: KomponentDetaljData,
  underId: string,
  poster: HissPost[],
): KomponentDetaljData {
  return {
    ...data,
    hissRegister: {
      ...data.hissRegister,
      [underId]: poster,
    },
  };
}

export function uppdateraEgnaHissMarken(
  data: KomponentDetaljData,
  marken: HissMarkeDefinition[],
): KomponentDetaljData {
  return {
    ...data,
    egnaHissMarken: marken,
  };
}

export function hamtaVentilationExtraPoster(
  data: KomponentDetaljData,
  underId: string,
): VentilationExtraPost[] {
  return data.ventilationExtraRegister?.[underId] ?? [];
}

export function uppdateraVentilationExtraPoster(
  data: KomponentDetaljData,
  underId: string,
  poster: VentilationExtraPost[],
): KomponentDetaljData {
  return {
    ...data,
    ventilationExtraRegister: {
      ...data.ventilationExtraRegister,
      [underId]: poster.map(normaliseraVentilationExtraPost),
    },
  };
}

export function hamtaBrandskyddSbaData(
  data: KomponentDetaljData,
  underId: string,
): BrandskyddSbaData {
  return normaliseraBrandskyddSbaData(data.brandskyddSbaRegister?.[underId]);
}

export function uppdateraBrandskyddSbaData(
  data: KomponentDetaljData,
  underId: string,
  sbaData: BrandskyddSbaData,
): KomponentDetaljData {
  return {
    ...data,
    brandskyddSbaRegister: {
      ...data.brandskyddSbaRegister,
      [underId]: normaliseraBrandskyddSbaData(sbaData),
    },
  };
}

export function hamtaBrandskyddBranddorrarData(
  data: KomponentDetaljData,
  underId: string,
): BrandskyddBranddorrarData {
  return normaliseraBrandskyddBranddorrarData(
    data.brandskyddBranddorrRegister?.[underId],
  );
}

export function uppdateraBrandskyddBranddorrarData(
  data: KomponentDetaljData,
  underId: string,
  branddorrData: BrandskyddBranddorrarData,
): KomponentDetaljData {
  return {
    ...data,
    brandskyddBranddorrRegister: {
      ...data.brandskyddBranddorrRegister,
      [underId]: normaliseraBrandskyddBranddorrarData(branddorrData),
    },
  };
}

export function uppdateraVvsStambyteData(
  data: KomponentDetaljData,
  underId: string,
  stambyteData: VvsStambyteData,
): KomponentDetaljData {
  return {
    ...data,
    vvsStambyteRegister: {
      ...data.vvsStambyteRegister,
      [underId]: normaliseraVvsStambyteData(stambyteData),
    },
  };
}

const P_PLATSER_UNDERKOMPONENT_ID = "p-platser";

/** Byter namn på Garage / carport och migrerar till ny komponentstruktur. */
export function bytNamnGarageTillKomplementByggnad(
  activeComponents: string[],
  register: Record<string, KomponentDetaljData>,
): {
  activeComponents: string[];
  register: Record<string, KomponentDetaljData>;
} {
  const gammaltNamn = GAMLA_GARAGE_CARPORT_NAMN;
  const nyttNamn = KOMPLEMENT_BYGGNAD_NAMN;
  const harGammalt =
    activeComponents.includes(gammaltNamn) || Boolean(register[gammaltNamn]);

  if (!harGammalt) {
    return { activeComponents, register };
  }

  const active = activeComponents.map((n) =>
    n === gammaltNamn ? nyttNamn : n,
  );
  const gammalData = register[gammaltNamn];
  const { [gammaltNamn]: _, ...restRegister } = register;

  if (!gammalData) {
    return { activeComponents: active, register: restRegister };
  }

  const mall = hamtaKomponentMall(nyttNamn);
  let nyData = synkaKomponentDetaljMedMall(gammalData, mall);

  const gamlaPlatser = gammalData.underkomponenter.find((r) => r.id === "platser");
  const pPlatserData = skapaTomPPlatserData();
  const valdaDeltyper = gammalData.valdaDeltyper ?? [];

  if (gamlaPlatser?.värde?.trim()) {
    if (valdaDeltyper.includes("garage")) {
      pPlatserData.garage = gamlaPlatser.värde;
    } else if (valdaDeltyper.includes("carport")) {
      pPlatserData.carport = gamlaPlatser.värde;
    } else {
      pPlatserData["p-plats"] = gamlaPlatser.värde;
    }
  }

  const harPPlatsData = Object.values(pPlatserData).some((v) => v.trim());

  nyData = {
    ...nyData,
    valdaDeltyper: nyData.valdaDeltyper.length
      ? nyData.valdaDeltyper
      : valdaDeltyper.includes("garage") || valdaDeltyper.includes("carport")
        ? ["kallare"]
        : valdaDeltyper.includes("p-plats")
          ? ["mark"]
          : [],
    underkomponenter: nyData.underkomponenter.map((rad) => {
      if (rad.id === P_PLATSER_UNDERKOMPONENT_ID && gamlaPlatser) {
        return {
          ...rad,
          aktiv: gamlaPlatser.aktiv || harPPlatsData || rad.aktiv,
        };
      }
      return rad;
    }),
    pPlatserRegister: harPPlatsData
      ? {
          ...nyData.pPlatserRegister,
          [P_PLATSER_UNDERKOMPONENT_ID]: pPlatserData,
        }
      : nyData.pPlatserRegister,
  };

  return {
    activeComponents: active,
    register: { ...restRegister, [nyttNamn]: nyData },
  };
}

export function synkaUnderhallsplanState(
  activeComponents: string[],
  befintlig: Record<string, KomponentDetaljData>,
): {
  activeComponents: string[];
  register: Record<string, KomponentDetaljData>;
} {
  const { activeComponents: activeEfterTvatt, register: regEfterTvatt } =
    flyttaTvattstugaTillKallare(activeComponents, befintlig);
  const { activeComponents: activeEfterHiss, register: regEfterHiss } =
    flyttaHissTillTrapphus(activeEfterTvatt, regEfterTvatt);
  const { activeComponents: activeEfterStammar, register: regEfterStammar } =
    flyttaStammarTillVvs(activeEfterHiss, regEfterHiss);
  const { activeComponents: activeEfterFonster, register: regEfterFonster } =
    flyttaFonsterTillEgenKomponent(activeEfterStammar, regEfterStammar);
  const { activeComponents: activeEfterBalkong, register: regEfterBalkong } =
    flyttaBalkongerTillEgenKomponent(activeEfterFonster, regEfterFonster);
  const { activeComponents: activeEfterVarme, register: regEfterVarme } =
    flyttaVvsVarmeTillVarmecentral(activeEfterBalkong, regEfterBalkong);
  const { activeComponents: active, register: reg } =
    bytNamnGarageTillKomplementByggnad(activeEfterVarme, regEfterVarme);

  const next: Record<string, KomponentDetaljData> = {};
  for (const namn of active) {
    const mall = hamtaKomponentMall(namn);
    const sparad = reg[namn];
    next[namn] = sparad
      ? synkaKomponentDetaljMedMall(sparad, mall)
      : skapaTomKomponentDetalj(namn);
  }
  return { activeComponents: active, register: next };
}

export function synkaKomponentRegister(
  activeComponents: string[],
  befintlig: Record<string, KomponentDetaljData>,
): Record<string, KomponentDetaljData> {
  return synkaUnderhallsplanState(activeComponents, befintlig).register;
}

export function allaDeltyper(data: KomponentDetaljData, mall: KomponentMall): DeltypDefinition[] {
  return [...mall.deltyper, ...data.egnaDeltyper];
}

export function deltypEtikett(
  id: string,
  data: KomponentDetaljData,
  mall: KomponentMall,
): string {
  return allaDeltyper(data, mall).find((d) => d.id === id)?.etikett ?? id;
}

export function formateraKomponentSammanfattning(
  data: KomponentDetaljData,
  mall: KomponentMall,
): string {
  const delar: string[] = [];

  if (data.valdaDeltyper.length > 0) {
    delar.push(
      data.valdaDeltyper.map((id) => deltypEtikett(id, data, mall)).join(", "),
    );
  }

  for (const rad of data.underkomponenter) {
    if (!rad.aktiv) continue;
    const def = mall.underkomponenter.find((u) => u.id === rad.id);
    if (
      def?.detaljPanel === "fonster-lista" ||
      def?.detaljPanel === "dorr-lista"
    ) {
      const poster = data.fonsterDorrRegister?.[rad.id] ?? [];
      const typ = def.detaljPanel === "dorr-lista" ? "dorr" : "fonster";
      const text = formateraFonsterDorrPoster(poster, typ);
      if (text) delar.push(`${rad.etikett}: ${text}`);
      continue;
    }
    if (def?.detaljPanel === "fasadmaterial-val") {
      const mat = data.valdaDeltyper
        .map((id) => deltypEtikett(id, data, mall))
        .join(", ");
      const atgard = formateraFasadAtgarder(
        hamtaFasadAtgardData(data, rad.id),
      );
      const yta = rad.värde.trim()
        ? `${rad.värde.trim()} ${måttenhetEtiketter[rad.måttenhet].enhet}`
        : "";
      const fasadDelar = [mat, atgard ? `åtgärd: ${atgard}` : "", yta].filter(
        Boolean,
      );
      if (fasadDelar.length > 0) {
        delar.push(`${rad.etikett}: ${fasadDelar.join(" · ")}`);
      }
      continue;
    }
    if (def?.detaljPanel === "ytskikt-val" && def.ytskiktGrupp) {
      const ytskikt =
        rad.ytskikt ?? standardYtskikt(def.ytskiktGrupp);
      const yta = rad.värde.trim()
        ? ` (${rad.värde.trim()} ${måttenhetEtiketter[rad.måttenhet].enhet})`
        : "";
      delar.push(
        `${rad.etikett}: ${ytskiktEtikett(def.ytskiktGrupp, ytskikt, rad.ytskiktAnnanText)}${yta}`,
      );
      continue;
    }
    if (def?.detaljPanel === "forrad-val") {
      delar.push(`${rad.etikett}: ${formateraForradRad(rad)}`);
      continue;
    }
    if (def?.detaljPanel === "golv-val") {
      delar.push(`${rad.etikett}: ${formateraGolvRad(rad)}`);
      continue;
    }
    if (def?.detaljPanel === "lokal-komplement-val") {
      const ytskikt = data.lokalYtskiktRegister?.[rad.id] ?? [];
      const ytskiktText = formateraLokalYtskikt(ytskikt);
      const forradText =
        rad.id === "forrad" && rad.aktiv
          ? formateraForradRad(rad)
          : "";
      const inventarText =
        def.lokalTyp && data.lokalInventarRegister?.[rad.id]
          ? formateraLokalInventar(
              def.lokalTyp,
              data.lokalInventarRegister[rad.id],
              rad.värde,
            )
          : "";
      const combined = [ytskiktText, forradText, inventarText]
        .filter(Boolean)
        .join(" · ");
      if (combined) delar.push(`${rad.etikett}: ${combined}`);
      else if (rad.värde.trim()) {
        delar.push(`${rad.etikett}: ${rad.värde.trim()} rum`);
      }
      continue;
    }
    if (def?.detaljPanel === "lokal-inventar" && def.lokalTyp) {
      const inventar = data.lokalInventarRegister?.[rad.id] ?? [];
      const text = formateraLokalInventar(
        def.lokalTyp,
        inventar,
        rad.värde,
      );
      if (text) delar.push(`${rad.etikett}: ${text}`);
      continue;
    }
    if (def?.detaljPanel === "vvs-radiatorer") {
      const radData = data.vvsRadiatorRegister?.[rad.id];
      if (radData) {
        const text = formateraVvsRadiator(radData);
        if (text) delar.push(`${rad.etikett}: ${text}`);
      }
      continue;
    }
    if (def?.detaljPanel === "varmestammar-lista") {
      const poster = data.varmestammarRegister?.[rad.id] ?? [];
      const text = formateraVarmestamPoster(poster);
      if (text) delar.push(`${rad.etikett}: ${text}`);
      continue;
    }
    if (def?.detaljPanel === "stamventiler-lista") {
      const poster = data.stamventilerRegister?.[rad.id] ?? [];
      const text = formateraStamventilPoster(poster);
      if (text) delar.push(`${rad.etikett}: ${text}`);
      continue;
    }
    if (def?.detaljPanel === "p-platser-val") {
      const radData = data.pPlatserRegister?.[rad.id];
      if (radData) {
        const text = formateraPPlatser(radData);
        if (text) delar.push(`${rad.etikett}: ${text}`);
      }
      continue;
    }
    if (def?.detaljPanel === "vvs-stambyte") {
      const stamData = data.vvsStambyteRegister?.[rad.id];
      if (stamData) {
        const text = formateraVvsStambyte(stamData);
        if (text) delar.push(`${rad.etikett}: ${text}`);
      }
      continue;
    }
    if (def?.detaljPanel === "tvattstuga-lista") {
      const poster = data.tvattstugaRegister?.[rad.id] ?? [];
      const text = formateraTvattstugaPoster(poster);
      if (text) delar.push(text);
      continue;
    }
    if (def?.detaljPanel === "balkong-lista") {
      const poster = data.balkongRegister?.[rad.id] ?? [];
      const text = formateraBalkongPoster(poster);
      if (text) delar.push(`${rad.etikett}: ${text}`);
      continue;
    }
    if (def?.detaljPanel === "hiss-lista") {
      const poster = data.hissRegister?.[rad.id] ?? [];
      const text = formateraHissPoster(poster, data.egnaHissMarken ?? []);
      if (text) delar.push(`${rad.etikett}: ${text}`);
      continue;
    }
    if (def?.detaljPanel === "ventilation-extra-lista") {
      const poster = data.ventilationExtraRegister?.[rad.id] ?? [];
      const text = formateraVentilationExtraPoster(poster);
      if (text) delar.push(`${rad.etikett}: ${text}`);
      continue;
    }
    if (def?.detaljPanel === "brandskydd-sba") {
      const sba = data.brandskyddSbaRegister?.[rad.id];
      if (sba) {
        const text = formateraBrandskyddSba(sba);
        if (text) delar.push(`${rad.etikett}: ${text}`);
      }
      continue;
    }
    if (def?.detaljPanel === "brandskydd-branddorrar") {
      const branddorr = data.brandskyddBranddorrRegister?.[rad.id];
      if (branddorr) {
        const text = formateraBrandskyddBranddorrar(branddorr);
        if (text) delar.push(`${rad.etikett}: ${text}`);
      }
      continue;
    }
    if (def?.detaljPanel === "takfonster-lista") {
      const text = formateraTakfonsterData(
        normaliseraTakfonsterData(data.takfonsterRegister?.[rad.id]),
      );
      if (text) delar.push(`${rad.etikett}: ${text}`);
      continue;
    }
    if (def?.detaljPanel === "takterrass-val") {
      const terrass = data.takterrassRegister?.[rad.id];
      if (terrass) {
        const text = formateraTakterrass(terrass);
        if (text) delar.push(`${rad.etikett}: ${text}`);
      }
      continue;
    }
    if (def?.detaljPanel === "medlemstakterrass-val") {
      const terrass = data.medlemstakterrassRegister?.[rad.id];
      if (terrass) {
        const text = formateraMedlemstakterrass(terrass);
        if (text) delar.push(`${rad.etikett}: ${text}`);
      }
      continue;
    }
    const utförtInfo: string[] = [];
    if (rad.underhallUtförtAr?.trim()) {
      utförtInfo.push(`utfört ${rad.underhallUtförtAr.trim()}`);
    }
    if (rad.underhallEntreprenor?.trim()) {
      utförtInfo.push(rad.underhallEntreprenor.trim());
    }
    if (rad.underhallGarantiAr?.trim()) {
      utförtInfo.push(`garanti ${rad.underhallGarantiAr.trim()} år`);
    }
    if (rad.underhallAnsvarAr?.trim()) {
      utförtInfo.push(`ansvar ${rad.underhallAnsvarAr.trim()} år`);
    }
    const bes = underhallBesiktningEtikett(rad.underhallBesiktning);
    if (bes) utförtInfo.push(bes);
    if (utförtInfo.length > 0) {
      delar.push(`${rad.etikett}: ${utförtInfo.join(", ")}`);
      continue;
    }

    if (!rad.värde.trim()) continue;
    const enhet = måttenhetEtiketter[rad.måttenhet];
    delar.push(`${rad.etikett} ${rad.värde.trim()} ${enhet.enhet}`);
  }

  return delar.length > 0 ? delar.join(" · ") : "Ingen detaljering ännu";
}

/** Bakåtkompatibilitet — tidigare TakKomponentData */
export type TakKomponentData = {
  deltyper: string[];
  underkomponenter: {
    id: string;
    aktiv: boolean;
    måttenhet: Måttenhet;
    värde: string;
  }[];
};

export function migreraTakData(tak: TakKomponentData): KomponentDetaljData {
  const mall = hamtaKomponentMall("Tak");
  const egnaIds = tak.deltyper.filter(
    (id) => !mall.deltyper.some((d) => d.id === id),
  );
  return {
    valdaDeltyper: tak.deltyper,
    egnaDeltyper: egnaIds.map((id) => ({ id, etikett: id })),
    underkomponenter: tak.underkomponenter.map((rad) => {
      const def = mall.underkomponenter.find((u) => u.id === rad.id);
      return {
        id: rad.id,
        etikett: def?.etikett ?? rad.id,
        aktiv: rad.aktiv,
        måttenhet: rad.måttenhet,
        värde: rad.värde,
        ärEgen: !def,
      };
    }),
  };
}

export const skapaTomTakKomponent = (): KomponentDetaljData =>
  skapaTomKomponentDetalj("Tak");

export const formateraTakSammanfattning = (data: KomponentDetaljData): string =>
  formateraKomponentSammanfattning(data, hamtaKomponentMall("Tak"));
