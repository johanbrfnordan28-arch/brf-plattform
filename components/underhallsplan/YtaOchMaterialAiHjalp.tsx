"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { GoogleKartLankar } from "@/components/underhallsplan/GoogleKartLankar";
import { hamtaPrimarAdress } from "@/components/underhallsplan/kart-lankar";
import type { KomponentDetaljData } from "@/components/underhallsplan/komponentregister";
import type { Grunduppgifter } from "@/components/underhallsplan/types";
import { YtaMatningCanvas } from "@/components/underhallsplan/YtaMatningCanvas";
import { beraknaYtaAiHjalp } from "@/components/underhallsplan/yta-ai-hjalp";

type YtaOchMaterialAiHjalpProps = {
  typ: "Tak" | "Fasad";
  grund: Grunduppgifter;
  komponentData?: KomponentDetaljData;
  registerKvm?: string;
  onApplyKvm?: (kvm: string) => void;
};

export function YtaOchMaterialAiHjalp({
  typ,
  grund,
  komponentData,
  registerKvm = "",
  onApplyKvm,
}: YtaOchMaterialAiHjalpProps) {
  const [oppet, setOppet] = useState(false);
  const [bildUrl, setBildUrl] = useState<string | null>(null);
  const [bildNamn, setBildNamn] = useState<string | null>(null);
  const [canvasKvm, setCanvasKvm] = useState<number | null>(null);
  const [visarResultat, setVisarResultat] = useState(false);
  const filRef = useRef<HTMLInputElement>(null);

  const adress = hamtaPrimarAdress(grund.adresser);
  const kartKontext = typ === "Tak" ? "tak" : "fasad";

  const uppmattKvm = useMemo(() => {
    const manuell = Number.parseFloat(registerKvm.replace(",", "."));
    if (Number.isFinite(manuell) && manuell > 0) return manuell;
    return canvasKvm;
  }, [registerKvm, canvasKvm]);

  const resultat = useMemo(
    () =>
      beraknaYtaAiHjalp({
        typ,
        grund,
        komponentData,
        uppmattKvm: canvasKvm ?? uppmattKvm,
      }),
    [typ, grund, komponentData, canvasKvm, uppmattKvm],
  );

  const handleFil = useCallback((file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      setBildUrl(typeof reader.result === "string" ? reader.result : null);
      setBildNamn(file.name);
      setCanvasKvm(null);
    };
    reader.readAsDataURL(file);
  }, []);

  function beOmHjalp() {
    setOppet(true);
    setVisarResultat(true);
  }

  function anvandCanvas() {
    if (canvasKvm == null || !onApplyKvm) return;
    onApplyKvm(String(Math.round(canvasKvm * 10) / 10));
  }

  function anvandAiKvm() {
    if (resultat.kvmForslag == null || !onApplyKvm) return;
    onApplyKvm(String(resultat.kvmForslag));
  }

  return (
    <div className="rounded-xl border border-[#b8d4c4] bg-[#f7fbf8] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-primary-dark">
            AI- och kartstöd — {typ.toLowerCase()}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Google Earth (tak), Street View (fasad mot gata) och egen bild. Hjälpen
            är ett förslag — styrelsen bedömer alltid själv.
          </p>
        </div>
        <button
          type="button"
          onClick={beOmHjalp}
          className="shrink-0 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark"
        >
          Be om hjälp med ytor, antal och material
        </button>
      </div>

      {oppet && (
        <div className="mt-4 space-y-4 border-t border-[#d4e8da] pt-4">
          <GoogleKartLankar adress={adress} kontext={kartKontext} />

          <div className="rounded-lg border border-dashed border-border bg-white/80 p-3">
            <p className="text-xs font-semibold text-foreground">
              Egen bild (skärmbild från Earth, Maps eller foto)
            </p>
            <p className="mt-1 text-[10px] text-muted">
              Ladda upp en bild och mät yta med skalverktyget — alternativ till att
              läsa av m² direkt i Google Earth.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <input
                ref={filRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  handleFil(e.target.files?.[0] ?? null);
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                onClick={() => filRef.current?.click()}
                className="rounded-lg border border-primary px-3 py-1.5 text-xs font-medium text-primary-dark hover:bg-[#e2f0e6]"
              >
                Ladda upp bild
              </button>
              {bildNamn && (
                <span className="text-xs text-muted truncate max-w-[12rem]">
                  {bildNamn}
                </span>
              )}
              {bildUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setBildUrl(null);
                    setBildNamn(null);
                    setCanvasKvm(null);
                  }}
                  className="text-xs text-muted hover:text-red-700"
                >
                  Ta bort bild
                </button>
              )}
            </div>
            {bildUrl && (
              <div className="mt-3">
                <YtaMatningCanvas imageUrl={bildUrl} onKvmChange={setCanvasKvm} />
                {canvasKvm != null && (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-primary-dark">
                      Uppmätt på bild: {canvasKvm.toLocaleString("sv-SE")} m²
                    </p>
                    {onApplyKvm && (
                      <button
                        type="button"
                        onClick={anvandCanvas}
                        className="rounded border border-primary px-2 py-1 text-xs font-medium text-primary-dark hover:bg-[#e2f0e6]"
                      >
                        Använd i register
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {visarResultat && (
            <div
              className="rounded-lg border border-primary/30 bg-white p-3 sm:p-4"
              role="status"
            >
              <p className="text-sm font-semibold text-primary-dark">
                {resultat.titel}
              </p>
              <p className="mt-1 text-xs text-muted">{resultat.kvmForklaring}</p>

              {resultat.kvmForslag != null && (
                <p className="mt-2 text-lg font-bold text-foreground">
                  Föreslagen yta:{" "}
                  {resultat.kvmForslag.toLocaleString("sv-SE")} m²
                  {onApplyKvm && (
                    <button
                      type="button"
                      onClick={anvandAiKvm}
                      className="ml-3 text-sm font-semibold text-primary-dark underline"
                    >
                      Använd i register
                    </button>
                  )}
                </p>
              )}

              {resultat.material.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-muted">Material</p>
                  <ul className="mt-1 list-inside list-disc text-xs text-foreground">
                    {resultat.material.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}

              {resultat.antal.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-muted">
                    Antal (förslag)
                  </p>
                  <ul className="mt-1 space-y-1 text-xs">
                    {resultat.antal.map((a) => (
                      <li key={a.etikett} className="rounded bg-background px-2 py-1">
                        <span className="font-medium">{a.etikett}:</span>{" "}
                        {a.forslag} —{" "}
                        <span className="text-muted">{a.forklaring}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {resultat.steg.length > 0 && (
                <ol className="mt-3 list-decimal space-y-0.5 pl-4 text-xs text-muted">
                  {resultat.steg.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ol>
              )}

              <p className="mt-3 text-[10px] text-muted">
                Mer detaljerat kartstöd och historik per år finns i steg 5 (Bildstöd).
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={() => setOppet(false)}
            className="text-xs font-medium text-muted hover:text-foreground"
          >
            Stäng hjälppanelen
          </button>
        </div>
      )}
    </div>
  );
}
