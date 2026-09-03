"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { navigeraTillNyForening } from "@/lib/skapa-forening-navigering";
import { skapaForeningMedKontoKlient } from "@/lib/auth/skapa-forening-klient";
import { STYRELSE_ROLLER } from "@/lib/styrelse-ledamot";
import {
  lasAktivForeningId,
  lasForeningProfil,
} from "@/lib/forening-registry";

type Props = {
  kompakt?: boolean;
  visaSnabbstart?: boolean;
};

const DEMO_FORENINGS_NAMN = "Brf Testförening";
const BRF_PREFIX = "Brf ";

export function SkapaForeningPanel({
  kompakt = false,
  visaSnabbstart = false,
}: Props) {
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
  const checkboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
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

  function valideraOchSkapa(trimmatNamn: string) {
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

  function hanteraSkapaMedNamn(event?: React.SyntheticEvent) {
    event?.preventDefault();
    valideraOchSkapa(namn.trim());
  }

  function hanteraSnabbstartDemo(event: React.MouseEvent) {
    event.preventDefault();
    const trimmat = namn.trim() || DEMO_FORENINGS_NAMN;
    setNamn(trimmat);
    if (!skapareNamn.trim()) setSkapareNamn("Demo Ordförande");
    if (!skapareEpost.trim()) setSkapareEpost("demo@example.com");
    if (checkboxRef.current) checkboxRef.current.checked = true;
    window.setTimeout(() => valideraOchSkapa(trimmat), 0);
  }

  const snabbstartEtikett =
    namn.trim().length > 0
      ? "Skapa förening med namnet ovan"
      : "Skapa vår testförening nu";

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
            Spara lösenordet. Efter inloggning byter du det under{" "}
            <strong className="font-medium text-foreground">Konto</strong> i
            menyn (Byt lösenord).
          </p>
        </div>
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
        <strong>Endast styrelsen</strong> ska skapa föreningens sida. Entreprenörer
        och medlemmar loggar in via länkar som styrelsen delar — inte genom att skapa
        en ny förening här.
      </p>

      <div className="mt-4 space-y-4">
        <label className="block text-sm">
          <span className="font-medium text-foreground">Föreningens namn</span>
          <input
            id="skapa-forening-namn"
            type="text"
            value={namn}
            onChange={(e) => setNamn(e.target.value)}
            placeholder="t.ex. Brf Eken 12"
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-foreground"
            autoComplete="organization"
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
            Jag bekräftar att jag är styrelseledamot eller har styrelsens mandat att
            skapa föreningens sida i BRF Företag.
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

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {visaSnabbstart && (
            <button
              type="button"
              disabled={skapar}
              onClick={hanteraSnabbstartDemo}
              className="brf-knapp-gron order-first px-6 py-3 text-base shadow-sm"
            >
              {skapar ? "Skapar …" : snabbstartEtikett}
            </button>
          )}
          <button
            type="button"
            disabled={skapar}
            onClick={hanteraSkapaMedNamn}
            className={
              visaSnabbstart
                ? "brf-knapp-gron-kontur px-5 py-2.5 text-sm"
                : "brf-knapp-gron px-6 py-3 text-base shadow-sm"
            }
          >
            {skapar ? "Skapar …" : "Skapa förening och gå vidare"}
          </button>
          {!kompakt && (
            <Link
              href="/forening"
              className="inline-flex items-center rounded-lg border border-border bg-white px-5 py-2.5 text-sm font-medium text-foreground hover:border-[#5a9a6e]/50"
            >
              Till befintlig grundmall
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
