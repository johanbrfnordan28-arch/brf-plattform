/** Rekommenderade underhållsintervall per huvudkomponent och underkomponent. */

export type UnderhallRekommendation = {
  rekommenderatIntervallAr: number;
  intervallHint: string;
};

const rekommendationer: Record<string, Record<string, UnderhallRekommendation>> = {
  Fasad: {
    fonster: {
      rekommenderatIntervallAr: 40,
      intervallHint: "Fönsterbyte — ofta 30–50 år beroende på material och skick.",
    },
    dorrar: {
      rekommenderatIntervallAr: 35,
      intervallHint: "Ytterdörrar — ofta 25–40 år.",
    },
    balkonger: {
      rekommenderatIntervallAr: 25,
      intervallHint:
        "Balkongplatta/tätskikt — ofta 20–30 år; besiktning vart 10:e–15:e år.",
    },
    puts: {
      rekommenderatIntervallAr: 30,
      intervallHint: "Ommålning/renovering puts — ofta 25–40 år.",
    },
    fasadmaterial: {
      rekommenderatIntervallAr: 30,
      intervallHint:
        "Ommålning puts ca 25–40 år; putsreparation vid behov. Tegel/trä varierar.",
    },
  },
  Tak: {
    takyta: {
      rekommenderatIntervallAr: 30,
      intervallHint: "Takbeläggning — ofta 25–40 år beroende på material.",
    },
    takfonster: {
      rekommenderatIntervallAr: 35,
      intervallHint: "Takfönster — ofta 30–40 år.",
    },
    takterrass: {
      rekommenderatIntervallAr: 20,
      intervallHint: "Tätskikt takterrass — ofta 15–25 år.",
    },
    medlemstakterrass: {
      rekommenderatIntervallAr: 20,
      intervallHint: "Som gemensam takterrass — kortare livslängd än undertak.",
    },
  },
  VVS: {
    stambyte: {
      rekommenderatIntervallAr: 50,
      intervallHint: "Stambyte — ofta 40–60 år eller vid fukt/skador.",
    },
    "spolning-avlopp": {
      rekommenderatIntervallAr: 3,
      intervallHint: "Stamspolning — ofta vart 2–5 år beroende på skick och problemhistorik.",
    },
    "filmning-avlopp": {
      rekommenderatIntervallAr: 6,
      intervallHint: "Filmning/kamerainspektion — ofta vart 5–10 år eller inför större beslut.",
    },
  },
  Värmecentral: {
    radiatorer: {
      rekommenderatIntervallAr: 30,
      intervallHint: "Radiatorer och ventiler — ofta 25–35 år.",
    },
    varmestammar: {
      rekommenderatIntervallAr: 40,
      intervallHint: "Värmestammar och stamledning — ofta 35–50 år.",
    },
    stamventiler: {
      rekommenderatIntervallAr: 25,
      intervallHint: "Stamventiler och balansventiler — ofta 20–30 år.",
    },
  },
  Trapphus: {
    golv: {
      rekommenderatIntervallAr: 15,
      intervallHint: "Slitna trapphusgolv — ofta 10–20 år.",
    },
  },
  Brandskydd: {
    sba: {
      rekommenderatIntervallAr: 1,
      intervallHint: "Systematiskt brandskyddsarbete — egenkontroll minst årligen.",
    },
    branddorrar: {
      rekommenderatIntervallAr: 5,
      intervallHint: "Kontroll och justering av branddörrar — ofta vart 3–5:e år.",
    },
    utrymningsvag: {
      rekommenderatIntervallAr: 5,
      intervallHint: "Utrymningsvägar, skyltning och nödbelysning — löpande och planerat.",
    },
    rokgasevakuering: {
      rekommenderatIntervallAr: 5,
      intervallHint: "Funktionstest rökgasevakuering i trapphus — enligt SBA och leverantör.",
    },
  },
  Källare: {
    golv: {
      rekommenderatIntervallAr: 20,
      intervallHint: "Källargolv — ofta 15–25 år.",
    },
  },
};

export function hamtaUnderhallRekommendation(
  komponentNamn: string,
  underkomponentId: string,
): UnderhallRekommendation | undefined {
  return rekommendationer[komponentNamn]?.[underkomponentId];
}

export function standardUnderhallIntervallAr(
  komponentNamn: string,
  underkomponentId: string,
): string {
  const rek = hamtaUnderhallRekommendation(komponentNamn, underkomponentId);
  return rek ? String(rek.rekommenderatIntervallAr) : "";
}
