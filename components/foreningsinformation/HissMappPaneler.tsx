"use client";

import { useEffect, useState } from "react";
import { SenasteBesiktningFormular } from "@/components/SenasteBesiktningFormular";
import {
  HISS_HUVUDMAPP,
  HISS_MAPP_REPARATIONER,
  HISS_UPPHANDLING_EVENT,
  hamtaHissSenasteBesiktning,
  hissBesiktningIntervallAr,
  laggTillMaterialfaktura,
  lasHissUpphandling,
  livslangdStatus,
  skapaFelrapportFranRegister,
  sparaAkutrutin,
  sparaFelrapport,
  sparaHissSenasteBesiktning,
  taBortMaterialfaktura,
  type FelrapportRad,
  type HissBild,
  type Materialfaktura,
} from "@/components/foreningsinformation/hiss-upphandling";
import {
  bekraftaOmDubblett,
  laddaUppTillMapp,
  listaDokumentIMapp,
} from "@/components/foreningsinformation/foreningsinformation-bibliotek-lager";
import { taBortFilUrStyrningsMapp } from "@/lib/forening-dokument-platser";
import {
  deladFilPlats,
  hamtaForeningFilUrlFranPlats,
  oppnaFilIFlik,
} from "@/lib/forening-fil-lagring";
import type { SenasteBesiktningUppgifter } from "@/lib/besiktning-intervall";

const inputKlass =
  "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

const rutaKlass = "mt-3 space-y-3 rounded-lg border border-border bg-white p-4";

function useHissLager<T>(las: () => T): T {
  const [varde, setVarde] = useState<T>(las);
  useEffect(() => {
    function ladda() {
      setVarde(las());
    }
    ladda();
    window.addEventListener(HISS_UPPHANDLING_EVENT, ladda);
    return () => window.removeEventListener(HISS_UPPHANDLING_EVENT, ladda);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return varde;
}

function Status({ status }: { status: { fel: boolean; text: string } | null }) {
  if (!status) return null;
  return (
    <p
      className={`text-sm ${status.fel ? "text-red-800" : "text-primary-dark"}`}
      role={status.fel ? "alert" : "status"}
    >
      {status.text}
    </p>
  );
}

/** Miniatyr av en hissbild — från mappen, eller äldre bild sparad i webbläsaren. */
export function HissBildMiniatyr({ bild }: { bild: HissBild }) {
  const [url, setUrl] = useState<string | null>(bild.fil ? null : bild.dataUrl || null);

  useEffect(() => {
    if (!bild.fil) return;
    let aktiv = true;
    let skapad: string | null = null;
    void hamtaForeningFilUrlFranPlats(deladFilPlats(bild.fil)).then((u) => {
      skapad = u;
      if (aktiv) setUrl(u);
      else if (u) URL.revokeObjectURL(u);
    });
    return () => {
      aktiv = false;
      if (skapad) URL.revokeObjectURL(skapad);
    };
  }, [bild.fil]);

  const alt = bild.slag === "id-bricka" ? "Id-bricka" : "Hissmaskinrum";
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={alt} className="h-28 w-full rounded object-cover" />
  ) : (
    <div className="flex h-28 w-full items-center justify-center rounded bg-[#f7f9f8] text-xs text-muted">
      {bild.fil ? "Laddar bild …" : "Ingen förhandsvisning"}
    </div>
  );
}

/** Hiss → Hissbesiktning: senaste besiktning, resultat och nästa tillfälle. */
export function HissBesiktningPanel() {
  const senaste = useHissLager(hamtaHissSenasteBesiktning);
  const [intervall, setIntervall] = useState(1);

  useEffect(() => {
    setIntervall(hissBesiktningIntervallAr());
  }, []);

  return (
    <div className={rutaKlass}>
      <div>
        <p className="text-sm font-semibold text-foreground">Senaste besiktning</p>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          Hissar besiktas normalt varje år av ett ackrediterat besiktningsorgan.
          Intervallet hämtas från underhållsplanen. Ladda upp protokollet i mappen nedan.
        </p>
      </div>
      <SenasteBesiktningFormular
        key={senaste?.datum ?? "ny"}
        typ="besiktning"
        intervallAr={intervall}
        sparat={senaste ?? {}}
        onSpara={(uppgifter: SenasteBesiktningUppgifter) => {
          sparaHissSenasteBesiktning(uppgifter);
        }}
      />
    </div>
  );
}

/** Hiss → Service: önskat serviceintervall och rutin för akut felavhjälpande. */
export function HissServicePanel() {
  const lager = useHissLager(lasHissUpphandling);
  const [intervall, setIntervall] = useState(lager.onskatServiceintervall);
  const [akutrutin, setAkutrutin] = useState(lager.akutrutin);
  const [status, setStatus] = useState<{ fel: boolean; text: string } | null>(null);

  useEffect(() => {
    setIntervall(lager.onskatServiceintervall);
    setAkutrutin(lager.akutrutin);
  }, [lager.onskatServiceintervall, lager.akutrutin]);

  return (
    <div className={rutaKlass}>
      <p className="text-sm font-semibold text-foreground">Serviceintervall och akutrutin</p>
      <label className="block text-sm">
        <span className="font-medium text-foreground">Önskat serviceintervall</span>
        <input
          value={intervall}
          onChange={(e) => setIntervall(e.target.value)}
          placeholder="T.ex. 4 gånger per år"
          className={`${inputKlass} mt-1`}
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium text-foreground">Rutin för akut felavhjälpande</span>
        <textarea
          value={akutrutin}
          onChange={(e) => setAkutrutin(e.target.value)}
          rows={6}
          className={`${inputKlass} mt-1`}
        />
      </label>
      <p className="text-xs text-muted">
        Intervallet och rutinen följer med i underlaget när service upphandlas.
        Materialfakturor från akuta fel redovisas under Reparationer.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => {
            const res = sparaAkutrutin(akutrutin, intervall);
            setStatus(
              res.ok
                ? { fel: false, text: "Serviceintervall och rutin är sparade." }
                : { fel: true, text: res.fel },
            );
          }}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          Spara
        </button>
        <Status status={status} />
      </div>
    </div>
  );
}

function statusText(installationsAr: string, livslangdAr: number): string {
  const status = livslangdStatus(installationsAr, livslangdAr);
  if (status === "passerad") return "Teknisk livslängd passerad";
  if (status === "nara-slut") return "Nära slutet av teknisk livslängd";
  if (status === "ok") return "Inom teknisk livslängd";
  return "Installationsår saknas";
}

/** Hiss → Reparationer: felrapport med livslängd och materialfakturor. */
export function HissReparationerPanel() {
  const lager = useHissLager(lasHissUpphandling);
  const [rader, setRader] = useState<FelrapportRad[]>(lager.felrapportRader);
  const [feltext, setFeltext] = useState(lager.felrapportText);
  const [faktura, setFaktura] = useState({ datum: "", beskrivning: "", beloppKr: "" });
  const [fakturaFil, setFakturaFil] = useState<File | null>(null);
  const [sparar, setSparar] = useState(false);
  const [status, setStatus] = useState<{ fel: boolean; text: string } | null>(null);

  const sparadRapport = JSON.stringify([lager.felrapportRader, lager.felrapportText]);
  useEffect(() => {
    const [r, t] = JSON.parse(sparadRapport) as [FelrapportRad[], string];
    setRader(r);
    setFeltext(t);
  }, [sparadRapport]);

  async function sparaFaktura() {
    if (!faktura.beskrivning.trim() && !fakturaFil) {
      setStatus({ fel: true, text: "Ange vad fakturan avser eller välj en fil." });
      return;
    }
    let fil: Materialfaktura["fil"];
    if (fakturaFil) {
      const befintliga = listaDokumentIMapp(HISS_HUVUDMAPP, HISS_MAPP_REPARATIONER);
      if (!bekraftaOmDubblett(befintliga, fakturaFil.name)) return;
      setSparar(true);
      const upp = await laddaUppTillMapp(HISS_HUVUDMAPP, HISS_MAPP_REPARATIONER, fakturaFil);
      setSparar(false);
      if (!upp.ok) {
        setStatus({ fel: true, text: upp.fel });
        return;
      }
      fil = upp.dokument.fil;
    }
    const res = laggTillMaterialfaktura({
      ...faktura,
      filnamn: fakturaFil?.name ?? "",
      fil,
    });
    if (!res.ok) {
      setStatus({ fel: true, text: res.fel });
      return;
    }
    setFaktura({ datum: "", beskrivning: "", beloppKr: "" });
    setFakturaFil(null);
    setStatus({
      fel: false,
      text: fil
        ? "Fakturan är registrerad och kopian sparad i mappen Reparationer."
        : "Fakturan är registrerad.",
    });
  }

  function taBortFaktura(rad: Materialfaktura) {
    const fraga = rad.fil
      ? `Ta bort fakturan och kopian ${rad.filnamn} ur mappen Reparationer?`
      : "Ta bort fakturan?";
    if (!window.confirm(fraga)) return;
    if (rad.fil) taBortFilUrStyrningsMapp(HISS_HUVUDMAPP, HISS_MAPP_REPARATIONER, rad.fil);
    taBortMaterialfaktura(rad.id);
  }

  return (
    <div className="mt-3 space-y-3">
      <section className={rutaKlass}>
        <div>
          <p className="text-sm font-semibold text-foreground">Felrapport och livslängd</p>
          <p className="mt-1 text-xs text-muted">
            Riktvärden: motviktshiss 40 år, hydraulhiss 30 år, styrsystem samt dörrar och
            korg 25 år. Skriv förslag på åtgärd där en komponent är i slutet av sin tekniska
            livslängd. Reparationer upphandlas enligt den här rapporten.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setRader(skapaFelrapportFranRegister());
            setStatus({
              fel: false,
              text: "Förslag är hämtade från hissregistret och byggåret. Spara felrapporten.",
            });
          }}
          className="rounded-lg border border-primary bg-white px-3 py-1.5 text-sm font-medium text-primary-dark"
        >
          Hämta från hissregistret
        </button>
        {rader.length > 0 ? (
          <ul className="space-y-2">
            {rader.map((rad) => (
              <li key={rad.id} className="rounded-lg border border-border bg-[#f7f9f8] p-3 text-sm">
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
                  onChange={(e) =>
                    setRader((cur) =>
                      cur.map((item) =>
                        item.id === rad.id ? { ...item, forslag: e.target.value } : item,
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
        ) : null}
        <textarea
          value={feltext}
          onChange={(e) => setFeltext(e.target.value)}
          rows={3}
          placeholder="Felrapport: vad som är fel och vilken reparation som ska upphandlas"
          className={inputKlass}
        />
        <button
          type="button"
          onClick={() => {
            const res = sparaFelrapport(rader, feltext);
            setStatus(
              res.ok
                ? { fel: false, text: "Felrapporten är sparad." }
                : { fel: true, text: res.fel },
            );
          }}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          Spara felrapport
        </button>
      </section>

      <section className={rutaKlass}>
        <div>
          <p className="text-sm font-semibold text-foreground">Materialfakturor</p>
          <p className="mt-1 text-xs text-muted">
            Vid akut felavhjälpande lämnar entreprenören en kopia av materialfakturan. Kopian
            sparas i mappen Reparationer och följer med i underlaget vid upphandling.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            type="date"
            value={faktura.datum}
            onChange={(e) => setFaktura((cur) => ({ ...cur, datum: e.target.value }))}
            className={inputKlass}
            aria-label="Fakturadatum"
          />
          <input
            value={faktura.beloppKr}
            onChange={(e) => setFaktura((cur) => ({ ...cur, beloppKr: e.target.value }))}
            placeholder="Belopp i kr"
            className={inputKlass}
          />
          <input
            value={faktura.beskrivning}
            onChange={(e) => setFaktura((cur) => ({ ...cur, beskrivning: e.target.value }))}
            placeholder="Vad materialet avser"
            className={`${inputKlass} sm:col-span-2`}
          />
          <label className="cursor-pointer text-sm text-primary-dark underline sm:col-span-2">
            {fakturaFil?.name || "Välj kopia av materialfakturan"}
            <input
              type="file"
              accept=".pdf,image/*"
              className="sr-only"
              onChange={(e) => {
                setFakturaFil(e.target.files?.[0] ?? null);
                e.target.value = "";
              }}
            />
          </label>
        </div>
        <button
          type="button"
          disabled={sparar}
          onClick={() => void sparaFaktura()}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
        >
          {sparar ? "Sparar …" : "Spara faktura"}
        </button>
        {lager.materialfakturor.length > 0 ? (
          <ul className="space-y-1">
            {lager.materialfakturor.map((rad) => (
              <li
                key={rad.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#f7f9f8] px-2.5 py-1.5 text-sm"
              >
                <span>
                  {rad.datum || "Datum saknas"} · {rad.beskrivning || rad.filnamn}
                  {rad.beloppKr ? ` · ${rad.beloppKr} kr` : ""}
                  {!rad.fil && rad.filnamn ? (
                    <span className="block text-xs text-muted">
                      Kopian {rad.filnamn} sparades inte som fil. Ladda upp den igen.
                    </span>
                  ) : null}
                </span>
                <span className="flex gap-2">
                  {rad.fil ? (
                    <button
                      type="button"
                      onClick={() => {
                        const fil = rad.fil!;
                        void oppnaFilIFlik(() => hamtaForeningFilUrlFranPlats(deladFilPlats(fil)));
                      }}
                      className="rounded-lg border border-primary/40 px-3 py-1 text-xs font-medium text-primary-dark hover:bg-[#eef6f0]"
                    >
                      Öppna
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => taBortFaktura(rad)}
                    className="rounded-lg border border-border px-3 py-1 text-xs text-muted"
                  >
                    Ta bort
                  </button>
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
      <Status status={status} />
    </div>
  );
}
