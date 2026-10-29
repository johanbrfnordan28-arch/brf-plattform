/**
 * Excel-kompatibel kalkyl (.xls) för anbudsutvärdering — samma poster som
 * anbudsformuläret. Diff i kr och % mot lägsta anbud per rad.
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
  const n = Number.isFinite(value) ? value : 0;
  return `<Cell><Data ss:Type="Number">${n}</Data></Cell>`;
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
    row([cellString("Anbudsutvärdering — så här använder ni mallen")]),
    row([cellString("")]),
    row([
      cellString(
        "1. Fyll i projektuppgifter på bladet Jämförelse och ÄTA-scenario.",
      ),
    ]),
    row([
      cellString(
        "2. Anbud A–C: företagsnamn och priser enligt anbudsformuläret (exkl. moms).",
      ),
    ]),
    row([
      cellString(
        "3. Kolumnerna Lägst, Diff kr och Diff % räknas mot lägsta pris per rad.",
      ),
    ]),
    row([
      cellString(
        "4. Optioner: samma optioner för alla — jämför endast pris per option.",
      ),
    ]),
    row([
      cellString(
        "5. ÄTA-scenario: ange timmar (dag/kväll/helg) EN gång — samma för alla anbud.",
      ),
    ]),
    row([
      cellString(
        "6. Timpriser per anbud fylls på bladet ÄTA-scenario; kostnad = summa timmar × pris.",
      ),
    ]),
    row([
      cellString(
        "7. Totalt jämförelsepris = huvud + summa optioner + ÄTA-scenario (justera om ni exkluderar optioner).",
      ),
    ]),
    row([
      cellString(
        "8. Dokumentera rekommendation till styrelsen — pris är inte alltid enda kriteriet.",
      ),
    ]),
  ];
  return worksheet("Instruktion", rader);
}

/** Rad med pris i B,C,D och formler E=MIN, F-H diff kr/%, I-K diff kr/% */
function prisJamforelseRad(
  rowIndex: number,
  etikett: string,
): string {
  const r = rowIndex;
  return row([
    cellString(etikett),
    cellNumber(0),
    cellNumber(0),
    cellNumber(0),
    cellFormula(`=MIN(B${r}:D${r})`),
    cellFormula(`=B${r}-E${r}`),
    cellFormula(`=IF(E${r}=0,"",F${r}/E${r})`),
    cellFormula(`=C${r}-E${r}`),
    cellFormula(`=IF(E${r}=0,"",H${r}/E${r})`),
    cellFormula(`=D${r}-E${r}`),
    cellFormula(`=IF(E${r}=0,"",J${r}/E${r})`),
  ]);
}

function byggJamforelseBlad(): string {
  const header = row([
    cellString("Post"),
    cellString("Anbud A (kr)"),
    cellString("Anbud B (kr)"),
    cellString("Anbud C (kr)"),
    cellString("Lägst (kr)"),
    cellString("A diff kr"),
    cellString("A diff %"),
    cellString("B diff kr"),
    cellString("B diff %"),
    cellString("C diff kr"),
    cellString("C diff %"),
  ]);
  const start = 4;
  const poster = [
    "Huvuduppdrag",
    "Option 1",
    "Option 2",
    "Option 3",
    "Option 4",
    "Option 5",
  ];
  const postRader = poster.map((p, i) => prisJamforelseRad(start + i, p));
  const sumRow = start + poster.length;
  const summa = row([
    cellString("Summa huvud + optioner"),
    cellFormula(`=SUM(B${start}:B${sumRow - 1})`),
    cellFormula(`=SUM(C${start}:C${sumRow - 1})`),
    cellFormula(`=SUM(D${start}:D${sumRow - 1})`),
    cellFormula(`=MIN(B${sumRow}:D${sumRow})`),
    cellFormula(`=B${sumRow}-E${sumRow}`),
    cellFormula(`=IF(E${sumRow}=0,"",F${sumRow}/E${sumRow})`),
    cellFormula(`=C${sumRow}-E${sumRow}`),
    cellFormula(`=IF(E${sumRow}=0,"",H${sumRow}/E${sumRow})`),
    cellFormula(`=D${sumRow}-E${sumRow}`),
    cellFormula(`=IF(E${sumRow}=0,"",J${sumRow}/E${sumRow})`),
  ]);
  const meta = [
    row([cellString("Projekt"), cellString(""), cellString(""), cellString("")]),
    row([
      cellString("Förening"),
      cellString(""),
      cellString("Datum"),
      cellString(""),
    ]),
    row([cellString("")]),
  ];
  return worksheet("Jämförelse", [...meta, header, ...postRader, summa]);
}

function byggAtaBlad(): string {
  const rader: string[] = [
    row([
      cellString(
        "Timmar (samma för alla anbud) — fyll i enligt anbudsformuläret / FFU",
      ),
    ]),
    row([
      cellString("Yrkesgrupp"),
      cellString("Tim dag"),
      cellString("Tim kväll"),
      cellString("Tim helg"),
      cellString("A dag kr/h"),
      cellString("A kväll kr/h"),
      cellString("A helg kr/h"),
      cellString("B dag kr/h"),
      cellString("B kväll kr/h"),
      cellString("B helg kr/h"),
      cellString("C dag kr/h"),
      cellString("C kväll kr/h"),
      cellString("C helg kr/h"),
      cellString("A ÄTA kr"),
      cellString("B ÄTA kr"),
      cellString("C ÄTA kr"),
      cellString("Lägst"),
      cellString("A diff kr"),
      cellString("A diff %"),
    ]),
  ];
  let rowNum = 3;
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
        cellFormula(
          `=B${r}*E${r}+C${r}*F${r}+D${r}*G${r}`,
        ),
        cellFormula(
          `=B${r}*H${r}+C${r}*I${r}+D${r}*J${r}`,
        ),
        cellFormula(
          `=B${r}*K${r}+C${r}*L${r}+D${r}*M${r}`,
        ),
        cellFormula(`=MIN(N${r}:P${r})`),
        cellFormula(`=N${r}-Q${r}`),
        cellFormula(`=IF(Q${r}=0,"",R${r}/Q${r})`),
      ]),
    );
    rowNum += 1;
  }
  const sumStart = 3;
  const sumEnd = rowNum - 1;
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
      cellFormula(`=SUM(N${sumStart}:N${sumEnd})`),
      cellFormula(`=SUM(O${sumStart}:O${sumEnd})`),
      cellFormula(`=SUM(P${sumStart}:P${sumEnd})`),
      cellFormula(`=MIN(N${rowNum}:P${rowNum})`),
      cellFormula(`=N${rowNum}-Q${rowNum}`),
      cellFormula(`=IF(Q${rowNum}=0,"",R${rowNum}/Q${rowNum})`),
    ]),
  );
  return worksheet("ÄTA-scenario", rader);
}

export function byggAnbudsUtvarderingExcelXml(): string {
  const blad = [
    byggInstruktionBlad(),
    byggJamforelseBlad(),
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
