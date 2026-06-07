"use client";

import type {
  UnderhallBesiktningStatus,
  UnderkomponentRad,
} from "@/components/underhallsplan/komponentregister";

type UnderhallUtförtFaltProps = {
  rad: UnderkomponentRad;
  onChange: (patch: Partial<UnderkomponentRad>) => void;
  /** I steg 3 visas utfört år som läsning från historik. */
  readOnlyUtfört?: boolean;
};

export function UnderhallUtförtFalt({
  rad,
  onChange,
  readOnlyUtfört = false,
}: UnderhallUtförtFaltProps) {
  const garantiAr = rad.underhallGarantiAr?.trim() || "2";
  const ansvarAr = rad.underhallAnsvarAr?.trim() || "10";

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-white p-3">
        <p className="text-xs font-semibold text-foreground">
          Senast utfört arbete
        </p>
        <p className="mt-0.5 text-xs text-muted">
          {readOnlyUtfört && rad.underhallFranHistorik
            ? "Fylls i i steg 2 (utförda arbeten) och förs över vid sparning."
            : "År och entreprenör för senaste åtgärd på denna del."}
        </p>
        {readOnlyUtfört && rad.underhallUtförtAr?.trim() ? (
          <p className="mt-3 text-sm text-foreground">
            <span className="font-medium">{rad.underhallUtförtAr}</span>
            {rad.underhallEntreprenor?.trim()
              ? ` · ${rad.underhallEntreprenor.trim()}`
              : ""}
            {rad.underhallHistorikTitel
              ? ` (${rad.underhallHistorikTitel})`
              : ""}
          </p>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="text-xs font-medium text-muted">År utfört</span>
              <input
                type="number"
                min={1900}
                max={2100}
                value={rad.underhallUtförtAr ?? ""}
                onChange={(e) => onChange({ underhallUtförtAr: e.target.value })}
                placeholder="t.ex. 2018"
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="text-xs font-medium text-muted">Entreprenör</span>
              <input
                value={rad.underhallEntreprenor ?? ""}
                onChange={(e) => onChange({ underhallEntreprenor: e.target.value })}
                placeholder="Företagsnamn"
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
              />
            </label>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-border bg-white p-3">
        <p className="text-xs font-semibold text-foreground">Garanti och ansvar</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-xs font-medium text-muted">Garantitid (år)</span>
            <input
              type="number"
              min={0}
              max={30}
              value={garantiAr}
              onChange={(e) => onChange({ underhallGarantiAr: e.target.value })}
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
            />
            <span className="mt-1 block text-xs text-muted">Vanligt 2 år.</span>
          </label>
          <label className="block text-sm">
            <span className="text-xs font-medium text-muted">Ansvarstid (år)</span>
            <input
              type="number"
              min={0}
              max={50}
              value={ansvarAr}
              onChange={(e) => onChange({ underhallAnsvarAr: e.target.value })}
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
            />
            <span className="mt-1 block text-xs text-muted">Vanligt 10 år.</span>
          </label>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-white p-3">
        <p className="text-xs font-semibold text-foreground">Besiktning efter åtgärd</p>
        <p className="mt-0.5 text-xs text-muted">
          Om formell besiktning saknas kan styrelsens syn noteras i stället.
        </p>
        <fieldset className="mt-3">
          <legend className="sr-only">Besiktning utförd</legend>
          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: "ja", etikett: "Ja" },
                { id: "nej", etikett: "Nej" },
                { id: "syn-styrelse", etikett: "Syn av styrelse" },
              ] as const
            ).map((alt) => (
              <label
                key={alt.id}
                className={`cursor-pointer rounded-lg border px-3 py-2 text-sm ${
                  rad.underhallBesiktning === alt.id
                    ? "border-primary bg-[#e2f0e6] font-medium text-primary-dark"
                    : "border-border bg-background text-foreground"
                }`}
              >
                <input
                  type="radio"
                  name={`besiktning-${rad.id}`}
                  value={alt.id}
                  checked={rad.underhallBesiktning === alt.id}
                  onChange={() =>
                    onChange({
                      underhallBesiktning: alt.id as UnderhallBesiktningStatus,
                    })
                  }
                  className="sr-only"
                />
                {alt.etikett}
              </label>
            ))}
            {rad.underhallBesiktning && (
              <button
                type="button"
                onClick={() => onChange({ underhallBesiktning: "" })}
                className="rounded-lg border border-border px-3 py-2 text-xs text-muted hover:text-foreground"
              >
                Rensa val
              </button>
            )}
          </div>
        </fieldset>
      </div>
    </div>
  );
}
