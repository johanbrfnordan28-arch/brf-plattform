"use client";

import { useState } from "react";
import { ListaSummeringPanel } from "@/components/underhallsplan/ListaSummeringPanel";
import { formatSummeringTal } from "@/components/underhallsplan/lista-summering";
import {
  normaliseraVvsVarmeStam,
  skapaTomVarmeRadiatorGrupp,
  skapaTomVvsVarmeStam,
  summeraVvsVarmeStammar,
  varmeAvstandAlternativ,
  varmeElementAlternativ,
  varmeGruppRorMeter,
  varmeRadiatorStorlekar,
  varmeRorDimensioner,
  varmeStamElement,
  type VarmeAvstandId,
  type VarmeElementAntalId,
  type VarmeRadiatorGrupp,
  type VarmeRadiatorStorlekId,
  type VarmeRorDimensionId,
  type VvsVarmeStam,
} from "@/components/underhallsplan/vvs-varme";

type VvsVarmePanelProps = {
  poster: VvsVarmeStam[];
  onChange: (poster: VvsVarmeStam[]) => void;
  adresser?: string[];
};

function TextFalt({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="text-xs font-medium text-muted">{label}</span>
      {hint && <span className="mt-0.5 block text-[11px] text-muted">{hint}</span>}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
      />
    </label>
  );
}

function ValFalt({
  label,
  hint,
  value,
  alternativ,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string;
  alternativ: { id: string; etikett: string }[];
  onChange: (id: string) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="text-xs font-medium text-muted">{label}</span>
      {hint && <span className="mt-0.5 block text-[11px] text-muted">{hint}</span>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
      >
        {alternativ.map((alt) => (
          <option key={alt.id || "tom"} value={alt.id}>
            {alt.etikett}
          </option>
        ))}
      </select>
    </label>
  );
}

export function VvsVarmePanel({
  poster,
  onChange,
  adresser = [],
}: VvsVarmePanelProps) {
  const [antalAttLagga, setAntalAttLagga] = useState("1");
  const rader = poster.map((p, i) => normaliseraVvsVarmeStam(p, i));

  function spara(nasta: VvsVarmeStam[]) {
    onChange(nasta.map((p, i) => normaliseraVvsVarmeStam(p, i)));
  }

  function uppdatera(id: string, patch: Partial<VvsVarmeStam>) {
    spara(rader.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  function läggTill(antal: number) {
    const start = rader.length;
    const nya = Array.from({ length: antal }, (_, i) =>
      skapaTomVvsVarmeStam(`Värmestam ${start + i + 1}`),
    );
    spara([...rader, ...nya]);
  }

  function uppdateraGrupp(
    stamId: string,
    gruppId: string,
    patch: Partial<VarmeRadiatorGrupp>,
  ) {
    spara(
      rader.map((stam) =>
        stam.id === stamId
          ? {
              ...stam,
              radiatorGrupper: stam.radiatorGrupper.map((grupp) =>
                grupp.id === gruppId ? { ...grupp, ...patch } : grupp,
              ),
            }
          : stam,
      ),
    );
  }

  function läggTillFranFalt() {
    const n = Number.parseInt(antalAttLagga, 10);
    läggTill(Number.isFinite(n) && n > 0 ? Math.min(n, 40) : 1);
  }

  return (
    <div className="space-y-4">
      <p className="text-xs leading-relaxed text-muted">
        Grundmall för värmestammar. Varje stam kan döpas och märkas i källaren
        och beskriver var den går upp i fastigheten. På stammen kan radiatorerna
        ha olika storlek, sitta olika långt från stammen och vara 1, 2 eller 3
        element — vanligast är 1. Välj i listan eller ange eget. Sammanställningen
        längst ned är underlag när ni uppskattar kostnad. Stamventiler läggs
        inte in här. De registreras bara under Uppvärmning → Stamventiler.
      </p>

      <div className="flex flex-wrap items-end gap-2 rounded-lg border border-primary/30 bg-[#fafcfa] p-3">
        <p className="mr-auto text-sm font-medium text-primary-dark">
          Antal värmestammar: {rader.length} st
        </p>
        <label className="block text-sm">
          <span className="text-xs font-medium text-muted">Lägg till</span>
          <input
            type="number"
            min={1}
            max={40}
            step={1}
            value={antalAttLagga}
            onChange={(e) => setAntalAttLagga(e.target.value)}
            className="mt-1 w-20 rounded-lg border border-border bg-white px-3 py-2 text-sm"
          />
        </label>
        <button
          type="button"
          onClick={läggTillFranFalt}
          className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          + Lägg till stammar
        </button>
      </div>

      {rader.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-white px-3 py-4 text-center text-xs text-muted">
          Inga värmestammar ännu — ange antal och lägg till. Varje stam får
          samma grundmall och kan sedan ändras.
        </p>
      ) : (
        <ul className="space-y-3">
          {rader.map((post, index) => (
            <li
              key={post.id}
              className="rounded-lg border border-border bg-white p-3 sm:p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-primary-dark">
                  {post.namn.trim() || `Värmestam ${index + 1}`}
                </span>
                <button
                  type="button"
                  onClick={() => spara(rader.filter((p) => p.id !== post.id))}
                  className="text-xs text-muted hover:text-red-700"
                >
                  Ta bort
                </button>
              </div>

              <p className="text-xs font-semibold text-primary-dark">I källaren</p>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <TextFalt
                  label="Namn"
                  value={post.namn}
                  onChange={(namn) => uppdatera(post.id, { namn })}
                  placeholder="t.ex. Stam 1"
                  hint="Namnet stammen har där den är märkt."
                />
                <TextFalt
                  label="Märkning"
                  value={post.markningKallare}
                  onChange={(markningKallare) =>
                    uppdatera(post.id, { markningKallare })
                  }
                  placeholder="t.ex. skylt VS-A"
                  hint="Texten på märkningen i källaren."
                />
              </div>

              <p className="mt-4 text-xs font-semibold text-primary-dark">
                Var stammen går upp
              </p>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="text-xs font-medium text-muted">Adress</span>
                  <input
                    type="text"
                    list={adresser.length > 0 ? `vvs-varme-adress-${post.id}` : undefined}
                    value={post.adress}
                    onChange={(e) => uppdatera(post.id, { adress: e.target.value })}
                    placeholder="t.ex. Hannebergsgatan 22"
                    className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                  />
                  {adresser.length > 0 && (
                    <datalist id={`vvs-varme-adress-${post.id}`}>
                      {adresser.map((adress) => (
                        <option key={adress} value={adress} />
                      ))}
                    </datalist>
                  )}
                </label>
                <TextFalt
                  label="Betjänar"
                  value={post.betjanar}
                  onChange={(betjanar) => uppdatera(post.id, { betjanar })}
                  placeholder="t.ex. vardagsrum, 3 rum och kök"
                />
                <TextFalt
                  label="Antal våningar"
                  value={post.vaningar}
                  onChange={(vaningar) => uppdatera(post.id, { vaningar })}
                  placeholder="t.ex. 5"
                />
                <ValFalt
                  label="Dimension stamledning"
                  hint="Röret som går upp i huset, tillopp och retur."
                  value={post.stamRordimension}
                  alternativ={[
                    { id: "", etikett: "— ej angiven —" },
                    ...varmeRorDimensioner,
                  ]}
                  onChange={(stamRordimension) =>
                    uppdatera(post.id, {
                      stamRordimension: stamRordimension as VarmeRorDimensionId | "",
                      stamRordimensionAnnan:
                        stamRordimension === "annat"
                          ? post.stamRordimensionAnnan
                          : "",
                    })
                  }
                />
                {post.stamRordimension === "annat" && (
                  <TextFalt
                    label="Egen dimension på stammen"
                    value={post.stamRordimensionAnnan}
                    onChange={(stamRordimensionAnnan) =>
                      uppdatera(post.id, { stamRordimensionAnnan })
                    }
                    placeholder="t.ex. DN40"
                  />
                )}
                <div className="sm:col-span-2">
                  <TextFalt
                    label="Storlek på rummen"
                    value={post.rumStorlek}
                    onChange={(rumStorlek) => uppdatera(post.id, { rumStorlek })}
                    placeholder="t.ex. vardagsrum 22 m², sovrum 12 m²"
                    hint="Rummen stammen betjänar."
                  />
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xs font-semibold text-primary-dark">
                  Radiatorer på stammen
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-muted">
                  En rad för varje kombination som är lika. Vanligast är 1
                  element. Rörmeter i sammanställningen är avståndet gånger
                  antalet element, tillopp och retur.
                </p>
                {post.radiatorAntal.trim() && post.radiatorGrupper.length === 0 && (
                  <p className="mt-2 text-[11px] text-muted">
                    Tidigare angivet antal: {post.radiatorAntal} radiatorer.
                    Lägg en grupp nedan för storlek, avstånd och dimension.
                  </p>
                )}
                {post.radiatorGrupper.length > 0 && (
                  <ul className="mt-3 space-y-3">
                    {post.radiatorGrupper.map((grupp, gruppIndex) => (
                      <li
                        key={grupp.id}
                        className="rounded-lg border border-border bg-[#fafcfa] p-3"
                      >
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <span className="text-xs font-medium text-foreground">
                            Placering {gruppIndex + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              uppdatera(post.id, {
                                radiatorGrupper: post.radiatorGrupper.filter(
                                  (rad) => rad.id !== grupp.id,
                                ),
                              })
                            }
                            className="text-xs text-muted hover:text-red-700"
                          >
                            Ta bort
                          </button>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <TextFalt
                            label="Antal placeringar"
                            hint="Hur många ställen med samma värden."
                            value={grupp.antalPlaceringar}
                            onChange={(antalPlaceringar) =>
                              uppdateraGrupp(post.id, grupp.id, {
                                antalPlaceringar,
                              })
                            }
                            placeholder="t.ex. 8"
                          />
                          <ValFalt
                            label="Element per placering"
                            value={grupp.elementAntal}
                            alternativ={varmeElementAlternativ}
                            onChange={(elementAntal) =>
                              uppdateraGrupp(post.id, grupp.id, {
                                elementAntal: elementAntal as VarmeElementAntalId,
                              })
                            }
                          />
                          {grupp.elementAntal === "annat" && (
                            <TextFalt
                              label="Eget antal element"
                              value={grupp.elementAnnan}
                              onChange={(elementAnnan) =>
                                uppdateraGrupp(post.id, grupp.id, { elementAnnan })
                              }
                              placeholder="t.ex. 4"
                            />
                          )}
                          <ValFalt
                            label="Storlek"
                            value={grupp.storlek}
                            alternativ={varmeRadiatorStorlekar}
                            onChange={(storlek) =>
                              uppdateraGrupp(post.id, grupp.id, {
                                storlek: storlek as VarmeRadiatorStorlekId,
                              })
                            }
                          />
                          {grupp.storlek === "annat" && (
                            <TextFalt
                              label="Egen storlek"
                              value={grupp.storlekAnnan}
                              onChange={(storlekAnnan) =>
                                uppdateraGrupp(post.id, grupp.id, { storlekAnnan })
                              }
                              placeholder="t.ex. 500×1400 mm"
                            />
                          )}
                          <ValFalt
                            label="Avstånd från stammen"
                            value={grupp.avstand}
                            alternativ={varmeAvstandAlternativ}
                            onChange={(avstand) =>
                              uppdateraGrupp(post.id, grupp.id, {
                                avstand: avstand as VarmeAvstandId,
                              })
                            }
                          />
                          {grupp.avstand === "annat" && (
                            <TextFalt
                              label="Eget avstånd (meter)"
                              value={grupp.avstandAnnan}
                              onChange={(avstandAnnan) =>
                                uppdateraGrupp(post.id, grupp.id, { avstandAnnan })
                              }
                              placeholder="t.ex. 8"
                            />
                          )}
                          <ValFalt
                            label="Dimension anslutningsrör"
                            hint="Röret mellan stammen och elementet."
                            value={grupp.rordimension}
                            alternativ={varmeRorDimensioner}
                            onChange={(rordimension) =>
                              uppdateraGrupp(post.id, grupp.id, {
                                rordimension: rordimension as VarmeRorDimensionId,
                              })
                            }
                          />
                          {grupp.rordimension === "annat" && (
                            <TextFalt
                              label="Egen rördimension"
                              value={grupp.rordimensionAnnan}
                              onChange={(rordimensionAnnan) =>
                                uppdateraGrupp(post.id, grupp.id, {
                                  rordimensionAnnan,
                                })
                              }
                              placeholder="t.ex. DN8"
                            />
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <button
                  type="button"
                  onClick={() =>
                    uppdatera(post.id, {
                      radiatorGrupper: [
                        ...post.radiatorGrupper,
                        skapaTomVarmeRadiatorGrupp(),
                      ],
                    })
                  }
                  className="mt-3 rounded-lg border border-primary/40 px-3 py-2 text-xs font-medium text-primary-dark hover:bg-[#eef6f0]"
                >
                  + Lägg till radiatorer
                </button>
                {varmeStamElement(post) > 0 && (
                  <p className="mt-2 text-[11px] text-muted">
                    Denna stam: {varmeStamElement(post)} element
                    {post.radiatorGrupper.some((grupp) => varmeGruppRorMeter(grupp) > 0)
                      ? `, anslutningsrör ${formatSummeringTal(
                          post.radiatorGrupper.reduce(
                            (sum, grupp) => sum + varmeGruppRorMeter(grupp),
                            0,
                          ),
                        )} m tillopp + retur`
                      : ""}
                    .
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {rader.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs leading-relaxed text-muted">
            Sammanställningen samlar storlek, antal element, avstånd och
            rördimension från alla stammar. Den är underlag när ni uppskattar
            kostnad för element och rör.
          </p>
          <ListaSummeringPanel
            titel="Sammanställning värme"
            rader={summeraVvsVarmeStammar(rader)}
          />
        </div>
      )}
    </div>
  );
}
