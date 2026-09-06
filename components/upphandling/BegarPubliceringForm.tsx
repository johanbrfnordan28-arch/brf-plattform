"use client";

import { FormEvent, useState } from "react";
import { upphandlingsKategorier } from "@/components/upphandling/kategorier";
import { sparaBegarPublicering } from "@/components/upphandling/begar-publicering-lager";

export function BegarPubliceringForm() {
  const [foreningsNamn, setForeningsNamn] = useState("");
  const [kontakt, setKontakt] = useState("");
  const [kategori, setKategori] = useState<string>(upphandlingsKategorier[0] ?? "");
  const [beskrivning, setBeskrivning] = useState("");
  const [onskadSistaAnbudsdag, setOnskadSistaAnbudsdag] = useState("");
  const [skickat, setSkickat] = useState(false);
  const [fel, setFel] = useState<string | null>(null);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setFel(null);

    if (!foreningsNamn.trim() || !kontakt.trim() || !beskrivning.trim()) {
      setFel("Fyll i föreningsnamn, kontakt och en kort beskrivning.");
      return;
    }

    try {
      sparaBegarPublicering({
        foreningsNamn,
        kontakt,
        kategori,
        beskrivning,
        onskadSistaAnbudsdag,
      });
      setSkickat(true);
      setForeningsNamn("");
      setKontakt("");
      setKategori(upphandlingsKategorier[0] ?? "");
      setBeskrivning("");
      setOnskadSistaAnbudsdag("");
    } catch (error) {
      setFel(
        error instanceof Error
          ? error.message
          : "Kunde inte spara förfrågan. Försök igen.",
      );
    }
  }

  if (skickat) {
    return (
      <div className="rounded-2xl border border-primary/30 bg-[#e8f3ec]/60 p-6 sm:p-8">
        <h3 className="font-semibold text-primary-dark">Tack — vi tar emot er förfrågan</h3>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Förfrågan är sparad för manuell hantering. Vi kontaktar er, bjuder in
          entreprenörer till underlaget och tar emot anbuden — utan att de syns på
          föreningssidan.
        </p>
        <button
          type="button"
          onClick={() => setSkickat(false)}
          className="mt-4 text-sm font-medium text-primary hover:text-primary-dark"
        >
          Skicka en till förfrågan
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-dashed border-primary/40 bg-[#e8f3ec]/50 p-6 sm:p-8"
    >
      <h3 className="font-semibold text-primary-dark">Begär publicering</h3>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
        Skicka underlagsuppgifter till oss. Vi publicerar upphandlingen, bjuder in
        entreprenörer och hanterar anbuden manuellt.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-foreground">Föreningsnamn</span>
          <input
            required
            value={foreningsNamn}
            onChange={(e) => setForeningsNamn(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
            placeholder="Brf Exempel"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-foreground">Kontakt (e-post eller telefon)</span>
          <input
            required
            value={kontakt}
            onChange={(e) => setKontakt(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
            placeholder="ordforande@exempel.se"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-foreground">Kategori</span>
          <select
            value={kategori}
            onChange={(e) => setKategori(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
          >
            {upphandlingsKategorier.map((namn) => (
              <option key={namn} value={namn}>
                {namn}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-medium text-foreground">
            Önskad sista anbudsdag <span className="font-normal text-muted">(valfritt)</span>
          </span>
          <input
            type="date"
            value={onskadSistaAnbudsdag}
            onChange={(e) => setOnskadSistaAnbudsdag(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="font-medium text-foreground">Kort beskrivning</span>
          <textarea
            required
            rows={4}
            value={beskrivning}
            onChange={(e) => setBeskrivning(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
            placeholder="Vad ska upphandlas, omfattning och eventuella bilagor ni har redo."
          />
        </label>
      </div>

      {fel && (
        <p className="mt-3 text-sm text-red-700" role="alert">
          {fel}
        </p>
      )}

      <button
        type="submit"
        className="mt-5 inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
      >
        Skicka förfrågan
      </button>
    </form>
  );
}
