"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  lasHusEntreprenorerState,
  type HusEntreprenor,
} from "@/components/entreprenorer/hus-entreprenorer-lager";
import {
  BESIKTNING_UPPHANDLING_EVENT,
  besiktningTjanstForKategori,
  genereraBesiktningAnbudsformularText,
  genereraBesiktningUnderlagText,
  hamtaBesiktningPost,
  ovkIntervallInformationsText,
} from "@/components/foreningsinformation/besiktning-upphandling";
import { hamtaSynkadPlanGrund } from "@/lib/forening-grund-synk";
import { hamtaStyrelseKontakt } from "@/lib/styrelse-kontakt";

function giltigEpost(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

type Props = {
  kategoriNamn: string;
};

export function BesiktningAnbudMejlPanel({ kategoriNamn }: Props) {
  const tjanst = besiktningTjanstForKategori(kategoriNamn);
  const [hydrated, setHydrated] = useState(false);
  const [skapad, setSkapad] = useState<string | undefined>();
  const [harFormular, setHarFormular] = useState(false);
  const [entreprenorer, setEntreprenorer] = useState<HusEntreprenor[]>([]);
  const [valdEpost, setValdEpost] = useState("");
  const [valdaEposter, setValdaEposter] = useState<string[]>([]);
  const [extraEpost, setExtraEpost] = useState("");
  const [visaGranskning, setVisaGranskning] = useState(false);
  const [skickar, setSkickar] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const kontakt = hamtaStyrelseKontakt();
  const franEpost = kontakt?.epost?.trim() || "";

  useEffect(() => {
    if (!tjanst) return;
    function ladda() {
      if (!tjanst) return;
      const post = hamtaBesiktningPost(tjanst.id);
      setSkapad(post.upphandlingSkapad);
      setHarFormular(Boolean(post.anbudsformularText));
    }
    ladda();
    setEntreprenorer(
      lasHusEntreprenorerState().poster.filter((person) =>
        giltigEpost(person.epost.trim()),
      ),
    );
    setHydrated(true);
    window.addEventListener(BESIKTNING_UPPHANDLING_EVENT, ladda);
    return () => window.removeEventListener(BESIKTNING_UPPHANDLING_EVENT, ladda);
  }, [tjanst]);

  const mejlInnehall = useMemo(() => {
    if (!tjanst) return "";
    return [
      `Föreningen bjuder in er att lämna anbud på ${tjanst.rubrik.toLowerCase()}.`,
      "Anbudsformuläret är skapat utifrån föreningens uppgifter och tidigare protokoll.",
      "",
      genereraBesiktningAnbudsformularText(tjanst.id),
    ].join("\n");
  }, [tjanst]);

  const ffuUtkast = useMemo(() => {
    if (!tjanst) return "";
    return genereraBesiktningUnderlagText(tjanst.id);
  }, [tjanst]);

  if (!tjanst || !hydrated || !skapad) return null;

  function vaxlaEpost(epost: string) {
    const nyckel = epost.trim().toLowerCase();
    setValdaEposter((current) =>
      current.includes(nyckel)
        ? current.filter((rad) => rad !== nyckel)
        : [...current, nyckel],
    );
  }

  function laggTillFranLista() {
    const epost = valdEpost.trim().toLowerCase();
    if (!giltigEpost(epost) || valdaEposter.includes(epost)) return;
    setValdaEposter((current) => [...current, epost]);
    setValdEpost("");
  }

  async function mejla() {
    if (!tjanst) return;
    const extra = extraEpost
      .split(/[,;\s]+/)
      .map((rad) => rad.trim().toLowerCase())
      .filter(giltigEpost);
    const mottagare = [...new Set([...valdaEposter, ...extra])];
    if (mottagare.length === 0) {
      setStatus("Välj minst en anbudsgivare eller ange e-post.");
      return;
    }
    const amne = `Anbudsförfrågan — ${tjanst.rubrik}`;
    setSkickar(true);
    let skickade = 0;
    let behoverEpostprogram = false;
    for (const till of mottagare) {
      try {
        const res = await fetch("/api/forening/skicka-mejl", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            till,
            amne,
            brodtext: mejlInnehall,
            ...(franEpost ? { fran: franEpost } : {}),
          }),
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
    setVisaGranskning(false);
    if (behoverEpostprogram) {
      window.open(
        `mailto:${mottagare.join(",")}?subject=${encodeURIComponent(amne)}&body=${encodeURIComponent(mejlInnehall)}`,
      );
    }
    if (skickade === mottagare.length) {
      setStatus(`Anbudsförfrågan skickad till ${skickade} mottagare.`);
    } else if (skickade > 0) {
      setStatus(`${skickade} mejl skickades. Övriga öppnas i e-postprogrammet.`);
    } else {
      setStatus(
        "E-postprogrammet öppnas med anbudsformuläret — granska innan ni skickar.",
      );
    }
  }

  return (
    <div className="rounded-xl border-2 border-dashed border-primary/40 bg-[#eef6f0]/60 p-4">
      <p className="text-sm font-semibold text-primary-dark">
        Anbudsförfrågan — {tjanst.rubrik}
      </p>
      <p className="mt-1 text-sm text-muted">
        Underlag från{" "}
        <Link
          href="/forening/foreningsinformation"
          className="font-medium text-primary-dark underline"
        >
          Styrning och Dokument
        </Link>
        : tidigare protokoll och föreningens uppgifter. Granska utkast innan utskick.
      </p>

      {tjanst.id === "ovk" && (
        <div className="mt-3 rounded-lg border border-primary/25 bg-[#eef6f0]/80 p-3">
          <p className="text-xs font-semibold text-primary-dark">OVK-intervall</p>
          <pre className="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-primary-dark">
            {ovkIntervallInformationsText(
              hamtaSynkadPlanGrund()?.ventilationssystem ?? "",
            )}
          </pre>
        </div>
      )}

      <div className="mt-3 rounded-lg border border-border bg-white p-3">
        <p className="text-xs font-semibold text-foreground">
          Utkast — förfrågningsunderlag (FFU)
        </p>
        <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap text-xs text-muted">
          {ffuUtkast}
        </pre>
      </div>

      <div className="mt-3 space-y-2">
        <p className="text-xs font-medium text-foreground">Anbudsgivare</p>
        {entreprenorer.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            <select
              value={valdEpost}
              onChange={(e) => setValdEpost(e.target.value)}
              className="min-w-[12rem] flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm"
            >
              <option value="">Välj i listan…</option>
              {entreprenorer.map((person) => {
                const epost = person.epost.trim().toLowerCase();
                return (
                  <option key={person.id} value={epost}>
                    {person.namn} · {epost}
                  </option>
                );
              })}
            </select>
            <button
              type="button"
              onClick={laggTillFranLista}
              disabled={!valdEpost}
              className="rounded-lg border border-primary px-3 py-2 text-sm font-medium text-primary-dark hover:bg-[#eef6f0] disabled:opacity-40"
            >
              Lägg till mottagare
            </button>
          </div>
        ) : (
          <p className="text-xs text-muted">
            Lägg till entreprenörer med e-post under Entreprenörer i huset.
          </p>
        )}
        {valdaEposter.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {valdaEposter.map((epost) => (
              <li key={epost}>
                <button
                  type="button"
                  onClick={() => vaxlaEpost(epost)}
                  className="rounded-full bg-[#e2f0e6] px-2.5 py-1 text-xs font-medium text-primary-dark"
                >
                  {epost} ×
                </button>
              </li>
            ))}
          </ul>
        )}
        {entreprenorer.map((person) => {
          const epost = person.epost.trim().toLowerCase();
          return (
            <label key={`cb-${person.id}`} className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={valdaEposter.includes(epost)}
                onChange={() => vaxlaEpost(epost)}
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
        {franEpost && (
          <p className="text-xs text-muted">
            Avsändare (förening): {franEpost}
          </p>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setVisaGranskning((v) => !v)}
          className="rounded-lg border border-primary bg-white px-4 py-2 text-sm font-medium text-primary-dark hover:bg-[#eef6f0]"
        >
          {visaGranskning ? "Dölj granskning" : "Granska mejl innan utskick"}
        </button>
        <button
          type="button"
          onClick={() => void mejla()}
          disabled={skickar || !harFormular}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-60"
        >
          {skickar ? "Skickar…" : "Skicka anbudsförfrågan"}
        </button>
      </div>

      {visaGranskning && (
        <div className="mt-3 rounded-lg border border-primary/30 bg-white p-3">
          <p className="text-xs font-semibold text-foreground">Mejl som skickas</p>
          <p className="mt-1 text-xs text-muted">
            Till: {valdaEposter.join(", ") || "(välj mottagare)"}
          </p>
          <p className="text-xs text-muted">
            Ämne: Anbudsförfrågan — {tjanst.rubrik}
          </p>
          <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap text-xs text-foreground">
            {mejlInnehall}
          </pre>
        </div>
      )}

      {status && (
        <p className="mt-2 text-sm text-foreground" role="status">
          {status}
        </p>
      )}
    </div>
  );
}
