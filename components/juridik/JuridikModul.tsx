"use client";

import { useEffect, useState } from "react";
import { OppnaStangIkon } from "@/components/OppnaStangKnapp";
import {
  centralaJuridikTips,
  centralTipsKategoriEtikett,
  hamtaCentralaDomar,
} from "@/components/juridik/juridik-centralt-bibliotek";
import {
  domMappar,
  type DomMappDefinition,
} from "@/components/juridik/domar";
import {
  juridikDelatBibliotekNotis,
  juridikEgnaMapparNotis,
  juridikFriskrivningKort,
  juridikGemensamtVsEget,
  juridikKostnadTvister,
  juridikSparaPengar,
  juridikStyrelseAnsvar,
} from "@/components/juridik/juridik-innehall";
import {
  DOMAR_EGNA_MAPPAR_EVENT,
  DOMAR_EGNA_MAPPAR_KEY_BASE,
  EGNA_MAPPAR_EVENT,
  EGNA_MAPPAR_KEY_BASE,
} from "@/components/juridik/juridik-egna-mappar-lager";
import type { JuridikUppladdatDokument } from "@/components/juridik/juridik-lager";
import { EgnaJuridikMapparSektion } from "@/components/juridik/EgnaJuridikMapparSektion";

export function JuridikModul() {
  const [mappUi, setMappUi] = useState<Record<string, { öppen: boolean }>>({});

  useEffect(() => {
    setMappUi(
      Object.fromEntries(domMappar.map((m) => [m.id, { öppen: false }])),
    );
  }, []);

  function toggleMapp(id: string) {
    setMappUi((current) => ({
      ...current,
      [id]: { öppen: !current[id]?.öppen },
    }));
  }

  return (
    <div className="space-y-10">
      <section className="rounded-2xl border-2 border-primary/35 bg-[#eef6f0] p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">
          Viktigt att veta
        </p>
        <h2 className="mt-2 text-xl font-bold text-foreground">
          {juridikStyrelseAnsvar.rubrik}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-foreground">
          {juridikStyrelseAnsvar.ingress}
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-foreground">
          {juridikStyrelseAnsvar.punkter.map((punkt) => (
            <li key={punkt}>{punkt}</li>
          ))}
        </ul>
        <p className="mt-4 rounded-lg border border-primary/25 bg-white/70 px-4 py-3 text-sm text-muted">
          {juridikFriskrivningKort}
        </p>
      </section>

      <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-foreground">
          {juridikGemensamtVsEget.rubrik}
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-primary/25 bg-[#fafcfa] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">
              Gemensamt bibliotek
            </p>
            <p className="mt-2 text-sm leading-relaxed text-foreground">
              {juridikGemensamtVsEget.gemensamt}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-background p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Er styrelses egna dokument
            </p>
            <p className="mt-2 text-sm leading-relaxed text-foreground">
              {juridikGemensamtVsEget.eget}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-primary/30 bg-[#fafcfa] p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-foreground">
          {juridikSparaPengar.rubrik}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {juridikSparaPengar.ingress}
        </p>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-foreground">
          <p>
            <strong className="font-medium">Styrelsen:</strong>{" "}
            {juridikSparaPengar.styrelse}
          </p>
          <p>
            <strong className="font-medium">Medlemmen:</strong>{" "}
            {juridikSparaPengar.medlem}
          </p>
          <p className="rounded-lg border border-primary/20 bg-white px-4 py-3">
            <strong className="font-medium">Hur en tvist i rätten kan gå:</strong>{" "}
            {juridikSparaPengar.tvistgang}
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          {juridikKostnadTvister.rubrik}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {juridikKostnadTvister.ingress}
        </p>
        <ul className="mt-4 space-y-3">
          {juridikKostnadTvister.råd.map((rad) => (
            <li
              key={rad.titel}
              className="rounded-xl border border-border bg-background/80 p-4"
            >
              <p className="font-medium text-foreground">{rad.titel}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                {rad.text}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          Gemensamt bibliotek — domar och avgöranden
        </h2>
        <p className="mt-2 text-sm text-muted">
          Vägledande domar samlade per ämne. Materialet fylls på centralt och är
          samma för alla föreningar — öppna en mapp och läs vägledningen.
        </p>
        <p className="mt-3 rounded-lg border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm text-amber-950">
          {juridikDelatBibliotekNotis}
        </p>

        <ul className="mt-4 space-y-3">
          {domMappar.map((mapp) => (
            <DomMappRad
              key={mapp.id}
              mapp={mapp}
              dokument={hamtaCentralaDomar(mapp.id)}
              öppen={mappUi[mapp.id]?.öppen ?? false}
              onToggle={() => toggleMapp(mapp.id)}
            />
          ))}
        </ul>

        <div className="mt-6 rounded-xl border border-dashed border-border bg-background/50 p-4">
          <p className="text-sm font-medium text-foreground">
            Er förenings egna domunderlag
          </p>
          <p className="mt-1 text-xs text-muted">
            Ladda upp domar och handlingar som hör till ert ärende — syns bara
            för er styrelse, inte i det gemensamma biblioteket.
          </p>
          <EgnaJuridikMapparSektion
            storageKeyBase={DOMAR_EGNA_MAPPAR_KEY_BASE}
            eventName={DOMAR_EGNA_MAPPAR_EVENT}
            tomMeddelande="Inga egna dommappar ännu."
            className="mt-3 space-y-3"
          />
        </div>
      </section>

      <section className="border-t border-border pt-8">
        <h2 className="text-lg font-semibold text-foreground">Egna mappar</h2>
        <p className="mt-2 text-sm text-muted">{juridikEgnaMapparNotis}</p>
        <EgnaJuridikMapparSektion
          storageKeyBase={EGNA_MAPPAR_KEY_BASE}
          eventName={EGNA_MAPPAR_EVENT}
          tomMeddelande="Inga egna mappar skapade ännu."
        />
      </section>

      <section className="border-t border-border pt-8">
        <h2 className="text-lg font-semibold text-foreground">
          Tips och råd — centralt bibliotek
        </h2>
        <p className="mt-2 text-sm text-muted">
          Korta råd som underhålls centralt och gäller alla föreningar. Använd
          dem inför möten med medlemmar, kontakt med juridiskt ombud eller för
          att undvika onödiga kostnader. Egna anteckningar sparar ni i egna
          mappar ovan.
        </p>

        <ul className="mt-4 space-y-3">
          {centralaJuridikTips.map((tips) => (
            <li
              key={tips.id}
              className="rounded-xl border border-border bg-surface p-4"
            >
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                {centralTipsKategoriEtikett(tips.kategori)}
              </span>
              <p className="mt-2 font-semibold text-foreground">{tips.titel}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                {tips.text}
              </p>
              <p className="mt-2 text-xs text-muted">{tips.uppladdad}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

type DomMappRadProps = {
  mapp: DomMappDefinition;
  dokument: JuridikUppladdatDokument[];
  öppen: boolean;
  onToggle: () => void;
};

function DomMappRad({ mapp, dokument, öppen, onToggle }: DomMappRadProps) {
  return (
    <li className="rounded-xl border border-border bg-surface shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-3 px-4 py-4 text-left sm:px-5"
        aria-expanded={öppen}
      >
        <OppnaStangIkon oppen={öppen} className="mt-0.5" />
        <span className="min-w-0 flex-1">
          <span className="block text-base font-semibold text-foreground">
            {mapp.titel}
          </span>
          <span className="mt-1 block text-sm text-muted">{mapp.beskrivning}</span>
          {dokument.length > 0 && (
            <span className="mt-2 inline-block rounded-full bg-[#eef6f0] px-2.5 py-0.5 text-xs font-medium text-primary-dark">
              {dokument.length}{" "}
              {dokument.length === 1
                ? "dokument i biblioteket"
                : "dokument i biblioteket"}
            </span>
          )}
        </span>
      </button>

      {öppen && (
        <div className="border-t border-border px-4 pb-5 pt-4 sm:px-5">
          <p className="text-sm leading-relaxed text-foreground">{mapp.vägledning}</p>
          <p className="mt-2 text-xs text-muted">
            Central vägledning — använd som underlag inför styrelsebeslut och
            möten, inte som färdigt beslut.
          </p>

          {dokument.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {dokument.map((doc) => (
                <li
                  key={doc.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {doc.filnamn}
                    </p>
                    <p className="text-xs text-muted">{doc.uppladdad}</p>
                  </div>
                  <button
                    type="button"
                    className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-dark"
                    title="Demo: öppna centralt dokument"
                  >
                    Läs dom
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 rounded-lg border border-dashed border-border px-3 py-2.5 text-sm text-muted">
              Centralt material kommer att publiceras här löpande.
            </p>
          )}
        </div>
      )}
    </li>
  );
}
