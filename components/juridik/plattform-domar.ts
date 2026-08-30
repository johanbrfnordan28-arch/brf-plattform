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
  {
    id: "hd-t-3372-20-grannhusets-vattenskada",
    mappId: "grannfastighet",
    titel: "Gårdsläckage — skada på grannfastighet (dagvattenledning)",
    filnamn: "t-3372-20-grannhusets-vattenskada.pdf",
    url: "/juridik/t-3372-20-grannhusets-vattenskada.pdf",
    referens: "NJA 2021 s. 473 · Högsta domstolen T 3372-20 (Grannhusets vattenskada)",
    meddelad: "2021-06-21",
    sammanfattning:
      "En trasig dagvattenledning på BRF:s fastighet (innergård) orsakade vatteninträngning och skador i grannens källare. HD slog fast att föreningen var skadeståndsskyldig: gammal anläggning kräver skälig kontroll och underhåll med hänsyn till grannarna (jordabalken). Att vänta tills läckaget syns räcker inte — oaktsam underlåtenhet kan ge ersättningsansvar även utan aktivt felhandlande.",
  },
  {
    id: "hd-t-2062-06-fiolbackens-vattenskada",
    mappId: "vatten-skador",
    titel: "Våtrumsskada — ny ägare ansvarar inte för tidigare ägares fel",
    filnamn: "t-2062-06-fiolbackens-vattenskada.pdf",
    url: "/juridik/t-2062-06-fiolbackens-vattenskada.pdf",
    referens: "NJA 2007 s. 709 · Högsta domstolen T 2062-06 (Fiolbackens vattenskada)",
    meddelad: "2007-10-23",
    sammanfattning:
      "Tidigare bostadsrättshavare tog bort fuktspärren i badrummet; vid duschning läckte vatten ut och skadade föreningens fastighet utanför lägenheten. HD slog fast att de nya ägarna inte hade strikt ansvar för skadan — skadestånd utanför lägenheten kräver vårdslöshet hos den som kravet riktas mot. Stadgar kan inte flytta över tidigare ägares skadeståndsansvar till köparen.",
  },
] as const;

export function plattformDomarForMapp(mappId: string): PlattformDom[] {
  return PLATTFORM_DOMAR.filter((d) => d.mappId === mappId);
}
