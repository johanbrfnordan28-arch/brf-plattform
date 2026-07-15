import { antalForeningsHuvudmappar } from "@/components/foreningsinformation/mappar";
import { sbaChecklistaPunkterSomText } from "@/components/guider/sba-checklista";

export type GuideFilmScen = {
  titel: string;
  text: string;
};

export type GuideFilm = {
  id: string;
  titel: string;
  modul: string;
  längd: string;
  beskrivning: string;
  scener: GuideFilmScen[];
  /** Valfri mp4/webm i t.ex. /public/videos/ — annars scen-demo med Spela-knapp. */
  videoUrl?: string;
};

export type GuideTips = {
  id: string;
  kategori: "upphandling" | "entreprenor" | "projekt" | "brandskydd";
  titel: string;
  ingress: string;
  punkter: string[];
};

export const guideFilmer: GuideFilm[] = [
  {
    id: "upphandling",
    modul: "Upphandling",
    titel: "Så publicerar du en upphandling",
    längd: "ca 50 sek",
    beskrivning:
      "Från mall till publicering — kort genomgång av Upphandla-knappen och vad entreprenörer ser.",
    scener: [
      {
        titel: "Välj mall",
        text: "Styrelsen eller ombudet väljer en färdig mall och fyller i det som behövs för just ert ärende.",
      },
      {
        titel: "Bifoga underlag",
        text: "Ritningar, beskrivningar och beslut läggs i samma ärende så alla anbudsgivare får samma information.",
      },
      {
        titel: "Publicera",
        text: "Med Upphandla blir ärendet synligt. Godkända entreprenörer kan begära handlingar och lämna anbud.",
      },
    ],
  },
  {
    id: "underhallsplan",
    modul: "Underhållsplan",
    titel: "Bygg underhållsplanen steg för steg",
    längd: "ca 55 sek",
    beskrivning:
      "Grunduppgifter, komponenter, besiktningar och budget — utan att hoppa över viktiga delar.",
    scener: [
      {
        titel: "Grund och komponenter",
        text: "Börja med fastighetens fakta och välj vilka delar som ska följas upp i planen.",
      },
      {
        titel: "Besiktningar i rätt år",
        text: "OVK, sotning och tioårsbesiktningar bokas det år de faktiskt ska ske — inte utjämnat per år.",
      },
      {
        titel: "Budget och slutsida",
        text: "Styrelsen ser summan per år och kan presentera planen för medlemmarna.",
      },
    ],
  },
  {
    id: "arshjul",
    modul: "Årshjul & kalender",
    titel: "Så fungerar styrelsens årshjul",
    längd: "ca 45 sek",
    beskrivning:
      "Se hur årshjul, tidslinje och påminnelser hänger ihop — utan att behöva öppna verktyget själv.",
    scener: [
      {
        titel: "Årshjuls-vyn",
        text: "Styrelsen ser hela året i ett grepp — stämma, bokslut, OVK och möten samlade per månad.",
      },
      {
        titel: "Tidslinje flera år framåt",
        text: "Byt till tidslinje och planera besiktningar och projekt långt innan deadline — inte i sista stund.",
      },
      {
        titel: "Påminnelser i rätt tid",
        text: "Ställ in hur många dagar före ni vill bli påmind — inget viktigt datum glöms bort.",
      },
      {
        titel: "Koppling till underhållsplan",
        text: "Besiktningar från underhållsplanen kan importeras direkt — samma datum, ett ställe att följa upp.",
      },
      {
        titel: "Överlever mandatperioder",
        text: "Nästa styrelse tar över samma plan — historik och kommande händelser finns kvar.",
      },
    ],
  },
  {
    id: "projekt",
    modul: "Projekt",
    titel: "Projektmappen — från förarbete till avslut",
    längd: "ca 50 sek",
    beskrivning:
      "Styrelsen börjar enkelt med beskrivning och status — vi hjälper till med struktur, dokument och uppföljning.",
    scener: [
      {
        titel: "Projektbeskrivning",
        text: "Börja med en enkel modell: vad projektet gäller, hur läget är idag och vad ni vill ha när det är klart.",
      },
      {
        titel: "Projektmappen",
        text: "Kontrakt, ritningar och protokoll samlas per projekt och år — inget letande i mejl.",
      },
      {
        titel: "Tidsplan och årshjul",
        text: "Milstolpar kan föras över till årshjulet så styrelsen får påminnelse i rätt tid.",
      },
      {
        titel: "Garantibesiktning",
        text: "Modulen påminner när garantitiden närmar sig slut — innan ni förlorar rätten att reklamera.",
      },
      {
        titel: "Stöd för resten",
        text: "Upphandling, projektledning och tyngre dokumentation — det kan ni ta hjälp med när förarbetet är klart.",
      },
    ],
  },
  {
    id: "rondering",
    modul: "Rondering & avvikelser",
    titel: "Rondering, signering och spårbarhet",
    längd: "ca 45 sek",
    beskrivning:
      "Checklistor och månadssignering — se hur spårbarhet och avvikelser höjer kvaliteten i praktiken.",
    scener: [
      {
        titel: "Tydliga checklistor",
        text: "Utvändig och invändig rondering, städning i trapphus och tvättstuga — alla vet vad som ska ingå.",
      },
      {
        titel: "Signering varje månad",
        text: "Fastighetsskötare eller städbolag signerar utfört arbete — bara det höjer nivån jämfört med muntliga löften.",
      },
      {
        titel: "Spårbarhet",
        text: "Styrelsen ser vem som signerat, när och vad som gjorts — historik som finns kvar, inte i någons mejl.",
      },
      {
        titel: "Avvikelser med uppföljning",
        text: "Saknas något rapporteras det direkt med allvarlighetsgrad — och följs upp tills det är åtgärdat.",
      },
      {
        titel: "Styrelsen har kontroll",
        text: "Ingen utebliven rondering eller städning blir osynlig — ni kan agera innan medlemmarna hör av sig.",
      },
    ],
  },
  {
    id: "lagenhetskort",
    modul: "Lägenhetskort & renovering",
    titel: "Lägenhetskort — enkelt för styrelsen, spårbart för alla",
    längd: "ca 50 sek",
    beskrivning:
      "Ett kort per lägenhet med renoveringshistorik, krav och signering av överenskommelser.",
    scener: [
      {
        titel: "Lägenhetskort",
        text: "Varje lägenhet får ett tydligt kort — grunduppgifter, renoveringar och dokument på ett ställe.",
      },
      {
        titel: "Enkelt för styrelsen",
        text: "Välj typ av renovering — checklistan byggs automatiskt. Inget mejlkaos, samma format varje gång.",
      },
      {
        titel: "Spårbar historik",
        text: "Vad som gjorts, när och vem som godkänt — historiken finns kvar när styrelsen byts.",
      },
      {
        titel: "Överenskommelse med medlem",
        text: "Styrelsen skickar krav och villkor — medlemmen godkänner och signerar digitalt.",
      },
      {
        titel: "Signering med BankID",
        text: "När allt är klart signeras överenskommelsen — spårbart vem som stått för vad, innan arbetet startar.",
      },
    ],
  },
  {
    id: "entreprenorer",
    modul: "Entreprenörer",
    titel: "Hitta och följa upp entreprenörer",
    längd: "ca 45 sek",
    beskrivning:
      "Registrering, betyg och kontakt — så styrelsen väljer rätt partner till rätt uppdrag.",
    scener: [
      {
        titel: "Sök och filtrera",
        text: "Se vilka som är godkända inom t.ex. tak, VVS eller fastighetsskötsel.",
      },
      {
        titel: "Betyg och historik",
        text: "Tidigare uppdrag och omdömen ger stöd inför nästa avtal — inte bara lägsta pris.",
      },
      {
        titel: "Kontakt inför upphandling",
        text: "Dialogen kan föras strukturerat via portalen i stället för spridda mejltrådar.",
      },
    ],
  },
  {
    id: "foreningsinformation",
    modul: "Föreningsinformation",
    titel: "Dokument i rätt mapp",
    längd: "ca 35 sek",
    beskrivning:
      "Stadgar, ventilation, besiktningar och protokoll — samlat så nästa styrelse hittar allt.",
    scener: [
      {
        titel: "Huvudmappar",
        text: `${antalForeningsHuvudmappar} tydliga områden gör det lätt att veta var nytt underlag ska ligga.`,
      },
      {
        titel: "Undermappar",
        text: "T.ex. hiss, sotningsprotokoll per år eller service på undercentral.",
      },
      {
        titel: "Sökbarhet",
        text: "Mindre tid går åt till att leta i mejl och mappar på styrelsemedlemmarnas datorer.",
      },
    ],
  },
  {
    id: "brandskydd-sba",
    modul: "Brandskydd",
    titel: "Systematiskt brandskyddsarbete (SBA)",
    längd: "ca 60 sek",
    beskrivning:
      "Förbyggande brandskydd — årlig kontroll, medlemmars eget ansvar, utrymning och brandskyddsdokumentation vid större projekt.",
    scener: [
      {
        titel: "Förbyggande SBA",
        text: "SBA (systematiskt brandskyddsarbete) handlar om att förebygga brand och rökskador — inte bara reagera när något hänt. Styrelsen planerar årliga kontroller innan riskerna växer.",
      },
      {
        titel: "Medlemmars eget ansvar",
        text: "Brandvarnare i lägenheten ska kontrolleras årligen av medlemmen — funktion, signal och batteribyte. Frivilligt förebyggande som släckfilt och brandplan hemma är bra: en brand påverkar grannar och hela föreningen. Påminn minst en gång per år, gärna två — vid städdag på sommaren och inför jul när brandrisken är förhöjd.",
      },
      {
        titel: "Brandvarnare och släckare",
        text: "I gemensamma utrymmen kontrolleras brandvarnare årligen av föreningen — funktion, batteribyte och utökning vid behov. Brandsläckare och annan släckutrustning ska vara på plats, inom giltighetstid och korrekt skyltad.",
      },
      {
        titel: "Utrymning och skyltning",
        text: "Utrymningsskyltar på väggen och vägvisning på golvet ska leda tydligt. Utrymningsvägar ska vara fria — i trapphus får ingen förvaring ske som kan orsaka brand eller försvåra utrymning.",
      },
      {
        titel: "Medlemmars renovering",
        text: "Vid lägenhetsrenovering är brandskydd viktigt — enklare information till medlemmen om brandceller, brandfarliga produkter och att trapphus ska hållas fritt.",
      },
      {
        titel: "Föreningens projekt",
        text: "Vid större projekt ska entreprenören ta fram brandskyddsdokumentation — hur brand förhindras och hur brandspridning minimeras. Mindre projekt kan hanteras med enklare skriftlig kommunikation.",
      },
      {
        titel: "Dokumentation",
        text: "Protokoll, avvikelser och brandskyddsdokumentation sparas i portalen — så nästa styrelse och myndigheter ser att brandskyddet sköts över tid.",
      },
    ],
  },
  {
    id: "energi",
    modul: "Energi & drift",
    titel: "Energi, drift och payback time",
    längd: "ca 50 sek",
    beskrivning:
      "Värme, belysning och payback — jämför kostnader före och efter investering.",
    scener: [
      {
        titel: "Ett ständigt arbete",
        text: "Tips och råd om energi och drift utvecklas löpande — modulen växer med er förenings behov.",
      },
      {
        titel: "Teknisk livslängd vs energi",
        text: "Stora byten planeras i underhållsplanen — injustering, LED och styrning ger effekt tidigare.",
      },
      {
        titel: "Kostnader före och efter",
        text: "Samla driftkostnad innan åtgärden — det är grunden för att se om investeringen lönar sig.",
      },
      {
        titel: "Payback time",
        text: "Räkna hur många år det tar innan lägre värme- och elkostnad täckt investeringen — centralt för styrelsens beslut.",
      },
      {
        titel: "Kassa-plus efter payback",
        text: "När payback är nådd kan återstående avskrivningstid bli ett plus — pengar till nästa åtgärd.",
      },
    ],
  },
  {
    id: "projektutvardering",
    modul: "Projekt",
    titel: "Projektutvärdering — ekonomi och payback",
    längd: "ca 55 sek",
    beskrivning:
      "Jämför drift, försäkring och investering före och efter — räkna payback och kassa-plus under avskrivningstiden.",
    scener: [
      {
        titel: "Baslinje 2–5 år före",
        text: "Samla vatten, el, värme, försäkringspremier och skadehistorik innan projektet startar — så ni ser trender och kan jämföra.",
      },
      {
        titel: "Efter slutbesiktning",
        text: "Följ upp samma nyckeltal efter godkänd slutbesiktning — idealiskt genom hela entreprenörens tioåriga ansvarstid.",
      },
      {
        titel: "Payback och kassa-plus",
        text: "Räkna återbetalningstid när lägre drift täcker investeringen. Betalar sig projektet på fem år med tjugo års avskrivning blir resterande år ett plus i kassan.",
      },
      {
        titel: "Säkerhet och försäkring",
        text: "Säkerhet kan inte värderas i kronor — bedöm brand, utrymning och fukt separat. Budgetera för försäkringsluckor och skador som inte ersätts fullt ut.",
      },
    ],
  },
  {
    id: "saknar-funktion",
    modul: "Plattformen",
    titel: "Saknar du en funktion eller komponent?",
    längd: "ca 45 sek",
    beskrivning:
      "Tips och önskemål välkomnas — er sida är unik och vi utvecklar med kunden i centrum.",
    scener: [
      {
        titel: "Saknar du något?",
        text: "Om en funktion eller komponent saknas någonstans i portalen saknar säkert fler samma — hör av er så vi vet vad som behövs.",
      },
      {
        titel: "Tips och råd välkomna",
        text: "Vi tar gärna emot förslag från styrelsen och medlemmarna. Era erfarenheter gör plattformen bättre för alla föreningar.",
      },
      {
        titel: "Er unika sida",
        text: "Er förenings sida är unik. Behöver bara ni en särskild åtgärd kan den anpassas för er — utan att alla andra måste ha samma lösning.",
      },
      {
        titel: "Kunden i centrum",
        text: "Vi har alltid kunden i centrum: utveckling, support och förbättringar utgår från vad er förening faktiskt behöver i vardagen.",
      },
    ],
  },
];

export const guideTips: GuideTips[] = [
  {
    id: "underlag-klart",
    kategori: "upphandling",
    titel: "Ha underlaget klart innan ni publicerar",
    ingress: "En tydlig upphandling sparar tid och minskar felanbud.",
    punkter: [
      "Beskriv omfattning, tidsplan och vad som ingår — undvik vaga formuleringar.",
      "Bifoga samma handlingar till alla; ändringar ska kommuniceras skriftligt.",
      "Ange hur frågor ställs och när sista anbudsdag är.",
      "Bestäm i förväg hur ni jämför pris, referenser och kapacitet.",
    ],
  },
  {
    id: "jamfor-anbud",
    kategori: "upphandling",
    titel: "Jämför mer än bara pris",
    ingress: "Billigast är inte alltid bäst för föreningen på sikt.",
    punkter: [
      "Kontrollera att entreprenören är godkänd i portalen för rätt kategori.",
      "Be om referensprojekt av liknande storlek och ålder på fastigheten.",
      "Se över garantier, ansvarsfördelning och hur ändringar hanteras.",
      "Dokumentera styrelsens beslut och skäl — underlättar vid frågor från medlemmar.",
    ],
  },
  {
    id: "kontakt-entreprenor",
    kategori: "entreprenor",
    titel: "Tydlig kontakt från start",
    ingress: "Bra dialog minskar missförstånd under pågående arbete.",
    punkter: [
      "Utse en kontaktperson i styrelsen och en hos entreprenören.",
      "Samla frågor och svar i ärendet i portalen i stället för privata sms.",
      "Bekräfta vem som godkänner tilläggsarbeten innan arbetet startar.",
      "Följ upp avvikelser skriftligt — särskilt vid rondering och större projekt.",
    ],
  },
  {
    id: "uppfoljning-efter",
    kategori: "entreprenor",
    titel: "Följ upp efter avslutat uppdrag",
    ingress: "Erfarenheten hjälper nästa styrelse och nästa upphandling.",
    punkter: [
      "Spara protokoll, fakturor och slutbesiktning i rätt projektmapp.",
      "Ge betyg i entreprenörsregistret när arbetet är färdigt och uppföljt.",
      "Notera vad som fungerade dåligt — så ni undviker samma misstag.",
      "Uppdatera underhållsplanen om komponenter bytts eller renoverats.",
    ],
  },
  {
    id: "projektutvardering",
    kategori: "projekt",
    titel: "Projektutvärdering — checklista",
    ingress:
      "Jämför ekonomi och risker före, under och efter projektet — inklusive entreprenörens ansvarstid. Säkerhet kan inte värderas i kronor men ska alltid bedömas separat.",
    punkter: [
      "Baslinje 2–5 år före start: samla förbrukning av vatten, el och värme (kWh, m³, fjärrvärme eller motsvarande) så trender syns innan åtgärden.",
      "Baslinje 2–5 år före start: notera försäkringspremier, självrisker och historik av försäkringsskador — vad kostade skadorna totalt och vad ersattes?",
      "Baslinje 2–5 år före start: dokumentera drift- och underhållskostnader för berörda delar (t.ex. tak, stammar, fasad) så ni kan jämföra före/efter.",
      "Finansiering: om likvida medel saknas i kassan bör högre avsättning till underhållsfond planeras minst två år före projektstart — undvik att låsa budgeten sent.",
      "Investeringskostnad: projektkostnad, finansiering, ränta och eventuella tilläggsarbeten — tydligt avgränsat i beslutsunderlaget.",
      "Efter godkänd slutbesiktning: följ upp samma nyckeltal (vatten, el, värme) minst lika länge som ni har baslinje — idealiskt genom hela entreprenörens ansvarstid (10 år).",
      "Payback time (återbetalningstid): räkna när lägre driftkostnader och färre skador har täckt projektets nettokostnad — t.ex. om värme och el minskar med X kr/år, hur många år tar det?",
      "Avskrivning vs payback: ett energiprojekt kan betala sig på t.ex. 5 år medan teknisk avskrivning är 20 år — då blir åren 6–20 ett plus i kassan som kan finansiera nästa åtgärd.",
      "Fördröjd renovering: skjuter ni på åtgärden växer ofta både skadekostnad och investeringsbehov — ta med det i jämförelsen mellan ”göra nu” och ”vänta”.",
      "Säkerhet (ej i kronor): bedöm brand, utrymning, fall, fukt och personsäkerhet vid och efter projektet — detta kan inte ersättas av en payback-kalkyl.",
      "Försäkringsrisker: kartlägg kommande förändringar i försäkringsskydd, höjda premier eller begränsad ersättning efter större skador eller flera skadeärenden.",
      "Skador utan full ersättning: räkna med att flera skador eller skador utanför policyn kan behöva täckas av föreningen — budgetera för självrisk och ”luckor” i försäkringen.",
      "Entreprenörens ansvarstid (10 år): spara slutbesiktning, garantibevis och avvikelser; följ upp om fel upptäcks inom ansvarstiden så krav kan ställas i tid.",
      "Sammanställning till styrelsen: en sida med före/efter-siffror, payback, kvarvarande risker och säkerhetsbedömning — underlag inför nästa projekt och årsredovisning.",
    ],
  },
  {
    id: "sba-arbete",
    kategori: "brandskydd",
    titel: "Systematiskt brandskyddsarbete (SBA) — checklista",
    ingress:
      "Förbyggande brandskydd med årlig kontroll av brandvarnare, brandsläckare, utrymning och skyltning — medlemmars eget ansvar (brandvarnare i lägenheten) och påminnelser vid städdag och jul — samt brandskydd vid medlemmars och föreningens projekt.",
    punkter: sbaChecklistaPunkterSomText(),
  },
];
