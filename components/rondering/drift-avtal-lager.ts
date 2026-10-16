import { foreningStorageKey } from "@/lib/foreningStorage";
import { safeSetLocalStorage } from "@/lib/localStorage";
import { hamtaServerAccessNyckel } from "@/lib/forening-server-sync";
import { lasAktivForeningId } from "@/lib/forening-registry";
import type { SigneringRoll } from "@/components/rondering/signering";
import { hamtaAktivaSchemaPunkter } from "@/components/rondering/signering-schema";
import {
  DRIFT_AVTAL_EVENT,
  tomDriftState,
  type DriftAvtal,
  type DriftOffert,
  type DriftState,
  type DriftUppdrag,
} from "@/components/rondering/drift-avtal-typer";
import { normaliseraDriftState } from "@/lib/drift-tjanst-logik";

const STORAGE_BASE = "brf-rondering-drift-avtal";

export function driftAvtalStorageKey(foreningId?: string): string {
  return foreningStorageKey(STORAGE_BASE, foreningId);
}

function nyttId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function nyttToken(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function lasDriftState(foreningId?: string): DriftState {
  if (typeof window === "undefined") return tomDriftState();
  try {
    const raw = localStorage.getItem(driftAvtalStorageKey(foreningId));
    return raw ? normaliseraDriftState(JSON.parse(raw)) : tomDriftState();
  } catch {
    return tomDriftState();
  }
}

export function sparaDriftState(
  state: DriftState,
  foreningId?: string,
  val?: { synkaServer?: boolean },
): void {
  if (typeof window === "undefined") return;
  const normaliserad = normaliseraDriftState(state);
  safeSetLocalStorage(
    driftAvtalStorageKey(foreningId),
    JSON.stringify(normaliserad),
  );
  window.dispatchEvent(new CustomEvent(DRIFT_AVTAL_EVENT));
  if (val?.synkaServer !== false) {
    void synkaDriftStateTillServer(normaliserad, foreningId);
  }
}

async function synkaDriftStateTillServer(
  state: DriftState,
  foreningId?: string,
): Promise<void> {
  const id = foreningId ?? lasAktivForeningId();
  if (!id) return;
  const access = hamtaServerAccessNyckel(id);
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (access) headers["x-access-nyckel"] = access;
  try {
    await fetch(`/api/foreningar/${encodeURIComponent(id)}/drift-tjanst`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ state }),
    });
  } catch {
    /* lokal lagring räcker i demo utan databas */
  }
}

export async function hamtaDriftStateFranServer(
  foreningId?: string,
): Promise<DriftState | null> {
  const id = foreningId ?? lasAktivForeningId();
  if (!id) return null;
  const access = hamtaServerAccessNyckel(id);
  const headers: Record<string, string> = {};
  if (access) headers["x-access-nyckel"] = access;
  try {
    const res = await fetch(
      `/api/foreningar/${encodeURIComponent(id)}/drift-tjanst`,
      { headers },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { state?: unknown | null };
    if (!data.state) return null;
    return normaliseraDriftState(data.state);
  } catch {
    return null;
  }
}

export function sattKravBankId(
  roll: SigneringRoll,
  krav: boolean,
  foreningId?: string,
): void {
  const state = lasDriftState(foreningId);
  sparaDriftState(
    {
      ...state,
      kravBankIdStandard: { ...state.kravBankIdStandard, [roll]: krav },
    },
    foreningId,
  );
}

export function skapaOffert(
  data: {
    roll: SigneringRoll;
    entreprenorNamn: string;
    entreprenorEpost: string;
    meddelande: string;
  },
  foreningId?: string,
): DriftOffert {
  const state = lasDriftState(foreningId);
  const offert: DriftOffert = {
    id: nyttId("offert"),
    roll: data.roll,
    entreprenorNamn: data.entreprenorNamn.trim(),
    entreprenorEpost: data.entreprenorEpost.trim(),
    meddelande: data.meddelande.trim(),
    skapadTidpunkt: new Date().toISOString(),
  };
  sparaDriftState({ ...state, offerter: [offert, ...state.offerter] }, foreningId);
  return offert;
}

export function skapaAvtal(
  data: {
    roll: SigneringRoll;
    entreprenorNamn: string;
    entreprenorEpost: string;
    offertMeddelande: string;
    kravBankIdKvittens: boolean;
  },
  foreningId?: string,
): DriftAvtal {
  const schemaPunkter = hamtaAktivaSchemaPunkter(data.roll, foreningId);
  const state = lasDriftState(foreningId);
  const avtal: DriftAvtal = {
    id: nyttId("avtal"),
    roll: data.roll,
    status: "skickat",
    schemaPunkter,
    kravBankIdKvittens: data.kravBankIdKvittens,
    entreprenorNamn: data.entreprenorNamn.trim(),
    entreprenorEpost: data.entreprenorEpost.trim(),
    offertMeddelande: data.offertMeddelande.trim(),
    token: nyttToken(),
    skapadTidpunkt: new Date().toISOString(),
  };
  sparaDriftState({ ...state, avtal: [avtal, ...state.avtal] }, foreningId);
  return avtal;
}

export function skapaUppdrag(
  data: {
    avtalId: string;
    utforandedatum: string;
    anteckning?: string;
  },
  foreningId?: string,
): DriftUppdrag | { fel: string } {
  const state = lasDriftState(foreningId);
  const avtal = state.avtal.find((a) => a.id === data.avtalId);
  if (!avtal) return { fel: "Avtalet hittades inte." };
  if (avtal.status !== "godkant") {
    return { fel: "Entreprenören måste godkänna avtalet innan uppdrag skapas." };
  }
  const datum = data.utforandedatum.trim();
  const redan = state.uppdrag.find(
    (u) => u.avtalId === avtal.id && u.utforandedatum === datum,
  );
  if (redan) return redan;
  const uppdrag: DriftUppdrag = {
    id: nyttId("uppdrag"),
    avtalId: avtal.id,
    roll: avtal.roll,
    utforandedatum: datum,
    anteckning: data.anteckning?.trim() ?? "",
    status: "vantar",
    token: nyttToken(),
    skapadTidpunkt: new Date().toISOString(),
  };
  sparaDriftState({ ...state, uppdrag: [uppdrag, ...state.uppdrag] }, foreningId);
  return uppdrag;
}

export function skapaAvtalLank(avtal: DriftAvtal, foreningId?: string): string {
  const fid = foreningId ?? lasAktivForeningId();
  const params = new URLSearchParams({
    token: avtal.token,
    foreningId: fid,
  });
  const path = `/signering/drift-avtal?${params.toString()}`;
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path}`;
}

export function skapaUppdragLank(
  uppdrag: DriftUppdrag,
  foreningId?: string,
): string {
  const fid = foreningId ?? lasAktivForeningId();
  const params = new URLSearchParams({
    uppdragId: uppdrag.id,
    token: uppdrag.token,
    foreningId: fid,
  });
  const path = `/signering/rondering?${params.toString()}`;
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path}`;
}

export async function hamtaPublikDriftPost(opts: {
  foreningId: string;
  token: string;
}): Promise<
  | { typ: "avtal"; avtal: DriftAvtal }
  | { typ: "uppdrag"; uppdrag: DriftUppdrag; avtal: DriftAvtal | null }
  | { fel: string }
> {
  try {
    const res = await fetch(
      `/api/foreningar/${encodeURIComponent(opts.foreningId)}/drift-tjanst/publik?token=${encodeURIComponent(opts.token)}`,
    );
    const data = (await res.json()) as {
      fel?: string;
      typ?: string;
      avtal?: DriftAvtal;
      uppdrag?: DriftUppdrag;
    };
    if (!res.ok) return { fel: data.fel || "Kunde inte hämta." };
    if (data.typ === "avtal" && data.avtal) {
      return { typ: "avtal", avtal: data.avtal };
    }
    if (data.typ === "uppdrag" && data.uppdrag) {
      return {
        typ: "uppdrag",
        uppdrag: data.uppdrag,
        avtal: data.avtal ?? null,
      };
    }
    return { fel: "Ogiltigt svar." };
  } catch {
    return { fel: "Kunde inte nå servern." };
  }
}

export async function skickaPublikDriftAtgard(opts: {
  foreningId: string;
  token: string;
  atgard: "godkann-avtal" | "kvittera-uppdrag";
  namn: string;
  metod?: "bankid" | "namn";
  genomfordaPunktIds?: string[];
}): Promise<{ ok: true } | { fel: string }> {
  try {
    const res = await fetch(
      `/api/foreningar/${encodeURIComponent(opts.foreningId)}/drift-tjanst/publik`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: opts.token,
          atgard: opts.atgard,
          namn: opts.namn,
          metod: opts.metod,
          genomfordaPunktIds: opts.genomfordaPunktIds,
        }),
      },
    );
    const data = (await res.json()) as { fel?: string };
    if (!res.ok) return { fel: data.fel || "Kunde inte spara." };
    return { ok: true };
  } catch {
    return { fel: "Kunde inte nå servern." };
  }
}

export function formateraUppdragsDatum(isoDatum: string): string {
  const [ar, manad, dag] = isoDatum.split("-");
  if (!ar || !manad || !dag) return isoDatum;
  return `${dag}/${manad} ${ar}`;
}
