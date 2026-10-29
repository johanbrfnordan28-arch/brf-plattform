/**
 * Excel (.xls) för projektuppföljning — baslinje minst 5 år före, upp till 10 år
 * efter (extra rader 11–15 om ni förlänger uppföljningen).
 */

export const PROJEKT_UPPFOLJNING_KOSTNADSRADER = [
  "Vatten",
  "El",
  "Värme",
  "Försäkringspremie",
  "Skador och självrisk",
  "Drift och underhåll",
] as const;

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

function byggInstruktionBlad(): string {
  const rader = [
    row([cellString("Projektuppföljning — payback och nytta")]),
    row([cellString("")]),
    row([
      cellString(
        "1. Fyll i projektnamn och ev. flera relaterade projekt på bladen Baslinje före och Efter projekt.",
      ),
    ]),
    row([
      cellString(
        "2. Baslinje före: minst 5 år (kolumner År -5 till -1). Ange kr/år per kostnadsslag.",
      ),
    ]),
    row([
      cellString(
        "3. Efter projekt: fyll år 1–10 efter godkänd slutbesiktning. Rader 11–15 om ni förlänger.",
      ),
    ]),
    row([
      cellString(
        "4. Raden Summa räknas per år. Snitt före används i Payback (cell B8 på bladet Payback).",
      ),
    ]),
    row([
      cellString(
        "5. Payback = nettoinvestering / (snitt före − snitt efter år 1), om besparingen är positiv.",
      ),
    ]),
    row([
      cellString(
        "6. Säkerhetsnytta dokumenteras i textmallen — ingår inte i kronor här.",
      ),
    ]),
  ];
  return worksheet("Instruktion", rader);
}

function arKolumnerFore(): string[] {
  return ["År -5", "År -4", "År -3", "År -2", "År -1", "Snitt"];
}

function arKolumnerEfter(): string[] {
  return [
    "År 1",
    "År 2",
    "År 3",
    "År 4",
    "År 5",
    "År 6",
    "År 7",
    "År 8",
    "År 9",
    "År 10",
    "År 11",
    "År 12",
    "År 13",
    "År 14",
    "År 15",
    "Snitt 1–3",
  ];
}

function byggBaslinjeBlad(): string {
  const cols = arKolumnerFore();
  const header = row([
    cellString("Kostnadsslag"),
    ...cols.map((c) => cellString(c)),
  ]);
  const startRow = 4;
  const rader: string[] = [
    row([cellString("Projekt"), cellString("")]),
    row([cellString("Relaterade projekt"), cellString("")]),
    row([cellString("")]),
    header,
  ];
  let r = startRow;
  for (const kost of PROJEKT_UPPFOLJNING_KOSTNADSRADER) {
    const colLetters = ["B", "C", "D", "E", "F"];
    rader.push(
      row([
        cellString(kost),
        ...colLetters.map(() => cellNumber(0)),
        cellFormula(`=AVERAGE(B${r}:F${r})`),
      ]),
    );
    r += 1;
  }
  const sumRow = r;
  rader.push(
    row([
      cellString("Summa"),
      ...["B", "C", "D", "E", "F"].map((col) =>
        cellFormula(`=SUM(${col}${startRow}:${col}${sumRow - 1})`),
      ),
      cellFormula(`=AVERAGE(G${startRow}:G${sumRow - 1})`),
    ]),
  );
  return worksheet("Baslinje före", rader);
}

function byggEfterBlad(): string {
  const cols = arKolumnerEfter();
  const header = row([
    cellString("Kostnadsslag"),
    ...cols.map((c) => cellString(c)),
  ]);
  const startRow = 4;
  const rader: string[] = [
    row([cellString("Projekt"), cellString("")]),
    row([cellString("Slutbesiktning (datum)"), cellString("")]),
    row([cellString("")]),
    header,
  ];
  let r = startRow;
  for (const kost of PROJEKT_UPPFOLJNING_KOSTNADSRADER) {
    const cells: string[] = [cellString(kost)];
    for (let i = 0; i < 15; i++) {
      cells.push(cellNumber(0));
    }
    cells.push(cellFormula(`=AVERAGE(B${r}:D${r})`));
    rader.push(row(cells));
    r += 1;
  }
  const sumRow = r;
  const sumCells: string[] = [cellString("Summa")];
  for (let i = 0; i < 15; i++) {
    const col = String.fromCharCode(66 + i);
    sumCells.push(
      cellFormula(`=SUM(${col}${startRow}:${col}${sumRow - 1})`),
    );
  }
  sumCells.push(cellFormula(`=AVERAGE(B${sumRow}:D${sumRow})`));
  rader.push(row(sumCells));
  return worksheet("Efter projekt", rader);
}

/** Radnummer för summa rad på baslinje-/efter-blad (6 kostnadsrader + header). */
const SUMMA_RAD = 10;

function byggPaybackBlad(): string {
  const rader = [
    row([cellString("Payback och investering")]),
    row([cellString("")]),
    row([cellString("Nettoinvestering (kr)"), cellNumber(0)]),
    row([cellString("Tilläggsarbeten (kr)"), cellNumber(0)]),
    row([
      cellString("Total investering"),
      cellFormula("=B3+B4"),
    ]),
    row([cellString("")]),
    row([
      cellString("Snitt totalt före (kr/år)"),
      cellFormula(`='Baslinje före'!G${SUMMA_RAD}`),
    ]),
    row([
      cellString("Snitt totalt efter år 1–3 (kr/år)"),
      cellFormula(`=AVERAGE('Efter projekt'!B${SUMMA_RAD}:D${SUMMA_RAD})`),
    ]),
    row([
      cellString("Besparing per år (kr)"),
      cellFormula("=B7-B8"),
    ]),
    row([
      cellString("Payback (år)"),
      cellFormula("=IF(B9<=0,\"\",B5/B9)"),
    ]),
    row([cellString("Teknisk avskrivning (år)"), cellNumber(20)]),
    row([
      cellString("Kassa-plus efter payback (kr, uppskattning)"),
      cellFormula("=IF(OR(B9<=0,B11<=B10),\"\",B9*(B11-B10))"),
    ]),
  ];
  return worksheet("Payback", rader);
}

export function byggProjektUppfoljningExcelXml(): string {
  const blad = [
    byggInstruktionBlad(),
    byggBaslinjeBlad(),
    byggEfterBlad(),
    byggPaybackBlad(),
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

export function laddaNerProjektUppfoljningExcel(filnamnBas?: string): void {
  if (typeof document === "undefined") return;
  const xml = byggProjektUppfoljningExcelXml();
  const blob = new Blob([xml], {
    type: "application/vnd.ms-excel;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const bas = filnamnBas?.trim() || "projektuppföljning";
  const sakert = bas
    .replace(/[^\wÅÄÖåäö\- ]+/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
  a.href = url;
  a.download = `${sakert || "projektuppföljning"}.xls`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
