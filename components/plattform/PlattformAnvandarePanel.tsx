"use client";

import { useCallback, useEffect, useState } from "react";

type Anvandare = {
  id: string;
  epost: string;
  namn: string;
  aktiv: boolean;
  senasteInloggning: string | null;
  skapadTidpunkt: string;
  arAllowlist: boolean;
};

function formatTid(iso: string | null): string {
  if (!iso) return "Aldrig";
  try {
    return new Date(iso).toLocaleString("sv-SE");
  } catch {
    return iso;
  }
}

/**
 * Lägg till personalanvändare och sätt kod/lösenord.
 */
export function PlattformAnvandarePanel() {
  const [anvandare, setAnvandare] = useState<Anvandare[]>([]);
  const [fel, setFel] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [laddar, setLaddar] = useState(true);

  const [nyEpost, setNyEpost] = useState("");
  const [nyNamn, setNyNamn] = useState("");
  const [nyKod, setNyKod] = useState("");
  const [spararNy, setSpararNy] = useState(false);

  const [redigeraId, setRedigeraId] = useState<string | null>(null);
  const [redigeraKod, setRedigeraKod] = useState("");
  const [redigeraNamn, setRedigeraNamn] = useState("");
  const [spararRedigera, setSpararRedigera] = useState(false);

  const ladda = useCallback(async () => {
    setLaddar(true);
    setFel(null);
    const res = await fetch("/api/plattform/anvandare");
    if (!res.ok) {
      setFel("Kunde inte ladda personalanvändare.");
      setLaddar(false);
      return;
    }
    const data = (await res.json()) as { anvandare: Anvandare[] };
    setAnvandare(data.anvandare || []);
    setLaddar(false);
  }, []);

  useEffect(() => {
    void ladda();
  }, [ladda]);

  async function skapa(e: React.FormEvent) {
    e.preventDefault();
    setFel(null);
    setOk(null);
    setSpararNy(true);
    try {
      const res = await fetch("/api/plattform/anvandare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          epost: nyEpost,
          namn: nyNamn,
          losenord: nyKod,
        }),
      });
      const data = (await res.json()) as { fel?: string };
      if (!res.ok) {
        setFel(data.fel || "Kunde inte skapa användare.");
        return;
      }
      setOk(`Användare ${nyEpost.trim().toLowerCase()} skapad.`);
      setNyEpost("");
      setNyNamn("");
      setNyKod("");
      await ladda();
    } catch {
      setFel("Kunde inte nå servern.");
    } finally {
      setSpararNy(false);
    }
  }

  async function sparaRedigering(kontoId: string) {
    setFel(null);
    setOk(null);
    setSpararRedigera(true);
    try {
      const res = await fetch("/api/plattform/anvandare", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kontoId,
          namn: redigeraNamn,
          losenord: redigeraKod || undefined,
        }),
      });
      const data = (await res.json()) as { fel?: string };
      if (!res.ok) {
        setFel(data.fel || "Kunde inte uppdatera.");
        return;
      }
      setOk("Användaren uppdaterad.");
      setRedigeraId(null);
      setRedigeraKod("");
      await ladda();
    } catch {
      setFel("Kunde inte nå servern.");
    } finally {
      setSpararRedigera(false);
    }
  }

  async function vaxlaAktiv(rad: Anvandare) {
    setFel(null);
    setOk(null);
    const res = await fetch("/api/plattform/anvandare", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kontoId: rad.id, aktiv: !rad.aktiv }),
    });
    const data = (await res.json()) as { fel?: string };
    if (!res.ok) {
      setFel(data.fel || "Kunde inte uppdatera status.");
      return;
    }
    setOk(rad.aktiv ? "Användaren inaktiverad." : "Användaren aktiverad.");
    await ladda();
  }

  return (
    <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-foreground">Personalanvändare</h2>
      <p className="mt-1 text-sm text-muted">
        Lägg till kollegor och sätt kod/lösenord. BankID kommer snart — tills
        dess loggar ni in med e-post och kod.
      </p>

      {fel ? (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {fel}
        </p>
      ) : null}
      {ok ? (
        <p className="mt-3 rounded-lg border border-primary/30 bg-[#eef6f0] px-3 py-2 text-sm text-primary-dark">
          {ok}
        </p>
      ) : null}

      <form
        onSubmit={skapa}
        className="mt-4 grid gap-3 rounded-xl border border-border bg-surface/60 p-4 sm:grid-cols-2"
      >
        <label className="block text-sm sm:col-span-1">
          <span className="font-medium">E-post</span>
          <input
            type="email"
            required
            value={nyEpost}
            onChange={(e) => setNyEpost(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2"
            autoComplete="off"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Namn</span>
          <input
            type="text"
            value={nyNamn}
            onChange={(e) => setNyNamn(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2"
            autoComplete="off"
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="font-medium">Kod / lösenord</span>
          <input
            type="text"
            required
            minLength={8}
            value={nyKod}
            onChange={(e) => setNyKod(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 font-mono"
            autoComplete="new-password"
          />
          <span className="mt-1 block text-xs text-muted">Minst 8 tecken.</span>
        </label>
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={spararNy}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
          >
            {spararNy ? "Sparar …" : "Lägg till användare"}
          </button>
        </div>
      </form>

      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border text-xs uppercase text-muted">
            <tr>
              <th className="py-2 pr-3">Namn / e-post</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2 pr-3">Senaste inloggning</th>
              <th className="py-2">Åtgärder</th>
            </tr>
          </thead>
          <tbody>
            {anvandare.map((rad) => (
              <tr key={rad.id} className="border-b border-border/60 align-top">
                <td className="py-3 pr-3">
                  {redigeraId === rad.id ? (
                    <input
                      type="text"
                      value={redigeraNamn}
                      onChange={(e) => setRedigeraNamn(e.target.value)}
                      className="mb-1 w-full rounded border border-border px-2 py-1"
                    />
                  ) : (
                    <p className="font-medium">{rad.namn || "—"}</p>
                  )}
                  <p className="text-xs text-muted">{rad.epost}</p>
                  {rad.arAllowlist ? (
                    <p className="mt-0.5 text-[11px] text-primary-dark">
                      Huvudadmin
                    </p>
                  ) : null}
                </td>
                <td className="py-3 pr-3">
                  {rad.aktiv ? (
                    <span className="text-primary-dark">Aktiv</span>
                  ) : (
                    <span className="text-amber-800">Inaktiv</span>
                  )}
                </td>
                <td className="py-3 pr-3 whitespace-nowrap text-muted">
                  {formatTid(rad.senasteInloggning)}
                </td>
                <td className="py-3">
                  {redigeraId === rad.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Ny kod (valfritt)"
                        value={redigeraKod}
                        onChange={(e) => setRedigeraKod(e.target.value)}
                        className="w-full rounded border border-border px-2 py-1 font-mono text-xs"
                        minLength={8}
                      />
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={spararRedigera}
                          onClick={() => void sparaRedigering(rad.id)}
                          className="rounded bg-primary px-2.5 py-1 text-xs font-semibold text-white"
                        >
                          Spara
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRedigeraId(null);
                            setRedigeraKod("");
                          }}
                          className="rounded border border-border px-2.5 py-1 text-xs"
                        >
                          Avbryt
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setRedigeraId(rad.id);
                          setRedigeraNamn(rad.namn);
                          setRedigeraKod("");
                        }}
                        className="rounded border border-border px-2.5 py-1 text-xs font-medium"
                      >
                        Sätt kod
                      </button>
                      <button
                        type="button"
                        onClick={() => void vaxlaAktiv(rad)}
                        className="rounded border border-border px-2.5 py-1 text-xs font-medium"
                      >
                        {rad.aktiv ? "Inaktivera" : "Aktivera"}
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {!laddar && anvandare.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-4 text-muted">
                  Inga personalanvändare ännu.
                </td>
              </tr>
            ) : null}
            {laddar ? (
              <tr>
                <td colSpan={4} className="py-4 text-muted">
                  Laddar …
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
