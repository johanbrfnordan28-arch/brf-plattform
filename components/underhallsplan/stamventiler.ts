import {
  formateraSummeringRader,
  type ListaSummeringRad,
} from "@/components/underhallsplan/lista-summering";

export const STAMVENTILER_UNDERKOMPONENT_ID = "stamventiler";

export type StamventilModellKategoriId = "injustering" | "styrning" | "ovrigt";

/** Vanliga ventiltyper på värmestammar och fördelning. */
export type StamventilModellId =
  | "ta-stad"
  | "ta-compact"
  | "imi-pn"
  | "heimeier-eclipse"
  | "heimeier-zenith"
  | "oventrop-hydrocontrol"
  | "oventrop-aquastrom"
  | "injustering-generisk"
  | "flodesregulator"
  | "styrventil-2vag"
  | "styrventil-3vag"
  | "styrventil-stalldon"
  | "styrventil-termisk"
  | "danfoss-avdo"
  | "reglerventil-stam"
  | "avstangningsventil"
  | "differentialtryck"
  | "returventil"
  | "avtappningsventil"
  | "danfoss-ra-n"
  | "annat";

export type StamventilStorlekId =
  | "dn15"
  | "dn20"
  | "dn25"
  | "dn32"
  | "dn40"
  | "dn50"
  | "g15"
  | "g20"
  | "annat";

export type StamventilPost = {
  id: string;
  modell: StamventilModellId;
  modellAnnanText: string;
  storlek: StamventilStorlekId;
  storlekAnnanText: string;
  /** T.ex. Stam A, etage 2 */
  plats: string;
  antal: string;
};

export type StamventilModellDef = {
  id: StamventilModellId;
  kategori: StamventilModellKategoriId;
  etikett: string;
  beskrivning: string;
};

export const stamventilModellKategorier: {
  id: StamventilModellKategoriId;
  etikett: string;
  beskrivning: string;
}[] = [
  {
    id: "injustering",
    etikett: "Injusteringsventil (flöde)",
    beskrivning:
      "Reglerar flödet i stam eller gren — balansering vid injustering (t.ex. TA-STAD).",
  },
  {
    id: "styrning",
    etikett: "Styrventil (temperatur)",
    beskrivning:
      "Reglerar temperatur eller zon — ofta med ställdon, termostat eller shunt.",
  },
  {
    id: "ovrigt",
    etikett: "Övriga ventiler",
    beskrivning: "Avstängning, retur, avtappning m.m.",
  },
];

export const stamventilModeller: StamventilModellDef[] = [
  {
    id: "ta-stad",
    kategori: "injustering",
    etikett: "TA-STAD",
    beskrivning:
      "Danfoss/IMI TA-STAD — vanlig injusteringsventil för flödesbalansering.",
  },
  {
    id: "ta-compact",
    kategori: "injustering",
    etikett: "TA-Compact",
    beskrivning: "Kompakt injusteringsventil — ofta i trånga stamskåp.",
  },
  {
    id: "imi-pn",
    kategori: "injustering",
    etikett: "IMI TA / PN (tryckoberoende)",
    beskrivning: "Tryckoberoende injusteringsventil — nyare stamcentraler.",
  },
  {
    id: "heimeier-eclipse",
    kategori: "injustering",
    etikett: "Heimeier Eclipse",
    beskrivning: "Förinställningsventil — injustering av flöde per gren.",
  },
  {
    id: "heimeier-zenith",
    kategori: "injustering",
    etikett: "Heimeier Zenith",
    beskrivning: "Tryckoberoende injusteringsventil från Heimeier.",
  },
  {
    id: "oventrop-hydrocontrol",
    kategori: "injustering",
    etikett: "Oventrop Hydrocontrol",
    beskrivning: "Injusterings- och reglerventil för flödesbalansering.",
  },
  {
    id: "oventrop-aquastrom",
    kategori: "injustering",
    etikett: "Oventrop Aquastrom",
    beskrivning: "Injusteringsventil med avstängning — vanlig på stammar.",
  },
  {
    id: "injustering-generisk",
    kategori: "injustering",
    etikett: "Injusteringsventil (övrig)",
    beskrivning: "Manuell injusteringsventil utan angiven modellserie.",
  },
  {
    id: "flodesregulator",
    kategori: "injustering",
    etikett: "Flödesregulator",
    beskrivning: "Reglerar flöde per stam eller zon — manuell eller fast.",
  },
  {
    id: "styrventil-2vag",
    kategori: "styrning",
    etikett: "2-vägs styrventil",
    beskrivning: "Styr temperatur/flöde i en gren — vanlig vid shunt eller zon.",
  },
  {
    id: "styrventil-3vag",
    kategori: "styrning",
    etikett: "3-vägs styrventil",
    beskrivning: "Blandnings- eller fördelningsventil — t.ex. shuntgrupp.",
  },
  {
    id: "styrventil-stalldon",
    kategori: "styrning",
    etikett: "Styrventil med ställdon",
    beskrivning: "Motoriserad ventil (el/ställdon) — temperaturstyrning per stam.",
  },
  {
    id: "styrventil-termisk",
    kategori: "styrning",
    etikett: "Termisk styrventil",
    beskrivning: "Styrventil med termostat eller kapillärrör — utan el.",
  },
  {
    id: "danfoss-avdo",
    kategori: "styrning",
    etikett: "Danfoss AVDO / AVDV",
    beskrivning: "Zonstyrventil med ställdon — vanlig i undercentraler.",
  },
  {
    id: "reglerventil-stam",
    kategori: "styrning",
    etikett: "Reglerventil stam (övrig)",
    beskrivning: "Temperatur- eller zonreglerande ventil utan angiven serie.",
  },
  {
    id: "avstangningsventil",
    kategori: "ovrigt",
    etikett: "Avstängningsventil",
    beskrivning: "Avstängning på stam eller gren — kulventil eller kulhane.",
  },
  {
    id: "differentialtryck",
    kategori: "ovrigt",
    etikett: "Differentialtrycksventil",
    beskrivning: "Håller jämnt tryck i stam eller grensystem.",
  },
  {
    id: "returventil",
    kategori: "ovrigt",
    etikett: "Returventil / backventil",
    beskrivning: "Förhindrar tillbaka flöde i retur eller cirkulation.",
  },
  {
    id: "avtappningsventil",
    kategori: "ovrigt",
    etikett: "Avtappningsventil",
    beskrivning: "Tömning eller provtagning på stam — ofta med kopp.",
  },
  {
    id: "danfoss-ra-n",
    kategori: "ovrigt",
    etikett: "Danfoss RA-N (radiatorventil)",
    beskrivning: "Radiatorventil vid stamanslutning — förinställning per element.",
  },
  {
    id: "annat",
    kategori: "ovrigt",
    etikett: "Annan modell…",
    beskrivning: "Ange fabrikat och typbeteckning manuellt.",
  },
];

export const stamventilStorlekar: {
  id: StamventilStorlekId;
  etikett: string;
}[] = [
  { id: "dn15", etikett: "DN15" },
  { id: "dn20", etikett: "DN20" },
  { id: "dn25", etikett: "DN25" },
  { id: "dn32", etikett: "DN32" },
  { id: "dn40", etikett: "DN40" },
  { id: "dn50", etikett: "DN50" },
  { id: "g15", etikett: 'G½" (ca DN15)' },
  { id: "g20", etikett: 'G¾" (ca DN20)' },
  { id: "annat", etikett: "Annan storlek…" },
];

export function stamventilModellerPerKategori(
  kategori: StamventilModellKategoriId,
): StamventilModellDef[] {
  return stamventilModeller.filter((m) => m.kategori === kategori);
}

export function hamtaStamventilModellDef(
  id: StamventilModellId,
): StamventilModellDef | undefined {
  return stamventilModeller.find((m) => m.id === id);
}

export function skapaStamventilPostId(): string {
  return `stamventil-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function skapaTomStamventilPost(
  modell: StamventilModellId = "ta-stad",
): StamventilPost {
  return {
    id: skapaStamventilPostId(),
    modell,
    modellAnnanText: "",
    storlek: "dn20",
    storlekAnnanText: "",
    plats: "",
    antal: "1",
  };
}

function parseAntal(antal: string): number {
  const n = Math.floor(Number(antal.replace(/\s/g, "").replace(",", ".")) || 0);
  return n > 0 ? n : 0;
}

export function stamventilModellEtikett(
  modell: StamventilModellId,
  modellAnnanText: string,
): string {
  if (modell === "annat") {
    const text = modellAnnanText.trim();
    return text || "Annan ventil";
  }
  return hamtaStamventilModellDef(modell)?.etikett ?? modell;
}

export function stamventilStorlekEtikett(
  storlek: StamventilStorlekId,
  storlekAnnanText: string,
): string {
  if (storlek === "annat") {
    const text = storlekAnnanText.trim();
    return text || "Annan storlek";
  }
  return stamventilStorlekar.find((s) => s.id === storlek)?.etikett ?? storlek;
}

export function normaliseraStamventilPost(post: StamventilPost): StamventilPost {
  const antal = parseAntal(post.antal);
  const kandModell = stamventilModeller.some((m) => m.id === post.modell);
  return {
    ...post,
    modell: kandModell ? post.modell : "annat",
    antal: antal > 0 ? String(antal) : "1",
    plats: post.plats.trim(),
    modellAnnanText: post.modell === "annat" ? post.modellAnnanText.trim() : "",
    storlekAnnanText: post.storlek === "annat" ? post.storlekAnnanText.trim() : "",
  };
}

export function formateraStamventilPost(post: StamventilPost): string {
  const p = normaliseraStamventilPost(post);
  const modell = stamventilModellEtikett(p.modell, p.modellAnnanText);
  const storlek = stamventilStorlekEtikett(p.storlek, p.storlekAnnanText);
  const antal = parseAntal(p.antal);
  const plats = p.plats.trim();
  const antalText = antal > 1 ? `${antal} st` : "1 st";
  const spec = `${modell}, ${storlek}`;
  if (plats) return `${spec} (${plats}): ${antalText}`;
  return `${spec}: ${antalText}`;
}

export function summeraStamventilPoster(poster: StamventilPost[]): ListaSummeringRad[] {
  if (poster.length === 0) return [];

  const normaliserade = poster.map(normaliseraStamventilPost);

  const rader: ListaSummeringRad[] = [
    {
      etikett: "Antal ventilrader",
      varde: `${normaliserade.length} st`,
    },
  ];

  const antalTot = normaliserade.reduce((s, p) => s + parseAntal(p.antal), 0);
  if (antalTot > 0) {
    rader.push({ etikett: "Ventiler totalt", varde: `${antalTot} st` });
  }

  for (const kategori of stamventilModellKategorier) {
    const antal = normaliserade
      .filter((p) => hamtaStamventilModellDef(p.modell)?.kategori === kategori.id)
      .reduce((s, p) => s + parseAntal(p.antal), 0);
    if (antal > 0) {
      rader.push({ etikett: kategori.etikett, varde: `${antal} st` });
    }
  }

  for (const modell of stamventilModeller) {
    if (modell.id === "annat") continue;
    const antal = normaliserade
      .filter((p) => p.modell === modell.id)
      .reduce((s, p) => s + parseAntal(p.antal), 0);
    if (antal > 0) {
      rader.push({ etikett: modell.etikett, varde: `${antal} st` });
    }
  }

  return rader;
}

export function formateraStamventilPoster(poster: StamventilPost[]): string {
  const texter = poster.map(formateraStamventilPost);
  if (texter.length > 0) return texter.join(" · ");
  return formateraSummeringRader(summeraStamventilPoster(poster));
}
