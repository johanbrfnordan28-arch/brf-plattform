"use client";

import { UnderhallAtgardPrisPanel } from "@/components/underhallsplan/UnderhallAtgardPrisPanel";
import {
  hamtaUnderhallAtgardKatalog,
  hamtaVanligaInkluderadeUnderkomponenter,
  type UnderhallTillfallenPlanNyckel,
} from "@/components/underhallsplan/underhall-atgard-katalog";
import {
  skapaTomUnderhallTillfalle,
  type UnderhallTillfallenData,
  type UnderhallTillfalle,
} from "@/components/underhallsplan/underhall-tillfallen";
import { beraknaUnderhallTillfallenKostnadPerAr } from "@/components/underhallsplan/underhall-tillfallen-plan";
import type { FasadAtgardPrisRegister } from "@/components/underhallsplan/fasad-atgard-pris";
import type { KomponentMall } from "@/components/underhallsplan/komponentregister";
import { hamtaPlanSlutAr } from "@/components/underhallsplan/planinstallningar";
import { standardUnderhallIntervallAr } from "@/components/underhallsplan/underhall-intervall";
import { UnderhallKostnadPerArTabell } from "@/components/underhallsplan/UnderhallKostnadPerArTabell";
import { LivslangdForklaringPanel } from "@/components/underhallsplan/LivslangdForklaringPanel";

type UnderhallTillfallenPanelProps = {
  komponentNamn: string;
  underkomponentId: string;
  planNyckel: UnderhallTillfallenPlanNyckel;
  mall: KomponentMall;
  tillfallenData: UnderhallTillfallenData;
  priser: FasadAtgardPrisRegister;
  defaultKvm?: string;
  planStartAr: number;
  planLangdAr: number;
  underhallHistorikAr?: string;
  onTillfallenChange: (data: UnderhallTillfallenData) => void;
  onPriserChange: (priser: FasadAtgardPrisRegister) => void;
  onForslagStandard?: () => void;
  forslagEtikett?: string;
};

export function UnderhallTillfallenPanel({
  komponentNamn,
  underkomponentId,
  planNyckel,
  mall,
  tillfallenData,
  priser,
  defaultKvm,
  planStartAr,
  planLangdAr,
  underhallHistorikAr,
  onTillfallenChange,
  onPriserChange,
  onForslagStandard,
  forslagEtikett,
}: UnderhallTillfallenPanelProps) {
  const katalog = hamtaUnderhallAtgardKatalog(planNyckel);
  const planSlutAr = hamtaPlanSlutAr(planStartAr, planLangdAr);
  const standardIntervall =
    standardUnderhallIntervallAr(komponentNamn, underkomponentId) || "25";
  const tillfallen = tillfallenData.tillfallen;
  const kostnadPerAr = beraknaUnderhallTillfallenKostnadPerAr(
    planNyckel,
    tillfallenData,
    priser,
    planStartAr,
    planLangdAr,
  );

  const inkuderbara = mall.underkomponenter.filter(
    (d) =>
      d.id !== underkomponentId &&
      hamtaVanligaInkluderadeUnderkomponenter(komponentNamn, underkomponentId).includes(
        d.id,
      ),
  );

  function uppdateraTillfallen(ny: UnderhallTillfalle[]) {
    onTillfallenChange({ tillfallen: ny });
  }

  function uppdateraTillfalle(id: string, patch: Partial<UnderhallTillfalle>) {
    uppdateraTillfallen(
      tillfallen.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    );
  }

  function toggleAtgard(tillfalleId: string, atgardId: string) {
    const t = tillfallen.find((x) => x.id === tillfalleId);
    if (!t) return;
    const atgarder = t.atgarder.includes(atgardId)
      ? t.atgarder.filter((a) => a !== atgardId)
      : [...t.atgarder, atgardId];
    uppdateraTillfalle(tillfalleId, { atgarder });
  }

  function toggleInkluderad(tillfalleId: string, ukId: string) {
    const t = tillfallen.find((x) => x.id === tillfalleId);
    if (!t) return;
    const nu = t.inkluderadeUnderkomponenter ?? [];
    const inkluderadeUnderkomponenter = nu.includes(ukId)
      ? nu.filter((id) => id !== ukId)
      : [...nu, ukId];
    uppdateraTillfalle(tillfalleId, { inkluderadeUnderkomponenter });
  }

  function laggTillTillfalle() {
    uppdateraTillfallen([
      ...tillfallen,
      skapaTomUnderhallTillfalle(planStartAr, standardIntervall),
    ]);
  }

  function taBortTillfalle(id: string) {
    uppdateraTillfallen(tillfallen.filter((t) => t.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-[#e2f0e6] bg-[#eef6f0]/40 p-3">
        <p className="text-xs font-semibold text-primary-dark">
          Underhållstillfällen — flera åtgärdstyper
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          Lägg till ett tillfälle per typ av insats. T.ex. takmålning vart 10:e år
          och takomläggning vart 25:e år — med olika kostnad och startår. Markera
          underkomponenter (t.ex. skorsten) som ingår i samma projekt.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={laggTillTillfalle}
            className="rounded-lg border border-primary bg-white px-3 py-1.5 text-xs font-medium text-primary-dark hover:bg-[#e2f0e6]"
          >
            + Lägg till tillfälle
          </button>
          {onForslagStandard && (
            <button
              type="button"
              onClick={onForslagStandard}
              className="rounded-lg border border-[#b8d4c4] bg-white px-3 py-1.5 text-xs font-medium text-primary-dark hover:bg-[#f7fbf8]"
            >
              {forslagEtikett ?? "Föreslå standard-tillfällen"}
            </button>
          )}
        </div>
        {underhallHistorikAr && (
          <p className="mt-2 text-[10px] text-muted">
            Senaste utfört arbete enligt register: {underhallHistorikAr}. Justera
            år och intervall efter faktisk livslängd.
          </p>
        )}
      </div>

      <LivslangdForklaringPanel kompakt />

      {tillfallen.length === 0 && (
        <p className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-xs text-muted">
          Inga tillfällen ännu — lägg till t.ex. målning och större åtgärd med
          olika intervall.
        </p>
      )}

      {tillfallen.map((tillfalle, index) => (
        <article
          key={tillfalle.id}
          className="rounded-xl border border-primary/30 bg-white p-3 sm:p-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className="text-sm font-semibold text-primary-dark">
              Tillfälle {index + 1}
            </p>
            <button
              type="button"
              onClick={() => taBortTillfalle(tillfalle.id)}
              className="text-xs text-muted hover:text-red-700"
            >
              Ta bort
            </button>
          </div>

          <label className="mt-3 block text-sm">
            <span className="text-xs font-medium text-muted">
              Benämning (valfritt)
            </span>
            <input
              type="text"
              value={tillfalle.titel}
              onChange={(e) =>
                uppdateraTillfalle(tillfalle.id, { titel: e.target.value })
              }
              placeholder={
                planNyckel === "tak-takyta"
                  ? "t.ex. Takmålning eller Takomläggning"
                  : "t.ex. Målning eller Fönsterbyte"
              }
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </label>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="text-xs font-medium text-muted">Första år</span>
              <input
                type="number"
                min={planStartAr}
                max={planSlutAr}
                value={tillfalle.nastaAr}
                onChange={(e) =>
                  uppdateraTillfalle(tillfalle.id, { nastaAr: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="text-xs font-medium text-muted">
                Upprepas vart (år)
              </span>
              <select
                value={tillfalle.intervallAr || ""}
                onChange={(e) =>
                  uppdateraTillfalle(tillfalle.id, {
                    intervallAr: e.target.value,
                  })
                }
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
              >
                <option value="">— välj —</option>
                {Array.from({ length: Math.min(planLangdAr, 50) }, (_, i) => i + 1).map(
                  (ar) => (
                    <option key={ar} value={ar}>
                      Vart {ar}:e år
                      {standardIntervall === String(ar) ? " (rekomm.)" : ""}
                    </option>
                  ),
                )}
              </select>
            </label>
          </div>

          <fieldset className="mt-4">
            <legend className="text-xs font-medium text-muted">
              Åtgärder detta tillfälle
            </legend>
            <div className="mt-2 space-y-2">
              {katalog.map((atgard) => {
                const vald = tillfalle.atgarder.includes(atgard.id);
                return (
                  <label
                    key={atgard.id}
                    className={`flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2 text-sm ${
                      vald
                        ? "border-primary bg-[#eef6f0]/50"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={vald}
                      onChange={() => toggleAtgard(tillfalle.id, atgard.id)}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-primary"
                    />
                    <span>
                      <span className="font-medium">{atgard.etikett}</span>
                      <span className="mt-0.5 block text-xs text-muted">
                        {atgard.beskrivning}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {inkuderbara.length > 0 && (
            <fieldset className="mt-4">
              <legend className="text-xs font-medium text-muted">
                Ingår i samma projekt (valfritt)
              </legend>
              <p className="mt-0.5 text-[10px] text-muted">
                T.ex. skorstenar vid takomläggning — syns tydligt på den
                underkomponenten i registret.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {inkuderbara.map((uk) => {
                  const vald = (tillfalle.inkluderadeUnderkomponenter ?? []).includes(
                    uk.id,
                  );
                  return (
                    <button
                      key={uk.id}
                      type="button"
                      onClick={() => toggleInkluderad(tillfalle.id, uk.id)}
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                        vald
                          ? "border-primary bg-[#e2f0e6] text-primary-dark"
                          : "border-border text-muted hover:border-primary/40"
                      }`}
                    >
                      {uk.etikett}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}

          {tillfalle.atgarder.length > 0 && (
            <div className="mt-4">
              <UnderhallAtgardPrisPanel
                planNyckel={planNyckel}
                valdaAtgarder={tillfalle.atgarder}
                priser={priser}
                defaultKvm={defaultKvm}
                onChange={onPriserChange}
              />
            </div>
          )}
        </article>
      ))}

      {kostnadPerAr.length > 0 && (
        <UnderhallKostnadPerArTabell
          rader={kostnadPerAr}
          titel={`${komponentNamn} — summerat per år (alla tillfällen)`}
        />
      )}
    </div>
  );
}
