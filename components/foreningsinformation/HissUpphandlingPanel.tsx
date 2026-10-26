"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BankIdAvtalSignering } from "@/components/bankid/BankIdAvtalSignering";
import { oppnaTextSomPdf } from "@/components/forening/avtal-pdf";
import {
  hamtaRegistreradeHissar,
  hissHandlingar,
  hissUpphandling,
  hissUpphandlingar,
  HISS_UPPHANDLING_EVENT,
  laggTillHissBild,
  laggTillMaterialfaktura,
  lasHissUpphandling,
  livslangdStatus,
  sparaAkutrutin,
  sparaFelrapport,
  skapaFelrapportFranRegister,
  skapaHissBestallning,
  skapaHissUpphandling,
  signeraHissBestallning,
  taBortHissBild,
  taBortMaterialfaktura,
  type FelrapportRad,
  type HissBestallning,
  type HissBild,
  type HissHandling,
  type HissUpphandlingsSlag,
  type Materialfaktura,
  type RegistreradHiss,
} from "@/components/foreningsinformation/hiss-upphandling";
import { kategoriId } from "@/components/upphandling/kategorier";
import { harTillrackligaBankIdSignaturer } from "@/lib/bankid-signering";
import { lasAktivForeningId, lasForeningProfil } from "@/lib/forening-registry";
import type { StyrelseLedamot } from "@/lib/styrelse-ledamot";
import { hamtaAvtalssignerare } from "@/lib/styrelse-kontakt";

const inputKlass =
  "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

function lasBildfil(file: File): Promise<{ filnamn: string; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Kunde inte läsa bilden."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Kunde inte visa bilden."));
      img.onload = () => {
        const max = 1000;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve({ filnamn: file.name, dataUrl: String(reader.result ?? "") });
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve({ filnamn: file.name, dataUrl: canvas.toDataURL("image/jpeg", 0.72) });
      };
      img.src = String(reader.result ?? "");
    };
    reader.readAsDataURL(file);
  });
}

function statusText(installationsAr: string, livslangdAr: number): string {
  const status = livslangdStatus(installationsAr, livslangdAr);
  if (status === "passerad") return "Teknisk livslängd passerad";
  if (status === "nara-slut") return "Nära slutet av teknisk livslängd";
  if (status === "ok") return "Inom teknisk livslängd";
  return "Installationsår saknas";
}

export function HissUpphandlingPanel() {
  const [hydrated, setHydrated] = useState(false);
  const [hissar, setHissar] = useState<RegistreradHiss[]>([]);
  const [bilder, setBilder] = useState<HissBild[]>([]);
  const [fakturor, setFakturor] = useState<Materialfaktura[]>([]);
  const [rader, setRader] = useState<FelrapportRad[]>([]);
  const [feltext, setFeltext] = useState("");
  const [akutrutin, setAkutrutin] = useState("");
  const [intervall, setIntervall] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [ledamoter, setLedamoter] = useState<StyrelseLedamot[]>([]);
  const [skapade, setSkapade] = useState<Partial<Record<HissUpphandlingsSlag, string>>>({});
  const [bestallningar, setBestallningar] = useState<
    Partial<Record<HissUpphandlingsSlag, HissBestallning>>
  >({});
  const [handlingar, setHandlingar] = useState<HissHandling[]>([]);
  const [faktura, setFaktura] = useState({ datum: "", beskrivning: "", beloppKr: "", filnamn: "" });
  const [bestallningForm, setBestallningForm] = useState<
    Record<HissUpphandlingsSlag, { namn: string; epost: string; pris: string }>
  >({
    service: { namn: "", epost: "", pris: "" },
    reparation: { namn: "", epost: "", pris: "" },
    "ny-hiss": { namn: "", epost: "", pris: "" },
  });

  function ladda() {
    const lager = lasHissUpphandling();
    setBilder(lager.bilder);
    setFakturor(lager.materialfakturor);
    setRader(lager.felrapportRader);
    setFeltext(lager.felrapportText);
    setAkutrutin(lager.akutrutin);
    setIntervall(lager.onskatServiceintervall);
    setHissar(hamtaRegistreradeHissar());
    setSkapade({
      service: lager.poster.service.upphandlingSkapad,
      reparation: lager.poster.reparation.upphandlingSkapad,
      "ny-hiss": lager.poster["ny-hiss"].upphandlingSkapad,
    });
    setBestallningar({
      service: lager.poster.service.bestallning,
      reparation: lager.poster.reparation.bestallning,
      "ny-hiss": lager.poster["ny-hiss"].bestallning,
    });
    setHandlingar([
      ...hissHandlingar("service"),
      ...hissHandlingar("reparation"),
      ...hissHandlingar("ny-hiss"),
    ]);
    setLedamoter(lasForeningProfil(lasAktivForeningId())?.styrelseledamoter ?? []);
  }

  useEffect(() => {
    ladda();
    setHydrated(true);
    window.addEventListener(HISS_UPPHANDLING_EVENT, ladda);
    return () => window.removeEventListener(HISS_UPPHANDLING_EVENT, ladda);
  }, []);

  const signerare = hydrated ? hamtaAvtalssignerare() : [];
  const harId = bilder.some((bild) => bild.slag === "id-bricka");
  const harMaskinrum = bilder.some((bild) => bild.slag === "maskinrum");

  async function valjBild(slag: "id-bricka" | "maskinrum", file: File | undefined) {
    if (!file) return;
    try {
      const lasen = await lasBildfil(file);
      const resultat = laggTillHissBild({
        slag,
        hissNamn: hissar[0]?.namn ?? "",
        filnamn: lasen.filnamn,
        dataUrl: lasen.dataUrl,
      });
      setStatus(resultat.ok ? "Bilden är sparad i hissmappen." : resultat.fel);
      if (resultat.ok) ladda();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Kunde inte läsa bilden.");
    }
  }

  function skapa(slag: HissUpphandlingsSlag) {
    const rutin = sparaAkutrutin(akutrutin, intervall);
    if (!rutin.ok) {
      setStatus(rutin.fel);
      return;
    }
    const rapport = sparaFelrapport(rader, feltext);
    if (!rapport.ok) {
      setStatus(rapport.fel);
      return;
    }
    const resultat = skapaHissUpphandling(slag);
    setStatus(
      resultat.ok
        ? `${resultat.titel} är skapad enligt ABT-06. Underlaget ligger i upphandlingsmodulen och handlingarna är sparade här.`
        : resultat.fel,
    );
    ladda();
  }

  return (
    <div className="mt-4 space-y-4 rounded-xl border border-primary/30 bg-[#eef6f0] p-4">
      <div>
        <h3 className="text-sm font-semibold text-primary-dark">Upphandla hiss</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          Service, reparation enligt felrapport och ny hiss skapas här. Bilder på
          id-brickan och från hissmaskinrummet ska finnas med. Anbudsformuläret är
          knutet till ABT-06. När upphandlingen skapas flyttas den till
          upphandlingsmodulen så den kan mejlas till anbudsgivare. Entreprenören
          signerar beställningen först, därefter föreningen.
        </p>
        <p className="mt-2 text-xs text-muted">
          Avtalsundertecknare:{" "}
          {hydrated
            ? signerare.map((person) => `${person.namn} (${person.roll})`).join(", ") ||
              "markera under föreningens uppgifter"
            : "hämtas från föreningens uppgifter"}
        </p>
        {hydrated && (
          <p className="mt-1 text-xs text-muted">
            {hissar.length > 0
              ? `Hissar från registret: ${hissar.map((hiss) => hiss.beskrivning).join("; ")}`
              : "Inga hissar i underhållsplanens register ännu. Bilderna och felrapporten kan ändå sparas här."}
          </p>
        )}
      </div>

      <section>
        <p className="text-sm font-medium text-foreground">Bilder</p>
        <p className="mt-1 text-xs text-muted">
          Id-bricka och hissmaskinrum krävs för service och ny hiss.
          {harId ? " Id-bricka är sparad." : " Id-bricka saknas."}
          {harMaskinrum ? " Maskinrum är sparat." : " Maskinrum saknas."}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <label className="cursor-pointer rounded-lg border border-primary bg-white px-3 py-2 text-sm font-medium text-primary-dark">
            Bild på id-bricka
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(event) => {
                void valjBild("id-bricka", event.target.files?.[0]);
                event.target.value = "";
              }}
            />
          </label>
          <label className="cursor-pointer rounded-lg border border-primary bg-white px-3 py-2 text-sm font-medium text-primary-dark">
            Bild från hissmaskinrum
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(event) => {
                void valjBild("maskinrum", event.target.files?.[0]);
                event.target.value = "";
              }}
            />
          </label>
        </div>
        {bilder.length > 0 && (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {bilder.map((bild) => (
              <li key={bild.id} className="rounded-lg border border-border bg-white p-2">
                {bild.dataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={bild.dataUrl}
                    alt={bild.slag === "id-bricka" ? "Id-bricka" : "Hissmaskinrum"}
                    className="h-28 w-full rounded object-cover"
                  />
                ) : null}
                <p className="mt-1 text-xs text-foreground">
                  {bild.slag === "id-bricka" ? "Id-bricka" : "Hissmaskinrum"} · {bild.filnamn}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    taBortHissBild(bild.id);
                    ladda();
                  }}
                  className="text-xs text-muted underline"
                >
                  Ta bort
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <p className="text-sm font-medium text-foreground">Felrapport och livslängd</p>
        <p className="mt-1 text-xs text-muted">
          Riktvärden: motviktshiss 40 år, hydraulhiss 30 år, styrsystem samt dörrar och
          korg 25 år. Förslag på åtgärd fylls i där komponenten är i slutet av sin
          tekniska livslängd. Reparation upphandlas enligt den här rapporten.
        </p>
        <button
          type="button"
          onClick={() => {
            setRader(skapaFelrapportFranRegister());
            setStatus("Förslag är hämtade från hissregistret och byggåret. Spara felrapporten.");
          }}
          className="mt-2 rounded-lg border border-primary bg-white px-3 py-1.5 text-sm font-medium text-primary-dark"
        >
          Hämta från hissregistret
        </button>
        <ul className="mt-3 space-y-2">
          {rader.map((rad) => (
            <li key={rad.id} className="rounded-lg border border-border bg-white p-3 text-sm">
              <p className="font-medium text-foreground">
                {rad.hissNamn} · {rad.komponent}
              </p>
              <p className="text-xs text-muted">
                {statusText(rad.installationsAr, rad.livslangdAr)}
                {rad.installationsAr ? ` · installationsår ${rad.installationsAr}` : ""} ·{" "}
                {rad.livslangdAr} år
              </p>
              <textarea
                value={rad.forslag}
                onChange={(event) =>
                  setRader((current) =>
                    current.map((item) =>
                      item.id === rad.id ? { ...item, forslag: event.target.value } : item,
                    ),
                  )
                }
                rows={2}
                placeholder="Förslag på åtgärd"
                className={`${inputKlass} mt-2`}
              />
            </li>
          ))}
        </ul>
        <textarea
          value={feltext}
          onChange={(event) => setFeltext(event.target.value)}
          rows={3}
          placeholder="Felrapport: vad som är fel, och vilken reparation som ska upphandlas"
          className={`${inputKlass} mt-2`}
        />
        <button
          type="button"
          onClick={() => {
            const resultat = sparaFelrapport(rader, feltext);
            setStatus(resultat.ok ? "Felrapporten är sparad i hissmappen." : resultat.fel);
          }}
          className="mt-2 rounded-lg border border-primary bg-white px-3 py-1.5 text-sm font-medium text-primary-dark"
        >
          Spara felrapport
        </button>
      </section>

      <section>
        <p className="text-sm font-medium text-foreground">Serviceintervall och akutrutin</p>
        <label className="mt-2 block text-xs text-muted">
          Önskat serviceintervall
          <input
            value={intervall}
            onChange={(event) => setIntervall(event.target.value)}
            placeholder="t.ex. 4 gånger per år"
            className={`${inputKlass} mt-1`}
          />
        </label>
        <textarea
          value={akutrutin}
          onChange={(event) => setAkutrutin(event.target.value)}
          rows={6}
          className={`${inputKlass} mt-2`}
          aria-label="Rutin för akut felavhjälpande"
        />
        <p className="mt-2 text-xs text-muted">
          Rutinen är kopplad till redovisning av materialfakturor. Varje kopia sparas
          här och följer med i underlaget.
        </p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <input
            type="date"
            value={faktura.datum}
            onChange={(event) => setFaktura((current) => ({ ...current, datum: event.target.value }))}
            className={inputKlass}
            aria-label="Fakturadatum"
          />
          <input
            value={faktura.beloppKr}
            onChange={(event) => setFaktura((current) => ({ ...current, beloppKr: event.target.value }))}
            placeholder="Belopp i kr"
            className={inputKlass}
          />
          <input
            value={faktura.beskrivning}
            onChange={(event) =>
              setFaktura((current) => ({ ...current, beskrivning: event.target.value }))
            }
            placeholder="Vad materialet avser"
            className={`${inputKlass} sm:col-span-2`}
          />
          <label className="cursor-pointer text-sm text-primary-dark sm:col-span-2">
            {faktura.filnamn || "Välj kopia av materialfaktura"}
            <input
              type="file"
              accept=".pdf,image/*"
              className="sr-only"
              onChange={(event) =>
                setFaktura((current) => ({
                  ...current,
                  filnamn: event.target.files?.[0]?.name ?? "",
                }))
              }
            />
          </label>
          <button
            type="button"
            onClick={() => {
              const resultat = laggTillMaterialfaktura(faktura);
              setStatus(resultat.ok ? "Materialfakturans kopia är sparad." : resultat.fel);
              if (resultat.ok) {
                setFaktura({ datum: "", beskrivning: "", beloppKr: "", filnamn: "" });
                ladda();
              }
            }}
            className="rounded-lg border border-primary bg-white px-3 py-1.5 text-sm font-medium text-primary-dark sm:w-fit"
          >
            Spara fakturakopia
          </button>
        </div>
        {fakturor.length > 0 && (
          <ul className="mt-2 space-y-1">
            {fakturor.map((rad) => (
              <li key={rad.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span>
                  {rad.datum || "Datum saknas"} · {rad.beskrivning || rad.filnamn}
                  {rad.beloppKr ? ` · ${rad.beloppKr} kr` : ""}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    taBortMaterialfaktura(rad.id);
                    ladda();
                  }}
                  className="text-xs text-muted underline"
                >
                  Ta bort
                </button>
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          onClick={() => {
            const resultat = sparaAkutrutin(akutrutin, intervall);
            setStatus(resultat.ok ? "Rutinen och serviceintervallet är sparade." : resultat.fel);
          }}
          className="mt-2 rounded-lg border border-border bg-white px-3 py-1.5 text-sm text-foreground"
        >
          Spara rutin
        </button>
      </section>

      <section className="space-y-3">
        <p className="text-sm font-medium text-foreground">Skapa upphandling</p>
        <p className="text-xs text-muted">
          Anbudsgivaren fyller i pris per serviceintervall, timpris ordinarie arbetstid,
          timpris jour och bilkostnad. Utbytta delar lämnas till beställaren.
        </p>
        {hissUpphandlingar.map((uppdrag) => {
          const bestallning = bestallningar[uppdrag.id];
          const form = bestallningForm[uppdrag.id];
          const foretagKlar = bestallning
            ? harTillrackligaBankIdSignaturer(bestallning.foretagSignaturer)
            : false;
          return (
            <div key={uppdrag.id} className="rounded-lg border border-border bg-white p-3">
              <p className="text-sm font-semibold text-foreground">{uppdrag.rubrik}</p>
              <p className="mt-1 text-xs text-muted">{uppdrag.omfattning}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => skapa(uppdrag.id)}
                  className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-dark"
                >
                  Skapa upphandling
                </button>
                {skapade[uppdrag.id] && (
                  <Link
                    href={`/forening/upphandling#kategori-${kategoriId(uppdrag.kategoriNamn)}`}
                    className="rounded-lg border border-primary px-3 py-1.5 text-sm font-medium text-primary-dark"
                  >
                    Öppna i upphandling
                  </Link>
                )}
              </div>
              {skapade[uppdrag.id] && (!bestallning || bestallning.status === "godkant") && (
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <input
                    value={form.namn}
                    onChange={(event) =>
                      setBestallningForm((current) => ({
                        ...current,
                        [uppdrag.id]: { ...form, namn: event.target.value },
                      }))
                    }
                    placeholder="Vinnande entreprenör"
                    className={inputKlass}
                  />
                  <input
                    value={form.epost}
                    onChange={(event) =>
                      setBestallningForm((current) => ({
                        ...current,
                        [uppdrag.id]: { ...form, epost: event.target.value },
                      }))
                    }
                    placeholder="E-post"
                    className={inputKlass}
                  />
                  <input
                    value={form.pris}
                    onChange={(event) =>
                      setBestallningForm((current) => ({
                        ...current,
                        [uppdrag.id]: { ...form, pris: event.target.value },
                      }))
                    }
                    placeholder="Pris i kr"
                    className={inputKlass}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const resultat = skapaHissBestallning(uppdrag.id, {
                        entreprenorNamn: form.namn,
                        entreprenorEpost: form.epost,
                        prisKr: form.pris,
                        omfattning: hissUpphandling(uppdrag.id).omfattning,
                      });
                      setStatus(
                        resultat.ok
                          ? "Beställningen är skapad. Entreprenören signerar först."
                          : resultat.fel,
                      );
                      ladda();
                    }}
                    className="rounded-lg border border-primary px-3 py-2 text-sm font-medium text-primary-dark"
                  >
                    {bestallning?.status === "godkant" ? "Skapa ny beställning" : "Skapa beställning"}
                  </button>
                </div>
              )}
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
                      const resultat = signeraHissBestallning(uppdrag.id, signatur);
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
                      const resultat = signeraHissBestallning(uppdrag.id, signatur);
                      if (!resultat.ok) throw new Error(resultat.fel);
                      setStatus("Föreningens signatur är sparad.");
                      ladda();
                    }}
                  />
                </div>
              )}
              {bestallning?.status === "godkant" && (
                <p className="mt-2 text-sm text-primary-dark">
                  Beställningen med {bestallning.entreprenorNamn} är signerad av båda parter.
                </p>
              )}
            </div>
          );
        })}
      </section>

      {handlingar.length > 0 && (
        <ul className="space-y-2">
          {handlingar.map((handling) => (
            <li
              key={handling.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-white px-3 py-2"
            >
              <p className="text-sm font-medium text-foreground">{handling.titel}</p>
              <button
                type="button"
                onClick={() => {
                  const ok = oppnaTextSomPdf(handling.titel, handling.text);
                  if (!ok) setStatus("Webbläsaren blockerade fönstret. Tillåt popup och försök igen.");
                }}
                className="rounded-lg bg-primary px-3 py-1 text-xs font-medium text-white"
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
