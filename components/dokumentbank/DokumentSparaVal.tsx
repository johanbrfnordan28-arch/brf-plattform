"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  foreslagenMappForOmrade,
  lasProjektLista,
} from "@/components/dokumentbank/dokument-projekt-koppling";
import type { DokumentMallOmrade } from "@/components/dokumentbank/mallar";

export type DokumentSparaVal =
  | { typ: "bara-forening" }
  | { typ: "forening-och-projekt"; projektId: string; mappId: string };

type Props = {
  omrade?: string;
  value: DokumentSparaVal;
  onChange: (val: DokumentSparaVal) => void;
  /** Visas under rubriken, t.ex. vid skapa kopia eller uppladdning. */
  kompakt?: boolean;
};

export function dokumentSparaValArOk(val: DokumentSparaVal): boolean {
  if (val.typ === "bara-forening") return true;
  return Boolean(val.projektId && val.mappId);
}

export function DokumentSparaVal({
  omrade = "ovrig",
  value,
  onChange,
  kompakt = false,
}: Props) {
  const [projekt, setProjekt] = useState(lasProjektLista());

  useEffect(() => {
    setProjekt(lasProjektLista());
  }, []);

  const valtProjekt = useMemo(
    () =>
      value.typ === "forening-och-projekt"
        ? projekt.find((p) => p.id === value.projektId)
        : undefined,
    [projekt, value],
  );

  function foreslagenMappId(p: (typeof projekt)[number]): string {
    const foreslagen = foreslagenMappForOmrade(omrade as DokumentMallOmrade);
    const finns = p.mappDefinitioner.some((m) => m.id === foreslagen);
    return finns ? foreslagen : (p.mappDefinitioner[0]?.id ?? "");
  }

  const valgKlass = (aktiv: boolean) =>
    `flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${
      aktiv
        ? "border-primary bg-[#eef6f0] ring-1 ring-primary/25"
        : "border-border bg-white hover:border-primary/40"
    }`;

  return (
    <fieldset className={kompakt ? "space-y-2" : "space-y-3"}>
      <legend className="text-xs font-semibold text-foreground">
        Var ska dokumentet sparas?
      </legend>
      <label className={valgKlass(value.typ === "bara-forening")}>
        <input
          type="radio"
          name="spara-val"
          className="mt-0.5"
          checked={value.typ === "bara-forening"}
          onChange={() => onChange({ typ: "bara-forening" })}
        />
        <span>
          <span className="block text-sm font-medium text-foreground">
            Bara i föreningens dokument
          </span>
          <span className="mt-0.5 block text-xs text-muted">
            Återanvänd senare eller lägg till i projekt när det passar.
          </span>
        </span>
      </label>
      <label
        className={`${valgKlass(value.typ === "forening-och-projekt")} ${
          projekt.length === 0 ? "opacity-60" : ""
        }`}
      >
        <input
          type="radio"
          name="spara-val"
          className="mt-0.5"
          disabled={projekt.length === 0}
          checked={value.typ === "forening-och-projekt"}
          onChange={() => {
            const forsta = projekt[0];
            if (!forsta) return;
            onChange({
              typ: "forening-och-projekt",
              projektId: forsta.id,
              mappId: foreslagenMappId(forsta),
            });
          }}
        />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-foreground">
            Föreningens dokument och i projekt
          </span>
          <span className="mt-0.5 block text-xs text-muted">
            Sparas i banken och läggs direkt i vald projektundermapp.
          </span>
          {value.typ === "forening-och-projekt" && projekt.length > 0 && (
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <label className="block text-xs text-muted">
                Projekt
                <select
                  value={value.projektId}
                  onChange={(e) => {
                    const p = projekt.find((x) => x.id === e.target.value);
                    if (!p) return;
                    onChange({
                      typ: "forening-och-projekt",
                      projektId: p.id,
                      mappId: foreslagenMappId(p),
                    });
                  }}
                  className="mt-1 w-full rounded-lg border border-border bg-white px-2 py-1.5 text-sm text-foreground"
                >
                  {projekt.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.titel} ({p.ar})
                    </option>
                  ))}
                </select>
              </label>
              {valtProjekt && (
                <label className="block text-xs text-muted">
                  Undermapp
                  <select
                    value={value.mappId}
                    onChange={(e) =>
                      onChange({
                        typ: "forening-och-projekt",
                        projektId: value.projektId,
                        mappId: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-border bg-white px-2 py-1.5 text-sm text-foreground"
                  >
                    {valtProjekt.mappDefinitioner.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.titel}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>
          )}
        </span>
      </label>
      {projekt.length === 0 && (
        <p className="text-xs text-muted">
          Skapa ett projekt under{" "}
          <Link href="/forening/projekt" className="font-medium text-primary-dark underline">
            Projekt
          </Link>{" "}
          om ni vill spara direkt i både bank och projekt.
        </p>
      )}
    </fieldset>
  );
}
