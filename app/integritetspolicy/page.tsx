import type { Metadata } from "next";
import Link from "next/link";
import { ContentSection } from "@/components/ContentSection";
import { JuridiskLista, JuridiskSida } from "@/components/juridik/JuridiskSida";
import { BRF_NAVET_NAMN } from "@/lib/forening-konstanter";
import {
  GALLRING_MANADER,
  LEVERANTOR,
  PUB_PATH,
  UNDERBITRADEN,
  VILLKOR_PATH,
  leverantorRad,
} from "@/lib/juridik";
import { PROVOPERIODE_DAGAR } from "@/lib/forening-avtal";

export const metadata: Metadata = {
  title: `Integritetspolicy — ${BRF_NAVET_NAMN}`,
  description:
    "Hur Styrelse-Navet behandlar personuppgifter, kakor och lokal lagring — och vilka rättigheter du har enligt GDPR.",
};

const epostLank = (
  <a
    href={`mailto:${LEVERANTOR.dataskyddEpost}`}
    className="font-medium text-primary-dark underline hover:no-underline"
  >
    {LEVERANTOR.dataskyddEpost}
  </a>
);

export default function IntegritetspolicyPage() {
  return (
    <JuridiskSida
      title="Integritetspolicy"
      intro="Här beskriver vi vilka personuppgifter vi behandlar när du använder Styrelse-Navet, varför vi gör det och vilka rättigheter du har enligt dataskyddsförordningen (GDPR)."
    >
      <ContentSection title="1. Vem ansvarar för dina uppgifter?">
        <p>
          {leverantorRad()} är personuppgiftsansvarig för de uppgifter som
          beskrivs i avsnitt 2. Kontakta oss om dataskydd på {epostLank}.
        </p>
        <p>
          För uppgifter som en bostadsrättsförening själv lägger in i
          tjänsten — till exempel medlemsregister, lägenhetsarkiv och
          felanmälningar från boende — är <strong>föreningen</strong>{" "}
          personuppgiftsansvarig. Vi behandlar dem då som
          personuppgiftsbiträde enligt vårt{" "}
          <Link
            href={PUB_PATH}
            className="font-medium text-primary-dark underline hover:no-underline"
          >
            personuppgiftsbiträdesavtal
          </Link>
          . Är du medlem i en förening och har frågor om sådana uppgifter
          vänder du dig i första hand till föreningens styrelse.
        </p>
      </ContentSection>

      <ContentSection title="2. Vilka uppgifter vi behandlar och varför">
        <p className="font-medium text-foreground">Styrelsekonton</p>
        <JuridiskLista
          punkter={[
            "Namn, e-postadress och roll i styrelsen.",
            "Lösenord, som lagras krypterat (hashat).",
            "Om du loggar in med BankID: en envägskrypterad nyckel som tas fram ur ditt personnummer. Själva personnumret sparas inte.",
            "Inloggningshistorik: tidpunkt, IP-adress och webbläsare.",
          ]}
        />
        <p>
          Ändamål: att skapa och administrera ditt konto, låta dig logga in och
          skydda tjänsten mot obehörig åtkomst. Rättslig grund: avtal (art. 6.1
          b) och, för inloggningshistorik, berättigat intresse av
          informationssäkerhet (art. 6.1 f).
        </p>

        <p className="pt-2 font-medium text-foreground">
          Kontaktuppgifter till föreningen som kund
        </p>
        <JuridiskLista
          punkter={[
            "Föreningens namn, organisationsnummer, adress och kontaktperson.",
            "Uppgifter om avtal, signering och fakturering.",
          ]}
        />
        <p>
          Ändamål: att fullgöra avtalet med föreningen och sköta fakturering.
          Rättslig grund: avtal (art. 6.1 b) och rättslig förpliktelse enligt
          bokföringslagen (art. 6.1 c).
        </p>

        <p className="pt-2 font-medium text-foreground">
          Intresseanmälningar och offertförfrågningar
        </p>
        <JuridiskLista
          punkter={[
            "Namn, e-post, telefon och föreningens namn som du själv lämnar.",
          ]}
        />
        <p>
          Ändamål: att svara på din förfrågan och följa upp intresset.
          Rättslig grund: berättigat intresse (art. 6.1 f). Du kan när som
          helst be oss sluta kontakta dig.
        </p>
      </ContentSection>

      <ContentSection title="3. Hur länge vi sparar uppgifterna">
        <JuridiskLista
          punkter={[
            `Testföreningar utan tecknat avtal raderas automatiskt när prövoperioden på ${PROVOPERIODE_DAGAR} dagar löpt ut, och raderas permanent med alla föreningens uppgifter senast 30 dagar därefter.`,
            "Konton och föreningsuppgifter sparas så länge avtalet gäller. När avtalet upphör raderas eller lämnas uppgifterna tillbaka enligt personuppgiftsbiträdesavtalet.",
            "Underlag för bokföring sparas i sju år enligt bokföringslagen.",
            `Inloggningshistorik raderas automatiskt efter ${GALLRING_MANADER.inloggningshistorik} månader.`,
            `Intresseanmälningar raderas automatiskt efter ${GALLRING_MANADER.intresseanmalningar} månader, eller tidigare om du ber om det.`,
            `Offertförfrågningar raderas automatiskt ${GALLRING_MANADER.offertforfragningar} månader efter senaste hantering, eller tidigare om du ber om det.`,
            `Kopior av mejl som skickats från tjänsten raderas efter ${GALLRING_MANADER.mejlOutbox} månader.`,
          ]}
        />
      </ContentSection>

      <ContentSection title="4. Vilka vi delar uppgifterna med">
        <p>
          Vi säljer aldrig personuppgifter. Vi anlitar följande
          underleverantörer (underbiträden) för att driva tjänsten:
        </p>
        <JuridiskLista
          punkter={UNDERBITRADEN.map((u) => (
            <>
              <strong className="text-foreground">{u.namn}</strong> —{" "}
              {u.syfte}. {u.plats}.
            </>
          ))}
        />
        <p>
          Underleverantörerna får bara behandla uppgifterna för att leverera
          sina tjänster till oss och är bundna av avtal som uppfyller GDPR.
        </p>
      </ContentSection>

      <ContentSection id="kakor" title="5. Kakor och lokal lagring">
        <p>
          Inne i tjänsten använder vi bara kakor och lokal lagring som är
          nödvändiga för att tjänsten ska fungera. Vi använder inga kakor för
          statistik, annonsering eller spårning. Därför behöver vi inte ditt
          samtycke, men vi berättar vad som lagras (lagen om elektronisk
          kommunikation 9 kap. 28 §):
        </p>
        <JuridiskLista
          punkter={[
            <>
              <code>brf_session</code> — håller dig inloggad. Tas bort när du
              loggar ut eller när sessionen löper ut.
            </>,
            <>
              <code>brf_idura_*</code> — tillfälliga kakor under
              BankID-inloggning. Gäller i högst 15 minuter.
            </>,
            "Lokal lagring i webbläsaren (localStorage) — sparar föreningens arbetsdata och vilken förening du har öppen, så att tjänsten fungerar även med svag uppkoppling. Du kan rensa den via webbläsarens inställningar.",
          ]}
        />
        <p>
          Den publika webbplatsen styrelse-navet.se har egen
          kakhantering där du gör dina val i kakbannern.
        </p>
      </ContentSection>

      <ContentSection title="6. Dina rättigheter">
        <p>Du har rätt att:</p>
        <JuridiskLista
          punkter={[
            "få veta vilka uppgifter vi har om dig och få en kopia (tillgång och dataportabilitet),",
            "få felaktiga uppgifter rättade,",
            "få uppgifter raderade när de inte längre behövs eller om behandlingen saknar rättslig grund,",
            "begära att behandlingen begränsas,",
            "invända mot behandling som grundar sig på berättigat intresse.",
          ]}
        />
        <p>
          Mejla {epostLank}, så svarar vi inom en månad. Om du är missnöjd med
          hur vi behandlar dina uppgifter kan du lämna klagomål till
          Integritetsskyddsmyndigheten (IMY),{" "}
          <a
            href="https://www.imy.se"
            className="font-medium text-primary-dark underline hover:no-underline"
          >
            imy.se
          </a>
          .
        </p>
      </ContentSection>

      <ContentSection title="7. Ändringar">
        <p>
          Vi uppdaterar policyn när tjänsten eller lagstiftningen ändras.
          Väsentliga ändringar meddelas föreningar som använder tjänsten. Se
          även våra{" "}
          <Link
            href={VILLKOR_PATH}
            className="font-medium text-primary-dark underline hover:no-underline"
          >
            villkor och personuppgiftsbiträdesavtal
          </Link>
          .
        </p>
      </ContentSection>
    </JuridiskSida>
  );
}
