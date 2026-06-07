"use client";

import { ListaSummeringPanel } from "@/components/underhallsplan/ListaSummeringPanel";
import { UppskattadPrisTabell } from "@/components/underhallsplan/UppskattadPrisTabell";
import { beraknaFonsterDorrListaPris } from "@/components/underhallsplan/fonster-dorr-pris";
import {
  dorrLasUnderhallAlternativ,
  dorrMaterial,
  dorrTraUnderhallAlternativ,
  FONSTER_ADRESS_ANNAN,
  fonsterLageAlternativ,
  fonsterMaterial,
  skapaTomDorrPost,
  skapaTomFonsterPost,
  summeraDorrPoster,
  summeraFonsterPoster,
  traUnderhallAlternativ,
  underhallAllaDorrarText,
  underhallAllaFonsterText,
  underhallElsutbleckVarning,
  type DorrLasUnderhallId,
  type DorrMaterialId,
  type DorrPlatAlderId,
  type DorrTraUnderhallId,
  type FonsterDorrPost,
  type FonsterLageId,
  type FonsterMaterialId,
  type ModulmattTyp,
  type TraUnderhallId,
} from "@/components/underhallsplan/fonster-dorrar";
import { formatSummeringTal, parseNummerSumma } from "@/components/underhallsplan/lista-summering";
import { ModulmattValjare } from "@/components/underhallsplan/ModulmattValjare";
import { hamtaTillgangligaFonsterLage } from "@/components/underhallsplan/fastighets-ytor";
import { hamtaByggnadAdresser } from "@/components/underhallsplan/grund-byggnad-adress";
import type { Grunduppgifter } from "@/components/underhallsplan/types";

type FonsterDorrPanelProps = {
  titel: string;
  modulmattTyp: ModulmattTyp;
  poster: FonsterDorrPost[];
  onChange: (poster: FonsterDorrPost[]) => void;
  visaUnderhallTips?: boolean;
  /** Adresser från grunduppgifter — för uppdelning av fönster per byggnad. */
  foreningsAdresser?: string[];
  grund?: Grunduppgifter;
};

function sparadAdressForLage(post: FonsterDorrPost): string {
  return post.adress?.trim() ?? "";
}

function FonsterPlatsFalt({
  post,
  foreningsAdresser,
  grund,
  onChange,
}: {
  post: FonsterDorrPost;
  foreningsAdresser: string[];
  grund?: Grunduppgifter;
  onChange: (patch: Partial<FonsterDorrPost>) => void;
}) {
  const sparadAdress = post.adress?.trim() ?? "";
  const adresser = (
    grund ? hamtaByggnadAdresser(grund) : foreningsAdresser
  ).filter(Boolean);
  const lageAlternativ = grund
    ? hamtaTillgangligaFonsterLage(grund, sparadAdress)
    : fonsterLageAlternativ;
  const lageVal = post.lage ?? "";
  const lageGiltigt = !lageVal || lageAlternativ.some((l) => l.id === lageVal);
  const adressVal = adresser.includes(sparadAdress)
    ? sparadAdress
    : sparadAdress
      ? FONSTER_ADRESS_ANNAN
      : "";

  return (
    <div className="grid gap-3 sm:col-span-2 lg:col-span-3 sm:grid-cols-2">
      <label className="block text-sm">
        <span className="text-xs font-medium text-muted">Adress</span>
        {adresser.length > 0 ? (
          <select
            value={adressVal}
            onChange={(e) => {
              const val = e.target.value;
              if (val === FONSTER_ADRESS_ANNAN) {
                onChange({ adress: sparadAdress && !adresser.includes(sparadAdress) ? sparadAdress : "" });
              } else {
                onChange({ adress: val });
              }
            }}
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
          >
            <option value="">— Välj adress —</option>
            {adresser.map((adress) => (
              <option key={adress} value={adress}>
                {adress}
              </option>
            ))}
            <option value={FONSTER_ADRESS_ANNAN}>Annan adress…</option>
          </select>
        ) : (
          <input
            type="text"
            value={sparadAdress}
            onChange={(e) => onChange({ adress: e.target.value })}
            placeholder="T.ex. Exempelgatan 12 A"
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
          />
        )}
        {adressVal === FONSTER_ADRESS_ANNAN && (
          <input
            type="text"
            value={sparadAdress}
            onChange={(e) => onChange({ adress: e.target.value })}
            placeholder="Ange adress"
            className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
          />
        )}
      </label>

      <label className="block text-sm">
        <span className="text-xs font-medium text-muted">Läge (fasad)</span>
        <select
          value={lageGiltigt ? lageVal : ""}
          onChange={(e) =>
            onChange({ lage: e.target.value as FonsterLageId | "" })
          }
          className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
        >
          <option value="">— Välj läge —</option>
          {lageAlternativ.map((lage) => (
            <option key={lage.id} value={lage.id}>
              {lage.etikett}
            </option>
          ))}
        </select>
        <span className="mt-1 block text-xs text-muted">
          {grund && lageAlternativ.length < fonsterLageAlternativ.length
            ? "Visar fasader markerade för byggnaden i steg 1."
            : "Väderstreck, gård eller gata — samma som fasadytor i grunduppgifter."}
        </span>
      </label>
    </div>
  );
}

function ärDorr(typ: ModulmattTyp): boolean {
  return typ === "dorr";
}

function FonsterDorrPrisOchSummering({
  poster,
  dorr,
  titel,
  onEnhetsprisChange,
}: {
  poster: FonsterDorrPost[];
  dorr: boolean;
  titel: string;
  onEnhetsprisChange: (id: string, varde: string) => void;
}) {
  const { rader: prisRader, totaltKr } = beraknaFonsterDorrListaPris(poster, dorr);
  const summering = dorr ? summeraDorrPoster(poster) : summeraFonsterPoster(poster);
  const totaltSt = parseNummerSumma(poster.map((p) => p.antal));
  const summerRader = summering.filter(
    (r) => !r.etikett.includes("totalt") && r.etikett !== "Antal modulrader",
  );

  return (
    <>
      {prisRader.length > 0 && (
        <UppskattadPrisTabell
          titel="Uppskattad kostnad"
          beskrivning="Riktvärden per material och underhållstyp — justera enhetspris per rad eller lämna tomt."
          rader={prisRader.map((rad) => ({
            id: rad.postId,
            etikett: rad.etikett,
            mangdText:
              rad.antal > 0 ? `${rad.antal.toLocaleString("sv-SE")} st` : "—",
            enhet: "kr/st",
            enhetspris: String(rad.enhetsprisKr),
            summaKr: rad.summaKr,
            anvanderRiktpris: rad.anvanderRiktpris,
          }))}
          totaltKr={totaltKr}
          totaltEtikett={dorr ? "Dörrar totalt" : "Fönster totalt"}
          onEnhetsprisChange={onEnhetsprisChange}
        />
      )}
      <ListaSummeringPanel
        titel={`Summering ${titel.toLowerCase()}`}
        rader={summerRader}
        totaletikett={dorr ? "Dörrar totalt" : "Fönster totalt"}
        totaltVarde={
          totaltSt > 0
            ? `${formatSummeringTal(totaltSt, 0)} st`
            : `${poster.length} rader`
        }
      />
    </>
  );
}

export function FonsterDorrPanel({
  titel,
  modulmattTyp,
  poster,
  onChange,
  visaUnderhallTips,
  foreningsAdresser = [],
  grund,
}: FonsterDorrPanelProps) {
  const dorr = ärDorr(modulmattTyp);

  function uppdateraPost(id: string, patch: Partial<FonsterDorrPost>) {
    onChange(
      poster.map((p) => {
        if (p.id !== id) return p;
        const next = { ...p, ...patch };
        if (dorr) {
          const { material: _m, traUnderhall: _t, ...dorrPost } = next;
          return dorrPost as FonsterDorrPost;
        }
        const { dorrMaterial: _dm, dorrTraUnderhall: _dt, platAlder: _pa, dorrPlatUnderhall: _dp, harKodlas: _hk, harElsutbleck: _he, lasUnderhall: _lu, ...fonsterPost } = next;
        if (fonsterPost.material !== "tra") {
          const { traUnderhall: _t2, ...rest } = fonsterPost;
          return rest as FonsterDorrPost;
        }
        return fonsterPost as FonsterDorrPost;
      }),
    );
  }

  function växlaLasUnderhall(id: string, lasId: DorrLasUnderhallId, checked: boolean) {
    const post = poster.find((p) => p.id === id);
    if (!post) return;
    const nuvarande = post.lasUnderhall ?? [];
    const lasUnderhall = checked
      ? [...nuvarande, lasId]
      : nuvarande.filter((x) => x !== lasId);
    uppdateraPost(id, { lasUnderhall });
  }

  function läggTillPost() {
    onChange([...poster, dorr ? skapaTomDorrPost() : skapaTomFonsterPost()]);
  }

  function taBortPost(id: string) {
    onChange(poster.filter((p) => p.id !== id));
  }

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-muted">
        Välj <strong className="text-foreground">modulmått</strong> från listan (dm × dm),
        {dorr ? " dörrtyp" : " material"} och antal. Lägg till en rad per storlek/modul.
        {!dorr && (
          <>
            {" "}
            Ange <strong className="text-foreground">adress</strong> och{" "}
            <strong className="text-foreground">läge</strong> (norr, söder, gård m.m.)
            för att dela upp fönstren.
          </>
        )}
      </p>

      {poster.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-white px-3 py-4 text-center text-xs text-muted">
          Inga {titel.toLowerCase()} registrerade — lägg till första raden.
        </p>
      ) : (
        <ul className="space-y-3">
          {poster.map((post, index) => {
            const dorrMat =
              post.dorrMaterial ??
              (post.material === "tra"
                ? "malad-tra"
                : post.material === "aluminium" || post.material === "alu-kldd"
                  ? "aluminium"
                  : "malad-tra");

            return (
              <li
                key={post.id}
                className="rounded-lg border border-border bg-white p-3 sm:p-4"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-primary-dark">
                    {titel} {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => taBortPost(post.id)}
                    className="text-xs text-muted hover:text-red-700"
                  >
                    Ta bort
                  </button>
                </div>

                {!dorr && (
                  <FonsterPlatsFalt
                    post={post}
                    foreningsAdresser={foreningsAdresser}
                    grund={grund}
                    onChange={(patch) => uppdateraPost(post.id, patch)}
                  />
                )}

                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="sm:col-span-1 lg:col-span-1">
                    <ModulmattValjare
                      typ={modulmattTyp}
                      varde={post.modulmatt}
                      onChange={(modulmatt) =>
                        uppdateraPost(post.id, { modulmatt })
                      }
                    />
                  </div>
                  <label className="block text-sm sm:col-span-1">
                    <span className="text-xs font-medium text-muted">Antal (st)</span>
                    <input
                      type="number"
                      min={0}
                      value={post.antal}
                      onChange={(e) =>
                        uppdateraPost(post.id, { antal: e.target.value })
                      }
                      placeholder="t.ex. 48"
                      className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block text-sm sm:col-span-1">
                    <span className="text-xs font-medium text-muted">
                      Enhetspris (kr/st)
                    </span>
                    <input
                      type="number"
                      min={0}
                      step={100}
                      value={post.enhetsprisKr ?? ""}
                      onChange={(e) =>
                        uppdateraPost(post.id, { enhetsprisKr: e.target.value })
                      }
                      placeholder="Riktpris"
                      className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block text-sm sm:col-span-1">
                    <span className="text-xs font-medium text-muted">
                      {dorr ? "Dörrtyp" : "Material"}
                    </span>
                    <select
                      value={dorr ? dorrMat : (post.material ?? "tra")}
                      onChange={(e) => {
                        if (dorr) {
                          const id = e.target.value as DorrMaterialId;
                          uppdateraPost(post.id, {
                            dorrMaterial: id,
                            dorrTraUnderhall:
                              id === "malad-tra"
                                ? post.dorrTraUnderhall ?? "malning"
                                : undefined,
                            platAlder:
                              id === "plat" ? post.platAlder ?? "aldre" : undefined,
                            dorrPlatUnderhall:
                              id === "plat"
                                ? (post.platAlder ?? "aldre") === "aldre"
                                  ? "malning"
                                  : "kontroll"
                                : undefined,
                          });
                        } else {
                          uppdateraPost(post.id, {
                            material: e.target.value as FonsterMaterialId,
                            traUnderhall:
                              e.target.value === "tra"
                                ? post.traUnderhall ?? "malning"
                                : undefined,
                          });
                        }
                      }}
                      className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                    >
                      {(dorr ? dorrMaterial : fonsterMaterial).map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.etikett}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <p className="mt-2 text-xs text-muted">
                  {(dorr ? dorrMaterial : fonsterMaterial).find((m) =>
                    dorr ? m.id === dorrMat : m.id === (post.material ?? "tra"),
                  )?.beskrivning}
                </p>

                {!dorr && post.material === "tra" && (
                  <fieldset className="mt-3 rounded-lg border border-[#e2f0e6] bg-[#eef6f0]/50 p-3">
                    <legend className="px-1 text-xs font-semibold text-primary-dark">
                      Underhåll trä — välj typ
                    </legend>
                    <div className="mt-2 space-y-2">
                      {traUnderhallAlternativ.map((alt) => (
                        <label
                          key={alt.id}
                          className="flex cursor-pointer gap-3 rounded-lg border border-border bg-white px-3 py-2"
                        >
                          <input
                            type="radio"
                            name={`tra-f-${post.id}`}
                            checked={(post.traUnderhall ?? "malning") === alt.id}
                            onChange={() =>
                              uppdateraPost(post.id, {
                                traUnderhall: alt.id as TraUnderhallId,
                              })
                            }
                            className="mt-1 h-4 w-4 border-border text-primary"
                          />
                          <span>
                            <span className="block text-sm font-medium text-foreground">
                              {alt.etikett}
                            </span>
                            <span className="block text-xs text-muted">
                              {alt.beskrivning}
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                )}

                {dorr && dorrMat === "malad-tra" && (
                  <fieldset className="mt-3 rounded-lg border border-[#e2f0e6] bg-[#eef6f0]/50 p-3">
                    <legend className="px-1 text-xs font-semibold text-primary-dark">
                      Underhåll målad trädörr
                    </legend>
                    <div className="mt-2 space-y-2">
                      {dorrTraUnderhallAlternativ.map((alt) => (
                        <label
                          key={alt.id}
                          className="flex cursor-pointer gap-3 rounded-lg border border-border bg-white px-3 py-2"
                        >
                          <input
                            type="radio"
                            name={`tra-d-${post.id}`}
                            checked={(post.dorrTraUnderhall ?? "malning") === alt.id}
                            onChange={() =>
                              uppdateraPost(post.id, {
                                dorrTraUnderhall: alt.id as DorrTraUnderhallId,
                              })
                            }
                            className="mt-1 h-4 w-4 border-border text-primary"
                          />
                          <span>
                            <span className="block text-sm font-medium text-foreground">
                              {alt.etikett}
                            </span>
                            <span className="block text-xs text-muted">
                              {alt.beskrivning}
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                )}

                {dorr && dorrMat === "ek" && (
                  <p className="mt-3 rounded-lg border border-[#e2f0e6] bg-[#eef6f0]/50 px-3 py-2 text-xs text-foreground">
                    Planerat underhåll: <strong>lackning</strong> av ekytan enligt
                    tillverkarens eller målerifirmans anvisningar.
                  </p>
                )}

                {dorr && dorrMat === "plat" && (
                  <fieldset className="mt-3 rounded-lg border border-[#e2f0e6] bg-[#eef6f0]/50 p-3">
                    <legend className="px-1 text-xs font-semibold text-primary-dark">
                      Plåtdörr — ålder och underhåll
                    </legend>
                    <div className="mt-2 flex flex-wrap gap-3">
                      {(
                        [
                          { id: "aldre", etikett: "Äldre plåtdörr", underhall: "malning" },
                          { id: "ny", etikett: "Nyare plåtdörr", underhall: "kontroll" },
                        ] as const
                      ).map((alt) => (
                        <label
                          key={alt.id}
                          className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-sm"
                        >
                          <input
                            type="radio"
                            name={`plat-${post.id}`}
                            checked={(post.platAlder ?? "aldre") === alt.id}
                            onChange={() =>
                              uppdateraPost(post.id, {
                                platAlder: alt.id as DorrPlatAlderId,
                                dorrPlatUnderhall: alt.underhall,
                              })
                            }
                            className="h-4 w-4 border-border text-primary"
                          />
                          {alt.etikett}
                        </label>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-muted">
                      {(post.platAlder ?? "aldre") === "aldre"
                        ? "Äldre plåtdörrar målas ofta vid underhållsomgångar."
                        : "Nyare plåtdörrar målas mer sällan — planera kontroll av rost och beläggning."}
                    </p>
                  </fieldset>
                )}

                {dorr && (
                  <>
                    <div className="mt-3 flex flex-wrap gap-4">
                      <label className="flex cursor-pointer items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={post.harKodlas ?? false}
                          onChange={(e) =>
                            uppdateraPost(post.id, { harKodlas: e.target.checked })
                          }
                          className="h-4 w-4 rounded border-border text-primary"
                        />
                        Kodlås
                      </label>
                      <label className="flex cursor-pointer items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={post.harElsutbleck ?? false}
                          onChange={(e) =>
                            uppdateraPost(post.id, {
                              harElsutbleck: e.target.checked,
                            })
                          }
                          className="h-4 w-4 rounded border-border text-primary"
                        />
                        Elslutbleck
                      </label>
                    </div>

                    <fieldset className="mt-3 rounded-lg border border-[#e2f0e6] bg-[#eef6f0]/50 p-3">
                      <legend className="px-1 text-xs font-semibold text-primary-dark">
                        Lås och beslag — underhållsval
                      </legend>
                      <div className="mt-2 space-y-2">
                        {dorrLasUnderhallAlternativ.map((alt) => (
                          <label
                            key={alt.id}
                            className="flex cursor-pointer gap-3 rounded-lg border border-border bg-white px-3 py-2"
                          >
                            <input
                              type="checkbox"
                              checked={(post.lasUnderhall ?? []).includes(alt.id)}
                              onChange={(e) =>
                                växlaLasUnderhall(post.id, alt.id, e.target.checked)
                              }
                              className="mt-1 h-4 w-4 rounded border-border text-primary"
                            />
                            <span>
                              <span className="block text-sm font-medium text-foreground">
                                {alt.etikett}
                              </span>
                              <span className="block text-xs text-muted">
                                {alt.beskrivning}
                              </span>
                            </span>
                          </label>
                        ))}
                      </div>
                    </fieldset>

                    {post.harElsutbleck && (
                      <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-950">
                        {underhallElsutbleckVarning}
                      </p>
                    )}
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <button
        type="button"
        onClick={läggTillPost}
        className="rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
      >
        + Lägg till {titel.toLowerCase().replace(/s$/, "")}
      </button>

      {poster.length > 0 && (
        <FonsterDorrPrisOchSummering
          poster={poster}
          dorr={dorr}
          titel={titel}
          onEnhetsprisChange={(id, varde) =>
            uppdateraPost(id, { enhetsprisKr: varde })
          }
        />
      )}

      {visaUnderhallTips && (
        <p className="rounded-lg border border-primary/20 bg-[#eef6f0] px-3 py-2 text-xs leading-relaxed text-foreground">
          {dorr ? underhallAllaDorrarText : underhallAllaFonsterText}
        </p>
      )}
    </div>
  );
}
