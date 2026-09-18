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
  borttagenTidpunkt?: string | null;
  borttagenAvEpost?: string;
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
  borttagna?: number;
  anvandareTotalt?: number;
  inloggningar7Dagar?: number;
};

type Filter = "alla" | InternForeningStatus;
type Vy = "aktiva" | "borttagna";
type DialogTyp = "borttag" | "aterstall" | "permanent" | null;

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
  borttagna?: PlattformForeningRad[];
  laddar?: boolean;
  onSammanfattning?: (s: PlattformForeningSammanfattning) => void;
  onReload?: () => void | Promise<void>;
};

/**
 * Intern översikt: skapade föreningar, aktivitet, test vs avtal vs avslutade.
 * Tvåstegs borttagning: flytta till borttagna → permanent radering.
 */
export function PlattformForeningarOversikt({
  foreningar,
  borttagna = [],
  laddar,
  onSammanfattning,
  onReload,
}: Props) {
  const [vy, setVy] = useState<Vy>("aktiva");
  const [filter, setFilter] = useState<Filter>("alla");
  const [sortering, setSortering] = useState<"skapad" | "aktivitet">("skapad");
  const [dialog, setDialog] = useState<DialogTyp>(null);
  const [valdForening, setValdForening] = useState<PlattformForeningRad | null>(
    null,
  );
  const [bekraftelseNamn, setBekraftelseNamn] = useState("");
  const [arbetar, setArbetar] = useState(false);
  const [meddelande, setMeddelande] = useState<string | null>(null);
  const [fel, setFel] = useState<string | null>(null);

  const kallaLista = vy === "aktiva" ? foreningar : borttagna;

  const berikade = useMemo(
    () =>
      kallaLista.map((f) => ({
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
    [kallaLista],
  );

  const sammanfattning = useMemo(() => {
    const bas: PlattformForeningSammanfattning = {
      totalt: foreningar.length,
      test: 0,
      kund: 0,
      utgangen: 0,
      borttagna: borttagna.length,
      anvandareTotalt: 0,
      inloggningar7Dagar: 0,
    };
    for (const f of foreningar.map((row) => ({
      ...row,
      statusInfo: klassificeraInternForeningStatus({
        avtalGodkant: row.avtalGodkant,
        skapadTidpunkt: row.skapadTidpunkt,
      }),
      aktivitet: row.aktivitet ?? {
        ...tomAktivitet(),
        antalAnvandare: row.medlemmar.length,
      },
    }))) {
      bas[f.statusInfo.status] += 1;
      bas.anvandareTotalt! += f.aktivitet!.antalAnvandare;
      bas.inloggningar7Dagar! += f.aktivitet!.inloggningar7Dagar;
    }
    return bas;
  }, [foreningar, borttagna.length]);

  useEffect(() => {
    onSammanfattning?.(sammanfattning);
  }, [onSammanfattning, sammanfattning]);

  const filtrerade = useMemo(() => {
    const lista =
      vy === "borttagna" || filter === "alla"
        ? [...berikade]
        : berikade.filter((f) => f.statusInfo.status === filter);
    if (sortering === "aktivitet") {
      lista.sort((a, b) => {
        const diff =
          b.aktivitet.inloggningar30Dagar - a.aktivitet.inloggningar30Dagar;
        if (diff !== 0) return diff;
        return b.aktivitet.antalAnvandare - a.aktivitet.antalAnvandare;
      });
    } else if (vy === "borttagna") {
      lista.sort((a, b) => {
        const ta = a.borttagenTidpunkt ?? "";
        const tb = b.borttagenTidpunkt ?? "";
        return tb.localeCompare(ta);
      });
    }
    return lista;
  }, [berikade, filter, sortering, vy]);

  function oppnaDialog(typ: DialogTyp, f: PlattformForeningRad) {
    setDialog(typ);
    setValdForening(f);
    setBekraftelseNamn("");
    setFel(null);
    setMeddelande(null);
  }

  function stangDialog() {
    if (arbetar) return;
    setDialog(null);
    setValdForening(null);
    setBekraftelseNamn("");
  }

  async function korAtgard() {
    if (!valdForening || !dialog) return;
    setArbetar(true);
    setFel(null);
    setMeddelande(null);

    try {
      if (dialog === "borttag") {
        const res = await fetch(
          `/api/plattform/foreningar/${valdForening.id}/borttag`,
          { method: "POST" },
        );
        const data = (await res.json()) as { fel?: string };
        if (!res.ok) throw new Error(data.fel || "Kunde inte flytta föreningen.");
        setMeddelande(`«${valdForening.namn}» flyttades till borttagna.`);
      } else if (dialog === "aterstall") {
        const res = await fetch(
          `/api/plattform/foreningar/${valdForening.id}/aterstall`,
          { method: "POST" },
        );
        const data = (await res.json()) as { fel?: string };
        if (!res.ok) throw new Error(data.fel || "Kunde inte återställa föreningen.");
        setMeddelande(`«${valdForening.namn}» är återställd.`);
      } else if (dialog === "permanent") {
        if (bekraftelseNamn.trim() !== valdForening.namn.trim()) {
          throw new Error("Namnet matchar inte — skriv föreningens namn exakt.");
        }
        const res = await fetch(
          `/api/plattform/foreningar/${valdForening.id}`,
          { method: "DELETE" },
        );
        const data = (await res.json()) as { fel?: string };
        if (!res.ok) throw new Error(data.fel || "Kunde inte radera föreningen.");
        setMeddelande(`«${valdForening.namn}» raderades permanent.`);
      }
      setDialog(null);
      setValdForening(null);
      setBekraftelseNamn("");
      await onReload?.();
    } catch (e) {
      setFel(e instanceof Error ? e.message : "Något gick fel.");
    } finally {
      setArbetar(false);
    }
  }

  const arKund = valdForening?.avtalGodkant ?? false;
  const namnMatchar =
    valdForening != null &&
    bekraftelseNamn.trim() === valdForening.namn.trim();

  return (
    <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">Föreningar</h2>
          <p className="mt-1 text-sm text-muted">
            Skapade sidor, aktivitet och avtal. Flytta testföreningar till
            borttagna innan permanent radering — då kan ni ångra misstag.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-center text-xs">
          {(
            [
              ["Aktiva", sammanfattning.totalt],
              ["Tester", sammanfattning.test],
              ["Avtal", sammanfattning.kund],
              ["Avslutade", sammanfattning.utgangen],
              ["Borttagna", sammanfattning.borttagna ?? 0],
              ["Användare", sammanfattning.anvandareTotalt ?? 0],
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

      {meddelande ? (
        <p className="mt-3 rounded-lg bg-[#e8f3ec] px-3 py-2 text-sm text-primary-dark">
          {meddelande}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setVy("aktiva");
            setFilter("alla");
          }}
          className={
            vy === "aktiva"
              ? "rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white"
              : "rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-foreground hover:border-primary/40"
          }
        >
          Aktiva ({sammanfattning.totalt})
        </button>
        <button
          type="button"
          onClick={() => setVy("borttagna")}
          className={
            vy === "borttagna"
              ? "rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white"
              : "rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-foreground hover:border-primary/40"
          }
        >
          Borttagna ({sammanfattning.borttagna ?? 0})
        </button>

        {vy === "aktiva"
          ? (Object.keys(FILTER_ETIKETTER) as Filter[]).map((nyckel) => (
              <button
                key={nyckel}
                type="button"
                onClick={() => setFilter(nyckel)}
                className={
                  filter === nyckel
                    ? "rounded-lg border border-primary bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary-dark"
                    : "rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-foreground hover:border-primary/40"
                }
              >
                {FILTER_ETIKETTER[nyckel]}
                {nyckel === "alla"
                  ? ` (${sammanfattning.totalt})`
                  : ` (${sammanfattning[nyckel]})`}
              </button>
            ))
          : null}

        <label className="ml-auto flex items-center gap-2 text-sm text-muted">
          Sortera
          <select
            value={sortering}
            onChange={(e) =>
              setSortering(e.target.value as "skapad" | "aktivitet")
            }
            className="rounded-lg border border-border bg-white px-2 py-1.5 text-foreground"
          >
            <option value="skapad">
              {vy === "borttagna" ? "Senast borttagen" : "Senast skapad"}
            </option>
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
              <th className="py-2 pr-3">
                {vy === "borttagna" ? "Borttagen" : "Skapad"}
              </th>
              <th className="py-2 pr-3">Kontakt</th>
              <th className="py-2">Åtgärder</th>
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
                  {vy === "borttagna" ? (
                    <>
                      <p>{formatDatum(f.borttagenTidpunkt)}</p>
                      {f.borttagenAvEpost ? (
                        <p className="text-xs">av {f.borttagenAvEpost}</p>
                      ) : null}
                    </>
                  ) : (
                    formatDatum(f.skapadTidpunkt)
                  )}
                </td>
                <td className="py-3 pr-3">
                  <p className="text-foreground">
                    {f.kontaktperson || f.epost || "—"}
                  </p>
                  {f.kontaktperson && f.epost ? (
                    <p className="text-xs text-muted">{f.epost}</p>
                  ) : null}
                </td>
                <td className="py-3">
                  {vy === "aktiva" ? (
                    <button
                      type="button"
                      onClick={() => oppnaDialog("borttag", f)}
                      className="rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-950 hover:bg-amber-100"
                    >
                      Flytta till borttagna
                    </button>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      <button
                        type="button"
                        onClick={() => oppnaDialog("aterstall", f)}
                        className="rounded-lg border border-primary/30 bg-[#e8f3ec] px-2.5 py-1 text-xs font-medium text-primary-dark hover:bg-primary/10"
                      >
                        Återställ
                      </button>
                      <button
                        type="button"
                        onClick={() => oppnaDialog("permanent", f)}
                        className="rounded-lg border border-red-300 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-900 hover:bg-red-100"
                      >
                        Radera permanent
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {!laddar && filtrerade.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-6 text-muted">
                  {vy === "borttagna"
                    ? "Inga borttagna föreningar."
                    : kallaLista.length === 0
                      ? "Inga föreningar skapade ännu."
                      : "Inga föreningar matchar filtret."}
                </td>
              </tr>
            ) : null}
            {laddar ? (
              <tr>
                <td colSpan={7} className="py-6 text-muted">
                  Laddar föreningar …
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {dialog && valdForening ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-white p-5 shadow-xl"
          >
            {dialog === "borttag" ? (
              <>
                <h3 className="text-lg font-bold text-foreground">
                  Flytta till borttagna?
                </h3>
                <p className="mt-2 text-sm text-muted">
                  <span className="font-medium text-foreground">
                    {valdForening.namn}
                  </span>{" "}
                  försvinner från aktiva listan. Styrelsen kan inte logga in
                  förrän föreningen återställs. All data finns kvar — ni kan
                  ångra från fliken Borttagna.
                </p>
                {arKund ? (
                  <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
                    Denna förening har tecknat avtal. Kontrollera noga att den
                    verkligen ska tas bort.
                  </p>
                ) : null}
              </>
            ) : null}

            {dialog === "aterstall" ? (
              <>
                <h3 className="text-lg font-bold text-foreground">
                  Återställ förening?
                </h3>
                <p className="mt-2 text-sm text-muted">
                  <span className="font-medium text-foreground">
                    {valdForening.namn}
                  </span>{" "}
                  flyttas tillbaka till aktiva föreningar och styrelsen kan
                  logga in igen.
                </p>
              </>
            ) : null}

            {dialog === "permanent" ? (
              <>
                <h3 className="text-lg font-bold text-red-900">
                  Radera permanent
                </h3>
                <p className="mt-2 text-sm text-muted">
                  All data för{" "}
                  <span className="font-medium text-foreground">
                    {valdForening.namn}
                  </span>{" "}
                  raderas från servern och kan inte återställas. Använd detta
                  för testföreningar som inte längre behövs.
                </p>
                <label className="mt-4 block text-sm">
                  <span className="font-medium text-foreground">
                    Skriv föreningens namn för att bekräfta
                  </span>
                  <input
                    type="text"
                    value={bekraftelseNamn}
                    onChange={(e) => setBekraftelseNamn(e.target.value)}
                    placeholder={valdForening.namn}
                    className="mt-1.5 w-full rounded-lg border border-border px-3 py-2 text-foreground"
                    autoComplete="off"
                  />
                </label>
              </>
            ) : null}

            {fel ? (
              <p className="mt-3 text-sm text-red-700">{fel}</p>
            ) : null}

            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={stangDialog}
                disabled={arbetar}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-surface disabled:opacity-50"
              >
                Avbryt
              </button>
              <button
                type="button"
                onClick={() => void korAtgard()}
                disabled={
                  arbetar ||
                  (dialog === "permanent" && !namnMatchar)
                }
                className={
                  dialog === "permanent"
                    ? "rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-50"
                    : dialog === "aterstall"
                      ? "rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
                      : "rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
                }
              >
                {arbetar
                  ? "Arbetar …"
                  : dialog === "borttag"
                    ? "Flytta till borttagna"
                    : dialog === "aterstall"
                      ? "Återställ"
                      : "Radera permanent"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
