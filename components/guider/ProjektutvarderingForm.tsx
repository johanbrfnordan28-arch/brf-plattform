"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { OppnaStangKnapp } from "@/components/OppnaStangKnapp";
import { guideTips } from "@/components/guider/guider";
import {
  beraknaProjektutvardering,
  formatAr,
  formatKr,
  lasProjektutvardering,
  sparaProjektutvardering,
  tomProjektutvardering,
  type ProjektutvarderingEkonomi,
  type ProjektutvarderingState,
} from "@/components/guider/projektutvardering-lager";

const checklistaTips = guideTips.find((t) => t.id === "projektutvardering");

type SektionId =
  | "grund"
  | "fore"
  | "projekt"
  | "efter"
  | "sakerhet"
  | "checklista"
  | "sammanfattning";

function TalFalt({
  label,
  value,
  onChange,
  enhet = "kr/år",
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  enhet?: string;
  hint?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-foreground">{label}</span>
      {hint && <span className="mt-0.5 block text-xs text-muted">{hint}</span>}
      <div className="mt-1 flex items-center gap-2">
        <input
          type="number"
          min={0}
          step={1000}
          value={value || ""}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
        />
        <span className="shrink-0 text-xs text-muted">{enhet}</span>
      </div>
    </label>
  );
}

function EkonomiFalt({
  titel,
  data,
  onChange,
}: {
  titel: string;
  data: ProjektutvarderingEkonomi;
  onChange: (next: ProjektutvarderingEkonomi) => void;
}) {
  function uppdatera<K extends keyof ProjektutvarderingEkonomi>(
    key: K,
    value: number,
  ) {
    onChange({ ...data, [key]: value });
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">
        {titel}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <TalFalt
          label="Vatten"
          value={data.vattenKrPerAr}
          onChange={(v) => uppdatera("vattenKrPerAr", v)}
        />
        <TalFalt
          label="El"
          value={data.elKrPerAr}
          onChange={(v) => uppdatera("elKrPerAr", v)}
        />
        <TalFalt
          label="Värme"
          value={data.varmeKrPerAr}
          onChange={(v) => uppdatera("varmeKrPerAr", v)}
        />
        <TalFalt
          label="Försäkringspremie"
          value={data.forsakringPremieKrPerAr}
          onChange={(v) => uppdatera("forsakringPremieKrPerAr", v)}
        />
        <TalFalt
          label="Försäkringsskador (snitt/år)"
          value={data.forsakringsskadorKrPerAr}
          onChange={(v) => uppdatera("forsakringsskadorKrPerAr", v)}
          hint="Totalt skadebelopp minus ersättning, fördelat på baslinjeåren."
        />
        <TalFalt
          label="Drift och underhåll"
          value={data.underhallDriftKrPerAr}
          onChange={(v) => uppdatera("underhallDriftKrPerAr", v)}
        />
      </div>
    </div>
  );
}

function Sektion({
  id,
  titel,
  sammanfattning,
  oppen,
  onVaxla,
  children,
}: {
  id: SektionId;
  titel: string;
  sammanfattning?: string;
  oppen: boolean;
  onVaxla: (id: SektionId) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-white">
      <div className="flex flex-wrap items-center gap-2 px-4 py-3">
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold text-foreground">{titel}</h4>
          {sammanfattning && (
            <p className="mt-0.5 text-xs text-muted">{sammanfattning}</p>
          )}
        </div>
        <OppnaStangKnapp
          oppen={oppen}
          onClick={() => onVaxla(id)}
          storlek="sm"
          ariaLabel={oppen ? `Stäng ${titel}` : `Öppna ${titel}`}
        />
      </div>
      {oppen && (
        <div className="space-y-4 border-t border-border px-4 pb-4 pt-3">
          {children}
        </div>
      )}
    </div>
  );
}

export function ProjektutvarderingForm() {
  const [state, setState] = useState<ProjektutvarderingState>(tomProjektutvardering);
  const [hydrated, setHydrated] = useState(false);
  const skipFirstSave = useRef(true);
  const [oppnaSektioner, setOppnaSektioner] = useState<Record<SektionId, boolean>>({
    grund: true,
    fore: true,
    projekt: false,
    efter: false,
    sakerhet: false,
    checklista: false,
    sammanfattning: true,
  });

  useEffect(() => {
    setState(lasProjektutvardering());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (skipFirstSave.current) {
      skipFirstSave.current = false;
      return;
    }
    sparaProjektutvardering(state);
  }, [state, hydrated]);

  const resultat = useMemo(() => beraknaProjektutvardering(state), [state]);

  function uppdatera(partial: Partial<ProjektutvarderingState>) {
    setState((prev) => ({ ...prev, ...partial }));
  }

  function vaxlaSektion(id: SektionId) {
    setOppnaSektioner((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function toggleChecklista(index: number) {
    const key = String(index);
    setState((prev) => ({
      ...prev,
      checklista: {
        ...prev.checklista,
        [key]: !prev.checklista[key],
      },
    }));
  }

  const checklistaKlara = checklistaTips
    ? checklistaTips.punkter.filter((_, i) => state.checklista[String(i)]).length
    : 0;
  const checklistaTotalt = checklistaTips?.punkter.length ?? 0;

  const finansieringsVarning =
    !state.likvidaMedelFinns && state.avsattningArFore < 2;

  if (!hydrated) {
    return (
      <p className="text-sm text-muted">Laddar projektutvärdering…</p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-primary/25 bg-[#fafcfa] p-4 sm:p-5">
        <h3 className="text-lg font-semibold text-foreground">
          Projektutvärdering — formulär
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Fyll i siffror för vatten, el, värme, försäkring och drift. Formuläret
          räknar payback time, kassa-plus efter avskrivning och påminner om
          säkerhet och försäkringsrisker. Uppföljning bör sträcka sig 2–5 år före
          och genom entreprenörens ansvarstid (10 år efter godkänd slutbesiktning).
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-white p-4 lg:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Snabbresultat
          </p>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-2">
              <dt className="text-muted">Före (totalt/år)</dt>
              <dd className="font-medium">{formatKr(resultat.foreTotaltKr)}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted">Efter (totalt/år)</dt>
              <dd className="font-medium">{formatKr(resultat.efterTotaltKr)}</dd>
            </div>
            <div className="flex justify-between gap-2 border-t border-border pt-2">
              <dt className="text-muted">Besparing/år</dt>
              <dd
                className={`font-semibold ${
                  resultat.arligBesparingKr >= 0
                    ? "text-primary-dark"
                    : "text-red-800"
                }`}
              >
                {formatKr(resultat.arligBesparingKr)}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted">Payback time</dt>
              <dd className="font-semibold text-foreground">
                {resultat.paybackAr !== null
                  ? `${formatAr(resultat.paybackAr)} år`
                  : "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted">Kassa-plus ({state.avskrivningAr} år)</dt>
              <dd className="font-semibold text-primary-dark">
                {resultat.kassaPlusKr > 0
                  ? formatKr(resultat.kassaPlusKr)
                  : "—"}
              </dd>
            </div>
          </dl>
          {resultat.paybackAr !== null &&
            resultat.kassaPlusAr > 0 &&
            resultat.arligBesparingKr > 0 && (
              <p className="mt-3 text-xs leading-relaxed text-muted">
                Projektet betalar sig på ca {formatAr(resultat.paybackAr)} år.
                Under resterande {formatAr(resultat.kassaPlusAr, 0)} år av
                avskrivningen blir det ett plus på ca{" "}
                {formatKr(resultat.arligBesparingKr)}/år — totalt{" "}
                {formatKr(resultat.kassaPlusKr)} som kan finansiera nästa åtgärd.
              </p>
            )}
        </div>

        <div className="space-y-3 lg:col-span-2">
          <Sektion
            id="grund"
            titel="Projekt och tidsplan"
            sammanfattning={
              state.projektNamn.trim()
                ? state.projektNamn
                : "Namn, slutbesiktning och baslinjeår"
            }
            oppen={oppnaSektioner.grund}
            onVaxla={vaxlaSektion}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm sm:col-span-2">
                <span className="font-medium text-foreground">Projektnamn</span>
                <input
                  value={state.projektNamn}
                  onChange={(e) => uppdatera({ projektNamn: e.target.value })}
                  placeholder="T.ex. Stambyte etapp 2"
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-foreground">
                  Godkänd slutbesiktning
                </span>
                <input
                  type="date"
                  value={state.slutbesiktningDatum}
                  onChange={(e) =>
                    uppdatera({ slutbesiktningDatum: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-foreground">
                  Baslinje före (år)
                </span>
                <select
                  value={state.baslinjeAr}
                  onChange={(e) =>
                    uppdatera({ baslinjeAr: Number(e.target.value) })
                  }
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                >
                  {[2, 3, 4, 5].map((ar) => (
                    <option key={ar} value={ar}>
                      {ar} år före projekt
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {resultat.ansvarstidSlutAr && (
              <p className="text-xs text-primary-dark">
                Entreprenörens ansvarstid löper till cirka{" "}
                {resultat.ansvarstidSlutAr} — följ upp samma nyckeltal under
                denna period.
              </p>
            )}
          </Sektion>

          <Sektion
            id="fore"
            titel={`Ekonomi före — snitt per år (${state.baslinjeAr} år)`}
            sammanfattning={formatKr(resultat.foreTotaltKr) + " totalt"}
            oppen={oppnaSektioner.fore}
            onVaxla={vaxlaSektion}
          >
            <EkonomiFalt
              titel="Baslinje före projekt"
              data={state.fore}
              onChange={(fore) => uppdatera({ fore })}
            />
          </Sektion>

          <Sektion
            id="projekt"
            titel="Investering och finansiering"
            sammanfattning={formatKr(resultat.nettoInvesteringKr)}
            oppen={oppnaSektioner.projekt}
            onVaxla={vaxlaSektion}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <TalFalt
                label="Investeringskostnad"
                value={state.investeringskostnadKr}
                onChange={(v) => uppdatera({ investeringskostnadKr: v })}
                enhet="kr"
              />
              <TalFalt
                label="Tilläggsarbeten (uppskattat)"
                value={state.tillaggsarbetenKr}
                onChange={(v) => uppdatera({ tillaggsarbetenKr: v })}
                enhet="kr"
              />
              <TalFalt
                label="Teknisk avskrivning"
                value={state.avskrivningAr}
                onChange={(v) => uppdatera({ avskrivningAr: v })}
                enhet="år"
              />
              <TalFalt
                label="Avsättning planerad (år före start)"
                value={state.avsattningArFore}
                onChange={(v) => uppdatera({ avsattningArFore: v })}
                enhet="år"
              />
              <TalFalt
                label="Uppskattad merkostnad vid fördröjning"
                value={state.uppskattadForseningskostnadKr}
                onChange={(v) => uppdatera({ uppskattadForseningskostnadKr: v })}
                enhet="kr"
                hint="Skillnad mellan att göra nu och vänta — skador, inflation, dyrare åtgärd."
              />
              <TalFalt
                label="Fördröjning (år)"
                value={state.uppskattadForseningAr}
                onChange={(v) => uppdatera({ uppskattadForseningAr: v })}
                enhet="år"
              />
            </div>
            <fieldset className="rounded-lg border border-border px-3 py-3">
              <legend className="px-1 text-sm font-medium text-foreground">
                Likvida medel i kassan?
              </legend>
              <div className="mt-2 flex flex-wrap gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={state.likvidaMedelFinns}
                    onChange={() => uppdatera({ likvidaMedelFinns: true })}
                  />
                  Ja
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={!state.likvidaMedelFinns}
                    onChange={() => uppdatera({ likvidaMedelFinns: false })}
                  />
                  Nej — planera högre avsättning
                </label>
              </div>
            </fieldset>
            {finansieringsVarning && (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
                Saknas likvida medel bör högre avsättning planeras minst två år
                före projektstart — justera avsättningstiden ovan.
              </p>
            )}
            {state.uppskattadForseningskostnadKr > 0 && (
              <p className="text-xs text-muted">
                Att skjuta på renovering {state.uppskattadForseningAr} år kan
                kosta cirka {formatKr(state.uppskattadForseningskostnadKr)} mer
                än att genomföra nu.
              </p>
            )}
          </Sektion>

          <Sektion
            id="efter"
            titel="Ekonomi efter — uppföljning per år"
            sammanfattning={formatKr(resultat.efterTotaltKr) + " totalt"}
            oppen={oppnaSektioner.efter}
            onVaxla={vaxlaSektion}
          >
            <EkonomiFalt
              titel="Efter godkänd slutbesiktning"
              data={state.efter}
              onChange={(efter) => uppdatera({ efter })}
            />
            <TalFalt
              label="Egen risk och försäkringsluckor (budget/år)"
              value={state.egenRiskOchLuckorKr}
              onChange={(v) => uppdatera({ egenRiskOchLuckorKr: v })}
              hint="Skador som inte ersätts fullt ut — flera skadeärenden eller begränsat skydd."
            />
          </Sektion>

          <Sektion
            id="sakerhet"
            titel="Säkerhet och försäkringsrisker"
            sammanfattning="Kan inte värderas i kronor"
            oppen={oppnaSektioner.sakerhet}
            onVaxla={vaxlaSektion}
          >
            <label className="block text-sm">
              <span className="font-medium text-foreground">
                Säkerhetsbedömning
              </span>
              <span className="mt-0.5 block text-xs text-muted">
                Brand, utrymning, fall, fukt och personsäkerhet — bedöms
                separat från payback-kalkylen.
              </span>
              <textarea
                value={state.sakerhetsanteckningar}
                onChange={(e) =>
                  uppdatera({ sakerhetsanteckningar: e.target.value })
                }
                rows={4}
                className="mt-1.5 w-full rounded-lg border border-border px-3 py-2 text-sm"
                placeholder="T.ex. förbättrad utrymning, brandcellsgränser, fukt efter stambyte…"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-foreground">
                Försäkringsrisker och kommande begränsningar
              </span>
              <textarea
                value={state.forsakringsrisker}
                onChange={(e) =>
                  uppdatera({ forsakringsrisker: e.target.value })
                }
                rows={3}
                className="mt-1.5 w-full rounded-lg border border-border px-3 py-2 text-sm"
                placeholder="T.ex. höjd premie efter vattenskada, begränsad ersättning vid upprepade skador…"
              />
            </label>
          </Sektion>

          {checklistaTips && (
            <Sektion
              id="checklista"
              titel="Checklista"
              sammanfattning={`${checklistaKlara} av ${checklistaTotalt} klara`}
              oppen={oppnaSektioner.checklista}
              onVaxla={vaxlaSektion}
            >
              <ul className="space-y-2">
                {checklistaTips.punkter.map((punkt, index) => {
                  const klar = Boolean(state.checklista[String(index)]);
                  return (
                    <li key={index}>
                      <label
                        className={`flex cursor-pointer gap-2 rounded-lg border px-3 py-2.5 text-sm leading-relaxed ${
                          klar
                            ? "border-primary/30 bg-[#fafcfa]"
                            : "border-border"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={klar}
                          onChange={() => toggleChecklista(index)}
                          className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-primary"
                        />
                        <span>{punkt}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </Sektion>
          )}

          <Sektion
            id="sammanfattning"
            titel="Sammanställning till styrelsen"
            oppen={oppnaSektioner.sammanfattning}
            onVaxla={vaxlaSektion}
          >
            <div className="rounded-lg border border-border bg-[#fafcfa] p-4 text-sm leading-relaxed text-foreground">
              <p>
                <strong>{state.projektNamn || "Projekt"}</strong>
                {state.slutbesiktningDatum &&
                  ` · slutbesiktning ${state.slutbesiktningDatum}`}
              </p>
              <ul className="mt-3 list-disc space-y-1 pl-5">
                <li>
                  Drift före: {formatKr(resultat.foreTotaltKr)}/år (baslinje{" "}
                  {state.baslinjeAr} år)
                </li>
                <li>Drift efter: {formatKr(resultat.efterTotaltKr)}/år</li>
                <li>
                  Nettoinvestering: {formatKr(resultat.nettoInvesteringKr)}
                </li>
                <li>
                  Payback time:{" "}
                  {resultat.paybackAr !== null
                    ? `${formatAr(resultat.paybackAr)} år`
                    : "ej beräknad (saknar besparing eller kostnad)"}
                </li>
                {resultat.kassaPlusKr > 0 && (
                  <li>
                    Kassa-plus under avskrivning ({state.avskrivningAr} år):{" "}
                    {formatKr(resultat.kassaPlusKr)}
                  </li>
                )}
                {state.egenRiskOchLuckorKr > 0 && (
                  <li>
                    Budgeterad egen risk/luckor:{" "}
                    {formatKr(state.egenRiskOchLuckorKr)}/år
                  </li>
                )}
                {state.sakerhetsanteckningar.trim() && (
                  <li>
                    Säkerhet: {state.sakerhetsanteckningar.trim()}
                  </li>
                )}
                {state.forsakringsrisker.trim() && (
                  <li>Försäkringsrisker: {state.forsakringsrisker.trim()}</li>
                )}
              </ul>
              <button
                type="button"
                onClick={() => {
                  const text = [
                    `Projektutvärdering: ${state.projektNamn || "Projekt"}`,
                    `Drift före: ${formatKr(resultat.foreTotaltKr)}/år`,
                    `Drift efter: ${formatKr(resultat.efterTotaltKr)}/år`,
                    `Payback: ${
                      resultat.paybackAr !== null
                        ? `${formatAr(resultat.paybackAr)} år`
                        : "—"
                    }`,
                    `Kassa-plus: ${
                      resultat.kassaPlusKr > 0
                        ? formatKr(resultat.kassaPlusKr)
                        : "—"
                    }`,
                  ].join("\n");
                  void navigator.clipboard.writeText(text);
                }}
                className="mt-4 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium hover:bg-muted/5"
              >
                Kopiera sammanfattning
              </button>
            </div>
          </Sektion>
        </div>
      </div>

      <p className="text-xs text-muted">
        Uppgifterna sparas automatiskt i webbläsaren för er förening. Säkerhet
        och personsäkerhet kan inte ersättas av en ekonomisk kalkyl — dokumentera
        alltid båda delarna.
      </p>
    </div>
  );
}
