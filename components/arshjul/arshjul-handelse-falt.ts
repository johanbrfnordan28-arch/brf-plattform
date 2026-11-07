import type { ArshjulHandelse, ArshjulKategori } from "@/components/arshjul/arshjul";
import {
  besiktningTjanst,
  besiktningTjanster,
  hamtaBesiktningPost,
  laggTillEgetProtokoll,
  type BesiktningTjanstId,
} from "@/components/foreningsinformation/besiktning-upphandling";
import { upphandlingsLank } from "@/components/upphandling/portal-handlingar";
import { arFranDatum, beraknaNastaBesiktningAr } from "@/lib/besiktning-intervall";

/** Styrelsemöten, stämma, ekonomi m.m. — ansvarig inom styrelsen. */
export function arshjulAnvanderStyrelseAnsvarig(
  kategori: ArshjulKategori,
): boolean {
  switch (kategori) {
    case "styrelsemote":
    case "ekonomi":
    case "stamma":
    case "juridik":
    case "medlemmar":
    case "ovrigt":
    case "projekteringsmote":
    case "upphandlingsmote":
    case "startmote":
    case "byggmote":
    case "besiktningEntreprenad":
    case "garantbesiktning":
      return true;
    default:
      return false;
  }
}

/** OVK, sotning, energi, radon m.m. — senast anlitad entreprenör/leverantör. */
export function arshjulAnvanderEntreprenorFalt(
  kategori: ArshjulKategori,
): boolean {
  return !arshjulAnvanderStyrelseAnsvarig(kategori);
}

export function entreprenorFaltEtikett(kategori: ArshjulKategori): string {
  if (arshjulAnvanderStyrelseAnsvarig(kategori)) {
    return "Ansvarig inom styrelsen";
  }
  return "Senast anlitad entreprenör / leverantör";
}

export function entreprenorFaltPlaceholder(kategori: ArshjulKategori): string {
  if (arshjulAnvanderStyrelseAnsvarig(kategori)) {
    return "Namn eller roll, t.ex. ordförande eller kassör";
  }
  return "Företag som utförde uppdraget senast";
}

export function entreprenorFaltVisningEtikett(kategori: ArshjulKategori): string {
  if (arshjulAnvanderStyrelseAnsvarig(kategori)) {
    return "Ansvarig inom styrelsen";
  }
  return "Senast anlitad";
}

export function arshjulArSotning(h: ArshjulHandelse): boolean {
  return h.kategori === "sotning" || h.id === "std-sotning";
}

export function arshjulArOvk(h: ArshjulHandelse): boolean {
  return h.kategori === "ovk";
}

type ArshjulBesiktningRef = Pick<ArshjulHandelse, "kategori" | "id">;

export function arshjulArEnergideklaration(h: ArshjulBesiktningRef): boolean {
  return h.kategori === "energideklaration" || h.id === "std-energi";
}

export function arshjulArRadon(h: ArshjulBesiktningRef): boolean {
  return h.kategori === "radon" || h.id === "std-radon";
}

export function arshjulKräverTioarsIntervall(h: ArshjulBesiktningRef): boolean {
  return arshjulArEnergideklaration(h) || arshjulArRadon(h);
}

/** OVK, energi och radon — senaste utförare och datum, utan mötesflöde. */
export function arshjulVisaForenkladBesiktning(h: ArshjulHandelse): boolean {
  return (
    arshjulArOvk(h) || arshjulArEnergideklaration(h) || arshjulArRadon(h)
  );
}

export function besiktningTjanstIdFranArshjul(
  h: ArshjulHandelse,
): BesiktningTjanstId | null {
  const idMap: Record<string, BesiktningTjanstId> = {
    "std-ovk-bostad": "ovk",
    "std-ovk-butik": "ovk",
    "std-energi": "energideklaration",
    "std-radon": "radon",
  };
  if (idMap[h.id]) return idMap[h.id];
  if (h.kategori === "ovk") return "ovk";
  if (h.kategori === "energideklaration") return "energideklaration";
  if (h.kategori === "radon") return "radon";
  return null;
}

/** Återkommande besiktningar där senaste godkännande och nästa tillfälle följs upp. */
export function arshjulArAterkommandeBesiktning(h: ArshjulHandelse): boolean {
  return (
    arshjulVisaForenkladBesiktning(h) ||
    arshjulArSotning(h) ||
    (h.kategori === "besiktning" && h.typ === "intervall")
  );
}

/** Energideklaration och radonmätning godkänns eller underkänns inte. */
export function arshjulBesiktningKanUnderkannas(h: ArshjulBesiktningRef): boolean {
  return !arshjulKräverTioarsIntervall(h);
}

export function arshjulNastaBesiktningAr(h: ArshjulHandelse): number | null {
  const nasta = beraknaNastaBesiktningAr({
    godkandAr: arFranDatum(h.besiktningSenastDatum) ?? h.senastKlarAr,
    ordinarieAr:
      h.senastKlarAr ?? (h.besiktningUnderkandForst ? h.besiktningOrdinarieAr : null),
    intervallAr: h.intervallAr,
  });
  return nasta ?? h.startAr ?? null;
}

/** Tar med senaste besiktningen från årshjulet som protokoll, om den inte redan finns där. */
export function hamtaArshjulProtokollTillUpphandling(h: ArshjulHandelse): void {
  const tjanstId = besiktningTjanstIdFranArshjul(h);
  if (!tjanstId) return;
  const utforsAv = h.leverantor?.trim() ?? "";
  const datum = h.besiktningSenastDatum?.trim() || String(h.senastKlarAr ?? "");
  if (!utforsAv && !h.besiktningSenastDatum?.trim()) return;
  const finns = hamtaBesiktningPost(tjanstId).egnaProtokoll.some(
    (p) => p.datum === datum && p.utforsAv === utforsAv,
  );
  if (finns) return;
  const nasta = arshjulNastaBesiktningAr(h);
  laggTillEgetProtokoll(tjanstId, {
    datum,
    utforsAv,
    sammanfattning: [
      `Senaste ${besiktningTjanst(tjanstId).rubrik} enligt årshjulet.`,
      nasta ? `Nästa planerat år: ${nasta}.` : "",
    ]
      .filter(Boolean)
      .join(" "),
  });
}

/** Förenklad upphandling (senaste protokoll + anbudsformulär) — inte sotning. */
export function arshjulUpphandlingsLank(
  h: ArshjulHandelse,
): { href: string; etikett: string; beskrivning: string } | null {
  if (arshjulArSotning(h)) return null;

  const idMap: Record<string, (typeof besiktningTjanster)[number]["id"]> = {
    "std-ovk-bostad": "ovk",
    "std-ovk-butik": "ovk",
    "std-energi": "energideklaration",
    "std-radon": "radon",
  };

  let tjanstId = idMap[h.id];
  if (!tjanstId) {
    if (h.kategori === "ovk") tjanstId = "ovk";
    else if (h.kategori === "energideklaration") tjanstId = "energideklaration";
    else if (h.kategori === "radon") tjanstId = "radon";
  }
  if (!tjanstId) return null;

  const tjanst = besiktningTjanster.find((t) => t.id === tjanstId);
  if (!tjanst) return null;

  return {
    href: upphandlingsLank(tjanst.kategoriNamn, { arshjulHandelseId: h.id }),
    etikett: "Skapa upphandling",
    beskrivning:
      "Öppnar upphandlingsmodulen. Senaste protokoll, händelsens bilagor och föreningens uppgifter följer med, och fler handlingar kan hämtas från hela portalen.",
  };
}

export const SOTNING_ENTREPRENOR_INFO =
  "Sotning behöver normalt inte upphandlas — föreningen ligger ofta kvar på Stockholms brandförsvars centrala avtal och priset är i regel detsamma. Vill ni byta till en egen, inkörd entreprenör måste styrelsen kontakta Stockholms brandförsvar för att lämna det centrala avtalet.";
