import type { Metadata } from "next";
import { ModulePage } from "@/components/ModulePage";
import { NavetUpphandlingDetalj } from "@/components/upphandling/NavetUpphandlingDetalj";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = {
  title: "Upphandling — Styrelse-Navet",
  description:
    "Begränsad information om en publicerad upphandling. Underlag endast för inbjudna entreprenörer.",
};

export default async function UpphandlingDetaljPage({ params }: Props) {
  const { id } = await params;
  return (
    <ModulePage
      title="Upphandling"
      icon="📋"
      intro="Publik sammanfattning utan kontaktuppgifter. Fullständigt förfrågningsunderlag får endast inbjudna, godkända entreprenörer."
    >
      <NavetUpphandlingDetalj upphandlingId={id} />
    </ModulePage>
  );
}
