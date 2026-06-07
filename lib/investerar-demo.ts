import type { TestplanId } from "@/components/underhallsplan/testplaner";

export const INVESTERAR_DEMO_DEFAULT: TestplanId = "test-sailor";

export const investerarDemoProfiler: {
  id: TestplanId;
  titel: string;
  beskrivning: string;
  höjdpunkter: string[];
}[] = [
  {
    id: "test-sailor",
    titel: "Brf Sailor 2013",
    beskrivning:
      "Nyproduktion med 36 lägenheter — komplett register, besiktningar och budget.",
    höjdpunkter: [
      "Underhållsplan med slutsida och diagram",
      "Komponentregister med balkonger och VVS",
      "Lämplig som huvuddemo",
    ],
  },
  {
    id: "test-70",
    titel: "Brf Parklyckan",
    beskrivning:
      "Större förening (45 lgh) — tak och fasad som klumpsummor, bra för upphandlingsstoryn.",
    höjdpunkter: [
      "Visar kostnadsfördelning i planen",
      "Koppla till upphandlingsmodulen",
    ],
  },
];

export const investerarDemoMal = {
  forening: "/forening",
  underhallsplan: "/forening/underhallsplan",
  underhallsplanSlutsida: "/forening/underhallsplan#slutsida",
  upphandling: "/forening/upphandling",
  guider: "/forening/guider",
  publik: "/",
} as const;
