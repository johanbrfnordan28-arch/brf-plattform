import {
  normaliseraFastighetsYtor,
  synkaHusFranGrund,
  type FastighetsYtorData,
} from "@/components/underhallsplan/fastighets-ytor";
import { parseHeltalFranText } from "@/components/underhallsplan/parse-grundtal";
import type { Grunduppgifter } from "@/components/underhallsplan/types";

export function hamtaAntalByggnader(grund: Grunduppgifter): number {
  return Math.max(1, parseHeltalFranText(grund.antalByggnader) || 1);
}

/** Antal adressrutor = antal byggnader (en adress per hus). */
export function synkaAdresserTillAntalByggnader(
  adresser: string[],
  antal: number,
): string[] {
  const next = [...adresser];
  while (next.length < antal) next.push("");
  while (next.length > antal) next.pop();
  return next;
}

/** Adresslista som används i fönster, kartor m.m. */
export function hamtaByggnadAdresser(grund: Grunduppgifter): string[] {
  const grundSynkad = synkaGrundByggnaderOchAdresser(grund);
  const ytor = normaliseraFastighetsYtor(grundSynkad.fastighetsYtor);
  const franHus = ytor.hus
    .map((h) => h.husnummer.trim())
    .filter(Boolean);
  if (franHus.length > 0) return franHus;
  return grundSynkad.adresser.map((a) => a.trim()).filter(Boolean);
}

/**
 * Synkar antal byggnader, adresser (1:1) och hus i fastighetsYtor.
 * Anropas när antal byggnader eller adresser ändras.
 */
export function synkaGrundByggnaderOchAdresser(
  grund: Grunduppgifter,
): Grunduppgifter {
  const antal = hamtaAntalByggnader(grund);
  const adresser = synkaAdresserTillAntalByggnader(grund.adresser, antal);
  const ytor = synkaHusFranGrund(
    normaliseraFastighetsYtor(grund.fastighetsYtor),
    { ...grund, adresser, antalByggnader: String(antal) },
  );
  const hus = ytor.hus.map((h, i) => ({
    ...h,
    husnummer: adresser[i]?.trim() || h.husnummer.trim() || `Hus ${i + 1}`,
  }));
  return {
    ...grund,
    antalByggnader: String(antal),
    adresser,
    fastighetsYtor: { ...ytor, hus },
  };
}

export function uppdateraGrundAdress(
  grund: Grunduppgifter,
  index: number,
  value: string,
): Grunduppgifter {
  const antal = hamtaAntalByggnader(grund);
  const adresser = synkaAdresserTillAntalByggnader(grund.adresser, antal);
  adresser[index] = value;
  const next = synkaGrundByggnaderOchAdresser({ ...grund, adresser });
  return next;
}

export function laggTillGrundByggnadAdress(
  grund: Grunduppgifter,
): Grunduppgifter {
  const antal = hamtaAntalByggnader(grund) + 1;
  return synkaGrundByggnaderOchAdresser({
    ...grund,
    antalByggnader: String(antal),
  });
}

export function taBortGrundByggnadAdress(
  grund: Grunduppgifter,
  index: number,
): Grunduppgifter {
  if (hamtaAntalByggnader(grund) <= 1) return grund;
  const adresser = synkaAdresserTillAntalByggnader(grund.adresser, hamtaAntalByggnader(grund));
  adresser.splice(index, 1);
  return synkaGrundByggnaderOchAdresser({
    ...grund,
    adresser,
    antalByggnader: String(Math.max(1, adresser.length)),
  });
}

export function uppdateraGrundAntalByggnader(
  grund: Grunduppgifter,
  antalText: string,
): Grunduppgifter {
  return synkaGrundByggnaderOchAdresser({
    ...grund,
    antalByggnader: antalText,
  });
}
