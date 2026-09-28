"use client";

import { useState } from "react";
import {
  FELANMALAN_ORSAK,
  FELANMALAN_ORSAK_ETIKETT,
  FELANMALAN_PRIORITET,
  FELANMALAN_PRIORITET_ETIKETT,
} from "@/lib/felanmalan/felanmalan-typer";

type Props = {
  foreningId: string;
};

export function MedlemFelanmalanForm({ foreningId }: Props) {
  const [rubrik, setRubrik] = useState("");
  const [beskrivning, setBeskrivning] = useState("");
  const [medlemNamn, setMedlemNamn] = useState("");
  const [medlemEpost, setMedlemEpost] = useState("");
  const [medlemTelefon, setMedlemTelefon] = useState("");
  const [lagenhetsnummer, setLagenhetsnummer] = useState("");
  const [prioritet, setPrioritet] = useState<string>("normal");
  const [orsak, setOrsak] = useState<string>("ovrigt");
  const [debiteringKan, setDebiteringKan] = useState(false);
  const [debiteringAnteckning, setDebiteringAnteckning] = useState("");
  const [nyckelPlats, setNyckelPlats] = useState("");
  const [boendeEjHemma, setBoendeEjHemma] = useState(false);
  const [laddar, setLaddar] = useState(false);
  const [fel, setFel] = useState<string | null>(null);
  const [klart, setKlart] = useState<{ arendeNummer: string } | null>(null);

  async function skicka(e: React.FormEvent) {
    e.preventDefault();
    setFel(null);
    setLaddar(true);
    try {
      const res = await fetch(
        `/api/foreningar/${encodeURIComponent(foreningId)}/felanmalan`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rubrik,
            beskrivning,
            medlemNamn,
            medlemEpost,
            medlemTelefon,
            lagenhetsnummer,
            prioritet,
            orsak,
            debiteringKan,
            debiteringAnteckning,
            nyckelPlats,
            boendeEjHemma,
          }),
        },
      );
      const data = (await res.json()) as {
        fel?: string;
        arende?: { arendeNummer: string };
      };
      if (!res.ok || !data.arende) {
        setFel(data.fel || "Kunde inte skicka felanmälan.");
        return;
      }
      setKlart({ arendeNummer: data.arende.arendeNummer });
    } catch {
      setFel("Kunde inte nå servern.");
    } finally {
      setLaddar(false);
    }
  }

  if (klart) {
    return (
      <div className="rounded-xl border border-primary/30 bg-[#eef6f0] p-5">
        <p className="font-semibold text-primary-dark">Tack — er felanmälan är mottagen</p>
        <p className="mt-2 text-sm text-muted">
          Ärendenummer:{" "}
          <strong className="text-foreground">{klart.arendeNummer}</strong>.
          Förvaltaren har fått mejl och återkommer. Spara numret om ni behöver
          följa upp.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => void skicka(e)} className="space-y-4">
      <p className="text-sm text-muted">
        Beskriv felet så tydligt ni kan. Uppgifterna mejlas till föreningens
        förvaltare/styrelse och sparas som ärende med nummer och historik.
      </p>

      <label className="block text-sm">
        <span className="font-medium">Rubrik</span>
        <input
          required
          value={rubrik}
          onChange={(e) => setRubrik(e.target.value)}
          className="mt-1 w-full rounded-lg border border-border px-3 py-2"
          placeholder="T.ex. Vattenläcka under diskbänk"
        />
      </label>

      <label className="block text-sm">
        <span className="font-medium">Beskrivning</span>
        <textarea
          required
          rows={4}
          value={beskrivning}
          onChange={(e) => setBeskrivning(e.target.value)}
          className="mt-1 w-full rounded-lg border border-border px-3 py-2"
          placeholder="När upptäcktes felet, var i lägenheten/huset, vad har ni provat?"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium">Orsak / typ</span>
          <select
            value={orsak}
            onChange={(e) => setOrsak(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2"
          >
            {FELANMALAN_ORSAK.map((o) => (
              <option key={o} value={o}>
                {FELANMALAN_ORSAK_ETIKETT[o]}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-medium">Önskad prioritet</span>
          <select
            value={prioritet}
            onChange={(e) => setPrioritet(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2"
          >
            {FELANMALAN_PRIORITET.map((p) => (
              <option key={p} value={p}>
                {FELANMALAN_PRIORITET_ETIKETT[p]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium">Ert namn</span>
          <input
            required
            value={medlemNamn}
            onChange={(e) => setMedlemNamn(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium">E-post</span>
          <input
            required
            type="email"
            value={medlemEpost}
            onChange={(e) => setMedlemEpost(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium">Telefon (valfritt)</span>
          <input
            value={medlemTelefon}
            onChange={(e) => setMedlemTelefon(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Lägenhetsnummer</span>
          <input
            value={lagenhetsnummer}
            onChange={(e) => setLagenhetsnummer(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2"
            placeholder="T.ex. 1201"
          />
        </label>
      </div>

      <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 p-4 text-sm">
        <p className="font-medium text-amber-950">Tillträde och debitering</p>
        <p className="mt-1 text-muted">
          Om ni inte är hemma eller åtgärd kräver nyckel kan föreningen behöva
          debitera enligt avtal. Ange hur vi kommer in.
        </p>
        <label className="mt-3 flex items-start gap-2">
          <input
            type="checkbox"
            checked={boendeEjHemma}
            onChange={(e) => setBoendeEjHemma(e.target.checked)}
            className="mt-1"
          />
          <span>Jag/vi är ofta inte hemma vid överenskommen tid</span>
        </label>
        <label className="mt-2 block">
          <span className="font-medium">Nyckel / passage</span>
          <input
            value={nyckelPlats}
            onChange={(e) => setNyckelPlats(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2"
            placeholder="T.ex. nyckel hos granne, portkod enligt avtal"
          />
        </label>
        <label className="mt-3 flex items-start gap-2">
          <input
            type="checkbox"
            checked={debiteringKan}
            onChange={(e) => setDebiteringKan(e.target.checked)}
            className="mt-1"
          />
          <span>
            Jag förstår att debitering kan bli aktuell om åtgärd kräver extra
            besök (t.ex. låst dörr utan nyckel).
          </span>
        </label>
        {debiteringKan ? (
          <textarea
            rows={2}
            value={debiteringAnteckning}
            onChange={(e) => setDebiteringAnteckning(e.target.value)}
            className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2"
            placeholder="Valfri kommentar om debitering"
          />
        ) : null}
      </div>

      {fel ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {fel}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={laddar}
        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
      >
        {laddar ? "Skickar …" : "Skicka felanmälan"}
      </button>
    </form>
  );
}
