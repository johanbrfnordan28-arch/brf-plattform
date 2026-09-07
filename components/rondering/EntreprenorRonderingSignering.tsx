"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  allaSchemaMomentGenomforda,
  SigneringSchemaGenomfor,
} from "@/components/rondering/SigneringSchemaGenomfor";
import {
  aktuellPeriod,
  arGiltigRoll,
  formateraPeriod,
  hamtaSignering,
  signeringRollInfo,
  sparaSignering,
  type SigneringMetod,
  type SigneringRoll,
} from "@/components/rondering/signering";
import {
  GRUNDMALL_NAMN,
  lasAktivForeningId,
  lasForeningProfil,
} from "@/lib/forening-registry";

export function EntreprenorRonderingSignering() {
  const searchParams = useSearchParams();
  const rollParam = searchParams.get("roll");
  const periodParam = searchParams.get("period") ?? aktuellPeriod();
  const foreningId =
    searchParams.get("foreningId") ?? lasAktivForeningId();
  const foreningsNamn =
    lasForeningProfil(foreningId)?.namn ?? GRUNDMALL_NAMN;

  const roll: SigneringRoll | null = arGiltigRoll(rollParam) ? rollParam : null;
  const info = roll ? signeringRollInfo[roll] : null;

  const [foretagsnamn, setForetagsnamn] = useState("");
  const [genomfordaPunktIds, setGenomfordaPunktIds] = useState<string[]>([]);
  const [schemaFel, setSchemaFel] = useState<string | null>(null);
  const [klar, setKlar] = useState(false);
  const [metod, setMetod] = useState<SigneringMetod | null>(null);
  const [bankidSteg, setBankidSteg] = useState<"idle" | "pågår" | "klar">("idle");

  const befintlig = roll ? hamtaSignering(roll, periodParam, foreningId) : null;

  const redanSignerad = befintlig?.status === "signerad" || klar;

  function toggleGenomfordPunkt(punktId: string) {
    setSchemaFel(null);
    setGenomfordaPunktIds((current) =>
      current.includes(punktId)
        ? current.filter((id) => id !== punktId)
        : [...current, punktId],
    );
  }

  function valideraSchema(): string | null {
    if (!roll) return "Ogiltig roll.";
    if (!allaSchemaMomentGenomforda(roll, genomfordaPunktIds, foreningId)) {
      return "Bocka i alla moment i schemat innan du signerar.";
    }
    return null;
  }

  function fullforSignering(signMetod: SigneringMetod, filnamn?: string) {
    if (!roll || !foretagsnamn.trim()) return;
    const schemaValidering = valideraSchema();
    if (schemaValidering) {
      setSchemaFel(schemaValidering);
      return;
    }
    sparaSignering(
      {
        roll,
        period: periodParam,
        status: "signerad",
        metod: signMetod,
        signeradDatum: new Date().toLocaleDateString("sv-SE"),
        filnamn,
        foretagsnamn: foretagsnamn.trim(),
        genomfordaPunktIds: [...genomfordaPunktIds],
      },
      foreningId,
    );
    setMetod(signMetod);
    setKlar(true);
    setSchemaFel(null);
  }

  function signeraMedBankId() {
    if (!foretagsnamn.trim()) return;
    const schemaValidering = valideraSchema();
    if (schemaValidering) {
      setSchemaFel(schemaValidering);
      return;
    }
    setBankidSteg("pågår");
    window.setTimeout(() => {
      setBankidSteg("klar");
      fullforSignering("bankid");
    }, 1800);
  }

  function laddaUppSignerat(fil: File | null) {
    if (!fil || !foretagsnamn.trim()) return;
    fullforSignering("uppladdning", fil.name);
  }

  if (!roll || !info) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16">
        <div className="rounded-2xl border border-border bg-surface p-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-foreground">Ogiltig signeringslänk</h1>
          <p className="mt-3 text-sm text-muted">
            Länken ska komma från föreningen och gälla antingen rondering
            (fastighetsskötare) eller städning. Kontakta styrelsen om du behöver
            en ny länk.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-10 sm:py-16">
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <p className="text-xs font-medium uppercase tracking-wide text-primary-dark">
          Månadssignering · endast detta dokument
        </p>
        <h1 className="mt-2 text-2xl font-bold text-foreground">{info.titel}</h1>
        <p className="mt-2 text-sm text-muted">
          {formateraPeriod(periodParam)} · {foreningsNamn}
        </p>

        <div className="mt-6 rounded-xl border border-primary/30 bg-[#eef6f0] p-4 text-sm text-foreground">
          <p className="font-semibold text-primary-dark">{info.dokument}</p>
          <p className="mt-2 text-xs text-muted">
            Du ser inte övriga delar av portalen — bara månadsschemat för{" "}
            {info.entreprenorTyp.toLowerCase()}. Signering görs en gång per månad.
          </p>
        </div>

        {redanSignerad ? (
          <div className="mt-6 rounded-xl border border-border bg-background p-4">
            <p className="font-semibold text-primary-dark">Redan signerat</p>
            <p className="mt-2 text-sm text-foreground">
              {befintlig?.foretagsnamn ?? foretagsnamn} ·{" "}
              {befintlig?.signeradDatum ?? new Date().toLocaleDateString("sv-SE")}
            </p>
            <p className="mt-1 text-sm text-muted">
              Metod:{" "}
              {(befintlig?.metod ?? metod) === "bankid"
                ? "BankID"
                : `Uppladdat dokument${befintlig?.filnamn ? `: ${befintlig.filnamn}` : ""}`}
            </p>
            {befintlig?.genomfordaPunktIds && befintlig.genomfordaPunktIds.length > 0 && (
              <div className="mt-4">
                <SigneringSchemaGenomfor
                  roll={roll}
                  genomforda={befintlig.genomfordaPunktIds}
                  onToggle={() => {}}
                  readonly
                  foreningId={foreningId}
                />
              </div>
            )}
            <p className="mt-4 text-xs text-muted">
              Du kan stänga sidan. Ingen ytterligare åtgärd krävs denna månad.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-6 rounded-xl border border-border bg-background p-4">
              <SigneringSchemaGenomfor
                roll={roll}
                genomforda={genomfordaPunktIds}
                onToggle={toggleGenomfordPunkt}
                foreningId={foreningId}
              />
            </div>

            {schemaFel && (
              <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
                {schemaFel}
              </p>
            )}

            <label className="mt-6 block">
              <span className="text-sm font-medium text-foreground">Företagsnamn</span>
              <input
                type="text"
                required
                value={foretagsnamn}
                onChange={(event) => setForetagsnamn(event.target.value)}
                placeholder="t.ex. Fastighetsservice AB"
                className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
              />
            </label>

            <div className="mt-6 space-y-4">
              <div className="rounded-xl border border-border p-4">
                <p className="text-sm font-semibold text-foreground">Signera med BankID</p>
                <p className="mt-1 text-xs text-muted">
                  Rekommenderat — identitet verifieras och signeringen kopplas till
                  månaden (demo utan riktig BankID-koppling).
                </p>
                <button
                  type="button"
                  disabled={!foretagsnamn.trim() || bankidSteg === "pågår"}
                  onClick={signeraMedBankId}
                  className="mt-3 w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
                >
                  {bankidSteg === "pågår"
                    ? "Öppnar BankID…"
                    : "Signera med BankID"}
                </button>
              </div>

              <div className="rounded-xl border border-dashed border-border p-4">
                <p className="text-sm font-semibold text-foreground">
                  Alternativ: mejla in signerat underlag
                </p>
                <p className="mt-1 text-xs text-muted">
                  Om föreningen begär papper eller PDF — ladda upp det signerade
                  dokumentet här i stället för att mejla (samma månad, samma post).
                </p>
                <label className="mt-3 inline-flex cursor-pointer rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]">
                  Ladda upp signerat dokument
                  <input
                    type="file"
                    accept=".pdf,image/*,.doc,.docx"
                    className="sr-only"
                    disabled={!foretagsnamn.trim()}
                    onChange={(event) => laddaUppSignerat(event.target.files?.[0] ?? null)}
                  />
                </label>
              </div>
            </div>
          </>
        )}
      </div>

      <p className="mt-6 text-center text-xs text-muted">
        Den här sidan är endast för signering. Du loggas inte in i styrelsens portal.
      </p>
    </main>
  );
}
