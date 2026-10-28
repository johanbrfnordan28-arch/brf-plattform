export const EGENKONTROLL_VVS_MALL_ID = "egenkontroll-vvs";

export function arEgenkontrollMallId(mallId: string): boolean {
  return mallId === EGENKONTROLL_VVS_MALL_ID;
}

export type EgenkontrollPunktMall = {
  rubrik: string;
  beskrivning: string;
  amaNot?: string;
  /** Vid attest bör entreprenören ange lägenhet/yta (inte bara hela uppdraget). */
  kravSpecifikPlats?: boolean;
};

/** Ordning enligt normalt utförande i projektet (förhandsgranskning och checklista). */
export const VVS_EGENKONTROLL_PUNKTER: EgenkontrollPunktMall[] = [
  {
    rubrik: "Avstämning mot handling",
    beskrivning:
      "Utfört arbete är avstämt mot aktuell ritning / relationshandling innan och under montage.",
  },
  {
    rubrik: "Material för svensk marknad",
    beskrivning:
      "Material och komponenter är avsedda för svenska marknaden, CE-märkta och i övrigt typgodkända (t.ex. P-markning, SITAC) för avsett bruk.",
  },
  {
    rubrik: "Påfrestningar i drift",
    beskrivning:
      "Valda produkter och installationssätt är dimensionerade för de temperatur-, tryck- och slitagepåfrestningar som normalt förekommer i föreningens VVS-installationer.",
  },
  {
    rubrik: "Tillverkarens montageanvisning",
    beskrivning:
      "Monterat VVS-material är installerat enligt tillverkarens montage- och installationsanvisning (inkl. moment, åtdragningsmoment och stöd).",
    amaNot: "AMA styr där anvisning saknas — följ prioritet: handling → AMA → tillverkare.",
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
      "Vattenledningar i tak/konstruktion är infästa och stödda enligt handling och AMA med hänsyn till expansion och belastning.",
    kravSpecifikPlats: true,
  },
  {
    rubrik: "Infästning avlopp — vägg",
    beskrivning:
      "Avloppsledningar i vägg är infästa enligt handling, AMA och tillverkarens anvisning (lutning, stöd, genomföringar).",
    kravSpecifikPlats: true,
  },
  {
    rubrik: "Infästning avlopp — tak",
    beskrivning:
      "Avloppsledningar i tak/konstruktion är infästa enligt handling och AMA (lutning, stöd, expansion).",
    kravSpecifikPlats: true,
  },
  {
    rubrik: "Inspektionsluckor inbyggda delar (avlopp och vatten)",
    beskrivning:
      "Inbyggda delar har tillgängliga inspektionsluckor för avlopp och vattenledning enligt projektering och tillverkarens krav.",
    kravSpecifikPlats: true,
  },
  {
    rubrik: "Tekniskt skåp för installationer",
    beskrivning:
      "Tekniskt skåp är monterat, tillgängligt och innehåller installationer enligt handling och gällande krav.",
    kravSpecifikPlats: true,
  },
  {
    rubrik: "Läckindikationsrör (läck ut) — teknikskåp och inbyggda delar",
    beskrivning:
      "Läck ut-rör eller motsvarande läckageindikation finns och är kopplat till avlopp enligt föreskrift, både i tekniskt skåp och inbyggda delar.",
    kravSpecifikPlats: true,
  },
  {
    rubrik: "Stöd, expansion och genomföringar (övrigt)",
    beskrivning:
      "Övriga stöd, expansionsmöjligheter och genomföringar är verifierade utöver punktvisa infästningar ovan.",
    kravSpecifikPlats: true,
  },
  {
    rubrik: "Isolering, brand och ljud",
    beskrivning:
      "Isolering, brandtätning och ljudkrav enligt projektering och gällande regler är verifierade på stickprov eller enligt kontrollplan.",
    amaNot: "AMA VVS & AF kap. om isolering och genomföringar.",
  },
  {
    rubrik: "Provtryckning",
    beskrivning:
      "Provtryckning är genomförd, dokumenterad och godkänd enligt gällande regler och projekteringsunderlag. Protokoll finns bilagt eller refereras nedan.",
    amaNot: "Se AMA VVS & AF — täthet och provning.",
  },
  {
    rubrik: "Funktionsprov",
    beskrivning:
      "Funktionsprov av avstängningar, cirkulation, shuntgrupper m.m. är utförda. Eventuella anmärkningar är åtgärdade eller dokumenterade som öppna punkter.",
  },
  {
    rubrik: "Skötsel- och driftinstruktioner",
    beskrivning:
      "Skötsel-, drift- och underhållsinstruktioner är framtagna och överlämnade till beställaren (digitalt eller papper enligt överenskommelse).",
  },
  {
    rubrik: "Dokumentation till beställare",
    beskrivning:
      "Materialredovisning, provtryckningsprotokoll, instruktioner och ev. relationshandlingar är överlämnade till beställaren.",
  },
];
