"use client";

import Link from "next/link";
import { useState } from "react";
import { sparaBackupTillServerBestEffort } from "@/lib/forening-backup";
import { FORENING_BACKUP_KORT } from "@/lib/forening-backup-omfattning";
import {
  arGrundmallForening,
  lasAktivForeningId,
  lasForeningProfil,
} from "@/lib/forening-registry";

const rodKlass =
  "inline-flex h-9 items-center whitespace-nowrap rounded-lg bg-red-600 px-3.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50";

export function LoggaUtKnapp({ className }: { className?: string }) {
  const [loggarUt, setLoggarUt] = useState(false);
  const [visaDialog, setVisaDialog] = useState(false);
  const [spararKopia, setSpararKopia] = useState(false);
  const [backupMeddelande, setBackupMeddelande] = useState<string | null>(null);

  const [dialogForeningId, setDialogForeningId] = useState("");
  const dialogForeningsNamn =
    dialogForeningId !== ""
      ? lasForeningProfil(dialogForeningId)?.namn?.trim() || ""
      : "";

  async function loggaUt() {
    setLoggarUt(true);
    try {
      const { rensaLokalSession } = await import("@/lib/auth/lokal-session");
      rensaLokalSession();
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      /* fortsätt till startsidan ändå */
    }
    window.location.href = "/";
  }

  function onLoggaUtKlick() {
    const id = lasAktivForeningId();
    if (arGrundmallForening(id) || !id) {
      void loggaUt();
      return;
    }
    setDialogForeningId(id);
    setBackupMeddelande(null);
    setVisaDialog(true);
  }

  async function sparaOchLoggaUt() {
    const id = dialogForeningId || lasAktivForeningId();
    if (!id) {
      void loggaUt();
      return;
    }
    setSpararKopia(true);
    setBackupMeddelande(null);
    const ok = await sparaBackupTillServerBestEffort(id);
    setSpararKopia(false);
    if (!ok) {
      setBackupMeddelande(
        "Kunde inte spara på servern (kontrollera nätverk eller öppna Föreningsuppgifter). Vill du logga ut ändå?",
      );
      return;
    }
    setVisaDialog(false);
    void loggaUt();
  }

  return (
    <>
      <button
        type="button"
        disabled={loggarUt}
        onClick={onLoggaUtKlick}
        className={className ?? rodKlass}
      >
        {loggarUt ? "Loggar ut…" : "Logga ut"}
      </button>

      {visaDialog && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logga-ut-sakerhetskopia-rubrik"
        >
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-white p-5 shadow-xl sm:p-6">
            <h2
              id="logga-ut-sakerhetskopia-rubrik"
              className="text-lg font-bold text-foreground"
            >
              Säkerhetskopiera innan utloggning?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {FORENING_BACKUP_KORT} För{" "}
              <strong className="font-medium text-foreground">
                {dialogForeningsNamn || "er förening"}
              </strong>{" "}
              inkluderar det årshjul, underhållsplan, dokument, lägenheter,
              upphandling och övrigt ni lagt in. En kopia på servern gör att ni
              kan <strong className="font-medium text-foreground">Återställa</strong>{" "}
              hela läget om något försvinner.
            </p>
            <p className="mt-2 text-sm text-muted">
              <Link
                href="/forening/uppgifter#sakerhetskopiering"
                className="font-medium text-primary-dark underline-offset-2 hover:underline"
                onClick={() => setVisaDialog(false)}
              >
                Öppna säkerhetskopiering
              </Link>{" "}
              — spara, ladda ner eller återställ tidigare versioner.
            </p>

            {backupMeddelande && (
              <p
                className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950"
                role="status"
              >
                {backupMeddelande}
              </p>
            )}

            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                disabled={spararKopia || loggarUt}
                onClick={() => void sparaOchLoggaUt()}
                className="brf-knapp-gron w-full px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
              >
                {spararKopia
                  ? "Sparar säkerhetskopia …"
                  : "Spara på servern och logga ut"}
              </button>
              <button
                type="button"
                disabled={loggarUt}
                onClick={() => {
                  setVisaDialog(false);
                  void loggaUt();
                }}
                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium hover:bg-background"
              >
                Logga ut utan att spara
              </button>
              <button
                type="button"
                disabled={spararKopia || loggarUt}
                onClick={() => setVisaDialog(false)}
                className="w-full px-4 py-2 text-sm text-muted hover:text-foreground"
              >
                Avbryt
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
