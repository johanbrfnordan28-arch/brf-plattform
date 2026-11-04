"use client";

import { useCallback, useEffect, useState } from "react";
import { sparaBackupTillServerBestEffort } from "@/lib/forening-backup";
import { FORENING_LOGGA_UT_BACKUP_RAD } from "@/lib/forening-backup-omfattning";
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
 * Kompakt rad i modulen — sparar på plats utan att navigera bort.
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

  useEffect(() => {
    if (!status) return;
    const t = window.setTimeout(() => setStatus(null), 5000);
    return () => window.clearTimeout(t);
  }, [status]);

  if (!foreningId || arGrundmallForening(foreningId)) {
    return null;
  }

  const namn = lasForeningProfil(foreningId)?.namn?.trim() || "er förening";

  async function sparaNu() {
    setSparar(true);
    setStatus(null);
    const ok = await sparaBackupTillServerBestEffort(foreningId);
    setSparar(false);
    if (!ok) {
      setStatus("Kunde inte spara just nu. Försök igen om en stund.");
      return;
    }
    setStatus("Säkerhetskopia sparad.");
  }

  return (
    <div
      className={`rounded-xl border border-primary/25 bg-[#eef6f0]/80 px-4 py-2.5 sm:px-5 ${className}`}
      role="region"
      aria-label="Säkerhetskopiering"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1 text-sm text-foreground">
          <span className="font-semibold text-primary-dark">
            Säkerhetskopiera {namn}
          </span>
          <span className="text-muted"> — spara ert arbete på servern här i modulen.</span>
          <span className="mt-1 block text-xs text-muted">
            {FORENING_LOGGA_UT_BACKUP_RAD}
          </span>
        </div>
        <button
          type="button"
          disabled={sparar}
          onClick={() => void sparaNu()}
          className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-dark disabled:opacity-50 sm:text-sm"
        >
          {sparar ? "Sparar …" : "Spara säkerhetskopia"}
        </button>
      </div>
      {status ? (
        <p className="mt-2 text-xs font-medium text-primary-dark" role="status">
          {status}
        </p>
      ) : null}
    </div>
  );
}
