"use client";

import { useState } from "react";
import {
  hamtaStamventilModellDef,
  stamventilModellKategorier,
  stamventilModellerPerKategori,
  type StamventilModellId,
} from "@/components/underhallsplan/stamventiler";
import {
  formateraRadiatorTypPost,
  type RadiatorTypPost,
} from "@/components/underhallsplan/radiator-typer";
import {
  formateraVarmeStamHojd,
  skapaTomVarmeRadiatorGrupp,
  VARME_RADIATOR_TYP_SAKNAS,
  varmeAvstandAlternativ,
  varmeBjalklagAlternativ,
  varmeElementAlternativ,
  varmeRorDimensioner,
  varmeStamRorDimensioner,
  varmeTakhojdAlternativ,
  varmeVaningarAlternativ,
  type VarmeAvstandId,
  type VarmeBjalklagId,
  type VarmeElementAntalId,
  type VarmeRadiatorGrupp,
  type VarmeRorDimensionId,
  type VarmeTakhojdId,
} from "@/components/underhallsplan/vvs-varme";
import {
  formatSummeringTal,
} from "@/components/underhallsplan/lista-summering";
import {
  formateraVarmestamMarkning,
  formateraVarmestamNummer,
  nastastaStamnummer,
  normaliseraHorisontellLedning,
  normaliseraVarmestammarData,
  normaliseraVarmestamPost,
  skapaTomHorisontellLedning,
  skapaTomVarmestamPost,
  VARME_BADRUMSSCHAKT_INFO,
  VARME_LIVSLANGD_INFO,
  VARME_TRYCKFALL_INFO,
  varmestamRumVolymKbm,
  varmestamRumYtaKvm,
  varmestamVaningsLangder,
  varmeHorisontellLangdAvserAlternativ,
  varmeRormaterialAlternativ,
  varmeSystemTypAlternativ,
  type VarmeHorisontellLangdAvser,
  type VarmeHorisontellLedning,
  type VarmeRormaterialId,
  type VarmeSystemTypId,
  type VarmestammarData,
  type VarmestamPost,
} from "@/components/underhallsplan/varmestammar";
import { VarmeSammanstallningPanel } from "@/components/underhallsplan/VarmeSammanstallningPanel";
import { VarmeStamOversiktKort } from "@/components/underhallsplan/VarmeStamOversiktKort";
type VarmestammarPanelProps = {
  data: VarmestammarData;
  onChange: (data: VarmestammarData) => void;
  /** Radiatortyper från grunduppgifter. */
  radiatorTyper?: RadiatorTypPost[];
  foreningNamn?: string;
};

function tillHojdStam(post: VarmestamPost) {
  return {
    id: post.id,
    namn: post.namn,
    markningKallare: formateraVarmestamMarkning(post.stamnummer, "stam"),
    adress: post.placering,
    betjanar: post.betjanar,
    vaningar: post.vaningar,
    takhojd: post.takhojd,
    takhojdAnnan: post.takhojdAnnan,
    bjalklag: post.bjalklag,
    bjalklagAnnan: post.bjalklagAnnan,
    rumStorlek: "",
    radiatorAntal: "",
    stamRordimension: post.rordimensionTillopp || post.rordimension,
    stamRordimensionAnnan:
      post.rordimensionTilloppAnnan || post.rordimensionAnnan,
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

function InfoSektion({
  rubrik,
  text,
}: {
  rubrik: string;
  text: string;
}) {
  return (
    <details className="rounded-lg border border-border/80 bg-[#f7faf8] px-3 py-2">
      <summary className="cursor-pointer text-xs font-semibold text-primary-dark">
        {rubrik}
      </summary>
      <div className="mt-2 space-y-2 text-[11px] leading-relaxed text-muted whitespace-pre-line">
        {text}
      </div>
    </details>
  );
}

function RorDimensionValjare({
  label,
  value,
  annan,
  ytterdiameterMm,
  onChange,
}: {
  label: string;
  value: VarmeRorDimensionId | "";
  annan: string;
  ytterdiameterMm: string;
  onChange: (patch: {
    rordimension?: VarmeRorDimensionId | "";
    rordimensionAnnan?: string;
    ytterdiameterMm?: string;
  }) => void;
}) {
  const iStandardlista = varmeStamRorDimensioner.some((a) => a.id === value);
  const selectValue =
    !value || iStandardlista || value === "annat"
      ? value
      : "annat";
  return (
    <label className="block text-sm">
      <span className="text-xs font-medium text-muted">{label}</span>
      <select
        value={selectValue}
        onChange={(e) => {
          const next = e.target.value as VarmeRorDimensionId | "";
          onChange({
            rordimension: next,
            rordimensionAnnan:
              next === "annat"
                ? annan || (value && !iStandardlista ? value : "")
                : "",
          });
        }}
        className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
      >
        <option value="">— ej angiven —</option>
        {varmeStamRorDimensioner.map((a) => (
          <option key={a.id} value={a.id}>
            {a.etikett}
          </option>
        ))}
      </select>
      {(selectValue === "annat" || (!iStandardlista && value)) && (
        <input
          type="text"
          value={annan || (!iStandardlista && value !== "annat" ? value : "")}
          onChange={(e) =>
            onChange({
              rordimension: "annat",
              rordimensionAnnan: e.target.value,
            })
          }
          placeholder="Ange dimension manuellt"
          className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
        />
      )}
      <input
        type="number"
        min={0}
        step={0.1}
        value={ytterdiameterMm}
        onChange={(e) => onChange({ ytterdiameterMm: e.target.value })}
        placeholder="Ytterdiameter (mm), valfritt"
        className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
      />
    </label>
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

export function VarmestammarPanel({
  data,
  onChange,
  radiatorTyper = [],
  foreningNamn = "",
}: VarmestammarPanelProps) {
  const d = normaliseraVarmestammarData(data);
  const [bildFel, setBildFel] = useState<Record<string, string>>({});
  const katalog = radiatorTyper;

  function spara(patch: Partial<VarmestammarData>) {
    const next = normaliseraVarmestammarData({ ...d, ...patch });
    // Håll legacy-fält synkade för äldre vyer (utan att åter-migrera listan)
    const tillopp = next.horisontellaLedningar
      .filter((l) => l.langdAvser === "tillopp")
      .reduce(
        (sum, l) =>
          sum + (Number.parseFloat(l.lopmeter.replace(",", ".")) || 0),
        0,
      );
    const retur = next.horisontellaLedningar
      .filter((l) => l.langdAvser === "retur")
      .reduce(
        (sum, l) =>
          sum + (Number.parseFloat(l.lopmeter.replace(",", ".")) || 0),
        0,
      );
    onChange({
      ...next,
      stamledningTilloppLopmeter: tillopp > 0 ? String(tillopp) : "",
      stamledningReturLopmeter: retur > 0 ? String(retur) : "",
    });
  }

  function uppdateraPost(id: string, patch: Partial<VarmestamPost>) {
    spara({
      poster: d.poster.map((p) =>
        p.id === id ? normaliseraVarmestamPost({ ...p, ...patch }) : p,
      ),
    });
  }

  function läggTill() {
    const nr = nastastaStamnummer(d.poster);
    const markning =
      d.systemTyp === "tva-ror"
        ? `${formateraVarmestamMarkning(nr, "tillopp")} / ${formateraVarmestamMarkning(nr, "retur")}`
        : formateraVarmestamMarkning(nr, "stam");
    const ny = skapaTomVarmestamPost(nr, markning);
    spara({
      poster: [
        ...d.poster,
        {
          ...ny,
          rordimensionTillopp: "dn25",
          rordimensionRetur: d.systemTyp === "tva-ror" ? "dn25" : "",
        },
      ],
    });
  }

  function taBort(id: string) {
    spara({ poster: d.poster.filter((p) => p.id !== id) });
  }

  function uppdateraLedning(
    id: string,
    patch: Partial<VarmeHorisontellLedning>,
  ) {
    spara({
      horisontellaLedningar: d.horisontellaLedningar.map((l) =>
        l.id === id
          ? normaliseraHorisontellLedning({ ...l, ...patch })
          : l,
      ),
    });
  }

  function läggTillLedning() {
    const defaultAvser: VarmeHorisontellLangdAvser =
      d.systemTyp === "en-ror" ? "enkel-ledning" : "tillopp";
    spara({
      horisontellaLedningar: [
        ...d.horisontellaLedningar,
        skapaTomHorisontellLedning(defaultAvser),
      ],
    });
  }

  function taBortLedning(id: string) {
    spara({
      horisontellaLedningar: d.horisontellaLedningar.filter((l) => l.id !== id),
    });
  }

  function bytSystemTyp(systemTyp: VarmeSystemTypId) {
    const ledningar = d.horisontellaLedningar.map((l) => {
      if (systemTyp === "en-ror" && l.langdAvser !== "enkel-ledning") {
        return normaliseraHorisontellLedning({
          ...l,
          langdAvser: "enkel-ledning",
        });
      }
      if (
        systemTyp === "tva-ror" &&
        l.langdAvser === "enkel-ledning"
      ) {
        return normaliseraHorisontellLedning({
          ...l,
          langdAvser: "tillopp",
        });
      }
      return l;
    });
    spara({ systemTyp, horisontellaLedningar: ledningar });
  }

  const langdAvserAlternativ = varmeHorisontellLangdAvserAlternativ.filter(
    (a) =>
      a.system === "bada" ||
      (d.systemTyp === "tva-ror" && a.system === "tva-ror") ||
      (d.systemTyp === "en-ror" && a.system === "en-ror"),
  );

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
        Börja med att välja systemtyp. Registrera därefter horisontella
        fördelningsledningar (ofta i källaren) och vertikala stampar. Varje
        stampar får ett unikt nummer — vid tvårörssystem märks tillopp och
        retur som VS-01-T / VS-01-R men räknas som en stam.
      </p>

      <div className="rounded-lg border border-border bg-white p-3 sm:p-4">
        <p className="text-xs font-semibold text-primary-dark">
          1. Val av värmesystem
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {varmeSystemTypAlternativ.map((alt) => {
            const vald = d.systemTyp === alt.id;
            return (
              <button
                key={alt.id}
                type="button"
                onClick={() => bytSystemTyp(alt.id)}
                className={`rounded-lg border px-3 py-3 text-left transition ${
                  vald
                    ? "border-primary bg-[#eef6f0] ring-1 ring-primary/30"
                    : "border-border bg-white hover:bg-[#f7faf8]"
                }`}
              >
                <span className="block text-sm font-semibold text-primary-dark">
                  {alt.etikett}
                  {alt.id === "tva-ror" ? " (förvalt)" : ""}
                </span>
                <span className="mt-1 block text-[11px] leading-relaxed text-muted">
                  {alt.beskrivning}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <InfoSektion
          rubrik="Livslängd och underhållsprincip"
          text={VARME_LIVSLANGD_INFO}
        />
        <InfoSektion rubrik="Tryckfall och läckage" text={VARME_TRYCKFALL_INFO} />
        <InfoSektion
          rubrik="Värmeledningar i badrumsschakt"
          text={VARME_BADRUMSSCHAKT_INFO}
        />
      </div>

      <div className="rounded-lg border border-border bg-white p-3 sm:p-4">
        <p className="text-xs font-semibold text-primary-dark">
          2. Horisontella värmeledningar
        </p>
        <p className="mt-1 text-[11px] leading-relaxed text-muted">
          Fördelningsledningar i källaren eller annan horisontell sträckning.
          Ange om längden avser en enskild ledning eller en gemensam
          sträckning där tillopp och retur går tillsammans — så undviks
          dubbelräkning i summeringen.
        </p>

        {d.horisontellaLedningar.length === 0 ? (
          <p className="mt-3 rounded-lg border border-dashed border-border px-3 py-3 text-center text-xs text-muted">
            Inga horisontella ledningar registrerade ännu.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {d.horisontellaLedningar.map((ledning, index) => (
              <li
                key={ledning.id}
                className="rounded-lg border border-border/80 bg-[#fafcfa] p-3"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-foreground">
                    Ledning {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => taBortLedning(ledning.id)}
                    className="text-xs text-muted hover:text-red-700"
                  >
                    Ta bort
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm">
                    <span className="text-xs font-medium text-muted">
                      Placering
                    </span>
                    <input
                      type="text"
                      value={ledning.placering}
                      onChange={(e) =>
                        uppdateraLedning(ledning.id, {
                          placering: e.target.value,
                        })
                      }
                      placeholder="t.ex. källare, längs gårdssida"
                      className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="text-xs font-medium text-muted">
                      Uppmätt rörlängd (m)
                    </span>
                    <input
                      type="number"
                      min={0}
                      step={0.1}
                      value={ledning.lopmeter}
                      onChange={(e) =>
                        uppdateraLedning(ledning.id, {
                          lopmeter: e.target.value,
                        })
                      }
                      placeholder="t.ex. 40"
                      className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block text-sm sm:col-span-2">
                    <span className="text-xs font-medium text-muted">
                      Längden avser
                    </span>
                    <select
                      value={ledning.langdAvser}
                      onChange={(e) =>
                        uppdateraLedning(ledning.id, {
                          langdAvser: e.target
                            .value as VarmeHorisontellLangdAvser,
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                    >
                      {langdAvserAlternativ.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.etikett}
                        </option>
                      ))}
                    </select>
                    <span className="mt-1 block text-[11px] text-muted">
                      {
                        langdAvserAlternativ.find(
                          (a) => a.id === ledning.langdAvser,
                        )?.beskrivning
                      }
                    </span>
                  </label>
                  <RorDimensionValjare
                    label="Rördimension"
                    value={ledning.rordimension}
                    annan={ledning.rordimensionAnnan}
                    ytterdiameterMm={ledning.ytterdiameterMm}
                    onChange={(patch) =>
                      uppdateraLedning(ledning.id, {
                        rordimension: patch.rordimension,
                        rordimensionAnnan: patch.rordimensionAnnan,
                        ytterdiameterMm: patch.ytterdiameterMm,
                      })
                    }
                  />
                  <label className="block text-sm">
                    <span className="text-xs font-medium text-muted">
                      Rörmaterial
                    </span>
                    <select
                      value={ledning.rormaterial}
                      onChange={(e) =>
                        uppdateraLedning(ledning.id, {
                          rormaterial: e.target.value as VarmeRormaterialId | "",
                          rormaterialAnnan:
                            e.target.value === "annat"
                              ? ledning.rormaterialAnnan
                              : "",
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                    >
                      <option value="">— ej angivet —</option>
                      {varmeRormaterialAlternativ.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.etikett}
                        </option>
                      ))}
                    </select>
                    {ledning.rormaterial === "annat" && (
                      <input
                        type="text"
                        value={ledning.rormaterialAnnan}
                        onChange={(e) =>
                          uppdateraLedning(ledning.id, {
                            rormaterialAnnan: e.target.value,
                          })
                        }
                        placeholder="Ange material"
                        className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                      />
                    )}
                  </label>
                  <label className="block text-sm sm:col-span-2">
                    <span className="text-xs font-medium text-muted">
                      Kommentar
                    </span>
                    <input
                      type="text"
                      value={ledning.kommentar}
                      onChange={(e) =>
                        uppdateraLedning(ledning.id, {
                          kommentar: e.target.value,
                        })
                      }
                      placeholder="Valfri kommentar"
                      className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                    />
                  </label>
                </div>
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          onClick={läggTillLedning}
          className="mt-3 w-full rounded-lg border border-primary/40 px-3 py-2 text-xs font-medium text-primary-dark hover:bg-[#eef6f0]"
        >
          + Lägg till horisontell ledning
        </button>
      </div>

      <div>
        <p className="text-xs font-semibold text-primary-dark">
          3. Vertikala värmestammar
        </p>
        <p className="mt-1 text-[11px] leading-relaxed text-muted">
          {d.systemTyp === "tva-ror"
            ? "Varje stampar får nummer som ger märkning VS-01-T (tillopp) och VS-01-R (retur). Samma nummer = samma stampar."
            : "Enrörssystem: varje slinga/stam får märkning VS-01, VS-02 osv. Beskriv slingor och radiatoranslutningar per stam."}
        </p>
      </div>

      {d.poster.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-white px-3 py-4 text-center text-xs text-muted">
          Inga värmestammar registrerade — lägg till nedan.
        </p>
      ) : (
        <ul className="space-y-3">
          {d.poster.map((post) => {
            const p = normaliseraVarmestamPost(post);
            const hojdText = formateraVarmeStamHojd(tillHojdStam(p));
            const markning =
              d.systemTyp === "tva-ror"
                ? `${formateraVarmestamMarkning(p.stamnummer, "tillopp")} / ${formateraVarmestamMarkning(p.stamnummer, "retur")}`
                : formateraVarmestamMarkning(p.stamnummer, "stam");
            return (
              <li
                key={post.id}
                className="rounded-lg border border-border bg-white p-3 sm:p-4"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-primary-dark">
                    {markning}
                    {p.namn && !p.namn.includes("VS-") ? ` · ${p.namn}` : ""}
                  </span>
                  <button
                    type="button"
                    onClick={() => taBort(post.id)}
                    className="text-xs text-muted hover:text-red-700"
                  >
                    Ta bort
                  </button>
                </div>

                <VarmeStamOversiktKort
                  post={p}
                  radiatorTyper={katalog}
                  systemTyp={d.systemTyp}
                />

                <p className="text-xs font-semibold text-primary-dark">
                  Stamnummer och placering
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-muted">
                  Stamnumret styr märkningen i registrering, sammanställning och
                  stamförteckning.
                </p>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm">
                    <span className="text-xs font-medium text-muted">
                      Stamnummer
                    </span>
                    <input
                      type="number"
                      min={1}
                      step={1}
                      value={p.stamnummer || ""}
                      onChange={(e) => {
                        const n = Number.parseInt(e.target.value, 10);
                        uppdateraPost(post.id, {
                          stamnummer:
                            Number.isFinite(n) && n > 0 ? n : p.stamnummer,
                        });
                      }}
                      className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                    />
                    <span className="mt-1 block text-[11px] text-muted">
                      {formateraVarmestamNummer(p.stamnummer)}
                      {d.systemTyp === "tva-ror"
                        ? ` → ${formateraVarmestamMarkning(p.stamnummer, "tillopp")} / ${formateraVarmestamMarkning(p.stamnummer, "retur")}`
                        : ""}
                    </span>
                  </label>
                  <label className="block text-sm">
                    <span className="text-xs font-medium text-muted">
                      Eget namn (valfritt)
                    </span>
                    <input
                      type="text"
                      value={p.namn}
                      onChange={(e) =>
                        uppdateraPost(post.id, { namn: e.target.value })
                      }
                      placeholder="t.ex. Trapphus A"
                      className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="text-xs font-medium text-muted">
                      Placering i byggnaden
                    </span>
                    <input
                      type="text"
                      value={p.placering}
                      onChange={(e) =>
                        uppdateraPost(post.id, { placering: e.target.value })
                      }
                      placeholder="t.ex. gårdsfasad, gavel"
                      className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="text-xs font-medium text-muted">
                      Trapphus
                    </span>
                    <input
                      type="text"
                      value={p.trapphus}
                      onChange={(e) =>
                        uppdateraPost(post.id, { trapphus: e.target.value })
                      }
                      placeholder="t.ex. A"
                      className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="text-xs font-medium text-muted">
                      Schaktbeteckning
                    </span>
                    <input
                      type="text"
                      value={p.schakt}
                      onChange={(e) =>
                        uppdateraPost(post.id, { schakt: e.target.value })
                      }
                      placeholder="t.ex. S3"
                      className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="text-xs font-medium text-muted">
                      Betjänade våningsplan / lägenheter
                    </span>
                    <input
                      type="text"
                      value={p.betjanar}
                      onChange={(e) =>
                        uppdateraPost(post.id, { betjanar: e.target.value })
                      }
                      placeholder="t.ex. lght 1101–1501, våning 1–5"
                      className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                    />
                  </label>
                  {d.systemTyp === "en-ror" ? (
                    <label className="block text-sm sm:col-span-2">
                      <span className="text-xs font-medium text-muted">
                        Slinga / radiatoranslutning
                      </span>
                      <input
                        type="text"
                        value={p.slingaBeskrivning}
                        onChange={(e) =>
                          uppdateraPost(post.id, {
                            slingaBeskrivning: e.target.value,
                          })
                        }
                        placeholder="Beskriv slinga och hur radiatorerna ansluts"
                        className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                      />
                    </label>
                  ) : null}
                  <label className="block text-sm">
                    <span className="text-xs font-medium text-muted">
                      Ritningsreferens
                    </span>
                    <input
                      type="text"
                      value={p.ritningsreferens}
                      onChange={(e) =>
                        uppdateraPost(post.id, {
                          ritningsreferens: e.target.value,
                        })
                      }
                      placeholder="t.ex. V-101"
                      className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="text-xs font-medium text-muted">
                      Kommentar om skick
                    </span>
                    <input
                      type="text"
                      value={p.skickKommentar}
                      onChange={(e) =>
                        uppdateraPost(post.id, {
                          skickKommentar: e.target.value,
                        })
                      }
                      placeholder="t.ex. synliga beläggningar, inga läckage"
                      className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block text-sm sm:col-span-2">
                    <span className="text-xs font-medium text-muted">
                      Kommentar
                    </span>
                    <input
                      type="text"
                      value={p.kommentar}
                      onChange={(e) =>
                        uppdateraPost(post.id, { kommentar: e.target.value })
                      }
                      placeholder="Övrigt"
                      className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                    />
                  </label>
                </div>

                <p className="mt-4 text-xs font-semibold text-primary-dark">
                  Stamventiler
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-muted">
                  {d.systemTyp === "tva-ror"
                    ? "Välj modell på både tillopp och retur. Lägg gärna en bild på respektive ventil — underlättar service och anbud."
                    : "Vid enrörssystem anges ofta en stamventil för slingans avstängning/injustering."}
                </p>
                <div
                  className={`mt-2 grid gap-3 ${d.systemTyp === "tva-ror" ? "sm:grid-cols-2" : ""}`}
                >
                  <div className="rounded-lg border border-border/80 bg-[#fafcfa] p-3">
                    <label className="block text-sm">
                      <span className="text-xs font-medium text-muted">
                        {d.systemTyp === "tva-ror"
                          ? "Tilloppsventil (går upp)"
                          : "Stamventil"}
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

                  {d.systemTyp === "tva-ror" ? (
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
                                returventil === "annat"
                                  ? p.returventilAnnan
                                  : "",
                            })
                          }
                        />
                        {hamtaStamventilModellDef(p.returventil || "ta-stad")
                          ?.beskrivning && (
                          <span className="mt-1 block text-[11px] text-muted">
                            {
                              hamtaStamventilModellDef(
                                p.returventil || "ta-stad",
                              )?.beskrivning
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
                  ) : null}
                </div>

                <p className="mt-4 text-xs font-semibold text-primary-dark">
                  Höjd och rördimension
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-muted">
                  Total stamhöjd räknas som antal våningar × takhöjd + (våningar
                  − 1) × bjälklag. Exempel: 9 × 2,6 m + 8 × 0,4 m = 26,6 m.
                  {d.systemTyp === "tva-ror"
                    ? " Rördimension anges separat för tillopp och retur."
                    : " Ange rördimension för slingans stamledning."}
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

                  {d.systemTyp === "tva-ror" ? (
                    <>
                      <RorDimensionValjare
                        label="Rördimension tillopp"
                        value={p.rordimensionTillopp}
                        annan={p.rordimensionTilloppAnnan}
                        ytterdiameterMm={p.ytterdiameterTilloppMm}
                        onChange={(patch) =>
                          uppdateraPost(post.id, {
                            rordimensionTillopp: patch.rordimension,
                            rordimensionTilloppAnnan: patch.rordimensionAnnan,
                            ytterdiameterTilloppMm: patch.ytterdiameterMm,
                            rordimension: patch.rordimension,
                            rordimensionAnnan: patch.rordimensionAnnan,
                          })
                        }
                      />
                      <RorDimensionValjare
                        label="Rördimension retur"
                        value={p.rordimensionRetur}
                        annan={p.rordimensionReturAnnan}
                        ytterdiameterMm={p.ytterdiameterReturMm}
                        onChange={(patch) =>
                          uppdateraPost(post.id, {
                            rordimensionRetur: patch.rordimension,
                            rordimensionReturAnnan: patch.rordimensionAnnan,
                            ytterdiameterReturMm: patch.ytterdiameterMm,
                          })
                        }
                      />
                    </>
                  ) : (
                    <RorDimensionValjare
                      label="Rördimension"
                      value={p.rordimensionTillopp || p.rordimension}
                      annan={
                        p.rordimensionTilloppAnnan || p.rordimensionAnnan
                      }
                      ytterdiameterMm={p.ytterdiameterTilloppMm}
                      onChange={(patch) =>
                        uppdateraPost(post.id, {
                          rordimensionTillopp: patch.rordimension,
                          rordimensionTilloppAnnan: patch.rordimensionAnnan,
                          ytterdiameterTilloppMm: patch.ytterdiameterMm,
                          rordimension: patch.rordimension,
                          rordimensionAnnan: patch.rordimensionAnnan,
                        })
                      }
                    />
                  )}
                  <label className="block text-sm">
                    <span className="text-xs font-medium text-muted">
                      Rörmaterial
                    </span>
                    <select
                      value={p.rormaterial}
                      onChange={(e) =>
                        uppdateraPost(post.id, {
                          rormaterial: e.target
                            .value as VarmeRormaterialId | "",
                          rormaterialAnnan:
                            e.target.value === "annat"
                              ? p.rormaterialAnnan
                              : "",
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                    >
                      <option value="">— ej angivet —</option>
                      {varmeRormaterialAlternativ.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.etikett}
                        </option>
                      ))}
                    </select>
                    {p.rormaterial === "annat" && (
                      <input
                        type="text"
                        value={p.rormaterialAnnan}
                        onChange={(e) =>
                          uppdateraPost(post.id, {
                            rormaterialAnnan: e.target.value,
                          })
                        }
                        placeholder="Ange material"
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
                  Välj radiatortyp från grunduppgifterna. Antal och avstånd
                  behövs i injusteringsunderlaget — en rad per kombination som
                  är lika.
                </p>
                {katalog.length === 0 ? (
                  <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
                    Inga radiatortyper är registrerade ännu. Gå till{" "}
                    <strong className="font-semibold">
                      Grunduppgifter → Uppvärmning, ventilation och
                      fastighetsbeteckning
                    </strong>{" "}
                    och lägg till radiatortyperna (typ, höjd och längd) innan
                    du kopplar dem till stammarna.
                  </p>
                ) : null}
                {p.radiatorGrupper.length > 0 && (
                  <ul className="mt-3 space-y-3">
                    {p.radiatorGrupper.map((grupp, gruppIndex) => {
                      const valdIKatalog =
                        grupp.radiatorTypId &&
                        grupp.radiatorTypId !== VARME_RADIATOR_TYP_SAKNAS &&
                        katalog.some((t) => t.id === grupp.radiatorTypId);
                      const saknasTyp =
                        grupp.radiatorTypId === VARME_RADIATOR_TYP_SAKNAS ||
                        (Boolean(grupp.radiatorTypId) &&
                          grupp.radiatorTypId !== VARME_RADIATOR_TYP_SAKNAS &&
                          !valdIKatalog);
                      return (
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
                          <label className="block text-sm sm:col-span-2">
                            <span className="text-xs font-medium text-muted">
                              Radiatortyp (från grunduppgifter)
                            </span>
                            <select
                              value={
                                valdIKatalog
                                  ? grupp.radiatorTypId
                                  : saknasTyp
                                    ? VARME_RADIATOR_TYP_SAKNAS
                                    : grupp.radiatorTypId || ""
                              }
                              onChange={(e) =>
                                uppdateraRadiatorGrupp(post.id, grupp.id, {
                                  radiatorTypId: e.target.value,
                                })
                              }
                              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                            >
                              <option value="">Välj radiatortyp…</option>
                              {katalog.map((t) => (
                                <option key={t.id} value={t.id}>
                                  {formateraRadiatorTypPost(t)}
                                </option>
                              ))}
                              <option value={VARME_RADIATOR_TYP_SAKNAS}>
                                Typ saknas — lägg till i grunduppgifter
                              </option>
                            </select>
                          </label>
                          {saknasTyp ? (
                            <p className="sm:col-span-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
                              Lägg till radiatortypen under{" "}
                              <strong className="font-semibold">
                                Grunduppgifter → Uppvärmning
                              </strong>{" "}
                              (typ 11/21/22/33, höjd och längd i mm). Därefter
                              kan du välja den här.
                            </p>
                          ) : null}
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
                              {varmeRorDimensioner
                                .filter((a) => a.id !== "dn10")
                                .map((a) => (
                                  <option key={a.id} value={a.id}>
                                    {a.etikett}
                                  </option>
                                ))}
                            </select>
                          </label>
                        </div>
                      </li>
                    );
                    })}
                  </ul>
                )}
                <button
                  type="button"
                  onClick={() =>
                    uppdateraPost(post.id, {
                      radiatorGrupper: [
                        ...p.radiatorGrupper,
                        skapaTomVarmeRadiatorGrupp(
                          katalog.length === 1 ? katalog[0].id : "",
                        ),
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

      <VarmeSammanstallningPanel
        data={d}
        radiatorTyper={katalog}
        foreningNamn={foreningNamn}
        onSpara={(snapshot) =>
          onChange(
            normaliseraVarmestammarData({
              ...d,
              sparadSammanstallning: snapshot,
            }),
          )
        }
        onRensaSparat={() =>
          onChange(
            normaliseraVarmestammarData({
              ...d,
              sparadSammanstallning: null,
            }),
          )
        }
      />
    </div>
  );
}
