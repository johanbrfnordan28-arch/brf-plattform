"use client";

import { useCallback, useEffect, useState } from "react";
import { sparaBackupTillServerBestEffort } from "@/lib/forening-backup";
import {
  arGrundmallForening,
  FORENING_AKTIV_EVENT,
  lasAktivForeningId,
} from "@/lib/forening-registry";

const knappKlass =
  "inline-flex h-9 items-center whitespace-nowrap rounded-lg border border-primary/45 bg-white px-3 text-sm font-semibold text-primary-dark hover:border-primary hover:bg-[#eef6f0] disabled:opacity-50";

/** Synlig säkerhetskopia bredvid inloggning / utloggning i headern. */
export function ForeningSakerhetskopiaHeaderKnapp() {
  const [foreningId, setForeningId] = useState("");
  const [sparar, setSparar] = useState(false);
  const [status, setStatus] = useState<"ok" | "fel" | null>(null);

  const synkaId = useCallback(() => {
    setForeningId(lasAktivForeningId());
  }, []);

  useEffect(() => {
    synkaId();
    window.addEventListener(FORENING_AKTIV_EVENT, synkaId);
    return () => window.removeEventListener(FORENING_AKTIV_EVENT, synkaId);
  }, [synkaId]);

  useEffect(() => {
    if (status == null) return;
    const t = window.setTimeout(() => setStatus(null), 4000);
    return () => window.clearTimeout(t);
  }, [status]);

  if (!foreningId || arGrundmallForening(foreningId)) {
    return null;
  }

  async function sparaNu() {
    setSparar(true);
    setStatus(null);
    const ok = await sparaBackupTillServerBestEffort(foreningId);
    setSparar(false);
    setStatus(ok ? "ok" : "fel");
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <button
        type="button"
        disabled={sparar}
        onClick={() => void sparaNu()}
        className={knappKlass}
        title="Sparar föreningens data på servern"
      >
        {sparar ? "Sparar …" : "Spara säkerhetskopia"}
      </button>
      {status === "ok" ? (
        <span className="hidden text-xs font-medium text-primary-dark sm:inline" role="status">
          Sparad
        </span>
      ) : null}
      {status === "fel" ? (
        <span className="hidden text-xs font-medium text-red-700 sm:inline" role="alert">
          Misslyckades
        </span>
      ) : null}
    </span>
  );
}
