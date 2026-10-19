"use client";

import { useMemo, useState } from "react";
import { OppnaStangKnapp } from "@/components/OppnaStangKnapp";
import {
  grupperaMedlemsKrav,
  laggTillEgenMedlemsKravPunkt,
  taBortMedlemsKravPunkt,
} from "@/components/lagenhetsarkiv/medlems-krav";
import {
  allaUndertecknareKlara,
  byggLagenhetOmbyggnadsavtalMeta,
  normaliseraLagenhetOmbyggnadsavtal,
  ombyggnadsavtalStatus,
  skapaLagenhetOmbyggnadsavtal,
  skapaUndertecknareId,
  valdaOmbyggnadsavtalPunkter,
  type LagenhetOmbyggnadsavtal,
  type OmbyggnadsavtalUndertecknare,
} from "@/components/lagenhetsarkiv/lagenhet-ombyggnadsavtal";
import {
  ombyggnadsavtalSigneringLank,
  skapaOmbyggnadsavtalSignering,
} from "@/components/lagenhetsarkiv/ombyggnadsavtal-signering-lager";
import {
  byggOmbyggnadsavtalBrodtext,
  registreraOverenskommelseMejl,
} from "@/components/lagenhetsarkiv/overenskommelse-mejl";
import { skrivUtOmbyggnadsavtalPdf } from "@/components/lagenhetsarkiv/ombyggnadsavtal";
import type { ApartmentFolder } from "@/components/lagenhetsarkiv/lagenhetsarkiv";
import {
  hamtaRenoveringsMall,
  renoveringsMallar,
  type RenoveringsMallId,
} from "@/components/lagenhetsarkiv/renoverings-mallar";
import { lasAktivForeningId, lasForeningProfil } from "@/lib/forening-registry";
import {
  hashaPersonnummer,
  maskeraPersonnummer,
  personnummerFelmeddelande,
} from "@/lib/personnummer-format";

type Props = {
  apartment: ApartmentFolder;
  onUppdatera: (avtal: LagenhetOmbyggnadsavtal) => void;
  onArkivera?: (signerat: LagenhetOmbyggnadsavtal) => void;
};

export function OmbyggnadsavtalPanel({
  apartment,
  onUppdatera,
  onArkivera,
}: Props) {
  const avtal = apartment.ombyggnadsavtal
    ? normaliseraLagenhetOmbyggnadsavtal(apartment.ombyggnadsavtal)
    : skapaLagenhetOmbyggnadsavtal();
  const [oppnaSektioner, setOppnaSektioner] = useState<Record<string, boolean>>(
    {},
  );
  const [nyaPunkter, setNyaPunkter] = useState<Record<string, string>>({});
  const [nyNamn, setNyNamn] = useState("");
  const [nyPnr, setNyPnr] = useState("");
  const [nyEpost, setNyEpost] = useState("");
  const [skickadLank, setSkickadLank] = useState<string | null>(null);
  const [meddelande, setMeddelande] = useState<string | null>(null);
  const [skickar, setSkickar] = useState(false);
  const [oppen, setOppen] = useState(true);

  const status = ombyggnadsavtalStatus(avtal);
  const redanSignerad = allaUndertecknareKlara(avtal);
  const harNagonSignatur = avtal.undertecknare.some((u) => u.signerad);
  const valda = valdaOmbyggnadsavtalPunkter(avtal);
  const grupper = useMemo(
    () => grupperaMedlemsKrav(avtal.punkter),
    [avtal.punkter],
  );
  const signeradeAntal = avtal.undertecknare.filter((u) => u.signerad).length;

  function spara(nasta: LagenhetOmbyggnadsavtal) {
    onUppdatera(nasta);
    setMeddelande(null);
  }

  function arSektionOppen(sektionId: string) {
    return oppnaSektioner[sektionId] ?? false;
  }

  function vaxlaSektion(sektionId: string) {
    setOppnaSektioner((prev) => ({
      ...prev,
      [sektionId]: !arSektionOppen(sektionId),
    }));
  }

  function toggleIngar(punktId: string) {
    if (redanSignerad || harNagonSignatur) return;
    spara({
      ...avtal,
      punkter: avtal.punkter.map((p) =>
        p.id === punktId ? { ...p, ingar: !p.ingar } : p,
      ),
    });
  }

  function laggTillPunkt(sektionId: string, sektionEtikett: string) {
    if (redanSignerad || harNagonSignatur) return;
    const text = nyaPunkter[sektionId] ?? "";
    const next = laggTillEgenMedlemsKravPunkt(
      { punkter: avtal.punkter },
      sektionId,
      sektionEtikett,
      text,
    );
    spara({ ...avtal, punkter: next.punkter });
    setNyaPunkter((prev) => ({ ...prev, [sektionId]: "" }));
    setOppnaSektioner((prev) => ({ ...prev, [sektionId]: true }));
  }

  function taBortPunkt(punktId: string) {
    if (redanSignerad || harNagonSignatur) return;
    const next = taBortMedlemsKravPunkt({ punkter: avtal.punkter }, punktId);
    spara({ ...avtal, punkter: next.punkter });
  }

  function bytMall(mallId: RenoveringsMallId) {
    if (redanSignerad || harNagonSignatur) return;
    spara({
      ...skapaLagenhetOmbyggnadsavtal(mallId),
      undertecknare: avtal.undertecknare,
    });
    setSkickadLank(null);
  }

  async function laggTillUndertecknare() {
    if (redanSignerad) return;
    const namn = nyNamn.trim();
    const epost = nyEpost.trim();
    if (!namn) {
      setMeddelande("Ange namn på den som ska godkänna avtalet.");
      return;
    }
    const pnrFel = personnummerFelmeddelande(nyPnr);
    if (pnrFel) {
      setMeddelande(pnrFel);
      return;
    }
    if (!epost || !epost.includes("@")) {
      setMeddelande("Ange e-postadress så att avtalet kan mejlas.");
      return;
    }
    const nyckel = await hashaPersonnummer(nyPnr);
    if (!nyckel) {
      setMeddelande("Kunde inte läsa personnumret.");
      return;
    }
    if (avtal.undertecknare.some((u) => u.personnummerNyckel === nyckel)) {
      setMeddelande("Personen finns redan bland undertecknarna.");
      return;
    }

    const tillagd: OmbyggnadsavtalUndertecknare = {
      id: skapaUndertecknareId(),
      namn,
      epost,
      personnummerMaskerat: maskeraPersonnummer(nyPnr),
      personnummerNyckel: nyckel,
    };
    spara({ ...avtal, undertecknare: [...avtal.undertecknare, tillagd] });
    setNyNamn("");
    setNyPnr("");
    setNyEpost("");
    setMeddelande(`${namn} är tillagd som undertecknare.`);
  }

  function taBortUndertecknare(id: string) {
    if (redanSignerad) return;
    const person = avtal.undertecknare.find((u) => u.id === id);
    if (person?.signerad) return;
    spara({
      ...avtal,
      undertecknare: avtal.undertecknare.filter((u) => u.id !== id),
    });
  }

  function visaPdf() {
    skrivUtOmbyggnadsavtalPdf(
      valda,
      byggLagenhetOmbyggnadsavtalMeta(apartment, avtal),
    );
  }

  async function mejlaTillUndertecknare() {
    if (avtal.undertecknare.length === 0) {
      setMeddelande(
        "Lägg till minst en undertecknare med namn, personnummer och e-post.",
      );
      return;
    }
    if (valda.length === 0) {
      setMeddelande("Välj minst ett villkor som ska ingå i avtalet.");
      return;
    }

    setSkickar(true);
    try {
      spara(avtal);
      const foreningId = lasAktivForeningId();
      const profil = lasForeningProfil(foreningId);
      const mall = hamtaRenoveringsMall(avtal.mallId);
      const signering = skapaOmbyggnadsavtalSignering({
        id: avtal.signeringId,
        foreningId,
        apartmentId: apartment.id,
        lagenhetsnummer: apartment.lagenhetsnummer,
        mallEtikett: mall.etikett,
        foreningsnamn: profil?.namn ?? "",
        organisationsnummer: profil?.organisationsnummer || undefined,
        postadress: apartment.adress || profil?.postadress || undefined,
        ort: profil?.ort || undefined,
        punkter: valda.map((p) => ({
          id: p.id,
          text: p.text,
          sektionEtikett: p.sektionEtikett,
        })),
        undertecknare: avtal.undertecknare,
      });
      const lank = ombyggnadsavtalSigneringLank(signering.id, foreningId);
      setSkickadLank(lank);

      for (const person of avtal.undertecknare) {
        if (!person.epost.includes("@")) continue;
        const brodtext = byggOmbyggnadsavtalBrodtext({
          lagenhetsnummer: apartment.lagenhetsnummer,
          foreningsnamn: profil?.namn,
          mottagareNamn: person.namn,
          punkter: valda.map((p) => ({
            text: p.text,
            sektionEtikett: p.sektionEtikett,
          })),
          signeringLank: lank,
        });
        await registreraOverenskommelseMejl({
          till: person.epost,
          amne: `Ombyggnadsavtal — lght ${apartment.lagenhetsnummer} (godkänn med BankID)`,
          brodtext,
        });
      }

      spara({
        ...avtal,
        signeringId: signering.id,
        skickadTillMedlem: new Date().toLocaleDateString("sv-SE"),
      });
      setMeddelande(
        `Avtalet mejlades till ${avtal.undertecknare
          .map((u) => u.epost)
          .join(", ")} för BankID-godkännande.`,
      );
    } finally {
      setSkickar(false);
    }
  }

  function startaNyttAvtal() {
    if (!redanSignerad) return;
    onArkivera?.(avtal);
    spara(skapaLagenhetOmbyggnadsavtal(avtal.mallId));
    setSkickadLank(null);
    setMeddelande(
      "Det signerade avtalet ligger kvar i historiken. Ett nytt utkast är skapat.",
    );
  }

  const historik = apartment.ombyggnadsavtalHistorik ?? [];

  return (
    <div className="rounded-2xl border border-primary/25 bg-[#fafcfa] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-primary-dark">
            Ombyggnadsavtal / Överenskommelse
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Föreningen sätter villkoren. Styrelsen lägger till namn och
            personnummer på dem som ska godkänna, mejlar länken och medlemmen
            signerar med BankID. Det signerade avtalet sparas på lägenhetskortet
            och kan visas som PDF.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-primary-dark">
            {status === "klart"
              ? "Signerat"
              : status === "delvis"
                ? `${signeradeAntal} av ${avtal.undertecknare.length} godkända`
                : status === "skickat"
                  ? "Väntar på BankID"
                  : `${valda.length} villkor`}
          </span>
          <OppnaStangKnapp
            oppen={oppen}
            onClick={() => setOppen((v) => !v)}
            storlek="sm"
            ariaLabel={oppen ? "Stäng ombyggnadsavtal" : "Öppna ombyggnadsavtal"}
          />
        </div>
      </div>

      {oppen && (
        <div className="mt-4 space-y-4">
          <ol className="grid gap-2 sm:grid-cols-4">
            <li className="rounded-lg border border-border bg-white px-3 py-2 text-xs">
              <span className="font-semibold">1. Villkor</span>
              <p className="mt-0.5 text-muted">{valda.length} valda</p>
            </li>
            <li className="rounded-lg border border-border bg-white px-3 py-2 text-xs">
              <span className="font-semibold">2. Undertecknare</span>
              <p className="mt-0.5 text-muted">
                {avtal.undertecknare.length} tillagda
              </p>
            </li>
            <li
              className={`rounded-lg border px-3 py-2 text-xs ${
                avtal.skickadTillMedlem
                  ? "border-primary/30 bg-white text-primary-dark"
                  : "border-border bg-white text-muted"
              }`}
            >
              <span className="font-semibold">3. Mejl</span>
              <p className="mt-0.5">
                {avtal.skickadTillMedlem
                  ? `Skickad ${avtal.skickadTillMedlem}`
                  : "Ej skickad"}
              </p>
            </li>
            <li
              className={`rounded-lg border px-3 py-2 text-xs ${
                redanSignerad
                  ? "border-primary/30 bg-white text-primary-dark"
                  : "border-border bg-white text-muted"
              }`}
            >
              <span className="font-semibold">4. BankID</span>
              <p className="mt-0.5">
                {redanSignerad
                  ? `Klart ${avtal.klarDatum ?? ""}`
                  : signeradeAntal > 0
                    ? `${signeradeAntal} av ${avtal.undertecknare.length}`
                    : "Väntar"}
              </p>
            </li>
          </ol>

          {redanSignerad && (
            <div className="rounded-lg border border-primary/30 bg-white px-3 py-3 text-sm text-primary-dark">
              <p className="font-semibold">Överenskommelsen är godkänd</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                Alla tillagda undertecknare har signerat med BankID
                {avtal.klarDatum ? ` ${avtal.klarDatum}` : ""}. Avtalet är
                sparat på detta lägenhetskort.
                {avtal.sparadPdfFilnamn
                  ? ` Fil: ${avtal.sparadPdfFilnamn}.`
                  : ""}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={visaPdf}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
                >
                  Visa avtal som PDF
                </button>
                <button
                  type="button"
                  onClick={startaNyttAvtal}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted hover:text-foreground"
                >
                  Starta ny överenskommelse
                </button>
              </div>
            </div>
          )}

          <div>
            <div className="flex flex-wrap items-end justify-between gap-2">
              <label className="block text-xs">
                <span className="font-medium text-muted">
                  Mall för föreningens villkor
                </span>
                <select
                  value={avtal.mallId}
                  disabled={redanSignerad || harNagonSignatur}
                  onChange={(e) =>
                    bytMall(e.target.value as RenoveringsMallId)
                  }
                  className="mt-1 block w-full max-w-xs rounded-lg border border-border bg-white px-2.5 py-1.5 text-sm"
                >
                  {renoveringsMallar.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.etikett}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={visaPdf}
                className="rounded-lg border border-primary px-3 py-1.5 text-xs font-semibold text-primary-dark hover:bg-[#eef6f0]"
              >
                {redanSignerad ? "Visa signerat PDF" : "Visa utkast som PDF"}
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {grupper.map((grupp) => {
                const sektionOppen = arSektionOppen(grupp.sektionId);
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
                        oppen={sektionOppen}
                        onClick={() => vaxlaSektion(grupp.sektionId)}
                        storlek="sm"
                        ariaLabel={
                          sektionOppen
                            ? `Stäng ${grupp.sektionEtikett}`
                            : `Öppna ${grupp.sektionEtikett}`
                        }
                      />
                    </div>
                    {sektionOppen && (
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
                                disabled={redanSignerad || harNagonSignatur}
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
                              {punkt.egen &&
                                !redanSignerad &&
                                !harNagonSignatur && (
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
                        {!redanSignerad && !harNagonSignatur && (
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
                                  laggTillPunkt(
                                    grupp.sektionId,
                                    grupp.sektionEtikett,
                                  );
                                }
                              }}
                              placeholder="Lägg till eget villkor…"
                              className="min-w-0 flex-1 rounded-lg border border-border px-2.5 py-1.5 text-sm"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                laggTillPunkt(
                                  grupp.sektionId,
                                  grupp.sektionEtikett,
                                )
                              }
                              className="rounded-lg border border-primary px-3 py-1.5 text-xs font-medium text-primary-dark hover:bg-[#eef6f0]"
                            >
                              Lägg till villkor
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-white p-3">
            <p className="text-sm font-semibold text-foreground">
              Undertecknare (namn och personnummer)
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Styrelsen lägger till de personer som ska godkänna avtalet. Var
              och en måste signera med BankID och samma personnummer.
            </p>

            {avtal.undertecknare.length > 0 && (
              <ul className="mt-3 space-y-2">
                {avtal.undertecknare.map((u) => (
                  <li
                    key={u.id}
                    className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-border px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {u.namn}
                      </p>
                      <p className="text-xs text-muted">
                        {u.personnummerMaskerat} · {u.epost}
                      </p>
                      <p
                        className={`mt-0.5 text-xs ${
                          u.signerad
                            ? "font-medium text-primary-dark"
                            : "text-muted"
                        }`}
                      >
                        {u.signerad
                          ? `Godkänd med BankID ${u.signerad.datum}`
                          : "Väntar på BankID"}
                      </p>
                    </div>
                    {!u.signerad && !redanSignerad && (
                      <button
                        type="button"
                        onClick={() => taBortUndertecknare(u.id)}
                        className="text-xs text-muted hover:text-red-800"
                      >
                        Ta bort
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {!redanSignerad && (
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <label className="block text-xs">
                  <span className="font-medium text-muted">Namn</span>
                  <input
                    value={nyNamn}
                    onChange={(e) => setNyNamn(e.target.value)}
                    placeholder="För- och efternamn"
                    autoComplete="name"
                    className="mt-1 w-full rounded-lg border border-border px-2.5 py-1.5 text-sm"
                  />
                </label>
                <label className="block text-xs">
                  <span className="font-medium text-muted">Personnummer</span>
                  <input
                    value={nyPnr}
                    onChange={(e) => setNyPnr(e.target.value)}
                    placeholder="ÅÅÅÅMMDD-XXXX"
                    inputMode="numeric"
                    autoComplete="off"
                    className="mt-1 w-full rounded-lg border border-border px-2.5 py-1.5 text-sm"
                  />
                </label>
                <label className="block text-xs">
                  <span className="font-medium text-muted">E-post</span>
                  <input
                    type="email"
                    value={nyEpost}
                    onChange={(e) => setNyEpost(e.target.value)}
                    placeholder="medlem@exempel.se"
                    className="mt-1 w-full rounded-lg border border-border px-2.5 py-1.5 text-sm"
                  />
                </label>
              </div>
            )}

            {!redanSignerad && (
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void laggTillUndertecknare()}
                  className="rounded-lg border border-primary px-3 py-2 text-xs font-semibold text-primary-dark hover:bg-[#eef6f0]"
                >
                  Lägg till undertecknare
                </button>
                <button
                  type="button"
                  disabled={skickar || avtal.undertecknare.length === 0}
                  onClick={() => void mejlaTillUndertecknare()}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
                >
                  {avtal.skickadTillMedlem
                    ? "Mejla igen för BankID"
                    : "Mejla för BankID-godkännande"}
                </button>
              </div>
            )}
          </div>

          {meddelande && (
            <p className="text-sm text-primary-dark" role="status">
              {meddelande}
            </p>
          )}

          {skickadLank && (
            <div className="rounded-lg border border-border bg-white p-3">
              <p className="text-xs font-medium text-foreground">
                Signeringslänk till medlemmen (BankID)
              </p>
              <p className="mt-1 break-all text-xs text-primary-dark">
                {skickadLank}
              </p>
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

          {historik.length > 0 && (
            <div className="rounded-xl border border-border bg-white p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Tidigare överenskommelser
              </p>
              <ul className="mt-2 space-y-2">
                {historik.map((gammalt, index) => (
                  <li
                    key={`${gammalt.klarDatum ?? "historik"}-${index}`}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-xs"
                  >
                    <span className="text-foreground">
                      {gammalt.sparadPdfFilnamn ??
                        `Ombyggnadsavtal ${gammalt.klarDatum ?? ""}`}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        skrivUtOmbyggnadsavtalPdf(
                          valdaOmbyggnadsavtalPunkter(gammalt),
                          byggLagenhetOmbyggnadsavtalMeta(apartment, gammalt),
                        )
                      }
                      className="font-medium text-primary-dark hover:underline"
                    >
                      Visa PDF
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
