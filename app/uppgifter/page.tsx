import type { Metadata } from "next";
import Link from "next/link";
import { ContentSection } from "@/components/ContentSection";
import { ModulePage } from "@/components/ModulePage";
import { BRF_NAVET_NAMN } from "@/lib/forening-konstanter";

const steg = [
  {
    titel: "Identitet",
    text: "Namn, organisationsnummer och kontakt-e-post — grunden för er förenings sida.",
  },
  {
    titel: "Grunduppgifter",
    text: "Adress, antal lägenheter och våningar. Uppgifterna synkas till underhållsplanen så ni slipper dubbelregistrering.",
  },
  {
    titel: "Styrelse och inloggning",
    text: "Vilka som har konto, roller och senaste inloggning. Varje ledamot ser bara sitt eget lösenord.",
  },
  {
    titel: "Avtal och BankID",
    text: "När styrelsen är redo signeras avtalet med BankID. Prövoperiod 30 dagar — därefter årsavtal enligt villkoren på huvudsidan.",
  },
  {
    titel: "Säkerhetskopiering",
    text: "Styrelsen kan spara och återställa föreningens data — trygghet om något skulle försvinna från webbläsaren.",
  },
] as const;

export const metadata: Metadata = {
  title: `Föreningsuppgifter — ${BRF_NAVET_NAMN}`,
  description:
    "Så styrelsen sätter upp föreningens identitet, grunduppgifter, inloggning och avtal i Styrelse-Navet.",
};

export default function UppgifterPage() {
  return (
    <ModulePage
      title="Föreningsuppgifter"
      icon="🏢"
      intro="Här samlas identitet, grunduppgifter, styrelse, inloggning och avtal — samma steg som styrelsen går igenom när föreningen skapas. Själva formulären finns i er förenings miljö efter inloggning."
    >
      <div className="rounded-xl border border-primary/30 bg-[#eef6f0] p-5">
        <p className="text-sm font-semibold text-primary-dark">
          Från test till kund
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          När ni skapar er förening fyller styrelsen i uppgifterna steg för steg.
          Det som beskrivs här är samma struktur som i portalen — men era
          ifyllda värden och dokument är inte publika.
        </p>
      </div>

      <ContentSection title="Det här sätter styrelsen upp">
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {steg.map((s) => (
            <li
              key={s.titel}
              className="rounded-xl border border-border bg-background/80 p-4"
            >
              <p className="font-semibold text-foreground">{s.titel}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                {s.text}
              </p>
            </li>
          ))}
        </ul>
      </ContentSection>

      <ContentSection title="Varför det hänger ihop">
        <p>
          Grunduppgifterna används i underhållsplanen, årshjulet och
          upphandling — ett ställe att hålla fakta uppdaterade. När styrelsen
          byts behåller föreningen samma struktur; nya ledamöter loggar in med
          sina egna konton.
        </p>
      </ContentSection>

      <div className="rounded-2xl border border-dashed border-primary/40 bg-[#e8f3ec]/50 p-6 sm:p-8">
        <h3 className="font-semibold text-primary-dark">Kom igång</h3>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Skapa er förening på huvudsidan — då öppnas modulen Föreningsuppgifter
          i er egen miljö med alla formulär.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/#skapa-forening" className="brf-knapp-gron px-5 py-2.5 text-sm">
            Skapa er förening
          </Link>
          <Link
            href="/prova-gratis"
            className="rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-medium text-foreground hover:border-primary/50"
          >
            Prova i testförening
          </Link>
        </div>
      </div>
    </ModulePage>
  );
}
