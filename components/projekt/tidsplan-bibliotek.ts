import {
  adderaDagar,
  normaliseraMilstolpe,
  skapaMilstolpeId,
  type TidsplanMilstolpe,
} from "@/components/projekt/tidsplan";
import { foreningStorageKey } from "@/lib/foreningStorage";

export type TidsplanMallMilstolpe = {
  titel: string;
  /** Dagar från projektstart (om startdatum anges vid import). */
  dagarFranStart: number;
};

export type TidsplanMall = {
  id: string;
  titel: string;
  beskrivning: string;
  milstolpar: TidsplanMallMilstolpe[];
  skapad: string;
};

const TIDSPLAN_BIBLIOTEK_BASE = "brf-tidsplan-bibliotek";

export function tidsplanBibliotekStorageKey(): string {
  return foreningStorageKey(TIDSPLAN_BIBLIOTEK_BASE);
}

export const standardTidsplanMallar: TidsplanMall[] = [
  {
    id: "mall-generell",
    titel: "Generell entreprenad",
    beskrivning: "Grundläggande milstolpar för mindre och medelstora projekt.",
    skapad: "standard",
    milstolpar: [
      { titel: "Kontrakt undertecknat", dagarFranStart: 0 },
      { titel: "Byggstart", dagarFranStart: 14 },
      { titel: "Halvtidsgenomgång / byggmöte", dagarFranStart: 45 },
      { titel: "Slutbesiktning", dagarFranStart: 90 },
      { titel: "Slutleverans och garantibesiktning planeras", dagarFranStart: 100 },
    ],
  },
  {
    id: "mall-stambyte",
    titel: "Stambyte",
    beskrivning: "Typisk tidsplan vid stambytesentreprenad i flerfamiljshus.",
    skapad: "standard",
    milstolpar: [
      { titel: "Informationsmöte boende", dagarFranStart: -30 },
      { titel: "Kontrakt och startbesked", dagarFranStart: 0 },
      { titel: "Rivning / förberedelse etapp 1", dagarFranStart: 7 },
      { titel: "Installation etapp 1 klar", dagarFranStart: 45 },
      { titel: "Installation etapp 2 klar", dagarFranStart: 90 },
      { titel: "Slutbesiktning stambyte", dagarFranStart: 120 },
    ],
  },
  {
    id: "mall-fasad",
    titel: "Fasadrenovering",
    beskrivning: "Milstolpar vid fasad, ställning och målning/puts.",
    skapad: "standard",
    milstolpar: [
      { titel: "Ställning uppe", dagarFranStart: 0 },
      { titel: "Underarbete klart", dagarFranStart: 21 },
      { titel: "Ytskikt etapp 1", dagarFranStart: 60 },
      { titel: "Ställning ned", dagarFranStart: 90 },
      { titel: "Slutbesiktning fasad", dagarFranStart: 100 },
    ],
  },
];

export function skapaMallId(): string {
  return `tidsplan-mall-${Date.now()}`;
}

export function lasTidsplanBibliotek(): TidsplanMall[] {
  if (typeof window === "undefined") return [...standardTidsplanMallar];
  try {
    const raw = localStorage.getItem(tidsplanBibliotekStorageKey());
    if (!raw) return [...standardTidsplanMallar];
    const sparade = JSON.parse(raw) as TidsplanMall[];
    const standardIds = new Set(standardTidsplanMallar.map((m) => m.id));
    const egen = sparade.filter((m) => !standardIds.has(m.id));
    return [...standardTidsplanMallar, ...egen];
  } catch {
    return [...standardTidsplanMallar];
  }
}

export function sparaTidsplanBibliotek(mallar: TidsplanMall[]): void {
  if (typeof window === "undefined") return;
  const standardIds = new Set(standardTidsplanMallar.map((m) => m.id));
  const egen = mallar.filter((m) => !standardIds.has(m.id));
  localStorage.setItem(tidsplanBibliotekStorageKey(), JSON.stringify(egen));
}

export function appliceraMallPaProjekt(
  mall: TidsplanMall,
  projektStartDatum: string,
): TidsplanMilstolpe[] {
  return mall.milstolpar.map((m) =>
    normaliseraMilstolpe({
      id: skapaMilstolpeId(),
      titel: m.titel,
      planeratDatum: adderaDagar(projektStartDatum, m.dagarFranStart),
      entreprenorDatum: null,
      faktisktDatum: null,
      ansvarig: "",
      kalla: "bibliotek",
      protokollReferens: mall.titel,
      anteckning: "",
      klar: false,
    }),
  );
}
