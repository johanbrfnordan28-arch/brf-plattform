"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { STYRELSEFLOW_NAMN } from "@/lib/forening-konstanter";
import { skapaNyForening } from "@/lib/forening-registry";
import { navigeraTillNyForening } from "@/lib/skapa-forening-navigering";

type Props = {
  kompakt?: boolean;
  visaSnabbstart?: boolean;
};

const DEMO_FORENINGS_NAMN = "Brf Testförening";

export function SkapaForeningPanel({
  kompakt = false,
  visaSnabbstart = false,
}: Props) {
  const [namn, setNamn] = useState("");
  const [fel, setFel] = useState<string | null>(null);
  const [skapar, setSkapar] = useState(false);
  const [skapatNamn, setSkapatNamn] = useState<string | null>(null);
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

  function korSkapa(trimmatNamn: string) {
    setFel(null);
    setSkapatNamn(null);
    setSkapar(true);
    try {
      const profil = skapaNyForening(trimmatNamn);
      setSkapatNamn(profil.namn);
      navigeraTillNyForening(profil);
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
    if (!trimmatNamn) {
      setFel("Döp föreningen — t.ex. Brf Solsidan 1.");
      return;
    }
    korSkapa(trimmatNamn);
  }

  function hanteraSkapaMedNamn(event?: React.SyntheticEvent) {
    event?.preventDefault();
    valideraOchSkapa(namn.trim());
  }

  function hanteraSnabbstartDemo(event: React.MouseEvent) {
    event.preventDefault();
    const trimmat = namn.trim() || DEMO_FORENINGS_NAMN;
    setNamn(trimmat);
    if (checkboxRef.current) checkboxRef.current.checked = true;
    valideraOchSkapa(trimmat);
  }

  const snabbstartEtikett =
    namn.trim().length > 0
      ? "Skapa förening med namnet ovan"
      : "Skapa vår testförening nu";

  return (
    <div className={`brf-panel-gron ${kompakt ? "p-5" : "p-6 sm:p-8"}`}>
      <h2 className="text-lg font-bold text-foreground sm:text-xl">
        Skapa vår förening
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Ni får en egen kopia av grundmallen — samma moduler som Styrelsenavet visar,
        men med <strong className="text-foreground">ert föreningsnamn</strong> och
        er egen data i webbläsaren (demo).
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
            skapa föreningens sida i Styrelsenavet.
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
                : "Skapar er förening …"}
            </p>
            <p className="mt-1 text-muted">
              Ni skickas till {STYRELSEFLOW_NAMN} om ett ögonblick.
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
              href="/#provperioder"
              className="inline-flex items-center rounded-lg border border-border bg-white px-5 py-2.5 text-sm font-medium text-foreground hover:border-[#5a9a6e]/50"
            >
              Visa pågående provperioder
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
