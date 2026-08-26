"use client";

import { useEffect, useMemo, useState } from "react";
import { OppnaStangKnapp } from "@/components/OppnaStangKnapp";
import {
  byggMotesDokumentPunkter,
  foreslagnMotesPunkter,
  hittaProtokoll,
  hittaUppladdadDagordning,
  lasDagordningMall,
  lasSparadeProtokoll,
  lasUppladdadeDagordningar,
  manadsnamn,
  MAX_DAGORDNING_FIL_BYTES,
  sparaDagordningMall,
  sparaSparadeProtokoll,
  sparaUppladdadeDagordningar,
  speglaProtokollMotDagordning,
  skapaDokumentPunktId,
  type ArshjulHandelse,
  type MotesDokumentPunkt,
  type SparatProtokoll,
  type UppladdadDagordningFil,
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
  onLaggTillManadsPunkt: (moteId: string, text: string, manad: number) => void;
};

type Flik = "dagordning" | "protokoll" | "mall";

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
  const [oppen, setOppen] = useState(false);
  const [flik, setFlik] = useState<Flik>("dagordning");
  const [punkter, setPunkter] = useState<MotesDokumentPunkt[]>([]);
  const [mallPunkter, setMallPunkter] = useState(
    () => lasDagordningMall().punkter,
  );
  const [protokoll, setProtokoll] = useState<SparatProtokoll[]>([]);
  const [filer, setFiler] = useState<UppladdadDagordningFil[]>([]);
  const [nyRubrik, setNyRubrik] = useState("");
  const [nyMallRubrik, setNyMallRubrik] = useState("");
  const [hydrated, setHydrated] = useState(false);

  const aktivMote = moten.find((m) => m.id === moteId) ?? moten[0] ?? null;
  const aktivMoteId = aktivMote?.id ?? null;

  useEffect(() => {
    setProtokoll(lasSparadeProtokoll());
    setFiler(lasUppladdadeDagordningar());
    setMallPunkter(lasDagordningMall().punkter);
    setHydrated(true);
  }, []);

  const sparatForMote = useMemo(() => {
    if (!aktivMoteId) return undefined;
    return hittaProtokoll(protokoll, aktivMoteId, valtAr, manad);
  }, [protokoll, aktivMoteId, valtAr, manad]);

  const uppladdadFil = useMemo(() => {
    if (!aktivMoteId) return undefined;
    return hittaUppladdadDagordning(filer, aktivMoteId, valtAr, manad);
  }, [filer, aktivMoteId, valtAr, manad]);

  useEffect(() => {
    if (!hydrated) return;
    setPunkter(
      byggMotesDokumentPunkter(
        { punkter: mallPunkter },
        aktivMote,
        manad,
        sparatForMote,
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    hydrated,
    aktivMoteId,
    manad,
    valtAr,
    sparatForMote?.id,
    sparatForMote?.sparadAt,
  ]);

  function uppdateraPunkt(id: string, patch: Partial<MotesDokumentPunkt>) {
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
      flik === "mall"
        ? mallPunkter
        : punkter.map((p) => ({ id: p.id, rubrik: p.rubrik }));
    const rensad = kalla.filter((p) => p.rubrik.trim());
    if (rensad.length === 0) {
      onMeddelande("Lägg till minst en punkt innan du sparar mallen.");
      return;
    }
    sparaDagordningMall({ punkter: rensad });
    setMallPunkter(rensad);
    onMeddelande("Er mall sparad.");
  }

  function sparaProtokollNu() {
    if (!aktivMote || !aktivMoteId) {
      onMeddelande("Välj ett möte först.");
      return;
    }
    const speglad = speglaProtokollMotDagordning(punkter, punkter).filter(
      (p) => p.rubrik.trim(),
    );
    if (speglad.length === 0) {
      onMeddelande("Dagordningen är tom — lägg till punkter först.");
      return;
    }
    const nu: SparatProtokoll = {
      id: sparatForMote?.id ?? `prot-${Date.now()}`,
      moteId: aktivMoteId,
      moteTitel: aktivMote.titel,
      ar: valtAr,
      manad,
      punkter: speglad.map((p) => ({
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
      `Protokoll sparat · ${manadsnamn[manad - 1]} ${valtAr} (följer dagordningen).`,
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
    onMeddelande("Dagordning laddad från er mall.");
  }

  function bytTillProtokoll() {
    setPunkter((cur) => speglaProtokollMotDagordning(cur, cur));
    setFlik("protokoll");
  }

  function laddaUppFil(fil: File | null) {
    if (!fil || !aktivMoteId) return;
    if (fil.size > MAX_DAGORDNING_FIL_BYTES) {
      onMeddelande(
        "Filen är för stor (max ca 1,5 MB i demot). Komprimera eller använd en mindre PDF.",
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result ?? "");
      if (!dataUrl) {
        onMeddelande("Kunde inte läsa filen.");
        return;
      }
      const post: UppladdadDagordningFil = {
        id: `dof-${Date.now()}`,
        moteId: aktivMoteId,
        ar: valtAr,
        manad,
        filnamn: fil.name,
        mimeTyp: fil.type || "application/octet-stream",
        storlek: fil.size,
        dataUrl,
        uppladdadAt: new Date().toISOString(),
      };
      const nasta = [
        post,
        ...filer.filter(
          (f) =>
            !(f.moteId === aktivMoteId && f.ar === valtAr && f.manad === manad),
        ),
      ];
      sparaUppladdadeDagordningar(nasta);
      setFiler(nasta);
      onMeddelande(`Dagordning uppladdad: ${fil.name}`);
    };
    reader.onerror = () => onMeddelande("Kunde inte läsa filen.");
    reader.readAsDataURL(fil);
  }

  function taBortUppladdning() {
    if (!aktivMoteId || !uppladdadFil) return;
    const nasta = filer.filter((f) => f.id !== uppladdadFil.id);
    sparaUppladdadeDagordningar(nasta);
    setFiler(nasta);
    onMeddelande("Uppladdad dagordning borttagen.");
  }

  if (moten.length === 0) return null;

  return (
    <div className="rounded-xl border border-dashed border-border bg-white/80">
      <div className="flex items-center justify-between gap-3 px-3 py-2.5">
        <button
          type="button"
          onClick={() => setOppen((v) => !v)}
          className="min-w-0 flex-1 text-left"
        >
          <p className="text-sm font-medium text-foreground">
            Dagordning & protokoll
            <span className="ml-1.5 font-normal text-muted">(valfritt)</span>
          </p>
          <p className="truncate text-xs text-muted">
            Anpassa mall, ladda upp egen dagordning eller skriv protokoll —
            speglar punkterna i dagordningen.
          </p>
        </button>
        <OppnaStangKnapp
          oppen={oppen}
          onClick={() => setOppen((v) => !v)}
          storlek="sm"
          ariaLabel={
            oppen ? "Stäng dagordning och protokoll" : "Öppna dagordning och protokoll"
          }
        />
      </div>

      {oppen && (
        <div className="space-y-3 border-t border-border px-3 pb-3 pt-3">
          <div className="flex flex-wrap items-end gap-2">
            {moten.length > 1 && (
              <label className="block text-xs text-muted">
                Möte
                <select
                  value={aktivMoteId ?? ""}
                  onChange={(e) => onMoteIdChange(e.target.value)}
                  className="mt-0.5 block w-full min-w-[10rem] rounded-md border border-border bg-white px-2 py-1.5 text-sm"
                >
                  {moten.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.titel}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className="block text-xs text-muted">
              Månad
              <select
                value={manad}
                onChange={(e) => onManadChange(Number(e.target.value))}
                className="mt-0.5 block w-full rounded-md border border-border bg-white px-2 py-1.5 text-sm"
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
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setFlik("dagordning")}
                className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                  flik === "dagordning"
                    ? "bg-primary text-white"
                    : "border border-border text-muted"
                }`}
              >
                Dagordning
              </button>
              <button
                type="button"
                onClick={bytTillProtokoll}
                className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                  flik === "protokoll"
                    ? "bg-primary text-white"
                    : "border border-border text-muted"
                }`}
              >
                Protokoll
              </button>
              <button
                type="button"
                onClick={() => setFlik("mall")}
                className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                  flik === "mall"
                    ? "bg-primary text-white"
                    : "border border-border text-muted"
                }`}
              >
                Er mall
              </button>
            </div>
          </div>

          {/* Uppladdning — många föreningar har redan en dagordning */}
          {flik !== "mall" && (
            <div className="rounded-lg border border-dashed border-border bg-[#fafafa] px-3 py-2">
              <p className="text-xs text-muted">
                Har ni redan en dagordning? Ladda upp PDF eller Word — den sparas
                till valt möte och månad.
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <label className="inline-flex cursor-pointer rounded-md border border-border bg-white px-2.5 py-1 text-xs font-medium text-foreground hover:bg-[#f0eeea]">
                  Ladda upp
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,application/pdf"
                    className="sr-only"
                    onChange={(e) => {
                      laddaUppFil(e.target.files?.[0] ?? null);
                      e.target.value = "";
                    }}
                  />
                </label>
                {uppladdadFil && (
                  <>
                    <a
                      href={uppladdadFil.dataUrl}
                      download={uppladdadFil.filnamn}
                      className="text-xs font-medium text-primary-dark underline"
                    >
                      {uppladdadFil.filnamn}
                    </a>
                    <button
                      type="button"
                      onClick={taBortUppladdning}
                      className="text-xs text-red-800 underline"
                    >
                      Ta bort fil
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {flik === "mall" && (
            <div className="space-y-2 rounded-lg border border-border bg-[#fafafa] p-3">
              <p className="text-xs text-muted">
                Styrelsen anpassar mallen själva. Den används som start när ni
                skapar ny dagordning.
              </p>
              <ul className="space-y-1.5">
                {mallPunkter.map((p, i) => (
                  <li key={p.id} className="flex items-center gap-2">
                    <span className="w-5 shrink-0 text-xs text-muted">
                      {i + 1}.
                    </span>
                    <input
                      value={p.rubrik}
                      onChange={(e) =>
                        setMallPunkter((cur) =>
                          cur.map((x) =>
                            x.id === p.id
                              ? { ...x, rubrik: e.target.value }
                              : x,
                          ),
                        )
                      }
                      className="min-w-0 flex-1 rounded-md border border-border bg-white px-2 py-1 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setMallPunkter((cur) =>
                          cur.filter((x) => x.id !== p.id),
                        )
                      }
                      className="text-xs text-red-800 underline"
                    >
                      Ta bort
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2 pt-1">
                <input
                  value={nyMallRubrik}
                  onChange={(e) => setNyMallRubrik(e.target.value)}
                  placeholder="Ny punkt"
                  className="min-w-0 flex-1 rounded-md border border-border bg-white px-2 py-1.5 text-sm"
                  onKeyDown={(e) => {
                    if (e.key !== "Enter") return;
                    e.preventDefault();
                    const t = nyMallRubrik.trim();
                    if (!t) return;
                    setMallPunkter((cur) => [
                      ...cur,
                      { id: skapaDokumentPunktId(), rubrik: t },
                    ]);
                    setNyMallRubrik("");
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
                  className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white"
                >
                  Lägg till
                </button>
                <button
                  type="button"
                  onClick={sparaMall}
                  className="rounded-md bg-primary-dark px-3 py-1.5 text-xs font-medium text-white"
                >
                  Spara mall
                </button>
              </div>
            </div>
          )}

          {flik !== "mall" && (
            <div className="space-y-2 rounded-lg border border-border bg-[#fafafa] p-3">
              <p className="text-xs text-muted">
                {aktivMote?.titel} · {manadsnamn[manad - 1]} {valtAr}
                {flik === "protokoll"
                  ? " — protokollet speglar dagordningens punkter."
                  : " — redigera punkter här; samma lista används i protokollet."}
                {sparatForMote
                  ? ` Sparat ${new Date(sparatForMote.sparadAt).toLocaleDateString("sv-SE")}.`
                  : ""}
              </p>

              <ol className="space-y-2">
                {punkter.map((p, i) => (
                  <li
                    key={p.id}
                    className="rounded-md border border-border/70 bg-white px-2.5 py-2"
                  >
                    <div className="flex items-start gap-2">
                      <span className="mt-1.5 w-6 shrink-0 text-xs font-semibold text-muted">
                        §{i + 1}
                      </span>
                      <div className="min-w-0 flex-1 space-y-1.5">
                        {flik === "dagordning" ? (
                          <input
                            value={p.rubrik}
                            onChange={(e) =>
                              uppdateraPunkt(p.id, { rubrik: e.target.value })
                            }
                            className="w-full rounded-md border border-border px-2 py-1 text-sm font-medium"
                          />
                        ) : (
                          <p className="text-sm font-medium text-foreground">
                            {p.rubrik}
                          </p>
                        )}
                        {flik === "protokoll" && (
                          <>
                            <textarea
                              value={p.anteckning}
                              onChange={(e) =>
                                uppdateraPunkt(p.id, {
                                  anteckning: e.target.value,
                                })
                              }
                              rows={2}
                              placeholder="Anteckning…"
                              className="w-full rounded-md border border-border px-2 py-1.5 text-sm"
                            />
                            <textarea
                              value={p.beslut}
                              onChange={(e) =>
                                uppdateraPunkt(p.id, {
                                  beslut: e.target.value,
                                })
                              }
                              rows={1}
                              placeholder="Beslut / åtgärd…"
                              className="w-full rounded-md border border-border px-2 py-1.5 text-sm"
                            />
                          </>
                        )}
                      </div>
                      {flik === "dagordning" && (
                        <button
                          type="button"
                          onClick={() => taBortPunkt(p.id)}
                          className="mt-1 shrink-0 text-xs text-red-800 underline"
                        >
                          Ta bort
                        </button>
                      )}
                    </div>
                  </li>
                ))}
                {punkter.length === 0 && (
                  <li className="text-xs text-muted">
                    Inga punkter. Ladda från mall eller lägg till nedan.
                  </li>
                )}
              </ol>

              {flik === "dagordning" && (
                <div className="flex flex-wrap gap-2 pt-1">
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) setNyRubrik(e.target.value);
                    }}
                    className="rounded-md border border-border bg-white px-2 py-1.5 text-xs"
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
                    className="min-w-0 flex-1 rounded-md border border-border px-2 py-1.5 text-sm"
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
                    className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
                  >
                    Lägg till
                  </button>
                </div>
              )}

              <div className="flex flex-wrap gap-2 border-t border-border/60 pt-2">
                {flik === "dagordning" && (
                  <>
                    <button
                      type="button"
                      onClick={laddaFranMall}
                      className="rounded-md border border-border bg-white px-2.5 py-1.5 text-xs"
                    >
                      Från mall
                    </button>
                    <button
                      type="button"
                      onClick={sparaMall}
                      className="rounded-md border border-border bg-white px-2.5 py-1.5 text-xs"
                    >
                      Spara som mall
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={sparaProtokollNu}
                  className="rounded-md bg-primary-dark px-2.5 py-1.5 text-xs font-medium text-white"
                >
                  Spara protokoll
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
