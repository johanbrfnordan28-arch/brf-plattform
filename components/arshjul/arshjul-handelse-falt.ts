import type { ArshjulHandelse, ArshjulKategori } from "@/components/arshjul/arshjul";
import {
  besiktningTjanster,
  laggTillEgetProtokoll,
  skapaBesiktningUpphandling,
  type BesiktningTjanstId,
} from "@/components/foreningsinformation/besiktning-upphandling";
import { kategoriId } from "@/components/upphandling/kategorier";

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

/** OVK i årshjulet — ingen dagordning/BankID, bara senaste och nästa besiktning. */
export function arshjulVisaForenkladBesiktning(h: ArshjulHandelse): boolean {
  return arshjulArOvk(h);
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

export function arshjulNastaBesiktningAr(h: ArshjulHandelse): number | null {
  const intervall = h.intervallAr;
  if (!intervall || intervall < 1) return h.startAr ?? null;
  let senastAr = h.senastKlarAr;
  if (!senastAr && h.besiktningSenastDatum?.trim()) {
    const ar = Number(h.besiktningSenastDatum.slice(0, 4));
    if (Number.isFinite(ar)) senastAr = ar;
  }
  if (senastAr) return senastAr + intervall;
  return h.startAr ?? null;
}

/** Skickar med senaste OVK från årshjulet som protokoll och skapar upphandling. */
export function skapaUpphandlingFranArshjul(
  h: ArshjulHandelse,
): { ok: true; titel: string; href: string } | { ok: false; fel: string } {
  const tjanstId = besiktningTjanstIdFranArshjul(h);
  if (!tjanstId) return { ok: false, fel: "Upphandling finns inte för den här händelsen." };

  if (h.leverantor?.trim() || h.besiktningSenastDatum?.trim()) {
    const nasta = arshjulNastaBesiktningAr(h);
    laggTillEgetProtokoll(tjanstId, {
      datum: h.besiktningSenastDatum?.trim() || String(h.senastKlarAr ?? ""),
      utforsAv: h.leverantor?.trim() ?? "",
      sammanfattning: [
        "Senaste OVK enligt årshjulet.",
        nasta ? `Nästa planerat år: ${nasta}.` : "",
      ]
        .filter(Boolean)
        .join(" "),
    });
  }

  const result = skapaBesiktningUpphandling(tjanstId, []);
  if (!result.ok) return result;
  const tjanst = besiktningTjanster.find((t) => t.id === tjanstId);
  const key = tjanst ? kategoriId(tjanst.kategoriNamn) : "ovk";
  return {
    ok: true,
    titel: result.titel,
    href: `/forening/upphandling#kategori-${key}`,
  };
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

  const key = kategoriId(tjanst.kategoriNamn);
  return {
    href: `/forening/upphandling#kategori-${key}`,
    etikett: "Skapa upphandling",
    beskrivning:
      "Öppnar förenklad upphandling: senaste protokoll och föreningens uppgifter följer med, plus anbudsformulär som kan mejlas ut. Anbud kommer in i upphandlingsmodulen.",
  };
}

export const SOTNING_ENTREPRENOR_INFO =
  "Sotning behöver normalt inte upphandlas — föreningen ligger ofta kvar på Stockholms brandförsvars centrala avtal och priset är i regel detsamma. Vill ni byta till en egen, inkörd entreprenör måste styrelsen kontakta Stockholms brandförsvar för att lämna det centrala avtalet.";
