"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FORENINGS_DOK_EVENT,
  lasForeningsDokument,
  sparaForeningsDokument,
  type ForeningsDokument,
} from "@/components/dokumentbank/forening-dokumenter-lager";
import { arEgenkontrollDokument } from "@/components/dokumentbank/forening-dokument-egenkontroll";
import { ForeningsDokumentEgenkontrollPanel } from "@/components/dokumentbank/ForeningsDokumentEgenkontrollPanel";
import { lasProjektLista } from "@/components/dokumentbank/dokument-projekt-koppling";

type Props = {
  foreningsDokumentId: string;
  projektId: string;
  projektTitel: string;
  onStang: () => void;
};

export function ProjektEgenkontrollRedigera({
  foreningsDokumentId,
  projektId,
  projektTitel,
  onStang,
}: Props) {
  const [dokument, setDokument] = useState<ForeningsDokument | null>(() => {
    const hit = lasForeningsDokument().dokument.find(
      (d) => d.id === foreningsDokumentId,
    );
    return hit && arEgenkontrollDokument(hit) ? hit : null;
  });

  const ladda = useCallback(() => {
    const hit = lasForeningsDokument().dokument.find(
      (d) => d.id === foreningsDokumentId,
    );
    if (hit && arEgenkontrollDokument(hit)) setDokument(hit);
  }, [foreningsDokumentId]);

  useEffect(() => {
    ladda();
    window.addEventListener(FORENINGS_DOK_EVENT, ladda);
    return () => window.removeEventListener(FORENINGS_DOK_EVENT, ladda);
  }, [ladda]);

  function spara(patch: Partial<ForeningsDokument>) {
    if (!dokument) return;
    const state = lasForeningsDokument();
    const kopplade = new Set(dokument.koppladeProjektId ?? []);
    kopplade.add(projektId);
    sparaForeningsDokument({
      ...state,
      dokument: state.dokument.map((d) =>
        d.id === dokument.id
          ? {
              ...d,
              ...patch,
              koppladeProjektId: [...kopplade],
              uppdateradDatum: new Date().toISOString(),
            }
          : d,
      ),
    });
    setDokument((prev) =>
      prev
        ? {
            ...prev,
            ...patch,
            koppladeProjektId: [...kopplade],
            uppdateradDatum: new Date().toISOString(),
          }
        : null,
    );
  }

  if (!dokument) {
    return (
      <div className="rounded-xl border border-border bg-surface p-4 text-sm text-muted">
        Egenkontrolldokumentet hittades inte. Importera det igen från
        dokumentbanken eller skapa en ny egenkontroll i projektet.
        <button
          type="button"
          onClick={onStang}
          className="mt-3 block rounded-lg border border-border px-3 py-1.5 text-xs"
        >
          Stäng
        </button>
      </div>
    );
  }

  const etapper =
    lasProjektLista().find((p) => p.id === projektId)?.etapper ?? [];

  return (
    <div className="mt-3 rounded-xl border border-primary/30 bg-white p-4 shadow-sm">
      <ForeningsDokumentEgenkontrollPanel
        dokument={dokument}
        onSpara={spara}
        onStang={onStang}
        projektKontext={{ projektId, projektTitel, etapper }}
      />
    </div>
  );
}
