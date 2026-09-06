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
import {
  lasAktivForeningId,
  lasForeningProfil,
} from "@/lib/forening-registry";
import {
  renoveringSigneringLank,
  skapaRenoveringMedlemsSignering,
} from "@/components/medlemmar/renovering-medlems-signering-lager";
import {
  byggOverenskommelseBrodtext,
  registreraOverenskommelseMejl,
} from "@/components/lagenhetsarkiv/overenskommelse-mejl";

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
  const [oppnaSektioner, setOppnaSektioner] = useState<Record<string, boolean>>(
    {},
  );
  const [nyaPunkter, setNyaPunkter] = useState<Record<string, string>>({});
  const [skickadLank, setSkickadLank] = useState<string | null>(null);
  const [meddelande, setMeddelande] = useState<string | null>(null);
  const [medlemEpost, setMedlemEpost] = useState(
    medlemsKrav.medlemEpost ?? "",
  );
  const [skickar, setSkickar] = useState(false);

  const grupper = useMemo(
    () => grupperaMedlemsKrav(medlemsKrav.punkter),
    [medlemsKrav.punkter],
  );

  const valda = kompileraMedlemsKrav(medlemsKrav);
  const redanStyrelse = Boolean(medlemsKrav.skickadTillStyrelse);
  const redanSkickad = Boolean(medlemsKrav.skickadTillMedlem);
  const redanSignerad = Boolean(medlemsKrav.medlemSignerad);

  const styrelseEposter = useMemo(() => {
    const profil = lasForeningProfil();
    const franLedamoter = (profil?.styrelseledamoter ?? [])
      .map((l) => l.epost.trim())
      .filter(Boolean);
    if (franLedamoter.length > 0) return franLedamoter;
    const fallback = profil?.epost?.trim();
    return fallback ? [fallback] : [];
  }, []);

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

  async function mejlaTillStyrelse() {
    if (valda.length === 0) {
      setMeddelande(
        "Välj minst en checkpunkt som ska ingå i överenskommelsen.",
      );
      return;
    }
    if (styrelseEposter.length === 0) {
      setMeddelande(
        "Inga e-postadresser finns på styrelsen. Lägg till dem under Föreningsuppgifter.",
      );
      return;
    }

    setSkickar(true);
    try {
      const brodtext = byggOverenskommelseBrodtext({
        lagenhetsnummer,
        mappNamn,
        mallEtikett,
        punkter: valda.map((p) => ({
          text: p.text,
          sektionEtikett: p.sektionEtikett,
        })),
        steg: "styrelse",
      });

      for (const till of styrelseEposter) {
        await registreraOverenskommelseMejl({
          till,
          amne: `Överenskommelse renovering — lght ${lagenhetsnummer} (styrelsegranskning)`,
          brodtext,
        });
      }

      uppdatera({
        ...medlemsKrav,
        skickadTillStyrelse: new Date().toLocaleDateString("sv-SE"),
        styrelseMottagare: styrelseEposter,
      });

      setMeddelande(
        `Överenskommelsen mejlades till styrelsen (${styrelseEposter.join(", ")}). När styrelsen är överens kan den skickas till medlemmen för BankID-signering.`,
      );
    } finally {
      setSkickar(false);
    }
  }

  async function mejlaTillMedlem() {
    if (valda.length === 0) {
      setMeddelande(
        "Välj minst en checkpunkt som ska ingå i överenskommelsen.",
      );
      return;
    }
    if (!redanStyrelse) {
      setMeddelande(
        "Mejla överenskommelsen till styrelsen först, innan den skickas till medlemmen.",
      );
      return;
    }
    const epost = medlemEpost.trim();
    if (!epost || !epost.includes("@")) {
      setMeddelande("Ange medlemmens e-postadress.");
      return;
    }

    setSkickar(true);
    try {
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

      const brodtext = byggOverenskommelseBrodtext({
        lagenhetsnummer,
        mappNamn,
        mallEtikett,
        punkter: valda.map((p) => ({
          text: p.text,
          sektionEtikett: p.sektionEtikett,
        })),
        steg: "medlem",
        signeringLank: lank,
      });

      await registreraOverenskommelseMejl({
        till: epost,
        amne: `Överenskommelse renovering — lght ${lagenhetsnummer} (signera med BankID)`,
        brodtext,
      });

      uppdatera({
        ...medlemsKrav,
        skickadTillMedlem: new Date().toLocaleDateString("sv-SE"),
        medlemEpost: epost,
        signeringId: signering.id,
      });

      setMeddelande(
        `Överenskommelsen mejlades till medlemmen (${epost}) för BankID-signering.`,
      );
    } finally {
      setSkickar(false);
    }
  }

  return (
    <div className="rounded-2xl border border-primary/25 bg-[#fafcfa] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="font-semibold text-foreground">
            Överenskommelse — krav och villkor
          </h4>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Sammanställ vad medlemmen ska uppfylla. Mejla först till styrelsen
            för granskning, därefter till medlemmen som signerar med BankID.
            Den signerade överenskommelsen sparas i lägenhetsarkivet.
          </p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-primary-dark">
          {valda.length} valda av {medlemsKrav.punkter.length}
        </span>
      </div>

      <ol className="mt-3 grid gap-2 sm:grid-cols-3">
        <li
          className={`rounded-lg border px-3 py-2 text-xs ${
            redanStyrelse
              ? "border-primary/30 bg-white text-primary-dark"
              : "border-border bg-white text-muted"
          }`}
        >
          <span className="font-semibold">1. Styrelsen</span>
          <p className="mt-0.5">
            {redanStyrelse
              ? `Mejlad ${medlemsKrav.skickadTillStyrelse}`
              : "Mejla för granskning"}
          </p>
        </li>
        <li
          className={`rounded-lg border px-3 py-2 text-xs ${
            redanSkickad
              ? "border-primary/30 bg-white text-primary-dark"
              : "border-border bg-white text-muted"
          }`}
        >
          <span className="font-semibold">2. Medlem</span>
          <p className="mt-0.5">
            {redanSkickad
              ? `Mejlad ${medlemsKrav.skickadTillMedlem}`
              : "Mejla för signering"}
          </p>
        </li>
        <li
          className={`rounded-lg border px-3 py-2 text-xs ${
            redanSignerad
              ? "border-primary/30 bg-white text-primary-dark"
              : "border-border bg-white text-muted"
          }`}
        >
          <span className="font-semibold">3. BankID</span>
          <p className="mt-0.5">
            {redanSignerad
              ? `Signerat ${medlemsKrav.medlemSignerad?.datum}`
              : "Väntar på signering"}
          </p>
        </li>
      </ol>

      {redanSignerad && medlemsKrav.medlemSignerad && (
        <p className="mt-3 rounded-lg border border-primary/30 bg-white px-3 py-2 text-sm text-primary-dark">
          Medlemmen har godkänt och signerat med BankID{" "}
          {medlemsKrav.medlemSignerad.datum}
          {medlemsKrav.medlemSignerad.av
            ? ` (${medlemsKrav.medlemSignerad.av})`
            : ""}
          .
          {medlemsKrav.sparadOverenskommelseFilnamn
            ? ` Sparad i arkivet: ${medlemsKrav.sparadOverenskommelseFilnamn}.`
            : " Överenskommelsen är sparad i lägenhetsarkivet."}
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
                    {antalValda} av {grupp.punkter.length} ingår
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
                        placeholder="Lägg till egen punkt…"
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

      {!redanSignerad && (
        <div className="mt-4 space-y-3 rounded-xl border border-border bg-white p-3">
          <label className="block text-sm">
            <span className="text-xs font-medium text-muted">
              Medlemmens e-post (steg 2)
            </span>
            <input
              type="email"
              value={medlemEpost}
              onChange={(e) => setMedlemEpost(e.target.value)}
              placeholder="medlem@exempel.se"
              className="mt-1 w-full rounded-lg border border-border px-2.5 py-1.5 text-sm"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={skickar}
              onClick={() => void mejlaTillStyrelse()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
            >
              {redanStyrelse
                ? "Mejla uppdaterad version till styrelsen"
                : "1. Mejla till styrelsen"}
            </button>
            <button
              type="button"
              disabled={skickar || !redanStyrelse}
              onClick={() => void mejlaTillMedlem()}
              className="rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary-dark hover:bg-[#eef6f0] disabled:opacity-50"
            >
              {redanSkickad
                ? "Mejla uppdaterad version till medlem"
                : "2. Mejla till medlem (BankID)"}
            </button>
            <button
              type="button"
              onClick={aterstallFranMall}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted hover:text-foreground"
            >
              Återställ punkter
            </button>
          </div>
          {styrelseEposter.length === 0 && (
            <p className="text-xs text-amber-800">
              Tip: lägg till e-post på styrelseledamöter under Föreningsuppgifter
              så steg 1 fungerar.
            </p>
          )}
        </div>
      )}

      {meddelande && (
        <p className="mt-3 text-sm text-primary-dark" role="status">
          {meddelande}
        </p>
      )}

      {skickadLank && (
        <div className="mt-3 rounded-lg border border-border bg-white p-3">
          <p className="text-xs font-medium text-foreground">
            Signeringslänk till medlemmen (BankID)
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
