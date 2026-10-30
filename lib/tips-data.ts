export type TipsPunkt = {
  ikon: string;
  titel: string;
  text: string;
};

export const tips: Record<string, TipsPunkt[]> = {
  underhallsplan: [
    {
      ikon: "🏗️",
      titel: "Professionell grund först",
      text: "Det är viktigt att planen tas fram av en professionell part. Då får ni rätt omfattning, intervall och kostnadsläge — styrelse och förvaltare kan sedan arbeta vidare i det levande dokumentet.",
    },
    {
      ikon: "💡",
      titel: "Adresser före fasader",
      text: "I steg 1: börja med planinställningar, uppgifter och adresser. Fasader per byggnad öppnas när byggnader lagts in — då blir planen lättare att överblicka.",
    },
    {
      ikon: "📥",
      titel: "Lägg till och ta bort",
      text: "I steg 3 visas bara komponenterna i er plan. Ta bort det som inte finns i fastigheten, och lägg till en komponent när den behövs. Då blir planen överskådlig för nästa styrelse.",
    },
    {
      ikon: "📐",
      titel: "K3 och avskrivningstider",
      text: "Från 2026 gäller K3 för BRF. I komponentregistret anges avskrivningstid per del — underlag till anläggningsregistret, skilt från underhållsintervall. Se K3-avsnittet på slutsidan.",
    },
    {
      ikon: "📋",
      titel: "Slutprodukt för kommande styrelse",
      text: "Slutsidan summerar planen med budgetunderlag och checklista. Skriv ut eller spara som PDF — en tydlig utgångspunkt när styrelsen byts ut.",
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
      text: "OVK, energideklaration och radonmätning upphandlas från Styrning och Dokument. Tidigare protokoll och föreningens uppgifter följer med i anbudsformuläret, som mejlas från upphandlingsmodulen.",
    },
    {
      ikon: "🛗",
      titel: "Hiss enligt ABT-06",
      text: "Hisservice, reparation enligt felrapport och ny hiss skapas under Hiss i Styrning och Dokument. Id-bricka, maskinrum, serviceintervall, timpris, jour och bilkostnad följer med i anbudsformuläret.",
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
      titel: "Kvittens per uppdrag",
      text: "Städning och rondering kvitteras vid varje tillfälle mot föreningens schema. Avtalet godkänns med BankID — ni ser om tjänsten är utförd.",
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
      titel: "Er lista först",
      text: "Spara entreprenörer ni anlitar i er egen lista. Fyll på kontakt, uppdrag och egna uppgifter så nästa styrelse ser vad som gäller.",
    },
    {
      ikon: "✉️",
      titel: "Fråga Styrelse-Navet",
      text: "Behöver ni ett tips mejlar ni oss. Föreningen ansvarar för uppdraget. Vi har goda erfarenheter av dem vi tipsar om, och tar bort en entreprenör om en missnöjd förening inte får en godtagbar förklaring.",
    },
    {
      ikon: "📝",
      titel: "Skriftlig beställning",
      text: "Upprätta skriftlig beställning eller avtal med omfattning, tid och pris. Företag kan byta ägare och personal — kvaliteten kan förändras över tid.",
    },
  ],

  dokumentbank: [
    {
      ikon: "📥",
      titel: "Skapa kopia av en mall",
      text: "I Mallkatalog: Skapa kopia och namn efter projektet (t.ex. Takbyte 2026). Välj om den bara ska till föreningens dokument eller även in i ett projekt. Redigera under Föreningens dokument.",
    },
    {
      ikon: "✏️",
      titel: "Redigerbar kopia",
      text: "Varje kopia är ert eget dokument (utkast / klar / arkiverad). När ni lägger till i projekt pekar mappen på samma kopia — ändringar följer med i projektet.",
    },
    {
      ikon: "📁",
      titel: "Projekt och undermappar",
      text: "Lägg till kopior i rätt projekt och undermapp (kontrakt, underlag m.m.). Ni kan också skapa egna undermappar i projektet och placera dokument där.",
    },
  ],

  arshjul: [
    {
      ikon: "📅",
      titel: "Planera 50 år framåt",
      text: "Lägg in styrelsemöten, stämma, OVK och möteskedjan — planen räcker 50 år framåt så nästa styrelse tar över samma tidslinje.",
    },
    {
      ikon: "🔔",
      titel: "Påminnelser i förväg",
      text: "Ställ in påminnelse X dagar innan — du får en notis i rätt tid utan att behöva hålla koll på en kalender vid sidan om.",
    },
    {
      ikon: "🔄",
      titel: "Möteserie istället för dubbletter",
      text: "Byggmöten och liknande ligger som en händelse med intervall och antal (Byggmöte 1, 2, …). Utöka serien när projektet blir längre.",
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

  felanmalan: [
    {
      ikon: "📨",
      titel: "Ärendenummer till medlemmen",
      text: "Varje felanmälan får ett nummer (FM-år-sekvens) — be medlemmen spara det vid uppföljning.",
    },
    {
      ikon: "🔧",
      titel: "Vidare till rätt roll",
      text: "Sätt status och mejla vidare till entreprenör eller fastighetsskötare — historiken visar vem som gjorde vad.",
    },
    {
      ikon: "🔑",
      titel: "Tillträde och debitering",
      text: "Medlemmen kan ange nyckel/plats och om debitering kan bli aktuell — sparas på ärendet för förvaltaren.",
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
      text: "Priser från leverantörer kan kopplas till underhållsåtgärder i underhållsplanen — kostnadsuppskattningen uppdateras när ni fyller i offerter.",
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
