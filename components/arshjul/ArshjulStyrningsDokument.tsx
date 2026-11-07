"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BIBLIOTEK_EVENT,
  bekraftaOmDubblett,
  hamtaBibliotekFilUrl,
  laddaUppTillMapp,
  listaDokumentIMapp,
  type BibliotekUppladdatDokument,
} from "@/components/foreningsinformation/foreningsinformation-bibliotek-lager";
import {
  BESIKTNING_UPPHANDLING_EVENT,
  type BesiktningTjanstId,
} from "@/components/foreningsinformation/besiktning-upphandling";
import { foreningsHuvudmappar } from "@/components/foreningsinformation/mappar";
import { styrningPlatsForBesiktning } from "@/lib/forening-dokument-platser";
import { MOLN_FIL_ACCEPT, oppnaFilIFlik } from "@/lib/forening-fil-lagring";

type Props = {
  tjanstId: BesiktningTjanstId;
};

/** Visar och laddar upp protokoll i besiktningens mapp i Styrning och Dokument. */
export function ArshjulStyrningsDokument({ tjanstId }: Props) {
  const plats = styrningPlatsForBesiktning(tjanstId);
  const huvudId = plats?.typ === "styrning" ? plats.huvudId : "";
  const underPath = plats?.typ === "styrning" ? plats.underPath : "";
  const [dokument, setDokument] = useState<BibliotekUppladdatDokument[]>([]);
  const [laddarUpp, setLaddarUpp] = useState(false);
  const [status, setStatus] = useState<{ fel: boolean; text: string } | null>(null);

  useEffect(() => {
    if (!huvudId) return;
    function ladda() {
      setDokument(listaDokumentIMapp(huvudId, underPath));
    }
    ladda();
    window.addEventListener(BIBLIOTEK_EVENT, ladda);
    return () => window.removeEventListener(BIBLIOTEK_EVENT, ladda);
  }, [huvudId, underPath]);

  if (!huvudId) return null;

  const huvud = foreningsHuvudmappar.find((h) => h.id === huvudId);
  const mappNamn = [
    huvud?.titel.replace(/^\d+\.\s*/, ""),
    huvud?.undermappar.find((u) => u.id === underPath.split("/")[0])?.titel,
  ]
    .filter(Boolean)
    .join(" → ");

  async function laddaUpp(fil: File) {
    if (!bekraftaOmDubblett(dokument, fil.name)) {
      setStatus({ fel: false, text: `${fil.name} finns redan och laddades inte upp igen.` });
      return;
    }
    setLaddarUpp(true);
    setStatus({ fel: false, text: `Laddar upp ${fil.name}…` });
    const res = await laddaUppTillMapp(huvudId, underPath, fil);
    setLaddarUpp(false);
    if (res.ok) window.dispatchEvent(new CustomEvent(BESIKTNING_UPPHANDLING_EVENT));
    setStatus(
      res.ok
        ? { fel: false, text: `${fil.name} är sparat i Styrning och Dokument.` }
        : { fel: true, text: res.fel },
    );
  }

  return (
    <div className="text-sm">
      <p className="font-medium text-foreground">Protokoll och dokument</p>
      <p className="mt-0.5 text-xs text-muted">
        Dokumenten sparas i Styrning och Dokument → {mappNamn} och öppnas härifrån.{" "}
        <Link href="/forening/foreningsinformation" className="text-primary-dark underline">
          Gå till mappen
        </Link>
      </p>

      {dokument.length === 0 ? (
        <p className="mt-2 text-xs text-muted">Inga dokument i mappen ännu.</p>
      ) : (
        <ul className="mt-2 space-y-1">
          {[...dokument].reverse().map((dok) => (
            <li
              key={dok.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#f7f9f8] px-2.5 py-1.5"
            >
              <span className="min-w-0">
                <span className="block font-medium text-foreground">{dok.filnamn}</span>
                <span className="block text-xs text-muted">Uppladdad {dok.uppladdad}</span>
              </span>
              <button
                type="button"
                onClick={() => void oppnaFilIFlik(() => hamtaBibliotekFilUrl(dok))}
                className="rounded-lg border border-primary/40 px-3 py-1 text-xs font-medium text-primary-dark hover:bg-[#eef6f0]"
              >
                Öppna
              </button>
            </li>
          ))}
        </ul>
      )}

      <label
        className={`mt-2 inline-flex cursor-pointer rounded-lg border border-primary px-3 py-1.5 text-sm font-medium text-primary-dark hover:bg-[#eef6f0] ${laddarUpp ? "pointer-events-none opacity-50" : ""}`}
      >
        {laddarUpp ? "Laddar upp…" : "Ladda upp protokoll"}
        <input
          type="file"
          accept={MOLN_FIL_ACCEPT}
          className="sr-only"
          disabled={laddarUpp}
          onChange={(e) => {
            const fil = e.target.files?.[0];
            e.target.value = "";
            if (fil) void laddaUpp(fil);
          }}
        />
      </label>
      {status ? (
        <p
          className={`mt-1 text-xs ${status.fel ? "text-red-800" : "text-primary-dark"}`}
          role={status.fel ? "alert" : "status"}
        >
          {status.text}
        </p>
      ) : null}
    </div>
  );
}
