"use client";

import { useMemo, useState } from "react";
import {
  checklistaPunktNyckel,
  hamtaRonderingChecklista,
  ronderingChecklistaEtiketter,
  type RonderingChecklistaTyp,
} from "@/components/rondering/checklist-mallar";
import { byggEffektivChecklista } from "@/components/rondering/checklist-effektiv";
import { hamtaPunktKrav } from "@/components/rondering/checklist-punkt-taggar";
import {
  foreningEgenskapEtiketter,
  foreningHarEgenskap,
  type ForeningEgenskaper,
} from "@/components/rondering/forening-egenskaper";
import { skapaEgenPunktId, type RonderingEgnaPunkt } from "@/components/rondering/rondering-lager";

type RonderingChecklistaAnpassaProps = {
  typ: RonderingChecklistaTyp;
  egenskaper: ForeningEgenskaper;
  doldaPunkter: string[];
  egnaPunkter: RonderingEgnaPunkt[];
  onDoldaChange: (dolda: string[]) => void;
  onEgnaChange: (egna: RonderingEgnaPunkt[]) => void;
};

export function RonderingChecklistaAnpassa({
  typ,
  egenskaper,
  doldaPunkter,
  egnaPunkter,
  onDoldaChange,
  onEgnaChange,
}: RonderingChecklistaAnpassaProps) {
  const [oppna, setOppna] = useState(false);
  const [nyPunktText, setNyPunktText] = useState("");
  const [nySektion, setNySektion] = useState("");

  const bas = useMemo(() => hamtaRonderingChecklista(typ), [typ]);
  const doldaSet = useMemo(() => new Set(doldaPunkter), [doldaPunkter]);
  const effektiv = useMemo(
    () =>
      byggEffektivChecklista(typ, egenskaper, {
        doldaPunkter,
        egnaPunkter,
      }),
    [typ, egenskaper, doldaPunkter, egnaPunkter],
  );

  const doldaManuellt = doldaPunkter.filter((k) => k.startsWith(`${typ}:`));

  function dolPunkt(nyckel: string) {
    if (!doldaSet.has(nyckel)) {
      onDoldaChange([...doldaPunkter, nyckel]);
    }
  }

  function visaPunkt(nyckel: string) {
    onDoldaChange(doldaPunkter.filter((k) => k !== nyckel));
  }

  function aterstallAlla() {
    onDoldaChange(doldaPunkter.filter((k) => !k.startsWith(`${typ}:`)));
  }

  function laggTillEgenPunkt() {
    const text = nyPunktText.trim();
    if (!text) return;
    const sektionId =
      nySektion.trim() ||
      bas.sektioner[0]?.id ||
      "egna-tillagg";
    onEgnaChange([
      ...egnaPunkter,
      {
        typ,
        sektionId,
        id: skapaEgenPunktId(),
        text,
      },
    ]);
    setNyPunktText("");
    setNySektion("");
  }

  function taBortEgen(id: string) {
    onEgnaChange(egnaPunkter.filter((e) => e.id !== id));
  }

  return (
    <details
      className="rounded-xl border border-border bg-background/80"
      open={oppna || undefined}
      onToggle={(e) => setOppna((e.target as HTMLDetailsElement).open)}
    >
      <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden">
        Anpassa {ronderingChecklistaEtiketter[typ]} — dölj eller lägg till punkter
      </summary>
      <div className="border-t border-border px-4 pb-4 pt-2">
        <p className="text-xs text-muted">
          {effektiv.sektioner.reduce((s, sec) => s + sec.punkter.length, 0)} punkter
          ingår nu (efter egenskaper och dolda rader).
        </p>

        <div className="mt-4 max-h-64 space-y-3 overflow-y-auto rounded-lg border border-border bg-white p-3">
          {bas.sektioner.map((sektion) => (
            <div key={sektion.id}>
              <p className="text-xs font-semibold text-foreground">{sektion.etikett}</p>
              <ul className="mt-1 space-y-1">
                {sektion.punkter.map((punkt) => {
                  const nyckel = checklistaPunktNyckel(typ, sektion.id, punkt.id);
                  const krav = hamtaPunktKrav(nyckel);
                  const passarEgenskap = foreningHarEgenskap(egenskaper, krav);
                  const dold = doldaSet.has(nyckel);
                  if (!passarEgenskap) {
                    return (
                      <li key={nyckel} className="text-xs text-muted line-through">
                        {punkt.text.slice(0, 72)}… (döljs — egenskap)
                      </li>
                    );
                  }
                  return (
                    <li key={nyckel} className="flex items-start gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => (dold ? visaPunkt(nyckel) : dolPunkt(nyckel))}
                        className={`shrink-0 rounded px-1.5 py-0.5 font-medium ${
                          dold
                            ? "bg-amber-50 text-amber-950"
                            : "bg-[#eef6f0] text-primary-dark"
                        }`}
                      >
                        {dold ? "Visa igen" : "Dölj"}
                      </button>
                      <span className={dold ? "text-muted line-through" : "text-foreground"}>
                        {punkt.text.slice(0, 100)}
                        {punkt.text.length > 100 ? "…" : ""}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {doldaManuellt.length > 0 && (
          <button
            type="button"
            onClick={aterstallAlla}
            className="mt-2 text-xs font-medium text-primary-dark underline-offset-2 hover:underline"
          >
            Återställ alla dolda punkter i denna lista
          </button>
        )}

        <div className="mt-4 rounded-lg border border-dashed border-primary/30 bg-white p-3">
          <p className="text-sm font-medium text-foreground">Lägg till egen punkt</p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={nyPunktText}
              onChange={(e) => setNyPunktText(e.target.value)}
              placeholder="Beskriv momentet …"
              className="flex-1 rounded-lg border border-border px-3 py-2 text-sm"
            />
            <select
              value={nySektion}
              onChange={(e) => setNySektion(e.target.value)}
              className="rounded-lg border border-border px-3 py-2 text-sm"
              aria-label="Sektion"
            >
              <option value="">Välj sektion …</option>
              {bas.sektioner.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.etikett}
                </option>
              ))}
              <option value="egna-tillagg">Egna tillägg (ny sektion)</option>
            </select>
            <button
              type="button"
              onClick={laggTillEgenPunkt}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
            >
              Lägg till
            </button>
          </div>
        </div>

        {egnaPunkter.filter((e) => e.typ === typ).length > 0 && (
          <ul className="mt-3 space-y-1">
            {egnaPunkter
              .filter((e) => e.typ === typ)
              .map((e) => (
                <li
                  key={e.id}
                  className="flex items-center justify-between gap-2 rounded-lg bg-[#fafcfa] px-2 py-1 text-xs"
                >
                  <span>{e.text}</span>
                  <button
                    type="button"
                    onClick={() => taBortEgen(e.id)}
                    className="text-muted hover:text-red-800"
                  >
                    Ta bort
                  </button>
                </li>
              ))}
          </ul>
        )}

        <p className="mt-3 text-xs text-muted">
          Punkter med taggen «egenskap» styrs av rutorna ovan (
          {Object.keys(foreningEgenskapEtiketter).length} val).
        </p>
      </div>
    </details>
  );
}
