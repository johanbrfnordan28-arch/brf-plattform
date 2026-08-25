"use client";

import { useMemo, useState } from "react";
import { OppnaStangKnapp } from "@/components/OppnaStangKnapp";
import {
  hamtaOmbyggnadsavtalStatus,
  kompileraMedlemsKrav,
  grupperaMedlemsKrav,
  laggTillEgenMedlemsKravPunkt,
  OMBYGGNADSAVTAL_STATUS_ETIKETT,
  skapaMedlemsKravForTyp,
  taBortMedlemsKravPunkt,
  type MedlemsKravState,
  type OmbyggnadsavtalStatus,
} from "@/components/lagenhetsarkiv/medlems-krav";
import { byggOmbyggnadsavtalText } from "@/components/lagenhetsarkiv/ombyggnadsavtal";
import type { RenoveringsMallId } from "@/components/lagenhetsarkiv/renoverings-mallar";
import { lasAktivForeningId } from "@/lib/forening-registry";
import { hamtaStyrelseKontakt } from "@/lib/styrelse-kontakt";
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

function byggMailto(till: string, amne: string, kropp: string): string {
  const to = till.trim();
  return `mailto:${to}?subject=${encodeURIComponent(amne)}&body=${encodeURIComponent(kropp)}`;
}

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
  const status = hamtaOmbyggnadsavtalStatus(medlemsKrav);
  const [oppnaSektioner, setOppnaSektioner] = useState<Record<string, boolean>>(
    {},
  );
  const [nyaPunkter, setNyaPunkter] = useState<Record<string, string>>({});
  const [skickadLank, setSkickadLank] = useState<string | null>(
    medlemsKrav.signeringId
      ? renoveringSigneringLank(
          medlemsKrav.signeringId,
          lasAktivForeningId(),
        )
      : null,
  );
  const [meddelande, setMeddelande] = useState<string | null>(null);
  const [medlemsEpost, setMedlemsEpost] = useState("");
  const [visaAvtal, setVisaAvtal] = useState(
    status === "styrelsegranskning" || status === "skickad" || status === "signerad",
  );

  const grupper = useMemo(
    () => grupperaMedlemsKrav(medlemsKrav.punkter),
    [medlemsKrav.punkter],
  );

  const valda = kompileraMedlemsKrav(medlemsKrav);
  const lasst = status === "signerad";
  const kanRedigera = status === "utkast" || status === "styrelsegranskning";

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

  function byggAvtal(punkter = valda): string {
    const kontakt = hamtaStyrelseKontakt();
    return byggOmbyggnadsavtalText(punkter, {
      foreningsnamn: kontakt?.foreningsnamn ?? "",
      lagenhetsnummer,
      mappNamn,
      mallEtikett,
      datum: new Date().toLocaleDateString("sv-SE"),
    });
  }

  function toggleIngar(punktId: string) {
    if (!kanRedigera) return;
    uppdatera({
      ...medlemsKrav,
      status: "utkast",
      styrelseSkickad: undefined,
      skickadTillMedlem: undefined,
      signeringId: undefined,
      punkter: medlemsKrav.punkter.map((p) =>
        p.id === punktId ? { ...p, ingar: !p.ingar } : p,
      ),
    });
    setSkickadLank(null);
  }

  function laggTillPunkt(sektionId: string, sektionEtikett: string) {
    if (!kanRedigera) return;
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
    setSkickadLank(null);
  }

  function taBortPunkt(punktId: string) {
    if (!kanRedigera) return;
    uppdatera(taBortMedlemsKravPunkt(medlemsKrav, punktId));
    setSkickadLank(null);
  }

  function aterstallFranMall() {
    if (lasst) return;
    uppdatera(skapaMedlemsKravForTyp(mallId));
    setSkickadLank(null);
    setVisaAvtal(false);
  }

  function skickaTillStyrelse() {
    if (valda.length === 0) {
      setMeddelande("Välj minst ett moment som ska ingå i ombyggnadsavtalet.");
      return;
    }

    const avtalText = byggAvtal();
    const kontakt = hamtaStyrelseKontakt();
    const till = kontakt?.epost ?? "";
    const amne = `Ombyggnadsavtal utkast — lght ${lagenhetsnummer} (${mappNamn})`;
    const kropp = [
      "Hej,",
      "",
      "Här är utkastet till ombyggnadsavtal för granskning av styrelsen.",
      "Gå igenom momenten, justera vid behov i portalen och godkänn sedan",
      "innan dokumentet skickas till medlemmen för BankID-signering.",
      "",
      "—",
      "",
      avtalText,
    ].join("\n");

    if (till) {
      window.open(byggMailto(till, amne, kropp));
    } else {
      void navigator.clipboard.writeText(avtalText);
    }

    uppdatera({
      ...medlemsKrav,
      status: "styrelsegranskning",
      avtalText,
      styrelseSkickad: new Date().toLocaleDateString("sv-SE"),
    });
    setVisaAvtal(true);
    setMeddelande(
      till
        ? "Utkastet är mejlat till styrelsen (öppnas i din e-postklient). Granska avtalet nedan och skicka sedan till medlemmen."
        : "Utkastet är kopierat. Lägg in styrelsens e-post under Föreningsuppgifter för att mejla nästa gång. Granska avtalet nedan.",
    );
  }

  function tillbakaTillUtkast() {
    if (lasst) return;
    uppdatera({
      ...medlemsKrav,
      status: "utkast",
      styrelseSkickad: undefined,
      skickadTillMedlem: undefined,
      signeringId: undefined,
    });
    setSkickadLank(null);
    setMeddelande("Tillbaka till utkast — du kan lägga till och ta bort moment.");
  }

  function skickaTillMedlem() {
    if (valda.length === 0) {
      setMeddelande("Välj minst ett moment som ska ingå i ombyggnadsavtalet.");
      return;
    }

    const avtalText = medlemsKrav.avtalText?.trim() || byggAvtal();
    const foreningId = lasAktivForeningId();
    const signering = skapaRenoveringMedlemsSignering({
      foreningId,
      lagenhetsnummer,
      mappNamn,
      mappId,
      apartmentId,
      mallEtikett,
      avtalText,
      punkter: valda.map((p) => ({
        id: p.id,
        text: p.text,
        sektionEtikett: p.sektionEtikett,
      })),
    });

    const lank = renoveringSigneringLank(signering.id, foreningId);
    setSkickadLank(lank);

    const till = medlemsEpost.trim();
    const amne = `Ombyggnadsavtal för signering — lght ${lagenhetsnummer}`;
    const kropp = [
      "Hej,",
      "",
      "Styrelsen har godkänt ombyggnadsavtalet för din renovering.",
      "Läs igenom dokumentet och signera med BankID via länken nedan.",
      "",
      lank,
      "",
      "—",
      "",
      avtalText,
    ].join("\n");

    if (till) {
      window.open(byggMailto(till, amne, kropp));
    } else {
      void navigator.clipboard.writeText(`${lank}\n\n${avtalText}`);
    }

    uppdatera({
      ...medlemsKrav,
      status: "skickad",
      avtalText,
      skickadTillMedlem: new Date().toLocaleDateString("sv-SE"),
      signeringId: signering.id,
    });
    setVisaAvtal(true);
    setMeddelande(
      till
        ? "Ombyggnadsavtalet är mejlat till medlemmen med länk för BankID-signering."
        : "Länk och avtal är kopierade. Ange medlemmens e-post ovan för att mejla nästa gång, eller klistra in länken manuellt.",
    );
  }

  const statusFarg: Record<OmbyggnadsavtalStatus, string> = {
    utkast: "bg-amber-50 text-amber-900 border-amber-200",
    styrelsegranskning: "bg-[#eef6f0] text-primary-dark border-primary/30",
    skickad: "bg-sky-50 text-sky-900 border-sky-200",
    signerad: "bg-primary/10 text-primary-dark border-primary/30",
  };

  return (
    <div className="rounded-2xl border border-primary/25 bg-[#fafcfa] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="font-semibold text-foreground">Ombyggnadsavtal</h4>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Börja med ett utkast: lägg till eller ta bort moment. Skicka till
            styrelsen för granskning. När avtalet är klart skickas det till
            medlemmen för genomläsning och BankID-signering.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-medium ${statusFarg[status]}`}
          >
            {OMBYGGNADSAVTAL_STATUS_ETIKETT[status]}
          </span>
          <span className="text-xs text-muted">
            {valda.length} moment valda av {medlemsKrav.punkter.length}
          </span>
        </div>
      </div>

      {status === "signerad" && medlemsKrav.medlemSignerad && (
        <p className="mt-3 rounded-lg border border-primary/30 bg-white px-3 py-2 text-sm text-primary-dark">
          Medlemmen har godkänt ombyggnadsavtalet och signerat med BankID{" "}
          {medlemsKrav.medlemSignerad.datum}
          {medlemsKrav.medlemSignerad.av
            ? ` (${medlemsKrav.medlemSignerad.av})`
            : ""}
          .
        </p>
      )}

      <ol className="mt-4 grid gap-2 text-xs text-muted sm:grid-cols-4">
        {(
          [
            ["utkast", "1. Utkast"],
            ["styrelsegranskning", "2. Styrelse"],
            ["skickad", "3. Till medlem"],
            ["signerad", "4. Signerat"],
          ] as const
        ).map(([steg, etikett]) => (
          <li
            key={steg}
            className={`rounded-lg border px-2.5 py-2 ${
              status === steg
                ? "border-primary bg-white font-medium text-foreground"
                : "border-border bg-background"
            }`}
          >
            {etikett}
          </li>
        ))}
      </ol>

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
                    {antalValda} av {grupp.punkter.length} ingår i avtalet
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
                          disabled={!kanRedigera}
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
                        {kanRedigera && (
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

                  {kanRedigera && (
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
                        placeholder="Lägg till eget moment…"
                        className="min-w-0 flex-1 rounded-lg border border-border px-2.5 py-1.5 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          laggTillPunkt(grupp.sektionId, grupp.sektionEtikett)
                        }
                        className="rounded-lg border border-primary px-3 py-1.5 text-xs font-medium text-primary-dark hover:bg-[#eef6f0]"
                      >
                        Lägg till moment
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {(visaAvtal || medlemsKrav.avtalText) && (
        <div className="mt-4 rounded-xl border border-border bg-white p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-foreground">
              Ombyggnadsavtal — förhandsvisning
            </p>
            <button
              type="button"
              onClick={() => setVisaAvtal((v) => !v)}
              className="text-xs font-medium text-primary-dark hover:underline"
            >
              {visaAvtal ? "Dölj" : "Visa"}
            </button>
          </div>
          {visaAvtal && (
            <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-background p-3 text-xs leading-relaxed text-foreground">
              {medlemsKrav.avtalText?.trim() || byggAvtal()}
            </pre>
          )}
        </div>
      )}

      {!lasst && (
        <div className="mt-4 space-y-3">
          {(status === "styrelsegranskning" || status === "skickad") && (
            <label className="block text-sm">
              <span className="font-medium text-foreground">
                Medlemmens e-post (för utskick)
              </span>
              <input
                type="email"
                value={medlemsEpost}
                onChange={(e) => setMedlemsEpost(e.target.value)}
                placeholder="medlem@exempel.se"
                className="mt-1 w-full max-w-md rounded-lg border border-border bg-white px-3 py-2 text-sm"
              />
            </label>
          )}

          <div className="flex flex-wrap gap-2">
            {status === "utkast" && (
              <button
                type="button"
                onClick={skickaTillStyrelse}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
              >
                Skicka utkast till styrelsen
              </button>
            )}

            {status === "styrelsegranskning" && (
              <>
                <button
                  type="button"
                  onClick={skickaTillMedlem}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
                >
                  Godkänn och skicka till medlem
                </button>
                <button
                  type="button"
                  onClick={tillbakaTillUtkast}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted hover:text-foreground"
                >
                  Tillbaka till utkast
                </button>
              </>
            )}

            {status === "skickad" && (
              <>
                <button
                  type="button"
                  onClick={skickaTillMedlem}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
                >
                  Skicka om till medlem
                </button>
                <button
                  type="button"
                  onClick={tillbakaTillUtkast}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted hover:text-foreground"
                >
                  Öppna för ny redigering
                </button>
              </>
            )}

            {kanRedigera && (
              <button
                type="button"
                onClick={aterstallFranMall}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted hover:text-foreground"
              >
                Återställ moment från mall
              </button>
            )}
          </div>
        </div>
      )}

      {meddelande && (
        <p className="mt-3 text-sm text-primary-dark" role="status">
          {meddelande}
        </p>
      )}

      {skickadLank && status !== "utkast" && (
        <div className="mt-3 rounded-lg border border-border bg-white p-3">
          <p className="text-xs font-medium text-foreground">
            Länk till medlemmen (ombyggnadsavtal + BankID)
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
