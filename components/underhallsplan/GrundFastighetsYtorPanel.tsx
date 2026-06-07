"use client";

import { useEffect } from "react";
import {
  arFasadAktivForHus,
  fasadVaderstreckLista,
  normaliseraFastighetsYtor,
  skapaTomHusFasadYtor,
  summeraFasadKvm,
  summeraTakKvm,
  synkaHusFranGrund,
  type FastighetsYtorData,
  type FasadVaderstreckId,
  type HusFasadYtor,
} from "@/components/underhallsplan/fastighets-ytor";
import { hamtaAntalByggnader } from "@/components/underhallsplan/grund-byggnad-adress";
import { GoogleKartLankar } from "@/components/underhallsplan/GoogleKartLankar";
import { hamtaPrimarAdress } from "@/components/underhallsplan/kart-lankar";
import { YtaAiForslagKnapp } from "@/components/underhallsplan/YtaAiForslagKnapp";
import type { Grunduppgifter } from "@/components/underhallsplan/types";

type GrundFastighetsYtorPanelProps = {
  grund: Grunduppgifter;
  data: FastighetsYtorData;
  onChange: (data: FastighetsYtorData) => void;
};

function uppdateraFasadRad(
  data: FastighetsYtorData,
  husId: string,
  vaderstreck: FasadVaderstreckId,
  värde: string,
): FastighetsYtorData {
  const norm = normaliseraFastighetsYtor(data);
  const fasadPerHus = norm.fasadPerHus.map((rad) =>
    rad.husId === husId ? { ...rad, [vaderstreck]: värde } : rad,
  );
  if (!fasadPerHus.some((r) => r.husId === husId)) {
    fasadPerHus.push({ ...skapaTomHusFasadYtor(husId), [vaderstreck]: värde });
  }
  return { ...norm, fasadPerHus };
}

export function GrundFastighetsYtorPanel({
  grund,
  data: rawData,
  onChange,
}: GrundFastighetsYtorPanelProps) {
  const data = normaliseraFastighetsYtor(rawData);
  const fasadSumma = summeraFasadKvm(data);
  const takSumma = summeraTakKvm(data);
  const antalByggnader = hamtaAntalByggnader(grund);

  useEffect(() => {
    const synkat = synkaHusFranGrund(data, grund);
    if (synkat.hus.length !== data.hus.length) {
      onChange(synkat);
    }
  }, [antalByggnader, grund.adresser.join("\n")]); // eslint-disable-line react-hooks/exhaustive-deps

  function synkaHus() {
    onChange(synkaHusFranGrund(data, grund));
  }

  return (
    <div className="mt-6 rounded-xl border border-[#d4e8da] bg-[#eef6f0]/20 p-4 sm:p-5">
      <p className="text-sm font-semibold text-foreground">
        Fasad- och takytor per hus
      </p>
      <p className="mt-1 text-xs text-muted">
        Kopplat till {antalByggnader} byggnad{antalByggnader === 1 ? "" : "er"}.
        Vilka fasader som finns valde du i{" "}
        <a href="#grund-fasader" className="font-medium text-primary-dark underline">
          Fasader per byggnad
        </a>{" "}
        ovan — här anger du yta i m² per fasad.
      </p>

      <div className="mt-4 rounded-lg border border-[#b8d4c4] bg-[#f7fbf8] p-3">
        <GoogleKartLankar
          adress={hamtaPrimarAdress(grund.adresser)}
          kontext="allmant"
          kompakt
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={synkaHus}
          className="rounded-lg border border-primary px-3 py-1.5 text-xs font-medium text-primary-dark hover:bg-[#e2f0e6]"
        >
          Skapa hus från antal byggnader ({grund.antalByggnader || "1"})
        </button>
      </div>

      {data.hus.length === 0 ? (
        <p className="mt-4 text-xs text-muted">
          Fyll i antal byggnader och adresser ovan — hus skapas automatiskt.
        </p>
      ) : (
        <>
          <div className="mt-4 space-y-6">
            <fieldset>
              <legend className="text-xs font-semibold text-primary-dark">
                Fasadyta (m²)
              </legend>
              <label className="mt-2 flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={data.endastTotalFasad}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      endastTotalFasad: e.target.checked,
                    })
                  }
                  className="rounded border-border"
                />
                Endast total fasadyta (ingen uppdelning per hus)
              </label>
              {data.endastTotalFasad ? (
                <label className="mt-3 block max-w-xs text-sm">
                  <span className="text-xs font-medium text-muted">
                    Total fasadyta (m²)
                  </span>
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={data.totalFasadKvm}
                    onChange={(e) =>
                      onChange({ ...data, totalFasadKvm: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                  />
                </label>
              ) : (
                <FasadYtorMatris
                  grund={grund}
                  data={data}
                  onChange={onChange}
                />
              )}
              <p className="mt-2 text-xs font-medium text-primary-dark">
                Summa fasad: {fasadSumma.toLocaleString("sv-SE")} m²
              </p>
            </fieldset>

            <fieldset>
              <legend className="text-xs font-semibold text-primary-dark">
                Takyta
              </legend>
              <label className="mt-2 flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={data.endastTotalTak}
                  onChange={(e) =>
                    onChange({ ...data, endastTotalTak: e.target.checked })
                  }
                  className="rounded border-border"
                />
                Endast total takyta
              </label>
              {data.endastTotalTak ? (
                <label className="mt-3 block max-w-xs text-sm">
                  <span className="text-xs font-medium text-muted">
                    Total takyta (m²)
                  </span>
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={data.totalTakKvm}
                    onChange={(e) =>
                      onChange({ ...data, totalTakKvm: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                  />
                </label>
              ) : (
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full min-w-[320px] border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-border text-left text-muted">
                        <th className="py-1.5 pr-2 font-medium">Hus</th>
                        <th className="py-1.5 pr-2 font-medium">Tak (m²)</th>
                        <th className="py-1.5 font-medium">AI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.hus.map((h) => (
                        <tr key={h.id} className="border-b border-border/60">
                          <td className="py-2 pr-2 align-top">
                            <input
                              type="text"
                              value={h.husnummer}
                              onChange={(e) => {
                                const hus = data.hus.map((x) =>
                                  x.id === h.id
                                    ? { ...x, husnummer: e.target.value }
                                    : x,
                                );
                                onChange({ ...data, hus });
                              }}
                              className="w-full min-w-[6rem] rounded border border-border px-2 py-1 text-sm"
                              placeholder="Hus 1"
                            />
                          </td>
                          <td className="py-2 pr-2 align-top">
                            <input
                              type="number"
                              min={0}
                              step={0.1}
                              value={data.takPerHus[h.id] ?? ""}
                              onChange={(e) =>
                                onChange({
                                  ...data,
                                  takPerHus: {
                                    ...data.takPerHus,
                                    [h.id]: e.target.value,
                                  },
                                })
                              }
                              className="w-24 rounded border border-border px-2 py-1 text-sm"
                            />
                          </td>
                          <td className="py-2 align-top">
                            <YtaAiForslagKnapp
                              grund={grund}
                              husId={h.id}
                              vaderstreck="norr"
                              typ="tak"
                              onApply={(kvm) =>
                                onChange({
                                  ...data,
                                  takPerHus: { ...data.takPerHus, [h.id]: kvm },
                                })
                              }
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <p className="mt-2 text-xs font-medium text-primary-dark">
                Summa tak: {takSumma.toLocaleString("sv-SE")} m²
              </p>
            </fieldset>
          </div>
        </>
      )}
    </div>
  );
}

function FasadYtorMatris({
  grund,
  data,
  onChange,
}: {
  grund: Grunduppgifter;
  data: FastighetsYtorData;
  onChange: (data: FastighetsYtorData) => void;
}) {
  const synligaKolumner = fasadVaderstreckLista.filter((l) =>
    data.hus.some((h) => arFasadAktivForHus(h, l.id)),
  );
  const kolumner =
    synligaKolumner.length > 0 ? synligaKolumner : fasadVaderstreckLista;

  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-xs">
        <thead>
          <tr className="border-b border-border text-left text-muted">
            <th className="sticky left-0 z-[1] bg-[#eef6f0] py-1.5 pr-2 font-medium">
              Hus
            </th>
            {kolumner.map((l) => (
              <th key={l.id} className="py-1.5 px-1 font-medium">
                {l.etikett}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.hus.map((h) => {
            const rad =
              data.fasadPerHus.find((f) => f.husId === h.id) ??
              skapaTomHusFasadYtor(h.id);
            return (
              <tr key={h.id} className="border-b border-border/60">
                <td className="sticky left-0 z-[1] bg-white py-2 pr-2 align-top text-sm text-foreground">
                  {h.husnummer.trim() || "—"}
                </td>
                {kolumner.map((l) => {
                  const aktiv = arFasadAktivForHus(h, l.id);
                  return (
                    <td key={l.id} className="px-1 py-2 align-top">
                      <input
                        type="number"
                        min={0}
                        step={0.1}
                        disabled={!aktiv}
                        value={aktiv ? (rad[l.id as keyof HusFasadYtor] ?? "") : ""}
                        onChange={(e) =>
                          onChange(
                            uppdateraFasadRad(data, h.id, l.id, e.target.value),
                          )
                        }
                        className="w-16 rounded border border-border px-1 py-1 text-sm disabled:bg-muted/10 disabled:text-muted"
                        title={`${h.husnummer} — ${l.etikett}`}
                      />
                      {aktiv && (
                        <YtaAiForslagKnapp
                          grund={grund}
                          husId={h.id}
                          vaderstreck={l.id}
                          typ="fasad"
                          onApply={(kvm) =>
                            onChange(uppdateraFasadRad(data, h.id, l.id, kvm))
                          }
                          className="mt-0.5"
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
