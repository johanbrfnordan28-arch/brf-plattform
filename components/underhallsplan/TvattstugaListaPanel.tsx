"use client";

import { ListaSummeringPanel } from "@/components/underhallsplan/ListaSummeringPanel";
import { TvattstugaPrisPanel } from "@/components/underhallsplan/TvattstugaPrisPanel";
import {
  hamtaTvattstugaGolvAlternativ,
  hamtaTvattstugaVaggAlternativ,
  kopieraTvattstugaPost,
  skapaTomTvattstugaPost,
  summeraTvattstugaPoster,
  tvattstugaUtformningar,
  type TvattstugaPost,
} from "@/components/underhallsplan/tvattstugor";

type TvattstugaListaPanelProps = {
  poster: TvattstugaPost[];
  onChange: (poster: TvattstugaPost[]) => void;
};

function NummerFalt({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="text-xs font-medium text-muted">{label}</span>
      <input
        type="number"
        min={0}
        step={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
      />
    </label>
  );
}

export function TvattstugaListaPanel({
  poster,
  onChange,
}: TvattstugaListaPanelProps) {
  const golvAlt = hamtaTvattstugaGolvAlternativ();
  const vaggAlt = hamtaTvattstugaVaggAlternativ();

  function uppdateraPost(id: string, patch: Partial<TvattstugaPost>) {
    onChange(poster.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  function läggTill() {
    const nr = poster.length + 1;
    onChange([
      ...poster,
      skapaTomTvattstugaPost(
        poster.length === 0 ? "Tvättstuga 1" : `Tvättstuga ${nr}`,
      ),
    ]);
  }

  function taBort(id: string) {
    onChange(poster.filter((p) => p.id !== id));
  }

  function kopiera(id: string) {
    const kalla = poster.find((p) => p.id === id);
    if (!kalla) return;
    const nr = poster.length + 1;
    onChange([
      ...poster,
      kopieraTvattstugaPost(kalla, `Tvättstuga ${nr}`),
    ]);
  }

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-muted">
        Lägg till en rad per tvättstuga i källaren. Använd Kopiera för att skapa en
        ny tvättstuga med samma maskiner och ytskikt som en befintlig.
      </p>

      {poster.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-white px-3 py-4 text-center text-xs text-muted">
          Inga tvättstugor registrerade — lägg till första tvättstugan.
        </p>
      ) : (
        <ul className="space-y-3">
          {poster.map((post, index) => (
            <li
              key={post.id}
              className="rounded-lg border border-border bg-white p-3 sm:p-4"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-primary-dark">
                  Tvättstuga {index + 1}
                </span>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => kopiera(post.id)}
                    className="text-xs font-medium text-primary-dark hover:underline"
                  >
                    Kopiera
                  </button>
                  <button
                    type="button"
                    onClick={() => taBort(post.id)}
                    className="text-xs text-muted hover:text-red-700"
                  >
                    Ta bort
                  </button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm sm:col-span-2">
                  <span className="text-xs font-medium text-muted">Namn / plats</span>
                  <input
                    type="text"
                    value={post.namn}
                    onChange={(e) =>
                      uppdateraPost(post.id, { namn: e.target.value })
                    }
                    placeholder="t.ex. Tvättstuga källare västra"
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                  />
                </label>

                <label className="block text-sm sm:col-span-2">
                  <span className="text-xs font-medium text-muted">Utformning</span>
                  <select
                    value={post.utformning}
                    onChange={(e) =>
                      uppdateraPost(post.id, {
                        utformning: e.target.value as TvattstugaPost["utformning"],
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                  >
                    {tvattstugaUtformningar.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.etikett}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <fieldset className="mt-3">
                <legend className="text-xs font-semibold text-primary-dark">
                  Maskiner och belysning (st)
                </legend>
                <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <NummerFalt
                    label="Tvättmaskiner"
                    value={post.tvattmaskin}
                    onChange={(v) => uppdateraPost(post.id, { tvattmaskin: v })}
                  />
                  <NummerFalt
                    label="Torktumlare"
                    value={post.torktumlare}
                    onChange={(v) => uppdateraPost(post.id, { torktumlare: v })}
                  />
                  <NummerFalt
                    label="Torkskåp"
                    value={post.torkskap}
                    onChange={(v) => uppdateraPost(post.id, { torkskap: v })}
                  />
                  <NummerFalt
                    label="Mangel"
                    value={post.mangel}
                    onChange={(v) => uppdateraPost(post.id, { mangel: v })}
                  />
                  <NummerFalt
                    label="Belysning"
                    value={post.belysning}
                    onChange={(v) => uppdateraPost(post.id, { belysning: v })}
                  />
                </div>
              </fieldset>

              <fieldset className="mt-3 rounded-lg border border-[#e2f0e6] bg-[#eef6f0]/40 p-3">
                <legend className="px-1 text-xs font-semibold text-primary-dark">
                  Golv
                </legend>
                <div className="mt-2 flex flex-wrap gap-3">
                  {golvAlt.map((alt) => (
                    <label
                      key={alt.id}
                      className="flex cursor-pointer items-center gap-2 text-sm"
                    >
                      <input
                        type="radio"
                        name={`golv-${post.id}`}
                        checked={post.golvYtskikt === alt.id}
                        onChange={() =>
                          uppdateraPost(post.id, { golvYtskikt: alt.id })
                        }
                        className="h-4 w-4 border-border text-primary"
                      />
                      {alt.etikett}
                    </label>
                  ))}
                </div>
                <label className="mt-2 block max-w-xs text-sm">
                  <span className="text-xs font-medium text-muted">Yta (m²)</span>
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={post.golvKvm}
                    onChange={(e) =>
                      uppdateraPost(post.id, { golvKvm: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                  />
                </label>
              </fieldset>

              <fieldset className="mt-3 rounded-lg border border-[#e2f0e6] bg-[#eef6f0]/40 p-3">
                <legend className="px-1 text-xs font-semibold text-primary-dark">
                  Väggar
                </legend>
                <div className="mt-2 flex flex-wrap gap-3">
                  {vaggAlt.map((alt) => (
                    <label
                      key={alt.id}
                      className="flex cursor-pointer items-center gap-2 text-sm"
                    >
                      <input
                        type="radio"
                        name={`vagg-${post.id}`}
                        checked={post.vaggarYtskikt === alt.id}
                        onChange={() =>
                          uppdateraPost(post.id, { vaggarYtskikt: alt.id })
                        }
                        className="h-4 w-4 border-border text-primary"
                      />
                      {alt.etikett}
                    </label>
                  ))}
                </div>
                <label className="mt-2 block max-w-xs text-sm">
                  <span className="text-xs font-medium text-muted">Yta (m²)</span>
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={post.vaggarKvm}
                    onChange={(e) =>
                      uppdateraPost(post.id, { vaggarKvm: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                  />
                </label>
              </fieldset>

              <div className="mt-4">
                <TvattstugaPrisPanel
                  post={post}
                  onChange={(next) =>
                    onChange(
                      poster.map((row) => (row.id === post.id ? next : row)),
                    )
                  }
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={läggTill}
        className="rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
      >
        + Lägg till tvättstuga
      </button>

      {poster.length > 0 && (
        <ListaSummeringPanel
          titel="Summering tvättstugor"
          rader={summeraTvattstugaPoster(poster).slice(1)}
          totaletikett="Antal tvättstugor"
          totaltVarde={`${poster.length} st`}
        />
      )}
    </div>
  );
}
