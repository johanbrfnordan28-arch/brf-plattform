import {
  harTillrackligaBankIdSignaturer,
  normaliseraBankIdSignaturer,
  sammanfattaBankIdSignaturer,
  type BankIdSignatur,
} from "@/lib/bankid-signering";
import type { ForeningsDokument } from "@/components/dokumentbank/forening-dokumenter-lager";
import {
  arEntreprenadAvtalMallId,
  type EntreprenadAvtalForm,
} from "@/components/dokumentbank/mallar/entreprenadavtal-mallar";

export { arEntreprenadAvtalMallId, type EntreprenadAvtalForm };

export function arEntreprenadAvtalDokument(dok: ForeningsDokument): boolean {
  return (
    Boolean(dok.avtalForm) ||
    arEntreprenadAvtalMallId(dok.mallId)
  );
}

export function normaliseraAvtalSignering(dok: ForeningsDokument): {
  entreprenorSignaturer: BankIdSignatur[];
  foreningSignaturer: BankIdSignatur[];
  entreprenorKlart: boolean;
  foreningKlart: boolean;
  signerat: boolean;
} {
  const entreprenorSignaturer = normaliseraBankIdSignaturer(
    dok.entreprenorSignaturer,
  );
  const foreningSignaturer = normaliseraBankIdSignaturer(
    dok.foreningSignaturer,
  );
  const entreprenorKlart = harTillrackligaBankIdSignaturer(
    entreprenorSignaturer,
  );
  const foreningKlart = harTillrackligaBankIdSignaturer(foreningSignaturer);
  return {
    entreprenorSignaturer,
    foreningSignaturer,
    entreprenorKlart,
    foreningKlart,
    signerat: entreprenorKlart && foreningKlart,
  };
}

export function byggSignaturStatusText(dok: ForeningsDokument): string {
  const s = normaliseraAvtalSignering(dok);
  if (s.signerat) return "Signerat med BankID (2+2)";
  if (s.entreprenorKlart) return "Väntar på föreningens två BankID";
  return "Väntar på entreprenörens två BankID";
}

export function appendSignaturSammanfattning(
  text: string,
  dok: ForeningsDokument,
): string {
  const s = normaliseraAvtalSignering(dok);
  if (s.entreprenorSignaturer.length === 0 && s.foreningSignaturer.length === 0) {
    return text;
  }
  const rader = [
    "",
    "SIGNERING (BankID)",
    "------------------",
    `Entreprenör: ${sammanfattaBankIdSignaturer(s.entreprenorSignaturer) || "—"}`,
    `Förening: ${sammanfattaBankIdSignaturer(s.foreningSignaturer) || "—"}`,
  ];
  return `${text.trimEnd()}${rader.join("\n")}\n`;
}
