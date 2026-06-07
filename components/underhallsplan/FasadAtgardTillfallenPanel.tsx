"use client";

import { FasadAtgardPrisPanel } from "@/components/underhallsplan/FasadAtgardPrisPanel";
import {
  fasadAtgarder,
  skapaTomFasadAtgardTillfalle,
  type FasadAtgardData,
  type FasadAtgardId,
  type FasadAtgardTillfalle,
} from "@/components/underhallsplan/fasad-atgard";
import { beraknaFasadKostnadPerAr } from "@/components/underhallsplan/fasad-atgard-plan";
import type { FasadAtgardPrisRegister } from "@/components/underhallsplan/fasad-atgard-pris";
import { hamtaPlanSlutAr } from "@/components/underhallsplan/planinstallningar";
import { standardUnderhallIntervallAr } from "@/components/underhallsplan/underhall-intervall";
import { UnderhallKostnadPerArTabell } from "@/components/underhallsplan/UnderhallKostnadPerArTabell";

type FasadAtgardTillfallenPanelProps = {
  fasadAtgard: FasadAtgardData;
  priser: FasadAtgardPrisRegister;
  defaultKvm?: string;
  planStartAr: number;
  planLangdAr: number;
  onFasadAtgardChange: (data: FasadAtgardData) => void;
  onPriserChange: (priser: FasadAtgardPrisRegister) => void;
};

export function FasadAtgardTillfallenPanel({
  fasadAtgard,
  priser,
  defaultKvm,
  planStartAr,
  planLangdAr,
  onFasadAtgardChange,
  onPriserChange,
}: FasadAtgardTillfallenPanelProps) {
  const planSlutAr = hamtaPlanSlutAr(planStartAr, planLangdAr);
  const standardIntervall =
    standardUnderhallIntervallAr("Fasad", "fasadmaterial") || "30";
  const tillfallen = fasadAtgard.tillfallen;
  const kostnadPerAr = beraknaFasadKostnadPerAr(
    fasadAtgard,
    priser,
    planStartAr,
    planLangdAr,
  );

  function uppdateraTillfallen(ny: FasadAtgardTillfalle[]) {
    onFasadAtgardChange({ tillfallen: ny });
  }

  function uppdateraTillfalle(
    id: string,
    patch: Partial<FasadAtgardTillfalle>,
  ) {
    uppdateraTillfallen(
      tillfallen.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    );
  }

  function toggleAtgard(tillfalleId: string, atgardId: FasadAtgardId) {
    const t = tillfallen.find((x) => x.id === tillfalleId);
    if (!t) return;
    const atgarder = t.atgarder.includes(atgardId)
      ? t.atgarder.filter((a) => a !== atgardId)
      : [...t.atgarder, atgardId];
    uppdateraTillfalle(tillfalleId, { atgarder });
  }

  function laggTillTillfalle() {
    uppdateraTillfallen([
      ...tillfallen,
      skapaTomFasadAtgardTillfalle(planStartAr, standardIntervall),
    ]);
  }

  function taBortTillfalle(id: string) {
    uppdateraTillfallen(tillfallen.filter((t) => t.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-[#e2f0e6] bg-[#eef6f0]/40 p-3">
        <p className="text-xs font-semibold text-primary-dark">
          Underhållstillfällen
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          Lägg till ett tillfälle per typ av underhållsinsats. Tillfälle 1 kan
          t.ex. omfatta ommålning, putsreparation och lagning — nästa tillfälle
          kanske bara ommålning, med annat startår eller intervall.
        </p>
        <button
          type="button"
          onClick={laggTillTillfalle}
          className="mt-3 rounded-lg border border-primary bg-white px-3 py-1.5 text-xs font-medium text-primary-dark hover:bg-[#e2f0e6]"
        >
          + Lägg till tillfälle
        </button>
      </div>

      {tillfallen.length === 0 && (
        <p className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-xs text-muted">
          Inga tillfällen ännu — lägg till minst ett för att planera åtgärder och
          år.
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
              placeholder="t.ex. Större fasadunderhåll eller Ommålning"
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
                placeholder={String(planStartAr)}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="text-xs font-medium text-muted">Upprepas vart (år)</span>
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
              {fasadAtgarder.map((atgard) => {
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

          {tillfalle.atgarder.length > 0 && (
            <div className="mt-4">
              <FasadAtgardPrisPanel
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
          titel="Fasad — summerat per år (alla tillfällen)"
        />
      )}
    </div>
  );
}
