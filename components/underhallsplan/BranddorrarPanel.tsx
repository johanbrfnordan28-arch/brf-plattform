"use client";

import {
  branddorrRokinformationText,
  type BrandskyddBranddorrarData,
} from "@/components/underhallsplan/brandskydd";

type BranddorrarPanelProps = {
  data: BrandskyddBranddorrarData;
  onChange: (data: BrandskyddBranddorrarData) => void;
};

/** Branddörrar — minskar eld- och rökspridning mellan brandceller. */
export function BranddorrarPanel({ data, onChange }: BranddorrarPanelProps) {
  return (
    <div className="space-y-4">
      <p className="text-xs leading-relaxed text-muted">
        Branddörrar avgränsar brandceller och ska hållas stängda. De ingår i SBA-kontrollen
        och i underhållsplanen vid byte eller justering.
      </p>

      <div className="rounded-lg border border-amber-200/80 bg-amber-50/60 px-3 py-2.5 text-xs leading-relaxed text-amber-950">
        <span className="font-medium">Rökens spridning: </span>
        {branddorrRokinformationText}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-xs font-medium text-muted">Antal branddörrar</span>
          <input
            type="number"
            min={0}
            value={data.antalBranddorrar ?? ""}
            onChange={(event) =>
              onChange({ ...data, antalBranddorrar: event.target.value })
            }
            className="mt-1 w-full rounded-lg border border-border px-2.5 py-1.5 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="text-xs font-medium text-muted">
            Varav rökspärrade (SD/S200)
          </span>
          <input
            type="number"
            min={0}
            value={data.antalRoksparrade ?? ""}
            onChange={(event) =>
              onChange({ ...data, antalRoksparrade: event.target.value })
            }
            className="mt-1 w-full rounded-lg border border-border px-2.5 py-1.5 text-sm"
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="text-xs font-medium text-muted">Placering / kommentar</span>
          <input
            type="text"
            value={data.placeringAnteckning ?? ""}
            onChange={(event) =>
              onChange({ ...data, placeringAnteckning: event.target.value })
            }
            placeholder="T.ex. trapphus mot lägenheter, källargång, garage"
            className="mt-1 w-full rounded-lg border border-border px-2.5 py-1.5 text-sm"
          />
        </label>
      </div>
    </div>
  );
}
