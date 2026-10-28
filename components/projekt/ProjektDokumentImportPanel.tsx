"use client";

import { useEffect, useMemo, useState } from "react";
import type { DokumentbankMall } from "@/components/dokumentbank/mallar";
import {
  DOKUMENTBANK_EGNA_EVENT,
  lasEgnaDokumentbankMallar,
} from "@/components/dokumentbank/dokumentbank-lager";
import { dokumentbankMallar } from "@/components/dokumentbank/mallar";
import {
  FORENINGS_DOK_EVENT,
  lasForeningsDokument,
  type ForeningsDokument,
} from "@/components/dokumentbank/forening-dokumenter-lager";
import {
  arEgenkontrollProjektMapp,
  importeraDokumentTillProjekt,
} from "@/components/dokumentbank/dokument-projekt-koppling";
import { arEgenkontrollDokument } from "@/components/dokumentbank/forening-dokument-egenkontroll";
import { arEgenkontrollMallId } from "@/components/dokumentbank/mallar/egenkontroll-mallar";
type ProjektDokumentImportPanelProps = {
  /** Anropas när dokumentet redan sparats i projektet (uppdatera listan). */
  onImportKlar: () => void;
  onStang: () => void;
  projektId: string;
  mappId: string;
  projektTitel: string;
};

export function ProjektDokumentImportPanel({
  onImportKlar,
  onStang,
  projektId,
  mappId,
  projektTitel,
}: ProjektDokumentImportPanelProps) {
  const [flik, setFlik] = useState<"mina" | "mallar">("mina");
  const [mina, setMina] = useState<ForeningsDokument[]>([]);
  const [mallar, setMallar] = useState<DokumentbankMall[]>([]);
  const [fel, setFel] = useState<string | null>(null);

  const egenkontrollMapp = arEgenkontrollProjektMapp(mappId);

  function ladda() {
    setMina(lasForeningsDokument().dokument);
    setMallar([...dokumentbankMallar, ...lasEgnaDokumentbankMallar()]);
  }

  useEffect(() => {
    ladda();
    window.addEventListener(FORENINGS_DOK_EVENT, ladda);
    window.addEventListener(DOKUMENTBANK_EGNA_EVENT, ladda);
    return () => {
      window.removeEventListener(FORENINGS_DOK_EVENT, ladda);
      window.removeEventListener(DOKUMENTBANK_EGNA_EVENT, ladda);
    };
  }, []);

  const minaFiltrerade = useMemo(() => {
    if (!egenkontrollMapp) return mina;
    return mina.filter((d) => arEgenkontrollDokument(d));
  }, [mina, egenkontrollMapp]);

  const mallarFiltrerade = useMemo(() => {
    if (!egenkontrollMapp) return mallar;
    return mallar.filter((m) => arEgenkontrollMallId(m.id));
  }, [mallar, egenkontrollMapp]);

  function importeraMall(mall: DokumentbankMall) {
    setFel(null);
    const docTitel = `${projektTitel} — ${mall.titel}`;
    const result = importeraDokumentTillProjekt(projektId, mappId, {
      id: `tmp-${Date.now()}`,
      filnamn: `${docTitel.replace(/\s+/g, "_")}.txt`,
      uppladdad: new Date().toLocaleDateString("sv-SE"),
      kalla: "bank",
      bankId: mall.id,
    });
    if (!result.ok) {
      setFel(result.fel);
      return;
    }
    onImportKlar();
  }

  function importeraMitt(dok: ForeningsDokument) {
    setFel(null);
    const result = importeraDokumentTillProjekt(projektId, mappId, {
      id: `tmp-${Date.now()}`,
      filnamn: dok.titel.endsWith(".txt") ? dok.titel : `${dok.titel}.txt`,
      uppladdad: new Date().toLocaleDateString("sv-SE"),
      kalla: "foreningsdokument",
      foreningsDokumentId: dok.id,
      bankId: dok.mallId,
    });
    if (!result.ok) {
      setFel(result.fel);
      return;
    }
    onImportKlar();
  }

  return (
    <div className="mt-3 rounded-lg border border-primary/25 bg-[#eef6f0]/80 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-primary-dark">
          {egenkontrollMapp
            ? "Skapa eller importera egenkontroll"
            : "Importera från dokumentbank"}
        </p>
        <button
          type="button"
          onClick={onStang}
          className="text-xs text-muted hover:text-foreground"
        >
          Stäng
        </button>
      </div>
      {egenkontrollMapp && (
        <p className="mt-2 text-xs text-muted">
          Välj mall för att skapa en redigerbar egenkontroll i projektet, eller
          koppla ett befintligt dokument. Huvudentreprenören ansvarar för att
          kontrollerna blir kompletta.
        </p>
      )}
      <div className="mt-2 flex gap-1">
        <button
          type="button"
          onClick={() => setFlik("mina")}
          className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
            flik === "mina"
              ? "bg-white text-foreground shadow-sm"
              : "text-muted"
          }`}
        >
          Mina dokument
        </button>
        <button
          type="button"
          onClick={() => setFlik("mallar")}
          className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
            flik === "mallar"
              ? "bg-white text-foreground shadow-sm"
              : "text-muted"
          }`}
        >
          Mallar
        </button>
      </div>
      {fel && (
        <p className="mt-2 text-xs text-red-700" role="alert">
          {fel}
        </p>
      )}
      <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto">
        {flik === "mina" &&
          (minaFiltrerade.length === 0 ? (
            <li className="text-xs text-muted">
              {egenkontrollMapp
                ? "Inga egenkontroller i dokumentbanken ännu — använd fliken Mallar."
                : "Skapa dokument under "}
              {!egenkontrollMapp && (
                <a href="/forening/dokumentbank" className="underline">
                  Dokumentbank
                </a>
              )}
              {!egenkontrollMapp && "."}
            </li>
          ) : (
            minaFiltrerade.map((dok) => (
              <li
                key={dok.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-border bg-white px-3 py-2"
              >
                <span className="min-w-0 truncate text-sm">{dok.titel}</span>
                <button
                  type="button"
                  onClick={() => importeraMitt(dok)}
                  className="shrink-0 rounded-lg border border-primary px-2 py-1 text-xs font-medium text-primary-dark"
                >
                  {egenkontrollMapp ? "Koppla till projekt" : "Lägg till"}
                </button>
              </li>
            ))
          ))}
        {flik === "mallar" &&
          (mallarFiltrerade.length === 0 ? (
            <li className="text-xs text-muted">Inga mallar i denna kategori.</li>
          ) : (
            mallarFiltrerade.map((mall) => (
              <li
                key={mall.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-border bg-white px-3 py-2"
              >
                <span className="min-w-0 truncate text-sm">{mall.titel}</span>
                <button
                  type="button"
                  onClick={() => importeraMall(mall)}
                  className="shrink-0 rounded-lg border border-primary px-2 py-1 text-xs font-medium text-primary-dark"
                >
                  {arEgenkontrollMallId(mall.id)
                    ? "Skapa i projektet"
                    : "Lägg till"}
                </button>
              </li>
            ))
          ))}
      </ul>
    </div>
  );
}
