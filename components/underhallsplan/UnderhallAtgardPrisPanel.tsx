"use client";

import { formatKr } from "@/components/underhallsplan/besiktningar";
import { KostnadPrisVarning } from "@/components/underhallsplan/KostnadPrisVarning";
import { fasadAtgardEtikett } from "@/components/underhallsplan/fasad-atgard";
import {
  beraknaFasadAtgardPrisRad,
  skapaTomFasadAtgardPrisRad,
  type FasadAtgardPrisEnhet,
  type FasadAtgardPrisRad,
} from "@/components/underhallsplan/fasad-atgard-pris";
import { BlandadStyckPosterLista } from "@/components/underhallsplan/BlandadStyckPosterLista";
import {
  beraknaImplikeradeEnhetspriser,
  hamtaStyckPosterFranFasadRad,
  parseBlandadFranFasadRad,
  patchFordelaFasadTotalHalvaHalva,
  summeraFasadBlandadPris,
  UNDERHALL_BLANDAD_RESERVATION,
} from "@/components/underhallsplan/underhall-blandad-pris";
import {
  hamtaRiktprisForAtgard,
  normaliseraAtgardPrisRegisterMedRikt,
} from "@/components/underhallsplan/underhall-atgard-riktpris";
import {
  underhallAtgardEtikett,
  type UnderhallTillfallenPlanNyckel,
} from "@/components/underhallsplan/underhall-atgard-katalog";

type UnderhallAtgardPrisPanelProps = {
  planNyckel: UnderhallTillfallenPlanNyckel;
  valdaAtgarder: string[];
  priser: Record<string, FasadAtgardPrisRad>;
  defaultKvm?: string;
  defaultAntal?: string;
  onChange: (priser: Record<string, FasadAtgardPrisRad>) => void;
};

export function UnderhallAtgardPrisPanel({
  planNyckel,
  valdaAtgarder,
  priser,
  defaultKvm,
  defaultAntal,
  onChange,
}: UnderhallAtgardPrisPanelProps) {
  if (valdaAtgarder.length === 0) return null;

  const normaliserade = normaliseraAtgardPrisRegisterMedRikt(
    planNyckel,
    priser,
    valdaAtgarder,
    defaultKvm,
    defaultAntal,
  );

  const totaltKr = valdaAtgarder.reduce((sum, id) => {
    const rad = normaliserade[id];
    if (!rad) return sum;
    return sum + beraknaFasadAtgardPrisRad(rad);
  }, 0);

  function uppdateraRad(id: string, patch: Partial<FasadAtgardPrisRad>) {
    const befintlig =
      normaliserade[id] ??
      normaliseraAtgardPrisRegisterMedRikt(
        planNyckel,
        {},
        [id],
        defaultKvm,
        defaultAntal,
      )[id];
    const next = { ...befintlig, ...patch };
    if (
      (patch.prisEnhet === "kvm" || next.prisEnhet === "kvm") &&
      !next.mangd?.trim() &&
      defaultKvm?.trim()
    ) {
      next.mangd = defaultKvm;
    }
    if (patch.prisEnhet === "blandad" || next.prisEnhet === "blandad") {
      if (!next.mangd?.trim() && defaultKvm?.trim()) {
        next.mangd = defaultKvm;
      }
    }
    onChange({
      ...priser,
      ...normaliserade,
      [id]: next,
    });
  }

  function etikett(id: string): string {
    if (planNyckel === "fonster" || planNyckel.startsWith("typ-")) {
      return underhallAtgardEtikett(planNyckel, id);
    }
    if (planNyckel === "tak-takyta") {
      return underhallAtgardEtikett(planNyckel, id);
    }
    try {
      return fasadAtgardEtikett(id as Parameters<typeof fasadAtgardEtikett>[0]);
    } catch {
      return underhallAtgardEtikett(planNyckel, id);
    }
  }

  return (
    <fieldset className="rounded-lg border border-primary/30 bg-[#eef6f0]/50 p-3 sm:p-4">
      <legend className="px-1 text-xs font-semibold text-primary-dark">
        Prissättning per åtgärd
      </legend>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        Ange yta (m²) eller antal (st) — planen räknar ut summan. Riktvärden
        fylls i som utgångspunkt; justera med offert eller{" "}
        <strong className="font-medium">prislista</strong>.{" "}
        {UNDERHALL_BLANDAD_RESERVATION}
      </p>

      <div className="mt-3 space-y-4">
        {valdaAtgarder.map((id) => {
          const rad =
            normaliserade[id] ??
            normaliseraAtgardPrisRegisterMedRikt(
              planNyckel,
              {},
              [id],
              defaultKvm,
              defaultAntal,
            )[id];
          const rikt = hamtaRiktprisForAtgard(planNyckel, id);
          const summaKr = beraknaFasadAtgardPrisRad(rad);
          return (
            <AtgardPrisKort
              key={id}
              etikett={etikett(id)}
              rad={rad}
              defaultKvm={defaultKvm}
              summaKr={summaKr}
              riktprisHint={
                rikt
                  ? rikt.enhet === "kvm"
                    ? `Riktpris ca ${rikt.prisKr.toLocaleString("sv-SE")} kr/m²`
                    : rikt.enhet === "styck"
                      ? `Riktpris ca ${rikt.prisKr.toLocaleString("sv-SE")} kr/st`
                      : `Riktpris ca ${rikt.prisKr.toLocaleString("sv-SE")} kr totalt`
                  : undefined
              }
              onChange={(patch) => uppdateraRad(id, patch)}
            />
          );
        })}
      </div>

      <p className="mt-4 text-right text-sm font-bold text-primary-dark">
        Summa alla åtgärder: {totaltKr > 0 ? formatKr(totaltKr) : "—"}
      </p>

      <div className="mt-3">
        <KostnadPrisVarning kompakt />
      </div>
    </fieldset>
  );
}

function AtgardPrisKort({
  etikett,
  rad,
  defaultKvm,
  summaKr,
  riktprisHint,
  onChange,
}: {
  etikett: string;
  rad: FasadAtgardPrisRad;
  defaultKvm?: string;
  summaKr: number;
  riktprisHint?: string;
  onChange: (patch: Partial<FasadAtgardPrisRad>) => void;
}) {
  const delar = parseBlandadFranFasadRad(rad);
  const summering = summeraFasadBlandadPris(delar);
  const impl =
    rad.prisEnhet === "blandad" ? beraknaImplikeradeEnhetspriser(delar) : null;

  return (
    <div className="rounded-lg border border-border bg-white p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-foreground">{etikett}</p>
          {riktprisHint && (
            <p className="text-[10px] text-muted">{riktprisHint}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <select
            value={rad.prisEnhet}
            onChange={(e) =>
              onChange({
                prisEnhet: e.target.value as FasadAtgardPrisEnhet,
                mangd:
                  e.target.value === "kvm" || e.target.value === "blandad"
                    ? rad.mangd || defaultKvm || ""
                    : rad.mangd,
              })
            }
            className="rounded-lg border border-border px-2 py-1 text-xs"
          >
            <option value="blandad">Yta + styck + total</option>
            <option value="kvm">m²</option>
            <option value="styck">st</option>
            <option value="total">total</option>
          </select>
          <span className="text-sm font-semibold text-primary-dark">
            {summaKr > 0 ? formatKr(summaKr) : "—"}
          </span>
        </div>
      </div>

      {rad.prisEnhet === "blandad" && (
        <div className="mt-3 space-y-3">
          <div className="grid max-w-md grid-cols-2 gap-2">
            <label className="text-xs">
              <span className="text-muted">m²</span>
              <input
                type="number"
                min={0}
                step={0.1}
                value={rad.mangd}
                onChange={(e) => onChange({ mangd: e.target.value })}
                className="mt-0.5 w-full rounded border border-border px-2 py-1 text-sm"
              />
            </label>
            <label className="text-xs">
              <span className="text-muted">kr/m²</span>
              <input
                type="number"
                min={0}
                value={rad.enhetsprisKr}
                onChange={(e) => onChange({ enhetsprisKr: e.target.value })}
                className="mt-0.5 w-full rounded border border-border px-2 py-1 text-sm"
              />
            </label>
          </div>
          <BlandadStyckPosterLista
            poster={hamtaStyckPosterFranFasadRad(rad)}
            onChange={(styckPoster) => onChange({ styckPoster })}
            kompakt
          />
          <label className="block text-xs">
            <span className="text-muted">Total kostnad (budget)</span>
            <input
              type="number"
              min={0}
              step={1000}
              value={rad.totalKr ?? ""}
              onChange={(e) => onChange({ totalKr: e.target.value })}
              className="mt-0.5 w-full max-w-xs rounded border border-border px-2 py-1 text-sm"
            />
          </label>
          {summering.totalSkiljerSig && (
            <p className="text-xs text-amber-950">
              Total skiljer {formatKr(Math.abs(summering.restKr))} från ytdel +
              styckdel.
            </p>
          )}
          {impl && (
            <div className="text-xs text-muted">
              <p>{impl.forklaring}</p>
              {impl.krPerKvm != null && (
                <p className="mt-0.5">
                  Yta: ca {impl.krPerKvm.toLocaleString("sv-SE")} kr/m²
                </p>
              )}
              <button
                type="button"
                onClick={() => onChange(patchFordelaFasadTotalHalvaHalva(rad))}
                className="mt-1 font-semibold text-primary-dark underline"
              >
                Applicera schablon
              </button>
            </div>
          )}
        </div>
      )}

      {rad.prisEnhet === "kvm" && (
        <div className="mt-2 grid grid-cols-3 gap-2">
          <label className="text-xs">
            m²
            <input
              type="number"
              value={rad.mangd}
              onChange={(e) => onChange({ mangd: e.target.value })}
              className="mt-0.5 w-full rounded border px-2 py-1 text-sm"
            />
          </label>
          <label className="text-xs">
            kr/m²
            <input
              type="number"
              value={rad.enhetsprisKr}
              onChange={(e) => onChange({ enhetsprisKr: e.target.value })}
              placeholder={riktprisHint ? "Riktpris" : undefined}
              className="mt-0.5 w-full rounded border px-2 py-1 text-sm"
            />
          </label>
        </div>
      )}

      {rad.prisEnhet === "styck" && (
        <div className="mt-2">
          <BlandadStyckPosterLista
            poster={hamtaStyckPosterFranFasadRad(rad)}
            onChange={(styckPoster) => onChange({ styckPoster })}
            kompakt
          />
        </div>
      )}

      {rad.prisEnhet === "total" && (
        <label className="mt-2 block text-xs">
          Total kr
          <input
            type="number"
            value={rad.totalKr ?? rad.enhetsprisKr}
            onChange={(e) =>
              onChange({ totalKr: e.target.value, enhetsprisKr: e.target.value })
            }
            className="mt-0.5 w-full max-w-xs rounded border px-2 py-1 text-sm"
          />
        </label>
      )}
    </div>
  );
}

/** Bakåtkompatibilitet — fasad använder samma prisrad-modell. */
export function skapaTomAtgardPrisRad(defaultKvm?: string): FasadAtgardPrisRad {
  return skapaTomFasadAtgardPrisRad(defaultKvm);
}
