import { signeringRollInfo, type SigneringRoll } from "@/components/rondering/signering";
import {
  grupperaSchemaPunkter,
  type SigneringSchemaPunkt,
} from "@/components/rondering/signering-schema";
import { genereraDriftUpphandlingsVillkorText } from "@/components/rondering/upphandlingsvillkor-drift";
import type { DriftAvtal } from "@/components/rondering/drift-avtal-typer";

export function formateraSchemaPunkter(
  roll: SigneringRoll,
  punkter: SigneringSchemaPunkt[],
): string {
  const grupper = grupperaSchemaPunkter(punkter, roll);
  const rader: string[] = [];
  let nr = 1;
  for (const grupp of grupper) {
    rader.push(`[${grupp.namn}]`);
    for (const punkt of grupp.punkter) {
      rader.push(`${nr}. ${punkt.etikett}`);
      if (punkt.beskrivning) rader.push(`   ${punkt.beskrivning}`);
      nr += 1;
    }
    rader.push("");
  }
  if (punkter.length === 0) {
    rader.push("(Inga moment i schemat.)");
  }
  return rader.join("\n").trimEnd();
}

export function genereraOffertunderlag(opts: {
  roll: SigneringRoll;
  foreningsNamn: string;
  entreprenorNamn?: string;
  extraMeddelande?: string;
  schemaPunkter: SigneringSchemaPunkt[];
}): string {
  const info = signeringRollInfo[opts.roll];
  return [
    `OFFERTUNDERLAG — ${info.dokument.toUpperCase()}`,
    `Förening: ${opts.foreningsNamn}`,
    opts.entreprenorNamn ? `Till: ${opts.entreprenorNamn}` : "",
    `Datum: ${new Date().toLocaleDateString("sv-SE")}`,
    "",
    "Schemat nedan är bindande underlag för vad som ska utföras vid varje uppdrag.",
    "När ni tilldelas avtalet signerar två personer i företaget med BankID (personnummer på undertecknaren). Därefter signerar två personer i föreningen. Varje utfört uppdrag kvitteras därefter.",
    "",
    opts.extraMeddelande?.trim() ? opts.extraMeddelande.trim() : "",
    opts.extraMeddelande?.trim() ? "" : "",
    "SCHEMA",
    formateraSchemaPunkter(opts.roll, opts.schemaPunkter),
    "",
    genereraDriftUpphandlingsVillkorText(),
    "",
    "Vänligen återkom med offert till styrelsen.",
  ]
    .filter((rad, i, arr) => !(rad === "" && arr[i - 1] === ""))
    .join("\n");
}

export function genereraAvtalstext(
  avtal: DriftAvtal,
  foreningsNamn: string,
): string {
  const info = signeringRollInfo[avtal.roll];
  return [
    `AVTAL — ${info.dokument.toUpperCase()}`,
    `Förening: ${foreningsNamn}`,
    `Entreprenör: ${avtal.entreprenorNamn}`,
    `Skapat: ${new Date(avtal.skapadTidpunkt).toLocaleDateString("sv-SE")}`,
    "",
    "Parterna är överens om att bifogat schema är bindande för varje uppdrag.",
    avtal.kravBankIdKvittens
      ? "Varje utfört uppdrag ska kvitteras med BankID."
      : "Varje utfört uppdrag ska kvitteras. Föreningen kräver inte BankID vid kvittens.",
    "Avtalet tecknas med BankID: först två personer i företaget, därefter två personer i föreningen. Varje BankID-signering är knuten till undertecknarens personnummer.",
    "",
    avtal.offertMeddelande ? avtal.offertMeddelande : "",
    avtal.offertMeddelande ? "" : "",
    "SCHEMA (bindande)",
    formateraSchemaPunkter(avtal.roll, avtal.schemaPunkter),
    "",
    genereraDriftUpphandlingsVillkorText(),
  ]
    .filter((rad, i, arr) => !(rad === "" && arr[i - 1] === ""))
    .join("\n");
}
