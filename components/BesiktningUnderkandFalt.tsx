"use client";

import {
  BESIKTNING_INTERVALL_EXEMPEL,
  BESIKTNING_INTERVALL_RUBRIK,
  BESIKTNING_INTERVALL_TEXT,
} from "@/lib/besiktning-intervall";

type Props = {
  underkand: boolean;
  ordinarieAr: string;
  onUnderkand: (varde: boolean) => void;
  onOrdinarieAr: (varde: string) => void;
  inputKlass?: string;
};

/** Kryssruta för underkänd besiktning + ordinarie år, med förklaring av intervallet. */
export function BesiktningUnderkandFalt({
  underkand,
  ordinarieAr,
  onUnderkand,
  onOrdinarieAr,
  inputKlass = "mt-1 w-full max-w-[10rem] rounded-lg border border-border bg-white px-3 py-2 text-sm",
}: Props) {
  return (
    <div className="space-y-2 rounded-lg border border-border bg-[#f7f9f8] p-3">
      <label className="flex items-start gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          checked={underkand}
          onChange={(e) => onUnderkand(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-border text-primary"
        />
        <span>Besiktningen underkändes först och godkändes vid en ombesiktning</span>
      </label>
      {underkand ? (
        <label className="block text-sm">
          <span className="font-medium text-foreground">
            År då den ordinarie besiktningen skulle ha gjorts
          </span>
          <input
            type="number"
            inputMode="numeric"
            min={1900}
            max={2100}
            value={ordinarieAr}
            onChange={(e) => onOrdinarieAr(e.target.value)}
            placeholder="t.ex. 2020"
            className={inputKlass}
          />
        </label>
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
