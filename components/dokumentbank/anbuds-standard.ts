/** Delad struktur för anbudsformulär och anbudsutvärdering (Excel). */

export const ANBUD_ANTAL_ENTREPRENORER = 10;

export const ANBUD_ATA_YRKESGRUPPER = [
  "Bygg / allmän entreprenad",
  "Rivning",
  "Mark / anläggning",
  "Ställning / fallskydd",
  "El",
  "VVS",
  "Ventilation",
  "Målning",
  "Plattsättning",
  "Golv",
  "Snickeri / inredning",
  "Övrig yrkesgrupp 1",
  "Övrig yrkesgrupp 2",
] as const;

/** Ja/Nej-krav som speglar anbudsformuläret (ingen summering). */
export const ANBUD_JA_NEJ_KRAV = [
  { id: "f-skatt", etikett: "F-skattsedel" },
  { id: "forsakring", etikett: "Ansvarsförsäkring minst 10 Mkr" },
  { id: "id06", etikett: "ID06-registrerat" },
  {
    id: "underentreprenor",
    etikett: "Underentreprenörer (lista bifogad vid Ja)",
  },
] as const;

/** Prisposter (kr, exkl. moms) — summeras där det anges i Excel. */
export const ANBUD_PRIS_POSTER = [
  { id: "huvud", etikett: "Huvuduppdrag" },
  { id: "option1", etikett: "Option 1" },
  { id: "option2", etikett: "Option 2" },
  { id: "option3", etikett: "Option 3" },
  { id: "option4", etikett: "Option 4" },
  { id: "option5", etikett: "Option 5" },
] as const;

export const ANBUD_OVRIGA_SIFFROR = [
  { id: "material", etikett: "Material — påslag (%)" },
  { id: "min-ata", etikett: "Minsta debitering per ÄTA-uppdrag (kr)" },
] as const;

export function anbudExcelKolumner(): string[] {
  const cols: string[] = [];
  for (let i = 0; i < ANBUD_ANTAL_ENTREPRENORER; i += 1) {
    cols.push(kolumnBokstav(2 + i));
  }
  return cols;
}

/** 1 → A, 2 → B, 27 → AA */
export function kolumnBokstav(index: number): string {
  let s = "";
  let n = index;
  while (n > 0) {
    n -= 1;
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26);
  }
  return s;
}

export function anbudLagstKolumn(): string {
  return kolumnBokstav(2 + ANBUD_ANTAL_ENTREPRENORER);
}
