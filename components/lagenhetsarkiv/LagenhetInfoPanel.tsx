"use client";

import { useState } from "react";
import {
  LAGENHET_VARME_ETIKETTER,
  type ApartmentFolder,
  type LagenhetVarme,
} from "@/components/lagenhetsarkiv/lagenhetsarkiv";

const inputKlass =
  "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

const labelKlass = "mb-1 block text-xs font-medium text-muted";

function InfoRad({ etikett, varde }: { etikett: string; varde?: string }) {
  if (!varde?.trim()) return null;
  return (
    <div className="flex min-w-0 gap-1.5 text-sm">
      <dt className="shrink-0 text-muted">{etikett}:</dt>
      <dd className="font-medium text-foreground">{varde}</dd>
    </div>
  );
}

interface Props {
  apartment: ApartmentFolder;
  onUppdatera: (patch: Partial<ApartmentFolder>) => void;
}

export function LagenhetInfoPanel({ apartment, onUppdatera }: Props) {
  const [redigerar, setRedigerar] = useState(false);

  // Lokal form-state
  const [adress, setAdress] = useState(apartment.adress ?? "");
  const [vaning, setVaning] = useState(apartment.vaning ?? "");
  const [antalRum, setAntalRum] = useState(apartment.antalRum ?? "");
  const [boyta, setBoyta] = useState(apartment.boyta ?? "");
  const [biyta, setBiyta] = useState(apartment.biyta ?? "");
  const [uppmattYta, setUppmattYta] = useState(apartment.uppmattYta ?? "");
  const [andelstal, setAndelstal] = useState(apartment.andelstal ?? "");
  const [ritning, setRitning] = useState(apartment.ritning ?? "");
  const [varme, setVarme] = useState<LagenhetVarme[]>(apartment.varme ?? []);
  const [ventilation, setVentilation] = useState(apartment.ventilation ?? "");
  const [balkong, setBalkong] = useState(apartment.balkong ?? "");
  const [kallareForrad, setKallareForrad] = useState(apartment.kallareForrad ?? "");
  const [pPlats, setPPlats] = useState(apartment.pPlats ?? "");
  const [senastStambyte, setSenastStambyte] = useState(apartment.senastStambyte ?? "");
  const [lagenhetNotering, setLagenhetNotering] = useState(apartment.lagenhetNotering ?? "");

  function startaRedigering() {
    // Synka lokal state från eventuellt uppdaterat apartment
    setAdress(apartment.adress ?? "");
    setVaning(apartment.vaning ?? "");
    setAntalRum(apartment.antalRum ?? "");
    setBoyta(apartment.boyta ?? "");
    setBiyta(apartment.biyta ?? "");
    setUppmattYta(apartment.uppmattYta ?? "");
    setAndelstal(apartment.andelstal ?? "");
    setRitning(apartment.ritning ?? "");
    setVarme(apartment.varme ?? []);
    setVentilation(apartment.ventilation ?? "");
    setBalkong(apartment.balkong ?? "");
    setKallareForrad(apartment.kallareForrad ?? "");
    setPPlats(apartment.pPlats ?? "");
    setSenastStambyte(apartment.senastStambyte ?? "");
    setLagenhetNotering(apartment.lagenhetNotering ?? "");
    setRedigerar(true);
  }

  function spara() {
    onUppdatera({
      adress: adress.trim() || undefined,
      vaning: vaning.trim() || undefined,
      antalRum: antalRum.trim() || undefined,
      boyta: boyta.trim() || undefined,
      biyta: biyta.trim() || undefined,
      uppmattYta: uppmattYta.trim() || undefined,
      andelstal: andelstal.trim() || undefined,
      ritning: ritning.trim() || undefined,
      varme: varme.length > 0 ? varme : undefined,
      ventilation: ventilation.trim() || undefined,
      balkong: balkong.trim() || undefined,
      kallareForrad: kallareForrad.trim() || undefined,
      pPlats: pPlats.trim() || undefined,
      senastStambyte: senastStambyte.trim() || undefined,
      lagenhetNotering: lagenhetNotering.trim() || undefined,
    });
    setRedigerar(false);
  }

  function toggleVarme(typ: LagenhetVarme) {
    setVarme((prev) =>
      prev.includes(typ) ? prev.filter((v) => v !== typ) : [...prev, typ],
    );
  }

  // Summera ifyllt för visning
  const harInfo = !!(
    apartment.adress ||
    apartment.vaning ||
    apartment.boyta ||
    apartment.andelstal ||
    apartment.varme?.length
  );

  return (
    <div className="mt-3 rounded-xl border border-border bg-white">
      <button
        type="button"
        onClick={() => (redigerar ? setRedigerar(false) : startaRedigering())}
        className="flex w-full items-center justify-between gap-2 px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">
            Lägenhetsuppgifter
          </span>
          {harInfo && (
            <span className="rounded-full bg-[#e2f0e6] px-2 py-0.5 text-xs font-medium text-primary-dark">
              Ifyllt
            </span>
          )}
        </div>
        <span className="text-xs text-muted">
          {redigerar ? "Dölj ↑" : "Redigera ▾"}
        </span>
      </button>

      {/* Visningsvy — kompakt sammanfattning */}
      {!redigerar && harInfo && (
        <div className="border-t border-border px-4 pb-4 pt-3">
          <dl className="flex flex-wrap gap-x-6 gap-y-1">
            <InfoRad etikett="Adress" varde={apartment.adress} />
            <InfoRad etikett="Våning" varde={apartment.vaning} />
            <InfoRad etikett="Rum" varde={apartment.antalRum} />
            <InfoRad etikett="BOA" varde={apartment.boyta ? `${apartment.boyta} m²` : undefined} />
            <InfoRad etikett="BIA" varde={apartment.biyta ? `${apartment.biyta} m²` : undefined} />
            <InfoRad etikett="Uppmätt yta" varde={apartment.uppmattYta ? `${apartment.uppmattYta} m²` : undefined} />
            <InfoRad etikett="Andelstal" varde={apartment.andelstal} />
            <InfoRad etikett="Ritning" varde={apartment.ritning} />
            <InfoRad etikett="Ventilation" varde={apartment.ventilation} />
            <InfoRad etikett="Balkong" varde={apartment.balkong} />
            <InfoRad etikett="Förråd" varde={apartment.kallareForrad} />
            <InfoRad etikett="P-plats" varde={apartment.pPlats} />
            <InfoRad etikett="Senast stambyte" varde={apartment.senastStambyte} />
            {apartment.varme && apartment.varme.length > 0 && (
              <div className="flex min-w-0 gap-1.5 text-sm">
                <dt className="shrink-0 text-muted">Värme:</dt>
                <dd className="font-medium text-foreground">
                  {apartment.varme
                    .map((v) => LAGENHET_VARME_ETIKETTER[v])
                    .join(", ")}
                </dd>
              </div>
            )}
            <InfoRad etikett="Notering" varde={apartment.lagenhetNotering} />
          </dl>
        </div>
      )}

      {/* Redigeringsvy */}
      {redigerar && (
        <div className="border-t border-border px-4 pb-4 pt-3 space-y-4">
          {/* Adress & läge */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
              Adress & läge
            </p>
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className={labelKlass}>Adress</label>
                <input value={adress} onChange={(e) => setAdress(e.target.value)} placeholder="Gatuadress, postnr" className={inputKlass} />
              </div>
              <div>
                <label className={labelKlass}>Våningsplan</label>
                <input value={vaning} onChange={(e) => setVaning(e.target.value)} placeholder="t.ex. 3 eller BV" className={inputKlass} />
              </div>
              <div>
                <label className={labelKlass}>Antal rum</label>
                <input value={antalRum} onChange={(e) => setAntalRum(e.target.value)} placeholder="t.ex. 3 rum och kök" className={inputKlass} />
              </div>
              <div>
                <label className={labelKlass}>Balkong / terrass</label>
                <input value={balkong} onChange={(e) => setBalkong(e.target.value)} placeholder="t.ex. Ja, 7 m² söder" className={inputKlass} />
              </div>
              <div>
                <label className={labelKlass}>Källarförråd</label>
                <input value={kallareForrad} onChange={(e) => setKallareForrad(e.target.value)} placeholder="t.ex. nr 12" className={inputKlass} />
              </div>
              <div>
                <label className={labelKlass}>P-plats</label>
                <input value={pPlats} onChange={(e) => setPPlats(e.target.value)} placeholder="t.ex. nr 4" className={inputKlass} />
              </div>
            </div>
          </div>

          {/* Yta & ekonomi */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
              Yta & ekonomi
            </p>
            <div className="grid gap-2 sm:grid-cols-4">
              <div>
                <label className={labelKlass}>BOA (m²)</label>
                <input type="number" min="0" value={boyta} onChange={(e) => setBoyta(e.target.value)} placeholder="t.ex. 78" className={inputKlass} />
              </div>
              <div>
                <label className={labelKlass}>BIA (m²)</label>
                <input type="number" min="0" value={biyta} onChange={(e) => setBiyta(e.target.value)} placeholder="t.ex. 5" className={inputKlass} />
              </div>
              <div>
                <label className={labelKlass}>Uppmätt yta (m²)</label>
                <input type="number" min="0" value={uppmattYta} onChange={(e) => setUppmattYta(e.target.value)} placeholder="t.ex. 77.4" className={inputKlass} />
              </div>
              <div>
                <label className={labelKlass}>Andelstal / insats</label>
                <input value={andelstal} onChange={(e) => setAndelstal(e.target.value)} placeholder="t.ex. 0,7842 %" className={inputKlass} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelKlass}>Ritning / planritning</label>
                <input value={ritning} onChange={(e) => setRitning(e.target.value)} placeholder="Filnamn eller länk till planritning" className={inputKlass} />
              </div>
            </div>
          </div>

          {/* Teknik */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
              Teknik & installationer
            </p>
            <div className="mb-3">
              <label className={labelKlass}>Värme (välj alla som stämmer)</label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(LAGENHET_VARME_ETIKETTER) as LagenhetVarme[]).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => toggleVarme(v)}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                      varme.includes(v)
                        ? "border-primary bg-[#e2f0e6] text-primary-dark"
                        : "border-border bg-white text-foreground hover:border-primary/40"
                    }`}
                  >
                    {LAGENHET_VARME_ETIKETTER[v]}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <label className={labelKlass}>Ventilation</label>
                <input value={ventilation} onChange={(e) => setVentilation(e.target.value)} placeholder="t.ex. FTX, F, Självdrag" className={inputKlass} />
              </div>
              <div>
                <label className={labelKlass}>Senast stambyte (år)</label>
                <input type="number" min="1900" max="2100" value={senastStambyte} onChange={(e) => setSenastStambyte(e.target.value)} placeholder="t.ex. 2018" className={inputKlass} />
              </div>
            </div>
          </div>

          {/* Notering */}
          <div>
            <label className={labelKlass}>Övrig notering</label>
            <textarea
              value={lagenhetNotering}
              onChange={(e) => setLagenhetNotering(e.target.value)}
              rows={2}
              placeholder="Exceptionella egenskaper, pågående ärenden m.m."
              className={`${inputKlass} resize-none`}
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={spara} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark">
              Spara uppgifter
            </button>
            <button type="button" onClick={() => setRedigerar(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted hover:text-foreground">
              Avbryt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
