import type {
  EgenkontrollBransch,
  EgenkontrollPunktMall,
} from "@/components/dokumentbank/mallar/egenkontroll-typer";

function bas(yrke: string): EgenkontrollPunktMall[] {
  return [
    {
      rubrik: "Avstämning mot handling",
      beskrivning:
        "Utfört arbete är avstämt mot aktuell ritning / relationshandling innan och under arbetets gång.",
    },
    {
      rubrik: "Material för svensk marknad",
      beskrivning:
        "Material och produkter är avsedda för svenska marknaden och typgodkända/CE-märkta för avsett bruk.",
    },
    {
      rubrik: "Tillverkarens montageanvisning",
      beskrivning: `Arbetet är utfört enligt tillverkarens montage- och installationsanvisning för ${yrke}.`,
      amaNot: "AMA styr där anvisning saknas — handling → AMA → tillverkare.",
    },
  ];
}

function avslut(): EgenkontrollPunktMall[] {
  return [
    {
      rubrik: "Skötsel- och driftinstruktioner",
      beskrivning:
        "Skötsel-, drift- och underhållsinstruktioner är överlämnade till beställaren enligt överenskommelse.",
    },
    {
      rubrik: "Dokumentation till beställare",
      beskrivning:
        "Protokoll, instruktioner, materialredovisning och ev. relationshandlingar är överlämnade till beställaren.",
    },
  ];
}

const TORKTIDER: EgenkontrollPunktMall = {
  rubrik: "Torktider — dokumenterade",
  beskrivning:
    "Torktider enligt tillverkarens anvisning är dokumenterade (datum, temperatur, skikt). Nästa skikt eller belastning påbörjas först efter godkänd torktid.",
  kravSpecifikPlats: true,
};

export const VVS_EGENKONTROLL_PUNKTER: EgenkontrollPunktMall[] = [
  ...bas("VVS"),
  {
    rubrik: "Påfrestningar i drift",
    beskrivning:
      "Valda produkter och installationssätt är dimensionerade för de påfrestningar som normalt förekommer i föreningens VVS-installationer.",
  },
  {
    rubrik: "Infästning vattenledning — vägg",
    beskrivning:
      "Vattenledningar i vägg är infästa enligt handling, AMA och tillverkarens anvisning med hänsyn till expansion och genomföringar.",
    kravSpecifikPlats: true,
  },
  {
    rubrik: "Infästning vattenledning — tak",
    beskrivning:
      "Vattenledningar i tak/konstruktion är infästa och stödda enligt handling och AMA.",
    kravSpecifikPlats: true,
  },
  {
    rubrik: "Infästning avlopp — vägg",
    beskrivning:
      "Avloppsledningar i vägg är infästa enligt handling och AMA (lutning, stöd, genomföringar).",
    kravSpecifikPlats: true,
  },
  {
    rubrik: "Infästning avlopp — tak",
    beskrivning:
      "Avloppsledningar i tak/konstruktion är infästa enligt handling och AMA.",
    kravSpecifikPlats: true,
  },
  {
    rubrik: "Inspektionsluckor inbyggda delar (avlopp och vatten)",
    beskrivning:
      "Inbyggda delar har tillgängliga inspektionsluckor för avlopp och vattenledning enligt projektering.",
    kravSpecifikPlats: true,
  },
  {
    rubrik: "Tekniskt skåp för installationer",
    beskrivning:
      "Tekniskt skåp är monterat, tillgängligt och innehåller installationer enligt handling.",
    kravSpecifikPlats: true,
  },
  {
    rubrik: "Läckindikationsrör (läck ut) — teknikskåp och inbyggda delar",
    beskrivning:
      "Läck ut-rör eller motsvarande läckageindikation finns i tekniskt skåp och inbyggda delar enligt föreskrift.",
    kravSpecifikPlats: true,
  },
  {
    rubrik: "Stöd, expansion och genomföringar (övrigt)",
    beskrivning: "Övriga stöd, expansion och genomföringar är verifierade.",
    kravSpecifikPlats: true,
  },
  {
    rubrik: "Isolering, brand och ljud",
    beskrivning:
      "Isolering, brandtätning och ljudkrav enligt projektering är verifierade.",
    amaNot: "AMA VVS & AF.",
  },
  {
    rubrik: "Provtryckning",
    beskrivning:
      "Provtryckning är genomförd, dokumenterad och godkänd. Protokoll finns bilagt eller refereras.",
    amaNot: "AMA VVS & AF — täthet och provning.",
  },
  {
    rubrik: "Funktionsprov",
    beskrivning:
      "Funktionsprov av avstängningar, cirkulation m.m. är utförda och dokumenterade.",
  },
  ...avslut(),
];

export const EL_EGENKONTROLL_PUNKTER: EgenkontrollPunktMall[] = [
  ...bas("elinstallationer"),
  {
    rubrik: "Behörighet och auktorisation (el)",
    beskrivning:
      "Arbetet är utfört av behörig elinstallatör hos företag med auktorisation enligt Elsäkerhetslagen. Registrerings-/behörighetsuppgifter kan visas beställaren.",
  },
  {
    rubrik: "Isolationsmätning",
    beskrivning:
      "Isolationsmätning är genomförd enligt gällande regler (t.ex. SS-EN 61557). Mätvärden, datum och att gränsvärden uppfylls är dokumenterade.",
  },
  {
    rubrik: "Jordning och potentialutjämning",
    beskrivning:
      "Jordning, skyddsledare och potentialutjämning är kontrollerade enligt projektering och SS 436 40 00.",
  },
  {
    rubrik: "Funktionsprov och skydd",
    beskrivning:
      "Funktionsprov av skydd (jordfelsskydd, automatsäkringar m.m.) är utförda och dokumenterade.",
  },
  {
    rubrik: "Elsäkerhetsdokumentation",
    beskrivning:
      "Erforderlig eldokumentation (t.ex. slutbesiktning/egenkontroll enligt elregler) är upprättad och överlämnad.",
  },
  ...avslut(),
];

export const MALNING_EGENKONTROLL_PUNKTER: EgenkontrollPunktMall[] = [
  ...bas("målning och ytbehandling"),
  {
    rubrik: "Underarbete och ytrengöring",
    beskrivning:
      "Underlaget är preparerat enligt tillverkarens krav (rengöring, slipning, grundning).",
    kravSpecifikPlats: true,
  },
  TORKTIDER,
  {
    rubrik: "Skikt och miljö",
    beskrivning:
      "Antal skikt, produktval och applicering sker enligt anvisning (temperatur, luftfuktighet, ventilation).",
    kravSpecifikPlats: true,
  },
  {
    rubrik: "Slutkontroll yta",
    beskrivning:
      "Slutlig yta är kontrollerad avseende täckning, färgton och skador. Anmärkningar är åtgärdade eller dokumenterade.",
    kravSpecifikPlats: true,
  },
  ...avslut(),
];

export const BYGG_EGENKONTROLL_PUNKTER: EgenkontrollPunktMall[] = [
  ...bas("byggnadsarbeten"),
  {
    rubrik: "Infästning och bärande konstruktion",
    beskrivning:
      "Infästningar och bärande delar är utförda enligt handling, BBR och AMA Hus.",
    kravSpecifikPlats: true,
  },
  {
    rubrik: "Brand och ljud",
    beskrivning:
      "Brandcellsgränser, brandtätning och ljudkrav enligt projektering är verifierade.",
    kravSpecifikPlats: true,
  },
  {
    rubrik: "Fuktsäkerhet",
    beskrivning:
      "Fuktskydd, luftning och uttorkning är hanterade enligt projektering; fuktmätning dokumenteras vid behov.",
    kravSpecifikPlats: true,
  },
  TORKTIDER,
  {
    rubrik: "Slutgenomgång",
    beskrivning:
      "Slutlig genomgång av utfört byggarbete är dokumenterad med eventuella öppna punkter.",
  },
  ...avslut(),
];

export const FASAD_EGENKONTROLL_PUNKTER: EgenkontrollPunktMall[] = [
  ...bas("fasadsystem"),
  {
    rubrik: "Infästning och bärverk",
    beskrivning:
      "Infästning och bärprofil är utförd enligt tillverkarens systemdokumentation och handling.",
    kravSpecifikPlats: true,
  },
  {
    rubrik: "Luftspalt och fuktskydd",
    beskrivning:
      "Luftspalt, vindskydd och fuktbarriärer är monterade enligt systemet.",
    kravSpecifikPlats: true,
  },
  TORKTIDER,
  {
    rubrik: "Tätning och genomföringar",
    beskrivning:
      "Genomföringar, fogar och tätningar är utförda enligt anvisning.",
    kravSpecifikPlats: true,
  },
  ...avslut(),
];

export const TAK_EGENKONTROLL_PUNKTER: EgenkontrollPunktMall[] = [
  ...bas("taktäckning"),
  {
    rubrik: "Fall, lutning och avvattning",
    beskrivning:
      "Fall, rännor och avvattning är utförda enligt handling och tillverkarens krav.",
    kravSpecifikPlats: true,
  },
  {
    rubrik: "Täthet och infästning",
    beskrivning:
      "Tätskikt/täckning och infästning är utförda enligt systemdokumentation.",
    kravSpecifikPlats: true,
  },
  TORKTIDER,
  {
    rubrik: "Snö- och ras skydd",
    beskrivning:
      "Snörasskydd, stege och säkerhetsdetaljer är monterade enligt projektering.",
    kravSpecifikPlats: true,
  },
  ...avslut(),
];

export const BADRUM_STAM_EGENKONTROLL_PUNKTER: EgenkontrollPunktMall[] = [
  ...bas("badrum och stambyte"),
  {
    rubrik: "BKR/GVK — våtrum och tätskikt",
    beskrivning:
      "Våtrumsarbete följer Byggkeramikrådets branschregler (BKR/GVK). Tätskikt, golvbrunn och våtzoner är dokumenterade.",
    kravSpecifikPlats: true,
  },
  {
    rubrik: "Säker Vatteninstallation (där VVS ingår)",
    beskrivning:
      "VVS-delar följer Säker Vatteninstallation — läckageskydd, dokumentation och kvalificerad personal.",
    kravSpecifikPlats: true,
  },
  TORKTIDER,
  {
    rubrik: "Provtryckning och stam",
    beskrivning:
      "Stamledningar/provtryckning är genomförd och protokoll finns. Avstängningar och driftsättning dokumenterade.",
    kravSpecifikPlats: true,
  },
  {
    rubrik: "Funktionsprov våtrum",
    beskrivning:
      "Funktionsprov av avlopp, tätning och armaturer är utförda. Synliga läckagekontroller dokumenterade.",
    kravSpecifikPlats: true,
  },
  ...avslut(),
];

export const EGENKONTROLL_PUNKTER_PER_BRANSCH: Record<
  EgenkontrollBransch,
  EgenkontrollPunktMall[]
> = {
  vvs: VVS_EGENKONTROLL_PUNKTER,
  el: EL_EGENKONTROLL_PUNKTER,
  malning: MALNING_EGENKONTROLL_PUNKTER,
  bygg: BYGG_EGENKONTROLL_PUNKTER,
  fasad: FASAD_EGENKONTROLL_PUNKTER,
  tak: TAK_EGENKONTROLL_PUNKTER,
  badrum_stam: BADRUM_STAM_EGENKONTROLL_PUNKTER,
};

export function punkterForBransch(
  bransch: EgenkontrollBransch,
): EgenkontrollPunktMall[] {
  return EGENKONTROLL_PUNKTER_PER_BRANSCH[bransch] ?? VVS_EGENKONTROLL_PUNKTER;
}
