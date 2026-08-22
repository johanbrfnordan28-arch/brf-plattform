"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  lasRenoveringMedlemsSignering,
  signeraRenoveringMedlemsKrav,
} from "@/components/medlemmar/renovering-medlems-signering-lager";

export function MedlemRenoveringSignering() {
  const params = useSearchParams();
  const signeringId = params.get("id") ?? "";
  const foreningId = params.get("forening") ?? "demo";

  const [namn, setNamn] = useState("");
  const [bekraftad, setBekraftad] = useState(false);
  const [bankidSteg, setBankidSteg] = useState<"idle" | "pågår" | "klar">("idle");
  const [signering, setSignering] = useState(
    () => lasRenoveringMedlemsSignering(foreningId, signeringId),
  );

  useEffect(() => {
    setSignering(lasRenoveringMedlemsSignering(foreningId, signeringId));
  }, [foreningId, signeringId]);

  const grupper = useMemo(() => {
    if (!signering) return [];
    const map = new Map<string, { etikett: string; texter: string[] }>();
    for (const p of signering.punkter) {
      if (!map.has(p.sektionEtikett)) {
        map.set(p.sektionEtikett, { etikett: p.sektionEtikett, texter: [] });
      }
      map.get(p.sektionEtikett)!.texter.push(p.text);
    }
    return [...map.values()];
  }, [signering]);

  function signeraMedBankId() {
    if (!signering || !namn.trim() || !bekraftad) return;
    setBankidSteg("pågår");
    window.setTimeout(() => {
      const result = signeraRenoveringMedlemsKrav(
        foreningId,
        signering.id,
        namn.trim(),
      );
      if (result) setSignering(result);
      setBankidSteg("klar");
    }, 1800);
  }

  if (!signeringId) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center text-sm text-muted">
        Ogiltig länk — signering saknas.
      </main>
    );
  }

  if (!signering) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center text-sm text-muted">
        Kunde inte hitta signeringen. Kontakta styrelsen om länken är gammal.
      </main>
    );
  }

  const redanKlar = signering.status === "signerad" || bankidSteg === "klar";

  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-dark">
          Renoveringskrav
        </p>
        <h1 className="mt-2 text-xl font-semibold text-foreground">
          Godkänn krav för {signering.mappNamn}
        </h1>
        <p className="mt-2 text-sm text-muted">
          Lägenhet {signering.lagenhetsnummer} · {signering.mallEtikett}
        </p>

        {redanKlar ? (
          <div className="mt-6 rounded-xl border border-primary/30 bg-[#eef6f0] p-4">
            <p className="text-sm font-semibold text-primary-dark">
              Signerat med BankID
            </p>
            <p className="mt-1 text-sm text-muted">
              {signering.signeradAv ?? namn} · {signering.signeradDatum}
            </p>
            <p className="mt-3 text-xs text-muted">
              Du har godkänt att uppfylla kraven ovan. Styrelsen har fått
              bekräftelsen.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-6 space-y-4">
              {grupper.map((grupp) => (
                <div key={grupp.etikett}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    {grupp.etikett}
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {grupp.texter.map((text, index) => (
                      <li
                        key={`${grupp.etikett}-${index}`}
                        className="rounded-lg border border-border bg-background px-3 py-2 text-xs leading-relaxed text-foreground"
                      >
                        {text}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <label className="mt-6 flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={bekraftad}
                onChange={(e) => setBekraftad(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-border text-primary"
              />
              <span>
                Jag bekräftar att jag ska uppfylla samtliga krav ovan innan
                renoveringen påbörjas.
              </span>
            </label>

            <label className="mt-4 block">
              <span className="text-sm font-medium text-foreground">Ditt namn</span>
              <input
                value={namn}
                onChange={(e) => setNamn(e.target.value)}
                placeholder="För- och efternamn"
                className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
              />
            </label>

            <button
              type="button"
              disabled={!bekraftad || !namn.trim() || bankidSteg === "pågår"}
              onClick={signeraMedBankId}
              className="mt-6 w-full rounded-lg bg-[#1e3a5f] px-4 py-3 text-sm font-semibold text-white hover:bg-[#152a45] disabled:opacity-50"
            >
              {bankidSteg === "pågår"
                ? "Öppnar BankID…"
                : "Godkänn och signera med BankID"}
            </button>
          </>
        )}
      </div>

      <p className="mt-6 text-center text-xs text-muted">
        Den här sidan är för medlemmens godkännande. Du loggas inte in i
        styrelsens portal.
      </p>
    </main>
  );
}
