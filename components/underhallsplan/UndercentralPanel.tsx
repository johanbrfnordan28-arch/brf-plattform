"use client";

import { useState } from "react";
import { ListaSummeringPanel } from "@/components/underhallsplan/ListaSummeringPanel";
import {
  normaliseraUndercentralData,
  summeraUndercentral,
  uppvarmningSystem,
  uppvarmningSystemEtikett,
  type UndercentralBild,
  type UndercentralData,
} from "@/components/underhallsplan/undercentral";

type UndercentralPanelProps = {
  data: UndercentralData;
  /** Antal undercentraler — samma fält som radens mängd. */
  antal: string;
  /** Valda värmesystem, samma lista som komponentens deltyper. */
  system?: string[];
  onChange: (data: UndercentralData) => void;
  onAntalChange: (antal: string) => void;
  onSystemChange: (system: string[]) => void;
};

function MeterFalt({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="text-xs font-medium text-muted">{label}</span>
      <span className="mt-0.5 block text-[11px] text-muted">{hint}</span>
      <div className="mt-1 flex items-center gap-2">
        <input
          type="number"
          min={0}
          step={0.1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="t.ex. 40"
          className="w-full max-w-xs rounded-lg border border-border bg-white px-3 py-2 text-sm"
        />
        <span className="text-xs text-muted">löpmeter</span>
      </div>
    </label>
  );
}

async function lasUndercentralBild(
  file: File,
): Promise<UndercentralBild | null> {
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
    return {
      id: `uc-bild-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      dataUrl,
      filnamn: file.name,
    };
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function UndercentralPanel({
  data,
  antal,
  system = [],
  onChange,
  onAntalChange,
  onSystemChange,
}: UndercentralPanelProps) {
  const d = normaliseraUndercentralData(data);
  const summering = summeraUndercentral(d);
  const [bildFel, setBildFel] = useState("");
  const valdaSystem = system.filter((id) =>
    uppvarmningSystem.some((s) => s.id === id),
  );

  function toggleSystem(id: string) {
    onSystemChange(
      system.includes(id) ? system.filter((s) => s !== id) : [...system, id],
    );
  }

  const systemRader =
    valdaSystem.length > 0
      ? [
          {
            etikett: "Värmesystem",
            varde: valdaSystem
              .map((id) => uppvarmningSystemEtikett(id, d.systemAnnat))
              .join(", "),
          },
        ]
      : [];
  const bildRad =
    d.bilder.length > 0
      ? [
          {
            etikett: "Bilder",
            varde: d.bilder.length === 1 ? "1 st" : `${d.bilder.length} st`,
          },
        ]
      : [];

  return (
    <div className="space-y-4">
      <p className="text-xs leading-relaxed text-muted">
        Undercentralen ligger vanligtvis i källaren. Ange hur många som finns
        och vilket värmesystem huset har. Flera system kan väljas. Stamventiler
        läggs inte in här — de registreras bara under Stamventiler.
      </p>

      <div className="grid gap-4 lg:grid-cols-[16rem_1fr]">
        <label className="block text-sm">
          <span className="text-xs font-medium text-muted">
            Antal undercentraler
          </span>
          <input
            type="number"
            min={0}
            step={1}
            value={antal}
            onChange={(e) => onAntalChange(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
          />
        </label>

        <fieldset>
          <legend className="text-xs font-medium text-muted">
            Värmesystem
          </legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {uppvarmningSystem.map((alt) => (
              <label
                key={alt.id}
                className="flex cursor-pointer items-start gap-2 rounded-lg border border-border bg-white px-3 py-2 text-sm has-[:checked]:border-primary has-[:checked]:bg-[#eef6f0]/50"
              >
                <input
                  type="checkbox"
                  checked={system.includes(alt.id)}
                  onChange={() => toggleSystem(alt.id)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-primary"
                />
                <span>
                  <span className="font-medium text-foreground">{alt.etikett}</span>
                  <span className="mt-0.5 block text-xs text-muted">
                    {alt.beskrivning}
                  </span>
                </span>
              </label>
            ))}
          </div>
          {system.includes("annat") && (
            <label className="mt-2 block text-sm">
              <span className="text-xs font-medium text-muted">
                Beskriv systemet
              </span>
              <input
                type="text"
                value={d.systemAnnat}
                onChange={(e) => onChange({ ...d, systemAnnat: e.target.value })}
                placeholder="t.ex. närvärme"
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
              />
            </label>
          )}
        </fieldset>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <MeterFalt
          label="Horisontell tillopp"
          hint="Ledningen som går ut från undercentralen i källaren."
          value={d.tilloppLopmeter}
          onChange={(tilloppLopmeter) => onChange({ ...d, tilloppLopmeter })}
        />
        <MeterFalt
          label="Horisontell retur"
          hint="Returledningen tillbaka till undercentralen i källaren."
          value={d.returLopmeter}
          onChange={(returLopmeter) => onChange({ ...d, returLopmeter })}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm">
          <span className="text-xs font-medium text-muted">
            Bilder på undercentral och system
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              const filer = [...(e.target.files ?? [])];
              e.target.value = "";
              if (filer.length === 0) return;
              void Promise.all(filer.map((fil) => lasUndercentralBild(fil))).then(
                (resultat) => {
                  const nya = resultat.filter((bild) => bild !== null);
                  if (d.bilder.length + nya.length > 8) {
                    setBildFel("Högst 8 bilder kan sparas.");
                  } else if (nya.length < filer.length) {
                    setBildFel(
                      "Någon bild kunde inte läsas. Välj en mindre bild.",
                    );
                  } else {
                    setBildFel("");
                  }
                  if (nya.length === 0) return;
                  onChange({ ...d, bilder: [...d.bilder, ...nya].slice(0, 8) });
                },
              );
            }}
            className="mt-1 block w-full text-sm"
          />
        </label>
        {bildFel && <p className="text-xs text-red-700">{bildFel}</p>}
        {d.bilder.length > 0 && (
          <ul className="grid gap-3 sm:grid-cols-2">
            {d.bilder.map((bild) => (
              <li
                key={bild.id}
                className="rounded-lg border border-border bg-white p-2"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={bild.dataUrl}
                  alt={bild.filnamn || "Undercentral"}
                  className="max-h-40 w-full rounded object-contain"
                />
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      ...d,
                      bilder: d.bilder.filter((b) => b.id !== bild.id),
                    })
                  }
                  className="mt-2 text-xs text-muted underline"
                >
                  Ta bort bild
                  {bild.filnamn ? ` (${bild.filnamn})` : ""}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {(summering.length > 0 || systemRader.length > 0 || bildRad.length > 0) && (
        <ListaSummeringPanel
          titel="Undercentral"
          rader={[...systemRader, ...summering, ...bildRad]}
        />
      )}
    </div>
  );
}
