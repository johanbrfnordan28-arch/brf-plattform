import type { GuideFilm } from "@/components/guider/guider";

export const energiGuideFilm: GuideFilm = {
  id: "energi-varme-belysning",
  modul: "Energi & drift",
  titel: "Värme och belysning — spara utan att byta allt",
  längd: "ca 45 sek",
  beskrivning:
    "Skillnaden mellan teknisk livslängd och energiåtgärder som sänker driftkostnaden direkt.",
  scener: [
    {
      titel: "Två olika saker",
      text: "Ett fönsterbyte planeras efter 40 år — det är teknisk livslängd. Injustering av värme och LED i trapphus är energiåtgärder som ger effekt redan i år.",
    },
    {
      titel: "Värmesystem",
      text: "Balansering, styrning och rondering av undercentralen minskar slitage och onödig förbrukning — utan att ni byter hela stammen.",
    },
    {
      titel: "Belysning",
      text: "Rörelsevakter, rätt tider och LED sänker elräkningen. Armaturbyte planeras fortfarande i underhållsplanen när det är dags.",
    },
    {
      titel: "Levande plan",
      text: "Energiåtgärder dokumenteras här; stora byten ligger kvar i underhållsplanen — båda behövs.",
    },
  ],
};
