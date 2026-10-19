"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  lasOmbyggnadsavtalSignering,
  signeraOmbyggnadsavtalUndertecknare,
} from "@/components/lagenhetsarkiv/ombyggnadsavtal-signering-lager";
import { byggOmbyggnadsavtalHtml } from "@/components/lagenhetsarkiv/ombyggnadsavtal";
import {
  hashaPersonnummer,
  personnummerFelmeddelande,
} from "@/lib/personnummer-format";

export function MedlemOmbyggnadsavtalSignering() {
  const params = useSearchParams();
  const signeringId = params.get("id") ?? "";
  const foreningId = params.get("forening") ?? "demo";

  const [namn, setNamn] = useState("");
  const [personnummer, setPersonnummer] = useState("");
  const [bekraftad, setBekraftad] = useState(false);
  const [bankidSteg, setBankidSteg] = useState<"idle" | "pagar" | "klar">(
    "idle",
  );
  const [fel, setFel] = useState<string | null>(null);
  const [signering, setSignering] = useState(() =>
    lasOmbyggnadsavtalSignering(foreningId, signeringId),
  );

  useEffect(() => {
    setSignering(lasOmbyggnadsavtalSignering(foreningId, signeringId));
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

  const signerade = signering?.undertecknare.filter((u) => u.signerad) ?? [];
  const allaKlara =
    signering?.status === "signerad" ||
    (signering != null &&
      signering.undertecknare.length > 0 &&
      signering.undertecknare.every((u) => u.signerad));

  async function signeraMedBankId() {
    if (!signering || !bekraftad) return;
    setFel(null);
    if (!namn.trim()) {
      setFel("Ange ditt namn för BankID-signeringen.");
      return;
    }
    const pnrFel = personnummerFelmeddelande(personnummer);
    if (pnrFel) {
      setFel(pnrFel);
      return;
    }

    setBankidSteg("pagar");
    try {
      await new Promise((r) => window.setTimeout(r, 1600));
      const nyckel = await hashaPersonnummer(personnummer);
      if (!nyckel) {
        setFel("Kunde inte läsa personnumret.");
        setBankidSteg("idle");
        return;
      }
      const resultat = signeraOmbyggnadsavtalUndertecknare(
        foreningId,
        signering.id,
        nyckel,
        namn.trim(),
      );
      if (!resultat.ok) {
        setFel(resultat.fel);
        setBankidSteg("idle");
        return;
      }
      setSignering(resultat.signering);
      setBankidSteg("klar");
    } catch (e) {
      setFel(e instanceof Error ? e.message : "Signering misslyckades.");
      setBankidSteg("idle");
    }
  }

  function visaPdf() {
    if (!signering) return;
    const html = byggOmbyggnadsavtalHtml(
      signering.punkter.map((p) => ({
        id: p.id,
        sektionId: p.sektionEtikett,
        sektionEtikett: p.sektionEtikett,
        text: p.text,
        ingar: true,
      })),
      {
        foreningsnamn: signering.foreningsnamn,
        organisationsnummer: signering.organisationsnummer,
        lagenhetsnummer: signering.lagenhetsnummer,
        mappNamn: "Ombyggnadsavtal",
        mallEtikett: signering.mallEtikett,
        datum: new Date().toLocaleDateString("sv-SE"),
        postadress: signering.postadress,
        ort: signering.ort,
        undertecknare: signering.undertecknare.map((u) => ({
          namn: u.namn,
          personnummerMaskerat: u.personnummerMaskerat,
          signeradDatum: u.signerad?.datum,
        })),
      },
    );
    const w = window.open("", "_blank", "noopener,noreferrer,width=900,height=700");
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.focus();
    window.setTimeout(() => w.print(), 300);
  }

  if (!signeringId) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center text-sm text-muted">
        Ogiltig länk — ombyggnadsavtalet saknas.
      </main>
    );
  }

  if (!signering) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center text-sm text-muted">
        Kunde inte hitta ombyggnadsavtalet. Kontakta styrelsen om länken är
        gammal.
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-dark">
          Ombyggnadsavtal
        </p>
        <h1 className="mt-2 text-xl font-semibold text-foreground">
          Godkänn överenskommelsen
        </h1>
        <p className="mt-2 text-sm text-muted">
          Lägenhet {signering.lagenhetsnummer}
          {signering.foreningsnamn ? ` · ${signering.foreningsnamn}` : ""}
          {signering.mallEtikett ? ` · ${signering.mallEtikett}` : ""}
        </p>

        {allaKlara || bankidSteg === "klar" ? (
          <div className="mt-6 rounded-xl border border-primary/30 bg-[#eef6f0] p-4">
            <p className="text-sm font-semibold text-primary-dark">
              Godkänt med BankID
            </p>
            <ul className="mt-2 space-y-1 text-sm text-muted">
              {signering.undertecknare.map((u) => (
                <li key={u.id}>
                  {u.namn} · {u.personnummerMaskerat}
                  {u.signerad ? ` · ${u.signerad.datum}` : ""}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted">
              Överenskommelsen är sparad på lägenhetskortet. Styrelsen kan
              öppna den som PDF.
            </p>
            <button
              type="button"
              onClick={visaPdf}
              className="mt-3 rounded-lg border border-primary px-3 py-1.5 text-xs font-semibold text-primary-dark hover:bg-white"
            >
              Visa avtalet som PDF
            </button>
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

            {signerade.length > 0 && (
              <p className="mt-4 text-xs text-primary-dark">
                Redan godkänt av {signerade.map((u) => u.namn).join(", ")}.
              </p>
            )}

            <label className="mt-6 flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={bekraftad}
                onChange={(e) => setBekraftad(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-border text-primary"
              />
              <span>
                Jag har läst villkoren och godkänner ombyggnadsavtalet för
                lägenhet {signering.lagenhetsnummer}.
              </span>
            </label>

            <div className="mt-4 grid gap-3">
              <label className="block">
                <span className="text-sm font-medium text-foreground">
                  Ditt namn
                </span>
                <input
                  value={namn}
                  onChange={(e) => setNamn(e.target.value)}
                  placeholder="För- och efternamn"
                  autoComplete="name"
                  className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-foreground">
                  Personnummer
                </span>
                <input
                  value={personnummer}
                  onChange={(e) => setPersonnummer(e.target.value)}
                  placeholder="ÅÅÅÅMMDD-XXXX"
                  inputMode="numeric"
                  autoComplete="off"
                  className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                />
              </label>
            </div>

            {fel && (
              <p
                className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
                role="alert"
              >
                {fel}
              </p>
            )}

            <button
              type="button"
              disabled={!bekraftad || bankidSteg === "pagar"}
              onClick={() => void signeraMedBankId()}
              className="mt-6 w-full rounded-lg bg-[#1e3a5f] px-4 py-3 text-sm font-semibold text-white hover:bg-[#152a45] disabled:opacity-50"
            >
              {bankidSteg === "pagar"
                ? "Öppnar BankID (demo)…"
                : "Godkänn avtalet med BankID"}
            </button>
            <p className="mt-2 text-xs text-muted">
              Demo: simulerad BankID. Personnumret måste stämma med den
              styrelsen lagt till, och sparas bara maskerat.
            </p>
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
