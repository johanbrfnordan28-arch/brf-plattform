"use client";

import { ListaSummeringPanel } from "@/components/underhallsplan/ListaSummeringPanel";
import { StambytePrisPanel } from "@/components/underhallsplan/StambytePrisPanel";
import {
  avloppMaterialAlternativ,
  stambyteAvloppDelar,
  stambyteSanitetDelar,
  stambyteTappvattenAntalDelar,
  stambyteVattenSektioner,
  summeraStambyteMangder,
  vattenMaterialAlternativ,
  type AvloppMaterialId,
  type VattenMaterialId,
  type VvsStambyteData,
} from "@/components/underhallsplan/vvs-stambyte";

type StambytePanelProps = {
  data: VvsStambyteData;
  onChange: (data: VvsStambyteData) => void;
};

export function StambytePanel({ data, onChange }: StambytePanelProps) {
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
        Planera stambyte per badrum: ytor, sanitetsdelar samt tappvatten och
        avloppsledningar anges och prissätts separat.
      </p>

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
