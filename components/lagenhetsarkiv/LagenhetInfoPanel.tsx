"use client";

import { useEffect, useState } from "react";
import type { ApartmentFolder } from "@/components/lagenhetsarkiv/lagenhetsarkiv";
import {
  BESIKTNING_STATUS_ETIKETTER,
  besiktningBehoverAtgard,
  formateraRenovering,
  formateraUppvarmning,
  lagenhetHarIfylldInfo,
  mergeBesiktning,
  normaliseraEldstader,
  normaliseraFlakt,
  normaliseraLagenhetsRum,
  räknaBesiktningAtgarder,
  sammanfattaRumsstatus,
  skapaEldstadId,
  skapaLagenhetRumId,
  UPPVARMNING_ETIKETTER,
  type BesiktningStatus,
  type LagenhetBadrum,
  type LagenhetEldstad,
  type LagenhetFlakt,
  type LagenhetHall,
  type LagenhetKok,
  type LagenhetOvrigtRum,
  type LagenhetsRumsInfo,
  type LagenhetUppvarmning,
  type RumBesiktning,
  type SenasteRenovering,
  type UppvarmningTyp,
} from "@/components/lagenhetsarkiv/lagenhet-info";

const inputKlass =
  "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

const labelKlass = "mb-1 block text-xs font-medium text-muted";

function byggSparPatch(
  data: {
    adress: string;
    vaning: string;
    boyta: string;
    biyta: string;
    uppmattYta: string;
    andelstal: string;
    ritning: string;
    balkong: string;
    kallareForrad: string;
    pPlats: string;
    lagenhetsRum: LagenhetsRumsInfo;
    eldstader: LagenhetEldstad[];
    flakt: LagenhetFlakt;
    lagenhetNotering: string;
  },
): Partial<ApartmentFolder> {
  return {
    adress: data.adress.trim() || undefined,
    vaning: data.vaning.trim() || undefined,
    boyta: data.boyta.trim() || undefined,
    biyta: data.biyta.trim() || undefined,
    uppmattYta: data.uppmattYta.trim() || undefined,
    andelstal: data.andelstal.trim() || undefined,
    ritning: data.ritning.trim() || undefined,
    balkong: data.balkong.trim() || undefined,
    kallareForrad: data.kallareForrad.trim() || undefined,
    pPlats: data.pPlats.trim() || undefined,
    lagenhetsRum: data.lagenhetsRum,
    eldstader: data.eldstader.length > 0 ? data.eldstader : undefined,
    flakt: data.flakt.aktiv ? data.flakt : undefined,
    lagenhetNotering: data.lagenhetNotering.trim() || undefined,
    installationer: undefined,
    varme: undefined,
    senastStambyte: undefined,
    eldstadAntal: undefined,
    eldstadGodkand: undefined,
    harEgenFlaktVentilation: undefined,
    harRokgasFlakt: undefined,
    ventilation: undefined,
    antalRum: undefined,
    antalBadrum: undefined,
    antalWC: undefined,
  };
}

function StatusBadge({ besiktning }: { besiktning?: RumBesiktning }) {
  const status = besiktning?.status ?? "";
  const klass =
    status === "ok"
      ? "bg-[#e2f0e6] text-primary-dark"
      : status === "observera"
        ? "bg-amber-100 text-amber-950"
        : status === "daligt"
          ? "bg-red-100 text-red-900"
          : "bg-slate-100 text-muted";

  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${klass}`}>
        {BESIKTNING_STATUS_ETIKETTER[status]}
      </span>
      {besiktning?.fordjupadUndersokning && (
        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-900">
          Fördjupad undersökning
        </span>
      )}
    </span>
  );
}

function Rullgardin({
  titel,
  status,
  sammanfattning,
  accent,
  children,
}: {
  titel: string;
  status?: RumBesiktning;
  sammanfattning?: string;
  accent?: boolean;
  children: React.ReactNode;
}) {
  const [oppen, setOppen] = useState(false);

  return (
    <div
      className={`rounded-lg border bg-white ${
        accent ? "border-amber-400/60" : "border-border"
      }`}
    >
      <button
        type="button"
        onClick={() => setOppen((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left"
        aria-expanded={oppen}
      >
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-foreground">{titel}</span>
            <StatusBadge besiktning={status} />
          </span>
          {sammanfattning && (
            <span className="mt-0.5 block truncate text-xs text-muted">
              {sammanfattning}
            </span>
          )}
        </span>
        <span className="shrink-0 text-xs text-muted">{oppen ? "−" : "+"}</span>
      </button>
      {oppen && (
        <div className="space-y-3 border-t border-border px-3 pb-3 pt-3">
          {children}
        </div>
      )}
    </div>
  );
}

function Sektion({
  titel,
  beskrivning,
  defaultOppen = false,
  children,
}: {
  titel: string;
  beskrivning?: string;
  defaultOppen?: boolean;
  children: React.ReactNode;
}) {
  const [oppen, setOppen] = useState(defaultOppen);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOppen((v) => !v)}
        className="mb-2 flex w-full items-center justify-between gap-2 text-left"
        aria-expanded={oppen}
      >
        <span>
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">
            {titel}
          </span>
          {beskrivning && (
            <span className="mt-0.5 block text-xs font-normal normal-case text-muted">
              {beskrivning}
            </span>
          )}
        </span>
        <span className="text-xs text-muted">{oppen ? "−" : "+"}</span>
      </button>
      {oppen && children}
    </div>
  );
}

function UppvarmningFalt({
  varde,
  onChange,
}: {
  varde: LagenhetUppvarmning;
  onChange: (next: LagenhetUppvarmning) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <div>
        <label className={labelKlass}>Uppvärmning</label>
        <select
          value={varde.typ ?? ""}
          onChange={(e) =>
            onChange({ ...varde, typ: e.target.value as UppvarmningTyp })
          }
          className={inputKlass}
        >
          {(Object.keys(UPPVARMNING_ETIKETTER) as UppvarmningTyp[]).map((typ) => (
            <option key={typ || "tom"} value={typ}>
              {UPPVARMNING_ETIKETTER[typ]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelKlass}>Antal</label>
        <input
          type="number"
          min="0"
          value={varde.antal ?? ""}
          onChange={(e) => onChange({ ...varde, antal: e.target.value })}
          placeholder="t.ex. 2"
          className={inputKlass}
          disabled={!varde.typ}
        />
      </div>
    </div>
  );
}

function RenoveringFalt({
  varde,
  onChange,
}: {
  varde: SenasteRenovering;
  onChange: (next: SenasteRenovering) => void;
}) {
  return (
    <div className="space-y-2">
      <div>
        <label className={labelKlass}>Senaste renovering (år)</label>
        <input
          type="number"
          min="1900"
          max="2100"
          value={varde.ar ?? ""}
          onChange={(e) => onChange({ ...varde, ar: e.target.value })}
          placeholder="t.ex. 2019"
          className={inputKlass}
        />
      </div>
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={varde.harDokumentation ?? false}
            onChange={(e) =>
              onChange({ ...varde, harDokumentation: e.target.checked })
            }
            className="rounded border-border"
          />
          Dokumentation finns
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={varde.harBilder ?? false}
            onChange={(e) => onChange({ ...varde, harBilder: e.target.checked })}
            className="rounded border-border"
          />
          Bilder finns
        </label>
      </div>
    </div>
  );
}

function BesiktningFalt({
  varde,
  onChange,
}: {
  varde: RumBesiktning;
  onChange: (next: RumBesiktning) => void;
}) {
  const visarFordjupad =
    varde.status === "daligt" ||
    varde.status === "observera" ||
    varde.fordjupadUndersokning;

  return (
    <div className="rounded-lg border border-dashed border-primary/25 bg-[#fafcfa] p-3 space-y-3">
      <p className="text-xs font-medium text-primary-dark">Enkel besiktning</p>
      <div>
        <label className={labelKlass}>Status</label>
        <select
          value={varde.status ?? ""}
          onChange={(e) => {
            const status = e.target.value as BesiktningStatus;
            onChange({
              ...varde,
              status,
              fordjupadUndersokning:
                status === "daligt" ? true : varde.fordjupadUndersokning,
            });
          }}
          className={inputKlass}
        >
          {(Object.keys(BESIKTNING_STATUS_ETIKETTER) as BesiktningStatus[]).map(
            (s) => (
              <option key={s || "tom"} value={s}>
                {BESIKTNING_STATUS_ETIKETTER[s]}
              </option>
            ),
          )}
        </select>
      </div>
      {visarFordjupad && (
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={varde.fordjupadUndersokning ?? false}
            onChange={(e) =>
              onChange({ ...varde, fordjupadUndersokning: e.target.checked })
            }
            className="mt-0.5 rounded border-border"
          />
          <span>
            <span className="font-medium text-foreground">
              Fördjupad undersökning behövs
            </span>
            <span className="mt-0.5 block text-xs text-muted">
              Kryssa i vid t.ex. dåligt skick, fukt eller osäker konstruktion.
            </span>
          </span>
        </label>
      )}
      <div>
        <label className={labelKlass}>Senast besiktad</label>
        <input
          type="date"
          value={varde.senastBesiktad ?? ""}
          onChange={(e) => onChange({ ...varde, senastBesiktad: e.target.value })}
          className={inputKlass}
        />
      </div>
      <div>
        <label className={labelKlass}>Notering från besiktning</label>
        <textarea
          value={varde.notering ?? ""}
          onChange={(e) => onChange({ ...varde, notering: e.target.value })}
          rows={2}
          placeholder="Kort observation — kan fyllas på löpande"
          className={`${inputKlass} resize-none`}
        />
      </div>
    </div>
  );
}

interface Props {
  apartment: ApartmentFolder;
  lagenhetsEtikett?: string;
  onUppdatera: (patch: Partial<ApartmentFolder>) => void;
}

export function LagenhetInfoPanel({
  apartment,
  lagenhetsEtikett,
  onUppdatera,
}: Props) {
  const [adress, setAdress] = useState(apartment.adress ?? "");
  const [vaning, setVaning] = useState(apartment.vaning ?? "");
  const [boyta, setBoyta] = useState(apartment.boyta ?? "");
  const [biyta, setBiyta] = useState(apartment.biyta ?? "");
  const [uppmattYta, setUppmattYta] = useState(apartment.uppmattYta ?? "");
  const [andelstal, setAndelstal] = useState(apartment.andelstal ?? "");
  const [ritning, setRitning] = useState(apartment.ritning ?? "");
  const [balkong, setBalkong] = useState(apartment.balkong ?? "");
  const [kallareForrad, setKallareForrad] = useState(apartment.kallareForrad ?? "");
  const [pPlats, setPPlats] = useState(apartment.pPlats ?? "");
  const [lagenhetsRum, setLagenhetsRum] = useState<LagenhetsRumsInfo>(
    normaliseraLagenhetsRum(apartment),
  );
  const [eldstader, setEldstader] = useState<LagenhetEldstad[]>(
    normaliseraEldstader(apartment),
  );
  const [flakt, setFlakt] = useState<LagenhetFlakt>(normaliseraFlakt(apartment));
  const [lagenhetNotering, setLagenhetNotering] = useState(
    apartment.lagenhetNotering ?? "",
  );
  const [nyttRumsnamn, setNyttRumsnamn] = useState("");

  useEffect(() => {
    setAdress(apartment.adress ?? "");
    setVaning(apartment.vaning ?? "");
    setBoyta(apartment.boyta ?? "");
    setBiyta(apartment.biyta ?? "");
    setUppmattYta(apartment.uppmattYta ?? "");
    setAndelstal(apartment.andelstal ?? "");
    setRitning(apartment.ritning ?? "");
    setBalkong(apartment.balkong ?? "");
    setKallareForrad(apartment.kallareForrad ?? "");
    setPPlats(apartment.pPlats ?? "");
    setLagenhetsRum(normaliseraLagenhetsRum(apartment));
    setEldstader(normaliseraEldstader(apartment));
    setFlakt(normaliseraFlakt(apartment));
    setLagenhetNotering(apartment.lagenhetNotering ?? "");
  }, [apartment.id]);

  function persist(overrides: Partial<{
    adress: string;
    vaning: string;
    boyta: string;
    biyta: string;
    uppmattYta: string;
    andelstal: string;
    ritning: string;
    balkong: string;
    kallareForrad: string;
    pPlats: string;
    lagenhetsRum: LagenhetsRumsInfo;
    eldstader: LagenhetEldstad[];
    flakt: LagenhetFlakt;
    lagenhetNotering: string;
  }> = {}) {
    const data = {
      adress,
      vaning,
      boyta,
      biyta,
      uppmattYta,
      andelstal,
      ritning,
      balkong,
      kallareForrad,
      pPlats,
      lagenhetsRum,
      eldstader,
      flakt,
      lagenhetNotering,
      ...overrides,
    };
    onUppdatera(byggSparPatch(data));
  }

  function uppdateraHall(patch: Partial<LagenhetHall>) {
    setLagenhetsRum((prev) => {
      const hall = {
        ...prev.hall,
        ...patch,
        besiktning: mergeBesiktning(prev.hall.besiktning, patch.besiktning),
      };
      const next = { ...prev, hall };
      persist({ lagenhetsRum: next });
      return next;
    });
  }

  function uppdateraKok(patch: Partial<LagenhetKok>) {
    setLagenhetsRum((prev) => {
      const kok: LagenhetKok = {
        ...prev.kok,
        ...patch,
        lackagekydd: patch.lackagekydd
          ? { ...prev.kok.lackagekydd, ...patch.lackagekydd }
          : prev.kok.lackagekydd,
        senasteRenovering: patch.senasteRenovering
          ? { ...prev.kok.senasteRenovering, ...patch.senasteRenovering }
          : prev.kok.senasteRenovering,
        besiktning: mergeBesiktning(prev.kok.besiktning, patch.besiktning),
      };
      const next = { ...prev, kok };
      persist({ lagenhetsRum: next });
      return next;
    });
  }

  function uppdateraBadrum(patch: Partial<LagenhetBadrum>) {
    setLagenhetsRum((prev) => {
      const badrum: LagenhetBadrum = {
        ...prev.badrum,
        ...patch,
        senasteRenovering: patch.senasteRenovering
          ? { ...prev.badrum.senasteRenovering, ...patch.senasteRenovering }
          : prev.badrum.senasteRenovering,
        besiktning: mergeBesiktning(prev.badrum.besiktning, patch.besiktning),
      };
      const next = { ...prev, badrum };
      persist({ lagenhetsRum: next });
      return next;
    });
  }

  function laggTillRum() {
    const namn = nyttRumsnamn.trim();
    if (!namn) return;
    setLagenhetsRum((prev) => {
      const next = {
        ...prev,
        ovrigaRum: [
          ...prev.ovrigaRum,
          { id: skapaLagenhetRumId(), namn, uppvarmning: {} },
        ],
      };
      persist({ lagenhetsRum: next });
      return next;
    });
    setNyttRumsnamn("");
  }

  function uppdateraRum(id: string, patch: Partial<LagenhetOvrigtRum>) {
    setLagenhetsRum((prev) => {
      const next = {
        ...prev,
        ovrigaRum: prev.ovrigaRum.map((r) =>
          r.id === id
            ? {
                ...r,
                ...patch,
                besiktning: mergeBesiktning(r.besiktning, patch.besiktning),
              }
            : r,
        ),
      };
      persist({ lagenhetsRum: next });
      return next;
    });
  }

  function taBortRum(id: string) {
    setLagenhetsRum((prev) => {
      const next = {
        ...prev,
        ovrigaRum: prev.ovrigaRum.filter((r) => r.id !== id),
      };
      persist({ lagenhetsRum: next });
      return next;
    });
  }

  function laggTillEldstad() {
    setEldstader((prev) => {
      const next = [...prev, { id: skapaEldstadId() }];
      persist({ eldstader: next });
      return next;
    });
  }

  function uppdateraEldstad(id: string, patch: Partial<LagenhetEldstad>) {
    setEldstader((prev) => {
      const next = prev.map((e) => (e.id === id ? { ...e, ...patch } : e));
      persist({ eldstader: next });
      return next;
    });
  }

  function taBortEldstad(id: string) {
    setEldstader((prev) => {
      const next = prev.filter((e) => e.id !== id);
      persist({ eldstader: next });
      return next;
    });
  }

  function uppdateraFlakt(patch: Partial<LagenhetFlakt>) {
    setFlakt((prev) => {
      const next = { ...prev, ...patch };
      persist({ flakt: next });
      return next;
    });
  }

  function sparaGrund(felt: Partial<{
    adress: string;
    vaning: string;
    boyta: string;
    biyta: string;
    uppmattYta: string;
    andelstal: string;
    ritning: string;
    balkong: string;
    kallareForrad: string;
    pPlats: string;
    lagenhetNotering: string;
  }>) {
    if (felt.adress !== undefined) setAdress(felt.adress);
    if (felt.vaning !== undefined) setVaning(felt.vaning);
    if (felt.boyta !== undefined) setBoyta(felt.boyta);
    if (felt.biyta !== undefined) setBiyta(felt.biyta);
    if (felt.uppmattYta !== undefined) setUppmattYta(felt.uppmattYta);
    if (felt.andelstal !== undefined) setAndelstal(felt.andelstal);
    if (felt.ritning !== undefined) setRitning(felt.ritning);
    if (felt.balkong !== undefined) setBalkong(felt.balkong);
    if (felt.kallareForrad !== undefined) setKallareForrad(felt.kallareForrad);
    if (felt.pPlats !== undefined) setPPlats(felt.pPlats);
    if (felt.lagenhetNotering !== undefined) setLagenhetNotering(felt.lagenhetNotering);
    persist(felt);
  }

  const harInfo = lagenhetHarIfylldInfo(apartment);
  const atgarder = räknaBesiktningAtgarder(lagenhetsRum);

  const statusRader = [
    {
      titel: "Hall",
      ...lagenhetsRum.hall,
      renovering: undefined as SenasteRenovering | undefined,
    },
    {
      titel: "Kök",
      ...lagenhetsRum.kok,
      renovering: lagenhetsRum.kok.senasteRenovering,
    },
    {
      titel: "Badrum",
      ...lagenhetsRum.badrum,
      renovering: lagenhetsRum.badrum.senasteRenovering,
    },
    ...lagenhetsRum.ovrigaRum.map((r) => ({
      titel: r.namn,
      besiktning: r.besiktning,
      uppvarmning: r.uppvarmning,
      renovering: undefined as SenasteRenovering | undefined,
    })),
  ];

  return (
    <div className="rounded-xl border-2 border-primary/20 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-[#eef6f0] px-4 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">
            Lägenhetsuppgifter & tekniska installationer
          </p>
          {lagenhetsEtikett && (
            <p className="mt-0.5 text-lg font-bold text-foreground">{lagenhetsEtikett}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {harInfo && (
            <span className="rounded-full bg-[#e2f0e6] px-2 py-0.5 text-xs font-medium text-primary-dark">
              Registrerad
            </span>
          )}
          {atgarder > 0 && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-950">
              {atgarder} att följa upp
            </span>
          )}
        </div>
      </div>

      <div className="border-t border-border px-4 pb-4 pt-3 space-y-4">
        <p className="text-xs text-muted">
          Översikt över aktuell status i lägenheten. Öppna respektive del för att
          komplettera information löpande — sparas automatiskt.
        </p>

        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-[#fafcfa] text-left text-xs text-muted">
                <th className="px-3 py-2 font-medium">Utrymme</th>
                <th className="px-3 py-2 font-medium">Besiktning</th>
                <th className="px-3 py-2 font-medium">Renovering</th>
                <th className="px-3 py-2 font-medium">Uppvärmning</th>
              </tr>
            </thead>
            <tbody>
              {statusRader.map((rad) => (
                <tr
                  key={rad.titel}
                  className={`border-b border-border last:border-0 ${
                    besiktningBehoverAtgard(rad.besiktning) ? "bg-amber-50/50" : ""
                  }`}
                >
                  <td className="px-3 py-2 font-medium text-foreground">
                    {rad.titel}
                  </td>
                  <td className="px-3 py-2">
                    <StatusBadge besiktning={rad.besiktning} />
                  </td>
                  <td className="px-3 py-2 text-muted">
                    {formateraRenovering(rad.renovering) ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-muted">
                    {formateraUppvarmning(rad.uppvarmning) ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Sektion titel="Grunduppgifter" beskrivning="Adress, yta och tillbehör">
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className={labelKlass}>Adress</label>
              <input
                value={adress}
                onBlur={(e) => sparaGrund({ adress: e.target.value })}
                onChange={(e) => setAdress(e.target.value)}
                className={inputKlass}
              />
            </div>
            <div>
              <label className={labelKlass}>Våning</label>
              <input
                value={vaning}
                onBlur={(e) => sparaGrund({ vaning: e.target.value })}
                onChange={(e) => setVaning(e.target.value)}
                className={inputKlass}
              />
            </div>
            <div>
              <label className={labelKlass}>BOA (m²)</label>
              <input
                type="number"
                min="0"
                value={boyta}
                onBlur={(e) => sparaGrund({ boyta: e.target.value })}
                onChange={(e) => setBoyta(e.target.value)}
                className={inputKlass}
              />
            </div>
            <div>
              <label className={labelKlass}>BIA (m²)</label>
              <input
                type="number"
                min="0"
                value={biyta}
                onBlur={(e) => sparaGrund({ biyta: e.target.value })}
                onChange={(e) => setBiyta(e.target.value)}
                className={inputKlass}
              />
            </div>
            <div>
              <label className={labelKlass}>Andelstal</label>
              <input
                value={andelstal}
                onBlur={(e) => sparaGrund({ andelstal: e.target.value })}
                onChange={(e) => setAndelstal(e.target.value)}
                className={inputKlass}
              />
            </div>
            <div>
              <label className={labelKlass}>Balkong</label>
              <input
                value={balkong}
                onBlur={(e) => sparaGrund({ balkong: e.target.value })}
                onChange={(e) => setBalkong(e.target.value)}
                className={inputKlass}
              />
            </div>
            <div>
              <label className={labelKlass}>Förråd</label>
              <input
                value={kallareForrad}
                onBlur={(e) => sparaGrund({ kallareForrad: e.target.value })}
                onChange={(e) => setKallareForrad(e.target.value)}
                className={inputKlass}
              />
            </div>
            <div>
              <label className={labelKlass}>P-plats</label>
              <input
                value={pPlats}
                onBlur={(e) => sparaGrund({ pPlats: e.target.value })}
                onChange={(e) => setPPlats(e.target.value)}
                className={inputKlass}
              />
            </div>
          </div>
        </Sektion>

        <Sektion
          titel="Rum & enkel besiktning"
          beskrivning="Hall, kök, badrum och fler rum — status och uppvärmning"
          defaultOppen
        >
          <div className="space-y-2">
            <Rullgardin
              titel="Hall"
              status={lagenhetsRum.hall.besiktning}
              sammanfattning={sammanfattaRumsstatus("Hall", lagenhetsRum.hall)}
              accent={besiktningBehoverAtgard(lagenhetsRum.hall.besiktning)}
            >
              <BesiktningFalt
                varde={lagenhetsRum.hall.besiktning ?? {}}
                onChange={(besiktning) => uppdateraHall({ besiktning })}
              />
              <div className="mt-3">
                <UppvarmningFalt
                  varde={lagenhetsRum.hall.uppvarmning ?? {}}
                  onChange={(uppvarmning) => uppdateraHall({ uppvarmning })}
                />
              </div>
            </Rullgardin>

            <Rullgardin
              titel="Kök"
              status={lagenhetsRum.kok.besiktning}
              sammanfattning={sammanfattaRumsstatus("Kök", lagenhetsRum.kok)}
              accent={besiktningBehoverAtgard(lagenhetsRum.kok.besiktning)}
            >
              <BesiktningFalt
                varde={lagenhetsRum.kok.besiktning ?? {}}
                onChange={(besiktning) => uppdateraKok({ besiktning })}
              />
              <div className="mt-3">
                <RenoveringFalt
                  varde={lagenhetsRum.kok.senasteRenovering ?? {}}
                  onChange={(senasteRenovering) =>
                    uppdateraKok({ senasteRenovering })
                  }
                />
              </div>
              <div className="mt-3">
                <p className={labelKlass}>Läckageskydd</p>
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  {(
                    [
                      ["diskmaskin", "Under diskmaskin"],
                      ["kylFrys", "Under kyl och frys"],
                      ["diskbankslada", "I diskbänkslåda"],
                    ] as const
                  ).map(([nyckel, etikett]) => (
                    <label key={nyckel} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={lagenhetsRum.kok.lackagekydd?.[nyckel] ?? false}
                        onChange={(e) =>
                          uppdateraKok({
                            lackagekydd: { [nyckel]: e.target.checked },
                          })
                        }
                        className="rounded border-border"
                      />
                      {etikett}
                    </label>
                  ))}
                </div>
              </div>
              <div className="mt-3">
                <UppvarmningFalt
                  varde={lagenhetsRum.kok.uppvarmning ?? {}}
                  onChange={(uppvarmning) => uppdateraKok({ uppvarmning })}
                />
              </div>
            </Rullgardin>

            <Rullgardin
              titel="Badrum"
              status={lagenhetsRum.badrum.besiktning}
              sammanfattning={sammanfattaRumsstatus("Badrum", lagenhetsRum.badrum)}
              accent={besiktningBehoverAtgard(lagenhetsRum.badrum.besiktning)}
            >
              <BesiktningFalt
                varde={lagenhetsRum.badrum.besiktning ?? {}}
                onChange={(besiktning) => uppdateraBadrum({ besiktning })}
              />
              <div className="mt-3">
                <RenoveringFalt
                  varde={lagenhetsRum.badrum.senasteRenovering ?? {}}
                  onChange={(senasteRenovering) =>
                    uppdateraBadrum({ senasteRenovering })
                  }
                />
              </div>
              <div className="mt-3">
                <UppvarmningFalt
                  varde={lagenhetsRum.badrum.uppvarmning ?? {}}
                  onChange={(uppvarmning) => uppdateraBadrum({ uppvarmning })}
                />
              </div>
            </Rullgardin>

            {lagenhetsRum.ovrigaRum.map((rum) => (
              <Rullgardin
                key={rum.id}
                titel={rum.namn}
                status={rum.besiktning}
                sammanfattning={sammanfattaRumsstatus(rum.namn, rum)}
                accent={besiktningBehoverAtgard(rum.besiktning)}
              >
                <div className="mb-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => taBortRum(rum.id)}
                    className="text-xs text-muted hover:text-red-800"
                  >
                    Ta bort rum
                  </button>
                </div>
                <BesiktningFalt
                  varde={rum.besiktning ?? {}}
                  onChange={(besiktning) => uppdateraRum(rum.id, { besiktning })}
                />
                <div className="mt-3">
                  <label className={labelKlass}>Rumsnamn</label>
                  <input
                    value={rum.namn}
                    onBlur={(e) =>
                      uppdateraRum(rum.id, { namn: e.target.value })
                    }
                    onChange={(e) =>
                      setLagenhetsRum((prev) => ({
                        ...prev,
                        ovrigaRum: prev.ovrigaRum.map((r) =>
                          r.id === rum.id ? { ...r, namn: e.target.value } : r,
                        ),
                      }))
                    }
                    className={inputKlass}
                  />
                </div>
                <div className="mt-3">
                  <UppvarmningFalt
                    varde={rum.uppvarmning ?? {}}
                    onChange={(uppvarmning) =>
                      uppdateraRum(rum.id, { uppvarmning })
                    }
                  />
                </div>
              </Rullgardin>
            ))}

            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={nyttRumsnamn}
                onChange={(e) => setNyttRumsnamn(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    laggTillRum();
                  }
                }}
                placeholder="Nytt rum, t.ex. Sovrum 2"
                className={inputKlass}
              />
              <button
                type="button"
                onClick={laggTillRum}
                className="shrink-0 rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary-dark hover:bg-[#eef6f0]"
              >
                Lägg till rum
              </button>
            </div>
          </div>
        </Sektion>

        <Sektion
          titel="Tekniska installationer"
          beskrivning="Eldstäder och fläkt som endast betjänar lägenheten"
        >
          <div className="space-y-4">
            <div>
              <p className={labelKlass}>Eldstäder</p>
              {eldstader.length > 0 ? (
                <ul className="mb-2 space-y-2">
                  {eldstader.map((eldstad, index) => (
                    <li
                      key={eldstad.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-[#fafcfa] px-3 py-2"
                    >
                      <span className="text-sm font-medium text-foreground">
                        Eldstad {index + 1}
                        {eldstad.godkand === false && (
                          <span className="ml-2 text-xs font-normal text-red-800">
                            Ej godkänd
                          </span>
                        )}
                        {eldstad.godkand && (
                          <span className="ml-2 text-xs font-normal text-primary-dark">
                            Godkänd
                          </span>
                        )}
                      </span>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={eldstad.godkand ?? false}
                            onChange={(e) =>
                              uppdateraEldstad(eldstad.id, {
                                godkand: e.target.checked,
                              })
                            }
                            className="rounded border-border"
                          />
                          Godkänd
                        </label>
                        <button
                          type="button"
                          onClick={() => taBortEldstad(eldstad.id)}
                          className="text-xs text-muted hover:text-red-800"
                        >
                          Ta bort
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mb-2 text-xs text-muted">Inga eldstäder registrerade.</p>
              )}
              <button
                type="button"
                onClick={laggTillEldstad}
                className="rounded-lg border border-primary px-3 py-1.5 text-sm font-medium text-primary-dark hover:bg-[#eef6f0]"
              >
                + Lägg till eldstad
              </button>
            </div>

            <div className="rounded-lg border border-border bg-[#fafcfa] p-3">
              <p className={labelKlass}>Fläkt (endast denna lägenhet)</p>
              <p className="mb-2 text-xs text-muted">
                Fyll i endast om fläkten bara betjänar lägenheten — inte
                fastighetens gemensamma ventilation.
              </p>
              <label className="mb-3 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={flakt.aktiv ?? false}
                  onChange={(e) => uppdateraFlakt({ aktiv: e.target.checked })}
                  className="rounded border-border"
                />
                Fläkt som endast betjänar lägenheten
              </label>
              {flakt.aktiv && (
                <div className="space-y-2">
                  <input
                    value={flakt.beskrivning ?? ""}
                    onBlur={(e) =>
                      uppdateraFlakt({ beskrivning: e.target.value })
                    }
                    onChange={(e) =>
                      setFlakt((prev) => ({ ...prev, beskrivning: e.target.value }))
                    }
                    placeholder="Beskrivning, t.ex. köksfläkt med egen kanal"
                    className={inputKlass}
                  />
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={flakt.rokgasflakt ?? false}
                      onChange={(e) =>
                        uppdateraFlakt({ rokgasflakt: e.target.checked })
                      }
                      className="rounded border-border"
                    />
                    Rökgasfläkt
                  </label>
                </div>
              )}
            </div>
          </div>
        </Sektion>

        <div>
          <label className={labelKlass}>Övrig notering</label>
          <textarea
            value={lagenhetNotering}
            onBlur={(e) => sparaGrund({ lagenhetNotering: e.target.value })}
            onChange={(e) => setLagenhetNotering(e.target.value)}
            rows={2}
            className={`${inputKlass} resize-none`}
          />
        </div>
      </div>
    </div>
  );
}
