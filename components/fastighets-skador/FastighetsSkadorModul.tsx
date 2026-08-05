"use client";

import { useEffect, useState } from "react";
import { fastighetsSkadorInfo } from "@/components/fastighets-skador/fastighets-skador-info";
import {
  allvarEtiketter,
  FASTIGHETS_SKADOR_EVENT,
  formatHistorikTid,
  laggTillHistorik,
  lasFastighetsSkadorState,
  normaliseraSkada,
  orsakEtiketter,
  SKADE_CHECKLISTA,
  sparaFastighetsSkadorState,
  skapaSkadaId,
  statusEtiketter,
  type FastighetsSkada,
  type FastighetsSkadaAllvar,
  type FastighetsSkadaOrsak,
  type FastighetsSkadaStatus,
} from "@/components/fastighets-skador/fastighets-skador-lager";

const tomForm = {
  titel: "",
  plats: "",
  beskrivning: "",
  upptacktDatum: new Date().toISOString().slice(0, 10),
  status: "rapporterad" as FastighetsSkadaStatus,
  allvar: "medel" as FastighetsSkadaAllvar,
  orsak: "okand" as FastighetsSkadaOrsak,
  ansvarig: "",
  anteckning: "",
  checklistaKlar: [] as string[],
};

export function FastighetsSkadorModul() {
  const [skador, setSkador] = useState<FastighetsSkada[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [visarForm, setVisarForm] = useState(false);
  const [redigeraId, setRedigeraId] = useState<string | null>(null);
  const [form, setForm] = useState(tomForm);
  const [fel, setFel] = useState("");
  const [taBortId, setTaBortId] = useState<string | null>(null);
  const [expandaHistorikId, setExpandaHistorikId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    function ladda() {
      setSkador(lasFastighetsSkadorState().skador);
      setHydrated(true);
    }
    ladda();
    window.addEventListener(FASTIGHETS_SKADOR_EVENT, ladda);
    return () => window.removeEventListener(FASTIGHETS_SKADOR_EVENT, ladda);
  }, []);

  function spara(ny: FastighetsSkada[]) {
    setSkador(ny);
    sparaFastighetsSkadorState({ version: 1, skador: ny });
  }

  function oppnRedigera(s: FastighetsSkada) {
    setRedigeraId(s.id);
    setForm({
      titel: s.titel,
      plats: s.plats,
      beskrivning: s.beskrivning,
      upptacktDatum: s.upptacktDatum,
      status: s.status,
      allvar: s.allvar,
      orsak: s.orsak,
      ansvarig: s.ansvarig,
      anteckning: s.anteckning,
      checklistaKlar: [...s.checklistaKlar],
    });
    setVisarForm(true);
    setFel("");
  }

  function toggleCheck(id: string) {
    setForm((f) => ({
      ...f,
      checklistaKlar: f.checklistaKlar.includes(id)
        ? f.checklistaKlar.filter((x) => x !== id)
        : [...f.checklistaKlar, id],
    }));
  }

  function sparaForm(e: React.FormEvent) {
    e.preventDefault();
    const titel = form.titel.trim();
    if (!titel) {
      setFel("Ange en kort titel på skadan.");
      return;
    }
    setFel("");

    if (redigeraId) {
      const befintlig = skador.find((s) => s.id === redigeraId);
      if (!befintlig) return;
      let uppdaterad = normaliseraSkada({
        ...befintlig,
        titel,
        plats: form.plats.trim(),
        beskrivning: form.beskrivning.trim(),
        upptacktDatum: form.upptacktDatum,
        status: form.status,
        allvar: form.allvar,
        orsak: form.orsak,
        ansvarig: form.ansvarig.trim(),
        anteckning: form.anteckning.trim(),
        checklistaKlar: form.checklistaKlar,
      });
      const andringar: string[] = [];
      if (befintlig.status !== form.status) {
        andringar.push(
          `Status: ${statusEtiketter[befintlig.status]} → ${statusEtiketter[form.status]}`,
        );
      }
      if (befintlig.orsak !== form.orsak) {
        andringar.push(`Orsak: ${orsakEtiketter[form.orsak]}`);
      }
      if (
        befintlig.checklistaKlar.length !== form.checklistaKlar.length ||
        befintlig.checklistaKlar.some((id) => !form.checklistaKlar.includes(id))
      ) {
        andringar.push(
          `Checklista: ${form.checklistaKlar.length}/${SKADE_CHECKLISTA.length} klara`,
        );
      }
      if (andringar.length > 0) {
        uppdaterad = laggTillHistorik(
          uppdaterad,
          `Uppdaterad — ${andringar.join("; ")}`,
        );
      } else {
        uppdaterad = laggTillHistorik(uppdaterad, "Uppgifter sparade");
      }
      spara(skador.map((s) => (s.id === redigeraId ? uppdaterad : s)));
    } else {
      let ny = normaliseraSkada({
        id: skapaSkadaId(),
        titel,
        plats: form.plats.trim(),
        beskrivning: form.beskrivning.trim(),
        upptacktDatum: form.upptacktDatum,
        status: form.status,
        allvar: form.allvar,
        orsak: form.orsak,
        ansvarig: form.ansvarig.trim(),
        anteckning: form.anteckning.trim(),
        checklistaKlar: form.checklistaKlar,
        skapad: new Date().toISOString(),
        historik: [],
      });
      ny = laggTillHistorik(ny, "Skada registrerad i portalen");
      spara([ny, ...skador]);
    }

    setForm({
      ...tomForm,
      upptacktDatum: new Date().toISOString().slice(0, 10),
    });
    setRedigeraId(null);
    setVisarForm(false);
  }

  function bekraftaTaBort(id: string) {
    spara(skador.filter((s) => s.id !== id));
    setTaBortId(null);
  }

  if (!hydrated) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-24 rounded-xl bg-border/40" />
        <div className="h-24 rounded-xl bg-border/40" />
      </div>
    );
  }

  const info = fastighetsSkadorInfo;
  const oppna = skador.filter(
    (s) => s.status === "rapporterad" || s.status === "under_atgard",
  );

  return (
    <div className="space-y-8">
      {/* Information */}
      <div className="space-y-4">
        <div className="rounded-xl border border-primary/25 bg-[#eef6f0]/50 p-4 sm:p-5">
          <p className="text-sm font-semibold text-foreground">
            {info.dokumentation.titel}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {info.dokumentation.text}
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-white p-4 shadow-sm sm:p-5">
            <p className="text-sm font-semibold text-foreground">
              {info.foljdskador.titel}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {info.foljdskador.text}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-white p-4 shadow-sm sm:p-5">
            <p className="text-sm font-semibold text-foreground">
              {info.orsak.titel}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {info.orsak.text}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-white p-4 shadow-sm sm:p-5">
          <p className="text-sm font-semibold text-foreground">
            {info.forsakring.titel}
          </p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted">
            {info.forsakring.punkter.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 p-4 sm:p-5">
          <p className="text-sm font-semibold text-amber-950">
            {info.entreprenor.titel}
          </p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-amber-950/90">
            {info.entreprenor.punkter.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Register */}
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Skaderegister & historik
            </h3>
            <p className="mt-0.5 text-sm text-muted">
              {skador.length === 0
                ? "Inga skador registrerade ännu — spara historiken här som i övriga portalen."
                : `${skador.length} skada${skador.length === 1 ? "" : "r"} · ${oppna.length} öppna`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setRedigeraId(null);
              setForm({
                ...tomForm,
                upptacktDatum: new Date().toISOString().slice(0, 10),
              });
              setVisarForm(true);
              setFel("");
            }}
            className="brf-knapp-gron px-4 py-2.5 text-sm"
          >
            Registrera skada
          </button>
        </div>

        {visarForm && (
          <form
            onSubmit={sparaForm}
            className="rounded-2xl border border-border bg-white p-5 shadow-sm"
          >
            <h3 className="text-base font-semibold text-foreground">
              {redigeraId ? "Redigera skada" : "Ny skada"}
            </h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="block text-sm sm:col-span-2">
                <span className="font-medium text-foreground">
                  Titel <span className="text-red-600">*</span>
                </span>
                <input
                  value={form.titel}
                  onChange={(e) => setForm({ ...form, titel: e.target.value })}
                  placeholder="t.ex. Vattenläcka i badrum plan 4"
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                  required
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-foreground">Plats</span>
                <input
                  value={form.plats}
                  onChange={(e) => setForm({ ...form, plats: e.target.value })}
                  placeholder="t.ex. Lgh 1201, badrum — följdskador under"
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-foreground">Upptäckt datum</span>
                <input
                  type="date"
                  value={form.upptacktDatum}
                  onChange={(e) =>
                    setForm({ ...form, upptacktDatum: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-foreground">Allvar</span>
                <select
                  value={form.allvar}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      allvar: e.target.value as FastighetsSkadaAllvar,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                >
                  {(
                    Object.keys(allvarEtiketter) as FastighetsSkadaAllvar[]
                  ).map((k) => (
                    <option key={k} value={k}>
                      {allvarEtiketter[k]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                <span className="font-medium text-foreground">Status</span>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value as FastighetsSkadaStatus,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                >
                  {(
                    Object.keys(statusEtiketter) as FastighetsSkadaStatus[]
                  ).map((k) => (
                    <option key={k} value={k}>
                      {statusEtiketter[k]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm sm:col-span-2">
                <span className="font-medium text-foreground">
                  Bedömd orsak
                </span>
                <select
                  value={form.orsak}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      orsak: e.target.value as FastighetsSkadaOrsak,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                >
                  {(Object.keys(orsakEtiketter) as FastighetsSkadaOrsak[]).map(
                    (k) => (
                      <option key={k} value={k}>
                        {orsakEtiketter[k]}
                      </option>
                    ),
                  )}
                </select>
                {form.orsak === "forslitning_underhall" && (
                  <span className="mt-1 block text-xs text-amber-800">
                    Vid förslitning/bristande underhåll ersätts vanligtvis inte
                    orsaken — följderna av skadan kan ersättas.
                  </span>
                )}
                {form.orsak === "entreprenor" && (
                  <span className="mt-1 block text-xs text-amber-800">
                    Notera köpare, garanti (ofta 2 år) och ansvarstid (ofta 10
                    år). Flyttar medlemmen som köpt följer garanti och ansvar
                    med.
                  </span>
                )}
              </label>
              <label className="block text-sm sm:col-span-2">
                <span className="font-medium text-foreground">Beskrivning</span>
                <textarea
                  value={form.beskrivning}
                  onChange={(e) =>
                    setForm({ ...form, beskrivning: e.target.value })
                  }
                  rows={3}
                  placeholder="Omfattning, följdskador, berörda lägenheter…"
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-foreground">Ansvarig</span>
                <input
                  value={form.ansvarig}
                  onChange={(e) =>
                    setForm({ ...form, ansvarig: e.target.value })
                  }
                  placeholder="Namn i styrelsen"
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-foreground">Anteckning</span>
                <input
                  value={form.anteckning}
                  onChange={(e) =>
                    setForm({ ...form, anteckning: e.target.value })
                  }
                  placeholder="t.ex. Anmält till försäkring"
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                />
              </label>
            </div>

            <fieldset className="mt-5 rounded-xl border border-border bg-surface/40 p-4">
              <legend className="px-1 text-sm font-semibold text-foreground">
                Checklista vid skada
              </legend>
              <p className="mb-3 text-xs text-muted">
                Bocka av punkterna ni går igenom — sparas i historiken för
                spårbarhet.
              </p>
              <ul className="space-y-2">
                {SKADE_CHECKLISTA.map((punkt) => {
                  const klar = form.checklistaKlar.includes(punkt.id);
                  return (
                    <li key={punkt.id}>
                      <label className="flex cursor-pointer items-start gap-2.5 text-sm">
                        <input
                          type="checkbox"
                          checked={klar}
                          onChange={() => toggleCheck(punkt.id)}
                          className="mt-0.5 h-4 w-4 rounded border-border text-primary"
                        />
                        <span
                          className={
                            klar ? "text-muted line-through" : "text-foreground"
                          }
                        >
                          {punkt.text}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-2 text-xs text-muted">
                {form.checklistaKlar.length}/{SKADE_CHECKLISTA.length} klara
              </p>
            </fieldset>

            {fel && (
              <p
                className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
                role="alert"
              >
                {fel}
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="submit"
                className="brf-knapp-gron px-5 py-2.5 text-sm"
              >
                Spara i historiken
              </button>
              <button
                type="button"
                onClick={() => {
                  setVisarForm(false);
                  setRedigeraId(null);
                  setFel("");
                }}
                className="rounded-lg border border-border px-4 py-2.5 text-sm text-muted"
              >
                Avbryt
              </button>
            </div>
          </form>
        )}

        <ul className="space-y-3">
          {skador.map((s) => (
            <li
              key={s.id}
              className="rounded-2xl border border-border bg-white p-4 shadow-sm sm:p-5"
            >
              {taBortId === s.id ? (
                <div>
                  <p className="font-semibold text-red-900">
                    Ta bort «{s.titel}»? Historiken raderas.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => bekraftaTaBort(s.id)}
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                    >
                      Ja, ta bort
                    </button>
                    <button
                      type="button"
                      onClick={() => setTaBortId(null)}
                      className="rounded-lg border border-border px-4 py-2 text-sm"
                    >
                      Avbryt
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-bold text-foreground">
                          {s.titel}
                        </p>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                            s.allvar === "hog"
                              ? "border-red-200 bg-red-50 text-red-800"
                              : s.allvar === "medel"
                                ? "border-amber-200 bg-amber-50 text-amber-900"
                                : "border-border bg-surface text-muted"
                          }`}
                        >
                          {allvarEtiketter[s.allvar]}
                        </span>
                        <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-xs font-medium text-muted">
                          {statusEtiketter[s.status]}
                        </span>
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
                        {s.plats && <span>{s.plats}</span>}
                        {s.upptacktDatum && (
                          <span>Upptäckt {s.upptacktDatum}</span>
                        )}
                        <span>{orsakEtiketter[s.orsak]}</span>
                        {s.ansvarig && <span>Ansvarig: {s.ansvarig}</span>}
                      </div>
                      {s.beskrivning && (
                        <p className="mt-2 text-sm text-foreground">
                          {s.beskrivning}
                        </p>
                      )}
                      {s.anteckning && (
                        <p className="mt-1 text-sm text-primary-dark">
                          {s.anteckning}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-muted">
                        Checklista: {s.checklistaKlar.length}/
                        {SKADE_CHECKLISTA.length} · Historik:{" "}
                        {s.historik.length} poster
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => oppnRedigera(s)}
                        className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:border-primary/40"
                      >
                        Redigera
                      </button>
                      <button
                        type="button"
                        onClick={() => setTaBortId(s.id)}
                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-800 hover:bg-red-100"
                      >
                        Ta bort
                      </button>
                    </div>
                  </div>

                  {s.historik.length > 0 && (
                    <div className="border-t border-border/60 pt-3">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandaHistorikId((id) =>
                            id === s.id ? null : s.id,
                          )
                        }
                        className="text-xs font-medium text-primary-dark hover:underline"
                      >
                        {expandaHistorikId === s.id
                          ? "Dölj historik"
                          : "Visa historik & spårbarhet"}
                      </button>
                      {expandaHistorikId === s.id && (
                        <ul className="mt-2 space-y-1.5">
                          {s.historik.map((h, i) => (
                            <li
                              key={`${h.tidpunkt}-${i}`}
                              className="text-xs text-muted"
                            >
                              <span className="font-medium text-foreground">
                                {formatHistorikTid(h.tidpunkt)}
                              </span>
                              {" — "}
                              {h.text}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
