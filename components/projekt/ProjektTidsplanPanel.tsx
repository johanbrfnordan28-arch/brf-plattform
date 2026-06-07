"use client";

import { useMemo, useState } from "react";
import {
  appliceraMallPaProjekt,
  lasTidsplanBibliotek,
  type TidsplanMall,
} from "@/components/projekt/tidsplan-bibliotek";
import { tidsplanMilstolparTillArshjul } from "@/components/projekt/tidsplan-arshjul";
import {
  formatDatum,
  idagIso,
  kallaEtiketter,
  normaliseraMilstolpe,
  skapaMilstolpeId,
  sorteraMilstolpar,
  tidsplanKanGodkannas,
  tidsplanHarInnehall,
  type ProjektTidsplan,
  type TidsplanMilstolpe,
} from "@/components/projekt/tidsplan";
import type { Projekt } from "@/components/projekt/projekt";

type ProjektTidsplanPanelProps = {
  projekt: Projekt;
  tidsplan: ProjektTidsplan;
  onChange: (tidsplan: ProjektTidsplan) => void;
  onGodkand?: () => void;
  onImporteraArshjul?: (antal: number) => void;
  onÖppnaMapp?: () => void;
};

export function ProjektTidsplanPanel({
  projekt,
  tidsplan,
  onChange,
  onGodkand,
  onImporteraArshjul,
  onÖppnaMapp,
}: ProjektTidsplanPanelProps) {
  const [nyMilstolpe, setNyMilstolpe] = useState({
    titel: "",
    planeratDatum: "",
    protokollReferens: "",
  });
  const [protokollForm, setProtokollForm] = useState({
    titel: "",
    datum: "",
    protokoll: "",
  });
  const [visaProtokoll, setVisaProtokoll] = useState(false);
  const [entreprenorRedigera, setEntreprenorRedigera] = useState(false);

  const sorterade = useMemo(
    () => sorteraMilstolpar(tidsplan.milstolpar),
    [tidsplan.milstolpar],
  );

  function uppdateraTidsplan(p: Partial<ProjektTidsplan>) {
    onChange({ ...tidsplan, ...p });
  }

  function uppdateraMilstolpe(id: string, falt: Partial<TidsplanMilstolpe>) {
    uppdateraTidsplan({
      milstolpar: tidsplan.milstolpar.map((m) =>
        m.id === id ? normaliseraMilstolpe({ ...m, ...falt }) : m,
      ),
    });
  }

  function taBortMilstolpe(id: string) {
    uppdateraTidsplan({ milstolpar: tidsplan.milstolpar.filter((m) => m.id !== id) });
  }

  function läggTillManuell() {
    if (!nyMilstolpe.titel.trim()) return;
    uppdateraTidsplan({
      milstolpar: sorteraMilstolpar([
        ...tidsplan.milstolpar,
        normaliseraMilstolpe({
          id: skapaMilstolpeId(),
          titel: nyMilstolpe.titel,
          planeratDatum: nyMilstolpe.planeratDatum || null,
          entreprenorDatum: null,
          faktisktDatum: null,
          ansvarig: "",
          kalla: "manuell",
          protokollReferens: "",
          anteckning: "",
          klar: false,
        }),
      ]),
    });
    setNyMilstolpe({ titel: "", planeratDatum: "", protokollReferens: "" });
  }

  function läggTillFranProtokoll() {
    if (!protokollForm.titel.trim()) return;
    uppdateraTidsplan({
      milstolpar: sorteraMilstolpar([
        ...tidsplan.milstolpar,
        normaliseraMilstolpe({
          id: skapaMilstolpeId(),
          titel: protokollForm.titel.trim(),
          planeratDatum: protokollForm.datum || null,
          entreprenorDatum: null,
          faktisktDatum: null,
          ansvarig: "",
          kalla: "protokoll",
          protokollReferens: protokollForm.protokoll.trim() || "Byggmötesprotokoll",
          anteckning: "",
          klar: false,
        }),
      ]),
    });
    setProtokollForm({ titel: "", datum: "", protokoll: "" });
    setVisaProtokoll(false);
  }

  function appliceraMall(mall: TidsplanMall, startDatum: string) {
    const nya = appliceraMallPaProjekt(mall, startDatum);
    uppdateraTidsplan({
      projektStartDatum: startDatum,
      milstolpar: sorteraMilstolpar([...tidsplan.milstolpar, ...nya]),
    });
  }

  function godkannTidsplan() {
    if (!tidsplanKanGodkannas(tidsplan)) return;
    uppdateraTidsplan({
      godkandAvStyrelsen: true,
      godkandDatum: idagIso(),
    });
    onGodkand?.();
  }

  function bjudInEntreprenor() {
    uppdateraTidsplan({
      entreprenorInbjuden: true,
      entreprenorSenastUppdaterad: null,
    });
    setEntreprenorRedigera(true);
  }

  function simuleraEntreprenorUppdatering() {
    uppdateraTidsplan({
      entreprenorSenastUppdaterad: new Date().toLocaleString("sv-SE"),
      milstolpar: tidsplan.milstolpar.map((m) =>
        m.planeratDatum && !m.entreprenorDatum
          ? { ...m, entreprenorDatum: m.planeratDatum, kalla: "entreprenor" as const }
          : m,
      ),
    });
    setEntreprenorRedigera(false);
  }

  function importeraTillArshjul() {
    const handelser = tidsplanMilstolparTillArshjul({
      ...projekt,
      tidsplan,
    });
    onImporteraArshjul?.(handelser.length);
  }

  const mallar = lasTidsplanBibliotek();
  const startDatum = tidsplan.projektStartDatum ?? idagIso();

  return (
    <details className="group rounded-2xl border border-primary/25 bg-[#eef6f0]/30" open>
      <summary className="cursor-pointer list-none px-4 py-4 sm:px-5 [&::-webkit-details-marker]:hidden">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-primary-dark">Tidsplan</p>
            <p className="mt-0.5 text-xs text-muted">
              {tidsplan.milstolpar.length} milstolpar
              {tidsplan.godkandAvStyrelsen && " · Godkänd av styrelsen"}
              {tidsplan.entreprenorInbjuden && " · Entreprenör inbjuden"}
            </p>
          </div>
          <span className="text-sm text-muted group-open:hidden">Visa ▼</span>
        </div>
      </summary>

      <div className="space-y-4 border-t border-primary/15 px-4 pb-5 pt-2 sm:px-5">
        <p className="text-xs leading-relaxed text-muted">
          Importera från biblioteket, lägg till datum manuellt eller hämta tider från
          byggmötesprotokoll. Entreprenören kan fylla i föreslagna datum (demo). Godkänd
          tidsplan kan importeras till årshjulet.
        </p>

        <div className="flex flex-wrap gap-2">
          {onÖppnaMapp && (
            <button
              type="button"
              onClick={onÖppnaMapp}
              className="rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium text-primary-dark hover:bg-[#eef6f0]"
            >
              → Mappen Tidsplan
            </button>
          )}
          {onImporteraArshjul && tidsplanHarInnehall(tidsplan) && (
            <button
              type="button"
              onClick={importeraTillArshjul}
              className="rounded-lg border border-primary bg-white px-3 py-1.5 text-xs font-medium text-primary-dark hover:bg-[#eef6f0]"
            >
              Importera till årshjul
            </button>
          )}
        </div>

        <label className="block text-sm">
          <span className="font-medium text-foreground">Projektstart (för mallar)</span>
          <input
            type="date"
            value={startDatum}
            onChange={(e) =>
              uppdateraTidsplan({ projektStartDatum: e.target.value || null })
            }
            className="mt-1 w-full max-w-xs rounded-lg border border-border bg-white px-3 py-2 text-sm"
          />
        </label>

        <div className="rounded-xl border border-border bg-white p-3">
          <p className="text-xs font-semibold text-foreground">Importera från bibliotek</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {mallar.map((mall) => (
              <button
                key={mall.id}
                type="button"
                onClick={() => appliceraMall(mall, startDatum)}
                className="rounded-full border border-primary/40 bg-[#eef6f0] px-3 py-1 text-xs font-medium text-primary-dark hover:bg-[#e2f0e6]"
              >
                + {mall.titel}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-dashed border-border bg-white/80 p-3">
          <p className="text-xs font-semibold text-foreground">Lägg till manuellt</p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end">
            <input
              value={nyMilstolpe.titel}
              onChange={(e) => setNyMilstolpe({ ...nyMilstolpe, titel: e.target.value })}
              placeholder="Milstolpe"
              className="min-w-0 flex-1 rounded-lg border border-border px-3 py-2 text-sm"
            />
            <input
              type="date"
              value={nyMilstolpe.planeratDatum}
              onChange={(e) =>
                setNyMilstolpe({ ...nyMilstolpe, planeratDatum: e.target.value })
              }
              className="rounded-lg border border-border px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={läggTillManuell}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
            >
              Lägg till
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-white p-3">
          <button
            type="button"
            onClick={() => setVisaProtokoll((v) => !v)}
            className="text-xs font-semibold text-primary-dark hover:underline"
          >
            {visaProtokoll ? "Dölj" : "+"} Från byggmötesprotokoll
          </button>
          {visaProtokoll && (
            <div className="mt-3 space-y-2">
              <p className="text-xs text-muted">
                När entreprenören anger tider i protokoll — lägg in dem här (kopplas till
                mappen Byggmötesprotokoll).
              </p>
              <input
                value={protokollForm.titel}
                onChange={(e) =>
                  setProtokollForm({ ...protokollForm, titel: e.target.value })
                }
                placeholder="Aktivitet t.ex. Etapp 2 klar"
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
              <input
                type="date"
                value={protokollForm.datum}
                onChange={(e) =>
                  setProtokollForm({ ...protokollForm, datum: e.target.value })
                }
                className="w-full max-w-xs rounded-lg border border-border px-3 py-2 text-sm"
              />
              <input
                value={protokollForm.protokoll}
                onChange={(e) =>
                  setProtokollForm({ ...protokollForm, protokoll: e.target.value })
                }
                placeholder="Protokoll / mötesdatum t.ex. Byggmöte 2026-03-12"
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={läggTillFranProtokoll}
                className="rounded-lg border border-primary px-3 py-1.5 text-sm font-medium text-primary-dark"
              >
                Lägg till från protokoll
              </button>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-3">
          <p className="text-xs font-semibold text-foreground">Entreprenör fyller i</p>
          <p className="mt-1 text-xs text-muted">
            Skicka en inbjudan (demo) så entreprenören kan föreslå datum per milstolpe.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {!tidsplan.entreprenorInbjuden ? (
              <button
                type="button"
                onClick={bjudInEntreprenor}
                disabled={tidsplan.milstolpar.length === 0}
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
              >
                Bjud in entreprenör (demo)
              </button>
            ) : (
              <>
                <span className="text-xs text-primary-dark">Inbjuden</span>
                {tidsplan.entreprenorSenastUppdaterad && (
                  <span className="text-xs text-muted">
                    Senast: {tidsplan.entreprenorSenastUppdaterad}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setEntreprenorRedigera((v) => !v)}
                  className="text-xs font-medium text-primary-dark underline"
                >
                  {entreprenorRedigera ? "Stäng entreprenörsvy" : "Redigera som entreprenör"}
                </button>
                <button
                  type="button"
                  onClick={simuleraEntreprenorUppdatering}
                  className="text-xs text-muted hover:text-foreground"
                >
                  Simulera entreprenörens svar
                </button>
              </>
            )}
          </div>
        </div>

        {sorterade.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-border bg-white">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-background/80 text-xs text-muted">
                  <th className="px-3 py-2 font-medium">Milstolpe</th>
                  <th className="px-3 py-2 font-medium">Styrelse / plan</th>
                  <th className="px-3 py-2 font-medium">Entreprenör</th>
                  <th className="px-3 py-2 font-medium">Källa</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {sorterade.map((m) => (
                  <tr key={m.id} className="border-b border-border/60 last:border-0">
                    <td className="px-3 py-2">
                      <input
                        value={m.titel}
                        onChange={(e) => uppdateraMilstolpe(m.id, { titel: e.target.value })}
                        className="w-full min-w-[8rem] rounded border border-transparent px-1 py-0.5 text-sm hover:border-border focus:border-border"
                      />
                      {m.protokollReferens && (
                        <p className="mt-0.5 text-[10px] text-muted">{m.protokollReferens}</p>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="date"
                        value={m.planeratDatum ?? ""}
                        onChange={(e) =>
                          uppdateraMilstolpe(m.id, {
                            planeratDatum: e.target.value || null,
                          })
                        }
                        className="rounded border border-border px-2 py-1 text-xs"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="date"
                        value={m.entreprenorDatum ?? ""}
                        disabled={!entreprenorRedigera && !tidsplan.entreprenorInbjuden}
                        onChange={(e) =>
                          uppdateraMilstolpe(m.id, {
                            entreprenorDatum: e.target.value || null,
                            kalla: "entreprenor",
                          })
                        }
                        className="rounded border border-border px-2 py-1 text-xs disabled:bg-background"
                      />
                    </td>
                    <td className="px-3 py-2 text-xs text-muted">
                      {kallaEtiketter[m.kalla]}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => taBortMilstolpe(m.id)}
                        className="text-xs text-muted hover:text-red-700"
                      >
                        Ta bort
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted">
            Ingen tidsplan ännu — importera en mall eller lägg till milstolpar.
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 border-t border-border pt-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={tidsplan.godkandAvStyrelsen}
              onChange={(e) => {
                if (e.target.checked) godkannTidsplan();
                else uppdateraTidsplan({ godkandAvStyrelsen: false, godkandDatum: null });
              }}
              disabled={!tidsplanKanGodkannas(tidsplan) && !tidsplan.godkandAvStyrelsen}
              className="h-4 w-4 rounded border-border text-primary"
            />
            <span>
              Tidsplan godkänd av styrelsen
              {tidsplan.godkandDatum && (
                <span className="text-muted"> ({formatDatum(tidsplan.godkandDatum)})</span>
              )}
            </span>
          </label>
          {!tidsplanKanGodkannas(tidsplan) && !tidsplan.godkandAvStyrelsen && (
            <span className="text-xs text-muted">
              Alla milstolpar behöver planerat eller entreprenörsdatum.
            </span>
          )}
        </div>
      </div>
    </details>
  );
}
