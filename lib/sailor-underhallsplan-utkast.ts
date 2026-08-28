/**
 * Utkast till Brf Sailors underhållsplan — fasta fakta om fastigheten.
 * Taxering/anskaffning ligger i SAILOR_VARDERING_UNDERLAG (visas inte för föreningen).
 * Yta och ekonomi enligt årsredovisning 2024 (2 756 kvm, 40 bostadsrätter).
 */

import { skapaTomBalkongPost } from "@/components/underhallsplan/balkonger";
import { BALKONGER_UNDERKOMPONENT_ID } from "@/components/underhallsplan/balkonger";
import { beraknaBalkongListaPris } from "@/components/underhallsplan/balkong-pris";
import { SBA_UNDERKOMPONENT_ID } from "@/components/underhallsplan/brandskydd";
import { appliceraFarK3PaPlan } from "@/components/underhallsplan/far-k3-synk";
import {
  skapaTomDorrPost,
  skapaTomFonsterPost,
} from "@/components/underhallsplan/fonster-dorrar";
import { beraknaFonsterDorrListaPris } from "@/components/underhallsplan/fonster-dorr-pris";
import {
  HISS_UNDERKOMPONENT_ID,
  skapaTomHissPost,
} from "@/components/underhallsplan/hissar";
import { beraknaHissListaPris } from "@/components/underhallsplan/hiss-pris";
import {
  KOMPLEMENT_BYGGNAD_NAMN,
  skapaTomKomponentDetalj,
  synkaUnderhallsplanState,
  type KomponentDetaljData,
} from "@/components/underhallsplan/komponentregister";
import { skapaTomLokalInventar } from "@/components/underhallsplan/lokal-inventar";
import {
  skapaTomLokalYtskikt,
  type LokalYtskiktDelRad,
} from "@/components/underhallsplan/lokal-ytskikt";
import { skapaTomPPlatserData } from "@/components/underhallsplan/p-platser";
import {
  beraknaRekommenderadKrPerKvmAr,
  summaPlaneradeInvesteringar,
} from "@/components/underhallsplan/plan-budget-sammanfattning";
import { normaliseraPlanKostnader } from "@/components/underhallsplan/plan-kostnader";
import {
  standardPlaninstallningar,
  standardPlanLangdAr,
} from "@/components/underhallsplan/planinstallningar";
import { RIKT_VENTILATION_UNDERKOMPONENT_KR } from "@/components/underhallsplan/riktpriser";
import {
  skapaStandardSamfallighetsavgift,
  type Samfallighetsavgift,
} from "@/components/underhallsplan/samfallighetsavgift";
import { skapaTomVvsStambyteData } from "@/components/underhallsplan/vvs-stambyte";
import {
  skapaStandardBesiktningar,
  type Besiktning,
} from "@/components/underhallsplan/besiktningar";
import { samlaAllaUnderhallAtgarder } from "@/components/underhallsplan/underhall-budget";
import { nastaArFranByggar } from "@/components/underhallsplan/underhall-plan-ar";
import {
  SAILOR_BYGGAR,
  SAILOR_PLAN_START_AR,
  SAILOR_VARDERING_UNDERLAG,
} from "@/lib/sailor-forening";

const P_PLATSER_ID = "p-platser";
const SAILOR_BOAREA_M2 = 2756;
/** Bandlagt plåttak — planeringsriktpris kr/m² för omläggning (−25 % mot tidigare). */
const SAILOR_TAK_RIKT_KR_PER_KVM = 1_350;
/** Större fasadförnyelse (K3) — kr/m², utöver löpande puts/målning. */
const SAILOR_FASAD_FORNYELSE_KR_PER_KVM = 4_000;
/** Stambyte inkl. badrum — 300 000 kr per badrum. */
const SAILOR_STAMBYTE_KR_PER_BADRUM = 300_000;
/** Elcentraler — tre hus (−25 % mot tidigare 1 050 tkr). */
const SAILOR_ELCENTRAL_ENTREPRENAD_KR = 787_500;

/** Nästa åtgärdsår = byggår + intervall (t.ex. 2013+30 → 2043). */
function sailorNastaAr(intervallAr: number): string {
  return String(nastaArFranByggar(SAILOR_BYGGAR, intervallAr));
}

export const SAILOR_PLAN_NOTERING = [
  "JM-bygge 2013, Gustavsberg 1:395.",
  "Planperiod från 2027.",
  "40 bostadsrätter, 2 756 kvm boyta, tomtyta 4 688 kvm, 50 badrum. Inga eldstäder (sotning ej aktuell).",
  "40 p-platser varav 10 med motorvärmare och 10 med elbilsladdning — totalt 10 stolpar med två uttag på varje (installerade 2026).",
  "Fasad: tunnputs — bättringsputs och ommålning planeras 2027 som investering i underhållsplanen.",
  "Tak: bandlagt plåttak.",
  "36 balkonger. Hiss i respektive trapphus (nödtelefoner enligt AR).",
  "VVS: avloppsspolning utförd 2022 (44 447 kr inkl. moms), intervall 10 år; filmning som periodiskt underhåll (kostnadsförs direkt).",
  "Ventilation: FX (frånluft med värmeåtervinning) — två aggregat på vind, Exhausto FX 15 (FF01, hus 25) och FX 22 (FF02, hus 27–29). Inst.år 2013. OVK godkänd 2026-03-02, nästa 2032-03-02 (Airteam). Filterbyte 1 gång/år.",
  "Energideklaration utförd 2026. Offert radonmätning finns.",
  "Två oisolerade komplementbyggnader i markplan: cykelförråd och soprum (miljörum) med separat rum för fjärrvärmeundercentral. Plåttak, träväggar och golv av släta betongplattor. Soprummet har sopkärl samt vatten och avlopp för spolning av ytan.",
  "Individuell mätning av vatten (och avlopp/debitering per lägenhet).",
  "Gemensam gård sköts av Farstadals samfällighetsförening — ingår inte i föreningens egna markåtgärder.",
].join(" ");

const SAILOR_AKTIVA_KOMPONENTER = [
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
  "Brandskydd",
  "Styr och övervakning",
  KOMPLEMENT_BYGGNAD_NAMN,
] as const;

function aktivera(
  namn: string,
  ids: string[],
  extra?: (rad: { id: string }) => Record<string, unknown>,
): KomponentDetaljData {
  const tom = skapaTomKomponentDetalj(namn);
  return {
    ...tom,
    underkomponenter: tom.underkomponenter.map((r) => {
      if (!ids.includes(r.id)) return r;
      return { ...r, aktiv: true, ...(extra?.(r) ?? {}) };
    }),
  };
}

/** Oisolerad komplementbyggnad: plåttak, träväggar, släta betongplattor. */
function sailorKomplementYtskikt(): LokalYtskiktDelRad[] {
  return skapaTomLokalYtskikt().map((rad) => {
    if (rad.delId === "golv") {
      return {
        ...rad,
        aktiv: true,
        materialId: "betongplattor",
        atgardId: "underhall",
        kvm: "",
      };
    }
    if (rad.delId === "vaggar") {
      return {
        ...rad,
        aktiv: true,
        materialId: "tra",
        atgardId: "malning",
        kvm: "",
      };
    }
    if (rad.delId === "tak") {
      return {
        ...rad,
        aktiv: true,
        materialId: "bandlagd-plat",
        atgardId: "underhall",
        kvm: "",
      };
    }
    return rad;
  });
}

function sailorSoprumInventar() {
  return skapaTomLokalInventar("soprum").map((rad) => {
    if (rad.delId === "sortering") {
      return { ...rad, aktiv: true, antal: "1" };
    }
    if (rad.delId === "vatten-avlopp") {
      return { ...rad, aktiv: true, antal: "1" };
    }
    if (rad.delId === "golvbrunn") {
      return { ...rad, aktiv: true, antal: "1" };
    }
    if (rad.delId === "undercentral-rum") {
      return { ...rad, aktiv: true, antal: "1" };
    }
    if (rad.delId === "diskbank") {
      return { ...rad, aktiv: true, antal: "1" };
    }
    return rad;
  });
}

function sailorCykelforradInventar() {
  return skapaTomLokalInventar("cykelforrad").map((rad) => {
    if (rad.delId === "cykelstall" || rad.delId === "belysning") {
      return { ...rad, aktiv: true, antal: "1" };
    }
    return rad;
  });
}

function byggSailorBesiktningar(): Besiktning[] {
  return skapaStandardBesiktningar().map((b) => {
    if (b.id === "ovk") {
      return {
        ...b,
        aktiv: true,
        intervallAr: 6,
        /** OVK-protokoll 2026-03-02 — nästa ordinarie 2032-03-02 */
        senastUtförtAr: 2026,
        nastaBesiktningAr: 2032,
        /** Offert/utfört: 550 kr/lgh. */
        kostnadPerLagenhetKr: 550,
        senastKostnadKr: 550 * 40,
      };
    }
    if (b.id === "energideklaration") {
      return {
        ...b,
        aktiv: true,
        intervallAr: 10,
        senastUtförtAr: 2026,
        nastaBesiktningAr: 2036,
        kostnadFastKr: 12_000,
      };
    }
    if (b.id === "radon") {
      return {
        ...b,
        aktiv: true,
        intervallAr: 10,
        /** Offert finns — planeras i planstartåret. */
        nastaBesiktningAr: SAILOR_PLAN_START_AR,
        kostnadFastKr: 14_865,
      };
    }
    if (b.id === "hiss") {
      return {
        ...b,
        aktiv: true,
        antalHissar: 3,
        intervallAr: 1,
      };
    }
    if (b.id === "sba") {
      return {
        ...b,
        aktiv: true,
        kostnadFastKr: 0,
        sbaInkluderaBrandkonsult: true,
        sbaBrandkonsultIntervallAr: 5,
        /** 15 000 kr inkl. moms — vart 5:e år. */
        sbaBrandkonsultKostnadKr: 15_000,
        kostnadInklMomsKr: 15_000,
        /** 2013+5 → 2018; första i planperioden 2028. */
        sbaNastaBrandkonsultAr: 2028,
        nastaBesiktningAr: 2028,
      };
    }
    if (b.id === "sotning") {
      return {
        ...b,
        aktiv: false,
        antalEldstäder: 0,
        antalLagenheterMedEldstad: 0,
        sotningInternDebitering: false,
      };
    }
    return b;
  });
}

/** Bygger Sailors komponentregister + samfällighet för underhållsplanen. */
export function byggSailorKomponentUtkast(): {
  activeComponents: string[];
  komponentDetaljer: Record<string, KomponentDetaljData>;
  samfallighetsavgift: Samfallighetsavgift;
  besiktningar: Besiktning[];
  planNotering: string;
  krPerKvmAr: number;
} {
  const sailorHissPoster = [
    {
      ...skapaTomHissPost("Hiss hus 25"),
      marke: "kone" as const,
      hissTyp: "motvikt" as const,
      /** Full modernisering KONE motvikt — över generellt riktpris 950 tkr. */
      uppskattadModerniseringKr: "1350000",
    },
    {
      ...skapaTomHissPost("Hiss hus 27"),
      marke: "kone" as const,
      hissTyp: "motvikt" as const,
      uppskattadModerniseringKr: "1350000",
    },
    {
      ...skapaTomHissPost("Hiss hus 29"),
      marke: "kone" as const,
      hissTyp: "motvikt" as const,
      uppskattadModerniseringKr: "1350000",
    },
  ];
  const sailorHissEntreprenadKr = beraknaHissListaPris(sailorHissPoster);

  const sailorBalkongPoster = [
    {
      ...skapaTomBalkongPost("36 utvändiga balkonger", "utvandig-balkong"),
      konstruktion: "helgjuten" as const,
      rakeMaterial: "pulverlackad-smidesjarn" as const,
      rakeLopmeter: "108",
      golvMaterial: "betong",
      golvKvm: "180",
      delar: [
        { delId: "balkongplatta" as const, aktiv: true, mangd: "180" },
        { delId: "tatskikt" as const, aktiv: true, mangd: "180" },
        { delId: "sockel" as const, aktiv: true, mangd: "72" },
        { delId: "avvattning" as const, aktiv: true, mangd: "36" },
      ],
      /** Egna enhetspriser — under generella riktpris (ca −25 %). */
      priser: {
        balkongplatta: "3100",
        tatskikt: "1000",
        fallspackel: "",
        sockel: "1800",
        "droppnasa-kantbleck": "",
        avvattning: "2400",
        rake: "6200",
        golv: "2000",
        tillbyggdFast: "",
      },
    },
  ];
  const sailorBalkongEntreprenadKr =
    beraknaBalkongListaPris(sailorBalkongPoster).totaltKr;

  const aggregatRikt =
    RIKT_VENTILATION_UNDERKOMPONENT_KR.aggregat?.prisKr ?? 450_000;
  const sailorAggregatEntreprenadKr = Math.round(2 * aggregatRikt);
  const sailorTakEntreprenadKr = Math.round(950 * SAILOR_TAK_RIKT_KR_PER_KVM);
  const sailorFasadFornyelseKr = Math.round(
    1_800 * SAILOR_FASAD_FORNYELSE_KR_PER_KVM,
  );
  const sailorStambyteEntreprenadKr = Math.round(
    50 * SAILOR_STAMBYTE_KR_PER_BADRUM,
  );

  const sailorFonsterPoster = [
    {
      ...skapaTomFonsterPost(),
      modulmatt: "blandade",
      material: "alu-kldd" as const,
      antal: "200",
      enhetsprisKr: "18000",
    },
  ];
  const sailorFonsterEntreprenadKr = beraknaFonsterDorrListaPris(
    sailorFonsterPoster,
    false,
  ).totaltKr;

  const sailorYtterDorrPoster = [
    {
      ...skapaTomDorrPost(),
      modulmatt: "entré",
      dorrMaterial: "aluminium" as const,
      antal: "9",
      enhetsprisKr: "28000",
    },
  ];
  const sailorYtterDorrEntreprenadKr = beraknaFonsterDorrListaPris(
    sailorYtterDorrPoster,
    true,
  ).totaltKr;

  /** 40 lägenhetsdörrar — planeringspris byte/modernisering. */
  const sailorLagenhetsDorrEntreprenadKr = 40 * 24_000;

  const fasadBas = aktivera("Fasad", ["fasadmaterial", "dorrar"], (r) => {
    if (r.id === "fasadmaterial") {
      return {
        värde: "1800",
        /** Större fasadförnyelse — 2013+30 → 2043. Puts/målning i tillfällen. */
        underhallNastaAr: sailorNastaAr(30),
        underhallIntervallAr: "30",
        underhallPrisEnhet: "total",
        underhallKostnadKr: String(sailorFasadFornyelseKr),
        underhallUtförtAr: String(SAILOR_BYGGAR),
      };
    }
    if (r.id === "dorrar") {
      return {
        värde: "9",
        underhallNastaAr: sailorNastaAr(35),
        underhallIntervallAr: "35",
        underhallPrisEnhet: "total",
        underhallKostnadKr: String(sailorYtterDorrEntreprenadKr),
        underhallUtförtAr: String(SAILOR_BYGGAR),
      };
    }
    return {};
  });

  const registerIn: Record<string, KomponentDetaljData> = {
    Stomme: {
      ...aktivera("Stomme", ["stomme"], () => ({ värde: "2756" })),
      valdaDeltyper: ["betong"],
    },
    Fasad: {
      ...fasadBas,
      valdaDeltyper: ["tunnputs"],
      fasadAtgardRegister: {
        fasadmaterial: {
          tillfallen: [
            {
              id: "sailor-fasad-1",
              titel: "Bättringsputs och ommålning (tunnputs)",
              /** Planstart 2027 — räknas som investering (som stambyte/fönsterbyte). */
              nastaAr: String(SAILOR_PLAN_START_AR),
              intervallAr: "12",
              atgarder: ["putsreparation", "ommalning"],
              direktkostnad: false,
            },
          ],
        },
      },
      /**
       * Putsreparation + ommålning 2027 — investering i planen (ingår i
       * planerade investeringar / avsättning), inte kostnadsfört underhåll.
       * Totalt 1 100 000 kr per tillfälle (puts 420 tkr + ommålning 680 tkr).
       */
      fasadAtgardPrisRegister: {
        fasadmaterial: {
          putsreparation: {
            prisEnhet: "total",
            enhetsprisKr: "420000",
            mangd: "1800",
            totalKr: "420000",
          },
          ommalning: {
            prisEnhet: "total",
            enhetsprisKr: "680000",
            mangd: "1800",
            totalKr: "680000",
          },
        },
      },
      fonsterDorrRegister: {
        dorrar: sailorYtterDorrPoster,
      },
    },
    Fönster: {
      ...aktivera("Fönster", ["fonster"], () => ({
        värde: "200",
        underhallNastaAr: sailorNastaAr(40),
        underhallIntervallAr: "40",
        underhallPrisEnhet: "total",
        underhallKostnadKr: String(sailorFonsterEntreprenadKr),
        underhallUtförtAr: String(SAILOR_BYGGAR),
      })),
      valdaDeltyper: ["alu-kldd"],
      fonsterDorrRegister: {
        fonster: sailorFonsterPoster,
      },
    },
    Tak: {
      ...aktivera("Tak", ["takyta"], () => ({
        värde: "950",
        underhallNastaAr: sailorNastaAr(25),
        underhallIntervallAr: "25",
        underhallPrisEnhet: "total",
        underhallKostnadKr: String(sailorTakEntreprenadKr),
        underhallUtförtAr: String(SAILOR_BYGGAR),
      })),
      valdaDeltyper: ["bandlaggd-plat"],
    },
    Trapphus: {
      ...aktivera("Trapphus", ["lagenhetsdorrar", HISS_UNDERKOMPONENT_ID], (r) =>
        r.id === "lagenhetsdorrar"
          ? {
              värde: "40",
              underhallNastaAr: sailorNastaAr(40),
              underhallIntervallAr: "40",
              underhallPrisEnhet: "total",
              underhallKostnadKr: String(sailorLagenhetsDorrEntreprenadKr),
              underhallUtförtAr: String(SAILOR_BYGGAR),
            }
          : {
              värde: "3",
              underhallNastaAr: sailorNastaAr(40),
              underhallIntervallAr: "40",
              underhallPrisEnhet: "total",
              underhallKostnadKr: String(sailorHissEntreprenadKr),
              underhallUtförtAr: String(SAILOR_BYGGAR),
            },
      ),
      hissRegister: {
        [HISS_UNDERKOMPONENT_ID]: sailorHissPoster,
      },
    },
    VVS: {
      ...aktivera(
        "VVS",
        ["stambyte", "spolning-avlopp", "filmning-avlopp"],
        (r) => {
          if (r.id === "stambyte") {
            return {
              underhallNastaAr: sailorNastaAr(50),
              underhallIntervallAr: "50",
              underhallPrisEnhet: "total",
              underhallKostnadKr: String(sailorStambyteEntreprenadKr),
              underhallUtförtAr: String(SAILOR_BYGGAR),
            };
          }
          if (r.id === "spolning-avlopp") {
            // 44 447 kr inkl. moms → exkl. 35 558, moms 8 889 (25 %)
            return {
              värde: "3",
              underhallUtförtAr: "2022",
              underhallNastaAr: "2032",
              underhallIntervallAr: "10",
              underhallPrisEnhet: "total",
              underhallKostnadKr: "35558",
              underhallKostnadInklMomsKr: "44447",
              underhallMomsAvdragenKr: "8889",
            };
          }
          if (r.id === "filmning-avlopp") {
            return {
              värde: "3",
              underhallNastaAr: sailorNastaAr(10),
              underhallIntervallAr: "10",
              underhallPrisEnhet: "total",
              underhallKostnadKr: "28000",
              underhallUtförtAr: String(SAILOR_BYGGAR),
            };
          }
          return {};
        },
      ),
      valdaDeltyper: ["fjarrvarme"],
      vvsStambyteRegister: {
        stambyte: {
          ...skapaTomVvsStambyteData(),
          antalBadrum: "50",
          vattenMaterial: "pex",
          avloppMaterial: "plast-ljudklassad",
        },
      },
    },
    Värmecentral: {
      ...aktivera("Värmecentral", ["undercentral", "varmestammar"], (r) => {
        if (r.id === "undercentral") {
          return {
            värde: "1",
            underhallNastaAr: sailorNastaAr(50),
            underhallIntervallAr: "50",
            underhallPrisEnhet: "total",
            underhallKostnadKr: "1200000",
            underhallUtförtAr: String(SAILOR_BYGGAR),
          };
        }
        if (r.id === "varmestammar") {
          return {
            underhallNastaAr: sailorNastaAr(40),
            underhallIntervallAr: "40",
            underhallPrisEnhet: "total",
            underhallKostnadKr: "2800000",
            underhallUtförtAr: String(SAILOR_BYGGAR),
          };
        }
        return {};
      }),
      valdaDeltyper: ["fjarrvarme"],
    },
    Ventilation: {
      ...aktivera("Ventilation", ["aggregat", "filterbyte"], (r) => {
        if (r.id === "aggregat") {
          return {
            värde: "2",
            underhallNastaAr: sailorNastaAr(20),
            underhallIntervallAr: "20",
            underhallPrisEnhet: "total",
            underhallKostnadKr: String(sailorAggregatEntreprenadKr),
            underhallUtförtAr: String(SAILOR_BYGGAR),
          };
        }
        if (r.id === "filterbyte") {
          // 36 859 kr inkl. moms → exkl. 29 487, moms 7 372 (25 %)
          return {
            värde: "2",
            underhallNastaAr: String(SAILOR_PLAN_START_AR),
            underhallIntervallAr: "1",
            underhallPrisEnhet: "total",
            underhallKostnadKr: "29487",
            underhallKostnadInklMomsKr: "36859",
            underhallMomsAvdragenKr: "7372",
          };
        }
        return {};
      }),
      // OVK 2026: FX — frånluft + värmeåtervinning (inte FTX)
      valdaDeltyper: ["fx"],
    },
    Elcentral: aktivera("Elcentral", ["central"], () => ({
      värde: "3",
      underhallNastaAr: sailorNastaAr(50),
      underhallIntervallAr: "50",
      underhallPrisEnhet: "total",
      underhallKostnadKr: String(SAILOR_ELCENTRAL_ENTREPRENAD_KR),
      underhallUtförtAr: String(SAILOR_BYGGAR),
    })),
    Balkonger: {
      ...aktivera("Balkonger", [BALKONGER_UNDERKOMPONENT_ID], () => ({
        värde: "36",
        underhallNastaAr: sailorNastaAr(25),
        underhallIntervallAr: "25",
        underhallPrisEnhet: "total",
        underhallKostnadKr: String(sailorBalkongEntreprenadKr),
        underhallUtförtAr: String(SAILOR_BYGGAR),
      })),
      valdaDeltyper: ["betong"],
      balkongRegister: {
        [BALKONGER_UNDERKOMPONENT_ID]: sailorBalkongPoster,
      },
    },
    Brandskydd: {
      ...aktivera("Brandskydd", [SBA_UNDERKOMPONENT_ID], () => ({
        värde: "1",
      })),
      valdaDeltyper: ["sba"],
    },
    "Styr och övervakning": aktivera("Styr och övervakning", ["system"], () => ({
      värde: "1",
      underhallNastaAr: sailorNastaAr(40),
      underhallIntervallAr: "40",
      underhallPrisEnhet: "total",
      underhallKostnadKr: "500000",
      underhallUtförtAr: String(SAILOR_BYGGAR),
    })),
    [KOMPLEMENT_BYGGNAD_NAMN]: {
      ...aktivera(
        KOMPLEMENT_BYGGNAD_NAMN,
        ["cykelrum", "soprum", P_PLATSER_ID],
        (r) => {
          if (r.id === P_PLATSER_ID) {
            // 10 laddstolpar: 436 750 kr inkl. moms → exkl. 349 400, moms 87 350
            return {
              värde: "40",
              installationskostnadKr: "349400",
              underhallKostnadInklMomsKr: "436750",
              underhallMomsAvdragenKr: "87350",
            };
          }
          if (r.id === "cykelrum") {
            return {
              värde: "1",
              avskrivningAr: "40",
              installationskostnadKr: "480000",
              underhallNastaAr: sailorNastaAr(12),
              underhallIntervallAr: "12",
              underhallPrisEnhet: "total",
              underhallKostnadKr: "85000",
              underhallUtförtAr: String(SAILOR_BYGGAR),
            };
          }
          if (r.id === "soprum") {
            return {
              värde: "1",
              avskrivningAr: "40",
              installationskostnadKr: "620000",
              underhallNastaAr: sailorNastaAr(12),
              underhallIntervallAr: "12",
              underhallPrisEnhet: "total",
              underhallKostnadKr: "95000",
              underhallUtförtAr: String(SAILOR_BYGGAR),
            };
          }
          return { värde: "1" };
        },
      ),
      valdaDeltyper: ["mark"],
      lokalYtskiktRegister: {
        cykelrum: sailorKomplementYtskikt(),
        soprum: sailorKomplementYtskikt(),
      },
      lokalInventarRegister: {
        cykelrum: sailorCykelforradInventar(),
        soprum: sailorSoprumInventar(),
      },
      pPlatserRegister: {
        [P_PLATSER_ID]: {
          ...skapaTomPPlatserData(),
          motordvarmare: "10",
          "p-plats": "20",
          elbilsladdare: "10",
        },
      },
    },
  };

  const far = appliceraFarK3PaPlan(
    [...SAILOR_AKTIVA_KOMPONENTER],
    registerIn,
    {
      aktiveraVillkorliga: false,
      skrivOverAvskrivning: true,
      varderingsUnderlag: SAILOR_VARDERING_UNDERLAG,
      skrivOverInstallationskostnad: true,
    },
  );
  const synced = synkaUnderhallsplanState(
    far.activeComponents,
    far.komponentDetaljer,
  );

  const samfallighet = skapaStandardSamfallighetsavgift();
  samfallighet.aktiv = true;
  samfallighet.arligAvgiftKr = 85_000;
  samfallighet.notering =
    "Farstadals samfällighetsförening — snöröjning, grönytor och gemensamma ytor ingår där.";
  for (const post of samfallighet.poster) {
    if (
      ["tradgard", "skotsel", "snorojning", "vagunderhall", "belysning"].includes(
        post.id,
      )
    ) {
      post.vald = true;
    }
  }

  const planKostnader = normaliseraPlanKostnader({
    ...standardPlaninstallningar(),
    planStartAr: String(SAILOR_PLAN_START_AR),
    planLangdAr: String(standardPlanLangdAr),
  });
  const underhallAtgarder = samlaAllaUnderhallAtgarder(
    synced.activeComponents,
    synced.register,
    [],
    SAILOR_PLAN_START_AR,
    standardPlanLangdAr,
    planKostnader,
  );
  const summaInvesteringKr = summaPlaneradeInvesteringar(
    underhallAtgarder,
    SAILOR_PLAN_START_AR,
    standardPlanLangdAr,
  );
  /** Jämn avsättning = periodens investeringar (inkl. upphandling/projektledning) / (bostadsyta × planlängd). */
  const krPerKvmAr =
    beraknaRekommenderadKrPerKvmAr(
      summaInvesteringKr,
      SAILOR_BOAREA_M2,
      standardPlanLangdAr,
    ) ?? 0;

  return {
    activeComponents: synced.activeComponents,
    komponentDetaljer: synced.register,
    samfallighetsavgift: samfallighet,
    besiktningar: byggSailorBesiktningar(),
    planNotering: SAILOR_PLAN_NOTERING,
    krPerKvmAr,
  };
}
