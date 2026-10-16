import {
  arDriftState,
  tomDriftState,
  type DriftAvtal,
  type DriftState,
  type DriftUppdrag,
} from "@/components/rondering/drift-avtal-typer";

export function normaliseraDriftState(value: unknown): DriftState {
  const tom = tomDriftState();
  if (!arDriftState(value)) return tom;
  return {
    version: 1,
    avtal: value.avtal,
    offerter: value.offerter,
    uppdrag: value.uppdrag,
    kravBankIdStandard: {
      fastighetsskotare: value.kravBankIdStandard?.fastighetsskotare ?? true,
      stadning: value.kravBankIdStandard?.stadning ?? true,
    },
  };
}

export function hamtaAvtalViaToken(
  state: DriftState,
  token: string,
): DriftAvtal | null {
  return state.avtal.find((a) => a.token === token) ?? null;
}

export function hamtaUppdragViaToken(
  state: DriftState,
  token: string,
): DriftUppdrag | null {
  return state.uppdrag.find((u) => u.token === token) ?? null;
}

export function senasteGodkandaAvtal(
  state: DriftState,
  roll: DriftAvtal["roll"],
): DriftAvtal | null {
  const matchande = state.avtal
    .filter((a) => a.roll === roll && a.status === "godkant")
    .sort((a, b) => (b.godkantTidpunkt ?? "").localeCompare(a.godkantTidpunkt ?? ""));
  return matchande[0] ?? null;
}

export function godkannAvtalIState(
  state: DriftState,
  token: string,
  namn: string,
  tidpunkt = new Date().toISOString(),
): { ok: true; state: DriftState; avtal: DriftAvtal } | { ok: false; fel: string } {
  const avtal = hamtaAvtalViaToken(state, token);
  if (!avtal) return { ok: false, fel: "Avtalet hittades inte." };
  if (avtal.status === "godkant") {
    return { ok: true, state, avtal };
  }
  const uppdaterat: DriftAvtal = {
    ...avtal,
    status: "godkant",
    godkantNamn: namn.trim(),
    godkantTidpunkt: tidpunkt,
  };
  return {
    ok: true,
    avtal: uppdaterat,
    state: {
      ...state,
      avtal: state.avtal.map((a) => (a.id === avtal.id ? uppdaterat : a)),
    },
  };
}

export function kvitteraUppdragIState(
  state: DriftState,
  token: string,
  opts: {
    namn: string;
    metod: "bankid" | "namn";
    genomfordaPunktIds: string[];
    tidpunkt?: string;
  },
): { ok: true; state: DriftState; uppdrag: DriftUppdrag } | { ok: false; fel: string } {
  const uppdrag = hamtaUppdragViaToken(state, token);
  if (!uppdrag) return { ok: false, fel: "Uppdraget hittades inte." };
  const avtal = state.avtal.find((a) => a.id === uppdrag.avtalId);
  if (!avtal) return { ok: false, fel: "Tillhörande avtal saknas." };
  if (avtal.status !== "godkant") {
    return { ok: false, fel: "Avtalet är inte godkänt ännu." };
  }
  if (avtal.kravBankIdKvittens && opts.metod !== "bankid") {
    return { ok: false, fel: "Föreningen kräver BankID för kvittens." };
  }
  const punktIds = avtal.schemaPunkter.map((p) => p.id);
  if (punktIds.length === 0) {
    return { ok: false, fel: "Avtalets schema saknar moment." };
  }
  const gjorda = new Set(opts.genomfordaPunktIds);
  if (!punktIds.every((id) => gjorda.has(id))) {
    return { ok: false, fel: "Bocka i alla moment i schemat innan du kvitterar." };
  }
  if (uppdrag.status === "utfort") {
    return { ok: true, state, uppdrag };
  }
  const uppdaterat: DriftUppdrag = {
    ...uppdrag,
    status: "utfort",
    genomfordaPunktIds: [...opts.genomfordaPunktIds],
    metod: opts.metod,
    signeradNamn: opts.namn.trim(),
    signeradTidpunkt: opts.tidpunkt ?? new Date().toISOString(),
  };
  return {
    ok: true,
    uppdrag: uppdaterat,
    state: {
      ...state,
      uppdrag: state.uppdrag.map((u) => (u.id === uppdrag.id ? uppdaterat : u)),
    },
  };
}
