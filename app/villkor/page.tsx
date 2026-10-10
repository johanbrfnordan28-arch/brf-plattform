import type { Metadata } from "next";
import Link from "next/link";
import { ContentSection } from "@/components/ContentSection";
import { JuridiskLista, JuridiskSida } from "@/components/juridik/JuridiskSida";
import { BRF_NAVET_NAMN } from "@/lib/forening-konstanter";
import { PROVOPERIODE_DAGAR } from "@/lib/forening-avtal";
import {
  INTEGRITETSPOLICY_PATH,
  LEVERANTOR,
  UNDERBITRADEN,
  leverantorRad,
} from "@/lib/juridik";

export const metadata: Metadata = {
  title: `Villkor och personuppgiftsbiträdesavtal — ${BRF_NAVET_NAMN}`,
  description:
    "Allmänna villkor för Styrelse-Navet och personuppgiftsbiträdesavtal för bostadsrättsföreningar.",
};

const lankKlass = "font-medium text-primary-dark underline hover:no-underline";

export default function VillkorPage() {
  return (
    <JuridiskSida
      title="Villkor och personuppgiftsbiträdesavtal"
      intro="Villkoren gäller när en förening skapas i Styrelse-Navet och under hela den tid föreningen använder tjänsten. Den som skapar föreningen godkänner villkoren för föreningens räkning."
    >
      <nav className="rounded-xl border border-border bg-white px-4 py-3 text-sm">
        <p className="font-medium text-foreground">Innehåll</p>
        <ul className="mt-2 space-y-1">
          <li>
            <a href="#allmanna-villkor" className={lankKlass}>
              Del A — Allmänna villkor
            </a>
          </li>
          <li>
            <a href="#personuppgiftsbitradesavtal" className={lankKlass}>
              Del B — Personuppgiftsbiträdesavtal
            </a>
          </li>
          <li>
            <Link href={INTEGRITETSPOLICY_PATH} className={lankKlass}>
              Integritetspolicy
            </Link>
          </li>
        </ul>
      </nav>

      <h2
        id="allmanna-villkor"
        className="scroll-mt-24 pt-4 text-2xl font-bold text-foreground"
      >
        Del A — Allmänna villkor
      </h2>

      <ContentSection title="A1. Parter och tjänst">
        <p>
          Leverantör är {leverantorRad()} (»Leverantören«). Kund är den
          bostadsrättsförening som skapas i tjänsten (»Föreningen«).
          Styrelse-Navet är en webbtjänst för styrelsearbete — bland annat
          årshjul, underhållsplan, upphandling, lägenhetsarkiv, felanmälan och
          dokumentstöd.
        </p>
      </ContentSection>

      <ContentSection title="A2. Behörighet">
        <p>
          Den som skapar Föreningen intygar att hen sitter i Föreningens
          styrelse eller har styrelsens mandat, och att hen får godkänna dessa
          villkor för Föreningens räkning. Föreningen ansvarar för att bara
          behöriga personer får inloggning och för att lösenord hålls hemliga.
        </p>
      </ContentSection>

      <ContentSection title="A3. Prövoperiod">
        <JuridiskLista
          punkter={[
            `Föreningen kan prova tjänsten kostnadsfritt i ${PROVOPERIODE_DAGAR} dagar från att den skapats.`,
            "Under prövoperioden finns ingen bindningstid eller betalningsskyldighet.",
            "Tecknas inget kundavtal under prövoperioden stängs Föreningen automatiskt när perioden löpt ut. Föreningen och alla uppgifter som lagts in raderas permanent senast 30 dagar därefter.",
          ]}
        />
      </ContentSection>

      <ContentSection title="A4. Kundavtal">
        <p>
          För fortsatt användning tecknar Föreningen ett kundavtal i tjänsten,
          som signeras med BankID av behörig företrädare. Kundavtalet reglerar
          avtalstid, uppsägning och pris. Vid motstridighet gäller kundavtalet
          före dessa allmänna villkor.
        </p>
      </ContentSection>

      <ContentSection title="A5. Föreningens innehåll">
        <p>
          Föreningen äger det innehåll den lägger in och ansvarar för att det
          är korrekt och att Föreningen har rätt att behandla det. Leverantören
          använder innehållet bara för att leverera tjänsten.
        </p>
      </ContentSection>

      <ContentSection title="A6. Tillgänglighet och ansvar">
        <JuridiskLista
          punkter={[
            "Leverantören strävar efter hög tillgänglighet men garanterar inte att tjänsten alltid är fri från avbrott eller fel.",
            "Tjänsten ger stöd för styrelsearbetet. Beslut och bedömningar — till exempel i underhållsplaner och upphandlingar — fattas av Föreningen.",
            "Leverantören ansvarar inte för indirekta skador eller utebliven vinst. Leverantörens samlade ansvar är begränsat till vad Föreningen betalat för tjänsten de senaste tolv månaderna, utom vid uppsåt eller grov vårdslöshet.",
          ]}
        />
      </ContentSection>

      <ContentSection title="A7. Ändringar av villkoren">
        <p>
          Leverantören får ändra villkoren. Väsentliga ändringar meddelas
          Föreningen minst 30 dagar i förväg. Fortsatt användning efter att
          ändringen trätt i kraft innebär att Föreningen godkänner den.
        </p>
      </ContentSection>

      <ContentSection title="A8. Tillämplig lag">
        <p>
          Svensk lag gäller. Tvister avgörs av allmän domstol i Sverige.
        </p>
      </ContentSection>

      <h2
        id="personuppgiftsbitradesavtal"
        className="scroll-mt-24 pt-8 text-2xl font-bold text-foreground"
      >
        Del B — Personuppgiftsbiträdesavtal
      </h2>
      <p className="text-sm leading-relaxed text-muted">
        Enligt artikel 28 i dataskyddsförordningen (GDPR). Föreningen är
        personuppgiftsansvarig och Leverantören är personuppgiftsbiträde för
        de personuppgifter Föreningen behandlar i tjänsten.
      </p>

      <ContentSection title="B1. Behandlingen">
        <JuridiskLista
          punkter={[
            <>
              <strong className="text-foreground">Ändamål:</strong> att
              tillhandahålla Styrelse-Navet till Föreningen.
            </>,
            <>
              <strong className="text-foreground">Registrerade:</strong>{" "}
              styrelseledamöter, medlemmar och boende, entreprenörer och andra
              kontaktpersoner som Föreningen lägger in.
            </>,
            <>
              <strong className="text-foreground">Personuppgifter:</strong>{" "}
              namn, kontaktuppgifter, lägenhetsnummer, uppgifter i
              felanmälningar, renoveringsärenden och dokument som Föreningen
              laddar upp. Föreningen ska inte lägga in känsliga
              personuppgifter (art. 9) eller personnummer i fritext om det inte
              är nödvändigt.
            </>,
            <>
              <strong className="text-foreground">Behandlingar:</strong>{" "}
              lagring, visning, utskick av e-post och säkerhetskopiering.
            </>,
            <>
              <strong className="text-foreground">Varaktighet:</strong> så
              länge Föreningen använder tjänsten.
            </>,
          ]}
        />
      </ContentSection>

      <ContentSection title="B2. Leverantörens åtaganden">
        <p>Leverantören ska:</p>
        <JuridiskLista
          punkter={[
            "bara behandla personuppgifterna enligt Föreningens dokumenterade instruktioner — dessa villkor och de val Föreningen gör i tjänsten,",
            "se till att personal med åtkomst har tystnadsplikt,",
            "vidta lämpliga tekniska och organisatoriska säkerhetsåtgärder (art. 32), bland annat krypterad överföring, hashade lösenord och behörighetsstyrning,",
            "hjälpa Föreningen att besvara begäranden från registrerade, till exempel om tillgång eller radering,",
            "utan onödigt dröjsmål, och senast inom 48 timmar efter upptäckt, underrätta Föreningen om en personuppgiftsincident,",
            "hjälpa Föreningen med konsekvensbedömningar och förhandssamråd när det behövs,",
            "ge Föreningen den information som behövs för att visa att avtalet följs, och möjliggöra granskning efter skälig förvarning.",
          ]}
        />
      </ContentSection>

      <ContentSection title="B3. Underbiträden">
        <p>
          Föreningen ger ett allmänt godkännande till att Leverantören anlitar
          underbiträden. Leverantören ansvarar för att varje underbiträde är
          bundet av motsvarande skyldigheter. Nya underbiträden meddelas
          Föreningen i förväg, och Föreningen har rätt att invända. Aktuella
          underbiträden:
        </p>
        <JuridiskLista
          punkter={UNDERBITRADEN.map((u) => (
            <>
              <strong className="text-foreground">{u.namn}</strong> —{" "}
              {u.syfte}. {u.plats}.
            </>
          ))}
        />
      </ContentSection>

      <ContentSection title="B4. Överföring till tredje land">
        <p>
          Personuppgifter överförs utanför EU/EES bara om det finns stöd i
          GDPR kapitel V, till exempel ett beslut om adekvat skyddsnivå
          (EU–US Data Privacy Framework) eller EU-kommissionens
          standardavtalsklausuler.
        </p>
      </ContentSection>

      <ContentSection title="B5. När avtalet upphör">
        <JuridiskLista
          punkter={[
            "Efter en prövoperiod utan kundavtal raderas uppgifterna automatiskt.",
            "När ett kundavtal upphör kan Föreningen inom 30 dagar begära en export av sina uppgifter. Därefter raderas uppgifterna, inklusive säkerhetskopior, inom 90 dagar, om inte lag kräver att de sparas.",
          ]}
        />
      </ContentSection>

      <ContentSection title="B6. Kontakt">
        <p>
          Frågor om dataskydd eller detta avtal:{" "}
          <a href={`mailto:${LEVERANTOR.dataskyddEpost}`} className={lankKlass}>
            {LEVERANTOR.dataskyddEpost}
          </a>
          .
        </p>
      </ContentSection>
    </JuridiskSida>
  );
}
