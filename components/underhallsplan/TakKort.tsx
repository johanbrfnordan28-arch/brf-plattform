"use client";

import { useState } from "react";
import { FastighetsdelUnderkomponentDetalj } from "@/components/underhallsplan/FastighetsdelUnderkomponentDetalj";
import { TakSammanstallning } from "@/components/underhallsplan/TakSammanstallning";
import { UnderkomponentMattPartierPanel } from "@/components/underhallsplan/UnderkomponentMattPartierPanel";
import {
  hamtaKomponentMall,
  hamtaMattPartier,
  måttenhetEtiketter,
  skapaKomponentId,
  uppdateraMattPartier,
  type KomponentDetaljData,
  type UnderkomponentRad,
} from "@/components/underhallsplan/komponentregister";
import {
  TAK_EGNA_DELAR_IDS,
  TAK_YTSKIKT_ID,
} from "@/components/underhallsplan/tak-enheter";
import type { Grunduppgifter } from "@/components/underhallsplan/types";

type TakKortProps = {
  namn: string;
  data: KomponentDetaljData;
  grund: Grunduppgifter;
  foreningsAdresser: string[];
  planStartAr: number;
  planLangdAr: number;
  husNamn?: string[];
  onChange: (data: KomponentDetaljData) => void;
  /** Sparar planen. Returnerar false om det inte gick. */
  onSpara: () => boolean;
};

function medIPlan(rad: UnderkomponentRad): boolean {
  return rad.medIPlan !== false;
}

function Sektion({
  titel,
  intro,
  children,
}: {
  titel: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-[#d4e8da] bg-[#f7f9f8] px-3 py-3">
      <p className="text-sm font-semibold text-foreground">{titel}</p>
      {intro ? <p className="mt-0.5 text-xs text-muted">{intro}</p> : null}
      <div className="mt-2">{children}</div>
    </section>
  );
}

/** Ett tak i steg 2 — ytskikt, komponenter på taket och egna delar. */
export function TakKort({
  namn,
  data,
  grund,
  foreningsAdresser,
  planStartAr,
  planLangdAr,
  husNamn,
  onChange,
  onSpara,
}: TakKortProps) {
  const mall = hamtaKomponentMall(namn);
  const [valdKomponent, setValdKomponent] = useState("");
  const [egenKomponent, setEgenKomponent] = useState("");
  const [sparStatus, setSparStatus] = useState<
    { ok: true; tid: string } | { ok: false } | null
  >(null);

  function andra(next: KomponentDetaljData) {
    setSparStatus(null);
    onChange(next);
  }

  function spara() {
    setSparStatus(
      onSpara()
        ? {
            ok: true,
            tid: new Date().toLocaleTimeString("sv-SE", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          }
        : { ok: false },
    );
  }

  const egnaDelIds = TAK_EGNA_DELAR_IDS;
  const defFor = (id: string) => mall.underkomponenter.find((d) => d.id === id);
  const ytskiktRad = data.underkomponenter.find((r) => r.id === TAK_YTSKIKT_ID);
  const enklaRader = data.underkomponenter.filter(
    (r) => r.id !== TAK_YTSKIKT_ID && !egnaDelIds.includes(r.id),
  );
  const valdaKomponenter = enklaRader.filter(medIPlan);
  const tillgangliga = enklaRader.filter((r) => !medIPlan(r));
  const egnaDelar = data.underkomponenter.filter((r) =>
    egnaDelIds.includes(r.id),
  );

  function uppdateraRad(id: string, patch: Partial<UnderkomponentRad>) {
    andra({
      ...data,
      underkomponenter: data.underkomponenter.map((r) =>
        r.id === id ? { ...r, ...patch } : r,
      ),
    });
  }

  function laggTillKomponent() {
    const egen = egenKomponent.trim();
    if (valdKomponent) {
      uppdateraRad(valdKomponent, { medIPlan: true, aktiv: true });
    } else if (egen) {
      const finns = data.underkomponenter.find(
        (r) => r.etikett.toLowerCase() === egen.toLowerCase(),
      );
      if (finns) {
        uppdateraRad(finns.id, { medIPlan: true, aktiv: true });
      } else {
        andra({
          ...data,
          underkomponenter: [
            ...data.underkomponenter,
            {
              id: skapaKomponentId("under"),
              etikett: egen,
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
    }
    setValdKomponent("");
    setEgenKomponent("");
  }

  function sattMangd(rad: UnderkomponentRad, mangd: string) {
    const [forsta] = hamtaMattPartier(data, rad.id, rad);
    andra(
      uppdateraMattPartier(
        data,
        rad.id,
        [{ ...forsta, mangd }],
        rad.måttenhet,
      ),
    );
  }

  return (
    <div className="space-y-3">
      {ytskiktRad ? (
        <Sektion
          titel="Ytskikt, kulör och yta"
          intro="Ett takparti per ytskikt. Har taket t.ex. tegel och bandlagd plåt läggs de som separata partier."
        >
          <FastighetsdelUnderkomponentDetalj
            komponentNamn={namn}
            rad={ytskiktRad}
            detaljPanel="takbelaggning-val"
            data={data}
            grund={grund}
            foreningsAdresser={foreningsAdresser}
            planStartAr={planStartAr}
            planLangdAr={planLangdAr}
            onChange={andra}
            onRadChange={(patch) =>
              uppdateraRad(TAK_YTSKIKT_ID, { ...patch, aktiv: true })
            }
          />
        </Sektion>
      ) : null}

      <Sektion
        titel="Komponenter på taket"
        intro="Lägg till det som finns på just det här taket, t.ex. skorstenar, avluftning och takstegar, och ange antal eller löpmeter."
      >
        {valdaKomponenter.length === 0 ? (
          <p className="text-xs text-muted">Inga komponenter tillagda ännu.</p>
        ) : (
          <ul className="space-y-2">
            {valdaKomponenter.map((rad) => {
              const enhet = måttenhetEtiketter[rad.måttenhet];
              const partier = hamtaMattPartier(data, rad.id, rad);
              return (
                <li
                  key={rad.id}
                  className="rounded-lg border border-border/80 bg-white px-3 py-2"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="min-w-0 flex-1 text-sm font-medium text-foreground">
                      {rad.etikett}
                    </p>
                    {partier.length <= 1 ? (
                      <label className="flex items-center gap-1.5 text-xs text-muted">
                        {enhet.etikett}
                        <input
                          type="text"
                          inputMode="decimal"
                          value={partier[0]?.mangd ?? ""}
                          onChange={(e) => sattMangd(rad, e.target.value)}
                          placeholder="0"
                          className="w-20 rounded-lg border border-border bg-white px-2 py-1 text-sm"
                        />
                        {enhet.enhet}
                      </label>
                    ) : null}
                    <button
                      type="button"
                      onClick={() =>
                        uppdateraRad(rad.id, { medIPlan: false, aktiv: false })
                      }
                      className="rounded-lg border border-red-200 px-2 py-1 text-xs font-medium text-red-800 hover:bg-red-50"
                    >
                      Ta bort
                    </button>
                  </div>
                  {partier.length > 1 ? (
                    <div className="mt-2">
                      <UnderkomponentMattPartierPanel
                        etikett={rad.etikett}
                        måttenhet={rad.måttenhet}
                        partier={partier}
                        onChange={(next) =>
                          andra(
                            uppdateraMattPartier(data, rad.id, next, rad.måttenhet),
                          )
                        }
                      />
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
          {tillgangliga.length > 0 ? (
            <label className="min-w-0 flex-1 text-xs text-muted">
              Komponent
              <select
                value={valdKomponent}
                onChange={(e) => {
                  setValdKomponent(e.target.value);
                  if (e.target.value) setEgenKomponent("");
                }}
                className="mt-1 w-full rounded-lg border border-border bg-white px-2 py-1.5 text-sm"
              >
                <option value="">Välj komponent</option>
                {tillgangliga.map((rad) => (
                  <option key={rad.id} value={rad.id}>
                    {rad.etikett}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <label className="min-w-0 flex-1 text-xs text-muted">
            Egen komponent
            <input
              value={egenKomponent}
              onChange={(e) => {
                setEgenKomponent(e.target.value);
                if (e.target.value) setValdKomponent("");
              }}
              placeholder="t.ex. Solpaneler"
              className="mt-1 w-full rounded-lg border border-border bg-white px-2 py-1.5 text-sm"
            />
          </label>
          <button
            type="button"
            onClick={laggTillKomponent}
            disabled={!valdKomponent && !egenKomponent.trim()}
            className="rounded-lg border border-primary px-3 py-1.5 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6] disabled:opacity-50"
          >
            Lägg till komponent
          </button>
        </div>
      </Sektion>

      {egnaDelar.map((rad) => {
        const detaljPanel = defFor(rad.id)?.detaljPanel;
        if (!detaljPanel) return null;
        return (
          <Sektion key={rad.id} titel={rad.etikett}>
            {medIPlan(rad) ? (
              <>
                <FastighetsdelUnderkomponentDetalj
                  komponentNamn={namn}
                  rad={rad}
                  detaljPanel={detaljPanel}
                  data={data}
                  grund={grund}
                  foreningsAdresser={foreningsAdresser}
                  planStartAr={planStartAr}
                  planLangdAr={planLangdAr}
                  onChange={andra}
                  onRadChange={(patch) =>
                    uppdateraRad(rad.id, { ...patch, aktiv: true })
                  }
                />
                <button
                  type="button"
                  onClick={() =>
                    uppdateraRad(rad.id, { medIPlan: false, aktiv: false })
                  }
                  className="mt-2 rounded-lg border border-red-200 px-2 py-1 text-xs font-medium text-red-800 hover:bg-red-50"
                >
                  Ta bort {rad.etikett.toLowerCase()}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() =>
                  uppdateraRad(rad.id, { medIPlan: true, aktiv: true })
                }
                className="rounded-lg border border-primary px-3 py-1.5 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
              >
                + Lägg till {rad.etikett.toLowerCase()}
              </button>
            )}
          </Sektion>
        );
      })}

      <TakSammanstallning
        namn={namn}
        data={data}
        grund={grund}
        husNamn={husNamn}
      />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={spara}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          Spara tak
        </button>
        {sparStatus?.ok ? (
          <p className="text-xs text-primary-dark">Sparat kl. {sparStatus.tid}</p>
        ) : null}
        {sparStatus && !sparStatus.ok ? (
          <p className="text-xs text-red-800">
            Kunde inte spara — försök igen eller använd Spara nu högst upp.
          </p>
        ) : null}
      </div>
    </div>
  );
}
