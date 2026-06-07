import {
  formatSummeringTal,
  formateraSummeringRader,
  parseNummerSumma,
  type ListaSummeringRad,
} from "@/components/underhallsplan/lista-summering";

export const VARMESTAMMAR_UNDERKOMPONENT_ID = "varmestammar";

export type VarmestamPost = {
  id: string;
  /** T.ex. Stam A, Trapphus 1 */
  namn: string;
  vertikalLopmeter: string;
  horisontellLopmeter: string;
};

export function skapaVarmestamPostId(): string {
  return `varmestam-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function skapaTomVarmestamPost(namn = ""): VarmestamPost {
  return {
    id: skapaVarmestamPostId(),
    namn,
    vertikalLopmeter: "",
    horisontellLopmeter: "",
  };
}

export function normaliseraVarmestamPost(post: VarmestamPost): VarmestamPost {
  return {
    ...post,
    namn: post.namn.trim(),
    vertikalLopmeter: post.vertikalLopmeter.trim(),
    horisontellLopmeter: post.horisontellLopmeter.trim(),
  };
}

export function formateraVarmestamPost(post: VarmestamPost): string {
  const p = normaliseraVarmestamPost(post);
  const rubrik = p.namn || "Värmestam";
  const delar: string[] = [];
  if (p.vertikalLopmeter) {
    delar.push(`vertikal ${p.vertikalLopmeter} m`);
  }
  if (p.horisontellLopmeter) {
    delar.push(`horisontell ${p.horisontellLopmeter} m`);
  }
  return delar.length > 0 ? `${rubrik}: ${delar.join(", ")}` : rubrik;
}

export function summeraVarmestamPoster(poster: VarmestamPost[]): ListaSummeringRad[] {
  if (poster.length === 0) return [];

  const rader: ListaSummeringRad[] = [
    { etikett: "Antal värmestammar", varde: `${poster.length} st` },
  ];

  const vertikal = parseNummerSumma(
    poster.map((p) => normaliseraVarmestamPost(p).vertikalLopmeter),
  );
  if (vertikal > 0) {
    rader.push({
      etikett: "Vertikal ledning totalt",
      varde: `${formatSummeringTal(vertikal)} m`,
    });
  }

  const horisontell = parseNummerSumma(
    poster.map((p) => normaliseraVarmestamPost(p).horisontellLopmeter),
  );
  if (horisontell > 0) {
    rader.push({
      etikett: "Horisontell ledning totalt",
      varde: `${formatSummeringTal(horisontell)} m`,
    });
  }

  return rader;
}

export function formateraVarmestamPoster(poster: VarmestamPost[]): string {
  const normaliserade = poster.map(normaliseraVarmestamPost);
  const texter = normaliserade
    .map(formateraVarmestamPost)
    .filter((t) => t && !t.match(/^Värmestam$/));
  if (texter.length > 0) return texter.join(" · ");

  const summering = summeraVarmestamPoster(normaliserade);
  return formateraSummeringRader(summering);
}
