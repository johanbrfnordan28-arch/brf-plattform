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
  {
    id: "hd-o-4023-05-varmeledningsskada",
    mappId: "varmesystem",
    titel: "Värmeledningsskada — inte samma som vattenledningsskada",
    filnamn: "o-4023-05-varmeledningsskada.pdf",
    url: "/juridik/o-4023-05-varmeledningsskada.pdf",
    referens: "NJA 2006 s. 732 · Högsta domstolen Ö 4023-05",
    meddelad: "2006-12-27",
    sammanfattning:
      "HD slog fast att begreppet »vattenledningsskada« i bostadsrättslagen bara avser tappvattenledningar — inte läckage från värmeledningar, radiatorer eller andra värmeanordningar. Undantaget där medlem bara svarar vid försummelse gäller alltså inte värmeskador. För skador från värmesystemet gäller huvudregeln om underhållsansvar (och stadgarna) i stället.",
  },
  {
    id: "hd-t-2948-19-golvvarme",
    mappId: "varmesystem",
    titel: "Vattenburen golvvärme — underhåll under ytskiktet",
    filnamn: "t-2948-19-golvvarme.pdf",
    url: "/juridik/t-2948-19-golvvarme.pdf",
    referens: "NJA 2020 s. 822 · Högsta domstolen T 2948-19 (Knoppens golvvärmesystem)",
    meddelad: "2020-10-27",
    sammanfattning:
      "Ett vattenburet golvvärmesystem i duschrummet låg under golvbeläggningen. HD tolkade stadgarnas »lägenhetens golv« som ytskiktet — golvvärmen hörde därför till den del av huset som föreningen underhåller. Utgången beror på stadgarnas lydelse och hur systemet är installerat; jämför alltid med era egna stadgar.",
  },
  {
    id: "hd-t-9030-23-brf-ida",
    mappId: "forvaltning",
    titel: "Förvaltningsavtal — reklamationsfrist utan påföljd faller inte kravet",
    filnamn: "t-9030-23-brf-ida.pdf",
    url: "/juridik/t-9030-23-brf-ida.pdf",
    referens: "NJA 2025 s. 374 · Högsta domstolen T 9030-23 (Brf Ida)",
    meddelad: "2025-04-24",
    sammanfattning:
      "Brf Ida krävde skadestånd av sin ekonomiska/administrativa förvaltare (HSB Malmö) enligt ABFF 04. Förvaltaren menade att kravet kom för sent enligt en tremånadersfrist i avtalet. HD slog fast att fristen — som inte anger någon påföljd om den missas — inte i sig innebär att rätten till skadestånd går förlorad. Vill man att kravet ska falla måste det stå uttryckligen i avtalet. Styrelsen bör ändå reklamera utan onödigt dröjsmål.",
  },
] as const;

export function plattformDomarForMapp(mappId: string): PlattformDom[] {
  return PLATTFORM_DOMAR.filter((d) => d.mappId === mappId);
}
