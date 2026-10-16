"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  hamtaPublikDriftPost,
  lasDriftState,
  sparaDriftState,
  skickaPublikDriftAtgard,
} from "@/components/rondering/drift-avtal-lager";
import { genereraAvtalstext } from "@/components/rondering/drift-avtal-text";
import type { DriftAvtal } from "@/components/rondering/drift-avtal-typer";
import { SigneringSchemaPunktLista } from "@/components/rondering/SigneringSchemaPunktLista";
import { godkannAvtalIState, hamtaAvtalViaToken } from "@/lib/drift-tjanst-logik";
import { signeringRollInfo } from "@/components/rondering/signering";
import {
  GRUNDMALL_NAMN,
  lasAktivForeningId,
  lasForeningProfil,
} from "@/lib/forening-registry";

export function EntreprenorDriftAvtalSignering() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const foreningId =
    searchParams.get("foreningId") ?? lasAktivForeningId();
  const foreningsNamn =
    lasForeningProfil(foreningId)?.namn ?? GRUNDMALL_NAMN;

  const [avtal, setAvtal] = useState<DriftAvtal | null>(null);
  const [laddar, setLaddar] = useState(true);
  const [namn, setNamn] = useState("");
  const [fel, setFel] = useState<string | null>(null);
  const [bankidSteg, setBankidSteg] = useState<"idle" | "pagar" | "klar">("idle");

  useEffect(() => {
    let aktiv = true;
    async function ladda() {
      const lokal = hamtaAvtalViaToken(lasDriftState(foreningId), token);
      if (lokal && aktiv) setAvtal(lokal);
      const remote = await hamtaPublikDriftPost({ foreningId, token });
      if (!aktiv) return;
      if ("typ" in remote && remote.typ === "avtal") {
        setAvtal(remote.avtal);
        const state = lasDriftState(foreningId);
        const utan = state.avtal.filter((a) => a.id !== remote.avtal.id);
        sparaDriftState(
          { ...state, avtal: [remote.avtal, ...utan] },
          foreningId,
          { synkaServer: false },
        );
      } else if (!lokal) {
        setFel("fel" in remote ? remote.fel : "Avtalet hittades inte.");
      }
      setLaddar(false);
    }
    if (token) void ladda();
    else {
      setFel("Ogiltig avtalslänk.");
      setLaddar(false);
    }
    return () => {
      aktiv = false;
    };
  }, [foreningId, token]);

  async function signera() {
    if (!avtal || !namn.trim()) {
      setFel("Ange namn för BankID-signering.");
      return;
    }
    setFel(null);
    setBankidSteg("pagar");
    await new Promise((r) => window.setTimeout(r, 1800));
    const lokal = godkannAvtalIState(
      lasDriftState(foreningId),
      token,
      namn.trim(),
    );
    if (lokal.ok) {
      sparaDriftState(lokal.state, foreningId, { synkaServer: false });
      setAvtal(lokal.avtal);
    }
    const remote = await skickaPublikDriftAtgard({
      foreningId,
      token,
      atgard: "godkann-avtal",
      namn: namn.trim(),
    });
    setBankidSteg("klar");
    if ("fel" in remote && !lokal.ok) {
      setFel(remote.fel);
      setBankidSteg("idle");
    }
  }

  if (laddar) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center text-sm text-muted">
        Laddar avtal…
      </main>
    );
  }

  if (!avtal) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16">
        <div className="rounded-2xl border border-border bg-surface p-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-foreground">Ogiltig avtalslänk</h1>
          <p className="mt-3 text-sm text-muted">
            {fel || "Be styrelsen skicka en ny länk."}
          </p>
        </div>
      </main>
    );
  }

  const info = signeringRollInfo[avtal.roll];
  const godkant = avtal.status === "godkant";

  return (
    <main className="mx-auto max-w-lg px-4 py-10 sm:py-16">
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <p className="text-xs font-medium uppercase tracking-wide text-primary-dark">
          Avtal · {info.dokument}
        </p>
        <h1 className="mt-2 text-2xl font-bold text-foreground">
          Godkänn avtal med BankID
        </h1>
        <p className="mt-2 text-sm text-muted">
          {foreningsNamn} · {avtal.entreprenorNamn}
        </p>

        <pre className="mt-6 max-h-64 overflow-auto whitespace-pre-wrap rounded-xl border border-border bg-background p-4 text-xs text-foreground">
          {genereraAvtalstext(avtal, foreningsNamn)}
        </pre>

        <div className="mt-6">
          <p className="text-sm font-medium text-foreground">Bindande schema</p>
          <div className="mt-3">
            <SigneringSchemaPunktLista
              roll={avtal.roll}
              punkter={avtal.schemaPunkter}
              valdaIds={new Set(avtal.schemaPunkter.map((p) => p.id))}
              onToggle={() => {}}
              readonly
              oppnaAlla
            />
          </div>
        </div>

        {godkant ? (
          <div className="mt-6 rounded-xl border border-border bg-background p-4">
            <p className="font-semibold text-primary-dark">Avtalet är godkänt</p>
            <p className="mt-2 text-sm text-foreground">
              {avtal.godkantNamn} ·{" "}
              {avtal.godkantTidpunkt
                ? new Date(avtal.godkantTidpunkt).toLocaleString("sv-SE")
                : ""}{" "}
              · BankID
            </p>
            <p className="mt-2 text-xs text-muted">
              Styrelsen skickar en kvittenslänk för varje uppdrag. Du kan stänga
              sidan.
            </p>
          </div>
        ) : (
          <>
            <label className="mt-6 block">
              <span className="text-sm font-medium text-foreground">
                Namn vid BankID-signering
              </span>
              <input
                type="text"
                value={namn}
                onChange={(e) => setNamn(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
              />
            </label>
            {fel && (
              <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
                {fel}
              </p>
            )}
            <button
              type="button"
              disabled={!namn.trim() || bankidSteg === "pagar"}
              onClick={() => void signera()}
              className="mt-4 w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
            >
              {bankidSteg === "pagar"
                ? "Öppnar BankID…"
                : "Godkänn avtalet med BankID"}
            </button>
            <p className="mt-2 text-xs text-muted">
              Demo: simulerad BankID tills riktig e-legitimation kopplas för
              dokumentsignering.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
