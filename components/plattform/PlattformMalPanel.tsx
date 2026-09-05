"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type MalTyp = "avtal" | "test";

type MalRad = {
  id: string;
  typ: MalTyp;
  titel: string;
  malAntal: number;
  tidpunkt: string;
  uppfylld: boolean;
  uppfylldTidpunkt: string | null;
  aktuellt: number;
  procent: number;
  forsenad: boolean;
  skapadAvEpost: string;
};

type Installning = {
  varningTestAntal: number;
};

type Props = {
  aktuelltAvtal: number;
  aktuelltTest: number;
  avslutadePerioder: number;
};

function formatDatum(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("sv-SE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function tillInputDatum(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function typEtikett(typ: MalTyp): string {
  return typ === "avtal" ? "Avtalade föreningar" : "Aktuella testföreningar";
}

/**
 * Skapa flera mål med tidpunkt, följ upp uppfyllda mål och varna för många tester.
 */
export function PlattformMalPanel({
  aktuelltAvtal,
  aktuelltTest,
  avslutadePerioder,
}: Props) {
  const [mal, setMal] = useState<MalRad[]>([]);
  const [installning, setInstallning] = useState<Installning | null>(null);
  const [varningTest, setVarningTest] = useState(false);
  const [fel, setFel] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [laddar, setLaddar] = useState(true);

  const [nyTyp, setNyTyp] = useState<MalTyp>("avtal");
  const [nyTitel, setNyTitel] = useState("");
  const [nyAntal, setNyAntal] = useState("10");
  const [nyTidpunkt, setNyTidpunkt] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return tillInputDatum(d);
  });
  const [spararMal, setSpararMal] = useState(false);

  const [varningAntal, setVarningAntal] = useState("25");
  const [spararVarning, setSpararVarning] = useState(false);

  const ladda = useCallback(async () => {
    setLaddar(true);
    setFel(null);
    const res = await fetch("/api/plattform/mal");
    if (!res.ok) {
      setFel("Kunde inte ladda mål.");
      setLaddar(false);
      return;
    }
    const data = (await res.json()) as {
      mal: MalRad[];
      installning: Installning;
      varningTest: boolean;
    };
    setMal(data.mal || []);
    setInstallning(data.installning);
    setVarningAntal(String(data.installning?.varningTestAntal ?? 25));
    setVarningTest(Boolean(data.varningTest));
    setLaddar(false);
  }, []);

  useEffect(() => {
    void ladda();
  }, [ladda]);

  const aktiva = useMemo(
    () => mal.filter((m) => !m.uppfylld),
    [mal],
  );
  const uppfyllda = useMemo(
    () => mal.filter((m) => m.uppfylld),
    [mal],
  );

  async function skapaMal(e: React.FormEvent) {
    e.preventDefault();
    setFel(null);
    setOk(null);
    setSpararMal(true);
    try {
      const res = await fetch("/api/plattform/mal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          typ: nyTyp,
          titel: nyTitel,
          malAntal: Number(nyAntal),
          tidpunkt: new Date(`${nyTidpunkt}T23:59:59`).toISOString(),
        }),
      });
      const data = (await res.json()) as { fel?: string };
      if (!res.ok) {
        setFel(data.fel || "Kunde inte skapa mål.");
        return;
      }
      setOk("Målet skapades.");
      setNyTitel("");
      await ladda();
    } catch {
      setFel("Kunde inte nå servern.");
    } finally {
      setSpararMal(false);
    }
  }

  async function sparaVarning(e: React.FormEvent) {
    e.preventDefault();
    setFel(null);
    setOk(null);
    setSpararVarning(true);
    try {
      const res = await fetch("/api/plattform/mal", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ varningTestAntal: Number(varningAntal) }),
      });
      const data = (await res.json()) as {
        fel?: string;
        installning?: Installning;
      };
      if (!res.ok || !data.installning) {
        setFel(data.fel || "Kunde inte spara varning.");
        return;
      }
      setInstallning(data.installning);
      setOk("Varningströskeln sparades.");
      await ladda();
    } catch {
      setFel("Kunde inte nå servern.");
    } finally {
      setSpararVarning(false);
    }
  }

  async function taBortMal(id: string) {
    setFel(null);
    setOk(null);
    const res = await fetch(`/api/plattform/mal?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    const data = (await res.json()) as { fel?: string };
    if (!res.ok) {
      setFel(data.fel || "Kunde inte ta bort målet.");
      return;
    }
    setOk("Målet togs bort från listan.");
    await ladda();
  }

  const troskel = installning?.varningTestAntal ?? (Number(varningAntal) || 25);

  return (
    <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-foreground">Mål &amp; uppföljning</h2>
      <p className="mt-1 text-sm text-muted">
        Skapa flera mål med tidpunkt. När ett mål nås markeras det som uppfyllt.
        Justera också när varning för för många testföreningar ska visas.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-primary/25 bg-[#eef6f0] px-4 py-3 text-center">
          <p className="text-2xl font-bold text-foreground">{aktuelltAvtal}</p>
          <p className="text-xs text-muted">Med avtal</p>
        </div>
        <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-center">
          <p className="text-2xl font-bold text-foreground">{aktuelltTest}</p>
          <p className="text-xs text-muted">Aktuella tester</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center">
          <p className="text-2xl font-bold text-foreground">{avslutadePerioder}</p>
          <p className="text-xs text-muted">Avslutade perioder</p>
        </div>
      </div>

      {(varningTest || aktuelltTest >= troskel) && (
        <div
          className="mt-5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950"
          role="alert"
        >
          <p className="font-semibold">Varning: många testföreningar</p>
          <p className="mt-1">
            Ni har <strong>{aktuelltTest}</strong> aktuella testföreningar.
            Varningen visas från <strong>{troskel}</strong> stycken — justera
            tröskeln nedan.
          </p>
        </div>
      )}

      <form
        onSubmit={sparaVarning}
        className="mt-5 flex flex-wrap items-end gap-3 rounded-xl border border-border bg-surface/50 p-4"
      >
        <label className="block text-sm">
          <span className="font-medium">Varning vid antal testföreningar</span>
          <input
            type="number"
            min={1}
            value={varningAntal}
            onChange={(e) => setVarningAntal(e.target.value)}
            className="mt-1 w-40 rounded-lg border border-border bg-white px-3 py-2"
          />
        </label>
        <button
          type="submit"
          disabled={spararVarning}
          className="rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium hover:border-primary/40 disabled:opacity-50"
        >
          {spararVarning ? "Sparar …" : "Spara varning"}
        </button>
        <p className="w-full text-xs text-muted">
          Varningen utlöses när antalet aktuella testföreningar når eller
          överstiger värdet.
        </p>
      </form>

      <form
        onSubmit={skapaMal}
        className="mt-6 space-y-3 rounded-xl border border-primary/20 bg-[#eef6f0]/50 p-4"
      >
        <h3 className="text-base font-semibold text-foreground">Skapa mål</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block text-sm">
            <span className="font-medium">Typ</span>
            <select
              value={nyTyp}
              onChange={(e) => setNyTyp(e.target.value as MalTyp)}
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2"
            >
              <option value="avtal">Avtalade föreningar</option>
              <option value="test">Aktuella testföreningar</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-medium">Målantal</span>
            <input
              type="number"
              min={1}
              required
              value={nyAntal}
              onChange={(e) => setNyAntal(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Tidpunkt</span>
            <input
              type="date"
              required
              value={nyTidpunkt}
              onChange={(e) => setNyTidpunkt(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Titel (valfritt)</span>
            <input
              type="text"
              value={nyTitel}
              onChange={(e) => setNyTitel(e.target.value)}
              placeholder="t.ex. Q4"
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2"
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={spararMal}
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
        >
          {spararMal ? "Skapar …" : "Skapa mål"}
        </button>
      </form>

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

      <div className="mt-6">
        <h3 className="text-base font-semibold text-foreground">
          Aktiva mål
        </h3>
        {laddar ? (
          <p className="mt-2 text-sm text-muted">Laddar …</p>
        ) : aktiva.length === 0 ? (
          <p className="mt-2 text-sm text-muted">
            Inga aktiva mål. Skapa ett mål ovan.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {aktiva.map((m) => (
              <li
                key={m.id}
                className={`rounded-xl border px-4 py-3 ${
                  m.forsenad
                    ? "border-amber-300 bg-amber-50/80"
                    : "border-border bg-surface/40"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-foreground">
                      {m.titel || typEtikett(m.typ)}
                      {m.titel ? (
                        <span className="ml-2 text-xs font-normal text-muted">
                          {typEtikett(m.typ)}
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      Tidpunkt {formatDatum(m.tidpunkt)}
                      {m.forsenad ? " · försenad" : ""}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-medium">
                      {m.aktuellt} / {m.malAntal}{" "}
                      <span className="text-muted">({m.procent}%)</span>
                    </p>
                    <button
                      type="button"
                      onClick={() => void taBortMal(m.id)}
                      className="mt-1 text-xs text-muted underline hover:text-foreground"
                    >
                      Ta bort
                    </button>
                  </div>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                  <div
                    className={`h-full rounded-full ${
                      m.typ === "avtal" ? "bg-primary" : "bg-sky-500"
                    }`}
                    style={{ width: `${m.procent}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-8">
        <h3 className="text-base font-semibold text-foreground">
          Uppfyllda mål
        </h3>
        <p className="mt-1 text-xs text-muted">
          Tidigare mål som nåtts — behålls så ni ser historiken.
        </p>
        {uppfyllda.length === 0 ? (
          <p className="mt-2 text-sm text-muted">Inga uppfyllda mål ännu.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {uppfyllda.map((m) => (
              <li
                key={m.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary/20 bg-[#eef6f0]/70 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium text-foreground">
                    {m.titel || typEtikett(m.typ)} — {m.malAntal} st
                  </p>
                  <p className="text-xs text-muted">
                    Tidpunkt {formatDatum(m.tidpunkt)}
                    {m.uppfylldTidpunkt
                      ? ` · uppfyllt ${formatDatum(m.uppfylldTidpunkt)}`
                      : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void taBortMal(m.id)}
                  className="text-xs text-muted underline hover:text-foreground"
                >
                  Arkivera
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
