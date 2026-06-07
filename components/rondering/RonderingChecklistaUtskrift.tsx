"use client";

import {
  byggEffektivChecklista,
  type ChecklistaAnpassning,
} from "@/components/rondering/checklist-effektiv";
import {
  checklistaPunktNyckel,
  ronderingChecklistaEtiketter,
  type RonderingChecklistaTyp,
} from "@/components/rondering/checklist-mallar";
import type { ForeningEgenskaper } from "@/components/rondering/forening-egenskaper";

type RonderingChecklistaUtskriftProps = {
  typer: RonderingChecklistaTyp[];
  egenskaper: ForeningEgenskaper;
  anpassning: ChecklistaAnpassning;
  klaraPunkter: string[];
  foreningNamn?: string;
  utskriftsId: string;
};

export function RonderingChecklistaUtskrift({
  typer,
  egenskaper,
  anpassning,
  klaraPunkter,
  foreningNamn,
  utskriftsId,
}: RonderingChecklistaUtskriftProps) {
  const klaraSet = new Set(klaraPunkter);
  const datum = new Date().toLocaleDateString("sv-SE");

  return (
    <div
      id={utskriftsId}
      className="rondering-utskrift hidden print:block"
      aria-hidden
    >
      {typer.map((typ, idx) => {
        const mall = byggEffektivChecklista(typ, egenskaper, anpassning);
        return (
          <div
            key={typ}
            className={`bg-white p-8 text-black ${idx < typer.length - 1 ? "print:break-after-page" : ""}`}
          >
            <header className="border-b-2 border-black pb-4">
              <p className="text-xs uppercase tracking-wide">
                Underhålls- och städchecklista
              </p>
              <h1 className="mt-1 text-2xl font-bold">{mall.titel}</h1>
              {foreningNamn && (
                <p className="mt-2 text-sm">{foreningNamn}</p>
              )}
              <p className="mt-1 text-sm">Datum: {datum}</p>
              <p className="mt-2 text-xs leading-relaxed">{mall.beskrivning}</p>
            </header>

            <div className="mt-6 space-y-5">
              {mall.sektioner.map((sektion) => (
                <section key={sektion.id}>
                  <h2 className="text-base font-bold">{sektion.etikett}</h2>
                  {sektion.beskrivning && (
                    <p className="text-xs text-gray-600">{sektion.beskrivning}</p>
                  )}
                  <ul className="mt-2 space-y-2">
                    {sektion.punkter.map((punkt) => {
                      const nyckel = checklistaPunktNyckel(
                        typ,
                        sektion.id,
                        punkt.id,
                      );
                      const klar = klaraSet.has(nyckel);
                      return (
                        <li key={nyckel} className="flex gap-3 text-sm leading-snug">
                          <span
                            className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center border-2 border-black text-[10px] font-bold"
                            aria-hidden
                          >
                            {klar ? "✓" : ""}
                          </span>
                          <span>{punkt.text}</span>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>

            <footer className="mt-10 border-t border-gray-400 pt-4 text-xs">
              <p>Utförd av: _________________________ Datum: _____________</p>
              <p className="mt-2">
                Signatur / attest (entreprenör): _________________________
              </p>
              <p className="mt-4 text-gray-600">
                {ronderingChecklistaEtiketter[typ]} — anpassad checklista för
                föreningen.
              </p>
            </footer>
          </div>
        );
      })}
    </div>
  );
}

export function skrivUtChecklista(elementId: string) {
  const rensa = () => document.body.classList.remove("rondering-print-lage");
  document.body.classList.add("rondering-print-lage");
  window.addEventListener("afterprint", rensa, { once: true });
  window.print();
}
