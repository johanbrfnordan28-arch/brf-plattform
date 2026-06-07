/** Mallar i dokumentbanken — kan utökas och kopplas till lagring/API senare. */
export type DokumentbankMall = {
  id: string;
  titel: string;
  filnamn: string;
  beskrivning: string;
  omrade: "upphandling" | "juridik" | "avtal";
};

export const dokumentbankMallar: DokumentbankMall[] = [
  {
    id: "projekt-beskrivning",
    titel: "Projektbeskrivning — mall",
    filnamn: "Mall_projektbeskrivning.docx",
    beskrivning: "Struktur för scope, omfattning och krav till entreprenör.",
    omrade: "upphandling",
  },
  {
    id: "anbudsformular-standard",
    titel: "Anbudsformulär — standard",
    filnamn: "Anbudsformular_BRF_standard.pdf",
    beskrivning: "Standardformulär för pris, omfattning och referenser.",
    omrade: "upphandling",
  },
  {
    id: "kontrakt-entreprenad",
    titel: "Kontraktsformulär entreprenad",
    filnamn: "Kontraktsformular_entreprenad.pdf",
    beskrivning: "Avtalsunderlag efter tilldelad entreprenör.",
    omrade: "upphandling",
  },
  {
    id: "af-ab04",
    titel: "AF — administrativa föreskrifter (AB04)",
    filnamn: "AF_AB04_mall.pdf",
    beskrivning: "För större entreprenader med fullständigt underlag.",
    omrade: "upphandling",
  },
  {
    id: "ritning-bilaga",
    titel: "Bilaga ritningar",
    filnamn: "Bilaga_ritningar_mall.pdf",
    beskrivning: "Förteckning och hänvisning till ritningsunderlag.",
    omrade: "upphandling",
  },
  {
    id: "sekretess-anbud",
    titel: "Sekretess och anbudshantering",
    filnamn: "Anvisning_sekretess_anbud.pdf",
    beskrivning: "Styrelsens rutin kring låsta anbud till efter deadline.",
    omrade: "upphandling",
  },
  {
    id: "sba-kontrollmall",
    titel: "Systematiskt brandskyddsarbete — kontrollmall egenkontroll",
    filnamn: "SBA_kontrollmall_egenkontroll.pdf",
    beskrivning:
      "Checklista för systematiskt brandskyddsarbete — branddörrar, utrymningsvägar och rökgasevakuering.",
    omrade: "upphandling",
  },
  {
    id: "brandskydd-upphandling",
    titel: "Upphandling brandskydd / branddörrar",
    filnamn: "Mall_upphandling_brandskydd.docx",
    beskrivning:
      "Kravspecifikation vid byte eller service av branddörrar, utrymningsvägar och rökgassystem.",
    omrade: "upphandling",
  },
  {
    id: "avtalsvillkor-drift",
    titel: "Avtalsvillkor städ och fastighetsskötsel",
    filnamn: "Avtalsvillkor_stad_och_rondering.txt",
    beskrivning:
      "Vite vid utebliven städ/rondering, krav på anbudsgivare/underentreprenör och synlig ID06.",
    omrade: "upphandling",
  },
  {
    id: "stadschema-bilaga",
    titel: "Städschema — bilaga upphandling",
    filnamn: "Stadschema_bilaga.txt",
    beskrivning:
      "Hämtas från rondering-modulen när styrelsen konfigurerat månadsschemat för städ.",
    omrade: "upphandling",
  },
  {
    id: "ronderingsschema-bilaga",
    titel: "Ronderingsschema — bilaga upphandling",
    filnamn: "Ronderingsschema_bilaga.txt",
    beskrivning:
      "Hämtas från rondering-modulen när styrelsen konfigurerat fastighetsskötarschema.",
    omrade: "upphandling",
  },
];

export function filtreraMallarForUpphandling(): DokumentbankMall[] {
  return dokumentbankMallar.filter((mall) => mall.omrade === "upphandling");
}
