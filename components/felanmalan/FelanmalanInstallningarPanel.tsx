"use client";

import { useEffect, useState } from "react";
import { hamtaServerAccessNyckel } from "@/lib/forening-server-sync";
import {
  FELANMALAN_INSTALLNING_MAX,
  type FelanmalanInstallningar,
} from "@/lib/felanmalan/felanmalan-typer";

function headers(foreningId: string, json = false): Record<string, string> {
  const h: Record<string, string> = json ? { "Content-Type": "application/json" } : {};
  const access = hamtaServerAccessNyckel(foreningId);
  if (access) h["x-access-nyckel"] = access;
  return h;
}

/** Föreningens egna inställningar för felanmälan — påverkar inga andra föreningar. */
export function FelanmalanInstallningarPanel({ foreningId }: { foreningId: string }) {
  const [oppen, setOppen] = useState(false);
  const [laddad, setLaddad] = useState(false);
  const [foreningEpost, setForeningEpost] = useState("");
  const [extraEpost, setExtraEpost] = useState("");
  const [jourTelefon, setJourTelefon] = useState("");
  const [jourText, setJourText] = useState("");
  const [info, setInfo] = useState("");
  const [sparar, setSparar] = useState(false);
  const [meddelande, setMeddelande] = useState<string | null>(null);
  const [fel, setFel] = useState<string | null>(null);

  useEffect(() => {
    if (!oppen || laddad) return;
    fetch(`/api/foreningar/${encodeURIComponent(foreningId)}/felanmalan/installningar`, {
      headers: headers(foreningId),
    })
      .then(async (res) => {
        const data = (await res.json()) as {
          fel?: string;
          installningar?: FelanmalanInstallningar;
          foreningEpost?: string;
        };
        if (!res.ok || !data.installningar) {
          setFel(data.fel || "Kunde inte hämta inställningarna.");
          return;
        }
        setForeningEpost(data.foreningEpost ?? "");
        setExtraEpost(data.installningar.extraEpost.join("\n"));
        setJourTelefon(data.installningar.jourTelefon);
        setJourText(data.installningar.jourText);
        setInfo(data.installningar.info);
        setLaddad(true);
      })
      .catch(() => setFel("Kunde inte nå servern."));
  }, [oppen, laddad, foreningId]);

  async function spara() {
    setSparar(true);
    setFel(null);
    setMeddelande(null);
    try {
      const res = await fetch(
        `/api/foreningar/${encodeURIComponent(foreningId)}/felanmalan/installningar`,
        {
          method: "PUT",
          headers: headers(foreningId, true),
          body: JSON.stringify({
            extraEpost: extraEpost.split(/[\n,;]+/).map((e) => e.trim()).filter(Boolean),
            jourTelefon,
            jourText,
            info,
          }),
        },
      );
      const data = (await res.json()) as { fel?: string };
      if (!res.ok) {
        setFel(data.fel || "Kunde inte spara.");
        return;
      }
      setMeddelande("Sparat. Ändringarna gäller bara er förening.");
    } catch {
      setFel("Kunde inte nå servern.");
    } finally {
      setSparar(false);
    }
  }

  const falt = "mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm";

  return (
    <section className="rounded-xl border border-border bg-white">
      <button
        type="button"
        onClick={() => setOppen((v) => !v)}
        aria-expanded={oppen}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span>
          <span className="block text-base font-semibold text-foreground">
            Inställningar för felanmälan
          </span>
          <span className="text-sm text-muted">
            Mottagare, journummer och information till boende
          </span>
        </span>
        <span className="text-sm font-medium text-primary-dark">
          {oppen ? "Stäng" : "Ändra"}
        </span>
      </button>

      {oppen ? (
        <div className="space-y-4 border-t border-border px-4 py-4">
          {!laddad && !fel ? <p className="text-sm text-muted">Laddar …</p> : null}
          {laddad ? (
            <>
              <label className="block text-sm">
                <span className="font-medium">Extra mottagare av nya ärenden</span>
                <span className="block text-xs text-muted">
                  En adress per rad, högst {FELANMALAN_INSTALLNING_MAX.extraEpost}. Mejl går
                  alltid till föreningens e-post
                  {foreningEpost ? ` (${foreningEpost})` : ""}.
                </span>
                <textarea
                  rows={3}
                  value={extraEpost}
                  onChange={(e) => setExtraEpost(e.target.value)}
                  className={falt}
                  placeholder={"forvaltare@exempel.se\nfastighetsskotare@exempel.se"}
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="font-medium">Journummer</span>
                  <input
                    value={jourTelefon}
                    onChange={(e) => setJourTelefon(e.target.value)}
                    maxLength={FELANMALAN_INSTALLNING_MAX.jourTelefon}
                    className={falt}
                    placeholder="08-123 456 78"
                  />
                </label>
                <label className="block text-sm">
                  <span className="font-medium">Vem svarar?</span>
                  <input
                    value={jourText}
                    onChange={(e) => setJourText(e.target.value)}
                    maxLength={FELANMALAN_INSTALLNING_MAX.jourText}
                    className={falt}
                    placeholder="Fastighetsjouren, dygnet runt"
                  />
                </label>
              </div>
              <label className="block text-sm">
                <span className="font-medium">Information till boende</span>
                <span className="block text-xs text-muted">
                  Visas ovanför formuläret, t.ex. vad boende själva ansvarar för
                  eller när förvaltaren svarar.
                </span>
                <textarea
                  rows={4}
                  value={info}
                  onChange={(e) => setInfo(e.target.value)}
                  maxLength={FELANMALAN_INSTALLNING_MAX.info}
                  className={falt}
                />
              </label>
              <button
                type="button"
                onClick={() => void spara()}
                disabled={sparar}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
              >
                {sparar ? "Sparar …" : "Spara inställningar"}
              </button>
            </>
          ) : null}
          {meddelande ? <p className="text-sm text-primary-dark">{meddelande}</p> : null}
          {fel ? <p className="text-sm text-red-700">{fel}</p> : null}
        </div>
      ) : null}
    </section>
  );
}
