import { STANDARD_DOKUMENT_LAYOUT } from "@/components/dokumentbank/dokument-layout";
import type { DokumentMallOmrade } from "@/components/dokumentbank/mallar";
import {
  skapaForeningsDokumentId,
  tomDokumentEntreprenor,
  type ForeningsDokument,
} from "@/components/dokumentbank/forening-dokumenter-lager";
import {
  EGENKONTROLL_VVS_MALL_ID,
  VVS_EGENKONTROLL_PUNKTER,
  arEgenkontrollMallId,
} from "@/components/dokumentbank/mallar/egenkontroll-mallar";
import { EGENKONTROLL_VVS_INTRO } from "@/components/dokumentbank/mallar/innehall/egenkontroll-vvs";
import {
  normaliseraBankIdSignaturer,
  sammanfattaBankIdSignaturer,
  type BankIdSignatur,
} from "@/lib/bankid-signering";
import { hamtaForeningMallIfyllnad, ifyllForeningsfalt } from "@/components/dokumentbank/forening-dokument-innehall";

export type EgenkontrollPunktStatus = "opåbörjad" | "utfort" | "avvikelse";

export type EgenkontrollAvvikelseDetalj = {
  nr: number;
  orsak: string;
  reservation: string;
  /** ISO — när avvikelsen kommunicerades med beställare/ombud */
  tidBeställareKommunikation: string;
  /** ISO — när avvikelsen kommunicerades med projektledare (entreprenör) */
  tidProjektledareKommunikation: string;
  /** Återkoppling från beställare/ombud */
  beställareÅterkoppling: string;
  tidBeställareÅterkoppling: string;
  /** Återkoppling från projektledare */
  projektledareÅterkoppling: string;
  tidProjektledareÅterkoppling: string;
};

export type EgenkontrollPunkt = {
  id: string;
  rubrik: string;
  beskrivning: string;
  amaNot?: string;
  aktuell: boolean;
  status: EgenkontrollPunktStatus;
  kontrollDatum: string;
  kommentar: string;
  /** Två bokstäver — kopplas till kontrollpersonal nedan */
  attestInitialer: string;
  avvikelseNr: number | null;
  avvikelse?: EgenkontrollAvvikelseDetalj;
};

/** Entreprenörens personal som utför kontroller (initialer + BankID). */
export type EgenkontrollKontrollant = {
  id: string;
  namn: string;
  initialer: string;
  signaturer: BankIdSignatur[];
};

export type EgenkontrollUtforare = {
  id: string;
  namn: string;
};

export type EgenkontrollSignerareRoll =
  | "utforare"
  | "underentreprenor_arbetsledare"
  | "huvudentreprenor_arbetsledare"
  | "ovrig";

export type EgenkontrollSignerare = {
  id: string;
  roll: EgenkontrollSignerareRoll;
  /** Vid roll ovrig */
  rollEtikett: string;
  namn: string;
  signaturer: BankIdSignatur[];
};

/** @deprecated Migreras till signerare */
export type EgenkontrollSlutSignering = {
  utforare1: BankIdSignatur[];
  utforare2: BankIdSignatur[];
  underentreprenor: BankIdSignatur[];
  huvudentreprenor: BankIdSignatur[];
};

export type EgenkontrollState = {
  bransch: "vvs";
  huvudentreprenorNamn: string;
  underentreprenorNamn: string;
  utforare: EgenkontrollUtforare[];
  kontrollanter: EgenkontrollKontrollant[];
  punkter: EgenkontrollPunkt[];
  signerare: EgenkontrollSignerare[];
  slutSignering?: EgenkontrollSlutSignering;
};

export const EGENKONTROLL_ROLL_ETIKETTER: Record<
  EgenkontrollSignerareRoll,
  string
> = {
  utforare: "Utförare",
  underentreprenor_arbetsledare: "Underentreprenör — arbetsledare",
  huvudentreprenor_arbetsledare: "Huvudentreprenör — arbetsledare",
  ovrig: "Övrig",
};

export function skapaEgenkontrollPunktId(): string {
  return `ekp-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
}

export function skapaUtforareId(): string {
  return `eku-${Math.random().toString(36).slice(2, 8)}`;
}

export function skapaKontrollantId(): string {
  return `ekk-${Math.random().toString(36).slice(2, 8)}`;
}

export function normaliseraInitialer(raw: string): string {
  return raw
    .replace(/[^a-zA-ZåäöÅÄÖ]/g, "")
    .slice(0, 2)
    .toUpperCase();
}

export function skapaSignerareId(): string {
  return `eks-${Math.random().toString(36).slice(2, 8)}`;
}

export function tomAvvikelseDetalj(nr = 0): EgenkontrollAvvikelseDetalj {
  return {
    nr,
    orsak: "",
    reservation: "",
    tidBeställareKommunikation: "",
    tidProjektledareKommunikation: "",
    beställareÅterkoppling: "",
    tidBeställareÅterkoppling: "",
    projektledareÅterkoppling: "",
    tidProjektledareÅterkoppling: "",
  };
}

export function formateraIsoSomDatumTid(iso: string): string {
  if (!iso.trim()) return "—";
  try {
    return new Date(iso).toLocaleString("sv-SE");
  } catch {
    return iso;
  }
}

export function tillDatetimeLocalValue(iso: string): string {
  if (!iso.trim()) return "";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return "";
  }
}

export function franDatetimeLocal(value: string): string {
  if (!value.trim()) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}

export function synkaAvvikelseNummer(
  punkter: EgenkontrollPunkt[],
): EgenkontrollPunkt[] {
  let nr = 0;
  return punkter.map((p) => {
    if (!p.aktuell || p.status !== "avvikelse") {
      return { ...p, avvikelseNr: null, avvikelse: undefined };
    }
    nr += 1;
    const det = p.avvikelse ?? tomAvvikelseDetalj(nr);
    return {
      ...p,
      avvikelseNr: nr,
      avvikelse: { ...det, nr },
    };
  });
}

function normaliseraPunktStatus(raw: string | undefined): EgenkontrollPunktStatus {
  if (raw === "utfort" || raw === "avvikelse" || raw === "opåbörjad") return raw;
  if (raw === "ok") return "utfort";
  return "opåbörjad";
}

function normaliseraPunkt(p: Partial<EgenkontrollPunkt>): EgenkontrollPunkt {
  const status = normaliseraPunktStatus(p.status);
  const avvikelseRaw = p.avvikelse;
  const avvikelseNr =
    typeof p.avvikelseNr === "number" ? p.avvikelseNr : null;
  const avvikelse =
    status === "avvikelse"
      ? {
          nr: avvikelseRaw?.nr ?? avvikelseNr ?? 0,
          orsak: avvikelseRaw?.orsak ?? "",
          reservation: avvikelseRaw?.reservation ?? "",
          tidBeställareKommunikation:
            avvikelseRaw?.tidBeställareKommunikation ??
            (avvikelseRaw as { datumBeställareInformed?: string } | undefined)
              ?.datumBeställareInformed ??
            "",
          tidProjektledareKommunikation:
            avvikelseRaw?.tidProjektledareKommunikation ?? "",
          beställareÅterkoppling: avvikelseRaw?.beställareÅterkoppling ?? "",
          tidBeställareÅterkoppling:
            avvikelseRaw?.tidBeställareÅterkoppling ?? "",
          projektledareÅterkoppling:
            avvikelseRaw?.projektledareÅterkoppling ?? "",
          tidProjektledareÅterkoppling:
            avvikelseRaw?.tidProjektledareÅterkoppling ?? "",
        }
      : undefined;
  return {
    id: p.id ?? skapaEgenkontrollPunktId(),
    rubrik: p.rubrik ?? "",
    beskrivning: p.beskrivning ?? "",
    amaNot: p.amaNot,
    aktuell: p.aktuell !== false,
    status,
    kontrollDatum: p.kontrollDatum ?? "",
    kommentar: p.kommentar ?? "",
    attestInitialer: normaliseraInitialer(p.attestInitialer ?? ""),
    avvikelseNr,
    avvikelse,
  };
}

function normaliseraKontrollanter(
  raw: unknown,
  utforare: EgenkontrollUtforare[],
  signerare: EgenkontrollSignerare[],
): EgenkontrollKontrollant[] {
  if (Array.isArray(raw) && raw.length > 0) {
    return raw
      .filter((k) => k && typeof k === "object")
      .map((k) => {
        const x = k as Partial<EgenkontrollKontrollant>;
        return {
          id: x.id ?? skapaKontrollantId(),
          namn: x.namn ?? "",
          initialer: normaliseraInitialer(x.initialer ?? ""),
          signaturer: normaliseraBankIdSignaturer(x.signaturer),
        };
      });
  }
  const franUtforare = utforare.map((u, i) => {
    const sig = signerare.filter((s) => s.roll === "utforare")[i];
    return {
      id: u.id,
      namn: u.namn,
      initialer: normaliseraInitialer(
        sig?.namn
          .split(/\s+/)
          .map((del) => del[0] ?? "")
          .join("")
          .slice(0, 2) ?? "",
      ),
      signaturer: sig ? normaliseraBankIdSignaturer(sig.signaturer) : [],
    };
  });
  return franUtforare;
}

function byggSignerareFranSkapa(input: {
  huvudentreprenorNamn: string;
  huvudArbetsledareNamn: string;
  underentreprenorNamn?: string;
  underArbetsledareNamn?: string;
  utforareNamn: string[];
}): EgenkontrollSignerare[] {
  const lista: EgenkontrollSignerare[] = [];

  const underLed = input.underArbetsledareNamn?.trim();
  if (underLed) {
    lista.push({
      id: skapaSignerareId(),
      roll: "underentreprenor_arbetsledare",
      rollEtikett: "",
      namn: underLed,
      signaturer: [],
    });
  }

  const huvudLed =
    input.huvudArbetsledareNamn.trim() || input.huvudentreprenorNamn.trim();
  if (huvudLed) {
    lista.push({
      id: skapaSignerareId(),
      roll: "huvudentreprenor_arbetsledare",
      rollEtikett: "",
      namn: huvudLed,
      signaturer: [],
    });
  }
  return lista;
}

function migreraSignerareFranLegacy(
  d: Partial<EgenkontrollState>,
): EgenkontrollSignerare[] {
  const slut = d.slutSignering;
  if (!slut) return [];

  const utforare = d.utforare ?? [];
  const out: EgenkontrollSignerare[] = [];

  if (utforare[0]) {
    out.push({
      id: skapaSignerareId(),
      roll: "utforare",
      rollEtikett: "",
      namn: utforare[0].namn,
      signaturer: normaliseraBankIdSignaturer(slut.utforare1),
    });
  }
  if (utforare[1]) {
    out.push({
      id: skapaSignerareId(),
      roll: "utforare",
      rollEtikett: "",
      namn: utforare[1].namn,
      signaturer: normaliseraBankIdSignaturer(slut.utforare2),
    });
  }
  if (d.underentreprenorNamn?.trim()) {
    out.push({
      id: skapaSignerareId(),
      roll: "underentreprenor_arbetsledare",
      rollEtikett: "",
      namn: d.underentreprenorNamn.trim(),
      signaturer: normaliseraBankIdSignaturer(slut.underentreprenor),
    });
  }
  if (d.huvudentreprenorNamn?.trim()) {
    out.push({
      id: skapaSignerareId(),
      roll: "huvudentreprenor_arbetsledare",
      rollEtikett: "",
      namn: d.huvudentreprenorNamn.trim(),
      signaturer: normaliseraBankIdSignaturer(slut.huvudentreprenor),
    });
  }
  return out;
}

function normaliseraSignerare(raw: unknown): EgenkontrollSignerare[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((s) => s && typeof s === "object")
    .map((s) => {
      const x = s as Partial<EgenkontrollSignerare>;
      const roll =
        x.roll === "utforare" ||
        x.roll === "underentreprenor_arbetsledare" ||
        x.roll === "huvudentreprenor_arbetsledare" ||
        x.roll === "ovrig"
          ? x.roll
          : "ovrig";
      return {
        id: x.id ?? skapaSignerareId(),
        roll,
        rollEtikett: x.rollEtikett ?? "",
        namn: x.namn ?? "",
        signaturer: normaliseraBankIdSignaturer(x.signaturer),
      };
    });
}

export function skapaPunkterFranVvsMall(): EgenkontrollPunkt[] {
  return VVS_EGENKONTROLL_PUNKTER.map((p) => ({
    id: skapaEgenkontrollPunktId(),
    rubrik: p.rubrik,
    beskrivning: p.beskrivning,
    amaNot: p.amaNot,
    aktuell: true,
    status: "opåbörjad" as const,
    kontrollDatum: "",
    kommentar: "",
    attestInitialer: "",
    avvikelseNr: null,
  }));
}

/** Fyller i VVS-standardpunkter om listan saknas (äldre kopior / skapade utan formulär). */
export function säkerstallEgenkontrollPunkter(
  state: EgenkontrollState,
): EgenkontrollState {
  const aktuella = state.punkter.filter((p) => p.aktuell && p.rubrik.trim());
  if (aktuella.length > 0) return state;
  return { ...state, punkter: skapaPunkterFranVvsMall() };
}

export function skapaVvsEgenkontroll(input: {
  huvudentreprenorNamn: string;
  huvudArbetsledareNamn?: string;
  underentreprenorNamn?: string;
  underArbetsledareNamn?: string;
  utforareNamn: string[];
}): EgenkontrollState {
  const utforare = input.utforareNamn
    .map((namn) => namn.trim())
    .filter(Boolean)
    .slice(0, 2)
    .map((namn) => ({ id: skapaUtforareId(), namn }));

  const kontrollanter: EgenkontrollKontrollant[] = utforare.map((u) => ({
    id: u.id,
    namn: u.namn,
    initialer: "",
    signaturer: [],
  }));

  return {
    bransch: "vvs",
    huvudentreprenorNamn: input.huvudentreprenorNamn.trim(),
    underentreprenorNamn: input.underentreprenorNamn?.trim() ?? "",
    utforare,
    kontrollanter,
    punkter: skapaPunkterFranVvsMall(),
    signerare: byggSignerareFranSkapa({
      huvudentreprenorNamn: input.huvudentreprenorNamn,
      huvudArbetsledareNamn: input.huvudArbetsledareNamn ?? "",
      underentreprenorNamn: input.underentreprenorNamn,
      underArbetsledareNamn: input.underArbetsledareNamn,
      utforareNamn: input.utforareNamn,
    }),
  };
}

export function normaliseraEgenkontroll(raw: unknown): EgenkontrollState | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const d = raw as Partial<EgenkontrollState>;
  if (d.bransch !== "vvs") return undefined;

  const utforare = Array.isArray(d.utforare) ? d.utforare : [];
  let signerare = normaliseraSignerare(d.signerare);
  if (signerare.length === 0 && d.slutSignering) {
    signerare = migreraSignerareFranLegacy(d);
  }
  const kontrollanter = normaliseraKontrollanter(
    d.kontrollanter,
    utforare,
    signerare,
  );
  if (kontrollanter.length > 0) {
    signerare = signerare.filter((s) => s.roll !== "utforare");
  }

  const punkter = synkaAvvikelseNummer(
    Array.isArray(d.punkter)
      ? d.punkter.map((p) => normaliseraPunkt(p as Partial<EgenkontrollPunkt>))
      : [],
  );

  const state: EgenkontrollState = {
    bransch: "vvs",
    huvudentreprenorNamn: d.huvudentreprenorNamn ?? "",
    underentreprenorNamn: d.underentreprenorNamn ?? "",
    utforare,
    kontrollanter,
    punkter,
    signerare,
  };
  return säkerstallEgenkontrollPunkter(state);
}

export function arEgenkontrollDokument(dok: ForeningsDokument): boolean {
  return Boolean(dok.egenkontroll) || arEgenkontrollMallId(dok.mallId);
}

export function hamtaEgenkontroll(dok: ForeningsDokument): EgenkontrollState | undefined {
  const norm = normaliseraEgenkontroll(dok.egenkontroll);
  if (norm) return norm;
  if (!arEgenkontrollMallId(dok.mallId)) return undefined;
  return skapaVvsEgenkontroll({
    huvudentreprenorNamn: dok.entreprenor?.namn ?? "",
    huvudArbetsledareNamn: "",
    utforareNamn: [],
  });
}

/** Vid redigering: alltid komplett state inkl. standardpunkter om de saknades. */
export function hamtaEllerSkapaEgenkontrollForDokument(
  dok: ForeningsDokument,
): EgenkontrollState {
  return (
    hamtaEgenkontroll(dok) ??
    skapaVvsEgenkontroll({
      huvudentreprenorNamn: dok.entreprenor?.namn ?? "",
      huvudArbetsledareNamn: "",
      utforareNamn: [],
    })
  );
}

function formatPunktRad(p: EgenkontrollPunkt, index: number): string {
  if (!p.aktuell) return "";
  const utfort = p.status === "utfort" ? "[x]" : "[ ]";
  const avv = p.status === "avvikelse" ? "[x]" : "[ ]";
  const avvNr =
    p.status === "avvikelse" && p.avvikelseNr
      ? `    Avvikelsenummer: ${p.avvikelseNr}`
      : "";
  const sign = p.attestInitialer.trim()
    ? `    Sign (initialer): ${p.attestInitialer}`
    : "    Sign (initialer): —";
  const rader = [
    `${index + 1}. ${p.rubrik}`,
    `    ${utfort} Utfört    ${avv} Avvikelse    Datum: ${p.kontrollDatum || "—"}`,
    sign,
    avvNr,
    `    ${p.beskrivning}`,
  ].filter(Boolean);
  if (p.amaNot) rader.push(`    AMA: ${p.amaNot}`);
  if (p.kommentar.trim()) rader.push(`    Kommentar: ${p.kommentar}`);
  return rader.join("\n");
}

function formatAvvikelseSektion(punkter: EgenkontrollPunkt[]): string {
  const medAvvikelse = punkter.filter(
    (p) => p.aktuell && p.status === "avvikelse",
  );
  if (medAvvikelse.length === 0) {
    return "AVVIKELSER OCH RESERVATIONER\n------------------------------\nInga avvikelser registrerade.\n";
  }
  const rader = medAvvikelse.map((p) => {
    const a = p.avvikelse ?? tomAvvikelseDetalj(p.avvikelseNr ?? 0);
    const nr = p.avvikelseNr ?? a.nr;
    return [
      `AVVIKELSE ${nr} — ${p.rubrik}`,
      `   Avser kontrollpunkt med avvikelsenummer ${nr} ovan.`,
      `   Orsak (varför fullt utförande ej kunnat ske): ${a.orsak || "—"}`,
      `   Reservation: ${a.reservation || "—"}`,
      `   Kommunikation beställare/ombud: ${formateraIsoSomDatumTid(a.tidBeställareKommunikation)}`,
      `   Kommunikation projektledare: ${formateraIsoSomDatumTid(a.tidProjektledareKommunikation)}`,
      `   Återkoppling beställare/ombud: ${a.beställareÅterkoppling || "—"}`,
      `   Tid återkoppling beställare: ${formateraIsoSomDatumTid(a.tidBeställareÅterkoppling)}`,
      `   Återkoppling projektledare: ${a.projektledareÅterkoppling || "—"}`,
      `   Tid återkoppling projektledare: ${formateraIsoSomDatumTid(a.tidProjektledareÅterkoppling)}`,
    ].join("\n");
  });
  return `AVVIKELSER OCH RESERVATIONER\n------------------------------\n${rader.join("\n\n")}\n`;
}

function formatSignering(signerare: EgenkontrollSignerare[]): string {
  if (signerare.length === 0) {
    return `SIGNERING MED BANKID (entreprenörens ansvar)
----------------------------------------
Inga undertecknare angivna ännu. Entreprenör och signering tillkommer vid
tilldelning. Föreningen bör kräva BankID-signatur med datum och tid från
utförare och arbetsledare innan dokumentet godkänns som slutligt underlag.
`;
  }
  const rader = signerare.map((s) => {
    const roll =
      s.roll === "ovrig"
        ? s.rollEtikett.trim() || EGENKONTROLL_ROLL_ETIKETTER.ovrig
        : EGENKONTROLL_ROLL_ETIKETTER[s.roll];
    const sig = s.signaturer[0];
    const tid = sig
      ? new Date(sig.tidpunkt).toLocaleString("sv-SE")
      : "—";
    const bank = sig ? sammanfattaBankIdSignaturer(s.signaturer) : "Ej signerad";
    return `${s.namn} · ${roll}\n   BankID: ${bank}\n   Datum och tid: ${tid}`;
  });
  return `SIGNERING ARBETLEDARE (BankID)\n------------------------------\n${rader.join("\n\n")}\n`;
}

function formatKontrollantSignering(kontrollanter: EgenkontrollKontrollant[]): string {
  if (kontrollanter.length === 0) {
    return `KONTROLLPERSONAL (initialer + BankID)\n-------------------------------------\nIngen personal angiven ännu.\n`;
  }
  const fork = kontrollanter
    .filter((k) => k.initialer.trim())
    .map((k) => `${k.initialer} = ${k.namn || "—"}`)
    .join(", ");
  const rader = kontrollanter.map((k) => {
    const sig = k.signaturer[0];
    const tid = sig
      ? new Date(sig.tidpunkt).toLocaleString("sv-SE")
      : "—";
    const bank = sig ? sammanfattaBankIdSignaturer(k.signaturer) : "Ej signerad";
    return `${k.initialer || "??"} · ${k.namn || "Namn saknas"}\n   BankID: ${bank}\n   Datum och tid: ${tid}`;
  });
  return `KONTROLLPERSONAL (initialer kopplade till BankID)
${fork ? `Förteckning: ${fork}\n` : ""}-------------------------------------
${rader.join("\n\n")}
`;
}

export function byggEgenkontrollText(
  dok: ForeningsDokument,
  ek: EgenkontrollState,
): string {
  const forening = hamtaForeningMallIfyllnad(dok.titel);
  const intro = ifyllForeningsfalt(EGENKONTROLL_VVS_INTRO, forening);
  const aktuella = ek.punkter.filter((p) => p.aktuell);
  const punkterText = aktuella
    .map((p, i) => formatPunktRad(p, i))
    .filter(Boolean)
    .join("\n\n");

  const huvudLabel = ek.huvudentreprenorNamn.trim() || "Ej tilldelad";
  const underLabel = ek.underentreprenorNamn.trim();

  return `${intro}

Förening (beställare): ${forening.foreningsNamn}
Projekt / dokument: ${dok.titel}

ENTREPRENÖRENS HUVUDANSVAR
Huvudentreprenören ansvarar för att egenkontrollen är fullständig, sanningsenlig
och att avvikelser är kommunicerade och återkopplade enligt dokumentet.

Huvudentreprenör: ${huvudLabel}
${underLabel ? `Underentreprenör: ${underLabel}\n` : ""}
KONTROLLPLAN — PUNKTER I UTFÖRANDEORDNING
(Anpassad av föreningen; attest med initialer; avvikelse numreras)
------------------------------------
${punkterText || "(Inga aktuella punkter)"}

${formatAvvikelseSektion(ek.punkter)}
${formatKontrollantSignering(ek.kontrollanter)}
${formatSignering(ek.signerare)}
`;
}

export function hamtaKontrollantForInitialer(
  state: EgenkontrollState,
  initialer: string,
): EgenkontrollKontrollant | undefined {
  const init = normaliseraInitialer(initialer);
  if (!init) return undefined;
  return state.kontrollanter.find((k) => k.initialer === init);
}

export function initialerAnvandaIAttest(state: EgenkontrollState): string[] {
  const set = new Set<string>();
  for (const p of state.punkter) {
    if (!p.aktuell) continue;
    if (p.status === "opåbörjad") continue;
    const init = normaliseraInitialer(p.attestInitialer);
    if (init) set.add(init);
  }
  return [...set];
}

export function avvikelseDetaljerKomplett(p: EgenkontrollPunkt): boolean {
  if (p.status !== "avvikelse") return true;
  const a = p.avvikelse ?? tomAvvikelseDetalj(p.avvikelseNr ?? 0);
  return (
    a.orsak.trim().length > 0 &&
    a.reservation.trim().length > 0 &&
    a.tidBeställareKommunikation.trim().length > 0 &&
    a.tidProjektledareKommunikation.trim().length > 0 &&
    a.beställareÅterkoppling.trim().length > 0 &&
    a.tidBeställareÅterkoppling.trim().length > 0 &&
    a.projektledareÅterkoppling.trim().length > 0 &&
    a.tidProjektledareÅterkoppling.trim().length > 0 &&
    (p.avvikelseNr ?? 0) > 0
  );
}

export function punktAttestKomplett(
  p: EgenkontrollPunkt,
  state: EgenkontrollState,
): boolean {
  if (p.status === "opåbörjad") return false;
  if (!p.kontrollDatum.trim()) return false;
  const init = normaliseraInitialer(p.attestInitialer);
  if (init.length < 2) return false;
  return Boolean(hamtaKontrollantForInitialer(state, init));
}

export function allaAktuellaKontrollerBesvarade(
  state: EgenkontrollState,
): boolean {
  const aktuella = state.punkter.filter((p) => p.aktuell);
  if (aktuella.length === 0) return false;
  return aktuella.every(
    (p) =>
      (p.status === "utfort" || p.status === "avvikelse") &&
      punktAttestKomplett(p, state) &&
      avvikelseDetaljerKomplett(p),
  );
}

export function allaKontrollanterMedAttestHarBankId(
  state: EgenkontrollState,
): boolean {
  const initer = initialerAnvandaIAttest(state);
  if (initer.length === 0) return true;
  return initer.every((init) => {
    const k = hamtaKontrollantForInitialer(state, init);
    return k && harEnkelBankIdSignatur(k.signaturer);
  });
}

export function harEnkelBankIdSignatur(signaturer: BankIdSignatur[]): boolean {
  return signaturer.length >= 1;
}

export function allaSignerareHarSignatur(state: EgenkontrollState): boolean {
  if (state.signerare.length === 0) return false;
  return state.signerare.every((s) => harEnkelBankIdSignatur(s.signaturer));
}

export function harEntreprenorTilldelad(state: EgenkontrollState): boolean {
  return (
    Boolean(state.huvudentreprenorNamn.trim()) ||
    state.kontrollanter.length > 0 ||
    state.utforare.length > 0 ||
    state.signerare.some((s) => s.roll !== "ovrig")
  );
}

export function egenkontrollMallIdForSkapa(mallId: string): boolean {
  return mallId === EGENKONTROLL_VVS_MALL_ID;
}

export type EgenkontrollSkapaInput = {
  huvudentreprenorNamn: string;
  huvudArbetsledareNamn: string;
  underentreprenorNamn: string;
  underArbetsledareNamn: string;
  utforareNamn: string[];
};

export function skapaForeningsDokumentEgenkontroll(
  mall: {
    id: string;
    titel: string;
    filnamn: string;
    omrade: DokumentMallOmrade;
  },
  opts: {
    docTitel: string;
    koppladeProjektId?: string[];
    egenkontrollInput?: EgenkontrollSkapaInput;
  },
): ForeningsDokument {
  const nu = new Date().toISOString();
  const docTitel = opts.docTitel.trim() || mall.titel;
  const input = opts.egenkontrollInput ?? {
    huvudentreprenorNamn: "",
    huvudArbetsledareNamn: "",
    underentreprenorNamn: "",
    underArbetsledareNamn: "",
    utforareNamn: [] as string[],
  };
  const egenkontroll = skapaVvsEgenkontroll({
    huvudentreprenorNamn: input.huvudentreprenorNamn,
    huvudArbetsledareNamn: input.huvudArbetsledareNamn,
    underentreprenorNamn: input.underentreprenorNamn,
    underArbetsledareNamn: input.underArbetsledareNamn,
    utforareNamn: input.utforareNamn,
  });
  const bas: ForeningsDokument = {
    id: skapaForeningsDokumentId(),
    mallId: mall.id,
    mallTitel: mall.titel,
    mallFilnamn: mall.filnamn,
    titel: docTitel,
    status: "utkast",
    skapadDatum: nu,
    uppdateradDatum: nu,
    notering: "",
    omrade: mall.omrade,
    dokumentKalla: "mall",
    layoutTema: STANDARD_DOKUMENT_LAYOUT,
    koppladeProjektId: opts.koppladeProjektId ?? [],
    egenkontroll,
    entreprenor: {
      ...tomDokumentEntreprenor(),
      namn: input.huvudentreprenorNamn,
    },
  };
  bas.innehall = byggEgenkontrollText(bas, egenkontroll);
  return bas;
}

export { EGENKONTROLL_VVS_MALL_ID };
