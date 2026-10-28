export const EGENKONTROLL_VVS_MALL_ID = "egenkontroll-vvs";

export function arEgenkontrollMallId(mallId: string): boolean {
  return mallId === EGENKONTROLL_VVS_MALL_ID;
}

export type EgenkontrollPunktMall = {
  rubrik: string;
  beskrivning: string;
  amaNot?: string;
};

export const VVS_EGENKONTROLL_PUNKTER: EgenkontrollPunktMall[] = [
  {
    rubrik: "Provtryckning",
    beskrivning:
      "Provtryckning är genomförd, dokumenterad och godkänd enligt gällande regler och projekteringsunderlag. Protokoll finns bilagt eller refereras nedan.",
    amaNot: "Se AMA VVS & AF — täthet och provning.",
  },
  {
    rubrik: "Tillverkarens montageanvisning",
    beskrivning:
      "Monterat VVS-material är installerat enligt tillverkarens montage- och installationsanvisning (inkl. moment, åtdragningsmoment och stöd).",
    amaNot: "AMA styr där anvisning saknas — följ prioritet: handling → AMA → tillverkare.",
  },
  {
    rubrik: "Skötsel- och driftinstruktioner",
    beskrivning:
      "Skötsel-, drift- och underhållsinstruktioner är framtagna och överlämnade till beställaren (digitalt eller papper enligt överenskommelse).",
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
    rubrik: "Isolering, brand och ljud",
    beskrivning:
      "Isolering, brandtätning och ljudkrav enligt projektering och gällande regler är verifierade på stickprov eller enligt kontrollplan.",
    amaNot: "AMA VVS & AF kap. om isolering och genomföringar.",
  },
  {
    rubrik: "Stöd, infästning och expansion",
    beskrivning:
      "Rör, armatur och utrustning är stödjda, infästa och utformade med hänsyn till expansion, golv- och vägggenomföringar.",
  },
  {
    rubrik: "Funktionsprov",
    beskrivning:
      "Funktionsprov av avstängningar, cirkulation, shuntgrupper m.m. är utförda. Eventuella anmärkningar är åtgärdade eller dokumenterade som öppna punkter.",
  },
  {
    rubrik: "Dokumentation till beställare",
    beskrivning:
      "Materialredovisning, provtryckningsprotokoll, instruktioner och ev. relationshandlingar är överlämnade till beställaren.",
  },
  {
    rubrik: "Avstämning mot handling",
    beskrivning:
      "Utfört arbete är avstämts mot aktuell ritning / relationshandling. Avvikelser är noterade och godkända av ansvarig arbetsledare.",
  },
];
