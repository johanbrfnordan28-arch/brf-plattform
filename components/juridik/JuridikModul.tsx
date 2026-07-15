"use client";

import { CentralaDomFlikarSektion } from "@/components/juridik/CentralaDomFlikarSektion";
import { EgnaJuridikMapparSektion } from "@/components/juridik/EgnaJuridikMapparSektion";
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
import { arGrundmallForening } from "@/lib/forening-registry";

type JuridikModulProps = {
  /** Publik sida på BRF Navet — visar grundmodulens innehåll utan redigering. */
  publik?: boolean;
};

export function JuridikModul({ publik = false }: JuridikModulProps) {
  const kanRedigeraCentralt = !publik && arGrundmallForening();

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

      {!publik && (
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
      )}

      {!publik && (
        <>
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
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{rad.text}</p>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          Domar och avgöranden
        </h2>
        <p className="mt-2 text-sm text-muted">
          {publik
            ? "Vägledande domar samlade per ämne. Innehållet byggs i grundmodulen och visas här — öppna en flik och läs vägledningen."
            : "Vägledande domar samlade per ämne. I grundmodulen kan ni lägga till flikar och ladda upp domar som sedan syns för alla föreningar och på BRF Navet."}
        </p>
        {!publik && (
          <p className="mt-3 rounded-lg border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm text-amber-950">
            {juridikDelatBibliotekNotis}
          </p>
        )}
        {publik && (
          <p className="mt-3 rounded-lg border border-border bg-background/60 px-4 py-3 text-sm text-muted">
            Detta är en skrivskyddad vy. För att lägga till flikar och domar, logga in via
            Navet-inloggning i grundmodulen.
          </p>
        )}

        <div className="mt-4">
          <CentralaDomFlikarSektion readOnly={!kanRedigeraCentralt} />
        </div>
      </section>

      {!publik && (
        <>
          <section className="rounded-xl border border-dashed border-border bg-background/50 p-4">
            <p className="text-sm font-medium text-foreground">
              Er förenings egna domunderlag
            </p>
            <p className="mt-1 text-xs text-muted">
              Ladda upp domar och handlingar som hör till ert ärende — syns bara för er
              styrelse, inte i det gemensamma biblioteket.
            </p>
            <EgnaJuridikMapparSektion
              storageKeyBase={DOMAR_EGNA_MAPPAR_KEY_BASE}
              eventName={DOMAR_EGNA_MAPPAR_EVENT}
              tomMeddelande="Inga egna dommappar ännu."
              className="mt-3 space-y-3"
            />
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
        </>
      )}
    </div>
  );
}
