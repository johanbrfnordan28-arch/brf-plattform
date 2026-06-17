"use client";

import { useEffect, useState } from "react";
import {
  KOMMUNIKATION_EVENT,
  lasKommunikationState,
  sparaKommunikationState,
  type KommunikationState,
} from "@/components/kommunikation/kommunikation-lager";
import { UtskickModul } from "@/components/kommunikation/UtskickModul";
import { ArendeModul } from "@/components/kommunikation/ArendeModul";
import { MedlemsRegisterModul } from "@/components/kommunikation/MedlemsRegisterModul";

// ── GDPR-notis ────────────────────────────────────────────────────────────────

function GdprNotis() {
  return (
    <details className="rounded-xl border border-amber-200 bg-amber-50">
      <summary className="cursor-pointer list-none px-4 py-3 [&::-webkit-details-marker]:hidden">
        <div className="flex items-center gap-2">
          <span className="text-base" aria-hidden>🔒</span>
          <span className="text-sm font-semibold text-amber-900">
            GDPR — Dataskyddsförordningen gäller för detta register
          </span>
          <span className="ml-auto text-xs text-amber-700">Visa mer ▾</span>
        </div>
      </summary>

      <div className="border-t border-amber-200 px-4 pb-4 pt-3 text-sm text-amber-900 space-y-3">
        <p>
          Ni registrerar personuppgifter om föreningens medlemmar (namn, e-post,
          telefon, adress och lägenhetsnummer). Som personuppgiftsansvarig är
          bostadsrättsföreningen skyldig att följa{" "}
          <strong>EU:s dataskyddsförordning (GDPR)</strong> och den svenska
          kompletteringslagen.
        </p>

        <div>
          <p className="font-semibold mb-1">Rättslig grund</p>
          <p>
            Behandlingen av medlemmarnas personuppgifter för föreningsändamål
            — kommunikation, ärendehantering och utskick — grundar sig på{" "}
            <strong>avtal</strong> (medlemskapet i föreningen) och i vissa fall{" "}
            <strong>berättigat intresse</strong>.
          </p>
        </div>

        <div>
          <p className="font-semibold mb-1">Lagringstid</p>
          <p>
            Personuppgifter ska inte sparas längre än nödvändigt. Gå igenom
            registret regelbundet och ta bort uppgifter om tidigare medlemmar.
            Stängda ärenden med protokollreferens kan behöva bevaras för
            styrelsedokumentationens skull — bedöm enskilt.
          </p>
        </div>

        <div>
          <p className="font-semibold mb-1">Medlemmarnas rättigheter</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>Rätt till information</strong> — informera nya medlemmar om att
              föreningen behandlar deras personuppgifter och för vilka ändamål.
            </li>
            <li>
              <strong>Rätt till tillgång</strong> — en medlem kan begära ut en kopia
              av de uppgifter ni har om dem.
            </li>
            <li>
              <strong>Rätt till rättelse</strong> — felaktiga uppgifter ska rättas
              skyndsamt.
            </li>
            <li>
              <strong>Rätt till radering</strong> — vid utträde ur föreningen ska
              personuppgifter raderas om det inte finns laglig skyldighet att bevara dem.
            </li>
          </ul>
        </div>

        <div>
          <p className="font-semibold mb-1">Teknisk lagring</p>
          <p>
            I nuvarande version lagras uppgifterna lokalt i webbläsarens
            localStorage — de lämnar inte er enhet och skickas inte till
            någon server. I en produktionssatt version ska uppgifterna hanteras
            i en säker, krypterad databas med tillgångskontroll.
          </p>
        </div>

        <div className="rounded-lg border border-amber-300 bg-amber-100 px-3 py-2">
          <p className="font-semibold">Rekommendation</p>
          <p className="mt-0.5">
            Upprätta en <strong>registerförteckning</strong> och en{" "}
            <strong>integritetspolicy</strong> som beskriver hur föreningen
            hanterar personuppgifter. Integritetsmyndigheten (IMY) har mallar och
            vägledning på{" "}
            <a
              href="https://www.imy.se"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:no-underline"
            >
              imy.se
            </a>
            .
          </p>
        </div>
      </div>
    </details>
  );
}

type Flik = "utskick" | "arenden" | "medlemmar";

export function KommunikationModul() {
  const [flik, setFlik] = useState<Flik>("arenden");
  const [state, setState] = useState<KommunikationState>({
    version: 1,
    medlemmar: [],
    utskick: [],
    arenden: [],
    arendeRaknare: {},
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(lasKommunikationState());
    setHydrated(true);
    const h = () => setState(lasKommunikationState());
    window.addEventListener(KOMMUNIKATION_EVENT, h);
    return () => window.removeEventListener(KOMMUNIKATION_EVENT, h);
  }, []);

  function uppdatera(ny: KommunikationState) {
    setState(ny);
    sparaKommunikationState(ny);
  }

  if (!hydrated) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-10 rounded-lg bg-border/40" />
        <div className="h-32 rounded-xl bg-border/40" />
      </div>
    );
  }

  const oppnaArenden = state.arenden.filter(
    (a) => a.status === "oppet" || a.status === "pagaende",
  ).length;

  const tabs: { id: Flik; label: string; badge?: number }[] = [
    { id: "arenden", label: "Ärenden", badge: oppnaArenden || undefined },
    { id: "utskick", label: "Utskick", badge: state.utskick.length || undefined },
    { id: "medlemmar", label: "Medlemsregister", badge: state.medlemmar.filter((m) => m.aktiv).length || undefined },
  ];

  return (
    <div className="space-y-6">
      {/* GDPR-information */}
      <GdprNotis />

      {/* Flikar */}
      <div className="flex flex-wrap gap-1 rounded-xl border border-border bg-surface p-1">
        {tabs.map(({ id, label, badge }) => (
          <button
            key={id}
            type="button"
            onClick={() => setFlik(id)}
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors ${flik === id ? "bg-white text-foreground shadow-sm" : "text-muted hover:text-foreground"}`}
          >
            {label}
            {badge !== undefined && badge > 0 && (
              <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs font-bold ${flik === id ? "bg-primary text-white" : "bg-border/50 text-muted"}`}>
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Innehåll */}
      {flik === "arenden" && (
        <ArendeModul state={state} onUppdatera={uppdatera} />
      )}
      {flik === "utskick" && (
        <UtskickModul state={state} onUppdatera={uppdatera} />
      )}
      {flik === "medlemmar" && (
        <MedlemsRegisterModul state={state} onUppdatera={uppdatera} />
      )}
    </div>
  );
}
