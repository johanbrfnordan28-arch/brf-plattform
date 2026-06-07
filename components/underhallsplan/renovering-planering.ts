import {
  beraknaArligIndexFaktor,
  beraknaUpphandlingOchProjektledning,
  type PlanKostnaderNormaliserade,
} from "@/components/underhallsplan/plan-kostnader";
import { hamtaPlanSlutAr } from "@/components/underhallsplan/planinstallningar";
import {
  hamtaIntervallForTyp,
  klassificeraRenovering,
  type RenoveringAtgardTyp,
} from "@/components/underhallsplan/renovering-klassificering";
import {
  fordelRenovering,
  type RenoveringFordelningKontext,
} from "@/components/underhallsplan/renovering-fordelning";
import type { UtfördRenovering } from "@/components/underhallsplan/renoveringar";
import type { UnderhallAtgard } from "@/components/underhallsplan/underhall-budget";

export type { RenoveringAtgardTyp, RenoveringFordelningKontext };
export { klassificeraRenovering };

import { STANDARD_BYGGINDEX_ARLIG } from "@/components/underhallsplan/plan-kostnader";

export { STANDARD_BYGGINDEX_ARLIG };

/** Branschregler som höjer kostnad vid planerat år (demo — bygg vidare per åtgärdstyp). */
export const branschreglerPlanering: {
  id: string;
  etikett: string;
  gallerFranAr: number;
  faktor: number;
  typer: RenoveringAtgardTyp[];
}[] = [
  {
    id: "stam-fukt-2020",
    etikett: "Fukt/ventilationskrav stambyte",
    gallerFranAr: 2020,
    faktor: 1.15,
    typer: ["stambyte"],
  },
  {
    id: "stam-arbetsmiljo-2030",
    etikett: "Arbetsmiljö och etablering stambyte",
    gallerFranAr: 2030,
    faktor: 1.08,
    typer: ["stambyte"],
  },
  {
    id: "fonster-energi-2025",
    etikett: "Energikrav fönster/dörr",
    gallerFranAr: 2025,
    faktor: 1.08,
    typer: ["fonster"],
  },
  {
    id: "tak-fallskydd-2022",
    etikett: "Fallskydd och säkerhet takarbete",
    gallerFranAr: 2022,
    faktor: 1.05,
    typer: ["tak"],
  },
];

export function beraknaIndexFaktor(
  franAr: number,
  tillAr: number,
  kostnader?: PlanKostnaderNormaliserade,
  indexArlig = STANDARD_BYGGINDEX_ARLIG,
): number {
  if (kostnader) return beraknaArligIndexFaktor(franAr, tillAr, kostnader);
  if (tillAr <= franAr) return 1;
  return Math.pow(1 + indexArlig, tillAr - franAr);
}

export function beraknaBranschregelFaktor(
  typ: RenoveringAtgardTyp,
  planAr: number,
): { faktor: number; etiketter: string[] } {
  let faktor = 1;
  const etiketter: string[] = [];
  for (const regel of branschreglerPlanering) {
    if (planAr >= regel.gallerFranAr && regel.typer.includes(typ)) {
      faktor *= regel.faktor;
      etiketter.push(regel.etikett);
    }
  }
  return { faktor, etiketter };
}

export function beraknaPlaneradKostnad(
  basKostnadKr: number,
  utförtAr: number,
  planAr: number,
  typ: RenoveringAtgardTyp,
  kostnader?: PlanKostnaderNormaliserade,
): {
  kostnadKr: number;
  entreprenadKr: number;
  upphandlingKr: number;
  projektledningKr: number;
  indexFaktor: number;
  branschregelFaktor: number;
  branschregelEtiketter: string[];
} {
  const indexFaktor = beraknaIndexFaktor(utförtAr, planAr, kostnader);
  const { faktor: branschregelFaktor, etiketter } = beraknaBranschregelFaktor(
    typ,
    planAr,
  );
  const entreprenadKr = Math.round(
    basKostnadKr * indexFaktor * branschregelFaktor,
  );
  const overhead = kostnader
    ? beraknaUpphandlingOchProjektledning(entreprenadKr, kostnader)
    : {
        upphandlingKr: 0,
        projektledningKr: 0,
        totaltKr: entreprenadKr,
      };
  return {
    kostnadKr: overhead.totaltKr,
    entreprenadKr,
    upphandlingKr: overhead.upphandlingKr,
    projektledningKr: overhead.projektledningKr,
    indexFaktor,
    branschregelFaktor,
    branschregelEtiketter: etiketter,
  };
}

function nastaPlanAr(
  senasteAr: number,
  intervallAr: number,
  planStartAr: number,
): number {
  let ar = senasteAr + intervallAr;
  while (ar < planStartAr) ar += intervallAr;
  return ar;
}

export type PlaneradAtgardPreview = {
  renoveringId: string;
  titel: string;
  komponent: string;
  atgardTyp: RenoveringAtgardTyp;
  utförtAr: number;
  basKostnadKr: number;
  nastaAr: number;
  uppskattadKostnadKr: number;
  intervallAr: number;
  indexFaktor: number;
  branschregelFaktor: number;
  entreprenadKr: number;
  upphandlingKr: number;
  projektledningKr: number;
};

export function hamtaNastaPlanArForDel(
  del: {
    renoveringId: string;
    utförtAr: number;
    atgardTyp: RenoveringAtgardTyp;
    komponent: string;
  },
  renovering: UtfördRenovering,
  planStartAr: number,
): number {
  const override = renovering.nastaAtgardArOverrides?.[del.renoveringId];
  if (override != null && Number.isFinite(override) && override > 0) {
    return override;
  }
  const intervallAr = hamtaIntervallForTyp(del.komponent, del.atgardTyp);
  return nastaPlanAr(del.utförtAr, intervallAr, planStartAr);
}

export function forhandsvisaNastaAtgard(
  renovering: UtfördRenovering,
  planStartAr: number,
  kostnader?: PlanKostnaderNormaliserade,
  kontext?: RenoveringFordelningKontext,
): PlaneradAtgardPreview | null {
  const delar = forhandsvisaNastaAtgarder(renovering, planStartAr, kostnader, kontext);
  return delar[0] ?? null;
}

export function forhandsvisaNastaAtgarder(
  renovering: UtfördRenovering,
  planStartAr: number,
  kostnader?: PlanKostnaderNormaliserade,
  kontext?: RenoveringFordelningKontext,
): PlaneradAtgardPreview[] {
  const totalKr = renovering.kostnadKr ?? 0;
  if (totalKr <= 0) return [];

  const utdelning = fordelRenovering(renovering, kontext);
  const previews: PlaneradAtgardPreview[] = [];

  for (const del of utdelning) {
    const intervallAr = hamtaIntervallForTyp(del.komponent, del.atgardTyp);
    const typ = del.atgardTyp;
    const nastaAr = hamtaNastaPlanArForDel(del, renovering, planStartAr);
    const beraknat = beraknaPlaneradKostnad(
      del.basKostnadKr,
      del.utförtAr,
      nastaAr,
      typ,
      kostnader,
    );

    previews.push({
      renoveringId: del.renoveringId,
      titel: `${renovering.titel} — ${del.del}`,
      komponent: del.komponent,
      atgardTyp: typ,
      utförtAr: del.utförtAr,
      basKostnadKr: del.basKostnadKr,
      nastaAr,
      uppskattadKostnadKr: beraknat.kostnadKr,
      intervallAr,
      indexFaktor: beraknat.indexFaktor,
      branschregelFaktor: beraknat.branschregelFaktor,
      entreprenadKr: beraknat.entreprenadKr,
      upphandlingKr: beraknat.upphandlingKr,
      projektledningKr: beraknat.projektledningKr,
    });
  }

  return previews;
}

function byggKostnadForklaring(
  utförtAr: number,
  basKostnadKr: number,
  ursprungKostnadKr: number | undefined,
  avdragProcent: number | undefined,
  avdragAnledning: string | undefined,
  entreprenadKr: number,
  upphandlingKr: number,
  projektledningKr: number,
  totaltKr: number,
  indexFaktor: number,
  branschregelFaktor: number,
  branschregelEtiketter: string[],
  kostnader?: PlanKostnaderNormaliserade,
): string {
  const delar: string[] = [];
  const avdragAktivt = (avdragProcent ?? 0) > 0 && (ursprungKostnadKr ?? 0) > 0;
  if (avdragAktivt) {
    const avdragKr = Math.max(0, (ursprungKostnadKr ?? 0) - basKostnadKr);
    const anledning = avdragAnledning ? ` (${avdragAnledning})` : "";
    delar.push(
      `Bas ${utförtAr}: ${(ursprungKostnadKr ?? 0).toLocaleString("sv-SE")} kr`,
      `Avdrag engångskostnad ${avdragProcent}%: −${avdragKr.toLocaleString("sv-SE")} kr${anledning}`,
      `Bas efter avdrag: ${basKostnadKr.toLocaleString("sv-SE")} kr`,
    );
  } else {
    delar.push(`Bas ${utförtAr}: ${basKostnadKr.toLocaleString("sv-SE")} kr`);
  }
  delar.push(
    `Index ×${indexFaktor.toFixed(2)} → entreprenad ${entreprenadKr.toLocaleString("sv-SE")} kr`,
  );
  if (branschregelFaktor > 1) {
    delar.push(
      `Branschregler ×${branschregelFaktor.toFixed(2)} (${branschregelEtiketter.join(", ")})`,
    );
  }
  if (kostnader && (upphandlingKr > 0 || projektledningKr > 0)) {
    delar.push(
      `Upphandling ${kostnader.upphandlingProcent}% +${upphandlingKr.toLocaleString("sv-SE")} kr`,
      `Projektledning ${kostnader.projektledningProcent}% +${projektledningKr.toLocaleString("sv-SE")} kr`,
      `Totalt ${totaltKr.toLocaleString("sv-SE")} kr`,
    );
  }
  return delar.join(" · ");
}

/** Genererar schemalagda åtgärder inom planperioden utifrån utförda renoveringar. */
export function genereraAtgarderFranHistorik(
  renoveringar: UtfördRenovering[],
  planStartAr: number,
  planLangdAr: number,
  kostnader?: PlanKostnaderNormaliserade,
  kontext?: RenoveringFordelningKontext,
): UnderhallAtgard[] {
  const planSlutAr = hamtaPlanSlutAr(planStartAr, planLangdAr);
  const atgarder: UnderhallAtgard[] = [];

  for (const renovering of renoveringar) {
    const utdelning = fordelRenovering(renovering, kontext);
    if (utdelning.length === 0) continue;

    for (const del of utdelning) {
      const intervallAr = hamtaIntervallForTyp(del.komponent, del.atgardTyp);
      let ar = hamtaNastaPlanArForDel(del, renovering, planStartAr);

      while (ar <= planSlutAr) {
        const beraknat = beraknaPlaneradKostnad(
          del.basKostnadKr,
          del.utförtAr,
          ar,
          del.atgardTyp,
          kostnader,
        );

        atgarder.push({
          komponent: del.komponent,
          del: del.del,
          ar,
          kostnadKr: beraknat.kostnadKr,
          intervallAr,
          kalla: "historik",
          kallaRenoveringId: renovering.id,
          kallaRenoveringAr: del.utförtAr,
          kallaRenoveringTitel: renovering.titel,
          kostnadForklaring: `${del.fordelningsNotering} · ${byggKostnadForklaring(
            del.utförtAr,
            del.basKostnadKr,
            del.ursprungKostnadKr,
            del.avdragProcent,
            del.avdragAnledning,
            beraknat.entreprenadKr,
            beraknat.upphandlingKr,
            beraknat.projektledningKr,
            beraknat.kostnadKr,
            beraknat.indexFaktor,
            beraknat.branschregelFaktor,
            beraknat.branschregelEtiketter,
            kostnader,
          )}`,
          atgardTyp: del.atgardTyp,
        });

        ar += intervallAr;
      }
    }
  }

  return atgarder.sort(
    (a, b) => a.ar - b.ar || a.komponent.localeCompare(b.komponent),
  );
}

export function historikTackerAtgardTyp(
  renoveringar: UtfördRenovering[],
  typ: RenoveringAtgardTyp,
  kontext?: RenoveringFordelningKontext,
): boolean {
  return renoveringar.some((r) => {
    if ((r.kostnadKr ?? 0) <= 0) return false;
    return fordelRenovering(r, kontext).some((d) => d.atgardTyp === typ);
  });
}
