/** Invändiga delar i cykelförråd och soprum (utvändigt tillkommer senare). */

export type LokalTypId = "cykelforrad" | "soprum";

export type LokalInventarDel = {
  id: string;
  etikett: string;
  beskrivning: string;
};

import {
  formatSummeringTal,
  parseNummerSumma,
  type ListaSummeringRad,
} from "@/components/underhallsplan/lista-summering";

export type LokalInventarRad = {
  delId: string;
  aktiv: boolean;
  antal: string;
};

export const lokalInventarMallar: Record<LokalTypId, LokalInventarDel[]> = {
  cykelforrad: [
    {
      id: "cykelstall",
      etikett: "Cykelställ",
      beskrivning: "Antal cykelparkeringar eller ställplatser.",
    },
    {
      id: "belysning",
      etikett: "Belysning",
      beskrivning: "Antal armaturer i cykelförrådet.",
    },
    {
      id: "ventilation",
      etikett: "Ventilation",
      beskrivning: "Don, ventiler eller frånluft i cykelrummet.",
    },
    {
      id: "el-ladd",
      etikett: "Eluttag / laddplatser",
      beskrivning: "Antal uttag eller laddplatser för elcykel.",
    },
    {
      id: "dorrar",
      etikett: "Innerväggsdörrar",
      beskrivning: "Antal dörrar och passager till cykelförråd.",
    },
  ],
  soprum: [
    {
      id: "sortering",
      etikett: "Sorteringskärl / station",
      beskrivning: "Antal kärl, fack eller sorteringsstationer.",
    },
    {
      id: "diskbank",
      etikett: "Diskbänk / spolyta",
      beskrivning: "Antal bänkar eller ytor för sköljning och städ.",
    },
    {
      id: "vatten-avlopp",
      etikett: "Vatten och avlopp för spolning",
      beskrivning: "Vattenutkastare eller slanganslutning samt avlopp för spolning av golvytan.",
    },
    {
      id: "undercentral-rum",
      etikett: "Rum för undercentral",
      beskrivning: "Separat utrymme i byggnaden för fjärrvärmeundercentral.",
    },
    {
      id: "belysning",
      etikett: "Belysning",
      beskrivning: "Antal armaturer i soprummet.",
    },
    {
      id: "ventilation",
      etikett: "Ventilation",
      beskrivning: "Ventilation mot lukt och fukt — don och kanaler.",
    },
    {
      id: "golvbrunn",
      etikett: "Golvbrunnar",
      beskrivning: "Antal golvbrunnar och avlopp.",
    },
    {
      id: "dorrar",
      etikett: "Innerväggsdörrar",
      beskrivning: "Antal dörrar till soprum.",
    },
  ],
};

export function skapaTomLokalInventar(typ: LokalTypId): LokalInventarRad[] {
  return lokalInventarMallar[typ].map((del) => ({
    delId: del.id,
    aktiv: false,
    antal: "",
  }));
}

export function lokalDelEtikett(typ: LokalTypId, delId: string): string {
  return lokalInventarMallar[typ].find((d) => d.id === delId)?.etikett ?? delId;
}

export function summeraLokalInventar(
  typ: LokalTypId,
  rader: LokalInventarRad[],
  antalRum?: string,
): ListaSummeringRad[] {
  const summering: ListaSummeringRad[] = [];
  if (antalRum?.trim()) {
    summering.push({ etikett: "Antal rum", varde: `${antalRum.trim()} st` });
  }

  for (const rad of rader.filter((r) => r.aktiv)) {
    const etikett = lokalDelEtikett(typ, rad.delId);
    if (rad.antal.trim()) {
      const n = parseNummerSumma([rad.antal]);
      summering.push({
        etikett,
        varde: n > 0 ? `${formatSummeringTal(n, 0)} st` : `${rad.antal.trim()} st`,
      });
    } else {
      summering.push({ etikett, varde: "ingår" });
    }
  }

  return summering;
}

export function formateraLokalInventar(
  typ: LokalTypId,
  rader: LokalInventarRad[],
  antalRum?: string,
): string {
  const delar: string[] = [];
  if (antalRum?.trim()) {
    delar.push(`${antalRum.trim()} rum`);
  }
  const aktiva = rader.filter((r) => r.aktiv && r.antal.trim());
  for (const rad of aktiva) {
    delar.push(
      `${lokalDelEtikett(typ, rad.delId)} ${rad.antal.trim()} st`,
    );
  }
  const baraAktiva = rader.filter((r) => r.aktiv && !r.antal.trim());
  for (const rad of baraAktiva) {
    delar.push(lokalDelEtikett(typ, rad.delId));
  }
  return delar.join(", ");
}
