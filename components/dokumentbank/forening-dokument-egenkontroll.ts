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

export type EgenkontrollPunktStatus = "opåbörjad" | "ok" | "avvikelse";

export type EgenkontrollPunkt = {
  id: string;
  rubrik: string;
  beskrivning: string;
  amaNot?: string;
  /** False = borttagen / ej aktuell */
  aktuell: boolean;
  status: EgenkontrollPunktStatus;
  kontrollDatum: string;
  kommentar: string;
  /** Namn på den som markerade OK (valfritt) */
  utförareNamn: string;
};

export type EgenkontrollUtforare = {
  id: string;
  namn: string;
};

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
  slutSignering: EgenkontrollSlutSignering;
};

export function skapaEgenkontrollPunktId(): string {
  return `ekp-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
}

export function skapaUtforareId(): string {
  return `eku-${Math.random().toString(36).slice(2, 8)}`;
}

export function tomSlutSignering(): EgenkontrollSlutSignering {
  return {
    utforare1: [],
    utforare2: [],
    underentreprenor: [],
    huvudentreprenor: [],
  };
}

export function skapaVvsEgenkontroll(input: {
  huvudentreprenorNamn: string;
  underentreprenorNamn?: string;
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
    punkter: VVS_EGENKONTROLL_PUNKTER.map((p) => ({
      id: skapaEgenkontrollPunktId(),
      rubrik: p.rubrik,
      beskrivning: p.beskrivning,
      amaNot: p.amaNot,
      aktuell: true,
      status: "opåbörjad",
      kontrollDatum: "",
      kommentar: "",
      utförareNamn: "",
    })),
    slutSignering: tomSlutSignering(),
  };
}

export function normaliseraEgenkontroll(raw: unknown): EgenkontrollState | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const d = raw as Partial<EgenkontrollState>;
  if (d.bransch !== "vvs") return undefined;
  const slut = d.slutSignering ?? tomSlutSignering();
  return {
    bransch: "vvs",
    huvudentreprenorNamn: d.huvudentreprenorNamn ?? "",
    underentreprenorNamn: d.underentreprenorNamn ?? "",
    utforare: Array.isArray(d.utforare) ? d.utforare : [],
    punkter: Array.isArray(d.punkter) ? d.punkter : [],
    slutSignering: {
      utforare1: normaliseraBankIdSignaturer(slut.utforare1),
      utforare2: normaliseraBankIdSignaturer(slut.utforare2),
      underentreprenor: normaliseraBankIdSignaturer(slut.underentreprenor),
      huvudentreprenor: normaliseraBankIdSignaturer(slut.huvudentreprenor),
    },
  };
}

export function arEgenkontrollDokument(dok: ForeningsDokument): boolean {
  return Boolean(dok.egenkontroll) || arEgenkontrollMallId(dok.mallId);
}

export function hamtaEgenkontroll(dok: ForeningsDokument): EgenkontrollState | undefined {
  return normaliseraEgenkontroll(dok.egenkontroll);
}

function formatPunktRad(p: EgenkontrollPunkt, index: number): string {
  if (!p.aktuell) return "";
  const status =
    p.status === "ok"
      ? "OK"
      : p.status === "avvikelse"
        ? "AVVIKELSE"
        : "—";
  const rader = [
    `${index + 1}. ${p.rubrik}`,
    `   Status: ${status}${p.kontrollDatum ? ` · ${p.kontrollDatum}` : ""}`,
    `   ${p.beskrivning}`,
  ];
  if (p.amaNot) rader.push(`   AMA: ${p.amaNot}`);
  if (p.utförareNamn) rader.push(`   Kontrollerad av: ${p.utförareNamn}`);
  if (p.kommentar) rader.push(`   Kommentar: ${p.kommentar}`);
  return rader.join("\n");
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

  const sign = ek.slutSignering;
  const signBlock = [
    "",
    "SLUTSIGNERING (BankID)",
    "----------------------",
    ...ek.utforare.map((u, i) => {
      const sig =
        i === 0 ? sign.utforare1 : sign.utforare2;
      return `Utförare ${i + 1} (${u.namn}): ${sammanfattaBankIdSignaturer(sig) || "—"}`;
    }),
    ek.underentreprenorNamn
      ? `Underentreprenör (${ek.underentreprenorNamn}): ${sammanfattaBankIdSignaturer(sign.underentreprenor) || "—"}`
      : "",
    `Huvudentreprenör (${ek.huvudentreprenorNamn}): ${sammanfattaBankIdSignaturer(sign.huvudentreprenor) || "—"}`,
  ]
    .filter(Boolean)
    .join("\n");

  return `${intro}

Förening: ${forening.foreningsNamn}
Projekt: ${dok.titel}
Huvudentreprenör: ${ek.huvudentreprenorNamn}
${ek.underentreprenorNamn ? `Underentreprenör: ${ek.underentreprenorNamn}\n` : ""}
KONTROLLPUNKTER
---------------
${punkterText || "(Inga aktuella punkter)"}
${signBlock}
`;
}

export function egenkontrollMallIdForSkapa(mallId: string): boolean {
  return mallId === EGENKONTROLL_VVS_MALL_ID;
}

export function allaAktuellaKontrollerBesvarade(punkter: EgenkontrollPunkt[]): boolean {
  const aktuella = punkter.filter((p) => p.aktuell);
  if (aktuella.length === 0) return false;
  return aktuella.every(
    (p) =>
      p.status !== "opåbörjad" &&
      p.kontrollDatum.trim().length > 0,
  );
}

export function harEnkelBankIdSignatur(signaturer: BankIdSignatur[]): boolean {
  return signaturer.length >= 1;
}

export { EGENKONTROLL_VVS_MALL_ID };
