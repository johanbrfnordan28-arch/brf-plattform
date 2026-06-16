/** Mallar i dokumentbanken — kan utökas och kopplas till lagring/API senare. */
export type DokumentMallOmrade =
  | "upphandling"
  | "juridik"
  | "avtal"
  | "styrelse"
  | "ovrig";

export type DokumentbankMall = {
  id: string;
  titel: string;
  filnamn: string;
  beskrivning: string;
  omrade: DokumentMallOmrade;
  /** Textinnehåll som kan laddas ned som .txt/.md — valfritt. */
  textInnehall?: string;
};

export const OMRADE_ETIKETTER: Record<DokumentMallOmrade, string> = {
  upphandling: "Upphandling",
  juridik: "Juridik",
  avtal: "Avtal",
  styrelse: "Styrelse & protokoll",
  ovrig: "Övrigt",
};

export const dokumentbankMallar: DokumentbankMall[] = [
  // ── Upphandling ────────────────────────────────────────────────────────────
  {
    id: "projekt-beskrivning",
    titel: "Projektbeskrivning — mall",
    filnamn: "Projektbeskrivning_mall.txt",
    beskrivning: "Struktur för scope, omfattning och krav till entreprenör.",
    omrade: "upphandling",
    textInnehall: `PROJEKTBESKRIVNING
==================

Förening: [Föreningens namn]
Datum: [ÅÅÅÅ-MM-DD]
Projekt: [Projektets namn, t.ex. Takbyte 2025]

1. BAKGRUND OCH SYFTE
Beskriv varför projektet genomförs och vad målet är.

2. OMFATTNING
Beskriv vad som ska utföras. Inkludera:
- Arbetsområde / adress
- Mängder (kvm, löpmeter, antal)
- Material och utförande

3. KRAV PÅ UTFÖRANDE
- Tekniska krav
- Standarder och normer (t.ex. BBR, AMA)
- Eventuella certifieringskrav

4. TIDSPLAN
- Planerad start: [datum]
- Planerat färdigdatum: [datum]
- Eventuella delsträckor

5. ÖVRIGT
- Tillgång till fastigheten
- Parkeringsbegränsningar
- Kontaktperson hos föreningen: [namn, telefon]
`,
  },
  {
    id: "anbudsformular-standard",
    titel: "Anbudsformulär — standard",
    filnamn: "Anbudsformular_BRF_standard.txt",
    beskrivning: "Standardformulär för pris, omfattning och referenser.",
    omrade: "upphandling",
    textInnehall: `ANBUDSFORMULÄR — BRF STANDARD
==============================

Upphandlande förening: [Föreningens namn]
Projekt: [Projektets namn]
Sista anbudsdag: [ÅÅÅÅ-MM-DD]

ANBUDSGIVARE
Företagsnamn: ___________________________________
Organisationsnummer: ____________________________
Kontaktperson: __________________________________
Telefon: ________________________________________
E-post: _________________________________________

PRIS (exkl. moms)
Fast pris för hela uppdraget: _____________ kr
Alternativt: Á-prislista bifogas [ ]

REFERENSER (minst 2 liknande uppdrag de senaste 5 åren)
1. Uppdragsgivare: _____________ År: _____ Belopp: _____ kr
2. Uppdragsgivare: _____________ År: _____ Belopp: _____ kr

FÖRSÄKRINGAR
Ansvarsförsäkring (minst 10 Mkr): Ja [ ] Nej [ ]  Intyg bifogas [ ]

PERSONAL OCH UNDERENTREPRENÖRER
Projektledare: __________________________________
ID06-registrerat: Ja [ ] Nej [ ]
Underentreprenörer används: Ja [ ] Nej [ ]  (lista bifogas vid Ja)

UNDERSKRIFT
Ort och datum: __________________________________
Behörig firmatecknare: __________________________
`,
  },
  {
    id: "kontrakt-entreprenad",
    titel: "Kontraktsformulär entreprenad",
    filnamn: "Kontraktsformular_entreprenad.txt",
    beskrivning: "Avtalsunderlag efter tilldelad entreprenör.",
    omrade: "upphandling",
    textInnehall: `ENTREPRENADKONTRAKT
===================

Beställare: [Föreningens namn], org.nr [xxx]
Entreprenör: [Företagsnamn], org.nr [xxx]

UPPDRAG
[Beskriv uppdraget kortfattat]

AVTALSSUMMA
Fast pris: _____________ kr (exkl. moms)
Moms (25 %): ___________ kr
Total inkl. moms: _______ kr

TIDSPLAN
Startdatum: [ÅÅÅÅ-MM-DD]
Slutdatum: [ÅÅÅÅ-MM-DD]
Vite vid försening: _____ kr per påbörjad dag

BETALNINGSVILLKOR
- 30 % vid kontraktsskrivning
- 40 % vid halvtidbesiktning
- 30 % vid godkänd slutbesiktning
Betalningsvillkor: 30 dagar netto

GARANTIER
Garantitid: 2 år från godkänd slutbesiktning
Ansvarstid: 10 år

BILAGOR
[ ] Projektbeskrivning
[ ] Anbudsformulär (godkänt)
[ ] Försäkringsintyg
[ ] AB 04 gäller som allmänna bestämmelser

UNDERSKRIFTER
Beställare: _________________________ Datum: _______
Entreprenör: _______________________ Datum: _______
`,
  },
  {
    id: "af-ab04",
    titel: "AF — administrativa föreskrifter (AB04)",
    filnamn: "AF_AB04_mall.txt",
    beskrivning: "För större entreprenader med fullständigt underlag.",
    omrade: "upphandling",
    textInnehall: `ADMINISTRATIVA FÖRESKRIFTER (AF)
================================
Baserade på AB 04 — Allmänna bestämmelser för byggnads-, anläggnings- och
installationsentreprenader

Projekt: [Projektets namn]
Förening: [Föreningens namn]

AFB UPPHANDLINGSFÖRESKRIFTER
Entreprenadform: Utförandeentreprenad
Ersättningsform: Fast pris (klumpsumma)
Upphandlingsform: Selektiv upphandling

AFD ENTREPRENADFÖRESKRIFTER VID UTFÖRANDEENTREPRENAD
AFD.1 Ersättning
Ersättning utgår som fast pris enligt anbud.
ÄTA-arbeten regleras enligt prislista i anbud eller löpande räkning om ej annat avtalats.

AFD.2 Arbetstid
Normal arbetstid: mån–fre kl. 07.00–17.00
Arbete utanför normal tid kräver beställarens godkännande.

AFD.3 Besiktning
Slutbesiktning genomförs av beställaren och entreprenören gemensamt.
Garantibesiktning genomförs 12 månader efter godkänd slutbesiktning.

AFD.4 Säkerhet
Ställningsgaranti: 10 % av kontraktssumman (gäller till och med garantitidens utgång).

AFD.5 Vite
Vid försening: 1 % av kontraktssumman per påbörjad vecka, max 15 %.

[Komplettera med projektspecifika föreskrifter]
`,
  },
  {
    id: "sekretess-anbud",
    titel: "Sekretess och anbudshantering",
    filnamn: "Anvisning_sekretess_anbud.txt",
    beskrivning: "Styrelsens rutin kring låsta anbud till efter deadline.",
    omrade: "upphandling",
    textInnehall: `RUTIN FÖR SEKRETESS OCH ANBUDSHANTERING
=========================================

Förening: [Föreningens namn]
Projekt: [Projektets namn]

SYFTE
Säkerställa att inkomna anbud hanteras konfidentiellt och att alla 
anbudsgivare behandlas lika.

MOTTAGNING AV ANBUD
- Anbud tas emot senast [datum, tid]
- Anbud ska märkas: "Anbud — [Projektnamn] — KONFIDENTIELLT"
- Förseglade anbud förvaras i låst utrymme till öppningstillfället

ÖPPNING AV ANBUD
- Öppning sker: [datum, tid]
- Minst två styrelseledamöter ska närvara vid öppning
- Protokoll förs över inkomna anbud (ej belopp — sekretess tills utvärdering klar)

UTVÄRDERING
- Utvärderingen sker av [ansvarig person/BRF Företag]
- Utvärderingskriterier: pris (70 %), referenser (20 %), leveranstid (10 %)
- Anbudsbelopp hålls konfidentiella tills beslut fattats

BESLUT OCH MEDDELANDE
- Beslut fattas av styrelsen
- Alla anbudsgivare meddelas resultatet skriftligen
- Sekretessen upphör när alla anbudsgivare meddelats

DOKUMENTATION
Anbudshandlingar arkiveras i [plats/system] i minst 5 år.
`,
  },
  {
    id: "sba-kontrollmall",
    titel: "Systematiskt brandskyddsarbete — kontrollmall",
    filnamn: "SBA_kontrollmall_egenkontroll.txt",
    beskrivning: "Checklista för SBA — branddörrar, utrymningsvägar och rökgasevakuering.",
    omrade: "upphandling",
    textInnehall: `SYSTEMATISKT BRANDSKYDDSARBETE (SBA)
Egenkontroll — Checklista
=====================================

Förening: [Föreningens namn]
Datum: [ÅÅÅÅ-MM-DD]
Utförd av: [Namn]

BRANDDÖRRAR
[ ] Dörrar stänger och låser sig självständigt
[ ] Tätningslister är hela och utan skador
[ ] Dörrstängare fungerar
[ ] Dörrar är märkta "Branddörr — håll stängd"
Anteckningar: ___________________________________

UTRYMNINGSVÄGAR
[ ] Alla utrymningsvägar är fria från hinder
[ ] Utrymningsskyltar lyser och är läsliga
[ ] Nödbelysning fungerar (testas månadsvis)
[ ] Trapphus fritt från brännbart material
Anteckningar: ___________________________________

RÖKGASEVAKUERING
[ ] Rökgasfläkt/öppningsbara fönster i trapphus fungerar
[ ] Styrning av rökgasevakuering är testad
Anteckningar: ___________________________________

BRANDSLÄCKNING
[ ] Antal handbrandsläckare: _______ Kontrollerade: [ ]
[ ] Brandposter kontrollerade
Anteckningar: ___________________________________

NÄSTA PLANERADE KONTROLL: [datum]
ANSVARIG: [namn och kontaktuppgifter]
`,
  },
  {
    id: "avtalsvillkor-drift",
    titel: "Avtalsvillkor städ och fastighetsskötsel",
    filnamn: "Avtalsvillkor_stad_och_rondering.txt",
    beskrivning: "Vite vid utebliven städ/rondering, krav på anbudsgivare och synlig ID06.",
    omrade: "upphandling",
    textInnehall: `AVTALSVILLKOR — STÄD OCH FASTIGHETSSKÖTSEL
==========================================

Förening: [Föreningens namn]
Avtalsnummer: [xxx]
Gäller fr.o.m.: [datum]

1. KRAV PÅ LEVERANTÖREN
- F-skattsedel: krävs
- ID06: personal ska bära synlig ID06-bricka vid arbete i fastigheten
- Ansvarsförsäkring: minst 5 Mkr
- Underentreprenörer ska uppfylla samma krav och anmälas i förväg

2. TJÄNSTERNAS OMFATTNING
Se bilagd kravspecifikation och rondering-/städschema.

3. PRISER OCH FAKTURERING
- Pris enligt offert, fast per månad
- Fakturering: månadsvis i förskott
- Betalningsvillkor: 30 dagar netto
- Prisändring tillåts max 1 gång per år med 2 månaders varsel

4. VITE
- Utebliven städning eller rondering utan godkänd frånvaro:
  50 % av månadsarvodet per uteblivet tillfälle
- Vite faktureras av föreningen och dras från kommande faktura

5. AVVIKELSER
Avvikelser rapporteras via [avvikelsekanal] senast [x] timmar efter round.
Åtgärd ska ske inom [x] dagar efter rapport.

6. UPPSÄGNING
Ömsesidig uppsägningstid: 3 månader
Vid avtalsbrott: 1 månads uppsägningstid

7. FORCE MAJEURE
Fritar leverantören från vite vid dokumenterade extraordinära händelser.
`,
  },
  // ── Styrelse & protokoll ──────────────────────────────────────────────────
  {
    id: "styrelseprotokoll",
    titel: "Styrelseprotokoll — mall",
    filnamn: "Styrelseprotokoll_mall.txt",
    beskrivning: "Standardmall för protokoll från styrelsemöte.",
    omrade: "styrelse",
    textInnehall: `STYRELSEPROTOKOLL
=================

Förening: [Föreningens namn], org.nr [xxx]
Möte nr: _____ / [år]
Datum och tid: [ÅÅÅÅ-MM-DD, kl. HH:MM]
Plats: [Adress / digitalt]

NÄRVARANDE
Ordförande: [Namn]
Kassör: [Namn]
Ledamot: [Namn]
Ledamot: [Namn]
Suppleant (ej tjänstgörande): [Namn]

§ 1 MÖTETS ÖPPNANDE
Ordföranden öppnade mötet och hälsade ledamöterna välkomna.

§ 2 VAL AV MÖTESSEKRETERARE OCH JUSTERARE
Mötessekreterare: [Namn]
Justerare (utöver ordföranden): [Namn]

§ 3 GODKÄNNANDE AV DAGORDNING
Dagordningen godkändes utan ändringar.

§ 4 FÖREGÅENDE PROTOKOLL
Protokoll från möte [datum] genomgicks och lades till handlingarna.

§ 5 EKONOMI
[Kassören redogjorde för det ekonomiska läget. Saldo: xxx kr.]

§ 6 LÖPANDE ÄRENDEN
[Beskriv ärenden]

§ 7 ÖVRIGA FRÅGOR
[Beskriv]

§ 8 NÄSTA MÖTE
Nästa styrelsemöte: [datum, tid, plats]

§ 9 MÖTETS AVSLUTANDE
Ordföranden förklarade mötet avslutat.

Vid protokollet: _______________________ [Namn, datum]
Justeras: _____________________________ [Namn, datum]
Justeras: _____________________________ [Namn, datum]
`,
  },
  {
    id: "kallelse-styrelsemote",
    titel: "Kallelse till styrelsemöte",
    filnamn: "Kallelse_styrelsemote.txt",
    beskrivning: "Mall för kallelse med dagordning till styrelsemöte.",
    omrade: "styrelse",
    textInnehall: `KALLELSE TILL STYRELSEMÖTE
==========================

Till styrelseledamöterna i [Föreningens namn]

Datum och tid: [ÅÅÅÅ-MM-DD, kl. HH:MM]
Plats: [Adress / länk för digitalt möte]

DAGORDNING

1. Mötets öppnande
2. Val av mötessekreterare och justerare
3. Godkännande av dagordning
4. Föregående protokoll
5. Ekonomi
6. [Ärende 1]
7. [Ärende 2]
8. Övriga frågor
9. Nästa möte
10. Mötets avslutande

Handlingar skickas senast [datum] till ledamöterna.

Med vänliga hälsningar
[Namn], Ordförande
[Föreningens namn]
Tel: [xxx]
E-post: [xxx]
`,
  },
  {
    id: "arsredovisning-folgebrev",
    titel: "Följebrev årsredovisning",
    filnamn: "Folgebrev_arsredovisning.txt",
    beskrivning: "Brev till medlemmar vid utskick av årsredovisning.",
    omrade: "styrelse",
    textInnehall: `[Ort], [datum]

Till boende i [Föreningens namn]

ÅRSREDOVISNING [ÅR]

Bifogar härmed årsredovisning för [Föreningens namn] för räkenskapsåret [år].

VIKTIGA HÄNDELSER UNDER ÅRET
[Beskriv 2–3 viktiga händelser eller investeringar]

EKONOMISK SAMMANFATTNING
Årets resultat: [xxx] kr
Soliditet: [xx] %
Årsavgift: oförändrad / höjdes med [x] % fr.o.m. [datum]

STÄMMA
Ordinarie föreningsstämma hålls:
Datum: [ÅÅÅÅ-MM-DD]
Tid: kl. [HH:MM]
Plats: [Adress]

Motioner ska vara styrelsen tillhanda senast [datum].

Med vänliga hälsningar
Styrelsen i [Föreningens namn]
`,
  },
  // ── Juridik ───────────────────────────────────────────────────────────────
  {
    id: "varning-storning",
    titel: "Varning vid störning",
    filnamn: "Varning_storning.txt",
    beskrivning: "Formell varning till boende vid upprepade störningar.",
    omrade: "juridik",
    textInnehall: `VARNING
=======

[Ort], [datum]

Till: [Namn på hyresgäst/bostadsrättsinnehavare]
Gäller: Lägenhet [nr], [adress]

VARNING ENLIGT BOSTADSRÄTTSLAGEN (7 KAP. 18 §)

Ni har vid upprepade tillfällen stört övriga boende. Konkret gäller detta:

[Beskriv störningarna med datum och tid]

Vi uppmanar er att omedelbart upphöra med störningarna.
Vid utebliven rättelse kan styrelsen vara tvungen att hänskjuta ärendet till
hyresnämnden för prövning av om nyttjanderätten förverkats.

Styrelsen tar störningar på stort allvar och är skyldiga att ingripa när
boende klagar.

Med vänliga hälsningar
Styrelsen i [Föreningens namn]
[Underskrift]

Kopia: [Ev. fastighetsförvaltaren]

OBS: Bevara kopior av alla varningar och dokumentation av störningarna.
`,
  },
  {
    id: "tilltradesbegaran",
    titel: "Begäran om tillträde till lägenhet",
    filnamn: "Begaran_tilltrade.txt",
    beskrivning: "Avisering till boende inför tillträde för besiktning eller underhåll.",
    omrade: "juridik",
    textInnehall: `AVISERING OM TILLTRÄDE TILL LÄGENHET
=====================================

[Ort], [datum]

Till: [Namn på bostadsrättsinnehavare]
Gäller: Lägenhet [nr], [adress]

AVISERING
Vi behöver tillträde till er lägenhet för följande ändamål:

Ändamål: [t.ex. rörinspektion, OVK, stambyte, besiktning]
Datum: [ÅÅÅÅ-MM-DD]
Tid: kl. [HH:MM]–[HH:MM]
Utförare: [Företagsnamn och kontaktperson]

Enligt bostadsrättslagen (7 kap. 6 §) är bostadsrättsinnehavaren skyldig 
att bereda tillträde om det behövs för underhåll av fastigheten.

Kontakta oss om angiven tid inte passar, så hittar vi en alternativ tidpunkt.

Kontaktperson: [Namn, telefon, e-post]

Med vänliga hälsningar
Styrelsen i [Föreningens namn]
`,
  },
  // ── Avtal ─────────────────────────────────────────────────────────────────
  {
    id: "avtal-forvaltning",
    titel: "Avtal fastighetsförvaltning",
    filnamn: "Avtal_fastighetsforvaltning.txt",
    beskrivning: "Ramavtal med fastighetsförvaltare — drift, administration och felanmälan.",
    omrade: "avtal",
    textInnehall: `AVTAL OM FASTIGHETSFÖRVALTNING
==============================

Beställare: [Föreningens namn], org.nr [xxx]
Förvaltare: [Förvaltningsbolagets namn], org.nr [xxx]

AVTALETS OMFATTNING
Förvaltaren åtar sig följande tjänster:
[ ] Teknisk förvaltning (rondering, felanmälan, underhåll)
[ ] Ekonomisk förvaltning (bokföring, avgiftsavisering, deklaration)
[ ] Administrativ förvaltning (stämmor, avtal, register)

AVTALSTID
Fr.o.m.: [datum]
T.o.m.: [datum] (förlängs automatiskt 1 år om ej uppsagt)
Uppsägningstid: 6 månader innan avtalstidens utgång

ERSÄTTNING
Fast månadsarvode: _____________ kr (exkl. moms)
Timpris för arbete utöver avtal: ______ kr/h (exkl. moms)
Fakturering: månadsvis i förskott, 30 dagars betalningsvillkor

RAPPORTERING
Förvaltaren rapporterar till styrelsen: [månadsvis / kvartalsvis]
Rapport ska innehålla: ekonomisk sammanfattning, felanmälningar, åtgärder

ANSVAR
Förvaltaren är ansvarig för att åtgärder inom [x] kr kan beslutas utan
styrelsens godkännande. Överskridanden kräver skriftligt godkännande.

UNDERSKRIFTER
Beställare: _________________________ Datum: _______
Förvaltare: _________________________ Datum: _______
`,
  },
  {
    id: "hyresavtal-lokal",
    titel: "Hyresavtal lokal",
    filnamn: "Hyresavtal_lokal.txt",
    beskrivning: "Mall för uthyrning av föreningens lokaler (förråd, tvättstuga m.m.).",
    omrade: "avtal",
    textInnehall: `HYRESAVTAL — LOKAL
==================

Hyresvärd: [Föreningens namn], org.nr [xxx]
Hyresgäst: [Namn], personnr./org.nr [xxx]

HYRESOBJEKT
Lokal: [Beskrivning, t.ex. förråd nr 12]
Adress: [Adress]
Yta: [x] m²

HYRESTID
Fr.o.m.: [datum]
Tillsvidare med [3] månaders ömsesidig uppsägningstid
Alternativt: T.o.m. [datum]

HYRA
Månadsyra: _____________ kr
Betalas senast den [x] varje månad till: [bankgiro/IBAN]

SKICK OCH UNDERHÅLL
Lokalen hyrs ut i befintligt skick. Hyresgästen ansvarar för att hålla
lokalen i gott skick och ersätta skador utöver normalt slitage.

ÖVERLÅTELSE OCH ANDRAHANDSUTHYRNING
Lokalen får ej överlåtas eller hyras ut i andra hand utan hyresvärdens
skriftliga godkännande.

UNDERSKRIFTER
Hyresvärd: __________________________ Datum: _______
Hyresgäst: __________________________ Datum: _______
`,
  },
  // ── Upphandling (befintliga enkla) ────────────────────────────────────────
  {
    id: "ritning-bilaga",
    titel: "Bilaga ritningar",
    filnamn: "Bilaga_ritningar_mall.txt",
    beskrivning: "Förteckning och hänvisning till ritningsunderlag.",
    omrade: "upphandling",
    textInnehall: `BILAGA — RITNINGAR OCH TEKNISKT UNDERLAG
=========================================

Projekt: [Projektets namn]
Förening: [Föreningens namn]
Datum: [ÅÅÅÅ-MM-DD]

RITNINGSFÖRTECKNING

Nr  Ritningsnr  Beskrivning                     Rev  Datum
--  ----------  ------------------------------  ---  ----------
1   [xxx]       Situationsplan                  A    [datum]
2   [xxx]       Planritning [våning]            A    [datum]
3   [xxx]       Fasadritning                    A    [datum]
4   [xxx]       Sektionsritning                 A    [datum]
5   [xxx]       Detaljer [specificera]          A    [datum]

ANMÄRKNINGAR
[Notera eventuella avvikelser eller kompletterande underlag]

Ritningarna finns tillgängliga på: [plats/länk]
Kontakt för ritningsfrågor: [namn, telefon]
`,
  },
];

export function filtreraMallarForUpphandling(): DokumentbankMall[] {
  return dokumentbankMallar.filter((mall) => mall.omrade === "upphandling");
}

export function filtreraMallarPerOmrade(omrade: DokumentMallOmrade): DokumentbankMall[] {
  return dokumentbankMallar.filter((m) => m.omrade === omrade);
}

export function hamtaMall(id: string): DokumentbankMall | undefined {
  return dokumentbankMallar.find((m) => m.id === id);
}
