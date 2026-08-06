"use client";

import { useEffect, useMemo, useState } from "react";
import {
  byggMotesDokumentPunkter,
  foreslagnMotesPunkter,
  hittaProtokoll,
  lasDagordningMall,
  lasSparadeProtokoll,
  manadsnamn,
  sparaDagordningMall,
  sparaSparadeProtokoll,
  skapaDokumentPunktId,
  type ArshjulHandelse,
  type MotesDokumentPunkt,
  type SparatProtokoll,
} from "@/components/arshjul/arshjul";

type Props = {
  moten: ArshjulHandelse[];
  valtAr: number;
  aktuellManad: number;
  innevarandeAr: number;
  moteId: string | null;
  manad: number;
  onMoteIdChange: (id: string) => void;
  onManadChange: (manad: number) => void;
  onMeddelande: (text: string) => void;
  /** Synka månadspunkt till händelsen (årshjulet). */
  onLaggTillManadsPunkt: (moteId: string, text: string, manad: number) => void;
};

type Flik = "dagordning" | "protokoll" | "grundmall";

export function MotesDokumentPanel({
  moten,
  valtAr,
  aktuellManad,
  innevarandeAr,
  moteId,
  manad,
  onMoteIdChange,
  onManadChange,
  onMeddelande,
  onLaggTillManadsPunkt,
}: Props) {
  const [flik, setFlik] = useState<Flik>("dagordning");
  const [punkter, setPunkter] = useState<MotesDokumentPunkt[]>([]);
  const [mallPunkter, setMallPunkter] = useState(
    () => lasDagordningMall().punkter,
  );
  const [protokoll, setProtokoll] = useState<SparatProtokoll[]>([]);
  const [nyRubrik, setNyRubrik] = useState("");
  const [nyMallRubrik, setNyMallRubrik] = useState("");
  const [hydrated, setHydrated] = useState(false);

  const aktivMote =
    moten.find((m) => m.id === moteId) ?? moten[0] ?? null;
  const aktivMoteId = aktivMote?.id ?? null;

  useEffect(() => {
    setProtokoll(lasSparadeProtokoll());
    setMallPunkter(lasDagordningMall().punkter);
    setHydrated(true);
  }, []);

  const sparatForMote = useMemo(() => {
    if (!aktivMoteId) return undefined;
    return hittaProtokoll(protokoll, aktivMoteId, valtAr, manad);
  }, [protokoll, aktivMoteId, valtAr, manad]);

  useEffect(() => {
    if (!hydrated) return;
    const mall = { punkter: mallPunkter };
    setPunkter(
      byggMotesDokumentPunkter(mall, aktivMote, manad, sparatForMote),
    );
    // Endast när möte/månad/år eller sparat protokoll byts — inte vid varje mall-edit
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, aktivMoteId, manad, valtAr, sparatForMote?.id, sparatForMote?.sparadAt]);

  function uppdateraPunkt(
    id: string,
    patch: Partial<MotesDokumentPunkt>,
  ) {
    setPunkter((cur) =>
      cur.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    );
  }

  function laggTillPunkt() {
    const text = nyRubrik.trim();
    if (!text || !aktivMoteId) return;
    setPunkter((cur) => [
      ...cur,
      {
        id: skapaDokumentPunktId(),
        rubrik: text,
        anteckning: "",
        beslut: "",
      },
    ]);
    onLaggTillManadsPunkt(aktivMoteId, text, manad);
    setNyRubrik("");
  }

  function taBortPunkt(id: string) {
    setPunkter((cur) => cur.filter((p) => p.id !== id));
  }

  function sparaMall() {
    const kalla =
      flik === "grundmall"
        ? mallPunkter
        : punkter.map((p) => ({ id: p.id, rubrik: p.rubrik }));
    const rensad = kalla.filter((p) => p.rubrik.trim());
    if (rensad.length === 0) {
      onMeddelande("Lägg till minst en punkt innan du sparar grundmallen.");
      return;
    }
    sparaDagordningMall({ punkter: rensad });
    setMallPunkter(rensad);
    onMeddelande("Grundmall sparad.");
  }

  function sparaProtokollNu() {
    if (!aktivMote || !aktivMoteId) {
      onMeddelande("Välj ett möte först.");
      return;
    }
    const rensad = punkter.filter((p) => p.rubrik.trim());
    if (rensad.length === 0) {
      onMeddelande("Dokumentet är tomt — lägg till punkter först.");
      return;
    }
    const nu: SparatProtokoll = {
      id: sparatForMote?.id ?? `prot-${Date.now()}`,
      moteId: aktivMoteId,
      moteTitel: aktivMote.titel,
      ar: valtAr,
      manad,
      punkter: rensad.map((p) => ({
        id: p.id,
        rubrik: p.rubrik.trim(),
        anteckning: p.anteckning.trim(),
        beslut: p.beslut.trim(),
      })),
      sparadAt: new Date().toISOString(),
    };
    const nasta = [
      nu,
      ...protokoll.filter(
        (p) =>
          !(p.moteId === aktivMoteId && p.ar === valtAr && p.manad === manad),
      ),
    ];
    sparaSparadeProtokoll(nasta);
    setProtokoll(nasta);
    onMeddelande(
      `Protokoll sparat för ${aktivMote.titel} · ${manadsnamn[manad - 1]} ${valtAr}.`,
    );
  }

  function laddaFranMall() {
    setPunkter(
      byggMotesDokumentPunkter(
        { punkter: mallPunkter },
        aktivMote,
        manad,
        undefined,
      ),
    );
    onMeddelande("Dokument återställt från grundmall.");
  }

  if (moten.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        {moten.length > 1 && (
          <label className="block text-sm">
            Möte
            <select
              value={aktivMoteId ?? ""}
              onChange={(e) => onMoteIdChange(e.target.value)}
              className="mt-1 block w-full min-w-[12rem] rounded-lg border border-border bg-white px-3 py-2 text-sm"
            >
              {moten.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.titel}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="block text-sm">
          Månad
          <select
            value={manad}
            onChange={(e) => onManadChange(Number(e.target.value))}
            className="mt-1 block w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
          >
            {manadsnamn.map((n, i) => (
              <option key={n} value={i + 1}>
                {n}
                {i + 1 === aktuellManad && valtAr === innevarandeAr
                  ? " (aktuell)"
                  : ""}
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["dagordning", "Dagordning"],
              ["protokoll", "Protokoll"],
              ["grundmall", "Grundmall"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFlik(id)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                flik === id
                  ? "bg-primary text-white"
                  : "border border-border bg-white text-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {flik === "grundmall" ? (
        <div className="rounded-2xl border border-border bg-[#faf9f6] p-5 shadow-sm sm:p-8">
          <header className="border-b border-border/80 pb-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Grundmall
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-foreground sm:text-3xl">
              Dagordning — mall
            </h2>
            <p className="mt-2 text-base text-muted">
              Styrelsen redigerar mallen själva. Den används som start för nya
              dagordningar och protokoll.
            </p>
          </header>
          <ol className="mt-6 space-y-4">
            {mallPunkter.map((p, i) => (
              <li
                key={p.id}
                className="flex items-start gap-3 border-b border-border/60 pb-4"
              >
                <span className="mt-2 w-8 shrink-0 text-lg font-semibold text-muted">
                  {i + 1}.
                </span>
                <input
                  value={p.rubrik}
                  onChange={(e) =>
                    setMallPunkter((cur) =>
                      cur.map((x) =>
                        x.id === p.id ? { ...x, rubrik: e.target.value } : x,
                      ),
                    )
                  }
                  className="min-w-0 flex-1 rounded-lg border border-border bg-white px-3 py-2.5 text-lg text-foreground"
                />
                <button
                  type="button"
                  onClick={() =>
                    setMallPunkter((cur) => cur.filter((x) => x.id !== p.id))
                  }
                  className="mt-1 shrink-0 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-800 hover:bg-red-50"
                >
                  Ta bort
                </button>
              </li>
            ))}
          </ol>
          <div className="mt-5 flex flex-wrap gap-2">
            <input
              value={nyMallRubrik}
              onChange={(e) => setNyMallRubrik(e.target.value)}
              placeholder="Ny punkt i mallen"
              className="min-w-0 flex-1 rounded-lg border border-border bg-white px-3 py-2.5 text-base"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const t = nyMallRubrik.trim();
                  if (!t) return;
                  setMallPunkter((cur) => [
                    ...cur,
                    { id: skapaDokumentPunktId(), rubrik: t },
                  ]);
                  setNyMallRubrik("");
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                const t = nyMallRubrik.trim();
                if (!t) return;
                setMallPunkter((cur) => [
                  ...cur,
                  { id: skapaDokumentPunktId(), rubrik: t },
                ]);
                setNyMallRubrik("");
              }}
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-dark"
            >
              Lägg till
            </button>
            <button
              type="button"
              onClick={sparaMall}
              className="rounded-lg bg-primary-dark px-4 py-2.5 text-sm font-medium text-white hover:bg-primary"
            >
              Spara grundmall
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-[#faf9f6] p-5 shadow-sm sm:p-8">
          <header className="border-b border-border/80 pb-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              {flik === "dagordning" ? "Dagordning" : "Protokoll"} ·{" "}
              {manadsnamn[manad - 1]} {valtAr}
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-foreground sm:text-3xl">
              {aktivMote?.titel ?? "Möte"}
            </h2>
            <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted">
              {flik === "dagordning"
                ? "Punkter som ska tas upp på aktuellt möte. Lägg till och ta bort fritt — spara som grundmall eller som protokoll när mötet är klart."
                : "Fyll i anteckningar och beslut under respektive punkt. Spara aktuellt protokoll när ni är klara."}
            </p>
            {sparatForMote && (
              <p className="mt-2 text-sm text-primary-dark">
                Sparat protokoll finns ·{" "}
                {new Date(sparatForMote.sparadAt).toLocaleString("sv-SE")}
              </p>
            )}
          </header>

          <ol className="mt-6 space-y-6">
            {punkter.map((p, i) => (
              <li key={p.id} className="border-b border-border/70 pb-6">
                <div className="flex items-start gap-3">
                  <span className="mt-1 w-10 shrink-0 text-xl font-semibold text-muted">
                    §{i + 1}
                  </span>
                  <div className="min-w-0 flex-1 space-y-3">
                    <input
                      value={p.rubrik}
                      onChange={(e) =>
                        uppdateraPunkt(p.id, { rubrik: e.target.value })
                      }
                      className="w-full rounded-lg border border-transparent bg-transparent px-1 py-1 text-xl font-medium text-foreground hover:border-border focus:border-border focus:bg-white"
                    />
                    {flik === "protokoll" && (
                      <>
                        <label className="block text-sm text-muted">
                          Anteckning
                          <textarea
                            value={p.anteckning}
                            onChange={(e) =>
                              uppdateraPunkt(p.id, {
                                anteckning: e.target.value,
                              })
                            }
                            rows={3}
                            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-base leading-relaxed text-foreground"
                            placeholder="Vad diskuterades…"
                          />
                        </label>
                        <label className="block text-sm text-muted">
                          Beslut / åtgärd
                          <textarea
                            value={p.beslut}
                            onChange={(e) =>
                              uppdateraPunkt(p.id, { beslut: e.target.value })
                            }
                            rows={2}
                            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-base leading-relaxed text-foreground"
                            placeholder="Beslut eller uppföljning…"
                          />
                        </label>
                      </>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => taBortPunkt(p.id)}
                    className="shrink-0 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-800 hover:bg-red-50"
                  >
                    Ta bort
                  </button>
                </div>
              </li>
            ))}
            {punkter.length === 0 && (
              <li className="text-base text-muted">
                Inga punkter ännu. Lägg till nedan eller ladda från grundmall.
              </li>
            )}
          </ol>

          <div className="mt-6 space-y-3 border-t border-border/80 pt-5">
            <div className="flex flex-wrap gap-2">
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value) setNyRubrik(e.target.value);
                }}
                className="rounded-lg border border-border bg-white px-3 py-2.5 text-sm"
              >
                <option value="">Förslag …</option>
                {foreslagnMotesPunkter.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <input
                value={nyRubrik}
                onChange={(e) => setNyRubrik(e.target.value)}
                placeholder="Ny punkt"
                className="min-w-0 flex-1 rounded-lg border border-border bg-white px-3 py-2.5 text-base"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    laggTillPunkt();
                  }
                }}
              />
              <button
                type="button"
                onClick={laggTillPunkt}
                disabled={!nyRubrik.trim()}
                className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-40"
              >
                Lägg till
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={laddaFranMall}
                className="rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium text-foreground hover:bg-[#f0eeea]"
              >
                Ladda från grundmall
              </button>
              <button
                type="button"
                onClick={sparaMall}
                className="rounded-lg border border-primary/40 bg-white px-4 py-2.5 text-sm font-medium text-primary-dark hover:bg-[#eef6f0]"
              >
                Spara som grundmall
              </button>
              <button
                type="button"
                onClick={sparaProtokollNu}
                className="rounded-lg bg-primary-dark px-4 py-2.5 text-sm font-medium text-white hover:bg-primary"
              >
                Spara aktuellt protokoll
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
