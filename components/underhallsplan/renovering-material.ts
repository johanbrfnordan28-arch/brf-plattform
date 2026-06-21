export type RenoveringMaterialAlternativ = {
  id: string;
  etikett: string;
  forklaring?: string;
};

export const TAK_RENOVERING_MATERIAL: RenoveringMaterialAlternativ[] = [
  {
    id: "bandtackt-plat",
    etikett: "Bandtäckt plåttak",
    forklaring: "Kallas ofta bandplåt eller bandtäckt plåt i handlingar.",
  },
  { id: "tegel", etikett: "Tegeltak" },
  { id: "betongpannor", etikett: "Betongpannor" },
  {
    id: "bitumen-tatskiktsmatta",
    etikett: "Bitumenbaserad tätskiktsmatta (takpapp)",
    forklaring: "Yrkesbenämning för det som ofta kallas papptak.",
  },
  { id: "takduk", etikett: "Takduk / takmembran" },
  { id: "sedum", etikett: "Sedumtak / grönt tak" },
  { id: "annat", etikett: "Annat takmaterial — beskriv i omfattning" },
];

export const FASAD_RENOVERING_MATERIAL: RenoveringMaterialAlternativ[] = [
  { id: "puts", etikett: "Puts" },
  { id: "tunnputs", etikett: "Tunnputs" },
  { id: "tegel", etikett: "Tegel" },
  { id: "tegel-putsband", etikett: "Tegel med putsband" },
  { id: "trapanel", etikett: "Träpanel" },
  { id: "plat", etikett: "Plåtfasad" },
  { id: "betong", etikett: "Betong / skivmaterial" },
  { id: "fibercement", etikett: "Fibercement / fasadskiva" },
  { id: "annat", etikett: "Annat fasadmaterial — beskriv i omfattning" },
];

export function renoveringMaterialAlternativ(
  komponentNamn: string,
  underkomponentId?: string,
): RenoveringMaterialAlternativ[] {
  if (komponentNamn === "Tak" || underkomponentId === "takyta") {
    return TAK_RENOVERING_MATERIAL;
  }
  if (komponentNamn === "Fasad" || underkomponentId === "fasadmaterial") {
    return FASAD_RENOVERING_MATERIAL;
  }
  return [];
}

export function renoveringMaterialEtikett(idOrEtikett?: string): string | null {
  const value = idOrEtikett?.trim();
  if (!value) return null;
  const alla = [...TAK_RENOVERING_MATERIAL, ...FASAD_RENOVERING_MATERIAL];
  return alla.find((alt) => alt.id === value || alt.etikett === value)?.etikett ?? value;
}
