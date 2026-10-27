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
  takBelaggningTegelTyper,
  type BandlagdPlatMaterial,
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
  onBelaggningChange: (next: TakBelaggningData) => void;
  onMåttChange: (patch: { måttenhet?: Måttenhet; värde?: string }) => void;
};

const huvudtyper: {
  id: TakBelaggningHuvudtyp;
  etikett: string;
  beskrivning: string;
}[] = [
  {
    id: "tegel",
    etikett: "Tegel",
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
    etikett: "Papp / underlag",
    beskrivning: "Papptak eller underlag — yta i m².",
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
}: TakbelaggningPanelProps) {
  const enhetInfo = måttenhetEtiketter[måttenhet];
  const poster = belaggning.belaggningar;
  const kvmFranDelar = summeraTakBelaggningKvm(belaggning);

  function uppdateraBelaggning(next: TakBelaggningData) {
    onBelaggningChange(next);
    const summaKvm = summeraTakBelaggningKvm(next);
    if (summaKvm > 0) {
      onMåttChange({
        måttenhet: "kvm",
        värde: String(Math.round(summaKvm * 10) / 10),
      });
    }
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
          Takbeläggning — byggnadsdelar och material
        </legend>
        <p className="mt-1 text-xs text-muted">
          Lägg till en rad per takparti (t.ex. koppar tak mot gård). Välj
          material och ange mängd som yta (m²), antal eller styck. Total takyta
          i m² fylls i automatiskt när du anger m² per del. Nock och ränndalar
          registreras som löpmeter under övriga takdelar.
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
                  Beläggning {index + 1}
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
                  <span className="text-xs font-medium text-muted">Mängd</span>
                  <input
                    type="number"
                    min={0}
                    step={
                      (post.mangdEnhet ?? "kvm") === "kvm" ? 0.1 : 1
                    }
                    value={post.mangd ?? ""}
                    onChange={(e) =>
                      uppdateraBelaggning(
                        redigeraPost(belaggning, post.id, {
                          mangd: e.target.value,
                        }),
                      )
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
                            ? { korrigeradInfastning: "spik" as KorrigeradInfastning }
                            : {}),
                          ...(h.id === "plat-bandlagd"
                            ? { bandlagdMaterial: "stalplat" as BandlagdPlatMaterial }
                            : {}),
                        }),
                      ),
                    h.etikett,
                    `${post.id}-${h.id}`,
                  ),
                )}
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-muted">
                {huvudtyper.find((h) => h.id === post.huvudtyp)?.beskrivning}
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
                    <span className="text-xs font-medium text-muted">Kulör</span>
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
                  <p className="text-xs font-medium text-muted">Infästning</p>
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
                        (m) => m.id === (post.bandlagdMaterial ?? "stalplat"),
                      )?.underhall
                    }
                  </p>
                </div>
              )}
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

      <YtaOchMaterialAiHjalp
        typ="Tak"
        grund={grund}
        komponentData={data}
        registerKvm={värde}
        onApplyKvm={(kvm) => onMåttChange({ värde: kvm })}
      />

      <label className="block max-w-xs text-sm">
        <span className="text-xs font-medium text-muted">
          Total takyta ({enhetInfo.enhet})
        </span>
        {kvmFranDelar > 0 && (
          <span className="mt-0.5 block text-[11px] text-muted">
            Summering från m² per del: {kvmFranDelar.toLocaleString("sv-SE")}{" "}
            m² — kan justeras manuellt.
          </span>
        )}
        <input
          type="number"
          min={0}
          step={0.1}
          value={värde}
          onChange={(e) => onMåttChange({ värde: e.target.value })}
          placeholder="m²"
          className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
        />
      </label>

      <TakYtaSammanstallning
        grund={grund}
        registerTakKvm={värde}
        onApplyGrundSummaTillRegister={(kvm) => onMåttChange({ värde: kvm })}
      />
    </div>
  );
}
