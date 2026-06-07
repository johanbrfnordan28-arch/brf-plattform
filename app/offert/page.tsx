import type { Metadata } from "next";
import { ContentSection } from "@/components/ContentSection";
import { ModulePage } from "@/components/ModulePage";

export const metadata: Metadata = {
  title: "Offert — BRF Företag",
  description: "Begär och godkänn offerter för BRF — strukturerat flöde med org.nr och BankID.",
};

export default function OffertPage() {
  return (
    <ModulePage
      title="Offert"
      icon="💬"
      intro="På föreningssidan begär styrelsen offert med org.nr-uppslag, väljer nivå och får dokument levererat till e-post — med möjlighet till godkännande via BankID."
    >
      <ContentSection title="Offertflöde">
        <ol className="list-decimal space-y-2 pl-5">
          <li>Styrelsen anger organisationsnummer och e-post.</li>
          <li>Systemet hämtar föreningsdata från register.</li>
          <li>Styrelsen väljer nivå 1–4 och kompletterar vid behov.</li>
          <li>Offertförfrågan skickas — ni får notis i den interna portalen.</li>
          <li>Offert genereras och skickas till angiven e-post.</li>
          <li>Styrelsen granskar och godkänner med BankID.</li>
        </ol>
      </ContentSection>

      <ContentSection title="Fyra nivåer">
        <p>
          Nivåerna styr omfattning och pris — från enklare teknisk förvaltning till
          utökade paket med underhållsplan, upphandlingsstöd och löpande uppföljning.
          Varje nivå kan ha tydlig beskrivning av vad som ingår.
        </p>
      </ContentSection>

      <ContentSection title="Var funktionen finns">
        <p>
          Offert hör hemma på <strong>föreningssidan</strong>, inte som generellt
          formulär på startsidan. Publika besökare kan läsa om tjänsten; inloggad
          styrelse startar sitt ärende där.
        </p>
      </ContentSection>
    </ModulePage>
  );
}
