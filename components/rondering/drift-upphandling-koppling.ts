import type { SigneringRoll } from "@/components/rondering/signering";

export type DriftUpphandlingsKategori = "Städning" | "Fastighetsskötsel";

export const driftUpphandlingsKategorier: DriftUpphandlingsKategori[] = [
  "Städning",
  "Fastighetsskötsel",
];

export function ärDriftUpphandlingsKategori(
  kategoriNamn: string,
): kategoriNamn is DriftUpphandlingsKategori {
  return (driftUpphandlingsKategorier as string[]).includes(kategoriNamn);
}

export function schemaRollForDriftKategori(
  kategoriNamn: DriftUpphandlingsKategori,
): SigneringRoll {
  return kategoriNamn === "Städning" ? "stadning" : "fastighetsskotare";
}

export function schemaFilnamnForDriftKategori(
  kategoriNamn: DriftUpphandlingsKategori,
): string {
  const datum = new Date().toISOString().slice(0, 10);
  return kategoriNamn === "Städning"
    ? `Stadschema_${datum}.txt`
    : `Ronderingsschema_fastighetsskotsel_${datum}.txt`;
}
