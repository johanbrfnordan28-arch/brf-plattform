export type TipsPunkt = {
  ikon: string;
  titel: string;
  text: string;
};

export const tips: Record<string, TipsPunkt[]> = {
  underhallsplan: [
    {
      ikon: "💡",
      titel: "Adresser före fasader",
      text: "I steg 1: planinställningar, uppgifter och adresser först. Fasader per byggnad öppnas först när byggnader lagts in — då blir planen mer överskådlig.",
    },
    {
      ikon: "📥",
      titel: "Er plan, er kontroll",
      text: "Styrelsen ändrar fritt i föreningens underhållsplan. Öppna grundmallen skrivskyddat för att se den, och importera saknade delar i steg 3 — utan att er sparade plan skrivs över automatiskt.",
    },
    {
      ikon: "📐",
      titel: "K3 och avskrivningstider",
      text: "Från 2026 gäller K3 för BRF. I komponentregistret anges avskrivningstid per del — underlag till anläggningsregistret, skilt från underhållsintervall. Se slutsidans K3-avsnitt.",
    },
    {
      ikon: "📋",
      titel: "Redo för stämman",
      text: "Slutsidan genererar en 50-årsbudget med avsättningsförslag — enkel att skriva ut eller spara som PDF till stämmounderlaget.",
    },
  ],

  plan: [
    {
      ikon: "🏗️",
      titel: "Välj byggnadsperiod automatiskt",
      text: "Klicka \"Välj period\" på grundmallen — typiska komponenter och underhållsåtgärder för ert byggnadsår läggs in med realistiska intervall.",
    },
    {
      ikon: "💰",
      titel: "Lägg in priser manuellt",
      text: "Ange enhetspris eller totalkostnad direkt på varje åtgärd utifrån offert eller egen bedömning — så blir planen er egen kostnadsbild.",
    },
    {
      ikon: "📋",
      titel: "Grundmallen kopieras",
      text: "Skapa en ny plan och alla komponenter och åtgärder från grundmallen följer med automatiskt — börja inte från noll varje gång.",
    },
  ],

  upphandling: [
    {
      ikon: "⚡",
      titel: "Förenklad upphandling",
      text: "OVK, energideklaration och radonmätning hanteras under Förenklad upphandling — perfekt för obligatoriska kontroller utan fullständigt förfrågningsunderlag.",
    },
    {
      ikon: "🔒",
      titel: "Låsta anbud tills deadline",
      text: "Anbud öppnas aldrig förrän sista anbudsdagen passerat — garanterar rättvisa och spårbarhet enligt god upphandlingssed.",
    },
    {
      ikon: "📎",
      titel: "Importera från Rondering",
      text: "Bifoga städ- eller ronderingsschema direkt från Rondering-modulen som bilaga till upphandlingen — allt hänger ihop.",
    },
  ],

  rondering: [
    {
      ikon: "✅",
      titel: "Digital signering varje månad",
      text: "Städning och fastighetsskötsel signeras digitalt av fastighetsskötare eller städbolag — ni slipper pappersprotokoll och mejlkedjor.",
    },
    {
      ikon: "📌",
      titel: "Avvikelser med uppföljning",
      text: "Registrera avvikelser med allvarlighetsgrad. Alla åtgärder följs upp tills de är åtgärdade — inget faller mellan stolarna.",
    },
    {
      ikon: "🔗",
      titel: "Exportera som upphandlingsbilaga",
      text: "Ronderingsschema och städschema kan bifogas direkt i upphandlingsunderlag — spara tid och visa professionalism mot anbudsgivare.",
    },
  ],

  juridik: [
    {
      ikon: "📁",
      titel: "Egna mappar i dombiblioteket",
      text: "Skapa egna mappar under \"Domar och avgöranden\" för era specifika ärenden — exempelvis \"Tvister pågående\" eller \"Balkongrelaterat\".",
    },
    {
      ikon: "⚖️",
      titel: "Tips inför svåra möten",
      text: "Under Tips och råd finns konkreta råd för möten med störande hyresgäster, kontakt med juridiskt ombud och hur ni minskar tvistekostnader.",
    },
    {
      ikon: "💡",
      titel: "Gemensamt bibliotek",
      text: "Vägledande domar ni laddar upp syns för alla föreningar på plattformen — bidra och ta del av andras erfarenheter.",
    },
  ],

  entreprenorer: [
    {
      ikon: "🏠",
      titel: "De som känner huset",
      text: "Lägg in entreprenörer som arbetat i huset tidigare — skriv en kort anteckning så nästa styrelse vet varför ni litar på dem.",
    },
    {
      ikon: "➕",
      titel: "Egna kontakter",
      text: "Klicka Lägg till entreprenör och spara namn, telefon och kategori. Listan syns bara för er förening.",
    },
    {
      ikon: "💰",
      titel: "Priser i planen",
      text: "Priser lägger ni in manuellt på åtgärder i underhållsplanen när ni har offert — inte via en gemensam prislista.",
    },
  ],

  dokumentbank: [
    {
      ikon: "📥",
      titel: "Skapa kopia av en mall",
      text: "Bläddra i Mallkatalog, klicka Skapa kopia och döp den till projektnamnet — t.ex. \"Kontrakt takbyte 2025\". Sedan laddar du ned och fyller i.",
    },
    {
      ikon: "✏️",
      titel: "Namnge och håll koll",
      text: "Kopior sparas under Mina dokument med status (Utkast / Klar / Arkiverad) och notering — hitta rätt dokument snabbt vid nästa revision.",
    },
    {
      ikon: "📁",
      titel: "Ladda upp egna mallar",
      text: "Har ni egna styrelsemallar? Ladda upp dem till banken så att de alltid är tillgängliga för hela styrelsen.",
    },
  ],

  arshjul: [
    {
      ikon: "📅",
      titel: "Planera hela styrelseåret",
      text: "Lägg in styrelsemöten, stämma, OVK, besiktningar och deklarationer för hela kommande året — slippa missa viktiga deadlines.",
    },
    {
      ikon: "🔔",
      titel: "Påminnelser i förväg",
      text: "Ställ in påminnelse X dagar innan — du får en notis i rätt tid utan att behöva hålla koll på en kalender vid sidan om.",
    },
    {
      ikon: "🔄",
      titel: "Återkommande händelser",
      text: "Märk en händelse som återkommande och den dyker automatiskt upp nästa år vid samma period.",
    },
  ],

  projekt: [
    {
      ikon: "📂",
      titel: "En mapp per projekt",
      text: "Skapa en mapp per projekt och år — håll ritningar, kontrakt, protokoll och kontakter samlade på ett ställe utan en enda e-post.",
    },
    {
      ikon: "🔍",
      titel: "Garantibesiktning i rätt tid",
      text: "Garantibesiktningsmodulen påminner om besiktningstidpunkten och håller koll på vem som besiktar och resultatet.",
    },
    {
      ikon: "🗄️",
      titel: "Arkivera äldre projekt",
      text: "Avslutade projekt arkiveras men försvinner inte — hitta gamla kontrakt och protokoll när ni behöver dem som referens.",
    },
  ],

  energi: [
    {
      ikon: "⚡",
      titel: "Koppla till underhållsplanen",
      text: "Energiåtgärder kan länkas till underhållsplanen — en samlad budget för alla investeringar, inte separata kalkylark.",
    },
    {
      ikon: "🌱",
      titel: "Identifiera bästa åtgärden",
      text: "Se vilket byte — fönster, isolering eller värmepump — som ger störst energibesparing relativt investering för er fastighet.",
    },
  ],

  foreningsinformation: [
    {
      ikon: "📁",
      titel: "Rätt dokument i rätt mapp",
      text: "Stadgar, ekonomisk plan och besiktningsprotokoll sparade i strukturerade mappar — inga lösa filer på datorer som försvinner när styrelseledamöter byts.",
    },
    {
      ikon: "🔗",
      titel: "Dela direkt med styrelsen",
      text: "Dela sidans länk med alla styrelseledamöter så att de alltid når aktuella dokument utan att ringa runt.",
    },
  ],

  prislistor: [
    {
      ikon: "💰",
      titel: "Koppla till åtgärder i planen",
      text: "Priser från leverantörer kan kopplas direkt till underhållsåtgärder i Åtgärdsplan — kostnadsuppskattningen uppdateras automatiskt.",
    },
    {
      ikon: "📅",
      titel: "Håll priser aktuella",
      text: "Lägg in giltighetsdatum på prislistan — ni ser direkt när en prislista behöver uppdateras inför nästa upphandlingsrunda.",
    },
  ],

  guider: [
    {
      ikon: "🎬",
      titel: "Korta filmer per funktion",
      text: "Varje film tar under 2 minuter och visar exakt hur en specifik funktion används — perfekt att dela med nya styrelseledamöter.",
    },
    {
      ikon: "📋",
      titel: "Tips för upphandling",
      text: "Lär er hur ni referenskollar entreprenörer, sätter rätt krav och undviker de vanligaste misstagen i en BRF-upphandling.",
    },
  ],
};
