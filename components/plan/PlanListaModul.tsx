"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  GRUNDMALL_PLAN_ID,
  PLAN_STATE_EVENT,
  lasAllaPlanIds,
  lasGrundmall,
  lasPlan,
  skapaNyPlan,
  sparaGrundmall,
  skapaUnikAtgardId,
  taBortPlan,
  type PlanPost,
} from "@/components/plan/plan-lager";
import {
  byggnadsmallar,
  type ByggnadsMall,
} from "@/components/plan/byggnads-mallar";

function formatDatum(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("sv-SE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

// ── Välj byggnadsperiod ───────────────────────────────────────────────────────

interface ValjByggnadsPeriodProps {
  grundmall: PlanPost;
  onKlar: () => void;
}

function ValjByggnadsPeriod({ grundmall, onKlar }: ValjByggnadsPeriodProps) {
  const [valdMall, setValdMall] = useState<ByggnadsMall | null>(null);
  const [bekrafta, setBekrafta] = useState(false);

  function tillampa(mall: ByggnadsMall) {
    // Slå ihop befintliga + nya unika komponenter
    const nyaKomponenter = [
      ...grundmall.komponenter,
      ...mall.komponenter.filter((k) => !grundmall.komponenter.includes(k)),
    ];

    const nyaAtgarder = [
      ...grundmall.atgarder,
      ...mall.atgarder.map((a) => ({
        ...a,
        id: skapaUnikAtgardId(),
        senastUtfortAr: "",
        nastaAr: "",
        uppskattadKostnadKr: "",
        prislistaId: "",
      })),
    ];

    sparaGrundmall({
      ...grundmall,
      notering: grundmall.notering || `Anpassad för byggnader från ${mall.period}.`,
      komponenter: nyaKomponenter,
      atgarder: nyaAtgarder,
    });
    onKlar();
  }

  if (bekrafta && valdMall) {
    return (
      <div className="mt-4 rounded-xl border border-primary/30 bg-white p-4">
        <p className="text-sm font-semibold text-foreground">
          Lägg till mallar för {valdMall.period}?
        </p>
        <p className="mt-1 text-sm text-muted">{valdMall.beskrivning}</p>
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted">
          <span>
            <strong>{valdMall.komponenter.length}</strong> komponenter läggs till
          </span>
          <span>
            <strong>{valdMall.atgarder.length}</strong> åtgärder läggs till
          </span>
        </div>
        <p className="mt-2 text-xs text-muted">
          Befintligt innehåll i grundmallen bevaras — enbart nytt läggs till.
        </p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => tillampa(valdMall)}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Ja, lägg till
          </button>
          <button
            type="button"
            onClick={() => { setBekrafta(false); setValdMall(null); }}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted hover:text-foreground"
          >
            Avbryt
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 border-t border-primary/20 pt-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
        Fyll i grundmall från byggnadsperiod
      </p>
      <p className="mb-3 text-xs text-muted">
        Välj det decennium fastigheten byggdes — typiska komponenter och
        underhållsåtgärder läggs automatiskt till i grundmallen.
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {byggnadsmallar.map((mall) => (
          <button
            key={mall.id}
            type="button"
            onClick={() => { setValdMall(mall); setBekrafta(true); }}
            className="group flex flex-col rounded-lg border border-border bg-white p-3 text-left transition-colors hover:border-primary/50 hover:bg-[#f7fbf8]"
          >
            <span className="text-xs font-semibold text-primary-dark">
              {mall.period}
            </span>
            <span className="mt-0.5 text-xs font-medium text-foreground">
              {mall.rubrik}
            </span>
            <span className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
              {mall.beskrivning}
            </span>
            <span className="mt-2 text-xs text-muted">
              {mall.komponenter.length} komponenter · {mall.atgarder.length} åtgärder
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Huvud-komponent ───────────────────────────────────────────────────────────

export function PlanListaModul() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [grundmall, setGrundmall] = useState<PlanPost | null>(null);
  const [planer, setPlaner] = useState<PlanPost[]>([]);
  const [nyttPlanNamn, setNyttPlanNamn] = useState("");
  const [skaparPlan, setSkaparPlan] = useState(false);
  const [bekraftaTaBort, setBekraftaTaBort] = useState<string | null>(null);
  const [visaPeriodValjare, setVisaPeriodValjare] = useState(false);
  const namnInputRef = useRef<HTMLInputElement>(null);

  function laddaData() {
    setGrundmall(lasGrundmall());
    const ids = lasAllaPlanIds();
    const laddade = ids
      .map((id) => lasPlan(id))
      .filter((p): p is PlanPost => p !== null);
    setPlaner(laddade);
  }

  useEffect(() => {
    laddaData();
    setHydrated(true);
    const hantera = () => laddaData();
    window.addEventListener(PLAN_STATE_EVENT, hantera);
    return () => window.removeEventListener(PLAN_STATE_EVENT, hantera);
  }, []);

  function hanteraSkapaNyPlan() {
    const namn = nyttPlanNamn.trim() || "Ny underhållsplan";
    skapaNyPlan(namn);
    setNyttPlanNamn("");
    setSkaparPlan(false);
    laddaData();
  }

  function hanteraTaBort(planId: string) {
    taBortPlan(planId);
    setBekraftaTaBort(null);
    laddaData();
  }

  if (!hydrated) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 rounded-xl bg-border/40" />
        <div className="h-24 rounded-xl bg-border/40" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Grundmall */}
      <section>
        <h2 className="mb-3 text-base font-semibold uppercase tracking-wide text-muted">
          Grundmall
        </h2>
        {grundmall && (
          <div className="rounded-xl border-2 border-primary/30 bg-[#eef6f0] p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📋</span>
                  <h3 className="text-lg font-semibold text-foreground">
                    {grundmall.namn}
                  </h3>
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary-dark">
                    Grundmall
                  </span>
                </div>
                {grundmall.notering && (
                  <p className="mt-1 text-sm text-muted">{grundmall.notering}</p>
                )}
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted">
                  <span>
                    <strong>{grundmall.komponenter.length}</strong> komponenter
                  </span>
                  <span>
                    <strong>{grundmall.atgarder.length}</strong> åtgärder
                  </span>
                  {grundmall.komponenter.length > 0 && (
                    <span className="text-foreground/70">
                      {grundmall.komponenter.slice(0, 5).join(", ")}
                      {grundmall.komponenter.length > 5 &&
                        ` +${grundmall.komponenter.length - 5} till`}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => setVisaPeriodValjare((v) => !v)}
                  className="rounded-lg border border-primary/30 bg-white px-3 py-2 text-sm font-medium text-primary-dark transition-colors hover:bg-[#daeee1]"
                  title="Välj byggnadsperiod för förifyllning"
                >
                  {visaPeriodValjare ? "Dölj ↑" : "Välj period ▾"}
                </button>
                <button
                  type="button"
                  onClick={() => router.push(`/forening/plan/${GRUNDMALL_PLAN_ID}`)}
                  className="rounded-lg border border-primary/30 bg-white px-3 py-2 text-sm font-medium text-primary-dark transition-colors hover:bg-[#daeee1]"
                >
                  Redigera
                </button>
              </div>
            </div>

            {/* Period-väljaren */}
            {visaPeriodValjare && (
              <ValjByggnadsPeriod
                grundmall={grundmall}
                onKlar={() => {
                  setVisaPeriodValjare(false);
                  laddaData();
                }}
              />
            )}

            {!visaPeriodValjare && (
              <p className="mt-3 text-xs text-muted/80">
                Grundmallen används som utgångspunkt när du skapar en ny
                underhållsplan — komponenter och åtgärder kopieras automatiskt.
                Klicka <strong>Välj period</strong> för att förifyllas med
                typiska komponenter från fastighetens byggnadsperiod.
              </p>
            )}
          </div>
        )}
      </section>

      {/* Mina planer */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold uppercase tracking-wide text-muted">
            Underhållsplaner
          </h2>
          <span className="rounded-full bg-border/50 px-2.5 py-0.5 text-xs font-medium text-muted">
            {planer.length} st
          </span>
        </div>

        {planer.length === 0 && !skaparPlan && (
          <p className="mb-4 text-sm text-muted">
            Inga planer skapade ännu. Klicka nedan för att skapa din första
            underhållsplan — grundmallens komponenter och åtgärder kopieras
            automatiskt.
          </p>
        )}

        <div className="space-y-3">
          {planer.map((plan) => (
            <div
              key={plan.id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-foreground">{plan.namn}</h3>
                {plan.notering && (
                  <p className="mt-0.5 text-sm text-muted line-clamp-1">
                    {plan.notering}
                  </p>
                )}
                <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-muted">
                  <span>Skapad {formatDatum(plan.skapadTidpunkt)}</span>
                  <span>
                    <strong>{plan.komponenter.length}</strong> komponenter
                  </span>
                  <span>
                    <strong>{plan.atgarder.length}</strong> åtgärder
                  </span>
                </div>
              </div>

              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => router.push(`/forening/plan/${plan.id}`)}
                  className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary-dark"
                >
                  Redigera
                </button>
                {bekraftaTaBort === plan.id ? (
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => hanteraTaBort(plan.id)}
                      className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-700"
                    >
                      Ja, ta bort
                    </button>
                    <button
                      type="button"
                      onClick={() => setBekraftaTaBort(null)}
                      className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted hover:text-foreground"
                    >
                      Avbryt
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setBekraftaTaBort(plan.id)}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:border-red-300 hover:text-red-600"
                  >
                    Ta bort
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Skapa ny plan */}
          {skaparPlan ? (
            <div className="rounded-xl border-2 border-dashed border-primary/30 bg-[#f7fbf8] p-4">
              <p className="mb-2 text-sm font-medium text-foreground">
                Namn på den nya planen
              </p>
              <div className="flex gap-2">
                <input
                  ref={namnInputRef}
                  type="text"
                  value={nyttPlanNamn}
                  onChange={(e) => setNyttPlanNamn(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") hanteraSkapaNyPlan();
                    if (e.key === "Escape") setSkaparPlan(false);
                  }}
                  placeholder="t.ex. Underhållsplan 2025–2075"
                  autoFocus
                  className="flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={hanteraSkapaNyPlan}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
                >
                  Skapa
                </button>
                <button
                  type="button"
                  onClick={() => setSkaparPlan(false)}
                  className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted hover:text-foreground"
                >
                  Avbryt
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setSkaparPlan(true);
                setTimeout(() => namnInputRef.current?.focus(), 50);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-4 text-sm font-medium text-muted transition-colors hover:border-primary/40 hover:text-primary-dark"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-4 w-4"
                aria-hidden
              >
                <path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
              </svg>
              Skapa ny underhållsplan
            </button>
          )}
        </div>
      </section>

      {/* Länk till prislistor */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-foreground">Leverantörsprislistor</p>
            <p className="mt-0.5 text-sm text-muted">
              Lägg in priser från leverantörer för att koppla åtgärder till
              aktuella kostnader.
            </p>
          </div>
          <a
            href="/forening/prislistor"
            className="shrink-0 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary-dark"
          >
            Hantera prislistor →
          </a>
        </div>
      </div>
    </div>
  );
}
