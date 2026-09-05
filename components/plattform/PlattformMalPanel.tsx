"use client";

import { useCallback, useEffect, useState } from "react";

type Mal = {
  malAvtal: number;
  malTest: number;
  uppdateradTidpunkt: string;
  uppdateradAvEpost: string;
};

type Props = {
  aktuelltAvtal: number;
  aktuelltTest: number;
  avslutadePerioder: number;
};

function progressProcent(aktuellt: number, mal: number): number {
  if (mal <= 0) return aktuellt > 0 ? 100 : 0;
  return Math.min(100, Math.round((aktuellt / mal) * 100));
}

function ProgressRad({
  etikett,
  beskrivning,
  aktuellt,
  mal,
  accent,
}: {
  etikett: string;
  beskrivning: string;
  aktuellt: number;
  mal: number;
  accent: string;
}) {
  const procent = progressProcent(aktuellt, mal);
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="font-semibold text-foreground">{etikett}</p>
          <p className="text-xs text-muted">{beskrivning}</p>
        </div>
        <p className="text-sm font-medium text-foreground">
          {aktuellt} / {mal}{" "}
          <span className="text-muted">({procent}%)</span>
        </p>
      </div>
      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-surface">
        <div
          className={`h-full rounded-full transition-all ${accent}`}
          style={{ width: `${procent}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Mål för avtal och aktuella testföreningar + avslutade perioder.
 */
export function PlattformMalPanel({
  aktuelltAvtal,
  aktuelltTest,
  avslutadePerioder,
}: Props) {
  const [mal, setMal] = useState<Mal | null>(null);
  const [malAvtal, setMalAvtal] = useState("10");
  const [malTest, setMalTest] = useState("20");
  const [fel, setFel] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [sparar, setSparar] = useState(false);

  const ladda = useCallback(async () => {
    setFel(null);
    const res = await fetch("/api/plattform/mal");
    if (!res.ok) {
      setFel("Kunde inte ladda mål.");
      return;
    }
    const data = (await res.json()) as { mal: Mal };
    setMal(data.mal);
    setMalAvtal(String(data.mal.malAvtal));
    setMalTest(String(data.mal.malTest));
  }, []);

  useEffect(() => {
    void ladda();
  }, [ladda]);

  async function spara(e: React.FormEvent) {
    e.preventDefault();
    setFel(null);
    setOk(null);
    setSparar(true);
    try {
      const res = await fetch("/api/plattform/mal", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          malAvtal: Number(malAvtal),
          malTest: Number(malTest),
        }),
      });
      const data = (await res.json()) as { fel?: string; mal?: Mal };
      if (!res.ok || !data.mal) {
        setFel(data.fel || "Kunde inte spara mål.");
        return;
      }
      setMal(data.mal);
      setOk("Målen sparade.");
    } catch {
      setFel("Kunde inte nå servern.");
    } finally {
      setSparar(false);
    }
  }

  const avtalMal = mal?.malAvtal ?? (Number(malAvtal) || 0);
  const testMal = mal?.malTest ?? (Number(malTest) || 0);

  return (
    <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-foreground">Mål &amp; uppföljning</h2>
      <p className="mt-1 text-sm text-muted">
        Sätt mål för avtalade föreningar och aktuella testföreningar. Avslutade
        prövoperioder visas separat.
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

      <div className="mt-6 space-y-5">
        <ProgressRad
          etikett="Avtalade föreningar"
          beskrivning="Tecknat årsavtal / accepterad offert"
          aktuellt={aktuelltAvtal}
          mal={avtalMal}
          accent="bg-primary"
        />
        <ProgressRad
          etikett="Aktuella testföreningar"
          beskrivning="Pågående prövoperiod utan avtal"
          aktuellt={aktuelltTest}
          mal={testMal}
          accent="bg-sky-500"
        />
      </div>

      <form
        onSubmit={spara}
        className="mt-6 grid gap-3 rounded-xl border border-border bg-surface/50 p-4 sm:grid-cols-[1fr_1fr_auto]"
      >
        <label className="block text-sm">
          <span className="font-medium">Mål avtal</span>
          <input
            type="number"
            min={0}
            value={malAvtal}
            onChange={(e) => setMalAvtal(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Mål aktuella tester</span>
          <input
            type="number"
            min={0}
            value={malTest}
            onChange={(e) => setMalTest(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2"
          />
        </label>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={sparar}
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50 sm:w-auto"
          >
            {sparar ? "Sparar …" : "Spara mål"}
          </button>
        </div>
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
      {mal?.uppdateradAvEpost ? (
        <p className="mt-2 text-xs text-muted">
          Senast sparat av {mal.uppdateradAvEpost}
          {mal.uppdateradTidpunkt
            ? ` · ${new Date(mal.uppdateradTidpunkt).toLocaleString("sv-SE")}`
            : ""}
        </p>
      ) : null}
    </section>
  );
}
