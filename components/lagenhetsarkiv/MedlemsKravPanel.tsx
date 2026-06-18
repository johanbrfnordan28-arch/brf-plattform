"use client";

import { useMemo, useState } from "react";
import { OppnaStangKnapp } from "@/components/OppnaStangKnapp";
import {
  kompileraMedlemsKrav,
  grupperaMedlemsKrav,
  laggTillEgenMedlemsKravPunkt,
  skapaMedlemsKravForTyp,
  taBortMedlemsKravPunkt,
  type MedlemsKravState,
} from "@/components/lagenhetsarkiv/medlems-krav";
import type { RenoveringsMallId } from "@/components/lagenhetsarkiv/renoverings-mallar";
import { lasAktivForeningId } from "@/lib/forening-registry";
import {
  renoveringSigneringLank,
  skapaRenoveringMedlemsSignering,
} from "@/components/medlemmar/renovering-medlems-signering-lager";

type MedlemsKravPanelProps = {
  medlemsKrav: MedlemsKravState | undefined;
  mallId: RenoveringsMallId;
  mappNamn: string;
  mappId: number;
  apartmentId: number;
  lagenhetsnummer: string;
  mallEtikett: string;
  onUppdatera: (krav: MedlemsKravState) => void;
};

export function MedlemsKravPanel({
  medlemsKrav: råKrav,
  mallId,
  mappNamn,
  mappId,
  apartmentId,
  lagenhetsnummer,
  mallEtikett,
  onUppdatera,
}: MedlemsKravPanelProps) {
  const medlemsKrav = råKrav ?? skapaMedlemsKravForTyp(mallId);
  const [oppnaSektioner, setOppnaSektioner] = useState<Record<string, boolean>>({});
  const [nyaPunkter, setNyaPunkter] = useState<Record<string, string>>({});
  const [skickadLank, setSkickadLank] = useState<string | null>(null);
  const [meddelande, setMeddelande] = useState<string | null>(null);

  const grupper = useMemo(
    () => grupperaMedlemsKrav(medlemsKrav.punkter),
    [medlemsKrav.punkter],
  );

  const valda = kompileraMedlemsKrav(medlemsKrav);
  const redanSkickad = Boolean(medlemsKrav.skickadTillMedlem);
  const redanSignerad = Boolean(medlemsKrav.medlemSignerad);

  function arSektionOppen(sektionId: string) {
    return oppnaSektioner[sektionId] ?? false;
  }

  function vaxlaSektion(sektionId: string) {
    setOppnaSektioner((prev) => ({
      ...prev,
      [sektionId]: !arSektionOppen(sektionId),
    }));
  }

  function uppdatera(krav: MedlemsKravState) {
    onUppdatera(krav);
    setMeddelande(null);
  }

  function toggleIngar(punktId: string) {
    if (redanSignerad) return;
    uppdatera({
      ...medlemsKrav,
      punkter: medlemsKrav.punkter.map((p) =>
        p.id === punktId ? { ...p, ingar: !p.ingar } : p,
      ),
    });
  }

  function laggTillPunkt(sektionId: string, sektionEtikett: string) {
    if (redanSignerad) return;
    const text = nyaPunkter[sektionId] ?? "";
    const next = laggTillEgenMedlemsKravPunkt(
      medlemsKrav,
      sektionId,
      sektionEtikett,
      text,
    );
    uppdatera(next);
    setNyaPunkter((prev) => ({ ...prev, [sektionId]: "" }));
    setOppnaSektioner((prev) => ({ ...prev, [sektionId]: true }));
  }

  function taBortPunkt(punktId: string) {
    if (redanSignerad) return;
    uppdatera(taBortMedlemsKravPunkt(medlemsKrav, punktId));
  }

  function aterstallFranMall() {
    if (redanSignerad) return;
    uppdatera(skapaMedlemsKravForTyp(mallId));
    setSkickadLank(null);
  }

  function skickaTillMedlem() {
    if (valda.length === 0) {
      setMeddelande("Välj minst en checkpunkt som ska ingå i medlemmens krav.");
      return;
    }

    const foreningId = lasAktivForeningId();
    const signering = skapaRenoveringMedlemsSignering({
      foreningId,
      lagenhetsnummer,
      mappNamn,
      mappId,
      apartmentId,
      mallEtikett,
      punkter: valda.map((p) => ({
        id: p.id,
        text: p.text,
        sektionEtikett: p.sektionEtikett,
      })),
    });

    const lank = renoveringSigneringLank(signering.id, foreningId);
    setSkickadLank(lank);

    uppdatera({
      ...medlemsKrav,
      skickadTillMedlem: new Date().toLocaleDateString("sv-SE"),
      signeringId: signering.id,
    });

    setMeddelande(
      `${valda.length} krav sammanställda. Skicka länken till medlemmen — vid godkännande signeras med BankID.`,
    );
  }

  return (
    <div className="rounded-2xl border border-primary/25 bg-[#fafcfa] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="font-semibold text-foreground">Medlemmens krav</h4>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Välj vilka checkpunkter som ska ingå i vad medlemmen ska uppfylla
            innan renoveringen. Öppna flera sektioner samtidigt, lägg till egna
            punkter eller ta bort dem. Det du bockar i sammanställs och skickas
            till medlemmen för godkännande med BankID.
          </p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-primary-dark">
          {valda.length} valda av {medlemsKrav.punkter.length}
        </span>
      </div>

      {redanSignerad && medlemsKrav.medlemSignerad && (
        <p className="mt-3 rounded-lg border border-primary/30 bg-white px-3 py-2 text-sm text-primary-dark">
          Medlemmen har godkänt och signerat med BankID{" "}
          {medlemsKrav.medlemSignerad.datum}
          {medlemsKrav.medlemSignerad.av
            ? ` (${medlemsKrav.medlemSignerad.av})`
            : ""}
          .
        </p>
      )}

      <div className="mt-4 space-y-2">
        {grupper.map((grupp) => {
          const oppen = arSektionOppen(grupp.sektionId);
          const antalValda = grupp.punkter.filter((p) => p.ingar).length;

          return (
            <div
              key={grupp.sektionId}
              className="rounded-xl border border-border bg-white"
            >
              <div className="flex flex-wrap items-center gap-2 px-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {grupp.sektionEtikett}
                  </p>
                  <p className="text-xs text-muted">
                    {antalValda} av {grupp.punkter.length} ingår i medlems krav
                  </p>
                </div>
                <OppnaStangKnapp
                  oppen={oppen}
                  onClick={() => vaxlaSektion(grupp.sektionId)}
                  storlek="sm"
                  ariaLabel={
                    oppen
                      ? `Stäng ${grupp.sektionEtikett}`
                      : `Öppna ${grupp.sektionEtikett}`
                  }
                />
              </div>

              {oppen && (
                <div className="space-y-2 border-t border-border px-3 pb-3 pt-2">
                  <ul className="space-y-2">
                    {grupp.punkter.map((punkt) => (
                      <li
                        key={punkt.id}
                        className={`flex items-start gap-2 rounded-lg border px-2.5 py-2 ${
                          punkt.ingar
                            ? "border-primary/30 bg-[#fafcfa]"
                            : "border-border bg-background"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={punkt.ingar}
                          disabled={redanSignerad}
                          onChange={() => toggleIngar(punkt.id)}
                          className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-primary"
                        />
                        <span className="min-w-0 flex-1 text-xs leading-relaxed text-foreground">
                          {punkt.text}
                          {punkt.egen && (
                            <span className="ml-1 text-[10px] uppercase tracking-wide text-muted">
                              (egen)
                            </span>
                          )}
                        </span>
                        {punkt.egen && !redanSignerad && (
                          <button
                            type="button"
                            onClick={() => taBortPunkt(punkt.id)}
                            className="shrink-0 text-xs text-muted hover:text-red-800"
                          >
                            Ta bort
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>

                  {!redanSignerad && (
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <input
                        value={nyaPunkter[grupp.sektionId] ?? ""}
                        onChange={(e) =>
                          setNyaPunkter((prev) => ({
                            ...prev,
                            [grupp.sektionId]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            laggTillPunkt(grupp.sektionId, grupp.sektionEtikett);
                          }
                        }}
                        placeholder="Lägg till egen checkpunkt…"
                        className="min-w-0 flex-1 rounded-lg border border-border px-2.5 py-1.5 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          laggTillPunkt(grupp.sektionId, grupp.sektionEtikett)
                        }
                        className="rounded-lg border border-primary px-3 py-1.5 text-xs font-medium text-primary-dark hover:bg-[#eef6f0]"
                      >
                        Lägg till punkt
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {!redanSignerad && (
          <>
            <button
              type="button"
              onClick={skickaTillMedlem}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              {redanSkickad ? "Skicka uppdaterad sammanställning" : "Sammanställ och skicka till medlem"}
            </button>
            <button
              type="button"
              onClick={aterstallFranMall}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted hover:text-foreground"
            >
              Återställ alla punkter
            </button>
          </>
        )}
      </div>

      {meddelande && (
        <p className="mt-3 text-sm text-primary-dark" role="status">
          {meddelande}
        </p>
      )}

      {skickadLank && (
        <div className="mt-3 rounded-lg border border-border bg-white p-3">
          <p className="text-xs font-medium text-foreground">
            Länk till medlemmen (godkännande + BankID)
          </p>
          <p className="mt-1 break-all text-xs text-primary-dark">{skickadLank}</p>
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard.writeText(skickadLank);
              setMeddelande("Länken är kopierad.");
            }}
            className="mt-2 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted/5"
          >
            Kopiera länk
          </button>
        </div>
      )}
    </div>
  );
}
