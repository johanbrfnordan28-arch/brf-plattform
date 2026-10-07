"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { lasLokalSession } from "@/lib/auth/lokal-session";
import {
  FORENING_AKTIV_EVENT,
  arGrundmallForening,
  lasAktivForeningId,
} from "@/lib/forening-registry";
import { hamtaServerAccessNyckel } from "@/lib/forening-server-sync";
import {
  INTEGRITETSPOLICY_PATH,
  PUB_PATH,
  VILLKOR_PATH,
  VILLKOR_VERSION,
  VILLKOR_VERSION_DATUM,
} from "@/lib/juridik";

function headers(foreningId: string): HeadersInit {
  const nyckel = hamtaServerAccessNyckel(foreningId);
  return nyckel ? { "x-access-nyckel": nyckel } : {};
}

/**
 * Föreningar som skapades innan villkoren fanns — eller innan en ny version —
 * måste godkänna aktuell version innan de fortsätter arbeta.
 */
export function ForeningVillkorGate() {
  const [foreningId, setForeningId] = useState<string | null>(null);
  const [visa, setVisa] = useState(false);
  const [godkand, setGodkand] = useState(false);
  const [sparar, setSparar] = useState(false);
  const [fel, setFel] = useState<string | null>(null);

  const kontrollera = useCallback(async () => {
    const id = lasAktivForeningId();
    setForeningId(id);
    setVisa(false);
    if (!id || arGrundmallForening(id)) return;
    try {
      const res = await fetch(`/api/foreningar/${encodeURIComponent(id)}/villkor`, {
        headers: headers(id),
      });
      if (!res.ok) return;
      const data = (await res.json()) as { behoverGodkannas?: boolean };
      setVisa(Boolean(data.behoverGodkannas));
    } catch {
      /* utan server finns inget att godkänna mot */
    }
  }, []);

  useEffect(() => {
    void kontrollera();
    window.addEventListener(FORENING_AKTIV_EVENT, kontrollera);
    return () => window.removeEventListener(FORENING_AKTIV_EVENT, kontrollera);
  }, [kontrollera]);

  async function godkann() {
    if (!foreningId) return;
    setFel(null);
    setSparar(true);
    try {
      const res = await fetch(
        `/api/foreningar/${encodeURIComponent(foreningId)}/villkor`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", ...headers(foreningId) },
          body: JSON.stringify({
            villkorVersion: VILLKOR_VERSION,
            epost: lasLokalSession()?.epost ?? "",
          }),
        },
      );
      const data = (await res.json().catch(() => ({}))) as { fel?: string };
      if (!res.ok) {
        setFel(data.fel || "Kunde inte spara godkännandet.");
        return;
      }
      setVisa(false);
    } catch {
      setFel("Kunde inte nå servern.");
    } finally {
      setSparar(false);
    }
  }

  if (!visa) return null;

  const lank = "font-medium text-primary-dark underline hover:no-underline";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="villkor-gate-rubrik"
    >
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl sm:p-8">
        <h2 id="villkor-gate-rubrik" className="text-xl font-bold text-foreground">
          Godkänn villkoren för att fortsätta
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Styrelse-Navet har villkor och ett personuppgiftsbiträdesavtal som
          gäller från {VILLKOR_VERSION_DATUM}. De beskriver hur tjänsten får
          användas och hur personuppgifterna som föreningen lägger in skyddas.
          Någon i styrelsen behöver godkänna dem för föreningens räkning.
        </p>
        <ul className="mt-4 space-y-1 text-sm">
          <li>
            <Link href={VILLKOR_PATH} target="_blank" className={lank}>
              Villkor
            </Link>
          </li>
          <li>
            <Link href={PUB_PATH} target="_blank" className={lank}>
              Personuppgiftsbiträdesavtal
            </Link>
          </li>
          <li>
            <Link href={INTEGRITETSPOLICY_PATH} target="_blank" className={lank}>
              Integritetspolicy
            </Link>
          </li>
        </ul>

        <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={godkand}
            onChange={(e) => setGodkand(e.target.checked)}
            disabled={sparar}
            className="mt-1 h-4 w-4 shrink-0 rounded border-border accent-[#5a9a6e]"
          />
          <span className="text-muted">
            Jag sitter i styrelsen och godkänner villkoren och
            personuppgiftsbiträdesavtalet för föreningens räkning.
          </span>
        </label>

        {fel ? (
          <p
            className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
            role="alert"
          >
            {fel}
          </p>
        ) : null}

        <button
          type="button"
          onClick={() => void godkann()}
          disabled={!godkand || sparar}
          className="brf-knapp-gron mt-5 w-full px-6 py-3 text-base shadow-sm disabled:opacity-50"
        >
          {sparar ? "Sparar …" : "Godkänn och fortsätt"}
        </button>
      </div>
    </div>
  );
}
