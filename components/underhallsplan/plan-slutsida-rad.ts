/** Erfarenhetsbaserade råd och checklista på slutsidan — inga personnamn. */

export type PlanSlutsidaRadAvsnitt = {
  rubrik: string;
  punkter: string[];
};

export const PLAN_SLUTSIDA_ERFARENHET = {
  bygg: "över 40 års erfarenhet av byggarbete i bostadsrättsföreningar",
  styrelse: "över 30 års erfarenhet av styrelsearbete och ekonomisk förvaltning",
} as const;

export const PLAN_SLUTSIDA_LEVANDE_PLAN =
  "Underhållsplanen är ett levande dokument. Styrelse eller förvaltare uppdaterar den när verkligheten avviker: lägg till eller ta bort komponenter, flytta år och tillfällen, och håll registret aktuellt. Nästa styrelse ska kunna öppna planen och snabbt förstå vad som gäller.";

export const PLAN_SLUTSIDA_PROFFS =
  "Det är viktigt att planen från början tas fram av en professionell part med erfarenhet av fastigheter och BRF. Då blir omfattning, intervall och kostnader mer tillförlitliga — och det levande arbetet i verktyget får en solid grund.";

export const PLAN_SLUTSIDA_RAD: PlanSlutsidaRadAvsnitt[] = [
  {
    rubrik: "Professionell grund — levande arbete",
    punkter: [
      PLAN_SLUTSIDA_PROFFS,
      PLAN_SLUTSIDA_LEVANDE_PLAN,
      "Tiderna i listan på föregående sida är riktmärken, inte löften. Efter besiktning, skadebesök eller entreprenörsbedömning: flytta planerat år fram eller tillbaka i steg 3.",
      "Dokumentera kort varför ni ändrade — nästa styrelse och nästa kalkyl blir tydligare.",
    ],
  },
  {
    rubrik: "Underhåll förlänger livslängden",
    punkter: [
      "En välskött fasad, tak eller fönster behöver inte bytas ut lika ofta som ett försummat. Målning, tätning och mindre lagningar är ofta en bråkdel av kostnaden för ett stort byte — men de förskjuter det stora ingreppet med många år.",
      "Planera både större och mindre tillfällen: efter fönsterbyte kommer ofta målning; efter takomläggning kan plåt och yta underhållas länge innan nästa omläggning.",
    ],
  },
  {
    rubrik: "Förstå orsaken — inte bara laga symptomet",
    punkter: [
      "De flesta åtgärder är i sig enkla att utföra, men skadan kommer tillbaka om man inte förstår varför den uppstod.",
      "Fråga alltid: fukt, fel fall, bristande ventilation, fel material, slitage eller ålder? Rätta grundorsaken innan ni målar över, byter en del eller lägger till ny tätning.",
      "Vid återkommande problem (läckage, rost, sprickor, kondens): ta in sakkunnig bedömning innan ni låser nästa stora post i planen.",
    ],
  },
  {
    rubrik: "Balans mellan kostnad, skick och marknad",
    punkter: [
      "Samma åtgärd kan kosta olika mycket beroende på entreprenörens beläggning, säsong och fastighetens förutsättningar. Använd planens kostnader som rimliga nivåer, inte som offert.",
      "Avsättning kr/m²/år (steg 6) är en jämn buffert — den ska täcka både löpande underhåll och att ni successivt bygger upp för tyngre år.",
    ],
  },
  {
    rubrik: "Energi skiljer sig från stort byte",
    punkter: [
      "Injustering av värme, LED och styrning av belysning sänker ofta driftkostnaden direkt — det ersätter inte planerat fönster- eller takbyte.",
      "Dokumentera energiåtgärder i modulen Energi & drift; stora komponentbyten ligger kvar här i planen med längre intervall.",
    ],
  },
  {
    rubrik: "K3 och komponentavskrivning",
    punkter: [
      "Från 2026 ska BRF tillämpa K3: byggnaden delas upp i komponenter med egna nyttjandeperioder. Använd registret och avskrivningstiderna som underlag till ekonomisk förvaltare.",
      "Underhållsintervall (när ni åtgärdar) är inte samma sak som avskrivningstid (hur länge komponenten skrivs av). Kort underhåll — målning, spolning — är normalt inte egna K3-komponenter.",
      "Stomme och grund sätts ofta till ca 120 år (FAR, betongstomme) i anläggningsregistret; övriga delar (tak, fasad, stammar, fönster, hiss m.m.) finns i er plan.",
    ],
  },
  {
    rubrik: "För styrelsen — och nästa styrelse",
    punkter: [
      "Planen är beslutsunderlag över flera mandatperioder. Behåll ytor, antal och vad som gjordes vid renoveringar — även där arbetet redan är utfört.",
      "Håll bara kvar komponenter och delar som behövs. Ta bort det som inte hör till er fastighet — då blir slutprodukten enklare att arbeta i.",
      "Håll besiktningar (OVK, hissar, brandskydd m.m.) i tid; förseningar blir ofta dyrare än planerat underhåll.",
      "Vid större projekt: jämförbara offerter, tydlig omfattning i avtal och information till medlemmarna i god tid.",
    ],
  },
];

/** Checklista för årlig genomgång — utan namn, lämplig att bocka av vid utskrift. */
export const PLAN_SLUTSIDA_CHECKLISTA: string[] = [
  "Gå igenom planerade tider (föregående sida) — behöver något läggas tidigare eller senare?",
  "Kontrollera att planen bara innehåller aktuella komponenter — lägg till eller ta bort i steg 3.",
  "Stäm av K3-avskrivningstider i komponentregistret med ekonomisk förvaltare inför årsredovisning.",
  "Stäm av skick efter vinter/väta: tak, fasad, fönster, avlopp, källare.",
  "Uppdatera underhållstillfällen i steg 3 om besiktning eller entreprenör ger ny bedömning.",
  "Kontrollera att avsättning kr/m²/år fortfarande är rimlig (steg 6).",
  "Säkerställ att obligatoriska besiktningar är bokade eller genomförda.",
  "Vid fukt, läcka eller återkommande skada: utred orsak innan ni beställer «snabb» åtgärd.",
  "Dokumentera ytor/antal och noteringar efter utförda arbeten (steg 2 och 3).",
  "Informera styrelsen och vid behov medlemmarna om ändrade prioriteringar — så nästa styrelse förstår beslutet.",
];
