"use client";

import { useMemo, useState } from "react";
import {
  demoEntreprenorer,
  entreprenorKategorier,
  registreringsFalt,
  skapaEntreprenorId,
  statusEtiketter,
  tomForm,
  type Entreprenor,
  type EntreprenorForm,
} from "@/components/entreprenorer/entreprenorer";

type EntreprenorerRegisterProps = {
  /** Registrering och godkännande — publik sida för företag i demo. */
  kanRegistrera?: boolean;
};

export function EntreprenorerRegister({
  kanRegistrera = false,
}: EntreprenorerRegisterProps) {
  const [lista, setLista] = useState<Entreprenor[]>(demoEntreprenorer);
  const [sok, setSok] = useState("");
  const [filterKategori, setFilterKategori] = useState("alla");
  const [form, setForm] = useState<EntreprenorForm>(tomForm());
  const [behörigBekräftad, setBehörigBekräftad] = useState(kanRegistrera);
  const [visarFormular, setVisarFormular] = useState(kanRegistrera);
  const [betygVal, setBetygVal] = useState<Record<string, number>>({});

  const synliga = useMemo(() => {
    const q = sok.trim().toLowerCase();
    return lista.filter((ent) => {
      if (ent.status !== "godkand") return false;
      if (filterKategori !== "alla" && !ent.kategorier.includes(filterKategori)) {
        return false;
      }
      if (!q) return true;
      return (
        ent.foretagsnamn.toLowerCase().includes(q) ||
        ent.kategorier.some((k) => k.toLowerCase().includes(q)) ||
        ent.kontaktperson.toLowerCase().includes(q)
      );
    });
  }, [lista, sok, filterKategori]);

  const vantarGodkannande = lista.filter((e) => e.status === "vantar_godkannande");

  function uppdateraForm<K extends keyof EntreprenorForm>(
    key: K,
    value: EntreprenorForm[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleKategori(kategori: string) {
    setForm((current) => ({
      ...current,
      kategorier: current.kategorier.includes(kategori)
        ? current.kategorier.filter((k) => k !== kategori)
        : [...current.kategorier, kategori],
    }));
  }

  function skickaRegistrering(event: React.FormEvent) {
    event.preventDefault();
    if (!kanRegistrera || !behörigBekräftad) return;
    if (form.kategorier.length === 0) return;

    const ny: Entreprenor = {
      id: skapaEntreprenorId(),
      ...form,
      status: "vantar_godkannande",
      betyg: 0,
      antalBetyg: 0,
      registreradAv: kanRegistrera
        ? "Företag (egen registrering, demo)"
        : "Behörig handläggare (demo)",
    };
    setLista((current) => [...current, ny]);
    setForm(tomForm());
    setVisarFormular(kanRegistrera);
  }

  function godkann(id: string) {
    setLista((current) =>
      current.map((ent) =>
        ent.id === id
          ? {
              ...ent,
              status: "godkand" as const,
              godkandDatum: new Date().toLocaleDateString("sv-SE"),
            }
          : ent,
      ),
    );
  }

  function startaUtredning(id: string) {
    setLista((current) =>
      current.map((ent) =>
        ent.id === id ? { ...ent, status: "under_utredning" as const } : ent,
      ),
    );
  }

  function taBortEfterUtredning(id: string) {
    setLista((current) =>
      current.map((ent) =>
        ent.id === id ? { ...ent, status: "borttagen" as const } : ent,
      ),
    );
  }

  function sättBetyg(id: string, stjärnor: number) {
    setBetygVal((current) => ({ ...current, [id]: stjärnor }));
    setLista((current) =>
      current.map((ent) => {
        if (ent.id !== id) return ent;
        const nyttAntal = ent.antalBetyg + 1;
        const nyttSnitt =
          (ent.betyg * ent.antalBetyg + stjärnor) / nyttAntal;
        return {
          ...ent,
          antalBetyg: nyttAntal,
          betyg: Math.round(nyttSnitt * 10) / 10,
        };
      }),
    );
  }

  return (
    <div className="space-y-8">
      {kanRegistrera && (
        <section
          id="registrera"
          className="scroll-mt-24 rounded-2xl border-2 border-primary bg-[#eef6f0] p-5 shadow-sm sm:p-8"
        >
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">
            Registrera ditt företag
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-foreground">
            Fyll i uppgifterna nedan så att BRF-föreningar kan hitta och utvärdera
            ert företag. I demoversionen granskas ansökan innan ni syns i listan.
          </p>

          <label className="mt-4 flex cursor-pointer items-start gap-2">
            <input
              type="checkbox"
              checked={behörigBekräftad}
              onChange={(event) => setBehörigBekräftad(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-border text-primary"
            />
            <span className="text-sm text-foreground">
              Jag bekräftar att jag är behörig att registrera företaget och att
              uppgifterna är korrekta.
            </span>
          </label>

          {!visarFormular ? (
            <button
              type="button"
              disabled={!behörigBekräftad}
              onClick={() => setVisarFormular(true)}
              className="mt-5 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
            >
              Visa formulär — lägg in uppgifter
            </button>
          ) : (
            <form onSubmit={skickaRegistrering} className="mt-6 space-y-4">
              <p className="text-sm font-semibold text-primary-dark">
                Företagsuppgifter
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {registreringsFalt.map((fält) => (
                  <label key={fält.id} className="block">
                    <span className="text-sm font-medium text-foreground">
                      {fält.label}
                      {fält.obligatorisk && (
                        <span className="text-red-600"> *</span>
                      )}
                    </span>
                    <input
                      type={fält.typ ?? "text"}
                      required={fält.obligatorisk}
                      value={form[fält.id]}
                      onChange={(event) =>
                        uppdateraForm(fält.id, event.target.value)
                      }
                      placeholder={fält.placeholder}
                      className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                  </label>
                ))}
              </div>
              <fieldset>
                <legend className="text-sm font-medium text-foreground">
                  Kategorier (minst en) *
                </legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {entreprenorKategorier.map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => toggleKategori(k)}
                      className={`rounded-full border px-3 py-1.5 text-sm ${
                        form.kategorier.includes(k)
                          ? "border-primary bg-[#e2f0e6] text-primary-dark"
                          : "border-border bg-white text-foreground"
                      }`}
                    >
                      {form.kategorier.includes(k) ? "✓ " : ""}
                      {k}
                    </button>
                  ))}
                </div>
              </fieldset>
              <label className="block">
                <span className="text-sm font-medium text-foreground">
                  Försäkringsintyg (valfritt i demo)
                </span>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  className="mt-1.5 block w-full text-sm text-muted"
                />
              </label>
              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={!behörigBekräftad || form.kategorier.length === 0}
                  className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
                >
                  Skicka registrering
                </button>
                <button
                  type="button"
                  onClick={() => setVisarFormular(kanRegistrera)}
                  className="rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-muted"
                >
                  Dölj formulär
                </button>
              </div>
            </form>
          )}
        </section>
      )}

      <section className="rounded-xl border border-primary/25 bg-[#eef6f0]/50 p-4 sm:p-5">
        <p className="text-sm font-semibold text-foreground">
          Referenser och kvalitet
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Vi tar referenser på företagen som finns med i registret. Utöver det
          rekommenderar vi er att ta egna referenser innan ni väljer
          entreprenör.
        </p>
      </section>

      <section className="rounded-xl border border-border bg-surface p-4 sm:p-5">
        <h3 className="text-lg font-semibold text-foreground">
          Sök entreprenör för ert projekt
        </h3>
        <p className="mt-1 text-sm text-muted">
          Filtrera på kategori och jämför betyg. Referens från plattformen visas
          under varje företag.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <input
            type="search"
            value={sok}
            onChange={(event) => setSok(event.target.value)}
            placeholder="Sök företag, kategori eller kontakt…"
            className="min-w-[200px] flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <select
            value={filterKategori}
            onChange={(event) => setFilterKategori(event.target.value)}
            className="rounded-lg border border-border bg-white px-3 py-2 text-sm"
          >
            <option value="alla">Alla kategorier</option>
            {entreprenorKategorier.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
        {synliga.length === 0 ? (
          <p className="mt-4 text-sm text-muted">Inga träffar med valt filter.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {synliga.map((ent) => (
              <li
                key={ent.id}
                className="rounded-xl border border-border bg-white p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h4 className="text-lg font-semibold text-foreground">
                      {ent.foretagsnamn}
                    </h4>
                    <p className="mt-1 text-sm text-muted">
                      {ent.kategorier.join(" · ")}
                    </p>
                    <p className="mt-2 text-sm text-foreground">
                      {ent.kontaktperson} · {ent.epost} · {ent.telefon}
                    </p>
                    {ent.referens.trim() && (
                      <p className="mt-2 text-sm leading-relaxed text-muted">
                        <span className="font-medium text-foreground">
                          Referens (plattformen):
                        </span>{" "}
                        {ent.referens}
                      </p>
                    )}
                    {ent.godkandDatum && (
                      <p className="mt-1 text-xs text-muted">
                        Godkänd {ent.godkandDatum}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      Betyg: {ent.betyg > 0 ? `${ent.betyg} / 5` : "—"}
                    </p>
                    <p className="text-xs text-muted">
                      {ent.antalBetyg} omdömen
                    </p>
                    <div className="mt-2 flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => sättBetyg(ent.id, n)}
                          className={`text-lg ${
                            (betygVal[ent.id] ?? 0) >= n
                              ? "text-amber-500"
                              : "text-border hover:text-amber-400"
                          }`}
                          aria-label={`Betyg ${n}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {kanRegistrera && vantarGodkannande.length > 0 && (
        <section className="rounded-xl border border-dashed border-primary/40 bg-[#eef6f0]/50 p-4 sm:p-5">
          <p className="text-sm font-semibold text-primary-dark">
            Väntar godkännande ({vantarGodkannande.length})
          </p>
          <ul className="mt-4 space-y-3">
            {vantarGodkannande.map((ent) => (
              <li
                key={ent.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-white p-3"
              >
                <div>
                  <p className="font-medium text-foreground">{ent.foretagsnamn}</p>
                  <p className="text-xs text-muted">
                    {statusEtiketter[ent.status]} · {ent.registreradAv}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => godkann(ent.id)}
                    className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white"
                  >
                    Godkänn (demo)
                  </button>
                  <button
                    type="button"
                    onClick={() => startaUtredning(ent.id)}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted"
                  >
                    Utred
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {kanRegistrera && (
        <section className="rounded-xl border border-border bg-background p-4 text-sm text-muted">
          <p className="font-semibold text-foreground">Misskötsel och borttagning</p>
          <p className="mt-2 leading-relaxed">
            Vid allvarliga klagomål kan entreprenören utredas och tas bort från
            registret (demo).
          </p>
          {lista.some((e) => e.status === "godkand") && (
            <div className="mt-3 flex flex-wrap gap-2">
              {lista
                .filter((e) => e.status === "godkand")
                .slice(0, 2)
                .map((ent) => (
                  <button
                    key={ent.id}
                    type="button"
                    onClick={() => startaUtredning(ent.id)}
                    className="rounded-lg border border-amber-300 px-3 py-1.5 text-xs text-amber-900"
                  >
                    Utred {ent.foretagsnamn} (demo)
                  </button>
                ))}
            </div>
          )}
        </section>
      )}

      {!kanRegistrera && (
        <section className="rounded-xl border border-border bg-background p-4 text-sm">
          <p className="font-semibold text-foreground">
            Misskötsel och borttagning
          </p>
          <p className="mt-2 leading-relaxed text-muted">
            Företag som missköter sig kan tas bort från registret. Innan vi
            agerar vill vi höra båda sidor — både föreningens synpunkter och
            entreprenörens — så att beslutet blir rättvist och väl underbyggt.
          </p>
        </section>
      )}
    </div>
  );
}
