"use client";

import { useId } from "react";
import {
  BESIKTNING_INTERVALL_EXEMPEL,
  BESIKTNING_INTERVALL_RUBRIK,
  BESIKTNING_INTERVALL_TEXT,
  besiktningHarResultat,
  besiktningResultatTexter,
  OVK_ANMARKNING_RUBRIK,
  OVK_ANMARKNING_TEXT,
  type BesiktningResultatVarden,
  type BesiktningTyp,
  type OvkAnmarkningar,
} from "@/lib/besiktning-intervall";

const inputKlass =
  "mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm";

type Props = {
  typ: BesiktningTyp;
  varden: BesiktningResultatVarden;
  onChange: (varden: BesiktningResultatVarden) => void;
};

/** Godkänd/ej godkänd, ombesiktning och (för OVK) antal anmärkningar per utfall. */
export function BesiktningResultatFalt({ typ, varden, onChange }: Props) {
  const gruppNamn = useId();
  if (!besiktningHarResultat(typ)) return null;
  const t = besiktningResultatTexter(typ);
  const anm = varden.anmarkningar ?? {};
  const utfall2 = anm.utfall2 ?? 0;

  function satt(patch: Partial<BesiktningResultatVarden>) {
    onChange({ ...varden, ...patch });
  }

  function sattAnmarkning(nyckel: keyof OvkAnmarkningar, text: string) {
    const n = Number.parseInt(text, 10);
    const nya = { ...anm, [nyckel]: Number.isInteger(n) && n >= 0 ? n : undefined };
    const patch: Partial<BesiktningResultatVarden> = { anmarkningar: nya };
    if (nyckel === "utfall2" && (nya.utfall2 ?? 0) > 0 && !varden.resultat) {
      patch.resultat = "ej_godkand";
    }
    satt(patch);
  }

  return (
    <div className="space-y-3 rounded-lg border border-border bg-[#f7f9f8] p-3">
      {typ === "ovk" ? (
        <div>
          <p className="text-sm font-medium text-foreground">Antal anmärkningar i protokollet</p>
          <div className="mt-1 grid grid-cols-3 gap-2">
            {(
              [
                ["utfall0", "Utfall 0 (info)"],
                ["utfall1", "Utfall 1"],
                ["utfall2", "Utfall 2"],
              ] as const
            ).map(([nyckel, etikett]) => (
              <label key={nyckel} className="block text-xs font-medium text-muted">
                {etikett}
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={anm[nyckel] ?? ""}
                  onChange={(e) => sattAnmarkning(nyckel, e.target.value)}
                  placeholder="0"
                  className={inputKlass}
                />
              </label>
            ))}
          </div>
          {(anm.utfall1 ?? 0) > 0 ? (
            <p className="mt-1 text-xs text-amber-900">
              {anm.utfall1} anmärkning{anm.utfall1 === 1 ? "" : "ar"} med utfall 1 ska
              åtgärdas före nästa ordinarie OVK.
            </p>
          ) : null}
          {utfall2 > 0 ? (
            <p className="mt-1 text-xs text-red-800">
              {utfall2} anmärkning{utfall2 === 1 ? "" : "ar"} med utfall 2 ska åtgärdas
              snarast och kräver ombesiktning.
            </p>
          ) : null}
          <details className="mt-1 text-xs leading-relaxed text-muted">
            <summary className="cursor-pointer font-medium text-primary-dark">
              {OVK_ANMARKNING_RUBRIK}
            </summary>
            <ul className="mt-1 list-disc space-y-0.5 pl-4">
              {OVK_ANMARKNING_TEXT.map((rad) => (
                <li key={rad}>{rad}</li>
              ))}
            </ul>
          </details>
        </div>
      ) : null}

      <fieldset>
        <legend className="text-sm font-medium text-foreground">Resultat</legend>
        <div className="mt-1 space-y-1">
          {(
            [
              ["godkand", t.godkand],
              ["ej_godkand", t.ejGodkand],
            ] as const
          ).map(([varde, etikett]) => (
            <label key={varde} className="flex items-start gap-2 text-sm text-foreground">
              <input
                type="radio"
                name={gruppNamn}
                checked={varden.resultat === varde}
                onChange={() =>
                  satt(
                    varde === "godkand"
                      ? { resultat: varde, ombesiktningSenast: undefined, ombesiktningGodkand: undefined }
                      : { resultat: varde },
                  )
                }
                className="mt-0.5"
              />
              {etikett}
            </label>
          ))}
        </div>
        {typ === "ovk" && utfall2 > 0 && varden.resultat === "godkand" ? (
          <p className="mt-1 text-xs text-amber-900">
            Anmärkningar med utfall 2 innebär normalt att OVK:n inte blir godkänd. Kontrollera
            protokollet.
          </p>
        ) : null}
      </fieldset>

      {varden.resultat === "ej_godkand" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="font-medium text-foreground">{t.senast}</span>
            <input
              type="date"
              value={varden.ombesiktningSenast ?? ""}
              onChange={(e) => satt({ ombesiktningSenast: e.target.value || undefined })}
              className={inputKlass}
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-foreground">{t.klar}</span>
            <input
              type="date"
              value={varden.ombesiktningGodkand ?? ""}
              onChange={(e) => satt({ ombesiktningGodkand: e.target.value || undefined })}
              className={inputKlass}
            />
          </label>
        </div>
      ) : null}

      <BesiktningIntervallInfo />
    </div>
  );
}

export function BesiktningIntervallInfo() {
  return (
    <details className="text-xs leading-relaxed text-muted">
      <summary className="cursor-pointer font-medium text-primary-dark">
        {BESIKTNING_INTERVALL_RUBRIK} – så räknas nästa besiktning
      </summary>
      <p className="mt-1">{BESIKTNING_INTERVALL_TEXT}</p>
      <p className="mt-1">{BESIKTNING_INTERVALL_EXEMPEL}</p>
    </details>
  );
}
