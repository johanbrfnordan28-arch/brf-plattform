"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ärDriftUpphandlingsKategori,
  schemaRollForDriftKategori,
  type DriftUpphandlingsKategori,
} from "@/components/rondering/drift-upphandling-koppling";
import { genereraSchemaText } from "@/components/rondering/exporteraSigneringSchema";
import { signeringRollInfo } from "@/components/rondering/signering";
import {
  driftUpphandlingsVillkorPunkter,
  driftUpphandlingsVillkorRubrik,
  genereraDriftUpphandlingsVillkorText,
} from "@/components/rondering/upphandlingsvillkor-drift";
import {
  hamtaSchemaBilaga,
  laddaNedBilaga,
  sparaSchemaBilaga,
} from "@/components/upphandling/schema-bilagor-lager";

type Props = {
  kategoriNamn: string;
};

export function DriftUpphandlingSchemaPanel({ kategoriNamn }: Props) {
  const [version, setVersion] = useState(0);
  const [notis, setNotis] = useState<string | null>(null);

  useEffect(() => {
    function onUppdaterad() {
      setVersion((v) => v + 1);
    }
    window.addEventListener("upphandling-schema-bilagor-uppdaterad", onUppdaterad);
    window.addEventListener("rondering-signering-schema-uppdaterad", onUppdaterad);
    return () => {
      window.removeEventListener("upphandling-schema-bilagor-uppdaterad", onUppdaterad);
      window.removeEventListener("rondering-signering-schema-uppdaterad", onUppdaterad);
    };
  }, []);

  void version;

  if (!ärDriftUpphandlingsKategori(kategoriNamn)) return null;

  const kategori = kategoriNamn as DriftUpphandlingsKategori;
  const roll = schemaRollForDriftKategori(kategori);
  const info = signeringRollInfo[roll];
  const bilaga = hamtaSchemaBilaga(kategori);

  function uppdateraFranRondering() {
    const schemaText = genereraSchemaText(roll);
    const villkorText = genereraDriftUpphandlingsVillkorText();
    sparaSchemaBilaga(kategori, roll, schemaText, villkorText);
    setNotis(`${info.dokument} uppdaterat från rondering.`);
    setVersion((v) => v + 1);
  }

  return (
    <div className="rounded-xl border-2 border-dashed border-primary/40 bg-[#eef6f0]/60 p-4">
      <p className="text-sm font-semibold text-primary-dark">
        Schema och avtalsvillkor — {kategori}
      </p>
      <p className="mt-1 text-sm text-muted">
        Bifoga {info.dokument.toLowerCase()} från{" "}
        <Link
          href="/forening/rondering#upphandling-schema"
          className="font-medium text-primary-dark underline hover:no-underline"
        >
          rondering
        </Link>{" "}
        till förfrågningsunderlaget. Villkoren ska framgå i kontraktet.
      </p>

      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted">
        {driftUpphandlingsVillkorPunkter.map((punkt) => (
          <li key={punkt.slice(0, 40)}>{punkt}</li>
        ))}
      </ul>

      {bilaga ? (
        <p className="mt-3 text-sm text-primary-dark">
          Bifogat: {bilaga.filnamn} (
          {new Date(bilaga.genereradTidpunkt).toLocaleString("sv-SE")})
        </p>
      ) : (
        <p className="mt-3 text-sm text-amber-800">
          Inga scheman sparade än — gå till rondering eller uppdatera här nedan.
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={uppdateraFranRondering}
          className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-dark"
        >
          Hämta schema från rondering
        </button>
        {bilaga && (
          <>
            <button
              type="button"
              onClick={() => laddaNedBilaga(bilaga, "komplett")}
              className="rounded-lg border border-primary px-3 py-1.5 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
            >
              Ladda ner schema + villkor
            </button>
            <button
              type="button"
              onClick={() => laddaNedBilaga(bilaga, "schema")}
              className="rounded-lg border border-border px-3 py-1.5 text-sm text-foreground hover:bg-surface"
            >
              Endast schema
            </button>
          </>
        )}
      </div>

      <p className="mt-3 text-xs text-muted">
        Ladda upp nedladdad fil under «Ladda upp dokument» eller «Lägg till dokument»
        med etikett t.ex. «{info.dokument}» och «{driftUpphandlingsVillkorRubrik}».
      </p>

      {notis && (
        <p className="mt-2 text-sm text-primary-dark" role="status">
          {notis}
        </p>
      )}
    </div>
  );
}
