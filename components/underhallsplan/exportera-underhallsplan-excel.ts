/**
 * Exporterar underhållsplanen som Excel-kompatibel XML-kalkylblad (.xls).
 * Öppnas i Excel/Numbers/Google Sheets utan extra bibliotek.
 */

import type { PlanUtgiftsArRad } from "@/components/underhallsplan/plan-budget-sammanfattning";
import type { UnderhallAtgard } from "@/components/underhallsplan/underhall-budget";

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

function row(cells: string[]): string {
  return `<Row>${cells.join("")}</Row>`;
}

function worksheet(name: string, rows: string[]): string {
  return `<Worksheet ss:Name="${xmlEscape(name)}"><Table>${rows.join("")}</Table></Worksheet>`;
}

export type UnderhallsplanExcelInput = {
  foreningsNamn: string;
  planNamn: string;
  planStartAr: number;
  planSlutAr: number;
  boareaM2: number;
  antalLagenheter: number;
  krPerKvmAr: number;
  arligAvsattningKr: number;
  planNotering?: string | null;
  grundRader: { etikett: string; värde: string }[];
  utgiftsRader: PlanUtgiftsArRad[];
  atgarder: UnderhallAtgard[];
  komponentVarden: {
    komponent: string;
    installationskostnadKr: number;
    avskrivningAr: number;
  }[];
};

function byggGrundBlad(input: UnderhallsplanExcelInput): string {
  const rader = [
    row([cellString("Förening"), cellString(input.foreningsNamn)]),
    row([cellString("Plan"), cellString(input.planNamn)]),
    row([
      cellString("Planperiod"),
      cellString(`${input.planStartAr}–${input.planSlutAr}`),
    ]),
    row([cellString("Boarea m²"), cellNumber(input.boareaM2)]),
    row([cellString("Lägenheter"), cellNumber(input.antalLagenheter)]),
    row([cellString("Avsättning kr/m²/år"), cellNumber(input.krPerKvmAr)]),
    row([cellString("Årlig avsättning kr"), cellNumber(input.arligAvsattningKr)]),
    row([cellString(""), cellString("")]),
    row([cellString("Grunduppgift"), cellString("Värde")]),
    ...input.grundRader.map((g) =>
      row([cellString(g.etikett), cellString(g.värde)]),
    ),
  ];
  if (input.planNotering?.trim()) {
    rader.push(
      row([cellString(""), cellString("")]),
      row([cellString("Notering"), cellString(input.planNotering.trim())]),
    );
  }
  return worksheet("Grunduppgifter", rader);
}

function byggUtgifterBlad(rader: PlanUtgiftsArRad[]): string {
  const header = row([
    cellString("År"),
    cellString("Avsättning kr"),
    cellString("Besiktning m.m. kr"),
    cellString("Utgifter årsbudget kr"),
    cellString("Investering plan kr"),
    cellString("Kassaflöde totalt kr"),
  ]);
  const body = rader.map((r) =>
    row([
      cellNumber(r.ar),
      cellNumber(r.avsattning),
      cellNumber(r.besiktningar),
      cellNumber(r.utgifterArsbudget),
      cellNumber(r.investeringPlan),
      cellNumber(r.totaltKassaflode),
    ]),
  );
  return worksheet("Utgifter per år", [header, ...body]);
}

function byggPosterBlad(rader: PlanUtgiftsArRad[]): string {
  const header = row([
    cellString("År"),
    cellString("Typ"),
    cellString("Komponent"),
    cellString("Post"),
    cellString("Belopp kr"),
  ]);
  const body: string[] = [];
  for (const r of rader) {
    for (const p of r.besiktningPoster) {
      body.push(
        row([
          cellNumber(r.ar),
          cellString("Besiktning / avgift"),
          cellString(p.komponent),
          cellString(p.namn),
          cellNumber(p.belopp),
        ]),
      );
    }
    for (const p of r.investeringPoster) {
      body.push(
        row([
          cellNumber(r.ar),
          cellString("Investering"),
          cellString(p.komponent),
          cellString(p.namn),
          cellNumber(p.belopp),
        ]),
      );
    }
  }
  return worksheet("Utgiftsposter", [header, ...body]);
}

function byggAtgarderBlad(atgarder: UnderhallAtgard[]): string {
  const header = row([
    cellString("År"),
    cellString("Komponent"),
    cellString("Del"),
    cellString("Kostnad kr"),
    cellString("Intervall år"),
    cellString("Källa"),
  ]);
  const body = [...atgarder]
    .sort((a, b) => a.ar - b.ar || a.komponent.localeCompare(b.komponent, "sv"))
    .map((a) =>
      row([
        cellNumber(a.ar),
        cellString(a.komponent),
        cellString(a.del),
        cellNumber(a.kostnadKr),
        cellNumber(a.intervallAr),
        cellString(a.kalla === "historik" ? "Historik" : "Register"),
      ]),
    );
  return worksheet("Åtgärder", [header, ...body]);
}

function byggKomponentVardenBlad(
  rader: UnderhallsplanExcelInput["komponentVarden"],
): string {
  const header = row([
    cellString("Komponent"),
    cellString("Installationskostnad kr"),
    cellString("Avskrivning år"),
  ]);
  const body = rader.map((r) =>
    row([
      cellString(r.komponent),
      cellNumber(r.installationskostnadKr),
      cellNumber(r.avskrivningAr),
    ]),
  );
  return worksheet("Komponentvärden", [header, ...body]);
}

export function byggUnderhallsplanExcelXml(
  input: UnderhallsplanExcelInput,
): string {
  const blad = [
    byggGrundBlad(input),
    byggUtgifterBlad(input.utgiftsRader),
    byggPosterBlad(input.utgiftsRader),
    byggAtgarderBlad(input.atgarder),
    byggKomponentVardenBlad(input.komponentVarden),
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

export function laddaNerUnderhallsplanExcel(
  input: UnderhallsplanExcelInput,
  filnamnBas?: string,
): void {
  const xml = byggUnderhallsplanExcelXml(input);
  const blob = new Blob([xml], {
    type: "application/vnd.ms-excel;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const bas =
    filnamnBas?.trim() ||
    input.planNamn.trim() ||
    input.foreningsNamn.trim() ||
    "underhallsplan";
  const sakert = bas
    .replace(/[^\wÅÄÖåäö\- ]+/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
  a.href = url;
  a.download = `${sakert || "underhallsplan"}.xls`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
