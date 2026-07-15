import {
  hamtaUpphandlingsGrupp,
  kategoriId,
  upphandlingsKategorier,
  type UpphandlingsGruppId,
} from "@/components/upphandling/kategorier";

import { safeSetLocalStorage } from "@/lib/localStorage";
import { foreningStorageKey } from "@/lib/foreningStorage";
import { hamtaAktivForeningsNamn } from "@/lib/forening-registry";

const UPPHANDLING_BASE = "brf-upphandling-lager";

export function upphandlingStorageKey(): string {
  return foreningStorageKey(UPPHANDLING_BASE);
}

export type UpphandlingsStatus = "pågående" | "stängd" | "utvärderad" | "beslutat";

export type StyrelseLedamot = {
  id: string;
  namn: string;
  roll: string;
};

/** Demo-styrelse — i produktion kopplas till inloggad användare. */
export const demoStyrelseledamoter: StyrelseLedamot[] = [
  { id: "ordf", namn: "Anna Andersson", roll: "Styrelseordförande" },
  { id: "kassor", namn: "Erik Eriksson", roll: "Kassör" },
  { id: "led1", namn: "Maria Lind", roll: "Ledamot" },
  { id: "led2", namn: "Johan Johansson", roll: "Ledamot" },
  { id: "supp", namn: "Karin Karlsson", roll: "Suppleant" },
];

export const kravStyrelseGodkannanden = 2;

export type StyrelseGodkannande = {
  ledamotId: string;
  namn: string;
  roll: string;
  tidpunkt: string;
};

export type SpårbarhetTyp =
  | "underlag_komplett"
  | "godkannande_publicering"
  | "publicerad"
  | "godkannande_beslut"
  | "protokollfort"
  | "mejlbeslut"
  | "beslut_slutfort";

export type UpphandlingsSpårbarhet = {
  id: string;
  upphandlingId: string;
  tidpunkt: string;
  typ: SpårbarhetTyp;
  av: string;
  beskrivning: string;
};

/** Styrelsebeslut efter anbudsutvärdering — endast på föreningssidan. */
export type StyrelseBeslut = {
  upphandlingId: string;
  godkannanden: StyrelseGodkannande[];
  protokollfort: boolean;
  protokollDatum: string;
  protokollReferens: string;
  mejlbeslut: boolean;
  mejlDatum: string;
  mejlReferens: string;
  slutfort: boolean;
  slutfortTidpunkt?: string;
};

export type PubliceradUpphandling = {
  id: string;
  kategoriId: string;
  kategoriNamn: string;
  gruppId: UpphandlingsGruppId;
  titel: string;
  ort: string;
  sistaAnbudsdag: string;
  publicerad: string;
  förening: string;
};

/** Inkomna anbud — endast intern portal, aldrig för styrelsen. */
export type InterntAnbud = {
  id: string;
  upphandlingId: string;
  entreprenor: string;
  anbudSummaKr: number;
  inlamnad: string;
};

/** Levereras till styrelsen för beslut — inte råa anbud. */
export type Anbudsutvardering = {
  upphandlingId: string;
  sammanfattning: string;
  rekommendation: string;
  levererad: string;
  synligForStyrelse: boolean;
};

export type KategoriUpphandlingMeta = {
  kategoriId: string;
  förfrågningsunderlagKomplett: boolean;
  titel: string;
  ort: string;
  sistaAnbudsdag: string;
  publiceradId?: string;
  publiceringsGodkannanden: StyrelseGodkannande[];
};

export type UpphandlingLager = {
  kategorier: Record<string, KategoriUpphandlingMeta>;
  publicerade: PubliceradUpphandling[];
  anbud: InterntAnbud[];
  utvarderingar: Anbudsutvardering[];
  styrelsebeslut: StyrelseBeslut[];
  spårbarhet: UpphandlingsSpårbarhet[];
};

function skapaTomKategoriMeta(kategoriKey: string): KategoriUpphandlingMeta {
  return {
    kategoriId: kategoriKey,
    förfrågningsunderlagKomplett: false,
    titel: "",
    ort: "",
    sistaAnbudsdag: "",
    publiceringsGodkannanden: [],
  };
}

export function skapaTomtStyrelseBeslut(upphandlingId: string): StyrelseBeslut {
  return {
    upphandlingId,
    godkannanden: [],
    protokollfort: false,
    protokollDatum: "",
    protokollReferens: "",
    mejlbeslut: false,
    mejlDatum: "",
    mejlReferens: "",
    slutfort: false,
  };
}

export function skapaTomtUpphandlingLager(): UpphandlingLager {
  const kategorier = Object.fromEntries(
    upphandlingsKategorier.map((namn) => [kategoriId(namn), skapaTomKategoriMeta(kategoriId(namn))]),
  );
  return { kategorier, publicerade: [], anbud: [], utvarderingar: [], styrelsebeslut: [], spårbarhet: [] };
}

function normaliseraGodkannanden(raw?: StyrelseGodkannande[]): StyrelseGodkannande[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((g) => g?.ledamotId && g?.namn);
}

function normaliseraBeslut(raw?: Partial<StyrelseBeslut>, upphandlingId?: string): StyrelseBeslut {
  const tom = skapaTomtStyrelseBeslut(upphandlingId ?? "");
  if (!raw) return tom;
  return {
    ...tom,
    ...raw,
    upphandlingId: raw.upphandlingId ?? upphandlingId ?? "",
    godkannanden: normaliseraGodkannanden(raw.godkannanden),
  };
}

function normaliseraLager(raw?: Partial<UpphandlingLager>): UpphandlingLager {
  const tom = skapaTomtUpphandlingLager();
  if (!raw) return tom;

  const kategorier = { ...tom.kategorier };
  for (const [key, meta] of Object.entries(raw.kategorier ?? {})) {
    kategorier[key] = {
      ...skapaTomKategoriMeta(key),
      ...meta,
      kategoriId: key,
      publiceringsGodkannanden: normaliseraGodkannanden(meta.publiceringsGodkannanden),
    };
  }

  return {
    kategorier,
    publicerade: raw.publicerade ?? [],
    anbud: raw.anbud ?? [],
    utvarderingar: raw.utvarderingar ?? [],
    styrelsebeslut: (raw.styrelsebeslut ?? []).map((b) => normaliseraBeslut(b)),
    spårbarhet: raw.spårbarhet ?? [],
  };
}

export function lasUpphandlingLager(): UpphandlingLager {
  if (typeof window === "undefined") return skapaTomtUpphandlingLager();
  try {
    const raw = localStorage.getItem(upphandlingStorageKey());
    return normaliseraLager(raw ? (JSON.parse(raw) as Partial<UpphandlingLager>) : undefined);
  } catch {
    return skapaTomtUpphandlingLager();
  }
}

export function sparaUpphandlingLager(lager: UpphandlingLager): boolean {
  if (typeof window === "undefined") return false;
  const result = safeSetLocalStorage(
    upphandlingStorageKey(),
    JSON.stringify(lager),
  );
  if (!result.ok) return false;
  window.dispatchEvent(new CustomEvent("upphandling-lager-uppdaterad"));
  return true;
}

export function skapaUpphandlingId(): string {
  return `upph-${Date.now()}`;
}

export function skapaAnbudId(): string {
  return `anbud-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function skapaSpårbarhetId(): string {
  return `spår-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function formatTidpunkt(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("sv-SE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function harTillrackligaGodkannanden(godkannanden: StyrelseGodkannande[]): boolean {
  return godkannanden.length >= kravStyrelseGodkannanden;
}

export function kanLaggTillGodkannande(
  godkannanden: StyrelseGodkannande[],
  ledamotId: string,
): boolean {
  if (godkannanden.length >= kravStyrelseGodkannanden) return false;
  return !godkannanden.some((g) => g.ledamotId === ledamotId);
}

export function hamtaStyrelseLedamot(ledamotId: string): StyrelseLedamot | undefined {
  return demoStyrelseledamoter.find((l) => l.id === ledamotId);
}

export function loggaHandelse(
  lager: UpphandlingLager,
  handelse: Omit<UpphandlingsSpårbarhet, "id" | "tidpunkt"> & { tidpunkt?: string },
): UpphandlingLager {
  const rad: UpphandlingsSpårbarhet = {
    id: skapaSpårbarhetId(),
    tidpunkt: handelse.tidpunkt ?? new Date().toISOString(),
    upphandlingId: handelse.upphandlingId,
    typ: handelse.typ,
    av: handelse.av,
    beskrivning: handelse.beskrivning,
  };
  return { ...lager, spårbarhet: [...lager.spårbarhet, rad] };
}

export function hamtaSpårbarhetForUpphandling(
  lager: UpphandlingLager,
  upphandlingId: string,
): UpphandlingsSpårbarhet[] {
  return lager.spårbarhet
    .filter((s) => s.upphandlingId === upphandlingId)
    .sort((a, b) => new Date(a.tidpunkt).getTime() - new Date(b.tidpunkt).getTime());
}

export function hamtaStyrelseBeslut(
  lager: UpphandlingLager,
  upphandlingId: string,
): StyrelseBeslut {
  return (
    lager.styrelsebeslut.find((b) => b.upphandlingId === upphandlingId) ??
    skapaTomtStyrelseBeslut(upphandlingId)
  );
}

export function uppdateraStyrelseBeslut(
  lager: UpphandlingLager,
  upphandlingId: string,
  patch: Partial<StyrelseBeslut>,
): UpphandlingLager {
  const befintlig = hamtaStyrelseBeslut(lager, upphandlingId);
  const uppdaterad = normaliseraBeslut({ ...befintlig, ...patch, upphandlingId }, upphandlingId);
  const utan = lager.styrelsebeslut.filter((b) => b.upphandlingId !== upphandlingId);
  return { ...lager, styrelsebeslut: [...utan, uppdaterad] };
}

export function laggTillPubliceringsGodkannande(
  lager: UpphandlingLager,
  kategoriKey: string,
  ledamotId: string,
): { lager: UpphandlingLager } | { fel: string } {
  const meta = lager.kategorier[kategoriKey];
  if (!meta) return { fel: "Okänd kategori." };

  const ledamot = hamtaStyrelseLedamot(ledamotId);
  if (!ledamot) return { fel: "Välj en styrelseledamot." };

  const godkannanden = meta.publiceringsGodkannanden ?? [];
  if (!kanLaggTillGodkannande(godkannanden, ledamotId)) {
    return { fel: "Ledamoten har redan godkänt eller max antal är uppnått." };
  }

  const nyttGodkannande: StyrelseGodkannande = {
    ledamotId: ledamot.id,
    namn: ledamot.namn,
    roll: ledamot.roll,
    tidpunkt: new Date().toISOString(),
  };

  let nytt = uppdateraKategoriMeta(lager, kategoriKey, {
    publiceringsGodkannanden: [...godkannanden, nyttGodkannande],
  });

  if (meta.publiceradId) {
    nytt = loggaHandelse(nytt, {
      upphandlingId: meta.publiceradId,
      typ: "godkannande_publicering",
      av: ledamot.namn,
      beskrivning: `${ledamot.namn} (${ledamot.roll}) godkände publicering av upphandlingen.`,
    });
  }

  return { lager: nytt };
}

export function laggTillBeslutGodkannande(
  lager: UpphandlingLager,
  upphandlingId: string,
  ledamotId: string,
): { lager: UpphandlingLager } | { fel: string } {
  const beslut = hamtaStyrelseBeslut(lager, upphandlingId);
  if (beslut.slutfort) return { fel: "Beslutet är redan protokollfört och låst." };

  const ledamot = hamtaStyrelseLedamot(ledamotId);
  if (!ledamot) return { fel: "Välj en styrelseledamot." };

  if (!kanLaggTillGodkannande(beslut.godkannanden, ledamotId)) {
    return { fel: "Ledamoten har redan godkänt eller max antal är uppnått." };
  }

  const nyttGodkannande: StyrelseGodkannande = {
    ledamotId: ledamot.id,
    namn: ledamot.namn,
    roll: ledamot.roll,
    tidpunkt: new Date().toISOString(),
  };

  let nytt = uppdateraStyrelseBeslut(lager, upphandlingId, {
    godkannanden: [...beslut.godkannanden, nyttGodkannande],
  });

  nytt = loggaHandelse(nytt, {
    upphandlingId,
    typ: "godkannande_beslut",
    av: ledamot.namn,
    beskrivning: `${ledamot.namn} (${ledamot.roll}) godkände styrelsens beslut efter anbudsutvärdering.`,
  });

  return { lager: nytt };
}

export function registreraProtokollfort(
  lager: UpphandlingLager,
  upphandlingId: string,
  data: { datum: string; referens: string; av: string },
): { lager: UpphandlingLager } | { fel: string } {
  const beslut = hamtaStyrelseBeslut(lager, upphandlingId);
  if (beslut.slutfort) return { fel: "Beslutet är låst." };
  if (!data.datum) return { fel: "Ange protokolldatum." };

  let nytt = uppdateraStyrelseBeslut(lager, upphandlingId, {
    protokollfort: true,
    protokollDatum: data.datum,
    protokollReferens: data.referens.trim(),
  });

  nytt = loggaHandelse(nytt, {
    upphandlingId,
    typ: "protokollfort",
    av: data.av,
    beskrivning: data.referens.trim()
      ? `Beslut protokollfört ${formatDatum(data.datum)} (${data.referens.trim()}).`
      : `Beslut protokollfört ${formatDatum(data.datum)}.`,
  });

  return { lager: nytt };
}

export function registreraMejlbeslut(
  lager: UpphandlingLager,
  upphandlingId: string,
  data: { datum: string; referens: string; av: string },
): { lager: UpphandlingLager } | { fel: string } {
  const beslut = hamtaStyrelseBeslut(lager, upphandlingId);
  if (beslut.slutfort) return { fel: "Beslutet är låst." };
  if (!data.datum) return { fel: "Ange datum för mejlbeslut." };

  let nytt = uppdateraStyrelseBeslut(lager, upphandlingId, {
    mejlbeslut: true,
    mejlDatum: data.datum,
    mejlReferens: data.referens.trim(),
  });

  nytt = loggaHandelse(nytt, {
    upphandlingId,
    typ: "mejlbeslut",
    av: data.av,
    beskrivning: data.referens.trim()
      ? `Mejlbeslut registrerat ${formatDatum(data.datum)} — ${data.referens.trim()}.`
      : `Mejlbeslut registrerat ${formatDatum(data.datum)}.`,
  });

  return { lager: nytt };
}

export function slutforStyrelsebeslut(
  lager: UpphandlingLager,
  upphandlingId: string,
  av: string,
): { lager: UpphandlingLager } | { fel: string } {
  const beslut = hamtaStyrelseBeslut(lager, upphandlingId);
  if (beslut.slutfort) return { fel: "Beslutet är redan slutfört." };
  if (!harTillrackligaGodkannanden(beslut.godkannanden)) {
    return { fel: `Minst ${kravStyrelseGodkannanden} styrelseledamöter måste godkänna beslutet.` };
  }
  if (!beslut.protokollfort && !beslut.mejlbeslut) {
    return { fel: "Registrera protokollfört eller mejlbeslut innan beslutet låses." };
  }
  if (beslut.protokollfort && !beslut.protokollDatum) {
    return { fel: "Ange protokolldatum." };
  }
  if (beslut.mejlbeslut && !beslut.mejlDatum) {
    return { fel: "Ange datum för mejlbeslut." };
  }

  const tidpunkt = new Date().toISOString();
  let nytt = uppdateraStyrelseBeslut(lager, upphandlingId, {
    slutfort: true,
    slutfortTidpunkt: tidpunkt,
  });

  nytt = loggaHandelse(nytt, {
    upphandlingId,
    typ: "beslut_slutfort",
    av,
    beskrivning: "Styrelsens beslut är dokumenterat och sparat för framtida spårbarhet.",
    tidpunkt,
  });

  return { lager: nytt };
}

export function formatDatum(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso.includes("T") ? iso : `${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("sv-SE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function ärAnbudstidStängd(sistaAnbudsdag: string): boolean {
  if (!sistaAnbudsdag) return false;
  const deadline = new Date(`${sistaAnbudsdag}T23:59:59`);
  return Date.now() > deadline.getTime();
}

export function hamtaUpphandlingsStatus(
  upphandling: PubliceradUpphandling,
  utvardering?: Anbudsutvardering,
  beslut?: StyrelseBeslut,
): UpphandlingsStatus {
  if (beslut?.slutfort) return "beslutat";
  if (utvardering?.synligForStyrelse) return "utvärderad";
  if (ärAnbudstidStängd(upphandling.sistaAnbudsdag)) return "stängd";
  return "pågående";
}

export function statusEtikett(status: UpphandlingsStatus): string {
  switch (status) {
    case "pågående":
      return "Anbudstid öppen";
    case "stängd":
      return "Anbudstid stängd";
    case "utvärderad":
      return "Utvärdering till styrelsen";
    case "beslutat":
      return "Beslut dokumenterat";
  }
}

export function uppdateraKategoriMeta(
  lager: UpphandlingLager,
  kategoriKey: string,
  patch: Partial<KategoriUpphandlingMeta>,
): UpphandlingLager {
  return {
    ...lager,
    kategorier: {
      ...lager.kategorier,
      [kategoriKey]: { ...lager.kategorier[kategoriKey], ...patch, kategoriId: kategoriKey },
    },
  };
}

export function publiceraUpphandling(
  lager: UpphandlingLager,
  kategoriKey: string,
  kategoriNamn: string,
): { lager: UpphandlingLager; upphandling: PubliceradUpphandling } | { fel: string } {
  const meta = lager.kategorier[kategoriKey];
  if (!meta?.förfrågningsunderlagKomplett) {
    return { fel: "Markera att förfrågningsunderlaget är komplett innan publicering." };
  }
  if (!meta.titel.trim()) return { fel: "Ange titel på upphandlingen." };
  if (!meta.ort.trim()) return { fel: "Ange ort." };
  if (!meta.sistaAnbudsdag) return { fel: "Ange sista anbudsdag." };
  if (!harTillrackligaGodkannanden(meta.publiceringsGodkannanden ?? [])) {
    return {
      fel: `Minst ${kravStyrelseGodkannanden} styrelseledamöter måste godkänna innan publicering.`,
    };
  }

  const grupp = hamtaUpphandlingsGrupp(kategoriNamn);
  if (!grupp) return { fel: "Okänd kategori." };

  const befintlig = meta.publiceradId
    ? lager.publicerade.find((u) => u.id === meta.publiceradId)
    : undefined;

  const upphandling: PubliceradUpphandling = {
    id: befintlig?.id ?? skapaUpphandlingId(),
    kategoriId: kategoriKey,
    kategoriNamn,
    gruppId: grupp.id,
    titel: meta.titel.trim(),
    ort: meta.ort.trim(),
    sistaAnbudsdag: meta.sistaAnbudsdag,
    publicerad: befintlig?.publicerad ?? new Date().toISOString(),
    förening: hamtaAktivForeningsNamn(),
  };

  const utanGammal = lager.publicerade.filter((u) => u.id !== upphandling.id);
  let nyttLager = uppdateraKategoriMeta(
    { ...lager, publicerade: [...utanGammal, upphandling] },
    kategoriKey,
    { publiceradId: upphandling.id },
  );

  const anbudFinns = nyttLager.anbud.some((a) => a.upphandlingId === upphandling.id);
  if (!anbudFinns) {
    nyttLager.anbud = [
      ...nyttLager.anbud,
      ...skapaDemoAnbud(upphandling.id),
    ];
  }

  if (!befintlig) {
    nyttLager = loggaHandelse(nyttLager, {
      upphandlingId: upphandling.id,
      typ: "publicerad",
      av: "Styrelsen",
      beskrivning: `Upphandlingen "${upphandling.titel}" publicerades på BRF Företags sida.`,
    });
  }

  for (const g of meta.publiceringsGodkannanden ?? []) {
    const redanLoggad = nyttLager.spårbarhet.some(
      (s) =>
        s.upphandlingId === upphandling.id &&
        s.typ === "godkannande_publicering" &&
        s.av === g.namn,
    );
    if (!redanLoggad) {
      nyttLager = loggaHandelse(nyttLager, {
        upphandlingId: upphandling.id,
        typ: "godkannande_publicering",
        av: g.namn,
        beskrivning: `${g.namn} (${g.roll}) godkände publicering.`,
        tidpunkt: g.tidpunkt,
      });
    }
  }

  return { lager: nyttLager, upphandling };
}

function skapaDemoAnbud(upphandlingId: string): InterntAnbud[] {
  const nu = new Date().toISOString();
  return [
    {
      id: skapaAnbudId(),
      upphandlingId,
      entreprenor: "Bygg & Montage AB",
      anbudSummaKr: 1_245_000,
      inlamnad: nu,
    },
    {
      id: skapaAnbudId(),
      upphandlingId,
      entreprenor: "Nordisk Entreprenad i Stockholm",
      anbudSummaKr: 1_198_500,
      inlamnad: nu,
    },
    {
      id: skapaAnbudId(),
      upphandlingId,
      entreprenor: "Stadsbygg Entreprenörer",
      anbudSummaKr: 1_320_000,
      inlamnad: nu,
    },
  ];
}

export function levereraUtvarderingTillStyrelse(
  lager: UpphandlingLager,
  upphandlingId: string,
): UpphandlingLager {
  const upphandling = lager.publicerade.find((u) => u.id === upphandlingId);
  if (!upphandling) return lager;

  const anbud = lager.anbud.filter((a) => a.upphandlingId === upphandlingId);
  const lägst = [...anbud].sort((a, b) => a.anbudSummaKr - b.anbudSummaKr)[0];

  const utvardering: Anbudsutvardering = {
    upphandlingId,
    sammanfattning: `BRF Företag har granskat ${anbud.length} inkomna anbud för "${upphandling.titel}". Jämförelse enligt pris, referenser och krav i förfrågningsunderlaget.`,
    rekommendation: lägst
      ? `Rekommenderat beslut: ${lägst.entreprenor} (${lägst.anbudSummaKr.toLocaleString("sv-SE")} kr exkl. moms) uppfyller kraven bäst enligt vår bedömning.`
      : "Inga anbud att utvärdera ännu.",
    levererad: new Date().toISOString(),
    synligForStyrelse: true,
  };

  const utan = lager.utvarderingar.filter((u) => u.upphandlingId !== upphandlingId);
  return { ...lager, utvarderingar: [...utan, utvardering] };
}

export function hamtaPubliceradeUpphandlingar(): PubliceradUpphandling[] {
  return lasUpphandlingLager().publicerade.sort(
    (a, b) => new Date(b.publicerad).getTime() - new Date(a.publicerad).getTime(),
  );
}

/** Publik BRF Navet-sida — samlar publicerade uppdrag från alla föreningar (ej grundmall). */
export function hamtaPubliceradeUpphandlingarFranAllaForeningar(): PubliceradUpphandling[] {
  if (typeof window === "undefined") return [];

  const prefix = `brf-f-`;
  const suffix = `--${UPPHANDLING_BASE}`;
  const sedda = new Set<string>();
  const all: PubliceradUpphandling[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith(prefix) || !key.endsWith(suffix)) continue;

    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const lager = normaliseraLager(JSON.parse(raw) as Partial<UpphandlingLager>);
      for (const upph of lager.publicerade) {
        const unik = `${key}::${upph.id}`;
        if (sedda.has(unik)) continue;
        sedda.add(unik);
        all.push(upph);
      }
    } catch {
      /* ignorera trasig data */
    }
  }

  return all.sort(
    (a, b) => new Date(b.publicerad).getTime() - new Date(a.publicerad).getTime(),
  );
}

export function hamtaUtvarderingForUpphandling(
  upphandlingId: string,
): Anbudsutvardering | undefined {
  return lasUpphandlingLager().utvarderingar.find(
    (u) => u.upphandlingId === upphandlingId && u.synligForStyrelse,
  );
}
