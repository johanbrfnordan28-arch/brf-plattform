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
import { hamtaAvtalViaToken, signeraDriftAvtalIState } from "@/lib/drift-tjanst-logik";
import { BankIdAvtalSignering } from "@/components/bankid/BankIdAvtalSignering";
import {
  harTillrackligaBankIdSignaturer,
  normaliseraBankIdSignaturer,
  type BankIdSignatur,
} from "@/lib/bankid-signering";
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
  const [fel, setFel] = useState<string | null>(null);

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

  async function signeraForetag(
    signatur: BankIdSignatur,
    personnummerKlartext: string,
  ) {
    setFel(null);
    const lokal = signeraDriftAvtalIState(
      lasDriftState(foreningId),
      token,
      signatur,
    );
    if (!lokal.ok) {
      throw new Error(lokal.fel);
    }
    sparaDriftState(lokal.state, foreningId, { synkaServer: false });
    setAvtal(lokal.avtal);
    const remote = await skickaPublikDriftAtgard({
      foreningId,
      token,
      atgard: "godkann-avtal",
      namn: signatur.namn,
      personnummer: personnummerKlartext,
      part: "foretag",
    });
    if ("fel" in remote) {
      setFel(remote.fel);
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
  const foretagSignaturer = normaliseraBankIdSignaturer(avtal.foretagSignaturer);
  const foreningSignaturer = normaliseraBankIdSignaturer(avtal.foreningSignaturer);
  const foretagKlart = harTillrackligaBankIdSignaturer(foretagSignaturer);

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
              forstaOppen
              enITaget
            />
          </div>
        </div>

        {godkant ? (
          <div className="mt-6 rounded-xl border border-border bg-background p-4">
            <p className="font-semibold text-primary-dark">Avtalet är tecknat</p>
            <p className="mt-2 text-sm text-foreground">
              Två personer i företaget och två i föreningen har signerat med
              BankID.
            </p>
            <p className="mt-2 text-xs text-muted">
              Styrelsen skickar en kvittenslänk för varje uppdrag. Du kan stänga
              sidan.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <BankIdAvtalSignering
              part="foretag"
              partEtikett={avtal.entreprenorNamn || "företaget"}
              signaturer={foretagSignaturer}
              onSignera={signeraForetag}
            />
            {foretagKlart && (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
                Företagets två BankID-signaturer är klara. Nu ska två personer i
                föreningen signera avtalet.
              </p>
            )}
            {foreningSignaturer.length > 0 && (
              <p className="text-sm text-muted">
                Föreningen har {foreningSignaturer.length} av 2 signaturer.
              </p>
            )}
            {fel && (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
                {fel}
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
