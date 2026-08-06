"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { arGrundmallForening, lasAktivForeningId } from "@/lib/forening-registry";
import { DemoFilSparningNotis } from "@/components/DemoFilSparningNotis";
import {
  andraTillfalleDatum,
  arFlerarsIntervall,
  arshjulStorageKey,
  expanderaTillfallen,
  foreslagnMotesPunkter,
  foreslagnUnderkategorier,
  formatDatumKort,
  hamtaPaminnelser,
  handelseIntervallText,
  intervallAlternativ,
  intervallEtiketter,
  kategoriEtiketter,
  kategoriFarger,
  manadsnamn,
  markeraTillfalleKlar,
  normaliseraHandelse,
  nthVeckodagIManad,
  paminnelseDagarAlternativ,
  skapaHandelseId,
  skapaMotesPunktId,
  skapaTomHandelse,
  STANDARD_PAMINNELSE_DAGAR,
  stallInTillfalle,
  toggleMotesPunkt,
  veckodagEtiketter,
  veckodagOrdningEtiketter,
  type ArshjulHandelse,
  type ArshjulIntervall,
  type ArshjulKategori,
  type ArshjulTillfalle,
  type ArshjulVeckodag,
  type ArshjulVeckodagOrdning,
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

const exempelHandelser: ArshjulHandelse[] = [
  normaliseraHandelse({
    id: "ex-stamma",
    titel: "Årsstämma",
    beskrivning: "Kallelse, underlag och protokoll.",
    kategori: "stamma",
    intervall: "arlig",
    manad: 4,
    dag: 15,
    paminnelseDagar: [90, 60, 30, 14],
    klar: false,
    skapad: "demo",
    externKalla: "manuell",
  }),
  normaliseraHandelse({
    id: "ex-bokslut",
    titel: "Bokslut & budget",
    beskrivning: "Ekonomisk plan och budget inför nästa år.",
    kategori: "ekonomi",
    intervall: "arlig",
    manad: 11,
    dag: 30,
    paminnelseDagar: [60, 30, 14],
    klar: false,
    skapad: "demo",
    externKalla: "manuell",
  }),
];

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
  const [nyPunktText, setNyPunktText] = useState("");
  const [egenPunktLage, setEgenPunktLage] = useState(false);
  const [andrarDatumFor, setAndrarDatumFor] = useState<string | null>(null);
  const skipFirstSave = useRef(true);

  useEffect(() => {
    const sparade = lasHandelser();
    if (sparade.length > 0) {
      setHandelser(sparade);
    } else if (arGrundmallForening(lasAktivForeningId())) {
      setHandelser(exempelHandelser);
    } else {
      setHandelser([]);
    }
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

  function markeraKlar(id: string, ar?: number, datumIso?: string) {
    const h = handelser.find((x) => x.id === id);
    if (!h) return;
    if (datumIso) {
      uppdateraHandelse(id, markeraTillfalleKlar(h, datumIso));
      return;
    }
    if (arFlerarsIntervall(h.intervall) && ar != null) {
      uppdateraHandelse(id, { senastKlarAr: ar, klar: false });
    } else {
      uppdateraHandelse(id, { klar: true });
    }
  }

  function stallInMote(id: string, datumIso: string, planeratIso?: string) {
    const h = handelser.find((x) => x.id === id);
    if (!h) return;
    // Ställ in både aktuellt och planerat så tillfället försvinner.
    let nasta = stallInTillfalle(h, datumIso);
    if (planeratIso && planeratIso !== datumIso) {
      nasta = stallInTillfalle(nasta, planeratIso);
    }
    uppdateraHandelse(id, nasta);
  }

  function flyttaMote(id: string, planeratIso: string, nyttIso: string) {
    const h = handelser.find((x) => x.id === id);
    if (!h) return;
    uppdateraHandelse(id, andraTillfalleDatum(h, planeratIso, nyttIso));
    setAndrarDatumFor(null);
  }

  function vaxlaPunkt(handelseId: string, punktId: string) {
    const h = handelser.find((x) => x.id === handelseId);
    if (!h) return;
    uppdateraHandelse(handelseId, toggleMotesPunkt(h, punktId));
  }

  function laggTillPunkt(text: string) {
    const t = text.trim();
    if (!t) return;
    if ((form.motesPunkter ?? []).some((p) => p.text === t)) return;
    setForm({
      ...form,
      motesPunkter: [
        ...(form.motesPunkter ?? []),
        { id: skapaMotesPunktId(), text: t, klar: false },
      ],
    });
    setNyPunktText("");
    setEgenPunktLage(false);
  }

  function laggTillPaminnelseDag(dagar: number) {
    if (!dagar || form.paminnelseDagar.includes(dagar)) return;
    setForm({
      ...form,
      paminnelseDagar: [...form.paminnelseDagar, dagar].sort((a, b) => b - a),
    });
  }

  function taBortPaminnelseDag(dagar: number) {
    const kvar = form.paminnelseDagar.filter((d) => d !== dagar);
    setForm({
      ...form,
      paminnelseDagar: kvar.length > 0 ? kvar : [...STANDARD_PAMINNELSE_DAGAR],
    });
  }

  function taBortPunktFranForm(punktId: string) {
    setForm({
      ...form,
      motesPunkter: (form.motesPunkter ?? []).filter((p) => p.id !== punktId),
    });
  }

  function toggleUndantagenManad(manad: number) {
    const nu = form.undantagnaManader ?? [];
    setForm({
      ...form,
      undantagnaManader: nu.includes(manad)
        ? nu.filter((m) => m !== manad)
        : [...nu, manad].sort((a, b) => a - b),
    });
  }

  const forhandsDatumManadsvis = useMemo(() => {
    if (form.intervall !== "manadsvis_veckodag" || !form.veckodag) return [];
    const ordning = form.veckodagOrdning ?? 1;
    const undantagna = new Set(form.undantagnaManader ?? []);
    const rader: string[] = [];
    for (let manad = 1; manad <= 12; manad++) {
      if (undantagna.has(manad)) continue;
      const dag = nthVeckodagIManad(valtAr, manad, form.veckodag, ordning);
      if (dag == null) continue;
      rader.push(`${manadsnamn[manad - 1]} ${dag}`);
    }
    return rader;
  }, [
    form.intervall,
    form.veckodag,
    form.veckodagOrdning,
    form.undantagnaManader,
    valtAr,
  ]);

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

  function TillfalleChip({ t }: { t: ArshjulTillfalle }) {
    const h = handelser.find((x) => x.id === t.handelseId);
    const planerat = t.planeratDatumIso ?? t.datumIso;
    const chipNyckel = `${t.handelseId}-${planerat}`;
    const visarAndraDatum = andrarDatumFor === chipNyckel;
    const flyttat = Boolean(t.planeratDatumIso && t.planeratDatumIso !== t.datumIso);
    return (
      <div
        className={`rounded-lg border px-2 py-1.5 text-xs ${kategoriFarger[t.kategori]} ${
          t.arKlar ? "opacity-60" : ""
        }`}
      >
        <p className="font-medium">{t.titel}</p>
        {h?.underkategori && <p className="opacity-75">{h.underkategori}</p>}
        <p className="opacity-80">
          {t.dag} {manadsnamn[t.manad - 1]?.slice(0, 3)}
          {flyttat ? " · ändrat" : ""}
          {t.arKlar ? " · klart" : ""}
        </p>
        {(t.oppnaPunkter ?? 0) > 0 && (
          <p className="mt-0.5 font-medium opacity-90">
            {t.oppnaPunkter} punkt{(t.oppnaPunkter ?? 0) === 1 ? "" : "er"} kvar
          </p>
        )}
        {h && !t.arKlar && (
          <div className="mt-1 flex flex-col gap-0.5">
            <button
              type="button"
              onClick={() => markeraKlar(h.id, t.ar, t.datumIso)}
              className="text-left underline-offset-2 hover:underline"
            >
              Markera klart
            </button>
            <button
              type="button"
              onClick={() =>
                setAndrarDatumFor(visarAndraDatum ? null : chipNyckel)
              }
              className="text-left underline-offset-2 hover:underline"
            >
              Ändra datum
            </button>
            {visarAndraDatum && (
              <input
                type="date"
                defaultValue={t.datumIso}
                onChange={(e) => {
                  if (e.target.value) {
                    flyttaMote(h.id, planerat, e.target.value);
                  }
                }}
                className="mt-0.5 w-full rounded border border-border bg-white px-1 py-0.5 text-[11px] text-foreground"
              />
            )}
            <button
              type="button"
              onClick={() => stallInMote(h.id, t.datumIso, planerat)}
              className="text-left underline-offset-2 hover:underline"
            >
              Ställ in / ta bort möte
            </button>
          </div>
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
          Lägg in årets möten och ärenden redan i januari — t.ex. styrelsemöte
          2:a veckan varje månad på måndag (hoppa över semester). Välj vecka och
          veckodag, ändra enskilda datum vid behov, lägg punkter via rullgardin
          och markera klart när det är gjort.
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
          onClick={importeraUnderhallsplan}
          className="rounded-lg border border-primary px-3 py-1.5 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
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
              <span className="text-sm font-medium">Underkategori</span>
              <input
                list="underkategori-lista"
                value={form.underkategori ?? ""}
                onChange={(e) =>
                  setForm({ ...form, underkategori: e.target.value || undefined })
                }
                placeholder="t.ex. OVK Besiktning, Styrelsemöte…"
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
              />
              <datalist id="underkategori-lista">
                {foreslagnUnderkategorier.map((u) => (
                  <option key={u} value={u} />
                ))}
              </datalist>
              <span className="mt-1 block text-xs text-muted">
                Välj från listan eller skriv ett eget namn
              </span>
            </label>
            <label className="block">
              <span className="text-sm font-medium">Intervall</span>
              <select
                value={form.intervall}
                onChange={(e) => {
                  const intervall = e.target.value as ArshjulIntervall;
                  setForm({
                    ...form,
                    intervall,
                    ...(intervall === "veckovis" || intervall === "engang"
                      ? {}
                      : {
                          manad: form.manad ?? 1,
                          dag: form.dag ?? 1,
                        }),
                    ...(intervall === "manadsvis_veckodag"
                      ? {
                          veckodag: form.veckodag ?? 1,
                          veckodagOrdning: form.veckodagOrdning ?? 1,
                        }
                      : {}),
                    ...(arFlerarsIntervall(intervall)
                      ? { startAr: form.startAr ?? innevarandeAr }
                      : {}),
                  });
                }}
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
              >
                {intervallAlternativ.map((i) => (
                  <option key={i} value={i}>
                    {intervallEtiketter[i]}
                  </option>
                ))}
              </select>
            </label>

            {(form.intervall === "engang" || form.intervall === "veckovis") && (
              <label className="block sm:col-span-2">
                <span className="text-sm font-medium">
                  {form.intervall === "veckovis"
                    ? "Startdatum (första tillfället)"
                    : "Datum"}
                </span>
                <input
                  type="date"
                  required
                  value={form.datum ?? ""}
                  onChange={(e) => setForm({ ...form, datum: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                />
              </label>
            )}

            {(form.intervall === "manadsvis" ||
              form.intervall === "manadsvis_veckodag" ||
              form.intervall === "kvartalsvis" ||
              form.intervall === "arlig" ||
              arFlerarsIntervall(form.intervall)) && (
              <>
                {form.intervall !== "manadsvis" &&
                  form.intervall !== "manadsvis_veckodag" && (
                  <label className="block">
                    <span className="text-sm font-medium">
                      {form.intervall === "kvartalsvis"
                        ? "Första månad i kvartalet"
                        : "Månad"}
                    </span>
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
                {form.intervall !== "manadsvis_veckodag" && (
                  <label className="block">
                    <span className="text-sm font-medium">Dag i månaden</span>
                    <input
                      type="number"
                      min={1}
                      max={28}
                      value={form.dag ?? 1}
                      onChange={(e) =>
                        setForm({ ...form, dag: Number(e.target.value) || 1 })
                      }
                      className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                    />
                  </label>
                )}
              </>
            )}

            {form.intervall === "manadsvis_veckodag" && (
              <>
                <label className="block">
                  <span className="text-sm font-medium">Vecka i månaden</span>
                  <select
                    value={form.veckodagOrdning ?? 1}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        veckodagOrdning: Number(
                          e.target.value,
                        ) as ArshjulVeckodagOrdning,
                      })
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
                <label className="block">
                  <span className="text-sm font-medium">Veckodag</span>
                  <select
                    value={form.veckodag ?? 1}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        veckodag: Number(e.target.value) as ArshjulVeckodag,
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                  >
                    {(
                      [1, 2, 3, 4, 5, 6, 7] as ArshjulVeckodag[]
                    ).map((d) => (
                        <option key={d} value={d}>
                          {veckodagEtiketter[d]}
                        </option>
                      ))}
                  </select>
                  <span className="mt-1 block text-xs text-muted">
                    Exempel: 2:a veckan + måndag. Ändra här när mönstret ska
                    uppdateras — sparade tillfällen följer med.
                  </span>
                </label>
                {forhandsDatumManadsvis.length > 0 && (
                  <div className="sm:col-span-2 rounded-lg border border-border bg-white px-3 py-2 text-xs text-muted">
                    <p className="font-medium text-foreground">
                      Datum {valtAr} (kan ändras per möte i årshjulet)
                    </p>
                    <p className="mt-1 leading-relaxed">
                      {forhandsDatumManadsvis.join(" · ")}
                    </p>
                  </div>
                )}
              </>
            )}

            {(form.intervall === "manadsvis" ||
              form.intervall === "manadsvis_veckodag" ||
              form.intervall === "kvartalsvis") && (
              <fieldset className="sm:col-span-2">
                <legend className="text-sm font-medium">
                  Hoppa över månader (semester m.m.)
                </legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {manadsnamn.map((namn, i) => {
                    const manad = i + 1;
                    const vald = (form.undantagnaManader ?? []).includes(manad);
                    return (
                      <button
                        key={namn}
                        type="button"
                        onClick={() => toggleUndantagenManad(manad)}
                        className={`rounded-full border px-2.5 py-1 text-xs ${
                          vald
                            ? "border-amber-300 bg-amber-50 text-amber-900"
                            : "border-border bg-white text-muted"
                        }`}
                      >
                        {namn.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-1 text-xs text-muted">
                  Markera t.ex. juli och augusti om möten inte hålls under semestern.
                  Enskilda möten kan ni också ställa in manuellt i årshjulet.
                </p>
              </fieldset>
            )}

            {arFlerarsIntervall(form.intervall) && (
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
                <span className="mt-1 block text-xs text-muted">
                  {intervallEtiketter[form.intervall]} — t.ex. OVK vart 6:e år,
                  radon vart 10:e år
                </span>
              </label>
            )}

            <div className="sm:col-span-2 rounded-xl border border-border bg-surface/40 p-3">
              <p className="text-sm font-medium text-foreground">
                Punkter på mötet / ärenden under året
              </p>
              <p className="mt-1 text-xs text-muted">
                Lägg in t.ex. OVK, SBA eller budget redan i januari. Markera
                punkter som klara när de är hanterade — uppföljning kan läggas in
                senare.
              </p>
              <ul className="mt-2 space-y-1.5">
                {(form.motesPunkter ?? []).map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-border bg-white px-2.5 py-1.5 text-sm"
                  >
                    <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={p.klar}
                        onChange={() => {
                          setForm({
                            ...form,
                            motesPunkter: (form.motesPunkter ?? []).map((x) =>
                              x.id === p.id ? { ...x, klar: !x.klar } : x,
                            ),
                          });
                        }}
                        className="h-4 w-4 rounded border-border text-primary"
                      />
                      <span
                        className={
                          p.klar
                            ? "text-muted line-through"
                            : "text-foreground"
                        }
                      >
                        {p.text}
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => taBortPunktFranForm(p.id)}
                      className="text-xs text-muted hover:text-red-700"
                    >
                      Ta bort
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mt-2 space-y-2">
                <label className="block">
                  <span className="sr-only">Välj punkt</span>
                  <select
                    value=""
                    onChange={(e) => {
                      const v = e.target.value;
                      if (!v) return;
                      if (v === "__egen") {
                        setEgenPunktLage(true);
                        return;
                      }
                      laggTillPunkt(v);
                    }}
                    className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                  >
                    <option value="">Välj punkt att lägga till …</option>
                    {foreslagnMotesPunkter.map((u) => (
                      <option
                        key={u}
                        value={u}
                        disabled={(form.motesPunkter ?? []).some(
                          (p) => p.text === u,
                        )}
                      >
                        {u}
                      </option>
                    ))}
                    <option value="__egen">Annan punkt (skriv själv) …</option>
                  </select>
                </label>
                {egenPunktLage && (
                  <div className="flex flex-wrap gap-2">
                    <input
                      value={nyPunktText}
                      onChange={(e) => setNyPunktText(e.target.value)}
                      placeholder="Skriv egen punkt …"
                      className="min-w-[12rem] flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => laggTillPunkt(nyPunktText)}
                      className="rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium hover:border-primary/40"
                    >
                      Lägg till
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEgenPunktLage(false);
                        setNyPunktText("");
                      }}
                      className="rounded-lg px-3 py-2 text-sm text-muted hover:text-foreground"
                    >
                      Avbryt
                    </button>
                  </div>
                )}
              </div>
              {redigeraId && (form.motesPunkter ?? []).length > 0 && (
                <p className="mt-2 text-xs text-muted">
                  Tip: ni kan också bocka av punkter direkt i listan nedan efter
                  sparning.
                </p>
              )}
            </div>

            <div className="sm:col-span-2 rounded-xl border border-border bg-surface/40 p-3">
              <p className="text-sm font-medium text-foreground">Påminnelser</p>
              <p className="mt-1 text-xs text-muted">
                Välj hur många dagar före mötet/händelsen ni vill bli påminda.
                Öppna mötespunkter visas i påminnelsen.
              </p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {form.paminnelseDagar.map((d) => (
                  <li
                    key={d}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-2.5 py-1 text-xs"
                  >
                    <span>{d} dagar före</span>
                    <button
                      type="button"
                      onClick={() => taBortPaminnelseDag(d)}
                      className="text-muted hover:text-red-700"
                      aria-label={`Ta bort påminnelse ${d} dagar`}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
              <label className="mt-2 block">
                <span className="sr-only">Lägg till påminnelse</span>
                <select
                  value=""
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    if (n > 0) laggTillPaminnelseDag(n);
                  }}
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                >
                  <option value="">Lägg till påminnelse …</option>
                  {paminnelseDagarAlternativ.map((d) => (
                    <option
                      key={d}
                      value={d}
                      disabled={form.paminnelseDagar.includes(d)}
                    >
                      {d} dagar före
                    </option>
                  ))}
                </select>
              </label>
            </div>
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
                          <TillfalleChip
                            key={`${t.handelseId}-${t.datumIso}`}
                            t={t}
                          />
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <ul className="space-y-3">
            {handelser.map((h) => (
              <li
                key={h.id}
                className="rounded-lg border border-border bg-white px-3 py-3 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-xs ${kategoriFarger[h.kategori]}`}
                  >
                    {kategoriEtiketter[h.kategori]}
                  </span>
                  {h.underkategori && (
                    <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-xs text-muted">
                      {h.underkategori}
                    </span>
                  )}
                  <span className="min-w-0 flex-1 font-medium">{h.titel}</span>
                  <span className="text-xs text-muted">
                    {handelseIntervallText(h)}
                  </span>
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
                </div>
                {(h.motesPunkter ?? []).length > 0 && (
                  <ul className="mt-2 space-y-1 border-t border-border/60 pt-2">
                    {(h.motesPunkter ?? []).map((p) => (
                      <li key={p.id}>
                        <label className="flex cursor-pointer items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={p.klar}
                            onChange={() => vaxlaPunkt(h.id, p.id)}
                            className="h-3.5 w-3.5 rounded border-border text-primary"
                          />
                          <span
                            className={
                              p.klar
                                ? "text-muted line-through"
                                : "text-foreground"
                            }
                          >
                            {p.text}
                          </span>
                          <span className="text-muted">
                            {p.klar ? "— klart" : "— att hantera"}
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
                {(h.installdaDatum ?? []).length > 0 && (
                  <p className="mt-1.5 text-xs text-amber-800">
                    Inställda tillfällen: {h.installdaDatum!.length}
                  </p>
                )}
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
