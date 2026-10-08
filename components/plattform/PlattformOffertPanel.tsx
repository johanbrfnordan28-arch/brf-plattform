"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { ABK_09_KORT, ABK_09_LANG, offertMejlMedAbk09 } from "@/lib/abk-09";
import {
  OFFERT_MAXLANGD,
  OFFERT_STATUS,
  OFFERT_STATUS_ETIKETT as STATUS_ETIKETT,
  OFFERT_TJANSTER,
  mailtoOffertTillKund,
  type OffertForfragan,
  type OffertForfraganStatus,
  type OffertTjanst,
} from "@/lib/offert-forfragan";
import { mejlaOffertTillTeam } from "@/lib/offert-mejl-klient";
import { hamtaOffertKontaktperson } from "@/lib/kontakt-epost";

async function patchaForfragan(
  id: string,
  patch: {
    status?: OffertForfraganStatus;
    internAnteckning?: string;
    offertSkickad?: boolean;
  },
): Promise<OffertForfragan> {
  const res = await fetch(`/api/plattform/offert/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  const data = (await res.json().catch(() => ({}))) as {
    forfragan?: OffertForfragan;
    fel?: string;
  };
  if (!res.ok || !data.forfragan) {
    throw new Error(data.fel || "Kunde inte spara.");
  }
  return data.forfragan;
}

/**
 * Personalvy: inkomna offertförfrågningar och utskick enligt ABK 09.
 */
export function PlattformOffertPanel() {
  const [lista, setLista] = useState<OffertForfragan[]>([]);
  const [laddar, setLaddar] = useState(true);
  const [demoLage, setDemoLage] = useState(false);
  const [fel, setFel] = useState<string | null>(null);
  const [valdId, setValdId] = useState("");
  const [prisText, setPrisText] = useState("");
  const [giltigTill, setGiltigTill] = useState("");
  const [anteckning, setAnteckning] = useState("");
  const [mailto, setMailto] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const ladda = useCallback(async () => {
    setFel(null);
    try {
      const res = await fetch("/api/plattform/offert", { cache: "no-store" });
      const data = (await res.json().catch(() => ({}))) as {
        forfragningar?: OffertForfragan[];
        demoLage?: boolean;
        fel?: string;
      };
      if (!res.ok) throw new Error(data.fel || "Kunde inte hämta förfrågningar.");
      const alla = data.forfragningar ?? [];
      setLista(alla);
      setDemoLage(Boolean(data.demoLage));
      setValdId((nu) => (alla.some((r) => r.id === nu) ? nu : alla[0]?.id || ""));
    } catch (e) {
      setFel(e instanceof Error ? e.message : "Kunde inte hämta förfrågningar.");
    } finally {
      setLaddar(false);
    }
  }, []);

  useEffect(() => {
    void ladda();
  }, [ladda]);

  const vald = lista.find((r) => r.id === valdId);

  useEffect(() => {
    setAnteckning(vald?.internAnteckning ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valdId]);

  function ersatt(rad: OffertForfragan) {
    setLista((prev) => prev.map((r) => (r.id === rad.id ? rad : r)));
  }

  async function sattStatus(status: OffertForfraganStatus) {
    if (!valdId) return;
    setFel(null);
    try {
      ersatt(await patchaForfragan(valdId, { status }));
      setOk(`Status: ${STATUS_ETIKETT[status]}`);
    } catch (e) {
      setFel(e instanceof Error ? e.message : "Kunde inte spara.");
    }
  }

  async function sparaAnteckning() {
    if (!valdId) return;
    setFel(null);
    try {
      ersatt(await patchaForfragan(valdId, { internAnteckning: anteckning }));
      setOk("Anteckningen är sparad.");
    } catch (e) {
      setFel(e instanceof Error ? e.message : "Kunde inte spara.");
    }
  }

  async function forberedOffert(e: FormEvent) {
    e.preventDefault();
    setMailto(null);
    setOk(null);
    setFel(null);
    if (!vald) return;
    if (!prisText.trim()) {
      setOk("Ange pris / upplägg innan ni skickar.");
      return;
    }
    const brodtext = offertMejlMedAbk09({
      mottagareNamn: vald.kontaktperson,
      forening: vald.foreningsNamn,
      tjanster: vald.tjanster.join(", "),
      prisText: prisText.trim(),
      giltigTill: giltigTill.trim() || undefined,
    });
    setMailto(mailtoOffertTillKund({ forfragan: vald, brodtext }));
    await mejlaOffertTillTeam({
      forfragan: vald,
      prisText: prisText.trim(),
      brodtextTillKund: brodtext,
    });
    try {
      ersatt(await patchaForfragan(vald.id, { offertSkickad: true }));
      setOk(
        "Offertmejlet är förberett — öppna mejlklienten till kunden. Teamet har fått kopia.",
      );
    } catch (err) {
      setFel(err instanceof Error ? err.message : "Kunde inte spara status.");
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-foreground">
        Offertförfrågningar (förvaltning & konsult)
      </h2>
      <p className="mt-1 text-sm text-muted">
        Sparas på servern och syns här för all inloggad personal. Offert skickas enligt {ABK_09_KORT}
      </p>
      <p className="mt-2 rounded-lg border border-primary/20 bg-[#eef6f0] px-3 py-2 text-xs text-primary-dark">
        {ABK_09_LANG}
      </p>

      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="text-xs text-muted">
          {laddar ? "Laddar …" : `${lista.length} förfrågningar`}
        </p>
        <button
          type="button"
          onClick={() => void ladda()}
          className="text-sm font-medium text-primary-dark hover:underline"
        >
          Uppdatera
        </button>
      </div>
      {fel && (
        <p className="mt-2 text-sm text-red-700" role="alert">
          {fel}
        </p>
      )}

      {laddar ? null : lista.length === 0 ? (
        <p className="mt-4 text-sm text-muted">
          {demoLage
            ? "Databasen är inte konfigurerad — förfrågningar kommer bara som mejl."
            : "Inga förfrågningar ännu. När någon fyller i formuläret på /offert visas det här."}
        </p>
      ) : (
        <div className="mt-4 space-y-6">
          <label className="block text-sm">
            <span className="font-medium text-foreground">Välj förfrågan</span>
            <select
              value={valdId}
              onChange={(e) => {
                setValdId(e.target.value);
                setMailto(null);
                setOk(null);
                setPrisText("");
              }}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              {lista.map((r) => (
                <option key={r.id} value={r.id}>
                  {STATUS_ETIKETT[r.status]} · {r.foreningsNamn} · {r.epost} ·{" "}
                  {r.skapad.slice(0, 10)}
                </option>
              ))}
            </select>
          </label>

          {vald && (
            <>
              <div className="rounded-xl border border-border bg-[#fafcfa] p-4 text-sm">
                <p>
                  <span className="text-muted">Förening: </span>
                  <span className="font-medium">{vald.foreningsNamn}</span>
                </p>
                <p className="mt-1">
                  <span className="text-muted">Kontakt: </span>
                  {vald.kontaktperson} · {vald.epost}
                  {vald.telefon ? ` · ${vald.telefon}` : ""}
                </p>
                {vald.oonskadKontaktId ? (
                  <p className="mt-1">
                    <span className="text-muted">Önskad hos oss: </span>
                    {hamtaOffertKontaktperson(vald.oonskadKontaktId)?.namn ??
                      vald.oonskadKontaktId}
                  </p>
                ) : null}
                {vald.antalLagenheter ? (
                  <p className="mt-1">
                    <span className="text-muted">Lägenheter: </span>
                    {vald.antalLagenheter}
                  </p>
                ) : null}
                <p className="mt-1">
                  <span className="text-muted">Tjänster: </span>
                  {vald.tjanster.join(", ")}
                </p>
                {vald.meddelande ? (
                  <p className="mt-2 whitespace-pre-wrap text-foreground">
                    {vald.meddelande}
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  {OFFERT_STATUS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => void sattStatus(s)}
                      className={`rounded-lg border px-2.5 py-1 text-xs font-medium ${
                        vald.status === s
                          ? "border-primary bg-[#eef6f0] text-primary-dark"
                          : "border-border text-muted hover:border-primary/40"
                      }`}
                    >
                      {STATUS_ETIKETT[s]}
                    </button>
                  ))}
                </div>
                {vald.senastOffertSkickad ? (
                  <p className="mt-2 text-xs text-muted">
                    Offert senast förberedd {vald.senastOffertSkickad.slice(0, 10)}
                  </p>
                ) : null}
                <label className="mt-3 block">
                  <span className="text-xs font-medium text-muted">
                    Intern anteckning (syns bara för personal)
                  </span>
                  <textarea
                    rows={2}
                    value={anteckning}
                    maxLength={OFFERT_MAXLANGD.internAnteckning}
                    onChange={(e) => setAnteckning(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2"
                  />
                </label>
                {anteckning !== vald.internAnteckning ? (
                  <button
                    type="button"
                    onClick={() => void sparaAnteckning()}
                    className="mt-1 rounded-lg border border-primary bg-white px-3 py-1 text-xs font-medium text-primary-dark"
                  >
                    Spara anteckning
                  </button>
                ) : null}
              </div>

              <form
                onSubmit={forberedOffert}
                className="rounded-xl border border-dashed border-primary/40 bg-[#e8f3ec]/40 p-4"
              >
                <h3 className="font-semibold text-primary-dark">
                  Skicka offert
                </h3>
                <p className="mt-1 text-xs text-muted">
                  Mejlet innehåller automatiskt ABK 09 utan avvikelser.
                </p>
                <label className="mt-3 block text-sm">
                  <span className="font-medium">Pris / upplägg</span>
                  <textarea
                    required
                    rows={3}
                    value={prisText}
                    onChange={(e) => setPrisText(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2"
                    placeholder="t.ex. Fast pris 18 000 kr/mån inkl. teknisk förvaltning, eller löpande debitering enligt bilaga"
                  />
                </label>
                <label className="mt-3 block text-sm">
                  <span className="font-medium">
                    Giltig till{" "}
                    <span className="font-normal text-muted">(valfritt)</span>
                  </span>
                  <input
                    type="date"
                    value={giltigTill}
                    onChange={(e) => setGiltigTill(e.target.value)}
                    className="mt-1 w-full max-w-xs rounded-lg border border-border bg-white px-3 py-2"
                  />
                </label>
                {ok && (
                  <p className="mt-2 text-sm text-primary-dark" role="status">
                    {ok}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="submit"
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
                  >
                    Förbered offertmejl
                  </button>
                  {mailto && (
                    <a
                      href={mailto}
                      className="rounded-lg border border-primary bg-white px-4 py-2 text-sm font-medium text-primary-dark"
                    >
                      Öppna mejl till kund
                    </a>
                  )}
                </div>
              </form>
            </>
          )}
        </div>
      )}

      <p className="mt-4 text-xs text-muted">
        Tillgängliga tjänster i formuläret:{" "}
        {(OFFERT_TJANSTER as readonly OffertTjanst[]).join(" · ")}
      </p>
    </section>
  );
}
