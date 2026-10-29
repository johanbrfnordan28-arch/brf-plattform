/** Textmall — speglar Excel-strukturen i anbuds-utvardering-excel.ts */

export const ANBUDS_UTVARDERING_MALL = `ANBUDSUTVÄRDERING — MALL
================================

Projekt: [Projektets namn]
Förening: [Föreningens namn]
Datum för utvärdering: [ÅÅÅÅ-MM-DD]
Antal anbud: _____

SYFTE
Jämföra inkomna anbud utifrån samma struktur som «Anbudsformulär — standard»:
huvudpris, optioner (max 5), ÄTA-timpriser (dag, kväll, helg) och timmar för
ÄTA-bedömning. Skillnader ska vara enkla att läsa i kronor och i procent.

REKOMMENDATION
Använd Excel-mallen: utvärderingsposterna står lodrätt till vänster, entreprenörerna
på en vågrät rad överst. Delsummor och SLUTSUMMA längst ner. Placering 1–3 visas
för slutsumma, huvud+optioner och ÄTA — vinnare på huvudpris kan ändå förlora på ÄTA.

SÅ HÄR GÖR NI (STEG FÖR STEG)
1. Kontrollera att alla anbud är kompletta enligt anbudsformuläret.
2. För in huvudpris och option 1–5 per anbudsgivare (exkl. moms).
3. För in timpriser ÄTA (dag, kväll, helg) per yrkesgrupp enligt anbuden.
4. Använd samma antal timmar (dag/kväll/helg) för alla anbud — timmar enligt
   anbudsformuläret / förfrågningsunderlaget.
5. Jämför totalsummor: huvud + valda optioner + ÄTA-scenario (om tillämpligt).
6. Viktning: dokumentera om pris är enda kriterium eller om t.ex. referenser,
   tidplan och metod också vägs in (poäng/intervall — fyll i nedan).
7. Skriv rekommendation till styrelsen med motivering och ev. förbehåll.

EXCEL — UTVÄRDERING (exkl. moms)
Kolumn A: poster lodrätt. Rad 5: företagsnamn. Jämför tre anbud.

— Huvuduppdrag och optioner —
Huvuduppdrag / Option 1–5
Delsumma huvud + optioner

— ÄTA-scenario —
ÄTA-scenario totalt (detalj på bladet ÄTA-scenario)

— Slutsumma —
SLUTSUMMA = delsummor ovan

Placering (1 = lägst): slutsumma | huvud + optioner | ÄTA-scenario
Rekommenderad entreprenör och motivering fylls i Excel efter helhetsbedömning.

Övriga bedömningskriterier (om ni inte enbart väger pris):
Referenser / erfarenhet: _________________________________________________
Tidplan och genomförande: _______________________________________________
Kvalitet / metod / miljö: ________________________________________________

REKOMMENDATION TILL STYRELSEN
Rekommenderad anbudsgivare: _____________________________________________
Motivering (pris, optioner, ÄTA, risker): _______________________________
_________________________________________________________________________
Förbehåll / komplettering krävs: Ja [ ] Nej [ ]  Beskrivning: _____________

Beslut fattas på styrelsemöte: [datum]  Protokollfört: Ja [ ] Nej [ ]

Signatur utvärdering (styrelse/uppdragstagare):
Namn: _________________________ Datum: _____________
`;
