"use client";

import { FormEvent, useEffect, useState } from "react";
import { ABK_09_KORT, ABK_09_LANG, offertMejlMedAbk09 } from "@/lib/abk-09";
import {
  OFFERT_FORFRAGAN_EVENT,
  OFFERT_TJANSTER,
  listaOffertForfragningar,
  mailtoOffertTillKund,
  uppdateraOffertForfragan,
  type OffertForfragan,
  type OffertForfraganStatus,
  type OffertTjanst,
} from "@/components/offert/offert-forfragan-lager";

const STATUS_ETIKETT: Record<OffertForfraganStatus, string> = {
  ny: "Ny",
  kontaktad: "Kontaktad",
  "offert-skickad": "Offert skickad",
  avslutad: "Avslutad",
};

/**
 * Personalvy: inkomna offertförfrågningar och utskick enligt ABK 09.
 */
export function PlattformOffertPanel() {
  const [lista, setLista] = useState<OffertForfragan[]>([]);
  const [valdId, setValdId] = useState("");
  const [prisText, setPrisText] = useState("");
  const [giltigTill, setGiltigTill] = useState("");
  const [mailto, setMailto] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  function ladda(forceId?: string) {
    const alla = listaOffertForfragningar();
    setLista(alla);
    const id = forceId || valdId || alla[0]?.id || "";
    if (forceId) setValdId(forceId);
    else if (!valdId && alla[0]) setValdId(alla[0].id);
    else if (id && !alla.some((r) => r.id === id)) setValdId(alla[0]?.id || "");
  }

  useEffect(() => {
    ladda();
    function refresh() {
      ladda();
    }
    window.addEventListener(OFFERT_FORFRAGAN_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(OFFERT_FORFRAGAN_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const vald = lista.find((r) => r.id === valdId);

  function sattStatus(status: OffertForfraganStatus) {
    if (!valdId) return;
    uppdateraOffertForfragan(valdId, { status });
    setOk(`Status: ${STATUS_ETIKETT[status]}`);
    ladda(valdId);
  }

  function forberedOffert(e: FormEvent) {
    e.preventDefault();
    setMailto(null);
    setOk(null);
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
    const lank = mailtoOffertTillKund({ forfragan: vald, brodtext });
    setMailto(lank);
    uppdateraOffertForfragan(vald.id, {
      status: "offert-skickad",
      senastOffertSkickad: new Date().toISOString(),
    });
    setOk("Offertmejlet är förberett — öppna mejlklienten och skicka.");
    ladda(vald.id);
  }

  return (
    <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-foreground">
        Offertförfrågningar (förvaltning & konsult)
      </h2>
      <p className="mt-1 text-sm text-muted">
        Syns bara här för inloggad personal. Offert skickas enligt {ABK_09_KORT}
      </p>
      <p className="mt-2 rounded-lg border border-primary/20 bg-[#eef6f0] px-3 py-2 text-xs text-primary-dark">
        {ABK_09_LANG}
      </p>

      {lista.length === 0 ? (
        <p className="mt-4 text-sm text-muted">
          Inga förfrågningar ännu. När någon fyller i formuläret på /offert
          visas det här.
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
                  {STATUS_ETIKETT[r.status]} · {r.foreningsNamn} · {r.epost}
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
                  {(
                    Object.keys(STATUS_ETIKETT) as OffertForfraganStatus[]
                  ).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => sattStatus(s)}
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
