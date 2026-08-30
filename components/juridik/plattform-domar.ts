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
 * Fasta vägledande domar — offentliga avgöranden från Sveriges Domstolar.
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
  {
    id: "hd-o-3206-13-rokkanal",
    mappId: "rokkanaler",
    titel: "Rökkanal och braskamin — skorstensstock hör till huset",
    filnamn: "o-3206-13-rokkanal.pdf",
    url: "/juridik/o-3206-13-rokkanal.pdf",
    referens: "NJA 2015 s. 566 · Högsta domstolen Ö 3206-13 (Trudhems skorstensstock)",
    meddelad: "2015-07-08",
    sammanfattning:
      "En medlem anslöt en braskamin till en kanal i skorstensstocken utan föreningens tillstånd. HD slog fast att skorstensstock och rökkanal hör till huset — inte till lägenheten — även om kanalen bara betjänar den lägenheten. Ingrepp i rökkanal kräver därför föreningens godkännande; utan tillstånd var installationen olovlig och medlemmen fick återställa.",
  },
] as const;

export function plattformDomarForMapp(mappId: string): PlattformDom[] {
  return PLATTFORM_DOMAR.filter((d) => d.mappId === mappId);
}
