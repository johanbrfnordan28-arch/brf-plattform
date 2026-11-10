"use client";

import { useState } from "react";
import { ListaSummeringPanel } from "@/components/underhallsplan/ListaSummeringPanel";
import { formatSummeringTal } from "@/components/underhallsplan/lista-summering";
import {
  formateraVarmeStamHojd,
  normaliseraVvsVarmeStam,
  skapaTomVarmeRadiatorGrupp,
  skapaTomVvsVarmeStam,
  summeraVvsVarmeStammar,
  varmeAvstandAlternativ,
  varmeBjalklagAlternativ,
  varmeElementAlternativ,
  varmeGruppRorMeter,
  varmeRadiatorStorlekar,
  varmeRorDimensioner,
  varmeStamElement,
  varmeTakhojdAlternativ,
  varmeVaningarAlternativ,
  type VarmeAvstandId,
  type VarmeBjalklagId,
  type VarmeElementAntalId,
  type VarmeRadiatorGrupp,
  type VarmeRadiatorStorlekId,
  type VarmeRorDimensionId,
  type VarmeTakhojdId,
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
        Lägg en stam per rad och bygg vidare när det behövs. Styrelsen kan ge
        varje stam ett eget namn och ange placering — till exempel Stam 1 som
        betjänar vardagsrum i 3 rum och kök. Med antal våningar, takhöjd och
        bjälklagets tjocklek räknas total stamhöjd fram automatiskt. Dimension
        och radiatorer är valbara. Sammanställningen längst ned är underlag för
        kostnad. Stamventiler registreras under Uppvärmning → Stamventiler.
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

              <p className="text-xs font-semibold text-primary-dark">
                Namn och placering
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted">
                Styrelsen kan namnge stammen fritt. Placeringen beskriver var
                den går upp och vad den betjänar.
              </p>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <TextFalt
                  label="Namn"
                  value={post.namn}
                  onChange={(namn) => uppdatera(post.id, { namn })}
                  placeholder="t.ex. Stam 1"
                  hint="Eget namn som styrelsen väljer."
                />
                <TextFalt
                  label="Märkning i källaren"
                  value={post.markningKallare}
                  onChange={(markningKallare) =>
                    uppdatera(post.id, { markningKallare })
                  }
                  placeholder="t.ex. skylt VS-A"
                  hint="Texten på märkningen där stammen står i källaren."
                />
                <label className="block text-sm">
                  <span className="text-xs font-medium text-muted">
                    Placering / adress
                  </span>
                  <span className="mt-0.5 block text-[11px] text-muted">
                    Trapphus eller adress där stammen går upp.
                  </span>
                  <input
                    type="text"
                    list={adresser.length > 0 ? `vvs-varme-adress-${post.id}` : undefined}
                    value={post.adress}
                    onChange={(e) => uppdatera(post.id, { adress: e.target.value })}
                    placeholder="t.ex. Hannebergsgatan 22, trapphus A"
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
                  placeholder="t.ex. 3 rum och kök, vardagsrum"
                  hint="Lägenhetstyp eller rum stammen försörjer."
                />
              </div>

              <p className="mt-4 text-xs font-semibold text-primary-dark">
                Höjd och dimension
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted">
                Total stamhöjd räknas som antal våningar × takhöjd + (våningar −
                1) × bjälklag. Exempel: 9 × 2,6 m + 8 × 0,4 m = 26,6 m.
              </p>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="text-xs font-medium text-muted">
                    Antal våningar
                  </span>
                  <select
                    value={
                      varmeVaningarAlternativ.some(
                        (a) => a.id === post.vaningar && a.id !== "annat",
                      )
                        ? post.vaningar
                        : ""
                    }
                    onChange={(e) => {
                      if (e.target.value) {
                        uppdatera(post.id, { vaningar: e.target.value });
                      }
                    }}
                    className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                  >
                    <option value="">Välj vanligt antal</option>
                    {varmeVaningarAlternativ
                      .filter((a) => a.id !== "annat")
                      .map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.etikett}
                        </option>
                      ))}
                  </select>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={post.vaningar}
                    onChange={(e) =>
                      uppdatera(post.id, { vaningar: e.target.value })
                    }
                    placeholder="eller skriv eget, t.ex. 14"
                    className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                  />
                </label>
                <ValFalt
                  label="Takhöjd"
                  value={post.takhojd}
                  alternativ={[
                    { id: "", etikett: "— välj —" },
                    ...varmeTakhojdAlternativ,
                  ]}
                  onChange={(takhojd) =>
                    uppdatera(post.id, {
                      takhojd: takhojd as VarmeTakhojdId | "",
                      takhojdAnnan:
                        takhojd === "annat" ? post.takhojdAnnan : "",
                    })
                  }
                />
                {post.takhojd === "annat" && (
                  <TextFalt
                    label="Egen takhöjd (meter)"
                    value={post.takhojdAnnan}
                    onChange={(takhojdAnnan) =>
                      uppdatera(post.id, { takhojdAnnan })
                    }
                    placeholder="t.ex. 2,65"
                  />
                )}
                <ValFalt
                  label="Bjälklagets tjocklek"
                  value={post.bjalklag}
                  alternativ={[
                    { id: "", etikett: "— välj —" },
                    ...varmeBjalklagAlternativ,
                  ]}
                  onChange={(bjalklag) =>
                    uppdatera(post.id, {
                      bjalklag: bjalklag as VarmeBjalklagId | "",
                      bjalklagAnnan:
                        bjalklag === "annat" ? post.bjalklagAnnan : "",
                    })
                  }
                />
                {post.bjalklag === "annat" && (
                  <TextFalt
                    label="Egen bjälklagstjocklek (meter)"
                    value={post.bjalklagAnnan}
                    onChange={(bjalklagAnnan) =>
                      uppdatera(post.id, { bjalklagAnnan })
                    }
                    placeholder="t.ex. 0,45"
                  />
                )}
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
                    placeholder="t.ex. 42 mm"
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
              {formateraVarmeStamHojd(post) && (
                <p className="mt-3 rounded-lg border border-primary/20 bg-[#eef6f0]/60 px-3 py-2 text-sm text-primary-dark">
                  Total stamhöjd: {formateraVarmeStamHojd(post)}
                </p>
              )}

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
            Sammanställningen samlar stamhöjd, dimension, radiatorstorlek, antal
            element och avstånd från alla stammar. Den är underlag när ni
            uppskattar kostnad för stamledning, element och rör.
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
