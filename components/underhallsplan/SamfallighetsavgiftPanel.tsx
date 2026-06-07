"use client";

import { useState } from "react";
import {
  beraknaSamfallighetsavgiftPerAr,
  hamtaValdaSamfallighetsPoster,
  normaliseraSamfallighetsavgift,
  skapaEgenSamfallighetsPostId,
  type Samfallighetsavgift,
  type SamfallighetsPost,
} from "@/components/underhallsplan/samfallighetsavgift";
import { formatKr } from "@/components/underhallsplan/besiktningar";

type SamfallighetsavgiftPanelProps = {
  avgift: Samfallighetsavgift;
  onChange: (avgift: Samfallighetsavgift) => void;
};

export function SamfallighetsavgiftPanel({
  avgift,
  onChange,
}: SamfallighetsavgiftPanelProps) {
  const data = normaliseraSamfallighetsavgift(avgift);
  const [nyPostNamn, setNyPostNamn] = useState("");
  const valda = hamtaValdaSamfallighetsPoster(data);
  const arlig = beraknaSamfallighetsavgiftPerAr(data);

  function uppdatera(patch: Partial<Samfallighetsavgift>) {
    onChange(normaliseraSamfallighetsavgift({ ...data, ...patch }));
  }

  function uppdateraPost(id: string, patch: Partial<SamfallighetsPost>) {
    uppdatera({
      poster: data.poster.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    });
  }

  function laggTillEgenPost() {
    const namn = nyPostNamn.trim();
    if (!namn) return;
    uppdatera({
      poster: [
        ...data.poster,
        {
          id: skapaEgenSamfallighetsPostId(),
          namn,
          vald: true,
          egen: true,
        },
      ],
    });
    setNyPostNamn("");
  }

  function taBortEgenPost(id: string) {
    uppdatera({
      poster: data.poster.filter((p) => p.id !== id),
    });
  }

  return (
    <div className="rounded-xl border border-border bg-background/80 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">
            Avgift till samfällighet
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Årlig kostnad som betalas till samfällighetsföreningen. Välj vad som
            ingår i avgiften — syns i årsbudgeten när den är aktiv.
          </p>
        </div>
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={data.aktiv}
            onChange={(event) => uppdatera({ aktiv: event.target.checked })}
            className="h-4 w-4 rounded border-border text-primary"
          />
          <span className="font-medium text-foreground">Aktiv</span>
        </label>
      </div>

      <label className="mt-4 block max-w-xs text-sm">
        <span className="text-xs font-medium text-muted">Årlig avgift (kr)</span>
        <input
          type="number"
          min={0}
          step={100}
          disabled={!data.aktiv}
          value={data.arligAvgiftKr || ""}
          onChange={(event) => {
            const kr = Number.parseInt(event.target.value, 10);
            uppdatera({
              arligAvgiftKr: Number.isNaN(kr) ? 0 : Math.max(0, kr),
            });
          }}
          placeholder="t.ex. 120 000"
          className="mt-1 w-full rounded-lg border border-border px-2.5 py-1.5 text-sm disabled:opacity-50"
        />
        {data.aktiv && arlig > 0 && (
          <span className="mt-1 block text-xs text-muted">
            Budgeteras med {formatKr(arlig)} per år i planen.
          </span>
        )}
      </label>

      <details className="mt-4 rounded-lg border border-border bg-white open:shadow-sm">
        <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden">
          <span className="flex items-center justify-between gap-2">
            <span>Vad ingår i avgiften?</span>
            <span className="text-xs font-normal text-muted">
              {valda.length > 0
                ? `${valda.length} valda`
                : "Inget valt ännu"}
            </span>
          </span>
        </summary>

        <div className="border-t border-border px-4 pb-4 pt-3">
          {valda.length > 0 && (
            <p className="mb-3 flex flex-wrap gap-1.5">
              {valda.map((p) => (
                <span
                  key={p.id}
                  className="rounded-full bg-[#e2f0e6] px-2.5 py-0.5 text-xs font-medium text-primary-dark"
                >
                  {p.namn}
                </span>
              ))}
            </p>
          )}

          <ul className="space-y-2">
            {data.poster.map((post) => (
              <li
                key={post.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/80 px-3 py-2"
              >
                <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={post.vald}
                    onChange={(event) =>
                      uppdateraPost(post.id, { vald: event.target.checked })
                    }
                    className="h-4 w-4 shrink-0 rounded border-border text-primary"
                  />
                  <span className="text-foreground">{post.namn}</span>
                </label>
                {post.egen && (
                  <button
                    type="button"
                    onClick={() => taBortEgenPost(post.id)}
                    className="text-xs text-muted hover:text-red-700"
                  >
                    Ta bort
                  </button>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-4 flex flex-wrap gap-2">
            <input
              type="text"
              value={nyPostNamn}
              onChange={(event) => setNyPostNamn(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  laggTillEgenPost();
                }
              }}
              placeholder="Egen post, t.ex. Sophämtning gemensam gård"
              className="min-w-[12rem] flex-1 rounded-lg border border-border px-2.5 py-1.5 text-sm"
            />
            <button
              type="button"
              onClick={laggTillEgenPost}
              disabled={!nyPostNamn.trim()}
              className="rounded-lg border border-primary px-3 py-1.5 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6] disabled:opacity-50"
            >
              Lägg till
            </button>
          </div>
        </div>
      </details>

      <label className="mt-4 block text-sm">
        <span className="text-xs font-medium text-muted">Anteckning (valfritt)</span>
        <textarea
          rows={2}
          value={data.notering ?? ""}
          onChange={(event) =>
            uppdatera({ notering: event.target.value || undefined })
          }
          placeholder="T.ex. avtal med samfällighetsföreningen, faktureringsintervall …"
          className="mt-1 w-full rounded-lg border border-border px-2.5 py-1.5 text-sm"
        />
      </label>
    </div>
  );
}
