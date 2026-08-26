"use client";

import { useEffect, useMemo, useState } from "react";
import {
  HUS_ENTREPR_EVENT,
  lasHusEntreprenorerState,
  skapaHusEntreprenorId,
  sparaHusEntreprenorerState,
  type HusEntreprenor,
} from "@/components/entreprenorer/hus-entreprenorer-lager";
import { entreprenorKategorier } from "@/components/entreprenorer/entreprenorer";

const tom = {
  namn: "",
  telefon: "",
  epost: "",
  kategori: "",
  anteckning: "",
};

export function HusEntreprenorLista() {
  const [poster, setPoster] = useState<HusEntreprenor[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [visarForm, setVisarForm] = useState(false);
  const [form, setForm] = useState(tom);
  const [fel, setFel] = useState("");
  const [taBortId, setTaBortId] = useState<string | null>(null);
  const [sok, setSok] = useState("");
  const [filterKategori, setFilterKategori] = useState("alla");

  useEffect(() => {
    function ladda() {
      setPoster(lasHusEntreprenorerState().poster);
      setHydrated(true);
    }
    ladda();
    window.addEventListener(HUS_ENTREPR_EVENT, ladda);
    return () => window.removeEventListener(HUS_ENTREPR_EVENT, ladda);
  }, []);

  const synliga = useMemo(() => {
    const q = sok.trim().toLowerCase();
    return poster.filter((p) => {
      if (filterKategori !== "alla" && p.kategori !== filterKategori) {
        return false;
      }
      if (!q) return true;
      return (
        p.namn.toLowerCase().includes(q) ||
        p.kategori.toLowerCase().includes(q) ||
        p.anteckning.toLowerCase().includes(q) ||
        p.telefon.toLowerCase().includes(q) ||
        p.epost.toLowerCase().includes(q)
      );
    });
  }, [poster, sok, filterKategori]);

  function spara(ny: HusEntreprenor[]) {
    setPoster(ny);
    sparaHusEntreprenorerState({ version: 1, poster: ny });
  }

  function laggTill(e: React.FormEvent) {
    e.preventDefault();
    const namn = form.namn.trim();
    if (!namn) {
      setFel("Ange namn på entreprenören eller företaget.");
      return;
    }
    setFel("");
    const ny: HusEntreprenor = {
      id: skapaHusEntreprenorId(),
      namn,
      telefon: form.telefon.trim(),
      epost: form.epost.trim(),
      kategori: form.kategori.trim(),
      anteckning: form.anteckning.trim(),
      tillagdTidpunkt: new Date().toISOString(),
    };
    spara([ny, ...poster]);
    setForm(tom);
    setVisarForm(false);
  }

  function bekraftaTaBort(id: string) {
    spara(poster.filter((p) => p.id !== id));
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

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-surface/60 p-4 sm:p-5">
        <p className="text-sm font-semibold text-foreground">
          Er egen lista — rekommenderade kontakter
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Här sparar ni företag och hantverkare ni vill använda igen — gärna
          sådana som känner huset. Listan syns bara i er förening. Ni kan lägga
          till manuellt eller hämta från det centrala registret nedan. Ta bort
          poster som inte längre håller måttet.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {poster.length === 0
            ? "Inga entreprenörer tillagda ännu."
            : `${poster.length} entreprenör${poster.length === 1 ? "" : "er"}`}
          {poster.length > 0 && synliga.length !== poster.length
            ? ` · visar ${synliga.length}`
            : ""}
        </p>
        <button
          type="button"
          onClick={() => {
            setVisarForm(true);
            setFel("");
          }}
          className="brf-knapp-gron px-4 py-2.5 text-sm"
        >
          Lägg till entreprenör
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <input
          type="search"
          value={sok}
          onChange={(e) => setSok(e.target.value)}
          placeholder="Sök i er lista — namn, kategori, anteckning…"
          className="min-w-[200px] flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary"
          aria-label="Sök i föreningens entreprenörlista"
        />
        <select
          value={filterKategori}
          onChange={(e) => setFilterKategori(e.target.value)}
          className="rounded-lg border border-border bg-white px-3 py-2 text-sm"
          aria-label="Filtrera kategori i er lista"
        >
          <option value="alla">Alla kategorier</option>
          {entreprenorKategorier.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </div>

      {visarForm && (
        <form
          onSubmit={laggTill}
          className="rounded-2xl border border-border bg-white p-5 shadow-sm"
        >
          <h3 className="text-base font-semibold text-foreground">
            Ny entreprenör
          </h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block text-sm sm:col-span-2">
              <span className="font-medium text-foreground">
                Namn / företag <span className="text-red-600">*</span>
              </span>
              <input
                value={form.namn}
                onChange={(e) => setForm({ ...form, namn: e.target.value })}
                placeholder="t.ex. Bygg & Service AB"
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                required
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-foreground">Telefon</span>
              <input
                value={form.telefon}
                onChange={(e) => setForm({ ...form, telefon: e.target.value })}
                placeholder="08-123 45 67"
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-foreground">E-post</span>
              <input
                type="email"
                value={form.epost}
                onChange={(e) => setForm({ ...form, epost: e.target.value })}
                placeholder="kontakt@foretag.se"
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-foreground">Kategori</span>
              <select
                value={form.kategori}
                onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
              >
                <option value="">Välj…</option>
                {entreprenorKategorier.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="font-medium text-foreground">
                Anteckning — varför rekommenderar ni dem?
              </span>
              <input
                value={form.anteckning}
                onChange={(e) =>
                  setForm({ ...form, anteckning: e.target.value })
                }
                placeholder="t.ex. Gjorde stambytet 2018, känner rördragningen"
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </label>
          </div>
          {fel && (
            <p
              className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
              role="alert"
            >
              {fel}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="submit" className="brf-knapp-gron px-5 py-2.5 text-sm">
              Spara
            </button>
            <button
              type="button"
              onClick={() => {
                setVisarForm(false);
                setForm(tom);
                setFel("");
              }}
              className="rounded-lg border border-border px-4 py-2.5 text-sm text-muted"
            >
              Avbryt
            </button>
          </div>
        </form>
      )}

      {synliga.length === 0 ? (
        <p className="text-sm text-muted">
          {poster.length === 0
            ? "Inga poster ännu — lägg till manuellt eller från registret nedan."
            : "Inga träffar med valt filter."}
        </p>
      ) : (
        <ul className="space-y-3">
          {synliga.map((p) => (
            <li
              key={p.id}
              className="rounded-2xl border border-border bg-white p-4 shadow-sm sm:p-5"
            >
              {taBortId === p.id ? (
                <div>
                  <p className="font-semibold text-red-900">
                    Ta bort {p.namn}?
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    Posten försvinner från er lista. Ni kan lägga till den igen
                    senare.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => bekraftaTaBort(p.id)}
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
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-bold text-foreground">
                        {p.namn}
                      </p>
                      {p.kategori && (
                        <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-xs font-medium text-muted">
                          {p.kategori}
                        </span>
                      )}
                    </div>
                    {p.anteckning && (
                      <p className="mt-1.5 text-sm text-primary-dark">
                        {p.anteckning}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
                      {p.telefon && <span>{p.telefon}</span>}
                      {p.epost && <span>{p.epost}</span>}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTaBortId(p.id)}
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-800 hover:bg-red-100"
                  >
                    Ta bort
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
