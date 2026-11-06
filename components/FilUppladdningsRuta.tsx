"use client";

import { useState } from "react";
import {
  formateraFilstorlek,
  MAX_FIL_BYTE,
  MOLN_FIL_ACCEPT,
} from "@/lib/forening-fil-lagring";
import { DokumentPlatsVal } from "@/components/DokumentPlatsVal";
import type { DokumentPlats, DokumentPlatsTyp } from "@/lib/forening-dokument-platser";

export type FilUppladdningsResultat =
  | { ok: true; varning?: string }
  | { ok: false; fel: string };

type Props = {
  onSpara: (
    fil: File,
    onProgress: (procent: number) => void,
    platser: DokumentPlats[],
  ) => Promise<FilUppladdningsResultat>;
  onAvbryt?: () => void;
  sparaEtikett?: string;
  accept?: string;
  maxByte?: number;
  /** Visar "Visa även i …" så att filen kan synas på fler ställen. */
  delaTill?: { typer: DokumentPlatsTyp[]; aktuellNyckel?: string };
};

/** Välj fil → granska → Spara. Fel och förlopp visas direkt i rutan. */
export function FilUppladdningsRuta({
  onSpara,
  onAvbryt,
  sparaEtikett = "Spara i mappen",
  accept = MOLN_FIL_ACCEPT,
  maxByte = MAX_FIL_BYTE,
  delaTill,
}: Props) {
  const [platser, setPlatser] = useState<DokumentPlats[]>([]);
  const [varning, setVarning] = useState<string | null>(null);
  const [valdFil, setValdFil] = useState<File | null>(null);
  const [sparar, setSparar] = useState(false);
  const [procent, setProcent] = useState(0);
  const [fel, setFel] = useState<string | null>(null);

  function valjFil(fil: File | null) {
    setFel(null);
    setVarning(null);
    if (fil && fil.size > maxByte) {
      setValdFil(null);
      setFel(
        `${fil.name} är ${formateraFilstorlek(fil.size)} – max ${formateraFilstorlek(maxByte)}.`,
      );
      return;
    }
    setValdFil(fil);
  }

  async function spara() {
    if (!valdFil || sparar) return;
    setSparar(true);
    setProcent(0);
    setFel(null);
    const res = await onSpara(valdFil, setProcent, platser);
    setSparar(false);
    if (res.ok) {
      setValdFil(null);
      setVarning(res.varning ?? null);
    } else setFel(res.fel);
  }

  return (
    <div className="space-y-3 rounded-lg border border-primary/40 bg-white p-3">
      <div className="flex flex-wrap items-center gap-3">
        <label
          className={`inline-flex cursor-pointer rounded-lg border border-primary px-3 py-1.5 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6] ${sparar ? "pointer-events-none opacity-50" : ""}`}
        >
          {valdFil ? "Byt fil" : "Välj fil"}
          <input
            type="file"
            accept={accept}
            className="sr-only"
            disabled={sparar}
            onChange={(e) => {
              valjFil(e.target.files?.[0] ?? null);
              e.target.value = "";
            }}
          />
        </label>
        {valdFil ? (
          <span className="min-w-0 text-sm text-foreground">
            <span className="font-medium">{valdFil.name}</span>{" "}
            <span className="text-xs text-muted">
              ({formateraFilstorlek(valdFil.size)})
            </span>
          </span>
        ) : (
          <span className="text-xs text-muted">
            PDF, Word, Excel eller bild – max {formateraFilstorlek(maxByte)}.
          </span>
        )}
      </div>

      {valdFil && delaTill ? (
        <DokumentPlatsVal
          typer={delaTill.typer}
          aktuellNyckel={delaTill.aktuellNyckel}
          onChange={setPlatser}
          disabled={sparar}
        />
      ) : null}

      {sparar ? (
        <div
          className="h-2 overflow-hidden rounded-full bg-[#e2f0e6]"
          role="progressbar"
          aria-valuenow={procent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full bg-primary transition-[width]"
            style={{ width: `${procent}%` }}
          />
        </div>
      ) : null}

      {fel ? (
        <p className="text-sm text-red-800" role="alert">
          {fel}
        </p>
      ) : null}

      {varning ? (
        <p className="text-sm text-amber-800" role="status">
          {varning}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void spara()}
          disabled={!valdFil || sparar}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sparar ? `Sparar… ${procent}%` : sparaEtikett}
        </button>
        {onAvbryt ? (
          <button
            type="button"
            onClick={onAvbryt}
            disabled={sparar}
            className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:bg-background disabled:opacity-50"
          >
            Avbryt
          </button>
        ) : null}
      </div>
    </div>
  );
}
