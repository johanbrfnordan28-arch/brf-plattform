"use client";

import { useMemo, useState, type ReactNode } from "react";
import { formatKr } from "@/components/underhallsplan/besiktningar";
import { PLAN_BEGREPP } from "@/components/underhallsplan/plan-terminologi";
import type { PlanUtgiftsArRad } from "@/components/underhallsplan/plan-budget-sammanfattning";

const FARG = {
  avsattning: "#2d6a4f",
  besiktning: "#b45309",
  direktkostnad: "#ca8a04",
  investering: "#5b21b6",
} as const;

/** Intern SVG-upplösning 2× visningsstorlek — skarpare text och linjer på skärm och i PDF. */
const SVG_SCALE = 2;
const DIAGRAM_DISPLAY_W = 720;
const DIAGRAM_DISPLAY_H = 240;
const TIMELINE_DISPLAY_W = 720;
const TIMELINE_DISPLAY_H = 300;

type PlanPresentationDiagramProps = {
  rader: PlanUtgiftsArRad[];
  planStartAr: number;
  planSlutAr: number;
};

type TidsaxelMarkor = {
  rad: PlanUtgiftsArRad;
  xProcent: number;
  ovanAxel: boolean;
};

function formatKrKort(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} mkr`;
  if (value >= 1_000) return `${Math.round(value / 1000)} tkr`;
  return `${value}`;
}

function valjVisningsFonster(
  rader: PlanUtgiftsArRad[],
  fonsterAr: number,
): PlanUtgiftsArRad[] {
  if (rader.length <= fonsterAr) return rader;
  const steg = Math.max(1, Math.floor(rader.length / fonsterAr));
  return rader.filter((_, i) => i % steg === 0 || i === rader.length - 1);
}

function hamtaArIndex(ar: number, rader: PlanUtgiftsArRad[]): number {
  const idx = rader.findIndex((r) => r.ar === ar);
  return idx >= 0 ? idx : 0;
}

function hamtaArPositionProcent(ar: number, rader: PlanUtgiftsArRad[]): number {
  if (rader.length <= 1) return 50;
  return (hamtaArIndex(ar, rader) / (rader.length - 1)) * 100;
}

function placeraTidsaxelMarkorer(
  toppAr: PlanUtgiftsArRad[],
  rader: PlanUtgiftsArRad[],
): TidsaxelMarkor[] {
  const minAvstandProcent = 11;
  const sorterade = [...toppAr].sort(
    (a, b) => hamtaArIndex(a.ar, rader) - hamtaArIndex(b.ar, rader),
  );
  let senasteX = -minAvstandProcent;
  let ovanAxel = true;

  return sorterade.map((rad) => {
    const xProcent = hamtaArPositionProcent(rad.ar, rader);
    if (xProcent - senasteX < minAvstandProcent) {
      ovanAxel = !ovanAxel;
    } else {
      ovanAxel = true;
    }
    senasteX = xProcent;
    return { rad, xProcent, ovanAxel };
  });
}

function SkarpDiagramSvg({
  viewWidth,
  viewHeight,
  displayWidth,
  displayHeight,
  ariaLabel,
  children,
}: {
  viewWidth: number;
  viewHeight: number;
  displayWidth: number;
  displayHeight: number;
  ariaLabel: string;
  children: ReactNode;
}) {
  return (
    <svg
      viewBox={`0 0 ${viewWidth} ${viewHeight}`}
      width={displayWidth}
      height={displayHeight}
      className="mx-auto block h-auto max-w-full"
      role="img"
      aria-label={ariaLabel}
      shapeRendering="geometricPrecision"
      textRendering="geometricPrecision"
    >
      {children}
    </svg>
  );
}

export function PlanPresentationDiagram({
  rader,
  planStartAr,
  planSlutAr,
}: PlanPresentationDiagramProps) {
  const [fonsterIndex, setFonsterIndex] = useState(0);

  const maxKassaflode = Math.max(...rader.map((r) => r.totaltKassaflode), 1);
  const maxArsbudget = Math.max(...rader.map((r) => r.utgifterArsbudget), 1);
  const skalaMax = Math.max(maxKassaflode, maxArsbudget);

  const fonsterStorlek = rader.length > 24 ? 20 : rader.length;
  const antalFonster = Math.max(1, Math.ceil(rader.length / fonsterStorlek));

  const fonsterRader = useMemo(() => {
    const start = fonsterIndex * fonsterStorlek;
    return rader.slice(start, start + fonsterStorlek);
  }, [rader, fonsterIndex, fonsterStorlek]);

  const diagramRader = valjVisningsFonster(
    fonsterRader,
    fonsterRader.length > 16 ? 16 : fonsterRader.length,
  );

  const chartW = DIAGRAM_DISPLAY_W * SVG_SCALE;
  const chartH = DIAGRAM_DISPLAY_H * SVG_SCALE;
  const padL = 52 * SVG_SCALE;
  const padR = 12 * SVG_SCALE;
  const padT = 12 * SVG_SCALE;
  const padB = 36 * SVG_SCALE;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;
  const barGap = diagramRader.length > 0 ? plotW / diagramRader.length : plotW;
  const barW = Math.max(4 * SVG_SCALE, barGap * 0.72);
  const axisFont = 11 * SVG_SCALE;
  const arFont = 10 * SVG_SCALE;

  const toppAr = useMemo(
    () =>
      [...rader]
        .sort((a, b) => b.totaltKassaflode - a.totaltKassaflode)
        .slice(0, 6)
        .filter((r) => r.totaltKassaflode > 0),
    [rader],
  );

  const tidsaxelMarkorer = useMemo(
    () => placeraTidsaxelMarkorer(toppAr, rader),
    [toppAr, rader],
  );

  const timelineW = TIMELINE_DISPLAY_W * SVG_SCALE;
  const timelineH = TIMELINE_DISPLAY_H * SVG_SCALE;
  const tlPadL = 48 * SVG_SCALE;
  const tlPadR = 48 * SVG_SCALE;
  const tlPlotW = timelineW - tlPadL - tlPadR;
  /** Horisontell skiljelinje — tydligt under all markörtext (flyttad ~72px från ursprunglig position). */
  const tlAxisY = 168 * SVG_SCALE;
  const tlMarkRad = 22 * SVG_SCALE;
  const tlMarkFont = 13 * SVG_SCALE;
  const tlMarkOffset = 72 * SVG_SCALE;
  const tlLabelFont = 11 * SVG_SCALE;
  const tlYearFont = 13 * SVG_SCALE;
  const tlLabelLineH = 14 * SVG_SCALE;
  const tlGapTillAxel = 22 * SVG_SCALE;
  const tlEndpointYearY = tlAxisY + 30 * SVG_SCALE;

  return (
    <div className="space-y-8">
      <div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Budgetunderlag och planerat underhåll per år
            </h3>
            <p className="mt-1 text-sm text-muted">
              Grönt/orange = {PLAN_BEGREPP.utgifterArsbudget.toLowerCase()}{" "}
              (avsättning, besiktningar och periodiskt underhåll som
              kostnadsförs direkt). Lila = {PLAN_BEGREPP.investeringarPlan.toLowerCase()}{" "}
              — investeringar i fastigheten enligt planen.
            </p>
          </div>
          {antalFonster > 1 && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={fonsterIndex <= 0}
                onClick={() => setFonsterIndex((i) => Math.max(0, i - 1))}
                className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-40"
              >
                ← Tidigare
              </button>
              <span className="text-xs text-muted">
                {fonsterRader[0]?.ar}–{fonsterRader[fonsterRader.length - 1]?.ar}
              </span>
              <button
                type="button"
                disabled={fonsterIndex >= antalFonster - 1}
                onClick={() =>
                  setFonsterIndex((i) => Math.min(antalFonster - 1, i + 1))
                }
                className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-40"
              >
                Senare →
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span
              className="h-3 w-3 rounded-sm"
              style={{ backgroundColor: FARG.avsattning }}
            />
            {PLAN_BEGREPP.avsattning}
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="h-3 w-3 rounded-sm"
              style={{ backgroundColor: FARG.besiktning }}
            />
            {PLAN_BEGREPP.besiktningar}
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="h-3 w-3 rounded-sm"
              style={{ backgroundColor: FARG.direktkostnad }}
            />
            {PLAN_BEGREPP.direktkostnader}
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="h-3 w-3 rounded-sm"
              style={{ backgroundColor: FARG.investering }}
            />
            {PLAN_BEGREPP.investeringarPlan}
          </span>
        </div>

        <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-white p-3">
          <SkarpDiagramSvg
            viewWidth={chartW}
            viewHeight={chartH}
            displayWidth={DIAGRAM_DISPLAY_W}
            displayHeight={DIAGRAM_DISPLAY_H}
            ariaLabel="Diagram över budgetunderlag och planerat underhåll"
          >
            {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
              const y = padT + plotH * (1 - tick);
              const val = Math.round(skalaMax * tick);
              return (
                <g key={tick}>
                  <line
                    x1={padL}
                    y1={y}
                    x2={chartW - padR}
                    y2={y}
                    stroke="#e8ece9"
                    strokeWidth={SVG_SCALE}
                  />
                  <text
                    x={padL - 8 * SVG_SCALE}
                    y={y + 5 * SVG_SCALE}
                    textAnchor="end"
                    fill="#475d51"
                    fontSize={axisFont}
                    fontFamily="var(--font-geist-sans), system-ui, sans-serif"
                  >
                    {formatKrKort(val)}
                  </text>
                </g>
              );
            })}

            {diagramRader.map((rad, i) => {
              const x = padL + i * barGap + (barGap - barW) / 2;
              const segments = [
                { key: "avsattning", val: rad.avsattning, color: FARG.avsattning },
                {
                  key: "besiktning",
                  val: rad.besiktningar,
                  color: FARG.besiktning,
                },
                {
                  key: "direktkostnad",
                  val: rad.direktkostnader,
                  color: FARG.direktkostnad,
                },
                {
                  key: "investering",
                  val: rad.investeringPlan,
                  color: FARG.investering,
                },
              ];
              let yBottom = padT + plotH;
              return (
                <g key={rad.ar}>
                  {segments.map((seg) => {
                    if (seg.val <= 0) return null;
                    const h = (seg.val / skalaMax) * plotH;
                    yBottom -= h;
                    return (
                      <rect
                        key={seg.key}
                        x={x}
                        y={yBottom}
                        width={barW}
                        height={h}
                        fill={seg.color}
                        rx={SVG_SCALE}
                      >
                        <title>
                          {rad.ar}: {seg.key} {formatKr(seg.val)}
                        </title>
                      </rect>
                    );
                  })}
                  <text
                    x={x + barW / 2}
                    y={chartH - 10 * SVG_SCALE}
                    textAnchor="middle"
                    fill="#102017"
                    fontSize={arFont}
                    fontFamily="var(--font-geist-sans), system-ui, sans-serif"
                  >
                    {String(rad.ar).slice(-2)}
                  </text>
                </g>
              );
            })}
          </SkarpDiagramSvg>
          <p className="mt-2 text-center text-xs text-muted">
            Årtal (sista två siffror)
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-foreground">Tidsaxel</h3>
        <p className="mt-1 text-sm text-muted">
          Planperiod {planStartAr}–{planSlutAr}. Markörer visar år med störst
          sammanlagt kassaflöde (budgetunderlag + planerat underhåll det året).
        </p>

        <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-white p-4">
          <SkarpDiagramSvg
            viewWidth={timelineW}
            viewHeight={timelineH}
            displayWidth={TIMELINE_DISPLAY_W}
            displayHeight={TIMELINE_DISPLAY_H}
            ariaLabel={`Tidsaxel för planperiod ${planStartAr} till ${planSlutAr}`}
          >
            <line
              x1={tlPadL}
              y1={tlAxisY}
              x2={timelineW - tlPadR}
              y2={tlAxisY}
              stroke="#abcbb6"
              strokeWidth={3 * SVG_SCALE}
              strokeLinecap="round"
            />
            <text
              x={tlPadL}
              y={tlEndpointYearY}
              fill="#244f35"
              fontSize={tlYearFont}
              fontWeight={600}
              fontFamily="var(--font-geist-sans), system-ui, sans-serif"
            >
              {planStartAr}
            </text>
            <text
              x={timelineW - tlPadR}
              y={tlEndpointYearY}
              textAnchor="end"
              fill="#244f35"
              fontSize={tlYearFont}
              fontWeight={600}
              fontFamily="var(--font-geist-sans), system-ui, sans-serif"
            >
              {planSlutAr}
            </text>

            {tidsaxelMarkorer.map(({ rad, xProcent, ovanAxel }) => {
              const x = tlPadL + (xProcent / 100) * tlPlotW;
              const circleY = ovanAxel
                ? tlAxisY - tlMarkOffset
                : tlAxisY + tlMarkOffset;
              const budgetText = `Årsbudget ${formatKrKort(rad.utgifterArsbudget)}`;
              const planText =
                rad.investeringPlan > 0
                  ? `Plan ${formatKrKort(rad.investeringPlan)}`
                  : null;
              const labelRad = planText ? 2 : 1;
              const labelBlockH =
                tlLabelFont + (labelRad - 1) * tlLabelLineH;
              const maxLabelBaseline = tlAxisY - tlGapTillAxel - labelBlockH;
              let labelY = circleY + tlMarkRad + 16 * SVG_SCALE;
              if (ovanAxel) {
                const underCircleY = circleY + tlMarkRad + 10 * SVG_SCALE;
                const overCircleY =
                  circleY - tlMarkRad - 10 * SVG_SCALE - labelBlockH;
                labelY =
                  underCircleY + labelBlockH <= tlAxisY - tlGapTillAxel
                    ? underCircleY
                    : overCircleY;
                if (labelY + labelBlockH > tlAxisY - tlGapTillAxel) {
                  labelY = maxLabelBaseline;
                }
              }

              return (
                <g key={rad.ar}>
                  <line
                    x1={x}
                    y1={tlAxisY}
                    x2={x}
                    y2={
                      circleY +
                      (ovanAxel ? 1 : -1) * (tlMarkRad + 4 * SVG_SCALE)
                    }
                    stroke="#2f6845"
                    strokeWidth={SVG_SCALE}
                    strokeOpacity={0.35}
                  />
                  <circle
                    cx={x}
                    cy={circleY}
                    r={tlMarkRad}
                    fill="#e2f0e6"
                    stroke="#2f6845"
                    strokeWidth={2.5 * SVG_SCALE}
                  />
                  <text
                    x={x}
                    y={circleY}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#244f35"
                    fontSize={tlMarkFont}
                    fontWeight={700}
                    fontFamily="var(--font-geist-sans), system-ui, sans-serif"
                    stroke="#e2f0e6"
                    strokeWidth={4 * SVG_SCALE}
                    paintOrder="stroke fill"
                  >
                    {String(rad.ar).slice(-2)}
                  </text>
                  <text
                    x={x}
                    y={labelY}
                    textAnchor="middle"
                    fill="#475d51"
                    fontSize={tlLabelFont}
                    fontFamily="var(--font-geist-sans), system-ui, sans-serif"
                  >
                    <tspan x={x} dy={0}>
                      {budgetText}
                    </tspan>
                    {planText && (
                      <tspan x={x} dy={tlLabelLineH}>
                        {planText}
                      </tspan>
                    )}
                  </text>
                </g>
              );
            })}
          </SkarpDiagramSvg>

          <ul className="mt-4 space-y-2 border-t border-border pt-4">
            {toppAr.map((rad) => (
              <li
                key={rad.ar}
                className="flex flex-wrap items-center justify-between gap-2 text-sm"
              >
                <span className="font-semibold text-foreground">{rad.ar}</span>
                <span className="text-muted">
                  {PLAN_BEGREPP.utgifterArsbudget}: {formatKr(rad.utgifterArsbudget)}
                  {rad.direktkostnader > 0 &&
                    ` · ${PLAN_BEGREPP.direktkostnader}: ${formatKr(rad.direktkostnader)}`}
                  {rad.investeringPlan > 0 &&
                    ` · ${PLAN_BEGREPP.investeringarPlan}: ${formatKr(rad.investeringPlan)}`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
