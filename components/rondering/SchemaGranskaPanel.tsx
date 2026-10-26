"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  lasHusEntreprenorerState,
  type HusEntreprenor,
} from "@/components/entreprenorer/hus-entreprenorer-lager";
import { oppnaSchemaGranskningPdf } from "@/components/rondering/exporteraSigneringSchema";
import { genereraAnbudsformularText, skapaDriftUpphandlingar } from "@/components/rondering/skapa-drift-upphandling";
import { hamtaAvtalssignerare } from "@/lib/styrelse-kontakt";
import {
  BESTAMT_SCHEMA_EVENT,
  bestamAktuelltSchema,
  hamtaAktivaSchemaPunkter,
  lasBestamtSchema,
  utkastSkiljerSigFranBestamt,
  type BestamtRonderingsSchema,
} from "@/components/rondering/signering-schema";
import {
  GRUNDMALL_NAMN,
  lasAktivForeningId,
  lasForeningProfil,
} from "@/lib/forening-registry";

function giltigEpost(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function SchemaGranskaPanel() {
  const [bestamt, setBestamt] = useState<BestamtRonderingsSchema | null>(null);
  const [version, setVersion] = useState(0);
  const [valdaEposter, setValdaEposter] = useState<string[]>([]);
  const [extraEpost, setExtraEpost] = useState("");
  const [skickar, setSkickar] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [pdfFel, setPdfFel] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [entreprenorer, setEntreprenorer] = useState<HusEntreprenor[]>([]);

  const ladda = useCallback(() => {
    setBestamt(lasBestamtSchema());
    setVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    ladda();
    setEntreprenorer(
      lasHusEntreprenorerState().poster.filter((p) =>
        giltigEpost(p.epost.trim()),
      ),
    );
    setHydrated(true);
    window.addEventListener("rondering-signering-schema-uppdaterad", ladda);
    window.addEventListener(BESTAMT_SCHEMA_EVENT, ladda);
    return () => {
      window.removeEventListener("rondering-signering-schema-uppdaterad", ladda);
      window.removeEventListener(BESTAMT_SCHEMA_EVENT, ladda);
    };
  }, [ladda]);

  function foreningsNamnNu(): string {
    const id = lasAktivForeningId();
    return lasForeningProfil(id)?.namn?.trim() || GRUNDMALL_NAMN;
  }

  const utkast = useMemo(
    () =>
      hydrated
        ? {
            fastighetsskotare: hamtaAktivaSchemaPunkter("fastighetsskotare"),
            stadning: hamtaAktivaSchemaPunkter("stadning"),
          }
        : { fastighetsskotare: [], stadning: [] },
    [hydrated, version],
  );
  const andrat = utkastSkiljerSigFranBestamt(bestamt);

  function granska() {
    const ok = oppnaSchemaGranskningPdf(utkast, foreningsNamnNu());
    setPdfFel(
      ok
        ? null
        : "Webbläsaren blockerade fönstret. Tillåt popup och försök igen.",
    );
  }

  function bestam() {
    const sparat = bestamAktuelltSchema();
    setBestamt(sparat);
    setStatus("Schemat är bestämt och kan mejlas som underlag.");
  }

  function vaxlaEpost(epost: string) {
    const nyckel = epost.trim().toLowerCase();
    setValdaEposter((current) =>
      current.includes(nyckel)
        ? current.filter((e) => e !== nyckel)
        : [...current, nyckel],
    );
  }

  async function mejla() {
    if (!bestamt) return;
    const extra = extraEpost
      .split(/[,;\s]+/)
      .map((e) => e.trim().toLowerCase())
      .filter(giltigEpost);
    const mottagare = [...new Set([...valdaEposter, ...extra])];
    if (mottagare.length === 0) {
      setStatus("Välj minst en entreprenör eller ange en e-postadress.");
      return;
    }

    const foreningsNamn = foreningsNamnNu();
    const text = [
      `${foreningsNamn} bjuder in er att lämna anbud på städning och fastighetsskötsel.`,
      "Anbudsformuläret, föreningens uppgifter och schemana följer med i det här mejlet.",
      "",
      genereraAnbudsformularText("Städning"),
      "",
      genereraAnbudsformularText("Fastighetsskötsel"),
    ].join("\n\n");
    const amne = `Schemaunderlag — ${foreningsNamn}`;

    setSkickar(true);
    let skickade = 0;
    let behöverEpostprogram = false;
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
          behöverEpostprogram = true;
        }
      } catch {
        behöverEpostprogram = true;
      }
    }
    setSkickar(false);

    if (behöverEpostprogram) {
      const kropp = encodeURIComponent(text);
      const subject = encodeURIComponent(amne);
      window.open(
        `mailto:${mottagare.join(",")}?subject=${subject}&body=${kropp}`,
      );
    }

    if (skickade === mottagare.length) {
      setStatus(`Underlaget är skickat till ${skickade} mottagare.`);
    } else if (skickade > 0) {
      setStatus(
        `${skickade} mejl skickades från plattformen. Övriga öppnas i e-postprogrammet.`,
      );
    } else {
      setStatus(
        "Plattformen kunde inte skicka mejlet härifrån. E-postprogrammet är öppnat med underlaget.",
      );
    }
  }

  return (
    <div className="rounded-xl border border-primary/30 bg-[#eef6f0] p-4 sm:p-5">
      <h3 className="text-base font-semibold text-primary-dark">Granska schema</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Öppna ronderingsschemat och städschemat som PDF och se om styrelsen är
        nöjd. Justera momenten längre ner och bestäm schemat.         Därefter kan ni skapa upphandling. Underlaget, föreningens uppgifter
        och anbudsformuläret flyttas till upphandlingsmodulen. Avtalet
        undertecknas av{" "}
        {hydrated
          ? hamtaAvtalssignerare()
              .map((person) => `${person.namn} (${person.roll})`)
              .join(", ") || "den som anges under föreningens uppgifter"
          : "den som anges under föreningens uppgifter"}
        .
      </p>
      <p className="mt-2 text-xs text-muted">
        Fastighetsskötare: {utkast.fastighetsskotare.length} moment · Städ:{" "}
        {utkast.stadning.length} moment
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={granska}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          Visa schema som PDF
        </button>
        <button
          type="button"
          onClick={bestam}
          className="rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary-dark hover:bg-white"
        >
          Bestäm schema
        </button>
        <button
          type="button"
          onClick={() => {
            const resultat = skapaDriftUpphandlingar();
            setStatus(
              resultat.ok
                ? `Upphandling skapad för städning och fastighetsskötsel. Underlaget ligger i upphandlingsmodulen.`
                : resultat.fel,
            );
          }}
          className="rounded-lg border border-primary bg-white px-4 py-2 text-sm font-medium text-primary-dark hover:bg-[#eef6f0]"
        >
          Skapa upphandling
        </button>
      </div>
      {pdfFel && (
        <p className="mt-2 text-sm text-amber-950" role="status">
          {pdfFel}
        </p>
      )}
      {bestamt && (
        <p className="mt-3 text-sm text-foreground">
          Schemat bestämdes{" "}
          {new Date(bestamt.bestamd).toLocaleString("sv-SE")} (
          {bestamt.punkter.fastighetsskotare.length} ronderingsmoment,{" "}
          {bestamt.punkter.stadning.length} städmoment).
        </p>
      )}
      {andrat && (
        <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          Momenten är ändrade sedan schemat bestämdes. Bestäm igen om det nya
          ska vara det som mejlas.
        </p>
      )}

      {bestamt && (
        <div className="mt-4 rounded-lg border border-border bg-white p-4">
          <p className="text-sm font-medium text-foreground">
            Mejla bestämt underlag
          </p>
          {entreprenorer.length > 0 && (
            <ul className="mt-3 space-y-2">
              {entreprenorer.map((person) => {
                const epost = person.epost.trim().toLowerCase();
                return (
                  <li key={person.id}>
                    <label className="flex items-start gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={valdaEposter.includes(epost)}
                        onChange={() => vaxlaEpost(epost)}
                        className="mt-1"
                      />
                      <span>
                        {person.namn}
                        <span className="block text-xs text-muted">
                          {person.epost}
                          {person.kategori ? ` · ${person.kategori}` : ""}
                        </span>
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
          <label className="mt-3 block text-sm">
            <span className="font-medium text-foreground">
              Fler e-postadresser
            </span>
            <input
              type="text"
              value={extraEpost}
              onChange={(e) => setExtraEpost(e.target.value)}
              placeholder="namn@foretag.se, annan@foretag.se"
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </label>
          <button
            type="button"
            onClick={() => void mejla()}
            disabled={skickar}
            className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-60"
          >
            {skickar ? "Skickar…" : "Mejla anbudsformulär"}
          </button>
          <p className="mt-2 text-xs text-muted">
            Mejlet innehåller anbudsformulär för städning och
            fastighetsskötsel, med föreningens uppgifter och det bestämda
            schemat.
          </p>
        </div>
      )}
      {status && (
        <p className="mt-3 text-sm text-primary-dark" role="status">
          {status}
        </p>
      )}
    </div>
  );
}
