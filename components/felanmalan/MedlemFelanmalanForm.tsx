"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { forminskaBild } from "@/lib/felanmalan/forminska-bild";
import { INTEGRITETSPOLICY_PATH } from "@/lib/juridik";
import {
  FELANMALAN_ORSAK,
  FELANMALAN_ORSAK_ETIKETT,
  FELANMALAN_PRIORITET,
  FELANMALAN_MAXLANGD,
  FELANMALAN_PRIORITET_ETIKETT,
  FELANMALAN_BILDER,
  type FelanmalanPublikInfo,
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
  const [klart, setKlart] = useState<{
    arendeNummer: string;
    epost: string;
    bilderEjSparade: number;
  } | null>(null);
  const [webbplats, setWebbplats] = useState("");
  const [info, setInfo] = useState<FelanmalanPublikInfo | null>(null);
  const [bilder, setBilder] = useState<{ fil: File; url: string }[]>([]);
  const [forminskar, setForminskar] = useState(false);

  useEffect(() => {
    let avbruten = false;
    fetch(`/api/foreningar/${encodeURIComponent(foreningId)}/publik`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { felanmalan?: FelanmalanPublikInfo } | null) => {
        if (!avbruten && data?.felanmalan) setInfo(data.felanmalan);
      })
      .catch(() => {});
    return () => {
      avbruten = true;
    };
  }, [foreningId]);

  const jour = info?.jourTelefon ? (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm" role="note">
      <p className="font-semibold text-red-900">Akut fel?</p>
      <p className="mt-1 text-red-900">
        Vid vattenläcka, inget vatten, ingen värme eller el: ring{" "}
        {info.jourText || "jouren"} på{" "}
        <a
          href={`tel:${info.jourTelefon.replace(/[^\d+]/g, "")}`}
          className="font-semibold underline"
        >
          {info.jourTelefon}
        </a>
        . Gör sedan gärna en felanmälan här också.
      </p>
    </div>
  ) : null;

  const bildUrlerRef = useRef<string[]>([]);
  useEffect(() => {
    bildUrlerRef.current = bilder.map((b) => b.url);
  }, [bilder]);
  useEffect(
    () => () => bildUrlerRef.current.forEach((url) => URL.revokeObjectURL(url)),
    [],
  );

  async function laggTillBilder(filer: FileList | null) {
    if (!filer?.length) return;
    setFel(null);
    const plats = FELANMALAN_BILDER.maxAntal - bilder.length;
    const valda = Array.from(filer).slice(0, Math.max(0, plats));
    if (filer.length > plats) {
      setFel(`Högst ${FELANMALAN_BILDER.maxAntal} bilder per felanmälan.`);
    }
    setForminskar(true);
    try {
      const nya: { fil: File; url: string }[] = [];
      for (const fil of valda) {
        const liten = await forminskaBild(fil);
        nya.push({ fil: liten, url: URL.createObjectURL(liten) });
      }
      setBilder((prev) => [...prev, ...nya]);
    } catch (err) {
      setFel(err instanceof Error ? err.message : "Bilden kunde inte läggas till.");
    } finally {
      setForminskar(false);
    }
  }

  function taBortBild(index: number) {
    setBilder((prev) => {
      URL.revokeObjectURL(prev[index]!.url);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function skicka(e: React.FormEvent) {
    e.preventDefault();
    setFel(null);
    setLaddar(true);
    try {
      const falt = JSON.stringify({
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
            webbplats,
      });
      let body: BodyInit = falt;
      const headers: HeadersInit = {};
      if (bilder.length > 0) {
        const form = new FormData();
        form.append("data", falt);
        for (const b of bilder) form.append("bilder", b.fil);
        body = form;
      } else {
        headers["Content-Type"] = "application/json";
      }
      const res = await fetch(
        `/api/foreningar/${encodeURIComponent(foreningId)}/felanmalan`,
        { method: "POST", headers, body },
      );
      const data = (await res.json().catch(() => ({}))) as {
        fel?: string;
        arende?: { arendeNummer: string };
        bilderEjSparade?: number;
      };
      if (!res.ok || !data.arende) {
        setFel(data.fel || "Kunde inte skicka felanmälan.");
        return;
      }
      setKlart({
        arendeNummer: data.arende.arendeNummer,
        epost: medlemEpost.trim(),
        bilderEjSparade: data.bilderEjSparade ?? 0,
      });
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
          Styrelsen och förvaltaren har fått ärendet. En bekräftelse har
          skickats till <strong className="text-foreground">{klart.epost}</strong>,
          och du får ett nytt mejl när ärendet är avslutat. Hittar du inte
          mejlet, titta i skräpposten.
        </p>
        {klart.bilderEjSparade > 0 ? (
          <p className="mt-2 text-sm text-amber-800">
            {klart.bilderEjSparade === 1 ? "En bild" : `${klart.bilderEjSparade} bilder`} kunde
            inte sparas. Svara gärna på bekräftelsemejlet med bilderna.
          </p>
        ) : null}
        {jour ? <div className="mt-4">{jour}</div> : null}
      </div>
    );
  }

  return (
    <form onSubmit={(e) => void skicka(e)} className="space-y-4">
      <p className="text-sm text-muted">
        Beskriv felet så tydligt ni kan. Uppgifterna mejlas till föreningens
        förvaltare/styrelse och sparas som ärende med nummer och historik.
      </p>

      {jour}

      {info?.info ? (
        <div className="whitespace-pre-wrap rounded-xl border border-border bg-surface p-4 text-sm text-foreground">
          {info.info}
        </div>
      ) : null}

      <div className="hidden" aria-hidden="true">
        <label>
          Lämna tomt
          <input
            tabIndex={-1}
            autoComplete="off"
            value={webbplats}
            onChange={(e) => setWebbplats(e.target.value)}
          />
        </label>
      </div>

      <label className="block text-sm">
        <span className="font-medium">Rubrik</span>
        <input
          required
          value={rubrik}
          maxLength={FELANMALAN_MAXLANGD.rubrik}
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
          maxLength={FELANMALAN_MAXLANGD.beskrivning}
          onChange={(e) => setBeskrivning(e.target.value)}
          className="mt-1 w-full rounded-lg border border-border px-3 py-2"
          placeholder="När upptäcktes felet, var i lägenheten/huset, vad har ni provat?"
        />
      </label>

      {info?.bilderTillatna ? (
        <div className="text-sm">
          <span className="font-medium">
            Bilder <span className="font-normal text-muted">(valfritt, högst {FELANMALAN_BILDER.maxAntal})</span>
          </span>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            {bilder.map((b, i) => (
              <div key={b.url} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={b.url}
                  alt={`Vald bild ${i + 1}`}
                  className="h-20 w-20 rounded-lg border border-border object-cover"
                />
                <button
                  type="button"
                  onClick={() => taBortBild(i)}
                  aria-label={`Ta bort bild ${i + 1}`}
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-white text-xs font-bold text-foreground shadow"
                >
                  ×
                </button>
              </div>
            ))}
            {bilder.length < FELANMALAN_BILDER.maxAntal ? (
              <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border text-center text-xs text-muted hover:border-primary/50">
                {forminskar ? "Förbereder …" : "+ Lägg till bild"}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={forminskar}
                  className="sr-only"
                  onChange={(e) => {
                    void laggTillBilder(e.target.files);
                    e.target.value = "";
                  }}
                />
              </label>
            ) : null}
          </div>
          <p className="mt-1 text-xs text-muted">
            Bilderna syns bara för styrelsen och förvaltaren. Platsinformation tas bort automatiskt.
          </p>
        </div>
      ) : null}

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
          maxLength={FELANMALAN_MAXLANGD.medlemNamn}
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
          maxLength={FELANMALAN_MAXLANGD.medlemEpost}
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
          maxLength={FELANMALAN_MAXLANGD.medlemTelefon}
            onChange={(e) => setMedlemTelefon(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Lägenhetsnummer</span>
          <input
            value={lagenhetsnummer}
          maxLength={FELANMALAN_MAXLANGD.lagenhetsnummer}
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
          maxLength={FELANMALAN_MAXLANGD.nyckelPlats}
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
          maxLength={FELANMALAN_MAXLANGD.debiteringAnteckning}
            onChange={(e) => setDebiteringAnteckning(e.target.value)}
            className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2"
            placeholder="Valfri kommentar om debitering"
          />
        ) : null}
      </div>

      {prioritet === "akut" && info?.jourTelefon ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
          Akuta fel ska också ringas in till {info.jourText || "jouren"} på{" "}
          <strong>{info.jourTelefon}</strong>. Formuläret läses inte alltid
          direkt.
        </p>
      ) : null}

      {fel ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {fel}
        </p>
      ) : null}

      <p className="text-xs leading-relaxed text-muted">
        Dina uppgifter skickas till föreningens styrelse och förvaltare, som
        använder dem för att åtgärda felet och kontakta dig. Föreningen är
        personuppgiftsansvarig. Läs mer i{" "}
        <Link
          href={INTEGRITETSPOLICY_PATH}
          target="_blank"
          className="font-medium text-primary-dark underline hover:no-underline"
        >
          integritetspolicyn
        </Link>
        .
      </p>

      <button
        type="submit"
        disabled={laddar || forminskar}
        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
      >
        {laddar ? "Skickar …" : "Skicka felanmälan"}
      </button>
    </form>
  );
}
