"use client";

import { TakYtaSammanstallning } from "@/components/underhallsplan/TakYtaSammanstallning";
import { YtaOchMaterialAiHjalp } from "@/components/underhallsplan/YtaOchMaterialAiHjalp";
import type { Grunduppgifter } from "@/components/underhallsplan/types";
import {
  formateraTakBelaggning,
  materialEtikettTakBelaggningPost,
  skapaTomTakBelaggningPost,
  summeraTakBelaggningKvm,
  takBelaggningBandlagdMaterial,
  takBelaggningKanMalas,
  takBelaggningMangdEnhetEtiketter,
  takBelaggningMaterialAlternativ,
  takBelaggningTegelTyper,
  lackadPlatKulorAlternativ,
  postPatchFranTakMaterialVal,
  takMaterialValIdFranPost,
  takYtbehandlingAlternativ,
  takformAlternativ,
  type BandlagdPlatMaterial,
  type Takform,
  type KorrigeradInfastning,
  type TakBelaggningData,
  type TakBelaggningHuvudtyp,
  type TakBelaggningMangdEnhet,
  type TakBelaggningPost,
  type TegelTyp,
} from "@/components/underhallsplan/tak-belaggning";
import {
  måttenhetEtiketter,
  type KomponentDetaljData,
  type Måttenhet,
} from "@/components/underhallsplan/komponentregister";

type TakbelaggningPanelProps = {
  data: KomponentDetaljData;
  grund: Grunduppgifter;
  belaggning: TakBelaggningData;
  måttenhet: Måttenhet;
  värde: string;
  onBelaggningChange: (
    next: TakBelaggningData,
    radPatch?: { måttenhet?: Måttenhet; värde?: string },
  ) => void;
  onMåttChange: (patch: { måttenhet?: Måttenhet; värde?: string }) => void;
  /** Steg 2 — material väljs i rullgardin i stället för knappar. */
  materialvalAsSelect?: boolean;
  /** Steg 2 — dölj AI, schablon och kostnadsrelaterade hjälpytor. */
  steg2Lage?: boolean;
};

function lackadPlatKulorSelectVarde(kulor: string | undefined): string {
  const v = kulor?.trim() ?? "";
  if (!v) return "";
  if (lackadPlatKulorAlternativ.some((k) => k.id === v)) return v;
  if (v.startsWith("annan:")) return "annan";
  return "annan";
}

function PlatKulorFalt({
  kulor,
  etikett = "Kulör (lackad plåt)",
  onChange,
}: {
  kulor: string | undefined;
  etikett?: string;
  onChange: (kulor: string) => void;
}) {
  const selectVal = lackadPlatKulorSelectVarde(kulor);
  const annanText =
    kulor?.startsWith("annan:") === true
      ? kulor.slice("annan:".length)
      : selectVal === "annan" &&
          kulor &&
          !lackadPlatKulorAlternativ.some((k) => k.id === kulor)
        ? kulor
        : "";

  return (
    <div className="mt-3 space-y-2">
      <label className="block text-sm">
        <span className="block text-xs font-medium text-muted">{etikett}</span>
        <select
          value={selectVal}
          onChange={(e) => {
            const id = e.target.value;
            onChange(
              id === "annan" ? (annanText ? `annan:${annanText}` : "annan") : id,
            );
          }}
          className="mt-1 w-full max-w-md rounded-lg border border-border bg-white px-3 py-2 text-sm"
        >
          <option value="">Välj kulör (valfritt)</option>
          {lackadPlatKulorAlternativ.map((k) => (
            <option key={k.id} value={k.id}>
              {k.etikett}
            </option>
          ))}
        </select>
      </label>
      {selectVal === "annan" && (
        <label className="block text-sm">
          <span className="text-xs font-medium text-muted">Ange kulör</span>
          <input
            type="text"
            value={annanText}
            onChange={(e) =>
              onChange(
                e.target.value.trim() ? `annan:${e.target.value}` : "annan",
              )
            }
            placeholder="t.ex. mörkgrön"
            className="mt-1 w-full max-w-md rounded-lg border border-border px-3 py-2 text-sm"
          />
        </label>
      )}
    </div>
  );
}

const huvudtyper: {
  id: TakBelaggningHuvudtyp;
  etikett: string;
  beskrivning: string;
}[] = [
  {
    id: "tegel",
    etikett: "Tegelpannor / betongpannor",
    beskrivning: "Betongpannor eller lertegel — välj typ och kulör.",
  },
  {
    id: "plat-korrigerad",
    etikett: "Korrugerad plåt",
    beskrivning:
      "Byggs på bärläkt och ströläkt som tegel. Plåten fästs vanligtvis med spik eller skruv genom plåten.",
  },
  {
    id: "plat-bandlagd",
    etikett: "Bandlagd plåt",
    beskrivning:
      "Plåten ligger dikt på underlag (t.ex. papp). Infästningen är dold under plåten.",
  },
  {
    id: "papp",
    etikett: "Takpapp / bitumen",
    beskrivning: "Papptak eller bitumen — yta i m².",
  },
  {
    id: "takduk",
    etikett: "Takduk",
    beskrivning: "Takduk / membran — ange yta, kulör och ytbehandling.",
  },
  {
    id: "skiffer",
    etikett: "Skiffer",
    beskrivning: "Skiffer — lång livslängd; ange yta och eventuell kulör.",
  },
  {
    id: "sedum",
    etikett: "Sedum",
    beskrivning: "Grönt tak / sedum — ange yta.",
  },
  {
    id: "annat",
    etikett: "Annat material",
    beskrivning: "Ange material, yta, kulör och ytbehandling.",
  },
];

function valKnapp(
  vald: boolean,
  onClick: () => void,
  etikett: string,
  key?: string,
) {
  return (
    <button
      key={key ?? etikett}
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
        vald
          ? "border-primary bg-[#e2f0e6] text-primary-dark"
          : "border-border bg-white text-foreground hover:border-primary/50"
      }`}
    >
      {vald ? "✓ " : ""}
      {etikett}
    </button>
  );
}

function redigeraPost(
  belaggning: TakBelaggningData,
  postId: string,
  patch: Partial<TakBelaggningPost>,
): TakBelaggningData {
  return {
    belaggningar: belaggning.belaggningar.map((p) =>
      p.id === postId ? { ...p, ...patch } : p,
    ),
  };
}

export function TakbelaggningPanel({
  data,
  grund,
  belaggning,
  måttenhet,
  värde,
  onBelaggningChange,
  onMåttChange,
  materialvalAsSelect = false,
  steg2Lage = false,
}: TakbelaggningPanelProps) {
  const enhetInfo = måttenhetEtiketter[måttenhet];
  const poster = belaggning.belaggningar;
  const kvmFranDelar = summeraTakBelaggningKvm(belaggning);

  function uppdateraBelaggning(next: TakBelaggningData) {
    const summaKvm = summeraTakBelaggningKvm(next);
    const radPatch =
      summaKvm > 0
        ? {
            måttenhet: "kvm" as Måttenhet,
            värde: String(Math.round(summaKvm * 10) / 10),
          }
        : undefined;
    onBelaggningChange(next, radPatch);
  }

  function laggTill() {
    uppdateraBelaggning({
      belaggningar: [...poster, skapaTomTakBelaggningPost()],
    });
  }

  function taBort(id: string) {
    uppdateraBelaggning({
      belaggningar: poster.filter((p) => p.id !== id),
    });
  }

  const kanMalas = takBelaggningKanMalas(belaggning);

  return (
    <div className="space-y-4">
      <fieldset>
        <legend className="text-xs font-semibold text-primary-dark">
          Takyta och beläggning
        </legend>
        <p className="mt-1 text-xs text-muted">
          Börja med yta i m², välj sedan beläggning, kulör och eventuell
          ytbehandling. Flera takfall med olika beläggningar registreras som
          separata partier. Total takyta summeras automatiskt. Kartmått (t.ex.
          Google Earth) är preliminära — verifiera inför upphandling.
        </p>
        {poster.length === 0 ? (
          <p className="mt-2 text-sm text-muted">
            Inga material valda ännu.
          </p>
        ) : null}
        <div className="mt-3 space-y-4">
          {poster.map((post, index) => (
            <div
              key={post.id}
              className="rounded-lg border border-border bg-white p-3 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold text-foreground">
                  Takparti {index + 1}
                </p>
                <button
                  type="button"
                  onClick={() => taBort(post.id)}
                  className="text-xs text-red-700 underline hover:no-underline"
                >
                  Ta bort
                </button>
              </div>
              <label className="mt-2 block text-sm">
                <span className="text-xs font-medium text-muted">
                  Namn på byggnadsdel (valfritt)
                </span>
                <input
                  type="text"
                  value={post.namn ?? ""}
                  onChange={(e) =>
                    uppdateraBelaggning(
                      redigeraPost(belaggning, post.id, {
                        namn: e.target.value,
                      }),
                    )
                  }
                  placeholder={materialEtikettTakBelaggningPost(post).split(
                    " · ",
                  )[0]}
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                />
              </label>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="text-xs font-medium text-muted">
                    Yta / mängd
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={post.mangd ?? ""}
                    onChange={(e) =>
                      uppdateraBelaggning(
                        redigeraPost(belaggning, post.id, {
                          mangd: e.target.value,
                        }),
                      )
                    }
                    placeholder={
                      (post.mangdEnhet ?? "kvm") === "kvm" ? "t.ex. 850" : "0"
                    }
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-xs font-medium text-muted">Enhet</span>
                  <select
                    value={post.mangdEnhet ?? "kvm"}
                    onChange={(e) =>
                      uppdateraBelaggning(
                        redigeraPost(belaggning, post.id, {
                          mangdEnhet: e.target
                            .value as TakBelaggningMangdEnhet,
                        }),
                      )
                    }
                    className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                  >
                    {(
                      Object.keys(
                        takBelaggningMangdEnhetEtiketter,
                      ) as TakBelaggningMangdEnhet[]
                    ).map((key) => (
                      <option key={key} value={key}>
                        {takBelaggningMangdEnhetEtiketter[key].etikett} (
                        {takBelaggningMangdEnhetEtiketter[key].enhet})
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="mt-3 block text-sm">
                <span className="text-xs font-medium text-muted">Takform</span>
                <select
                  value={post.takform ?? ""}
                  onChange={(e) =>
                    uppdateraBelaggning(
                      redigeraPost(belaggning, post.id, {
                        takform: (e.target.value || undefined) as
                          | Takform
                          | undefined,
                      }),
                    )
                  }
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                >
                  <option value="">Välj takform (valfritt)</option>
                  {takformAlternativ.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.etikett}
                    </option>
                  ))}
                </select>
              </label>
              {materialvalAsSelect ? (
                <>
                  <label className="mt-3 block text-sm">
                    <span className="text-xs font-medium text-muted">
                      Takbeläggning
                    </span>
                    <select
                      value={takMaterialValIdFranPost(post)}
                      onChange={(e) =>
                        uppdateraBelaggning(
                          redigeraPost(belaggning, post.id, {
                            ...postPatchFranTakMaterialVal(
                              e.target.value,
                              post,
                            ),
                          }),
                        )
                      }
                      className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                    >
                      {Array.from(
                        new Set(
                          takBelaggningMaterialAlternativ.map((a) => a.grupp),
                        ),
                      ).map((grupp) => (
                        <optgroup key={grupp} label={grupp}>
                          {takBelaggningMaterialAlternativ
                            .filter((a) => a.grupp === grupp)
                            .map((alt) => (
                              <option key={alt.id} value={alt.id}>
                                {alt.etikett}
                              </option>
                            ))}
                        </optgroup>
                      ))}
                    </select>
                  </label>
                  {post.huvudtyp === "annat" && (
                    <label className="mt-3 block text-sm">
                      <span className="text-xs font-medium text-muted">
                        Ange material
                      </span>
                      <input
                        type="text"
                        value={post.annatMaterial ?? ""}
                        onChange={(e) =>
                          uppdateraBelaggning(
                            redigeraPost(belaggning, post.id, {
                              annatMaterial: e.target.value,
                            }),
                          )
                        }
                        className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                      />
                    </label>
                  )}
                  {post.huvudtyp === "tegel" && (
                    <label className="mt-3 block text-sm">
                      <span className="text-xs font-medium text-muted">
                        Kulör (valfritt)
                      </span>
                      <input
                        type="text"
                        value={post.tegelKulor ?? ""}
                        onChange={(e) =>
                          uppdateraBelaggning(
                            redigeraPost(belaggning, post.id, {
                              tegelKulor: e.target.value,
                            }),
                          )
                        }
                        placeholder="t.ex. röd, svart glaserad"
                        className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                      />
                    </label>
                  )}
                  {post.huvudtyp === "plat-bandlagd" &&
                    (post.bandlagdMaterial ?? "stalplat") === "stalplat" && (
                      <PlatKulorFalt
                        kulor={post.bandlagdKulor}
                        onChange={(kulor) =>
                          uppdateraBelaggning(
                            redigeraPost(belaggning, post.id, {
                              bandlagdKulor: kulor,
                            }),
                          )
                        }
                      />
                    )}
                  {post.huvudtyp === "plat-korrigerad" && (
                    <PlatKulorFalt
                      kulor={post.korrigeradKulor}
                      etikett="Kulör (korrugerad plåt)"
                      onChange={(kulor) =>
                        uppdateraBelaggning(
                          redigeraPost(belaggning, post.id, {
                            korrigeradKulor: kulor,
                          }),
                        )
                      }
                    />
                  )}
                  {post.huvudtyp === "plat-bandlagd" &&
                    post.bandlagdMaterial === "aluminium" && (
                      <label className="mt-3 flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={post.aluminiumLackerad === true}
                          onChange={(e) =>
                            uppdateraBelaggning(
                              redigeraPost(belaggning, post.id, {
                                aluminiumLackerad: e.target.checked,
                              }),
                            )
                          }
                        />
                        <span>Lackerad aluminium (kan målas om)</span>
                      </label>
                    )}
                  {(post.huvudtyp === "takduk" ||
                    post.huvudtyp === "skiffer" ||
                    post.huvudtyp === "sedum" ||
                    post.huvudtyp === "papp" ||
                    post.huvudtyp === "annat") && (
                    <label className="mt-3 block text-sm">
                      <span className="text-xs font-medium text-muted">
                        Färg / kulör (valfritt)
                      </span>
                      <input
                        type="text"
                        value={post.kulor ?? ""}
                        onChange={(e) =>
                          uppdateraBelaggning(
                            redigeraPost(belaggning, post.id, {
                              kulor: e.target.value,
                            }),
                          )
                        }
                        className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                      />
                    </label>
                  )}
                  <label className="mt-3 block text-sm">
                    <span className="text-xs font-medium text-muted">
                      Ytbehandling (valfritt)
                    </span>
                    <select
                      value={post.ytbehandling ?? ""}
                      onChange={(e) =>
                        uppdateraBelaggning(
                          redigeraPost(belaggning, post.id, {
                            ytbehandling: e.target.value,
                          }),
                        )
                      }
                      className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                    >
                      <option value="">—</option>
                      {takYtbehandlingAlternativ.map((y) => (
                        <option key={y.id} value={y.id}>
                          {y.etikett}
                        </option>
                      ))}
                    </select>
                  </label>
                  <p className="mt-2 text-[11px] leading-relaxed text-muted">
                    {
                      huvudtyper.find((h) => h.id === post.huvudtyp)
                        ?.beskrivning
                    }
                    {post.huvudtyp === "plat-bandlagd"
                      ? ` ${takBelaggningBandlagdMaterial.find((m) => m.id === (post.bandlagdMaterial ?? "stalplat"))?.underhall ?? ""}`
                      : ""}
                  </p>
                </>
              ) : null}
              {!materialvalAsSelect ? (
                <>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {huvudtyper.map((h) =>
                      valKnapp(
                        post.huvudtyp === h.id,
                        () =>
                          uppdateraBelaggning(
                            redigeraPost(belaggning, post.id, {
                              huvudtyp: h.id,
                              ...(h.id === "tegel"
                                ? {
                                    tegelTyp: "betongpannor" as TegelTyp,
                                    tegelKulor: post.tegelKulor ?? "",
                                  }
                                : {}),
                              ...(h.id === "plat-korrigerad"
                                ? {
                                    korrigeradInfastning:
                                      "spik" as KorrigeradInfastning,
                                  }
                                : {}),
                              ...(h.id === "plat-bandlagd"
                                ? {
                                    bandlagdMaterial:
                                      "stalplat" as BandlagdPlatMaterial,
                                  }
                                : {}),
                            }),
                          ),
                        h.etikett,
                        `${post.id}-${h.id}`,
                      ),
                    )}
                  </div>
                  <p className="mt-2 text-[11px] leading-relaxed text-muted">
                    {
                      huvudtyper.find((h) => h.id === post.huvudtyp)
                        ?.beskrivning
                    }
                  </p>

                  {post.huvudtyp === "tegel" && (
                    <div className="mt-3 space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {takBelaggningTegelTyper.map((t) =>
                          valKnapp(
                            post.tegelTyp === t.id,
                            () =>
                              uppdateraBelaggning(
                                redigeraPost(belaggning, post.id, {
                                  tegelTyp: t.id,
                                }),
                              ),
                            t.etikett,
                            `${post.id}-tegel-${t.id}`,
                          ),
                        )}
                      </div>
                      <label className="block text-sm">
                        <span className="text-xs font-medium text-muted">
                          Kulör
                        </span>
                        <input
                          type="text"
                          value={post.tegelKulor ?? ""}
                          onChange={(e) =>
                            uppdateraBelaggning(
                              redigeraPost(belaggning, post.id, {
                                tegelKulor: e.target.value,
                              }),
                            )
                          }
                          placeholder="t.ex. röd, svart glaserad, tegelröd"
                          className="mt-1 w-full max-w-md rounded-lg border border-border px-3 py-2 text-sm"
                        />
                      </label>
                    </div>
                  )}

                  {post.huvudtyp === "plat-korrigerad" && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-muted">
                        Infästning
                      </p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {valKnapp(
                          post.korrigeradInfastning !== "skruv",
                          () =>
                            uppdateraBelaggning(
                              redigeraPost(belaggning, post.id, {
                                korrigeradInfastning: "spik",
                              }),
                            ),
                          "Spikad",
                        )}
                        {valKnapp(
                          post.korrigeradInfastning === "skruv",
                          () =>
                            uppdateraBelaggning(
                              redigeraPost(belaggning, post.id, {
                                korrigeradInfastning: "skruv",
                              }),
                            ),
                          "Skruvad",
                        )}
                      </div>
                      <PlatKulorFalt
                        kulor={post.korrigeradKulor}
                        etikett="Kulör (korrugerad plåt)"
                        onChange={(kulor) =>
                          uppdateraBelaggning(
                            redigeraPost(belaggning, post.id, {
                              korrigeradKulor: kulor,
                            }),
                          )
                        }
                      />
                    </div>
                  )}

                  {post.huvudtyp === "plat-bandlagd" && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-medium text-muted">Material</p>
                      <div className="flex flex-wrap gap-2">
                        {takBelaggningBandlagdMaterial.map((m) =>
                          valKnapp(
                            (post.bandlagdMaterial ?? "stalplat") === m.id,
                            () =>
                              uppdateraBelaggning(
                                redigeraPost(belaggning, post.id, {
                                  bandlagdMaterial: m.id,
                                  aluminiumLackerad:
                                    m.id === "aluminium"
                                      ? post.aluminiumLackerad
                                      : undefined,
                                }),
                              ),
                            m.etikett,
                            `${post.id}-band-${m.id}`,
                          ),
                        )}
                      </div>
                      {(post.bandlagdMaterial ?? "stalplat") === "stalplat" && (
                        <PlatKulorFalt
                          kulor={post.bandlagdKulor}
                          onChange={(kulor) =>
                            uppdateraBelaggning(
                              redigeraPost(belaggning, post.id, {
                                bandlagdKulor: kulor,
                              }),
                            )
                          }
                        />
                      )}
                      {post.bandlagdMaterial === "aluminium" && (
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={post.aluminiumLackerad === true}
                            onChange={(e) =>
                              uppdateraBelaggning(
                                redigeraPost(belaggning, post.id, {
                                  aluminiumLackerad: e.target.checked,
                                }),
                              )
                            }
                          />
                          <span>Lackerad aluminium (kan målas om)</span>
                        </label>
                      )}
                      <p className="text-[11px] text-muted">
                        {
                          takBelaggningBandlagdMaterial.find(
                            (m) =>
                              m.id === (post.bandlagdMaterial ?? "stalplat"),
                          )?.underhall
                        }
                      </p>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={laggTill}
          className="mt-3 rounded-lg border border-primary px-3 py-2 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
        >
          + Lägg till takparti
        </button>
        {formateraTakBelaggning(belaggning) && (
          <p className="mt-2 text-xs font-medium text-primary-dark">
            Vald beläggning: {formateraTakBelaggning(belaggning)}
          </p>
        )}
      </fieldset>

      <div className="rounded-lg border border-amber-200/80 bg-amber-50/60 px-3 py-2 text-xs text-amber-950">
        <p className="font-semibold">Underhåll rengöring och målning</p>
        <p className="mt-1">
          Rengöring kan planeras på alla tak. Målning gäller främst målad plåt
          — inte koppar (patina), zink, rostfritt eller obehandlad aluminium.
        </p>
        {kanMalas ? (
          <p className="mt-1 font-medium text-primary-dark">
            Er valda beläggning kan inkludera takmålning i planen.
          </p>
        ) : poster.length > 0 ? (
          <p className="mt-1">
            Med nuvarande val planeras rengöring och kontroll — inte ommålning
            av takytan.
          </p>
        ) : null}
      </div>

      {!steg2Lage && (
        <YtaOchMaterialAiHjalp
          typ="Tak"
          grund={grund}
          komponentData={data}
          registerKvm={värde}
          onApplyKvm={(kvm) => onMåttChange({ värde: kvm })}
        />
      )}

      <label className="block max-w-xs text-sm">
        <span className="text-xs font-medium text-muted">
          Total takyta ({enhetInfo.enhet})
        </span>
        {kvmFranDelar > 0 && (
          <span className="mt-0.5 block text-[11px] text-muted">
            Summering från m² per del: {kvmFranDelar.toLocaleString("sv-SE")}{" "}
            m²
            {steg2Lage ? "." : " — kan justeras manuellt."}
          </span>
        )}
        <input
          type="text"
          inputMode="decimal"
          value={värde}
          onChange={(e) => onMåttChange({ värde: e.target.value })}
          placeholder="m²"
          readOnly={steg2Lage && kvmFranDelar > 0}
          className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm read-only:bg-[#f7f9f8]"
        />
      </label>

      {!steg2Lage && (
        <TakYtaSammanstallning
          grund={grund}
          registerTakKvm={värde}
          onApplyGrundSummaTillRegister={(kvm) =>
            onMåttChange({ värde: kvm })
          }
        />
      )}
    </div>
  );
}
