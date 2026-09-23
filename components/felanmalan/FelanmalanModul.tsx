"use client";

import { useCallback, useEffect, useState } from "react";
import {
  lasAktivForeningId,
  lasForeningProfil,
} from "@/lib/forening-registry";
import { hamtaServerAccessNyckel } from "@/lib/forening-server-sync";
import {
  FELANMALAN_ORSAK,
  FELANMALAN_ORSAK_ETIKETT,
  FELANMALAN_PRIORITET,
  FELANMALAN_PRIORITET_ETIKETT,
  FELANMALAN_ROLL,
  FELANMALAN_ROLL_ETIKETT,
  FELANMALAN_STATUS,
  FELANMALAN_STATUS_ETIKETT,
  type FelanmalanArendeDto,
} from "@/lib/felanmalan/felanmalan-typer";
import { MedlemFelanmalanForm } from "@/components/felanmalan/MedlemFelanmalanForm";

function formatDatum(iso: string): string {
  try {
    return new Date(iso).toLocaleString("sv-SE", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function FelanmalanModul() {
  const foreningId = lasAktivForeningId();
  const profil = lasForeningProfil(foreningId);
  const [arenden, setArenden] = useState<FelanmalanArendeDto[]>([]);
  const [valdId, setValdId] = useState<string | null>(null);
  const [laddar, setLaddar] = useState(true);
  const [fel, setFel] = useState<string | null>(null);
  const [kommentar, setKommentar] = useState("");
  const [vidareEpost, setVidareEpost] = useState("");
  const [sparar, setSparar] = useState(false);

  const vald = arenden.find((a) => a.id === valdId) ?? null;

  const ladda = useCallback(async () => {
    if (!foreningId) return;
    setLaddar(true);
    setFel(null);
    try {
      const headers: Record<string, string> = {};
      const access = hamtaServerAccessNyckel(foreningId);
      if (access) headers["x-access-nyckel"] = access;
      const res = await fetch(
        `/api/foreningar/${encodeURIComponent(foreningId)}/felanmalan`,
        { headers },
      );
      const data = (await res.json()) as {
        fel?: string;
        arenden?: FelanmalanArendeDto[];
      };
      if (!res.ok) {
        if (res.status === 403 || res.status === 401) {
          setFel(
            "För att se och hantera inkomna ärenden: logga in med e-post och lösenord (styrelse-login). Medlemsformuläret ovan fungerar utan inloggning.",
          );
        } else {
          setFel(data.fel || "Kunde inte hämta ärenden.");
        }
        setArenden([]);
        return;
      }
      setArenden(data.arenden ?? []);
    } catch {
      setFel("Kunde inte nå servern.");
    } finally {
      setLaddar(false);
    }
  }, [foreningId]);

  useEffect(() => {
    void ladda();
  }, [ladda]);

  async function uppdatera(patch: Record<string, unknown>) {
    if (!foreningId || !vald) return;
    setSparar(true);
    setFel(null);
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      const access = hamtaServerAccessNyckel(foreningId);
      if (access) headers["x-access-nyckel"] = access;
      const res = await fetch(
        `/api/foreningar/${encodeURIComponent(foreningId)}/felanmalan/${encodeURIComponent(vald.id)}`,
        { method: "PATCH", headers, body: JSON.stringify(patch) },
      );
      const data = (await res.json()) as {
        fel?: string;
        arende?: FelanmalanArendeDto;
      };
      if (!res.ok || !data.arende) {
        setFel(data.fel || "Kunde inte spara.");
        return;
      }
      setArenden((prev) =>
        prev.map((a) => (a.id === data.arende!.id ? data.arende! : a)),
      );
      setKommentar("");
    } catch {
      setFel("Kunde inte nå servern.");
    } finally {
      setSparar(false);
    }
  }

  return (
    <div className="space-y-10">
      <section id="medlem-felanmalan" className="scroll-mt-24">
        <article className="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold text-foreground">
            Felanmälan för medlemmar
          </h2>
          <p className="mt-2 text-sm text-muted">
            Medlemmar fyller i formuläret — ärende skapas med nummer, mejl går
            till {profil?.epost?.trim() ? (
              <strong className="text-foreground">{profil.epost}</strong>
            ) : (
              "föreningens e-post (sätt under Föreningsuppgifter)"
            )}
            . Dela gärna länken till denna sida med boende.
          </p>
          <div className="mt-5">
            <MedlemFelanmalanForm foreningId={foreningId} />
          </div>
        </article>
      </section>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-foreground">
            Ärenden — förvaltare
          </h2>
          <button
            type="button"
            onClick={() => void ladda()}
            className="text-sm font-medium text-primary-dark hover:underline"
          >
            Uppdatera lista
          </button>
        </div>
        <p className="mt-1 text-sm text-muted">
          Prioritera, tilldela entreprenör eller fastighetsskötare och spara
          historik. Mejl vidare skickas till angiven adress.
        </p>

        {fel ? (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {fel}
          </p>
        ) : null}

        {laddar ? (
          <p className="mt-4 text-sm text-muted">Laddar ärenden …</p>
        ) : (
          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
            <ul className="max-h-[28rem] space-y-2 overflow-y-auto rounded-xl border border-border bg-surface p-2">
              {arenden.length === 0 ? (
                <li className="p-4 text-sm text-muted">Inga ärenden ännu.</li>
              ) : (
                arenden.map((a) => (
                  <li key={a.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setValdId(a.id);
                        setVidareEpost(a.vidareEpost);
                      }}
                      className={
                        valdId === a.id
                          ? "w-full rounded-lg border border-primary/40 bg-[#eef6f0] px-3 py-2 text-left text-sm"
                          : "w-full rounded-lg border border-transparent px-3 py-2 text-left text-sm hover:bg-white"
                      }
                    >
                      <span className="font-mono text-xs text-primary-dark">
                        {a.arendeNummer}
                      </span>
                      <span className="mt-0.5 block font-medium text-foreground">
                        {a.rubrik}
                      </span>
                      <span className="text-xs text-muted">
                        {FELANMALAN_STATUS_ETIKETT[a.status]} ·{" "}
                        {FELANMALAN_PRIORITET_ETIKETT[a.prioritet]}
                      </span>
                    </button>
                  </li>
                ))
              )}
            </ul>

            {vald ? (
              <article className="rounded-xl border border-border bg-white p-4 sm:p-5">
                <p className="font-mono text-sm text-primary-dark">
                  {vald.arendeNummer}
                </p>
                <h3 className="mt-1 text-lg font-semibold">{vald.rubrik}</h3>
                <p className="mt-2 whitespace-pre-wrap text-sm text-muted">
                  {vald.beskrivning}
                </p>
                <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-muted">Medlem</dt>
                    <dd>{vald.medlemNamn}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Lägenhet</dt>
                    <dd>{vald.lagenhetsnummer || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">E-post</dt>
                    <dd>{vald.medlemEpost}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Telefon</dt>
                    <dd>{vald.medlemTelefon || "—"}</dd>
                  </div>
                </dl>
                {(vald.debiteringKan ||
                  vald.nyckelPlats ||
                  vald.boendeEjHemma) && (
                  <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-2 text-sm">
                    {vald.boendeEjHemma ? (
                      <p>Medlem: ofta inte hemma.</p>
                    ) : null}
                    {vald.nyckelPlats ? (
                      <p>Nyckel/plats: {vald.nyckelPlats}</p>
                    ) : null}
                    {vald.debiteringKan ? (
                      <p>
                        Debitering kan bli aktuell.{" "}
                        {vald.debiteringAnteckning}
                      </p>
                    ) : null}
                  </div>
                )}

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <label className="text-sm">
                    Status
                    <select
                      value={vald.status}
                      disabled={sparar}
                      onChange={(e) =>
                        void uppdatera({ status: e.target.value })
                      }
                      className="mt-1 w-full rounded-lg border border-border px-2 py-1.5"
                    >
                      {FELANMALAN_STATUS.map((s) => (
                        <option key={s} value={s}>
                          {FELANMALAN_STATUS_ETIKETT[s]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm">
                    Prioritet
                    <select
                      value={vald.prioritet}
                      disabled={sparar}
                      onChange={(e) =>
                        void uppdatera({ prioritet: e.target.value })
                      }
                      className="mt-1 w-full rounded-lg border border-border px-2 py-1.5"
                    >
                      {FELANMALAN_PRIORITET.map((p) => (
                        <option key={p} value={p}>
                          {FELANMALAN_PRIORITET_ETIKETT[p]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm">
                    Orsak
                    <select
                      value={vald.orsak}
                      disabled={sparar}
                      onChange={(e) =>
                        void uppdatera({ orsak: e.target.value })
                      }
                      className="mt-1 w-full rounded-lg border border-border px-2 py-1.5"
                    >
                      {FELANMALAN_ORSAK.map((o) => (
                        <option key={o} value={o}>
                          {FELANMALAN_ORSAK_ETIKETT[o]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm">
                    Tilldela roll
                    <select
                      value={vald.tilldeladRoll}
                      disabled={sparar}
                      onChange={(e) =>
                        void uppdatera({ tilldeladRoll: e.target.value })
                      }
                      className="mt-1 w-full rounded-lg border border-border px-2 py-1.5"
                    >
                      {FELANMALAN_ROLL.map((r) => (
                        <option key={r} value={r}>
                          {FELANMALAN_ROLL_ETIKETT[r]}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="mt-4 block text-sm">
                  Mejla vidare till (entreprenör / skötare)
                  <input
                    type="email"
                    value={vidareEpost}
                    onChange={(e) => setVidareEpost(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2"
                    placeholder="epost@entreprenor.se"
                  />
                </label>
                <button
                  type="button"
                  disabled={sparar || !vidareEpost.trim()}
                  onClick={() =>
                    void uppdatera({
                      vidareEpost,
                      skickaMejlVidare: true,
                      kommentar: `Mejl skickat till ${vidareEpost.trim()}`,
                    })
                  }
                  className="mt-2 rounded-lg border border-primary/40 px-3 py-2 text-sm font-medium text-primary-dark hover:bg-[#eef6f0] disabled:opacity-50"
                >
                  Skicka ärende via mejl
                </button>

                <label className="mt-4 block text-sm">
                  Kommentar i historiken
                  <textarea
                    rows={2}
                    value={kommentar}
                    onChange={(e) => setKommentar(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2"
                  />
                </label>
                <button
                  type="button"
                  disabled={sparar || !kommentar.trim()}
                  onClick={() =>
                    void uppdatera({ kommentar: kommentar.trim() })
                  }
                  className="mt-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
                >
                  Spara kommentar
                </button>

                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-foreground">
                    Historik
                  </h4>
                  <ul className="mt-2 space-y-2 text-sm">
                    {vald.historik.length === 0 ? (
                      <li className="text-muted">Ingen historik.</li>
                    ) : (
                      [...vald.historik].reverse().map((h, i) => (
                        <li
                          key={`${h.tidpunkt}-${i}`}
                          className="rounded-lg border border-border bg-surface px-3 py-2"
                        >
                          <p className="text-xs text-muted">
                            {formatDatum(h.tidpunkt)} · {h.av}
                          </p>
                          <p className="mt-0.5">{h.text}</p>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </article>
            ) : (
              <p className="rounded-xl border border-dashed border-border p-6 text-sm text-muted">
                Välj ett ärende i listan.
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
