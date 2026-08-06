"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { arGrundmallForening, lasAktivForeningId } from "@/lib/forening-registry";
import { DemoFilSparningNotis } from "@/components/DemoFilSparningNotis";
import {
  arFlerarsIntervall,
  arMotesHandelse,
  arshjulStorageKey,
  aterstallTillfalle,
  aterstallTillfalleKlar,
  behoverPlaneringsperiod,
  expanderaTillfallen,
  foreslagnMotesPunkter,
  formatDatumKort,
  grupperaHandelser,
  hamtaPaminnelser,
  handelseIntervallText,
  intervallAlternativ,
  intervallEtiketter,
  kategoriEtiketter,
  kategoriFarger,
  laggTillPunktForManad,
  manadsnamn,
  markeraTillfalleKlar,
  motesTypAlternativ,
  normaliseraHandelse,
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
import { safeSetLocalStorage } from "@/lib/localStorage";

type Vy = "arshjul" | "paminnelser";
type SnabbTyp = "mote" | "ovk" | "atgard";

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

function skapaExempel(ar: number): ArshjulHandelse[] {
  return [
    normaliseraHandelse({
      id: "ex-styrelse",
      titel: "Styrelsemöte",
      beskrivning: "Ordinarie styrelsemöte.",
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
          text: "Ekonomi",
          klar: false,
          manader: [1, 3, 5],
        },
      ],
      paminnelseDagar: [14, 7],
      klar: false,
      skapad: "demo",
      externKalla: "manuell",
    }),
  ];
}

export function ArshjulModul() {
  const innevarandeAr = new Date().getFullYear();
  const kommandeAr = innevarandeAr + STANDARD_PLANERING_AR_FRAM;
  const aktuellManad = new Date().getMonth() + 1;

  const [handelser, setHandelser] = useState<ArshjulHandelse[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [vy, setVy] = useState<Vy>("arshjul");
  const [valtAr, setValtAr] = useState(innevarandeAr);
  const [skapaOppen, setSkapaOppen] = useState(false);
  const [snabbTyp, setSnabbTyp] = useState<SnabbTyp>("mote");
  const [meddelande, setMeddelande] = useState<string | null>(null);

  // Mötesformulär
  const [motesTypId, setMotesTypId] = useState<string>("styrelsemote");
  const [motesTitel, setMotesTitel] = useState("Styrelsemöte");
  const [intervall, setIntervall] = useState<ArshjulIntervall>("manadsvis_veckodag");
  const [veckodag, setVeckodag] = useState<ArshjulVeckodag>(1);
  const [vecka, setVecka] = useState<ArshjulVeckodagOrdning>(2);
  const [manad, setManad] = useState(aktuellManad);
  const [dag, setDag] = useState(15);
  const [datum, setDatum] = useState(
    `${innevarandeAr}-${String(aktuellManad).padStart(2, "0")}-15`,
  );
  const [startAr, setStartAr] = useState(innevarandeAr);
  const [planFran, setPlanFran] = useState(innevarandeAr);
  const [planTill, setPlanTill] = useState(kommandeAr);
  const [hoppaSemester, setHoppaSemester] = useState(true);

  // OVK (en enhet)
  const [ovkVerksamhetAr, setOvkVerksamhetAr] = useState(innevarandeAr);
  const [ovkBostadAr, setOvkBostadAr] = useState(innevarandeAr + 3);

  // Övrig åtgärd
  const [ovrigtTitel, setOvrigtTitel] = useState("");
  const [ovrigtManad, setOvrigtManad] = useState(aktuellManad);

  // Agenda på möte/månad
  const [agendaMoteId, setAgendaMoteId] = useState<string | null>(null);
  const [agendaManad, setAgendaManad] = useState(aktuellManad);
  const [agendaText, setAgendaText] = useState("");

  const skipFirstSave = useRef(true);

  useEffect(() => {
    const sparade = lasHandelser();
    if (sparade.length > 0) setHandelser(sparade);
    else if (arGrundmallForening(lasAktivForeningId())) {
      setHandelser(skapaExempel(new Date().getFullYear()));
    } else setHandelser([]);
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

  const paminnelser = useMemo(() => {
    const till = new Date();
    till.setFullYear(till.getFullYear() + 2);
    return hamtaPaminnelser(handelser, new Date(), till);
  }, [handelser]);

  const perManad = useMemo(() => {
    const map = new Map<number, ArshjulTillfalle[]>();
    for (let m = 1; m <= 12; m++) map.set(m, []);
    for (const t of tillfallenAr) map.get(t.manad)?.push(t);
    return map;
  }, [tillfallenAr]);

  const moten = useMemo(
    () => handelser.filter((h) => arMotesHandelse(h)),
    [handelser],
  );

  function valjMotesTyp(id: string) {
    setMotesTypId(id);
    const typ = motesTypAlternativ.find((t) => t.id === id);
    if (!typ) return;
    if (id !== "eget") setMotesTitel(typ.etikett);
    else if (!motesTitel || motesTypAlternativ.some((t) => t.etikett === motesTitel)) {
      setMotesTitel("");
    }
    setIntervall(typ.standardIntervall);
    if (typ.standardManad) setManad(typ.standardManad);
    setHoppaSemester(Boolean(typ.hoppaSemester));
  }

  const grupper = useMemo(() => grupperaHandelser(handelser), [handelser]);

  function uppdatera(id: string, patch: Partial<ArshjulHandelse> | ArshjulHandelse) {
    setHandelser((cur) =>
      cur.map((h) =>
        h.id === id ? normaliseraHandelse({ ...h, ...patch }) : h,
      ),
    );
  }

  function taBort(id: string) {
    setHandelser((cur) => cur.filter((h) => h.id !== id));
    if (agendaMoteId === id) setAgendaMoteId(null);
  }

  function taBortGrupp(poster: ArshjulHandelse[]) {
    const ids = new Set(poster.map((p) => p.id));
    setHandelser((cur) => cur.filter((h) => !ids.has(h.id)));
  }

  function skapaMote() {
    const typ = motesTypAlternativ.find((t) => t.id === motesTypId);
    const titel =
      motesTypId === "eget"
        ? motesTitel.trim()
        : motesTitel.trim() || typ?.etikett || "Möte";
    if (!titel) {
      setMeddelande("Ange ett namn på mötet.");
      return;
    }
    const kategori: ArshjulKategori =
      motesTypId === "eget" ? "ovrigt" : (motesTypId as ArshjulKategori);

    const bas: Partial<ArshjulHandelse> = {
      titel,
      kategori,
      underkategori: motesTypId === "eget" ? "Möte" : undefined,
      intervall,
      paminnelseDagar: [90, 30, 14, 7],
      planerasFranAr: planFran,
      planerasTillAr: planTill,
      undantagnaManader:
        hoppaSemester && behoverPlaneringsperiod(intervall) ? [7, 8] : [],
    };

    if (intervall === "engang" || intervall === "veckovis") {
      bas.datum = datum;
    } else if (intervall === "manadsvis_veckodag") {
      bas.veckodag = veckodag;
      bas.veckodagOrdning = vecka;
    } else if (intervall === "manadsvis" || intervall === "kvartalsvis") {
      bas.manad = manad;
      bas.dag = dag;
    } else if (intervall === "arlig") {
      bas.manad = manad;
      bas.dag = dag;
    } else if (arFlerarsIntervall(intervall)) {
      bas.manad = manad;
      bas.dag = dag;
      bas.startAr = startAr;
    }

    const h = skapaTomHandelse(bas);
    setHandelser((cur) => [...cur, h]);
    setAgendaMoteId(h.id);
    setAgendaManad(aktuellManad);
    setSkapaOppen(false);
    setMeddelande(
      `${titel} tillagt med påminnelser. Välj månad och lägg till punkter vid behov.`,
    );
  }

  function skapaOvk() {
    const styrelse = moten[0];
    const nya = skapaOvkDubbelHandelser({
      startArVerksamhet: ovkVerksamhetAr,
      startArBostader: ovkBostadAr,
      koppladTillHandelseId: styrelse?.id,
      kopplaTillMotesAr: innevarandeAr,
    });
    setHandelser((cur) => [...cur, ...nya]);
    setSkapaOppen(false);
    setMeddelande(
      styrelse
        ? "OVK tillagd (verksamheter + bostäder) och kopplad till styrelsemöte."
        : "OVK tillagd (verksamheter + bostäder) som en enhet.",
    );
  }

  function skapaOvrigt() {
    const titel = ovrigtTitel.trim();
    if (!titel) return;
    const h = skapaTomHandelse({
      titel,
      kategori: "ovrigt",
      intervall: "engang",
      datum: `${valtAr}-${String(ovrigtManad).padStart(2, "0")}-15`,
      paminnelseDagar: [...STANDARD_PAMINNELSE_DAGAR],
    });
    setHandelser((cur) => [...cur, h]);
    setOvrigtTitel("");
    setSkapaOppen(false);
    setMeddelande(`${titel} tillagd.`);
  }

  function laggTillAgenda() {
    if (!agendaMoteId || !agendaText.trim()) return;
    const h = handelser.find((x) => x.id === agendaMoteId);
    if (!h) return;
    uppdatera(agendaMoteId, laggTillPunktForManad(h, agendaText, agendaManad));
    setAgendaText("");
    setMeddelande(
      `Punkt tillagd på ${manadsnamn[agendaManad - 1]} ${valtAr}.`,
    );
  }

  function TillfalleChip({ t }: { t: ArshjulTillfalle }) {
    const h = handelser.find((x) => x.id === t.handelseId);
    const planerat = t.planeratDatumIso ?? t.datumIso;
    if (t.installd) {
      return (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-1.5 text-xs">
          <p className="font-medium line-through opacity-70">{t.titel}</p>
          <p className="text-amber-900">Inställt</p>
          {h && (
            <button
              type="button"
              onClick={() =>
                uppdatera(h.id, aterstallTillfalle(h, planerat, t.datumIso))
              }
              className="mt-1 underline"
            >
              Återställ
            </button>
          )}
        </div>
      );
    }
    return (
      <div
        className={`rounded-lg border px-2 py-1.5 text-xs ${kategoriFarger[t.kategori]} ${
          t.arKlar ? "opacity-55" : ""
        }`}
      >
        <p className="font-medium">{t.titel}</p>
        <p>
          {t.dag} {manadsnamn[t.manad - 1]?.slice(0, 3)}
          {t.arKlar ? " · klart" : ""}
        </p>
        {(t.punkterPaTillfalle ?? []).length > 0 && (
          <p className="mt-0.5 opacity-90">
            {t.punkterPaTillfalle!.join(", ")}
          </p>
        )}
        {h && t.arKlar && (
          <button
            type="button"
            onClick={() =>
              uppdatera(
                h.id,
                aterstallTillfalleKlar(h, t.datumIso, planerat),
              )
            }
            className="mt-1 font-medium underline"
          >
            Återställ
          </button>
        )}
        {h && !t.arKlar && (
          <div className="mt-1 flex flex-col gap-0.5">
            {arMotesHandelse(h) && (
              <button
                type="button"
                onClick={() => {
                  setAgendaMoteId(h.id);
                  setAgendaManad(t.manad);
                }}
                className="text-left font-medium underline"
              >
                Lägg till punkt
              </button>
            )}
            <button
              type="button"
              onClick={() =>
                uppdatera(h.id, markeraTillfalleKlar(h, t.datumIso))
              }
              className="text-left underline"
            >
              Markera klart
            </button>
            <button
              type="button"
              onClick={() => {
                let n = stallInTillfalle(h, planerat);
                if (planerat !== t.datumIso) n = stallInTillfalle(n, t.datumIso);
                uppdatera(h.id, n);
              }}
              className="text-left underline"
            >
              Ställ in
            </button>
            <button
              type="button"
              onClick={() => {
                if (
                  !window.confirm(
                    "Ta bort mötet permanent? Det kan inte återställas.",
                  )
                ) {
                  return;
                }
                uppdatera(
                  h.id,
                  taBortTillfallePermanent(h, planerat, t.datumIso),
                );
              }}
              className="text-left text-red-800 underline"
            >
              Ta bort
            </button>
          </div>
        )}
      </div>
    );
  }

  if (!hydrated) {
    return <p className="text-sm text-muted">Laddar årshjul…</p>;
  }

  const aktivAgendaMote =
    handelser.find((h) => h.id === agendaMoteId) ?? moten[0] ?? null;

  return (
    <div className="space-y-5">
      <div className="max-w-2xl space-y-2">
        <p className="text-sm text-muted">
          Lägg till möten med intervall och påminnelser — styrelse, bygg,
          ekonomi, årsstämma m.m. Välj månad för punkter. OVK läggs som en enhet.
        </p>
        <DemoFilSparningNotis />
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            [innevarandeAr, "I år"],
            [kommandeAr, "Kommande"],
          ] as const
        ).map(([ar, label]) => (
          <button
            key={ar}
            type="button"
            onClick={() => {
              setValtAr(ar);
              setVy("arshjul");
            }}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              valtAr === ar && vy === "arshjul"
                ? "bg-primary text-white"
                : "border border-border bg-white text-muted"
            }`}
          >
            {label} ({ar})
          </button>
        ))}
        <button
          type="button"
          onClick={() => setVy("paminnelser")}
          className={`rounded-full px-4 py-2 text-sm font-medium ${
            vy === "paminnelser"
              ? "bg-primary text-white"
              : "border border-border bg-white text-muted"
          }`}
        >
          Påminnelser ({paminnelser.length})
        </button>
      </div>

      <details
        className="rounded-xl border border-primary/40 bg-[#eef6f0]"
        open={skapaOppen || undefined}
        onToggle={(e) => setSkapaOppen((e.target as HTMLDetailsElement).open)}
      >
        <summary className="cursor-pointer list-none px-4 py-3 font-semibold text-primary-dark [&::-webkit-details-marker]:hidden">
          + Lägg till
        </summary>
        <div className="space-y-4 border-t border-primary/20 px-4 pb-4 pt-3">
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["mote", "Möte"],
                ["ovk", "OVK"],
                ["atgard", "Åtgärd"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setSnabbTyp(id)}
                className={`rounded-full px-3 py-1.5 text-sm ${
                  snabbTyp === id
                    ? "bg-primary text-white"
                    : "border border-border bg-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {snabbTyp === "mote" && (
            <div className="space-y-3">
              <label className="block text-sm">
                Typ av möte
                <select
                  value={motesTypId}
                  onChange={(e) => valjMotesTyp(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                >
                  {motesTypAlternativ.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.etikett}
                    </option>
                  ))}
                </select>
              </label>

              {(motesTypId === "eget" ||
                motesTypId === "projekteringsmote" ||
                motesTypId === "upphandlingsmote") && (
                <label className="block text-sm">
                  Namn
                  <input
                    value={motesTitel}
                    onChange={(e) => setMotesTitel(e.target.value)}
                    placeholder="t.ex. Upphandlingsmöte fasad"
                    className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                  />
                </label>
              )}

              <label className="block text-sm">
                Intervall
                <select
                  value={intervall}
                  onChange={(e) =>
                    setIntervall(e.target.value as ArshjulIntervall)
                  }
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
                        setVecka(
                          Number(e.target.value) as ArshjulVeckodagOrdning,
                        )
                      }
                      className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                    >
                      {Object.entries(veckodagOrdningEtiketter).map(
                        ([v, etikett]) => (
                          <option key={v} value={v}>
                            {etikett}
                          </option>
                        ),
                      )}
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
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        ["i-nasta", "I år + kommande", 1],
                        ["bara", "Bara i år", 0],
                        ["3", "3 år", 2],
                      ] as const
                    ).map(([id, label, extra]) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => {
                          setPlanFran(innevarandeAr);
                          setPlanTill(innevarandeAr + extra);
                        }}
                        className="rounded-full border border-border px-3 py-1 text-xs hover:border-primary/50"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block text-sm">
                      Från år
                      <input
                        type="number"
                        value={planFran}
                        onChange={(e) => setPlanFran(Number(e.target.value))}
                        className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="block text-sm">
                      Till och med år
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
                    Hoppa över juli och augusti
                  </label>
                </>
              )}

              <p className="text-xs text-muted">
                Påminnelser skapas automatiskt (90, 30, 14 och 7 dagar före).
              </p>
              <button
                type="button"
                onClick={skapaMote}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
              >
                Lägg till möte
              </button>
            </div>
          )}

          {snabbTyp === "ovk" && (
            <div className="space-y-3">
              <p className="text-xs text-muted">
                OVK som en enhet: verksamheter (3 år) och bostäder (6 år).
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm">
                  Verksamheter — nästa år
                  <input
                    type="number"
                    value={ovkVerksamhetAr}
                    onChange={(e) => setOvkVerksamhetAr(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                  />
                </label>
                <label className="block text-sm">
                  Bostäder — nästa år
                  <input
                    type="number"
                    value={ovkBostadAr}
                    onChange={(e) => setOvkBostadAr(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={skapaOvk}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
              >
                Lägg till OVK
              </button>
            </div>
          )}

          {snabbTyp === "atgard" && (
            <div className="space-y-3">
              <label className="block text-sm">
                Titel
                <input
                  value={ovrigtTitel}
                  onChange={(e) => setOvrigtTitel(e.target.value)}
                  placeholder="t.ex. SBA, radon"
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm">
                Månad {valtAr}
                <select
                  value={ovrigtManad}
                  onChange={(e) => setOvrigtManad(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                >
                  {manadsnamn.map((n, i) => (
                    <option key={n} value={i + 1}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={skapaOvrigt}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
              >
                Lägg till åtgärd
              </button>
            </div>
          )}
        </div>
      </details>

      {meddelande && (
        <p className="rounded-lg border border-primary/30 bg-[#eef6f0] px-3 py-2 text-sm text-primary-dark">
          {meddelande}
        </p>
      )}

      {/* Agenda per månad på styrelsemöte */}
      {moten.length > 0 && vy === "arshjul" && (
        <div className="rounded-xl border border-border bg-white p-4">
          <p className="text-sm font-semibold text-foreground">
            Punkter på möte
          </p>
          <p className="mt-1 text-xs text-muted">
            Välj möte och månad — lägg till det som ska tas upp just då.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {moten.length > 1 && (
              <label className="block text-sm sm:col-span-1">
                Möte
                <select
                  value={aktivAgendaMote?.id ?? ""}
                  onChange={(e) => setAgendaMoteId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
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
                value={agendaManad}
                onChange={(e) => setAgendaManad(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
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
            <label className="block text-sm sm:col-span-2">
              Punkt att ta upp
              <div className="mt-1 flex gap-2">
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) setAgendaText(e.target.value);
                  }}
                  className="w-40 rounded-lg border border-border px-2 py-2 text-sm"
                >
                  <option value="">Välj …</option>
                  {foreslagnMotesPunkter.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <input
                  value={agendaText}
                  onChange={(e) => setAgendaText(e.target.value)}
                  placeholder="eller skriv egen"
                  className="min-w-0 flex-1 rounded-lg border border-border px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={laggTillAgenda}
                  disabled={!aktivAgendaMote || !agendaText.trim()}
                  className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white disabled:opacity-40"
                >
                  Lägg till
                </button>
              </div>
            </label>
          </div>
          {aktivAgendaMote && (
            <ul className="mt-3 space-y-1 border-t border-border pt-3 text-xs">
              {(aktivAgendaMote.motesPunkter ?? [])
                .filter(
                  (p) =>
                    !p.manader ||
                    p.manader.length === 0 ||
                    p.manader.includes(agendaManad),
                )
                .map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between gap-2"
                  >
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={p.klar}
                        onChange={() => {
                          const fresh = handelser.find(
                            (x) => x.id === aktivAgendaMote.id,
                          );
                          if (fresh) {
                            uppdatera(
                              fresh.id,
                              toggleMotesPunkt(fresh, p.id),
                            );
                          }
                        }}
                      />
                      <span className={p.klar ? "text-muted line-through" : ""}>
                        {p.text}
                      </span>
                      <span className="text-muted">
                        · {manadsnamn[agendaManad - 1]}
                      </span>
                    </label>
                    {p.klar && (
                      <button
                        type="button"
                        onClick={() => {
                          const fresh = handelser.find(
                            (x) => x.id === aktivAgendaMote.id,
                          );
                          if (fresh) {
                            uppdatera(
                              fresh.id,
                              toggleMotesPunkt(fresh, p.id),
                            );
                          }
                        }}
                        className="text-primary-dark underline"
                      >
                        Återställ
                      </button>
                    )}
                  </li>
                ))}
              {(aktivAgendaMote.motesPunkter ?? []).filter(
                (p) =>
                  !p.manader ||
                  p.manader.length === 0 ||
                  p.manader.includes(agendaManad),
              ).length === 0 && (
                <li className="text-muted">
                  Inga punkter för {manadsnamn[agendaManad - 1]} ännu.
                </li>
              )}
            </ul>
          )}
        </div>
      )}

      {vy === "arshjul" && (
        <div className="space-y-4">
          <div className="rounded-2xl border-2 border-primary/30 bg-[#eef6f0]/40 p-4">
            <p className="mb-3 text-center text-2xl font-bold text-primary-dark">
              {valtAr}
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((manad) => {
                const poster = perManad.get(manad) ?? [];
                const arAktuell =
                  manad === aktuellManad && valtAr === innevarandeAr;
                return (
                  <div
                    key={manad}
                    className={`flex min-h-[5.5rem] flex-col rounded-xl border bg-white p-2.5 ${
                      arAktuell
                        ? "border-primary ring-1 ring-primary/30"
                        : "border-border"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setAgendaManad(manad);
                        if (moten[0]) setAgendaMoteId(moten[0].id);
                      }}
                      className="text-left text-xs font-bold text-foreground hover:text-primary-dark"
                    >
                      {manadsnamn[manad - 1]}
                      {arAktuell ? " · nu" : ""}
                    </button>
                    <div className="mt-1.5 flex flex-1 flex-col gap-1">
                      {poster.length === 0 ? (
                        <span className="text-[10px] text-muted/50">—</span>
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

          <ul className="space-y-2">
            {grupper.map(({ nyckel, poster }) => {
              const arOvk =
                poster.length > 1 ||
                Boolean(poster[0]?.gruppNyckel?.startsWith("ovk"));
              if (arOvk && poster.length >= 1) {
                return (
                  <li
                    key={nyckel}
                    className="rounded-lg border border-sky-200 bg-sky-50/50 px-3 py-3 text-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold text-sky-950">OVK</p>
                        <ul className="mt-1 space-y-0.5 text-xs text-sky-900">
                          {poster.map((p) => (
                            <li key={p.id}>
                              {p.underkategori ?? p.titel}
                              {" · "}
                              {handelseIntervallText(p)}
                              {p.startAr ? ` · nästa ${p.startAr}` : ""}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <button
                        type="button"
                        onClick={() => taBortGrupp(poster)}
                        className="text-xs text-muted hover:text-red-700"
                      >
                        Ta bort
                      </button>
                    </div>
                  </li>
                );
              }

              const h = poster[0];
              if (!h) return null;
              return (
                <li
                  key={h.id}
                  className="rounded-lg border border-border bg-white px-3 py-3 text-sm"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs ${kategoriFarger[h.kategori]}`}
                    >
                      {kategoriEtiketter[h.kategori]}
                    </span>
                    <span className="flex-1 font-medium">{h.titel}</span>
                    <span className="text-xs text-muted">
                      {handelseIntervallText(h)}
                    </span>
                    {arMotesHandelse(h) && (
                      <button
                        type="button"
                        onClick={() => {
                          setAgendaMoteId(h.id);
                          setAgendaManad(aktuellManad);
                        }}
                        className="text-xs text-primary-dark underline"
                      >
                        Punkter
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => taBort(h.id)}
                      className="text-xs text-muted hover:text-red-700"
                    >
                      Ta bort
                    </button>
                  </div>
                  {(h.motesPunkter ?? []).filter((p) => !p.klar).length > 0 && (
                    <p className="mt-1.5 text-xs text-muted">
                      Öppna punkter:{" "}
                      {(h.motesPunkter ?? [])
                        .filter((p) => !p.klar)
                        .map((p) => p.text)
                        .join(", ")}
                    </p>
                  )}
                </li>
              );
            })}
            {grupper.length === 0 && (
              <li className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
                Inget inlagt ännu. Börja med styrelsemöte.
              </li>
            )}
          </ul>
        </div>
      )}

      {vy === "paminnelser" && (
        <div className="space-y-3">
          {paminnelser.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
              Inga aktiva påminnelser just nu.
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
                <p className="font-semibold">{p.rubrik}</p>
                <p className="mt-1 text-sm text-muted">{p.text}</p>
                <p className="mt-1 text-xs text-muted">
                  {formatDatumKort(p.tillfalleDatum)} ·{" "}
                  {kategoriEtiketter[p.kategori]}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
