"use client";

import { useState } from "react";
import { ListaSummeringPanel } from "@/components/underhallsplan/ListaSummeringPanel";
import {
  hamtaStamventilModellDef,
  stamventilModellKategorier,
  stamventilModellerPerKategori,
  type StamventilModellId,
} from "@/components/underhallsplan/stamventiler";
import {
  formateraVarmeStamHojd,
  skapaTomVarmeRadiatorGrupp,
  varmeAvstandAlternativ,
  varmeBjalklagAlternativ,
  varmeElementAlternativ,
  varmeRadiatorStorlekar,
  varmeRorDimensioner,
  varmeTakhojdAlternativ,
  varmeVaningarAlternativ,
  type VarmeAvstandId,
  type VarmeBjalklagId,
  type VarmeElementAntalId,
  type VarmeRadiatorGrupp,
  type VarmeRadiatorStorlekId,
  type VarmeRorDimensionId,
  type VarmeTakhojdId,
} from "@/components/underhallsplan/vvs-varme";
import {
  formatSummeringTal,
} from "@/components/underhallsplan/lista-summering";
import {
  normaliseraVarmestammarData,
  normaliseraVarmestamPost,
  skapaTomVarmestamPost,
  summeraVarmestammarData,
  varmestamRumVolymKbm,
  varmestamRumYtaKvm,
  varmestamVaningsLangder,
  type VarmestammarData,
  type VarmestamPost,
} from "@/components/underhallsplan/varmestammar";

type VarmestammarPanelProps = {
  data: VarmestammarData;
  onChange: (data: VarmestammarData) => void;
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

function VentilSelect({
  value,
  onChange,
}: {
  value: StamventilModellId | "";
  onChange: (modell: StamventilModellId) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as StamventilModellId)}
      className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
    >
      {stamventilModellKategorier.map((kategori) => (
        <optgroup key={kategori.id} label={kategori.etikett}>
          {stamventilModellerPerKategori(kategori.id).map((m) => (
            <option key={m.id} value={m.id}>
              {m.etikett}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}

async function lasVentilBild(
  file: File,
): Promise<{ dataUrl: string; filnamn: string } | null> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const bild = new Image();
      bild.onload = () => resolve(bild);
      bild.onerror = () => reject(new Error("bild"));
      bild.src = url;
    });
    const max = 1280;
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.width * scale));
    canvas.height = Math.max(1, Math.round(img.height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.72);
    if (dataUrl.length > 900_000) return null;
    return { dataUrl, filnamn: file.name };
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function StamventilBildFalt({
  rubrik,
  dataUrl,
  filnamn,
  fel,
  onBild,
  onTaBort,
  onFel,
}: {
  rubrik: string;
  dataUrl: string;
  filnamn: string;
  fel?: string;
  onBild: (bild: { dataUrl: string; filnamn: string }) => void;
  onTaBort: () => void;
  onFel: (meddelande: string) => void;
}) {
  return (
    <div className="mt-2">
      <span className="text-xs font-medium text-muted">{rubrik}</span>
      {dataUrl ? (
        <div className="mt-1 flex flex-wrap items-start gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={dataUrl}
            alt={filnamn || rubrik}
            className="h-24 w-32 rounded-lg border border-border object-cover"
          />
          <div className="space-y-2">
            {filnamn ? <p className="text-xs text-muted">{filnamn}</p> : null}
            <button
              type="button"
              onClick={onTaBort}
              className="text-xs text-muted underline hover:text-red-700"
            >
              Ta bort bild
            </button>
          </div>
        </div>
      ) : (
        <input
          type="file"
          accept="image/*"
          className="mt-1 block w-full text-xs text-muted file:mr-2 file:rounded-md file:border-0 file:bg-primary/10 file:px-2 file:py-1.5 file:text-xs file:font-medium file:text-primary-dark"
          onChange={(e) => {
            const fil = e.target.files?.[0];
            e.target.value = "";
            if (!fil) return;
            void lasVentilBild(fil).then((bild) => {
              if (bild) onBild(bild);
              else onFel("Bilden kunde inte läsas. Välj en mindre bild.");
            });
          }}
        />
      )}
      {fel ? <p className="mt-1 text-xs text-red-700">{fel}</p> : null}
    </div>
  );
}

export function VarmestammarPanel({ data, onChange }: VarmestammarPanelProps) {
  const d = normaliseraVarmestammarData(data);
  const [bildFel, setBildFel] = useState<Record<string, string>>({});

  function spara(patch: Partial<VarmestammarData>) {
    onChange(normaliseraVarmestammarData({ ...d, ...patch }));
  }

  function uppdateraPost(id: string, patch: Partial<VarmestamPost>) {
    spara({
      poster: d.poster.map((p) =>
        p.id === id ? normaliseraVarmestamPost({ ...p, ...patch }) : p,
      ),
    });
  }

  function läggTill() {
    const nr = d.poster.length + 1;
    spara({
      poster: [
        ...d.poster,
        skapaTomVarmestamPost(d.poster.length === 0 ? "Stam 1" : `Stam ${nr}`),
      ],
    });
  }

  function taBort(id: string) {
    spara({ poster: d.poster.filter((p) => p.id !== id) });
  }

  function uppdateraRadiatorGrupp(
    stamId: string,
    gruppId: string,
    patch: Partial<VarmeRadiatorGrupp>,
  ) {
    const stam = d.poster.find((p) => p.id === stamId);
    if (!stam) return;
    uppdateraPost(stamId, {
      radiatorGrupper: stam.radiatorGrupper.map((g) =>
        g.id === gruppId ? { ...g, ...patch } : g,
      ),
    });
  }

  return (
    <div className="space-y-4">
      <p className="text-xs leading-relaxed text-muted">
        Den horisontella stamledningen värme ligger i källaren och matar alla
        värmestammar som går upp i huset. Varje stam ska ha ett eget namn — det
        underlättar service när det finns några få eller uppåt tjugo stammar.
        Första ventilen sitter där stammen går upp (ofta avstängning), sista
        där den kommer tillbaka (ofta TA-STAD för injustering och mätning).
      </p>

      <div className="rounded-lg border border-border bg-white p-3 sm:p-4">
        <p className="text-xs font-semibold text-primary-dark">
          Horisontell stamledning värme
        </p>
        <p className="mt-1 text-[11px] leading-relaxed text-muted">
          Gemensam ledning i källaren. Från denna går värmestammarna upp i
          fastigheten — tillopp ut från undercentralen, retur tillbaka.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-xs font-medium text-muted">
              Tillopp (löpmeter)
            </span>
            <input
              type="number"
              min={0}
              step={0.1}
              value={d.stamledningTilloppLopmeter}
              onChange={(e) =>
                spara({ stamledningTilloppLopmeter: e.target.value })
              }
              placeholder="t.ex. 40"
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-medium text-muted">
              Retur (löpmeter)
            </span>
            <input
              type="number"
              min={0}
              step={0.1}
              value={d.stamledningReturLopmeter}
              onChange={(e) =>
                spara({ stamledningReturLopmeter: e.target.value })
              }
              placeholder="t.ex. 40"
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
            />
          </label>
        </div>
      </div>

      {d.poster.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-white px-3 py-4 text-center text-xs text-muted">
          Inga värmestammar registrerade — lägg till nedan.
        </p>
      ) : (
        <ul className="space-y-3">
          {d.poster.map((post, index) => {
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
                  Ge varje stam ett tydligt namn (t.ex. Stam 1, Trapphus B,
                  Gårdsfasad). Det underlättar service och åtgärder.
                </p>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm">
                    <span className="text-xs font-medium text-muted">Namn</span>
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
                  Stamventiler
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-muted">
                  Välj modell på både tillopp och retur. Lägg gärna en bild på
                  respektive ventil — underlättar service och anbud.
                </p>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-border/80 bg-[#fafcfa] p-3">
                    <label className="block text-sm">
                      <span className="text-xs font-medium text-muted">
                        Tilloppsventil (går upp)
                      </span>
                      <VentilSelect
                        value={p.tilloppsventil}
                        onChange={(tilloppsventil) =>
                          uppdateraPost(post.id, {
                            tilloppsventil,
                            tilloppsventilAnnan:
                              tilloppsventil === "annat"
                                ? p.tilloppsventilAnnan
                                : "",
                          })
                        }
                      />
                      {hamtaStamventilModellDef(
                        p.tilloppsventil || "avstangningsventil",
                      )?.beskrivning && (
                        <span className="mt-1 block text-[11px] text-muted">
                          {
                            hamtaStamventilModellDef(
                              p.tilloppsventil || "avstangningsventil",
                            )?.beskrivning
                          }
                        </span>
                      )}
                    </label>
                    {p.tilloppsventil === "annat" && (
                      <input
                        type="text"
                        value={p.tilloppsventilAnnan}
                        onChange={(e) =>
                          uppdateraPost(post.id, {
                            tilloppsventilAnnan: e.target.value,
                          })
                        }
                        placeholder="Ange fabrikat och modell"
                        className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                      />
                    )}
                    <StamventilBildFalt
                      rubrik="Bild tilloppsventil"
                      dataUrl={p.tilloppsventilBildDataUrl}
                      filnamn={p.tilloppsventilBildFilnamn}
                      fel={bildFel[`${post.id}-tillopp`]}
                      onFel={(meddelande) =>
                        setBildFel((prev) => ({
                          ...prev,
                          [`${post.id}-tillopp`]: meddelande,
                        }))
                      }
                      onBild={(bild) => {
                        setBildFel((prev) => {
                          const next = { ...prev };
                          delete next[`${post.id}-tillopp`];
                          return next;
                        });
                        uppdateraPost(post.id, {
                          tilloppsventilBildDataUrl: bild.dataUrl,
                          tilloppsventilBildFilnamn: bild.filnamn,
                        });
                      }}
                      onTaBort={() => {
                        setBildFel((prev) => {
                          const next = { ...prev };
                          delete next[`${post.id}-tillopp`];
                          return next;
                        });
                        uppdateraPost(post.id, {
                          tilloppsventilBildDataUrl: "",
                          tilloppsventilBildFilnamn: "",
                        });
                      }}
                    />
                  </div>

                  <div className="rounded-lg border border-border/80 bg-[#fafcfa] p-3">
                    <label className="block text-sm">
                      <span className="text-xs font-medium text-muted">
                        Returventil (kommer tillbaka)
                      </span>
                      <VentilSelect
                        value={p.returventil}
                        onChange={(returventil) =>
                          uppdateraPost(post.id, {
                            returventil,
                            returventilAnnan:
                              returventil === "annat" ? p.returventilAnnan : "",
                          })
                        }
                      />
                      {hamtaStamventilModellDef(p.returventil || "ta-stad")
                        ?.beskrivning && (
                        <span className="mt-1 block text-[11px] text-muted">
                          {
                            hamtaStamventilModellDef(p.returventil || "ta-stad")
                              ?.beskrivning
                          }
                        </span>
                      )}
                    </label>
                    {p.returventil === "annat" && (
                      <input
                        type="text"
                        value={p.returventilAnnan}
                        onChange={(e) =>
                          uppdateraPost(post.id, {
                            returventilAnnan: e.target.value,
                          })
                        }
                        placeholder="Ange fabrikat och modell"
                        className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                      />
                    )}
                    <StamventilBildFalt
                      rubrik="Bild returventil"
                      dataUrl={p.returventilBildDataUrl}
                      filnamn={p.returventilBildFilnamn}
                      fel={bildFel[`${post.id}-retur`]}
                      onFel={(meddelande) =>
                        setBildFel((prev) => ({
                          ...prev,
                          [`${post.id}-retur`]: meddelande,
                        }))
                      }
                      onBild={(bild) => {
                        setBildFel((prev) => {
                          const next = { ...prev };
                          delete next[`${post.id}-retur`];
                          return next;
                        });
                        uppdateraPost(post.id, {
                          returventilBildDataUrl: bild.dataUrl,
                          returventilBildFilnamn: bild.filnamn,
                        });
                      }}
                      onTaBort={() => {
                        setBildFel((prev) => {
                          const next = { ...prev };
                          delete next[`${post.id}-retur`];
                          return next;
                        });
                        uppdateraPost(post.id, {
                          returventilBildDataUrl: "",
                          returventilBildFilnamn: "",
                        });
                      }}
                    />
                  </div>
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
                </div>

                {hojdText && (
                  <p className="mt-3 rounded-lg border border-primary/20 bg-[#eef6f0]/60 px-3 py-2 text-sm text-primary-dark">
                    Total stamhöjd: {hojdText}
                  </p>
                )}

                {varmestamVaningsLangder(p).length > 0 && (
                  <div className="mt-3 rounded-lg border border-border/70 bg-white px-3 py-2">
                    <p className="text-[11px] font-medium text-primary-dark">
                      Längd per våningsplan
                    </p>
                    <ul className="mt-1 space-y-0.5 text-[11px] text-muted">
                      {varmestamVaningsLangder(p).map((v) => (
                        <li key={v.vaning}>
                          Våning {v.vaning}:{" "}
                          {formatSummeringTal(v.inomVaningMeter)} m inom våning
                          (kumulativt {formatSummeringTal(v.kumulativMeter)} m)
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <p className="mt-4 text-xs font-semibold text-primary-dark">
                  Rum — yta och volym
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-muted">
                  Ange golvyta (m²) som stammen betjänar. Rumvolym (m³) räknas
                  automatiskt som golvyta × takhöjd — båda används som underlag
                  vid effektuppskattning inför injustering.
                </p>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm">
                    <span className="text-xs font-medium text-muted">
                      Golvyta (m²)
                    </span>
                    <input
                      type="number"
                      min={0}
                      step={0.1}
                      value={p.rumYtaKvm}
                      onChange={(e) =>
                        uppdateraPost(post.id, { rumYtaKvm: e.target.value })
                      }
                      placeholder="t.ex. 85"
                      className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                    />
                  </label>
                  <div className="rounded-lg border border-primary/20 bg-[#eef6f0]/60 px-3 py-2 text-sm text-primary-dark">
                    {varmestamRumVolymKbm(p) > 0 ? (
                      <>
                        Rumvolym: {formatSummeringTal(varmestamRumVolymKbm(p))}{" "}
                        m³
                        {varmestamRumYtaKvm(p) > 0 ? (
                          <span className="mt-0.5 block text-[11px] text-muted">
                            {formatSummeringTal(varmestamRumYtaKvm(p))} m² ×
                            takhöjd
                          </span>
                        ) : null}
                      </>
                    ) : (
                      <span className="text-xs text-muted">
                        Ange golvyta och takhöjd för rumvolym.
                      </span>
                    )}
                  </div>
                  <label className="block text-sm sm:col-span-2">
                    <span className="text-xs font-medium text-muted">
                      Rum / beskrivning
                    </span>
                    <input
                      type="text"
                      value={p.rumBeskrivning}
                      onChange={(e) =>
                        uppdateraPost(post.id, {
                          rumBeskrivning: e.target.value,
                        })
                      }
                      placeholder="t.ex. vardagsrum 22 m², två sovrum"
                      className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                    />
                  </label>
                </div>

                <p className="mt-4 text-xs font-semibold text-primary-dark">
                  Radiatorer på stammen
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-muted">
                  Storlek och antal behövs i injusteringsunderlaget. En rad per
                  kombination som är lika.
                </p>
                {p.radiatorGrupper.length > 0 && (
                  <ul className="mt-3 space-y-3">
                    {p.radiatorGrupper.map((grupp, gruppIndex) => (
                      <li
                        key={grupp.id}
                        className="rounded-lg border border-border bg-[#fafcfa] p-3"
                      >
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <span className="text-xs font-medium text-foreground">
                            Placering {gruppIndex + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              uppdateraPost(post.id, {
                                radiatorGrupper: p.radiatorGrupper.filter(
                                  (rad) => rad.id !== grupp.id,
                                ),
                              })
                            }
                            className="text-xs text-muted hover:text-red-700"
                          >
                            Ta bort
                          </button>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <label className="block text-sm">
                            <span className="text-xs font-medium text-muted">
                              Antal placeringar
                            </span>
                            <input
                              type="number"
                              min={0}
                              step={1}
                              value={grupp.antalPlaceringar}
                              onChange={(e) =>
                                uppdateraRadiatorGrupp(post.id, grupp.id, {
                                  antalPlaceringar: e.target.value,
                                })
                              }
                              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                            />
                          </label>
                          <label className="block text-sm">
                            <span className="text-xs font-medium text-muted">
                              Element per placering
                            </span>
                            <select
                              value={grupp.elementAntal}
                              onChange={(e) =>
                                uppdateraRadiatorGrupp(post.id, grupp.id, {
                                  elementAntal: e.target
                                    .value as VarmeElementAntalId,
                                })
                              }
                              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                            >
                              {varmeElementAlternativ.map((a) => (
                                <option key={a.id} value={a.id}>
                                  {a.etikett}
                                </option>
                              ))}
                            </select>
                          </label>
                          {grupp.elementAntal === "annat" && (
                            <label className="block text-sm">
                              <span className="text-xs font-medium text-muted">
                                Eget antal element
                              </span>
                              <input
                                type="number"
                                min={0}
                                step={1}
                                value={grupp.elementAnnan}
                                onChange={(e) =>
                                  uppdateraRadiatorGrupp(post.id, grupp.id, {
                                    elementAnnan: e.target.value,
                                  })
                                }
                                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                              />
                            </label>
                          )}
                          <label className="block text-sm">
                            <span className="text-xs font-medium text-muted">
                              Storlek
                            </span>
                            <select
                              value={grupp.storlek}
                              onChange={(e) =>
                                uppdateraRadiatorGrupp(post.id, grupp.id, {
                                  storlek: e.target
                                    .value as VarmeRadiatorStorlekId,
                                })
                              }
                              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                            >
                              {varmeRadiatorStorlekar.map((a) => (
                                <option key={a.id} value={a.id}>
                                  {a.etikett}
                                </option>
                              ))}
                            </select>
                          </label>
                          {grupp.storlek === "annat" && (
                            <label className="block text-sm">
                              <span className="text-xs font-medium text-muted">
                                Egen storlek
                              </span>
                              <input
                                type="text"
                                value={grupp.storlekAnnan}
                                onChange={(e) =>
                                  uppdateraRadiatorGrupp(post.id, grupp.id, {
                                    storlekAnnan: e.target.value,
                                  })
                                }
                                placeholder="t.ex. 500×1400 mm"
                                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                              />
                            </label>
                          )}
                          <label className="block text-sm">
                            <span className="text-xs font-medium text-muted">
                              Avstånd från stammen
                            </span>
                            <select
                              value={grupp.avstand}
                              onChange={(e) =>
                                uppdateraRadiatorGrupp(post.id, grupp.id, {
                                  avstand: e.target.value as VarmeAvstandId,
                                })
                              }
                              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                            >
                              {varmeAvstandAlternativ.map((a) => (
                                <option key={a.id} value={a.id}>
                                  {a.etikett}
                                </option>
                              ))}
                            </select>
                          </label>
                          {grupp.avstand === "annat" && (
                            <label className="block text-sm">
                              <span className="text-xs font-medium text-muted">
                                Eget avstånd (m)
                              </span>
                              <input
                                type="number"
                                min={0}
                                step={0.1}
                                value={grupp.avstandAnnan}
                                onChange={(e) =>
                                  uppdateraRadiatorGrupp(post.id, grupp.id, {
                                    avstandAnnan: e.target.value,
                                  })
                                }
                                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                              />
                            </label>
                          )}
                          <label className="block text-sm">
                            <span className="text-xs font-medium text-muted">
                              Dimension anslutningsrör
                            </span>
                            <select
                              value={grupp.rordimension}
                              onChange={(e) =>
                                uppdateraRadiatorGrupp(post.id, grupp.id, {
                                  rordimension: e.target
                                    .value as VarmeRorDimensionId,
                                })
                              }
                              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                            >
                              {varmeRorDimensioner.map((a) => (
                                <option key={a.id} value={a.id}>
                                  {a.etikett}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <button
                  type="button"
                  onClick={() =>
                    uppdateraPost(post.id, {
                      radiatorGrupper: [
                        ...p.radiatorGrupper,
                        skapaTomVarmeRadiatorGrupp(),
                      ],
                    })
                  }
                  className="mt-3 rounded-lg border border-primary/40 px-3 py-2 text-xs font-medium text-primary-dark hover:bg-[#eef6f0]"
                >
                  + Lägg till radiatorer
                </button>
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

      {(d.poster.length > 0 ||
        d.stamledningTilloppLopmeter ||
        d.stamledningReturLopmeter) && (
        <ListaSummeringPanel
          titel="Sammanställning värmestammar"
          rader={summeraVarmestammarData(d)}
        />
      )}
    </div>
  );
}
