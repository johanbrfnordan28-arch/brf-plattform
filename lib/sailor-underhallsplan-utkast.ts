/**
 * Utkast till Brf Sailors underhållsplan — fasta fakta om fastigheten.
 * Taxering/anskaffning ligger i SAILOR_VARDERING_UNDERLAG (visas inte för föreningen).
 * Yta och ekonomi enligt årsredovisning 2024 (2 756 kvm, 40 bostadsrätter).
 */

import { skapaTomBalkongPost } from "@/components/underhallsplan/balkonger";
import { BALKONGER_UNDERKOMPONENT_ID } from "@/components/underhallsplan/balkonger";
import { appliceraFarK3PaPlan } from "@/components/underhallsplan/far-k3-synk";
import {
  HISS_UNDERKOMPONENT_ID,
  skapaTomHissPost,
} from "@/components/underhallsplan/hissar";
import {
  KOMPLEMENT_BYGGNAD_NAMN,
  skapaTomKomponentDetalj,
  synkaUnderhallsplanState,
  type KomponentDetaljData,
} from "@/components/underhallsplan/komponentregister";
import { skapaTomPPlatserData } from "@/components/underhallsplan/p-platser";
import {
  skapaStandardSamfallighetsavgift,
  type Samfallighetsavgift,
} from "@/components/underhallsplan/samfallighetsavgift";
import { skapaTomVvsStambyteData } from "@/components/underhallsplan/vvs-stambyte";
import {
  skapaStandardBesiktningar,
  type Besiktning,
} from "@/components/underhallsplan/besiktningar";
import {
  SAILOR_PLAN_START_AR,
  SAILOR_VARDERING_UNDERLAG,
} from "@/lib/sailor-forening";

const P_PLATSER_ID = "p-platser";

export const SAILOR_PLAN_NOTERING = [
  "Utkast — JM-bygge 2013, Gustavsberg 1:395 (årsredovisning 2024).",
  "Planperiod från 2027.",
  "40 bostadsrätter, 2 756 kvm boyta, 50 badrum. Inga eldstäder (sotning ej aktuell).",
  "40 p-platser varav 20 med motorvärmare.",
  "Fasad: tunnputs — bättringsputs, fasadtvätt och ommålning planeras.",
  "Tak: bandlagt plåttak.",
  "36 balkonger. Hiss i respektive trapphus (nödtelefoner enligt AR).",
  "VVS: avloppsspolning och filmning som kostnadsfört underhåll (vart 10:e år).",
  "Ventilation: FX (frånluft med värmeåtervinning) — två aggregat på vind, Exhausto FX 15 (FF01, hus 25) och FX 22 (FF02, hus 27–29). Inst.år 2013. OVK godkänd 2026-03-02, nästa 2032-03-02 (Airteam).",
  "Stort cykelrum och stort miljörum (soprum) där undercentral för fjärrvärme finns.",
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
  const planStartAr = SAILOR_PLAN_START_AR;

  const fasadBas = aktivera("Fasad", ["fasadmaterial", "dorrar"], (r) =>
    r.id === "fasadmaterial"
      ? {
          värde: "1800",
          underhallNastaAr: String(planStartAr),
          underhallIntervallAr: "12",
        }
      : {},
  );

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
              titel: "Bättringsputs och ommålning",
              nastaAr: String(planStartAr),
              intervallAr: "12",
              atgarder: ["putsreparation", "ommalning", "fasadtvatt"],
            },
          ],
        },
      },
    },
    Fönster: aktivera("Fönster", ["fonster"]),
    Tak: {
      ...aktivera("Tak", ["takyta"], () => ({
        värde: "950",
        underhallNastaAr: String(planStartAr + 8),
        underhallIntervallAr: "25",
      })),
      valdaDeltyper: ["bandlaggd-plat"],
    },
    Trapphus: {
      ...aktivera("Trapphus", ["lagenhetsdorrar", HISS_UNDERKOMPONENT_ID], (r) =>
        r.id === "lagenhetsdorrar"
          ? { värde: "40" }
          : { värde: "3" },
      ),
      hissRegister: {
        [HISS_UNDERKOMPONENT_ID]: [
          { ...skapaTomHissPost("Hiss hus 25"), marke: "kone", hissTyp: "motvikt" },
          { ...skapaTomHissPost("Hiss hus 27"), marke: "kone", hissTyp: "motvikt" },
          { ...skapaTomHissPost("Hiss hus 29"), marke: "kone", hissTyp: "motvikt" },
        ],
      },
    },
    VVS: {
      ...aktivera(
        "VVS",
        ["stambyte", "spolning-avlopp", "filmning-avlopp"],
        (r) => {
          if (r.id === "stambyte") {
            return {
              underhallNastaAr: String(planStartAr + 25),
              underhallIntervallAr: "50",
            };
          }
          if (r.id === "spolning-avlopp") {
            return {
              värde: "3",
              underhallNastaAr: String(planStartAr),
              underhallIntervallAr: "10",
              underhallPrisEnhet: "total",
              underhallKostnadKr: "45000",
            };
          }
          if (r.id === "filmning-avlopp") {
            return {
              värde: "3",
              underhallNastaAr: String(planStartAr),
              underhallIntervallAr: "10",
              underhallPrisEnhet: "total",
              underhallKostnadKr: "28000",
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
      ...aktivera("Värmecentral", ["undercentral", "varmestammar"], (r) =>
        r.id === "undercentral"
          ? {
              värde: "1",
              // Undercentral i miljörum
            }
          : {},
      ),
      valdaDeltyper: ["fjarrvarme"],
    },
    Ventilation: {
      ...aktivera("Ventilation", ["aggregat"], () => ({
        värde: "2",
        underhallNastaAr: "2032",
        underhallIntervallAr: "6",
      })),
      // OVK 2026: FX — frånluft + värmeåtervinning (inte FTX)
      valdaDeltyper: ["fx"],
    },
    Elcentral: aktivera("Elcentral", ["central"], () => ({ värde: "3" })),
    Balkonger: {
      ...aktivera("Balkonger", [BALKONGER_UNDERKOMPONENT_ID], () => ({
        värde: "36",
      })),
      valdaDeltyper: ["betong"],
      balkongRegister: {
        [BALKONGER_UNDERKOMPONENT_ID]: [
          {
            ...skapaTomBalkongPost("36 utvändiga balkonger", "utvandig-balkong"),
            konstruktion: "helgjuten",
            rakeMaterial: "pulverlackad-smidesjarn",
            rakeLopmeter: "108",
            golvMaterial: "betong",
            golvKvm: "180",
            delar: [
              { delId: "balkongplatta", aktiv: true, mangd: "180" },
              { delId: "tatskikt", aktiv: true, mangd: "180" },
              { delId: "sockel", aktiv: true, mangd: "72" },
              { delId: "avvattning", aktiv: true, mangd: "36" },
            ],
          },
        ],
      },
    },
    "Styr och övervakning": aktivera(
      "Styr och övervakning",
      ["system"],
      () => ({ värde: "1" }),
    ),
    [KOMPLEMENT_BYGGNAD_NAMN]: {
      ...aktivera(
        KOMPLEMENT_BYGGNAD_NAMN,
        ["cykelrum", "soprum", P_PLATSER_ID],
        (r) =>
          r.id === P_PLATSER_ID
            ? { värde: "40" }
            : { värde: "1" },
      ),
      valdaDeltyper: ["mark"],
      pPlatserRegister: {
        [P_PLATSER_ID]: {
          ...skapaTomPPlatserData(),
          motordvarmare: "20",
          "p-plats": "20",
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

  return {
    activeComponents: synced.activeComponents,
    komponentDetaljer: synced.register,
    samfallighetsavgift: samfallighet,
    besiktningar: byggSailorBesiktningar(),
    planNotering: SAILOR_PLAN_NOTERING,
    krPerKvmAr: 450,
  };
}
