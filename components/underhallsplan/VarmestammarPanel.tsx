"use client";

import { ListaSummeringPanel } from "@/components/underhallsplan/ListaSummeringPanel";
import {
  formateraVarmeStamHojd,
  varmeBjalklagAlternativ,
  varmeRorDimensioner,
  varmeTakhojdAlternativ,
  varmeVaningarAlternativ,
  type VarmeBjalklagId,
  type VarmeRorDimensionId,
  type VarmeTakhojdId,
} from "@/components/underhallsplan/vvs-varme";
import {
  normaliseraVarmestamPost,
  skapaTomVarmestamPost,
  summeraVarmestamPoster,
  type VarmestamPost,
} from "@/components/underhallsplan/varmestammar";

type VarmestammarPanelProps = {
  poster: VarmestamPost[];
  onChange: (poster: VarmestamPost[]) => void;
};

function tillHojdStam(post: VarmestamPost) {
  return {
    id: post.id,
    namn: post.namn,
    markningKallare: "",
    adress: post.placering,
    betjanar: post.betjanar,
    vaningar: post.vaningar,
    takhojd: post.takhojd,
    takhojdAnnan: post.takhojdAnnan,
    bjalklag: post.bjalklag,
    bjalklagAnnan: post.bjalklagAnnan,
    rumStorlek: "",
    radiatorAntal: "",
    stamRordimension: post.rordimension,
    stamRordimensionAnnan: post.rordimensionAnnan,
    radiatorGrupper: [],
  };
}

export function VarmestammarPanel({ poster, onChange }: VarmestammarPanelProps) {
  function uppdateraPost(id: string, patch: Partial<VarmestamPost>) {
    onChange(
      poster.map((p) =>
        p.id === id ? normaliseraVarmestamPost({ ...p, ...patch }) : p,
      ),
    );
  }

  function läggTill() {
    const nr = poster.length + 1;
    onChange([
      ...poster,
      skapaTomVarmestamPost(poster.length === 0 ? "Stam 1" : `Stam ${nr}`),
    ]);
  }

  function taBort(id: string) {
    onChange(poster.filter((p) => p.id !== id));
  }

  return (
    <div className="space-y-4">
      <p className="text-xs leading-relaxed text-muted">
        Lägg en stam per rad och bygg vidare när det behövs. Styrelsen kan ge
        varje stam ett eget namn och ange placering — till exempel Stam 1 som
        betjänar vardagsrum i 3 rum och kök. Med antal våningar, takhöjd och
        bjälklagets tjocklek räknas total stamhöjd fram automatiskt. Dimension
        är valbar. Sammanställningen längst ned samlar antalet.
      </p>

      {poster.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-white px-3 py-4 text-center text-xs text-muted">
          Inga värmestammar registrerade — lägg till nedan.
        </p>
      ) : (
        <ul className="space-y-3">
          {poster.map((post, index) => {
            const p = normaliseraVarmestamPost(post);
            const hojdText = formateraVarmeStamHojd(tillHojdStam(p));
            return (
              <li
                key={post.id}
                className="rounded-lg border border-border bg-white p-3 sm:p-4"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-primary-dark">
                    {p.namn.trim() || `Värmestam ${index + 1}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => taBort(post.id)}
                    className="text-xs text-muted hover:text-red-700"
                  >
                    Ta bort
                  </button>
                </div>

                <p className="text-xs font-semibold text-primary-dark">
                  Namn och placering
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-muted">
                  Styrelsen kan namnge stammen fritt. Placeringen beskriver var
                  den går upp och vad den betjänar.
                </p>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm">
                    <span className="text-xs font-medium text-muted">Namn</span>
                    <span className="mt-0.5 block text-[11px] text-muted">
                      Eget namn som styrelsen väljer.
                    </span>
                    <input
                      type="text"
                      value={p.namn}
                      onChange={(e) =>
                        uppdateraPost(post.id, { namn: e.target.value })
                      }
                      placeholder="t.ex. Stam 1"
                      className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="text-xs font-medium text-muted">
                      Placering
                    </span>
                    <span className="mt-0.5 block text-[11px] text-muted">
                      Trapphus eller adress där stammen går upp.
                    </span>
                    <input
                      type="text"
                      value={p.placering}
                      onChange={(e) =>
                        uppdateraPost(post.id, { placering: e.target.value })
                      }
                      placeholder="t.ex. trapphus A"
                      className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block text-sm sm:col-span-2">
                    <span className="text-xs font-medium text-muted">
                      Betjänar
                    </span>
                    <span className="mt-0.5 block text-[11px] text-muted">
                      Lägenhetstyp eller rum stammen försörjer.
                    </span>
                    <input
                      type="text"
                      value={p.betjanar}
                      onChange={(e) =>
                        uppdateraPost(post.id, { betjanar: e.target.value })
                      }
                      placeholder="t.ex. 3 rum och kök, vardagsrum"
                      className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                    />
                  </label>
                </div>

                <p className="mt-4 text-xs font-semibold text-primary-dark">
                  Höjd och dimension
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-muted">
                  Total stamhöjd räknas som antal våningar × takhöjd + (våningar
                  − 1) × bjälklag. Exempel: 9 × 2,6 m + 8 × 0,4 m = 26,6 m.
                </p>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm">
                    <span className="text-xs font-medium text-muted">
                      Antal våningar
                    </span>
                    <select
                      value={
                        varmeVaningarAlternativ.some(
                          (a) => a.id === p.vaningar && a.id !== "annat",
                        )
                          ? p.vaningar
                          : ""
                      }
                      onChange={(e) => {
                        if (e.target.value) {
                          uppdateraPost(post.id, { vaningar: e.target.value });
                        }
                      }}
                      className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                    >
                      <option value="">Välj vanligt antal</option>
                      {varmeVaningarAlternativ
                        .filter((a) => a.id !== "annat")
                        .map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.etikett}
                          </option>
                        ))}
                    </select>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={p.vaningar}
                      onChange={(e) =>
                        uppdateraPost(post.id, { vaningar: e.target.value })
                      }
                      placeholder="eller skriv eget, t.ex. 14"
                      className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                    />
                  </label>

                  <label className="block text-sm">
                    <span className="text-xs font-medium text-muted">Takhöjd</span>
                    <select
                      value={p.takhojd}
                      onChange={(e) =>
                        uppdateraPost(post.id, {
                          takhojd: e.target.value as VarmeTakhojdId | "",
                          takhojdAnnan:
                            e.target.value === "annat" ? p.takhojdAnnan : "",
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                    >
                      <option value="">— välj —</option>
                      {varmeTakhojdAlternativ.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.etikett}
                        </option>
                      ))}
                    </select>
                    {p.takhojd === "annat" && (
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={p.takhojdAnnan}
                        onChange={(e) =>
                          uppdateraPost(post.id, {
                            takhojdAnnan: e.target.value,
                          })
                        }
                        placeholder="Egen takhöjd i meter"
                        className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                      />
                    )}
                  </label>

                  <label className="block text-sm">
                    <span className="text-xs font-medium text-muted">
                      Bjälklagets tjocklek
                    </span>
                    <select
                      value={p.bjalklag}
                      onChange={(e) =>
                        uppdateraPost(post.id, {
                          bjalklag: e.target.value as VarmeBjalklagId | "",
                          bjalklagAnnan:
                            e.target.value === "annat" ? p.bjalklagAnnan : "",
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                    >
                      <option value="">— välj —</option>
                      {varmeBjalklagAlternativ.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.etikett}
                        </option>
                      ))}
                    </select>
                    {p.bjalklag === "annat" && (
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={p.bjalklagAnnan}
                        onChange={(e) =>
                          uppdateraPost(post.id, {
                            bjalklagAnnan: e.target.value,
                          })
                        }
                        placeholder="Egen tjocklek i meter"
                        className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                      />
                    )}
                  </label>

                  <label className="block text-sm">
                    <span className="text-xs font-medium text-muted">
                      Rördimension
                    </span>
                    <select
                      value={p.rordimension}
                      onChange={(e) =>
                        uppdateraPost(post.id, {
                          rordimension: e.target.value as VarmeRorDimensionId | "",
                          rordimensionAnnan:
                            e.target.value === "annat"
                              ? p.rordimensionAnnan
                              : "",
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                    >
                      <option value="">— ej angiven —</option>
                      {varmeRorDimensioner.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.etikett}
                        </option>
                      ))}
                    </select>
                    {p.rordimension === "annat" && (
                      <input
                        type="text"
                        value={p.rordimensionAnnan}
                        onChange={(e) =>
                          uppdateraPost(post.id, {
                            rordimensionAnnan: e.target.value,
                          })
                        }
                        placeholder="t.ex. 42 mm"
                        className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                      />
                    )}
                  </label>

                  <label className="block text-sm">
                    <span className="text-xs font-medium text-muted">
                      Horisontell ledning
                    </span>
                    <span className="mt-0.5 block text-[11px] text-muted">
                      Fördelning per plan / gren, om den anges separat.
                    </span>
                    <input
                      type="number"
                      min={0}
                      step={0.1}
                      value={p.horisontellLopmeter}
                      onChange={(e) =>
                        uppdateraPost(post.id, {
                          horisontellLopmeter: e.target.value,
                        })
                      }
                      placeholder="m"
                      className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                    />
                  </label>
                </div>

                {hojdText && (
                  <p className="mt-3 rounded-lg border border-primary/20 bg-[#eef6f0]/60 px-3 py-2 text-sm text-primary-dark">
                    Total stamhöjd: {hojdText}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <button
        type="button"
        onClick={läggTill}
        className="w-full rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-white hover:bg-primary/90"
      >
        + Lägg till värmestam
      </button>

      {poster.length > 0 && (
        <ListaSummeringPanel
          titel="Sammanställning värmestammar"
          rader={summeraVarmestamPoster(poster)}
        />
      )}
    </div>
  );
}
