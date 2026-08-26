/**
 * Vägledning om skador, försäkring, ansvar och styrelsens roller.
 * Språket är avsett för styrelser — konkret, utan onödig jargong.
 */

export type InfoBlock =
  | { titel: string; text: string; punkter?: undefined }
  | { titel: string; text?: string; punkter: string[] };

export const fastighetsSkadorInfo: {
  ingress: string;
  block: InfoBlock[];
} = {
  ingress:
    "När skador uppstår behövs både snabb handling och tydlig dokumentation. Historik och spårbarhet skyddar föreningen, medlemmarna och nästa styrelse — långt efter att vattnet har torkat.",
  block: [
    {
      titel: "Dokumentation och spårbarhet",
      text: "Spara vad som hänt, när, var, vilka som berörs och vilka beslut som fattats. Utan underlag blir det svårt att följa upp försäkringsärenden, entreprenörsgarantier och framtida tvister.",
    },
    {
      titel: "Följdskador i huset",
      text: "En skada i ett badrum på plan 4 drabbar ofta lägenheterna under. Kartlägg tidigt vilka som kan vara berörda och dokumentera omfattningen — det sparar konflikter och missförstånd.",
    },
    {
      titel: "Försäkring — medlem och förening",
      punkter: [
        "Medlemmars skador hanteras av respektive försäkringsbolag, oavsett vem som orsakat skadan.",
        "Kostnader mellan försäkringsbolagen reglerar bolagen själva (regress).",
        "Föreningens ansvar styrs av fastighetsförsäkringen. Skyldigheter och ansvar finns också i stadgarna och i bostadsrättslagen.",
        "Försäkringsbolaget ersätter enligt villkoren — ersättningen kan därför skilja sig åt mellan liknande skador.",
      ],
    },
    {
      titel: "Förslitning och bristande underhåll",
      text: "Beror skadan på förslitning eller bristande underhåll ersätts vanligtvis inte själva orsaken. Följderna av skadan kan däremot ersättas. Skriv in bedömningen i registret så att den går att följa i efterhand.",
    },
    {
      titel: "När entreprenör kan vara orsak",
      punkter: [
        "Entreprenören ger ofta 2 års garanti och har vanligtvis 10 års ansvarstid.",
        "Garanti och ansvar gäller mellan köparen (medlem eller förening) och entreprenören.",
        "Flyttar medlemmen som köpt tjänsten följer garanti och ansvar med. Notera därför köpare och när arbetet utfördes.",
      ],
    },
    {
      titel: "Ta in extern hjälp",
      text: "Vid mer omfattande eller känsliga skador är det ofta klokt att ta in oberoende stöd för utredning och hantering. Goda grannar kan bli osams, och det kan vara svårt att fatta beslut som drabbar vänner ekonomiskt. Extern hjälp ger avstånd, struktur och tydligare kommunikation med boende och försäkringsbolag.",
      punkter: [
        "Besiktningsman — bedömer skada, omfattning och teknisk orsak.",
        "Skadeutredare — samordnar kontakter med boende och försäkringsbolag.",
      ],
    },
    {
      titel: "Opartiskhet och jäv",
      punkter: [
        "Är styrelsemedlemmar själva drabbade får de inte delta i beslut som gynnar dem.",
        "Entreprenörer och besiktningsmän som kommer via försäkringsbolagen kan uppfattas som partiska — de har ofta en beroendeställning till bolaget. Det är inte alltid så, men styrelsen bör vara medveten om risken och vid behov komplettera med egen oberoende bedömning.",
      ],
    },
    {
      titel: "Policy, stämma och arbetsgrupp",
      punkter: [
        "Skapa gärna en tydlig policy för hur skador ska hanteras — och överväg att skriva in huvuddragen i stadgarna så att framtida styrelser har samma spelregler.",
        "I kniviga fall: låt stämman besluta.",
        "Vid behov tillsätt en arbetsgrupp där även övriga medlemmar kan delta. Det sprider ansvaret och ökar förtroendet för processen.",
      ],
    },
  ],
};
