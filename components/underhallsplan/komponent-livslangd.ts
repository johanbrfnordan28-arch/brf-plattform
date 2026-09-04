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
    "Teknisk livslängd är hur länge en komponent normalt klarar sig innan den behöver bytas — t.ex. tak ca 25–100 år (papp/bitumen kortast; välskötta plåttak kan passera 100 år), värmesystem upp till ca 100 år beroende på installationens kvalitet, fönster ofta ca 30–50 år. I underhållsplanen planeras det som större tillfällen med längre intervall.",
  underhall:
    "Löpande underhåll (målning, tätning, rengöring, injustering, termostatbyte) byter inte ut hela komponenten men kan förlänga livslängden och skjuta upp stora ingrepp med många år.",
  energi:
    "Energiåtgärder (bättre styrning av värme och belysning, LED, injustering efter ombyggnad) påverkar ofta driftkostnad och komfort direkt — de ersätter sällan hela systemet men minskar slitage och onödig belastning.",
  koppling:
    "I steg 3 lägger ni både större byten (teknisk livslängd) och mindre tillfällen (underhåll). Justera år och intervall när verkligheten avviker — t.ex. efter vindsinredning när värmesystemet behöver injusteras på nytt.",
} as const;

export const LIVSLANGD_EXEMPEL: LivslangdExempel[] = [
  {
    komponent: "Fönster",
    tekniskLivslangd: "Byte ca vart 30–50:e år (material påverkar)",
    underhallEllerEnergi:
      "Trä/PVC/alu-beklätt — målning, tätningslister (mindre drag, sparar energi)",
    effekt:
      "Tätningslister och underhåll skjuter upp byte och sänker drag. Nytt fönster ger oftast större energivinst.",
  },
  {
    komponent: "Tak",
    tekniskLivslangd: "Ca 25–100 år — papp kortast; plåt kan passera 100 år",
    underhallEllerEnergi:
      "Skötsel, klimat, avvattning; värmekablar underlättar avrinning — löv/skräp ger stopp",
    effekt:
      "Fungerande avvattning skyddar tak och fasad. Rensning behövs även om ni har värmekablar.",
  },
  {
    komponent: "Värmesystem",
    tekniskLivslangd: "Upp till ca 100 år — beror på installationskvalitet",
    underhallEllerEnergi:
      "Injustering (särskilt efter vindsinredning), termostater ca 20–30 år, tryck/styrning",
    effekt:
      "Injustering och termostatbyte sänker driftkostnad — hela systemet byts separat.",
  },
  {
    komponent: "Belysning",
    tekniskLivslangd: "Armaturer ca 15–25 år (LED längre)",
    underhallEllerEnergi: "LED, rörelsevakter, styrning, rengöring",
    effekt: "Energiåtgärd ger snabb besparing; armaturbyte planeras vid slutslitage.",
  },
];
