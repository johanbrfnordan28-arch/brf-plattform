import {
  foreningsHuvudmappar,
  undermappNoderForHuvud,
} from "@/components/foreningsinformation/mappar";
import {
  hamtaBibliotekFilUrl,
  lasBibliotekState,
  type BibliotekUppladdatDokument,
} from "@/components/foreningsinformation/foreningsinformation-bibliotek-lager";
import {
  besiktningTjanstForKategori,
} from "@/components/foreningsinformation/besiktning-upphandling";
import {
  HISS_HUVUDMAPP,
  hissUpphandlingForKategori,
  lasHissUpphandling,
  type HissUpphandlingsSlag,
} from "@/components/foreningsinformation/hiss-upphandling";
import { lasForeningsDokument } from "@/components/dokumentbank/forening-dokumenter-lager";
import {
  dokumentRefFranForeningsDokument,
  dokumentRefFranProjektDokument,
  lasProjektLista,
} from "@/components/dokumentbank/dokument-projekt-koppling";
import { hamtaMappTitel } from "@/components/projekt/projekt";
import {
  driftUpphandlingsKategorier,
  ärDriftUpphandlingsKategori,
  schemaRollForDriftKategori,
} from "@/components/rondering/drift-upphandling-koppling";
import { genereraSchemaText } from "@/components/rondering/exporteraSigneringSchema";
import { hamtaAktivaSchemaPunkter } from "@/components/rondering/signering-schema";
import { signeringRollInfo } from "@/components/rondering/signering";
import { kategoriId } from "@/components/upphandling/kategorier";
import type { DokumentRef } from "@/components/upphandling/upphandling-dokument-lager";
import { oppnaForeningsDokumentPreview } from "@/components/dokumentbank/forening-dokument-visning";
import {
  arDeladFil,
  deladFilPlats,
  hamtaForeningFilUrlFranPlats,
  laddaUppDeladFil,
  oppnaFilIFlik,
  type DeladFil,
} from "@/lib/forening-fil-lagring";
import {
  lasArshjulLista,
  styrningPlatsForBesiktning,
} from "@/lib/forening-dokument-platser";

export type PortalKalla =
  | "styrning"
  | "hiss"
  | "arshjul"
  | "dokumentbank"
  | "projekt"
  | "rondering";

export const PORTAL_KALLOR: { id: PortalKalla; etikett: string }[] = [
  { id: "styrning", etikett: "Styrning och Dokument" },
  { id: "hiss", etikett: "Hiss" },
  { id: "arshjul", etikett: "Årshjul" },
  { id: "dokumentbank", etikett: "Dokumentbank" },
  { id: "projekt", etikett: "Projekt" },
  { id: "rondering", etikett: "Rondering" },
];

export type PortalHandling = {
  id: string;
  kalla: PortalKalla;
  filnamn: string;
  /** Var handlingen ligger, t.ex. "Styrning och Dokument → Hiss → Bilder". */
  plats: string;
  datum?: string;
  /** Filen finns redan i fillagringen och kopplas utan kopiering. */
  fil?: DeladFil;
  /** Mall eller dokument utan fil — kopplas som referens. */
  ref?: DokumentRef;
  /** Äldre filer och genererade scheman kopieras in som en ny fil. */
  skapaFil?: () => Promise<File | null>;
  /** Styrningsmapp, för förslag per kategori. */
  styrning?: { huvudId: string; underPath: string };
  arshjulHandelseId?: string;
  ronderingKategori?: string;
};

const UPPHANDLING_FIL_MODUL = "upphandling";

function utanNummer(titel: string): string {
  return titel.replace(/^\d+\.\s*/, "");
}

const TYP_FRAN_ANDELSE: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  txt: "text/plain",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  heic: "image/heic",
};

async function filFranUrl(url: string, filnamn: string): Promise<File | null> {
  try {
    const blob = await (await fetch(url)).blob();
    const andelse = filnamn.split(".").pop()?.toLowerCase() ?? "";
    const typ = blob.type || TYP_FRAN_ANDELSE[andelse] || "";
    return new File([blob], filnamn, { type: typ });
  } catch {
    return null;
  }
}

function styrningsHandlingar(): PortalHandling[] {
  const state = lasBibliotekState() ?? {};
  const ut: PortalHandling[] = [];
  for (const huvud of foreningsHuvudmappar) {
    const undermappar = state[huvud.id]?.undermappar ?? {};
    const noder = undermappNoderForHuvud(huvud);
    for (const [path, under] of Object.entries(undermappar)) {
      const mappTitel = noder.find((n) => n.path === path)?.under.titel ?? path;
      const plats = `Styrning och Dokument → ${utanNummer(huvud.titel)} → ${mappTitel}`;
      for (const dok of under.dokument ?? []) {
        ut.push({
          id: `styrning:${huvud.id}/${path}:${dok.id}`,
          kalla: huvud.id === HISS_HUVUDMAPP ? "hiss" : "styrning",
          filnamn: dok.filnamn,
          plats,
          datum: dok.uppladdad,
          styrning: { huvudId: huvud.id, underPath: path },
          ...(dok.fil
            ? { fil: dok.fil }
            : { skapaFil: () => kopieraBibliotekFil(dok) }),
        });
      }
    }
  }
  return ut;
}

async function kopieraBibliotekFil(dok: BibliotekUppladdatDokument): Promise<File | null> {
  const url = await hamtaBibliotekFilUrl(dok);
  if (!url) return null;
  try {
    return await filFranUrl(url, dok.filnamn);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Äldre hissbilder som bara sparades i webbläsaren, innan de flyttades till mappen Bilder. */
function aldreHissBilder(): PortalHandling[] {
  return lasHissUpphandling()
    .bilder.filter((bild) => !bild.fil && bild.dataUrl)
    .map((bild) => ({
      id: `hiss-bild:${bild.id}`,
      kalla: "hiss" as const,
      filnamn: bild.filnamn,
      plats: "Hiss → Bilder",
      styrning: { huvudId: HISS_HUVUDMAPP, underPath: "bilder" },
      skapaFil: () => filFranUrl(bild.dataUrl, bild.filnamn),
    }));
}

function arshjulHandlingar(): PortalHandling[] {
  return lasArshjulLista().flatMap((h) =>
    (h.bilagor ?? []).map((bilaga) => ({
      id: `arshjul:${h.id}:${bilaga.id}`,
      kalla: "arshjul" as const,
      filnamn: bilaga.filnamn,
      plats: `Årshjul → ${h.titel?.trim() || "Händelse"}`,
      arshjulHandelseId: h.id,
      ...(bilaga.fil
        ? { fil: bilaga.fil }
        : { skapaFil: () => filFranUrl(bilaga.dataUrl, bilaga.filnamn) }),
    })),
  );
}

function dokumentbankHandlingar(): PortalHandling[] {
  return lasForeningsDokument().dokument.map((dok) => {
    const fil = arDeladFil(dok.fil) ? dok.fil : undefined;
    return {
      id: `dokumentbank:${dok.id}`,
      kalla: "dokumentbank" as const,
      filnamn: fil?.filnamn ?? dok.titel,
      plats: `Dokumentbank → ${dok.mallTitel}`,
      datum: dok.uppdateradDatum?.slice(0, 10),
      ...(fil ? { fil } : { ref: dokumentRefFranForeningsDokument(dok) }),
    };
  });
}

function projektHandlingar(): PortalHandling[] {
  const ut: PortalHandling[] = [];
  for (const p of lasProjektLista()) {
    for (const [mappId, mapp] of Object.entries(p.mappar)) {
      for (const dok of mapp.dokument) {
        const ref = dok.fil ? null : dokumentRefFranProjektDokument(dok);
        if (!dok.fil && !ref) continue;
        ut.push({
          id: `projekt:${p.id}/${mappId}:${dok.id}`,
          kalla: "projekt",
          filnamn: dok.filnamn,
          plats: `Projekt → ${p.titel} → ${hamtaMappTitel(p, mappId)}`,
          datum: dok.uppladdad,
          ...(dok.fil ? { fil: dok.fil } : { ref: ref! }),
        });
      }
    }
  }
  return ut;
}

function ronderingHandlingar(): PortalHandling[] {
  return driftUpphandlingsKategorier.flatMap((kategori) => {
    const roll = schemaRollForDriftKategori(kategori);
    if (hamtaAktivaSchemaPunkter(roll).length === 0) return [];
    const info = signeringRollInfo[roll];
    const filnamn = `${info.dokument}.txt`;
    return [
      {
        id: `rondering:${roll}`,
        kalla: "rondering" as const,
        filnamn,
        plats: `Rondering → ${info.dokument}`,
        datum: "skapas från aktuellt schema",
        ronderingKategori: kategori,
        skapaFil: async () =>
          new File([genereraSchemaText(roll)], filnamn, { type: "text/plain" }),
      },
    ];
  });
}

/** Alla handlingar i portalen som kan kopplas till en upphandling. Samma fil visas bara en gång. */
export function listaPortalHandlingar(): PortalHandling[] {
  const alla = [
    ...styrningsHandlingar(),
    ...aldreHissBilder(),
    ...arshjulHandlingar(),
    ...dokumentbankHandlingar(),
    ...projektHandlingar(),
    ...ronderingHandlingar(),
  ];
  const settaFiler = new Set<string>();
  return alla.filter((h) => {
    if (!h.fil) return true;
    if (settaFiler.has(h.fil.filId)) return false;
    settaFiler.add(h.fil.filId);
    return true;
  });
}

/** Gör om en handling till en referens i upphandlingen; kopierar filen när den inte redan är delad. */
export async function portalHandlingTillRef(
  h: PortalHandling,
): Promise<{ ok: true; ref: DokumentRef } | { ok: false; fel: string }> {
  const bas = { ursprung: h.plats, portalId: h.id };
  if (h.fil) {
    return { ok: true, ref: { filnamn: h.fil.filnamn, källa: "portal", fil: h.fil, ...bas } };
  }
  if (h.ref) return { ok: true, ref: { ...h.ref, ...bas } };
  const fil = await h.skapaFil?.();
  if (!fil) return { ok: false, fel: `${h.filnamn} kunde inte hämtas.` };
  const sparad = await laddaUppDeladFil({ modul: UPPHANDLING_FIL_MODUL, fil });
  if (!sparad.ok) return { ok: false, fel: `${h.filnamn}: ${sparad.fel}` };
  return { ok: true, ref: { filnamn: fil.name, källa: "portal", fil: sparad.fil, ...bas } };
}

/** Öppnar en kopplad handling i en ny flik. Ger false när det inte finns något att visa. */
export async function oppnaUpphandlingsDokument(ref: DokumentRef): Promise<boolean> {
  if (ref.fil) {
    const fil = ref.fil;
    return oppnaFilIFlik(() => hamtaForeningFilUrlFranPlats(deladFilPlats(fil)));
  }
  if (ref.foreningsDokumentId) {
    const dok = lasForeningsDokument().dokument.find((d) => d.id === ref.foreningsDokumentId);
    return dok ? oppnaForeningsDokumentPreview(dok) : false;
  }
  return false;
}

export async function oppnaPortalHandling(h: PortalHandling): Promise<boolean> {
  if (h.fil || h.ref) {
    return oppnaUpphandlingsDokument(h.ref ?? { filnamn: h.filnamn, källa: "portal", fil: h.fil });
  }
  return oppnaFilIFlik(async () => {
    const fil = await h.skapaFil?.();
    return fil ? URL.createObjectURL(fil) : null;
  });
}

export function laddaUppUpphandlingsFil(fil: File) {
  return laddaUppDeladFil({ modul: UPPHANDLING_FIL_MODUL, fil });
}

const HISS_MAPPAR_FOR_SLAG: Record<HissUpphandlingsSlag, string[]> = {
  service: ["besiktning", "service-rapport", "bilder"],
  reparation: ["reparationer", "bilder", "besiktning"],
  "ny-hiss": ["bilder", "besiktning"],
};

/** Handlingar som hör till kategorin och därför förväljs när man kommer från en annan modul. */
export function foreslagnaHandlingar(
  lista: PortalHandling[],
  kategoriNamn: string,
  arshjulHandelseId?: string | null,
): string[] {
  const styrningsMappar: { huvudId: string; underPath: string }[] = [];

  const besiktning = besiktningTjanstForKategori(kategoriNamn);
  if (besiktning) {
    const plats = styrningPlatsForBesiktning(besiktning.id);
    if (plats?.typ === "styrning") styrningsMappar.push(plats);
  }
  const hiss = hissUpphandlingForKategori(kategoriNamn);
  if (hiss) {
    for (const underPath of HISS_MAPPAR_FOR_SLAG[hiss.id]) {
      styrningsMappar.push({ huvudId: HISS_HUVUDMAPP, underPath });
    }
  }

  return lista
    .filter((h) => {
      if (arshjulHandelseId && h.arshjulHandelseId === arshjulHandelseId) return true;
      if (ärDriftUpphandlingsKategori(kategoriNamn) && h.ronderingKategori === kategoriNamn) {
        return true;
      }
      return Boolean(
        h.styrning &&
          styrningsMappar.some(
            (m) => m.huvudId === h.styrning!.huvudId && m.underPath === h.styrning!.underPath,
          ),
      );
    })
    .map((h) => h.id);
}

/** Länk från en annan modul till rätt kategori i upphandlingen, med förvalda handlingar. */
export function upphandlingsLank(kategoriNamn: string, opts?: { arshjulHandelseId?: string }): string {
  const key = kategoriId(kategoriNamn);
  const params = new URLSearchParams({ kategori: key, hamta: "1" });
  if (opts?.arshjulHandelseId) params.set("handelse", opts.arshjulHandelseId);
  return `/forening/upphandling?${params.toString()}#kategori-${key}`;
}
