"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { DemoFilSparningNotis } from "@/components/DemoFilSparningNotis";
import {
  ARSHJUL_PLANERING_AR,
  arSerieHandelse,
  arshjulStorageKey,
  byggSerieTillfallen,
  defaultSerieFalt,
  expanderaTillfallen,
  formatDatumKort,
  fyllPaStandardHandelser,
  sorteraHandelser,
  hamtaPaminnelser,
  kategoriEtiketter,
  kategoriFarger,
  manadsnamn,
  migreraArshjulHandelser,
  MOTESKEDJA_KATEGORIER,
  nastaOppnaSerieTillfalle,
  normaliseraHandelse,
  serieIntervallText,
  sattSerieMoteDatum,
  skapaHandelseId,
  skapaTomHandelse,
  SOMMAR_EXKLUDERADE_MANADER,
  SOTNING_FORESLAGET_INTERVALL_AR,
  STANDARD_PAMINNELSE_DAGAR,
  OVK_INTERVALL_VERKSAMHET_AR,
  taBortSerieMote,
  utokaSerie,
  veckodagsnamn,
  type ArshjulHandelse,
  type ArshjulHandelseTyp,
  type ArshjulKategori,
  type ArshjulTillfalle,
  type SerieIntervallEnhet,
  type Veckodag,
} from "@/components/arshjul/arshjul";
import {
  importeraFranProjekt,
  importeraFranUnderhallsplan,
} from "@/components/arshjul/arshjul-import";
import {
  arOvkIntervallHandelse,
  byggOvkHandelser,
  ovkDualFranHandelser,
  skapaDefaultOvkDual,
  type OvkDualConfig,
} from "@/components/arshjul/arshjul-ovk";
import { ArshjulHandelseDetalj } from "@/components/arshjul/ArshjulHandelseDetalj";
import { safeSetLocalStorage } from "@/lib/localStorage";

type Vy = "arshjul" | "tidslinje" | "paminnelser";

function lasHandelser(): ArshjulHandelse[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(arshjulStorageKey());
    return raw
      ? migreraArshjulHandelser(
          (JSON.parse(raw) as ArshjulHandelse[]).map(normaliseraHandelse),
        )
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
  if (h.typ === "intervall") {
    const ar = h.startAr ?? "?";
    const intervall = h.intervallAr ?? "?";
    if (h.utanFastDatum) {
      return `Planeras ${ar}, vart ${intervall}:e år (datum bestäms under året)`;
    }
    const manad = h.manad ? manadsnamn[h.manad - 1] : "—";
    return `Vart ${intervall}:e år från ${ar} (${manad})`;
  }
  if (h.typ === "serie") {
    const antal = h.serieAntal ?? 0;
    const forsta = h.serieDatum?.[0] ?? h.serieStartDatum;
    if (
      (h.kategori === "garantbesiktning" ||
        h.kategori === "besiktningEntreprenad") &&
      forsta
    ) {
      return antal > 1
        ? `${formatDatumKort(forsta)} · ${antal} möten`
        : formatDatumKort(forsta);
    }
    return `${serieIntervallText(h)} · ${antal} ${antal === 1 ? "möte" : "möten"}`;
  }
  return "—";
}

const TA_BORT_KLASS =
  "rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-red-700";

export function ArshjulModul() {
  const innevarandeAr = new Date().getFullYear();
  const [handelser, setHandelser] = useState<ArshjulHandelse[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [vy, setVy] = useState<Vy>("arshjul");
  const [valtAr, setValtAr] = useState(innevarandeAr);
  const [tidslinjeSlutAr, setTidslinjeSlutAr] = useState(
    innevarandeAr + ARSHJUL_PLANERING_AR,
  );
  const [skapaOppen, setSkapaOppen] = useState(false);
  const [redigeraId, setRedigeraId] = useState<string | null>(null);
  const [form, setForm] = useState(skapaTomHandelse());
  const [ovkDual, setOvkDual] = useState<OvkDualConfig>(() =>
    skapaDefaultOvkDual(innevarandeAr),
  );
  const [importMeddelande, setImportMeddelande] = useState<string | null>(null);
  const [oppenHandelseId, setOppenHandelseId] = useState<string | null>(null);
  const skipFirstSave = useRef(true);
  const formRef = useRef<HTMLDetailsElement>(null);

  function sparaHandelseDetalj(id: string, patch: Partial<ArshjulHandelse>) {
    setHandelser((current) =>
      current.map((h) =>
        h.id === id ? normaliseraHandelse({ ...h, ...patch }) : h,
      ),
    );
  }

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

  useEffect(() => {
    if (!hydrated || !skapaOppen || !redigeraId) return;
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [hydrated, skapaOppen, redigeraId]);

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
      // År från datumet — så engångs-/årshändelser hamnar rätt i tidslinjen.
      const arFranDatum = Number(t.datumIso.slice(0, 4));
      const ar = Number.isFinite(arFranDatum) ? arFranDatum : t.ar;
      const lista = map.get(ar) ?? [];
      lista.push({ ...t, ar });
      map.set(ar, lista);
    }
    return [...map.entries()].sort(([a], [b]) => a - b);
  }, [tillfallenTidslinje]);

  const handelserIOrdning = useMemo(
    () => sorteraHandelser(handelser),
    [handelser],
  );

  const arOvkDualForm = form.kategori === "ovk" && form.typ === "intervall";

  function stangForm() {
    setRedigeraId(null);
    setForm(skapaTomHandelse());
    setOvkDual(skapaDefaultOvkDual(innevarandeAr));
    setSkapaOppen(false);
  }

  function initOvkDualOmBehov(startAr?: number) {
    setOvkDual(skapaDefaultOvkDual(startAr ?? form.startAr ?? innevarandeAr));
  }

  function uppdateraHandelse(id: string, patch: Partial<ArshjulHandelse>) {
    setHandelser((current) =>
      current.map((h) => (h.id === id ? normaliseraHandelse({ ...h, ...patch }) : h)),
    );
  }

  function taBortHandelse(id: string) {
    const h = handelser.find((x) => x.id === id);
    const namn = h?.titel?.trim() || "händelsen";
    if (!window.confirm(`Ta bort «${namn}»? Möten i serien försvinner också.`)) {
      return;
    }
    setHandelser((current) => current.filter((x) => x.id !== id));
    if (redigeraId === id) setRedigeraId(null);
  }

  function andraMoteDatum(id: string, nummer: number, iso: string) {
    if (!iso) return;
    setHandelser((current) =>
      current.map((h) =>
        h.id === id ? sattSerieMoteDatum(h, nummer, iso) : h,
      ),
    );
  }

  function utokaHandelseSerie(id: string, extra = 1) {
    setHandelser((current) =>
      current.map((h) => (h.id === id ? utokaSerie(h, extra) : h)),
    );
  }

  function taBortMoteISerie(id: string, nummer: number, titel: string) {
    if (!window.confirm(`Ta bort ${titel} ur serien?`)) return;
    setHandelser((current) =>
      current.map((h) => (h.id === id ? taBortSerieMote(h, nummer) : h)),
    );
  }

  function markeraKlar(id: string, tillfalle?: { ar: number; datumIso: string }) {
    const h = handelser.find((x) => x.id === id);
    if (!h) return;

    if (h.typ === "engang") {
      uppdateraHandelse(id, { klar: true });
      return;
    }

    const valt =
      tillfalle ??
      (h.typ === "serie"
        ? nastaOppnaSerieTillfalle(h)
        : undefined);
    if (!valt?.datumIso) {
      if (h.typ === "manatlig" || h.typ === "arlig" || h.typ === "serie") return;
      uppdateraHandelse(id, { klar: true });
      return;
    }

    const datum = valt.datumIso.slice(0, 10);
    const klarDatum = [...new Set([...(h.klarDatum ?? []), datum])].sort();
    if (h.typ === "intervall") {
      uppdateraHandelse(id, {
        senastKlarAr: valt.ar,
        klarDatum,
        klar: false,
      });
      return;
    }

    uppdateraHandelse(id, { klarDatum, klar: false });
  }

  function vaxlaKlarTillfalle(
    id: string,
    tillfalle: { ar: number; datumIso: string; arKlar: boolean },
  ) {
    if (tillfalle.arKlar) {
      avmarkeraKlar(id, tillfalle.datumIso);
      return;
    }
    markeraKlar(id, { ar: tillfalle.ar, datumIso: tillfalle.datumIso });
  }

  function avmarkeraKlar(id: string, datumIso: string) {
    const h = handelser.find((x) => x.id === id);
    if (!h) return;
    const nyckel = datumIso.slice(0, 10);
    const klarDatum = (h.klarDatum ?? []).filter((d) => d.slice(0, 10) !== nyckel);
    const ar = Number(nyckel.slice(0, 4));
    const patch: Partial<ArshjulHandelse> = {
      klarDatum: klarDatum.length > 0 ? klarDatum : undefined,
      klar: h.typ === "engang" ? false : h.klar,
    };
    if (h.typ === "intervall" && h.senastKlarAr === ar) {
      const kvar = klarDatum
        .map((d) => Number(d.slice(0, 4)))
        .filter((y) => Number.isFinite(y));
      patch.senastKlarAr = kvar.length > 0 ? Math.max(...kvar) : undefined;
    }
    uppdateraHandelse(id, patch);
  }

  function sparaForm(event: React.FormEvent) {
    event.preventDefault();

    if (arOvkDualForm) {
      if (!ovkDual.bostadAktiv && !ovkDual.verksamhetAktiv) return;

      const { spara, taBortIds } = byggOvkHandelser({
        config: ovkDual,
        handelser,
        mall: {
          utanFastDatum: form.utanFastDatum ?? true,
          paminnelseDagar: form.paminnelseDagar,
          skapad: form.skapad || new Date().toLocaleDateString("sv-SE"),
          externKalla: form.externKalla,
          externId: form.externId,
        },
      });

      const sparaIds = new Set(spara.map((h) => h.id));
      let updated = handelser.filter(
        (h) => !taBortIds.includes(h.id) && !sparaIds.has(h.id),
      );

      if (redigeraId && !sparaIds.has(redigeraId)) {
        const redigera = handelser.find((h) => h.id === redigeraId);
        if (
          redigera &&
          arOvkIntervallHandelse(redigera) &&
          !taBortIds.includes(redigeraId)
        ) {
          updated = updated.filter((h) => h.id !== redigeraId);
        }
      }

      setHandelser([...updated, ...spara]);
      stangForm();
      return;
    }

    if (!form.titel.trim()) return;
    const original = redigeraId
      ? handelser.find((h) => h.id === redigeraId)
      : undefined;
    const startAndrat =
      original?.serieStartDatum !== form.serieStartDatum;
    const intervallAndrat =
      original?.serieIntervallVarje !== form.serieIntervallVarje ||
      original?.serieIntervallEnhet !== form.serieIntervallEnhet;
    const sparad = normaliseraHandelse({
      ...form,
      titel: form.titel.trim(),
      id: redigeraId ?? form.id ?? skapaHandelseId(),
      serieDatum:
        form.typ === "serie" && original && !startAndrat && !intervallAndrat
          ? original.serieDatum
          : undefined,
    });
    if (sparad.typ === "serie") {
      sparad.serieDatum = byggSerieTillfallen(sparad).map((t) => t.datumIso);
    }
    if (redigeraId) {
      setHandelser((current) =>
        current.map((h) => (h.id === redigeraId ? sparad : h)),
      );
      setRedigeraId(null);
    } else {
      setHandelser((current) => [...current, sparad]);
    }
    stangForm();
  }

  function startaRedigera(h: ArshjulHandelse) {
    setRedigeraId(h.id);
    if (h.kategori === "ovk" && h.typ === "intervall") {
      setOvkDual(ovkDualFranHandelser(handelser, h, innevarandeAr));
      setForm({
        ...h,
        titel: "OVK",
        kategori: "ovk",
        typ: "intervall",
      });
    } else {
      setForm({ ...h });
    }
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
      `${antal} kategorier tillagda. Varje del börjar med ett möte — lägg till fler när de behövs, så listan hålls kort.`,
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
    return (
      <div
        className={`rounded-lg border px-2 py-1.5 text-xs ${kategoriFarger[t.kategori]} ${
          t.arKlar ? "opacity-60" : ""
        }`}
      >
        <p className={`font-medium ${t.arKlar ? "line-through" : ""}`}>
          {t.titel}
        </p>
        {t.planerasUnderAr ? (
          <p className="opacity-80 italic">Planeras under {t.ar}</p>
        ) : t.dag > 1 ? (
          <p className="opacity-80">
            {t.dag} {manadsnamn[t.manad - 1]?.slice(0, 3)}
          </p>
        ) : null}
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
          Planen räcker {ARSHJUL_PLANERING_AR} år framåt. Standardkategorierna
          börjar med ett möte per del, så listan inte fylls med hela året på en
          gång. Lägg till fler möten på det första mötet och redigera datumet.
          Konstituerande möte är styrelsemötet efter årsstämman. Överlämningen
          byggs på under året.
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
          className="rounded-lg border border-primary bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-dark"
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
      {handelser.length === 0 && (
        <div className="rounded-xl border border-primary/30 bg-[#eef6f0] px-4 py-4">
          <p className="text-sm font-semibold text-primary-dark">
            Årshjulet är tomt
          </p>
          <p className="mt-1 text-sm text-foreground">
            Börja med standardkategorier. Varje del får ett möte — styrelsemöte,
            konstituerande möte, överlämning, stämma, OVK och möteskedjan. Fler
            möten lägger ni till i den del som behöver dem.
          </p>
          <button
            type="button"
            onClick={laggTillStandard}
            className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Lägg in standardkategorier
          </button>
        </div>
      )}
      {importMeddelande && (
        <p className="rounded-lg border border-primary/30 bg-[#eef6f0] px-3 py-2 text-sm text-primary-dark">
          {importMeddelande}
        </p>
      )}

      <details
        ref={formRef}
        className="scroll-mt-28 rounded-2xl border border-primary/40 bg-[#eef6f0]"
        open={skapaOppen}
      >
        <summary
          className="cursor-pointer list-none px-5 py-4 [&::-webkit-details-marker]:hidden"
          onClick={(e) => {
            e.preventDefault();
            if (skapaOppen) stangForm();
            else setSkapaOppen(true);
          }}
        >
          <span className="font-semibold text-primary-dark">
            {redigeraId ? "Redigera händelse" : "+ Lägg till påminnelse / händelse"}
          </span>
        </summary>
        <form onSubmit={sparaForm} className="space-y-4 border-t border-primary/20 px-5 pb-5 pt-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium">Titel</span>
              {arOvkDualForm ? (
                <p className="mt-1 rounded-lg border border-teal-200 bg-teal-50/60 px-3 py-2 text-sm text-teal-950">
                  Skapar/uppdaterar{" "}
                  <strong>OVK — bostäder</strong> och/eller{" "}
                  <strong>OVK — verksamhet</strong> som separata rader i
                  tidslinjen.
                </p>
              ) : (
                <input
                  required
                  value={form.titel}
                  onChange={(e) => setForm({ ...form, titel: e.target.value })}
                  placeholder="t.ex. OVK, Årsstämma, Radonmätning"
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                />
              )}
            </label>
            {!arOvkDualForm && (
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
            )}
            <label className="block">
              <span className="text-sm font-medium">Kategori</span>
              <select
                value={form.kategori}
                onChange={(e) => {
                  const kategori = e.target.value as ArshjulKategori;
                  let next = { ...form, kategori };
                  if (kategori === "ovk" && next.typ === "intervall") {
                    initOvkDualOmBehov();
                    next.titel = "OVK";
                    next.utanFastDatum = true;
                  }
                  if (MOTESKEDJA_KATEGORIER.includes(kategori) && !redigeraId) {
                    next = {
                      ...next,
                      ...defaultSerieFalt(kategori),
                      kategori,
                    };
                  }
                  setForm(next);
                }}
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
                onChange={(e) => {
                  const typ = e.target.value as ArshjulHandelseTyp;
                  let next = { ...form, typ };
                  if (next.kategori === "ovk" && typ === "intervall") {
                    initOvkDualOmBehov();
                    next.titel = "OVK";
                    next.utanFastDatum = true;
                  }
                  if (typ === "serie") {
                    next = {
                      ...next,
                      serieAntal: next.serieAntal ?? 1,
                      serieIntervallVarje: next.serieIntervallVarje ?? 2,
                      serieIntervallEnhet: next.serieIntervallEnhet ?? "vecka",
                      serieStartDatum:
                        next.serieStartDatum ??
                        new Date().toISOString().slice(0, 10),
                    };
                  }
                  setForm(next);
                }}
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
              >
                <option value="engang">Engång (datum)</option>
                <option value="serie">Möteserie (intervall + antal)</option>
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

            {form.typ === "serie" && (
              <>
                <label className="block">
                  <span className="text-sm font-medium">Första mötet</span>
                  <input
                    type="date"
                    required
                    value={form.serieStartDatum ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, serieStartDatum: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium">Antal möten</span>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={form.serieAntal ?? 1}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        serieAntal: Math.max(1, Number(e.target.value) || 1),
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                  />
                  <span className="mt-1 block text-xs text-muted">
                    Börjar med ett möte. Fler läggs till i kategorin efteråt.
                  </span>
                </label>
                <label className="block">
                  <span className="text-sm font-medium">Intervall</span>
                  <input
                    type="number"
                    min={1}
                    max={52}
                    value={form.serieIntervallVarje ?? 1}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        serieIntervallVarje: Math.max(
                          1,
                          Number(e.target.value) || 1,
                        ),
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium">Enhet</span>
                  <select
                    value={form.serieIntervallEnhet ?? "vecka"}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        serieIntervallEnhet: e.target.value as SerieIntervallEnhet,
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                  >
                    <option value="vecka">Vecka</option>
                    <option value="manad">Månad</option>
                  </select>
                </label>
              </>
            )}

            {(form.typ === "arlig" ||
              (form.typ === "intervall" && !form.utanFastDatum)) && (
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

            {(form.typ === "arlig" || form.typ === "manatlig") && (
              <label className="block">
                <span className="text-sm font-medium">Från år</span>
                <input
                  type="number"
                  min={innevarandeAr - 5}
                  max={innevarandeAr + 50}
                  value={form.startAr ?? innevarandeAr}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      startAr: Number(e.target.value) || innevarandeAr,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                />
                <span className="mt-1 block text-xs text-muted">
                  Första året händelsen ska synas (t.ex. 2027 för stämma nästa år).
                </span>
              </label>
            )}

            {(form.typ === "arlig" ||
              form.typ === "manatlig" ||
              form.typ === "serie" ||
              (form.typ === "intervall" && !form.utanFastDatum)) && (
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
                    <option value="">
                      {form.typ === "serie"
                        ? "Ingen fast veckodag"
                        : "Fast dag i månaden i stället"}
                    </option>
                    {([1, 2, 3, 4, 5, 6, 7] as Veckodag[]).map((vd) => (
                      <option key={vd} value={vd}>
                        {veckodagsnamn[vd]}
                      </option>
                    ))}
                  </select>
                </label>
                {form.typ === "serie" ? null : form.veckodag ? (
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

            {form.typ === "intervall" && !arOvkDualForm && (
              <>
                <label className="block sm:col-span-2">
                  <span className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={Boolean(form.utanFastDatum)}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          utanFastDatum: e.target.checked,
                          manad: e.target.checked ? undefined : form.manad ?? 1,
                        })
                      }
                      className="rounded border-border"
                    />
                    <span className="font-medium">
                      Planeras under året — datum bestäms senare
                    </span>
                  </span>
                  <span className="mt-1 block text-xs text-muted">
                    Visas i januari som påminnelse (t.ex. energideklaration).
                  </span>
                </label>
                <label className="block">
                  <span className="text-sm font-medium">Planerat / nästa år</span>
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
                    Sotning {SOTNING_FORESLAGET_INTERVALL_AR} år · energi 10 år ·
                    radon 10 år
                  </span>
                </label>
              </>
            )}

            {arOvkDualForm && (
              <div className="space-y-4 sm:col-span-2">
                <label className="block">
                  <span className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={Boolean(form.utanFastDatum ?? true)}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          utanFastDatum: e.target.checked,
                        })
                      }
                      className="rounded border-border"
                    />
                    <span className="font-medium">
                      Planeras under året — datum bestäms senare
                    </span>
                  </span>
                </label>
                <p className="rounded-lg border border-teal-200 bg-teal-50/60 px-3 py-2 text-sm text-teal-950">
                  En förening kan ha både bostäder och butiker/verksamhet. Bocka i
                  det som gäller — varje typ får eget intervall och startår i
                  tidslinjen. Börjar båda samma år syns båda då; därefter kommer
                  butiker oftare (vart 3:e år) medan bostäder följer 3- eller
                  6-årsintervallet.
                </p>

                <fieldset className="rounded-xl border border-border bg-white p-4">
                  <label className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={ovkDual.bostadAktiv}
                      onChange={(e) =>
                        setOvkDual((prev) => ({
                          ...prev,
                          bostadAktiv: e.target.checked,
                        }))
                      }
                      className="mt-1 rounded border-border"
                    />
                    <span>
                      <span className="block text-sm font-semibold text-foreground">
                        OVK bostäder
                      </span>
                      <span className="text-xs text-muted">
                        Flerbostadshus — 3 år (FT/FTX) eller 6 år (S/F/FX)
                      </span>
                    </span>
                  </label>
                  {ovkDual.bostadAktiv && (
                    <div className="mt-3 grid gap-3 sm:grid-cols-2 pl-6">
                      <div>
                        <span className="text-xs font-medium text-muted">
                          Intervall
                        </span>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {([6, 3] as const).map((ar) => (
                            <button
                              key={ar}
                              type="button"
                              onClick={() =>
                                setOvkDual((prev) => ({
                                  ...prev,
                                  bostadIntervallAr: ar,
                                }))
                              }
                              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                                ovkDual.bostadIntervallAr === ar
                                  ? "border-primary bg-primary text-white"
                                  : "border-border bg-white text-muted hover:border-primary/50"
                              }`}
                            >
                              {ar} år
                            </button>
                          ))}
                        </div>
                      </div>
                      <label className="block">
                        <span className="text-xs font-medium text-muted">
                          Planerat / nästa år
                        </span>
                        <input
                          type="number"
                          min={innevarandeAr - 5}
                          max={innevarandeAr + 50}
                          value={ovkDual.bostadStartAr}
                          onChange={(e) =>
                            setOvkDual((prev) => ({
                              ...prev,
                              bostadStartAr: Number(e.target.value) || innevarandeAr,
                            }))
                          }
                          className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                        />
                      </label>
                    </div>
                  )}
                </fieldset>

                <fieldset className="rounded-xl border border-border bg-white p-4">
                  <label className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={ovkDual.verksamhetAktiv}
                      onChange={(e) =>
                        setOvkDual((prev) => ({
                          ...prev,
                          verksamhetAktiv: e.target.checked,
                        }))
                      }
                      className="mt-1 rounded border-border"
                    />
                    <span>
                      <span className="block text-sm font-semibold text-foreground">
                        OVK verksamhet (butiker m.m.)
                      </span>
                      <span className="text-xs text-muted">
                        Alltid vart {OVK_INTERVALL_VERKSAMHET_AR}:e år
                      </span>
                    </span>
                  </label>
                  {ovkDual.verksamhetAktiv && (
                    <label className="mt-3 block pl-6">
                      <span className="text-xs font-medium text-muted">
                        Planerat / nästa år
                      </span>
                      <input
                        type="number"
                        min={innevarandeAr - 5}
                        max={innevarandeAr + 50}
                        value={ovkDual.verksamhetStartAr}
                        onChange={(e) =>
                          setOvkDual((prev) => ({
                            ...prev,
                            verksamhetStartAr:
                              Number(e.target.value) || innevarandeAr,
                          }))
                        }
                        className="mt-1 w-full max-w-xs rounded-lg border border-border bg-white px-3 py-2 text-sm"
                      />
                    </label>
                  )}
                </fieldset>
              </div>
            )}

            {(form.typ === "manatlig" ||
              form.typ === "arlig" ||
              form.typ === "serie") && (
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
                onClick={stangForm}
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
                {Array.from(
                  { length: ARSHJUL_PLANERING_AR + 3 },
                  (_, i) => innevarandeAr - 2 + i,
                ).map((ar) => (
                  <option key={ar} value={ar}>
                    {ar}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <ul className="space-y-3">
            {handelserIOrdning.map((h, index) => {
              const serie = arSerieHandelse(h);
              const moten = serie ? byggSerieTillfallen(h) : [];
              const visaStyrelseRubrik =
                h.kategori === "styrelsemote" &&
                handelserIOrdning[index - 1]?.kategori !== "styrelsemote";
              return (
                <Fragment key={h.id}>
                  {visaStyrelseRubrik && (
                    <li className="list-none px-1 pt-1 text-xs font-semibold uppercase tracking-wide text-primary-dark">
                      Styrelsemöten
                    </li>
                  )}
                <li
                  className="rounded-xl border border-border bg-white px-3 py-3 text-sm sm:px-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border px-2 py-0.5 text-xs ${kategoriFarger[h.kategori]}`}
                        >
                          {kategoriEtiketter[h.kategori]}
                        </span>
                        <span className="font-medium">{h.titel}</span>
                      </div>
                      <p className="text-xs text-muted">{beskrivIntervall(h)}</p>
                      {h.leverantor?.trim() ? (
                        <p className="text-xs text-foreground">
                          Ansvarig inom styrelsen: {h.leverantor.trim()}
                        </p>
                      ) : null}
                      {(h.attHantera?.length ?? 0) > 0 ? (
                        <p className="text-xs text-muted">
                          {h.attHantera?.length} saker att hantera
                        </p>
                      ) : null}
                      {h.bankid?.forberedd ? (
                        <p className="text-xs text-primary-dark">
                          Förberedd för BankID-godkännande
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setOppenHandelseId((id) => (id === h.id ? null : h.id))
                        }
                        className="rounded-lg bg-primary px-2.5 py-1.5 text-xs font-medium text-white hover:bg-primary-dark"
                        aria-expanded={oppenHandelseId === h.id}
                      >
                        {oppenHandelseId === h.id ? "Stäng" : "Öppna"}
                      </button>
                      <button
                        type="button"
                        onClick={() => startaRedigera(h)}
                        className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-primary-dark hover:border-primary/50"
                      >
                        Redigera
                      </button>
                      <button
                        type="button"
                        onClick={() => taBortHandelse(h.id)}
                        className={TA_BORT_KLASS}
                      >
                        Ta bort händelse
                      </button>
                    </div>
                  </div>

                  {oppenHandelseId === h.id && (
                    <ArshjulHandelseDetalj
                      handelse={h}
                      onSpara={(patch) => sparaHandelseDetalj(h.id, patch)}
                    />
                  )}

                  {serie && (
                    <div className="mt-3 space-y-2 border-t border-border/70 pt-3">
                      {moten.length === 0 ? (
                        <p className="text-xs text-muted">
                          Inga möten i kategorin ännu.
                        </p>
                      ) : (
                        <ul className="space-y-1.5">
                          {moten.map((t, index) => {
                            const arForsta = index === 0;
                            return (
                              <li
                                key={`${h.id}-${t.serieNummer}`}
                                className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#f7f9f8] px-2.5 py-1.5"
                              >
                                <span
                                  className={`min-w-0 ${t.arKlar ? "text-muted line-through" : "text-foreground"}`}
                                >
                                  {arForsta ? "Första mötet" : t.titel}
                                </span>
                                <input
                                  type="date"
                                  aria-label={`Datum för ${arForsta ? "första mötet" : t.titel}`}
                                  value={t.datumIso.slice(0, 10)}
                                  onChange={(e) =>
                                    andraMoteDatum(
                                      h.id,
                                      t.serieNummer ?? index + 1,
                                      e.target.value,
                                    )
                                  }
                                  className="rounded-lg border border-border bg-white px-2 py-1 text-xs"
                                />
                                <div className="flex flex-wrap items-center gap-1.5">
                                  {arForsta && (
                                    <button
                                      type="button"
                                      onClick={() => utokaHandelseSerie(h.id, 1)}
                                      className="rounded-lg border border-primary/40 bg-white px-2 py-1 text-xs font-medium text-primary-dark hover:bg-[#eef6f0]"
                                    >
                                      Lägg till möte
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      vaxlaKlarTillfalle(h.id, {
                                        ar: t.ar,
                                        datumIso: t.datumIso,
                                        arKlar: t.arKlar,
                                      })
                                    }
                                    className="rounded-lg border border-border bg-white px-2 py-1 text-xs font-medium text-primary-dark hover:border-primary/50"
                                  >
                                    {t.arKlar ? "Ångra" : "Markera klar"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      taBortMoteISerie(
                                        h.id,
                                        t.serieNummer ?? 0,
                                        arForsta ? "första mötet" : t.titel,
                                      )
                                    }
                                    className={TA_BORT_KLASS}
                                  >
                                    Ta bort möte
                                  </button>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  )}
                </li>
                </Fragment>
              );
            })}
          </ul>

          <div className="rounded-2xl border-2 border-primary/30 bg-[#eef6f0]/50 p-4 sm:p-6">
            <div className="mb-4 text-center">
              <p className="text-3xl font-bold text-primary-dark">{valtAr}</p>
              <p className="text-sm text-muted">
                Årshjul — {tillfallenAr.length} tillfällen detta år · planeras{" "}
                {ARSHJUL_PLANERING_AR} år framåt
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
                          <TillfalleChip key={`${t.handelseId}-${t.datumIso}`} t={t} />
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {vy === "tidslinje" && (
        <div className="space-y-4">
          <label className="text-sm font-medium">
            Visa fram till år
            <input
              type="number"
              min={innevarandeAr}
              max={innevarandeAr + ARSHJUL_PLANERING_AR}
              value={tidslinjeSlutAr}
              onChange={(e) => setTidslinjeSlutAr(Number(e.target.value))}
              className="ml-2 w-24 rounded-lg border border-border px-2 py-1 text-sm"
            />
            <span className="ml-2 text-xs font-normal text-muted">
              Standard {ARSHJUL_PLANERING_AR} år
            </span>
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
                    onClick={() =>
                      markeraKlar(p.handelseId, {
                        ar: Number(p.tillfalleDatum.slice(0, 4)),
                        datumIso: p.tillfalleDatum,
                      })
                    }
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
