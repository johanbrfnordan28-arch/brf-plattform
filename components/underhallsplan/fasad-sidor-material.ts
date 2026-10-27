import type { FasadVaderstreckId } from "@/components/underhallsplan/fastighets-ytor";
import {
  fasadVaderstreckLista,
  hamtaAktivaFasaderForHus,
  hamtaHusFasadRad,
  normaliseraFastighetsYtor,
} from "@/components/underhallsplan/fastighets-ytor";
import type { Grunduppgifter } from "@/components/underhallsplan/types";

export type FasadSidaMaterialPost = {
  id: string;
  husId: string;
  vaderstreck: FasadVaderstreckId;
  /** Deltyp-id från fasadmallen (puts, tegel, trä …). */
  materialId: string;
  /** Valfri kommentar, t.ex. del av fasad. */
  kommentar: string;
};

export type FasadSidaMaterialRegister = Record<string, FasadSidaMaterialPost[]>;

function skapaId(): string {
  return `fasad-sida-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function skapaTomFasadSidaMaterialPost(
  husId: string,
  vaderstreck: FasadVaderstreckId,
): FasadSidaMaterialPost {
  return {
    id: skapaId(),
    husId,
    vaderstreck,
    materialId: "",
    kommentar: "",
  };
}

export function normaliseraFasadSidaMaterialPoster(
  raw: FasadSidaMaterialPost[] | undefined,
): FasadSidaMaterialPost[] {
  if (!raw?.length) return [];
  const giltiga = new Set(fasadVaderstreckLista.map((l) => l.id));
  return raw.map((p, i) => ({
    id: p.id?.trim() || `fasad-sida-${i + 1}`,
    husId: p.husId?.trim() ?? "",
    vaderstreck: giltiga.has(p.vaderstreck) ? p.vaderstreck : "gata",
    materialId: p.materialId?.trim() ?? "",
    kommentar: p.kommentar?.trim() ?? "",
  }));
}

export function föreslaFasadSidorFranGrund(
  grund: Grunduppgifter,
): FasadSidaMaterialPost[] {
  const ytor = normaliseraFastighetsYtor(grund.fastighetsYtor);
  const poster: FasadSidaMaterialPost[] = [];
  for (const h of ytor.hus) {
    for (const vaderstreck of hamtaAktivaFasaderForHus(h)) {
      poster.push(skapaTomFasadSidaMaterialPost(h.id, vaderstreck));
    }
  }
  return poster;
}

export function fasadSidaEtikett(
  post: FasadSidaMaterialPost,
  grund: Grunduppgifter,
  materialEtikett: (id: string) => string,
): string {
  const ytor = normaliseraFastighetsYtor(grund.fastighetsYtor);
  const hus = ytor.hus.find((h) => h.id === post.husId);
  const lage =
    fasadVaderstreckLista.find((l) => l.id === post.vaderstreck)?.etikett ??
    post.vaderstreck;
  const husNamn = hus?.husnummer.trim();
  const mat = post.materialId ? materialEtikett(post.materialId) : "";
  const kvm = hamtaHusFasadRad(ytor, post.husId)[post.vaderstreck]?.trim();
  const delar = [
    husNamn && ytor.hus.length > 1 ? `${husNamn} · ${lage}` : lage,
    mat,
    kvm ? `${kvm} m²` : "",
    post.kommentar,
  ].filter(Boolean);
  return delar.join(" — ");
}

export function formateraFasadSidorMaterial(
  poster: FasadSidaMaterialPost[],
  grund: Grunduppgifter,
  materialEtikett: (id: string) => string,
): string {
  const norm = normaliseraFasadSidaMaterialPoster(poster).filter(
    (p) => p.materialId || p.kommentar,
  );
  if (norm.length === 0) return "";
  const rader = norm
    .slice(0, 4)
    .map((p) => fasadSidaEtikett(p, grund, materialEtikett));
  const fler = norm.length > 4 ? ` (+${norm.length - 4})` : "";
  return rader.join(", ") + fler;
}

export function unikaMaterialFranSidor(
  poster: FasadSidaMaterialPost[],
): string[] {
  return [
    ...new Set(
      normaliseraFasadSidaMaterialPoster(poster)
        .map((p) => p.materialId)
        .filter(Boolean),
    ),
  ];
}
