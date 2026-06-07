import {
  beraknaAiYtaForslag,
  summeraFasadKvm,
  summeraFasadPerVaderstreck,
  summeraTakKvm,
  type FasadVaderstreckId,
} from "@/components/underhallsplan/fastighets-ytor";
import { fasadVaderstreckLista } from "@/components/underhallsplan/fastighets-ytor";
import {
  allaDeltyper,
  deltypEtikett,
  hamtaKomponentMall,
  type KomponentDetaljData,
} from "@/components/underhallsplan/komponentregister";
import { normaliseraGrund } from "@/components/underhallsplan/grund-synk";
import { parseHeltalFranText } from "@/components/underhallsplan/parse-grundtal";
import type { Grunduppgifter } from "@/components/underhallsplan/types";

export type YtaAiAntalForslag = {
  etikett: string;
  forslag: string;
  forklaring: string;
};

export type YtaAiHjalpResultat = {
  titel: string;
  kvmForslag: number | null;
  kvmForklaring: string;
  material: string[];
  antal: YtaAiAntalForslag[];
  steg: string[];
  kalla: "schablon" | "grund" | "blandat";
};

export function beraknaYtaAiHjalp(args: {
  typ: "Tak" | "Fasad";
  grund: Grunduppgifter;
  komponentData?: KomponentDetaljData;
  uppmattKvm?: number | null;
}): YtaAiHjalpResultat {
  const { typ, grund, komponentData, uppmattKvm } = args;
  const grundNorm = normaliseraGrund(grund);
  const ytor = grundNorm.fastighetsYtor;
  const steg: string[] = [];
  const material: string[] = [];
  const antal: YtaAiAntalForslag[] = [];

  if (typ === "Fasad") {
    const grundKvm = summeraFasadKvm(ytor);
    const schablon = beraknaAiYtaForslag({
      grund,
      husId: ytor.hus[0]?.id ?? "hus-1",
      vaderstreck: "norr",
      typ: "fasad",
    });

    if (komponentData) {
      const mall = hamtaKomponentMall("Fasad");
      for (const id of komponentData.valdaDeltyper) {
        material.push(deltypEtikett(id, komponentData, mall));
      }
    }

    const perVs = summeraFasadPerVaderstreck(ytor).filter((v) => v.kvm > 0);
    if (perVs.length > 0) {
      steg.push(
        `Grunduppgifter: ${perVs.map((v) => `${v.etikett} ${v.kvm} m²`).join(", ")}.`,
      );
    }

    if (grundKvm > 0) {
      return {
        titel: "Förslag — fasadyta",
        kvmForslag: grundKvm,
        kvmForklaring: `Summa från grunduppgifter (hus och vädersträck): ${grundKvm.toLocaleString("sv-SE")} m².`,
        material: materialForslagFasad(material),
        antal: antalForslagFasad(grund, komponentData),
        steg: [
          "Kontrollera i Street View (gata) och Earth/Maps (gård och taknära partier).",
          ...steg,
        ],
        kalla: "grund",
      };
    }

    if (schablon.kvm > 0) {
      return {
        titel: "Förslag — fasadyta (schablon)",
        kvmForslag: schablon.kvm,
        kvmForklaring: schablon.forklaring,
        material: materialForslagFasad(material),
        antal: antalForslagFasad(grund, komponentData),
        steg: [
          "Verifiera med Street View längs gatan och satellit mot gård.",
          "Fyll i grunduppgifter per hus och vädersträck för bättre precision.",
        ],
        kalla: "schablon",
      };
    }

    return tomResultat(typ, uppmattKvm);
  }

  // Tak
  const grundTak = summeraTakKvm(ytor);
  const schablonTak = beraknaAiYtaForslag({
    grund,
    husId: ytor.hus[0]?.id ?? "hus-1",
    vaderstreck: "norr",
    typ: "tak",
  });

  if (komponentData) {
    const mall = hamtaKomponentMall("Tak");
    for (const del of allaDeltyper(komponentData, mall)) {
      if (komponentData.valdaDeltyper.includes(del.id)) {
        material.push(del.etikett);
      }
    }
  }

  for (const h of ytor.hus) {
    const tak = parseFloat((ytor.takPerHus[h.id] ?? "").replace(",", "."));
    if (tak > 0) {
      steg.push(`${h.husnummer}: ${tak} m² tak enligt grunduppgifter.`);
    }
  }

  if (grundTak > 0) {
    return {
      titel: "Förslag — takyta",
      kvmForslag: grundTak,
      kvmForklaring: `Summa takytor från grunduppgifter: ${grundTak.toLocaleString("sv-SE")} m².`,
      material: material.length > 0 ? material : ["Kontrollera takbeläggning i registret (plåt, papp, tegel …)."],
      antal: antalForslagTak(komponentData, grund),
      steg: [
        "Mät i Google Earth med ytpolygon (rekommenderas för tak).",
        ...steg,
      ],
      kalla: "grund",
    };
  }

  if (schablonTak.kvm > 0) {
    return {
      titel: "Förslag — takyta (schablon)",
      kvmForslag: schablonTak.kvm,
      kvmForklaring: schablonTak.forklaring,
      material: material.length > 0 ? material : ["Kontrollera takbeläggning i registret."],
      antal: antalForslagTak(komponentData, grund),
      steg: [
        "Öppna Google Earth, rita polygon runt taket och jämför med schablonvärdet.",
        "Ladda upp skärmbild och mät i verktyget nedan om du vill.",
      ],
      kalla: "schablon",
    };
  }

  return tomResultat(typ, uppmattKvm);
}

function tomResultat(
  typ: "Tak" | "Fasad",
  uppmattKvm?: number | null,
): YtaAiHjalpResultat {
  return {
    titel: typ === "Tak" ? "Takyta" : "Fasadyta",
    kvmForslag: uppmattKvm && uppmattKvm > 0 ? Math.round(uppmattKvm) : null,
    kvmForklaring: uppmattKvm
      ? "Baserat på din uppmätning i bilden eller manuell inmatning."
      : "Fyll i boarea och antal våningar i steg 1, eller mät med Google Earth / egen bild.",
    material: [],
    antal: [],
    steg: [
      typ === "Tak"
        ? "Använd Google Earth och mätverktyget Area."
        : "Använd Street View för gata och satellit/Earth för övriga fasader.",
    ],
    kalla: "schablon",
  };
}

function materialForslagFasad(valda: string[]): string[] {
  if (valda.length > 0) return valda;
  return [
    "Välj fasadmaterial ovan (puts, tegel, trä …) efter det du ser i Street View.",
  ];
}

function antalForslagFasad(
  grund: Grunduppgifter,
  data?: KomponentDetaljData,
): YtaAiAntalForslag[] {
  const lgh = parseHeltalFranText(grund.antalLagenheter);
  const ut: YtaAiAntalForslag[] = [];
  if (lgh > 0) {
    ut.push({
      etikett: "Fönster (ungefär)",
      forslag: String(Math.round(lgh * 2.5)),
      forklaring: "Schablon ca 2–3 fönster per lägenhet — räkna i Street View vid behov.",
    });
  }
  const fonster = data?.underkomponenter.find((u) => u.id === "fonster");
  if (fonster?.värde?.trim()) {
    ut.push({
      etikett: "Fönster (register)",
      forslag: fonster.värde,
      forklaring: "Redan ifyllt i registret.",
    });
  }
  return ut;
}

function antalForslagTak(
  data: KomponentDetaljData | undefined,
  grund: Grunduppgifter,
): YtaAiAntalForslag[] {
  const ut: YtaAiAntalForslag[] = [];
  if (!data) return ut;
  for (const rad of data.underkomponenter) {
    if (!rad.aktiv || rad.måttenhet !== "antal") continue;
    if (rad.värde?.trim()) {
      ut.push({
        etikett: rad.etikett,
        forslag: rad.värde,
        forklaring: "Från komponentregistret.",
      });
      continue;
    }
    if (rad.id === "skorsten") {
      const byggnader = Math.max(1, parseHeltalFranText(grund.antalByggnader) || 1);
      ut.push({
        etikett: rad.etikett,
        forslag: String(byggnader),
        forklaring: "Schablon: en skorsten per byggnad — räkna på takbilden.",
      });
    }
  }
  return ut;
}

export function fasadVaderstreckTips(): { id: FasadVaderstreckId; etikett: string }[] {
  return fasadVaderstreckLista;
}
