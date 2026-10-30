/**
 * Excel (.xls) för anbudsutvärdering — upp till 10 entreprenörer.
 * Namn på bladet Entreprenörer (nr 1–10); jämförelse kolumner 1–10.
 */

import {
  ANBUD_ANTAL_ENTREPRENORER,
  ANBUD_ATA_YRKESGRUPPER,
  ANBUD_JA_NEJ_KRAV,
  ANBUD_OVRIGA_SIFFROR,
  ANBUD_PRIS_POSTER,
  anbudExcelKolumner,
  anbudLagstKolumn,
  kolumnBokstav,
} from "@/components/dokumentbank/anbuds-standard";

export { ANBUD_ATA_YRKESGRUPPER };

const ANBUD_KOL = anbudExcelKolumner();
const COL_LAGST = anbudLagstKolumn();

/** Första datarad yrkesgrupp på ÄTA-bladen (1-baserat). */
const ATA_DATA_START = 3;
const ATA_SUMMA_RAD = ATA_DATA_START + ANBUD_ATA_YRKESGRUPPER.length;

type RadRef = { xml: string; r: number };

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function cellString(value: string): string {
  return `<Cell><Data ss:Type="String">${xmlEscape(value)}</Data></Cell>`;
}

function cellNumber(value: number): string {
  return `<Cell><Data ss:Type="Number">${Number.isFinite(value) ? value : 0}</Data></Cell>`;
}

function cellFormula(formula: string): string {
  return `<Cell ss:Formula="${xmlEscape(formula)}"><Data ss:Type="Number">0</Data></Cell>`;
}

function row(cells: string[]): string {
  return `<Row>${cells.join("")}</Row>`;
}

function worksheet(name: string, rows: string[]): string {
  return `<Worksheet ss:Name="${xmlEscape(name.slice(0, 31))}"><Table>${rows.join("")}</Table></Worksheet>`;
}

function minRangeRad(r: number): string {
  const first = ANBUD_KOL[0];
  const last = ANBUD_KOL[ANBUD_KOL.length - 1];
  return `MIN(${first}${r}:${last}${r})`;
}

function tommaAnbudCeller(): string[] {
  return ANBUD_KOL.map(() => cellString(""));
}

function tommaAnbudNummer(): string[] {
  return ANBUD_KOL.map(() => cellNumber(0));
}

function pushRad(rader: string[], cells: string[]): RadRef {
  const r = rader.length + 1;
  rader.push(row(cells));
  return { xml: rader[rader.length - 1], r };
}

function sectionRad(rader: string[], etikett: string): void {
  pushRad(rader, [cellString(etikett), ...tommaAnbudCeller(), cellString("")]);
}

function prisRad(rader: string[], etikett: string): number {
  const cells = [cellString(etikett), ...tommaAnbudNummer()];
  cells.push(cellFormula(`=${minRangeRad(rader.length + 1)}`));
  return pushRad(rader, cells).r;
}

function jaNejRad(rader: string[], etikett: string): void {
  pushRad(rader, [
    cellString(`${etikett} (Ja/Nej)`),
    ...ANBUD_KOL.map(() => cellString("")),
    cellString(""),
  ]);
}

function sumRad(
  rader: string[],
  etikett: string,
  fromRow: number,
  toRow: number,
): number {
  const r = rader.length + 1;
  const cells = [cellString(etikett)];
  for (const col of ANBUD_KOL) {
    cells.push(cellFormula(`=SUM(${col}${fromRow}:${col}${toRow})`));
  }
  cells.push(cellFormula(`=${minRangeRad(r)}`));
  rader.push(row(cells));
  return r;
}

function placeringRad(
  rader: string[],
  etikett: string,
  sourceRow: number,
): void {
  const first = ANBUD_KOL[0];
  const last = ANBUD_KOL[ANBUD_KOL.length - 1];
  const range = `$${first}$${sourceRow}:$${last}$${sourceRow}`;
  const cells = [cellString(etikett)];
  for (const col of ANBUD_KOL) {
    cells.push(cellFormula(`=RANK(${col}${sourceRow},${range},1)`));
  }
  cells.push(cellString(""));
  rader.push(row(cells));
}

function byggInstruktionBlad(): string {
  const rader = [
    row([cellString("Anbudsutvärdering — 10 platser (nr 1–10)")]),
    row([cellString("")]),
    row([
      cellString(
        "Blad Entreprenörer: skriv företagsnamn för nr 1–10. I övriga blad används kolumnrubriker 1–10.",
      ),
    ]),
    row([
      cellString(
        "Utvärdering: Ja/Nej-krav, prisposter, ÄTA-scenario, slutsumma och placering 1–10.",
      ),
    ]),
    row([
      cellString(
        "ÄTA-timmar: samma timmar för alla. ÄTA-timpris: dag/kväll/helg per nr och yrkesgrupp. ÄTA-kostnad: summering.",
      ),
    ]),
  ];
  return worksheet("Instruktion", rader);
}

function byggEntreprenorerBlad(): string {
  const rader: string[] = [
    row([
      cellString("Nr"),
      cellString("Företagsnamn"),
      cellString("Org.nr"),
      cellString("Kontaktperson"),
      cellString("Telefon/e-post"),
      cellString("Projektledare"),
    ]),
  ];
  for (let n = 1; n <= ANBUD_ANTAL_ENTREPRENORER; n += 1) {
    rader.push(
      row([
        cellNumber(n),
        cellString(""),
        cellString(""),
        cellString(""),
        cellString(""),
        cellString(""),
      ]),
    );
  }
  rader.push(row([cellString("")]));
  rader.push(
    row([
      cellString("Referenser (från anbud) — rad per anbud"),
      cellString("Ref 1 belopp kr"),
      cellString("Ref 2 belopp kr"),
    ]),
  );
  for (let n = 1; n <= ANBUD_ANTAL_ENTREPRENORER; n += 1) {
    rader.push(
      row([cellString(`Nr ${n}`), cellNumber(0), cellNumber(0)]),
    );
  }
  return worksheet("Entreprenörer", rader);
}

function byggUtvarderingBlad(): string {
  const rader: string[] = [];
  pushRad(rader, [cellString("Projekt"), cellString("")]);
  pushRad(rader, [cellString("Förening / datum utvärdering"), cellString("")]);
  pushRad(rader, [
    cellString("Entreprenörer 1–10 — se blad Entreprenörer"),
    cellString(""),
  ]);

  const headerCells = [
    cellString("Utvärderingspost"),
    ...Array.from({ length: ANBUD_ANTAL_ENTREPRENORER }, (_, i) =>
      cellString(String(i + 1)),
    ),
    cellString("Lägst"),
  ];
  pushRad(rader, headerCells);

  sectionRad(rader, "— Krav enligt anbudsformulär (Ja/Nej) —");
  for (const k of ANBUD_JA_NEJ_KRAV) {
    jaNejRad(rader, k.etikett);
  }

  sectionRad(rader, "— Pris huvuduppdrag och optioner (kr, exkl. moms) —");
  const prisStart = rader.length + 1;
  const prisRows: number[] = [];
  for (const p of ANBUD_PRIS_POSTER) {
    prisRows.push(prisRad(rader, p.etikett));
  }
  const radDelsummaHuvud = sumRad(
    rader,
    "Delsumma huvud + optioner",
    prisStart,
    prisRows[prisRows.length - 1],
  );

  sectionRad(rader, "— Övriga siffror från anbud (ej i slutsumma) —");
  for (const o of ANBUD_OVRIGA_SIFFROR) {
    prisRad(rader, o.etikett);
  }

  sectionRad(rader, "— ÄTA-scenario (summa alla yrkesgrupper) —");
  const radAta = rader.length + 1;
  const ataCells = [cellString("ÄTA-scenario totalt (kr)")];
  for (let i = 0; i < ANBUD_KOL.length; i += 1) {
    const col = ANBUD_KOL[i];
    ataCells.push(cellFormula(`='ÄTA-kostnad'!${col}${ATA_SUMMA_RAD}`));
  }
  ataCells.push(cellFormula(`=${minRangeRad(radAta)}`));
  pushRad(rader, ataCells);

  sectionRad(rader, "— Slutsumma —");
  const radSlutsumma = rader.length + 1;
  const slutCells = [cellString("SLUTSUMMA (huvud + optioner + ÄTA-scenario)")];
  for (const col of ANBUD_KOL) {
    slutCells.push(
      cellFormula(`=${col}${radDelsummaHuvud}+${col}${radAta}`),
    );
  }
  slutCells.push(cellFormula(`=${minRangeRad(radSlutsumma)}`));
  pushRad(rader, slutCells);

  pushRad(rader, [cellString("")]);
  pushRad(rader, [
    cellString(
      "Placering: 1 = lägst. Jämför slutsumma, huvud+optioner och ÄTA — rekommendation kan skilja sig.",
    ),
    ...tommaAnbudCeller(),
    cellString(""),
  ]);
  placeringRad(rader, "Placering — slutsumma", radSlutsumma);
  placeringRad(rader, "Placering — huvud + optioner", radDelsummaHuvud);
  placeringRad(rader, "Placering — ÄTA-scenario", radAta);

  pushRad(rader, [cellString("")]);
  pushRad(rader, [
    cellString("Rekommenderat nr (1–10) efter helhetsbedömning"),
    cellString(""),
  ]);
  pushRad(rader, [
    cellString("Motivering (pris, ÄTA, krav Ja/Nej, referenser)"),
    cellString(""),
  ]);

  return worksheet("Utvärdering", rader);
}

function timprisKolumnForEntreprenor(entreprenorIndex: number, typ: 0 | 1 | 2): string {
  const base = 2 + entreprenorIndex * 3 + typ;
  return kolumnBokstav(base);
}

function byggAtaTimmarBlad(): string {
  const rader: string[] = [
    row([
      cellString(
        "Timmar för ÄTA-bedömning — samma för alla entreprenörer (nr 1–10)",
      ),
    ]),
    row([
      cellString("Yrkesgrupp"),
      cellString("Tim dag"),
      cellString("Tim kväll"),
      cellString("Tim helg"),
    ]),
  ];
  for (const yg of ANBUD_ATA_YRKESGRUPPER) {
    rader.push(
      row([cellString(yg), cellNumber(0), cellNumber(0), cellNumber(0)]),
    );
  }
  return worksheet("ÄTA-timmar", rader);
}

function byggAtaTimprisBlad(): string {
  const rader: string[] = [
    row([
      cellString(
        "Timpris kr/h exkl. moms — tre kolumner (dag, kväll, helg) per entreprenörs nr",
      ),
    ]),
  ];
  const headerRow: string[] = [cellString("Yrkesgrupp")];
  for (let n = 1; n <= ANBUD_ANTAL_ENTREPRENORER; n += 1) {
    headerRow.push(cellString(`${n} dag`));
    headerRow.push(cellString(`${n} kväll`));
    headerRow.push(cellString(`${n} helg`));
  }
  rader.push(row(headerRow));

  for (const yg of ANBUD_ATA_YRKESGRUPPER) {
    const cells = [cellString(yg)];
    for (let i = 0; i < ANBUD_ANTAL_ENTREPRENORER * 3; i += 1) {
      cells.push(cellNumber(0));
    }
    rader.push(row(cells));
  }
  return worksheet("ÄTA-timpris", rader);
}

function byggAtaKostnadBlad(): string {
  const rader: string[] = [
    row([
      cellString(
        "Kostnad per yrkesgrupp och entreprenör (timmar × timpris). Summa rad = ÄTA-scenario totalt.",
      ),
    ]),
    row([
      cellString("Yrkesgrupp"),
      ...Array.from({ length: ANBUD_ANTAL_ENTREPRENORER }, (_, i) =>
        cellString(String(i + 1)),
      ),
    ]),
  ];

  let rowNum = ATA_DATA_START;
  const sumStart = rowNum;
  for (const yg of ANBUD_ATA_YRKESGRUPPER) {
    const cells = [cellString(yg)];
    for (let i = 0; i < ANBUD_ANTAL_ENTREPRENORER; i += 1) {
      const colDag = timprisKolumnForEntreprenor(i, 0);
      const colKvall = timprisKolumnForEntreprenor(i, 1);
      const colHelg = timprisKolumnForEntreprenor(i, 2);
      cells.push(
        cellFormula(
          `='ÄTA-timmar'!B${rowNum}*'ÄTA-timpris'!${colDag}${rowNum}+'ÄTA-timmar'!C${rowNum}*'ÄTA-timpris'!${colKvall}${rowNum}+'ÄTA-timmar'!D${rowNum}*'ÄTA-timpris'!${colHelg}${rowNum}`,
        ),
      );
    }
    rader.push(row(cells));
    rowNum += 1;
  }

  const sumCells = [cellString("Summa alla yrkesgrupper")];
  for (const col of ANBUD_KOL) {
    sumCells.push(cellFormula(`=SUM(${col}${sumStart}:${col}${rowNum - 1})`));
  }
  rader.push(row(sumCells));

  return worksheet("ÄTA-kostnad", rader);
}

export function byggAnbudsUtvarderingExcelXml(): string {
  const blad = [
    byggInstruktionBlad(),
    byggEntreprenorerBlad(),
    byggUtvarderingBlad(),
    byggAtaTimmarBlad(),
    byggAtaTimprisBlad(),
    byggAtaKostnadBlad(),
  ].join("");
  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
${blad}
</Workbook>`;
}

export function laddaNerAnbudsUtvarderingExcel(filnamnBas?: string): void {
  if (typeof document === "undefined") return;
  const xml = byggAnbudsUtvarderingExcelXml();
  const blob = new Blob([xml], {
    type: "application/vnd.ms-excel;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const bas = filnamnBas?.trim() || "anbudsutvardering";
  const sakert = bas
    .replace(/[^\wÅÄÖåäö\- ]+/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
  a.href = url;
  a.download = `${sakert || "anbudsutvardering"}.xls`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
