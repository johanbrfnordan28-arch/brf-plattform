"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { GRUNDMALL_FORENING_ID } from "@/lib/forening-konstanter";
import {
  FORENING_AKTIV_EVENT,
  finnForeningMedNamn,
  hamtaAktivForeningId,
  kopieraGrundmallOmNyForening,
  listaAllaForeningerForVaxlare,
  markeraNyssSkapadForening,
  sattAktivForeningId,
  skapaNyForening,
  type ForeningProfil,
} from "@/lib/forening-registry";
import { byggNyForeningUrl } from "@/lib/skapa-forening-navigering";

const DEMO_FORENINGAR = [
  {
    namn: "Brf Sailor",
    beskrivning: "Nyproduktion 2013 · 36 lägenheter",
    testplanId: "test-sailor" as const,
  },
  {
    namn: "Brf Nordan 28",
    beskrivning: "Tidigt 1900-tal · 18 lägenheter",
    testplanId: "test-nordan-28" as const,
  },
  {
    namn: "Brf Nordan 30",
    beskrivning: "Tidigt 1900-tal · 24 lägenheter",
    testplanId: "test-nordan-30" as const,
  },
] as const;

export function OppnaBefintligaForeningar() {
  const router = useRouter();
  const [foreningar, setForeningar] = useState<ForeningProfil[]>([]);
  const [aktivId, setAktivId] = useState<string>("");
  const [redo, setRedo] = useState(false);
  const [laddar, setLaddar] = useState<string | null>(null);
  const [fel, setFel] = useState<string | null>(null);

  const ladda = useCallback(() => {
    const lista = listaAllaForeningerForVaxlare().filter(
      (f) => f.id !== GRUNDMALL_FORENING_ID,
    );
    setForeningar(lista);
    setAktivId(hamtaAktivForeningId());
    setRedo(true);
  }, []);

  useEffect(() => {
    ladda();
    window.addEventListener(FORENING_AKTIV_EVENT, ladda);
    return () => window.removeEventListener(FORENING_AKTIV_EVENT, ladda);
  }, [ladda]);

  function oppnaForening(id: string) {
    sattAktivForeningId(id);
    router.push(`/forening?foreningId=${encodeURIComponent(id)}`);
  }

  async function oppnaEllerSkapaDemo(
    namn: string,
    testplanId: (typeof DEMO_FORENINGAR)[number]["testplanId"],
  ) {
    setLaddar(namn);
    setFel(null);
    try {
      let profil = finnForeningMedNamn(namn);
      const skapadesNy = !profil;
      if (!profil) {
        profil = skapaNyForening(namn);
        kopieraGrundmallOmNyForening(profil.id);
        markeraNyssSkapadForening(profil.id);
      } else {
        sattAktivForeningId(profil.id);
      }

      const { forberedInvesterarDemo } = await import(
        "@/lib/investerar-demo-seed"
      );
      forberedInvesterarDemo(testplanId);

      if (skapadesNy) {
        router.push(byggNyForeningUrl(profil.id, profil.namn));
      } else {
        router.push(
          `/forening?foreningId=${encodeURIComponent(profil.id)}&namn=${encodeURIComponent(profil.namn)}`,
        );
      }
    } catch (e) {
      setFel(e instanceof Error ? e.message : "Kunde inte öppna föreningen.");
      setLaddar(null);
    }
  }

  if (!redo) {
    return (
      <p className="text-sm text-muted">Söker efter sparade föreningar …</p>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-base font-semibold text-foreground">
          Dina sparade föreningar
        </h3>
        <p className="mt-1 text-sm text-muted">
          Föreningar ni skapat sparas i den här webbläsaren. Välj en för att
          öppna Styrelseflow — samma lista finns uppe till höger när ni är inne.
        </p>

        {foreningar.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-border bg-surface/60 px-4 py-5 text-sm text-muted">
            Inga egna föreningar hittades i den här webbläsaren. De kan finnas
            i en annan webbläsare eller på en annan enhet — eller ha rensats med
            webbplatsdata. Skapa på nytt nedan, eller öppna en färdig testdemo.
          </p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {foreningar.map((f) => (
              <li
                key={f.id}
                className="flex flex-col rounded-xl border border-border bg-surface p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-foreground">{f.namn}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {f.id === aktivId ? "Aktiv just nu · " : ""}
                      id: {f.id}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => oppnaForening(f.id)}
                  className="brf-knapp-gron mt-4 self-start px-4 py-2 text-sm"
                >
                  Logga in / öppna
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3 className="text-base font-semibold text-foreground">
          Färdiga testföreningar
        </h3>
        <p className="mt-1 text-sm text-muted">
          Brf Sailor och Brf Nordan finns som förberedda demoföreningar med
          underhållsplan. Öppna dem här — de skapas i webbläsaren om de saknas.
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          {DEMO_FORENINGAR.map((demo) => {
            const finns = foreningar.some(
              (f) =>
                f.namn.trim().toLowerCase() === demo.namn.trim().toLowerCase(),
            );
            return (
              <li
                key={demo.namn}
                className="flex flex-col rounded-xl border border-border bg-surface p-4 shadow-sm"
              >
                <p className="font-semibold text-foreground">{demo.namn}</p>
                <p className="mt-1 flex-1 text-sm text-muted">
                  {demo.beskrivning}
                </p>
                <p className="mt-2 text-xs text-muted">
                  {finns ? "Finns redan i den här webbläsaren" : "Skapas vid öppning"}
                </p>
                <button
                  type="button"
                  disabled={Boolean(laddar)}
                  onClick={() => oppnaEllerSkapaDemo(demo.namn, demo.testplanId)}
                  className="mt-4 rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary-dark hover:bg-[#eef6f0] disabled:opacity-60"
                >
                  {laddar === demo.namn
                    ? "Öppnar…"
                    : finns
                      ? "Öppna"
                      : "Skapa & öppna"}
                </button>
              </li>
            );
          })}
        </ul>
        {fel ? (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
            {fel}
          </p>
        ) : null}
      </div>
    </div>
  );
}
