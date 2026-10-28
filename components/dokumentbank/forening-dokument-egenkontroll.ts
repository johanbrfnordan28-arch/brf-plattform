import type { ForeningsDokument } from "@/components/dokumentbank/forening-dokumenter-lager";
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
  orsak: string;
  reservation: string;
  /** Datum då projektledare / ansvarig chef fått information */
  datumChefInformed: string;
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
  avvikelse?: EgenkontrollAvvikelseDetalj;
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

export function skapaSignerareId(): string {
  return `eks-${Math.random().toString(36).slice(2, 8)}`;
}

export function tomAvvikelseDetalj(): EgenkontrollAvvikelseDetalj {
  return { orsak: "", reservation: "", datumChefInformed: "" };
}

function normaliseraPunktStatus(raw: string | undefined): EgenkontrollPunktStatus {
  if (raw === "utfort" || raw === "avvikelse" || raw === "opåbörjad") return raw;
  if (raw === "ok") return "utfort";
  return "opåbörjad";
}

function normaliseraPunkt(p: Partial<EgenkontrollPunkt>): EgenkontrollPunkt {
  const status = normaliseraPunktStatus(p.status);
  const avvikelseRaw = p.avvikelse;
  const avvikelse =
    status === "avvikelse"
      ? {
          orsak: avvikelseRaw?.orsak ?? "",
          reservation: avvikelseRaw?.reservation ?? "",
          datumChefInformed: avvikelseRaw?.datumChefInformed ?? "",
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
    avvikelse,
  };
}

function byggSignerareFranSkapa(input: {
  huvudentreprenorNamn: string;
  huvudArbetsledareNamn: string;
  underentreprenorNamn?: string;
  underArbetsledareNamn?: string;
  utforareNamn: string[];
}): EgenkontrollSignerare[] {
  const lista: EgenkontrollSignerare[] = input.utforareNamn
    .map((namn) => namn.trim())
    .filter(Boolean)
    .slice(0, 2)
    .map((namn) => ({
      id: skapaSignerareId(),
      roll: "utforare" as const,
      rollEtikett: "",
      namn,
      signaturer: [],
    }));

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

  return {
    bransch: "vvs",
    huvudentreprenorNamn: input.huvudentreprenorNamn.trim(),
    underentreprenorNamn: input.underentreprenorNamn?.trim() ?? "",
    utforare,
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

  let signerare = normaliseraSignerare(d.signerare);
  if (signerare.length === 0 && d.slutSignering) {
    signerare = migreraSignerareFranLegacy(d);
  }

  const punkter = Array.isArray(d.punkter)
    ? d.punkter.map((p) => normaliseraPunkt(p as Partial<EgenkontrollPunkt>))
    : [];

  const state: EgenkontrollState = {
    bransch: "vvs",
    huvudentreprenorNamn: d.huvudentreprenorNamn ?? "",
    underentreprenorNamn: d.underentreprenorNamn ?? "",
    utforare: Array.isArray(d.utforare) ? d.utforare : [],
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
  const rader = [
    `${index + 1}. ${p.rubrik}`,
    `    ${utfort} Utfört    ${avv} Avvikelse    Datum: ${p.kontrollDatum || "—"}`,
    `    ${p.beskrivning}`,
  ];
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
  const rader = medAvvikelse.map((p, i) => {
    const a = p.avvikelse ?? tomAvvikelseDetalj();
    return [
      `${i + 1}. ${p.rubrik}`,
      `   Orsak (varför fullt utförande ej kunnat ske): ${a.orsak || "—"}`,
      `   Reservation: ${a.reservation || "—"}`,
      `   Projektledare / ansvarig chef informerad: ${a.datumChefInformed || "—"}`,
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
  return `SIGNERING (BankID)\n------------------\n${rader.join("\n\n")}\n`;
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

  const utforareLabel =
    ek.utforare.map((u) => u.namn).join(", ") || "Tillkommer vid tilldelning av entreprenör";
  const huvudLabel = ek.huvudentreprenorNamn.trim() || "Ej tilldelad";
  const underLabel = ek.underentreprenorNamn.trim();

  return `${intro}

Förening (beställare): ${forening.foreningsNamn}
Projekt / dokument: ${dok.titel}

ENTREPRENÖR (ifylls när tilldelning skett)
Huvudentreprenör: ${huvudLabel}
${underLabel ? `Underentreprenör: ${underLabel}\n` : ""}Utförare som attesterar kontroller: ${utforareLabel}

KONTROLLPLAN — PUNKTER I UTFÖRANDEORDNING
(Anpassad av föreningen; ifylls och attesteras av entreprenören)
------------------------------------
${punkterText || "(Inga aktuella punkter)"}

${formatAvvikelseSektion(ek.punkter)}
${formatSignering(ek.signerare)}
`;
}

export function avvikelseDetaljerKomplett(p: EgenkontrollPunkt): boolean {
  if (p.status !== "avvikelse") return true;
  const a = p.avvikelse ?? tomAvvikelseDetalj();
  return (
    a.orsak.trim().length > 0 &&
    a.reservation.trim().length > 0 &&
    a.datumChefInformed.trim().length > 0
  );
}

export function allaAktuellaKontrollerBesvarade(punkter: EgenkontrollPunkt[]): boolean {
  const aktuella = punkter.filter((p) => p.aktuell);
  if (aktuella.length === 0) return false;
  return aktuella.every(
    (p) =>
      (p.status === "utfort" || p.status === "avvikelse") &&
      p.kontrollDatum.trim().length > 0 &&
      avvikelseDetaljerKomplett(p),
  );
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
    state.utforare.length > 0 ||
    state.signerare.some((s) => s.roll !== "ovrig")
  );
}

export function egenkontrollMallIdForSkapa(mallId: string): boolean {
  return mallId === EGENKONTROLL_VVS_MALL_ID;
}

export { EGENKONTROLL_VVS_MALL_ID };
