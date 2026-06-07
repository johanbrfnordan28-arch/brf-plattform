"use client";

import { useMemo, useState } from "react";
import { hamtaPrimarAdress } from "@/components/underhallsplan/kart-lankar";
import { GoogleKartLankar } from "@/components/underhallsplan/GoogleKartLankar";
import {
  hamtaRegisterYtaFasad,
  hamtaRegisterYtaTak,
  skillnadProcent,
  type RegisterYtaFasad,
  type RegisterYtaTak,
} from "@/components/underhallsplan/register-ytor";
import type { KomponentDetaljData } from "@/components/underhallsplan/komponentregister";
import { YtaMatningCanvas } from "@/components/underhallsplan/YtaMatningCanvas";
import type { KartYtaData } from "@/components/underhallsplan/bildstod-lager";

type KartYtaHjalpProps = {
  typ: "Tak" | "Fasad";
  adresser: string[];
  bildUrl: string | null;
  boareaKvm: number;
  komponentData: KomponentDetaljData | undefined;
  kartYta: KartYtaData | undefined;
  onKartYtaChange: (data: KartYtaData) => void;
  onOverforTillRegister?: (kvm: number, del?: "gata" | "gard" | "total") => void;
};

export function KartYtaHjalp({
  typ,
  adresser,
  bildUrl,
  boareaKvm,
  komponentData,
  kartYta,
  onKartYtaChange,
  onOverforTillRegister,
}: KartYtaHjalpProps) {
  const adress = hamtaPrimarAdress(adresser);
  const kartKontext = typ === "Tak" ? "tak" : "fasad";

  const registerTak = useMemo(
    () => hamtaRegisterYtaTak(komponentData, boareaKvm > 0 ? boareaKvm : null),
    [komponentData, boareaKvm],
  );
  const registerFasad = useMemo(
    () => hamtaRegisterYtaFasad(komponentData),
    [komponentData],
  );

  const [manuellTotal, setManuellTotal] = useState(
    kartYta?.uppmattTotalKvm != null ? String(kartYta.uppmattTotalKvm) : "",
  );
  const [manuellGata, setManuellGata] = useState(
    kartYta?.uppmattGataKvm != null ? String(kartYta.uppmattGataKvm) : "",
  );
  const [manuellGard, setManuellGard] = useState(
    kartYta?.uppmattGardKvm != null ? String(kartYta.uppmattGardKvm) : "",
  );
  const [antalNotering, setAntalNotering] = useState(kartYta?.antalNotering ?? "");
  const [canvasKvm, setCanvasKvm] = useState<number | null>(null);

  const registerKvm =
    typ === "Tak"
      ? registerTak.takytaKvm ??
        (registerTak.kvmDelar.length === 1 ? registerTak.kvmDelar[0].kvm : null)
      : registerFasad.totalKvm;

  const uppmattKvm = parseKvm(manuellTotal) ?? canvasKvm;
  const skillnad = skillnadProcent(uppmattKvm, registerKvm);

  function sparaKartYta(patch: Partial<KartYtaData>) {
    onKartYtaChange({
      ...kartYta,
      registerKvm: registerKvm ?? undefined,
      senastMatning: new Date().toISOString(),
      ...patch,
    });
  }

  function anvandCanvasVarde() {
    if (canvasKvm == null) return;
    setManuellTotal(String(canvasKvm));
    sparaKartYta({ uppmattTotalKvm: canvasKvm });
  }

  const summeradFasad =
    (parseKvm(manuellGata) ?? 0) + (parseKvm(manuellGard) ?? 0) || null;

  return (
    <div className="mt-4 space-y-4 rounded-xl border border-[#b8d4c4] bg-[#f7fbf8] p-4">
      <div>
        <p className="text-sm font-semibold text-primary-dark">
          Kart- och ythjälp — {typ}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          Öppna Google Earth, Maps eller Street View nedan. Fyll i uppmätt m²,
          jämför med registret och för över vid behov.
        </p>
      </div>

      <GoogleKartLankar adress={adress} kontext={kartKontext} kompakt />

      <RegisterJamforelse
        typ={typ}
        registerTak={registerTak}
        registerFasad={registerFasad}
        uppmattKvm={uppmattKvm}
        skillnad={skillnad}
      />

      <div className="rounded-lg border border-dashed border-border bg-background/80 px-3 py-3">
        <p className="text-xs font-semibold text-foreground">
          Mät på uppladdad skärmbild (valfritt)
        </p>
        <p className="mt-1 text-xs text-muted">
          Ta skärmdump från Earth eller Maps och ladda upp ovan — kalibrera skala och
          rita polygon.
        </p>
        <div className="mt-3">
          <YtaMatningCanvas imageUrl={bildUrl} onKvmChange={setCanvasKvm} />
        </div>
      </div>

      {canvasKvm != null && (
        <button
          type="button"
          onClick={anvandCanvasVarde}
          className="rounded-lg border border-primary px-3 py-1.5 text-xs font-medium text-primary-dark hover:bg-[#e2f0e6]"
        >
          Använd beräknad yta ({canvasKvm.toLocaleString("sv-SE")} m²) som uppmätt
        </button>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm sm:col-span-2">
          <span className="text-xs font-medium text-muted">
            Uppmätt {typ === "Tak" ? "takyta" : "fasadyta"} (m²) — från Earth eller
            verktyget
          </span>
          <input
            value={manuellTotal}
            onChange={(e) => {
              setManuellTotal(e.target.value);
              const kvm = parseKvm(e.target.value);
              sparaKartYta({ uppmattTotalKvm: kvm ?? undefined });
            }}
            placeholder="t.ex. 850"
            className="mt-1 w-full max-w-xs rounded-lg border border-border bg-white px-3 py-2 text-sm"
          />
        </label>

        {typ === "Fasad" && (
          <>
            <label className="block text-sm">
              <span className="text-xs font-medium text-muted">Fasad mot gata (m²)</span>
              <input
                value={manuellGata}
                onChange={(e) => {
                  setManuellGata(e.target.value);
                  sparaKartYta({ uppmattGataKvm: parseKvm(e.target.value) ?? undefined });
                }}
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="text-xs font-medium text-muted">Fasad mot gård (m²)</span>
              <input
                value={manuellGard}
                onChange={(e) => {
                  setManuellGard(e.target.value);
                  sparaKartYta({ uppmattGardKvm: parseKvm(e.target.value) ?? undefined });
                }}
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
              />
            </label>
            {summeradFasad != null && summeradFasad > 0 && (
              <p className="text-xs text-primary-dark sm:col-span-2">
                Summa gata + gård: {summeradFasad.toLocaleString("sv-SE")} m²
                {registerKvm != null && (
                  <span className="text-muted">
                    {" "}
                    (register: {registerKvm.toLocaleString("sv-SE")} m²)
                  </span>
                )}
              </p>
            )}
          </>
        )}

        <label className="block text-sm sm:col-span-2">
          <span className="text-xs font-medium text-muted">
            Antal (valfritt) — t.ex. takkupor, skorstenar, fönsterpartier
          </span>
          <input
            value={antalNotering}
            onChange={(e) => {
              setAntalNotering(e.target.value);
              sparaKartYta({ antalNotering: e.target.value });
            }}
            placeholder="t.ex. 4 takkupor, 2 skorstenar"
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
          />
        </label>
      </div>

      {onOverforTillRegister && uppmattKvm != null && uppmattKvm > 0 && (
        <div className="flex flex-wrap gap-2 border-t border-border pt-3">
          <button
            type="button"
            onClick={() => onOverforTillRegister(uppmattKvm, "total")}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            För över {uppmattKvm.toLocaleString("sv-SE")} m² till registret
          </button>
          {typ === "Fasad" && summeradFasad != null && summeradFasad > 0 && (
            <button
              type="button"
              onClick={() => onOverforTillRegister(summeradFasad, "total")}
              className="rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
            >
              För över summa gata+gård ({summeradFasad.toLocaleString("sv-SE")} m²)
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function parseKvm(v: string): number | null {
  if (!v.trim()) return null;
  const n = Number.parseFloat(v.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : null;
}

function RegisterJamforelse({
  typ,
  registerTak,
  registerFasad,
  uppmattKvm,
  skillnad,
}: {
  typ: "Tak" | "Fasad";
  registerTak: RegisterYtaTak;
  registerFasad: RegisterYtaFasad;
  uppmattKvm: number | null;
  skillnad: number | null;
}) {
  const registerKvm =
    typ === "Tak"
      ? registerTak.takytaKvm
      : registerFasad.totalKvm;

  let status: "ok" | "varning" | "neutral" = "neutral";
  if (uppmattKvm != null && registerKvm != null) {
    status = skillnad != null && skillnad > 15 ? "varning" : "ok";
  }

  return (
    <div
      className={`rounded-lg border px-3 py-3 text-sm ${
        status === "varning"
          ? "border-amber-300 bg-amber-50"
          : status === "ok"
            ? "border-[#d4e8da] bg-white"
            : "border-border bg-white"
      }`}
    >
      <p className="text-xs font-semibold text-foreground">Kontroll mot register</p>
      <dl className="mt-2 grid gap-2 sm:grid-cols-2">
        <div>
          <dt className="text-xs text-muted">I registret</dt>
          <dd className="font-medium tabular-nums">
            {registerKvm != null
              ? `${registerKvm.toLocaleString("sv-SE")} m²`
              : "Ej angivet"}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Uppmätt (kart/bild)</dt>
          <dd className="font-medium tabular-nums">
            {uppmattKvm != null
              ? `${uppmattKvm.toLocaleString("sv-SE")} m²`
              : "—"}
          </dd>
        </div>
      </dl>
      {typ === "Tak" && registerTak.takytaKvm == null && (
        <p className="mt-2 text-xs text-muted">
          {registerTak.schablonTakKvm != null && (
            <>
              Schablon från boarea (ca 1,2×): ca{" "}
              {registerTak.schablonTakKvm.toLocaleString("sv-SE")} m² — endast
              vägledning.
            </>
          )}
          {registerTak.kvmDelar.length > 0 && (
            <span className="block mt-1">
              Övriga kvm-delar:{" "}
              {registerTak.kvmDelar
                .map((d) => `${d.etikett} ${d.kvm} m²`)
                .join(", ")}
            </span>
          )}
        </p>
      )}
      {typ === "Fasad" && registerFasad.valdaMaterial.length > 0 && (
        <p className="mt-2 text-xs text-muted">
          Material: {registerFasad.valdaMaterial.join(", ")}
        </p>
      )}
      {skillnad != null && registerKvm != null && uppmattKvm != null && (
        <p
          className={`mt-2 text-xs font-medium ${
            skillnad > 15 ? "text-amber-900" : "text-primary-dark"
          }`}
        >
          Avvikelse: {skillnad} %
          {skillnad > 15
            ? " — kontrollera mätning eller uppdatera registret."
            : " — rimlig överensstämmelse."}
        </p>
      )}
    </div>
  );
}
