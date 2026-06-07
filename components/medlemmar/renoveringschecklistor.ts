import { vvsRenoveringChecklistaPunkter } from "@/components/medlemmar/vvs-renovering-krav";

export type ChecklistaPunkt = {
  id: string;
  text: string;
};

export type RenoveringsTyp = {
  id: string;
  etikett: string;
  beskrivning: string;
  alltidMedGrundkrav?: boolean;
  punkter: ChecklistaPunkt[];
};

/** Grundkrav visas alltid när minst en renoveringstyp är vald. */
export const grundkrav: RenoveringsTyp = {
  id: "grundkrav",
  etikett: "Grundkrav",
  beskrivning: "Gäller alla renoveringar — ska vara klart innan medlemmen får påbörja.",
  punkter: [
    {
      id: "anmalan",
      text: "Renoveringsanmälan är inlämnad till styrelsen med lägenhetsnummer och kontaktuppgifter.",
    },
    {
      id: "forsakring",
      text: "Giltigt försäkringsintyg för arbetet är uppladdat (ansvar vid skada i lägenhet eller till grannar).",
    },
    {
      id: "entreprenor",
      text: "Entreprenör eller hantverkare är angiven med organisationsnummer eller F-skatt där det krävs.",
    },
    {
      id: "startdatum",
      text: "Planerat startdatum och ungefärlig tidsplan är godkänd av styrelsen.",
    },
    {
      id: "startbesiktning-skador",
      text: "Startbesiktning med kontroll av befintliga skador i fastigheten och angränsande lägenheter — skador dokumenteras med uppladdade bilder. För ej dokumenterade skador ansvarar entreprenören.",
    },
    {
      id: "granninfo",
      text: "Information till grannar är skickad vid behov (buller, vattenavstängning, gemensamma ytor).",
    },
    {
      id: "ventilation-isolering",
      text: "Byggdamm får inte spridas till andra lägenheter eller ut i föreningens ventilationssystem. Ventiler och kanaler ska vara täckta så lägenheten isoleras från övriga huset under renoveringen.",
    },
    {
      id: "trapphus",
      text: "Extra städning av trapphus kan behövas — styrelsen avgör behovet och medlemmen faktureras. Vid täckning av trapphus ska täckningen vara tidsbegränsad, utföras fackmannamässigt och inte lämna spår efter tejp eller dylikt.",
    },
    {
      id: "brandskydd-gemensamt",
      text: "Ingrepp i brandcellsgränser, branddörrar eller utrymningsvägar kräver styrelsens godkännande och ska följa föreningens SBA-plan.",
    },
    {
      id: "branddorr-lgh",
      text: "Lägenhetsdörr mot trapphus får inte försämra brand- eller rökegenskaper — byte av dörr ska godkännas innan beställning.",
    },
    {
      id: "utrymning-renovering",
      text: "Utrymningsvägar, nödbelysning och rökgasfläktar i trapphus får inte blockeras eller stängas av under renoveringen.",
    },
  ],
};

export const renoveringsTyper: RenoveringsTyp[] = [
  {
    id: "malning",
    etikett: "Målning",
    beskrivning: "Målning av väggar, tak eller snickerier i lägenheten.",
    alltidMedGrundkrav: true,
    punkter: [
      {
        id: "rum",
        text: "Det framgår vilka rum som målas (vägg/tak/list) och vilka ytor som inte berörs.",
      },
      {
        id: "produkter",
        text: "Färg och lack är valda med hänsyn till ventilation, brandskydd och låg dammutbredning — inga olämpliga lösningsmedel inomhus utan åtgärd.",
      },
      {
        id: "skydd",
        text: "Skydd av golv, dörrar och gemensamma ytor vid transport av material är beskrivet. Täckning av trapphus sker fackmannamässigt, tidsbegränsat och utan spår efter tejp.",
      },
      {
        id: "ventilation",
        text: "Ventiler och kanaler i lägenheten ska vara täckta under målning så att färg- och byggdamm inte sprids till grannlägenheter eller in i föreningens ventilationssystem — lägenheten ska vara isolerad från övriga huset.",
      },
      {
        id: "trapphus-stadning",
        text: "Behov av extra städning i trapphus är avstämt med styrelsen; styrelsen avgör omfattningen och medlemmen faktureras vid behov.",
      },
    ],
  },
  {
    id: "slipning-golv",
    etikett: "Slipning golv",
    beskrivning: "Slipning och ytbehandling av trägolv eller liknande.",
    alltidMedGrundkrav: true,
    punkter: [
      {
        id: "typ",
        text: "Golvtyp och slipningsdjup/ytbehandling (olja, lack, vax) är specificerade.",
      },
      {
        id: "buller",
        text: "Buller- och dammutbredning — tider är avstämda med grannar och styrelsen.",
      },
      {
        id: "fukt",
        text: "Fuktskydd och torktider före/efter behandling framgår av underlaget.",
      },
      {
        id: "kompetens",
        text: "Utförare har erforderlig kompetens; maskiner med dammsugning används där det är möjligt.",
      },
    ],
  },
  {
    id: "badrum",
    etikett: "Badrumsrenovering",
    beskrivning: "Byte eller renovering av våtutrymme.",
    alltidMedGrundkrav: true,
    punkter: [
      {
        id: "vatrumsdokument",
        text: "Våtrumsdokument eller våtrumscertifikat ska kunna uppvisas vid färdigställande.",
      },
      {
        id: "stammar",
        text: "Ingripande i stammar, golvbrunn eller avlopp är anmält och koordinerat med föreningen.",
      },
      {
        id: "vatten",
        text: "Avstängning av vatten och eventuell tillfällig vattenförsörjning är planerad.",
      },
      {
        id: "avfall",
        text: "Byggavfall, transport och städ i trapphus är ordnat enligt föreningens rutiner.",
      },
      ...vvsRenoveringChecklistaPunkter,
    ],
  },
  {
    id: "kok",
    etikett: "Köksrenovering",
    beskrivning: "Byte av skåp, bänkskiva, vitvaror eller ytskikt i kök.",
    alltidMedGrundkrav: true,
    punkter: [
      {
        id: "omfattning",
        text: "Omfattning beskrivs: skåp, bänkskiva, vitvaror, golv och väggar.",
      },
      {
        id: "ventilation",
        text: "Köksfläkt och ventilation uppfyller gällande krav eller föreningens anvisningar.",
      },
      {
        id: "el",
        text: "Elarbete planeras enligt gällande regler; ny dragning eller kraftigare vitvaror är angivna.",
      },
      {
        id: "brand",
        text: "Brandskydd kring spis och ugn samt avstånd till brännbart material är kontrollerat.",
      },
      ...vvsRenoveringChecklistaPunkter,
    ],
  },
  {
    id: "flytt-kok-badrum",
    etikett: "Flytt av kök och badrum",
    beskrivning:
      "Kök eller badrum flyttas till ny plats i lägenheten (ny våtzon, nya stammar).",
    alltidMedGrundkrav: true,
    punkter: [
      {
        id: "placering",
        text: "Ny placering för kök och/eller badrum är tydligt angiven på skiss eller ritning.",
      },
      {
        id: "stammar-flytt",
        text: "Flytt av vatten, avlopp och eventuella stammar är anmält och godkänt av föreningen.",
      },
      {
        id: "vatzon",
        text: "Våtrumsregler och fuktskydd vid ny våtzon är beskrivna; våtrumsdokument planeras vid färdigställande.",
      },
      {
        id: "ventilation-spill",
        text: "Ventilation, spillvatten och köksfläkt vid ny placering är utredda.",
      },
      {
        id: "grann-stom",
        text: "Påverkan på grannlägenhet, stomme och bärande konstruktion under flytten är bedömd.",
      },
      ...vvsRenoveringChecklistaPunkter,
    ],
  },
  {
    id: "planlosning",
    etikett: "Ändrad planlösning kök och badrum",
    beskrivning:
      "Väggar rivs eller flyttas — ny indelning utan att hela våtzonen flyttas till annat rum.",
    alltidMedGrundkrav: true,
    punkter: [
      {
        id: "ritning",
        text: "Ritning före och efter (enkel skiss räcker i demo) är uppladdad.",
      },
      {
        id: "godkannande",
        text: "Styrelsens skriftliga godkännande av planändring finns eller begärs innan start.",
      },
      {
        id: "bygglov",
        text: "Eventuell bygganmälan eller lov — vem som ansvarar och status är angiven.",
      },
      {
        id: "stammar-barande",
        text: "Påverkan på stammar, bärande konstruktion och grannlägenheter är utredd.",
      },
    ],
  },
  {
    id: "haltagning",
    etikett: "Håltagning i bärande vägg",
    beskrivning: "Öppning eller hål i bärande vägg eller konstruktion.",
    alltidMedGrundkrav: true,
    punkter: [
      {
        id: "konstruktor",
        text: "Konstruktionsutredning av behörig konstruktör eller motsvarande handling finns.",
      },
      {
        id: "styrelse-godkannande",
        text: "Styrelsens godkännande av ingreppet i bärande vägg är dokumenterat.",
      },
      {
        id: "besiktning",
        text: "Utförande och efterbesiktning enligt handling är planerade.",
      },
      {
        id: "arbetsmiljo",
        text: "Arbetsmiljö, damm och tillfällig avstämning mot grannar är beskrivna.",
      },
    ],
  },
];

export function byggChecklista(valdaTyper: string[]): {
  sektion: RenoveringsTyp;
  punkter: ChecklistaPunkt[];
}[] {
  if (valdaTyper.length === 0) return [];

  const sektioner: { sektion: RenoveringsTyp; punkter: ChecklistaPunkt[] }[] = [
    { sektion: grundkrav, punkter: grundkrav.punkter },
  ];

  for (const typ of renoveringsTyper) {
    if (valdaTyper.includes(typ.id)) {
      sektioner.push({ sektion: typ, punkter: typ.punkter });
    }
  }

  return sektioner;
}

export function checklistaPunktId(sektionId: string, punktId: string): string {
  return `${sektionId}:${punktId}`;
}
