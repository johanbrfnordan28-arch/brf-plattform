"use client";

import { useEffect, useState } from "react";
import {
  arFlerarsIntervall,
  behoverPlaneringsperiod,
  intervallAlternativ,
  intervallEtiketter,
  manadsnamn,
  veckodagEtiketter,
  veckodagOrdningEtiketter,
  type ArshjulHandelse,
  type ArshjulIntervall,
  type ArshjulVeckodag,
  type ArshjulVeckodagOrdning,
} from "@/components/arshjul/arshjul";

type Props = {
  handelse: ArshjulHandelse;
  innevarandeAr: number;
  onSpara: (patch: Partial<ArshjulHandelse>) => void;
  onAvbryt: () => void;
};

export function HandelseRedigeraPanel({
  handelse,
  innevarandeAr,
  onSpara,
  onAvbryt,
}: Props) {
  const [titel, setTitel] = useState(handelse.titel);
  const [beskrivning, setBeskrivning] = useState(handelse.beskrivning ?? "");
  const [intervall, setIntervall] = useState<ArshjulIntervall>(
    handelse.intervall,
  );
  const [datum, setDatum] = useState(
    handelse.datum ??
      `${innevarandeAr}-${String(new Date().getMonth() + 1).padStart(2, "0")}-15`,
  );
  const [manad, setManad] = useState(handelse.manad ?? 1);
  const [dag, setDag] = useState(handelse.dag ?? 15);
  const [startAr, setStartAr] = useState(
    handelse.startAr ?? innevarandeAr,
  );
  const [veckodag, setVeckodag] = useState<ArshjulVeckodag>(
    handelse.veckodag ?? 1,
  );
  const [vecka, setVecka] = useState<ArshjulVeckodagOrdning>(
    handelse.veckodagOrdning ?? 2,
  );
  const [planFran, setPlanFran] = useState(
    handelse.planerasFranAr ?? innevarandeAr,
  );
  const [planTill, setPlanTill] = useState(
    handelse.planerasTillAr ?? innevarandeAr + 1,
  );
  const [hoppaSemester, setHoppaSemester] = useState(
    (handelse.undantagnaManader ?? []).includes(7) ||
      (handelse.undantagnaManader ?? []).includes(8),
  );

  useEffect(() => {
    setTitel(handelse.titel);
    setBeskrivning(handelse.beskrivning ?? "");
    setIntervall(handelse.intervall);
    setDatum(
      handelse.datum ??
        `${innevarandeAr}-${String(new Date().getMonth() + 1).padStart(2, "0")}-15`,
    );
    setManad(handelse.manad ?? 1);
    setDag(handelse.dag ?? 15);
    setStartAr(handelse.startAr ?? innevarandeAr);
    setVeckodag(handelse.veckodag ?? 1);
    setVecka(handelse.veckodagOrdning ?? 2);
    setPlanFran(handelse.planerasFranAr ?? innevarandeAr);
    setPlanTill(handelse.planerasTillAr ?? innevarandeAr + 1);
    setHoppaSemester(
      (handelse.undantagnaManader ?? []).includes(7) ||
        (handelse.undantagnaManader ?? []).includes(8),
    );
  }, [handelse, innevarandeAr]);

  function spara() {
    const t = titel.trim();
    if (!t) return;

    const patch: Partial<ArshjulHandelse> = {
      titel: t,
      beskrivning: beskrivning.trim(),
      intervall,
    };

    // Rensa fält som inte längre gäller för valt intervall
    patch.datum = undefined;
    patch.manad = undefined;
    patch.dag = undefined;
    patch.startAr = undefined;
    patch.veckodag = undefined;
    patch.veckodagOrdning = undefined;
    patch.planerasFranAr = undefined;
    patch.planerasTillAr = undefined;
    patch.undantagnaManader = [];

    if (intervall === "engang" || intervall === "veckovis") {
      patch.datum = datum;
    } else if (intervall === "manadsvis_veckodag") {
      patch.veckodag = veckodag;
      patch.veckodagOrdning = vecka;
      if (behoverPlaneringsperiod(intervall)) {
        patch.planerasFranAr = planFran;
        patch.planerasTillAr = planTill;
        patch.undantagnaManader = hoppaSemester ? [7, 8] : [];
      }
    } else if (
      intervall === "manadsvis" ||
      intervall === "kvartalsvis" ||
      intervall === "arlig"
    ) {
      patch.manad = manad;
      patch.dag = dag;
      if (behoverPlaneringsperiod(intervall)) {
        patch.planerasFranAr = planFran;
        patch.planerasTillAr = planTill;
        patch.undantagnaManader = hoppaSemester ? [7, 8] : [];
      }
    } else if (arFlerarsIntervall(intervall)) {
      patch.manad = manad;
      patch.dag = dag;
      patch.startAr = startAr;
    }

    if (
      handelse.underkategori === "Övrigt" &&
      behoverPlaneringsperiod(intervall)
    ) {
      patch.planerasFranAr = planFran;
      patch.planerasTillAr = planTill;
    }

    onSpara(patch);
  }

  return (
    <div className="mt-3 space-y-3 rounded-lg border border-primary/30 bg-[#eef6f0]/60 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-primary-dark">Ändra händelse</p>
        <button
          type="button"
          onClick={onAvbryt}
          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
        >
          Stäng
        </button>
      </div>

      <label className="block text-sm">
        Namn
        <input
          value={titel}
          onChange={(e) => setTitel(e.target.value)}
          className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
        />
      </label>

      {(handelse.underkategori === "Myndighetskrav" ||
        handelse.underkategori === "Övrigt" ||
        handelse.beskrivning) && (
        <label className="block text-sm">
          Beskrivning
          <input
            value={beskrivning}
            onChange={(e) => setBeskrivning(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
          />
        </label>
      )}

      <label className="block text-sm">
        Intervall
        <select
          value={intervall}
          onChange={(e) => setIntervall(e.target.value as ArshjulIntervall)}
          className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
        >
          {intervallAlternativ.map((i) => (
            <option key={i} value={i}>
              {intervallEtiketter[i]}
            </option>
          ))}
        </select>
      </label>

      {(intervall === "engang" || intervall === "veckovis") && (
        <label className="block text-sm">
          {intervall === "veckovis" ? "Startdatum" : "Datum"}
          <input
            type="date"
            value={datum}
            onChange={(e) => setDatum(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
          />
        </label>
      )}

      {intervall === "manadsvis_veckodag" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            Vecka i månaden
            <select
              value={vecka}
              onChange={(e) =>
                setVecka(Number(e.target.value) as ArshjulVeckodagOrdning)
              }
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
            >
              {Object.entries(veckodagOrdningEtiketter).map(([v, etikett]) => (
                <option key={v} value={v}>
                  {etikett}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            Veckodag
            <select
              value={veckodag}
              onChange={(e) =>
                setVeckodag(Number(e.target.value) as ArshjulVeckodag)
              }
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
            >
              {([1, 2, 3, 4, 5, 6, 7] as ArshjulVeckodag[]).map((d) => (
                <option key={d} value={d}>
                  {veckodagEtiketter[d]}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {(intervall === "manadsvis" ||
        intervall === "kvartalsvis" ||
        intervall === "arlig" ||
        arFlerarsIntervall(intervall)) && (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            Månad
            <select
              value={manad}
              onChange={(e) => setManad(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
            >
              {manadsnamn.map((n, i) => (
                <option key={n} value={i + 1}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            Dag
            <input
              type="number"
              min={1}
              max={28}
              value={dag}
              onChange={(e) => setDag(Number(e.target.value) || 1)}
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
            />
          </label>
        </div>
      )}

      {arFlerarsIntervall(intervall) && (
        <label className="block text-sm">
          Första / nästa år
          <input
            type="number"
            value={startAr}
            onChange={(e) => setStartAr(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
          />
        </label>
      )}

      {behoverPlaneringsperiod(intervall) && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              Planeras från år
              <input
                type="number"
                value={planFran}
                onChange={(e) => setPlanFran(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              Planeras till år
              <input
                type="number"
                value={planTill}
                onChange={(e) => setPlanTill(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
              />
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={hoppaSemester}
              onChange={(e) => setHoppaSemester(e.target.checked)}
            />
            Hoppa över juli–augusti
          </label>
        </>
      )}

      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="button"
          onClick={spara}
          disabled={!titel.trim()}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-40"
        >
          Spara ändringar
        </button>
        <button
          type="button"
          onClick={onAvbryt}
          className="rounded-lg border border-border bg-white px-4 py-2 text-sm text-muted"
        >
          Avbryt
        </button>
      </div>
    </div>
  );
}
