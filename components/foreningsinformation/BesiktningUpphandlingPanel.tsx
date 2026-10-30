"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { oppnaTextSomPdf } from "@/components/forening/avtal-pdf";
import { BankIdAvtalSignering } from "@/components/bankid/BankIdAvtalSignering";
import {
  allaProtokoll,
  BESIKTNING_UPPHANDLING_EVENT,
  besiktningTjanst,
  genereraBesiktningAnbudsformularText,
  genereraBesiktningUnderlagText,
  hamtaBesiktningPost,
  laggTillEgetProtokoll,
  skapaBesiktningBestallning,
  skapaBesiktningUpphandling,
  signeraBesiktningBestallning,
  sparadeHandlingar,
  taBortEgetProtokoll,
  type BesiktningBestallning,
  type BesiktningTjanstId,
  type SparadHandling,
  type TidigareProtokoll,
} from "@/components/foreningsinformation/besiktning-upphandling";
import { kategoriId } from "@/components/upphandling/kategorier";
import { hamtaAvtalssignerare } from "@/lib/styrelse-kontakt";
import { lasAktivForeningId, lasForeningProfil } from "@/lib/forening-registry";
import type { StyrelseLedamot } from "@/lib/styrelse-ledamot";
import { harTillrackligaBankIdSignaturer } from "@/lib/bankid-signering";

const inputKlass =
  "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

type Props = {
  tjanstId: BesiktningTjanstId;
  uppladdadeFilnamn: string[];
};

export function BesiktningUpphandlingPanel({ tjanstId, uppladdadeFilnamn }: Props) {
  const tjanst = besiktningTjanst(tjanstId);
  const [hydrated, setHydrated] = useState(false);
  const [protokoll, setProtokoll] = useState<TidigareProtokoll[]>([]);
  const [skapad, setSkapad] = useState<string | undefined>();
  const [handlingar, setHandlingar] = useState<SparadHandling[]>([]);
  const [bestallning, setBestallning] = useState<BesiktningBestallning | undefined>();
  const [status, setStatus] = useState<string | null>(null);
  const [datum, setDatum] = useState("");
  const [utforsAv, setUtforsAv] = useState("");
  const [sammanfattning, setSammanfattning] = useState("");
  const [filnamn, setFilnamn] = useState("");
  const [entreprenorNamn, setEntreprenorNamn] = useState("");
  const [entreprenorEpost, setEntreprenorEpost] = useState("");
  const [prisKr, setPrisKr] = useState("");
  const [omfattning, setOmfattning] = useState(tjanst.omfattning);
  const [ledamoter, setLedamoter] = useState<StyrelseLedamot[]>([]);

  function ladda() {
    const post = hamtaBesiktningPost(tjanstId);
    setProtokoll(allaProtokoll(tjanstId, uppladdadeFilnamn));
    setSkapad(post.upphandlingSkapad);
    setHandlingar(sparadeHandlingar(tjanstId));
    setBestallning(post.bestallning);
    const profil = lasForeningProfil(lasAktivForeningId());
    setLedamoter(profil?.styrelseledamoter ?? []);
  }

  useEffect(() => {
    ladda();
    setHydrated(true);
    function onUppdaterad() {
      ladda();
    }
    window.addEventListener(BESIKTNING_UPPHANDLING_EVENT, onUppdaterad);
    return () => window.removeEventListener(BESIKTNING_UPPHANDLING_EVENT, onUppdaterad);
  }, [tjanstId, uppladdadeFilnamn]);

  const signerare = hydrated ? hamtaAvtalssignerare() : [];
  const kategoriKey = kategoriId(tjanst.kategoriNamn);
  const foretagKlar = bestallning
    ? harTillrackligaBankIdSignaturer(bestallning.foretagSignaturer)
    : false;

  function sparaProtokoll() {
    const resultat = laggTillEgetProtokoll(tjanstId, {
      datum,
      utforsAv,
      sammanfattning,
      filnamn,
    });
    if (!resultat.ok) {
      setStatus(resultat.fel);
      return;
    }
    setDatum("");
    setUtforsAv("");
    setSammanfattning("");
    setFilnamn("");
    setStatus("Protokollet är sparat i mappen och följer med i underlaget.");
    ladda();
  }

  return (
    <div className="mt-4 space-y-4 rounded-xl border border-primary/30 bg-[#eef6f0] p-4">
      <div>
        <h3 className="text-sm font-semibold text-primary-dark">
          Upphandla {tjanst.rubrik.toLowerCase()}
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          Tidigare protokoll och föreningens uppgifter hämtas hit. Anbudsformuläret
          skapas utifrån dem. När upphandlingen skapas flyttas den till
          upphandlingsmodulen så formuläret kan mejlas till anbudsgivare. Vinnande
          entreprenör signerar beställningen först, därefter föreningen. Handlingarna
          sparas i den här mappen.
        </p>
        <p className="mt-2 text-xs text-muted">
          Avtalsundertecknare:{" "}
          {hydrated
            ? signerare.map((person) => `${person.namn} (${person.roll})`).join(", ") ||
              "markera under föreningens uppgifter"
            : "hämtas från föreningens uppgifter"}
        </p>
      </div>

      <div>
        <p className="text-sm font-medium text-foreground">Tidigare protokoll</p>
        {protokoll.length === 0 ? (
          <p className="mt-1 text-sm text-muted">
            Inga protokoll hämtade ännu. Lägg in senaste kontrollen här, eller ladda
            upp filen längre ner i mappen.
          </p>
        ) : (
          <ul className="mt-2 space-y-2">
            {protokoll.map((rad) => (
              <li
                key={rad.id}
                className="rounded-lg border border-border bg-white px-3 py-2 text-sm"
              >
                <p className="font-medium text-foreground">
                  {rad.datum || "Datum saknas"}
                  {rad.utforsAv ? ` · ${rad.utforsAv}` : ""}
                  {rad.filnamn ? ` · ${rad.filnamn}` : ""}
                </p>
                <p className="text-muted">{rad.sammanfattning}</p>
                {rad.kalla === "egen" && (
                  <button
                    type="button"
                    onClick={() => {
                      taBortEgetProtokoll(tjanstId, rad.id);
                      ladda();
                    }}
                    className="mt-1 text-xs text-muted underline hover:text-red-700"
                  >
                    Ta bort
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <input
              type="date"
              value={datum}
              onChange={(event) => setDatum(event.target.value)}
              className={inputKlass}
              aria-label="Protokollets datum"
            />
            <input
              type="text"
              value={utforsAv}
              onChange={(event) => setUtforsAv(event.target.value)}
              placeholder="Utfört av"
              className={inputKlass}
            />
            <input
              type="text"
              value={filnamn}
              onChange={(event) => setFilnamn(event.target.value)}
              placeholder="Filnamn, om protokollet är uppladdat"
              className={`${inputKlass} sm:col-span-2`}
            />
            <textarea
              value={sammanfattning}
              onChange={(event) => setSammanfattning(event.target.value)}
              placeholder="Vad protokollet visar, t.ex. godkänt eller mätvärde"
              rows={2}
              className={`${inputKlass} sm:col-span-2`}
            />
            <button
              type="button"
              onClick={sparaProtokoll}
              className="rounded-lg border border-primary bg-white px-3 py-2 text-sm font-medium text-primary-dark hover:bg-[#eef6f0] sm:col-span-2 sm:w-fit"
            >
              Lägg till tidigare protokoll
            </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            const resultat = skapaBesiktningUpphandling(tjanstId, uppladdadeFilnamn);
            setStatus(
              resultat.ok
                ? `${resultat.titel} är skapad. Underlaget och anbudsformuläret är sparade här och ligger i upphandlingsmodulen.`
                : resultat.fel,
            );
            ladda();
          }}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          Skapa upphandling
        </button>
        {skapad && (
          <Link
            href={`/forening/upphandling#kategori-${kategoriKey}`}
            className="rounded-lg border border-primary bg-white px-4 py-2 text-sm font-medium text-primary-dark hover:bg-[#eef6f0]"
          >
            Öppna i upphandling
          </Link>
        )}
      </div>

      {skapad && (
        <div className="rounded-lg border border-border bg-white p-4 space-y-3">
          <div>
            <p className="text-sm font-medium text-foreground">
              Förhandsgranska underlag (FFU och anbudsformulär)
            </p>
            <details className="mt-2">
              <summary className="cursor-pointer text-xs font-medium text-primary-dark">
                Visa FFU — förfrågningsunderlag
              </summary>
              <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-[#f7f9f8] p-2 text-xs text-muted">
                {genereraBesiktningUnderlagText(tjanstId, uppladdadeFilnamn)}
              </pre>
            </details>
            <details className="mt-2">
              <summary className="cursor-pointer text-xs font-medium text-primary-dark">
                Visa anbudsformulär (det entreprenören fyller i)
              </summary>
              <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-[#f7f9f8] p-2 text-xs text-muted">
                {genereraBesiktningAnbudsformularText(tjanstId, uppladdadeFilnamn)}
              </pre>
            </details>
          </div>
        </div>
      )}

      {skapad && (
        <div className="rounded-lg border border-border bg-white p-4">
          <p className="text-sm font-medium text-foreground">
            Beställning till vinnande entreprenör
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Entreprenören signerar med BankID först, två personer. Därefter signerar
            föreningen, två personer. Den signerade beställningen sparas i mappen.
          </p>
          {!bestallning || bestallning.status === "godkant" ? (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <input
                type="text"
                value={entreprenorNamn}
                onChange={(event) => setEntreprenorNamn(event.target.value)}
                placeholder="Entreprenör"
                className={inputKlass}
              />
              <input
                type="email"
                value={entreprenorEpost}
                onChange={(event) => setEntreprenorEpost(event.target.value)}
                placeholder="E-post"
                className={inputKlass}
              />
              <input
                type="text"
                value={prisKr}
                onChange={(event) => setPrisKr(event.target.value)}
                placeholder="Pris i kr"
                className={inputKlass}
              />
              <textarea
                value={omfattning}
                onChange={(event) => setOmfattning(event.target.value)}
                rows={2}
                className={`${inputKlass} sm:col-span-2`}
              />
              <button
                type="button"
                onClick={() => {
                  const resultat = skapaBesiktningBestallning(tjanstId, {
                    entreprenorNamn,
                    entreprenorEpost,
                    prisKr,
                    omfattning,
                  });
                  setStatus(resultat.ok ? "Beställningen är skapad. Entreprenören signerar först." : resultat.fel);
                  if (resultat.ok) {
                    setEntreprenorNamn("");
                    setEntreprenorEpost("");
                    setPrisKr("");
                  }
                  ladda();
                }}
                className="rounded-lg border border-primary px-3 py-2 text-sm font-medium text-primary-dark hover:bg-[#eef6f0] sm:col-span-2 sm:w-fit"
              >
                {bestallning?.status === "godkant" ? "Skapa ny beställning" : "Skapa beställning"}
              </button>
            </div>
          ) : null}

          {bestallning && bestallning.status !== "godkant" && (
            <div className="mt-3 space-y-3">
              <p className="text-sm text-foreground">
                {bestallning.entreprenorNamn}
                {bestallning.prisKr ? ` · ${bestallning.prisKr} kr` : ""}
              </p>
              <BankIdAvtalSignering
                part="foretag"
                partEtikett="Entreprenören"
                signaturer={bestallning.foretagSignaturer}
                knaptext="Signera beställning med BankID"
                onSignera={async (signatur) => {
                  const resultat = signeraBesiktningBestallning(tjanstId, signatur);
                  if (!resultat.ok) throw new Error(resultat.fel);
                  setStatus("Entreprenörens signatur är sparad.");
                  ladda();
                }}
              />
              <BankIdAvtalSignering
                part="forening"
                partEtikett="Föreningen"
                signaturer={bestallning.foreningSignaturer}
                ledamoter={ledamoter}
                disabled={!foretagKlar}
                disabledOrsak="Entreprenören ska signera beställningen först."
                knaptext="Signera beställning med BankID"
                onSignera={async (signatur) => {
                  const resultat = signeraBesiktningBestallning(tjanstId, signatur);
                  if (!resultat.ok) throw new Error(resultat.fel);
                  setStatus(
                    harTillrackligaBankIdSignaturer([
                      ...bestallning.foreningSignaturer,
                      signatur,
                    ])
                      ? "Beställningen är signerad av båda parter och sparad i mappen."
                      : "Föreningens signatur är sparad.",
                  );
                  ladda();
                }}
              />
            </div>
          )}
          {bestallning?.status === "godkant" && (
            <p className="mt-3 text-sm text-primary-dark">
              Beställningen med {bestallning.entreprenorNamn} är signerad av
              entreprenören och föreningen.
            </p>
          )}
        </div>
      )}

      {handlingar.length > 0 && (
        <ul className="space-y-2">
          {handlingar.map((handling) => (
            <li
              key={handling.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-white px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium text-foreground">{handling.titel}</p>
                <p className="text-xs text-muted">
                  Sparad {new Date(handling.skapad).toLocaleDateString("sv-SE")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const ok = oppnaTextSomPdf(handling.titel, handling.text);
                  if (!ok) setStatus("Webbläsaren blockerade fönstret. Tillåt popup och försök igen.");
                }}
                className="rounded-lg bg-primary px-3 py-1 text-xs font-medium text-white hover:bg-primary-dark"
              >
                Öppna som PDF
              </button>
            </li>
          ))}
        </ul>
      )}

      {status && (
        <p className="text-sm text-foreground" role="status">
          {status}
        </p>
      )}
    </div>
  );
}
