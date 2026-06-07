import {
  formateraStyrelseKontaktBlock,
  hamtaStyrelseKontakt,
} from "@/lib/styrelse-kontakt";
import { signeringRollInfo } from "@/components/rondering/signering";
import type { SigneringRoll } from "@/components/rondering/signering";
import {
  grupperaSchemaPunkter,
  hamtaAktivaSchemaPunkter,
  type SigneringSchemaPunkt,
} from "@/components/rondering/signering-schema";

function formateraPunkt(punkt: SigneringSchemaPunkt, index: number): string {
  const rader = [`${index}. ${punkt.etikett}`];
  if (punkt.beskrivning) {
    rader.push(`   ${punkt.beskrivning}`);
  }
  return rader.join("\n");
}

/** Textversion av aktivt månadsschema — för upphandling och arkiv. */
export function genereraSchemaText(roll: SigneringRoll): string {
  const info = signeringRollInfo[roll];
  const aktiva =
    typeof window !== "undefined" ? hamtaAktivaSchemaPunkter(roll) : [];

  const grupper = grupperaSchemaPunkter(aktiva, roll);
  const kontakt =
    typeof window !== "undefined" ? hamtaStyrelseKontakt() : null;
  const rader: string[] = [
    info.dokument.toUpperCase(),
    `Roll: ${info.titel} (${info.entreprenorTyp})`,
    `Genererad: ${new Date().toLocaleString("sv-SE")}`,
    "",
    formateraStyrelseKontaktBlock(kontakt).trimEnd(),
    "Aktiva moment:",
    "",
  ];

  let nr = 1;
  for (const grupp of grupper) {
    rader.push(`[${grupp.namn}]`);
    for (const punkt of grupp.punkter) {
      rader.push(formateraPunkt(punkt, nr));
      nr += 1;
    }
    rader.push("");
  }

  if (aktiva.length === 0) {
    rader.push("(Inga aktiva moment — konfigurera schemat ovan innan export.)");
  }

  return rader.join("\n");
}

export function laddaNedTextfil(text: string, filnamn: string): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filnamn;
  a.click();
  URL.revokeObjectURL(url);
}

export function laddaNedSchemaText(roll: SigneringRoll, filnamn: string): void {
  laddaNedTextfil(genereraSchemaText(roll), filnamn);
}

export function kopieraTillUrklipp(text: string): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.clipboard) {
    return Promise.resolve(false);
  }
  return navigator.clipboard.writeText(text).then(
    () => true,
    () => false,
  );
}
