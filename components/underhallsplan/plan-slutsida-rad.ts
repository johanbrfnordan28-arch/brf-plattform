/** Erfarenhetsbaserade råd och checklista på slutsidan — inga personnamn. */

export type PlanSlutsidaRadAvsnitt = {
  rubrik: string;
  punkter: string[];
};

export type PlanSlutsidaBilagaLank = {
  etikett: string;
  url: string;
  kommentar?: string;
};

export type PlanSlutsidaBilagaAvsnitt = {
  rubrik: string;
  ingress: string;
  viktigt?: string[];
  lankar: PlanSlutsidaBilagaLank[];
};

export const PLAN_SLUTSIDA_ERFARENHET = {
  bygg: "över 40 års erfarenhet av byggarbete i bostadsrättsföreningar",
  styrelse: "över 30 års erfarenhet av styrelsearbete och ekonomisk förvaltning",
} as const;

export const PLAN_SLUTSIDA_LEVANDE_PLAN =
  "Underhållsplanen är ett levande dokument som förändras över tid. Åtgärder kan behöva läggas tidigare om slitage är högre än normalt, eller senareläggas om skicket bedöms vara gott. Uppdatera år och tillfällen i registret när verkligheten avviker från planen.";

export const PLAN_SLUTSIDA_RAD: PlanSlutsidaRadAvsnitt[] = [
  {
    rubrik: "Levande plan — justera tiderna",
    punkter: [
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
      "Använd tillverkarens skötselråd som bilaga till planen. Råden är ofta lika inom samma material, men kontrollera alltid exakt material och produkt när fabrikatet är känt.",
    ],
  },
  {
    rubrik: "Materialstyrda bilagor",
    punkter: [
      "Fönster ska följas upp efter material: trä, aluminiumklätt trä, PVC/plast och helaluminium har olika krav på målning, tvätt, tätningar och beslag.",
      "Lås ska delas upp i vanlig cylinder/låshus och lås med elslutbleck eller kodlås. Fel smörjmedel eller fel justering kan ge driftstopp, särskilt på elslutbleck.",
      "Spara länkar till skötselråd i bilagorna och uppdatera dem när föreningen byter fabrikat, låssystem eller större komponent.",
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
    rubrik: "För styrelsen",
    punkter: [
      "Planen är beslutsunderlag över flera mandatperioder. Behåll ytor, antal och vad som gjordes vid renoveringar — även där arbetet redan är utfört.",
      "Håll besiktningar (OVK, hissar, brandskydd m.m.) i tid; förseningar blir ofta dyrare än planerat underhåll.",
      "Vid större projekt: jämförbara offerter, tydlig omfattning i avtal och information till medlemmarna i god tid.",
    ],
  },
];

/** Checklista för årlig genomgång — utan namn, lämplig att bocka av vid utskrift. */
export const PLAN_SLUTSIDA_CHECKLISTA: string[] = [
  "Gå igenom planerade tider (föregående sida) — behöver något läggas tidigare eller senare?",
  "Stäm av skick efter vinter/väta: tak, fasad, fönster, avlopp, källare.",
  "Kontrollera att bilagelänkarna till skötselråd fortfarande stämmer med fastighetens material och fabrikat.",
  "För fönster: verifiera material per läge/adress innan ni beställer målning, renovering eller rengöring.",
  "För lås: skilj på vanlig cylinder/låshus, kodlås och elslutbleck innan service beställs.",
  "Uppdatera underhållstillfällen i steg 3 om besiktning eller entreprenör ger ny bedömning.",
  "Kontrollera att avsättning kr/m²/år fortfarande är rimlig (steg 6).",
  "Säkerställ att obligatoriska besiktningar är bokade eller genomförda.",
  "Vid fukt, läcka eller återkommande skada: utred orsak innan ni beställer «snabb» åtgärd.",
  "Dokumentera ytor/antal och noteringar efter utförda arbeten (steg 2 och 3).",
  "Informera styrelsen och vid behov medlemmarna om ändrade prioriteringar.",
];

export const PLAN_SLUTSIDA_BILAGA_INTRO =
  "Bilagorna nedan är startlänkar till skötselråd från tillverkare och leverantörer. Byt eller komplettera länkarna när föreningen vet exakt fabrikat, produktserie eller låssystem. Vid konflikt gäller alltid den faktiska produktens drift- och underhållsanvisning.";

export const PLAN_SLUTSIDA_BILAGOR: PlanSlutsidaBilagaAvsnitt[] = [
  {
    rubrik: "Fönster — välj råd efter material",
    ingress:
      "Fönster är särskilt materialberoende. Trä kräver kontroll av färgfilm och fukt, aluminiumklätt trä har lägre utvändigt underhåll, PVC/plast rengörs på annat sätt och helaluminium har egna beslag- och ytkrav.",
    viktigt: [
      "Notera material per adress/läge i komponentregistret innan ni hänvisar till bilagan.",
      "Beslag, gångjärn, tätningslister och dräneringshål ska kontrolleras även när ytan är underhållssnål.",
    ],
    lankar: [
      {
        etikett: "Elitfönster — rengör och underhåll fönster",
        url: "https://www.elitfonster.se/reportage-artiklar/sa-tar-du-hand-om-dina-fonster/",
        kommentar: "Trä, aluminiumytor, beslag, tätningar och dränering.",
      },
      {
        etikett: "NorDan — sköt om fönster",
        url: "https://www.nordan.se/kunskap/skot-om-dina-fonster",
        kommentar: "Träfönster, aluminiumbeklädnad och löpande kontroll.",
      },
      {
        etikett: "REHAU — PVC-fönster och dörrar",
        url: "https://www.rehau.com/se-sv/fonster/pvc-fonster-dorrar",
        kommentar: "PVC/plastprofiler och grundläggande skötsel.",
      },
    ],
  },
  {
    rubrik: "Dörrar, ytskikt och beslag",
    ingress:
      "Dörrarnas yta, karm, gångjärn och beslag påverkar både livslängd och låsfunktion. Trä, ekfaner, målad yta, aluminium och plåt ska inte behandlas på samma sätt.",
    viktigt: [
      "Kontrollera att dörrbladet stänger utan listtryck innan lås eller elslutbleck justeras.",
      "Efterdra beslag varsamt så att ytskiktet inte skadas.",
    ],
    lankar: [
      {
        etikett: "Swedoor — ytbehandling ytterdörrar i trä",
        url: "https://www.swedoor.se/arkitektradgivaren/ytbehandling-ytterdorrar-i-tra",
        kommentar: "Målade dörrar, faner/ek och återkommande rengöring.",
      },
      {
        etikett: "Swedoor — lås och beslag",
        url: "https://www.swedoor.se/produkter-sv/doerrhandtag-och-tillval/las-och-beslag",
        kommentar: "Beslag, slutbleck och säkerhetstillval.",
      },
    ],
  },
  {
    rubrik: "Lås — vanlig cylinder jämfört med elslutbleck",
    ingress:
      "Låsservice ska särskilja mekanisk cylinder/låshus från elslutbleck, kodlås och passersystem. Det som är rätt för en cylinder kan vara fel för elslutbleckets mekanik eller elektronik.",
    viktigt: [
      "Använd endast låsspray, låsfett och intervall som låstillverkaren anger.",
      "Elslutbleck kräver rätt dörrspringa, parallell montering och kontroll av dörrstängare/gångjärn. Elektriska delar ska hanteras enligt produktanvisning.",
    ],
    lankar: [
      {
        etikett: "ASSA ABLOY — service och underhåll",
        url: "https://www.assaabloy.com/se/sv/solutions/products/cylindrar-las-och-nycklar/konsument-gds/service-underhall",
        kommentar: "Låsspray, cylinderunderhåll och intervall.",
      },
      {
        etikett: "ASSA ABLOY — underhåll av eltryckeslås/elslutbleck",
        url: "https://static-mpc-spear-production.assaabloy.com/asfe/Fetchfile.aspx?id=49846",
        kommentar: "Underhåll, låsfett, elektriska delar och dörrfunktion.",
      },
      {
        etikett: "ASSA ABLOY — elslutbleck 992-serien",
        url: "https://static-mpc-trioving-oneshop-production.assaabloy.com/fileexplorer/Fetchfile.aspx?id=66279",
        kommentar: "Montering, dörrspringa och skötsel för elslutbleck.",
      },
    ],
  },
  {
    rubrik: "Fasad och målad träpanel",
    ingress:
      "För fasad gäller skötselråden ofta färgsystemet och panelens behandling snarare än bara träslaget. Följ samma system vid rengöring, bättring och ommålning när det är möjligt.",
    viktigt: [
      "Dokumentera befintlig färgtyp och kulör innan nästa ommålning planeras.",
      "Åtgärda skador i färgfilm och ändträ tidigt för att undvika fuktinträngning.",
    ],
    lankar: [
      {
        etikett: "Sveden Trä / Alcro — skötsel och underhåll för målad fasadpanel",
        url: "https://www.svedentra.se/wp-content/uploads/dalapanel-skotsel-och-underhall-ultra-pro-h10-alcro-tackfarger.pdf",
        kommentar: "Fabriksbehandlad träpanel och Alcro-färgsystem.",
      },
    ],
  },
];
