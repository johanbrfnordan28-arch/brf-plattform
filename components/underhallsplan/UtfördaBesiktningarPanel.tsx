"use client";

import {
  beraknaBesiktningKostnadInklIntern,
  besiktningKostnadFormel,
  besiktningMallar,
  formatKr,
  hamtaBesiktningIntervallAlternativ,
  ingarEjIForeningensBudget,
  normaliseraOvkBesiktning,
  OVK_DEFAULT_VERKSAMHET_KR,
  OVK_INTERVALL_VERKSAMHET_AR,
  ovkIntervallBostadHint,
  ovkBostadIntervallFromVentilation,
  synkaNastaBesiktningFranUtfört,
  type Besiktning,
  type BesiktningId,
} from "@/components/underhallsplan/besiktningar";

export { synkaNastaBesiktningFranUtfört };

type UtfördaBesiktningarPanelProps = {
  lista: Besiktning[];
  antalLagenheter: number;
  planLangdAr?: number;
  ventilationssystem?: string;
  onChange: (lista: Besiktning[]) => void;
};

/** Senast utförda obligatoriska besiktningar — fylls i steg 2. */
export function UtfördaBesiktningarPanel({
  lista,
  antalLagenheter,
  planLangdAr = 50,
  ventilationssystem = "",
  onChange,
}: UtfördaBesiktningarPanelProps) {
  const ovkBostadIntervall = ovkBostadIntervallFromVentilation(ventilationssystem);

  function uppdatera(id: BesiktningId, patch: Partial<Besiktning>) {
    onChange(
      lista.map((item) => {
        if (item.id !== id) return item;
        const next = { ...item, ...patch };
        if (id === "ovk") {
          return normaliseraOvkBesiktning(next, ventilationssystem);
        }
        return next;
      }),
    );
  }

  function toggleBesiktning(id: BesiktningId) {
    onChange(
      lista.map((item) =>
        item.id === id ? { ...item, aktiv: !item.aktiv } : item,
      ),
    );
  }

  return (
    <div className="rounded-xl border border-border bg-background/80 p-4 sm:p-5">
      <p className="text-sm font-semibold text-foreground">
        Utförda besiktningar (OVK, sotning m.m.)
      </p>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        Ange senaste tillfälle och kostnad här. Vid sparning i steg 2 räknas nästa
        besiktning ut (senast år + intervall) — schemat justeras i steg 4. Stäng av
        det som inte gäller er förening.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
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

      <ul className="mt-4 space-y-3">
        {lista.filter((b) => b.aktiv).map((besiktning) => {
          const mall = besiktningMallar.find((m) => m.id === besiktning.id);
          const senastKostnad =
            besiktning.senastKostnadKr != null && besiktning.senastKostnadKr > 0
              ? besiktning.senastKostnadKr
              : beraknaBesiktningKostnadInklIntern(besiktning, antalLagenheter);
          const formel = besiktningKostnadFormel(besiktning, antalLagenheter);
          const intervallAlternativ = hamtaBesiktningIntervallAlternativ(
            besiktning.id,
            planLangdAr,
          );

          return (
            <li
              key={besiktning.id}
              className="rounded-lg border border-border bg-white p-3 sm:p-4"
            >
              <p className="font-medium text-foreground">{besiktning.namn}</p>

              <div className="mt-3 space-y-3">
                {besiktning.id === "sotning" && (
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
                      <span className="text-xs text-foreground">
                        <span className="font-medium">Intern debitering</span>
                        {" — "}
                        lägenheter med öppen spis/eldstad debiteras direkt
                      </span>
                    </label>
                    {besiktning.sotningInternDebitering && (
                      <label className="mt-2 block max-w-[12rem] text-sm">
                        <span className="text-xs font-medium text-muted">
                          Antal lägenheter med öppen spis/eldstad
                        </span>
                        <input
                          type="number"
                          min={0}
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
                    <label className="mt-2 block max-w-[12rem] text-sm">
                      <span className="text-xs font-medium text-muted">
                        Intervall (år)
                      </span>
                      <select
                        value={besiktning.intervallAr}
                        onChange={(event) =>
                          uppdatera(besiktning.id, {
                            intervallAr: Number(event.target.value),
                          })
                        }
                        className="mt-1 w-full rounded-lg border border-border px-2.5 py-1.5 text-sm"
                      >
                        {intervallAlternativ.map((ar) => (
                          <option key={ar} value={ar}>
                            Vart {ar}:e år
                            {mall?.defaultIntervall === ar ? " (rekomm.)" : ""}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                )}

                {besiktning.id === "ovk" && (
                  <div className="space-y-3 rounded-lg border border-border/80 bg-white px-2.5 py-2">
                    <p className="text-xs leading-relaxed text-muted">
                      {ovkIntervallBostadHint(ventilationssystem)}
                    </p>
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
                          })
                        }
                        className="mt-0.5 h-4 w-4 rounded border-border text-primary"
                      />
                      <span className="text-xs text-foreground">
                        Inkludera OVK för verksamhetslokaler (vart{" "}
                        {OVK_INTERVALL_VERKSAMHET_AR}:e år)
                      </span>
                    </label>
                    <label className="block max-w-[12rem] text-sm">
                      <span className="text-xs font-medium text-muted">
                        Intervall bostäder (år)
                      </span>
                      <select
                        value={besiktning.intervallAr}
                        onChange={(event) =>
                          uppdatera(besiktning.id, {
                            intervallAr: Number(event.target.value),
                          })
                        }
                        className="mt-1 w-full rounded-lg border border-border px-2.5 py-1.5 text-sm"
                      >
                        {intervallAlternativ.map((ar) => (
                          <option key={ar} value={ar}>
                            Vart {ar}:e år
                            {ovkBostadIntervall === ar ? " (enligt ventilation)" : ""}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm">
                    <span className="text-xs font-medium text-muted">
                      {besiktning.id === "ovk" && besiktning.ovkInkluderaVerksamhet
                        ? "Senast OVK bostäder (år)"
                        : "Senast utförd (år)"}
                    </span>
                    <input
                      type="number"
                      min={1900}
                      max={2100}
                      value={besiktning.senastUtförtAr ?? ""}
                      onChange={(event) => {
                        const ar = Number.parseInt(event.target.value, 10);
                        uppdatera(besiktning.id, {
                          senastUtförtAr: Number.isNaN(ar) ? undefined : ar,
                        });
                      }}
                      placeholder="t.ex. 2024"
                      className="mt-1 w-full rounded-lg border border-border px-2.5 py-1.5 text-sm"
                    />
                  </label>
                  {besiktning.id === "ovk" && besiktning.ovkInkluderaVerksamhet && (
                    <label className="block text-sm">
                      <span className="text-xs font-medium text-muted">
                        Senast OVK verksamhet (år)
                      </span>
                      <input
                        type="number"
                        min={1900}
                        max={2100}
                        value={besiktning.ovkSenastVerksamhetAr ?? ""}
                        onChange={(event) => {
                          const ar = Number.parseInt(event.target.value, 10);
                          uppdatera(besiktning.id, {
                            ovkSenastVerksamhetAr: Number.isNaN(ar)
                              ? undefined
                              : ar,
                          });
                        }}
                        placeholder="t.ex. 2025"
                        className="mt-1 w-full rounded-lg border border-border px-2.5 py-1.5 text-sm"
                      />
                    </label>
                  )}
                  <label className="block text-sm sm:col-span-2">
                    <span className="text-xs font-medium text-muted">
                      Kostnad senaste tillfälle (kr)
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={besiktning.senastKostnadKr ?? ""}
                      onChange={(event) => {
                        const kr = Number.parseInt(event.target.value, 10);
                        uppdatera(besiktning.id, {
                          senastKostnadKr: Number.isNaN(kr) ? undefined : kr,
                        });
                      }}
                      placeholder={String(senastKostnad)}
                      className="mt-1 w-full rounded-lg border border-border px-2.5 py-1.5 text-sm"
                    />
                    <span className="mt-1 block text-xs text-muted">
                      Schablon: {formatKr(senastKostnad)} ({formel})
                      {ingarEjIForeningensBudget(besiktning) &&
                        " — ingår ej i föreningsbudget"}
                    </span>
                  </label>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {antalLagenheter === 0 && (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          Ange antal lägenheter i grunduppgifterna för schablonkostnad per lägenhet.
        </p>
      )}
    </div>
  );
}
