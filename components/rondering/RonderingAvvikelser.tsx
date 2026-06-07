"use client";

import { useEffect, useMemo, useState } from "react";
import { ronderingChecklistaEtiketter } from "@/components/rondering/checklist-mallar";
import {
  avvikelseAllvarlighetEtiketter,
  avvikelseStatusEtiketter,
  skapaAvvikelseId,
  type AvvikelseAllvarlighet,
  type AvvikelseKategori,
  type AvvikelseStatus,
  type RonderingAvvikelse,
} from "@/components/rondering/rondering-lager";

type RonderingAvvikelserProps = {
  avvikelser: RonderingAvvikelse[];
  onLaggTill: (avvikelse: RonderingAvvikelse) => void;
  onUppdatera: (avvikelse: RonderingAvvikelse) => void;
  onTaBort: (id: string) => void;
  /** Förifyllt från checklista */
  forvaldKategori?: AvvikelseKategori;
  forvaldPunktNyckel?: string;
  forvaldRubrik?: string;
  onRensaForval?: () => void;
  hamtaPunktText?: (
    kategori: AvvikelseKategori,
    nyckel: string,
  ) => string | undefined;
};

const kategorier: AvvikelseKategori[] = [
  "rondering-utvandig",
  "rondering-invandig",
  "stadning",
];

function kategoriEtikett(k: AvvikelseKategori): string {
  return ronderingChecklistaEtiketter[k];
}

function arRondering(k: AvvikelseKategori): boolean {
  return k === "rondering-utvandig" || k === "rondering-invandig";
}

export function RonderingAvvikelser({
  avvikelser,
  onLaggTill,
  onUppdatera,
  onTaBort,
  forvaldKategori,
  forvaldPunktNyckel,
  forvaldRubrik,
  onRensaForval,
  hamtaPunktText,
}: RonderingAvvikelserProps) {
  function punktText(kategori: AvvikelseKategori, nyckel: string) {
    return hamtaPunktText?.(kategori, nyckel) ?? nyckel;
  }
  const [filterKategori, setFilterKategori] = useState<AvvikelseKategori | "alla">(
    "alla",
  );
  const [filterStatus, setFilterStatus] = useState<AvvikelseStatus | "alla">("alla");
  const [formOppen, setFormOppen] = useState(
    Boolean(forvaldRubrik || forvaldPunktNyckel),
  );

  const [kategori, setKategori] = useState<AvvikelseKategori>(
    forvaldKategori ?? "rondering-utvandig",
  );
  const [rubrik, setRubrik] = useState(forvaldRubrik ?? "");
  const [plats, setPlats] = useState("");
  const [beskrivning, setBeskrivning] = useState("");
  const [allvarlighet, setAllvarlighet] = useState<AvvikelseAllvarlighet>("medium");
  const [rapporteradAv, setRapporteradAv] = useState("");

  useEffect(() => {
    if (forvaldKategori) setKategori(forvaldKategori);
    if (forvaldRubrik) {
      setRubrik(forvaldRubrik);
      setFormOppen(true);
    }
    if (forvaldPunktNyckel) setFormOppen(true);
  }, [forvaldKategori, forvaldRubrik, forvaldPunktNyckel]);

  const filtrerade = useMemo(() => {
    return [...avvikelser]
      .filter((a) => filterKategori === "alla" || a.kategori === filterKategori)
      .filter((a) => filterStatus === "alla" || a.status === filterStatus)
      .sort((a, b) => b.rapporteradDatum.localeCompare(a.rapporteradDatum));
  }, [avvikelser, filterKategori, filterStatus]);

  const statRondering = avvikelser.filter((a) => arRondering(a.kategori)).length;
  const statStad = avvikelser.filter((a) => a.kategori === "stadning").length;
  const oppen = avvikelser.filter((a) => a.status !== "atgardad").length;

  function resetForm() {
    setRubrik("");
    setPlats("");
    setBeskrivning("");
    setAllvarlighet("medium");
    setRapporteradAv("");
    onRensaForval?.();
  }

  function skickaRapport(event: React.FormEvent) {
    event.preventDefault();
    const trimRubrik = rubrik.trim();
    if (!trimRubrik) return;
    onLaggTill({
      id: skapaAvvikelseId(),
      kategori,
      rubrik: trimRubrik,
      plats: plats.trim(),
      beskrivning: beskrivning.trim(),
      allvarlighet,
      status: "oppen",
      rapporteradDatum: new Date().toISOString().slice(0, 10),
      rapporteradAv: rapporteradAv.trim() || undefined,
      checklistaPunktNyckel: forvaldPunktNyckel ?? undefined,
    });
    resetForm();
    setFormOppen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <span className="rounded-full bg-[#eef6f0] px-3 py-1 text-xs font-medium text-primary-dark">
          Rondering: {statRondering} avvikelser
        </span>
        <span className="rounded-full bg-[#eef6f0] px-3 py-1 text-xs font-medium text-primary-dark">
          Städning: {statStad} avvikelser
        </span>
        {oppen > 0 && (
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-950">
            {oppen} öppna
          </span>
        )}
      </div>

      <p className="text-sm leading-relaxed text-muted">
        Avvikelserapporter för rondering (utvändigt och invändigt) och städning
        samlas här. Styrelsen följer upp status — separat från entreprenörens
        månadssignering.
      </p>

      {!formOppen ? (
        <button
          type="button"
          onClick={() => setFormOppen(true)}
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-dark"
        >
          Ny avvikelserapport
        </button>
      ) : (
        <form
          onSubmit={skickaRapport}
          className="rounded-xl border border-primary/25 bg-white p-5 space-y-4"
        >
          <h3 className="text-base font-semibold text-foreground">
            Ny avvikelserapport
          </h3>
          {forvaldPunktNyckel && (
            <p className="rounded-lg bg-amber-50/80 px-3 py-2 text-xs text-amber-950">
              Kopplad till checklista:{" "}
              {punktText(kategori, forvaldPunktNyckel)}
            </p>
          )}

          <div>
            <label className="text-sm font-medium text-foreground">Kategori</label>
            <select
              value={kategori}
              onChange={(e) => setKategori(e.target.value as AvvikelseKategori)}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
            >
              {kategorier.map((k) => (
                <option key={k} value={k}>
                  {kategoriEtikett(k)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">
              Rubrik <span className="text-muted">*</span>
            </label>
            <input
              type="text"
              value={rubrik}
              onChange={(e) => setRubrik(e.target.value)}
              required
              placeholder="t.ex. Läckande stuprör vid port B"
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Plats</label>
            <input
              type="text"
              value={plats}
              onChange={(e) => setPlats(e.target.value)}
              placeholder="t.ex. Gårdshus, trapphus 2, tvättstuga"
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">
              Beskrivning och rekommenderad åtgärd
            </label>
            <textarea
              value={beskrivning}
              onChange={(e) => setBeskrivning(e.target.value)}
              rows={4}
              placeholder="Vad avviker, varför, och vad bör göras?"
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-foreground">
                Allvarlighet
              </label>
              <select
                value={allvarlighet}
                onChange={(e) =>
                  setAllvarlighet(e.target.value as AvvikelseAllvarlighet)
                }
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
              >
                {(Object.keys(avvikelseAllvarlighetEtiketter) as AvvikelseAllvarlighet[]).map(
                  (a) => (
                    <option key={a} value={a}>
                      {avvikelseAllvarlighetEtiketter[a]}
                    </option>
                  ),
                )}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">
                Rapporterad av
              </label>
              <input
                type="text"
                value={rapporteradAv}
                onChange={(e) => setRapporteradAv(e.target.value)}
                placeholder="Namn eller roll"
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
            >
              Spara avvikelse
            </button>
            <button
              type="button"
              onClick={() => {
                resetForm();
                setFormOppen(false);
              }}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground"
            >
              Avbryt
            </button>
          </div>
        </form>
      )}

      <div className="flex flex-wrap gap-3">
        <select
          value={filterKategori}
          onChange={(e) =>
            setFilterKategori(e.target.value as AvvikelseKategori | "alla")
          }
          className="rounded-lg border border-border px-3 py-1.5 text-sm"
          aria-label="Filtrera kategori"
        >
          <option value="alla">Alla kategorier</option>
          {kategorier.map((k) => (
            <option key={k} value={k}>
              {kategoriEtikett(k)}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) =>
            setFilterStatus(e.target.value as AvvikelseStatus | "alla")
          }
          className="rounded-lg border border-border px-3 py-1.5 text-sm"
          aria-label="Filtrera status"
        >
          <option value="alla">Alla status</option>
          {(Object.keys(avvikelseStatusEtiketter) as AvvikelseStatus[]).map((s) => (
            <option key={s} value={s}>
              {avvikelseStatusEtiketter[s]}
            </option>
          ))}
        </select>
      </div>

      {filtrerade.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-background px-4 py-6 text-sm text-muted">
          Inga avvikelser i vald filtrering. Rapportera brister från checklistan
          eller med knappen ovan.
        </p>
      ) : (
        <ul className="space-y-3">
          {filtrerade.map((a) => (
            <li
              key={a.id}
              className="rounded-xl border border-border bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-foreground">{a.rubrik}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {kategoriEtikett(a.kategori)}
                    {a.plats && ` · ${a.plats}`}
                    {" · "}
                    {a.rapporteradDatum}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      a.allvarlighet === "hog"
                        ? "bg-red-100 text-red-900"
                        : a.allvarlighet === "medium"
                          ? "bg-amber-50 text-amber-950"
                          : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {avvikelseAllvarlighetEtiketter[a.allvarlighet]}
                  </span>
                  <span className="rounded-full bg-[#eef6f0] px-2 py-0.5 text-xs font-medium text-primary-dark">
                    {avvikelseStatusEtiketter[a.status]}
                  </span>
                </div>
              </div>

              {a.beskrivning && (
                <p className="mt-2 text-sm leading-relaxed text-foreground/90">
                  {a.beskrivning}
                </p>
              )}

              {a.checklistaPunktNyckel && (
                <p className="mt-2 text-xs text-muted">
                  Checklista:{" "}
                  {punktText(a.kategori, a.checklistaPunktNyckel)}
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <label className="text-xs text-muted">Status</label>
                <select
                  value={a.status}
                  onChange={(e) =>
                    onUppdatera({
                      ...a,
                      status: e.target.value as AvvikelseStatus,
                      atgardadDatum:
                        e.target.value === "atgardad"
                          ? new Date().toISOString().slice(0, 10)
                          : a.atgardadDatum,
                    })
                  }
                  className="rounded-lg border border-border px-2 py-1 text-xs"
                >
                  {(Object.keys(avvikelseStatusEtiketter) as AvvikelseStatus[]).map(
                    (s) => (
                      <option key={s} value={s}>
                        {avvikelseStatusEtiketter[s]}
                      </option>
                    ),
                  )}
                </select>
                <button
                  type="button"
                  onClick={() => onTaBort(a.id)}
                  className="ml-auto text-xs text-muted hover:text-red-800"
                >
                  Ta bort
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
