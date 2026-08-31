"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  FORENING_AKTIV_EVENT,
  lasAktivForeningId,
  lasForeningProfil,
} from "@/lib/forening-registry";
import { hamtaLokalKonto, listaLokalaKontonForForening } from "@/lib/auth/lokal-konto";

type MedlemRad = {
  kontoId: string;
  namn: string;
  epost: string;
  roll: string;
  aktiv: boolean;
  senasteInloggning: string | null;
  arJag: boolean;
};

type HistorikRad = {
  id: string;
  epost: string;
  lyckad: boolean;
  tidpunkt: string;
  ip: string;
};

type Statistik = {
  totaltLyckade: number;
  totaltMisslyckade: number;
  senaste7Dagar: number;
  senaste24Timmar: number;
  unikaEposter7Dagar: number;
};

function formatTid(iso: string | null): string {
  if (!iso) return "Aldrig";
  try {
    return new Date(iso).toLocaleString("sv-SE");
  } catch {
    return iso;
  }
}

/**
 * Visar vilka som har inloggning, statistik, och endast den inloggades eget lösenord.
 */
export function ForeningInloggningsPanel() {
  const [foreningId, setForeningId] = useState("");
  const [foreningsNamn, setForeningsNamn] = useState("");
  const [medlemmar, setMedlemmar] = useState<MedlemRad[]>([]);
  const [historik, setHistorik] = useState<HistorikRad[]>([]);
  const [statistik, setStatistik] = useState<Statistik | null>(null);
  const [mittLosenord, setMittLosenord] = useState<string | null>(null);
  const [minEpost, setMinEpost] = useState<string | null>(null);
  const [visaLosenord, setVisaLosenord] = useState(false);
  const [losenMeddelande, setLosenMeddelande] = useState<string | null>(null);
  const [fel, setFel] = useState<string | null>(null);
  const [lokalLage, setLokalLage] = useState(false);

  const ladda = useCallback(async () => {
    const id = lasAktivForeningId();
    const profil = lasForeningProfil(id);
    setForeningId(id);
    setForeningsNamn(profil?.namn || "");
    setFel(null);

    const sessionRes = await fetch("/api/auth/session");
    const session = (await sessionRes.json()) as {
      inloggad?: boolean;
      epost?: string;
      foreningId?: string | null;
      typ?: string;
    };

    if (session.inloggad && session.epost) {
      setMinEpost(session.epost);
      const losRes = await fetch("/api/auth/mitt-losenord");
      if (losRes.ok) {
        const losData = (await losRes.json()) as {
          losenord?: string | null;
          meddelande?: string;
          lokalFallback?: boolean;
        };
        if (losData.lokalFallback) {
          const lokal = hamtaLokalKonto(session.epost);
          setMittLosenord(lokal?.losenord ?? null);
          setLosenMeddelande(
            lokal
              ? "Ditt lösenord (sparat i den här webbläsaren)."
              : losData.meddelande || null,
          );
        } else {
          setMittLosenord(losData.losenord ?? null);
          setLosenMeddelande(losData.meddelande || null);
        }
      }
    } else {
      // Inte serverinloggad — visa lokala konton för föreningen
      setMinEpost(null);
      setMittLosenord(null);
      const lokala = listaLokalaKontonForForening(id);
      setLokalLage(true);
      setMedlemmar(
        lokala.map((k) => ({
          kontoId: k.epost,
          namn: k.namn,
          epost: k.epost,
          roll: k.roll,
          aktiv: true,
          senasteInloggning: null,
          arJag: false,
        })),
      );
      setHistorik([]);
      setStatistik(null);
      return;
    }

    setLokalLage(false);
    const res = await fetch(`/api/foreningar/${id}/inloggningar`);
    if (res.status === 503) {
      const lokala = listaLokalaKontonForForening(id);
      setLokalLage(true);
      setMedlemmar(
        lokala.map((k) => ({
          kontoId: k.epost,
          namn: k.namn,
          epost: k.epost,
          roll: k.roll,
          aktiv: true,
          senasteInloggning: null,
          arJag: session.epost === k.epost,
        })),
      );
      if (session.epost) {
        const lokal = hamtaLokalKonto(session.epost);
        if (lokal) {
          setMittLosenord(lokal.losenord);
          setLosenMeddelande("Ditt lösenord (sparat i den här webbläsaren).");
        }
      }
      return;
    }
    if (!res.ok) {
      setFel(
        res.status === 401
          ? "Logga in med e-post och lösenord för att se inloggningsöversikt."
          : "Kunde inte hämta inloggningsöversikt.",
      );
      return;
    }

    const data = (await res.json()) as {
      medlemmar: MedlemRad[];
      historik: HistorikRad[];
      statistik: Statistik;
      inloggadEpost?: string;
    };
    setMedlemmar(data.medlemmar || []);
    setHistorik(data.historik || []);
    setStatistik(data.statistik || null);
    if (data.inloggadEpost) setMinEpost(data.inloggadEpost);
  }, []);

  useEffect(() => {
    void ladda();
    const onBytt = () => void ladda();
    window.addEventListener(FORENING_AKTIV_EVENT, onBytt);
    return () => window.removeEventListener(FORENING_AKTIV_EVENT, onBytt);
  }, [ladda]);

  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        Inloggning
      </p>
      <h3 className="mt-1 text-lg font-bold text-foreground">
        Vem har inloggning{foreningsNamn ? ` — ${foreningsNamn}` : ""}
      </h3>
      <p className="mt-2 text-sm text-muted">
        Här syns vilka i styrelsen som har konto. Lösenord visas bara för dig
        som är inloggad — aldrig andras.
      </p>

      {fel ? (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          {fel}{" "}
          <Link href="/styrelse-login" className="font-medium underline">
            Logga in
          </Link>
        </p>
      ) : null}

      {minEpost ? (
        <div className="mt-4 rounded-lg border border-primary/30 bg-[#eef6f0] p-4">
          <p className="text-sm font-semibold text-primary-dark">
            Ditt lösenord ({minEpost})
          </p>
          <p className="mt-1 text-xs text-muted">{losenMeddelande}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {mittLosenord ? (
              <>
                <code className="rounded bg-white px-3 py-1.5 font-mono text-sm text-foreground">
                  {visaLosenord ? mittLosenord : "••••••••••••"}
                </code>
                <button
                  type="button"
                  onClick={() => setVisaLosenord((v) => !v)}
                  className="text-sm font-medium text-primary-dark underline"
                >
                  {visaLosenord ? "Dölj" : "Visa mitt lösenord"}
                </button>
              </>
            ) : (
              <p className="text-sm text-muted">
                Inget lösenord att visa —{" "}
                <Link href="/konto/byt-losenord" className="underline">
                  byt lösenord
                </Link>{" "}
                så sparas det för visning här.
              </p>
            )}
            <Link
              href="/konto/byt-losenord"
              className="text-sm font-medium text-primary-dark underline"
            >
              Byt lösenord
            </Link>
          </div>
        </div>
      ) : null}

      {statistik ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          {[
            ["Senaste 24 h", statistik.senaste24Timmar],
            ["Senaste 7 dagar", statistik.senaste7Dagar],
            ["Unika (7 dagar)", statistik.unikaEposter7Dagar],
            ["Misslyckade (lista)", statistik.totaltMisslyckade],
          ].map(([etikett, varde]) => (
            <div
              key={String(etikett)}
              className="rounded-lg border border-border bg-white px-3 py-3 text-center"
            >
              <p className="text-2xl font-bold text-foreground">{varde}</p>
              <p className="text-xs text-muted">{etikett}</p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border text-xs uppercase text-muted">
            <tr>
              <th className="py-2 pr-3">Namn</th>
              <th className="py-2 pr-3">E-post</th>
              <th className="py-2 pr-3">Roll</th>
              <th className="py-2 pr-3">Senaste inloggning</th>
              <th className="py-2">Lösenord</th>
            </tr>
          </thead>
          <tbody>
            {medlemmar.map((m) => (
              <tr key={m.kontoId} className="border-b border-border/60">
                <td className="py-2 pr-3 font-medium">
                  {m.namn || "—"}
                  {m.arJag ? (
                    <span className="ml-2 text-xs text-primary-dark">(du)</span>
                  ) : null}
                </td>
                <td className="py-2 pr-3">{m.epost}</td>
                <td className="py-2 pr-3">{m.roll}</td>
                <td className="py-2 pr-3 whitespace-nowrap">
                  {formatTid(m.senasteInloggning)}
                </td>
                <td className="py-2 text-muted">
                  {m.arJag
                    ? visaLosenord && mittLosenord
                      ? mittLosenord
                      : "Se ovan"
                    : "—"}
                </td>
              </tr>
            ))}
            {medlemmar.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-4 text-muted">
                  {lokalLage
                    ? "Inga lokala inloggningskonton för den här föreningen ännu."
                    : "Inga konton kopplade ännu."}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {historik.length > 0 ? (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-foreground">
            När någon loggat in
          </h4>
          <ul className="mt-2 max-h-64 space-y-1 overflow-y-auto text-sm">
            {historik.slice(0, 40).map((h) => (
              <li
                key={h.id}
                className="flex flex-wrap gap-2 border-b border-border/40 py-1.5 text-muted"
              >
                <span className="whitespace-nowrap text-foreground">
                  {formatTid(h.tidpunkt)}
                </span>
                <span>{h.epost}</span>
                <span className={h.lyckad ? "text-primary-dark" : "text-red-700"}>
                  {h.lyckad ? "OK" : "Misslyckad"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {!foreningId ? null : (
        <p className="mt-4 text-xs text-muted">
          Plattformsadmin ser samma typ av statistik centralt under /plattform —
          aldrig andras lösenord.
        </p>
      )}
    </div>
  );
}
