"use client";

import { useMemo, useState } from "react";
import {
  klassificeraInternForeningStatus,
  type InternForeningStatus,
} from "@/lib/plattform-forening-status";

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
  medlemmar: Array<{ roll: string; epost: string; namn: string }>;
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
  test: "Testföreningar",
  kund: "Accepterat avtal",
  utgangen: "Utgångna tester",
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

type Props = {
  foreningar: PlattformForeningRad[];
  laddar?: boolean;
};

/**
 * Intern översikt: skapade föreningar, test vs accepterat avtal.
 */
export function PlattformForeningarOversikt({ foreningar, laddar }: Props) {
  const [filter, setFilter] = useState<Filter>("alla");

  const berikade = useMemo(
    () =>
      foreningar.map((f) => ({
        ...f,
        statusInfo: klassificeraInternForeningStatus({
          avtalGodkant: f.avtalGodkant,
          skapadTidpunkt: f.skapadTidpunkt,
        }),
      })),
    [foreningar],
  );

  const sammanfattning = useMemo(() => {
    const bas = { totalt: berikade.length, test: 0, kund: 0, utgangen: 0 };
    for (const f of berikade) {
      bas[f.statusInfo.status] += 1;
    }
    return bas;
  }, [berikade]);

  const filtrerade = useMemo(() => {
    if (filter === "alla") return berikade;
    return berikade.filter((f) => f.statusInfo.status === filter);
  }, [berikade, filter]);

  return (
    <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">Föreningar</h2>
          <p className="mt-1 text-sm text-muted">
            Alla skapade föreningar — vilka som är test och vilka som accepterat
            avtalet/offerten.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-center text-xs">
          {(
            [
              ["Totalt", sammanfattning.totalt],
              ["Test", sammanfattning.test],
              ["Avtal", sammanfattning.kund],
              ["Utgångna", sammanfattning.utgangen],
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

      <div className="mt-4 flex flex-wrap gap-2">
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
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border text-xs uppercase text-muted">
            <tr>
              <th className="py-2 pr-3">Förening</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2 pr-3">Skapad</th>
              <th className="py-2 pr-3">Avtal / BankID</th>
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
                  <p className="mt-0.5 font-mono text-[11px] text-muted">
                    {f.id}
                  </p>
                </td>
                <td className="py-3 pr-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadgeClass(f.statusInfo.status)}`}
                  >
                    {f.statusInfo.etikett}
                  </span>
                  <p className="mt-1 text-xs text-muted">
                    {f.statusInfo.status === "test" &&
                    f.statusInfo.dagarKvar != null
                      ? `${f.statusInfo.dagarKvar} dagar kvar`
                      : f.statusInfo.beskrivning}
                  </p>
                </td>
                <td className="py-3 pr-3 whitespace-nowrap text-muted">
                  {formatDatum(f.skapadTidpunkt)}
                </td>
                <td className="py-3 pr-3">
                  {f.avtalGodkant ? (
                    <>
                      <p className="font-medium text-foreground">Godkänt</p>
                      <p className="text-xs text-muted">
                        {formatTid(f.avtalGodkantTidpunkt)}
                      </p>
                      {f.avtalBankidNamn ? (
                        <p className="mt-1 text-xs text-muted">
                          BankID: {f.avtalBankidNamn}
                          {f.avtalBankidTidpunkt
                            ? ` · ${formatTid(f.avtalBankidTidpunkt)}`
                            : ""}
                        </p>
                      ) : null}
                    </>
                  ) : (
                    <span className="text-muted">Ej accepterat</span>
                  )}
                </td>
                <td className="py-3">
                  <p className="text-foreground">
                    {f.kontaktperson || f.epost || "—"}
                  </p>
                  {f.kontaktperson && f.epost ? (
                    <p className="text-xs text-muted">{f.epost}</p>
                  ) : null}
                  {f.medlemmar.length > 0 ? (
                    <p className="mt-1 text-xs text-muted">
                      {f.medlemmar
                        .map((m) => `${m.namn || m.epost} (${m.roll})`)
                        .join(", ")}
                    </p>
                  ) : null}
                </td>
              </tr>
            ))}
            {!laddar && filtrerade.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-muted">
                  {foreningar.length === 0
                    ? "Inga föreningar skapade ännu."
                    : "Inga föreningar matchar filtret."}
                </td>
              </tr>
            ) : null}
            {laddar ? (
              <tr>
                <td colSpan={5} className="py-6 text-muted">
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
