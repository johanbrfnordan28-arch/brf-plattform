"use client";

import { useState } from "react";
import { OppnaStangKnapp } from "@/components/OppnaStangKnapp";
import {
  fasadSidorForHus,
  hamtaAktivaFasaderForHus,
  hamtaHusFasadRad,
  MAX_ANTAL_FASADER,
  normaliseraFastighetsYtor,
  sattHusFasadKvm,
  summeraFasadKvm,
  summeraTakKvm,
  synkaHusFranGrund,
  uppdateraHusAktivFasad,
  type FasadVaderstreckId,
} from "@/components/underhallsplan/fastighets-ytor";
import { FastighetsdelSammanstallning } from "@/components/underhallsplan/FastighetsdelSammanstallning";
import {
  FastighetsdelUnderkomponentDetalj,
  skaDoljaEnkelMattISteg2,
  steg2UnderdelArStortFormular,
} from "@/components/underhallsplan/FastighetsdelUnderkomponentDetalj";
import { hamtaByggnadAdresser } from "@/components/underhallsplan/grund-byggnad-adress";
import {
  fastighetsdelGrupper,
  foreslagnaKomponenter,
  hamtaKomponentMall,
  måttenhetEtiketter,
  skapaKomponentId,
  skapaTomKomponentDetalj,
  hamtaMattPartier,
  synkaKomponentDetaljMedMall,
  uppdateraMattPartier,
  type KomponentDetaljData,
  type Måttenhet,
  type UnderkomponentRad,
} from "@/components/underhallsplan/komponentregister";
import { UnderkomponentMattPartierPanel } from "@/components/underhallsplan/UnderkomponentMattPartierPanel";
import { PlanDelSektion } from "@/components/underhallsplan/GrunduppgifterDelSektion";
import type { Grunduppgifter } from "@/components/underhallsplan/types";

type FastighetsdelarStegProps = {
  activeComponents: string[];
  komponentDetaljer: Record<string, KomponentDetaljData>;
  grund: Grunduppgifter;
  onToggle: (namn: string) => void;
  onLaggTill: (namn: string) => void;
  onDetalj: (namn: string, data: KomponentDetaljData) => void;
  onGrundChange: (grund: Grunduppgifter) => void;
  onVidare: () => void;
  planStartAr: number;
  planLangdAr: number;
};

function talFranText(text: string | undefined): number {
  if (!text?.trim()) return 0;
  const n = Number.parseFloat(text.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function forslagFranGrund(
  namn: string,
  radId: string,
  grund: Grunduppgifter,
): string {
  const ytor = normaliseraFastighetsYtor(grund.fastighetsYtor);
  if (namn === "Tak" && radId === "takyta") {
    const kvm = summeraTakKvm(ytor);
    return kvm > 0 ? String(kvm) : "";
  }
  if (namn === "Fasad" && radId === "fasadmaterial") {
    const kvm = summeraFasadKvm(ytor);
    return kvm > 0 ? String(kvm) : "";
  }
  if (namn === "Stomme" && radId === "stomme") {
    const kvm = talFranText(grund.boarea);
    return kvm > 0 ? String(kvm) : "";
  }
  if (namn === "Mark och gård" && radId === "gard") {
    const kvm = talFranText(grund.tomtstorlek);
    return kvm > 0 ? String(kvm) : "";
  }
  return "";
}

export function FastighetsdelarSteg({
  activeComponents,
  komponentDetaljer,
  grund,
  onToggle,
  onLaggTill,
  onDetalj,
  onGrundChange,
  onVidare,
  planStartAr,
  planLangdAr,
}: FastighetsdelarStegProps) {
  const foreningsAdresser = hamtaByggnadAdresser(grund);
  const [oppen, setOppen] = useState<string | null>(null);
  const [nyDel, setNyDel] = useState("");
  const [valdDel, setValdDel] = useState("");
  const [nyUnder, setNyUnder] = useState<Record<string, string>>({});
  const [oppnaUnderdel, setOppnaUnderdel] = useState<Record<string, boolean>>(
    {},
  );

  function underdelKey(komponent: string, radId: string) {
    return `${komponent}:${radId}`;
  }

  function isUnderdelOppen(
    komponent: string,
    radId: string,
    detaljPanel?: ReturnType<
      typeof hamtaKomponentMall
    >["underkomponenter"][number]["detaljPanel"],
  ) {
    const key = underdelKey(komponent, radId);
    if (key in oppnaUnderdel) return oppnaUnderdel[key];
    return false;
  }

  function toggleUnderdel(
    komponent: string,
    radId: string,
    detaljPanel?: Parameters<typeof steg2UnderdelArStortFormular>[0],
  ) {
    const key = underdelKey(komponent, radId);
    setOppnaUnderdel((current) => {
      const wasOpen = key in current ? current[key] : false;
      return { ...current, [key]: !wasOpen };
    });
  }
  const kandaDelar = new Set<string>(
    fastighetsdelGrupper.flatMap((grupp) => grupp.komponenter),
  );
  const borttagnaStandard = foreslagnaKomponenter.filter(
    (namn) => !activeComponents.includes(namn),
  );
  const tillagdaDelar = activeComponents.filter((namn) => !kandaDelar.has(namn));
  const ytor = synkaHusFranGrund(
    normaliseraFastighetsYtor(grund.fastighetsYtor),
    grund,
  );

  function detaljFor(namn: string): KomponentDetaljData {
    const mall = hamtaKomponentMall(namn);
    const raw = komponentDetaljer[namn] ?? skapaTomKomponentDetalj(namn);
    return synkaKomponentDetaljMedMall(raw, mall);
  }

  function sparaDetalj(namn: string, data: KomponentDetaljData) {
    onDetalj(namn, data);
  }

  function uppdateraRad(
    namn: string,
    id: string,
    patch: Partial<UnderkomponentRad>,
  ) {
    const data = detaljFor(namn);
    sparaDetalj(namn, {
      ...data,
      underkomponenter: data.underkomponenter.map((rad) =>
        rad.id === id ? { ...rad, ...patch } : rad,
      ),
    });
  }

  function laggTillUnderdel(namn: string, etikett: string) {
    const text = etikett.trim();
    if (!text) return;
    const data = detaljFor(namn);
    const borttagen = data.underkomponenter.find(
      (rad) => rad.medIPlan === false && rad.etikett.toLowerCase() === text.toLowerCase(),
    );
    if (borttagen) {
      uppdateraRad(namn, borttagen.id, { medIPlan: true });
      return;
    }
    if (data.underkomponenter.some((rad) => rad.etikett.toLowerCase() === text.toLowerCase() && rad.medIPlan !== false)) {
      return;
    }
    sparaDetalj(namn, {
      ...data,
      underkomponenter: [
        ...data.underkomponenter,
        {
          id: skapaKomponentId("under"),
          etikett: text,
          aktiv: true,
          medIPlan: true,
          måttenhet: "antal",
          värde: "",
          ärEgen: true,
          underhallIntervallAr: "",
          avskrivningAr: "",
          underhallNastaAr: "",
          underhallKostnadKr: "",
        },
      ],
    });
  }

  function sattFasad(husId: string, id: FasadVaderstreckId, aktiv: boolean) {
    onGrundChange({
      ...grund,
      fastighetsYtor: uppdateraHusAktivFasad(ytor, husId, id, aktiv),
    });
  }

  function sattFasadYta(husId: string, id: FasadVaderstreckId, värde: string) {
    onGrundChange({
      ...grund,
      fastighetsYtor: sattHusFasadKvm(ytor, husId, id, värde),
    });
  }

  function laggTillDel() {
    const namn = (valdDel || nyDel).trim();
    if (!namn || activeComponents.includes(namn)) return;
    onLaggTill(namn);
    setNyDel("");
    setValdDel("");
    setOppen(namn);
  }

  function delKort(namn: string, egen: boolean) {
    const data = detaljFor(namn);
    const mall = hamtaKomponentMall(namn);
    const oppenDel = oppen === namn;
    const synliga = data.underkomponenter.filter((rad) => rad.medIPlan !== false);
    const dolda = data.underkomponenter.filter((rad) => rad.medIPlan === false);
    return (
      <li key={namn} className="rounded-xl border border-border bg-white">
        <div className="flex items-start justify-between gap-3 px-3 py-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">{namn}</p>
            <p className="mt-0.5 text-xs text-muted">
              {synliga.length}{" "}
              {synliga.length === 1 ? "underdel" : "underdelar"}
              {egen ? " · egen del" : ""} · med i hela planen
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onToggle(namn)}
              className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-medium text-red-800 hover:bg-red-50"
            >
              Ta bort
            </button>
            <OppnaStangKnapp
              oppen={oppenDel}
              storlek="sm"
              onClick={() => setOppen(oppenDel ? null : namn)}
              ariaLabel={oppenDel ? `Stäng ${namn}` : `Öppna ${namn}`}
            />
          </div>
        </div>
        {oppenDel && (
          <div className="space-y-3 border-t border-border px-4 py-3">
            {namn === "Fasad" && (
              <FasadSidor
                data={ytor}
                onFasad={sattFasad}
                onYta={sattFasadYta}
              />
            )}
            {synliga.length === 0 ? (
              <p className="text-sm text-muted">
                Inga underdelar kvar. Lägg till det som finns på huset.
              </p>
            ) : (
              <ul className="space-y-2">
                {synliga.map((rad) => {
                  const def = mall.underkomponenter.find(
                    (del) => del.id === rad.id,
                  );
                  const detaljPanel = def?.detaljPanel;
                  const doljEnkelMatt = skaDoljaEnkelMattISteg2(detaljPanel);
                  const forslag = forslagFranGrund(namn, rad.id, grund);
                  const hint =
                    def?.måttHint ?? "Ange antal, yta eller löpmeter.";
                  const data = detaljFor(namn);
                  const underdelOppen = isUnderdelOppen(
                    namn,
                    rad.id,
                    detaljPanel,
                  );
                  return (
                    <li
                      key={rad.id}
                      className="rounded-lg border border-border/80 bg-[#f7f9f8] px-2 py-2 sm:px-3"
                    >
                      <div className="flex flex-wrap items-start gap-2">
                        <OppnaStangKnapp
                          oppen={underdelOppen}
                          storlek="sm"
                          onClick={() =>
                            toggleUnderdel(namn, rad.id, detaljPanel)
                          }
                          ariaLabel={
                            underdelOppen
                              ? `Stäng ${rad.etikett}`
                              : `Öppna ${rad.etikett}`
                          }
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {rad.etikett}
                          </p>
                          <p className="text-xs text-muted">{hint}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            uppdateraRad(namn, rad.id, {
                              medIPlan: false,
                              aktiv: false,
                            })
                          }
                          className="rounded-lg border border-red-200 px-2 py-1 text-xs font-medium text-red-800 hover:bg-red-50"
                        >
                          Ta bort
                        </button>
                      </div>
                      {underdelOppen && !doljEnkelMatt && (
                        <div className="mt-2">
                          <label className="mb-2 block w-36 text-xs text-muted">
                            Enhet
                            <select
                              value={rad.måttenhet}
                              onChange={(e) => {
                                const måttenhet = e.target
                                  .value as Måttenhet;
                                const d = detaljFor(namn);
                                sparaDetalj(
                                  namn,
                                  uppdateraMattPartier(
                                    d,
                                    rad.id,
                                    hamtaMattPartier(d, rad.id, rad),
                                    måttenhet,
                                  ),
                                );
                              }}
                              className="mt-0.5 w-full rounded-lg border border-border bg-white px-2 py-1.5 text-sm"
                            >
                              {(
                                Object.keys(måttenhetEtiketter) as Måttenhet[]
                              ).map((key) => (
                                <option key={key} value={key}>
                                  {måttenhetEtiketter[key].etikett} (
                                  {måttenhetEtiketter[key].enhet})
                                </option>
                              ))}
                            </select>
                          </label>
                          <UnderkomponentMattPartierPanel
                            etikett={rad.etikett}
                            måttenhet={rad.måttenhet}
                            partier={hamtaMattPartier(data, rad.id, rad)}
                            onChange={(partier) =>
                              sparaDetalj(
                                namn,
                                uppdateraMattPartier(
                                  detaljFor(namn),
                                  rad.id,
                                  partier,
                                  rad.måttenhet,
                                ),
                              )
                            }
                          />
                        </div>
                      )}
                      {underdelOppen && detaljPanel && (
                        <FastighetsdelUnderkomponentDetalj
                          komponentNamn={namn}
                          rad={rad}
                          detaljPanel={detaljPanel}
                          data={data}
                          grund={grund}
                          foreningsAdresser={foreningsAdresser}
                          planStartAr={planStartAr}
                          planLangdAr={planLangdAr}
                          onChange={(next) => sparaDetalj(namn, next)}
                          onRadChange={(patch) =>
                            uppdateraRad(namn, rad.id, {
                              ...patch,
                              aktiv: true,
                            })
                          }
                        />
                      )}
                      {underdelOppen &&
                        !doljEnkelMatt &&
                        forslag &&
                        forslag !== rad.värde.trim() && (
                        <button
                          type="button"
                          onClick={() =>
                            uppdateraRad(namn, rad.id, {
                              värde: forslag,
                              måttenhet: "kvm",
                              aktiv: true,
                              medIPlan: true,
                            })
                          }
                          className="mt-2 text-xs font-medium text-primary-dark underline"
                        >
                          Hämta {forslag} m² från grunduppgifter
                        </button>
                        )}
                    </li>
                  );
                })}
              </ul>
            )}
            {dolda.length > 0 && (
              <div className="rounded-lg border border-dashed border-amber-300/80 bg-amber-50/50 px-3 py-3">
                <p className="text-xs font-semibold text-foreground">
                  Importera del till planen
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-muted">
                  Dessa underdelar är borttagna från planen. Importera tillbaka
                  om något tagits bort av misstag eller saknades från början.
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {dolda.map((rad) => (
                    <button
                      key={rad.id}
                      type="button"
                      onClick={() => {
                        uppdateraRad(namn, rad.id, {
                          medIPlan: true,
                          aktiv: true,
                        });
                        setOppnaUnderdel((current) => ({
                          ...current,
                          [underdelKey(namn, rad.id)]: true,
                        }));
                      }}
                      className="rounded-full border border-primary/40 bg-white px-2.5 py-1 text-xs font-medium text-primary-dark hover:bg-[#eef6f0]"
                    >
                      + Importera {rad.etikett}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <FastighetsdelSammanstallning
              komponentNamn={namn}
              data={detaljFor(namn)}
              grund={grund}
            />

            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <label className="min-w-0 flex-1 text-xs text-muted">
                Ny underdel
                <input
                  value={nyUnder[namn] ?? ""}
                  onChange={(e) =>
                    setNyUnder((current) => ({
                      ...current,
                      [namn]: e.target.value,
                    }))
                  }
                  placeholder="t.ex. Snörasskydd"
                  className="mt-1 w-full rounded-lg border border-border bg-white px-2 py-1.5 text-sm"
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  laggTillUnderdel(namn, nyUnder[namn] ?? "");
                  setNyUnder((current) => ({ ...current, [namn]: "" }));
                }}
                className="rounded-lg border border-primary px-3 py-1.5 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
              >
                Lägg till underdel
              </button>
            </div>
          </div>
        )}
      </li>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-muted">
        Här lägger du till alla huvudkomponenter som ska ingå i planen — tak,
        fasad, VVS, hiss och övriga delar. Ta bort det som inte finns på
        huset. För tak, balkonger, fönster, dörrar och fasad fyller du i
        material och mängder per del; enklare underdelar får antal, yta eller
        löpmeter (flera rader om det behövs). Kostnader för redan utförda
        entreprenader fyller du i steg 3.
      </p>
      {fastighetsdelGrupper.map((grupp) => {
        const delar = grupp.komponenter.filter((namn) =>
          activeComponents.includes(namn),
        );
        if (delar.length === 0) return null;
        return (
          <PlanDelSektion
            key={grupp.id}
            titel={grupp.titel}
            intro={`${delar.length} ${delar.length === 1 ? "komponent" : "komponenter"} — öppna och välj den del ni vill fylla i.`}
          >
            <ul className="space-y-2">
              {delar.map((namn) => delKort(namn, false))}
            </ul>
          </PlanDelSektion>
        );
      })}
      {tillagdaDelar.length > 0 && (
        <PlanDelSektion
          titel="Egna delar"
          intro="Komponenter ni lagt till utöver standardlistan."
        >
          <ul className="space-y-2">
            {tillagdaDelar.map((namn) => delKort(namn, true))}
          </ul>
        </PlanDelSektion>
      )}
      {activeComponents.length === 0 && (
        <p className="rounded-lg border border-dashed border-border bg-background px-4 py-3 text-sm text-muted">
          Inga delar kvar i planen. Lägg till det som finns på huset.
        </p>
      )}
      <div className="rounded-xl border border-dashed border-primary/30 bg-[#eef6f0]/50 px-3 py-3">
        <p className="text-sm font-medium text-foreground">Lägg till komponent</p>
        <p className="mt-1 text-xs text-muted">
          Alla delar som ska finnas i planen väljer ni här — borttagna
          standardkomponenter kan läggas till igen, eller skriv in en egen del.
          Underdelar som tagits bort inne i en komponent importeras via
          &quot;Importera del till planen&quot; när komponenten är öppen.
        </p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end">
          {borttagnaStandard.length > 0 && (
            <label className="min-w-0 flex-1 text-xs text-muted">
              Del
              <select
                value={valdDel}
                onChange={(e) => setValdDel(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-white px-2 py-1.5 text-sm"
              >
                <option value="">Välj del</option>
                {borttagnaStandard.map((namn) => (
                  <option key={namn} value={namn}>
                    {namn}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="min-w-0 flex-1 text-xs text-muted">
            Egen del
            <input
              value={nyDel}
              onChange={(e) => setNyDel(e.target.value)}
              placeholder="t.ex. Solceller"
              className="mt-1 w-full rounded-lg border border-border bg-white px-2 py-1.5 text-sm"
            />
          </label>
          <button
            type="button"
            onClick={laggTillDel}
            disabled={!valdDel.trim() && !nyDel.trim()}
            className="rounded-lg border border-primary px-3 py-1.5 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6] disabled:opacity-50"
          >
            Lägg till komponent
          </button>
        </div>
      </div>
      <button
        type="button"
        onClick={onVidare}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
      >
        Gå vidare till utförda arbeten
      </button>
    </div>
  );
}

function FasadSidor({
  data,
  onFasad,
  onYta,
}: {
  data: ReturnType<typeof synkaHusFranGrund>;
  onFasad: (husId: string, id: FasadVaderstreckId, aktiv: boolean) => void;
  onYta: (husId: string, id: FasadVaderstreckId, värde: string) => void;
}) {
  if (data.hus.length === 0) {
    return (
      <p className="text-xs text-muted">
        Lägg in byggnad och adress i grunduppgifterna, så kan fasaderna hämtas
        hit.
      </p>
    );
  }
  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-muted">
        Fasader hämtas från grunduppgifterna. Ett hus har högst{" "}
        {MAX_ANTAL_FASADER}. Ofta räcker gata och gård. Lägg till norr, söder,
        väster eller öster om sidan finns, och ta bort den som inte finns.
      </p>
      {data.hus.map((h) => (
        <HusFasadRader
          key={h.id}
          husId={h.id}
          namn={h.husnummer.trim() || "Byggnad"}
          antal={hamtaAktivaFasaderForHus(h).length}
          sidor={fasadSidorForHus(h)}
          ytor={hamtaHusFasadRad(data, h.id)}
          onFasad={onFasad}
          onYta={onYta}
        />
      ))}
    </div>
  );
}

function HusFasadRader({
  husId,
  namn,
  antal,
  sidor,
  ytor,
  onFasad,
  onYta,
}: {
  husId: string;
  namn: string;
  antal: number;
  sidor: { id: FasadVaderstreckId; etikett: string; aktiv: boolean }[];
  ytor: ReturnType<typeof hamtaHusFasadRad>;
  onFasad: (husId: string, id: FasadVaderstreckId, aktiv: boolean) => void;
  onYta: (husId: string, id: FasadVaderstreckId, värde: string) => void;
}) {
  return (
    <div className="rounded-lg border border-[#d4e8da] bg-white p-3">
      <p className="text-xs font-medium text-foreground">
        {namn} — {antal} av {MAX_ANTAL_FASADER} fasader
      </p>
      <ul className="mt-2 space-y-2">
        {sidor.map((sida) => {
          const full = !sida.aktiv && antal >= MAX_ANTAL_FASADER;
          return (
            <li key={sida.id} className="flex flex-wrap items-center gap-2">
              {sida.aktiv ? (
                <>
                  <span className="w-16 text-sm text-foreground">{sida.etikett}</span>
                  <label className="text-xs text-muted">
                    m²
                    <input
                      type="number"
                      min={0}
                      step={0.1}
                      value={ytor[sida.id] ?? ""}
                      onChange={(e) => onYta(husId, sida.id, e.target.value)}
                      className="ml-1 w-24 rounded-lg border border-border bg-white px-2 py-1 text-sm"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => onFasad(husId, sida.id, false)}
                    className="rounded-lg border border-red-200 px-2 py-1 text-xs font-medium text-red-800 hover:bg-red-50"
                  >
                    Ta bort
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  disabled={full}
                  onClick={() => onFasad(husId, sida.id, true)}
                  className="rounded-full border border-border px-2.5 py-1 text-xs text-foreground hover:border-primary/40 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Lägg till {sida.etikett}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
