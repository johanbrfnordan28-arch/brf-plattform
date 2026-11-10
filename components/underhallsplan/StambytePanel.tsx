"use client";

import { useState } from "react";
import { ListaSummeringPanel } from "@/components/underhallsplan/ListaSummeringPanel";
import { StambytePrisPanel } from "@/components/underhallsplan/StambytePrisPanel";
import { parseNummerSumma } from "@/components/underhallsplan/lista-summering";
import {
  avloppMaterialAlternativ,
  skapaTomStambyteRum,
  stambyteAvloppDelar,
  stambyteBadrumStorlekar,
  stambyteRumTypEtikett,
  stambyteSanitetDelar,
  stambyteTappvattenAntalDelar,
  stambyteVattenSektioner,
  summeraStambyteMangder,
  summeraStambyteRum,
  vattenMaterialAlternativ,
  type AvloppMaterialId,
  type StambyteRumGrupp,
  type StambyteRumTyp,
  type VattenMaterialId,
  type VvsStambyteData,
} from "@/components/underhallsplan/vvs-stambyte";

type StambytePanelProps = {
  data: VvsStambyteData;
  onChange: (data: VvsStambyteData) => void;
};

async function lasRumBild(
  file: File,
): Promise<{ dataUrl: string; filnamn: string } | null> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const bild = new Image();
      bild.onload = () => resolve(bild);
      bild.onerror = () => reject(new Error("bild"));
      bild.src = url;
    });
    const max = 1280;
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.width * scale));
    canvas.height = Math.max(1, Math.round(img.height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.72);
    if (dataUrl.length > 900_000) return null;
    return { dataUrl, filnamn: file.name };
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

const badrumInnehall: { nyckel: "dusch" | "badkar" | "bide" | "handfat" | "bastu"; etikett: string }[] =
  [
    { nyckel: "dusch", etikett: "Dusch" },
    { nyckel: "badkar", etikett: "Badkar" },
    { nyckel: "bide", etikett: "Bidé" },
    { nyckel: "handfat", etikett: "Handfat" },
    { nyckel: "bastu", etikett: "Bastu" },
  ];

export function StambytePanel({ data, onChange }: StambytePanelProps) {
  const [bildFel, setBildFel] = useState<Record<string, string>>({});
  const rum = data.rum ?? [];
  const harBadrumsgrupper = rum.some(
    (r) => r.typ === "badrum" && parseNummerSumma([r.antal]) > 0,
  );

  function sparaRum(nasta: StambyteRumGrupp[]) {
    onChange({ ...data, rum: nasta });
  }

  function laggTillRum(typ: StambyteRumTyp) {
    sparaRum([...rum, skapaTomStambyteRum(typ)]);
  }

  function uppdateraRum(id: string, patch: Partial<StambyteRumGrupp>) {
    sparaRum(rum.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function uppdateraSanitet(
    delId: string,
    patch: Partial<{ aktiv: boolean; antal: string }>,
  ) {
    onChange({
      ...data,
      sanitet: data.sanitet.map((r) =>
        r.delId === delId ? { ...r, ...patch } : r,
      ),
    });
  }

  return (
    <div className="space-y-4">
      <p className="text-xs leading-relaxed text-muted">
        Lägg en rad per grupp av likadana rum. Skiljer sig storlek eller
        innehåll lägger du en rad till. Ytor, ledningar och priser anges
        separat nedan.
      </p>

      <fieldset className="rounded-lg border border-[#e2f0e6] bg-[#eef6f0]/40 p-3">
        <legend className="px-1 text-xs font-semibold text-primary-dark">
          Rum
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {(
            [
              ["badrum", "+ Badrum"],
              ["wc", "+ WC"],
              ["kok", "+ Kök"],
            ] as const
          ).map(([typ, etikett]) => (
            <button
              key={typ}
              type="button"
              onClick={() => laggTillRum(typ)}
              className="rounded-lg border border-primary/40 bg-white px-3 py-1.5 text-sm font-medium text-primary-dark"
            >
              {etikett}
            </button>
          ))}
        </div>

        {rum.length === 0 && (
          <p className="mt-3 text-xs text-muted">
            Inga rum ännu. Ett badrum kan täcka alla som är lika stora och har
            samma inredning.
          </p>
        )}

        <ul className="mt-3 space-y-3">
          {rum.map((grupp) => (
            <li
              key={grupp.id}
              className="rounded-lg border border-border bg-white p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-foreground">
                  {stambyteRumTypEtikett[grupp.typ]}{" "}
                  {rum
                    .filter((r) => r.typ === grupp.typ)
                    .findIndex((r) => r.id === grupp.id) + 1}
                </p>
                <button
                  type="button"
                  onClick={() => sparaRum(rum.filter((r) => r.id !== grupp.id))}
                  className="text-xs text-muted underline"
                >
                  Ta bort
                </button>
              </div>

              <label className="mt-2 block max-w-xs text-sm">
                <span className="text-xs font-medium text-muted">Antal</span>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={grupp.antal}
                  onChange={(e) =>
                    uppdateraRum(grupp.id, { antal: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                />
              </label>

              {grupp.typ === "badrum" && (
                <div className="mt-3 space-y-3">
                  <label className="block max-w-xs text-sm">
                    <span className="text-xs font-medium text-muted">
                      Storlek
                    </span>
                    <select
                      value={grupp.storlek}
                      onChange={(e) =>
                        uppdateraRum(grupp.id, {
                          storlek: e.target.value as StambyteRumGrupp["storlek"],
                          storlekAnnan:
                            e.target.value === "annat" ? grupp.storlekAnnan : "",
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                    >
                      <option value="">Välj storlek</option>
                      {stambyteBadrumStorlekar.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.etikett}
                        </option>
                      ))}
                    </select>
                  </label>
                  {grupp.storlek === "annat" && (
                    <label className="block max-w-xs text-sm">
                      <span className="text-xs font-medium text-muted">
                        Egen storlek
                      </span>
                      <input
                        type="text"
                        value={grupp.storlekAnnan}
                        onChange={(e) =>
                          uppdateraRum(grupp.id, { storlekAnnan: e.target.value })
                        }
                        placeholder="t.ex. 4,5 m²"
                        className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                      />
                    </label>
                  )}
                  <fieldset>
                    <legend className="text-xs font-medium text-muted">
                      Innehåll
                    </legend>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
                      {badrumInnehall.map((del) => (
                        <label
                          key={del.nyckel}
                          className="flex items-center gap-2 text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={grupp[del.nyckel]}
                            onChange={(e) =>
                              uppdateraRum(grupp.id, {
                                [del.nyckel]: e.target.checked,
                              })
                            }
                            className="h-4 w-4 rounded border-border text-primary"
                          />
                          {del.etikett}
                        </label>
                      ))}
                    </div>
                    <p className="mt-1 text-xs text-muted">
                      Dusch och badkar kan väljas var för sig eller båda.
                    </p>
                  </fieldset>
                </div>
              )}

              {grupp.typ === "wc" && (
                <fieldset className="mt-3">
                  <legend className="text-xs font-medium text-muted">
                    Innehåll
                  </legend>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
                    {(
                      [
                        ["toalett", "Toalett"],
                        ["handfat", "Handfat"],
                      ] as const
                    ).map(([nyckel, etikett]) => (
                      <label
                        key={nyckel}
                        className="flex items-center gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={grupp[nyckel]}
                          onChange={(e) =>
                            uppdateraRum(grupp.id, {
                              [nyckel]: e.target.checked,
                            })
                          }
                          className="h-4 w-4 rounded border-border text-primary"
                        />
                        {etikett}
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}

              {grupp.typ === "kok" && (
                <div className="mt-3 space-y-2">
                  <label className="block text-sm">
                    <span className="text-xs font-medium text-muted">
                      Bild inuti diskbänkskåpet
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        e.target.value = "";
                        if (!file) return;
                        void lasRumBild(file).then((bild) => {
                          if (!bild) {
                            setBildFel((prev) => ({
                              ...prev,
                              [grupp.id]:
                                "Bilden kunde inte läsas. Välj en mindre bild.",
                            }));
                            return;
                          }
                          setBildFel((prev) => ({ ...prev, [grupp.id]: "" }));
                          uppdateraRum(grupp.id, {
                            bildDataUrl: bild.dataUrl,
                            bildFilnamn: bild.filnamn,
                          });
                        });
                      }}
                      className="mt-1 block w-full text-sm"
                    />
                  </label>
                  {bildFel[grupp.id] && (
                    <p className="text-xs text-red-700">{bildFel[grupp.id]}</p>
                  )}
                  {grupp.bildDataUrl && (
                    <div className="space-y-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={grupp.bildDataUrl}
                        alt={grupp.bildFilnamn || "Diskbänkskåp"}
                        className="max-h-40 rounded-lg border border-border"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          uppdateraRum(grupp.id, {
                            bildDataUrl: "",
                            bildFilnamn: "",
                          })
                        }
                        className="text-xs text-muted underline"
                      >
                        Ta bort bild
                        {grupp.bildFilnamn ? ` (${grupp.bildFilnamn})` : ""}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>

        <ListaSummeringPanel
          titel="Sammanställning rum"
          rader={summeraStambyteRum(rum)}
        />
      </fieldset>

      {!harBadrumsgrupper && (
        <label className="block max-w-xs text-sm">
          <span className="text-xs font-medium text-muted">
            Antal badrum i stambyte (st)
          </span>
          <input
            type="number"
            min={0}
            step={1}
            value={data.antalBadrum}
            onChange={(e) => onChange({ ...data, antalBadrum: e.target.value })}
            placeholder="t.ex. 48"
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
          />
        </label>
      )}

      <fieldset className="rounded-lg border border-[#e2f0e6] bg-[#eef6f0]/40 p-3">
        <legend className="px-1 text-xs font-semibold text-primary-dark">
          Ytor i badrum (m²)
        </legend>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          {(
            [
              { key: "golvKvm" as const, etikett: "Golv" },
              { key: "vaggarKvm" as const, etikett: "Väggar" },
              { key: "takKvm" as const, etikett: "Tak (undertak)" },
              { key: "stommeKvm" as const, etikett: "Stomme (vägg)" },
            ] as const
          ).map((falt) => (
            <label key={falt.key} className="block text-sm">
              <span className="text-xs font-medium text-muted">{falt.etikett}</span>
              <input
                type="number"
                min={0}
                step={0.1}
                value={data[falt.key]}
                onChange={(e) =>
                  onChange({ ...data, [falt.key]: e.target.value })
                }
                placeholder="m²"
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
              />
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-xs font-semibold text-primary-dark">
          Sanitet och inredning (st)
        </legend>
        <p className="mt-1 text-xs text-muted">
          Tvättmaskin och golvvärme anges här. Dusch, badkar, bidé, handfat och
          toalett räknas i rummen ovan när de är ifyllda.
        </p>
        <ul className="mt-2 space-y-2">
          {stambyteSanitetDelar.map((del) => {
            const rad =
              data.sanitet.find((r) => r.delId === del.id) ??
              ({ delId: del.id, aktiv: false, antal: "" } as const);
            return (
              <li
                key={del.id}
                className="rounded-lg border border-border bg-white p-3"
              >
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={rad.aktiv}
                    onChange={(e) =>
                      uppdateraSanitet(del.id, { aktiv: e.target.checked })
                    }
                    className="mt-1 h-4 w-4 rounded border-border text-primary"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-foreground">
                      {del.etikett}
                    </span>
                    <span className="block text-xs text-muted">
                      {del.beskrivning}
                    </span>
                  </span>
                </label>
                {rad.aktiv && (
                  <label className="mt-2 block max-w-xs text-sm">
                    <span className="text-xs font-medium text-muted">Antal</span>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={rad.antal}
                      onChange={(e) =>
                        uppdateraSanitet(del.id, { antal: e.target.value })
                      }
                      className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                    />
                  </label>
                )}
              </li>
            );
          })}
        </ul>
      </fieldset>

      <fieldset className="rounded-lg border border-[#e2f0e6] bg-[#eef6f0]/40 p-3">
        <legend className="px-1 text-xs font-semibold text-primary-dark">
          Tappvatten
        </legend>
        <p className="mt-0.5 text-xs text-muted">
          Välj rörmaterial och ange löpmeter — vertikal och horisontell med
          kallvatten, varmvatten och cirkulation. Stamventiler anges per styck.
        </p>

        <fieldset className="mt-3 space-y-2 rounded-lg border border-border bg-white p-3">
          <legend className="px-1 text-xs font-semibold text-primary-dark">
            Rörmaterial
          </legend>
          {vattenMaterialAlternativ.map((alt) => (
            <label
              key={alt.id}
              className="flex cursor-pointer items-start gap-2 rounded-lg border border-border px-3 py-2 text-sm has-[:checked]:border-primary has-[:checked]:bg-[#eef6f0]/50"
            >
              <input
                type="radio"
                name="vatten-material"
                checked={data.vattenMaterial === alt.id}
                onChange={() =>
                  onChange({
                    ...data,
                    vattenMaterial: alt.id as VattenMaterialId,
                    vattenMaterialAnnanText:
                      alt.id === "annat" ? data.vattenMaterialAnnanText : "",
                  })
                }
                className="mt-0.5 h-4 w-4 shrink-0 border-border text-primary"
              />
              <span>
                <span className="font-medium text-foreground">{alt.etikett}</span>
                {alt.beskrivning && (
                  <span className="mt-0.5 block text-xs text-muted">
                    {alt.beskrivning}
                  </span>
                )}
              </span>
            </label>
          ))}
          {data.vattenMaterial === "annat" && (
            <label className="block text-sm">
              <span className="text-xs font-medium text-muted">Ange material</span>
              <input
                type="text"
                value={data.vattenMaterialAnnanText}
                onChange={(e) =>
                  onChange({
                    ...data,
                    vattenMaterialAnnanText: e.target.value,
                  })
                }
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </label>
          )}
        </fieldset>

        <div className="mt-3 space-y-4">
          {stambyteVattenSektioner.map((sektion) => (
            <div
              key={sektion.rubrik}
              className="rounded-lg border border-border/80 bg-white p-3"
            >
              <p className="text-xs font-semibold text-primary-dark">
                {sektion.rubrik}
              </p>
              <p className="mt-0.5 text-xs text-muted">{sektion.beskrivning}</p>
              <div className="mt-2 grid gap-3 sm:grid-cols-3">
                {sektion.falt.map(({ falt, etikett }) => (
                  <label key={falt} className="block text-sm">
                    <span className="text-xs font-medium text-foreground">
                      {etikett}
                    </span>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        step={0.1}
                        value={data[falt]}
                        onChange={(e) =>
                          onChange({
                            ...data,
                            [falt]: e.target.value,
                          } as VvsStambyteData)
                        }
                        placeholder="m"
                        className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                      />
                      <span className="shrink-0 text-xs text-muted">m</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {stambyteTappvattenAntalDelar.map((def) => (
            <label key={def.falt} className="block text-sm">
              <span className="text-xs font-medium text-foreground">
                {def.etikett}
              </span>
              <p className="mt-0.5 text-xs text-muted">{def.beskrivning}</p>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={data[def.falt]}
                  onChange={(e) =>
                    onChange({ ...data, [def.falt]: e.target.value })
                  }
                  placeholder="st"
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                />
                <span className="shrink-0 text-xs text-muted">st</span>
              </div>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="rounded-lg border border-[#e2f0e6] bg-[#eef6f0]/40 p-3">
        <legend className="px-1 text-xs font-semibold text-primary-dark">
          Teknikskåp
        </legend>
        <p className="mt-0.5 text-xs text-muted">
          Central eller våningsvis teknikskåp för vatten — anges per styck.
        </p>
        <label className="mt-2 block max-w-xs text-sm">
          <span className="text-xs font-medium text-foreground">Antal</span>
          <div className="mt-1 flex items-center gap-2">
            <input
              type="number"
              min={0}
              step={1}
              value={data.teknikskapAntal}
              onChange={(e) =>
                onChange({ ...data, teknikskapAntal: e.target.value })
              }
              placeholder="st"
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
            />
            <span className="shrink-0 text-xs text-muted">st</span>
          </div>
        </label>
      </fieldset>

      <fieldset className="rounded-lg border border-[#e2f0e6] bg-[#eef6f0]/40 p-3">
        <legend className="px-1 text-xs font-semibold text-primary-dark">
          Avloppsledning
        </legend>
        <p className="mt-0.5 text-xs text-muted">
          Välj rörmaterial, ange stammar i löpmeter samt avstick, grenar och
          brandmanschett per styck.
        </p>

        <fieldset className="mt-3 space-y-2 rounded-lg border border-border bg-white p-3">
          <legend className="px-1 text-xs font-semibold text-primary-dark">
            Rörmaterial
          </legend>
          {avloppMaterialAlternativ.map((alt) => (
            <label
              key={alt.id}
              className="flex cursor-pointer items-start gap-2 rounded-lg border border-border px-3 py-2 text-sm has-[:checked]:border-primary has-[:checked]:bg-[#eef6f0]/50"
            >
              <input
                type="radio"
                name="avlopp-material"
                checked={data.avloppMaterial === alt.id}
                onChange={() =>
                  onChange({
                    ...data,
                    avloppMaterial: alt.id as AvloppMaterialId,
                    avloppMaterialAnnanText:
                      alt.id === "annat" ? data.avloppMaterialAnnanText : "",
                  })
                }
                className="mt-0.5 h-4 w-4 shrink-0 border-border text-primary"
              />
              <span>
                <span className="font-medium text-foreground">{alt.etikett}</span>
                {alt.beskrivning && (
                  <span className="mt-0.5 block text-xs text-muted">
                    {alt.beskrivning}
                  </span>
                )}
              </span>
            </label>
          ))}
          {data.avloppMaterial === "annat" && (
            <label className="block text-sm">
              <span className="text-xs font-medium text-muted">Ange material</span>
              <input
                type="text"
                value={data.avloppMaterialAnnanText}
                onChange={(e) =>
                  onChange({
                    ...data,
                    avloppMaterialAnnanText: e.target.value,
                  })
                }
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </label>
          )}
        </fieldset>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {stambyteAvloppDelar.map((del) => (
            <label key={del.falt} className="block text-sm">
              <span className="text-xs font-medium text-foreground">
                {del.etikett}
              </span>
              <span className="mt-0.5 block text-xs text-muted">
                {del.beskrivning}
              </span>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  step={del.enhet === "st" ? 1 : 0.1}
                  value={data[del.falt]}
                  onChange={(e) =>
                    onChange({ ...data, [del.falt]: e.target.value })
                  }
                  placeholder={del.enhet}
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                />
                <span className="shrink-0 text-xs text-muted">{del.enhet}</span>
              </div>
            </label>
          ))}
        </div>
      </fieldset>

      {(() => {
        const mangdRader = summeraStambyteMangder(data);
        if (mangdRader.length === 0) return null;
        return (
          <ListaSummeringPanel
            titel="Summering mängder"
            rader={mangdRader}
          />
        );
      })()}

      <StambytePrisPanel data={data} onChange={onChange} />
    </div>
  );
}
