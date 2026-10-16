"use client";

import { FormEvent, useState } from "react";
import { ABK_09_KORT, ABK_09_LANG } from "@/lib/abk-09";
import {
  OFFERT_MAXLANGD,
  OFFERT_TJANSTER,
  type OffertTjanst,
} from "@/lib/offert-forfragan";
import { OFFERT_EPOST } from "@/lib/offert-mejl";
import { OFFERT_KONTAKTPERSONER } from "@/lib/kontakt-epost";
import type { OffertKontaktpersonId } from "@/lib/kontakt-epost";

/**
 * Publikt formulär — sparar förfrågan på servern så personal ser den under /plattform.
 */
export function OffertForfraganForm() {
  const [foreningsNamn, setForeningsNamn] = useState("");
  const [kontaktperson, setKontaktperson] = useState("");
  const [oonskadKontaktId, setOonskadKontaktId] =
    useState<OffertKontaktpersonId>("offert");
  const [epost, setEpost] = useState("");
  const [telefon, setTelefon] = useState("");
  const [antalLagenheter, setAntalLagenheter] = useState("");
  const [tjanster, setTjanster] = useState<OffertTjanst[]>([]);
  const [meddelande, setMeddelande] = useState("");
  const [webbplats, setWebbplats] = useState("");
  const [fel, setFel] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [skickar, setSkickar] = useState(false);

  function vaxlaTjanst(t: OffertTjanst) {
    setTjanster((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFel(null);
    setOk(false);
    if (!tjanster.length) {
      setFel("Välj minst en tjänst.");
      return;
    }
    setSkickar(true);
    try {
      const res = await fetch("/api/offert/forfragan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          foreningsNamn,
          kontaktperson,
          oonskadKontaktId,
          epost,
          telefon,
          antalLagenheter,
          tjanster,
          meddelande,
          webbplats,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { fel?: string };
      if (!res.ok) {
        throw new Error(
          data.fel || `Kunde inte skicka. Mejla oss direkt på ${OFFERT_EPOST}.`,
        );
      }
      setOk(true);
      setForeningsNamn("");
      setKontaktperson("");
      setOonskadKontaktId("offert");
      setEpost("");
      setTelefon("");
      setAntalLagenheter("");
      setTjanster([]);
      setMeddelande("");
    } catch (error) {
      setFel(error instanceof Error ? error.message : "Kunde inte skicka.");
    } finally {
      setSkickar(false);
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
          maxLength={OFFERT_MAXLANGD.foreningsNamn}
          onChange={(e) => setForeningsNamn(e.target.value)}
          className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2"
        />
      </label>

      <fieldset>
        <legend className="text-sm font-medium">Vem vill ni kontakta?</legend>
        <div className="mt-2 flex flex-col gap-2">
          {OFFERT_KONTAKTPERSONER.map((person) => (
            <label
              key={person.id}
              className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-white px-3 py-2.5 text-sm has-[:checked]:border-primary has-[:checked]:bg-[#eef6f0]"
            >
              <input
                type="radio"
                name="oonskadKontakt"
                required
                checked={oonskadKontaktId === person.id}
                onChange={() => setOonskadKontaktId(person.id)}
                className="mt-1"
              />
              <span>
                <span className="font-medium text-foreground">{person.namn}</span>
                <span className="mt-0.5 block text-muted">{person.beskrivning}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium">Kontaktperson</span>
          <input
            required
            value={kontaktperson}
          maxLength={OFFERT_MAXLANGD.kontaktperson}
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
          maxLength={OFFERT_MAXLANGD.epost}
            onChange={(e) => setEpost(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Telefon (valfritt)</span>
          <input
            value={telefon}
          maxLength={OFFERT_MAXLANGD.telefon}
            onChange={(e) => setTelefon(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Antal lägenheter (valfritt)</span>
          <input
            value={antalLagenheter}
          maxLength={OFFERT_MAXLANGD.antalLagenheter}
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
          maxLength={OFFERT_MAXLANGD.meddelande}
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
          akut fråga: {OFFERT_EPOST}
        </p>
      )}

      <input
        type="text"
        name="webbplats"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={webbplats}
        onChange={(e) => setWebbplats(e.target.value)}
        className="hidden"
      />

      <button
        type="submit"
        disabled={skickar}
        className="brf-knapp-gron px-5 py-2.5 text-sm disabled:opacity-60"
      >
        {skickar ? "Skickar …" : "Skicka förfrågan"}
      </button>
    </form>
  );
}
