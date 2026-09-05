import type { KomponentDetaljData } from "@/components/underhallsplan/komponentregister";
import { BALKONGER_UNDERKOMPONENT_ID } from "@/components/underhallsplan/balkonger";
import { hamtaBalkongKostnadDetaljer } from "@/components/underhallsplan/balkong-pris";
import {
  hamtaFonsterDorrKostnadFasad,
  hamtaFonsterKostnadFonster,
} from "@/components/underhallsplan/fonster-dorr-pris";
import { HISS_UNDERKOMPONENT_ID } from "@/components/underhallsplan/hissar";
import { hamtaHissKostnadTrapphus } from "@/components/underhallsplan/hiss-pris";
import { hamtaStambyteKostnadVvs } from "@/components/underhallsplan/stambyte-pris";
import { hamtaTakterrassKostnaderTak } from "@/components/underhallsplan/takterrass-pris";
import { hamtaTvattstugaKostnadKallare } from "@/components/underhallsplan/tvattstuga-pris";
import { effektivUnderhallKostnadKr } from "@/components/underhallsplan/underhall-kostnad";

export type RegisterKostnadRad = {
  id: string;
  komponent: string;
  etikett: string;
  beloppKr: number;
};

export function sammanstallRegisterKostnader(
  activeComponents: string[],
  komponentDetaljer: Record<string, KomponentDetaljData>,
): { rader: RegisterKostnadRad[]; totaltKr: number } {
  const rader: RegisterKostnadRad[] = [];
  /** Underkomponenter som redan täcks av specialpaneler (undvik dubbletter). */
  const tackta = new Set<string>();

  if (activeComponents.includes("Fasad")) {
    const fasad = komponentDetaljer.Fasad;
    const fd = hamtaFonsterDorrKostnadFasad(fasad);
    if (fd.dorrar > 0) {
      rader.push({
        id: "fasad-dorrar",
        komponent: "Fasad",
        etikett: "Dörrar (uppskattat)",
        beloppKr: fd.dorrar,
      });
      tackta.add("Fasad|dorrar");
    }
  }

  if (activeComponents.includes("Fönster")) {
    const fonster = hamtaFonsterKostnadFonster(komponentDetaljer["Fönster"]);
    if (fonster > 0) {
      rader.push({
        id: "fonster-fonster",
        komponent: "Fönster",
        etikett: "Fönster (uppskattat)",
        beloppKr: fonster,
      });
      tackta.add("Fönster|fonster");
    }
  }

  if (activeComponents.includes("Balkonger")) {
    const balkonger = komponentDetaljer.Balkonger;
    const { poster, totaltKr } = hamtaBalkongKostnadDetaljer(balkonger);
    for (const post of poster) {
      if (post.totaltKr > 0) {
        rader.push({
          id: `balkonger-${post.postId}`,
          komponent: "Balkonger",
          etikett: post.namn,
          beloppKr: post.totaltKr,
        });
      }
    }
    if (poster.length === 0 && totaltKr > 0) {
      rader.push({
        id: "balkonger-balkonger",
        komponent: "Balkonger",
        etikett: "Balkonger (uppskattat)",
        beloppKr: totaltKr,
      });
    }
    if (totaltKr > 0 || poster.some((p) => p.totaltKr > 0)) {
      tackta.add(`Balkonger|${BALKONGER_UNDERKOMPONENT_ID}`);
    }
  }

  if (activeComponents.includes("Trapphus")) {
    const hiss = hamtaHissKostnadTrapphus(komponentDetaljer.Trapphus);
    if (hiss > 0) {
      rader.push({
        id: "trapphus-hiss",
        komponent: "Trapphus",
        etikett: "Hissar — modernisering (uppskattat)",
        beloppKr: hiss,
      });
      tackta.add(`Trapphus|${HISS_UNDERKOMPONENT_ID}`);
    }
  }

  if (activeComponents.includes("Källare")) {
    const tvatt = hamtaTvattstugaKostnadKallare(komponentDetaljer.Källare);
    if (tvatt > 0) {
      rader.push({
        id: "kallare-tvattstuga",
        komponent: "Källare",
        etikett: "Tvättstugor (uppskattat)",
        beloppKr: tvatt,
      });
      tackta.add("Källare|tvattstuga");
    }
  }

  if (activeComponents.includes("Tak")) {
    const tak = hamtaTakterrassKostnaderTak(komponentDetaljer.Tak);
    if (tak.gemensam > 0) {
      rader.push({
        id: "tak-gemensam",
        komponent: "Tak",
        etikett: "Gemensam takterrass",
        beloppKr: tak.gemensam,
      });
      tackta.add("Tak|takterrass");
    }
    if (tak.medlem > 0) {
      rader.push({
        id: "tak-medlem",
        komponent: "Tak",
        etikett: "Medlemstakterrass",
        beloppKr: tak.medlem,
      });
      tackta.add("Tak|medlemstakterrass");
    }
    if (tak.takfonster > 0) {
      rader.push({
        id: "tak-fonster",
        komponent: "Tak",
        etikett: "Takfönster",
        beloppKr: tak.takfonster,
      });
      tackta.add("Tak|takfonster");
    }
  }

  if (activeComponents.includes("VVS")) {
    const stambyte = hamtaStambyteKostnadVvs(komponentDetaljer.VVS);
    if (stambyte > 0) {
      rader.push({
        id: "vvs-stambyte",
        komponent: "VVS",
        etikett: "Stambyte",
        beloppKr: stambyte,
      });
      tackta.add("VVS|stambyte");
    }
  }

  /** Övriga underhållskostnader sparade på underkomponentraden (tak, el, fasad …). */
  for (const komponent of activeComponents) {
    const data = komponentDetaljer[komponent];
    if (!data) continue;
    for (const rad of data.underkomponenter) {
      if (!rad.aktiv) continue;
      const nyckel = `${komponent}|${rad.id}`;
      if (tackta.has(nyckel)) continue;
      const beloppKr = effektivUnderhallKostnadKr(rad);
      if (beloppKr <= 0) continue;
      rader.push({
        id: `underhall-${komponent}-${rad.id}`,
        komponent,
        etikett: rad.etikett,
        beloppKr,
      });
      tackta.add(nyckel);
    }
  }

  const totaltKr = rader.reduce((s, r) => s + r.beloppKr, 0);
  return { rader, totaltKr };
}
