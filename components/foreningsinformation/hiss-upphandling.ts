import { kategoriId } from "@/components/upphandling/kategorier";
import {
  lasUpphandlingLager,
  loggaHandelse,
  sparaUpphandlingLager,
  uppdateraKategoriMeta,
} from "@/components/upphandling/upphandling-lager";
import {
  HISS_UNDERKOMPONENT_ID,
  formateraHissPost,
  hissTyper,
  type HissPost,
  type HissTypId,
} from "@/components/underhallsplan/hissar";
import { lasUnderhallsplanState } from "@/components/underhallsplan/underhallsplan-lager";
import { hamtaSynkadPlanGrund } from "@/lib/forening-grund-synk";
import { foreningStorageKey } from "@/lib/foreningStorage";
import {
  localStorageFelMeddelande,
  safeSetLocalStorage,
} from "@/lib/localStorage";
import {
  formateraBankIdSignatur,
  harTillrackligaBankIdSignaturer,
  laggTillBankIdSignatur,
  type BankIdSignatur,
} from "@/lib/bankid-signering";
import {
  formateraStyrelseKontaktBlock,
  hamtaAvtalssignerare,
  hamtaStyrelseKontakt,
} from "@/lib/styrelse-kontakt";

export type HissUpphandlingsSlag = "service" | "reparation" | "ny-hiss";

export type HissBildSlag = "id-bricka" | "maskinrum";

export type HissUpphandling = {
  id: HissUpphandlingsSlag;
  kategoriNamn: string;
  rubrik: string;
  omfattning: string;
};

export const hissUpphandlingar: HissUpphandling[] = [
  {
    id: "service",
    kategoriNamn: "Hiss service",
    rubrik: "Hiss service",
    omfattning:
      "Löpande service av föreningens hissar, inklusive serviceintervall, akut felavhjälpande, felrapport och förslag när en komponent närmar sig slutet av sin tekniska livslängd.",
  },
  {
    id: "reparation",
    kategoriNamn: "Hissreparation",
    rubrik: "Hissreparation",
    omfattning:
      "Reparation enligt bifogad felrapport. Utbytta delar lämnas till beställaren. Material redovisas med fakturakopia.",
  },
  {
    id: "ny-hiss",
    kategoriNamn: "Ny hiss",
    rubrik: "Ny hiss",
    omfattning:
      "Byte till ny hiss, inklusive demontering av befintlig hiss. Befintlig id-bricka och hissmaskinrum framgår av bilderna.",
  },
];

export function hissUpphandling(id: HissUpphandlingsSlag): HissUpphandling {
  const hittad = hissUpphandlingar.find((rad) => rad.id === id);
  if (!hittad) throw new Error(`Okänd hissupphandling: ${id}`);
  return hittad;
}

export function hissUpphandlingForKategori(
  kategoriNamn: string,
): HissUpphandling | undefined {
  return hissUpphandlingar.find((rad) => rad.kategoriNamn === kategoriNamn);
}

export const ABT_06_RUBRIK =
  "Allmänna bestämmelser för totalentreprenader avseende byggnads-, anläggnings- och installationsarbeten, ABT-06";

export const STANDARD_AKUTRUTIN = [
  "Akut felavhjälpande",
  "1. Felet anmäls till entreprenörens jour.",
  "2. Entreprenören åtgärdar felet och upprättar en felrapport.",
  "3. Material som gått åt redovisas med kopia av materialfakturan. Kopian sparas i Styrning och Dokument under Hiss och knyts till felrapporten.",
  "4. Utbytta delar lämnas till beställaren.",
  "5. Om en komponent är i slutet av sin tekniska livslängd ska felrapporten innehålla ett förslag på åtgärd.",
].join("\n");

export type HissBild = {
  id: string;
  slag: HissBildSlag;
  hissNamn: string;
  filnamn: string;
  dataUrl: string;
};

export type Materialfaktura = {
  id: string;
  datum: string;
  beskrivning: string;
  beloppKr: string;
  filnamn: string;
};

export type FelrapportRad = {
  id: string;
  hissNamn: string;
  komponent: string;
  installationsAr: string;
  livslangdAr: number;
  forslag: string;
};

export type BestallningStatus = "vantar_foretag" | "foretag_signerat" | "godkant";

export type HissBestallning = {
  id: string;
  entreprenorNamn: string;
  entreprenorEpost: string;
  prisKr: string;
  omfattning: string;
  text: string;
  skapad: string;
  status: BestallningStatus;
  foretagSignaturer: BankIdSignatur[];
  foreningSignaturer: BankIdSignatur[];
};

export type HissHandling = {
  id: string;
  typ: "underlag" | "anbudsformular" | "bestallning" | "arkiv" | "felrapport";
  titel: string;
  text: string;
  skapad: string;
};

export type HissUpphandlingPost = {
  upphandlingSkapad?: string;
  underlagText?: string;
  anbudsformularText?: string;
  bestallning?: HissBestallning;
  arkiv: HissHandling[];
};

export type HissUpphandlingLager = {
  version: 1;
  bilder: HissBild[];
  materialfakturor: Materialfaktura[];
  felrapportRader: FelrapportRad[];
  felrapportText: string;
  akutrutin: string;
  onskatServiceintervall: string;
  poster: Record<HissUpphandlingsSlag, HissUpphandlingPost>;
};

const STORAGE_KEY_BASE = "brf-hiss-upphandling";
export const HISS_UPPHANDLING_EVENT = "brf-hiss-upphandling-uppdaterad";

function tomPost(): HissUpphandlingPost {
  return { arkiv: [] };
}

function tomLager(): HissUpphandlingLager {
  return {
    version: 1,
    bilder: [],
    materialfakturor: [],
    felrapportRader: [],
    felrapportText: "",
    akutrutin: STANDARD_AKUTRUTIN,
    onskatServiceintervall: "",
    poster: {
      service: tomPost(),
      reparation: tomPost(),
      "ny-hiss": tomPost(),
    },
  };
}

function arBild(value: unknown): value is HissBild {
  if (!value || typeof value !== "object") return false;
  const rad = value as Partial<HissBild>;
  return (
    typeof rad.id === "string" &&
    (rad.slag === "id-bricka" || rad.slag === "maskinrum") &&
    typeof rad.filnamn === "string"
  );
}

function normaliseraBestallning(raw: unknown): HissBestallning | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const rad = raw as Partial<HissBestallning>;
  if (typeof rad.id !== "string" || typeof rad.entreprenorNamn !== "string") return undefined;
  const status: BestallningStatus =
    rad.status === "godkant" || rad.status === "foretag_signerat"
      ? rad.status
      : "vantar_foretag";
  return {
    id: rad.id,
    entreprenorNamn: rad.entreprenorNamn,
    entreprenorEpost: typeof rad.entreprenorEpost === "string" ? rad.entreprenorEpost : "",
    prisKr: typeof rad.prisKr === "string" ? rad.prisKr : "",
    omfattning: typeof rad.omfattning === "string" ? rad.omfattning : "",
    text: typeof rad.text === "string" ? rad.text : "",
    skapad: typeof rad.skapad === "string" ? rad.skapad : "",
    status,
    foretagSignaturer: Array.isArray(rad.foretagSignaturer)
      ? rad.foretagSignaturer.filter(
          (s): s is BankIdSignatur => Boolean(s) && typeof (s as BankIdSignatur).namn === "string",
        )
      : [],
    foreningSignaturer: Array.isArray(rad.foreningSignaturer)
      ? rad.foreningSignaturer.filter(
          (s): s is BankIdSignatur => Boolean(s) && typeof (s as BankIdSignatur).namn === "string",
        )
      : [],
  };
}

function normaliseraPost(raw: unknown): HissUpphandlingPost {
  const tom = tomPost();
  if (!raw || typeof raw !== "object") return tom;
  const rad = raw as Partial<HissUpphandlingPost>;
  return {
    upphandlingSkapad: typeof rad.upphandlingSkapad === "string" ? rad.upphandlingSkapad : undefined,
    underlagText: typeof rad.underlagText === "string" ? rad.underlagText : undefined,
    anbudsformularText:
      typeof rad.anbudsformularText === "string" ? rad.anbudsformularText : undefined,
    bestallning: normaliseraBestallning(rad.bestallning),
    arkiv: Array.isArray(rad.arkiv)
      ? rad.arkiv.filter(
          (h): h is HissHandling =>
            Boolean(h) &&
            typeof (h as HissHandling).id === "string" &&
            typeof (h as HissHandling).text === "string",
        )
      : [],
  };
}

function normaliseraRad(raw: unknown): FelrapportRad | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const rad = raw as Partial<FelrapportRad>;
  if (typeof rad.id !== "string" || typeof rad.komponent !== "string") return undefined;
  return {
    id: rad.id,
    hissNamn: typeof rad.hissNamn === "string" ? rad.hissNamn : "",
    komponent: rad.komponent,
    installationsAr: typeof rad.installationsAr === "string" ? rad.installationsAr : "",
    livslangdAr: typeof rad.livslangdAr === "number" ? rad.livslangdAr : 40,
    forslag: typeof rad.forslag === "string" ? rad.forslag : "",
  };
}

export function lasHissUpphandling(): HissUpphandlingLager {
  if (typeof window === "undefined") return tomLager();
  try {
    const raw = localStorage.getItem(foreningStorageKey(STORAGE_KEY_BASE));
    if (!raw) return tomLager();
    const parsed = JSON.parse(raw) as Partial<HissUpphandlingLager>;
    return {
      version: 1,
      bilder: Array.isArray(parsed.bilder)
        ? parsed.bilder.filter(arBild).map((bild) => ({
            ...bild,
            hissNamn: typeof bild.hissNamn === "string" ? bild.hissNamn : "",
            dataUrl: typeof bild.dataUrl === "string" ? bild.dataUrl : "",
          }))
        : [],
      materialfakturor: Array.isArray(parsed.materialfakturor)
        ? parsed.materialfakturor.flatMap((rad) => {
            if (!rad || typeof rad !== "object" || typeof (rad as Materialfaktura).id !== "string") {
              return [];
            }
            const faktura = rad as Partial<Materialfaktura>;
            return [
              {
                id: faktura.id as string,
                datum: typeof faktura.datum === "string" ? faktura.datum : "",
                beskrivning: typeof faktura.beskrivning === "string" ? faktura.beskrivning : "",
                beloppKr: typeof faktura.beloppKr === "string" ? faktura.beloppKr : "",
                filnamn: typeof faktura.filnamn === "string" ? faktura.filnamn : "",
              },
            ];
          })
        : [],
      felrapportRader: Array.isArray(parsed.felrapportRader)
        ? parsed.felrapportRader.map(normaliseraRad).filter((rad): rad is FelrapportRad => Boolean(rad))
        : [],
      felrapportText: typeof parsed.felrapportText === "string" ? parsed.felrapportText : "",
      akutrutin:
        typeof parsed.akutrutin === "string" && parsed.akutrutin.trim()
          ? parsed.akutrutin
          : STANDARD_AKUTRUTIN,
      onskatServiceintervall:
        typeof parsed.onskatServiceintervall === "string" ? parsed.onskatServiceintervall : "",
      poster: {
        service: normaliseraPost(parsed.poster?.service),
        reparation: normaliseraPost(parsed.poster?.reparation),
        "ny-hiss": normaliseraPost(parsed.poster?.["ny-hiss"]),
      },
    };
  } catch {
    return tomLager();
  }
}

function sparaLager(
  lager: HissUpphandlingLager,
): { ok: true } | { ok: false; fel: string } {
  const resultat = safeSetLocalStorage(
    foreningStorageKey(STORAGE_KEY_BASE),
    JSON.stringify(lager),
  );
  if (!resultat.ok) return { ok: false, fel: localStorageFelMeddelande(resultat.error) };
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(HISS_UPPHANDLING_EVENT));
  }
  return { ok: true };
}

export function antalHissHandlingar(): number {
  const lager = lasHissUpphandling();
  let antal = lager.bilder.length + lager.materialfakturor.length;
  if (lager.felrapportText.trim() || lager.felrapportRader.length > 0) antal += 1;
  for (const post of Object.values(lager.poster)) {
    if (post.underlagText) antal += 1;
    if (post.anbudsformularText) antal += 1;
    if (post.bestallning?.text) antal += 1;
    antal += post.arkiv.length;
  }
  return antal;
}

export type RegistreradHiss = {
  namn: string;
  beskrivning: string;
  hissTyp: HissTypId;
};

export function hamtaRegistreradeHissar(): RegistreradHiss[] {
  if (typeof window === "undefined") return [];
  const plan = lasUnderhallsplanState();
  const trapphus = plan?.komponentDetaljer?.Trapphus;
  const poster = trapphus?.hissRegister?.[HISS_UNDERKOMPONENT_ID] ?? [];
  const egna = trapphus?.egnaHissMarken ?? [];
  return poster.map((post: HissPost) => ({
    namn: post.namn.trim() || "Hiss",
    beskrivning: formateraHissPost(post, egna),
    hissTyp: post.hissTyp,
  }));
}

function livslangdForTyp(typ: HissTypId): number {
  return typ === "hydraul" ? 30 : 40;
}

export function livslangdStatus(
  installationsAr: string,
  livslangdAr: number,
  nuAr = new Date().getFullYear(),
): "ok" | "nara-slut" | "passerad" | "okand" {
  const ar = Number(installationsAr);
  if (!Number.isFinite(ar) || ar < 1800 || ar > nuAr + 1) return "okand";
  const kvar = livslangdAr - (nuAr - ar);
  if (kvar <= 0) return "passerad";
  if (kvar <= 5) return "nara-slut";
  return "ok";
}

export function skapaFelrapportFranRegister(): FelrapportRad[] {
  const grund = hamtaSynkadPlanGrund();
  const byggar = grund?.byggar.trim() ?? "";
  const hissar = hamtaRegistreradeHissar();
  const underlag = hissar.length > 0 ? hissar : [{ namn: "Hiss 1", beskrivning: "Hiss", hissTyp: "motvikt" as const }];
  const rader: FelrapportRad[] = [];
  for (const hiss of underlag) {
    const delar = [
      { komponent: `Hiss i sin helhet (${hissTyper.find((t) => t.id === hiss.hissTyp)?.etikett ?? "hiss"})`, ar: livslangdForTyp(hiss.hissTyp) },
      { komponent: "Styrsystem", ar: 25 },
      { komponent: "Dörrar och korg", ar: 25 },
    ];
    for (const del of delar) {
      const status = livslangdStatus(byggar, del.ar);
      rader.push({
        id: `fel-${hiss.namn}-${del.komponent}`.replace(/\s+/g, "-").toLowerCase(),
        hissNamn: hiss.namn,
        komponent: del.komponent,
        installationsAr: byggar,
        livslangdAr: del.ar,
        forslag:
          status === "passerad"
            ? "Teknisk livslängd är passerad enligt riktvärdet. Föreslå byte eller modernisering."
            : status === "nara-slut"
              ? "Närmar sig slutet av teknisk livslängd. Föreslå åtgärd och tidplan."
              : "",
      });
    }
  }
  return rader;
}

export function sparaFelrapport(
  rader: FelrapportRad[],
  text: string,
): { ok: true } | { ok: false; fel: string } {
  const lager = lasHissUpphandling();
  lager.felrapportRader = rader;
  lager.felrapportText = text;
  return sparaLager(lager);
}

export function sparaAkutrutin(
  text: string,
  intervall: string,
): { ok: true } | { ok: false; fel: string } {
  const lager = lasHissUpphandling();
  lager.akutrutin = text.trim() || STANDARD_AKUTRUTIN;
  lager.onskatServiceintervall = intervall.trim();
  return sparaLager(lager);
}

export function laggTillHissBild(
  bild: Omit<HissBild, "id">,
): { ok: true } | { ok: false; fel: string } {
  if (!bild.filnamn.trim()) return { ok: false, fel: "Bilden saknar filnamn." };
  const lager = lasHissUpphandling();
  lager.bilder = [
    ...lager.bilder,
    { ...bild, id: `bild-${Date.now()}-${Math.random().toString(36).slice(2, 5)}` },
  ];
  return sparaLager(lager);
}

export function taBortHissBild(id: string): void {
  const lager = lasHissUpphandling();
  lager.bilder = lager.bilder.filter((bild) => bild.id !== id);
  sparaLager(lager);
}

export function laggTillMaterialfaktura(input: {
  datum: string;
  beskrivning: string;
  beloppKr: string;
  filnamn: string;
}): { ok: true } | { ok: false; fel: string } {
  if (!input.beskrivning.trim() && !input.filnamn.trim()) {
    return { ok: false, fel: "Ange vad fakturan avser, eller ett filnamn." };
  }
  const lager = lasHissUpphandling();
  lager.materialfakturor = [
    ...lager.materialfakturor,
    {
      id: `fakt-${Date.now()}`,
      datum: input.datum.trim(),
      beskrivning: input.beskrivning.trim(),
      beloppKr: input.beloppKr.trim(),
      filnamn: input.filnamn.trim(),
    },
  ];
  return sparaLager(lager);
}

export function taBortMaterialfaktura(id: string): void {
  const lager = lasHissUpphandling();
  lager.materialfakturor = lager.materialfakturor.filter((rad) => rad.id !== id);
  sparaLager(lager);
}

function bilderAv(lager: HissUpphandlingLager, slag: HissBildSlag): HissBild[] {
  return lager.bilder.filter((bild) => bild.slag === slag);
}

function formateraBilder(lager: HissUpphandlingLager): string {
  if (lager.bilder.length === 0) {
    return "Inga bilder är sparade. Id-bricka och hissmaskinrum ska bifogas innan service eller ny hiss upphandlas.";
  }
  return lager.bilder
    .map(
      (bild, index) =>
        `${index + 1}. ${bild.slag === "id-bricka" ? "Id-bricka" : "Hissmaskinrum"}${bild.hissNamn ? ` (${bild.hissNamn})` : ""} — ${bild.filnamn}`,
    )
    .join("\n");
}

function formateraFelrapport(lager: HissUpphandlingLager): string {
  const rader = lager.felrapportRader.map((rad) => {
    const status = livslangdStatus(rad.installationsAr, rad.livslangdAr);
    const lage =
      status === "passerad"
        ? "passerat teknisk livslängd"
        : status === "nara-slut"
          ? "nära slutet av teknisk livslängd"
          : status === "ok"
            ? "inom teknisk livslängd"
            : "installationsår saknas";
    return [
      `${rad.hissNamn}: ${rad.komponent}`,
      rad.installationsAr ? `installationsår ${rad.installationsAr}` : "",
      `riktvärde ${rad.livslangdAr} år`,
      lage,
      rad.forslag ? `förslag: ${rad.forslag}` : "",
    ]
      .filter(Boolean)
      .join(" — ");
  });
  const delar = [
    lager.felrapportText.trim(),
    rader.length > 0 ? rader.join("\n") : "",
  ].filter(Boolean);
  if (delar.length === 0) {
    return "Ingen felrapport är upprättad ännu. Entreprenören ska upprätta felrapport och lämna förslag på åtgärd där en komponent är i slutet av sin tekniska livslängd.";
  }
  return delar.join("\n\n");
}

function formateraFakturor(lager: HissUpphandlingLager): string {
  if (lager.materialfakturor.length === 0) {
    return "Inga materialfakturor är registrerade ännu. Vid akut felavhjälpande ska kopia av materialfakturan lämnas till föreningen och sparas här.";
  }
  return lager.materialfakturor
    .map((rad, index) =>
      [
        `${index + 1}.`,
        rad.datum,
        rad.beskrivning,
        rad.beloppKr ? `${rad.beloppKr} kr` : "",
        rad.filnamn ? `kopia: ${rad.filnamn}` : "",
      ]
        .filter(Boolean)
        .join(" "),
    )
    .join("\n");
}

function formateraFastighet(): string {
  const kontakt = hamtaStyrelseKontakt();
  const grund = hamtaSynkadPlanGrund();
  const rader = [formateraStyrelseKontaktBlock(kontakt).trimEnd()];
  const hissar = hamtaRegistreradeHissar();
  if (hissar.length > 0) {
    rader.push(`Hissar i registret: ${hissar.map((hiss) => hiss.beskrivning).join("; ")}`);
  }
  if (!grund) return rader.join("\n");
  const adresser = grund.adresser.map((adress) => adress.trim()).filter(Boolean);
  if (adresser.length > 0) rader.push(`Adresser: ${adresser.join(", ")}`);
  if (grund.fastighetsbeteckning.trim()) rader.push(`Fastighetsbeteckning: ${grund.fastighetsbeteckning.trim()}`);
  if (grund.byggar.trim()) rader.push(`Byggår: ${grund.byggar.trim()}`);
  if (grund.antalVaningar.trim()) rader.push(`Antal våningar: ${grund.antalVaningar.trim()}`);
  const plan = lasUnderhallsplanState();
  const hissBesiktning = plan?.besiktningar.find((rad) => rad.id === "hiss");
  if (hissBesiktning?.senastUtförtAr) {
    rader.push(`Senaste hissbesiktning enligt underhållsplanen: ${hissBesiktning.senastUtförtAr}`);
  }
  return rader.join("\n");
}

function signerRad(): string {
  const signerare = hamtaAvtalssignerare();
  if (signerare.length === 0) {
    return "Inte angiven — markera avtalsundertecknare under föreningens uppgifter.";
  }
  return signerare.map((person) => `${person.namn} (${person.roll})`).join(", ");
}

function prisRader(lager: HissUpphandlingLager, slag: HissUpphandlingsSlag): string[] {
  const intervall = lager.onskatServiceintervall.trim() || "anges av anbudsgivaren";
  if (slag === "ny-hiss") {
    return [
      "Anbudssumma ny hiss, enligt ABT-06 (kr):",
      "Tid för färdigställande:",
      "Timpris ordinarie arbetstid för ändrings- och tilläggsarbete (kr/tim):",
      "Timpris jour (kr/tim):",
      "Bilkostnad (kr/tillfälle eller kr/mil):",
    ];
  }
  if (slag === "reparation") {
    return [
      "Pris för reparationen enligt bifogad felrapport (kr):",
      "Timpris ordinarie arbetstid (kr/tim):",
      "Timpris jour (kr/tim):",
      "Bilkostnad (kr/tillfälle eller kr/mil):",
    ];
  }
  return [
    `Serviceintervall: ${intervall}`,
    "Pris per serviceintervall (kr, ange vad som ingår):",
    "Timpris ordinarie arbetstid för utfört arbete utöver service (kr/tim):",
    "Timpris jour (kr/tim):",
    "Bilkostnad (kr/tillfälle eller kr/mil):",
  ];
}

function sarskildaVillkor(): string[] {
  return [
    "Utbytta delar lämnas till beställaren.",
    "Akut felavhjälpande redovisas med kopia av materialfaktura. Kopian sparas hos föreningen och knyts till felrapporten.",
    "Felrapport upprättas. För komponenter i slutet av teknisk livslängd lämnas förslag på åtgärd.",
    "Anbudet lämnas på det här formuläret och är knutet till ABT-06.",
  ];
}

export function genereraHissUnderlagText(slag: HissUpphandlingsSlag): string {
  const uppdrag = hissUpphandling(slag);
  const lager = lasHissUpphandling();
  return [
    `FÖRFRÅGNINGSUNDERLAG — ${uppdrag.rubrik}`,
    "",
    ABT_06_RUBRIK + " gäller för uppdraget.",
    "",
    "Föreningens uppgifter är hämtade från föreningens grunduppgifter.",
    formateraFastighet(),
    "",
    "Uppdrag",
    uppdrag.omfattning,
    "",
    "Bilder — id-bricka och hissmaskinrum",
    formateraBilder(lager),
    "",
    "Felrapport och förslag på åtgärd",
    formateraFelrapport(lager),
    "",
    "Rutin för akut felavhjälpande",
    lager.akutrutin.trim() || STANDARD_AKUTRUTIN,
    "",
    "Redovisade materialfakturor",
    formateraFakturor(lager),
    "",
    "Särskilda villkor",
    ...sarskildaVillkor().map((rad) => `- ${rad}`),
    "",
    `Beställningen undertecknas för föreningen av: ${signerRad()}`,
    "Entreprenören signerar beställningen först. Därefter signerar föreningen. Handlingarna sparas i Styrning och Dokument.",
  ].join("\n");
}

export function genereraHissAnbudsformularText(slag: HissUpphandlingsSlag): string {
  const uppdrag = hissUpphandling(slag);
  const lager = lasHissUpphandling();
  return [
    `ANBUDSFORMULÄR ENLIGT ABT-06 — ${uppdrag.rubrik}`,
    "",
    `${ABT_06_RUBRIK} gäller för anbudet och den kommande beställningen.`,
    "Formuläret är upprättat utifrån föreningens uppgifter, bilder på id-bricka och hissmaskinrum samt felrapporten.",
    "Avvikelse från ABT-06 ska anges särskilt i anbudet.",
    "",
    formateraFastighet(),
    "",
    "Bifogat underlag",
    "Bilder:",
    formateraBilder(lager),
    "",
    "Felrapport:",
    formateraFelrapport(lager),
    "",
    lager.akutrutin.trim() || STANDARD_AKUTRUTIN,
    "",
    "Särskilda villkor",
    ...sarskildaVillkor().map((rad) => `- ${rad}`),
    "",
    "Prisuppgifter",
    ...prisRader(lager, slag),
    "",
    "Fyll i och skicka tillbaka:",
    "Företag:",
    "Organisationsnummer:",
    "Kontaktperson:",
    "E-post:",
    "Reservationer mot ABT-06 eller underlaget:",
    "",
    `Beställningen undertecknas för föreningen av: ${signerRad()}`,
    "Den entreprenör styrelsen väljer signerar beställningen först. Därefter signerar föreningen.",
  ].join("\n");
}

export function genereraHissBestallningText(
  slag: HissUpphandlingsSlag,
  bestallning: Pick<
    HissBestallning,
    | "entreprenorNamn"
    | "entreprenorEpost"
    | "prisKr"
    | "omfattning"
    | "foretagSignaturer"
    | "foreningSignaturer"
  >,
): string {
  const uppdrag = hissUpphandling(slag);
  const foretag =
    bestallning.foretagSignaturer.length > 0
      ? bestallning.foretagSignaturer.map(formateraBankIdSignatur).join("\n")
      : "Väntar på entreprenörens BankID-signatur.";
  const forening =
    bestallning.foreningSignaturer.length > 0
      ? bestallning.foreningSignaturer.map(formateraBankIdSignatur).join("\n")
      : "Väntar. Föreningen signerar efter att entreprenören har signerat.";
  return [
    `BESTÄLLNING ENLIGT ABT-06 — ${uppdrag.rubrik}`,
    "",
    `${ABT_06_RUBRIK} gäller för beställningen.`,
    "",
    formateraFastighet(),
    "",
    `Entreprenör: ${bestallning.entreprenorNamn}`,
    bestallning.entreprenorEpost ? `E-post: ${bestallning.entreprenorEpost}` : "",
    bestallning.prisKr ? `Pris: ${bestallning.prisKr} kr` : "Pris: enligt anbud",
    "",
    "Omfattning",
    bestallning.omfattning.trim() || uppdrag.omfattning,
    "",
    ...sarskildaVillkor().map((rad) => `- ${rad}`),
    "",
    "Entreprenören signerar först, med två personer via BankID. Därefter föreningen.",
    `Föreningens avtalsundertecknare: ${signerRad()}`,
    "",
    "Entreprenörens signaturer",
    foretag,
    "",
    "Föreningens signaturer",
    forening,
  ]
    .filter((rad) => rad !== "")
    .join("\n");
}

export function skapaHissUpphandling(
  slag: HissUpphandlingsSlag,
): { ok: true; titel: string } | { ok: false; fel: string } {
  const lager = lasHissUpphandling();
  const idBricka = bilderAv(lager, "id-bricka");
  const maskinrum = bilderAv(lager, "maskinrum");
  if ((slag === "service" || slag === "ny-hiss") && (idBricka.length === 0 || maskinrum.length === 0)) {
    return {
      ok: false,
      fel: "Lägg in bild på hissens id-bricka och från hissmaskinrummet innan upphandlingen skapas.",
    };
  }
  if (
    slag === "reparation" &&
    !lager.felrapportText.trim() &&
    lager.felrapportRader.length === 0
  ) {
    return {
      ok: false,
      fel: "Upprätta felrapporten först. Reparationen upphandlas enligt den.",
    };
  }
  const uppdrag = hissUpphandling(slag);
  const underlagText = genereraHissUnderlagText(slag);
  const anbudsformularText = genereraHissAnbudsformularText(slag);
  const post = lager.poster[slag];
  post.upphandlingSkapad = new Date().toISOString();
  post.underlagText = underlagText;
  post.anbudsformularText = anbudsformularText;
  const sparat = sparaLager(lager);
  if (!sparat.ok) return sparat;

  const kontakt = hamtaStyrelseKontakt();
  const key = kategoriId(uppdrag.kategoriNamn);
  const titel = kontakt?.foreningsnamn
    ? `${kontakt.foreningsnamn} — ${uppdrag.rubrik}`
    : uppdrag.rubrik;
  let upphandling = lasUpphandlingLager();
  upphandling = uppdateraKategoriMeta(upphandling, key, {
    titel,
    ort: kontakt?.ort ?? "",
    förfrågningsunderlagKomplett: true,
  });
  upphandling = loggaHandelse(upphandling, {
    upphandlingId: key,
    typ: "underlag_komplett",
    av: hamtaAvtalssignerare()[0]?.namn || kontakt?.kontaktperson || "Styrelsen",
    beskrivning: `Upphandling skapad för ${uppdrag.rubrik} enligt ABT-06. Bilder, felrapport och anbudsformulär är flyttade hit från Styrning och Dokument.`,
  });
  sparaUpphandlingLager(upphandling);
  return { ok: true, titel };
}

export function skapaHissBestallning(
  slag: HissUpphandlingsSlag,
  input: {
    entreprenorNamn: string;
    entreprenorEpost: string;
    prisKr: string;
    omfattning: string;
  },
): { ok: true } | { ok: false; fel: string } {
  const namn = input.entreprenorNamn.trim();
  if (!namn) return { ok: false, fel: "Ange den entreprenör som vann anbudet." };
  const lager = lasHissUpphandling();
  const post = lager.poster[slag];
  if (!post.upphandlingSkapad) {
    return { ok: false, fel: "Skapa upphandlingen först." };
  }
  if (post.bestallning && post.bestallning.status !== "vantar_foretag") {
    post.arkiv = [
      ...post.arkiv,
      {
        id: post.bestallning.id,
        typ: "arkiv",
        titel: `Beställning ${post.bestallning.entreprenorNamn}`,
        text: post.bestallning.text,
        skapad: post.bestallning.skapad,
      },
    ];
  }
  const utkast: HissBestallning = {
    id: `best-${slag}-${Date.now()}`,
    entreprenorNamn: namn,
    entreprenorEpost: input.entreprenorEpost.trim(),
    prisKr: input.prisKr.trim(),
    omfattning: input.omfattning.trim(),
    text: "",
    skapad: new Date().toISOString(),
    status: "vantar_foretag",
    foretagSignaturer: [],
    foreningSignaturer: [],
  };
  utkast.text = genereraHissBestallningText(slag, utkast);
  post.bestallning = utkast;
  return sparaLager(lager);
}

export function signeraHissBestallning(
  slag: HissUpphandlingsSlag,
  signatur: BankIdSignatur,
): { ok: true } | { ok: false; fel: string } {
  const lager = lasHissUpphandling();
  const bestallning = lager.poster[slag].bestallning;
  if (!bestallning) return { ok: false, fel: "Skapa beställningen först." };
  if (signatur.part === "forening" && !harTillrackligaBankIdSignaturer(bestallning.foretagSignaturer)) {
    return { ok: false, fel: "Entreprenören ska signera beställningen först." };
  }
  if (signatur.part !== "foretag" && signatur.part !== "forening") {
    return { ok: false, fel: "Beställningen signeras av entreprenören och föreningen." };
  }
  const tillagda = laggTillBankIdSignatur(
    signatur.part === "foretag" ? bestallning.foretagSignaturer : bestallning.foreningSignaturer,
    signatur,
  );
  if (!tillagda.ok) return tillagda;
  if (signatur.part === "foretag") bestallning.foretagSignaturer = tillagda.signaturer;
  else bestallning.foreningSignaturer = tillagda.signaturer;
  if (harTillrackligaBankIdSignaturer(bestallning.foreningSignaturer)) {
    bestallning.status = "godkant";
  } else if (harTillrackligaBankIdSignaturer(bestallning.foretagSignaturer)) {
    bestallning.status = "foretag_signerat";
  }
  bestallning.text = genereraHissBestallningText(slag, bestallning);
  const sparat = sparaLager(lager);
  if (!sparat.ok) return sparat;

  const key = kategoriId(hissUpphandling(slag).kategoriNamn);
  const klar = bestallning.status === "godkant";
  let upphandling = lasUpphandlingLager();
  upphandling = loggaHandelse(upphandling, {
    upphandlingId: key,
    typ:
      signatur.part === "foretag"
        ? "avtal_foretag_signatur"
        : klar
          ? "avtal_tecknat"
          : "avtal_forening_signatur",
    av: signatur.namn,
    beskrivning: klar
      ? `Beställningen för ${hissUpphandling(slag).rubrik} är signerad och sparad i Styrning och Dokument.`
      : `${signatur.namn} signerade beställningen för ${hissUpphandling(slag).rubrik}.`,
  });
  sparaUpphandlingLager(upphandling);
  return { ok: true };
}

export function hissHandlingar(slag: HissUpphandlingsSlag): HissHandling[] {
  const post = lasHissUpphandling().poster[slag];
  const uppdrag = hissUpphandling(slag);
  const aktuella: HissHandling[] = [];
  if (post.underlagText && post.upphandlingSkapad) {
    aktuella.push({
      id: `${slag}-underlag`,
      typ: "underlag",
      titel: `Förfrågningsunderlag ${uppdrag.rubrik}`,
      text: post.underlagText,
      skapad: post.upphandlingSkapad,
    });
  }
  if (post.anbudsformularText && post.upphandlingSkapad) {
    aktuella.push({
      id: `${slag}-anbud`,
      typ: "anbudsformular",
      titel: `Anbudsformulär ABT-06 ${uppdrag.rubrik}`,
      text: post.anbudsformularText,
      skapad: post.upphandlingSkapad,
    });
  }
  if (post.bestallning?.text) {
    aktuella.push({
      id: post.bestallning.id,
      typ: "bestallning",
      titel: `Beställning ${post.bestallning.entreprenorNamn}`,
      text: post.bestallning.text,
      skapad: post.bestallning.skapad,
    });
  }
  return [...aktuella, ...post.arkiv];
}
