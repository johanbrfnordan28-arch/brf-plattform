/**
 * Exporterar underhållsplanen som Excel-kompatibel XML-kalkylblad (.xls).
 * Öppnas i Excel/Numbers/Google Sheets utan extra bibliotek.
 *
 * Första bladet hålls kort och sifferbaserat — lång löptext ligger på fliken Notering.
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

/** Försök tolka ett grundvärde som tal (t.ex. «2 756», «2756 m²»). */
function tolkaTalFranText(värde: string): number | null {
  const rensad = värde
    .replace(/\s/g, "")
    .replace(/m²|kvm|kr|st\.?/gi, "")
    .replace(",", ".");
  if (!rensad || !/^-?\d+(\.\d+)?$/.test(rensad)) return null;
  const n = Number.parseFloat(rensad);
  return Number.isFinite(n) ? n : null;
}

/** Delar lång notering till korta rader (en mening per rad). */
export function delaPlanNoteringTillRader(text: string): string[] {
  return text
    .split(/(?<=\.)\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export type UnderhallsplanExcelInput = {
  foreningsNamn: string;
  planNamn: string;
  planStartAr: number;
  planSlutAr: number;
  boareaM2: number;
  antalLagenheter: number;
  tomtstorlekM2?: number;
  krPerKvmAr: number;
  arligAvsattningKr: number;
  planNotering?: string | null;
  /** Korta etikett/värde-rader — tal skrivs som Number när möjligt. */
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
    row([cellString("Nyckeltal"), cellString("Värde")]),
    row([cellString("Förening"), cellString(input.foreningsNamn)]),
    row([cellString("Plan"), cellString(input.planNamn)]),
    row([cellString("Planstart år"), cellNumber(input.planStartAr)]),
    row([cellString("Planslut år"), cellNumber(input.planSlutAr)]),
    row([cellString("Boarea m²"), cellNumber(input.boareaM2)]),
    row([cellString("Lägenheter"), cellNumber(input.antalLagenheter)]),
  ];
  if (input.tomtstorlekM2 != null && input.tomtstorlekM2 > 0) {
    rader.push(
      row([cellString("Tomtyta m²"), cellNumber(input.tomtstorlekM2)]),
    );
  }
  rader.push(
    row([cellString("Avsättning kr/m²/år"), cellNumber(input.krPerKvmAr)]),
    row([
      cellString("Årlig avsättning kr"),
      cellNumber(input.arligAvsattningKr),
    ]),
    row([cellString(""), cellString("")]),
    row([cellString("Grunduppgift"), cellString("Värde")]),
  );

  for (const g of input.grundRader) {
    const tal = tolkaTalFranText(g.värde);
    if (tal != null) {
      rader.push(row([cellString(g.etikett), cellNumber(tal)]));
    } else {
      rader.push(row([cellString(g.etikett), cellString(g.värde)]));
    }
  }

  if (input.planNotering?.trim()) {
    rader.push(
      row([cellString(""), cellString("")]),
      row([
        cellString("Notering"),
        cellString("Se fliken «Notering» (en punkt per rad)."),
      ]),
    );
  }

  return worksheet("Grunduppgifter", rader);
}

function byggNoteringBlad(planNotering: string | null | undefined): string | null {
  const text = planNotering?.trim();
  if (!text) return null;
  const punkter = delaPlanNoteringTillRader(text);
  const rader = [
    row([cellString("Nr"), cellString("Punkt")]),
    ...punkter.map((p, i) =>
      row([cellNumber(i + 1), cellString(p)]),
    ),
  ];
  return worksheet("Notering", rader);
}

function byggUtgifterBlad(rader: PlanUtgiftsArRad[]): string {
  const header = row([
    cellString("År"),
    cellString("Avsättning kr"),
    cellString("Besiktning m.m. kr"),
    cellString("Periodiskt underhåll kr"),
    cellString("Summa budgetunderlag kr"),
    cellString("Planerat underhåll kr"),
    cellString("Kassaflöde totalt kr"),
  ]);
  const body = rader.map((r) =>
    row([
      cellNumber(r.ar),
      cellNumber(r.avsattning),
      cellNumber(r.besiktningar),
      cellNumber(r.direktkostnader),
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
    for (const p of r.direktkostnadPoster) {
      body.push(
        row([
          cellNumber(r.ar),
          cellString("Periodiskt underhåll"),
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
          cellString("Planerat underhåll"),
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
  const noteringBlad = byggNoteringBlad(input.planNotering);
  const blad = [
    byggGrundBlad(input),
    ...(noteringBlad ? [noteringBlad] : []),
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
