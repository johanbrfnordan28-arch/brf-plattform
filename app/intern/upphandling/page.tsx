import type { Metadata } from "next";
import Link from "next/link";
import { ContentSection } from "@/components/ContentSection";
import { ModulePage } from "@/components/ModulePage";
import { InternNavetUpphandlingPanel } from "@/components/upphandling/InternNavetUpphandlingPanel";

export const metadata: Metadata = {
  title: "Intern upphandling — Styrelse-Navet",
  description:
    "Låst yta för att skapa upphandlingar, ladda upp underlag, bjuda in entreprenörer och ta emot anbud.",
};

export default function InternUpphandlingPage() {
  return (
    <ModulePage
      title="Intern upphandling"
      icon="🔐"
      intro="Låst yta bakom Styrelse-Navet. Här skapar ni upphandlingen, laddar upp handlingar (även i efterhand), mejlar inbjudningar och ser inkomna anbud — utan att anbudsgivare ser varandra."
    >
      <p className="mb-6 text-sm text-muted">
        <Link href="/intern" className="font-medium text-primary">
          ← Tillbaka till intern portal
        </Link>
      </p>
      <ContentSection title="Upphandlingsarkiv">
        <InternNavetUpphandlingPanel />
      </ContentSection>
    </ModulePage>
  );
}
