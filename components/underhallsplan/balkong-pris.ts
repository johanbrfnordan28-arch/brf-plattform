import { formatKr } from "@/components/underhallsplan/besiktningar";
import type { KomponentDetaljData } from "@/components/underhallsplan/komponentregister";
import {
  effektivEnhetspris,
  parsePrisKr,
  RIKT_BALKONG_DEL_KR,
  RIKT_TILLBYGGD_BALKONG_KR,
} from "@/components/underhallsplan/riktpriser";
import {
  BALKONGER_UNDERKOMPONENT_ID,
  balkongDelarMall,
  balkongHarPlatta,
  normaliseraBalkongPost,
  type BalkongDelId,
  type BalkongPost,
  type BalkongPriser,
} from "@/components/underhallsplan/balkonger";

export type BalkongPrisRad = {
  id: string;
  etikett: string;
  mangd: number;
  mangdText: string;
  enhet: string;
  enhetsprisKr: number;
  summaKr: number;
};

export function skapaTomBalkongPriser(): BalkongPriser {
  return {
    balkongplatta: "",
    tatskikt: "",
    fallspackel: "",
    sockel: "",
    "droppnasa-kantbleck": "",
    avvattning: "",
    rake: "",
    golv: "",
    tillbyggdFast: "",
  };
}

function parseMangd(s: string): number {
  const n = Number.parseFloat(s.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function slåIhopPriser(priser?: BalkongPriser): BalkongPriser {
  return { ...skapaTomBalkongPriser(), ...priser };
}

export function beraknaBalkongPostPris(post: BalkongPost): {
  rader: BalkongPrisRad[];
  totaltKr: number;
} {
  const p = normaliseraBalkongPost(post);
  const priser = slåIhopPriser(p.priser);
  const rader: BalkongPrisRad[] = [];

  if (p.konstruktion === "tillbyggd") {
    const fast = effektivEnhetspris(
      priser.tillbyggdFast,
      RIKT_TILLBYGGD_BALKONG_KR,
    );
    if (fast > 0) {
      rader.push({
        id: "tillbyggd",
        etikett: "Tillbyggd balkongmodul",
        mangd: 1,
        mangdText: "1 st",
        enhet: "kr/st",
        enhetsprisKr: fast,
        summaKr: fast,
      });
    }
  }

  const rakeLm = parseMangd(p.rakeLopmeter);
  if (rakeLm > 0) {
    const enhetsprisKr = effektivEnhetspris(priser.rake, RIKT_BALKONG_DEL_KR.rake);
    rader.push({
      id: "rake",
      etikett: "Balkongräcke",
      mangd: rakeLm,
      mangdText: `${rakeLm.toLocaleString("sv-SE")} m`,
      enhet: "kr/m",
      enhetsprisKr,
      summaKr: Math.round(rakeLm * enhetsprisKr),
    });
  }

  if (balkongHarPlatta(p.balkongTyp) && p.golvMaterial !== "ingen-platta") {
    const golvKvm = parseMangd(p.golvKvm);
    if (golvKvm > 0) {
      const enhetsprisKr = effektivEnhetspris(priser.golv, RIKT_BALKONG_DEL_KR.golv);
      rader.push({
        id: "golv",
        etikett: "Ytskikt golv",
        mangd: golvKvm,
        mangdText: `${golvKvm.toLocaleString("sv-SE")} m²`,
        enhet: "kr/m²",
        enhetsprisKr,
        summaKr: Math.round(golvKvm * enhetsprisKr),
      });
    }
  }

  for (const def of balkongDelarMall) {
    const rad = p.delar.find((d) => d.delId === def.id);
    if (!rad?.aktiv) continue;
    const mangd = parseMangd(rad.mangd);
    if (mangd <= 0) continue;
    const rikt = RIKT_BALKONG_DEL_KR[def.id as keyof typeof RIKT_BALKONG_DEL_KR];
    const enhetsprisKr = effektivEnhetspris(priser[def.id], rikt);
    const enhetKort = def.enhet === "m2" ? "kr/m²" : def.enhet === "m" ? "kr/m" : "kr/st";
    rader.push({
      id: def.id,
      etikett: def.etikett,
      mangd,
      mangdText: `${mangd.toLocaleString("sv-SE")} ${def.enhet === "m2" ? "m²" : def.enhet === "m" ? "m" : "st"}`,
      enhet: enhetKort,
      enhetsprisKr,
      summaKr: Math.round(mangd * enhetsprisKr),
    });
  }

  const totaltKr = rader.reduce((s, r) => s + r.summaKr, 0);
  return { rader, totaltKr };
}

export function beraknaBalkongListaPris(poster: BalkongPost[]): {
  poster: { postId: string; namn: string; totaltKr: number }[];
  totaltKr: number;
} {
  const resultat = poster.map((post) => {
    const p = normaliseraBalkongPost(post);
    const { totaltKr } = beraknaBalkongPostPris(p);
    return {
      postId: p.id,
      namn: p.namn.trim() || p.balkongTyp,
      totaltKr,
    };
  });
  return {
    poster: resultat,
    totaltKr: resultat.reduce((s, r) => s + r.totaltKr, 0),
  };
}

export function hamtaBalkongKostnadFasad(
  fasadDetalj: KomponentDetaljData | undefined,
): number {
  if (!fasadDetalj) return 0;
  const rad = fasadDetalj.underkomponenter.find(
    (r) => r.id === BALKONGER_UNDERKOMPONENT_ID,
  );
  if (!rad?.aktiv) return 0;
  const poster = fasadDetalj.balkongRegister?.[BALKONGER_UNDERKOMPONENT_ID] ?? [];
  return beraknaBalkongListaPris(poster.map(normaliseraBalkongPost)).totaltKr;
}

export function hamtaBalkongKostnadBalkonger(
  balkongerDetalj: KomponentDetaljData | undefined,
): number {
  return hamtaBalkongKostnadDetaljer(balkongerDetalj).totaltKr;
}

export function hamtaBalkongKostnadDetaljer(
  balkongerDetalj: KomponentDetaljData | undefined,
): ReturnType<typeof beraknaBalkongListaPris> {
  if (!balkongerDetalj) return { poster: [], totaltKr: 0 };
  const rad = balkongerDetalj.underkomponenter.find(
    (r) => r.id === BALKONGER_UNDERKOMPONENT_ID,
  );
  if (!rad?.aktiv) return { poster: [], totaltKr: 0 };
  const poster =
    balkongerDetalj.balkongRegister?.[BALKONGER_UNDERKOMPONENT_ID] ?? [];
  return beraknaBalkongListaPris(poster.map(normaliseraBalkongPost));
}

export function formateraBalkongPris(totaltKr: number): string {
  return totaltKr > 0 ? formatKr(totaltKr) : "";
}
