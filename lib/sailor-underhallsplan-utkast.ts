/**
 * Utkast till Brf Sailors underhållsplan — fasta fakta om fastigheten.
 * Taxering/anskaffning ligger i SAILOR_VARDERING_UNDERLAG (visas inte för föreningen).
 */

import { skapaTomBalkongPost } from "@/components/underhallsplan/balkonger";
import { BALKONGER_UNDERKOMPONENT_ID } from "@/components/underhallsplan/balkonger";
import { appliceraFarK3PaPlan } from "@/components/underhallsplan/far-k3-synk";
import {
  KOMPLEMENT_BYGGNAD_NAMN,
  skapaTomKomponentDetalj,
  synkaUnderhallsplanState,
  type KomponentDetaljData,
} from "@/components/underhallsplan/komponentregister";
import {
  skapaStandardSamfallighetsavgift,
  type Samfallighetsavgift,
} from "@/components/underhallsplan/samfallighetsavgift";
import { skapaTomVvsStambyteData } from "@/components/underhallsplan/vvs-stambyte";
import {
  SAILOR_VARDERING_UNDERLAG,
} from "@/lib/sailor-forening";

export const SAILOR_PLAN_NOTERING = [
  "Utkast — JM-bygge 2013.",
  "40 lägenheter, 50 badrum.",
  "Fasad: tunnputs i dåligt skick — planera bättringsputs och ommålning.",
  "Tak: bandlagt plåttak.",
  "36 balkonger.",
  "Stort cykelrum och stort miljörum (soprum) där undercentral för fjärrvärme finns.",
  "Individuell mätning av vatten (och avlopp/debitering per lägenhet).",
  "Gemensam gård sköts av samfällighet — ingår inte i föreningens egna markåtgärder.",
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

/** Bygger Sailors komponentregister + samfällighet för underhållsplanen. */
export function byggSailorKomponentUtkast(): {
  activeComponents: string[];
  komponentDetaljer: Record<string, KomponentDetaljData>;
  samfallighetsavgift: Samfallighetsavgift;
  planNotering: string;
  krPerKvmAr: number;
} {
  const planStartAr = new Date().getFullYear();

  const fasadBas = aktivera("Fasad", ["fasadmaterial", "dorrar"], (r) =>
    r.id === "fasadmaterial"
      ? {
          värde: "1800",
          underhallNastaAr: String(planStartAr + 1),
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
              nastaAr: String(planStartAr + 1),
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
    Trapphus: aktivera("Trapphus", ["lagenhetsdorrar"], () => ({
      värde: "40",
    })),
    VVS: {
      ...aktivera("VVS", ["stambyte"], () => ({
        underhallNastaAr: String(planStartAr + 25),
        underhallIntervallAr: "50",
      })),
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
      ...aktivera("Ventilation", ["aggregat"], () => ({ värde: "3" })),
      valdaDeltyper: ["ftx"],
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
      ...aktivera(KOMPLEMENT_BYGGNAD_NAMN, ["cykelrum", "soprum"], () => ({
        värde: "1",
      })),
      valdaDeltyper: ["mark"],
    },
  };

  const far = appliceraFarK3PaPlan(
    [...SAILOR_AKTIVA_KOMPONENTER],
    registerIn,
    {
      // Hiss nämns inte — aktivera bara balkong/styr som finns i utkastet
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
    "Gemensam gård sköts av samfällighet — snöröjning, grönytor och gemensamma ytor ingår där.";
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
    planNotering: SAILOR_PLAN_NOTERING,
    krPerKvmAr: 450,
  };
}
