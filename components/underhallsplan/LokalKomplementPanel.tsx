"use client";

import { ForradValPanel } from "@/components/underhallsplan/ForradValPanel";
import { LokalInventarPanel } from "@/components/underhallsplan/LokalInventarPanel";
import { LokalYtskiktPanel } from "@/components/underhallsplan/LokalYtskiktPanel";
import type { ForradMaterialId } from "@/components/underhallsplan/komponentregister";
import type { LokalInventarRad } from "@/components/underhallsplan/lokal-inventar";
import type { LokalTypId } from "@/components/underhallsplan/lokal-inventar";
import type { LokalYtskiktDelRad } from "@/components/underhallsplan/lokal-ytskikt";
import type { Måttenhet } from "@/components/underhallsplan/komponentregister";

type LokalKomplementPanelProps = {
  titel: string;
  antalRum: string;
  onAntalRumChange: (antal: string) => void;
  ytskiktRader: LokalYtskiktDelRad[];
  onYtskiktChange: (rader: LokalYtskiktDelRad[]) => void;
  /** Soprum / cykelrum — övriga inventariedelar. */
  inventarTyp?: LokalTypId;
  inventarRader?: LokalInventarRad[];
  onInventarChange?: (rader: LokalInventarRad[]) => void;
  /** Förråd — galler eller trä. */
  visaForradPartition?: boolean;
  forradMaterial?: ForradMaterialId;
  forradMåttenhet?: Måttenhet;
  forradVärde?: string;
  forradAntalDorrar?: string;
  onForradChange?: (patch: {
    forradMaterial?: ForradMaterialId;
    måttenhet?: Måttenhet;
    värde?: string;
    forradAntalDorrar?: string;
  }) => void;
};

export function LokalKomplementPanel({
  titel,
  antalRum,
  onAntalRumChange,
  ytskiktRader,
  onYtskiktChange,
  inventarTyp,
  inventarRader,
  onInventarChange,
  visaForradPartition,
  forradMaterial,
  forradMåttenhet = "antal",
  forradVärde = "",
  forradAntalDorrar = "",
  onForradChange,
}: LokalKomplementPanelProps) {
  return (
    <div className="space-y-6">
      <p className="rounded-lg border border-primary/20 bg-[#eef6f0]/60 px-3 py-2 text-xs leading-relaxed text-muted">
        <strong className="font-medium text-foreground">{titel}</strong> i
        komponentregistret. Registrera byggnadens väggar, golv och tak nedan —
        samt inventarier. Oisolerade komplementbyggnader med plåttak och
        träväggar fylls i här (inte under Tak/Fasad för bostadshusen).
      </p>
      <LokalYtskiktPanel rader={ytskiktRader} onChange={onYtskiktChange} />

      {visaForradPartition && onForradChange && forradMaterial != null && (
        <div className="rounded-xl border border-border bg-white p-4">
          <p className="text-sm font-semibold text-foreground">Förrådssystem</p>
          <p className="mt-1 text-xs text-muted">
            Gallerpartier eller träväggar mellan förråd — utöver ytskikt ovan.
          </p>
          <div className="mt-4">
            <ForradValPanel
              material={forradMaterial}
              måttenhet={forradMåttenhet === "löpmeter" ? "löpmeter" : "antal"}
              värde={forradVärde}
              antalDorrar={forradAntalDorrar}
              onMaterialChange={(forradMaterial) =>
                onForradChange({ forradMaterial })
              }
              onMåttChange={(patch) => onForradChange(patch)}
            />
          </div>
        </div>
      )}

      {inventarTyp && inventarRader && onInventarChange && (
        <div className="rounded-xl border border-border bg-white p-4">
          <LokalInventarPanel
            typ={inventarTyp}
            titel={titel}
            antalRum={antalRum}
            rader={inventarRader}
            onAntalRumChange={onAntalRumChange}
            onChange={onInventarChange}
          />
        </div>
      )}

      {!inventarTyp && (
        <label className="block max-w-xs text-sm">
          <span className="text-xs font-medium text-muted">Antal rum (st)</span>
          <input
            type="number"
            min={0}
            step={1}
            value={antalRum}
            onChange={(e) => onAntalRumChange(e.target.value)}
            placeholder="t.ex. 1"
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
          />
        </label>
      )}
    </div>
  );
}
