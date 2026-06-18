"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  lasRenoveringsAnmalan,
  skapaTomRenoveringsAnmalan,
  sparaRenoveringsAnmalan,
} from "@/components/medlemmar/medlemmar-lager";
import {
  byggChecklista,
  checklistaPunktId,
  grundkrav,
  renoveringsTyper,
} from "@/components/medlemmar/renoveringschecklistor";

export function RenoveringsAnmalan() {
  const [valdaTyper, setValdaTyper] = useState<string[]>([]);
  const [klaraPunkter, setKlaraPunkter] = useState<Set<string>>(new Set());
  const [sparad, setSparad] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const skipFirstSave = useRef(true);

  useEffect(() => {
    const sparadState = lasRenoveringsAnmalan() ?? skapaTomRenoveringsAnmalan();
    setValdaTyper(sparadState.valdaTyper);
    setKlaraPunkter(new Set(sparadState.klaraPunkter));
    setSparad(sparadState.sparad);
    skipFirstSave.current = true;
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (skipFirstSave.current) {
      skipFirstSave.current = false;
      return;
    }
    sparaRenoveringsAnmalan({
      valdaTyper,
      klaraPunkter: [...klaraPunkter],
      sparad,
    });
  }, [valdaTyper, klaraPunkter, sparad, hydrated]);

  const sektioner = useMemo(() => byggChecklista(valdaTyper), [valdaTyper]);

  const allaPunktIds = useMemo(
    () =>
      sektioner.flatMap(({ sektion, punkter }) =>
        punkter.map((punkt) => checklistaPunktId(sektion.id, punkt.id)),
      ),
    [sektioner],
  );

  const antalKlara = allaPunktIds.filter((id) => klaraPunkter.has(id)).length;
  const allaKlara =
    allaPunktIds.length > 0 && antalKlara === allaPunktIds.length;

  function toggleTyp(id: string) {
    setValdaTyper((current) => {
      const next = current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id];
      return next;
    });
    setKlaraPunkter(new Set());
    setSparad(false);
  }

  function togglePunkt(punktKey: string) {
    setKlaraPunkter((current) => {
      const next = new Set(current);
      if (next.has(punktKey)) next.delete(punktKey);
      else next.add(punktKey);
      return next;
    });
    setSparad(false);
  }

  function sparaChecklista() {
    setSparad(true);
    sparaRenoveringsAnmalan({
      valdaTyper,
      klaraPunkter: [...klaraPunkter],
      sparad: true,
    });
  }

  if (!hydrated) {
    return (
      <p className="text-sm text-muted">Laddar renoveringsanmälan…</p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">
          Välj renoveringstyp
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Markera vad medlemmen planerar att renovera. Kraven visas direkt under
          varje typ och samlas i checklistan nedan.{" "}
          <strong className="font-medium text-foreground">{grundkrav.etikett}</strong>{" "}
          ingår alltid när minst en typ är vald — bland annat krav på täckta ventiler
          och att byggdamm inte sprids till grannlägenheter eller föreningens
          ventilationssystem.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {renoveringsTyper.map((typ) => {
          const vald = valdaTyper.includes(typ.id);
          return (
            <div
              key={typ.id}
              className={`rounded-xl border p-4 transition-colors ${
                vald
                  ? "border-primary bg-[#eef6f0]"
                  : "border-border bg-background"
              }`}
            >
              <label className="flex cursor-pointer gap-3">
                <input
                  type="checkbox"
                  checked={vald}
                  onChange={() => toggleTyp(typ.id)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-primary focus:ring-primary"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-foreground">
                    {typ.etikett}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted">
                    {typ.beskrivning}
                  </span>
                </span>
              </label>
              {vald && (
                <ul className="mt-3 list-disc space-y-1.5 border-t border-primary/20 pt-3 pl-5 text-xs leading-relaxed text-foreground">
                  <li className="list-none pl-0 font-medium text-primary-dark">
                    Tilläggskrav i checklistan:
                  </li>
                  {typ.punkter.map((punkt) => (
                    <li key={punkt.id}>{punkt.text}</li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {valdaTyper.length === 0 && (
        <p className="rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted">
          Välj minst en renoveringstyp ovan för att skapa checklista.
        </p>
      )}

      {sektioner.length > 0 && (
        <div className="rounded-2xl border border-border bg-background/80 p-4 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-primary-dark">
                Checklista
              </p>
              <p className="mt-1 text-sm text-muted">
                Medlemmen får inte påbörja renoveringen förrän styrelsen godkänt
                alla punkter. Bocka av i takt med att underlag kommer in (demo).
              </p>
            </div>
            <p className="rounded-full bg-[#e2f0e6] px-3 py-1 text-sm font-medium text-primary-dark">
              {antalKlara} av {allaPunktIds.length} klara
            </p>
          </div>

          <div className="mt-6 space-y-6">
            {sektioner.map(({ sektion, punkter }) => (
              <section key={sektion.id}>
                <h4 className="text-base font-semibold text-foreground">
                  {sektion.etikett}
                </h4>
                {sektion.id === "grundkrav" && (
                  <p className="mt-1 text-xs text-muted">{sektion.beskrivning}</p>
                )}
                <ul className="mt-3 space-y-2">
                  {punkter.map((punkt) => {
                    const key = checklistaPunktId(sektion.id, punkt.id);
                    const klar = klaraPunkter.has(key);
                    return (
                      <li key={key}>
                        <label
                          className={`flex cursor-pointer gap-3 rounded-lg border px-3 py-2.5 ${
                            klar
                              ? "border-primary/40 bg-[#eef6f0]"
                              : "border-border bg-white"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={klar}
                            onChange={() => togglePunkt(key)}
                            className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-primary"
                          />
                          <span
                            className={`text-sm leading-relaxed ${
                              klar ? "text-primary-dark" : "text-foreground"
                            }`}
                          >
                            {punkt.text}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={sparaChecklista}
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-dark"
            >
              Spara checklista (demo)
            </button>
            {sparad && (
              <p className="text-sm font-medium text-primary-dark">
                Checklistan är sparad. Medlemmen ser samma lista i sin vy (demo).
              </p>
            )}
            {allaKlara && (
              <p className="text-sm font-medium text-primary-dark">
                Alla krav är uppfyllda — medlemmen kan få klartecken att påbörja.
              </p>
            )}
          </div>
        </div>
      )}

      {sektioner.length > 0 && (
        <div className="rounded-xl border border-dashed border-primary/30 bg-[#eef6f0]/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">
            Medlemmens vy (demo)
          </p>
          <p className="mt-2 text-sm text-muted">
            Medlemmen ser samma punkter och kan ladda upp underlag per rad. Tills
            styrelsen godkänt alla krav visas status:{" "}
            <em>Väntar på godkännande</em>.
          </p>
        </div>
      )}
    </div>
  );
}
