import type { AtgardTyp, UnderhallsAtgard } from "@/components/plan/plan-lager";

// ── Typer ─────────────────────────────────────────────────────────────────────

export type ByggnadsAtgardMall = Omit<UnderhallsAtgard, "id" | "prislistaId" | "senastUtfortAr" | "nastaAr" | "uppskattadKostnadKr"> & {
  /** Hjälptext om varför åtgärden är typisk för perioden. */
  periodNotering?: string;
};

export type ByggnadsMall = {
  id: string;
  period: string;      // t.ex. "1930–1949"
  rubrik: string;      // t.ex. "Äldre bestånd"
  beskrivning: string; // kort om vad som är typiskt
  komponenter: string[];
  atgarder: ByggnadsAtgardMall[];
};

// ── Hjälp ─────────────────────────────────────────────────────────────────────

function a(
  komponent: string,
  beskrivning: string,
  typ: AtgardTyp,
  intervallAr: string,
  notering = "",
): ByggnadsAtgardMall {
  return { komponent, beskrivning, typ, intervallAr, notering };
}

// ── Mallar per decennium ──────────────────────────────────────────────────────

export const byggnadsmallar: ByggnadsMall[] = [
  // ── 1930–1949 ────────────────────────────────────────────────────────────
  {
    id: "1930-1949",
    period: "1930–1949",
    rubrik: "Funktionalism och förkrigsbebyggelse",
    beskrivning:
      "Murade puts- och tegelfasader, plåttak, självdragsventilation, gjutjärnsrör och enkelbåge/tidiga 2-glasfönster. Stambyte ofta aktuellt eller nyligen utfört.",
    komponenter: [
      "Fasad",
      "Fönster",
      "Tak",
      "Trapphus",
      "Källare",
      "VVS",
      "Värmecentral",
      "Mark och gård",
    ],
    atgarder: [
      a("Fasad", "Putsrenovering och ommålning", "byte", "25",
        "Puts från denna period är vanligen 70–90 år gammal och kan behöva helrenovering."),
      a("Fönster", "Fönsterbyte (enkelbåge → 3-glas)", "byte", "40",
        "Originalbågar har ofta redan bytts. Kontrollera om 1980-90-tals fönster fortfarande sitter kvar."),
      a("Tak", "Takbyte / plåtrenovering", "byte", "50",
        "Koppar- och zinkplåt från 1930-40-tal kan sitta länge men bör besiktas regelbundet."),
      a("Trapphus", "Ommålning trapphus", "byte", "15",
        "Äldre trapphus med originalinredning: puts, trägolv, gjutjärnsledstänger."),
      a("VVS", "Stambyte (avlopp + tappvatten)", "byte", "55",
        "Gjutjärnsavlopp och galvaniserade vattenrör når livslängdsgränsen efter 50-60 år."),
      a("VVS", "Filmning och spolning avlopp", "besiktning", "10",
        "Inför beslut om stambyte: kamerainspektion av stammarna."),
      a("Värmecentral", "Service undercentraler och radiatorer", "service", "2",
        "Äldre radiatorsystem med termostatventiler behöver regelbunden injustering."),
      a("Källare", "Fuktbesiktning källare", "besiktning", "5",
        "Äldre grundläggningar utan membran — risk för kapillärsugning och radonintrång."),
      a("Mark och gård", "Renovering gårdsyta och ledningar", "byte", "40",
        "Äldre kulvertar och dagvattensystem kan behöva ses över."),
    ],
  },

  // ── 1950–1969 ────────────────────────────────────────────────────────────
  {
    id: "1950-1969",
    period: "1950–1969",
    rubrik: "Rekordåren och tidigt miljonprogram",
    beskrivning:
      "Tegel- och puts­fasader med tidiga betongelement, 2-glasfönster i träkarmar, betongbalkonger, självdrags­ventilation, koppar- och gjutjärnsrör. Stambyte är ofta aktuellt.",
    komponenter: [
      "Fasad",
      "Fönster",
      "Tak",
      "Balkonger",
      "Trapphus",
      "Källare",
      "VVS",
      "Ventilation",
      "Värmecentral",
      "Elcentral",
      "Mark och gård",
    ],
    atgarder: [
      a("Fasad", "Putsrenovering / tegelfogning", "byte", "30",
        "Betongelement och puts från 50-60-tal har ofta karbonateringsproblem och fuktskador."),
      a("Fönster", "Fönsterbyte (2-glas trä → 3-glas)", "byte", "35",
        "Originalfönster från denna period är ca 60 år gamla — tätningslisterna uttjänta."),
      a("Tak", "Takbyte (papp/plåt)", "byte", "30",
        "Papptak från 50-60-tal har normalt livslängd 25-35 år."),
      a("Balkonger", "Balkongrenoverng (tätskikt, betong)", "byte", "30",
        "Betongbalkonger från denna period riskerar armeringskorrosion — karbonateringsdjup bör mätas."),
      a("Trapphus", "Hissrenovering / -byte", "byte", "30",
        "Kabelhissar från 50-60-tal: maskinrum, styrning och korg behöver ses över ca vart 25-30 år."),
      a("Trapphus", "Ommålning trapphus och ledstänger", "byte", "15"),
      a("VVS", "Stambyte (avlopp + tappvatten)", "byte", "55",
        "Gjutjärn i avlopp och koppar i tappvatten — stambyte normalt aktuellt 50-60 år efter byggnation."),
      a("VVS", "Filmning avlopp inför stambytebeslut", "besiktning", "10"),
      a("Ventilation", "OVK — självdrag", "besiktning", "6",
        "Självdragsventilation besiktas vart 6:e år (Boverkets föreskrifter)."),
      a("Värmecentral", "Service värmecentral och radiatorer", "service", "2"),
      a("Elcentral", "Besiktning elinstallation", "besiktning", "15",
        "Äldre 50-60-tals elinstallation kan sakna jordat uttag och ha utdaterade säkringar."),
      a("Mark och gård", "Asfalt- och markstensrenovering", "byte", "30"),
    ],
  },

  // ── 1970–1989 ────────────────────────────────────────────────────────────
  {
    id: "1970-1989",
    period: "1970–1989",
    rubrik: "Miljonprogrammet och 1980-talsbebyggelse",
    beskrivning:
      "Betongelement, puts och träpanel, 2-glasfönster, fläktventilation (F-system), betongbalkonger med saltskador, kopparrör. Energirenoveringar och balkong­reparationer vanliga.",
    komponenter: [
      "Fasad",
      "Fönster",
      "Tak",
      "Balkonger",
      "Trapphus",
      "Källare",
      "VVS",
      "Ventilation",
      "Värmecentral",
      "Brandskydd",
      "Elcentral",
      "Mark och gård",
    ],
    atgarder: [
      a("Fasad", "Fasadrenovering (puts/betong/panel)", "byte", "25",
        "Betongelement och puts från 70-80-tal: karbonateringsdjup, krackelering och köldbryggor är vanliga problem."),
      a("Fasad", "Ommålning fasad (om träpanel)", "byte", "10",
        "Träpanelfasader kräver ommålning vart 8-12 år beroende på exponering."),
      a("Fönster", "Fönsterbyte (2-glas → 3-glas)", "byte", "35",
        "2-glasfönster från 70-80-tal: tätningslister vittrade, energiförluster stora."),
      a("Tak", "Takbyte (papp)", "byte", "28",
        "Papptakens normala livslängd 25-30 år — inspektera tätskiktet och takluckor."),
      a("Balkonger", "Balkongrenovering (tätskikt, betong)", "byte", "25",
        "70-talsbalkonger: saltskador och armeringskorrosion är vanliga. Karbonateringsdjup bör mätas."),
      a("Trapphus", "Hissrenovering / -byte", "byte", "28",
        "Kabelhissar från 70-80-tal: styrsystem och korg bör ses över."),
      a("Trapphus", "Ommålning och ytskikt trapphus", "byte", "12"),
      a("VVS", "Stambyte (avlopp + tappvatten)", "byte", "50",
        "Kopparrör i tappvatten och gjutjärn/plast i avlopp — planera stambyte ca 50 år efter byggnation."),
      a("VVS", "Spolning avlopp", "service", "8",
        "Regelbunden stamspolning förlänger livslängden och minskar driftstörningar."),
      a("Ventilation", "OVK — F-system (fläktventilation)", "besiktning", "6",
        "F-system besiktas vart 6:e år. Kontrollera fläktmotorer och don."),
      a("Ventilation", "Byte av fläktmotorer", "byte", "20",
        "Fläktmotorer från 70-80-tal är ofta energikrävande och bör bytas."),
      a("Värmecentral", "Service undercentraler och stammar", "service", "2"),
      a("Brandskydd", "SBA egenkontroll", "besiktning", "1",
        "Systematiskt brandskyddsarbete — egenkontroll branddörrar, utrymningsvägar och nödbelysning."),
      a("Elcentral", "Besiktning elinstallation", "besiktning", "15",
        "70-80-tals elinstallation: kontrollera jordat uttag, säkringar och belastning."),
      a("Mark och gård", "Renovering asfalt och dränering", "byte", "25"),
    ],
  },

  // ── 1990–2009 ────────────────────────────────────────────────────────────
  {
    id: "1990-2009",
    period: "1990–2009",
    rubrik: "Modern bebyggelse",
    beskrivning:
      "Tegel- och putsfasader med bättre isolering, 3-glasfönster, FT/FTX-ventilation, plastnät (PEX) och kopparrör, SBA-krav, moderna balkonger. Underhåll påbörjas löpande.",
    komponenter: [
      "Fasad",
      "Fönster",
      "Tak",
      "Balkonger",
      "Trapphus",
      "VVS",
      "Ventilation",
      "Värmecentral",
      "Brandskydd",
      "Elcentral",
      "Mark och gård",
      "Komplement byggnad och P-platser",
    ],
    atgarder: [
      a("Fasad", "Fasadinspektering och underhållsputsning", "service", "15",
        "Moderna putsfasader: inspektera krackeleringar och fogrörelser — renovera vid behov."),
      a("Fasad", "Fasadrenovering", "byte", "40",
        "Planera för helrenovering efter 35-45 år beroende på material och exponering."),
      a("Fönster", "Byte tätningslister och beslag", "service", "15",
        "3-glasfönster från 90-tal: tätningslister och gångjärn behöver ses över."),
      a("Fönster", "Fönsterbyte", "byte", "40",
        "3-glasfönster har normalt livslängd 35-45 år med gott underhåll."),
      a("Tak", "Takbesiktning och underhåll", "besiktning", "5",
        "Moderna papptakoch plåttak: löpande besiktning förhindrar dyrare skador."),
      a("Tak", "Takbyte", "byte", "35"),
      a("Balkonger", "Balkongbesiktning och tätskikt", "besiktning", "10",
        "Moderna balkonger: kontrollera tätskikt, avvattning och infästningar."),
      a("Trapphus", "Hissservice och -renovering", "service", "5",
        "Moderna hissar: underhållsavtal krävs, renovering av styrsystem efter 20-25 år."),
      a("VVS", "Stamspolning och inspektion", "service", "10"),
      a("VVS", "Planera stambyte (PEX/koppar)", "besiktning", "30",
        "Planera och avsätt kapital för stambyte ca 50-60 år efter byggnation."),
      a("Ventilation", "OVK — FT/FTX", "besiktning", "3",
        "FT- och FTX-system besiktas vart 3:e år. Rengör och byt filter regelbundet."),
      a("Ventilation", "Filterbyten FTX-aggregat", "service", "1",
        "Filter i FTX-aggregat ska bytas 1-2 gånger per år."),
      a("Brandskydd", "SBA egenkontroll", "besiktning", "1",
        "Systematiskt brandskyddsarbete — årlig egenkontroll branddörrar och utrymningsvägar."),
      a("Elcentral", "Besiktning och kontroll elcentral", "besiktning", "20"),
      a("Mark och gård", "Ytskiktsrenovering gård", "byte", "25"),
      a("Komplement byggnad och P-platser", "Service och underhåll parkeringsdäck", "service", "5"),
    ],
  },

  // ── 2010– ────────────────────────────────────────────────────────────────
  {
    id: "2010-",
    period: "2010-talet och senare",
    rubrik: "Nyproduktion och energieffektiv bebyggelse",
    beskrivning:
      "Högisolerande byggnader, 3-glasfönster, FTX-ventilation, moderna PEX-stammar, hög SBA-standard, laddinfrastruktur för elbilar. Underhållsplanen fokuserar på service och framtidsplanering.",
    komponenter: [
      "Fasad",
      "Fönster",
      "Tak",
      "Balkonger",
      "Trapphus",
      "VVS",
      "Ventilation",
      "Värmecentral",
      "Brandskydd",
      "Elcentral",
      "Mark och gård",
      "Komplement byggnad och P-platser",
    ],
    atgarder: [
      a("Fasad", "Fasadbesiktning", "besiktning", "10",
        "Nyproduktion: kontrollera fogar, puts och fixeringspunkter vid fasadelement."),
      a("Fasad", "Fasadrenovering", "byte", "45",
        "Moderna fasader med bra underhåll har lång livslängd — planera och avsätt kapital."),
      a("Fönster", "Byte tätningslister", "service", "20"),
      a("Fönster", "Fönsterbyte", "byte", "45"),
      a("Tak", "Takbesiktning", "besiktning", "5",
        "Löpande besiktning förebygger skador på tätskikt och genomföringar."),
      a("Tak", "Takbyte", "byte", "40"),
      a("Balkonger", "Balkongbesiktning", "besiktning", "10"),
      a("Trapphus", "Hissservice", "service", "1",
        "Moderna hissar kräver underhållsavtal och löpande service."),
      a("VVS", "Stamspolning och inspektion", "service", "10"),
      a("VVS", "Stambyte (framtidsplanering)", "besiktning", "40",
        "PEX-rör har lång livslängd (50-60 år) — börja avsätta kapital tidigt."),
      a("Ventilation", "OVK — FTX", "besiktning", "3",
        "FTX-system besiktas vart 3:e år. Rengör värmeväxlare och byt filter."),
      a("Ventilation", "Filterbyten FTX-aggregat", "service", "1",
        "Filterbyte 1-2 gånger per år för optimalt FTX-funktion och luftkvalitet."),
      a("Brandskydd", "SBA egenkontroll", "besiktning", "1",
        "Systematiskt brandskyddsarbete — inkludera sprinkler och gasvarning om installerat."),
      a("Elcentral", "Besiktning och kontroll elcentral", "besiktning", "20"),
      a("Elcentral", "Uppgradering laddinfrastruktur (elbil)", "ovrig", "10",
        "Laddplatser för elbilar: utvärdera kapacitetsbehov vart 5-10 år."),
      a("Mark och gård", "Underhåll gård och planteringar", "service", "5"),
      a("Komplement byggnad och P-platser", "Service parkeringsytor och laddare", "service", "3"),
    ],
  },
];

// ── Hjälpfunktioner ───────────────────────────────────────────────────────────

export function hamtaByggnadsMall(id: string): ByggnadsMall | undefined {
  return byggnadsmallar.find((m) => m.id === id);
}
