"use client";

import { useEffect, useState } from "react";
import {
  BESIKTNING_UPPHANDLING_EVENT,
  hamtaEnergiAtgarder,
  normaliseraEnergiAtgarder,
  sparaEnergiAtgarder,
  type EnergiAtgard,
  type EnergiAtgardPlan,
} from "@/components/foreningsinformation/besiktning-upphandling";

const inputKlass =
  "mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm";

const PLAN_ETIKETT: Record<EnergiAtgardPlan, string> = {
  planerad: "Planerad",
  ej_beslutad: "Inte beslutad än",
  ej_aktuell: "Inte aktuell för föreningen",
};

function nyAtgard(): EnergiAtgard {
  return { id: `atg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`, atgard: "" };
}

function jamforbar(lista: EnergiAtgard[]): string {
  return JSON.stringify(normaliseraEnergiAtgarder(lista) ?? []);
}

export function sammanfattaEnergiAtgarder(lista: EnergiAtgard[]): string {
  if (lista.length === 0) return "";
  const utforda = lista.filter((a) => a.utford === "ja").length;
  const planerade = lista.filter((a) => a.utford === "nej" && a.plan === "planerad").length;
  return `${lista.length} rekommenderade åtgärder · ${utforda} utförda · ${planerade} planerade`;
}

/** Rekommenderade åtgärder ur energideklarationen och uppföljning av dem. */
export function EnergiAtgarderPanel() {
  const [sparat, setSparat] = useState<EnergiAtgard[]>([]);
  const [lista, setLista] = useState<EnergiAtgard[]>([]);
  const [status, setStatus] = useState<{ fel: boolean; text: string } | null>(null);

  useEffect(() => {
    function ladda() {
      const fran = hamtaEnergiAtgarder();
      setSparat(fran);
      setLista((cur) => (jamforbar(cur) === jamforbar(fran) || cur.length === 0 ? fran : cur));
    }
    ladda();
    window.addEventListener(BESIKTNING_UPPHANDLING_EVENT, ladda);
    return () => window.removeEventListener(BESIKTNING_UPPHANDLING_EVENT, ladda);
  }, []);

  const andrad = jamforbar(lista) !== jamforbar(sparat);

  function andra(id: string, patch: Partial<EnergiAtgard>) {
    setLista((cur) => cur.map((a) => (a.id === id ? { ...a, ...patch } : a)));
    setStatus(null);
  }

  function taBort(id: string) {
    const rad = lista.find((a) => a.id === id);
    if (rad?.atgard.trim() && !window.confirm(`Ta bort åtgärden «${rad.atgard}»?`)) return;
    setLista((cur) => cur.filter((a) => a.id !== id));
    setStatus(null);
  }

  function spara() {
    const tomma = lista.filter((a) => !a.atgard.trim()).length;
    sparaEnergiAtgarder(lista);
    const efter = hamtaEnergiAtgarder();
    setSparat(efter);
    setLista(efter);
    setStatus({
      fel: false,
      text:
        tomma > 0
          ? "Åtgärderna är sparade. Rader utan beskrivning togs bort."
          : "Åtgärderna är sparade.",
    });
  }

  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <p className="text-sm font-semibold text-foreground">
        Rekommenderade åtgärder i energideklarationen
      </p>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        Enligt lagen (2006:985) om energideklaration för byggnader ska
        energideklarationen innehålla förslag på kostnadseffektiva åtgärder som
        förbättrar byggnadens energiprestanda. Förslagen är inte tvingande — föreningen
        bestämmer själv om och när de genomförs. De är ändå ett bra underlag för
        underhållsplanen och för nästa deklaration.
      </p>
      <details className="mt-2 text-xs text-muted">
        <summary className="cursor-pointer font-medium text-primary-dark">
          Nya regler på väg
        </summary>
        <p className="mt-1 leading-relaxed">
          EU:s omarbetade byggnadsdirektiv (2024) ska föras in i svensk lag. Det ger
          bland annat nya energiklasser och större vikt vid åtgärdsförslagen. Kontrollera
          vad som gäller för er hos Boverket innan ni beställer nästa energideklaration.
        </p>
      </details>

      {lista.length === 0 ? (
        <p className="mt-3 text-sm text-muted">
          Inga åtgärder inlagda. Skriv av åtgärdsförslagen från deklarationen.
        </p>
      ) : (
        <ul className="mt-3 space-y-3">
          {lista.map((a, index) => (
            <li key={a.id} className="space-y-3 rounded-lg border border-border bg-[#f7f9f8] p-3">
              <label className="block text-sm">
                <span className="font-medium text-foreground">Åtgärd {index + 1}</span>
                <textarea
                  value={a.atgard}
                  onChange={(e) => andra(a.id, { atgard: e.target.value })}
                  rows={2}
                  placeholder="T.ex. injustering av värmesystemet, tilläggsisolering av vind"
                  className={inputKlass}
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="font-medium text-foreground">Beräknad besparing</span>
                  <input
                    value={a.besparing ?? ""}
                    onChange={(e) => andra(a.id, { besparing: e.target.value })}
                    placeholder="T.ex. 12 000 kWh/år"
                    className={inputKlass}
                  />
                </label>
                <label className="block text-sm">
                  <span className="font-medium text-foreground">Uppskattad kostnad</span>
                  <input
                    value={a.kostnad ?? ""}
                    onChange={(e) => andra(a.id, { kostnad: e.target.value })}
                    placeholder="T.ex. 80 000 kr"
                    className={inputKlass}
                  />
                </label>
              </div>

              <fieldset className="text-sm">
                <legend className="font-medium text-foreground">Är åtgärden utförd?</legend>
                <div className="mt-1 flex gap-4">
                  {(["ja", "nej"] as const).map((v) => (
                    <label key={v} className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name={`utford-${a.id}`}
                        checked={a.utford === v}
                        onChange={() => andra(a.id, { utford: v })}
                      />
                      {v === "ja" ? "Ja" : "Nej"}
                    </label>
                  ))}
                </div>
              </fieldset>

              {a.utford === "ja" ? (
                <label className="block text-sm sm:w-1/2">
                  <span className="font-medium text-foreground">Utförd datum</span>
                  <input
                    type="date"
                    value={a.utfordDatum ?? ""}
                    onChange={(e) => andra(a.id, { utfordDatum: e.target.value })}
                    className={inputKlass}
                  />
                </label>
              ) : null}

              {a.utford === "nej" ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm">
                    <span className="font-medium text-foreground">Status</span>
                    <select
                      value={a.plan ?? ""}
                      onChange={(e) =>
                        andra(a.id, { plan: (e.target.value || undefined) as EnergiAtgardPlan | undefined })
                      }
                      className={inputKlass}
                    >
                      <option value="">Välj …</option>
                      {(Object.keys(PLAN_ETIKETT) as EnergiAtgardPlan[]).map((p) => (
                        <option key={p} value={p}>
                          {PLAN_ETIKETT[p]}
                        </option>
                      ))}
                    </select>
                  </label>
                  {a.plan === "planerad" ? (
                    <label className="block text-sm">
                      <span className="font-medium text-foreground">Planerat år</span>
                      <input
                        inputMode="numeric"
                        value={a.planeradAr ?? ""}
                        onChange={(e) => andra(a.id, { planeradAr: e.target.value })}
                        placeholder={String(new Date().getFullYear() + 1)}
                        className={inputKlass}
                      />
                    </label>
                  ) : null}
                </div>
              ) : null}

              <label className="block text-sm">
                <span className="font-medium text-foreground">Kommentar</span>
                <input
                  value={a.kommentar ?? ""}
                  onChange={(e) => andra(a.id, { kommentar: e.target.value })}
                  placeholder="T.ex. ingår i stambytet, offert begärd"
                  className={inputKlass}
                />
              </label>

              <button
                type="button"
                onClick={() => taBort(a.id)}
                className="text-xs text-muted underline hover:text-red-700"
              >
                Ta bort åtgärd
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => {
            setLista((cur) => [...cur, nyAtgard()]);
            setStatus(null);
          }}
          className="rounded-lg border border-primary bg-white px-3 py-2 text-sm font-medium text-primary-dark hover:bg-[#eef6f0]"
        >
          Lägg till åtgärd
        </button>
        <button
          type="button"
          onClick={spara}
          disabled={!andrad}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          Spara åtgärder
        </button>
        {status ? (
          <span
            className={`text-sm ${status.fel ? "text-red-800" : "text-primary-dark"}`}
            role={status.fel ? "alert" : "status"}
          >
            {status.text}
          </span>
        ) : andrad ? (
          <span className="text-xs text-amber-800">Ändringarna är inte sparade än.</span>
        ) : sparat.length > 0 ? (
          <span className="text-xs text-muted">{sammanfattaEnergiAtgarder(sparat)}</span>
        ) : null}
      </div>
    </div>
  );
}
