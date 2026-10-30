"use client";

import { useMemo, useState } from "react";
import {
  grupperaSigneradePerAr,
  lasSigneradeArshjulDokument,
} from "@/components/arshjul/arshjul-dokument-signering";
import { sammanfattaBankIdSignaturer } from "@/lib/bankid-signering";

export function ArshjulSigneradeVy() {
  const [uppdatera, setUppdatera] = useState(0);
  const poster = useMemo(
    () => lasSigneradeArshjulDokument(),
    [uppdatera],
  );
  const perAr = useMemo(() => grupperaSigneradePerAr(poster), [poster]);
  const arLista = [...perAr.keys()].sort((a, b) => b - a);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-primary/25 bg-[#f7fbf8] p-4">
        <p className="text-sm font-semibold text-foreground">
          Signerade dokument per år
        </p>
        <p className="mt-1 text-sm text-muted">
          När styrelsen godkänner med BankID i en händelse sparas det signerade
          dokumentet här — som en gemensam mapp per kalenderår.
        </p>
        <button
          type="button"
          onClick={() => setUppdatera((n) => n + 1)}
          className="mt-3 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium text-muted hover:text-foreground"
        >
          Uppdatera listan
        </button>
      </div>

      {arLista.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-4 py-6 text-sm text-muted">
          Inga signerade årshjulsdokument ännu. Signera via Öppna på en händelse
          som har uppladdat protokoll eller dagordning.
        </p>
      ) : (
        arLista.map((ar) => (
          <section key={ar}>
            <h3 className="mb-2 text-sm font-semibold text-foreground">
              {ar} — {perAr.get(ar)!.length} dokument
            </h3>
            <ul className="space-y-2">
              {perAr.get(ar)!.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-col gap-2 rounded-xl border border-border bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{p.handelseTitel}</p>
                    <p className="text-xs text-muted">
                      {p.originalFilnamn} → {p.filnamn}
                    </p>
                    <p className="mt-1 text-xs text-primary-dark">
                      {sammanfattaBankIdSignaturer(p.signaturer)}
                    </p>
                    <p className="text-xs text-muted">
                      {new Date(p.signeradTid).toLocaleString("sv-SE")}
                    </p>
                  </div>
                  <a
                    href={p.dataUrl}
                    download={p.filnamn}
                    className="shrink-0 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary-dark"
                  >
                    Ladda ned
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
