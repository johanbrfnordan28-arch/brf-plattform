/**
 * Fasta vägledande domar som ingår i plattformen för alla föreningar.
 * PDF:er ligger under /public/juridik/
 */

export type PlattformDom = {
  id: string;
  /** Mapp-id i domMappar (t.ex. «ytskikt») */
  mappId: string;
  titel: string;
  filnamn: string;
  /** Publik URL till PDF */
  url: string;
  /** Kort sammanfattning för styrelsen */
  sammanfattning: string;
  /** Referens, t.ex. NJA 2019 s. 1013 */
  referens: string;
  /** Datum domen meddelades */
  meddelad: string;
};

/**
 * HD T 175-19 — läckande yttertak / ytskikt (NJA 2019 s. 1013).
 * Offentlig dom från Sveriges Domstolar.
 */
export const PLATTFORM_DOMAR: readonly PlattformDom[] = [
  {
    id: "hd-t-175-19-lackande-tak",
    mappId: "ytskikt",
    titel: "Läckande tak — ansvar för ytskikt (spackling och målning)",
    filnamn: "t-175-19-lackande-tak.pdf",
    url: "/juridik/t-175-19-lackande-tak.pdf",
    referens: "NJA 2019 s. 1013 · Högsta domstolen T 175-19",
    meddelad: "2019-12-23",
    sammanfattning:
      "Vid läckage från yttertaket (föreningens ansvar) fick bostadsrättshavaren ändå stå för spackling och målning av innertaket i lägenheten. Ytskikt hör normalt till medlemmens underhållsansvar enligt bostadsrättslagen, om stadgarna inte säger annat och föreningen inte varit vårdslös.",
  },
] as const;

export function plattformDomarForMapp(mappId: string): PlattformDom[] {
  return PLATTFORM_DOMAR.filter((d) => d.mappId === mappId);
}
