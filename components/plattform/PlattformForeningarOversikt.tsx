"use client";

import { useEffect, useMemo, useState } from "react";
import {
  klassificeraInternForeningStatus,
  type InternForeningStatus,
} from "@/lib/plattform-forening-status";

export type PlattformForeningAktivitet = {
  antalAnvandare: number;
  inloggningarTotalt: number;
  inloggningar7Dagar: number;
  inloggningar30Dagar: number;
  senasteInloggning: string | null;
};

export type PlattformForeningRad = {
  id: string;
  namn: string;
  organisationsnummer: string;
  epost: string;
  ort: string;
  kontaktperson: string;
  avtalGodkant: boolean;
  avtalGodkantTidpunkt: string;
  avtalBankidTidpunkt: string;
  avtalBankidNamn: string;
  skapadTidpunkt: string;
  medlemmar: Array<{
    roll: string;
    epost: string;
    namn: string;
    typ?: string;
    senasteInloggning?: string | null;
  }>;
  aktivitet?: PlattformForeningAktivitet;
};

export type PlattformForeningSammanfattning = {
  totalt: number;
  test: number;
  kund: number;
  utgangen: number;
  anvandareTotalt?: number;
  inloggningar7Dagar?: number;
};

type Filter = "alla" | InternForeningStatus;

function formatTid(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("sv-SE");
  } catch {
    return iso;
  }
}

function formatDatum(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("sv-SE");
  } catch {
    return iso;
  }
}

const FILTER_ETIKETTER: Record<Filter, string> = {
  alla: "Alla",
  test: "Aktuella tester",
  kund: "Med avtal",
  utgangen: "Avslutade perioder",
};

function statusBadgeClass(status: InternForeningStatus): string {
  if (status === "kund") {
    return "bg-[#e8f3ec] text-primary-dark ring-1 ring-primary/25";
  }
  if (status === "utgangen") {
    return "bg-amber-50 text-amber-950 ring-1 ring-amber-200";
  }
  return "bg-sky-50 text-sky-950 ring-1 ring-sky-200";
}

function tomAktivitet(): PlattformForeningAktivitet {
  return {
    antalAnvandare: 0,
    inloggningarTotalt: 0,
    inloggningar7Dagar: 0,
    inloggningar30Dagar: 0,
    senasteInloggning: null,
  };
}

type Props = {
  foreningar: PlattformForeningRad[];
  laddar?: boolean;
  onSammanfattning?: (s: PlattformForeningSammanfattning) => void;
};

/**
 * Intern översikt: skapade föreningar, aktivitet, test vs avtal vs avslutade.
 */
export function PlattformForeningarOversikt({
  foreningar,
  laddar,
  onSammanfattning,
}: Props) {
  const [filter, setFilter] = useState<Filter>("alla");
  const [sortering, setSortering] = useState<"skapad" | "aktivitet">("skapad");

  const berikade = useMemo(
    () =>
      foreningar.map((f) => ({
        ...f,
        aktivitet: f.aktivitet ?? {
          ...tomAktivitet(),
          antalAnvandare: f.medlemmar.length,
        },
        statusInfo: klassificeraInternForeningStatus({
          avtalGodkant: f.avtalGodkant,
          skapadTidpunkt: f.skapadTidpunkt,
        }),
      })),
    [foreningar],
  );

  const sammanfattning = useMemo(() => {
    const bas: PlattformForeningSammanfattning = {
      totalt: berikade.length,
      test: 0,
      kund: 0,
      utgangen: 0,
      anvandareTotalt: 0,
      inloggningar7Dagar: 0,
    };
    for (const f of berikade) {
      bas[f.statusInfo.status] += 1;
      bas.anvandareTotalt! += f.aktivitet.antalAnvandare;
      bas.inloggningar7Dagar! += f.aktivitet.inloggningar7Dagar;
    }
    return bas;
  }, [berikade]);

  useEffect(() => {
    onSammanfattning?.(sammanfattning);
  }, [onSammanfattning, sammanfattning]);

  const filtrerade = useMemo(() => {
    const lista =
      filter === "alla"
        ? [...berikade]
        : berikade.filter((f) => f.statusInfo.status === filter);
    if (sortering === "aktivitet") {
      lista.sort((a, b) => {
        const diff =
          b.aktivitet.inloggningar30Dagar - a.aktivitet.inloggningar30Dagar;
        if (diff !== 0) return diff;
        return b.aktivitet.antalAnvandare - a.aktivitet.antalAnvandare;
      });
    }
    return lista;
  }, [berikade, filter, sortering]);

  return (
    <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">Föreningar</h2>
          <p className="mt-1 text-sm text-muted">
            Skapade sidor, aktivitet (användare och inloggningar), avtal,
            aktuella tester och avslutade perioder.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-center text-xs">
          {(
            [
              ["Totalt", sammanfattning.totalt],
              ["Tester", sammanfattning.test],
              ["Avtal", sammanfattning.kund],
              ["Avslutade", sammanfattning.utgangen],
              ["Användare", sammanfattning.anvandareTotalt ?? 0],
              ["Inlogg. 7d", sammanfattning.inloggningar7Dagar ?? 0],
            ] as const
          ).map(([etikett, varde]) => (
            <div
              key={etikett}
              className="min-w-[4.5rem] rounded-xl border border-border bg-surface px-3 py-2"
            >
              <p className="text-lg font-bold text-foreground">{varde}</p>
              <p className="text-muted">{etikett}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {(Object.keys(FILTER_ETIKETTER) as Filter[]).map((nyckel) => (
          <button
            key={nyckel}
            type="button"
            onClick={() => setFilter(nyckel)}
            className={
              filter === nyckel
                ? "rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white"
                : "rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-foreground hover:border-primary/40"
            }
          >
            {FILTER_ETIKETTER[nyckel]}
            {nyckel === "alla"
              ? ` (${sammanfattning.totalt})`
              : ` (${sammanfattning[nyckel]})`}
          </button>
        ))}
        <label className="ml-auto flex items-center gap-2 text-sm text-muted">
          Sortera
          <select
            value={sortering}
            onChange={(e) =>
              setSortering(e.target.value as "skapad" | "aktivitet")
            }
            className="rounded-lg border border-border bg-white px-2 py-1.5 text-foreground"
          >
            <option value="skapad">Senast skapad</option>
            <option value="aktivitet">Mest aktiva</option>
          </select>
        </label>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border text-xs uppercase text-muted">
            <tr>
              <th className="py-2 pr-3">Förening</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2 pr-3">Användare</th>
              <th className="py-2 pr-3">Inloggningar</th>
              <th className="py-2 pr-3">Skapad</th>
              <th className="py-2">Kontakt</th>
            </tr>
          </thead>
          <tbody>
            {filtrerade.map((f) => (
              <tr key={f.id} className="border-b border-border/60 align-top">
                <td className="py-3 pr-3">
                  <p className="font-medium text-foreground">{f.namn}</p>
                  <p className="text-xs text-muted">
                    {f.organisationsnummer
                      ? `Org.nr ${f.organisationsnummer}`
                      : "Org.nr saknas"}
                    {f.ort ? ` · ${f.ort}` : ""}
                  </p>
                </td>
                <td className="py-3 pr-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadgeClass(f.statusInfo.status)}`}
                  >
                    {f.statusInfo.status === "utgangen"
                      ? "Avslutad period"
                      : f.statusInfo.etikett}
                  </span>
                  <p className="mt-1 text-xs text-muted">
                    {f.statusInfo.status === "test" &&
                    f.statusInfo.dagarKvar != null
                      ? `${f.statusInfo.dagarKvar} dagar kvar`
                      : f.statusInfo.status === "kund"
                        ? f.avtalGodkantTidpunkt
                          ? `Avtal ${formatDatum(f.avtalGodkantTidpunkt)}`
                          : "Tecknat avtal"
                        : f.statusInfo.beskrivning}
                  </p>
                </td>
                <td className="py-3 pr-3">
                  <p className="font-semibold text-foreground">
                    {f.aktivitet.antalAnvandare}
                  </p>
                  {f.medlemmar.length > 0 ? (
                    <p className="mt-1 max-w-[14rem] text-xs text-muted">
                      {f.medlemmar
                        .map((m) => m.namn || m.epost)
                        .slice(0, 3)
                        .join(", ")}
                      {f.medlemmar.length > 3
                        ? ` +${f.medlemmar.length - 3}`
                        : ""}
                    </p>
                  ) : (
                    <p className="text-xs text-muted">Inga användare</p>
                  )}
                </td>
                <td className="py-3 pr-3">
                  <p className="font-semibold text-foreground">
                    {f.aktivitet.inloggningarTotalt}
                    <span className="font-normal text-muted"> totalt</span>
                  </p>
                  <p className="text-xs text-muted">
                    {f.aktivitet.inloggningar7Dagar} / 7 d ·{" "}
                    {f.aktivitet.inloggningar30Dagar} / 30 d
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Senast: {formatTid(f.aktivitet.senasteInloggning)}
                  </p>
                </td>
                <td className="py-3 pr-3 whitespace-nowrap text-muted">
                  {formatDatum(f.skapadTidpunkt)}
                </td>
                <td className="py-3">
                  <p className="text-foreground">
                    {f.kontaktperson || f.epost || "—"}
                  </p>
                  {f.kontaktperson && f.epost ? (
                    <p className="text-xs text-muted">{f.epost}</p>
                  ) : null}
                </td>
              </tr>
            ))}
            {!laddar && filtrerade.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-muted">
                  {foreningar.length === 0
                    ? "Inga föreningar skapade ännu."
                    : "Inga föreningar matchar filtret."}
                </td>
              </tr>
            ) : null}
            {laddar ? (
              <tr>
                <td colSpan={6} className="py-6 text-muted">
                  Laddar föreningar …
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
