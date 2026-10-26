"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  lasHusEntreprenorerState,
  type HusEntreprenor,
} from "@/components/entreprenorer/hus-entreprenorer-lager";
import {
  genereraHissAnbudsformularText,
  hissUpphandlingForKategori,
  HISS_UPPHANDLING_EVENT,
  lasHissUpphandling,
} from "@/components/foreningsinformation/hiss-upphandling";

function giltigEpost(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

type Props = {
  kategoriNamn: string;
};

export function HissAnbudMejlPanel({ kategoriNamn }: Props) {
  const uppdrag = hissUpphandlingForKategori(kategoriNamn);
  const [hydrated, setHydrated] = useState(false);
  const [skapad, setSkapad] = useState(false);
  const [entreprenorer, setEntreprenorer] = useState<HusEntreprenor[]>([]);
  const [valdaEposter, setValdaEposter] = useState<string[]>([]);
  const [extraEpost, setExtraEpost] = useState("");
  const [skickar, setSkickar] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!uppdrag) return;
    function ladda() {
      if (!uppdrag) return;
      setSkapad(Boolean(lasHissUpphandling().poster[uppdrag.id].upphandlingSkapad));
    }
    ladda();
    setEntreprenorer(
      lasHusEntreprenorerState().poster.filter((person) => giltigEpost(person.epost.trim())),
    );
    setHydrated(true);
    window.addEventListener(HISS_UPPHANDLING_EVENT, ladda);
    return () => window.removeEventListener(HISS_UPPHANDLING_EVENT, ladda);
  }, [uppdrag]);

  if (!uppdrag || !hydrated || !skapad) return null;

  async function mejla() {
    if (!uppdrag) return;
    const extra = extraEpost
      .split(/[,;\s]+/)
      .map((rad) => rad.trim().toLowerCase())
      .filter(giltigEpost);
    const mottagare = [...new Set([...valdaEposter, ...extra])];
    if (mottagare.length === 0) {
      setStatus("Välj minst en anbudsgivare eller ange en e-postadress.");
      return;
    }
    const text = [
      `Föreningen bjuder in er att lämna anbud på ${uppdrag.rubrik.toLowerCase()}.`,
      "Anbudsformuläret är knutet till ABT-06 och utgår från föreningens uppgifter, bilder och felrapport.",
      "",
      genereraHissAnbudsformularText(uppdrag.id),
    ].join("\n");
    const amne = `Anbudsförfrågan enligt ABT-06 — ${uppdrag.rubrik}`;
    setSkickar(true);
    let skickade = 0;
    let behoverEpostprogram = false;
    for (const till of mottagare) {
      try {
        const res = await fetch("/api/forening/skicka-mejl", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ till, amne, brodtext: text }),
        });
        const data = (await res.json()) as { ok?: boolean; via?: string };
        if (res.ok && data.ok && data.via && data.via !== "demo" && data.via !== "ingen") {
          skickade += 1;
        } else {
          behoverEpostprogram = true;
        }
      } catch {
        behoverEpostprogram = true;
      }
    }
    setSkickar(false);
    if (behoverEpostprogram) {
      window.open(
        `mailto:${mottagare.join(",")}?subject=${encodeURIComponent(amne)}&body=${encodeURIComponent(text)}`,
      );
    }
    if (skickade === mottagare.length) {
      setStatus(`Anbudsformuläret är skickat till ${skickade} mottagare.`);
    } else if (skickade > 0) {
      setStatus(`${skickade} mejl skickades från plattformen. Övriga öppnas i e-postprogrammet.`);
    } else {
      setStatus(
        "Plattformen kunde inte skicka mejlet härifrån. E-postprogrammet är öppnat med anbudsformuläret. Bifoga bilderna på id-bricka och hissmaskinrum från Styrning och Dokument.",
      );
    }
  }

  return (
    <div className="rounded-xl border-2 border-dashed border-primary/40 bg-[#eef6f0]/60 p-4">
      <p className="text-sm font-semibold text-primary-dark">
        Anbudsformulär enligt ABT-06 — {uppdrag.rubrik}
      </p>
      <p className="mt-1 text-sm text-muted">
        Underlaget är flyttat hit från{" "}
        <Link href="/forening/foreningsinformation" className="font-medium text-primary-dark underline">
          Styrning och Dokument
        </Link>
        . Pris på serviceintervall, timpris ordinarie och jour samt bilkostnad ingår i
        formuläret. Bifoga bilderna när mejlet öppnas i e-postprogrammet.
      </p>
      <div className="mt-3 space-y-2">
        {entreprenorer.map((person) => {
          const epost = person.epost.trim().toLowerCase();
          return (
            <label key={person.id} className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={valdaEposter.includes(epost)}
                onChange={() =>
                  setValdaEposter((current) =>
                    current.includes(epost)
                      ? current.filter((rad) => rad !== epost)
                      : [...current, epost],
                  )
                }
                className="mt-0.5"
              />
              <span>
                {person.namn} · {epost}
              </span>
            </label>
          );
        })}
        <input
          type="text"
          value={extraEpost}
          onChange={(event) => setExtraEpost(event.target.value)}
          placeholder="Fler e-postadresser, avgränsade med komma"
          className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={() => void mejla()}
          disabled={skickar}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-60"
        >
          {skickar ? "Skickar…" : "Mejla anbudsformulär"}
        </button>
      </div>
      {status && (
        <p className="mt-2 text-sm text-foreground" role="status">
          {status}
        </p>
      )}
    </div>
  );
}
