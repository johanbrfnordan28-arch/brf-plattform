/**
 * Fakturauppgifter vid teckna avtal — enda fält som inte kommer från
 * grunduppgifterna. Underlaget mejlas till fakturamottagaren.
 */

import { hamtaAntalLagenheterSynkat } from "@/lib/forening-grund-synk";
import { mejlSkickades } from "@/lib/auth/mejl-konfiguration";
import { hamtaServerAccessNyckel } from "@/lib/forening-server-sync";
import { LEVERANTOR, leverantorPostadress } from "@/lib/leverantor";
import {
  beraknaPris,
  formatKr,
  type BeraknatPris,
} from "@/lib/prislista";
import type { ForeningProfil } from "@/lib/forening-registry";

export type ForeningFakturaUppgifter = {
  epost: string;
  adress: string;
  postnummer: string;
  ort: string;
  referens: string;
};

export function fakturaFranProfil(
  profil: ForeningProfil,
): ForeningFakturaUppgifter {
  return {
    epost: profil.fakturaEpost.trim() || profil.epost.trim(),
    adress: profil.fakturaAdress.trim() || profil.postadress.trim(),
    postnummer: profil.fakturaPostnummer.trim() || profil.postnummer.trim(),
    ort: profil.fakturaOrt.trim() || profil.ort.trim(),
    referens: profil.fakturaReferens.trim(),
  };
}

export function arFakturaUppgifterKlara(
  faktura: ForeningFakturaUppgifter,
): boolean {
  return Boolean(
    faktura.epost.includes("@") &&
      faktura.adress.trim() &&
      faktura.postnummer.trim() &&
      faktura.ort.trim(),
  );
}

export function hamtaAntalLagenheterForFaktura(): number {
  return hamtaAntalLagenheterSynkat();
}

export function kvartalsperiod(nu = new Date()): { etikett: string; start: Date } {
  const q = Math.floor(nu.getMonth() / 3) + 1;
  const start = new Date(nu.getFullYear(), (q - 1) * 3, 1);
  return {
    etikett: `kvartal ${q} ${nu.getFullYear()}`,
    start,
  };
}

export function byggFakturaMejl(opts: {
  foreningsNamn: string;
  organisationsnummer: string;
  faktura: ForeningFakturaUppgifter;
  pris: BeraknatPris;
  periodEtikett: string;
}): { amne: string; brodtext: string } {
  const momsKr = Math.round(opts.pris.kvartalsbelopp * 0.25);
  const attBetala = opts.pris.kvartalsbelopp + momsKr;
  const rader = [
    `Fakturaunderlag — ${LEVERANTOR.varumarke}`,
    "",
    `Kund: ${opts.foreningsNamn}`,
    opts.organisationsnummer
      ? `Organisationsnummer: ${opts.organisationsnummer}`
      : "",
    `Fakturaadress: ${opts.faktura.adress}, ${opts.faktura.postnummer} ${opts.faktura.ort}`,
    opts.faktura.referens ? `Referens: ${opts.faktura.referens}` : "",
    `Fakturamottagare: ${opts.faktura.epost}`,
    "",
    `Period: ${opts.periodEtikett} (förskott)`,
    `Antal lägenheter: ${opts.pris.antalLagenheter}`,
    `Prisnivå: ${opts.pris.niva.etikett}`,
    `Belopp exkl. moms: ${formatKr(opts.pris.kvartalsbelopp)}`,
    `Moms 25 %: ${formatKr(momsKr)}`,
    `Att betala: ${formatKr(attBetala)}`,
    "",
    "Betalningsvillkor: 30 dagar.",
    `Leverantör: ${LEVERANTOR.namn}, org.nr ${LEVERANTOR.organisationsnummer}`,
    leverantorPostadress(),
    "",
    "Detta är kvartalsfakturan i förskott enligt tecknat årsavtal.",
  ].filter((rad, i, alla) => rad !== "" || alla[i - 1] !== "");

  return {
    amne: `Faktura ${opts.periodEtikett} — ${LEVERANTOR.varumarke} / ${opts.foreningsNamn}`,
    brodtext: rader.join("\n"),
  };
}

export async function skickaForeningFakturaKlient(opts: {
  foreningId: string;
  foreningsNamn: string;
  organisationsnummer: string;
  faktura: ForeningFakturaUppgifter;
  antalLagenheter: number;
}): Promise<{ ok: boolean; meddelande: string }> {
  const access = hamtaServerAccessNyckel(opts.foreningId);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (access) headers["x-access-nyckel"] = access;

  const res = await fetch(`/api/foreningar/${opts.foreningId}/faktura`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      foreningsNamn: opts.foreningsNamn,
      organisationsnummer: opts.organisationsnummer,
      faktura: opts.faktura,
      antalLagenheter: opts.antalLagenheter,
    }),
  });
  const data = (await res.json()) as {
    fel?: string;
    meddelande?: string;
    mejlVia?: string;
  };
  if (!res.ok) {
    return { ok: false, meddelande: data.fel || "Kunde inte skicka fakturan." };
  }
  const skickad = mejlSkickades(data.mejlVia || "");
  return {
    ok: true,
    meddelande:
      data.meddelande ||
      (skickad
        ? `Fakturan har skickats till ${opts.faktura.epost}.`
        : `Fakturan sparades. Mejlet kunde inte levereras automatiskt — kontrollera adressen ${opts.faktura.epost}.`),
  };
}
