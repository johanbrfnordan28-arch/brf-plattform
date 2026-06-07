"use client";

import { formatKr } from "@/components/underhallsplan/besiktningar";
import {
  normaliseraStyckPoster,
  skapaTomStyckPost,
  summeraStyckPosterKr,
  type BlandadStyckPost,
} from "@/components/underhallsplan/blandad-styck-poster";

type BlandadStyckPosterListaProps = {
  poster: BlandadStyckPost[];
  onChange: (poster: BlandadStyckPost[]) => void;
  kompakt?: boolean;
};

export function BlandadStyckPosterLista({
  poster: rawPoster,
  onChange,
  kompakt = false,
}: BlandadStyckPosterListaProps) {
  const poster = normaliseraStyckPoster(rawPoster);
  const delStKr = summeraStyckPosterKr(poster);

  function uppdateraRad(id: string, patch: Partial<BlandadStyckPost>) {
    onChange(
      poster.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    );
  }

  function taBortRad(id: string) {
    const next = poster.filter((p) => p.id !== id);
    onChange(next.length > 0 ? next : [skapaTomStyckPost()]);
  }

  function laggTillRad() {
    onChange([...poster, skapaTomStyckPost()]);
  }

  return (
    <div className={kompakt ? "space-y-2" : "space-y-3"}>
      <div className="space-y-2">
        {poster.map((p, index) => (
          <div
            key={p.id}
            className="grid gap-2 rounded-md border border-border/70 bg-white p-2 sm:grid-cols-[minmax(0,1.2fr)_4rem_5rem_5rem_auto]"
          >
            <label className="text-xs sm:col-span-1">
              <span className="text-muted">Benämning</span>
              <input
                type="text"
                value={p.etikett}
                onChange={(e) => uppdateraRad(p.id, { etikett: e.target.value })}
                placeholder={
                  index === 0 ? "t.ex. Ställning" : "t.ex. Takluckor"
                }
                className="mt-0.5 w-full rounded border border-border px-2 py-1 text-sm"
              />
            </label>
            <label className="text-xs">
              <span className="text-muted">Antal</span>
              <input
                type="number"
                min={0}
                step={1}
                value={p.antal}
                onChange={(e) => uppdateraRad(p.id, { antal: e.target.value })}
                className="mt-0.5 w-full rounded border border-border px-2 py-1 text-sm"
              />
            </label>
            <label className="text-xs">
              <span className="text-muted">kr/st</span>
              <input
                type="number"
                min={0}
                step={1}
                value={p.enhetsprisKr}
                onChange={(e) =>
                  uppdateraRad(p.id, { enhetsprisKr: e.target.value })
                }
                className="mt-0.5 w-full rounded border border-border px-2 py-1 text-sm"
              />
            </label>
            <div className="flex items-end pb-1 text-xs font-medium text-primary-dark">
              {(() => {
                const antal = Number.parseFloat(p.antal.replace(",", "."));
                const pris = Number.parseInt(p.enhetsprisKr.replace(/\s/g, ""), 10);
                const sum =
                  Number.isFinite(antal) &&
                  antal > 0 &&
                  Number.isFinite(pris) &&
                  pris > 0
                    ? Math.round(antal * pris)
                    : 0;
                return sum > 0 ? formatKr(sum) : "—";
              })()}
            </div>
            <div className="flex items-end pb-0.5">
              {poster.length > 1 && (
                <button
                  type="button"
                  onClick={() => taBortRad(p.id)}
                  className="text-xs text-muted hover:text-red-700"
                >
                  Ta bort
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={laggTillRad}
          className="rounded-lg border border-primary px-2.5 py-1 text-xs font-medium text-primary-dark hover:bg-[#e2f0e6]"
        >
          + Lägg till styckpost
        </button>
        {delStKr > 0 && (
          <p className="text-xs font-medium text-primary-dark">
            Styckdel totalt: {formatKr(delStKr)}
          </p>
        )}
      </div>
    </div>
  );
}
