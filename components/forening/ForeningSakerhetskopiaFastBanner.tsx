"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  byggForeningBackup,
  sparaBackupTillServerBestEffort,
} from "@/lib/forening-backup";
import {
  FORENING_BACKUP_KORT,
  FORENING_BACKUP_MODULER,
  modulerFranBackupNycklar,
} from "@/lib/forening-backup-omfattning";
import {
  arGrundmallForening,
  FORENING_AKTIV_EVENT,
  lasAktivForeningId,
  lasForeningProfil,
} from "@/lib/forening-registry";

type Props = {
  className?: string;
};

/**
 * Fast (sticky) banner — hela plattformens föreningsdata, alla /forening/-moduler.
 */
export function ForeningSakerhetskopiaFastBanner({ className = "" }: Props) {
  const [foreningId, setForeningId] = useState("");
  const [sparar, setSparar] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const synkaId = useCallback(() => {
    setForeningId(lasAktivForeningId());
  }, []);

  useEffect(() => {
    synkaId();
    window.addEventListener(FORENING_AKTIV_EVENT, synkaId);
    return () => window.removeEventListener(FORENING_AKTIV_EVENT, synkaId);
  }, [synkaId]);

  if (!foreningId || arGrundmallForening(foreningId)) {
    return null;
  }

  const namn = lasForeningProfil(foreningId)?.namn?.trim() || "er förening";

  async function sparaNu() {
    setSparar(true);
    setStatus(null);
    const backup = byggForeningBackup(foreningId);
    const ok = await sparaBackupTillServerBestEffort(foreningId);
    setSparar(false);
    if (!ok) {
      setStatus(
        "Kunde inte spara på servern — öppna Föreningsuppgifter eller ladda ner som fil.",
      );
      return;
    }
    const moduler = backup
      ? modulerFranBackupNycklar(foreningId, backup.keys)
      : [];
    const modulText =
      moduler.length > 0
        ? ` Inkluderade bl.a.: ${moduler.slice(0, 6).join(", ")}${moduler.length > 6 ? " …" : ""}.`
        : "";
    setStatus(`Säkerhetskopia sparad på servern (${Object.keys(backup?.keys ?? {}).length} dataposter).${modulText}`);
  }

  return (
    <div
      className={`sticky top-14 z-40 -mx-4 border-b border-primary/30 bg-[#e8f3ec]/95 px-4 py-2.5 shadow-sm backdrop-blur-sm sm:-mx-6 sm:px-6 ${className}`}
      role="region"
      aria-label="Säkerhetskopiering"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm leading-snug text-foreground">
            <span className="font-semibold text-primary-dark">
              Säkerhetskopiera hela {namn}
            </span>
            <span className="text-muted"> — {FORENING_BACKUP_KORT}</span>
          </p>
          <details className="mt-1.5 text-xs text-muted">
            <summary className="cursor-pointer font-medium text-primary-dark">
              Vad ingår i kopian?
            </summary>
            <ul className="mt-1.5 list-disc space-y-0.5 pl-4">
              {FORENING_BACKUP_MODULER.map((rad) => (
                <li key={rad}>{rad}</li>
              ))}
            </ul>
          </details>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={sparar}
            onClick={() => void sparaNu()}
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-dark disabled:opacity-50 sm:text-sm"
          >
            {sparar ? "Sparar …" : "Spara säkerhetskopia nu"}
          </button>
          <Link
            href="/forening/uppgifter#sakerhetskopiering"
            className="rounded-lg border border-primary/40 bg-white px-3 py-1.5 text-xs font-semibold text-primary-dark hover:bg-[#eef6f0] sm:text-sm"
          >
            Återställ &amp; hantera kopior
          </Link>
        </div>
      </div>
      {status && (
        <p className="mt-2 text-xs text-primary-dark" role="status">
          {status}
        </p>
      )}
    </div>
  );
}
