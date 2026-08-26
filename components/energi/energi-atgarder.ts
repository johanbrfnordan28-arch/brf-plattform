export type EnergiAtgard = {
  id: string;
  titel: string;
  beskrivning: string;
  /** Påverkar främst driftkostnad, livslängd eller båda */
  effekt: "drift" | "livslangd" | "bade";
  tips?: string;
};

export const energiVarmeAtgarder: EnergiAtgard[] = [
  {
    id: "varme-livslangd",
    titel: "Livslängd — installationen avgör",
    beskrivning:
      "Ett värmesystem kan hålla upp till omkring 100 år om installationen från början var väl utförd. Sämre utförande, material eller drift förkortar tiden — därför skiljer sig föreningar åt även med samma ålder på huset.",
    effekt: "livslangd",
    tips: "Dokumentera undercentral, stammar och utförandekvalitet i underhållsplanen så byten planeras realistiskt.",
  },
  {
    id: "injustering",
    titel: "Injustering och balansering",
    beskrivning:
      "Radiatorer och stamventiler justeras så värmen fördelas jämnt — lägre energiförbrukning och färre klagomål om kyla eller övertemperatur. Behövs särskilt efter större förändringar i huset.",
    effekt: "bade",
    tips: "Har vindsvåningar byggts till ändras värmebehovet — då ska systemet injusteras på nytt.",
  },
  {
    id: "termostater",
    titel: "Byte av termostater",
    beskrivning:
      "Termostater slits och blir ojämna med tiden. Byte efter ungefär 20–30 år ger bättre reglering, jämnare komfort och ofta lägre onödig energianvändning — utan att byta hela värmesystemet.",
    effekt: "bade",
    tips: "Planera termostatbyte som eget tillfälle i underhållsplanen, gärna i samband med injustering.",
  },
  {
    id: "styrning",
    titel: "Styrning och natt-/helgsänkning",
    beskrivning:
      "Tidsprogram i trapphus, garage och gemensamma utrymmen — värme där det behövs, inte mer.",
    effekt: "drift",
  },
  {
    id: "tryck-lackage",
    titel: "Tryck och läckage i systemet",
    beskrivning:
      "Tappar systemet tryck ofta behövs utredning — onödig påfyllning kostar både energi och slitage.",
    effekt: "bade",
    tips: "Se moment Teknikutrymmen i ronderingsschemat.",
  },
  {
    id: "isolering-ror",
    titel: "Isolering av stamledningar",
    beskrivning:
      "Oisolerade rör i källare och teknikutrymmen ger värmeförluster året om.",
    effekt: "drift",
  },
];

export const energiBelysningAtgarder: EnergiAtgard[] = [
  {
    id: "led-trapphus",
    titel: "LED i trapphus och garage",
    beskrivning:
      "Byte till LED sänker elförbrukningen kraftigt jämfört med äldre lysrör och glödlampor.",
    effekt: "bade",
    tips: "Tekniskt armaturbyte planeras i underhållsplanen; energibesparingen kommer direkt.",
  },
  {
    id: "rorelse-styrning",
    titel: "Rörelsevakt och dagsljusstyrning",
    beskrivning:
      "Entréer, källargångar och garage — ljus när någon är där, annars dämpat eller av.",
    effekt: "drift",
  },
  {
    id: "underhall-armatur",
    titel: "Rengöring och byte av trasiga armaturer",
    beskrivning:
      "Smutsiga armaturer och flimrande lampor ger sämre ljus och ibland högre förbrukning.",
    effekt: "livslangd",
    tips: "Kontrolleras vid rondering (Belysning utvändigt/invändigt) och städ.",
  },
  {
    id: "styrning-tid",
    titel: "Rätt tider för utomhusbelysning",
    beskrivning:
      "Gård och fasad — anpassa tider efter säsong så belysning inte står på i onödan.",
    effekt: "drift",
  },
];

export const energiTakAtgarder: EnergiAtgard[] = [
  {
    id: "tak-material",
    titel: "Material och livslängd",
    beskrivning:
      "Livslängden för tak ligger oftast mellan ca 25 och 100 år. Kortast har papp (bitumen). Välskötta plåttak kan hålla mer än 100 år. Utfallet beror mycket på skötsel och geografiska förutsättningar — klimat, vind och nederbörd.",
    effekt: "livslangd",
    tips: "Ange taktyp och ungefärlig ålder i underhållsplanen så omläggning och budget blir realistiska.",
  },
  {
    id: "tak-skotsel",
    titel: "Skötsel, lutning och avvattning",
    beskrivning:
      "Kostnaden för skötsel och underhåll påverkas av bland annat taklutning och hur takavvattningen fungerar. Står vattnet kvar i rännor eller på takytan ökar risken för läckage och skador på både tak och fasad.",
    effekt: "bade",
    tips: "Kontrollera hängrännor, ränndalar och stuprör vid rondering — särskilt efter lövfall och snösmältning.",
  },
  {
    id: "tak-varmekablar",
    titel: "Värmekablar och vattenavrinning",
    beskrivning:
      "Värmekablar i stuprör och rännor underlättar vattenavrinningen vintertid genom att smälta snö och is så smältvatten kan rinna undan. Löv, mossa och annat skräp kan orsaka stopp — då hjälper inte kablarna och vatten, snö och is kan skada tak och fasad.",
    effekt: "livslangd",
    tips: "Rensa rännor och stuprör före vintern. En värmekabel ersätter inte rensning.",
  },
];

export const energiFonsterAtgarder: EnergiAtgard[] = [
  {
    id: "fonster-material",
    titel: "Material — trä, PVC och aluminium",
    beskrivning:
      "Fönster finns bland annat i trä och PVC. Äldre träfönster har ofta högre materialkvalitet än många nya. Moderna träfönster är ofta aluminiumbeklädda — mer underhållssnåla utvändigt, men fortfarande en annan livscykel än PVC.",
    effekt: "livslangd",
    tips: "Dokumentera material och ålder i underhållsplanen innan ni beslutar om renovering eller byte.",
  },
  {
    id: "fonster-energi",
    titel: "Energivärde — nya mot gamla",
    beskrivning:
      "Nya fönster har betydligt bättre energivärden än äldre. Ett byte sänker ofta värmeförlusterna markant och kan förbättra både komfort och driftkostnad — även om själva bytet planeras efter teknisk livslängd.",
    effekt: "bade",
    tips: "Räkna på payback: investering kontra lägre uppvärmningskostnad och eventuellt lägre underhåll.",
  },
  {
    id: "fonster-underhall",
    titel: "Underhåll innan byte",
    beskrivning:
      "Målning, beslag och tätningslister förlänger livet på fönstren. Slitna eller saknade tätningslister ger drag, kallras och onödig energiförlust — nya lister är en enkel åtgärd som ofta märks direkt i komfort och värmekostnad. Bra underhåll skjuter upp bytet, men ersätter sällan den energiförbättring ett modernare fönster ger.",
    effekt: "bade",
    tips: "Kontrollera tätningslister vid rondering och planera byte/målning i underhållsplanen.",
  },
];
