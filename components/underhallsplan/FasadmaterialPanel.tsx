"use client";

import { FasadAtgardTillfallenPanel } from "@/components/underhallsplan/FasadAtgardTillfallenPanel";
import { FasadYtaKostnadSammanstallning } from "@/components/underhallsplan/FasadYtaKostnadSammanstallning";
import { YtaOchMaterialAiHjalp } from "@/components/underhallsplan/YtaOchMaterialAiHjalp";
import { fasadMaterialTipsFranByggar } from "@/components/underhallsplan/fasad-byggar-hjalp";
import {
  fasadSidaEtikett,
  föreslaFasadSidorFranGrund,
  normaliseraFasadSidaMaterialPoster,
  skapaTomFasadSidaMaterialPost,
  type FasadSidaMaterialPost,
} from "@/components/underhallsplan/fasad-sidor-material";
import {
  fasadVaderstreckLista,
  hamtaHusFasadRad,
  normaliseraFastighetsYtor,
} from "@/components/underhallsplan/fastighets-ytor";
import type { Grunduppgifter } from "@/components/underhallsplan/types";
import type { FasadAtgardData } from "@/components/underhallsplan/fasad-atgard";
import type { FasadAtgardPrisRegister } from "@/components/underhallsplan/fasad-atgard-pris";
import {
  allaDeltyper,
  deltypEtikett,
  måttenhetEtiketter,
  type DeltypDefinition,
  type KomponentDetaljData,
  type KomponentMall,
  type Måttenhet,
} from "@/components/underhallsplan/komponentregister";

type FasadmaterialPanelProps = {
  mall: KomponentMall;
  data: KomponentDetaljData;
  måttenhet: Måttenhet;
  värde: string;
  fasadAtgard: FasadAtgardData;
  fasadAtgardPriser: FasadAtgardPrisRegister;
  planStartAr: number;
  planLangdAr: number;
  grund: Grunduppgifter;
  onValdaDeltyperChange: (valdaDeltyper: string[]) => void;
  onMåttChange: (patch: { måttenhet?: Måttenhet; värde?: string }) => void;
  onFasadAtgardChange: (atgard: FasadAtgardData) => void;
  onFasadAtgardPriserChange: (priser: FasadAtgardPrisRegister) => void;
  fasadSidor?: FasadSidaMaterialPost[];
  onFasadSidorChange?: (poster: FasadSidaMaterialPost[]) => void;
};

export function FasadmaterialPanel({
  mall,
  data,
  måttenhet,
  värde,
  fasadAtgard,
  fasadAtgardPriser,
  planStartAr,
  planLangdAr,
  grund,
  onValdaDeltyperChange,
  onMåttChange,
  onFasadAtgardChange,
  onFasadAtgardPriserChange,
  fasadSidor = [],
  onFasadSidorChange,
}: FasadmaterialPanelProps) {
  const deltyper = allaDeltyper(data, mall);
  const enhetInfo = måttenhetEtiketter[måttenhet];
  const sidor = normaliseraFasadSidaMaterialPoster(fasadSidor);
  const ytor = normaliseraFastighetsYtor(grund.fastighetsYtor);
  const byggarTips = fasadMaterialTipsFranByggar(grund.byggar);

  function materialEtikett(id: string) {
    return deltypEtikett(id, data, mall);
  }

  function toggleDeltyp(id: string) {
    onValdaDeltyperChange(
      data.valdaDeltyper.includes(id)
        ? data.valdaDeltyper.filter((d) => d !== id)
        : [...data.valdaDeltyper, id],
    );
  }

  return (
    <div className="space-y-4">
      <fieldset>
        <legend className="text-xs font-semibold text-primary-dark">
          Fasadmaterial — välj ett eller flera
        </legend>
        <p className="mt-1 text-xs text-muted">
          T.ex. puts, tunnputs, tegel, trä eller plåt. Flera val om fasaden har
          olika material. {byggarTips}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {deltyper.map((del: DeltypDefinition) => {
            const vald = data.valdaDeltyper.includes(del.id);
            return (
              <button
                key={del.id}
                type="button"
                onClick={() => toggleDeltyp(del.id)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                  vald
                    ? "border-primary bg-[#e2f0e6] text-primary-dark"
                    : "border-border bg-white text-foreground hover:border-primary/50"
                }`}
              >
                {vald ? "✓ " : ""}
                {del.etikett}
              </button>
            );
          })}
        </div>
        {data.valdaDeltyper.length > 0 && (
          <p className="mt-2 text-xs font-medium text-primary-dark">
            Valt:{" "}
            {data.valdaDeltyper
              .map((id) => deltypEtikett(id, data, mall))
              .join(", ")}
          </p>
        )}
      </fieldset>

      {onFasadSidorChange && (
        <fieldset className="rounded-lg border border-[#e2f0e6] bg-[#eef6f0]/40 p-3 sm:p-4">
          <legend className="px-1 text-xs font-semibold text-primary-dark">
            Material per fasad (väderstreck)
          </legend>
          <p className="mt-0.5 text-xs text-muted">
            Välj material per sida — gata, gård, norr, söder, väster och öster
            styrs i grunduppgifterna. Yta (m²) hämtas från samma ställe.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                onFasadSidorChange(föreslaFasadSidorFranGrund(grund))
              }
              className="rounded-lg border border-primary px-3 py-1.5 text-xs font-medium text-primary-dark hover:bg-[#e2f0e6]"
            >
              Hämta sidor från grunduppgifter
            </button>
            <button
              type="button"
              onClick={() => {
                const h = ytor.hus[0];
                if (!h) return;
                onFasadSidorChange([
                  ...sidor,
                  skapaTomFasadSidaMaterialPost(h.id, "gata"),
                ]);
              }}
              disabled={ytor.hus.length === 0}
              className="rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium text-foreground hover:border-primary/40 disabled:opacity-40"
            >
              + Lägg till rad
            </button>
          </div>

          {sidor.length === 0 ? (
            <p className="mt-3 text-xs text-muted">
              Inga fasad sidor registrerade ännu.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {sidor.map((post) => {
                const hus = ytor.hus.find((h) => h.id === post.husId);
                const kvm = hamtaHusFasadRad(ytor, post.husId)[
                  post.vaderstreck
                ]?.trim();
                return (
                  <li
                    key={post.id}
                    className="rounded-lg border border-border bg-white p-3"
                  >
                    <div className="grid gap-2 sm:grid-cols-2">
                      {ytor.hus.length > 1 && (
                        <label className="block text-sm">
                          <span className="text-xs font-medium text-muted">
                            Hus
                          </span>
                          <select
                            value={post.husId}
                            onChange={(e) =>
                              onFasadSidorChange(
                                sidor.map((p) =>
                                  p.id === post.id
                                    ? { ...p, husId: e.target.value }
                                    : p,
                                ),
                              )
                            }
                            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                          >
                            {ytor.hus.map((h) => (
                              <option key={h.id} value={h.id}>
                                {h.husnummer || h.id}
                              </option>
                            ))}
                          </select>
                        </label>
                      )}
                      <label className="block text-sm">
                        <span className="text-xs font-medium text-muted">
                          Väderstreck
                        </span>
                        <select
                          value={post.vaderstreck}
                          onChange={(e) =>
                            onFasadSidorChange(
                              sidor.map((p) =>
                                p.id === post.id
                                  ? {
                                      ...p,
                                      vaderstreck: e.target
                                        .value as typeof post.vaderstreck,
                                    }
                                  : p,
                              ),
                            )
                          }
                          className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                        >
                          {fasadVaderstreckLista.map((l) => (
                            <option key={l.id} value={l.id}>
                              {l.etikett}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="block text-sm sm:col-span-2">
                        <span className="text-xs font-medium text-muted">
                          Material på denna fasad
                        </span>
                        <select
                          value={post.materialId}
                          onChange={(e) =>
                            onFasadSidorChange(
                              sidor.map((p) =>
                                p.id === post.id
                                  ? { ...p, materialId: e.target.value }
                                  : p,
                              ),
                            )
                          }
                          className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                        >
                          <option value="">— Välj material —</option>
                          {deltyper.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.etikett}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="block text-sm sm:col-span-2">
                        <span className="text-xs font-medium text-muted">
                          Kommentar (valfritt)
                        </span>
                        <input
                          type="text"
                          value={post.kommentar}
                          onChange={(e) =>
                            onFasadSidorChange(
                              sidor.map((p) =>
                                p.id === post.id
                                  ? { ...p, kommentar: e.target.value }
                                  : p,
                              ),
                            )
                          }
                          className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                        />
                      </label>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
                      <span>
                        {fasadSidaEtikett(post, grund, materialEtikett)}
                        {hus && ytor.hus.length === 1 && kvm
                          ? ` · ${kvm} m² från grund`
                          : kvm
                            ? ` · ${kvm} m²`
                            : ""}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          onFasadSidorChange(
                            sidor.filter((p) => p.id !== post.id),
                          )
                        }
                        className="text-muted hover:text-red-700"
                      >
                        Ta bort
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </fieldset>
      )}

      <YtaOchMaterialAiHjalp
        typ="Fasad"
        grund={grund}
        komponentData={data}
        registerKvm={värde}
        onApplyKvm={(kvm) => onMåttChange({ värde: kvm })}
      />

      <label className="block max-w-xs text-sm">
        <span className="text-xs font-medium text-muted">
          Total fasadyta ({enhetInfo.enhet})
        </span>
        <input
          type="number"
          min={0}
          step={0.1}
          value={värde}
          onChange={(e) => onMåttChange({ värde: e.target.value })}
          placeholder="m²"
          className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
        />
        <span className="mt-1 block text-[10px] text-muted">
          Används som yta (m²) vid blandad prissättning i kommande underhåll och
          per fasadåtgärd nedan. Kan fyllas från grunduppgifter (hus och vädersträck).
        </span>
      </label>

      <FasadYtaKostnadSammanstallning
        grund={grund}
        registerFasadKvm={värde}
        fasadAtgard={fasadAtgard}
        priser={fasadAtgardPriser}
        planStartAr={planStartAr}
        planLangdAr={planLangdAr}
        onApplyGrundSummaTillRegister={(kvm) => onMåttChange({ värde: kvm })}
      />

      <FasadAtgardTillfallenPanel
        fasadAtgard={fasadAtgard}
        priser={fasadAtgardPriser}
        defaultKvm={värde}
        planStartAr={planStartAr}
        planLangdAr={planLangdAr}
        onFasadAtgardChange={onFasadAtgardChange}
        onPriserChange={onFasadAtgardPriserChange}
      />
    </div>
  );
}
