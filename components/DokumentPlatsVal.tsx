"use client";

import { useEffect, useState } from "react";
import {
  arshjulVal,
  projektMappVal,
  styrningsMappVal,
  type DokumentPlats,
  type DokumentPlatsTyp,
  type PlatsVal,
} from "@/lib/forening-dokument-platser";

const RUBRIKER: Record<DokumentPlatsTyp, string> = {
  styrning: "Styrning och Dokument",
  dokumentbank: "Dokumentbanken (föreningens dokument)",
  arshjul: "Årshjulet",
  projekt: "Projekt",
};

const VAL_ETIKETT: Partial<Record<DokumentPlatsTyp, string>> = {
  styrning: "Välj mapp …",
  arshjul: "Välj händelse …",
  projekt: "Välj projektmapp …",
};

type Props = {
  typer: DokumentPlatsTyp[];
  /** Platsen man laddar upp från — visas inte som val. */
  aktuellNyckel?: string;
  onChange: (platser: DokumentPlats[]) => void;
  disabled?: boolean;
};

/** "Visa även i …" — välj fler ställen där samma fil ska synas. */
export function DokumentPlatsVal({ typer, aktuellNyckel, onChange, disabled }: Props) {
  const [val, setVal] = useState<Partial<Record<DokumentPlatsTyp, PlatsVal[]>>>({});
  const [ikryssade, setIkryssade] = useState<Partial<Record<DokumentPlatsTyp, boolean>>>({});
  const [valdNyckel, setValdNyckel] = useState<Partial<Record<DokumentPlatsTyp, string>>>({});

  useEffect(() => {
    const filtrera = (lista: PlatsVal[]) => lista.filter((v) => v.nyckel !== aktuellNyckel);
    setVal({
      styrning: filtrera(styrningsMappVal()),
      arshjul: filtrera(arshjulVal()),
      projekt: filtrera(projektMappVal()),
    });
  }, [aktuellNyckel]);

  useEffect(() => {
    const platser: DokumentPlats[] = [];
    for (const typ of typer) {
      if (!ikryssade[typ]) continue;
      if (typ === "dokumentbank") {
        platser.push({ typ: "dokumentbank" });
        continue;
      }
      const vald = val[typ]?.find((v) => v.nyckel === valdNyckel[typ]);
      if (vald) platser.push(vald.plats);
    }
    onChange(platser);
  }, [typer, ikryssade, valdNyckel, val, onChange]);

  const synligaTyper = typer.filter(
    (typ) => typ === "dokumentbank" || (val[typ]?.length ?? 0) > 0,
  );
  if (synligaTyper.length === 0) return null;

  return (
    <fieldset className="space-y-2 rounded-lg border border-border bg-[#f7f9f8] p-3" disabled={disabled}>
      <legend className="px-1 text-xs font-medium text-foreground">
        Visa även i (valfritt)
      </legend>
      <p className="text-xs text-muted">
        Filen sparas en gång och syns på alla valda ställen. Tar man bort den på ett
        ställe finns den kvar på de andra.
      </p>
      {synligaTyper.map((typ) => (
        <div key={typ} className="space-y-1">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={Boolean(ikryssade[typ])}
              onChange={(e) =>
                setIkryssade((cur) => ({ ...cur, [typ]: e.target.checked }))
              }
            />
            {RUBRIKER[typ]}
          </label>
          {ikryssade[typ] && typ !== "dokumentbank" ? (
            <select
              value={valdNyckel[typ] ?? ""}
              onChange={(e) =>
                setValdNyckel((cur) => ({ ...cur, [typ]: e.target.value }))
              }
              className="ml-6 w-[calc(100%-1.5rem)] rounded-lg border border-border bg-white px-2 py-1.5 text-sm"
            >
              <option value="">{VAL_ETIKETT[typ]}</option>
              {(val[typ] ?? []).map((v) => (
                <option key={v.nyckel} value={v.nyckel}>
                  {v.etikett}
                </option>
              ))}
            </select>
          ) : null}
        </div>
      ))}
    </fieldset>
  );
}
