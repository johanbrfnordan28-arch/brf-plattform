/** Textmall — speglar Excel-strukturen i anbuds-utvardering-excel.ts */

export const ANBUDS_UTVARDERING_MALL = `ANBUDSUTVÄRDERING — MALL
================================

Projekt: [Projektets namn]
Förening: [Föreningens namn]
Datum för utvärdering: [ÅÅÅÅ-MM-DD]
Antal anbud: _____ (max 10 platser i Excel)

SYFTE
Jämföra inkomna anbud mot samma struktur som «Anbudsformulär — standard»:
krav (Ja/Nej), huvudpris, optioner (max 5), ÄTA-timpriser och timmar,
materialpåslag, minsta ÄTA-debitering och referenser.

REKOMMENDATION
Ladda ned Excel-mallen. Skriv företagsnamn på bladet Entreprenörer (nr 1–10).
I jämförelsebladen används kolumnrubriker 1–10 — samma nummer som entreprenörslistan.
Siffror summeras (delsumma, ÄTA totalt, slutsumma). Krav fylls i med Ja eller Nej.

SÅ HÄR GÖR NI (STEG FÖR STEG)
1. Kontrollera att varje anbud är komplett enligt anbudsformuläret.
2. Fyll i nr 1–10 och företagsnamn på bladet Entreprenörer.
3. För in Ja/Nej för F-skatt, försäkring, ID06 och underentreprenörer per kolumn.
4. För in huvudpris och option 1–5 (kr, exkl. moms) per kolumn.
5. Fyll ÄTA-timmar (gemensamt) och ÄTA-timpris per nr och yrkesgrupp — kostnad summeras.
6. Jämför slutsumma och placering 1–10; bedöm även huvud+optioner och ÄTA var för sig.
7. Rekommendation till styrelsen — lägst pris är inte alltid rätt val.

EXCEL — BLAD (översikt)
Entreprenörer     Namn, org.nr, kontakt, projektledare, referensbelopp per nr
Utvärdering       Ja/Nej-krav, prisposter, delsummor, slutsumma, placering
ÄTA-timmar        Timmar dag/kväll/helg per yrkesgrupp (samma för alla)
ÄTA-timpris       Timpris dag/kväll/helg per yrkesgrupp och nr 1–10
ÄTA-kostnad       Summa per yrkesgrupp och nr; rad längst ner = ÄTA-scenario totalt

Övriga bedömningskriterier (om ni inte enbart väger pris):
Referenser / erfarenhet: _________________________________________________
Tidplan och genomförande: _______________________________________________
Kvalitet / metod / miljö: ________________________________________________

REKOMMENDATION TILL STYRELSEN
Rekommenderat nr (1–10) / företag: ______________________________________
Motivering (pris, ÄTA, krav Ja/Nej, optioner): ___________________________
_________________________________________________________________________
Förbehåll / komplettering krävs: Ja [ ] Nej [ ]  Beskrivning: _____________

Beslut fattas på styrelsemöte: [datum]  Protokollfört: Ja [ ] Nej [ ]

Signatur utvärdering (styrelse/uppdragstagare):
Namn: _________________________ Datum: _____________
`;
