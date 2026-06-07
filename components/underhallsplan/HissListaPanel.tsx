"use client";

import { useState } from "react";
import { ListaSummeringPanel } from "@/components/underhallsplan/ListaSummeringPanel";
import { UppskattadPrisTabell } from "@/components/underhallsplan/UppskattadPrisTabell";
import {
  beraknaHissListaPris,
  hamtaHissPostEnhetspris,
} from "@/components/underhallsplan/hiss-pris";
import { RIKT_HISS_MODERNISERING_KR } from "@/components/underhallsplan/riktpriser";
import {
  allaHissMarken,
  hissTyper,
  skapaHissMarkeId,
  skapaTomHissPost,
  summeraHissPoster,
  type HissMarkeDefinition,
  type HissPost,
  type HissTypId,
} from "@/components/underhallsplan/hissar";

type HissListaPanelProps = {
  poster: HissPost[];
  egnaMarken: HissMarkeDefinition[];
  onChange: (poster: HissPost[]) => void;
  onEgnaMarkenChange: (marken: HissMarkeDefinition[]) => void;
};

export function HissListaPanel({
  poster,
  egnaMarken,
  onChange,
  onEgnaMarkenChange,
}: HissListaPanelProps) {
  const [nyttMarke, setNyttMarke] = useState("");
  const marken = allaHissMarken(egnaMarken);

  function uppdateraPost(id: string, patch: Partial<HissPost>) {
    onChange(poster.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  function läggTillHiss() {
    const nr = poster.length + 1;
    onChange([
      ...poster,
      skapaTomHissPost(poster.length === 0 ? "Hiss 1" : `Hiss ${nr}`),
    ]);
  }

  function taBortHiss(id: string) {
    onChange(poster.filter((p) => p.id !== id));
  }

  function läggTillMarke() {
    const etikett = nyttMarke.trim();
    if (!etikett) return;
    const id = skapaHissMarkeId();
    onEgnaMarkenChange([...egnaMarken, { id, etikett }]);
    setNyttMarke("");
  }

  function taBortEgetMarke(id: string) {
    onEgnaMarkenChange(egnaMarken.filter((m) => m.id !== id));
    onChange(
      poster.map((p) =>
        p.marke === id ? { ...p, marke: "kone", markeAnnanText: "" } : p,
      ),
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs leading-relaxed text-muted">
        Lägg till en rad per hiss i trapphuset. Ange märke och om det är motvikts-
        eller hydraulhiss.
      </p>

      {poster.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-white px-3 py-4 text-center text-xs text-muted">
          Inga hissar registrerade — lägg till första hissen.
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
                  Hiss {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => taBortHiss(post.id)}
                  className="text-xs text-muted hover:text-red-700"
                >
                  Ta bort
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm sm:col-span-2">
                  <span className="text-xs font-medium text-muted">
                    Namn / plats (valfritt)
                  </span>
                  <input
                    type="text"
                    value={post.namn}
                    onChange={(e) =>
                      uppdateraPost(post.id, { namn: e.target.value })
                    }
                    placeholder="T.ex. Hiss hus A"
                    className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                  />
                </label>

                <label className="block text-sm sm:col-span-2">
                  <span className="text-xs font-medium text-muted">Märke</span>
                  <select
                    value={post.marke}
                    onChange={(e) =>
                      uppdateraPost(post.id, {
                        marke: e.target.value,
                        markeAnnanText:
                          e.target.value === "annat" ? post.markeAnnanText : "",
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                  >
                    {marken.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.etikett}
                      </option>
                    ))}
                  </select>
                </label>

                {post.marke === "annat" && (
                  <label className="block text-sm sm:col-span-2">
                    <span className="text-xs font-medium text-muted">
                      Ange märke
                    </span>
                    <input
                      type="text"
                      value={post.markeAnnanText}
                      onChange={(e) =>
                        uppdateraPost(post.id, {
                          markeAnnanText: e.target.value,
                        })
                      }
                      placeholder="Märkesnamn"
                      className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                    />
                  </label>
                )}
              </div>

              <fieldset className="mt-4 space-y-2">
                <legend className="text-xs font-semibold text-primary-dark">
                  Hisstyp
                </legend>
                {hissTyper.map((typ) => (
                  <label
                    key={typ.id}
                    className="flex cursor-pointer items-start gap-2 rounded-lg border border-border bg-[#fafcfa] px-3 py-2 text-sm has-[:checked]:border-primary has-[:checked]:bg-[#eef6f0]/50"
                  >
                    <input
                      type="radio"
                      name={`hiss-typ-${post.id}`}
                      checked={post.hissTyp === typ.id}
                      onChange={() =>
                        uppdateraPost(post.id, {
                          hissTyp: typ.id as HissTypId,
                        })
                      }
                      className="mt-0.5 h-4 w-4 shrink-0 border-border text-primary"
                    />
                    <span className="font-medium">{typ.etikett}</span>
                  </label>
                ))}
              </fieldset>

              <label className="mt-4 block max-w-md text-sm">
                <span className="text-xs font-medium text-muted">
                  Uppskattad kostnad modernisering (kr)
                </span>
                <input
                  type="number"
                  min={0}
                  step={10000}
                  value={post.uppskattadModerniseringKr ?? ""}
                  onChange={(e) =>
                    uppdateraPost(post.id, {
                      uppskattadModerniseringKr: e.target.value,
                    })
                  }
                  placeholder={`Riktpris ca ${RIKT_HISS_MODERNISERING_KR.toLocaleString("sv-SE")}`}
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                />
              </label>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={läggTillHiss}
        className="w-full rounded-lg border border-dashed border-primary/40 bg-white px-3 py-2.5 text-sm font-medium text-primary-dark hover:bg-[#eef6f0]/40"
      >
        + Lägg till hiss
      </button>

      <div className="rounded-lg border border-border bg-white p-3">
        <p className="text-xs font-semibold text-primary-dark">
          Egna märken
        </p>
        <p className="mt-0.5 text-xs text-muted">
          Saknas märket i listan? Lägg till det här — det blir valbart på alla
          hissrader.
        </p>
        {egnaMarken.length > 0 && (
          <ul className="mt-2 space-y-1">
            {egnaMarken.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <span>{m.etikett}</span>
                <button
                  type="button"
                  onClick={() => taBortEgetMarke(m.id)}
                  className="text-xs text-muted hover:text-red-700"
                >
                  Ta bort
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-2 flex flex-wrap gap-2">
          <input
            type="text"
            value={nyttMarke}
            onChange={(e) => setNyttMarke(e.target.value)}
            placeholder="Nytt märke"
            className="min-w-0 flex-1 rounded-lg border border-border px-3 py-2 text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                läggTillMarke();
              }
            }}
          />
          <button
            type="button"
            onClick={läggTillMarke}
            disabled={!nyttMarke.trim()}
            className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Lägg till märke
          </button>
        </div>
      </div>

      {poster.length > 0 && (
        <>
          <UppskattadPrisTabell
            titel="Uppskattad kostnad — modernisering"
            beskrivning="En post per hiss. Tomt fält = riktpris per hiss."
            rader={poster.map((post, index) => {
              const enhetsprisKr = hamtaHissPostEnhetspris(post);
              return {
                id: post.id,
                etikett: post.namn.trim() || `Hiss ${index + 1}`,
                mangdText: "1 st",
                enhet: "kr/st",
                enhetspris: post.uppskattadModerniseringKr ?? "",
                summaKr: enhetsprisKr,
                anvanderRiktpris: !post.uppskattadModerniseringKr?.trim(),
              };
            })}
            totaltKr={beraknaHissListaPris(poster)}
            totaltEtikett="Hissar totalt"
            onEnhetsprisChange={(id, varde) =>
              uppdateraPost(id, { uppskattadModerniseringKr: varde })
            }
          />
          <ListaSummeringPanel
            titel="Summering hissar"
            rader={summeraHissPoster(poster).slice(1)}
            totaletikett="Antal hissar"
            totaltVarde={`${poster.length} st`}
          />
        </>
      )}
    </div>
  );
}
