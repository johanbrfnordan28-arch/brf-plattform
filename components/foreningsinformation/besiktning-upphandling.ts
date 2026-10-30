import { kategoriId } from "@/components/upphandling/kategorier";
import {
  lasForenkladUpphandling,
  radonKraverAtgard,
} from "@/components/upphandling/forenklad-upphandling-lager";
import {
  lasUpphandlingLager,
  loggaHandelse,
  sparaUpphandlingLager,
  uppdateraKategoriMeta,
} from "@/components/upphandling/upphandling-lager";
import {
  OVK_INTERVALL_VERKSAMHET_AR,
  ovkIntervallBostadHint,
} from "@/components/underhallsplan/besiktningar";
import { lasUnderhallsplanState } from "@/components/underhallsplan/underhallsplan-lager";
import { hamtaSynkadPlanGrund } from "@/lib/forening-grund-synk";
import { foreningStorageKey } from "@/lib/foreningStorage";
import { safeSetLocalStorage } from "@/lib/localStorage";
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

export type BesiktningTjanstId = "ovk" | "energideklaration" | "radon";

export type BesiktningTjanst = {
  id: BesiktningTjanstId;
  /** Mapp-id i Styrning och Dokument. */
  mappId: string;
  /** Kategorinamn i upphandlingsmodulen. */
  kategoriNamn: string;
  rubrik: string;
  omfattning: string;
};

export const besiktningTjanster: BesiktningTjanst[] = [
  {
    id: "ovk",
    mappId: "ovk",
    kategoriNamn: "OVK",
    rubrik: "OVK-besiktning",
    omfattning:
      "Obligatorisk ventilationskontroll av föreningens ventilationssystem, inklusive protokoll till föreningen.",
  },
  {
    id: "energideklaration",
    mappId: "energideklaration",
    kategoriNamn: "Energideklaration",
    rubrik: "Energideklaration",
    omfattning:
      "Energideklaration för fastigheten, inklusive registrering och överlämning av deklarationen till föreningen.",
  },
  {
    id: "radon",
    mappId: "radon",
    kategoriNamn: "Radonmätning",
    rubrik: "Radonmätning",
    omfattning:
      "Radonmätning i bostäder enligt gällande metod, inklusive mätrapport med resultat i Bq/m³.",
  },
];

export function besiktningTjanst(id: BesiktningTjanstId): BesiktningTjanst {
  const hittad = besiktningTjanster.find((tjanst) => tjanst.id === id);
  if (!hittad) throw new Error(`Okänd besiktningstjänst: ${id}`);
  return hittad;
}

export function besiktningTjanstForMapp(
  mappId: string,
): BesiktningTjanst | undefined {
  return besiktningTjanster.find((tjanst) => tjanst.mappId === mappId);
}

export function besiktningTjanstForKategori(
  kategoriNamn: string,
): BesiktningTjanst | undefined {
  return besiktningTjanster.find((tjanst) => tjanst.kategoriNamn === kategoriNamn);
}

export type TidigareProtokoll = {
  id: string;
  /** plan = underhållsplan, forenklad = förenklad upphandling, egen = registrerad i mappen */
  kalla: "plan" | "forenklad" | "egen" | "uppladdad";
  datum: string;
  utforsAv: string;
  sammanfattning: string;
  filnamn?: string;
};

export type BestallningStatus = "vantar_foretag" | "foretag_signerat" | "godkant";

export type BesiktningBestallning = {
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

export type SparadHandling = {
  id: string;
  typ: "underlag" | "anbudsformular" | "bestallning" | "arkiv";
  titel: string;
  text: string;
  skapad: string;
};

export type BesiktningUpphandlingPost = {
  egnaProtokoll: TidigareProtokoll[];
  upphandlingSkapad?: string;
  underlagText?: string;
  anbudsformularText?: string;
  bestallning?: BesiktningBestallning;
  arkiv: SparadHandling[];
};

export type BesiktningUpphandlingLager = {
  version: 1;
  poster: Record<BesiktningTjanstId, BesiktningUpphandlingPost>;
};

const STORAGE_KEY_BASE = "brf-besiktning-upphandling";
export const BESIKTNING_UPPHANDLING_EVENT = "brf-besiktning-upphandling-uppdaterad";

function tomPost(): BesiktningUpphandlingPost {
  return { egnaProtokoll: [], arkiv: [] };
}

function tomLager(): BesiktningUpphandlingLager {
  return {
    version: 1,
    poster: {
      ovk: tomPost(),
      energideklaration: tomPost(),
      radon: tomPost(),
    },
  };
}

function arProtokoll(value: unknown): value is TidigareProtokoll {
  if (!value || typeof value !== "object") return false;
  const rad = value as Partial<TidigareProtokoll>;
  return (
    typeof rad.id === "string" &&
    typeof rad.datum === "string" &&
    typeof rad.sammanfattning === "string" &&
    (rad.kalla === "egen" || rad.kalla === "uppladdad")
  );
}

function normaliseraBestallning(
  raw: unknown,
): BesiktningBestallning | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const rad = raw as Partial<BesiktningBestallning>;
  if (typeof rad.id !== "string" || typeof rad.entreprenorNamn !== "string") {
    return undefined;
  }
  const status: BestallningStatus =
    rad.status === "godkant" || rad.status === "foretag_signerat"
      ? rad.status
      : "vantar_foretag";
  return {
    id: rad.id,
    entreprenorNamn: rad.entreprenorNamn,
    entreprenorEpost:
      typeof rad.entreprenorEpost === "string" ? rad.entreprenorEpost : "",
    prisKr: typeof rad.prisKr === "string" ? rad.prisKr : "",
    omfattning: typeof rad.omfattning === "string" ? rad.omfattning : "",
    text: typeof rad.text === "string" ? rad.text : "",
    skapad: typeof rad.skapad === "string" ? rad.skapad : "",
    status,
    foretagSignaturer: Array.isArray(rad.foretagSignaturer)
      ? rad.foretagSignaturer.filter(
          (s): s is BankIdSignatur =>
            Boolean(s) && typeof (s as BankIdSignatur).namn === "string",
        )
      : [],
    foreningSignaturer: Array.isArray(rad.foreningSignaturer)
      ? rad.foreningSignaturer.filter(
          (s): s is BankIdSignatur =>
            Boolean(s) && typeof (s as BankIdSignatur).namn === "string",
        )
      : [],
  };
}

function normaliseraPost(raw: unknown): BesiktningUpphandlingPost {
  const tom = tomPost();
  if (!raw || typeof raw !== "object") return tom;
  const rad = raw as Partial<BesiktningUpphandlingPost>;
  return {
    egnaProtokoll: Array.isArray(rad.egnaProtokoll)
      ? rad.egnaProtokoll.filter(arProtokoll)
      : [],
    upphandlingSkapad:
      typeof rad.upphandlingSkapad === "string" ? rad.upphandlingSkapad : undefined,
    underlagText: typeof rad.underlagText === "string" ? rad.underlagText : undefined,
    anbudsformularText:
      typeof rad.anbudsformularText === "string" ? rad.anbudsformularText : undefined,
    bestallning: normaliseraBestallning(rad.bestallning),
    arkiv: Array.isArray(rad.arkiv)
      ? rad.arkiv.filter(
          (h): h is SparadHandling =>
            Boolean(h) &&
            typeof (h as SparadHandling).id === "string" &&
            typeof (h as SparadHandling).text === "string",
        )
      : [],
  };
}

export function lasBesiktningUpphandling(): BesiktningUpphandlingLager {
  if (typeof window === "undefined") return tomLager();
  try {
    const raw = localStorage.getItem(foreningStorageKey(STORAGE_KEY_BASE));
    if (!raw) return tomLager();
    const parsed = JSON.parse(raw) as Partial<BesiktningUpphandlingLager>;
    return {
      version: 1,
      poster: {
        ovk: normaliseraPost(parsed.poster?.ovk),
        energideklaration: normaliseraPost(parsed.poster?.energideklaration),
        radon: normaliseraPost(parsed.poster?.radon),
      },
    };
  } catch {
    return tomLager();
  }
}

export function sparaBesiktningUpphandling(lager: BesiktningUpphandlingLager): void {
  safeSetLocalStorage(
    foreningStorageKey(STORAGE_KEY_BASE),
    JSON.stringify(lager),
  );
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(BESIKTNING_UPPHANDLING_EVENT));
  }
}

function skrivPost(
  tjanst: BesiktningTjanstId,
  post: BesiktningUpphandlingPost,
): BesiktningUpphandlingLager {
  const lager = lasBesiktningUpphandling();
  lager.poster[tjanst] = post;
  sparaBesiktningUpphandling(lager);
  return lager;
}

export function hamtaBesiktningPost(
  tjanst: BesiktningTjanstId,
): BesiktningUpphandlingPost {
  return lasBesiktningUpphandling().poster[tjanst];
}

export function antalSparadeBesiktningHandlingar(tjanst: BesiktningTjanstId): number {
  const post = hamtaBesiktningPost(tjanst);
  let antal = post.arkiv.length;
  if (post.underlagText) antal += 1;
  if (post.anbudsformularText) antal += 1;
  if (post.bestallning?.text) antal += 1;
  return antal;
}

/** Protokoll som redan finns i planen eller i förenklad upphandling. */
export function hamtaInhamtadeProtokoll(
  tjanstId: BesiktningTjanstId,
): TidigareProtokoll[] {
  if (typeof window === "undefined") return [];
  const rader: TidigareProtokoll[] = [];
  const plan = lasUnderhallsplanState();
  const besiktning = plan?.besiktningar.find((rad) => rad.id === tjanstId);
  if (besiktning?.senastUtförtAr) {
    const kostnad = besiktning.senastKostnadKr
      ? ` Kostnad senast: ${besiktning.senastKostnadKr} kr.`
      : "";
    const nasta = besiktning.nastaBesiktningAr
      ? ` Nästa planerade år: ${besiktning.nastaBesiktningAr}.`
      : "";
    rader.push({
      id: `plan-${tjanstId}`,
      kalla: "plan",
      datum: String(besiktning.senastUtförtAr),
      utforsAv: "",
      sammanfattning: `Registrerad i underhållsplanen.${kostnad}${nasta}`,
    });
  }

  const forenklad = lasForenkladUpphandling();
  if (tjanstId === "ovk") {
    const ovk = forenklad.ovk;
    if (ovk.senastGodkantDatum || ovk.besiktningsforetag || ovk.notering) {
      rader.push({
        id: "forenklad-ovk",
        kalla: "forenklad",
        datum: ovk.senastGodkantDatum || ovk.utfortDatum || "",
        utforsAv: ovk.besiktningsforetag || ovk.leverantor,
        sammanfattning:
          ovk.notering.trim() ||
          "Senast godkänd OVK enligt förenklad upphandling.",
      });
    }
  }
  if (tjanstId === "energideklaration") {
    const energi = forenklad.energideklaration;
    if (energi.giltigTom || energi.energiklass || energi.utfortDatum) {
      rader.push({
        id: "forenklad-energi",
        kalla: "forenklad",
        datum: energi.utfortDatum || "",
        utforsAv: energi.leverantor,
        sammanfattning: [
          energi.energiklass ? `Energiklass ${energi.energiklass}` : "",
          energi.giltigTom ? `giltig t.o.m. ${energi.giltigTom}` : "",
          energi.registreradHos ? `registrerad hos ${energi.registreradHos}` : "",
          energi.notering,
        ]
          .filter(Boolean)
          .join(". "),
      });
    }
  }
  if (tjanstId === "radon") {
    const radon = forenklad.radon;
    if (radon.resultatBqm3 || radon.matFranDatum || radon.utfortDatum) {
      const krav =
        radon.atgardskrav || radonKraverAtgard(radon.resultatBqm3)
          ? " Åtgärdskrav över 200 Bq/m³."
          : "";
      rader.push({
        id: "forenklad-radon",
        kalla: "forenklad",
        datum: radon.matTomDatum || radon.utfortDatum || radon.matFranDatum,
        utforsAv: radon.leverantor,
        sammanfattning: [
          radon.resultatBqm3 ? `Resultat ${radon.resultatBqm3} Bq/m³.` : "",
          radon.matFranDatum && radon.matTomDatum
            ? `Mätperiod ${radon.matFranDatum}–${radon.matTomDatum}.`
            : "",
          radon.notering,
        ]
          .filter(Boolean)
          .join(" ") + krav,
      });
    }
  }
  return rader;
}

export function allaProtokoll(
  tjanst: BesiktningTjanstId,
  uppladdadeFilnamn: string[] = [],
): TidigareProtokoll[] {
  const egna = hamtaBesiktningPost(tjanst).egnaProtokoll;
  const uppladdade = uppladdadeFilnamn
    .map((filnamn) => filnamn.trim())
    .filter(Boolean)
    .filter((filnamn) => !egna.some((rad) => rad.filnamn === filnamn))
    .map((filnamn) => ({
      id: `fil-${filnamn}`,
      kalla: "uppladdad" as const,
      datum: "",
      utforsAv: "",
      sammanfattning: "Uppladdat protokoll i mappen.",
      filnamn,
    }));
  return [...hamtaInhamtadeProtokoll(tjanst), ...egna, ...uppladdade];
}

export function laggTillEgetProtokoll(
  tjanst: BesiktningTjanstId,
  input: { datum: string; utforsAv: string; sammanfattning: string; filnamn?: string },
): { ok: true } | { ok: false; fel: string } {
  const sammanfattning = input.sammanfattning.trim();
  if (!sammanfattning && !input.filnamn?.trim()) {
    return { ok: false, fel: "Ange vad protokollet visar, eller ett filnamn." };
  }
  const post = hamtaBesiktningPost(tjanst);
  post.egnaProtokoll = [
    ...post.egnaProtokoll,
    {
      id: `prot-${Date.now()}`,
      kalla: "egen",
      datum: input.datum.trim(),
      utforsAv: input.utforsAv.trim(),
      sammanfattning: sammanfattning || "Tidigare protokoll.",
      filnamn: input.filnamn?.trim() || undefined,
    },
  ];
  skrivPost(tjanst, post);
  return { ok: true };
}

export function taBortEgetProtokoll(tjanst: BesiktningTjanstId, id: string): void {
  const post = hamtaBesiktningPost(tjanst);
  post.egnaProtokoll = post.egnaProtokoll.filter((rad) => rad.id !== id);
  skrivPost(tjanst, post);
}

/** Standardtext om OVK-intervall — bostäder efter system, verksamhet 3 år. */
export function ovkIntervallInformationsText(ventilationssystem: string): string {
  const system = ventilationssystem.trim();
  const bostadRad = ovkIntervallBostadHint(system);
  return [
    "OVK-intervall varierar beroende på ventilationssystem (Boverkets föreskrifter BFS 2011:16, OVK):",
    "• Bostäder/lägenheter: FT/FTX oftast vart 3:e år, F/S/FX och självdrag oftast vart 6:e år.",
    `• ${bostadRad}`,
    `• Verksamhetslokaler (butik, kontor m.m.): alltid vart ${OVK_INTERVALL_VERKSAMHET_AR}:e år, oavsett ventilationstyp.`,
  ].join("\n");
}

function formateraProtokoll(protokoll: TidigareProtokoll[]): string {
  if (protokoll.length === 0) {
    return "Inga tidigare protokoll är registrerade. Lägg in dem i mappen innan anbud begärs, så anbudsgivaren ser senaste resultat.";
  }
  return protokoll
    .map((rad, index) => {
      const delar = [
        `${index + 1}. ${rad.datum || "Datum saknas"}`,
        rad.utforsAv ? `utfört av ${rad.utforsAv}` : "",
        rad.filnamn ? `fil: ${rad.filnamn}` : "",
        rad.sammanfattning,
      ].filter(Boolean);
      return delar.join(" — ");
    })
    .join("\n");
}

function formateraFastighetsblock(): string {
  const kontakt = hamtaStyrelseKontakt();
  const grund = hamtaSynkadPlanGrund();
  const rader = [formateraStyrelseKontaktBlock(kontakt).trimEnd()];
  if (!grund) return rader.join("\n");
  const adresser = grund.adresser.map((a) => a.trim()).filter(Boolean);
  if (adresser.length > 0) rader.push(`Fastighetens adresser: ${adresser.join(", ")}`);
  if (grund.fastighetsbeteckning.trim()) {
    rader.push(`Fastighetsbeteckning: ${grund.fastighetsbeteckning.trim()}`);
  }
  if (grund.antalLagenheter.trim()) {
    rader.push(`Antal lägenheter: ${grund.antalLagenheter.trim()}`);
  }
  if (grund.antalVaningar.trim()) rader.push(`Antal våningar: ${grund.antalVaningar.trim()}`);
  if (grund.byggar.trim()) rader.push(`Byggår: ${grund.byggar.trim()}`);
  if (grund.boarea.trim()) rader.push(`Boarea: ${grund.boarea.trim()} m²`);
  if (grund.lokalyta.trim()) rader.push(`Lokalyta: ${grund.lokalyta.trim()} m²`);
  if (grund.uppvarmning.trim()) rader.push(`Uppvärmning: ${grund.uppvarmning.trim()}`);
  if (grund.ventilationssystem.trim()) {
    rader.push(`Ventilationssystem: ${grund.ventilationssystem.trim()}`);
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

export function genereraBesiktningUnderlagText(
  tjanstId: BesiktningTjanstId,
  uppladdadeFilnamn: string[] = [],
): string {
  const tjanst = besiktningTjanst(tjanstId);
  return [
    `FÖRFRÅGNINGSUNDERLAG — ${tjanst.rubrik}`,
    "",
    "Föreningens uppgifter är hämtade från föreningens grunduppgifter.",
    formateraFastighetsblock(),
    ...(tjanstId === "ovk"
      ? [
          "",
          ovkIntervallInformationsText(
            hamtaSynkadPlanGrund()?.ventilationssystem ?? "",
          ),
        ]
      : []),
    "",
    "Uppdrag",
    tjanst.omfattning,
    "",
    "Tidigare protokoll",
    formateraProtokoll(allaProtokoll(tjanstId, uppladdadeFilnamn)),
    "",
    `Avtalet och beställningen undertecknas för föreningen av: ${signerRad()}`,
    "Entreprenören signerar beställningen först. Därefter signerar föreningen. Handlingarna sparas i Styrning och Dokument.",
  ].join("\n");
}

export function genereraBesiktningAnbudsformularText(
  tjanstId: BesiktningTjanstId,
  uppladdadeFilnamn: string[] = [],
): string {
  const tjanst = besiktningTjanst(tjanstId);
  const kompetens =
    tjanstId === "ovk"
      ? "Behörighet som funktionskontrollant:"
      : tjanstId === "energideklaration"
        ? "Certifiering som energiexpert:"
        : "Ackreditering eller metod för radonmätning:";
  return [
    `ANBUDSFORMULÄR — ${tjanst.rubrik}`,
    "",
    "Formuläret är skapat utifrån föreningens uppgifter och tidigare protokoll.",
    formateraFastighetsblock(),
    ...(tjanstId === "ovk"
      ? [
          "",
          ovkIntervallInformationsText(
            hamtaSynkadPlanGrund()?.ventilationssystem ?? "",
          ),
        ]
      : []),
    "",
    "Tidigare protokoll som anbudet ska förhålla sig till",
    formateraProtokoll(allaProtokoll(tjanstId, uppladdadeFilnamn)),
    "",
    "Uppdrag",
    tjanst.omfattning,
    "",
    `Beställningen undertecknas för föreningen av: ${signerRad()}`,
    "Den entreprenör styrelsen väljer signerar beställningen först. Därefter signerar föreningen.",
    "",
    "Fyll i och skicka tillbaka:",
    "Företag:",
    "Organisationsnummer:",
    "Kontaktperson:",
    "E-post:",
    "Pris huvuduppdrag OVK (kr, exkl. moms):",
    "Föreslaget utförandedatum:",
    kompetens,
    "",
    ...(tjanstId === "ovk"
      ? [
          "Tillkommande kostnader (exkl. moms) — fyll i alla som kan bli aktuella:",
          "Ombesikning vid underkänt, pris per lägenhet (kr/lgh): __________",
          "Antal lägenheter i anbudet (st): __________",
          "Timpris åtgärder/åtgärdspaket (kr/h, dag): __________",
          "Timpris kväll/helg (kr/h): __________ / __________",
          "Rensning ventilationskanaler — fast pris eller kr/löpmeter: __________",
          "Beskrivning av vad kanalrensning omfattar: __________",
          "Minsta debitering per tillfälle (kr): __________",
          "",
        ]
      : []),
    "Kommentar till tidigare protokoll:",
  ].join("\n");
}

export function genereraBestallningText(
  tjanstId: BesiktningTjanstId,
  bestallning: Pick<
    BesiktningBestallning,
    | "entreprenorNamn"
    | "entreprenorEpost"
    | "prisKr"
    | "omfattning"
    | "foretagSignaturer"
    | "foreningSignaturer"
  >,
): string {
  const tjanst = besiktningTjanst(tjanstId);
  const foretag =
    bestallning.foretagSignaturer.length > 0
      ? bestallning.foretagSignaturer.map(formateraBankIdSignatur).join("\n")
      : "Väntar på entreprenörens BankID-signatur.";
  const forening =
    bestallning.foreningSignaturer.length > 0
      ? bestallning.foreningSignaturer.map(formateraBankIdSignatur).join("\n")
      : "Väntar. Föreningen signerar efter att entreprenören har signerat.";
  return [
    `BESTÄLLNING — ${tjanst.rubrik}`,
    "",
    formateraFastighetsblock(),
    "",
    `Entreprenör: ${bestallning.entreprenorNamn}`,
    bestallning.entreprenorEpost ? `E-post: ${bestallning.entreprenorEpost}` : "",
    bestallning.prisKr ? `Pris: ${bestallning.prisKr} kr` : "Pris: enligt anbud",
    "",
    "Omfattning",
    bestallning.omfattning.trim() || tjanst.omfattning,
    "",
    "Signering",
    "Entreprenören signerar beställningen först, med två personer via BankID.",
    "Därefter signerar föreningen med två personer via BankID.",
    `Föreningens avtalsundertecknare: ${signerRad()}`,
    "",
    "Entreprenörens signaturer",
    foretag,
    "",
    "Föreningens signaturer",
    forening,
    "",
    "Den signerade beställningen sparas i Styrning och Dokument.",
  ]
    .filter((rad) => rad !== "")
    .join("\n");
}

export function skapaBesiktningUpphandling(
  tjanstId: BesiktningTjanstId,
  uppladdadeFilnamn: string[] = [],
): { ok: true; titel: string } | { ok: false; fel: string } {
  const tjanst = besiktningTjanst(tjanstId);
  const kontakt = hamtaStyrelseKontakt();
  const underlagText = genereraBesiktningUnderlagText(tjanstId, uppladdadeFilnamn);
  const anbudsformularText = genereraBesiktningAnbudsformularText(
    tjanstId,
    uppladdadeFilnamn,
  );
  const post = hamtaBesiktningPost(tjanstId);
  post.upphandlingSkapad = new Date().toISOString();
  post.underlagText = underlagText;
  post.anbudsformularText = anbudsformularText;
  skrivPost(tjanstId, post);

  const key = kategoriId(tjanst.kategoriNamn);
  const titel = kontakt?.foreningsnamn
    ? `${kontakt.foreningsnamn} — ${tjanst.rubrik}`
    : tjanst.rubrik;
  let lager = lasUpphandlingLager();
  lager = uppdateraKategoriMeta(lager, key, {
    titel,
    ort: kontakt?.ort ?? "",
    förfrågningsunderlagKomplett: true,
  });
  lager = loggaHandelse(lager, {
    upphandlingId: key,
    typ: "underlag_komplett",
    av: hamtaAvtalssignerare()[0]?.namn || kontakt?.kontaktperson || "Styrelsen",
    beskrivning: `Upphandling skapad för ${tjanst.rubrik}. Tidigare protokoll, föreningens uppgifter och anbudsformulär är flyttade hit från Styrning och Dokument.`,
  });
  sparaUpphandlingLager(lager);
  return { ok: true, titel };
}

export function skapaBesiktningBestallning(
  tjanstId: BesiktningTjanstId,
  input: {
    entreprenorNamn: string;
    entreprenorEpost: string;
    prisKr: string;
    omfattning: string;
  },
): { ok: true } | { ok: false; fel: string } {
  const namn = input.entreprenorNamn.trim();
  if (!namn) return { ok: false, fel: "Ange den entreprenör som vann anbudet." };
  const post = hamtaBesiktningPost(tjanstId);
  if (!post.upphandlingSkapad) {
    return { ok: false, fel: "Skapa upphandlingen först, så beställningen utgår från samma underlag." };
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
  const utkast: BesiktningBestallning = {
    id: `best-${Date.now()}`,
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
  utkast.text = genereraBestallningText(tjanstId, utkast);
  post.bestallning = utkast;
  skrivPost(tjanstId, post);
  return { ok: true };
}

export function signeraBesiktningBestallning(
  tjanstId: BesiktningTjanstId,
  signatur: BankIdSignatur,
): { ok: true } | { ok: false; fel: string } {
  const post = hamtaBesiktningPost(tjanstId);
  const bestallning = post.bestallning;
  if (!bestallning) return { ok: false, fel: "Skapa beställningen först." };
  if (signatur.part === "forening" && !harTillrackligaBankIdSignaturer(bestallning.foretagSignaturer)) {
    return { ok: false, fel: "Entreprenören ska signera beställningen först." };
  }
  if (signatur.part !== "foretag" && signatur.part !== "forening") {
    return { ok: false, fel: "Beställningen signeras av entreprenören och föreningen." };
  }
  const tillagda = laggTillBankIdSignatur(
    signatur.part === "foretag"
      ? bestallning.foretagSignaturer
      : bestallning.foreningSignaturer,
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
  bestallning.text = genereraBestallningText(tjanstId, bestallning);
  post.bestallning = bestallning;
  skrivPost(tjanstId, post);

  const key = kategoriId(besiktningTjanst(tjanstId).kategoriNamn);
  const klar = bestallning.status === "godkant";
  let lager = lasUpphandlingLager();
  lager = loggaHandelse(lager, {
    upphandlingId: key,
    typ: signatur.part === "foretag"
      ? "avtal_foretag_signatur"
      : klar
        ? "avtal_tecknat"
        : "avtal_forening_signatur",
    av: signatur.namn,
    beskrivning: klar
      ? `Beställningen för ${besiktningTjanst(tjanstId).rubrik} är signerad av entreprenören och föreningen och sparad i Styrning och Dokument.`
      : `${signatur.namn} signerade beställningen för ${besiktningTjanst(tjanstId).rubrik}.`,
  });
  sparaUpphandlingLager(lager);
  return { ok: true };
}

export function sparadeHandlingar(
  tjanst: BesiktningTjanstId,
): SparadHandling[] {
  const post = hamtaBesiktningPost(tjanst);
  const aktuella: SparadHandling[] = [];
  if (post.underlagText && post.upphandlingSkapad) {
    aktuella.push({
      id: `${tjanst}-underlag`,
      typ: "underlag",
      titel: `Förfrågningsunderlag ${besiktningTjanst(tjanst).rubrik}`,
      text: post.underlagText,
      skapad: post.upphandlingSkapad,
    });
  }
  if (post.anbudsformularText && post.upphandlingSkapad) {
    aktuella.push({
      id: `${tjanst}-anbud`,
      typ: "anbudsformular",
      titel: `Anbudsformulär ${besiktningTjanst(tjanst).rubrik}`,
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
