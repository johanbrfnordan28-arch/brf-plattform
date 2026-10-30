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
import { ForeningsDokumentRedigeraPanel } from "@/components/dokumentbank/ForeningsDokumentRedigeraPanel";
import { lasProjektLista } from "@/components/dokumentbank/dokument-projekt-koppling";

type Props = {
  foreningsDokumentId: string;
  projektId: string;
  projektTitel: string;
  onStang: () => void;
};

/** Redigerar föreningens dokumentkopia som är knuten till projektet. */
export function ProjektForeningsDokumentRedigera({
  foreningsDokumentId,
  projektId,
  projektTitel,
  onStang,
}: Props) {
  const [dokument, setDokument] = useState<ForeningsDokument | null>(() =>
    lasForeningsDokument().dokument.find((d) => d.id === foreningsDokumentId) ??
      null,
  );

  const ladda = useCallback(() => {
    const hit = lasForeningsDokument().dokument.find(
      (d) => d.id === foreningsDokumentId,
    );
    setDokument(hit ?? null);
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
        Dokumentet hittades inte. Importera det igen från dokumentbanken eller
        skapa en ny kopia under Föreningens dokument.
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
      {arEgenkontrollDokument(dokument) ? (
        <ForeningsDokumentEgenkontrollPanel
          dokument={dokument}
          onSpara={spara}
          onStang={onStang}
          projektKontext={{ projektId, projektTitel, etapper }}
        />
      ) : (
        <ForeningsDokumentRedigeraPanel
          dokument={dokument}
          onSpara={spara}
          onStang={onStang}
        />
      )}
    </div>
  );
}

/** @deprecated Använd ProjektForeningsDokumentRedigera */
export const ProjektEgenkontrollRedigera = ProjektForeningsDokumentRedigera;
