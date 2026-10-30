import type { ArshjulBilaga } from "@/components/arshjul/arshjul";
import { lasAktivForeningId } from "@/lib/forening-registry";
import { foreningStorageKey } from "@/lib/foreningStorage";
import { safeSetLocalStorage } from "@/lib/localStorage";
import {
  normaliseraBankIdSignaturer,
  sammanfattaBankIdSignaturer,
  type BankIdSignatur,
} from "@/lib/bankid-signering";

export type ArshjulUndertecknare = {
  namn: string;
  epost: string;
};

export type ArshjulDokumentSignering = {
  /** Bilaga som ska godkännas. */
  bilagaId: string;
  kravSignaturer: 1 | 2;
  undertecknare: ArshjulUndertecknare[];
  lasningBekraftad: boolean;
  lasningBekraftadTid?: string;
  signaturer: BankIdSignatur[];
  /** Bilaga med inbäddat signaturblock (eller signaturprotokoll). */
  signeradBilagaId?: string;
  klar: boolean;
  signeradTid?: string;
};

export type ArshjulSigneratArkivPost = {
  id: string;
  ar: number;
  handelseId: string;
  handelseTitel: string;
  originalFilnamn: string;
  filnamn: string;
  dataUrl: string;
  signaturer: BankIdSignatur[];
  signeradTid: string;
};

const ARKIV_BASE = "brf-arshjul-signerade";

export function arshjulSigneradeStorageKey(foreningId?: string): string {
  return foreningStorageKey(ARKIV_BASE, foreningId);
}

export function tomArshjulSignering(bilagaId: string): ArshjulDokumentSignering {
  return {
    bilagaId,
    kravSignaturer: 2,
    undertecknare: [{ namn: "", epost: "" }, { namn: "", epost: "" }],
    lasningBekraftad: false,
    signaturer: [],
    klar: false,
  };
}

export function normaliseraArshjulSignering(
  raw: unknown,
): ArshjulDokumentSignering | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const v = raw as Partial<ArshjulDokumentSignering>;
  const bilagaId =
    typeof v.bilagaId === "string" ? v.bilagaId.trim().slice(0, 40) : "";
  if (!bilagaId) return undefined;
  const krav: 1 | 2 = v.kravSignaturer === 1 ? 1 : 2;
  const undertecknare = (Array.isArray(v.undertecknare) ? v.undertecknare : [])
    .slice(0, 2)
    .map((u) => {
      if (!u || typeof u !== "object") return { namn: "", epost: "" };
      const post = u as ArshjulUndertecknare;
      return {
        namn: typeof post.namn === "string" ? post.namn.trim().slice(0, 120) : "",
        epost: typeof post.epost === "string" ? post.epost.trim().slice(0, 160) : "",
      };
    });
  while (undertecknare.length < 2) {
    undertecknare.push({ namn: "", epost: "" });
  }
  const signaturer = normaliseraBankIdSignaturer(v.signaturer);
  return {
    bilagaId,
    kravSignaturer: krav,
    undertecknare,
    lasningBekraftad: Boolean(v.lasningBekraftad),
    lasningBekraftadTid:
      typeof v.lasningBekraftadTid === "string"
        ? v.lasningBekraftadTid.slice(0, 40)
        : undefined,
    signaturer,
    signeradBilagaId:
      typeof v.signeradBilagaId === "string"
        ? v.signeradBilagaId.slice(0, 40)
        : undefined,
    klar: Boolean(v.klar),
    signeradTid:
      typeof v.signeradTid === "string" ? v.signeradTid.slice(0, 40) : undefined,
  };
}

export function byggSignaturBlock(
  handelseTitel: string,
  dokumentFilnamn: string,
  signaturer: BankIdSignatur[],
): string {
  const rader = [
    "",
    "========================================",
    "BANKID-GODKÄNNANDE (årshjul)",
    "========================================",
    `Händelse: ${handelseTitel}`,
    `Dokument: ${dokumentFilnamn}`,
    `Signerad: ${new Date().toLocaleString("sv-SE")}`,
    "",
    "Undertecknare:",
    sammanfattaBankIdSignaturer(signaturer) || "—",
    "",
  ];
  for (const s of signaturer) {
    rader.push(
      `• ${s.namn} · ${s.personnummerMaskerat} · ${new Date(s.tidpunkt).toLocaleString("sv-SE")}`,
    );
  }
  rader.push("========================================", "");
  return rader.join("\n");
}

function dataUrlTillText(dataUrl: string): string | null {
  if (!dataUrl.startsWith("data:")) return null;
  if (dataUrl.startsWith("data:text/plain")) {
    const komma = dataUrl.indexOf(",");
    if (komma < 0) return null;
    const payload = dataUrl.slice(komma + 1);
    try {
      if (dataUrl.includes(";base64,")) {
        return atob(payload);
      }
      return decodeURIComponent(payload);
    } catch {
      return null;
    }
  }
  return null;
}

function textTillDataUrl(text: string): string {
  return `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`;
}

/** Skapar signerad bilaga — text bifogas i filen, övriga format får signaturprotokoll. */
export function skapaSigneradBilaga(
  bilaga: ArshjulBilaga,
  handelseTitel: string,
  signaturer: BankIdSignatur[],
): ArshjulBilaga {
  const block = byggSignaturBlock(handelseTitel, bilaga.filnamn, signaturer);
  const textInnehall = dataUrlTillText(bilaga.dataUrl);
  if (textInnehall !== null) {
    const filnamn = bilaga.filnamn.replace(/(\.txt)?$/i, "") + "-signerat.txt";
    return {
      id: `bil-sign-${Date.now().toString(36)}`,
      filnamn,
      dataUrl: textTillDataUrl(textInnehall + block),
    };
  }
  const protokoll = [
    `Signaturprotokoll till: ${bilaga.filnamn}`,
    "Originalbilagan är oförändrad. Detta dokument visar BankID-godkännande.",
    block,
  ].join("\n");
  return {
    id: `bil-sign-${Date.now().toString(36)}`,
    filnamn: `Signaturprotokoll-${bilaga.filnamn.replace(/\.[^.]+$/, "")}.txt`,
    dataUrl: textTillDataUrl(protokoll),
  };
}

export function lasSigneradeArshjulDokument(
  foreningId?: string,
): ArshjulSigneratArkivPost[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(
      arshjulSigneradeStorageKey(foreningId ?? lasAktivForeningId()),
    );
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((rad) => {
        if (!rad || typeof rad !== "object") return null;
        const p = rad as Partial<ArshjulSigneratArkivPost>;
        if (
          typeof p.id !== "string" ||
          typeof p.ar !== "number" ||
          typeof p.dataUrl !== "string" ||
          !p.dataUrl.startsWith("data:")
        ) {
          return null;
        }
        return {
          id: p.id,
          ar: p.ar,
          handelseId: String(p.handelseId ?? "").slice(0, 40),
          handelseTitel: String(p.handelseTitel ?? "").slice(0, 200),
          originalFilnamn: String(p.originalFilnamn ?? "").slice(0, 180),
          filnamn: String(p.filnamn ?? "signerat.txt").slice(0, 180),
          dataUrl: p.dataUrl.slice(0, 400_000),
          signaturer: normaliseraBankIdSignaturer(p.signaturer),
          signeradTid: String(p.signeradTid ?? new Date().toISOString()),
        } satisfies ArshjulSigneratArkivPost;
      })
      .filter((x): x is ArshjulSigneratArkivPost => x !== null);
  } catch {
    return [];
  }
}

export function sparaSigneratArshjulDokument(
  post: ArshjulSigneratArkivPost,
  foreningId?: string,
): void {
  if (typeof window === "undefined") return;
  const key = arshjulSigneradeStorageKey(foreningId ?? lasAktivForeningId());
  const lista = lasSigneradeArshjulDokument(foreningId).filter(
    (p) => p.id !== post.id,
  );
  lista.unshift(post);
  safeSetLocalStorage(key, JSON.stringify(lista.slice(0, 200)));
}

export function grupperaSigneradePerAr(
  poster: ArshjulSigneratArkivPost[],
): Map<number, ArshjulSigneratArkivPost[]> {
  const map = new Map<number, ArshjulSigneratArkivPost[]>();
  for (const p of poster) {
    const rad = map.get(p.ar) ?? [];
    rad.push(p);
    map.set(p.ar, rad);
  }
  return map;
}
