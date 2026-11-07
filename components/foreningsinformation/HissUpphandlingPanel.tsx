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
  HISS_HUVUDMAPP,
  HISS_MAPP_BILDER,
  laggTillHissBild,
  lasHissUpphandling,
  skapaHissBestallning,
  skapaHissUpphandling,
  signeraHissBestallning,
  taBortHissBild,
  type HissBestallning,
  type HissBild,
  type HissHandling,
  type HissUpphandlingsSlag,
  type RegistreradHiss,
} from "@/components/foreningsinformation/hiss-upphandling";
import { kategoriId } from "@/components/upphandling/kategorier";
import { HissBildMiniatyr } from "@/components/foreningsinformation/HissMappPaneler";
import {
  bekraftaOmDubblett,
  laddaUppTillMapp,
  listaDokumentIMapp,
} from "@/components/foreningsinformation/foreningsinformation-bibliotek-lager";
import { taBortFilUrStyrningsMapp } from "@/lib/forening-dokument-platser";
import { harTillrackligaBankIdSignaturer } from "@/lib/bankid-signering";
import { lasAktivForeningId, lasForeningProfil } from "@/lib/forening-registry";
import type { StyrelseLedamot } from "@/lib/styrelse-ledamot";
import { hamtaAvtalssignerare } from "@/lib/styrelse-kontakt";

const inputKlass =
  "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

/** Förminskar bilden till högst 1000 px och sparar den som JPEG. */
function lasBildfil(file: File): Promise<File> {
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
          resolve(file);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const namn = file.name.replace(/\.[^.]+$/, "") + ".jpg";
            resolve(new File([blob], namn, { type: "image/jpeg" }));
          },
          "image/jpeg",
          0.72,
        );
      };
      img.src = String(reader.result ?? "");
    };
    reader.readAsDataURL(file);
  });
}

export function HissUpphandlingPanel() {
  const [hydrated, setHydrated] = useState(false);
  const [hissar, setHissar] = useState<RegistreradHiss[]>([]);
  const [bilder, setBilder] = useState<HissBild[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [ledamoter, setLedamoter] = useState<StyrelseLedamot[]>([]);
  const [skapade, setSkapade] = useState<Partial<Record<HissUpphandlingsSlag, string>>>({});
  const [bestallningar, setBestallningar] = useState<
    Partial<Record<HissUpphandlingsSlag, HissBestallning>>
  >({});
  const [handlingar, setHandlingar] = useState<HissHandling[]>([]);
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
      const komprimerad = await lasBildfil(file);
      const befintliga = listaDokumentIMapp(HISS_HUVUDMAPP, HISS_MAPP_BILDER);
      if (!bekraftaOmDubblett(befintliga, komprimerad.name)) return;
      setStatus(`Laddar upp ${komprimerad.name} …`);
      const upp = await laddaUppTillMapp(HISS_HUVUDMAPP, HISS_MAPP_BILDER, komprimerad);
      if (!upp.ok) {
        setStatus(upp.fel);
        return;
      }
      const resultat = laggTillHissBild({
        slag,
        hissNamn: hissar[0]?.namn ?? "",
        filnamn: komprimerad.name,
        dataUrl: "",
        fil: upp.dokument.fil,
      });
      setStatus(resultat.ok ? "Bilden är sparad i mappen Hiss → Bilder." : resultat.fel);
      if (resultat.ok) ladda();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Kunde inte läsa bilden.");
    }
  }

  function skapa(slag: HissUpphandlingsSlag) {
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
          Service, reparation och ny hiss upphandlas här. Bilder på id-brickan och
          från hissmaskinrummet ska finnas med. Serviceintervall och akutrutin fyller
          ni i under Service, felrapport och materialfakturor under Reparationer.
          Anbudsformuläret är knutet till ABT-06. När upphandlingen skapas flyttas den
          till upphandlingsmodulen så den kan mejlas till anbudsgivare. Entreprenören
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
              : "Inga hissar i underhållsplanens register ännu. Bilder och felrapport kan ändå sparas."}
          </p>
        )}
      </div>

      <section>
        <p className="text-sm font-medium text-foreground">Bilder</p>
        <p className="mt-1 text-xs text-muted">
          Id-bricka och hissmaskinrum krävs för service och ny hiss. Bilderna sparas i
          mappen Bilder.
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
                <HissBildMiniatyr bild={bild} />
                <p className="mt-1 text-xs text-foreground">
                  {bild.slag === "id-bricka" ? "Id-bricka" : "Hissmaskinrum"} · {bild.filnamn}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (!window.confirm(`Ta bort ${bild.filnamn}?`)) return;
                    if (bild.fil) taBortFilUrStyrningsMapp(HISS_HUVUDMAPP, HISS_MAPP_BILDER, bild.fil);
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
