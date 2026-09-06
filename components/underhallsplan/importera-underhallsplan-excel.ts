/**
 * Importerar underhållsplan från Excel-fil (.xls SpreadsheetML)
 * som exporterats via laddaNerUnderhallsplanExcel.
 */

import type { KomponentDetaljData } from "@/components/underhallsplan/komponentregister";
import type { Grunduppgifter } from "@/components/underhallsplan/types";

export type ImporteradUnderhallsplanExcel = {
  planNamn?: string;
  planStartAr?: number;
  planSlutAr?: number;
  krPerKvmAr?: number;
  planNotering?: string;
  grundPatch: Partial<Grunduppgifter>;
  /** Uppdateringar av installationskostnad / avskrivning per underkomponent. */
  komponentVarden: {
    komponentNamn: string;
    underEtikett: string;
    installationskostnadKr?: number;
    avskrivningAr?: number;
  }[];
  meddelande: string;
};

function cellText(cell: Element): string {
  const data = cell.getElementsByTagName("Data")[0];
  return (data?.textContent ?? "").trim();
}

function cellTal(cell: Element): number | null {
  const t = cellText(cell).replace(/\s/g, "").replace(",", ".");
  if (!t || !/^-?\d+(\.\d+)?$/.test(t)) return null;
  const n = Number.parseFloat(t);
  return Number.isFinite(n) ? n : null;
}

function lasBladRader(
  doc: Document,
  bladNamn: string,
): string[][] {
  const worksheets = Array.from(doc.getElementsByTagName("Worksheet"));
  const blad = worksheets.find(
    (w) => w.getAttribute("ss:Name") === bladNamn || w.getAttribute("Name") === bladNamn,
  );
  if (!blad) return [];
  const rows = Array.from(blad.getElementsByTagName("Row"));
  return rows.map((row) =>
    Array.from(row.getElementsByTagName("Cell")).map((c) => cellText(c)),
  );
}

function lasBladRaderMedTal(
  doc: Document,
  bladNamn: string,
): { text: string; tal: number | null }[][] {
  const worksheets = Array.from(doc.getElementsByTagName("Worksheet"));
  const blad = worksheets.find(
    (w) => w.getAttribute("ss:Name") === bladNamn || w.getAttribute("Name") === bladNamn,
  );
  if (!blad) return [];
  const rows = Array.from(blad.getElementsByTagName("Row"));
  return rows.map((row) =>
    Array.from(row.getElementsByTagName("Cell")).map((c) => ({
      text: cellText(c),
      tal: cellTal(c),
    })),
  );
}

function formateraTalSomText(n: number): string {
  return Math.round(n).toLocaleString("sv-SE").replace(/\u00a0/g, " ");
}

/**
 * Tolkar Excel-XML och returnerar fält som kan appliceras på planen.
 * Stödjer filer som skapats med «Ladda ner Excel».
 */
export function tolkaUnderhallsplanExcelXml(
  xml: string,
): ImporteradUnderhallsplanExcel {
  if (typeof DOMParser === "undefined") {
    throw new Error("Kan inte läsa Excel i den här miljön.");
  }
  const doc = new DOMParser().parseFromString(xml, "text/xml");
  if (doc.getElementsByTagName("parsererror").length > 0) {
    throw new Error(
      "Kunde inte läsa filen. Ladda upp en .xls som sparats från «Ladda ner Excel».",
    );
  }

  const grundRader = lasBladRaderMedTal(doc, "Grunduppgifter");
  if (grundRader.length === 0) {
    throw new Error(
      "Hittade inte fliken «Grunduppgifter». Använd en Excel-fil som exporterats från underhållsplanen.",
    );
  }

  const kv = new Map<string, number | string>();
  for (const rad of grundRader) {
    const nyckel = rad[0]?.text?.trim();
    if (!nyckel) continue;
    const värde = rad[1];
    if (!värde) continue;
    kv.set(nyckel, värde.tal ?? värde.text);
  }

  const grundPatch: Partial<Grunduppgifter> = {};
  const boarea = kv.get("Boarea m²");
  if (typeof boarea === "number" && boarea > 0) {
    grundPatch.boarea = formateraTalSomText(boarea);
  }
  const tomt = kv.get("Tomtyta m²");
  if (typeof tomt === "number" && tomt > 0) {
    grundPatch.tomtstorlek = formateraTalSomText(tomt);
  }
  const lgh = kv.get("Lägenheter");
  if (typeof lgh === "number" && lgh > 0) {
    grundPatch.antalLagenheter = String(Math.round(lgh));
  }
  const byggar = kv.get("Byggår");
  if (byggar != null && String(byggar) !== "—") {
    grundPatch.byggar = String(byggar);
  }
  const uppvarmning = kv.get("Uppvärmning");
  if (typeof uppvarmning === "string" && uppvarmning && uppvarmning !== "—") {
    grundPatch.uppvarmning = uppvarmning;
  }
  const ventilation = kv.get("Ventilation");
  if (typeof ventilation === "string" && ventilation && ventilation !== "—") {
    grundPatch.ventilationssystem = ventilation;
  }
  const fastighet = kv.get("Fastighetsbeteckning");
  if (typeof fastighet === "string" && fastighet && fastighet !== "—") {
    grundPatch.fastighetsbeteckning = fastighet;
  }
  const adress = kv.get("Adress");
  if (typeof adress === "string" && adress && adress !== "—") {
    grundPatch.adresser = adress
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  const planNamn =
    typeof kv.get("Plan") === "string" ? String(kv.get("Plan")) : undefined;
  const planStartAr =
    typeof kv.get("Planstart år") === "number"
      ? Math.round(kv.get("Planstart år") as number)
      : undefined;
  const planSlutAr =
    typeof kv.get("Planslut år") === "number"
      ? Math.round(kv.get("Planslut år") as number)
      : undefined;
  const krPerKvmAr =
    typeof kv.get("Avsättning kr/m²/år") === "number"
      ? (kv.get("Avsättning kr/m²/år") as number)
      : undefined;

  const noteringRader = lasBladRader(doc, "Notering")
    .slice(1)
    .map((r) => r[1]?.trim())
    .filter(Boolean);
  const planNotering =
    noteringRader.length > 0 ? noteringRader.join(" ") : undefined;

  const komponentVarden: ImporteradUnderhallsplanExcel["komponentVarden"] = [];
  const kompRader = lasBladRaderMedTal(doc, "Komponentvärden").slice(1);
  for (const rad of kompRader) {
    const etikett = rad[0]?.text?.trim();
    if (!etikett || etikett === "Komponent") continue;
    const [komponentNamn, underEtikett] = etikett
      .split("—")
      .map((s) => s.trim());
    if (!komponentNamn || !underEtikett) continue;
    komponentVarden.push({
      komponentNamn,
      underEtikett,
      installationskostnadKr:
        rad[1]?.tal != null ? Math.round(rad[1].tal) : undefined,
      avskrivningAr: rad[2]?.tal != null ? Math.round(rad[2].tal) : undefined,
    });
  }

  const delar: string[] = [];
  if (Object.keys(grundPatch).length > 0) delar.push("grunduppgifter");
  if (krPerKvmAr != null) delar.push("avsättning");
  if (planNotering) delar.push("notering");
  if (komponentVarden.length > 0) delar.push("komponentvärden");
  if (planStartAr != null || planSlutAr != null) delar.push("planperiod");

  if (delar.length === 0) {
    throw new Error("Filen innehöll inga uppgifter som kunde importeras.");
  }

  return {
    planNamn,
    planStartAr,
    planSlutAr,
    krPerKvmAr,
    planNotering,
    grundPatch,
    komponentVarden,
    meddelande: `Importerade ${delar.join(", ")} från Excel.`,
  };
}

export async function lasUnderhallsplanExcelFil(
  fil: File,
): Promise<ImporteradUnderhallsplanExcel> {
  const namn = fil.name.toLowerCase();
  if (!namn.endsWith(".xls") && !namn.endsWith(".xml")) {
    throw new Error(
      "Ladda upp en .xls-fil som sparats från «Ladda ner Excel» (SpreadsheetML).",
    );
  }
  const text = await fil.text();
  if (!text.includes("Workbook") && !text.includes("Worksheet")) {
    throw new Error(
      "Filen ser inte ut som en exporterad underhållsplan. Använd «Ladda ner Excel» först, redigera och ladda upp igen.",
    );
  }
  return tolkaUnderhallsplanExcelXml(text);
}

/** Applicerar importerade komponentvärden på registret. */
export function appliceraImporteradeKomponentVarden(
  register: Record<string, KomponentDetaljData>,
  varden: ImporteradUnderhallsplanExcel["komponentVarden"],
): Record<string, KomponentDetaljData> {
  if (varden.length === 0) return register;
  const nasta: Record<string, KomponentDetaljData> = { ...register };

  for (const v of varden) {
    const data = nasta[v.komponentNamn];
    if (!data) continue;
    nasta[v.komponentNamn] = {
      ...data,
      underkomponenter: data.underkomponenter.map((rad) => {
        if (rad.etikett !== v.underEtikett && rad.id !== v.underEtikett) {
          return rad;
        }
        return {
          ...rad,
          ...(v.installationskostnadKr != null
            ? { installationskostnadKr: String(v.installationskostnadKr) }
            : {}),
          ...(v.avskrivningAr != null
            ? { avskrivningAr: String(v.avskrivningAr) }
            : {}),
        };
      }),
    };
  }

  return nasta;
}
