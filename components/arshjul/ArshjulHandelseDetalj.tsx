"use client";

import { useState } from "react";
import type {
  ArshjulBilaga,
  ArshjulHandelse,
} from "@/components/arshjul/arshjul";

const MAX_FIL_BYTE = 280_000;

type Props = {
  handelse: ArshjulHandelse;
  onSpara: (patch: Partial<ArshjulHandelse>) => void;
};

export function ArshjulHandelseDetalj({ handelse, onSpara }: Props) {
  const [filFel, setFilFel] = useState<string | null>(null);
  const [leverantor, setLeverantor] = useState(handelse.leverantor ?? "");
  const [attHanteraText, setAttHanteraText] = useState(
    (handelse.attHantera ?? []).join("\n"),
  );
  const [bankid, setBankid] = useState(
    handelse.bankid ?? { namn: "", epost: "", forberedd: false },
  );

  function laggTillFil(fil: File | null) {
    setFilFel(null);
    if (!fil) return;
    if (fil.size > MAX_FIL_BYTE) {
      setFilFel(
        "Filen är för stor för att sparas här. Håll dagordningen under 280 kB.",
      );
      return;
    }
    if ((handelse.bilagor?.length ?? 0) >= 6) {
      setFilFel("Högst sex bilagor per händelse.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : "";
      if (!dataUrl.startsWith("data:")) {
        setFilFel("Filen kunde inte läsas.");
        return;
      }
      const bilaga: ArshjulBilaga = {
        id: `bil-${Date.now().toString(36)}`,
        filnamn: fil.name,
        dataUrl,
      };
      onSpara({ bilagor: [...(handelse.bilagor ?? []), bilaga] });
    };
    reader.readAsDataURL(fil);
  }

  function taBortBilaga(id: string) {
    onSpara({
      bilagor: (handelse.bilagor ?? []).filter((bilaga) => bilaga.id !== id),
    });
  }

  return (
    <div className="mt-3 space-y-4 border-t border-border/70 pt-3">
      <label className="block text-sm">
        <span className="font-medium text-foreground">
          Ansvarig inom styrelsen
        </span>
        <input
          value={leverantor}
          onChange={(e) => setLeverantor(e.target.value)}
          onBlur={() => onSpara({ leverantor })}
          placeholder="Namn eller roll, t.ex. ordförande eller kassör"
          className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
        />
      </label>

      <label className="block text-sm">
        <span className="font-medium text-foreground">
          Saker som ska hanteras
        </span>
        <textarea
          value={attHanteraText}
          onChange={(e) => setAttHanteraText(e.target.value)}
          onBlur={() =>
            onSpara({
              attHantera: attHanteraText
                .split("\n")
                .map((rad) => rad.trim())
                .filter(Boolean),
            })
          }
          rows={4}
          placeholder={
            handelse.id === "std-overlamning"
              ? "En åtgärd per rad. Listan byggs på under året."
              : "En sak per rad, t.ex.\nBoka lokal\nSkicka kallelse"
          }
          className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
        />
      </label>

      <div className="text-sm">
        <p className="font-medium text-foreground">Dagordning och bilagor</p>
        <p className="mt-1 text-xs text-muted">
          Filen sparas i den här webbläsaren, inte i molnet.
        </p>
        {(handelse.bilagor ?? []).length > 0 && (
          <ul className="mt-2 space-y-1">
            {(handelse.bilagor ?? []).map((bilaga) => (
              <li
                key={bilaga.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#f7f9f8] px-2.5 py-1.5"
              >
                <a
                  href={bilaga.dataUrl}
                  download={bilaga.filnamn}
                  className="text-sm font-medium text-primary-dark underline"
                >
                  {bilaga.filnamn}
                </a>
                <button
                  type="button"
                  onClick={() => taBortBilaga(bilaga.id)}
                  className="rounded-lg border border-border px-2 py-1 text-xs text-muted"
                >
                  Ta bort
                </button>
              </li>
            ))}
          </ul>
        )}
        <label className="mt-2 inline-flex cursor-pointer rounded-lg border border-primary px-3 py-1.5 text-sm font-medium text-primary-dark hover:bg-[#eef6f0]">
          Ladda upp dagordning
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt,image/*,application/pdf"
            className="sr-only"
            onChange={(e) => {
              laggTillFil(e.target.files?.[0] ?? null);
              e.target.value = "";
            }}
          />
        </label>
        {filFel && (
          <p className="mt-2 text-xs text-red-800" role="alert">
            {filFel}
          </p>
        )}
      </div>

      <div className="rounded-xl border border-primary/25 bg-[#f7fbf8] p-3">
        <p className="text-sm font-medium text-foreground">
          Godkännande med BankID
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          Förberett. Namn och e-post sparas så punkten kan godkännas med BankID
          när signeringen är igång. Ingen signering sker här.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="font-medium text-foreground">Namn</span>
            <input
              value={bankid.namn}
              onChange={(e) => setBankid({ ...bankid, namn: e.target.value })}
              onBlur={() => onSpara({ bankid })}
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-foreground">E-post</span>
            <input
              type="email"
              value={bankid.epost}
              onChange={(e) => setBankid({ ...bankid, epost: e.target.value })}
              onBlur={() => onSpara({ bankid })}
              placeholder="namn@forening.se"
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
            />
          </label>
        </div>
        <label className="mt-3 flex items-start gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={bankid.forberedd}
            onChange={(e) => {
              const nasta = { ...bankid, forberedd: e.target.checked };
              setBankid(nasta);
              onSpara({ bankid: nasta });
            }}
            className="mt-1"
          />
          <span>Den här punkten ska kunna godkännas med BankID</span>
        </label>
      </div>
    </div>
  );
}
