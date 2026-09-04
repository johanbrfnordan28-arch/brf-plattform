import type { Metadata } from "next";
import { ContentSection } from "@/components/ContentSection";
import { ModulePage } from "@/components/ModulePage";

export const metadata: Metadata = {
  title: "Offert — Styrelse-Navet",
  description:
    "Begär offert på teknisk förvaltning, projektledning, besiktning, skadeutredning och upphandling — fasta priser eller löpande debitering.",
};

export default function OffertPage() {
  return (
    <ModulePage
      title="Offert"
      icon="💬"
      intro="Begär offert på teknisk förvaltning och övriga tjänster. Priset beror på fastigheten och omfattningen — ni får fasta priser på offert eller kan välja löpande debitering."
    >
      <ContentSection title="Vad ni kan begära offert på">
        <ul className="list-disc space-y-2 pl-5">
          <li>Teknisk förvaltning till fördelaktigt pris</li>
          <li>Projektledning</li>
          <li>Skadeutredning</li>
          <li>Besiktning</li>
          <li>Upphandling</li>
        </ul>
        <p className="mt-4">
          Kostnaden anpassas efter er fastighet och hur mycket stöd ni behöver.
          På föreningssidan kan styrelsen också starta ett strukturerat
          offertflöde med org.nr-uppslag och godkännande via BankID.
        </p>
      </ContentSection>

      <ContentSection title="Offertflöde på föreningssidan">
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
