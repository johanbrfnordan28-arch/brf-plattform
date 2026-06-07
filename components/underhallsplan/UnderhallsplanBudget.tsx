"use client";

import { useMemo } from "react";
import { formatKr, type Besiktning } from "@/components/underhallsplan/besiktningar";
import type { KomponentDetaljData } from "@/components/underhallsplan/komponentregister";
import { hamtaPlanSlutAr } from "@/components/underhallsplan/planinstallningar";
import { sammanstallRegisterKostnader } from "@/components/underhallsplan/register-kostnad";
import type { PlanKostnaderNormaliserade } from "@/components/underhallsplan/plan-kostnader";
import type { UtfördRenovering } from "@/components/underhallsplan/renoveringar";
import type { Samfallighetsavgift } from "@/components/underhallsplan/samfallighetsavgift";
import {
  beraknaPlanUtgiftsRader,
  beraknaPlanAvsattning,
  beraknaRekommenderadKrPerKvmAr,
  summaPlaneradeInvesteringar,
} from "@/components/underhallsplan/plan-budget-sammanfattning";
import {
  FORKLARING_ARSBUDGET_VS_PLAN,
  FORKLARING_INVESTERING,
  PLAN_BEGREPP,
} from "@/components/underhallsplan/plan-terminologi";
import {
  samlaAllaUnderhallAtgarder,
} from "@/components/underhallsplan/underhall-budget";

type UnderhallsplanBudgetProps = {
  unlocked: boolean;
  planStartAr: number;
  planLangdAr: number;
  boareaM2: number;
  antalLagenheter: number;
  activeComponents: string[];
  besiktningar: Besiktning[];
  samfallighetsavgift?: Samfallighetsavgift;
  komponentDetaljer: Record<string, KomponentDetaljData>;
  krPerKvmAr: number;
  onKrPerKvmArChange: (value: number) => void;
  renoveringar?: UtfördRenovering[];
  planKostnader?: PlanKostnaderNormaliserade;
};

export function UnderhallsplanBudget({
  unlocked,
  planStartAr,
  planLangdAr,
  boareaM2,
  antalLagenheter,
  activeComponents,
  besiktningar,
  samfallighetsavgift,
  komponentDetaljer,
  krPerKvmAr,
  onKrPerKvmArChange,
  renoveringar = [],
  planKostnader,
}: UnderhallsplanBudgetProps) {
  const planSlutAr = hamtaPlanSlutAr(planStartAr, planLangdAr);

  const underhallAtgarder = useMemo(
    () =>
      samlaAllaUnderhallAtgarder(
        activeComponents,
        komponentDetaljer,
        renoveringar,
        planStartAr,
        planLangdAr,
        planKostnader,
      ),
    [
      activeComponents,
      komponentDetaljer,
      renoveringar,
      planStartAr,
      planLangdAr,
      planKostnader,
    ],
  );

  const atgarderFranHistorik = underhallAtgarder.filter((a) => a.kalla === "historik");
  const atgarderFranRegister = underhallAtgarder.filter(
    (a) => a.kalla !== "historik",
  );

  const investeringSummeradPerAr = useMemo(() => {
    const map = new Map<
      number,
      { summaKr: number; poster: { komponent: string; del: string; beloppKr: number }[] }
    >();
    for (const a of underhallAtgarder) {
      const befintlig = map.get(a.ar) ?? { summaKr: 0, poster: [] };
      befintlig.summaKr += a.kostnadKr;
      befintlig.poster.push({
        komponent: a.komponent,
        del: a.del,
        beloppKr: a.kostnadKr,
      });
      map.set(a.ar, befintlig);
    }
    return [...map.entries()]
      .map(([ar, data]) => ({ ar, ...data }))
      .sort((a, b) => a.ar - b.ar);
  }, [underhallAtgarder]);

  const avsattning = beraknaPlanAvsattning(boareaM2, krPerKvmAr, planLangdAr);
  const komponentArskostnad = avsattning.arligAvsattningKr;

  const summaInvesteringPlan = useMemo(
    () =>
      summaPlaneradeInvesteringar(
        underhallAtgarder,
        planStartAr,
        planLangdAr,
      ),
    [underhallAtgarder, planStartAr, planLangdAr],
  );

  const rekommenderadKrPerKvmAr = useMemo(
    () =>
      beraknaRekommenderadKrPerKvmAr(
        summaInvesteringPlan,
        boareaM2,
        planLangdAr,
      ),
    [summaInvesteringPlan, boareaM2, planLangdAr],
  );

  const avsattningUnderRekommendation =
    rekommenderadKrPerKvmAr != null &&
    krPerKvmAr < Math.round(rekommenderadKrPerKvmAr * 0.95);

  const registerKostnader = sammanstallRegisterKostnader(
    activeComponents,
    komponentDetaljer,
  );

  const utgiftsRader = useMemo(
    () =>
      beraknaPlanUtgiftsRader({
        activeComponents,
        komponentDetaljer,
        besiktningar,
        samfallighetsavgift,
        renoveringarLista: renoveringar,
        antalLagenheter,
        planStartAr,
        planLangdAr,
        boareaM2,
        krPerKvmAr,
        planKostnader,
      }),
    [
      activeComponents,
      komponentDetaljer,
      besiktningar,
      samfallighetsavgift,
      renoveringar,
      antalLagenheter,
      planStartAr,
      planLangdAr,
      boareaM2,
      krPerKvmAr,
      planKostnader,
    ],
  );

  const medelBesiktning =
    utgiftsRader.length > 0
      ? Math.round(
          utgiftsRader.reduce((sum, r) => sum + r.besiktningar, 0) /
            utgiftsRader.length,
        )
      : 0;

  const lockedClass = !unlocked ? "pointer-events-none opacity-50" : "";

  return (
    <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
      <p className="text-sm font-semibold text-primary-dark">Steg 6</p>
      <h2 className="mt-1 text-xl font-semibold text-foreground">
        {PLAN_BEGREPP.arsbudgetSteg}
      </h2>
      <p className="mt-3 rounded-lg border border-primary/20 bg-[#eef6f0]/50 px-4 py-3 text-sm leading-relaxed text-foreground">
        {FORKLARING_ARSBUDGET_VS_PLAN}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Planperiod {planStartAr}–{planSlutAr} ({planLangdAr} år). Tabellen visar
        vad som ska budgeteras i föreningen det året — avsättning varje år och
        besiktningar det år de utförs (t.ex. vart 10:e år). Investeringar från
        underhållsplanen visas i egen kolumn.
      </p>

      {!unlocked && (
        <p className="mt-4 rounded-lg border border-dashed border-border bg-background px-4 py-3 text-sm text-muted">
          Spara besiktningarna i steg 4 först, sedan aktiveras steget.
        </p>
      )}

      <div className={`mt-6 space-y-6 ${lockedClass}`}>
        <div>
          <p className="text-sm font-semibold text-foreground">
            Tabell — utgifter i årsbudgeten ({planStartAr}–{planSlutAr})
          </p>
          <div className="mt-3 max-h-[28rem] overflow-auto rounded-xl border border-border">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="sticky top-0 z-10 bg-background text-muted shadow-sm">
                <tr>
                  <th className="px-4 py-2 font-medium">År</th>
                  <th className="px-4 py-2 font-medium">Besiktningar</th>
                  <th className="px-4 py-2 font-medium text-right">Avsättning</th>
                  <th className="px-4 py-2 font-medium text-right">Besiktning</th>
                  <th className="px-4 py-2 font-medium text-right">Summa årsbudget</th>
                  <th className="px-4 py-2 font-medium text-right">Investering (plan)</th>
                </tr>
              </thead>
              <tbody>
                {utgiftsRader.map((rad) => (
                  <tr key={rad.ar} className="border-t border-border">
                    <td className="px-4 py-2 font-medium text-foreground">{rad.ar}</td>
                    <td className="px-4 py-2 text-muted">
                      {rad.besiktningPoster.length > 0 ? (
                        <ul className="space-y-0.5">
                          {rad.besiktningPoster.map((p) => (
                            <li key={p.namn}>
                              {p.namn}: {formatKr(p.belopp)}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-2 text-right text-foreground">
                      {komponentArskostnad > 0 ? formatKr(rad.avsattning) : "—"}
                    </td>
                    <td
                      className={`px-4 py-2 text-right font-medium ${
                        rad.besiktningar > 0
                          ? "text-primary-dark"
                          : "text-muted"
                      }`}
                    >
                      {rad.besiktningar > 0 ? formatKr(rad.besiktningar) : "—"}
                    </td>
                    <td className="px-4 py-2 text-right font-semibold text-primary-dark">
                      {formatKr(rad.utgifterArsbudget)}
                    </td>
                    <td
                      className={`px-4 py-2 text-right font-medium ${
                        rad.investeringPlan > 0
                          ? "text-violet-800"
                          : "text-muted"
                      }`}
                    >
                      {rad.investeringPlan > 0
                        ? formatKr(rad.investeringPlan)
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-muted">
            Snitt besiktningar över planperioden: {formatKr(medelBesiktning)}/år.{" "}
            {FORKLARING_INVESTERING}
          </p>
        </div>

        {investeringSummeradPerAr.length > 0 && (
          <div className="rounded-xl border border-violet-200/80 bg-violet-50/30 px-4 py-3">
            <p className="text-sm font-semibold text-violet-950">
              Investering per år — summerat
            </p>
            <p className="mt-1 text-xs text-muted">
              Alla planerade åtgärder det året adderas till kolumnen Investering
              (plan) i tabellen ovan.
            </p>
            <div className="mt-3 space-y-3">
              {investeringSummeradPerAr.map((grupp) => (
                <div
                  key={grupp.ar}
                  className="rounded-lg border border-border/80 bg-white px-3 py-2"
                >
                  <p className="flex flex-wrap items-baseline justify-between gap-2 text-sm font-semibold text-foreground">
                    <span>{grupp.ar}</span>
                    <span className="text-primary-dark">{formatKr(grupp.summaKr)}</span>
                  </p>
                  <ul className="mt-1.5 space-y-0.5 text-xs text-muted">
                    {grupp.poster.map((p, i) => (
                      <li key={`${p.komponent}-${p.del}-${i}`}>
                        {p.komponent} — {p.del}: {formatKr(p.beloppKr)}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {atgarderFranHistorik.length > 0 && (
          <div className="rounded-xl border border-violet-200 bg-violet-50/60 px-4 py-3">
            <p className="text-sm font-semibold text-violet-950">
              Planerade investeringar — från renoveringshistorik
            </p>
            <p className="mt-1 text-xs text-muted">
              Nästa förekomst beräknas från senaste utförda åtgärd, intervall,
              årligt index (steg 1), branschregler samt upphandling och
              projektledning i procent.
            </p>
            <ul className="mt-2 max-h-52 space-y-2 overflow-y-auto text-sm">
              {atgarderFranHistorik.map((a, i) => (
                <li
                  key={`${a.kallaRenoveringId}-${a.ar}-${i}`}
                  className="rounded-lg border border-border/80 bg-white px-3 py-2"
                >
                  <p className="font-medium text-foreground">
                    {a.ar}: {a.komponent} — {a.del},{" "}
                    {formatKr(a.kostnadKr)}
                  </p>
                  {a.kallaRenoveringTitel && a.kallaRenoveringAr && (
                    <p className="mt-0.5 text-xs text-muted">
                      Upprepar «{a.kallaRenoveringTitel}» ({a.kallaRenoveringAr})
                      · vart {a.intervallAr}:e år
                    </p>
                  )}
                  {a.kostnadForklaring && (
                    <p className="mt-1 text-xs text-muted">{a.kostnadForklaring}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {atgarderFranRegister.length > 0 && (
          <div className="rounded-xl border border-violet-200/80 bg-violet-50/40 px-4 py-3">
            <p className="text-sm font-semibold text-violet-950">
              Planerade investeringar — från registret
            </p>
            <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-sm text-muted">
              {atgarderFranRegister.map((a, i) => (
                <li key={`${a.komponent}-${a.del}-${a.ar}-${i}`}>
                  {a.ar}: {a.komponent} — {a.del}, {formatKr(a.kostnadKr)}
                </li>
              ))}
            </ul>
          </div>
        )}

        {registerKostnader.totaltKr > 0 && (
          <div className="rounded-xl border border-[#e2f0e6] bg-[#eef6f0]/50 px-4 py-3">
            <p className="text-sm font-semibold text-primary-dark">
              Uppskattade kostnader från registret (engång)
            </p>
            <p className="mt-1 text-xs text-muted">
              Beräknat från riktpriser och enhetspris i komponentregistret. Visas
              som total tills år är kopplade i planen.
            </p>
            <ul className="mt-2 space-y-1 text-sm text-foreground">
              {registerKostnader.rader.map((rad) => (
                <li key={rad.id}>
                  {rad.komponent} — {rad.etikett}: {formatKr(rad.beloppKr)}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-lg font-semibold text-foreground">
              Totalt: {formatKr(registerKostnader.totaltKr)}
            </p>
          </div>
        )}

        <div>
          <p className="text-sm font-semibold text-foreground">
            Avsättning i årsbudgeten (kr/m² och år)
          </p>
          <p className="mt-1 text-xs text-muted">
            <strong className="font-medium text-foreground">Två delar:</strong>{" "}
            kolumnen <em>Investering (plan)</em> visar när större åtgärder sker (steg
            3). Fältet kr/m²/år är den jämna avsättningen varje år — det{" "}
            <strong className="font-medium">höjs automatiskt</strong> när planens
            totala investeringskostnad ökar (aldrig sänks automatiskt).
          </p>

          {summaInvesteringPlan > 0 && boareaM2 > 0 && (
            <div className="mt-3 rounded-xl border border-[#d4e8da] bg-[#eef6f0]/60 px-4 py-3">
              <p className="text-sm font-semibold text-primary-dark">
                Koppling till planerade kostnader
              </p>
              <p className="mt-1 text-sm text-foreground">
                Summa investeringar i planen ({planStartAr}–{planSlutAr}):{" "}
                <strong>{formatKr(summaInvesteringPlan)}</strong>
              </p>
              {rekommenderadKrPerKvmAr != null && (
                <>
                  <p className="mt-2 text-sm text-foreground">
                    För att avsättningen ska motsvara samma total över{" "}
                    {planLangdAr} år och {boareaM2.toLocaleString("sv-SE")} m²
                    bo- och lokalyta: cirka{" "}
                    <strong>{rekommenderadKrPerKvmAr} kr/m²/år</strong> (
                    {formatKr(rekommenderadKrPerKvmAr * boareaM2)}/år).
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Nuvarande val: {krPerKvmAr} kr/m²/år (
                    {formatKr(komponentArskostnad)}/år).
                  </p>
                  {krPerKvmAr !== rekommenderadKrPerKvmAr && (
                    <button
                      type="button"
                      onClick={() => onKrPerKvmArChange(rekommenderadKrPerKvmAr)}
                      className="mt-3 rounded-lg border border-primary bg-white px-3 py-1.5 text-xs font-medium text-primary-dark hover:bg-[#e2f0e6]"
                    >
                      Sätt till rekommenderat {rekommenderadKrPerKvmAr} kr/m²/år
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {summaInvesteringPlan <= 0 && (
            <p className="mt-3 rounded-lg border border-dashed border-amber-300/80 bg-amber-50/80 px-3 py-2 text-xs text-amber-950">
              Inga planerade investeringar med kostnad hittades ännu. Fyll i kostnad
              och intervall under steg 3 (tillfällen med pris, eller nästa år +
              kostnad per underkomponent) och spara komponentregistret — då kan
              förslag på avsättning räknas fram här.
            </p>
          )}

          {avsattningUnderRekommendation && rekommenderadKrPerKvmAr != null && (
            <p className="mt-3 rounded-lg border border-amber-300/80 bg-amber-50/80 px-3 py-2 text-xs text-amber-950">
              Planens kostnader motsvarar cirka {rekommenderadKrPerKvmAr} kr/m²/år —
              värdet höjs automatiskt vid nästa ändring i registret om det fortfarande
              ligger lägre. Du kan också trycka knappen ovan.
            </p>
          )}

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-foreground">
                Underhållskostnad (kr/m²/år)
              </span>
              <input
                type="number"
                min={0}
                value={krPerKvmAr}
                onChange={(event) =>
                  onKrPerKvmArChange(Number(event.target.value) || 0)
                }
                className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
              />
            </label>
            <div className="rounded-lg border border-border bg-background px-4 py-3 text-sm">
              <p className="text-muted">Bo- och lokalyta (avsättningsyta)</p>
              <p className="font-medium text-foreground">
                {boareaM2 > 0
                  ? `${boareaM2.toLocaleString("sv-SE")} m²`
                  : "Ange boarea och lokalyta i steg 1"}
              </p>
              <p className="mt-2 text-muted">Samma belopp varje år i planen</p>
              <p className="font-semibold text-primary-dark">
                {formatKr(komponentArskostnad)}/år
              </p>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted">
          Steg 7 nedan visar slutsidan — samlad presentation av planen för styrelsen.
        </p>
      </div>
    </section>
  );
}
