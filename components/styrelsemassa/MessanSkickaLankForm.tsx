"use client";

import { FormEvent, useState } from "react";
import { sparaStyrelsemassaLeadLokal } from "@/lib/styrelsemassa-lager";

type MessanSkickaLankFormProps = {
  kompakt?: boolean;
  /** Inbäddad i startsidans kort — utan egen ram och med neutral knapp. */
  inlagd?: boolean;
};

/**
 * Lättare ingång än att skapa testförening direkt — mejlar länk till prova-gratis.
 */
export function MessanSkickaLankForm({
  kompakt = false,
  inlagd = false,
}: MessanSkickaLankFormProps) {
  const [foreningsNamn, setForeningsNamn] = useState("");
  const [epost, setEpost] = useState("");
  const [kontaktperson, setKontaktperson] = useState("");
  const [telefon, setTelefon] = useState("");
  const [fel, setFel] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [skickar, setSkickar] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFel(null);
    setOk(false);
    setSkickar(true);

    try {
      const res = await fetch("/api/styrelsemassa/skicka-lank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          foreningsNamn,
          epost,
          kontaktperson,
          telefon,
        }),
      });
      const data = (await res.json()) as { fel?: string; meddelande?: string };

      if (!res.ok) {
        throw new Error(data.fel ?? "Kunde inte skicka länken.");
      }

      sparaStyrelsemassaLeadLokal({
        foreningsNamn,
        epost,
        kontaktperson,
        telefon,
      });

      setOk(true);
      setForeningsNamn("");
      setEpost("");
      setKontaktperson("");
      setTelefon("");
    } catch (error) {
      setFel(error instanceof Error ? error.message : "Något gick fel.");
    } finally {
      setSkickar(false);
    }
  }

  return (
    <form
      id="mejla-lank"
      onSubmit={(e) => void onSubmit(e)}
      className={
        inlagd
          ? "mt-4 space-y-3"
          : `space-y-4 rounded-2xl border border-dashed border-primary/40 bg-[#eef6f0]/60 p-5 shadow-sm ${kompakt ? "" : "sm:p-6"}`
      }
    >
      {!inlagd ? (
        <div>
          <h3 className="font-semibold text-foreground">Mejla mig en länk</h3>
          <p className="mt-1 text-sm text-muted">
            Vill ni fundera först? Vi mejlar en länk till huvudsidan så ni kan
            titta i lugn och ro — samma provperiod som ovan.
          </p>
        </div>
      ) : null}

      <label className="block text-sm">
        <span className="font-medium">
          Föreningens namn <span className="text-red-600">*</span>
        </span>
        <input
          required
          value={foreningsNamn}
          onChange={(e) => setForeningsNamn(e.target.value)}
          placeholder="Brf Exempel 1"
          className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2"
        />
      </label>

      <label className="block text-sm">
        <span className="font-medium">
          E-post <span className="text-red-600">*</span>
        </span>
        <input
          required
          type="email"
          value={epost}
          onChange={(e) => setEpost(e.target.value)}
          className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2"
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium">
            Ditt namn{" "}
            <span className="font-normal text-muted">(valfritt)</span>
          </span>
          <input
            value={kontaktperson}
            onChange={(e) => setKontaktperson(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium">
            Telefon{" "}
            <span className="font-normal text-muted">(valfritt)</span>
          </span>
          <input
            type="tel"
            value={telefon}
            onChange={(e) => setTelefon(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2"
          />
        </label>
      </div>

      {fel ? (
        <p className="text-sm text-red-700" role="alert">
          {fel}
        </p>
      ) : null}
      {ok ? (
        <p className="text-sm text-primary-dark" role="status">
          Tack! Kolla er inkorg — länken är på väg. Kolla skräppost om ni inte
          ser mejlet inom några minuter.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={skickar}
        className={
          inlagd
            ? "brf-knapp-neutral mt-1 px-5 py-2.5 text-sm disabled:opacity-60"
            : "rounded-lg border border-primary bg-white px-5 py-2.5 text-sm font-semibold text-primary-dark hover:bg-[#e2f0e6] disabled:opacity-60"
        }
      >
        {skickar ? "Skickar…" : "Mejla länk till mig"}
      </button>
    </form>
  );
}
