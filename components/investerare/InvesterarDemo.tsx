"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  investerarDemoMal,
  investerarDemoProfiler,
  INVESTERAR_DEMO_DEFAULT,
} from "@/lib/investerar-demo";
import type { TestplanId } from "@/components/underhallsplan/testplaner";

const snabblankar = [
  {
    href: investerarDemoMal.publik,
    titel: "Publik sajt",
    beskrivning: "Värdeerbjudande, film och priser för nya kunder.",
    icon: "🏠",
  },
  {
    href: investerarDemoMal.forening,
    titel: "Föreningens portal",
    beskrivning: "Inloggad miljö — modulkort och översikt.",
    icon: "🏢",
  },
  {
    href: investerarDemoMal.underhallsplan,
    titel: "Underhållsplan",
    beskrivning: "Wizard, testföreningar, budget och slutsida.",
    icon: "🔧",
  },
  {
    href: investerarDemoMal.upphandling,
    titel: "Upphandling",
    beskrivning: "Mallar, publicering och styrelsegodkännande.",
    icon: "📋",
  },
  {
    href: investerarDemoMal.guider,
    titel: "Guider & film",
    beskrivning: "Korta scener som visar funktionerna.",
    icon: "🎬",
  },
] as const;

export function InvesterarDemo() {
  const router = useRouter();
  const [laddar, setLaddar] = useState<TestplanId | null>(null);
  const [fel, setFel] = useState<string | null>(null);

  async function startaDemo(
    id: TestplanId,
    mal = investerarDemoMal.underhallsplanSlutsida,
  ) {
    setLaddar(id);
    setFel(null);
    try {
      const { forberedInvesterarDemo } = await import("@/lib/investerar-demo-seed");
      forberedInvesterarDemo(id);
      router.push(mal);
    } catch (error) {
      console.error(error);
      setFel(
        "Kunde inte ladda demodata. Stoppa dev-servern, kör npm run build && npm run start, och försök igen.",
      );
      setLaddar(null);
    }
  }

  return (
    <main>
      <section className="border-b border-border bg-surface/80">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <p className="inline-flex rounded-full border border-primary/30 bg-[#e2f0e6] px-3 py-1 text-xs font-semibold text-primary-dark">
            Investerardemo · Prototyp
          </p>
          <h1 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            BRF-plattformen — guidad visning
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
            En samlad ingång till de viktigaste modulerna. Starta med en förifylld
            testförening så underhållsplanen är redo med register, besiktningar och
            slutsida.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={Boolean(laddar)}
              onClick={() => startaDemo(INVESTERAR_DEMO_DEFAULT)}
              className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
            >
              {laddar === INVESTERAR_DEMO_DEFAULT
                ? "Laddar demo…"
                : "Starta demo → slutsida"}
            </button>
            <Link
              href={investerarDemoMal.forening}
              className="rounded-lg border border-border bg-white px-6 py-3 text-sm font-medium text-foreground hover:border-primary/40"
            >
              Öppna förening utan förifyllning
            </Link>
          </div>
          <p className="mt-3 text-xs text-muted">
            Demodata sparas i webbläsaren. Rensa webbplatsdata om du vill börja om.
          </p>
          {fel ? (
            <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
              {fel}
            </p>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="text-xl font-semibold text-foreground">Välj testförening</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Båda laddar underhållsplanen automatiskt och öppnar summeringen (steg 7).
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {investerarDemoProfiler.map((profil) => (
            <article
              key={profil.id}
              className="flex flex-col rounded-2xl border border-border bg-surface p-5 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-foreground">{profil.titel}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                {profil.beskrivning}
              </p>
              <ul className="mt-3 space-y-1 text-sm text-foreground">
                {profil.höjdpunkter.map((punkt) => (
                  <li key={punkt} className="flex gap-2">
                    <span className="text-primary" aria-hidden>
                      ·
                    </span>
                    {punkt}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                disabled={Boolean(laddar)}
                onClick={() => startaDemo(profil.id)}
                className="mt-4 rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6] disabled:opacity-60"
              >
                {laddar === profil.id ? "Laddar…" : `Ladda ${profil.titel}`}
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-surface/60">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <h2 className="text-xl font-semibold text-foreground">Snabblänkar</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {snabblankar.map((lank) => (
              <Link
                key={lank.href}
                href={lank.href}
                className="group rounded-2xl border border-border bg-surface p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
              >
                <span className="text-2xl" aria-hidden>
                  {lank.icon}
                </span>
                <h3 className="mt-3 font-semibold text-foreground group-hover:text-primary-dark">
                  {lank.titel}
                </h3>
                <p className="mt-1 text-sm text-muted">{lank.beskrivning}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:pb-16">
        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/90 p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-amber-950">Tips under visningen</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-amber-950/90">
            <li>
              Säg att det är en <strong>prototyp</strong> — data ligger lokalt i
              webbläsaren, ingen riktig BankID-inloggning än.
            </li>
            <li>
              Efter &quot;Starta demo&quot;: scrolla på slutsidan — diagram och
              årsbudget är förifyllda.
            </li>
            <li>
              Visa därefter <strong>Upphandling</strong> och hur styrelsen publicerar
              med Upphandla-knappen.
            </li>
            <li>Uppladdade filer visar filnamn (inte full PDF-lagring i demo).</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
