"use client";

import { useEffect, useMemo, useState } from "react";
import {
  HUS_ENTREPR_EVENT,
  lasHusEntreprenorerState,
  skapaHusEntreprenorId,
  sparaHusEntreprenorerState,
  type HusEntreprenor,
  type HusEntreprenorUppgift,
} from "@/components/entreprenorer/hus-entreprenorer-lager";
import { entreprenorKategorier } from "@/components/entreprenorer/entreprenorer";

type FormState = {
  namn: string;
  telefon: string;
  epost: string;
  kategori: string;
  anteckning: string;
  organisationsnummer: string;
  kontaktperson: string;
  adress: string;
  webbplats: string;
  uppdrag: string;
  extraUppgifter: HusEntreprenorUppgift[];
};

const tom: FormState = {
  namn: "",
  telefon: "",
  epost: "",
  kategori: "",
  anteckning: "",
  organisationsnummer: "",
  kontaktperson: "",
  adress: "",
  webbplats: "",
  uppdrag: "",
  extraUppgifter: [],
};

function formFranPost(post: HusEntreprenor): FormState {
  return {
    namn: post.namn,
    telefon: post.telefon,
    epost: post.epost,
    kategori: post.kategori,
    anteckning: post.anteckning,
    organisationsnummer: post.organisationsnummer ?? "",
    kontaktperson: post.kontaktperson ?? "",
    adress: post.adress ?? "",
    webbplats: post.webbplats ?? "",
    uppdrag: post.uppdrag ?? "",
    extraUppgifter: (post.extraUppgifter ?? []).map((u) => ({ ...u })),
  };
}

function rensaExtra(rader: HusEntreprenorUppgift[]): HusEntreprenorUppgift[] {
  return rader
    .map((rad) => ({
      ...rad,
      rubrik: rad.rubrik.trim(),
      text: rad.text.trim(),
    }))
    .filter((rad) => rad.rubrik || rad.text);
}

export function HusEntreprenorLista() {
  const [poster, setPoster] = useState<HusEntreprenor[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [visarForm, setVisarForm] = useState(false);
  const [redigerarId, setRedigerarId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(tom);
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
        p.epost.toLowerCase().includes(q) ||
        (p.kontaktperson ?? "").toLowerCase().includes(q) ||
        (p.organisationsnummer ?? "").toLowerCase().includes(q) ||
        (p.uppdrag ?? "").toLowerCase().includes(q) ||
        (p.extraUppgifter ?? []).some(
          (u) =>
            u.rubrik.toLowerCase().includes(q) ||
            u.text.toLowerCase().includes(q),
        )
      );
    });
  }, [poster, sok, filterKategori]);

  function spara(ny: HusEntreprenor[]) {
    setPoster(ny);
    sparaHusEntreprenorerState({ version: 1, poster: ny });
  }

  function stangForm() {
    setVisarForm(false);
    setRedigerarId(null);
    setForm(tom);
    setFel("");
  }

  function oppnaNy() {
    setRedigerarId(null);
    setForm(tom);
    setFel("");
    setVisarForm(true);
  }

  function oppnaRedigera(post: HusEntreprenor) {
    setRedigerarId(post.id);
    setForm(formFranPost(post));
    setFel("");
    setVisarForm(true);
    setTaBortId(null);
  }

  function laggTillUppgift() {
    setForm((current) => ({
      ...current,
      extraUppgifter: [
        ...current.extraUppgifter,
        { id: skapaHusEntreprenorId(), rubrik: "", text: "" },
      ],
    }));
  }

  function sparaForm(e: React.FormEvent) {
    e.preventDefault();
    const namn = form.namn.trim();
    if (!namn) {
      setFel("Ange namn på entreprenören eller företaget.");
      return;
    }
    setFel("");
    const falt = {
      namn,
      telefon: form.telefon.trim(),
      epost: form.epost.trim(),
      kategori: form.kategori.trim(),
      anteckning: form.anteckning.trim(),
      organisationsnummer: form.organisationsnummer.trim(),
      kontaktperson: form.kontaktperson.trim(),
      adress: form.adress.trim(),
      webbplats: form.webbplats.trim(),
      uppdrag: form.uppdrag.trim(),
      extraUppgifter: rensaExtra(form.extraUppgifter),
    };
    if (redigerarId) {
      spara(
        poster.map((post) =>
          post.id === redigerarId ? { ...post, ...falt } : post,
        ),
      );
    } else {
      const ny: HusEntreprenor = {
        id: skapaHusEntreprenorId(),
        ...falt,
        tillagdTidpunkt: new Date().toISOString(),
      };
      spara([ny, ...poster]);
    }
    stangForm();
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
          Er egen lista
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Här sparar ni företag och hantverkare som föreningen anlitar. Listan
          syns bara i er förening. Fyll på kontakt, uppdrag och egna uppgifter
          så nästa styrelse ser vad som gäller.
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
          onClick={oppnaNy}
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
          onSubmit={sparaForm}
          className="rounded-2xl border border-border bg-white p-5 shadow-sm"
        >
          <h3 className="text-base font-semibold text-foreground">
            {redigerarId ? "Ändra uppgifter" : "Ny entreprenör"}
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
            <label className="block text-sm">
              <span className="font-medium text-foreground">
                Organisationsnummer
              </span>
              <input
                value={form.organisationsnummer}
                onChange={(e) =>
                  setForm({ ...form, organisationsnummer: e.target.value })
                }
                placeholder="556000-0000"
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-foreground">Kontaktperson</span>
              <input
                value={form.kontaktperson}
                onChange={(e) =>
                  setForm({ ...form, kontaktperson: e.target.value })
                }
                placeholder="Namn"
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-foreground">Adress</span>
              <input
                value={form.adress}
                onChange={(e) => setForm({ ...form, adress: e.target.value })}
                placeholder="Gata, postnummer, ort"
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-foreground">Webbplats</span>
              <input
                value={form.webbplats}
                onChange={(e) =>
                  setForm({ ...form, webbplats: e.target.value })
                }
                placeholder="www.foretag.se"
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="font-medium text-foreground">
                Uppdrag — vad är de anlitade för?
              </span>
              <input
                value={form.uppdrag}
                onChange={(e) => setForm({ ...form, uppdrag: e.target.value })}
                placeholder="t.ex. Löpande fastighetsskötsel, takbesiktning"
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="font-medium text-foreground">Anteckning</span>
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
          <div className="mt-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-foreground">
                Fler uppgifter
              </p>
              <button
                type="button"
                onClick={laggTillUppgift}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface"
              >
                Lägg till uppgift
              </button>
            </div>
            {form.extraUppgifter.length === 0 ? (
              <p className="text-sm text-muted">
                Lägg till egna fält, till exempel avtalsnummer, jour eller
                försäkring.
              </p>
            ) : (
              form.extraUppgifter.map((rad, index) => (
                <div
                  key={rad.id}
                  className="grid gap-2 rounded-xl border border-border bg-surface/40 p-3 sm:grid-cols-[1fr_1.4fr_auto]"
                >
                  <input
                    value={rad.rubrik}
                    onChange={(e) => {
                      const extraUppgifter = form.extraUppgifter.map((u, i) =>
                        i === index ? { ...u, rubrik: e.target.value } : u,
                      );
                      setForm({ ...form, extraUppgifter });
                    }}
                    placeholder="Rubrik, t.ex. Avtalsnummer"
                    aria-label="Rubrik på uppgift"
                    className="rounded-lg border border-border bg-white px-3 py-2 text-sm"
                  />
                  <input
                    value={rad.text}
                    onChange={(e) => {
                      const extraUppgifter = form.extraUppgifter.map((u, i) =>
                        i === index ? { ...u, text: e.target.value } : u,
                      );
                      setForm({ ...form, extraUppgifter });
                    }}
                    placeholder="Uppgift"
                    aria-label="Uppgift"
                    className="rounded-lg border border-border bg-white px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        extraUppgifter: form.extraUppgifter.filter(
                          (_, i) => i !== index,
                        ),
                      })
                    }
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-800 hover:bg-red-100"
                  >
                    Ta bort
                  </button>
                </div>
              ))
            )}
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
              onClick={stangForm}
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
            ? "Inga poster ännu — lägg till den första entreprenören."
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
                    <dl className="mt-2 grid gap-x-4 gap-y-1 text-sm text-muted sm:grid-cols-2">
                      {p.telefon && (
                        <div>
                          <dt className="inline font-medium text-foreground">
                            Telefon:{" "}
                          </dt>
                          <dd className="inline">{p.telefon}</dd>
                        </div>
                      )}
                      {p.epost && (
                        <div>
                          <dt className="inline font-medium text-foreground">
                            E-post:{" "}
                          </dt>
                          <dd className="inline">{p.epost}</dd>
                        </div>
                      )}
                      {p.kontaktperson && (
                        <div>
                          <dt className="inline font-medium text-foreground">
                            Kontakt:{" "}
                          </dt>
                          <dd className="inline">{p.kontaktperson}</dd>
                        </div>
                      )}
                      {p.organisationsnummer && (
                        <div>
                          <dt className="inline font-medium text-foreground">
                            Org.nr:{" "}
                          </dt>
                          <dd className="inline">{p.organisationsnummer}</dd>
                        </div>
                      )}
                      {p.adress && (
                        <div className="sm:col-span-2">
                          <dt className="inline font-medium text-foreground">
                            Adress:{" "}
                          </dt>
                          <dd className="inline">{p.adress}</dd>
                        </div>
                      )}
                      {p.webbplats && (
                        <div>
                          <dt className="inline font-medium text-foreground">
                            Webb:{" "}
                          </dt>
                          <dd className="inline">{p.webbplats}</dd>
                        </div>
                      )}
                      {p.uppdrag && (
                        <div className="sm:col-span-2">
                          <dt className="inline font-medium text-foreground">
                            Uppdrag:{" "}
                          </dt>
                          <dd className="inline">{p.uppdrag}</dd>
                        </div>
                      )}
                      {(p.extraUppgifter ?? []).map((u) => (
                        <div key={u.id} className="sm:col-span-2">
                          <dt className="inline font-medium text-foreground">
                            {u.rubrik || "Uppgift"}:{" "}
                          </dt>
                          <dd className="inline">{u.text}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => oppnaRedigera(p)}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface"
                    >
                      Ändra
                    </button>
                    <button
                      type="button"
                      onClick={() => setTaBortId(p.id)}
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-800 hover:bg-red-100"
                    >
                      Ta bort
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
