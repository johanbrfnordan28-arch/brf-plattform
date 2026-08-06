"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { arGrundmallForening, lasAktivForeningId } from "@/lib/forening-registry";
import { DemoFilSparningNotis } from "@/components/DemoFilSparningNotis";
import {
  andraTillfalleDatum,
  arFlerarsIntervall,
  arMotesKategori,
  arshjulStorageKey,
  aterstallTillfalle,
  aterstallTillfalleKlar,
  behoverPlaneringsperiod,
  expanderaTillfallen,
  foreslagnMotesPunkter,
  foreslagnUnderkategorier,
  formatDatumKort,
  hamtaKoppladeAtgarderForMote,
  hamtaPaminnelser,
  handelseIntervallText,
  intervallAlternativ,
  intervallEtiketter,
  kategoriEtiketter,
  kategoriFarger,
  manaderEtikettKort,
  manadsnamn,
  markeraTillfalleKlar,
  normaliseraHandelse,
  nthVeckodagIManad,
  paminnelseDagarAlternativ,
  punkterManadsForval,
  sammanfattaArsPlanering,
  skapaHandelseId,
  skapaMotesPunktId,
  skapaOvkDubbelHandelser,
  skapaTomHandelse,
  STANDARD_PAMINNELSE_DAGAR,
  STANDARD_PLANERING_AR_FRAM,
  stallInTillfalle,
  taBortTillfallePermanent,
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

function skapaExempelHandelser(ar: number): ArshjulHandelse[] {
  return [
    normaliseraHandelse({
      id: "ex-styrelse",
      titel: "Styrelsemöte",
      beskrivning: "Ordinarie styrelsemöte — planerat för i år och kommande år.",
      kategori: "styrelsemote",
      intervall: "manadsvis_veckodag",
      veckodag: 1,
      veckodagOrdning: 2,
      undantagnaManader: [7, 8],
      planerasFranAr: ar,
      planerasTillAr: ar + STANDARD_PLANERING_AR_FRAM,
      motesPunkter: [
        {
          id: "ex-p1",
          text: "Ekonomi / budgetuppföljning",
          klar: false,
          manader: [1, 3, 5, 7, 8, 9, 10, 11, 12],
        },
        {
          id: "ex-p2",
          text: "Underhållsplan — uppföljning",
          klar: false,
          manader: [3, 6, 9, 12],
        },
      ],
      paminnelseDagar: [14, 7],
      klar: false,
      skapad: "demo",
      externKalla: "manuell",
    }),
    normaliseraHandelse({
      id: "ex-stamma",
      titel: "Årsstämma",
      beskrivning: "Kallelse, underlag och protokoll.",
      kategori: "stamma",
      intervall: "arlig",
      manad: 4,
      dag: 15,
      planerasFranAr: ar,
      planerasTillAr: ar + STANDARD_PLANERING_AR_FRAM,
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
      planerasFranAr: ar,
      planerasTillAr: ar + STANDARD_PLANERING_AR_FRAM,
      paminnelseDagar: [60, 30, 14],
      klar: false,
      skapad: "demo",
      externKalla: "manuell",
    }),
  ];
}

export function ArshjulModul() {
  const innevarandeAr = new Date().getFullYear();
  const [handelser, setHandelser] = useState<ArshjulHandelse[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [vy, setVy] = useState<Vy>("arshjul");
  const [valtAr, setValtAr] = useState(innevarandeAr);
  const kommandeAr = innevarandeAr + STANDARD_PLANERING_AR_FRAM;
  const [tidslinjeSlutAr, setTidslinjeSlutAr] = useState(kommandeAr);
  const [skapaOppen, setSkapaOppen] = useState(false);
  const [redigeraId, setRedigeraId] = useState<string | null>(null);
  const [form, setForm] = useState(skapaTomHandelse());
  const [importMeddelande, setImportMeddelande] = useState<string | null>(null);
  const [nyPunktText, setNyPunktText] = useState("");
  const [egenPunktLage, setEgenPunktLage] = useState(false);
  const [nyPunktManader, setNyPunktManader] = useState<number[]>([]);
  const [andrarDatumFor, setAndrarDatumFor] = useState<string | null>(null);
  const [ovkVerksamhetAr, setOvkVerksamhetAr] = useState(innevarandeAr);
  const [ovkBostadAr, setOvkBostadAr] = useState(innevarandeAr + 3);
  const [ovkKopplaTillId, setOvkKopplaTillId] = useState("");
  const skipFirstSave = useRef(true);

  const motesSerier = useMemo(
    () =>
      handelser.filter(
        (h) => arMotesKategori(h.kategori) && h.id !== redigeraId,
      ),
    [handelser, redigeraId],
  );

  useEffect(() => {
    const sparade = lasHandelser();
    if (sparade.length > 0) {
      setHandelser(sparade);
    } else if (arGrundmallForening(lasAktivForeningId())) {
      setHandelser(skapaExempelHandelser(new Date().getFullYear()));
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

  const planIAr = useMemo(
    () => sammanfattaArsPlanering(handelser, innevarandeAr),
    [handelser, innevarandeAr],
  );
  const planNastaAr = useMemo(
    () => sammanfattaArsPlanering(handelser, kommandeAr),
    [handelser, kommandeAr],
  );

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

  function aterstallKlar(
    id: string,
    datumIso?: string,
    planeratIso?: string,
  ) {
    const h = handelser.find((x) => x.id === id);
    if (!h) return;
    if (datumIso) {
      uppdateraHandelse(
        id,
        aterstallTillfalleKlar(h, datumIso, planeratIso ?? datumIso),
      );
      return;
    }
    uppdateraHandelse(id, { klar: false, senastKlarAr: undefined });
  }

  function stallInMote(id: string, datumIso: string, planeratIso?: string) {
    const h = handelser.find((x) => x.id === id);
    if (!h) return;
    // Spara planerat (och aktuellt om flyttat) så återställning fungerar.
    let nasta = stallInTillfalle(h, planeratIso ?? datumIso);
    if (planeratIso && planeratIso !== datumIso) {
      nasta = stallInTillfalle(nasta, datumIso);
    }
    uppdateraHandelse(id, nasta);
  }

  function aterstallMote(id: string, ...datumIsoLista: string[]) {
    const h = handelser.find((x) => x.id === id);
    if (!h) return;
    uppdateraHandelse(id, aterstallTillfalle(h, ...datumIsoLista));
  }

  function taBortMotePermanent(
    id: string,
    planeratIso: string,
    aktuelltIso?: string,
  ) {
    const h = handelser.find((x) => x.id === id);
    if (!h) return;
    const ok = window.confirm(
      "Ta bort mötet permanent? Det syns inte igen och kan inte återställas. Använd hellre ”Ställ in” om ni vill kunna öppna upp det igen.",
    );
    if (!ok) return;
    uppdateraHandelse(
      id,
      taBortTillfallePermanent(h, planeratIso, aktuelltIso),
    );
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
    const manader =
      nyPunktManader.length > 0 && nyPunktManader.length < 12
        ? [...nyPunktManader].sort((a, b) => a - b)
        : undefined;
    setForm({
      ...form,
      motesPunkter: [
        ...(form.motesPunkter ?? []),
        { id: skapaMotesPunktId(), text: t, klar: false, manader },
      ],
    });
    setNyPunktText("");
    setEgenPunktLage(false);
  }

  function setPunktManaderIForm(punktId: string, manader: number[]) {
    setForm({
      ...form,
      motesPunkter: (form.motesPunkter ?? []).map((p) =>
        p.id === punktId
          ? {
              ...p,
              manader:
                manader.length > 0 && manader.length < 12
                  ? [...manader].sort((a, b) => a - b)
                  : undefined,
            }
          : p,
      ),
    });
  }

  function toggleNyPunktManad(manad: number) {
    setNyPunktManader((nu) =>
      nu.includes(manad) ? nu.filter((m) => m !== manad) : [...nu, manad].sort((a, b) => a - b),
    );
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
    let planFran = form.planerasFranAr;
    let planTill = form.planerasTillAr;
    if (behoverPlaneringsperiod(form.intervall) || arMotesKategori(form.kategori)) {
      planFran = planFran ?? innevarandeAr;
      planTill = planTill ?? planFran + STANDARD_PLANERING_AR_FRAM;
      if (planTill < planFran) planTill = planFran;
    }
    const sparad = normaliseraHandelse({
      ...form,
      titel: form.titel.trim(),
      id: redigeraId ?? form.id ?? skapaHandelseId(),
      planerasFranAr: planFran,
      planerasTillAr: planTill,
      koppladTillHandelseId: form.koppladTillHandelseId || undefined,
      kopplaTillMotesAr: form.koppladTillHandelseId
        ? (form.kopplaTillMotesAr ?? innevarandeAr)
        : undefined,
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

  function skapaOvkDubbel() {
    const nya = skapaOvkDubbelHandelser({
      startArVerksamhet: ovkVerksamhetAr,
      startArBostader: ovkBostadAr,
      koppladTillHandelseId: ovkKopplaTillId || undefined,
      kopplaTillMotesAr: ovkKopplaTillId ? innevarandeAr : undefined,
    });
    setHandelser((current) => [...current, ...nya]);
    setImportMeddelande(
      ovkKopplaTillId
        ? "OVK verksamheter (3 år) och OVK bostäder (6 år) tillagda och kopplade till valt möte."
        : "OVK verksamheter (3 år) och OVK bostäder (6 år) tillagda. Koppla dem till styrelse-/byggmöte via Redigera om ni vill.",
    );
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
    if (t.installd) {
      return (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-1.5 text-xs text-amber-950">
          <p className="font-medium line-through opacity-80">{t.titel}</p>
          <p className="opacity-80">
            {t.dag} {manadsnamn[t.manad - 1]?.slice(0, 3)} · inställt
          </p>
          {h && (
            <div className="mt-1 flex flex-col gap-0.5">
              <button
                type="button"
                onClick={() => aterstallMote(h.id, planerat, t.datumIso)}
                className="text-left font-medium underline-offset-2 hover:underline"
              >
                Återställ som planerat
              </button>
              <button
                type="button"
                onClick={() => taBortMotePermanent(h.id, planerat, t.datumIso)}
                className="text-left text-red-800 underline-offset-2 hover:underline"
              >
                Ta bort permanent
              </button>
            </div>
          )}
        </div>
      );
    }
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
        {(t.punkterPaTillfalle ?? []).length > 0 && (
          <p className="mt-0.5 opacity-90">
            Punkter: {t.punkterPaTillfalle!.join(", ")}
          </p>
        )}
        {(t.koppladeAtgarder ?? []).length > 0 && (
          <p className="mt-0.5 opacity-90">
            Kopplat: {t.koppladeAtgarder!.join(", ")}
          </p>
        )}
        {h && t.arKlar && (
          <div className="mt-1 flex flex-col gap-0.5">
            <button
              type="button"
              onClick={() => aterstallKlar(h.id, t.datumIso, planerat)}
              className="text-left font-medium underline-offset-2 hover:underline"
            >
              Återställ (öppna igen)
            </button>
          </div>
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
              Ställ in möte
            </button>
            <button
              type="button"
              onClick={() => taBortMotePermanent(h.id, planerat, t.datumIso)}
              className="text-left text-red-800 underline-offset-2 hover:underline"
            >
              Ta bort permanent
            </button>
          </div>
        )}
      </div>
    );
  }

  if (!hydrated) {
    return <p className="text-sm text-muted">Laddar årshjul…</p>;
  }

  function PlanKort({
    ar,
    etikett,
    plan,
    aktiv,
  }: {
    ar: number;
    etikett: string;
    plan: ReturnType<typeof sammanfattaArsPlanering>;
    aktiv: boolean;
  }) {
    return (
      <button
        type="button"
        onClick={() => {
          setValtAr(ar);
          setVy("arshjul");
        }}
        className={`rounded-2xl border p-4 text-left transition ${
          aktiv
            ? "border-primary bg-[#eef6f0] shadow-sm"
            : "border-border bg-white hover:border-primary/40"
        }`}
      >
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          {etikett}
        </p>
        <p className="mt-1 text-2xl font-bold text-primary-dark">{ar}</p>
        <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-foreground">
          <div>
            <dt className="text-muted">Möten/händelser</dt>
            <dd className="font-semibold">{plan.tillfallen}</dd>
          </div>
          <div>
            <dt className="text-muted">Öppna punkter</dt>
            <dd className="font-semibold">{plan.oppnaPunkter}</dd>
          </div>
          <div>
            <dt className="text-muted">Kopplade åtgärder</dt>
            <dd className="font-semibold">{plan.koppladeAtgarder}</dd>
          </div>
          <div>
            <dt className="text-muted">Besiktningar</dt>
            <dd className="font-semibold">{plan.besiktningar}</dd>
          </div>
        </dl>
        {(plan.installda > 0 || plan.klara > 0) && (
          <p className="mt-2 text-[11px] text-muted">
            {plan.klara > 0 ? `${plan.klara} klara` : ""}
            {plan.klara > 0 && plan.installda > 0 ? " · " : ""}
            {plan.installda > 0 ? `${plan.installda} inställda` : ""}
          </p>
        )}
      </button>
    );
  }

  return (
    <div className="space-y-6">
      <div className="max-w-3xl space-y-2">
        <p className="text-sm leading-relaxed text-muted">
          Planera styrelsens arbete för <strong>i år</strong> och{" "}
          <strong>kommande år</strong>. Lägg in möten, punkter och besiktningar
          — koppla åtgärder till möten även innan datum är klara.
        </p>
        <DemoFilSparningNotis />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <PlanKort
          ar={innevarandeAr}
          etikett="Aktuellt år"
          plan={planIAr}
          aktiv={valtAr === innevarandeAr && vy === "arshjul"}
        />
        <PlanKort
          ar={kommandeAr}
          etikett="Kommande år"
          plan={planNastaAr}
          aktiv={valtAr === kommandeAr && vy === "arshjul"}
        />
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

      <details className="rounded-xl border border-border bg-white">
        <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-foreground [&::-webkit-details-marker]:hidden">
          Importera och snabbval (OVK m.m.)
        </summary>
        <div className="space-y-4 border-t border-border px-4 pb-4 pt-3">
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
              Importera från projekt
            </button>
          </div>
          <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-3">
            <p className="text-sm font-semibold text-sky-950">
              OVK med två intervaller
            </p>
            <p className="mt-1 text-xs text-sky-900/80">
              Verksamheter oftast vart 3:e år, bostäder vart 6:e år. Koppla till
              styrelsemöte för uppföljning i år eller nästa år.
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="block text-xs font-medium text-sky-950">
                Verksamheter — år
                <input
                  type="number"
                  min={innevarandeAr - 2}
                  max={innevarandeAr + 30}
                  value={ovkVerksamhetAr}
                  onChange={(e) => setOvkVerksamhetAr(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-sky-200 bg-white px-2 py-1.5 text-sm"
                />
              </label>
              <label className="block text-xs font-medium text-sky-950">
                Bostäder — år
                <input
                  type="number"
                  min={innevarandeAr - 2}
                  max={innevarandeAr + 30}
                  value={ovkBostadAr}
                  onChange={(e) => setOvkBostadAr(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-sky-200 bg-white px-2 py-1.5 text-sm"
                />
              </label>
              <label className="block text-xs font-medium text-sky-950 sm:col-span-2 lg:col-span-1">
                Koppla till möte
                <select
                  value={ovkKopplaTillId}
                  onChange={(e) => setOvkKopplaTillId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-sky-200 bg-white px-2 py-1.5 text-sm"
                >
                  <option value="">Ingen koppling ännu</option>
                  {motesSerier.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.titel} ({kategoriEtiketter[m.kategori]})
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={skapaOvkDubbel}
                  className="w-full rounded-lg bg-sky-800 px-3 py-2 text-sm font-medium text-white hover:bg-sky-900"
                >
                  Lägg till båda OVK
                </button>
              </div>
            </div>
          </div>
        </div>
      </details>

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
            {redigeraId
              ? "Redigera händelse"
              : "+ Lägg till möte, besiktning eller punkt"}
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
                onChange={(e) => {
                  const kategori = e.target.value as ArshjulKategori;
                  if (arMotesKategori(kategori)) {
                    setForm({
                      ...form,
                      kategori,
                      intervall: behoverPlaneringsperiod(form.intervall)
                        ? form.intervall
                        : "manadsvis_veckodag",
                      planerasFranAr: form.planerasFranAr ?? innevarandeAr,
                      planerasTillAr:
                        form.planerasTillAr ??
                        innevarandeAr + STANDARD_PLANERING_AR_FRAM,
                      veckodag: form.veckodag ?? 1,
                      veckodagOrdning: form.veckodagOrdning ?? 1,
                    });
                    return;
                  }
                  setForm({ ...form, kategori });
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
                    ...(behoverPlaneringsperiod(intervall)
                      ? {
                          planerasFranAr: form.planerasFranAr ?? innevarandeAr,
                          planerasTillAr:
                            form.planerasTillAr ??
                            innevarandeAr + STANDARD_PLANERING_AR_FRAM,
                        }
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
                  {intervallEtiketter[form.intervall]} — t.ex. OVK verksamheter
                  vart 3:e år, OVK bostäder / radon vart 6–10:e år
                </span>
              </label>
            )}

            {(behoverPlaneringsperiod(form.intervall) ||
              form.intervall === "arlig" ||
              arMotesKategori(form.kategori)) && (
              <fieldset className="sm:col-span-2 rounded-xl border border-border bg-white p-3">
                <legend className="px-1 text-sm font-medium">
                  Planera för vilka år?
                </legend>
                <p className="text-xs text-muted">
                  Standard är i år + kommande år. Då får styrelsen en enkel
                  arbetsplan utan att möten fyller många år framåt.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(
                    [
                      ["i-ar-nasta", "I år + kommande", STANDARD_PLANERING_AR_FRAM],
                      ["bara-i-ar", "Bara i år", 0],
                      ["3-ar", "3 år", 2],
                    ] as const
                  ).map(([id, label, extra]) => {
                    const till = innevarandeAr + extra;
                    const vald =
                      (form.planerasFranAr ?? innevarandeAr) === innevarandeAr &&
                      (form.planerasTillAr ??
                        innevarandeAr + STANDARD_PLANERING_AR_FRAM) === till;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() =>
                          setForm({
                            ...form,
                            planerasFranAr: innevarandeAr,
                            planerasTillAr: till,
                          })
                        }
                        className={`rounded-full border px-3 py-1 text-xs ${
                          vald
                            ? "border-primary bg-[#eef6f0] font-medium text-primary-dark"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-medium">Från år</span>
                    <input
                      type="number"
                      min={innevarandeAr - 2}
                      max={innevarandeAr + 30}
                      value={form.planerasFranAr ?? innevarandeAr}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          planerasFranAr: Number(e.target.value),
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium">Till och med år</span>
                    <input
                      type="number"
                      min={innevarandeAr - 2}
                      max={innevarandeAr + 30}
                      value={
                        form.planerasTillAr ??
                        (form.planerasFranAr ?? innevarandeAr) +
                          STANDARD_PLANERING_AR_FRAM
                      }
                      onChange={(e) =>
                        setForm({
                          ...form,
                          planerasTillAr: Number(e.target.value),
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                    />
                  </label>
                </div>
              </fieldset>
            )}

            <div className="sm:col-span-2 rounded-xl border border-primary/25 bg-[#eef6f0]/60 p-3">
              <p className="text-sm font-medium text-foreground">
                Koppla till styrelse- eller byggmöte
              </p>
              <p className="mt-1 text-xs text-muted">
                Lägg in besiktning/åtgärd i början av året och koppla till möte —
                även om besiktningen är nästa år och mötesdatum ännu inte är
                fastställda. Punkten blir påminnelse på mötena när de läggs in.
              </p>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium">Mötes-serie</span>
                  <select
                    value={form.koppladTillHandelseId ?? ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        koppladTillHandelseId: e.target.value || undefined,
                        kopplaTillMotesAr: e.target.value
                          ? (form.kopplaTillMotesAr ?? innevarandeAr)
                          : undefined,
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                  >
                    <option value="">Ingen koppling</option>
                    {motesSerier.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.titel} ({kategoriEtiketter[m.kategori]})
                      </option>
                    ))}
                  </select>
                </label>
                {form.koppladTillHandelseId && (
                  <div className="block">
                    <span className="text-sm font-medium">
                      Tas upp på möten under
                    </span>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {(
                        [
                          [innevarandeAr, "I år"],
                          [kommandeAr, "Kommande år"],
                        ] as const
                      ).map(([ar, label]) => (
                        <button
                          key={ar}
                          type="button"
                          onClick={() =>
                            setForm({ ...form, kopplaTillMotesAr: ar })
                          }
                          className={`rounded-full border px-3 py-1.5 text-xs ${
                            (form.kopplaTillMotesAr ?? innevarandeAr) === ar
                              ? "border-primary bg-[#eef6f0] font-medium text-primary-dark"
                              : "border-border"
                          }`}
                        >
                          {label} ({ar})
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {motesSerier.length === 0 && (
                <p className="mt-2 text-xs text-amber-800">
                  Skapa först ett styrelse- eller byggmöte, sedan kan ni koppla
                  åtgärder hit.
                </p>
              )}
            </div>

            <div className="sm:col-span-2 rounded-xl border border-border bg-surface/40 p-3">
              <p className="text-sm font-medium text-foreground">
                Punkter / uppföljning — vilka möten?
              </p>
              <p className="mt-1 text-xs text-muted">
                Välj vilka månader en punkt ska tas upp. Exempel ekonomi: varannan
                månad i början, varje månad mot slutet. Tomt = varje möte tills
                klart.
              </p>
              <ul className="mt-2 space-y-2">
                {(form.motesPunkter ?? []).map((p) => (
                  <li
                    key={p.id}
                    className="rounded-lg border border-border bg-white px-2.5 py-2 text-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
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
                      <div className="flex items-center gap-2">
                        {p.klar && (
                          <button
                            type="button"
                            onClick={() => {
                              setForm({
                                ...form,
                                motesPunkter: (form.motesPunkter ?? []).map(
                                  (x) =>
                                    x.id === p.id ? { ...x, klar: false } : x,
                                ),
                              });
                            }}
                            className="text-xs font-medium text-primary-dark hover:underline"
                          >
                            Återställ
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => taBortPunktFranForm(p.id)}
                          className="text-xs text-muted hover:text-red-700"
                        >
                          Ta bort
                        </button>
                      </div>
                    </div>
                    <p className="mt-1 text-[11px] text-muted">
                      {manaderEtikettKort(p.manader)}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {punkterManadsForval.map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setPunktManaderIForm(p.id, f.manader)}
                          className="rounded-full border border-border px-2 py-0.5 text-[10px] hover:border-primary/40"
                          title={f.beskrivning}
                        >
                          {f.etikett}
                        </button>
                      ))}
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {manadsnamn.map((namn, i) => {
                        const manad = i + 1;
                        const vald =
                          !p.manader || p.manader.length === 0
                            ? true
                            : p.manader.includes(manad);
                        return (
                          <button
                            key={namn}
                            type="button"
                            onClick={() => {
                              const bas =
                                !p.manader || p.manader.length === 0
                                  ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
                                  : [...p.manader];
                              const nasta = bas.includes(manad)
                                ? bas.filter((m) => m !== manad)
                                : [...bas, manad];
                              setPunktManaderIForm(p.id, nasta);
                            }}
                            className={`rounded border px-1.5 py-0.5 text-[10px] ${
                              vald
                                ? "border-primary/40 bg-[#eef6f0] text-primary-dark"
                                : "border-border text-muted"
                            }`}
                          >
                            {namn.slice(0, 3)}
                          </button>
                        );
                      })}
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-3 space-y-2 rounded-lg border border-dashed border-border bg-white/70 p-2.5">
                <p className="text-xs font-medium text-foreground">
                  När ska nya punkter tas upp?
                </p>
                <div className="flex flex-wrap gap-1">
                  {punkterManadsForval.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setNyPunktManader(f.manader)}
                      className={`rounded-full border px-2 py-0.5 text-[10px] ${
                        (nyPunktManader.length === 0 && f.manader.length === 0) ||
                        (nyPunktManader.length === f.manader.length &&
                          f.manader.every((m) => nyPunktManader.includes(m)))
                          ? "border-primary bg-[#eef6f0] text-primary-dark"
                          : "border-border"
                      }`}
                      title={f.beskrivning}
                    >
                      {f.etikett}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1">
                  {manadsnamn.map((namn, i) => {
                    const manad = i + 1;
                    const vald =
                      nyPunktManader.length === 0 ||
                      nyPunktManader.includes(manad);
                    return (
                      <button
                        key={namn}
                        type="button"
                        onClick={() => {
                          if (nyPunktManader.length === 0) {
                            setNyPunktManader(
                              [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].filter(
                                (m) => m !== manad,
                              ),
                            );
                            return;
                          }
                          toggleNyPunktManad(manad);
                        }}
                        className={`rounded border px-1.5 py-0.5 text-[10px] ${
                          vald
                            ? "border-primary/40 bg-[#eef6f0] text-primary-dark"
                            : "border-border text-muted"
                        }`}
                      >
                        {namn.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
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
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-foreground">Visa år:</span>
            {(
              [
                [innevarandeAr, "I år"],
                [kommandeAr, "Kommande"],
              ] as const
            ).map(([ar, label]) => (
              <button
                key={ar}
                type="button"
                onClick={() => setValtAr(ar)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                  valtAr === ar
                    ? "bg-primary text-white"
                    : "border border-border bg-white text-muted"
                }`}
              >
                {label} ({ar})
              </button>
            ))}
            <select
              value={valtAr}
              onChange={(e) => setValtAr(Number(e.target.value))}
              className="rounded-lg border border-border bg-white px-2 py-1.5 text-sm"
              aria-label="Annat år"
            >
              {Array.from({ length: 8 }, (_, i) => innevarandeAr - 1 + i).map(
                (ar) => (
                  <option key={ar} value={ar}>
                    {ar}
                  </option>
                ),
              )}
            </select>
          </div>

          <div className="rounded-2xl border-2 border-primary/30 bg-[#eef6f0]/50 p-4 sm:p-6">
            <div className="mb-4 text-center">
              <p className="text-3xl font-bold text-primary-dark">{valtAr}</p>
              <p className="text-sm text-muted">
                {valtAr === innevarandeAr
                  ? "Aktuellt år"
                  : valtAr === kommandeAr
                    ? "Kommande år"
                    : "Årshjul"}{" "}
                — {tillfallenAr.filter((t) => !t.installd).length} planerade
                händelser
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
                  <ul className="mt-2 space-y-1.5 border-t border-border/60 pt-2">
                    {(h.motesPunkter ?? []).map((p) => (
                      <li key={p.id} className="text-xs">
                        <div className="flex flex-wrap items-center gap-2">
                          <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2">
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
                          </label>
                          {p.klar ? (
                            <button
                              type="button"
                              onClick={() => vaxlaPunkt(h.id, p.id)}
                              className="font-medium text-primary-dark underline-offset-2 hover:underline"
                            >
                              Återställ
                            </button>
                          ) : (
                            <span className="text-muted">
                              {manaderEtikettKort(p.manader)}
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                {arMotesKategori(h.kategori) &&
                  hamtaKoppladeAtgarderForMote(handelser, h.id, valtAr).length >
                    0 && (
                    <div className="mt-2 space-y-1 border-t border-primary/20 pt-2">
                      <p className="text-xs font-medium text-primary-dark">
                        Kopplade åtgärder {valtAr} (även utan mötesdatum)
                      </p>
                      <ul className="space-y-0.5 text-xs text-muted">
                        {hamtaKoppladeAtgarderForMote(
                          handelser,
                          h.id,
                          valtAr,
                        ).map((a) => (
                          <li key={a.id}>
                            {a.titel}
                            {a.underkategori ? ` · ${a.underkategori}` : ""}
                            {a.startAr ? ` · besiktning ${a.startAr}` : ""}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                {h.koppladTillHandelseId && (
                  <p className="mt-1.5 text-xs text-primary-dark">
                    Kopplad till möte:{" "}
                    {handelser.find((x) => x.id === h.koppladTillHandelseId)
                      ?.titel ?? "okänt"}
                    {h.kopplaTillMotesAr
                      ? ` · tas upp ${h.kopplaTillMotesAr}`
                      : ""}
                  </p>
                )}
                {(h.installdaDatum ?? []).length > 0 && (
                  <div className="mt-2 space-y-1.5 border-t border-amber-200/80 pt-2">
                    <p className="text-xs font-medium text-amber-900">
                      Inställda tillfällen (kan återställas)
                    </p>
                    <ul className="space-y-1">
                      {h.installdaDatum!.map((iso) => (
                        <li
                          key={iso}
                          className="flex flex-wrap items-center justify-between gap-2 text-xs text-amber-950"
                        >
                          <span>{formatDatumKort(iso)}</span>
                          <span className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => aterstallMote(h.id, iso)}
                              className="font-medium text-primary-dark underline-offset-2 hover:underline"
                            >
                              Återställ som planerat
                            </button>
                            <button
                              type="button"
                              onClick={() => taBortMotePermanent(h.id, iso)}
                              className="text-red-800 underline-offset-2 hover:underline"
                            >
                              Ta bort permanent
                            </button>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {(h.permanentBorttagnaDatum ?? []).length > 0 && (
                  <p className="mt-1.5 text-xs text-muted">
                    Permanent borttagna tillfällen:{" "}
                    {h.permanentBorttagnaDatum!.length}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {vy === "tidslinje" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">Visa:</span>
            {(
              [
                [kommandeAr, "I år + kommande"],
                [innevarandeAr + 5, "5 år"],
                [innevarandeAr + 15, "15 år (besiktningar)"],
              ] as const
            ).map(([slut, label]) => (
              <button
                key={slut}
                type="button"
                onClick={() => setTidslinjeSlutAr(slut)}
                className={`rounded-full border px-3 py-1 text-xs ${
                  tidslinjeSlutAr === slut
                    ? "border-primary bg-[#eef6f0] font-medium text-primary-dark"
                    : "border-border"
                }`}
              >
                {label}
              </button>
            ))}
            <label className="text-sm text-muted">
              Till år
              <input
                type="number"
                min={innevarandeAr}
                max={innevarandeAr + 50}
                value={tidslinjeSlutAr}
                onChange={(e) => setTidslinjeSlutAr(Number(e.target.value))}
                className="ml-2 w-24 rounded-lg border border-border px-2 py-1 text-sm"
              />
            </label>
          </div>
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
