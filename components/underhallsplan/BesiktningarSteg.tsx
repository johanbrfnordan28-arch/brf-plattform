"use client";

import { useEffect, useMemo } from "react";
import {
  beraknaBesiktningKostnad,
  beraknaBesiktningKostnadInklIntern,
  beraknaOvkBostadKostnad,
  beraknaOvkVerksamhetKostnad,
  beraknaSbaEgenkontrollKostnad,
  beraknaSbaBrandkonsultKostnad,
  besiktningKostnadFormel,
  besiktningMallar,
  formatKr,
  hamtaBesiktningIntervallAlternativ,
  ingarEjIForeningensBudget,
  normaliseraOvkBesiktning,
  normaliseraSbaBesiktning,
  OVK_DEFAULT_VERKSAMHET_KR,
  OVK_INTERVALL_VERKSAMHET_AR,
  OVK_RIKTPRIS_PER_LGH_KR,
  ovkIntervallBostadHint,
  ovkBostadIntervallFromVentilation,
  sammanstallBesiktningBudget,
  taBortSotningOchEldstader,
  tillampaOvkIntervallFromVentilation,
  type Besiktning,
  type BesiktningId,
} from "@/components/underhallsplan/besiktningar";
import { SBA_BRANDKONSULT_INTERVALL_AR, SBA_DEFAULT_BRANDKONSULT_KR } from "@/components/underhallsplan/brandskydd";
import { MomsAvdragKnapp } from "@/components/underhallsplan/MomsAvdragKnapp";
import { hamtaPlanSlutAr } from "@/components/underhallsplan/planinstallningar";

type BesiktningarProps = {
  unlocked: boolean;
  antalLagenheter: number;
  planStartAr: number;
  planLangdAr: number;
  ventilationssystem?: string;
  lista: Besiktning[];
  onChange: (lista: Besiktning[]) => void;
  saved: boolean;
  onSave?: () => void;
};

export function Besiktningar({
  unlocked,
  antalLagenheter,
  planStartAr,
  planLangdAr,
  ventilationssystem = "",
  lista,
  onChange,
  saved,
  onSave,
}: BesiktningarProps) {
  const planSlutAr = hamtaPlanSlutAr(planStartAr, planLangdAr);
  const ovkBostadIntervall = ovkBostadIntervallFromVentilation(ventilationssystem);

  useEffect(() => {
    if (!ventilationssystem.trim()) return;
    const ovk = lista.find((b) => b.id === "ovk");
    if (!ovk) return;
    const expected = ovkBostadIntervallFromVentilation(ventilationssystem);
    if (
      ovk.intervallAr === expected &&
      ovk.ovkIntervallVerksamhetAr === OVK_INTERVALL_VERKSAMHET_AR
    ) {
      return;
    }
    onChange(tillampaOvkIntervallFromVentilation(lista, ventilationssystem));
  }, [ventilationssystem, lista, onChange]);

  function toggleBesiktning(id: BesiktningId) {
    onChange(
      lista.map((item) =>
        item.id === id ? { ...item, aktiv: !item.aktiv } : item,
      ),
    );
  }

  function uppdatera(id: BesiktningId, patch: Partial<Besiktning>) {
    onChange(
      lista.map((item) => {
        if (item.id !== id) return item;
        const next = { ...item, ...patch };
        if (id === "ovk") {
          return normaliseraOvkBesiktning(next, ventilationssystem);
        }
        if (id === "sba") {
          return normaliseraSbaBesiktning(next);
        }
        return next;
      }),
    );
  }

  const budgetPreview = useMemo(
    () =>
      sammanstallBesiktningBudget(
        lista,
        antalLagenheter,
        planStartAr,
        planLangdAr,
      ),
    [lista, antalLagenheter, planStartAr, planLangdAr],
  );

  const lockedClass = !unlocked ? "pointer-events-none opacity-50" : "";

  return (
    <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
      <p className="text-sm font-semibold text-primary-dark">Steg 4</p>
      <h2 className="mt-1 text-xl font-semibold text-foreground">
        Kommande besiktningar
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Senast utfört år och kostnad fylls i steg 2 (utförda arbeten). Här ställer du
        in intervall, nästa planerade år och schablonpris — beloppet hamnar i årsbudgeten
        det år besiktningen ska utföras. Stäng av det som inte gäller er förening.
      </p>

      {antalLagenheter === 0 && unlocked && (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Ange antal lägenheter i grunduppgifterna för att räkna OVK, sotning och
          sotning per lägenhet.
        </p>
      )}

      {!unlocked && (
        <p className="mt-4 rounded-lg border border-dashed border-border bg-background px-4 py-3 text-sm text-muted">
          Spara komponentregistret i steg 3 först, sedan aktiveras besiktningarna.
        </p>
      )}

      <div className={`mt-6 flex flex-wrap gap-2 ${lockedClass}`}>
        {lista.map((besiktning) => {
          const isActive = besiktning.aktiv;
          return (
            <button
              key={besiktning.id}
              type="button"
              onClick={() => toggleBesiktning(besiktning.id)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "border-primary bg-[#e2f0e6] text-primary-dark"
                  : "border-border bg-background text-foreground hover:border-primary/50"
              }`}
            >
              {isActive ? "✓ " : ""}
              {besiktning.namn}
            </button>
          );
        })}
      </div>

      {unlocked && lista.some((b) => b.id === "sotning" && b.aktiv) && (
        <div className={`mt-3 ${lockedClass}`}>
          <button
            type="button"
            onClick={() => onChange(taBortSotningOchEldstader(lista))}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:border-primary/40 hover:bg-[#eef6f0]/40"
          >
            Ta bort sotning / eldstäder
          </button>
          <p className="mt-1.5 text-xs text-muted">
            Använd om fastigheten saknar eldstäder — sotning stängs av och antal
            eldstäder nollställs.
          </p>
        </div>
      )}

      <div className={`mt-6 space-y-4 ${lockedClass}`}>
        {lista.filter((b) => b.aktiv).map((besiktning) => {
          const mall = besiktningMallar.find((m) => m.id === besiktning.id);
          const totalVidBesiktning = beraknaBesiktningKostnad(
            besiktning,
            antalLagenheter,
          );
          const totalInklIntern = beraknaBesiktningKostnadInklIntern(
            besiktning,
            antalLagenheter,
          );
          const formel = besiktningKostnadFormel(besiktning, antalLagenheter);
          const intervallAlternativ = hamtaBesiktningIntervallAlternativ(
            besiktning.id,
            planLangdAr,
          );

          return (
            <div
              key={besiktning.id}
              className="rounded-xl border border-border bg-background/80 p-4 sm:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <span className="font-semibold text-foreground">{besiktning.namn}</span>
                <div className="text-right text-sm">
                    {besiktning.id === "ovk" ? (
                      <>
                        <p className="font-medium text-primary-dark">
                          {formatKr(beraknaOvkBostadKostnad(besiktning, antalLagenheter))}{" "}
                          / tillfälle bostäder
                        </p>
                        {besiktning.ovkInkluderaVerksamhet &&
                          (besiktning.antalVerksamheter ?? 0) > 0 && (
                            <p className="font-medium text-primary-dark">
                              {formatKr(beraknaOvkVerksamhetKostnad(besiktning))}{" "}
                              / tillfälle verksamhet
                            </p>
                          )}
                      </>
                    ) : besiktning.id === "sba" ? (
                      <>
                        <p className="font-medium text-primary-dark">
                          {formatKr(beraknaSbaEgenkontrollKostnad(besiktning))}{" "}
                          / år egenkontroll
                        </p>
                        {besiktning.sbaInkluderaBrandkonsult && (
                          <p className="font-medium text-primary-dark">
                            {formatKr(beraknaSbaBrandkonsultKostnad(besiktning))}{" "}
                            / tillfälle brandkonsult
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="font-medium text-primary-dark">
                        {ingarEjIForeningensBudget(besiktning)
                          ? "0 kr i föreningsbudget"
                          : `${formatKr(totalVidBesiktning)} / tillfälle`}
                      </p>
                    )}
                    {ingarEjIForeningensBudget(besiktning) &&
                      totalInklIntern > 0 && (
                        <p className="text-xs text-muted">
                          Ca {formatKr(totalInklIntern)} debiteras internt
                        </p>
                      )}
                    <p className="text-xs text-muted">{formel}</p>
                </div>
              </div>

              <div className="mt-4 space-y-4">
                  {besiktning.id === "ovk" ? (
                    <>
                      <p className="rounded-lg border border-[#e2f0e6] bg-[#eef6f0]/50 px-3 py-2 text-xs leading-relaxed text-muted">
                        {ovkIntervallBostadHint(ventilationssystem)}
                      </p>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block">
                          <span className="text-sm font-medium text-foreground">
                            Nästa OVK bostäder (år)
                          </span>
                          <input
                            type="number"
                            min={planStartAr}
                            max={planSlutAr}
                            value={besiktning.nastaBesiktningAr}
                            onChange={(event) =>
                              uppdatera(besiktning.id, {
                                nastaBesiktningAr:
                                  Number(event.target.value) || planStartAr,
                              })
                            }
                            className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                          />
                        </label>
                        <label className="block">
                          <span className="text-sm font-medium text-foreground">
                            Intervall bostäder (år)
                          </span>
                          <select
                            value={besiktning.intervallAr}
                            onChange={(event) =>
                              uppdatera(besiktning.id, {
                                intervallAr: Number(event.target.value),
                              })
                            }
                            className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                          >
                            {intervallAlternativ.map((ar) => (
                              <option key={ar} value={ar}>
                                Vart {ar}:e år
                                {ovkBostadIntervall === ar ? " (enligt ventilation)" : ""}
                              </option>
                            ))}
                          </select>
                          <span className="mt-1 block text-xs text-muted">
                            S/F/FX → 6 år · FT/FTX → 3 år för bostadslägenheter.
                          </span>
                          {besiktning.intervallAr !== ovkBostadIntervall &&
                            ventilationssystem.trim() && (
                              <button
                                type="button"
                                onClick={() =>
                                  uppdatera(besiktning.id, {
                                    intervallAr: ovkBostadIntervall,
                                  })
                                }
                                className="mt-1 text-xs font-medium text-primary hover:underline"
                              >
                                Återställ enligt ventilationssystem
                              </button>
                            )}
                        </label>
                      </div>
                    </>
                  ) : besiktning.id === "sba" ? (
                    <>
                      <p className="rounded-lg border border-[#e2f0e6] bg-[#eef6f0]/50 px-3 py-2 text-xs leading-relaxed text-muted">
                        Årlig SBA-egenkontroll enligt kontrollmall i komponenten
                        Brandskydd (steg 3). Kontrollera branddörrar, utrymningsvägar
                        och rökgasevakuering i trapphus.
                      </p>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block">
                          <span className="text-sm font-medium text-foreground">
                            Nästa SBA-egenkontroll (år)
                          </span>
                          <input
                            type="number"
                            min={planStartAr}
                            max={planSlutAr}
                            value={besiktning.nastaBesiktningAr}
                            onChange={(event) =>
                              uppdatera(besiktning.id, {
                                nastaBesiktningAr:
                                  Number(event.target.value) || planStartAr,
                              })
                            }
                            className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                          />
                        </label>
                        <div className="block">
                          <span className="text-sm font-medium text-foreground">
                            Intervall
                          </span>
                          <p className="mt-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
                            Årligen (vart 1:a år)
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-sm font-medium text-foreground">
                        Nästa besiktning (år)
                      </span>
                      <input
                        type="number"
                        min={planStartAr}
                        max={planSlutAr}
                        value={besiktning.nastaBesiktningAr}
                        onChange={(event) =>
                          uppdatera(besiktning.id, {
                            nastaBesiktningAr:
                              Number(event.target.value) || planStartAr,
                          })
                        }
                        className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-foreground">
                        Intervall (år)
                      </span>
                      <select
                        value={besiktning.intervallAr}
                        onChange={(event) =>
                          uppdatera(besiktning.id, {
                            intervallAr: Number(event.target.value),
                          })
                        }
                        className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                      >
                        {intervallAlternativ.map((ar) => (
                          <option key={ar} value={ar}>
                            Vart {ar}:e år
                            {mall?.defaultIntervall === ar ? " (rekomm.)" : ""}
                          </option>
                        ))}
                      </select>
                      {mall && (
                        <span className="mt-1 block text-xs text-muted">
                          Rekommenderat: vart {mall.defaultIntervall}:e år.{" "}
                          {mall.intervallHint}
                        </span>
                      )}
                      {mall && besiktning.intervallAr !== mall.defaultIntervall && (
                        <button
                          type="button"
                          onClick={() =>
                            uppdatera(besiktning.id, {
                              intervallAr: mall.defaultIntervall,
                            })
                          }
                          className="mt-1 text-xs font-medium text-primary hover:underline"
                        >
                          Återställ rekommenderat intervall
                        </button>
                      )}
                    </label>
                  </div>
                  )}

                  {(besiktning.prismodell === "per_lagenhet" ||
                    besiktning.prismodell === "per_lagenhet_och_eldstad") && (
                    <label className="block max-w-xs">
                      <span className="text-sm font-medium text-foreground">
                        Kostnad per lägenhet (kr)
                      </span>
                      <input
                        type="number"
                        min={0}
                        value={besiktning.kostnadPerLagenhetKr || ""}
                        onChange={(event) =>
                          uppdatera(besiktning.id, {
                            kostnadPerLagenhetKr: Number(event.target.value) || 0,
                            momsAvdragenKr: undefined,
                            kostnadInklMomsKr: undefined,
                          })
                        }
                        className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                      />
                      <span className="mt-1 block text-xs text-muted">
                        {besiktning.id === "ovk"
                          ? `Riktpris ${OVK_RIKTPRIS_PER_LGH_KR} kr/lgh · × ${antalLagenheter || 0} lägenheter`
                          : `× ${antalLagenheter || 0} lägenheter från grunduppgifter`}
                      </span>
                      <MomsAvdragKnapp
                        kostnadKr={besiktning.kostnadPerLagenhetKr}
                        momsAvdragenKr={besiktning.momsAvdragenKr}
                        kostnadInklMomsKr={besiktning.kostnadInklMomsKr}
                        onApply={({ kostnadExklMoms, momsAvdragen, kostnadInklMoms }) =>
                          uppdatera(besiktning.id, {
                            kostnadPerLagenhetKr: kostnadExklMoms,
                            momsAvdragenKr: momsAvdragen,
                            kostnadInklMomsKr: kostnadInklMoms,
                          })
                        }
                        onAterstall={() => {
                          if (!besiktning.kostnadInklMomsKr) return;
                          uppdatera(besiktning.id, {
                            kostnadPerLagenhetKr: besiktning.kostnadInklMomsKr,
                            momsAvdragenKr: undefined,
                            kostnadInklMomsKr: undefined,
                          });
                        }}
                      />
                    </label>
                  )}

                  {besiktning.id === "ovk" && (
                    <div className="rounded-lg border border-border/80 bg-white/80 p-3 space-y-3">
                      <label className="flex cursor-pointer items-start gap-2">
                        <input
                          type="checkbox"
                          checked={Boolean(besiktning.ovkInkluderaVerksamhet)}
                          onChange={(event) =>
                            uppdatera(besiktning.id, {
                              ovkInkluderaVerksamhet: event.target.checked,
                              kostnadPerVerksamhetKr:
                                besiktning.kostnadPerVerksamhetKr ||
                                OVK_DEFAULT_VERKSAMHET_KR,
                              ovkIntervallVerksamhetAr: OVK_INTERVALL_VERKSAMHET_AR,
                              ovkNastaVerksamhetAr:
                                besiktning.ovkNastaVerksamhetAr ??
                                besiktning.nastaBesiktningAr,
                            })
                          }
                          className="mt-0.5 h-4 w-4 rounded border-border text-primary"
                        />
                        <span className="text-sm text-foreground">
                          <span className="font-medium">OVK verksamhetslokaler</span>
                          <span className="mt-0.5 block text-xs text-muted">
                            Butik, kontor, restaurang m.m. — obligatoriskt vart{" "}
                            {OVK_INTERVALL_VERKSAMHET_AR}:e år, oavsett fläksystem.
                          </span>
                        </span>
                      </label>
                      {besiktning.ovkInkluderaVerksamhet && (
                        <>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <label className="block text-sm">
                              <span className="text-xs font-medium text-muted">
                                Nästa OVK verksamhet (år)
                              </span>
                              <input
                                type="number"
                                min={planStartAr}
                                max={planSlutAr}
                                value={
                                  besiktning.ovkNastaVerksamhetAr ??
                                  besiktning.nastaBesiktningAr
                                }
                                onChange={(event) =>
                                  uppdatera(besiktning.id, {
                                    ovkNastaVerksamhetAr:
                                      Number(event.target.value) || planStartAr,
                                  })
                                }
                                className="mt-1 w-full rounded-lg border border-border px-2.5 py-1.5 text-sm"
                              />
                            </label>
                            <div className="block text-sm">
                              <span className="text-xs font-medium text-muted">
                                Intervall verksamhet
                              </span>
                              <p className="mt-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm text-foreground">
                                Vart {OVK_INTERVALL_VERKSAMHET_AR}:e år (fast)
                              </p>
                            </div>
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <label className="block text-sm">
                              <span className="text-xs font-medium text-muted">
                                Antal verksamhetslokaler
                              </span>
                              <input
                                type="number"
                                min={0}
                                value={besiktning.antalVerksamheter ?? ""}
                                onChange={(event) =>
                                  uppdatera(besiktning.id, {
                                    antalVerksamheter:
                                      Number(event.target.value) || 0,
                                  })
                                }
                                className="mt-1 w-full rounded-lg border border-border px-2.5 py-1.5 text-sm"
                              />
                            </label>
                            <label className="block text-sm">
                              <span className="text-xs font-medium text-muted">
                                Kostnad per verksamhet (kr)
                              </span>
                              <input
                                type="number"
                                min={0}
                                step={100}
                                value={
                                  besiktning.kostnadPerVerksamhetKr ??
                                  OVK_DEFAULT_VERKSAMHET_KR
                                }
                                onChange={(event) =>
                                  uppdatera(besiktning.id, {
                                    kostnadPerVerksamhetKr:
                                      Number(event.target.value) || 0,
                                  })
                                }
                                className="mt-1 w-full rounded-lg border border-border px-2.5 py-1.5 text-sm"
                              />
                            </label>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {besiktning.id === "sba" && (
                    <div className="rounded-lg border border-border/80 bg-white/80 p-3 space-y-3">
                      <label className="flex cursor-pointer items-start gap-2">
                        <input
                          type="checkbox"
                          checked={Boolean(besiktning.sbaInkluderaBrandkonsult)}
                          onChange={(event) =>
                            uppdatera(besiktning.id, {
                              sbaInkluderaBrandkonsult: event.target.checked,
                              sbaBrandkonsultKostnadKr:
                                besiktning.sbaBrandkonsultKostnadKr ||
                                SBA_DEFAULT_BRANDKONSULT_KR,
                              sbaBrandkonsultIntervallAr: SBA_BRANDKONSULT_INTERVALL_AR,
                              sbaNastaBrandkonsultAr:
                                besiktning.sbaNastaBrandkonsultAr ??
                                besiktning.nastaBesiktningAr,
                            })
                          }
                          className="mt-0.5 h-4 w-4 rounded border-border text-primary"
                        />
                        <span className="text-sm text-foreground">
                          <span className="font-medium">Extern brandkonsult</span>
                          <span className="mt-0.5 block text-xs text-muted">
                            Ta in brandkonsult med jämna intervall — t.ex. vart{" "}
                            {SBA_BRANDKONSULT_INTERVALL_AR}:e år för genomgång och
                            dokumentation.
                          </span>
                        </span>
                      </label>
                      {besiktning.sbaInkluderaBrandkonsult && (
                        <div className="grid gap-3 sm:grid-cols-2">
                          <label className="block text-sm">
                            <span className="text-xs font-medium text-muted">
                              Nästa brandkonsult (år)
                            </span>
                            <input
                              type="number"
                              min={planStartAr}
                              max={planSlutAr}
                              value={
                                besiktning.sbaNastaBrandkonsultAr ??
                                besiktning.nastaBesiktningAr
                              }
                              onChange={(event) =>
                                uppdatera(besiktning.id, {
                                  sbaNastaBrandkonsultAr:
                                    Number(event.target.value) || planStartAr,
                                })
                              }
                              className="mt-1 w-full rounded-lg border border-border px-2.5 py-1.5 text-sm"
                            />
                          </label>
                          <label className="block text-sm">
                            <span className="text-xs font-medium text-muted">
                              Kostnad brandkonsult (kr)
                            </span>
                            <input
                              type="number"
                              min={0}
                              step={500}
                              value={
                                besiktning.sbaBrandkonsultKostnadKr ??
                                SBA_DEFAULT_BRANDKONSULT_KR
                              }
                              onChange={(event) =>
                                uppdatera(besiktning.id, {
                                  sbaBrandkonsultKostnadKr:
                                    Number(event.target.value) || 0,
                                })
                              }
                              className="mt-1 w-full rounded-lg border border-border px-2.5 py-1.5 text-sm"
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  )}

                  {besiktning.prismodell === "per_hiss" && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="text-sm font-medium text-foreground">
                          Antal hiss
                        </span>
                        <input
                          type="number"
                          min={0}
                          value={besiktning.antalHissar || ""}
                          onChange={(event) =>
                            uppdatera(besiktning.id, {
                              antalHissar: Number(event.target.value) || 0,
                            })
                          }
                          className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="block">
                        <span className="text-sm font-medium text-foreground">
                          Kostnad per hiss (kr)
                        </span>
                        <input
                          type="number"
                          min={0}
                          step={500}
                          value={besiktning.kostnadPerHissKr || ""}
                          onChange={(event) =>
                            uppdatera(besiktning.id, {
                              kostnadPerHissKr: Number(event.target.value) || 0,
                            })
                          }
                          className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                        />
                      </label>
                    </div>
                  )}

                  {besiktning.prismodell === "per_lagenhet_och_eldstad" && (
                    <>
                    <div className="rounded-lg border border-[#e2f0e6] bg-[#eef6f0]/40 p-3">
                      <label className="flex cursor-pointer items-start gap-2">
                        <input
                          type="checkbox"
                          checked={Boolean(besiktning.sotningInternDebitering)}
                          onChange={(event) =>
                            uppdatera(besiktning.id, {
                              sotningInternDebitering: event.target.checked,
                            })
                          }
                          className="mt-0.5 h-4 w-4 rounded border-border text-primary"
                        />
                        <span className="text-sm text-foreground">
                          <span className="font-medium">Intern debitering</span>
                          <span className="mt-0.5 block text-xs text-muted">
                            Kostnaden debiteras lägenheter med öppen spis eller
                            eldstad — ingår inte i föreningens årsbudget.
                          </span>
                        </span>
                      </label>
                      {besiktning.sotningInternDebitering && (
                        <label className="mt-3 block max-w-xs text-sm">
                          <span className="text-xs font-medium text-muted">
                            Antal lägenheter med öppen spis/eldstad
                          </span>
                          <input
                            type="number"
                            min={0}
                            max={antalLagenheter || undefined}
                            value={besiktning.antalLagenheterMedEldstad ?? ""}
                            onChange={(event) =>
                              uppdatera(besiktning.id, {
                                antalLagenheterMedEldstad:
                                  Number(event.target.value) || 0,
                              })
                            }
                            className="mt-1 w-full rounded-lg border border-border px-2.5 py-1.5 text-sm"
                          />
                        </label>
                      )}
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="text-sm font-medium text-foreground">
                          Antal eldstäder
                        </span>
                        <input
                          type="number"
                          min={0}
                          value={besiktning.antalEldstäder || ""}
                          onChange={(event) =>
                            uppdatera(besiktning.id, {
                              antalEldstäder: Number(event.target.value) || 0,
                            })
                          }
                          className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                        />
                        <span className="mt-1 block text-xs text-muted">
                          T.ex. pannrum, kakelugn, gemensam eldstad
                        </span>
                      </label>
                      <label className="block">
                        <span className="text-sm font-medium text-foreground">
                          Kostnad per eldstad (kr)
                        </span>
                        <input
                          type="number"
                          min={0}
                          step={100}
                          value={besiktning.kostnadPerEldstadKr || ""}
                          onChange={(event) =>
                            uppdatera(besiktning.id, {
                              kostnadPerEldstadKr: Number(event.target.value) || 0,
                            })
                          }
                          className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                        />
                      </label>
                    </div>
                    </>
                  )}

                  {besiktning.prismodell === "fast" && (
                    <label className="block max-w-xs">
                      <span className="text-sm font-medium text-foreground">
                        Kostnad per tillfälle (kr)
                      </span>
                      <input
                        type="number"
                        min={0}
                        step={500}
                        value={besiktning.kostnadFastKr || ""}
                        onChange={(event) =>
                          uppdatera(besiktning.id, {
                            kostnadFastKr: Number(event.target.value) || 0,
                            momsAvdragenKr: undefined,
                            kostnadInklMomsKr: undefined,
                          })
                        }
                        className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                      />
                      <MomsAvdragKnapp
                        kostnadKr={besiktning.kostnadFastKr}
                        momsAvdragenKr={besiktning.momsAvdragenKr}
                        kostnadInklMomsKr={besiktning.kostnadInklMomsKr}
                        onApply={({ kostnadExklMoms, momsAvdragen, kostnadInklMoms }) =>
                          uppdatera(besiktning.id, {
                            kostnadFastKr: kostnadExklMoms,
                            momsAvdragenKr: momsAvdragen,
                            kostnadInklMomsKr: kostnadInklMoms,
                          })
                        }
                        onAterstall={() => {
                          if (!besiktning.kostnadInklMomsKr) return;
                          uppdatera(besiktning.id, {
                            kostnadFastKr: besiktning.kostnadInklMomsKr,
                            momsAvdragenKr: undefined,
                            kostnadInklMomsKr: undefined,
                          });
                        }}
                      />
                    </label>
                  )}
                </div>
            </div>
          );
        })}
      </div>

      {unlocked && (
        <div className="mt-6 rounded-xl bg-[#eef6f0] p-4">
          <p className="text-sm font-semibold text-primary-dark">
            Förhandsvisning — besiktningar i planen ({planStartAr}–{planSlutAr})
          </p>
          <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto text-sm">
            {budgetPreview.map((rad) => (
              <li key={rad.ar} className="flex flex-wrap justify-between gap-2">
                <span className="font-medium text-foreground">{rad.ar}</span>
                <span className="text-muted">
                  {rad.summaBesiktningar > 0
                    ? formatKr(rad.summaBesiktningar)
                    : "— ingen besiktning"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className={`mt-6 flex flex-wrap items-center gap-3 ${lockedClass}`}>
        <button
          type="button"
          onClick={onSave}
          disabled={!unlocked}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
        >
          Spara besiktningar
        </button>
        {saved && (
          <p className="text-sm font-medium text-primary-dark">
            Sparat — gå vidare till utgifter i årsbudgeten (steg 6).
          </p>
        )}
      </div>
    </section>
  );
}
