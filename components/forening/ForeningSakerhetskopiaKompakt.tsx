"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import {
  aterstallForeningFranBackup,
  byggForeningBackup,
  laddaNerForeningSakerhetskopia,
  sparaBackupTillServerBestEffort,
  valideraForeningBackup,
} from "@/lib/forening-backup";
import {
  arGrundmallForening,
  lasAktivForeningId,
  lasForeningProfil,
} from "@/lib/forening-registry";
import { hamtaServerAccessNyckel } from "@/lib/forening-server-sync";

type Props = {
  /** Kort rubrik ovanför knapparna. */
  rubrik?: string;
  className?: string;
};

/**
 * Spara / ladda upp hela föreningens data (inkl. lägenhetsregister) — samma som under Föreningsuppgifter.
 */
export function ForeningSakerhetskopiaKompakt({
  rubrik = "Spara och återställ uppgifter",
  className = "",
}: Props) {
  const filInputRef = useRef<HTMLInputElement>(null);
  const [meddelande, setMeddelande] = useState<string | null>(null);
  const [fel, setFel] = useState<string | null>(null);
  const [sparar, setSparar] = useState(false);

  const foreningId = lasAktivForeningId();
  const arGrundmall = arGrundmallForening(foreningId);
  const foreningsNamn = lasForeningProfil(foreningId)?.namn?.trim() || "";

  const sparaPaServer = useCallback(async () => {
    setMeddelande(null);
    setFel(null);
    const backup = byggForeningBackup(foreningId);
    if (!backup) {
      setFel("Kunde inte skapa säkerhetskopia.");
      return;
    }
    setSparar(true);
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      const access = hamtaServerAccessNyckel(foreningId);
      if (access) headers["x-access-nyckel"] = access;

      const res = await fetch(
        `/api/foreningar/${encodeURIComponent(foreningId)}/sakerhetskopior`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ backup }),
        },
      );
      const data = (await res.json()) as { fel?: string };
      if (!res.ok) {
        setFel(data.fel || "Kunde inte spara på servern.");
        return;
      }
      setMeddelande(
        `Säkerhetskopia sparad för ${foreningsNamn || "föreningen"}.`,
      );
    } catch {
      setFel("Kunde inte nå servern.");
    } finally {
      setSparar(false);
    }
  }, [foreningId, foreningsNamn]);

  function laddaNerFil() {
    setMeddelande(null);
    setFel(null);
    const resultat = laddaNerForeningSakerhetskopia(foreningId);
    if (!resultat.ok) {
      setFel(resultat.fel || "Kunde inte skapa fil.");
      return;
    }
    setMeddelande(`Nedladdad: ${resultat.filnamn}`);
  }

  function laddaUppFil(file: File | null) {
    if (!file) return;
    setMeddelande(null);
    setFel(null);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const backup = valideraForeningBackup(JSON.parse(String(reader.result)));
        if (typeof backup === "string") {
          setFel(backup);
          return;
        }
        const bekrafta = window.confirm(
          "Ladda upp och återställa sparade uppgifter?\n\nNuvarande data ersätts. En automatisk kopia sparas först på servern om det går.",
        );
        if (!bekrafta) return;
        void sparaBackupTillServerBestEffort(foreningId).then(() => {
          const resultat = aterstallForeningFranBackup(backup, {
            kravForeningId: foreningId,
          });
          if (!resultat.ok) {
            setFel(resultat.fel || "Återställning misslyckades.");
            return;
          }
          window.location.reload();
        });
      } catch {
        setFel("Kunde inte läsa JSON-filen.");
      }
    };
    reader.readAsText(file);
    if (filInputRef.current) filInputRef.current.value = "";
  }

  if (arGrundmall) return null;

  return (
    <section
      className={`rounded-xl border border-border bg-white p-4 sm:p-5 ${className}`}
      aria-labelledby="sakerhetskopia-kompakt-rubrik"
    >
      <h3
        id="sakerhetskopia-kompakt-rubrik"
        className="text-sm font-bold text-foreground"
      >
        {rubrik}
      </h3>
      <p className="mt-1.5 text-xs leading-relaxed text-muted">
        Sparar allt ni fyllt i — lägenhetsregister, dokument och moduler. Om
        något försvinner kan ni ladda upp en tidigare version här eller under{" "}
        <Link
          href="/forening/uppgifter#sakerhetskopiering"
          className="font-medium text-primary-dark underline hover:no-underline"
        >
          Föreningsuppgifter → Säkerhetskopiering
        </Link>
        .
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={sparar}
          onClick={() => void sparaPaServer()}
          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
        >
          {sparar ? "Sparar …" : "Spara uppgifter på servern"}
        </button>
        <button
          type="button"
          onClick={laddaNerFil}
          className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium hover:border-primary/40"
        >
          Ladda ner som fil
        </button>
        <label className="inline-flex cursor-pointer rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium hover:border-primary/40">
          Ladda upp sparade uppgifter
          <input
            ref={filInputRef}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={(e) => laddaUppFil(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>
      {meddelande ? (
        <p className="mt-2 text-xs text-primary-dark" role="status">
          {meddelande}
        </p>
      ) : null}
      {fel ? (
        <p className="mt-2 text-xs text-red-800" role="alert">
          {fel}
        </p>
      ) : null}
    </section>
  );
}
