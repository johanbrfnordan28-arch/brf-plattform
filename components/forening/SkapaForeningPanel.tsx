"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { navigeraTillNyForening } from "@/lib/skapa-forening-navigering";
import { skapaForeningMedKontoKlient } from "@/lib/auth/skapa-forening-klient";
import { STYRELSE_ROLLER } from "@/lib/styrelse-ledamot";
import { rensaEgnaTestForeningHistorik } from "@/lib/forening-inloggning";
import {
  lasAktivForeningId,
  lasForeningProfil,
} from "@/lib/forening-registry";

type Props = {
  kompakt?: boolean;
};

const BRF_PREFIX = "Brf ";

/**
 * Ett formulär, en knapp — skapa förening med namn, kontakt och e-post.
 */
export function SkapaForeningPanel({ kompakt = false }: Props) {
  const [namn, setNamn] = useState(BRF_PREFIX);
  const [skapareNamn, setSkapareNamn] = useState("");
  const [skapareEpost, setSkapareEpost] = useState("");
  const [skapareRoll, setSkapareRoll] = useState<string>("Ordförande");
  const [fel, setFel] = useState<string | null>(null);
  const [skapar, setSkapar] = useState(false);
  const [skapatNamn, setSkapatNamn] = useState<string | null>(null);
  const [losenInfo, setLosenInfo] = useState<{
    losenord: string;
    epost: string;
    mejlVia: string;
    meddelande: string;
  } | null>(null);
  const [skickarIgen, setSkickarIgen] = useState(false);
  const [skickaIgenMeddelande, setSkickaIgenMeddelande] = useState<string | null>(
    null,
  );
  const [skickaIgenFel, setSkickaIgenFel] = useState<string | null>(null);
  const checkboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    rensaEgnaTestForeningHistorik();

    const skaFokuseraSkapa =
      window.location.hash === "#skapa-forening" ||
      new URLSearchParams(window.location.search).get("skapa") === "1";
    if (!skaFokuseraSkapa) return;
    const sektion = document.getElementById("skapa-forening");
    sektion?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => {
      document.getElementById("skapa-forening-namn")?.focus();
    }, 400);
  }, []);

  function arStyrelseBekraftat(): boolean {
    return Boolean(checkboxRef.current?.checked);
  }

  async function korSkapa(trimmatNamn: string) {
    setFel(null);
    setSkapatNamn(null);
    setLosenInfo(null);
    setSkapar(true);
    try {
      const resultat = await skapaForeningMedKontoKlient({
        foreningsNamn: trimmatNamn,
        skapareNamn,
        skapareEpost,
        skapareRoll,
      });
      setSkapatNamn(resultat.profil.namn);
      if (resultat.tillfalligtLosenord) {
        setLosenInfo({
          losenord: resultat.tillfalligtLosenord,
          epost: resultat.epost,
          mejlVia: resultat.mejlVia,
          meddelande: resultat.meddelande,
        });
        setSkapar(false);
        return;
      }
      navigeraTillNyForening(resultat.profil);
      window.setTimeout(() => {
        if (window.location.pathname.includes("prova-gratis")) {
          setSkapar(false);
          setFel(
            "Sidan bytte inte automatiskt. Prova att ladda om sidan eller öppna /forening i en ny flik.",
          );
        }
      }, 4000);
    } catch (e) {
      setFel(e instanceof Error ? e.message : "Kunde inte skapa föreningen.");
      setSkapar(false);
    }
  }

  function hanteraSkapa(event?: React.SyntheticEvent) {
    event?.preventDefault();
    const trimmatNamn = namn.trim();
    if (!arStyrelseBekraftat()) {
      setFel("Bocka i rutan: du tillhör styrelsen (eller har mandat).");
      return;
    }
    if (!trimmatNamn || trimmatNamn.toLowerCase() === "brf") {
      setFel("Döp föreningen — t.ex. Brf Solsidan 1.");
      return;
    }
    if (!skapareNamn.trim()) {
      setFel("Ange ditt namn.");
      return;
    }
    if (!skapareEpost.trim() || !skapareEpost.includes("@")) {
      setFel("Ange en giltig e-postadress — dit skickas lösenordet.");
      return;
    }
    void korSkapa(trimmatNamn);
  }

  if (losenInfo) {
    return (
      <div className={`brf-panel-gron ${kompakt ? "p-5" : "p-6 sm:p-8"}`}>
        <h2 className="text-lg font-bold text-foreground sm:text-xl">
          {skapatNamn} är skapad
        </h2>
        <p className="mt-2 text-sm text-muted">{losenInfo.meddelande}</p>
        <div className="mt-4 rounded-lg border border-primary/30 bg-white p-4 text-sm">
          <p>
            <span className="font-medium">E-post:</span> {losenInfo.epost}
          </p>
          {losenInfo.losenord ? (
            <p className="mt-2">
              <span className="font-medium">Tillfälligt lösenord:</span>{" "}
              <code className="rounded bg-surface px-2 py-0.5 font-mono text-foreground">
                {losenInfo.losenord}
              </code>
            </p>
          ) : (
            <p className="mt-2 text-muted">
              Använd ditt befintliga lösenord (mejlet bekräftar kopplingen).
            </p>
          )}
          <p className="mt-2 text-xs text-muted">
            Lösenordet skickas också till e-posten. När du loggar in kan du spara
            det eller byta till ett eget under Konto.
          </p>
        </div>

        {losenInfo.losenord ? (
          <div className="mt-3">
            <button
              type="button"
              disabled={skickarIgen}
              onClick={async () => {
                setSkickaIgenFel(null);
                setSkickaIgenMeddelande(null);
                setSkickarIgen(true);
                try {
                  const res = await fetch("/api/auth/skicka-losenord", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ epost: losenInfo.epost }),
                  });
                  const data = (await res.json()) as {
                    fel?: string;
                    meddelande?: string;
                  };
                  if (!res.ok) {
                    setSkickaIgenFel(
                      data.fel || "Kunde inte skicka lösenordet igen.",
                    );
                    return;
                  }
                  setSkickaIgenMeddelande(
                    data.meddelande ||
                      "Ett nytt tillfälligt lösenord har skickats till din e-post.",
                  );
                } catch {
                  setSkickaIgenFel("Kunde inte nå servern.");
                } finally {
                  setSkickarIgen(false);
                }
              }}
              className="text-sm font-medium text-primary-dark underline hover:no-underline disabled:opacity-50"
            >
              {skickarIgen
                ? "Skickar …"
                : "Skicka lösenordet igen via e-post"}
            </button>
            {skickaIgenMeddelande ? (
              <p className="mt-2 text-sm text-primary-dark" role="status">
                {skickaIgenMeddelande}
              </p>
            ) : null}
            {skickaIgenFel ? (
              <p className="mt-2 text-sm text-red-800" role="alert">
                {skickaIgenFel}
              </p>
            ) : null}
          </div>
        ) : null}

        <button
          type="button"
          className="brf-knapp-gron mt-4 px-6 py-3 text-base shadow-sm"
          onClick={() => {
            const profil = lasForeningProfil(lasAktivForeningId());
            if (profil) navigeraTillNyForening(profil);
            else window.location.href = "/forening";
          }}
        >
          Gå till föreningen
        </button>
        <Link
          href="/styrelse-login"
          className="mt-3 block text-sm font-medium text-primary-dark hover:underline"
        >
          Eller öppna inloggning
        </Link>
      </div>
    );
  }

  return (
    <div className={`brf-panel-gron ${kompakt ? "p-5" : "p-6 sm:p-8"}`}>
      <h2 className="text-lg font-bold text-foreground sm:text-xl">
        Skapa vår förening
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Ni får en egen sida med{" "}
        <strong className="text-foreground">ert föreningsnamn</strong>. Ett
        tillfälligt lösenord skickas till din e-post. Nästa gång: logga in via{" "}
        <strong className="text-foreground">Testperiod</strong> med e-post och
        lösenord.
      </p>
      <p className="mt-2 rounded-lg border border-amber-200/80 bg-amber-50/90 px-3 py-2 text-sm text-amber-950">
        <strong>Endast styrelsen</strong> ska skapa föreningens sida.
        Entreprenörer och medlemmar loggar in via länkar som styrelsen delar —
        inte genom att skapa en ny förening här.
      </p>

      <form onSubmit={hanteraSkapa} className="mt-4 space-y-4">
        <label className="block text-sm">
          <span className="font-medium text-foreground">Föreningens namn</span>
          <input
            id="skapa-forening-namn"
            type="text"
            value={namn}
            onChange={(e) => setNamn(e.target.value)}
            placeholder="t.ex. Brf Eken 12"
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-foreground"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            disabled={skapar}
          />
        </label>

        <label className="block text-sm">
          <span className="font-medium text-foreground">Ditt namn</span>
          <input
            type="text"
            value={skapareNamn}
            onChange={(e) => setSkapareNamn(e.target.value)}
            placeholder="För- och efternamn"
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-foreground"
            autoComplete="name"
            disabled={skapar}
          />
        </label>

        <label className="block text-sm">
          <span className="font-medium text-foreground">Din e-post</span>
          <input
            type="email"
            value={skapareEpost}
            onChange={(e) => setSkapareEpost(e.target.value)}
            placeholder="namn@exempel.se"
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-foreground"
            autoComplete="email"
            disabled={skapar}
          />
          <span className="mt-1 block text-xs text-muted">
            Hit skickas det tillfälliga lösenordet.
          </span>
        </label>

        <label className="block text-sm">
          <span className="font-medium text-foreground">Din roll i styrelsen</span>
          <select
            value={skapareRoll}
            onChange={(e) => setSkapareRoll(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-foreground"
            disabled={skapar}
          >
            {STYRELSE_ROLLER.map((roll) => (
              <option key={roll} value={roll}>
                {roll}
              </option>
            ))}
          </select>
        </label>

        <label className="flex cursor-pointer items-start gap-3 text-sm">
          <input
            ref={checkboxRef}
            type="checkbox"
            defaultChecked={false}
            disabled={skapar}
            className="mt-1 h-4 w-4 shrink-0 rounded border-border accent-[#5a9a6e]"
          />
          <span className="text-muted">
            Jag bekräftar att jag är styrelseledamot eller har styrelsens mandat
            att skapa föreningens sida.
          </span>
        </label>

        {fel && (
          <p
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
            role="alert"
          >
            {fel}
          </p>
        )}

        {skapar && !fel && (
          <div
            className="rounded-lg border border-primary/30 bg-white/90 px-4 py-3 text-sm"
            role="status"
            aria-live="polite"
          >
            <p className="font-medium text-primary-dark">
              {skapatNamn
                ? `${skapatNamn} skapas …`
                : "Skapar er förening och skickar lösenord …"}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={skapar}
          className="brf-knapp-gron px-6 py-3 text-base shadow-sm disabled:opacity-50"
        >
          {skapar ? "Skapar …" : "Skapa förening"}
        </button>
      </form>
    </div>
  );
}
