import {
  hamtaUnderhallRekommendation,
  type UnderhallRekommendation,
} from "@/components/underhallsplan/underhall-intervall";
import {
  normaliseraRenoveringKomponent,
  type UtfördRenovering,
} from "@/components/underhallsplan/renoveringar";

export type RenoveringAtgardTyp =
  | "stambyte"
  | "stamspolning"
  | "tak"
  | "fasad"
  | "balkonger"
  | "fonster"
  | "hiss"
  | "tvattstuga"
  | "ventilation"
  | "trapphus"
  | "brandskydd"
  | "ovrigt";

export type AtgardRegel = {
  typ: RenoveringAtgardTyp;
  intervallAr: number;
  delEtikett: string;
  underkomponentId?: string;
};

const atgardRegler: {
  nyckelord: string[];
  regel: AtgardRegel;
}[] = [
  {
    nyckelord: ["stambyte", "stam bytes", "rörbyte stam"],
    regel: {
      typ: "stambyte",
      intervallAr: 50,
      delEtikett: "Stambyte",
      underkomponentId: "stambyte",
    },
  },
  {
    nyckelord: ["stamspolning", "stamspol", "avloppsspolning"],
    regel: {
      typ: "stamspolning",
      intervallAr: 20,
      delEtikett: "Stamspolning",
    },
  },
  {
    nyckelord: ["omläggning tak", "takomläggning", "tak byte", "takbeläggning"],
    regel: { typ: "tak", intervallAr: 30, delEtikett: "Tak", underkomponentId: "takyta" },
  },
  {
    nyckelord: ["takterrass", "tak terrass"],
    regel: {
      typ: "tak",
      intervallAr: 20,
      delEtikett: "Takterrass",
      underkomponentId: "takterrass",
    },
  },
  {
    nyckelord: ["fönster", "fonster"],
    regel: {
      typ: "fonster",
      intervallAr: 40,
      delEtikett: "Fönster",
      underkomponentId: "fonster",
    },
  },
  {
    nyckelord: ["ommålning fasad", "fasad", "puts", "tunnputs"],
    regel: {
      typ: "fasad",
      intervallAr: 30,
      delEtikett: "Fasad",
      underkomponentId: "fasadmaterial",
    },
  },
  {
    nyckelord: ["balkong", "tätning balkong"],
    regel: {
      typ: "balkonger",
      intervallAr: 25,
      delEtikett: "Balkonger",
      underkomponentId: "balkonger",
    },
  },
  {
    nyckelord: ["hiss", "hissmodern"],
    regel: {
      typ: "hiss",
      intervallAr: 25,
      delEtikett: "Hiss",
      underkomponentId: "hiss",
    },
  },
  {
    nyckelord: ["tvättstuga", "tvattstuga", "tvätt"],
    regel: {
      typ: "tvattstuga",
      intervallAr: 20,
      delEtikett: "Tvättstuga",
      underkomponentId: "tvattstuga",
    },
  },
  {
    nyckelord: ["ovk", "ventilation", "ftx", "frånluft", "franluft"],
    regel: {
      typ: "ventilation",
      intervallAr: 15,
      delEtikett: "Ventilation",
    },
  },
  {
    nyckelord: ["trapphus", "målning trapp", "malning trapp"],
    regel: {
      typ: "trapphus",
      intervallAr: 15,
      delEtikett: "Trapphus",
      underkomponentId: "vaggar-malning",
    },
  },
  {
    nyckelord: ["branddörr", "branddorr", "brandskydd", "sba", "utrymning", "rökgas", "rokgas"],
    regel: {
      typ: "brandskydd",
      intervallAr: 5,
      delEtikett: "Brandskydd",
      underkomponentId: "branddorrar",
    },
  },
];

function regelMedRekommendation(
  komponent: string,
  regel: AtgardRegel,
): AtgardRegel {
  if (!regel.underkomponentId) return regel;
  const rek: UnderhallRekommendation | undefined = hamtaUnderhallRekommendation(
    komponent,
    regel.underkomponentId,
  );
  if (!rek) return regel;
  return { ...regel, intervallAr: rek.rekommenderatIntervallAr };
}

export function klassificeraRenovering(renovering: UtfördRenovering): AtgardRegel {
  const text = `${renovering.titel} ${renovering.omfattning}`.toLowerCase();
  for (const { nyckelord, regel } of atgardRegler) {
    if (nyckelord.some((n) => text.includes(n))) {
      return regelMedRekommendation(
        normaliseraRenoveringKomponent(renovering.komponent),
        regel,
      );
    }
  }
  const komponent = normaliseraRenoveringKomponent(renovering.komponent);
  return {
    typ: "ovrigt",
    intervallAr: 25,
    delEtikett: renovering.titel.trim() || komponent,
  };
}

export function hamtaIntervallForTyp(
  komponent: string,
  typ: RenoveringAtgardTyp,
): number {
  for (const { regel } of atgardRegler) {
    if (regel.typ === typ) {
      return regelMedRekommendation(komponent, regel).intervallAr;
    }
  }
  return 25;
}
