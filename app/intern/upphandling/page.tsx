import type { Metadata } from "next";
import Link from "next/link";
import { ContentSection } from "@/components/ContentSection";
import { ModulePage } from "@/components/ModulePage";
import { InternNavetUpphandlingPanel } from "@/components/upphandling/InternNavetUpphandlingPanel";

export const metadata: Metadata = {
  title: "Intern upphandling — Styrelse-Navet",
  description:
    "BankID-låst yta för projektinformation, mejlade underlag och registrering av inkomna anbud.",
};

export default function InternUpphandlingPage() {
  return (
    <ModulePage
      title="Intern upphandling"
      icon="🔐"
      intro="Låst yta bakom Styrelse-Navet med BankID. Här lägger ni in projektinformation (stadsdel, fastighet, omfattning), mejlar underlag och registrerar anbud som kommit in via mejl — utan att anbudsgivare ser varandra."
    >
      <p className="mb-6 text-sm text-muted">
        <Link href="/intern" className="font-medium text-primary">
          ← Tillbaka till intern portal
        </Link>
      </p>
      <ContentSection title="Projekt och anbud">
        <InternNavetUpphandlingPanel />
      </ContentSection>
    </ModulePage>
  );
}
