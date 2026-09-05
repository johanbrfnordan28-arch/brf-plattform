"use client";

import { FormEvent, useState } from "react";
import { ABK_09_KORT, ABK_09_LANG } from "@/lib/abk-09";
import {
  OFFERT_TJANSTER,
  skapaOffertForfragan,
  type OffertTjanst,
} from "@/components/offert/offert-forfragan-lager";
import { PLATTFORM_STOD_EPOST } from "@/lib/plattform-stod";

/**
 * Publikt formulär — sparar förfrågan så personal ser den under /plattform.
 */
export function OffertForfraganForm() {
  const [foreningsNamn, setForeningsNamn] = useState("");
  const [kontaktperson, setKontaktperson] = useState("");
  const [epost, setEpost] = useState("");
  const [telefon, setTelefon] = useState("");
  const [antalLagenheter, setAntalLagenheter] = useState("");
  const [tjanster, setTjanster] = useState<OffertTjanst[]>([]);
  const [meddelande, setMeddelande] = useState("");
  const [fel, setFel] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  function vaxlaTjanst(t: OffertTjanst) {
    setTjanster((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    );
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFel(null);
    setOk(false);
    try {
      skapaOffertForfragan({
        foreningsNamn,
        kontaktperson,
        epost,
        telefon,
        antalLagenheter,
        tjanster,
        meddelande,
      });
      setOk(true);
      setForeningsNamn("");
      setKontaktperson("");
      setEpost("");
      setTelefon("");
      setAntalLagenheter("");
      setTjanster([]);
      setMeddelande("");
    } catch (error) {
      setFel(error instanceof Error ? error.message : "Kunde inte skicka.");
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-2xl border border-border bg-surface p-5 shadow-sm"
    >
      <div>
        <h3 className="font-semibold text-foreground">Begär offert</h3>
        <p className="mt-1 text-sm text-muted">
          Fyll i formuläret — vi återkommer med offert. {ABK_09_KORT}
        </p>
      </div>

      <label className="block text-sm">
        <span className="font-medium">Föreningsnamn</span>
        <input
          required
          value={foreningsNamn}
          onChange={(e) => setForeningsNamn(e.target.value)}
          className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2"
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium">Kontaktperson</span>
          <input
            required
            value={kontaktperson}
            onChange={(e) => setKontaktperson(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium">E-post</span>
          <input
            required
            type="email"
            value={epost}
            onChange={(e) => setEpost(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Telefon (valfritt)</span>
          <input
            value={telefon}
            onChange={(e) => setTelefon(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Antal lägenheter (valfritt)</span>
          <input
            value={antalLagenheter}
            onChange={(e) => setAntalLagenheter(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2"
            placeholder="t.ex. 48"
          />
        </label>
      </div>

      <fieldset>
        <legend className="text-sm font-medium">Tjänster</legend>
        <div className="mt-2 flex flex-col gap-2">
          {OFFERT_TJANSTER.map((t) => (
            <label key={t} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={tjanster.includes(t)}
                onChange={() => vaxlaTjanst(t)}
                className="rounded border-border"
              />
              {t}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="block text-sm">
        <span className="font-medium">Meddelande (valfritt)</span>
        <textarea
          rows={3}
          value={meddelande}
          onChange={(e) => setMeddelande(e.target.value)}
          className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2"
          placeholder="Kort om behov och tidsplan"
        />
      </label>

      <p className="rounded-lg border border-primary/20 bg-[#eef6f0] px-3 py-2 text-xs text-primary-dark">
        {ABK_09_LANG}
      </p>

      {fel && (
        <p className="text-sm text-red-700" role="alert">
          {fel}
        </p>
      )}
      {ok && (
        <p className="text-sm text-primary-dark" role="status">
          Tack — er förfrågan är skickad. Vi återkommer till er e-post. Vid
          akut fråga: {PLATTFORM_STOD_EPOST}
        </p>
      )}

      <button
        type="submit"
        className="brf-knapp-gron px-5 py-2.5 text-sm"
      >
        Skicka förfrågan
      </button>
    </form>
  );
}
