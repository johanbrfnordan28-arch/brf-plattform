"use client";

import { useEffect, useState } from "react";
import { FORENINGS_DOK_EVENT } from "@/components/dokumentbank/forening-dokumenter-lager";
import {
  kopieraForeningsDokumentTillBilaga,
  listaForeningsDokumentMedFil,
} from "@/components/dokumentbank/intern-dokument-flode";
import type { ArshjulBilaga, ArshjulHandelse } from "@/components/arshjul/arshjul";
import {
  FilUppladdningsRuta,
  type FilUppladdningsResultat,
} from "@/components/FilUppladdningsRuta";
import {
  deladFilPlats,
  hamtaForeningFilUrlFranPlats,
  laddaUppDeladFil,
  oppnaFilIFlik,
} from "@/lib/forening-fil-lagring";
import {
  lankaFilTillPlatser,
  slappDeladFil,
  type DokumentPlats,
} from "@/lib/forening-dokument-platser";

const MAX_BILAGOR = 6;

export function oppnaArshjulBilaga(bilaga: ArshjulBilaga): void {
  if (bilaga.fil) {
    const fil = bilaga.fil;
    void oppnaFilIFlik(() => hamtaForeningFilUrlFranPlats(deladFilPlats(fil)));
    return;
  }
  void oppnaFilIFlik(async () => {
    if (!bilaga.dataUrl) return null;
    const blob = await (await fetch(bilaga.dataUrl)).blob();
    return URL.createObjectURL(blob);
  });
}

type Props = {
  handelse: ArshjulHandelse;
  onSpara: (patch: Partial<ArshjulHandelse>) => void;
  rubrik: string;
  uppladdningsEtikett: string;
};

export function ArshjulBilagor({ handelse, onSpara, rubrik, uppladdningsEtikett }: Props) {
  const bilagor = handelse.bilagor ?? [];
  const [visarUppladdning, setVisarUppladdning] = useState(false);
  const [fel, setFel] = useState<string | null>(null);
  const [foreningsFiler, setForeningsFiler] = useState(listaForeningsDokumentMedFil());

  useEffect(() => {
    function ladda() {
      setForeningsFiler(listaForeningsDokumentMedFil());
    }
    ladda();
    window.addEventListener(FORENINGS_DOK_EVENT, ladda);
    return () => window.removeEventListener(FORENINGS_DOK_EVENT, ladda);
  }, []);

  const fullt = bilagor.length >= MAX_BILAGOR;

  async function laddaUpp(
    fil: File,
    onProgress: (procent: number) => void,
    platser: DokumentPlats[],
  ): Promise<FilUppladdningsResultat> {
    if (fullt) return { ok: false, fel: `Högst ${MAX_BILAGOR} bilagor per händelse.` };
    const sparat = await laddaUppDeladFil({ modul: "arshjul", fil, onProgress });
    if (!sparat.ok) return sparat;
    onSpara({
      bilagor: [
        ...bilagor,
        {
          id: `bil-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
          filnamn: fil.name,
          dataUrl: "",
          fil: sparat.fil,
        },
      ],
    });
    const varning = lankaFilTillPlatser(platser, sparat.fil);
    setVisarUppladdning(false);
    return varning ? { ok: true, varning } : { ok: true };
  }

  function taBort(bilaga: ArshjulBilaga) {
    if (!window.confirm(`Ta bort ${bilaga.filnamn} från den här händelsen?`)) return;
    if (bilaga.fil) slappDeladFil(bilaga.fil, bilaga.id);
    onSpara({ bilagor: bilagor.filter((b) => b.id !== bilaga.id) });
  }

  return (
    <div className="text-sm">
      <p className="font-medium text-foreground">{rubrik}</p>
      {bilagor.length > 0 && (
        <ul className="mt-2 space-y-1">
          {bilagor.map((bilaga) => (
            <li
              key={bilaga.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#f7f9f8] px-2.5 py-1.5"
            >
              <button
                type="button"
                onClick={() => oppnaArshjulBilaga(bilaga)}
                className="text-left text-sm font-medium text-primary-dark underline"
              >
                {bilaga.filnamn}
              </button>
              <button
                type="button"
                onClick={() => taBort(bilaga)}
                className="rounded-lg border border-border px-2 py-1 text-xs text-muted"
              >
                Ta bort
              </button>
            </li>
          ))}
        </ul>
      )}

      {fullt ? (
        <p className="mt-2 text-xs text-muted">Högst {MAX_BILAGOR} bilagor per händelse.</p>
      ) : visarUppladdning ? (
        <div className="mt-2">
          <FilUppladdningsRuta
            onSpara={laddaUpp}
            onAvbryt={() => setVisarUppladdning(false)}
            sparaEtikett="Spara bilaga"
            delaTill={{ typer: ["styrning", "dokumentbank", "projekt"] }}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setVisarUppladdning(true)}
          className="mt-2 rounded-lg border border-primary px-3 py-1.5 text-sm font-medium text-primary-dark hover:bg-[#eef6f0]"
        >
          {uppladdningsEtikett}
        </button>
      )}

      {!fullt && foreningsFiler.length > 0 ? (
        <div className="mt-3">
          <label className="block text-xs font-medium text-muted">
            Eller visa ett dokument som redan finns i föreningens dokument
            <select
              className="mt-1 w-full rounded-lg border border-border bg-white px-2 py-1.5 text-sm"
              defaultValue=""
              onChange={async (e) => {
                const select = e.currentTarget;
                const dokId = select.value;
                if (!dokId) return;
                const resultat = await kopieraForeningsDokumentTillBilaga(dokId);
                select.value = "";
                if (!resultat.ok) {
                  setFel(resultat.fel);
                  return;
                }
                setFel(null);
                onSpara({ bilagor: [...bilagor, resultat.bilaga] });
              }}
            >
              <option value="">Välj dokument …</option>
              {foreningsFiler.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.titel}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}
      {fel && (
        <p className="mt-2 text-xs text-red-800" role="alert">
          {fel}
        </p>
      )}
    </div>
  );
}
