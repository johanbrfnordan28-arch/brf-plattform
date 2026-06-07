"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  driftUpphandlingsKategorier,
  schemaRollForDriftKategori,
  schemaFilnamnForDriftKategori,
  type DriftUpphandlingsKategori,
} from "@/components/rondering/drift-upphandling-koppling";
import {
  genereraSchemaText,
  kopieraTillUrklipp,
  laddaNedSchemaText,
  laddaNedTextfil,
} from "@/components/rondering/exporteraSigneringSchema";
import { signeringRollInfo } from "@/components/rondering/signering";
import { genereraDriftUpphandlingsVillkorText } from "@/components/rondering/upphandlingsvillkor-drift";
import {
  hamtaSchemaBilaga,
  sparaSchemaBilaga,
} from "@/components/upphandling/schema-bilagor-lager";

export function BifogaSchemaUpphandlingPanel() {
  const [meddelande, setMeddelande] = useState<string | null>(null);
  const [bilagaVersion, setBilagaVersion] = useState(0);

  const uppdatera = useCallback(() => {
    setBilagaVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    function onUppdaterad() {
      uppdatera();
    }
    window.addEventListener("rondering-signering-schema-uppdaterad", onUppdaterad);
    window.addEventListener("upphandling-schema-bilagor-uppdaterad", onUppdaterad);
    return () => {
      window.removeEventListener("rondering-signering-schema-uppdaterad", onUppdaterad);
      window.removeEventListener("upphandling-schema-bilagor-uppdaterad", onUppdaterad);
    };
  }, [uppdatera]);

  void bilagaVersion;

  function bifogaTillUpphandling(kategori: DriftUpphandlingsKategori) {
    const roll = schemaRollForDriftKategori(kategori);
    const schemaText = genereraSchemaText(roll);
    const villkorText = genereraDriftUpphandlingsVillkorText();
    sparaSchemaBilaga(kategori, roll, schemaText, villkorText);
    setMeddelande(
      `${signeringRollInfo[roll].dokument} och avtalsvillkor sparade till upphandling «${kategori}».`,
    );
    uppdatera();
  }

  async function kopieraVillkor() {
    const ok = await kopieraTillUrklipp(genereraDriftUpphandlingsVillkorText());
    setMeddelande(ok ? "Avtalsvillkor kopierade." : "Kunde inte kopiera — markera och kopiera manuellt.");
  }

  return (
    <div
      id="upphandling-schema"
      className="scroll-mt-24 rounded-xl border border-primary/30 bg-[#eef6f0] p-4 sm:p-5"
    >
      <h3 className="text-base font-semibold text-primary-dark">
        Bifoga schema vid upphandling
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        När styrelsen upphandlar städ eller fastighetsskötsel ska{" "}
        <strong className="text-foreground">städschema</strong> respektive{" "}
        <strong className="text-foreground">ronderingsschema</strong> bifogas
        förfrågningsunderlaget tillsammans med avtalsvillkor om vite, godkänd
        entreprenör/underentreprenör och synlig <strong className="text-foreground">ID06</strong>.
      </p>

      <div className="mt-4 rounded-lg border border-border bg-background p-4">
        <p className="text-sm font-medium text-foreground">Avtalsvillkor (standardtext)</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
          <li>Vite vid utebliven städning/rondering enligt schema</li>
          <li>Arbete utförs av anbudsgivare eller godkänd underentreprenör</li>
          <li>Synlig ID06 för städare och fastighetsskötare</li>
        </ul>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void kopieraVillkor()}
            className="rounded-lg border border-primary px-3 py-1.5 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
          >
            Kopiera villkor
          </button>
          <button
            type="button"
            onClick={() =>
              laddaNedTextfil(
                genereraDriftUpphandlingsVillkorText(),
                `Avtalsvillkor_drift_${new Date().toISOString().slice(0, 10)}.txt`,
              )
            }
            className="rounded-lg border border-border px-3 py-1.5 text-sm text-foreground hover:bg-surface"
          >
            Ladda ner villkor
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {driftUpphandlingsKategorier.map((kategori) => {
          const roll = schemaRollForDriftKategori(kategori);
          const info = signeringRollInfo[roll];
          const sparad = hamtaSchemaBilaga(kategori);
          return (
            <div
              key={kategori}
              className="rounded-lg border border-border bg-background p-4"
            >
              <p className="font-medium text-foreground">{kategori}</p>
              <p className="mt-1 text-sm text-muted">
                Bifogar: {info.dokument} ({info.entreprenorTyp})
              </p>
              {sparad && (
                <p className="mt-2 text-xs text-primary-dark">
                  Sparad till upphandling{" "}
                  {new Date(sparad.genereradTidpunkt).toLocaleString("sv-SE")}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    laddaNedSchemaText(roll, schemaFilnamnForDriftKategori(kategori))
                  }
                  className="rounded-lg border border-border px-3 py-1.5 text-sm text-foreground hover:bg-surface"
                >
                  Ladda ner schema
                </button>
                <button
                  type="button"
                  onClick={() => bifogaTillUpphandling(kategori)}
                  className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-dark"
                >
                  Bifoga till upphandling
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {meddelande && (
        <p className="mt-3 text-sm text-primary-dark" role="status">
          {meddelande}
        </p>
      )}

      <p className="mt-4 text-sm text-muted">
        Öppna{" "}
        <Link
          href="/forening/upphandling"
          className="font-medium text-primary-dark underline hover:no-underline"
        >
          Upphandling
        </Link>{" "}
        under kategorierna Städning och Fastighetsskötsel för att se bifogade scheman
        och lägga dem i anbudsunderlaget.
      </p>
    </div>
  );
}
