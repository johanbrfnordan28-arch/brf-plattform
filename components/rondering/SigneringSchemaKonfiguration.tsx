"use client";

import { useEffect, useMemo, useState } from "react";
import type { SigneringRoll } from "@/components/rondering/signering";
import { signeringRollInfo } from "@/components/rondering/signering";
import { SigneringSchemaPunktLista } from "@/components/rondering/SigneringSchemaPunktLista";
import {
  aterstallGrundmall,
  lasSigneringSchemaKonfig,
  listaSchemaPunkter,
  signeringSchemaStorageKey,
  skapaEgetSchemaPunktId,
  skapaTomSigneringSchemaKonfig,
  sparaSigneringSchemaKonfig,
  type SigneringSchemaKonfig,
  type SigneringSchemaPunkt,
} from "@/components/rondering/signering-schema";

const roller: SigneringRoll[] = ["fastighetsskotare", "stadning"];

export function SigneringSchemaKonfiguration() {
  const [aktivRoll, setAktivRoll] = useState<SigneringRoll>("fastighetsskotare");
  const [konfig, setKonfig] = useState<SigneringSchemaKonfig>(skapaTomSigneringSchemaKonfig);
  const [visarLaggTill, setVisarLaggTill] = useState(false);
  const [nyEtikett, setNyEtikett] = useState("");
  const [nyBeskrivning, setNyBeskrivning] = useState("");

  useEffect(() => {
    const sparad = lasSigneringSchemaKonfig();
    setKonfig(sparad);
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(signeringSchemaStorageKey());
        if (!raw) {
          sparaSigneringSchemaKonfig(sparad);
        }
      } catch {
        /* ignore */
      }
    }

    function onUppdaterad() {
      setKonfig(lasSigneringSchemaKonfig());
    }
    window.addEventListener("rondering-signering-schema-uppdaterad", onUppdaterad);
    return () =>
      window.removeEventListener("rondering-signering-schema-uppdaterad", onUppdaterad);
  }, []);

  function persist(next: SigneringSchemaKonfig) {
    setKonfig(next);
    sparaSigneringSchemaKonfig(next);
  }

  function togglePunkt(punktId: string) {
    const aktiva = new Set(konfig.aktivaPunktIds[aktivRoll]);
    if (aktiva.has(punktId)) aktiva.delete(punktId);
    else aktiva.add(punktId);
    persist({
      ...konfig,
      aktivaPunktIds: {
        ...konfig.aktivaPunktIds,
        [aktivRoll]: [...aktiva],
      },
    });
  }

  function toggleGrupp(punktIds: string[], skaVaraValda: boolean) {
    const aktiva = new Set(konfig.aktivaPunktIds[aktivRoll]);
    for (const id of punktIds) {
      if (skaVaraValda) aktiva.add(id);
      else aktiva.delete(id);
    }
    persist({
      ...konfig,
      aktivaPunktIds: {
        ...konfig.aktivaPunktIds,
        [aktivRoll]: [...aktiva],
      },
    });
  }

  function laggTillEgetMoment() {
    if (!nyEtikett.trim()) return;
    const punkt: SigneringSchemaPunkt = {
      id: skapaEgetSchemaPunktId(aktivRoll),
      etikett: nyEtikett.trim(),
      beskrivning: nyBeskrivning.trim() || undefined,
      grupp: "Egna moment",
      egen: true,
    };
    persist({
      ...konfig,
      egnaPunkter: {
        ...konfig.egnaPunkter,
        [aktivRoll]: [...konfig.egnaPunkter[aktivRoll], punkt],
      },
      aktivaPunktIds: {
        ...konfig.aktivaPunktIds,
        [aktivRoll]: [...konfig.aktivaPunktIds[aktivRoll], punkt.id],
      },
    });
    setNyEtikett("");
    setNyBeskrivning("");
    setVisarLaggTill(false);
  }

  function taBortEgetMoment(punktId: string) {
    const aktiva = konfig.aktivaPunktIds[aktivRoll].filter((id) => id !== punktId);
    persist({
      ...konfig,
      egnaPunkter: {
        ...konfig.egnaPunkter,
        [aktivRoll]: konfig.egnaPunkter[aktivRoll].filter((p) => p.id !== punktId),
      },
      aktivaPunktIds: {
        ...konfig.aktivaPunktIds,
        [aktivRoll]: aktiva,
      },
    });
  }

  const allaPunkter = useMemo(
    () => listaSchemaPunkter(konfig, aktivRoll),
    [konfig, aktivRoll],
  );
  const aktivaIds = useMemo(
    () => new Set(konfig.aktivaPunktIds[aktivRoll]),
    [konfig, aktivRoll],
  );
  const antalAktiva = aktivaIds.size;

  return (
    <div id="manadssignering-schema" className="scroll-mt-24 space-y-4">
      <p className="text-sm leading-relaxed text-muted">
        <strong className="text-foreground">Steg 1 — justera moment:</strong>{" "}
        {aktivRoll === "fastighetsskotare" ? (
          <>
            öppna sektionerna <em>Utvändigt</em>, <em>Stuprör och hängrännor</em>,{" "}
            <em>Invändigt</em>, <em>Tvättstuga</em> och belysning utvändigt/invändigt.
            Rondering = drift, säkerhet och skador — inte månadsstäd.
          </>
        ) : (
          <>
            öppna <em>Trapphus och entré</em>, <em>Tvättstuga</em>,{" "}
            <em>Gemensamma utrymmen</em> och <em>Intervall enligt förening</em> (t.ex.
            fönsterputs vår/höst). Städ = rengöring inomhus; grus vid dörrar/hiss tas bort
            här, servicedagbok och filter kontrolleras vid rondering.
          </>
        )}{" "}
        Bocka i vad som ska ingå — samma princip som nyckelkvittering.
      </p>

      <div className="flex flex-wrap gap-2">
        {roller.map((roll) => {
          const info = signeringRollInfo[roll];
          const antal = konfig.aktivaPunktIds[roll].length;
          return (
            <button
              key={roll}
              type="button"
              onClick={() => setAktivRoll(roll)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                aktivRoll === roll
                  ? "border-primary bg-[#eef6f0] text-primary-dark"
                  : "border-border text-muted hover:border-primary/40"
              }`}
            >
              {info.dokument}
              <span className="ml-2 text-xs opacity-80">({antal})</span>
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-border bg-background p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h4 className="text-sm font-semibold text-foreground">
            Moment i {signeringRollInfo[aktivRoll].dokument.toLowerCase()}
          </h4>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => persist(aterstallGrundmall(aktivRoll))}
              className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted hover:border-primary/40"
            >
              Återställ grundmall
            </button>
            <button
              type="button"
              onClick={() => setVisarLaggTill((v) => !v)}
              className="rounded-lg border border-primary px-3 py-1.5 text-xs font-medium text-primary-dark hover:bg-[#e2f0e6]"
            >
              {visarLaggTill ? "Avbryt" : "+ Eget moment"}
            </button>
          </div>
        </div>

        {visarLaggTill && (
          <div className="mt-4 rounded-lg border border-dashed border-primary/40 bg-white p-4">
            <label className="block text-sm">
              <span className="font-medium text-foreground">Moment</span>
              <input
                type="text"
                value={nyEtikett}
                onChange={(e) => setNyEtikett(e.target.value)}
                placeholder="T.ex. Snöröjning vid behov"
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </label>
            <label className="mt-3 block text-sm">
              <span className="font-medium text-foreground">Kommentar (valfritt)</span>
              <input
                type="text"
                value={nyBeskrivning}
                onChange={(e) => setNyBeskrivning(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </label>
            <button
              type="button"
              onClick={laggTillEgetMoment}
              className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
            >
              Lägg till under Egna moment
            </button>
          </div>
        )}

        <div className="mt-4">
          <p className="text-sm font-medium text-foreground">
            Bocka i vad som ska ingå ({antalAktiva} av {allaPunkter.length})
          </p>
          <div className="mt-3">
            <SigneringSchemaPunktLista
              key={aktivRoll}
              roll={aktivRoll}
              punkter={allaPunkter}
              valdaIds={aktivaIds}
              onToggle={togglePunkt}
              onToggleGrupp={toggleGrupp}
              onTaBortEget={taBortEgetMoment}
              oppnaAlla
            />
          </div>
        </div>

        {antalAktiva === 0 && (
          <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
            Välj minst ett moment — annars visas inget schema för entreprenören.
          </p>
        )}
      </div>
    </div>
  );
}
