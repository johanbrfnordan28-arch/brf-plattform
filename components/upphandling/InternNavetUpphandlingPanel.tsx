"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  bjudInEntreprenor,
  formatNavetDatum,
  hamtaInbjudningarFor,
  hamtaNavetAnbudFor,
  hamtaNavetPublicerade,
  hamtaEntreprenor,
  NAVET_UPPHANDLING_EVENT,
  navetUpphandlingStorageKey,
  sakraDemoNavetUpphandling,
  type NavetAnbud,
  type NavetInbjudan,
  type NavetPubliceradTeaser,
} from "@/components/upphandling/navet-upphandling-lager";

export function InternNavetUpphandlingPanel() {
  const [lista, setLista] = useState<NavetPubliceradTeaser[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [valdId, setValdId] = useState("");
  const [epost, setEpost] = useState("");
  const [foretag, setForetag] = useState("");
  const [senasteLank, setSenasteLank] = useState<string | null>(null);
  const [fel, setFel] = useState<string | null>(null);
  const [inbjudningar, setInbjudningar] = useState<NavetInbjudan[]>([]);
  const [anbud, setAnbud] = useState<NavetAnbud[]>([]);

  function uppdatera() {
    sakraDemoNavetUpphandling();
    const pub = hamtaNavetPublicerade();
    setLista(pub);
    const id = valdId || pub[0]?.id || "";
    if (!valdId && pub[0]) setValdId(pub[0].id);
    if (id) {
      setInbjudningar(hamtaInbjudningarFor(id));
      setAnbud(hamtaNavetAnbudFor(id));
    } else {
      setInbjudningar([]);
      setAnbud([]);
    }
  }

  useEffect(() => {
    uppdatera();
    setHydrated(true);
    function onStorage(event: StorageEvent) {
      if (event.key === navetUpphandlingStorageKey()) uppdatera();
    }
    window.addEventListener("storage", onStorage);
    window.addEventListener(NAVET_UPPHANDLING_EVENT, uppdatera);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(NAVET_UPPHANDLING_EVENT, uppdatera);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!valdId) return;
    setInbjudningar(hamtaInbjudningarFor(valdId));
    setAnbud(hamtaNavetAnbudFor(valdId));
    setSenasteLank(null);
  }, [valdId]);

  function onBjudIn(event: FormEvent) {
    event.preventDefault();
    setFel(null);
    setSenasteLank(null);
    try {
      const { lank } = bjudInEntreprenor({
        upphandlingId: valdId,
        epost,
        foretagsnamn: foretag,
      });
      const absolut =
        typeof window !== "undefined" ? `${window.location.origin}${lank}` : lank;
      setSenasteLank(absolut);
      setEpost("");
      setForetag("");
      uppdatera();
    } catch (error) {
      setFel(error instanceof Error ? error.message : "Kunde inte skapa inbjudan.");
    }
  }

  if (!hydrated) {
    return <p className="text-sm text-muted">Laddar Navet-upphandlingar…</p>;
  }

  if (lista.length === 0) {
    return (
      <p className="text-sm text-muted">
        Inga Navet-publicerade upphandlingar ännu.
      </p>
    );
  }

  const vald = lista.find((u) => u.id === valdId);

  return (
    <div className="space-y-8">
      <div>
        <label className="block text-sm font-medium text-foreground">
          Välj upphandling
        </label>
        <select
          value={valdId}
          onChange={(e) => setValdId(e.target.value)}
          className="mt-1 w-full max-w-xl rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          {lista.map((u) => (
            <option key={u.id} value={u.id}>
              {u.titel} · {u.ort}
            </option>
          ))}
        </select>
        {vald && (
          <p className="mt-2 text-sm text-muted">
            Intern förening: {vald.foreningIntern} · Sista anbudsdag{" "}
            {formatNavetDatum(vald.sistaAnbudsdag)}
          </p>
        )}
      </div>

      <form
        onSubmit={onBjudIn}
        className="rounded-xl border border-dashed border-primary/40 bg-[#e8f3ec]/40 p-5"
      >
        <h3 className="font-semibold text-primary-dark">
          Bjud in entreprenör via mejl
        </h3>
        <p className="mt-1 text-sm text-muted">
          Skapar en godkänd entreprenör och unik länk till underlaget. I demo
          kopierar ni länken (riktigt mejl kopplas senare).
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="font-medium text-foreground">E-post</span>
            <input
              required
              type="email"
              value={epost}
              onChange={(e) => setEpost(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
              placeholder="anbud@foretag.se"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-foreground">Företagsnamn</span>
            <input
              value={foretag}
              onChange={(e) => setForetag(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
              placeholder="Bygg AB"
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
          className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          Skapa inbjudan
        </button>
        {senasteLank && (
          <div className="mt-4 rounded-lg border border-border bg-background p-3">
            <p className="text-xs font-medium text-muted">Länk att mejla</p>
            <p className="mt-1 break-all text-sm text-foreground">{senasteLank}</p>
            <button
              type="button"
              className="mt-2 text-sm font-medium text-primary"
              onClick={() => navigator.clipboard?.writeText(senasteLank)}
            >
              Kopiera länk
            </button>
          </div>
        )}
      </form>

      <div>
        <h3 className="font-semibold text-foreground">Inbjudna</h3>
        {inbjudningar.length === 0 ? (
          <p className="mt-2 text-sm text-muted">Inga inbjudningar ännu.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {inbjudningar.map((i) => {
              const ent = hamtaEntreprenor(i.entreprenorId);
              return (
                <li
                  key={i.id}
                  className="rounded-lg border border-border bg-surface px-4 py-3 text-sm"
                >
                  <p className="font-medium text-foreground">
                    {ent?.foretagsnamn ?? i.epost}{" "}
                    <span className="font-normal text-muted">({i.epost})</span>
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Status: {ent?.status ?? "—"} · Skapad{" "}
                    {formatNavetDatum(i.skapad)}
                    {i.forstaOppning
                      ? ` · Öppnad ${formatNavetDatum(i.forstaOppning)}`
                      : " · Ej öppnad"}
                  </p>
                  <p className="mt-1 break-all text-xs text-primary">
                    /entreprenor/underlag/{i.token}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div>
        <h3 className="font-semibold text-foreground">
          Inkomna anbud (endast intern vy)
        </h3>
        <p className="mt-1 text-sm text-muted">
          Syns inte för föreningen. Hanteras manuellt av Styrelse-Navet.
        </p>
        {anbud.length === 0 ? (
          <p className="mt-2 text-sm text-muted">Inga anbud inlämnade ännu.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {anbud.map((a) => (
              <li
                key={a.id}
                className="rounded-lg border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm"
              >
                <p className="font-medium text-foreground">
                  {a.entreprenorNamn} — {a.anbudSummaKr.toLocaleString("sv-SE")} kr
                </p>
                <p className="mt-1 text-xs text-muted">
                  {a.epost} · {formatNavetDatum(a.inlamnad)}
                </p>
                {a.meddelande && (
                  <p className="mt-2 text-sm text-foreground/90">{a.meddelande}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
