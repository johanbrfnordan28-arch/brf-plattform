"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { OppnaStangKnapp } from "@/components/OppnaStangKnapp";
import { sbaChecklistaSektioner } from "@/components/guider/sba-checklista";
import {
  beraknaSbaStatistik,
  lasSbaArbete,
  sbaProjektTypEtiketter,
  sparaSbaArbete,
  tomSbaArbete,
  type SbaArbeteState,
  type SbaProjektTyp,
} from "@/components/guider/sba-arbete-lager";

type SektionId =
  | "grund"
  | "utrustning"
  | "medlemsinfo"
  | "projekt"
  | "checklista"
  | "avvikelser"
  | "sammanfattning";

function Sektion({
  id,
  titel,
  sammanfattning,
  oppen,
  onVaxla,
  children,
}: {
  id: SektionId;
  titel: string;
  sammanfattning?: string;
  oppen: boolean;
  onVaxla: (id: SektionId) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-white">
      <div className="flex flex-wrap items-center gap-2 px-4 py-3">
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold text-foreground">{titel}</h4>
          {sammanfattning && (
            <p className="mt-0.5 text-xs text-muted">{sammanfattning}</p>
          )}
        </div>
        <OppnaStangKnapp
          oppen={oppen}
          onClick={() => onVaxla(id)}
          storlek="sm"
          ariaLabel={oppen ? `Stäng ${titel}` : `Öppna ${titel}`}
        />
      </div>
      {oppen && (
        <div className="space-y-4 border-t border-border px-4 pb-4 pt-3">
          {children}
        </div>
      )}
    </div>
  );
}

export function SbaArbeteForm() {
  const [state, setState] = useState<SbaArbeteState>(tomSbaArbete);
  const [hydrated, setHydrated] = useState(false);
  const skipFirstSave = useRef(true);
  const [oppnaSektioner, setOppnaSektioner] = useState<
    Record<string, boolean>
  >({
    grund: true,
    utrustning: false,
    "medlemsinfo": false,
    projekt: false,
    avvikelser: false,
    sammanfattning: true,
  });
  const [oppnaChecklista, setOppnaChecklista] = useState<Record<string, boolean>>(
    {},
  );

  useEffect(() => {
    setState(lasSbaArbete());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (skipFirstSave.current) {
      skipFirstSave.current = false;
      return;
    }
    sparaSbaArbete(state);
  }, [state, hydrated]);

  const statistik = useMemo(() => beraknaSbaStatistik(state), [state]);

  function uppdatera(partial: Partial<SbaArbeteState>) {
    setState((prev) => ({ ...prev, ...partial }));
  }

  function vaxlaSektion(id: SektionId) {
    setOppnaSektioner((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function vaxlaChecklistaSektion(sektionId: string) {
    setOppnaChecklista((prev) => ({
      ...prev,
      [sektionId]: !prev[sektionId],
    }));
  }

  function togglePunkt(punktId: string) {
    setState((prev) => ({
      ...prev,
      checklista: {
        ...prev.checklista,
        [punktId]: !prev.checklista[punktId],
      },
    }));
  }

  if (!hydrated) {
    return <p className="text-sm text-muted">Laddar SBA-formulär…</p>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-primary/25 bg-[#fafcfa] p-4 sm:p-5">
        <h3 className="text-lg font-semibold text-foreground">
          SBA — formulär för egenkontroll
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Systematiskt brandskyddsarbete är förbyggande — brandvarnare,
          brandsläckare, utrymning och skyltning kontrolleras årligen i
          gemensamma utrymmen. Medlemmarna ansvarar för brandvarnare i sin
          lägenhet; påminn minst en gång per år, gärna vid städdag och inför
          jul. Vid medlemmars och föreningens projekt ska brandskydd
          kommuniceras; större projekt kräver brandskyddsdokumentation från
          entreprenören.
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-white p-4 lg:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Status
          </p>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-2">
              <dt className="text-muted">Checklista</dt>
              <dd className="font-semibold text-primary-dark">
                {statistik.klara} / {statistik.totalt} ({statistik.procent} %)
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted">Senaste årliga kontroll</dt>
              <dd className="font-medium">
                {state.senastArligKontroll || "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted">Brandvarnare / släckare</dt>
              <dd className="font-medium">
                {state.antalBrandvarnare} / {state.antalBrandslackare}
              </dd>
            </div>
          </dl>
          {statistik.projektMeddelande && (
            <p
              className={`mt-3 rounded-lg px-3 py-2 text-xs leading-relaxed ${
                statistik.projektStatus === "ok"
                  ? "border border-primary/30 bg-[#eef6f0] text-primary-dark"
                  : statistik.projektStatus === "varning"
                    ? "border border-amber-200 bg-amber-50 text-amber-950"
                    : "text-muted"
              }`}
            >
              {statistik.projektMeddelande}
            </p>
          )}
          {!statistik.arligKontrollOk && (
            <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
              Ange datum för senaste årliga SBA-kontroll.
            </p>
          )}
        </div>

        <div className="space-y-3 lg:col-span-2">
          <Sektion
            id="grund"
            titel="Organisation och årlig kontroll"
            sammanfattning={
              state.ansvarig.trim()
                ? `Ansvarig: ${state.ansvarig}`
                : "Ansvarig och kontrolldatum"
            }
            oppen={Boolean(oppnaSektioner.grund)}
            onVaxla={vaxlaSektion}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm sm:col-span-2">
                <span className="font-medium text-foreground">
                  Ansvarig i styrelsen / fastighet
                </span>
                <input
                  value={state.ansvarig}
                  onChange={(e) => uppdatera({ ansvarig: e.target.value })}
                  placeholder="Namn och roll"
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-foreground">
                  Senaste årliga SBA-kontroll
                </span>
                <input
                  type="date"
                  value={state.senastArligKontroll}
                  onChange={(e) =>
                    uppdatera({ senastArligKontroll: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-foreground">
                  Nästa kontroll planerad
                </span>
                <input
                  type="date"
                  value={state.nastaKontrollPlanerad}
                  onChange={(e) =>
                    uppdatera({ nastaKontrollPlanerad: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                />
              </label>
            </div>
          </Sektion>

          <Sektion
            id="utrustning"
            titel="Brandvarnare och brandsläckare"
            sammanfattning={`${state.antalBrandvarnare} varnare · ${state.antalBrandslackare} släckare`}
            oppen={Boolean(oppnaSektioner.utrustning)}
            onVaxla={vaxlaSektion}
          >
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="block text-sm">
                <span className="font-medium text-foreground">Antal brandvarnare</span>
                <input
                  type="number"
                  min={0}
                  value={state.antalBrandvarnare || ""}
                  onChange={(e) =>
                    uppdatera({
                      antalBrandvarnare: Number(e.target.value) || 0,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-foreground">
                  Antal brandsläckare
                </span>
                <input
                  type="number"
                  min={0}
                  value={state.antalBrandslackare || ""}
                  onChange={(e) =>
                    uppdatera({
                      antalBrandslackare: Number(e.target.value) || 0,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-foreground">
                  Senaste batteribyte (år)
                </span>
                <input
                  value={state.senastBatteribyteAr}
                  onChange={(e) =>
                    uppdatera({ senastBatteribyteAr: e.target.value })
                  }
                  placeholder="T.ex. 2025"
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                />
              </label>
            </div>
            <p className="text-xs text-muted">
              Kontrollera årligen — byt batteri enligt tillverkarens anvisning och
              utöka antal brandvarnare vid behov efter ombyggnad.
            </p>
          </Sektion>

          <Sektion
            id="medlemsinfo"
            titel="Medlemmars eget ansvar och påminnelser"
            sammanfattning={
              state.senastMedlemsinfoStaddag || state.senastMedlemsinfoJul
                ? `Städdag: ${state.senastMedlemsinfoStaddag || "—"} · Jul: ${state.senastMedlemsinfoJul || "—"}`
                : "Brandvarnare i lägenheten — påminn minst 1 gång/år"
            }
            oppen={Boolean(oppnaSektioner.medlemsinfo)}
            onVaxla={vaxlaSektion}
          >
            <p className="text-sm leading-relaxed text-muted">
              Varje medlem ska kontrollera brandvarnare i sin lägenhet årligen.
              Frivilligt förebyggande — släckfilt, brandplan, fria vägar — är
              bra eftersom en brand påverkar grannar och hela föreningen.
              Påminn minst en gång per år, gärna två: vid städdag på sommaren
              och inför jul när brandrisken är förhöjd.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="font-medium text-foreground">
                  Senaste påminnelse — städdag / sommar
                </span>
                <input
                  type="date"
                  value={state.senastMedlemsinfoStaddag}
                  onChange={(e) =>
                    uppdatera({ senastMedlemsinfoStaddag: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-foreground">
                  Senaste påminnelse — inför jul
                </span>
                <input
                  type="date"
                  value={state.senastMedlemsinfoJul}
                  onChange={(e) =>
                    uppdatera({ senastMedlemsinfoJul: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                />
              </label>
            </div>
            <label className="block text-sm">
              <span className="font-medium text-foreground">
                Anteckning — hur medlemmarna informerats
              </span>
              <textarea
                value={state.medlemsinfoAnteckning}
                onChange={(e) =>
                  uppdatera({ medlemsinfoAnteckning: e.target.value })
                }
                rows={3}
                placeholder="T.ex. nyhetsbrev juni, anslag vid städdag, portalutskick december…"
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </label>
          </Sektion>

          <Sektion
            id="projekt"
            titel="Projekt och kommunikation"
            sammanfattning={sbaProjektTypEtiketter[state.projektTyp]}
            oppen={Boolean(oppnaSektioner.projekt)}
            onVaxla={vaxlaSektion}
          >
            <label className="block text-sm">
              <span className="font-medium text-foreground">Typ av pågående arbete</span>
              <select
                value={state.projektTyp}
                onChange={(e) =>
                  uppdatera({ projektTyp: e.target.value as SbaProjektTyp })
                }
                className="mt-1 w-full max-w-md rounded-lg border border-border px-3 py-2 text-sm"
              >
                {(Object.keys(sbaProjektTypEtiketter) as SbaProjektTyp[]).map(
                  (typ) => (
                    <option key={typ} value={typ}>
                      {sbaProjektTypEtiketter[typ]}
                    </option>
                  ),
                )}
              </select>
            </label>

            {state.projektTyp !== "inget" && (
              <label className="block text-sm">
                <span className="font-medium text-foreground">
                  Projekt / lägenhet (namn eller nr)
                </span>
                <input
                  value={state.projektNamn}
                  onChange={(e) => uppdatera({ projektNamn: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                />
              </label>
            )}

            {state.projektTyp === "medlem" && (
              <label className="block text-sm">
                <span className="font-medium text-foreground">
                  Enkel brandskyddsinformation till medlemmen
                </span>
                <textarea
                  value={state.medlemsRenoveringAnteckning}
                  onChange={(e) =>
                    uppdatera({ medlemsRenoveringAnteckning: e.target.value })
                  }
                  rows={3}
                  placeholder="Vad har medlemmen informerats om — brandceller, brandfarliga produkter, trapphus…"
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                />
              </label>
            )}

            {(state.projektTyp === "forening-mindre" ||
              state.projektTyp === "forening-storre") && (
              <>
                <label className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={state.entreprenorInformerad}
                    onChange={(e) =>
                      uppdatera({ entreprenorInformerad: e.target.checked })
                    }
                    className="mt-0.5 h-4 w-4 rounded border-border text-primary"
                  />
                  <span>
                    Entreprenören är informerad om brandskyddskrav{" "}
                    {state.projektTyp === "forening-storre"
                      ? "och brandskyddsdokumentation"
                      : "(utrymningsvägar, branddörrar)"}
                  </span>
                </label>
                {state.projektTyp === "forening-storre" && (
                  <label className="flex items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={state.dokumentationLevererad}
                      onChange={(e) =>
                        uppdatera({
                          dokumentationLevererad: e.target.checked,
                        })
                      }
                      className="mt-0.5 h-4 w-4 rounded border-border text-primary"
                    />
                    <span>
                      Brandskyddsdokumentation levererad — beskriver hur brand
                      förhindras och hur brandspridning minimeras
                    </span>
                  </label>
                )}
                <label className="block text-sm">
                  <span className="font-medium text-foreground">
                    Kommunikation till entreprenören (anteckning)
                  </span>
                  <textarea
                    value={state.projektKommunikation}
                    onChange={(e) =>
                      uppdatera({ projektKommunikation: e.target.value })
                    }
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                  />
                </label>
              </>
            )}
          </Sektion>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground">
              SBA-checklista — flera sektioner kan öppnas samtidigt
            </h4>
            {sbaChecklistaSektioner.map((sektion) => {
              const oppen = oppnaChecklista[sektion.id] ?? false;
              const antalKlara = sektion.punkter.filter(
                (p) => state.checklista[p.id],
              ).length;

              return (
                <div
                  key={sektion.id}
                  className="rounded-xl border border-border bg-white"
                >
                  <div className="flex flex-wrap items-center gap-2 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {sektion.etikett}
                      </p>
                      {sektion.beskrivning && (
                        <p className="text-xs text-muted">{sektion.beskrivning}</p>
                      )}
                      <p className="mt-0.5 text-xs text-muted">
                        {antalKlara} av {sektion.punkter.length} klara
                      </p>
                    </div>
                    <OppnaStangKnapp
                      oppen={oppen}
                      onClick={() => vaxlaChecklistaSektion(sektion.id)}
                      storlek="sm"
                      ariaLabel={
                        oppen
                          ? `Stäng ${sektion.etikett}`
                          : `Öppna ${sektion.etikett}`
                      }
                    />
                  </div>
                  {oppen && (
                    <ul className="space-y-2 border-t border-border px-4 pb-4 pt-2">
                      {sektion.punkter.map((punkt) => {
                        const klar = Boolean(state.checklista[punkt.id]);
                        return (
                          <li key={punkt.id}>
                            <label
                              className={`flex cursor-pointer gap-2 rounded-lg border px-3 py-2.5 text-sm leading-relaxed ${
                                klar
                                  ? "border-primary/30 bg-[#fafcfa]"
                                  : "border-border"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={klar}
                                onChange={() => togglePunkt(punkt.id)}
                                className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-primary"
                              />
                              <span>{punkt.text}</span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>

          <Sektion
            id="avvikelser"
            titel="Avvikelser och åtgärder"
            sammanfattning={
              state.avvikelser.trim() ? "Avvikelser noterade" : "Inga avvikelser"
            }
            oppen={Boolean(oppnaSektioner.avvikelser)}
            onVaxla={vaxlaSektion}
          >
            <label className="block text-sm">
              <span className="font-medium text-foreground">
                Avvikelser från kontroll
              </span>
              <textarea
                value={state.avvikelser}
                onChange={(e) => uppdatera({ avvikelser: e.target.value })}
                rows={4}
                placeholder="T.ex. blockerad utrymningsväg, utgången brandsläckare, saknad skylt…"
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </label>
          </Sektion>

          <Sektion
            id="sammanfattning"
            titel="Sammanställning till styrelsen"
            oppen={Boolean(oppnaSektioner.sammanfattning)}
            onVaxla={vaxlaSektion}
          >
            <div className="rounded-lg border border-border bg-[#fafcfa] p-4 text-sm leading-relaxed">
              <p>
                <strong>SBA — {state.ansvarig || "ansvarig ej angiven"}</strong>
              </p>
              <ul className="mt-3 list-disc space-y-1 pl-5">
                <li>
                  Senaste årliga kontroll:{" "}
                  {state.senastArligKontroll || "ej angiven"}
                </li>
                <li>
                  Checklista: {statistik.klara} av {statistik.totalt} punkter (
                  {statistik.procent} %)
                </li>
                <li>
                  Utrustning: {state.antalBrandvarnare} brandvarnare,{" "}
                  {state.antalBrandslackare} brandsläckare
                </li>
                {state.projektTyp !== "inget" && (
                  <li>
                    Pågående: {sbaProjektTypEtiketter[state.projektTyp]}
                    {state.projektNamn ? ` — ${state.projektNamn}` : ""}
                  </li>
                )}
                {(state.senastMedlemsinfoStaddag ||
                  state.senastMedlemsinfoJul) && (
                  <li>
                    Medlemsinfo: städdag{" "}
                    {state.senastMedlemsinfoStaddag || "—"}, jul{" "}
                    {state.senastMedlemsinfoJul || "—"}
                  </li>
                )}
                {state.avvikelser.trim() && (
                  <li>Avvikelser: {state.avvikelser.trim()}</li>
                )}
              </ul>
              <button
                type="button"
                onClick={() => {
                  const text = [
                    "SBA — sammanställning",
                    `Kontroll: ${state.senastArligKontroll || "—"}`,
                    `Checklista: ${statistik.klara}/${statistik.totalt}`,
                    `Brandvarnare: ${state.antalBrandvarnare}, brandsläckare: ${state.antalBrandslackare}`,
                    state.avvikelser.trim()
                      ? `Avvikelser: ${state.avvikelser.trim()}`
                      : "",
                  ]
                    .filter(Boolean)
                    .join("\n");
                  void navigator.clipboard.writeText(text);
                }}
                className="mt-4 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium hover:bg-muted/5"
              >
                Kopiera sammanfattning
              </button>
            </div>
          </Sektion>
        </div>
      </div>

      <p className="text-xs text-muted">
        Uppgifterna sparas automatiskt i webbläsaren. SBA är förbyggande — årlig
        kontroll av brandvarnare och släckutrustning i gemensamma utrymmen, plus
        medlemmarnas egen kontroll av brandvarnare i lägenheten. Påminn minst en
        gång per år, gärna vid städdag och inför jul. Vid större
        föreningsprojekt ska entreprenören lämna brandskyddsdokumentation.
      </p>
    </div>
  );
}
