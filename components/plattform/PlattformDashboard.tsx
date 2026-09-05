"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  PlattformForeningarOversikt,
  type PlattformForeningRad,
  type PlattformForeningSammanfattning,
} from "@/components/plattform/PlattformForeningarOversikt";
import { PlattformAnvandarePanel } from "@/components/plattform/PlattformAnvandarePanel";
import { PlattformGrundmallPanel } from "@/components/plattform/PlattformGrundmallPanel";
import { PlattformMalPanel } from "@/components/plattform/PlattformMalPanel";
import { PLATTFORM_LOGIN_PATH } from "@/lib/auth/projekt-admin";

type Statistik = {
  totaltHandelser: number;
  lyckade24Timmar: number;
  lyckade7Dagar: number;
  misslyckade7Dagar: number;
  unikaAnvandare7Dagar: number;
  antalStyrelseKonton: number;
};

type KontoRad = {
  kontoId: string;
  epost: string;
  namn: string;
  senasteInloggning: string | null;
  foreningar: Array<{ id: string; namn: string; roll: string }>;
};

type Inloggning = {
  id: string;
  epost: string;
  typ: string;
  lyckad: boolean;
  foreningsNamn: string | null;
  tidpunkt: string;
  ip: string;
};

type MejlRad = {
  id: string;
  till: string;
  amne: string;
  brodtext: string;
  skickadVia: string;
  skapadTidpunkt: string;
};

type MittLosenord = {
  epost: string;
  losenord: string | null;
  meddelande?: string;
};

function formatTid(iso: string | null): string {
  if (!iso) return "Aldrig";
  try {
    return new Date(iso).toLocaleString("sv-SE");
  } catch {
    return iso;
  }
}

export function PlattformDashboard() {
  const [epost, setEpost] = useState<string | null>(null);
  const [forbjuden, setForbjuden] = useState<boolean | null>(null);
  const [statistik, setStatistik] = useState<Statistik | null>(null);
  const [konton, setKonton] = useState<KontoRad[]>([]);
  const [inloggningar, setInloggningar] = useState<Inloggning[]>([]);
  const [mejl, setMejl] = useState<MejlRad[]>([]);
  const [foreningar, setForeningar] = useState<PlattformForeningRad[]>([]);
  const [foreningSammanfattning, setForeningSammanfattning] =
    useState<PlattformForeningSammanfattning>({
      totalt: 0,
      test: 0,
      kund: 0,
      utgangen: 0,
    });
  const [laddarForeningar, setLaddarForeningar] = useState(true);
  const [mittLosenord, setMittLosenord] = useState<MittLosenord | null>(null);
  const [visaMittLosenord, setVisaMittLosenord] = useState(false);
  const [fel, setFel] = useState<string | null>(null);

  const ladda = useCallback(async () => {
    setFel(null);
    setLaddarForeningar(true);
    const sessionRes = await fetch("/api/auth/session");
    const session = (await sessionRes.json()) as {
      inloggad?: boolean;
      typ?: string;
      epost?: string;
    };
    if (!session.inloggad || session.typ !== "PLATTFORM") {
      setForbjuden(true);
      setLaddarForeningar(false);
      return;
    }
    setEpost(session.epost || null);
    setForbjuden(false);

    const [statRes, mejlRes, losRes, foreningRes] = await Promise.all([
      fetch("/api/plattform/statistik"),
      fetch("/api/plattform/mejl-outbox"),
      fetch("/api/auth/mitt-losenord"),
      fetch("/api/plattform/foreningar"),
    ]);

    if (!statRes.ok || !mejlRes.ok) {
      setFel("Kunde inte ladda plattformsdata.");
      setLaddarForeningar(false);
      return;
    }

    const statData = (await statRes.json()) as {
      statistik: Statistik;
      kontonMedInloggning: KontoRad[];
      senasteInloggningar: Inloggning[];
    };
    const mejlData = (await mejlRes.json()) as { mejl: MejlRad[] };
    setStatistik(statData.statistik);
    setKonton(statData.kontonMedInloggning || []);
    setInloggningar(statData.senasteInloggningar || []);
    setMejl(mejlData.mejl || []);

    if (foreningRes.ok) {
      const foreningData = (await foreningRes.json()) as {
        foreningar: PlattformForeningRad[];
      };
      setForeningar(foreningData.foreningar || []);
    } else if (foreningRes.status === 503) {
      setFel(
        "Databasen är inte konfigurerad — föreningsöversikten kräver DATABASE_URL.",
      );
      setForeningar([]);
    } else {
      setFel("Kunde inte ladda föreningsöversikten.");
      setForeningar([]);
    }
    setLaddarForeningar(false);

    if (losRes.ok) {
      const losData = (await losRes.json()) as MittLosenord;
      setMittLosenord(losData);
    }
  }, []);

  useEffect(() => {
    void ladda();
  }, [ladda]);

  async function loggaUt() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = PLATTFORM_LOGIN_PATH;
  }

  if (forbjuden === null) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center text-sm text-muted">
        Kontrollerar behörighet …
      </div>
    );
  }

  if (forbjuden) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-border bg-white p-6 text-center shadow-sm">
        <p className="text-sm text-muted">
          Denna sida är inte publik. Du behöver behörig personalinloggning.
        </p>
        <Link
          href={PLATTFORM_LOGIN_PATH}
          className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
        >
          Logga in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Intern yta — endast behörig personal
          </p>
          <h1 className="text-2xl font-bold text-foreground">Plattform</h1>
          {epost ? (
            <p className="mt-1 text-sm text-muted">
              Inloggad som {epost}. Här syns skapade föreningar, testperioder och
              accepterade avtal.
            </p>
          ) : null}
        </div>
        <div className="flex gap-2">
          <Link
            href="/konto/byt-losenord"
            className="rounded-lg border border-border px-3 py-2 text-sm font-medium"
          >
            Byt lösenord
          </Link>
          <button
            type="button"
            onClick={() => void loggaUt()}
            className="rounded-lg border border-border px-3 py-2 text-sm font-medium"
          >
            Logga ut
          </button>
        </div>
      </header>

      {fel ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {fel}
        </p>
      ) : null}

      {mittLosenord ? (
        <section className="rounded-2xl border border-primary/30 bg-[#eef6f0] p-5 shadow-sm">
          <h2 className="text-base font-bold text-foreground">
            Ditt plattformslösenord
          </h2>
          <p className="mt-1 text-sm text-muted">
            Endast du som är inloggad ser detta — aldrig styrelsen eller andra
            adminars lösenord.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <code className="rounded bg-white px-3 py-1.5 font-mono text-sm">
              {visaMittLosenord && mittLosenord.losenord
                ? mittLosenord.losenord
                : "••••••••••••"}
            </code>
            <button
              type="button"
              onClick={() => setVisaMittLosenord((v) => !v)}
              className="text-sm font-medium text-primary-dark underline"
              disabled={!mittLosenord.losenord}
            >
              {visaMittLosenord ? "Dölj" : "Visa mitt lösenord"}
            </button>
          </div>
        </section>
      ) : null}

      <PlattformMalPanel
        aktuelltAvtal={foreningSammanfattning.kund}
        aktuelltTest={foreningSammanfattning.test}
        avslutadePerioder={foreningSammanfattning.utgangen}
      />

      <PlattformGrundmallPanel />

      <PlattformForeningarOversikt
        foreningar={foreningar}
        laddar={laddarForeningar}
        onSammanfattning={setForeningSammanfattning}
      />

      <PlattformAnvandarePanel />

      {statistik ? (
        <section className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {(
            [
              ["24 timmar", statistik.lyckade24Timmar],
              ["7 dagar", statistik.lyckade7Dagar],
              ["Unika (7 d)", statistik.unikaAnvandare7Dagar],
              ["Misslyckade (7 d)", statistik.misslyckade7Dagar],
              ["Styrelsekonton", statistik.antalStyrelseKonton],
              ["Totalt i logg", statistik.totaltHandelser],
            ] as const
          ).map(([etikett, varde]) => (
            <div
              key={etikett}
              className="rounded-2xl border border-border bg-white px-3 py-4 text-center shadow-sm"
            >
              <p className="text-2xl font-bold text-foreground">{varde}</p>
              <p className="text-xs text-muted">{etikett}</p>
            </div>
          ))}
        </section>
      ) : null}

      <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-foreground">
          Vem har inloggning
        </h2>
        <p className="mt-1 text-sm text-muted">
          Styrelsekonton per förening. Lösenord visas inte här.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border text-xs uppercase text-muted">
              <tr>
                <th className="py-2 pr-3">Namn</th>
                <th className="py-2 pr-3">E-post</th>
                <th className="py-2 pr-3">Förening / roll</th>
                <th className="py-2">Senaste inloggning</th>
              </tr>
            </thead>
            <tbody>
              {konton.map((k) => (
                <tr key={k.kontoId} className="border-b border-border/60">
                  <td className="py-2 pr-3 font-medium">{k.namn || "—"}</td>
                  <td className="py-2 pr-3">{k.epost}</td>
                  <td className="py-2 pr-3">
                    {k.foreningar.length === 0
                      ? "—"
                      : k.foreningar
                          .map((f) => `${f.namn} (${f.roll})`)
                          .join(", ")}
                  </td>
                  <td className="py-2 whitespace-nowrap">
                    {formatTid(k.senasteInloggning)}
                  </td>
                </tr>
              ))}
              {konton.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 text-muted">
                    Inga styrelsekonton ännu.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-foreground">
          Inloggningsstatistik — vem och när
        </h2>
        <p className="mt-1 text-sm text-muted">
          Senaste händelserna (lyckade och misslyckade).
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border text-xs uppercase text-muted">
              <tr>
                <th className="py-2 pr-3">Tid</th>
                <th className="py-2 pr-3">E-post</th>
                <th className="py-2 pr-3">Typ</th>
                <th className="py-2 pr-3">Förening</th>
                <th className="py-2 pr-3">Resultat</th>
                <th className="py-2">IP</th>
              </tr>
            </thead>
            <tbody>
              {inloggningar.map((rad) => (
                <tr key={rad.id} className="border-b border-border/60">
                  <td className="py-2 pr-3 whitespace-nowrap">
                    {formatTid(rad.tidpunkt)}
                  </td>
                  <td className="py-2 pr-3">{rad.epost}</td>
                  <td className="py-2 pr-3">{rad.typ}</td>
                  <td className="py-2 pr-3">{rad.foreningsNamn || "—"}</td>
                  <td className="py-2 pr-3">
                    {rad.lyckad ? "OK" : "Misslyckad"}
                  </td>
                  <td className="py-2 text-muted">{rad.ip || "—"}</td>
                </tr>
              ))}
              {inloggningar.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 text-muted">
                    Inga inloggningar ännu.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-foreground">Mejl-outbox</h2>
        <p className="mt-1 text-sm text-muted">
          När SMTP/Resend saknas sparas mejl här (t.ex. tillfälliga lösenord).
        </p>
        <ul className="mt-3 space-y-3">
          {mejl.slice(0, 20).map((m) => (
            <li
              key={m.id}
              className="rounded-lg border border-border/80 px-3 py-3 text-sm"
            >
              <p className="font-medium">
                {m.amne}{" "}
                <span className="text-xs text-muted">({m.skickadVia})</span>
              </p>
              <p className="text-muted">Till: {m.till}</p>
              <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap rounded bg-surface p-2 text-xs text-foreground">
                {m.brodtext}
              </pre>
            </li>
          ))}
          {mejl.length === 0 ? (
            <li className="text-sm text-muted">Outboxen är tom.</li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}
