"use client";

import { ListaSummeringPanel } from "@/components/underhallsplan/ListaSummeringPanel";
import { MedlemstakterrassPrisPanel } from "@/components/underhallsplan/MedlemstakterrassPrisPanel";
import { summeraMedlemstakterrassMangder } from "@/components/underhallsplan/medlemstakterrass-pris";
import {
  skapaTomMedlemstakterrassData,
  takterrassGolvMaterial,
  takterrassTatskiktFlytande,
  takterrassTatskiktIntro,
  takterrassTatskiktOvrigt,
  takterrassTatskiktPappTjara,
  takterrassVaggMaterial,
  type MedlemstakterrassData,
} from "@/components/underhallsplan/medlemstakterrass";
import type {
  TakterrassGolvMaterialId,
  TakterrassTatskiktId,
  TakterrassVaggMaterialId,
} from "@/components/underhallsplan/takterrass";

type MedlemstakterrassPanelProps = {
  data: MedlemstakterrassData;
  onChange: (data: MedlemstakterrassData) => void;
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

export function MedlemstakterrassPanel({
  data,
  onChange,
}: MedlemstakterrassPanelProps) {
  const d = data ?? skapaTomMedlemstakterrassData();

  function patch(p: Partial<MedlemstakterrassData>) {
    onChange({ ...d, ...p });
  }

  return (
    <div className="space-y-4">
      <p className="text-xs leading-relaxed text-muted">
        Medlemstakterrass — tillhör lägenhet, inte gemensamma ytor. Samma delar som
        gemensam terrass men utan belysning och elkontakter.
      </p>

      <MaterialVal
        legend="Väggar / uppkragningar"
        name="medlemstakterrass-vagg"
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
          Golvsockel (klinker)
        </legend>
        <MattFalt
          label="Sockellängd"
          enhet="löpmeter"
          value={d.golvsockelLopmeter}
          onChange={(golvsockelLopmeter) => patch({ golvsockelLopmeter })}
        />
      </fieldset>

      <MaterialVal
        legend="Golv"
        name="medlemstakterrass-golv"
        alternativ={takterrassGolvMaterial}
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
        placeholder="t.ex. 8"
      />
      <p className="text-xs text-muted">
        Medlemstakterrass är ofta mindre — ofta cirka 5–15 m² per lägenhet.
      </p>

      <div className="space-y-3 rounded-lg border border-[#e2f0e6] bg-[#eef6f0]/40 p-3">
        <p className="text-xs font-semibold text-primary-dark">
          Tätätskikt utomhus
        </p>
        <p className="text-xs leading-relaxed text-muted">
          {takterrassTatskiktIntro}
        </p>

        <MaterialVal
          legend="Flytande tätskikt"
          name="medlemstakterrass-tatskikt-flyt"
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
          legend="Papp, tjära och rullade mattor"
          name="medlemstakterrass-tatskikt-papp"
          alternativ={takterrassTatskiktPappTjara}
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
          name="medlemstakterrass-tatskikt-ovr"
          alternativ={[takterrassTatskiktOvrigt]}
          value={d.tatskiktMaterial}
          annanText={d.tatskiktAnnanText}
          egetValId="ovrigt"
          onMaterialChange={(id) =>
            patch({ tatskiktMaterial: id as TakterrassTatskiktId })
          }
          onAnnanChange={(tatskiktAnnanText) => patch({ tatskiktAnnanText })}
        />
      </div>
      <MattFalt
        label="Tätätskiktsyta"
        enhet="m²"
        value={d.tatskiktKvm}
        onChange={(tatskiktKvm) => patch({ tatskiktKvm })}
        placeholder="t.ex. 8"
      />

      <fieldset className="rounded-lg border border-border bg-white p-3">
        <legend className="px-1 text-xs font-semibold text-primary-dark">
          Golvvärme
        </legend>
        <MattFalt
          label="Uppvärmd yta"
          enhet="m²"
          value={d.golvarmeKvm}
          onChange={(golvarmeKvm) => patch({ golvarmeKvm })}
          placeholder="t.ex. 8"
        />
        <p className="mt-2 text-xs text-muted">
          Lämna tomt om terrassen saknar golvvärme.
        </p>
      </fieldset>

      <fieldset className="rounded-lg border border-border bg-white p-3">
        <legend className="px-1 text-xs font-semibold text-primary-dark">
          Avvattning
        </legend>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <MattFalt
            label="Golvbrunnar"
            enhet="st"
            value={d.golvbrunnAntal}
            onChange={(golvbrunnAntal) => patch({ golvbrunnAntal })}
            step={1}
            placeholder="t.ex. 1"
          />
          <MattFalt
            label="Breddavlopp"
            enhet="st"
            value={d.breddavloppAntal}
            onChange={(breddavloppAntal) => patch({ breddavloppAntal })}
            step={1}
            placeholder="t.ex. 1"
          />
        </div>
      </fieldset>

      {(() => {
        const mangdRader = summeraMedlemstakterrassMangder(d);
        if (mangdRader.length === 0) return null;
        return (
          <ListaSummeringPanel
            titel="Summering mängder"
            rader={mangdRader}
          />
        );
      })()}

      <MedlemstakterrassPrisPanel data={d} onChange={onChange} />
    </div>
  );
}
