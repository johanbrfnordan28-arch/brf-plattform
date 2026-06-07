/** Förklaring: teknisk livslängd vs åtgärder som förlänger eller sänker driftkostnad. */

export type LivslangdAtgardTyp = "byte" | "underhall" | "energi";

export type LivslangdExempel = {
  komponent: string;
  tekniskLivslangd: string;
  underhallEllerEnergi: string;
  effekt: string;
};

export const LIVSLANGD_FORKLARING = {
  rubrik: "Teknisk livslängd och underhåll — två olika saker",
  teknisk:
    "Teknisk livslängd är hur länge en komponent eller del normalt klarar sig innan den behöver bytas ut — t.ex. fönster ca 40 år, takbeläggning ca 30 år. I underhållsplanen planeras det som större tillfällen med längre intervall.",
  underhall:
    "Löpande underhåll (målning, tätning, rengöring, injustering) byter inte ut komponenten men kan förlänga livslängden och skjuta upp stora ingrepp med många år.",
  energi:
    "Energiåtgärder (bättre styrning av värme och belysning, LED, injustering) påverkar oftast driftkostnaden och komforten direkt — de ersätter sällan hela komponenten men kan minska slitage och onödig belastning.",
  koppling:
    "I steg 3 lägger ni både större byten (teknisk livslängd) och mindre tillfällen (underhåll). Justera år och intervall när verkligheten avviker — planen ska vara levande.",
} as const;

export const LIVSLANGD_EXEMPEL: LivslangdExempel[] = [
  {
    komponent: "Fönster",
    tekniskLivslangd: "Byte ca vart 30–50:e år",
    underhallEllerEnergi: "Målning, beslag, tätning",
    effekt: "Underhåll skjuter upp fukt och större skador — inte samma sak som byte.",
  },
  {
    komponent: "Tak",
    tekniskLivslangd: "Omläggning ca vart 25–40:e år",
    underhallEllerEnergi: "Rensning av rännor, plåtdetaljer, snörass",
    effekt: "Löpande skötsel förlänger tiden till nästa omläggning.",
  },
  {
    komponent: "Värmesystem",
    tekniskLivslangd: "Stammar/central ca 35–50 år",
    underhallEllerEnergi: "Injustering, ventiler, tryck, styrning",
    effekt: "Energi och injustering sänker driftkostnad — byte planeras separat.",
  },
  {
    komponent: "Belysning",
    tekniskLivslangd: "Armaturer ca 15–25 år (LED längre)",
    underhallEllerEnergi: "LED, rörelsevakter, styrning, rengöring",
    effekt: "Energiåtgärd ger snabb besparing; armaturbyte planeras vid slutslitage.",
  },
];
