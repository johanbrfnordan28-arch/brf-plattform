"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DemoFilSparningNotis } from "@/components/DemoFilSparningNotis";
import {
  arshjulStorageKey,
  expanderaTillfallen,
  formatDatumKort,
  fyllPaStandardHandelser,
  hamtaPaminnelser,
  kategoriEtiketter,
  kategoriFarger,
  manadsnamn,
  normaliseraHandelse,
  skapaHandelseId,
  skapaTomHandelse,
  SOMMAR_EXKLUDERADE_MANADER,
  SOTNING_FORESLAGET_INTERVALL_AR,
  STANDARD_PAMINNELSE_DAGAR,
  veckodagsnamn,
  type ArshjulHandelse,
  type ArshjulHandelseTyp,
  type ArshjulKategori,
  type ArshjulTillfalle,
  type Veckodag,
} from "@/components/arshjul/arshjul";
import {
  importeraFranProjekt,
  importeraFranUnderhallsplan,
} from "@/components/arshjul/arshjul-import";
import { safeSetLocalStorage } from "@/lib/localStorage";

type Vy = "arshjul" | "tidslinje" | "paminnelser";

function lasHandelser(): ArshjulHandelse[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(arshjulStorageKey());
    return raw
      ? (JSON.parse(raw) as ArshjulHandelse[]).map(normaliseraHandelse)
      : [];
  } catch {
    return [];
  }
}

function sparaHandelser(lista: ArshjulHandelse[]): void {
  if (typeof window === "undefined") return;
  safeSetLocalStorage(arshjulStorageKey(), JSON.stringify(lista));
}

function beskrivIntervall(h: ArshjulHandelse): string {
  if (h.typ === "engang" && h.datum) return formatDatumKort(h.datum);
  if (h.typ === "manatlig") {
    const vd = h.veckodag ? veckodagsnamn[h.veckodag] : null;
    const ord =
      h.veckodagOrdinal && h.veckodagOrdinal > 1
        ? `${h.veckodagOrdinal}:e `
        : "";
    const bas = vd
      ? `Varje månad (${ord}${vd.toLowerCase()})`
      : `Varje månad (dag ${h.dag ?? 1})`;
    if (h.exkluderaManader?.length) {
      const hopp = h.exkluderaManader
        .map((m) => manadsnamn[m - 1]?.slice(0, 3))
        .join("/");
      return `${bas} · ej ${hopp}`;
    }
    return bas;
  }
  if (h.typ === "arlig") {
    return `Varje år i ${manadsnamn[(h.manad ?? 1) - 1]}`;
  }
  return `Vart ${h.intervallAr}:e år från ${h.startAr}`;
}

export function ArshjulModul() {
  const innevarandeAr = new Date().getFullYear();
  const [handelser, setHandelser] = useState<ArshjulHandelse[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [vy, setVy] = useState<Vy>("arshjul");
  const [valtAr, setValtAr] = useState(innevarandeAr);
  const [tidslinjeSlutAr, setTidslinjeSlutAr] = useState(innevarandeAr + 15);
  const [skapaOppen, setSkapaOppen] = useState(false);
  const [redigeraId, setRedigeraId] = useState<string | null>(null);
  const [form, setForm] = useState(skapaTomHandelse());
  const [importMeddelande, setImportMeddelande] = useState<string | null>(null);
  const skipFirstSave = useRef(true);

  useEffect(() => {
    // Ny förening startar med tomt årshjul — standardmall läggs in via knappen.
    setHandelser(lasHandelser());
    skipFirstSave.current = true;
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (skipFirstSave.current) {
      skipFirstSave.current = false;
      return;
    }
    sparaHandelser(handelser);
  }, [handelser, hydrated]);

  const tillfallenAr = useMemo(
    () => expanderaTillfallen(handelser, valtAr, valtAr),
    [handelser, valtAr],
  );

  const tillfallenTidslinje = useMemo(
    () => expanderaTillfallen(handelser, innevarandeAr, tidslinjeSlutAr),
    [handelser, innevarandeAr, tidslinjeSlutAr],
  );

  const paminnelser = useMemo(() => {
    const till = new Date();
    till.setFullYear(till.getFullYear() + 2);
    return hamtaPaminnelser(handelser, new Date(), till);
  }, [handelser]);

  const perManad = useMemo(() => {
    const map = new Map<number, ArshjulTillfalle[]>();
    for (let m = 1; m <= 12; m++) map.set(m, []);
    for (const t of tillfallenAr) {
      map.get(t.manad)?.push(t);
    }
    return map;
  }, [tillfallenAr]);

  const perArTidslinje = useMemo(() => {
    const map = new Map<number, ArshjulTillfalle[]>();
    for (const t of tillfallenTidslinje) {
      const lista = map.get(t.ar) ?? [];
      lista.push(t);
      map.set(t.ar, lista);
    }
    return [...map.entries()].sort(([a], [b]) => a - b);
  }, [tillfallenTidslinje]);

  function uppdateraHandelse(id: string, patch: Partial<ArshjulHandelse>) {
    setHandelser((current) =>
      current.map((h) => (h.id === id ? normaliseraHandelse({ ...h, ...patch }) : h)),
    );
  }

  function taBortHandelse(id: string) {
    setHandelser((current) => current.filter((h) => h.id !== id));
    if (redigeraId === id) setRedigeraId(null);
  }

  function markeraKlar(id: string, ar?: number) {
    const h = handelser.find((x) => x.id === id);
    if (!h) return;
    if (h.typ === "intervall" && ar != null) {
      uppdateraHandelse(id, { senastKlarAr: ar, klar: false });
    } else {
      uppdateraHandelse(id, { klar: true });
    }
  }

  function sparaForm(event: React.FormEvent) {
    event.preventDefault();
    if (!form.titel.trim()) return;
    const sparad = normaliseraHandelse({
      ...form,
      titel: form.titel.trim(),
      id: redigeraId ?? form.id ?? skapaHandelseId(),
    });
    if (redigeraId) {
      setHandelser((current) =>
        current.map((h) => (h.id === redigeraId ? sparad : h)),
      );
      setRedigeraId(null);
    } else {
      setHandelser((current) => [...current, sparad]);
    }
    setForm(skapaTomHandelse());
    setSkapaOppen(false);
  }

  function startaRedigera(h: ArshjulHandelse) {
    setRedigeraId(h.id);
    setForm({ ...h });
    setSkapaOppen(true);
  }

  function importeraUnderhallsplan() {
    const nya = importeraFranUnderhallsplan(handelser);
    if (nya.length === 0) {
      setImportMeddelande(
        "Inga nya besiktningar att importera — spara underhållsplanen först eller allt är redan importerat.",
      );
      return;
    }
    setHandelser((current) => [...current, ...nya]);
    setImportMeddelande(`${nya.length} besiktning(ar) importerade från underhållsplanen.`);
  }

  function importeraProjekt() {
    const nya = importeraFranProjekt(handelser);
    if (nya.length === 0) {
      setImportMeddelande(
        "Inget nytt att importera från projekt (garantibesiktning eller tidsplan).",
      );
      return;
    }
    setHandelser((current) => [...current, ...nya]);
    setImportMeddelande(`${nya.length} påminnelse(r) från projekt importerade.`);
  }

  function laggTillStandard() {
    const efter = fyllPaStandardHandelser(handelser);
    const antal = efter.length - handelser.length;
    if (antal === 0) {
      setImportMeddelande("Alla standardkategorier finns redan.");
      return;
    }
    setHandelser(efter);
    setImportMeddelande(
      `${antal} standardhändelser tillagda (styrelsemöte, OVK, sotning, energi, radon m.fl.).`,
    );
  }

  function vaxlaExkluderaManad(manad: number) {
    const nu = form.exkluderaManader ?? [];
    const nasta = nu.includes(manad)
      ? nu.filter((m) => m !== manad)
      : [...nu, manad].sort((a, b) => a - b);
    setForm({ ...form, exkluderaManader: nasta });
  }

  function TillfalleChip({ t }: { t: ArshjulTillfalle }) {
    const h = handelser.find((x) => x.id === t.handelseId);
    return (
      <div
        className={`rounded-lg border px-2 py-1.5 text-xs ${kategoriFarger[t.kategori]}`}
      >
        <p className="font-medium">{t.titel}</p>
        {t.dag > 1 && (
          <p className="opacity-80">
            {t.dag} {manadsnamn[t.manad - 1]?.slice(0, 3)}
          </p>
        )}
        {h && !h.klar && (
          <button
            type="button"
            onClick={() => markeraKlar(h.id, t.ar)}
            className="mt-1 underline-offset-2 hover:underline"
          >
            Markera klar
          </button>
        )}
      </div>
    );
  }

  if (!hydrated) {
    return <p className="text-sm text-muted">Laddar årshjul…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="max-w-3xl space-y-2">
        <p className="text-sm leading-relaxed text-muted">
          Styrelsemöten, byggmöten, OVK, sotning, energideklaration och
          radonmätning — med månads- eller årsintervall. Hoppa över sommarmånader
          när ni inte har möten. Sotning föreslås vart{" "}
          {SOTNING_FORESLAGET_INTERVALL_AR}:e år (kan vara 1–4 beroende på eldstad).
        </p>
        <DemoFilSparningNotis />
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["arshjul", "Årshjul"],
            ["tidslinje", "Tidslinje"],
            ["paminnelser", `Påminnelser (${paminnelser.length})`],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setVy(id)}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              vy === id
                ? "bg-primary text-white"
                : "border border-border bg-white text-muted hover:border-primary/50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={laggTillStandard}
          className="rounded-lg border border-primary px-3 py-1.5 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
        >
          Lägg in standardkategorier
        </button>
        <button
          type="button"
          onClick={importeraUnderhallsplan}
          className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted hover:border-primary/50"
        >
          Importera besiktningar (underhållsplan)
        </button>
        <button
          type="button"
          onClick={importeraProjekt}
          className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted hover:border-primary/50"
        >
          Importera från projekt (garanti + tidsplaner)
        </button>
      </div>
      {importMeddelande && (
        <p className="rounded-lg border border-primary/30 bg-[#eef6f0] px-3 py-2 text-sm text-primary-dark">
          {importMeddelande}
        </p>
      )}

      <details
        className="rounded-2xl border border-primary/40 bg-[#eef6f0]"
        open={skapaOppen || undefined}
        onToggle={(e) => setSkapaOppen((e.target as HTMLDetailsElement).open)}
      >
        <summary className="cursor-pointer list-none px-5 py-4 [&::-webkit-details-marker]:hidden">
          <span className="font-semibold text-primary-dark">
            {redigeraId ? "Redigera händelse" : "+ Lägg till påminnelse / händelse"}
          </span>
        </summary>
        <form onSubmit={sparaForm} className="space-y-4 border-t border-primary/20 px-5 pb-5 pt-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium">Titel</span>
              <input
                required
                value={form.titel}
                onChange={(e) => setForm({ ...form, titel: e.target.value })}
                placeholder="t.ex. OVK, Årsstämma, Radonmätning"
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium">Beskrivning</span>
              <textarea
                value={form.beskrivning}
                onChange={(e) => setForm({ ...form, beskrivning: e.target.value })}
                rows={2}
                placeholder="Vad ska göras, vem ansvarar, länkar…"
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Kategori</span>
              <select
                value={form.kategori}
                onChange={(e) =>
                  setForm({ ...form, kategori: e.target.value as ArshjulKategori })
                }
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
              >
                {(Object.keys(kategoriEtiketter) as ArshjulKategori[]).map((k) => (
                  <option key={k} value={k}>
                    {kategoriEtiketter[k]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium">Typ</span>
              <select
                value={form.typ}
                onChange={(e) =>
                  setForm({ ...form, typ: e.target.value as ArshjulHandelseTyp })
                }
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
              >
                <option value="engang">Engång (datum)</option>
                <option value="manatlig">Varje månad</option>
                <option value="arlig">Årligen (samma månad)</option>
                <option value="intervall">Intervall (t.ex. vart 6:e år)</option>
              </select>
            </label>

            {form.typ === "engang" && (
              <label className="block sm:col-span-2">
                <span className="text-sm font-medium">Datum</span>
                <input
                  type="date"
                  required
                  value={form.datum ?? ""}
                  onChange={(e) => setForm({ ...form, datum: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                />
              </label>
            )}

            {(form.typ === "arlig" || form.typ === "intervall") && (
              <label className="block">
                <span className="text-sm font-medium">Månad</span>
                <select
                  value={form.manad ?? 1}
                  onChange={(e) =>
                    setForm({ ...form, manad: Number(e.target.value) })
                  }
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                >
                  {manadsnamn.map((namn, i) => (
                    <option key={namn} value={i + 1}>
                      {namn}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {(form.typ === "arlig" ||
              form.typ === "intervall" ||
              form.typ === "manatlig") && (
              <>
                <label className="block">
                  <span className="text-sm font-medium">Veckodag (valfritt)</span>
                  <select
                    value={form.veckodag ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      setForm({
                        ...form,
                        veckodag: v
                          ? (Number(v) as Veckodag)
                          : undefined,
                        veckodagOrdinal: v
                          ? (form.veckodagOrdinal ?? 1)
                          : undefined,
                      });
                    }}
                    className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                  >
                    <option value="">Fast dag i månaden i stället</option>
                    {([1, 2, 3, 4, 5, 6, 7] as Veckodag[]).map((vd) => (
                      <option key={vd} value={vd}>
                        {veckodagsnamn[vd]}
                      </option>
                    ))}
                  </select>
                </label>
                {form.veckodag ? (
                  <label className="block">
                    <span className="text-sm font-medium">Vilken i månaden</span>
                    <select
                      value={form.veckodagOrdinal ?? 1}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          veckodagOrdinal: Number(e.target.value),
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                    >
                      <option value={1}>Första</option>
                      <option value={2}>Andra</option>
                      <option value={3}>Tredje</option>
                      <option value={4}>Fjärde</option>
                    </select>
                  </label>
                ) : (
                  <label className="block">
                    <span className="text-sm font-medium">Dag i månaden</span>
                    <input
                      type="number"
                      min={1}
                      max={28}
                      value={form.dag ?? 1}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          dag: Number(e.target.value) || 1,
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                    />
                  </label>
                )}
              </>
            )}

            {form.typ === "intervall" && (
              <>
                <label className="block">
                  <span className="text-sm font-medium">Första / nästa år</span>
                  <input
                    type="number"
                    min={innevarandeAr - 5}
                    max={innevarandeAr + 50}
                    value={form.startAr ?? innevarandeAr}
                    onChange={(e) =>
                      setForm({ ...form, startAr: Number(e.target.value) })
                    }
                    className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium">Intervall (år)</span>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={form.intervallAr ?? 1}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        intervallAr: Number(e.target.value) || 1,
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                  />
                  <span className="mt-1 block text-xs text-muted">
                    OVK bostäder 3–6 år · OVK butik 3 år · sotning{" "}
                    {SOTNING_FORESLAGET_INTERVALL_AR} år · energi/radon 10 år
                  </span>
                </label>
              </>
            )}

            {(form.typ === "manatlig" || form.typ === "arlig") && (
              <fieldset className="sm:col-span-2">
                <legend className="text-sm font-medium">
                  Hoppa över månader (t.ex. sommar)
                </legend>
                <p className="mt-1 text-xs text-muted">
                  Bocka ur månader utan möte — t.ex. juli och augusti.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {manadsnamn.map((namn, i) => {
                    const manad = i + 1;
                    const vald = (form.exkluderaManader ?? []).includes(manad);
                    return (
                      <button
                        key={namn}
                        type="button"
                        onClick={() => vaxlaExkluderaManad(manad)}
                        className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                          vald
                            ? "border-amber-400 bg-amber-50 text-amber-950"
                            : "border-border bg-white text-muted hover:border-primary/40"
                        }`}
                      >
                        {vald ? "× " : ""}
                        {namn.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  className="mt-2 text-xs font-medium text-primary-dark underline"
                  onClick={() =>
                    setForm({
                      ...form,
                      exkluderaManader: [...SOMMAR_EXKLUDERADE_MANADER],
                    })
                  }
                >
                  Föreslå sommaruppehåll (juli–aug)
                </button>
              </fieldset>
            )}

            <label className="block sm:col-span-2">
              <span className="text-sm font-medium">
                Påminnelse (dagar före) — kommaseparerat
              </span>
              <input
                value={form.paminnelseDagar.join(", ")}
                onChange={(e) => {
                  const dagar = e.target.value
                    .split(",")
                    .map((s) => Number.parseInt(s.trim(), 10))
                    .filter((n) => !Number.isNaN(n) && n > 0);
                  setForm({
                    ...form,
                    paminnelseDagar:
                      dagar.length > 0 ? dagar : [...STANDARD_PAMINNELSE_DAGAR],
                  });
                }}
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
              />
              <span className="mt-1 block text-xs text-muted">
                Standard: {STANDARD_PAMINNELSE_DAGAR.join(", ")} dagar
              </span>
            </label>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
            >
              {redigeraId ? "Spara ändringar" : "Lägg till"}
            </button>
            {redigeraId && (
              <button
                type="button"
                onClick={() => {
                  setRedigeraId(null);
                  setForm(skapaTomHandelse());
                  setSkapaOppen(false);
                }}
                className="rounded-lg border border-border px-4 py-2 text-sm text-muted"
              >
                Avbryt
              </button>
            )}
          </div>
        </form>
      </details>

      {vy === "arshjul" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm font-medium text-foreground">
              Visa år
              <select
                value={valtAr}
                onChange={(e) => setValtAr(Number(e.target.value))}
                className="ml-2 rounded-lg border border-border bg-white px-3 py-1.5 text-sm"
              >
                {Array.from({ length: 21 }, (_, i) => innevarandeAr - 2 + i).map((ar) => (
                  <option key={ar} value={ar}>
                    {ar}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="rounded-2xl border-2 border-primary/30 bg-[#eef6f0]/50 p-4 sm:p-6">
            <div className="mb-4 text-center">
              <p className="text-3xl font-bold text-primary-dark">{valtAr}</p>
              <p className="text-sm text-muted">
                Årshjul — {tillfallenAr.length} händelser detta år
              </p>
            </div>
            <div
              className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4"
              aria-label={`Årshjul ${valtAr}`}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((manad) => {
                const poster = perManad.get(manad) ?? [];
                return (
                  <div
                    key={manad}
                    className="flex min-h-[6rem] flex-col rounded-xl border border-border bg-white p-2.5 shadow-sm"
                  >
                    <p className="text-xs font-bold text-foreground">
                      {manadsnamn[manad - 1]}
                    </p>
                    <div className="mt-1.5 flex flex-1 flex-col gap-1 overflow-y-auto">
                      {poster.length === 0 ? (
                        <span className="text-[10px] text-muted/50">Inget inlagt</span>
                      ) : (
                        poster.map((t) => (
                          <TillfalleChip key={`${t.handelseId}-${t.ar}`} t={t} />
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <ul className="space-y-2">
            {handelser.map((h) => (
              <li
                key={h.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-white px-3 py-2 text-sm"
              >
                <span className={`rounded-full border px-2 py-0.5 text-xs ${kategoriFarger[h.kategori]}`}>
                  {kategoriEtiketter[h.kategori]}
                </span>
                <span className="min-w-0 flex-1 font-medium">{h.titel}</span>
                <span className="text-xs text-muted">{beskrivIntervall(h)}</span>
                <button
                  type="button"
                  onClick={() => startaRedigera(h)}
                  className="text-xs text-primary-dark hover:underline"
                >
                  Redigera
                </button>
                <button
                  type="button"
                  onClick={() => taBortHandelse(h.id)}
                  className="text-xs text-muted hover:text-red-700"
                >
                  Ta bort
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {vy === "tidslinje" && (
        <div className="space-y-4">
          <label className="text-sm font-medium">
            Visa fram till år
            <input
              type="number"
              min={innevarandeAr}
              max={innevarandeAr + 50}
              value={tidslinjeSlutAr}
              onChange={(e) => setTidslinjeSlutAr(Number(e.target.value))}
              className="ml-2 w-24 rounded-lg border border-border px-2 py-1 text-sm"
            />
          </label>
          <div className="space-y-4">
            {perArTidslinje.map(([ar, poster]) => (
              <div key={ar} className="rounded-xl border border-border bg-white p-4">
                <h3 className="text-lg font-bold text-foreground">{ar}</h3>
                <ul className="mt-3 space-y-2">
                  {poster.map((t) => (
                    <li
                      key={`${t.handelseId}-${t.datumIso}`}
                      className="flex flex-wrap items-center gap-2"
                    >
                      <span className="text-sm text-muted">{formatDatumKort(t.datumIso)}</span>
                      <TillfalleChip t={t} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {perArTidslinje.length === 0 && (
              <p className="text-sm text-muted">Inga händelser i vald period.</p>
            )}
          </div>
        </div>
      )}

      {vy === "paminnelser" && (
        <div className="space-y-3">
          {paminnelser.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
              Inga aktiva påminnelser de närmaste två åren. Lägg till händelser eller
              importera från underhållsplanen.
            </p>
          ) : (
            paminnelser.map((p) => (
              <div
                key={`${p.handelseId}-${p.tillfalleDatum}-${p.rubrik}`}
                className={`rounded-xl border px-4 py-3 ${
                  p.nivå === "kritisk"
                    ? "border-red-200 bg-red-50"
                    : p.nivå === "varning"
                      ? "border-amber-200 bg-amber-50"
                      : "border-primary/30 bg-[#eef6f0]"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-foreground">{p.rubrik}</p>
                    <p className="mt-1 text-sm text-muted">{p.text}</p>
                    <p className="mt-1 text-xs text-muted">
                      {formatDatumKort(p.tillfalleDatum)} ·{" "}
                      {kategoriEtiketter[p.kategori]}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => markeraKlar(p.handelseId)}
                    className="shrink-0 text-xs font-medium text-primary-dark hover:underline"
                  >
                    Markera klar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
