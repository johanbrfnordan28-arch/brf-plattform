"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  aterstallForeningFranBackup,
  byggForeningBackup,
  formatBackupDatum,
  laddaNerForeningSakerhetskopia,
  valideraForeningBackup,
} from "@/lib/forening-backup";
import { hamtaServerAccessNyckel } from "@/lib/forening-server-sync";
import {
  arGrundmallForening,
  FORENING_AKTIV_EVENT,
  lasAktivForeningId,
  lasForeningProfil,
} from "@/lib/forening-registry";

type KopiaRad = {
  id: string;
  foreningsNamn: string;
  filnamn: string;
  exportedAt: string;
  antalNycklar: number;
  storlekBytes: number;
};

function authHeaders(foreningId: string): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const access = hamtaServerAccessNyckel(foreningId);
  if (access) headers["x-access-nyckel"] = access;
  return headers;
}

/**
 * Säkerhetskopiering till våra servrar + återställning av tidigare version
 * (visas med föreningsnamn och datum).
 */
export function ForeningSakerhetskopieringPanel() {
  const [redo, setRedo] = useState(false);
  const [foreningId, setForeningId] = useState("");
  const [foreningsNamn, setForeningsNamn] = useState("");
  const [arGrundmall, setArGrundmall] = useState(true);
  const [kopior, setKopior] = useState<KopiaRad[]>([]);
  const [meddelande, setMeddelande] = useState<string | null>(null);
  const [fel, setFel] = useState<string | null>(null);
  const [sparar, setSparar] = useState(false);
  const [laddarLista, setLaddarLista] = useState(false);
  const [aterstallerId, setAterstallerId] = useState<string | null>(null);
  const filInputRef = useRef<HTMLInputElement>(null);

  const laddaProfil = useCallback(() => {
    const id = lasAktivForeningId();
    const grundmall = arGrundmallForening(id);
    setArGrundmall(grundmall);
    setForeningId(id);
    setForeningsNamn(lasForeningProfil(id)?.namn?.trim() || "");
    setRedo(true);
  }, []);

  const laddaKopior = useCallback(async (id: string) => {
    if (!id || arGrundmallForening(id)) {
      setKopior([]);
      return;
    }
    setLaddarLista(true);
    try {
      const res = await fetch(`/api/foreningar/${encodeURIComponent(id)}/sakerhetskopior`, {
        headers: authHeaders(id),
      });
      if (res.status === 503) {
        setKopior([]);
        return;
      }
      if (!res.ok) {
        const data = (await res.json()) as { fel?: string };
        setFel(data.fel || "Kunde inte hämta säkerhetskopior från servern.");
        setKopior([]);
        return;
      }
      const data = (await res.json()) as { kopior: KopiaRad[] };
      setKopior(data.kopior || []);
    } catch {
      setFel("Kunde inte nå servern för säkerhetskopior.");
    } finally {
      setLaddarLista(false);
    }
  }, []);

  useEffect(() => {
    laddaProfil();
    window.addEventListener(FORENING_AKTIV_EVENT, laddaProfil);
    return () => window.removeEventListener(FORENING_AKTIV_EVENT, laddaProfil);
  }, [laddaProfil]);

  useEffect(() => {
    if (!redo || arGrundmall || !foreningId) return;
    void laddaKopior(foreningId);
  }, [redo, arGrundmall, foreningId, laddaKopior]);

  async function sparaTillServer() {
    setMeddelande(null);
    setFel(null);
    const backup = byggForeningBackup(foreningId);
    if (!backup) {
      setFel("Kunde inte skapa säkerhetskopia.");
      return;
    }
    setSparar(true);
    try {
      const res = await fetch(
        `/api/foreningar/${encodeURIComponent(foreningId)}/sakerhetskopior`,
        {
          method: "POST",
          headers: authHeaders(foreningId),
          body: JSON.stringify({ backup }),
        },
      );
      const data = (await res.json()) as { fel?: string; kopia?: KopiaRad };
      if (!res.ok) {
        setFel(data.fel || "Kunde inte spara på servern.");
        return;
      }
      setMeddelande(
        `Säkerhetskopia sparad på våra servrar: ${data.kopia?.foreningsNamn || foreningsNamn} · ${formatBackupDatum(data.kopia?.exportedAt || backup.exportedAt)}.`,
      );
      await laddaKopior(foreningId);
    } catch {
      setFel("Kunde inte nå servern.");
    } finally {
      setSparar(false);
    }
  }

  function laddaNerLokalt() {
    setMeddelande(null);
    setFel(null);
    const resultat = laddaNerForeningSakerhetskopia(foreningId);
    if (!resultat.ok) {
      setFel(resultat.fel || "Kunde inte skapa säkerhetskopia.");
      return;
    }
    setMeddelande(
      `Även nedladdad som fil (${resultat.filnamn}). Primär lagring sker på våra servrar.`,
    );
  }

  async function aterstallFranServer(kopiaId: string, etikett: string) {
    const bekrafta = window.confirm(
      `Återställ säkerhetskopian «${etikett}»?\n\nNuvarande data i webbläsaren för föreningen skrivs över.`,
    );
    if (!bekrafta) return;

    setMeddelande(null);
    setFel(null);
    setAterstallerId(kopiaId);
    try {
      const res = await fetch(
        `/api/foreningar/${encodeURIComponent(foreningId)}/sakerhetskopior/${encodeURIComponent(kopiaId)}`,
        { headers: authHeaders(foreningId) },
      );
      const data = (await res.json()) as { fel?: string; backup?: unknown };
      if (!res.ok || !data.backup) {
        setFel(data.fel || "Kunde inte hämta säkerhetskopian.");
        return;
      }
      const backup = valideraForeningBackup(data.backup);
      if (typeof backup === "string") {
        setFel(backup);
        return;
      }
      const resultat = aterstallForeningFranBackup(backup, {
        kravForeningId: foreningId,
      });
      if (!resultat.ok) {
        setFel(resultat.fel || "Återställning misslyckades.");
        return;
      }
      setMeddelande(
        `Återställt: ${backup.profil?.namn || foreningsNamn} · ${formatBackupDatum(backup.exportedAt)}. Ladda om sidan om något syns fel.`,
      );
      laddaProfil();
    } catch {
      setFel("Kunde inte återställa från servern.");
    } finally {
      setAterstallerId(null);
    }
  }

  async function taBortKopia(kopiaId: string) {
    if (!window.confirm("Ta bort denna säkerhetskopia från servern?")) return;
    setFel(null);
    try {
      const res = await fetch(
        `/api/foreningar/${encodeURIComponent(foreningId)}/sakerhetskopior/${encodeURIComponent(kopiaId)}`,
        { method: "DELETE", headers: authHeaders(foreningId) },
      );
      const data = (await res.json()) as { fel?: string };
      if (!res.ok) {
        setFel(data.fel || "Kunde inte ta bort.");
        return;
      }
      setMeddelande("Säkerhetskopian togs bort från servern.");
      await laddaKopior(foreningId);
    } catch {
      setFel("Kunde inte ta bort.");
    }
  }

  function hanteraFilUppladdning(file: File | null) {
    if (!file) return;
    setMeddelande(null);
    setFel(null);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result || "");
        const raw = JSON.parse(text) as unknown;
        const backup = valideraForeningBackup(raw);
        if (typeof backup === "string") {
          setFel(backup);
          return;
        }
        const etikett = `${backup.profil?.namn || backup.foreningId} · ${formatBackupDatum(backup.exportedAt)}`;
        const bekrafta = window.confirm(
          `Ladda upp och återställ «${etikett}»?\n\nNuvarande data skrivs över.`,
        );
        if (!bekrafta) return;

        const resultat = aterstallForeningFranBackup(backup, {
          kravForeningId: foreningId,
        });
        if (!resultat.ok) {
          setFel(resultat.fel || "Återställning misslyckades.");
          return;
        }
        setMeddelande(`Återställt från fil: ${etikett}.`);
        // Spara även till servern så versionen finns där
        void (async () => {
          try {
            await fetch(
              `/api/foreningar/${encodeURIComponent(foreningId)}/sakerhetskopior`,
              {
                method: "POST",
                headers: authHeaders(foreningId),
                body: JSON.stringify({ backup }),
              },
            );
            await laddaKopior(foreningId);
          } catch {
            /* lokal återställning lyckades ändå */
          }
        })();
        laddaProfil();
      } catch {
        setFel("Kunde inte läsa JSON-filen.");
      }
    };
    reader.readAsText(file);
    if (filInputRef.current) filInputRef.current.value = "";
  }

  if (!redo || arGrundmall) return null;

  return (
    <section
      id="sakerhetskopiering"
      className="scroll-mt-24 rounded-xl border border-border bg-white p-5 sm:p-6"
      aria-labelledby="sakerhetskopiering-rubrik"
    >
      <h2
        id="sakerhetskopiering-rubrik"
        className="text-lg font-bold text-foreground"
      >
        Säkerhetskopiering
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Säkerhetskopior för{" "}
        <strong className="font-medium text-foreground">
          {foreningsNamn || "er förening"}
        </strong>{" "}
        sparas på våra servrar. Ni kan återställa en tidigare version — listan
        visar föreningsnamn och datum. Ni kan också ladda upp en tidigare
        nedladdad fil.
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <button
          type="button"
          disabled={sparar}
          onClick={() => void sparaTillServer()}
          className="brf-knapp-gron px-5 py-2.5 text-sm shadow-sm disabled:opacity-50"
        >
          {sparar ? "Sparar …" : "Spara säkerhetskopia på servern"}
        </button>
        <button
          type="button"
          onClick={laddaNerLokalt}
          className="rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium hover:border-primary/40"
        >
          Ladda ner som fil
        </button>
        <label className="inline-flex cursor-pointer rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium hover:border-primary/40">
          Ladda upp tidigare version
          <input
            ref={filInputRef}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={(e) =>
              hanteraFilUppladdning(e.target.files?.[0] ?? null)
            }
          />
        </label>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-foreground">
          Sparade versioner på servern
        </h3>
        {laddarLista ? (
          <p className="mt-2 text-sm text-muted">Laddar …</p>
        ) : kopior.length === 0 ? (
          <p className="mt-2 text-sm text-muted">
            Inga säkerhetskopior på servern ännu. Tryck »Spara säkerhetskopia på
            servern«.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-border rounded-xl border border-border">
            {kopior.map((k) => {
              const etikett = `${k.foreningsNamn} · ${formatBackupDatum(k.exportedAt)}`;
              return (
                <li
                  key={k.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium text-foreground">
                      {k.foreningsNamn}
                    </p>
                    <p className="text-xs text-muted">
                      {formatBackupDatum(k.exportedAt)} · {k.antalNycklar}{" "}
                      dataposter
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={aterstallerId === k.id}
                      onClick={() => void aterstallFranServer(k.id, etikett)}
                      className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
                    >
                      {aterstallerId === k.id ? "Återställer …" : "Återställ"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void taBortKopia(k.id)}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-surface"
                    >
                      Ta bort
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {meddelande && (
        <p
          className="mt-3 rounded-lg border border-primary/30 bg-[#eef6f0] px-3 py-2 text-sm text-primary-dark"
          role="status"
        >
          {meddelande}
        </p>
      )}
      {fel && (
        <p
          className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {fel}
        </p>
      )}
    </section>
  );
}
