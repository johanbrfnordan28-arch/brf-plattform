"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FORENING_AKTIV_EVENT,
  GRUNDMALL_FORENING_ID,
  listaForeningar,
  sattAktivForeningId,
  taBortForening,
  type ForeningProfil,
} from "@/lib/forening-registry";
import { SkapaForeningPanel } from "@/components/forening/SkapaForeningPanel";

// ── Hjälp ─────────────────────────────────────────────────────────────────────

function initial(namn: string): string {
  return namn.replace(/^brf\s+/i, "").charAt(0).toUpperCase() || "F";
}

function formatDatum(iso: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("sv-SE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

// ── Uppgradera-panel ──────────────────────────────────────────────────────────

const paket = [
  {
    namn: "Bas",
    innehall: "Underhållsplan, Rondering, Årshjul, Juridik",
    passarFor: "Mindre föreningar med grundläggande behov",
  },
  {
    namn: "Standard",
    innehall: "Bas + Upphandling, Dokumentbank, Prislistor, Entreprenörer",
    passarFor: "Föreningar med löpande upphandlingar",
  },
  {
    namn: "Plus",
    innehall: "Standard + Projekthantering, Energimodul, Prioriterat stöd",
    passarFor: "Aktiva styrelser med stora underhållsprojekt",
  },
  {
    namn: "Premium",
    innehall: "Plus + Dedikerad rådgivare, Projektledning, SLA",
    passarFor: "Föreningar med höga krav och komplexa behov",
  },
];

function UppgraderaPanel({ forenNamn }: { forenNamn: string }) {
  return (
    <div className="mt-4 rounded-2xl border-2 border-amber-200 bg-amber-50 p-5">
      <div className="flex items-start gap-3">
        <span className="text-2xl" aria-hidden>⭐</span>
        <div>
          <p className="font-bold text-amber-900">
            Aktivera {forenNamn}
          </p>
          <p className="mt-1 text-sm text-amber-800">
            Testperioden är gratis. Välj ett paket och aktivera er
            föreningssida för fortsatt åtkomst med alla funktioner.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {paket.map((p) => (
          <div
            key={p.namn}
            className="rounded-xl border border-amber-200 bg-white p-3"
          >
            <p className="text-sm font-bold text-foreground">{p.namn}</p>
            <p className="mt-0.5 text-xs text-muted">{p.innehall}</p>
            <p className="mt-1 text-xs italic text-amber-700">{p.passarFor}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <a
          href="mailto:info@brfforetag.se?subject=Offertförfrågan&body=Hej, vi är intresserade av att aktivera vår föreningssida."
          className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700"
        >
          Kontakta oss för offert →
        </a>
        <a
          href="/offert"
          className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-sm font-medium text-amber-800 hover:bg-amber-50"
        >
          Läs mer om paketen
        </a>
      </div>
    </div>
  );
}

// ── Föreningskort ─────────────────────────────────────────────────────────────

interface ForeningKortProps {
  forening: ForeningProfil;
  onLoggaIn: () => void;
  onBekraftaTaBort: () => void;
}

function ForeningKort({ forening, onLoggaIn, onBekraftaTaBort }: ForeningKortProps) {
  const [visaUppgradera, setVisaUppgradera] = useState(false);
  const ini = initial(forening.namn);

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-border bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center gap-4 p-5">
        {/* Initial */}
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary text-2xl font-bold text-white shadow-sm">
          {ini}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-lg font-bold text-foreground">{forening.namn}</p>
            <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
              Testperiod
            </span>
          </div>
          <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted">
            {forening.skapadTidpunkt && (
              <span>Skapad {formatDatum(forening.skapadTidpunkt)}</span>
            )}
            {forening.grundinfoPaborjad && (
              <span className="font-medium text-primary-dark">
                ✓ Grunduppgifter ifyllda
              </span>
            )}
          </div>
        </div>

        {/* Logga in */}
        <button
          type="button"
          onClick={onLoggaIn}
          className="shrink-0 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-primary-dark"
        >
          Logga in →
        </button>
      </div>

      {/* Uppgradera + ta bort rad */}
      <div className="flex items-center justify-between border-t border-border/60 bg-surface/40 px-5 py-2.5">
        <button
          type="button"
          onClick={() => setVisaUppgradera((v) => !v)}
          className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-800"
        >
          <span>⭐</span>
          {visaUppgradera ? "Dölj uppgradering" : "Köp föreningssida"}
        </button>
        <button
          type="button"
          onClick={onBekraftaTaBort}
          className="text-xs text-muted hover:text-red-600"
        >
          Ta bort
        </button>
      </div>

      {visaUppgradera && (
        <div className="px-5 pb-5">
          <UppgraderaPanel forenNamn={forening.namn} />
        </div>
      )}
    </div>
  );
}

// ── Huvud-komponent ───────────────────────────────────────────────────────────

export function StyrelseLoginModul() {
  const router = useRouter();
  const [foreningar, setForeningar] = useState<ForeningProfil[]>([]);
  const [bekraftaId, setBekraftaId] = useState<string | null>(null);
  const [visaSkapaForm, setVisaSkapaForm] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  function ladda() {
    setForeningar(
      listaForeningar().filter((f) => f.id !== GRUNDMALL_FORENING_ID),
    );
  }

  useEffect(() => {
    ladda();
    setHydrated(true);
    window.addEventListener(FORENING_AKTIV_EVENT, ladda);
    return () => window.removeEventListener(FORENING_AKTIV_EVENT, ladda);
  }, []);

  function loggaIn(id: string) {
    sattAktivForeningId(id);
    router.push("/forening");
  }

  function bekraftaTaBort(id: string) {
    taBortForening(id);
    setBekraftaId(null);
    ladda();
  }

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-lg animate-pulse space-y-3 px-4">
        <div className="h-24 rounded-2xl bg-border/40" />
        <div className="h-24 rounded-2xl bg-border/40" />
      </div>
    );
  }

  const harForeningar = foreningar.length > 0;

  return (
    <div className="mx-auto max-w-lg space-y-5 px-4">
      {/* Föreningar */}
      {harForeningar && (
        <section>
          <p className="mb-3 text-center text-sm text-muted">
            Välj förening för att logga in
          </p>

          <ul className="space-y-4">
            {foreningar.map((f) =>
              bekraftaId === f.id ? (
                <li key={f.id}>
                  <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-5">
                    <p className="font-bold text-red-900">Ta bort {f.namn}?</p>
                    <p className="mt-1 text-sm text-red-700">
                      All föreningens data raderas permanent och kan inte
                      återställas.
                    </p>
                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => bekraftaTaBort(f.id)}
                        className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                      >
                        Ja, ta bort permanent
                      </button>
                      <button
                        type="button"
                        onClick={() => setBekraftaId(null)}
                        className="rounded-xl border border-border bg-white px-4 py-2 text-sm font-medium text-foreground"
                      >
                        Avbryt
                      </button>
                    </div>
                  </div>
                </li>
              ) : (
                <li key={f.id}>
                  <ForeningKort
                    forening={f}
                    onLoggaIn={() => loggaIn(f.id)}
                    onBekraftaTaBort={() => setBekraftaId(f.id)}
                  />
                </li>
              ),
            )}
          </ul>

          {/* Skapa ny */}
          <div className="mt-5 border-t border-border pt-5">
            {visaSkapaForm ? (
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">
                    Skapa ny testförening
                  </p>
                  <button
                    type="button"
                    onClick={() => setVisaSkapaForm(false)}
                    className="text-sm text-muted hover:text-foreground"
                  >
                    Stäng ↑
                  </button>
                </div>
                <SkapaForeningPanel visaSnabbstart kompakt />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setVisaSkapaForm(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-3.5 text-sm font-medium text-muted transition-colors hover:border-primary/40 hover:text-primary-dark"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="h-4 w-4"
                  aria-hidden
                >
                  <path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
                </svg>
                Skapa ny testförening
              </button>
            )}
          </div>
        </section>
      )}

      {/* Inga föreningar */}
      {!harForeningar && (
        <section>
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#e2f0e6] text-4xl shadow-sm">
              🏠
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              Kom igång gratis
            </h2>
            <p className="mt-2 text-sm text-muted">
              Skapa er föreningssida och prova alla funktioner utan kostnad
              under testperioden.
            </p>
          </div>
          <SkapaForeningPanel visaSnabbstart />
        </section>
      )}

      {/* Nästa gång — hur loggar man in */}
      <div className="rounded-2xl border border-border bg-white p-4">
        <div className="flex gap-3">
          <span className="text-xl" aria-hidden>💡</span>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Hur loggar du in nästa gång?
            </p>
            <p className="mt-1 text-sm text-muted">
              Bokmärk den här sidan i din webbläsare — det är er inloggningssida
              till Styrelseportalen.
            </p>
            <div className="mt-2 flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
              <code className="flex-1 text-xs font-mono text-foreground">
                {typeof window !== "undefined"
                  ? `${window.location.origin}/styrelse-login`
                  : "/styrelse-login"}
              </code>
              <button
                type="button"
                onClick={() => {
                  if (typeof navigator !== "undefined") {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/styrelse-login`,
                    );
                  }
                }}
                className="shrink-0 rounded border border-border px-2 py-0.5 text-xs text-muted hover:text-foreground"
              >
                Kopiera
              </button>
            </div>
            <p className="mt-1.5 text-xs text-muted">
              Alla dina testföreningar sparas automatiskt i den här webbläsaren
              och finns kvar nästa gång du besöker sidan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
