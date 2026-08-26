"use client";

import {
  InformationsFilmSpelare,
  type InformationsFilmScen,
} from "@/components/InformationsFilmSpelare";
import { SkapaForeningPanel } from "@/components/forening/SkapaForeningPanel";
import { BRF_NAVET_NAMN, STYRELSEFLOW_NAMN } from "@/lib/forening-konstanter";

const formationScener: InformationsFilmScen[] = [
  {
    titel: "Ge er förening ett namn",
    text: "Skriv in Brf-namnet — ni får en egen kopia av hela portalen, redo att anpassa med dokument, planer och upphandlingar.",
  },
  {
    titel: "Signera med BankID",
    text: "Styrelsen bekräftar uppdraget med BankID — tryggt, spårbart och lika enkelt som att signera ett avtal på nätet.",
  },
  {
    titel: "Er portal är klar",
    text: "På några minuter landar ni i Styrelseflow med moduler, mallar och årshjul — inget kalkylark behövs från dag ett.",
  },
  {
    titel: "Bjud in resten av styrelsen",
    text: "Dela länken internt. Medlemmar och entreprenörer får egna vägar in — styrelsen behåller kontrollen.",
  },
  {
    titel: "Prova gratis i 30 dagar",
    text: "Testa hela plattformen utan bindning. När ni sett filmen och provat vet ni om det passar — och får tydlig prisbild.",
  },
];

const steg = [
  {
    nummer: "1",
    titel: "Namnge föreningen",
    text: "Ett klick — er egen kopia av grundmallen med alla moduler.",
    emoji: "🏠",
  },
  {
    nummer: "2",
    titel: "Signera med BankID",
    text: "Styrelsen trycker signera — säkert och juridiskt tydligt vem som startat.",
    emoji: "🔐",
  },
  {
    nummer: "3",
    titel: "Kom igång direkt",
    text: `Välkommen till ${STYRELSEFLOW_NAMN} — underhåll, upphandling och dokument på ett ställe.`,
    emoji: "🚀",
  },
] as const;

export function ForeningsFormationSektion() {
  return (
    <section
      id="foreningsformation"
      className="scroll-mt-24 border-b border-border bg-gradient-to-b from-[#eef6f0]/80 to-surface"
    >
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="max-w-2xl">
          <p className="inline-flex rounded-full border border-primary/30 bg-white px-3 py-1 text-xs font-semibold text-primary-dark">
            Föreningsformation · 30 dagar gratis
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Er förening på några minuter —{" "}
            <span className="text-primary-dark">seriöst enkelt</span>
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            Sluta jaga pdf:er i mejl. Med {BRF_NAVET_NAMN} får styrelsen en färdig
            portal — och ni bekräftar starten med BankID, som det ska vara.
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.05fr] lg:items-start">
          <div className="space-y-6">
            <ul className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {steg.map((s) => (
                <li
                  key={s.nummer}
                  className="flex gap-4 rounded-2xl border border-border bg-white p-4 shadow-sm"
                >
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e8f3ec] text-xl"
                    aria-hidden
                  >
                    {s.emoji}
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">
                      Steg {s.nummer}
                    </p>
                    <p className="mt-0.5 font-semibold text-foreground">{s.titel}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{s.text}</p>
                  </div>
                </li>
              ))}
            </ul>

            <blockquote className="rounded-2xl border-l-4 border-primary bg-white p-5 shadow-sm">
              <p className="text-sm leading-relaxed text-foreground">
                &ldquo;Vi trodde det skulle ta veckor att få ordning. Efter namn och
                BankID-signering satt hela styrelsen i samma portal samma kväll.&rdquo;
              </p>
              <footer className="mt-3 text-xs font-medium text-muted">
                — Demo-citat från testförening
              </footer>
            </blockquote>
          </div>

          <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-sm">
            <div className="border-b border-border bg-primary-dark px-5 py-4 text-white sm:px-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
                Se hur det går till
              </p>
              <p className="mt-1 text-lg font-bold">Föreningsformation på ca 30 sek</p>
              <p className="mt-2 text-sm text-white/85">
                Från namn till BankID-signering och färdig portal — tryck Spela och följ
                scenerna.
              </p>
            </div>
            <div className="p-4 sm:p-5">
              <InformationsFilmSpelare scener={formationScener} scenMs={5500} />
              <p className="mt-3 text-center text-xs text-muted">
                Demo utan ljud — i produktion kan en inspelad film ligga här.
              </p>
            </div>
          </div>
        </div>

        <div id="skapa-forening" className="mx-auto mt-12 max-w-xl scroll-mt-24">
          <p className="mb-4 text-center text-sm text-muted">
            Redo? Fyll i namnet, signera med BankID och er föreningssida skapas direkt.
          </p>
          <SkapaForeningPanel kompakt visaSnabbstart visaBankId />
        </div>
      </div>
    </section>
  );
}
