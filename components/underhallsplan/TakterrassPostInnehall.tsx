"use client";

import {
  golvbrunnKopplingAlternativ,
  takterrassAvloppMinstTvaInfo,
  takterrassAvloppSnöIsInfo,
  takterrassBreddavloppBeskrivning,
  takterrassGolvbrunnBeskrivning,
  takterrassHarTillrackligtAvlopp,
} from "@/components/underhallsplan/takterrass-avlopp";
import {
  skapaTomTakterrassData,
  takterrassGolvBekladningAlternativ,
  takterrassGolvMaterial,
  takterrassTatskiktFlytande,
  takterrassTatskiktIntro,
  takterrassTatskiktOvrigt,
  takterrassTatskiktPappTjara,
  takterrassVaggMaterial,
  type TakterrassData,
  type TakterrassGolvBekladningId,
  type TakterrassGolvMaterialId,
  type TakterrassTatskiktId,
  type TakterrassVaggMaterialId,
} from "@/components/underhallsplan/takterrass";
import type { GolvbrunnKopplingId } from "@/components/underhallsplan/takterrass-avlopp";
import type { MedlemstakterrassData } from "@/components/underhallsplan/medlemstakterrass";

export type TakterrassPostVariant = "gemensam" | "medlem";

type TerrassInnehallData = TakterrassData | MedlemstakterrassData;

type Props = {
  data: TerrassInnehallData;
  onChange: (data: TerrassInnehallData) => void;
  variant: TakterrassPostVariant;
};

function MaterialVal({
  legend,
  name,
  alternativ,
  value,
  annanText,
  onMaterialChange,
  onAnnanChange,
  egetValId = "annat",
}: {
  legend: string;
  name: string;
  alternativ: { id: string; etikett: string; beskrivning?: string }[];
  value: string;
  annanText: string;
  onMaterialChange: (id: string) => void;
  onAnnanChange: (text: string) => void;
  egetValId?: string;
}) {
  const visaAnnat = value === egetValId;
  return (
    <fieldset className="rounded-lg border border-[#e2f0e6] bg-[#eef6f0]/40 p-3">
      {legend.trim() ? (
        <legend className="px-1 text-xs font-semibold text-primary-dark">
          {legend}
        </legend>
      ) : null}
      <div className="mt-2 space-y-2">
        {alternativ.map((alt) => (
          <label
            key={alt.id}
            className="flex cursor-pointer gap-2 rounded-lg border border-border bg-white px-3 py-2 text-sm"
          >
            <input
              type="radio"
              name={name}
              checked={value === alt.id}
              onChange={() => onMaterialChange(alt.id)}
              className="mt-0.5 h-4 w-4 shrink-0 border-border text-primary"
            />
            <span>
              <span className="font-medium">{alt.etikett}</span>
              {alt.beskrivning && (
                <span className="mt-0.5 block text-xs text-muted">
                  {alt.beskrivning}
                </span>
              )}
            </span>
          </label>
        ))}
      </div>
      {visaAnnat && (
        <label className="mt-2 block text-sm">
          <span className="text-xs font-medium text-muted">Beskriv material</span>
          <input
            type="text"
            value={annanText}
            onChange={(e) => onAnnanChange(e.target.value)}
            placeholder="Beskriv väggmaterial"
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
          />
        </label>
      )}
    </fieldset>
  );
}

function MattFalt({
  label,
  enhet,
  value,
  onChange,
  step = 0.1,
  placeholder,
}: {
  label: string;
  enhet: string;
  value: string;
  onChange: (v: string) => void;
  step?: number;
  placeholder?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="text-xs font-medium text-muted">{label}</span>
      <div className="mt-1 flex items-center gap-2">
        <input
          type="number"
          min={0}
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full max-w-xs rounded-lg border border-border bg-white px-3 py-2 text-sm"
        />
        <span className="text-xs text-muted">{enhet}</span>
      </div>
    </label>
  );
}

export function TakterrassPostInnehall({ data, onChange, variant }: Props) {
  const d = data ?? skapaTomTakterrassData();

  function patch(p: Partial<TerrassInnehallData>) {
    onChange({ ...d, ...p });
  }

  const visaKeramik = d.golvBekladning === "keramik";
  const tillrackligtAvlopp = takterrassHarTillrackligtAvlopp(d);

  return (
    <div className="space-y-4">
      <MaterialVal
        legend="Golvbeklädnad"
        name={`${variant}-golv-bekladning`}
        alternativ={takterrassGolvBekladningAlternativ}
        value={d.golvBekladning}
        annanText=""
        egetValId="__none__"
        onMaterialChange={(id) => {
          const golvBekladning = id as TakterrassGolvBekladningId;
          if (golvBekladning === "papp") {
            patch({
              golvBekladning,
              golvMaterial: "annat",
              tatskiktMaterial: "tjarpapp",
            });
          } else {
            patch({
              golvBekladning,
              golvMaterial: "klinker",
            });
          }
        }}
        onAnnanChange={() => {}}
      />

      <MaterialVal
        legend="Väggar / uppkragningar"
        name={`${variant}-takterrass-vagg`}
        alternativ={takterrassVaggMaterial}
        value={d.vaggarMaterial}
        annanText={d.vaggarAnnanText}
        egetValId="eget"
        onMaterialChange={(id) =>
          patch({ vaggarMaterial: id as TakterrassVaggMaterialId })
        }
        onAnnanChange={(vaggarAnnanText) => patch({ vaggarAnnanText })}
      />
      <MattFalt
        label="Vägglängd (valfritt)"
        enhet="löpmeter"
        value={d.vaggarLopmeter}
        onChange={(vaggarLopmeter) => patch({ vaggarLopmeter })}
      />

      <fieldset className="rounded-lg border border-border bg-white p-3">
        <legend className="px-1 text-xs font-semibold text-primary-dark">
          Golvsockel
        </legend>
        <p className="text-[11px] text-muted">
          Sockel i keramik/klinker — anges i löpmeter.
        </p>
        <MattFalt
          label="Sockellängd"
          enhet="löpmeter"
          value={d.golvsockelLopmeter}
          onChange={(golvsockelLopmeter) => patch({ golvsockelLopmeter })}
        />
      </fieldset>

      {visaKeramik ? (
        <>
          <MaterialVal
            legend="Keramik / plattor"
            name={`${variant}-takterrass-golv`}
            alternativ={takterrassGolvMaterial.filter((m) => m.id !== "annat")}
            value={d.golvMaterial}
            annanText={d.golvAnnanText}
            onMaterialChange={(id) =>
              patch({ golvMaterial: id as TakterrassGolvMaterialId })
            }
            onAnnanChange={(golvAnnanText) => patch({ golvAnnanText })}
          />
          <MattFalt
            label="Golvyta"
            enhet="m²"
            value={d.golvKvm}
            onChange={(golvKvm) => patch({ golvKvm })}
            placeholder="t.ex. 20"
          />

          <div className="space-y-3 rounded-lg border border-[#e2f0e6] bg-[#eef6f0]/40 p-3">
            <p className="text-xs font-semibold text-primary-dark">
              Tätätskikt under keramik (utomhus)
            </p>
            <p className="text-xs leading-relaxed text-muted">
              {takterrassTatskiktIntro} Produkterna ska vara avsedda för
              utomhusbruk och stående vatten.
            </p>
            <MaterialVal
              legend="Flytande tätskikt"
              name={`${variant}-tatskikt-flyt`}
              alternativ={takterrassTatskiktFlytande}
              value={d.tatskiktMaterial}
              annanText={d.tatskiktAnnanText}
              egetValId="__none__"
              onMaterialChange={(id) =>
                patch({ tatskiktMaterial: id as TakterrassTatskiktId })
              }
              onAnnanChange={() => {}}
            />
            <MaterialVal
              legend=""
              name={`${variant}-tatskikt-ovr`}
              alternativ={[takterrassTatskiktOvrigt]}
              value={d.tatskiktMaterial}
              annanText={d.tatskiktAnnanText}
              egetValId="ovrigt"
              onMaterialChange={(id) =>
                patch({ tatskiktMaterial: id as TakterrassTatskiktId })
              }
              onAnnanChange={(tatskiktAnnanText) =>
                patch({ tatskiktAnnanText })
              }
            />
            <MattFalt
              label="Tätätskiktsyta"
              enhet="m²"
              value={d.tatskiktKvm}
              onChange={(tatskiktKvm) => patch({ tatskiktKvm })}
            />
          </div>
        </>
      ) : (
        <div className="space-y-3 rounded-lg border border-[#e2f0e6] bg-[#eef6f0]/40 p-3">
          <p className="text-xs font-semibold text-primary-dark">
            Papp som beläggning och tätskikt
          </p>
          <p className="text-xs text-muted">
            Pappen är tätskikt i sig — välj typ av utomhuspapp eller tjärpapp.
          </p>
          <MaterialVal
            legend="Papp / tjärpapp"
            name={`${variant}-tatskikt-papp`}
            alternativ={takterrassTatskiktPappTjara}
            value={d.tatskiktMaterial}
            annanText={d.tatskiktAnnanText}
            egetValId="__none__"
            onMaterialChange={(id) =>
              patch({ tatskiktMaterial: id as TakterrassTatskiktId })
            }
            onAnnanChange={() => {}}
          />
          <MattFalt
            label="Yta"
            enhet="m²"
            value={d.golvKvm || d.tatskiktKvm}
            onChange={(kvm) => patch({ golvKvm: kvm, tatskiktKvm: kvm })}
          />
        </div>
      )}

      {variant === "gemensam" && "belysningAntal" in d && (
        <>
          <fieldset className="rounded-lg border border-border bg-white p-3">
            <legend className="px-1 text-xs font-semibold text-primary-dark">
              Belysning och el
            </legend>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <MattFalt
                label="Belysning"
                enhet="st"
                value={d.belysningAntal}
                onChange={(belysningAntal) => patch({ belysningAntal })}
                step={1}
              />
              <MattFalt
                label="Elkontakter"
                enhet="st"
                value={d.elkontaktAntal}
                onChange={(elkontaktAntal) => patch({ elkontaktAntal })}
                step={1}
              />
            </div>
          </fieldset>
          <fieldset className="rounded-lg border border-border bg-white p-3">
            <legend className="px-1 text-xs font-semibold text-primary-dark">
              Golvvärme
            </legend>
            <MattFalt
              label="Uppvärmd yta"
              enhet="m²"
              value={d.golvarmeKvm}
              onChange={(golvarmeKvm) => patch({ golvarmeKvm })}
            />
          </fieldset>
        </>
      )}

      {variant === "medlem" && (
        <fieldset className="rounded-lg border border-border bg-white p-3">
          <legend className="px-1 text-xs font-semibold text-primary-dark">
            Golvvärme
          </legend>
          <MattFalt
            label="Uppvärmd yta"
            enhet="m²"
            value={d.golvarmeKvm}
            onChange={(golvarmeKvm) => patch({ golvarmeKvm })}
          />
        </fieldset>
      )}

      <fieldset className="rounded-lg border border-border bg-white p-3">
        <legend className="px-1 text-xs font-semibold text-primary-dark">
          Vattenavrinning
        </legend>
        <p className="mt-1 text-xs text-muted">{takterrassAvloppMinstTvaInfo}</p>
        <p className="mt-2 text-xs text-muted">{takterrassAvloppSnöIsInfo}</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <MattFalt
              label="Golvbrunnar"
              enhet="st"
              value={d.golvbrunnAntal}
              onChange={(golvbrunnAntal) => patch({ golvbrunnAntal })}
              step={1}
              placeholder="t.ex. 1"
            />
            <p className="mt-1 text-[10px] text-muted">
              {takterrassGolvbrunnBeskrivning}
            </p>
            <label className="mt-2 block text-sm">
              <span className="text-xs font-medium text-muted">
                Golvbrunn leder till
              </span>
              <select
                value={d.golvbrunnKoppling}
                onChange={(e) =>
                  patch({
                    golvbrunnKoppling: e.target.value as GolvbrunnKopplingId,
                  })
                }
                className="mt-1 w-full max-w-xs rounded-lg border border-border bg-white px-3 py-2 text-sm"
              >
                {golvbrunnKopplingAlternativ.map((a) => (
                  <option key={a.id || "tom"} value={a.id}>
                    {a.etikett}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div>
            <MattFalt
              label="Breddavlopp"
              enhet="st"
              value={d.breddavloppAntal}
              onChange={(breddavloppAntal) => patch({ breddavloppAntal })}
              step={1}
              placeholder="t.ex. 1"
            />
            <p className="mt-1 text-[10px] text-muted">
              {takterrassBreddavloppBeskrivning}
            </p>
          </div>
        </div>
        {!tillrackligtAvlopp &&
        (d.golvbrunnAntal.trim() || d.breddavloppAntal.trim()) ? (
          <p className="mt-2 rounded border border-amber-300 bg-amber-50 px-2 py-1.5 text-xs text-amber-950">
            Du har angivit färre än två avlopp — överväg att lägga till golvbrunn
            eller breddavlopp.
          </p>
        ) : null}
      </fieldset>
    </div>
  );
}
