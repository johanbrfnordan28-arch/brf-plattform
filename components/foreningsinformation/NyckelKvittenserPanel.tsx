"use client";

import { useEffect, useState } from "react";
import {
  formatKvittensTid,
  hamtaAllaNycklar,
  hamtaNyckelEtikett,
  lasNyckelKvittenser,
  egnaNycklarStorageKey,
  nyckelKvittenserStorageKey,
  rollEtikett,
  skapaEgenNyckelId,
  skapaNyckelKvittensId,
  sparaEgenNyckel,
  sparaNyckelKvittens,
  taBortEgenNyckel,
  typEtikett,
  type NyckelDefinition,
  type NyckelKvittens,
  type NyckelKvittensRoll,
  type NyckelKvittensTyp,
} from "@/components/foreningsinformation/nyckel-kvittenser";
import { UtlamnadeNycklarOversikt } from "@/components/foreningsinformation/UtlamnadeNycklarOversikt";

export function NyckelKvittenserPanel() {
  const [historik, setHistorik] = useState<NyckelKvittens[]>([]);
  const [nycklar, setNycklar] = useState<NyckelDefinition[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const [roll, setRoll] = useState<NyckelKvittensRoll>("styrelse");
  const [namn, setNamn] = useState("");
  const [komplettering, setKomplettering] = useState("");
  const [typ, setTyp] = useState<NyckelKvittensTyp>("mottagning");
  const [valdaNycklar, setValdaNycklar] = useState<string[]>([]);
  const [bankidSteg, setBankidSteg] = useState<"idle" | "pågår" | "klar">("idle");
  const [fel, setFel] = useState<string | null>(null);
  const [senastKvitterad, setSenastKvitterad] = useState<NyckelKvittens | null>(null);

  const [visarLaggTill, setVisarLaggTill] = useState(false);
  const [nyEtikett, setNyEtikett] = useState("");
  const [nyBeskrivning, setNyBeskrivning] = useState("");

  function uppdateraAllt() {
    setHistorik(lasNyckelKvittenser());
    setNycklar(hamtaAllaNycklar());
  }

  useEffect(() => {
    uppdateraAllt();
    setHydrated(true);

    function onStorage(event: StorageEvent) {
      if (
        event.key === nyckelKvittenserStorageKey() ||
        event.key === egnaNycklarStorageKey()
      ) {
        uppdateraAllt();
      }
    }
    function onCustom() {
      uppdateraAllt();
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener("nyckel-kvittenser-uppdaterad", onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("nyckel-kvittenser-uppdaterad", onCustom);
    };
  }, []);

  function laggTillNyckel() {
    if (!nyEtikett.trim()) {
      setFel("Ange namn på nyckeln.");
      return;
    }
    sparaEgenNyckel({
      id: skapaEgenNyckelId(),
      etikett: nyEtikett.trim(),
      beskrivning: nyBeskrivning.trim() || "Egen nyckel tillagd av styrelsen.",
      egen: true,
    });
    setNyEtikett("");
    setNyBeskrivning("");
    setVisarLaggTill(false);
    setFel(null);
    uppdateraAllt();
  }

  function toggleNyckel(nyckelId: string) {
    setValdaNycklar((current) =>
      current.includes(nyckelId)
        ? current.filter((id) => id !== nyckelId)
        : [...current, nyckelId],
    );
    setFel(null);
  }

  function validera(): string | null {
    if (!namn.trim()) return "Ange namn.";
    if (roll === "medlem" && !komplettering.trim()) {
      return "Ange lägenhetsnummer för medlem.";
    }
    if (roll === "entreprenor" && !komplettering.trim()) {
      return "Ange företagsnamn för entreprenör.";
    }
    if (valdaNycklar.length === 0) return "Välj minst en nyckel att kvittera.";
    return null;
  }

  function signeraMedBankId() {
    const valideringsFel = validera();
    if (valideringsFel) {
      setFel(valideringsFel);
      return;
    }

    setBankidSteg("pågår");
    setFel(null);

    window.setTimeout(() => {
      const tidpunkt = new Date().toISOString();
      const kvittens: NyckelKvittens = {
        id: skapaNyckelKvittensId(),
        roll,
        namn: namn.trim(),
        komplettering: komplettering.trim(),
        typ,
        nycklar: [...valdaNycklar],
        signerad: new Date().toLocaleDateString("sv-SE"),
        signeradTidpunkt: tidpunkt,
        metod: "bankid",
      };

      sparaNyckelKvittens(kvittens);
      setSenastKvitterad(kvittens);
      setBankidSteg("klar");
      setValdaNycklar([]);
      uppdateraAllt();

      window.setTimeout(() => setBankidSteg("idle"), 2500);
    }, 1800);
  }

  if (!hydrated) {
    return <p className="text-sm text-muted">Laddar nyckel kvittenser…</p>;
  }

  return (
    <div className="space-y-6">
      <p className="text-sm leading-relaxed text-muted">
        Styrelse, medlemmar och entreprenörer kvitterar ut och in nycklar här. Välj
        vilka nycklar som gäller och signera med BankID — allt sparas för framtida
        spårbarhet.
      </p>

      <UtlamnadeNycklarOversikt variant="full" />

      <div className="rounded-xl border border-border bg-background p-4 sm:p-5">
        <h4 className="text-sm font-semibold text-foreground">Ny kvittens</h4>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <fieldset>
            <legend className="text-sm font-medium text-foreground">Vem kvitterar?</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {(
                [
                  ["styrelse", "Styrelse"],
                  ["medlem", "Medlem"],
                  ["entreprenor", "Entreprenör"],
                ] as const
              ).map(([id, etikett]) => (
                <label
                  key={id}
                  className={`cursor-pointer rounded-lg border px-3 py-2 text-sm ${
                    roll === id
                      ? "border-primary bg-[#eef6f0] font-medium text-primary-dark"
                      : "border-border text-muted hover:border-primary/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="kvittens-roll"
                    value={id}
                    checked={roll === id}
                    onChange={() => {
                      setRoll(id);
                      setKomplettering("");
                      setFel(null);
                    }}
                    className="sr-only"
                  />
                  {etikett}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-medium text-foreground">Typ</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {(
                [
                  ["mottagning", "Mottagning"],
                  ["aterlamning", "Återlämning"],
                ] as const
              ).map(([id, etikett]) => (
                <label
                  key={id}
                  className={`cursor-pointer rounded-lg border px-3 py-2 text-sm ${
                    typ === id
                      ? "border-primary bg-[#eef6f0] font-medium text-primary-dark"
                      : "border-border text-muted hover:border-primary/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="kvittens-typ"
                    value={id}
                    checked={typ === id}
                    onChange={() => setTyp(id)}
                    className="sr-only"
                  />
                  {etikett}
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="font-medium text-foreground">Namn</span>
            <input
              type="text"
              value={namn}
              onChange={(event) => setNamn(event.target.value)}
              placeholder={
                roll === "styrelse"
                  ? "T.ex. Anna Andersson"
                  : roll === "medlem"
                    ? "Medlems namn"
                    : "Kontaktperson"
              }
              className="mt-1.5 w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-foreground">
              {roll === "medlem"
                ? "Lägenhetsnummer"
                : roll === "entreprenor"
                  ? "Företag"
                  : "Roll i styrelsen (valfritt)"}
            </span>
            <input
              type="text"
              value={komplettering}
              onChange={(event) => setKomplettering(event.target.value)}
              placeholder={
                roll === "medlem"
                  ? "T.ex. 1203"
                  : roll === "entreprenor"
                    ? "T.ex. Bygg & Montage AB"
                    : "T.ex. Ordförande"
              }
              className="mt-1.5 w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </label>
        </div>

        <fieldset className="mt-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <legend className="text-sm font-medium text-foreground">
              Välj nycklar ({valdaNycklar.length} valda)
            </legend>
            <button
              type="button"
              onClick={() => setVisarLaggTill((v) => !v)}
              className="rounded-lg border border-primary px-3 py-1.5 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
            >
              {visarLaggTill ? "Avbryt" : "+ Lägg till nyckel"}
            </button>
          </div>

          {visarLaggTill && (
            <div className="mt-3 rounded-lg border border-dashed border-primary/40 bg-white p-4">
              <p className="text-xs text-muted">
                Lägg till en nyckeltyp som ska kunna kvitteras i er förening.
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="block text-sm sm:col-span-2">
                  <span className="font-medium text-foreground">Nyckelnamn</span>
                  <input
                    type="text"
                    value={nyEtikett}
                    onChange={(event) => setNyEtikett(event.target.value)}
                    placeholder="T.ex. Nyckel till soprum B"
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                  />
                </label>
                <label className="block text-sm sm:col-span-2">
                  <span className="font-medium text-foreground">Beskrivning (valfritt)</span>
                  <input
                    type="text"
                    value={nyBeskrivning}
                    onChange={(event) => setNyBeskrivning(event.target.value)}
                    placeholder="Kort beskrivning"
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={laggTillNyckel}
                className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
              >
                Spara nyckel
              </button>
            </div>
          )}

          <ul className="mt-3 space-y-2">
            {nycklar.map((nyckel) => {
              const vald = valdaNycklar.includes(nyckel.id);
              return (
                <li key={nyckel.id}>
                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                      vald
                        ? "border-primary bg-[#eef6f0]/80"
                        : "border-border bg-white hover:border-primary/30"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={vald}
                      onChange={() => toggleNyckel(nyckel.id)}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-foreground">
                          {nyckel.etikett}
                        </span>
                        {nyckel.egen && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-900">
                            Egen
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted">
                        {nyckel.beskrivning}
                      </span>
                    </span>
                    {nyckel.egen && (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();
                          taBortEgenNyckel(nyckel.id);
                          setValdaNycklar((current) =>
                            current.filter((id) => id !== nyckel.id),
                          );
                          uppdateraAllt();
                        }}
                        className="shrink-0 text-xs text-muted hover:text-red-700"
                      >
                        Ta bort
                      </button>
                    )}
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>

        {fel && (
          <p className="mt-4 text-sm text-red-700" role="alert">
            {fel}
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-4">
          <button
            type="button"
            onClick={signeraMedBankId}
            disabled={bankidSteg === "pågår"}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {bankidSteg === "pågår"
              ? "Öppnar BankID…"
              : bankidSteg === "klar"
                ? "Kvitterad med BankID ✓"
                : "Kvittera med BankID"}
          </button>
          <p className="text-xs text-muted">
            Demo utan riktig BankID — i produktion signeras kvittensen elektroniskt.
          </p>
        </div>

        {senastKvitterad && bankidSteg === "klar" && (
          <div className="mt-4 rounded-lg border border-primary/30 bg-[#eef6f0] p-4 text-sm">
            <p className="font-medium text-primary-dark">
              Kvittens sparad — {typEtikett(senastKvitterad.typ)} signeras med BankID
            </p>
            <p className="mt-1 text-muted">
              {senastKvitterad.namn} ({rollEtikett(senastKvitterad.roll)}) ·{" "}
              {senastKvitterad.nycklar.map(hamtaNyckelEtikett).join(", ")}
            </p>
          </div>
        )}
      </div>

      <div>
        <h4 className="text-sm font-semibold text-foreground">
          Tidigare kvittenser ({historik.length})
        </h4>
        {historik.length === 0 ? (
          <p className="mt-2 text-sm text-muted">Inga kvittenser registrerade ännu.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {historik.map((rad) => (
              <li
                key={rad.id}
                className="rounded-lg border border-border bg-white px-4 py-3 text-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-foreground">
                      {typEtikett(rad.typ)} — {rad.namn}
                    </p>
                    <p className="text-xs text-muted">
                      {rollEtikett(rad.roll)}
                      {rad.komplettering ? ` · ${rad.komplettering}` : ""}
                    </p>
                  </div>
                  <span className="rounded-full bg-[#eef6f0] px-2.5 py-0.5 text-xs font-medium text-primary-dark">
                    BankID ✓
                  </span>
                </div>
                <ul className="mt-2 list-inside list-disc text-xs text-muted">
                  {rad.nycklar.map((id) => (
                    <li key={id}>{hamtaNyckelEtikett(id)}</li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-muted">
                  {formatKvittensTid(rad.signeradTidpunkt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
