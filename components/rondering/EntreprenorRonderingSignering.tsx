"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SigneringSchemaGenomfor } from "@/components/rondering/SigneringSchemaGenomfor";
import {
  hamtaPublikDriftPost,
  lasDriftState,
  sparaDriftState,
  skickaPublikDriftAtgard,
  formateraUppdragsDatum,
} from "@/components/rondering/drift-avtal-lager";
import type { DriftAvtal, DriftUppdrag } from "@/components/rondering/drift-avtal-typer";
import {
  hamtaUppdragViaToken,
  kvitteraUppdragIState,
} from "@/lib/drift-tjanst-logik";
import { signeringRollInfo } from "@/components/rondering/signering";
import {
  GRUNDMALL_NAMN,
  lasAktivForeningId,
  lasForeningProfil,
} from "@/lib/forening-registry";

export function EntreprenorRonderingSignering() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const foreningId =
    searchParams.get("foreningId") ?? lasAktivForeningId();
  const foreningsNamn =
    lasForeningProfil(foreningId)?.namn ?? GRUNDMALL_NAMN;

  const [uppdrag, setUppdrag] = useState<DriftUppdrag | null>(null);
  const [avtal, setAvtal] = useState<DriftAvtal | null>(null);
  const [laddar, setLaddar] = useState(true);
  const [namn, setNamn] = useState("");
  const [genomfordaPunktIds, setGenomfordaPunktIds] = useState<string[]>([]);
  const [schemaFel, setSchemaFel] = useState<string | null>(null);
  const [bankidSteg, setBankidSteg] = useState<"idle" | "pagar" | "klar">("idle");

  useEffect(() => {
    let aktiv = true;
    async function ladda() {
      const lokalState = lasDriftState(foreningId);
      const lokalUppdrag = hamtaUppdragViaToken(lokalState, token);
      const lokalAvtal = lokalUppdrag
        ? lokalState.avtal.find((a) => a.id === lokalUppdrag.avtalId) ?? null
        : null;
      if (lokalUppdrag && aktiv) {
        setUppdrag(lokalUppdrag);
        setAvtal(lokalAvtal);
        if (lokalUppdrag.genomfordaPunktIds) {
          setGenomfordaPunktIds(lokalUppdrag.genomfordaPunktIds);
        }
      }
      const remote = await hamtaPublikDriftPost({ foreningId, token });
      if (!aktiv) return;
      if ("typ" in remote && remote.typ === "uppdrag") {
        setUppdrag(remote.uppdrag);
        setAvtal(remote.avtal);
        if (remote.uppdrag.genomfordaPunktIds) {
          setGenomfordaPunktIds(remote.uppdrag.genomfordaPunktIds);
        }
        const state = lasDriftState(foreningId);
        sparaDriftState(
          {
            ...state,
            uppdrag: [
              remote.uppdrag,
              ...state.uppdrag.filter((u) => u.id !== remote.uppdrag.id),
            ],
            avtal: remote.avtal
              ? [
                  remote.avtal,
                  ...state.avtal.filter((a) => a.id !== remote.avtal!.id),
                ]
              : state.avtal,
          },
          foreningId,
          { synkaServer: false },
        );
      } else if (!lokalUppdrag) {
        setSchemaFel(
          "fel" in remote
            ? remote.fel
            : "Uppdraget hittades inte. Be styrelsen skicka en kvittenslänk för uppdraget.",
        );
      }
      setLaddar(false);
    }
    if (token) void ladda();
    else {
      setSchemaFel(
        "Ogiltig länk. Be styrelsen skicka en kvittenslänk för det utförda uppdraget.",
      );
      setLaddar(false);
    }
    return () => {
      aktiv = false;
    };
  }, [foreningId, token]);

  function toggleGenomfordPunkt(punktId: string) {
    setSchemaFel(null);
    setGenomfordaPunktIds((current) =>
      current.includes(punktId)
        ? current.filter((id) => id !== punktId)
        : [...current, punktId],
    );
  }

  async function fullfor(metod: "bankid" | "namn") {
    if (!uppdrag || !avtal || !namn.trim()) return;
    const lokal = kvitteraUppdragIState(lasDriftState(foreningId), token, {
      namn: namn.trim(),
      metod,
      genomfordaPunktIds,
    });
    if (!lokal.ok) {
      setSchemaFel(lokal.fel);
      return;
    }
    sparaDriftState(lokal.state, foreningId, { synkaServer: false });
    setUppdrag(lokal.uppdrag);
    const remote = await skickaPublikDriftAtgard({
      foreningId,
      token,
      atgard: "kvittera-uppdrag",
      namn: namn.trim(),
      metod,
      genomfordaPunktIds,
    });
    if ("fel" in remote && lokal.uppdrag.status !== "utfort") {
      setSchemaFel(remote.fel);
    }
  }

  async function signeraMedBankId() {
    if (!namn.trim()) {
      setSchemaFel("Ange namn för BankID-signering.");
      return;
    }
    setBankidSteg("pagar");
    await new Promise((r) => window.setTimeout(r, 1800));
    await fullfor("bankid");
    setBankidSteg("klar");
  }

  if (laddar) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center text-sm text-muted">
        Laddar uppdrag…
      </main>
    );
  }

  if (!uppdrag || !avtal) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16">
        <div className="rounded-2xl border border-border bg-surface p-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-foreground">Ogiltig kvittenslänk</h1>
          <p className="mt-3 text-sm text-muted">
            {schemaFel ||
              "Länken ska komma från föreningen och gälla ett visst uppdrag. Kontakta styrelsen om du behöver en ny länk."}
          </p>
        </div>
      </main>
    );
  }

  const info = signeringRollInfo[uppdrag.roll];
  const redanSignerad = uppdrag.status === "utfort";
  const kravBankId = avtal.kravBankIdKvittens;

  return (
    <main className="mx-auto max-w-lg px-4 py-10 sm:py-16">
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <p className="text-xs font-medium uppercase tracking-wide text-primary-dark">
          Kvittens av uppdrag · endast detta dokument
        </p>
        <h1 className="mt-2 text-2xl font-bold text-foreground">{info.titel}</h1>
        <p className="mt-2 text-sm text-muted">
          {formateraUppdragsDatum(uppdrag.utforandedatum)} · {foreningsNamn} ·{" "}
          {avtal.entreprenorNamn}
        </p>
        {uppdrag.anteckning ? (
          <p className="mt-1 text-sm text-foreground">{uppdrag.anteckning}</p>
        ) : null}

        <div className="mt-6 rounded-xl border border-primary/30 bg-[#eef6f0] p-4 text-sm text-foreground">
          <p className="font-semibold text-primary-dark">{info.dokument}</p>
          <p className="mt-2 text-xs text-muted">
            Bocka av alla moment enligt avtalet. Kvittensen visar styrelsen att
            uppdraget är utfört.
            {kravBankId ? " Föreningen kräver BankID." : ""}
          </p>
        </div>

        {redanSignerad ? (
          <div className="mt-6 rounded-xl border border-border bg-background p-4">
            <p className="font-semibold text-primary-dark">Uppdraget är kvitterat</p>
            <p className="mt-2 text-sm text-foreground">
              {uppdrag.signeradNamn} ·{" "}
              {uppdrag.signeradTidpunkt
                ? new Date(uppdrag.signeradTidpunkt).toLocaleString("sv-SE")
                : ""}
            </p>
            <p className="mt-1 text-sm text-muted">
              Metod: {uppdrag.metod === "bankid" ? "BankID" : "Namnkvittens"}
            </p>
            <div className="mt-4">
              <SigneringSchemaGenomfor
                roll={uppdrag.roll}
                genomforda={uppdrag.genomfordaPunktIds ?? []}
                onToggle={() => {}}
                readonly
                punkter={avtal.schemaPunkter}
              />
            </div>
          </div>
        ) : (
          <>
            <div className="mt-6 rounded-xl border border-border bg-background p-4">
              <SigneringSchemaGenomfor
                roll={uppdrag.roll}
                genomforda={genomfordaPunktIds}
                onToggle={toggleGenomfordPunkt}
                punkter={avtal.schemaPunkter}
              />
            </div>

            {schemaFel && (
              <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
                {schemaFel}
              </p>
            )}

            <label className="mt-6 block">
              <span className="text-sm font-medium text-foreground">
                Namn vid kvittens
              </span>
              <input
                type="text"
                required
                value={namn}
                onChange={(event) => setNamn(event.target.value)}
                placeholder="För- och efternamn"
                className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
              />
            </label>

            <div className="mt-6 space-y-4">
              <div className="rounded-xl border border-border p-4">
                <p className="text-sm font-semibold text-foreground">
                  Kvittera med BankID
                </p>
                <p className="mt-1 text-xs text-muted">
                  {kravBankId
                    ? "Föreningen kräver BankID för det här avtalet."
                    : "Rekommenderas. Föreningen har inte krävt BankID för kvittens."}
                </p>
                <button
                  type="button"
                  disabled={!namn.trim() || bankidSteg === "pagar"}
                  onClick={() => void signeraMedBankId()}
                  className="mt-3 w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
                >
                  {bankidSteg === "pagar"
                    ? "Öppnar BankID…"
                    : "Kvittera med BankID"}
                </button>
              </div>

              {!kravBankId && (
                <div className="rounded-xl border border-dashed border-border p-4">
                  <p className="text-sm font-semibold text-foreground">
                    Kvittera utan BankID
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Föreningen har valt att BankID inte är krav. Namn och tid
                    sparas ändå.
                  </p>
                  <button
                    type="button"
                    disabled={!namn.trim()}
                    onClick={() => void fullfor("namn")}
                    className="mt-3 w-full rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary-dark hover:bg-[#eef6f0] disabled:opacity-50"
                  >
                    Kvittera uppdraget
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <p className="mt-6 text-center text-xs text-muted">
        Den här sidan är endast för kvittens. Du loggas inte in i styrelsens portal.
      </p>
    </main>
  );
}
