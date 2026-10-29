/**
 * Excel (.xls) för anbudsutvärdering — poster lodrätt till vänster,
 * entreprenörer vågrätt överst, delsummeringar och slutsumma längst ner.
 */

export const ANBUD_ATA_YRKESGRUPPER = [
  "Bygg / allmän entreprenad",
  "Rivning",
  "Mark / anläggning",
  "Ställning / fallskydd",
  "El",
  "VVS",
  "Ventilation",
  "Målning",
  "Plattsättning",
  "Golv",
  "Snickeri / inredning",
  "Övrig yrkesgrupp 1",
  "Övrig yrkesgrupp 2",
] as const;

const ANBUD_KOLUMNER = ["B", "C", "D"] as const;

/** Excel-radnummer på bladet Utvärdering (1-baserat). */
const RAD_HUVUD = 7;
const RAD_OPTION_START = 8;
const RAD_DELSUMMA_HUVUD = 13;
const RAD_ATA = 15;
const RAD_SLUTSUMMA = 17;
const RAD_PLATS_TOTAL = 20;
const RAD_PLATS_HUVUD = 21;
const RAD_PLATS_ATA = 22;

/** Summa rad på ÄTA-scenario (13 yrkesgrupper från rad 3). */
const ATA_SUMMA_RAD = 16;

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
  return `MIN(B${r}:D${r})`;
}

/** Prisrad: etikett vänster, tre anbud, lägst. */
function prisRad(r: number, etikett: string): string {
  return row([
    cellString(etikett),
    cellNumber(0),
    cellNumber(0),
    cellNumber(0),
    cellFormula(`=${minRangeRad(r)}`),
  ]);
}

function sectionRad(etikett: string): string {
  return row([
    cellString(etikett),
    cellString(""),
    cellString(""),
    cellString(""),
    cellString(""),
  ]);
}

function sumRad(r: number, etikett: string, from: number, to: number): string {
  const cells = [cellString(etikett)];
  for (const col of ANBUD_KOLUMNER) {
    cells.push(cellFormula(`=SUM(${col}${from}:${col}${to})`));
  }
  cells.push(cellFormula(`=${minRangeRad(r)}`));
  return row(cells);
}

function placeringRad(
  r: number,
  etikett: string,
  sourceRow: number,
): string {
  const range = `$B$${sourceRow}:$D$${sourceRow}`;
  const cells = [cellString(etikett)];
  for (const col of ANBUD_KOLUMNER) {
    cells.push(cellFormula(`=RANK(${col}${sourceRow},${range},1)`));
  }
  cells.push(cellString(""));
  return row(cells);
}

function byggInstruktionBlad(): string {
  const rader = [
    row([cellString("Anbudsutvärdering — layout")]),
    row([cellString("")]),
    row([
      cellString(
        "Bladet Utvärdering: poster i kolumn A (lodrätt), entreprenörer på rad 5 (vågrätt).",
      ),
    ]),
    row([
      cellString(
        "Delsumma huvud + optioner, därefter ÄTA-scenario, sist SLUTSUMMA längst ner.",
      ),
    ]),
    row([
      cellString(
        "Placering 1–3: lägst totalpris behöver inte bli rekommendation — jämför även placering huvud och ÄTA.",
      ),
    ]),
    row([
      cellString(
        "ÄTA-scenario: timmar vänster, timpriser per entreprenör — summor kopplas till Utvärdering.",
      ),
    ]),
    row([
      cellString(
        "Diff i kr/% kan läggas manuellt eller i egna kolumner — fokus är tydliga delsummeringar.",
      ),
    ]),
  ];
  return worksheet("Instruktion", rader);
}

function byggUtvarderingBlad(): string {
  const header = row([
    cellString("Utvärderingspost (exkl. moms)"),
    cellString("Anbud 1 (kr)"),
    cellString("Anbud 2 (kr)"),
    cellString("Anbud 3 (kr)"),
    cellString("Lägst (kr)"),
  ]);
  const foretag = row([
    cellString("Entreprenör / företagsnamn"),
    cellString(""),
    cellString(""),
    cellString(""),
    cellString(""),
  ]);

  const rader: string[] = [
    row([cellString("Projekt"), cellString("")]),
    row([cellString("Förening / datum"), cellString("")]),
    row([cellString("")]),
    header,
    foretag,
    sectionRad("— Huvuduppdrag och optioner —"),
    prisRad(RAD_HUVUD, "Huvuduppdrag"),
    prisRad(RAD_OPTION_START, "Option 1"),
    prisRad(RAD_OPTION_START + 1, "Option 2"),
    prisRad(RAD_OPTION_START + 2, "Option 3"),
    prisRad(RAD_OPTION_START + 3, "Option 4"),
    prisRad(RAD_OPTION_START + 4, "Option 5"),
    sumRad(
      RAD_DELSUMMA_HUVUD,
      "Delsumma huvud + optioner",
      RAD_HUVUD,
      RAD_OPTION_START + 4,
    ),
    sectionRad("— ÄTA-scenario (timpris × timmar) —"),
    row([
      cellString("ÄTA-scenario totalt"),
      cellFormula(`='ÄTA-scenario'!N${ATA_SUMMA_RAD}`),
      cellFormula(`='ÄTA-scenario'!O${ATA_SUMMA_RAD}`),
      cellFormula(`='ÄTA-scenario'!P${ATA_SUMMA_RAD}`),
      cellFormula(`=${minRangeRad(RAD_ATA)}`),
    ]),
    sectionRad("— Slutsumma —"),
    row([
      cellString("SLUTSUMMA (exkl. moms)"),
      cellFormula(`=B${RAD_DELSUMMA_HUVUD}+B${RAD_ATA}`),
      cellFormula(`=C${RAD_DELSUMMA_HUVUD}+C${RAD_ATA}`),
      cellFormula(`=D${RAD_DELSUMMA_HUVUD}+D${RAD_ATA}`),
      cellFormula(`=${minRangeRad(RAD_SLUTSUMMA)}`),
    ]),
    row([cellString("")]),
    row([
      cellString(
        "Placering (1 = lägst pris). Vinnare på huvud kan ha sämre ÄTA — bedöm alla rader.",
      ),
      cellString(""),
      cellString(""),
      cellString(""),
      cellString(""),
    ]),
    placeringRad(RAD_PLATS_TOTAL, "Placering — slutsumma", RAD_SLUTSUMMA),
    placeringRad(
      RAD_PLATS_HUVUD,
      "Placering — huvud + optioner",
      RAD_DELSUMMA_HUVUD,
    ),
    placeringRad(RAD_PLATS_ATA, "Placering — ÄTA-scenario", RAD_ATA),
    row([cellString("")]),
    row([
      cellString("Rekommenderad entreprenör (efter helhetsbedömning)"),
      cellString(""),
    ]),
    row([
      cellString("Motivering (pris, ÄTA, optioner, kvalitet)"),
      cellString(""),
    ]),
  ];

  return worksheet("Utvärdering", rader);
}

function byggAtaBlad(): string {
  const rader: string[] = [
    row([
      cellString(
        "Timmar (kolumn B–D) gäller alla anbud. Timpriser per entreprenör under.",
      ),
    ]),
    row([
      cellString("Yrkesgrupp"),
      cellString("Tim dag"),
      cellString("Tim kväll"),
      cellString("Tim helg"),
      cellString("Anbud 1 dag"),
      cellString("Anbud 1 kväll"),
      cellString("Anbud 1 helg"),
      cellString("Anbud 2 dag"),
      cellString("Anbud 2 kväll"),
      cellString("Anbud 2 helg"),
      cellString("Anbud 3 dag"),
      cellString("Anbud 3 kväll"),
      cellString("Anbud 3 helg"),
      cellString("Anbud 1 ÄTA"),
      cellString("Anbud 2 ÄTA"),
      cellString("Anbud 3 ÄTA"),
    ]),
  ];
  let rowNum = 3;
  const sumStart = rowNum;
  for (const yg of ANBUD_ATA_YRKESGRUPPER) {
    const r = rowNum;
    rader.push(
      row([
        cellString(yg),
        cellNumber(0),
        cellNumber(0),
        cellNumber(0),
        cellNumber(0),
        cellNumber(0),
        cellNumber(0),
        cellNumber(0),
        cellNumber(0),
        cellNumber(0),
        cellNumber(0),
        cellNumber(0),
        cellNumber(0),
        cellFormula(`=B${r}*E${r}+C${r}*F${r}+D${r}*G${r}`),
        cellFormula(`=B${r}*H${r}+C${r}*I${r}+D${r}*J${r}`),
        cellFormula(`=B${r}*K${r}+C${r}*L${r}+D${r}*M${r}`),
      ]),
    );
    rowNum += 1;
  }
  rader.push(
    row([
      cellString("Summa ÄTA-scenario"),
      cellString(""),
      cellString(""),
      cellString(""),
      cellString(""),
      cellString(""),
      cellString(""),
      cellString(""),
      cellString(""),
      cellString(""),
      cellString(""),
      cellString(""),
      cellString(""),
      cellFormula(`=SUM(N${sumStart}:N${rowNum - 1})`),
      cellFormula(`=SUM(O${sumStart}:O${rowNum - 1})`),
      cellFormula(`=SUM(P${sumStart}:P${rowNum - 1})`),
    ]),
  );
  return worksheet("ÄTA-scenario", rader);
}

export function byggAnbudsUtvarderingExcelXml(): string {
  const blad = [
    byggInstruktionBlad(),
    byggUtvarderingBlad(),
    byggAtaBlad(),
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
