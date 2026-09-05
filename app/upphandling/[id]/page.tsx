import type { Metadata } from "next";
import { NavetUpphandlingDetalj } from "@/components/upphandling/NavetUpphandlingDetalj";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = {
  title: "Projekt — Styrelse-Navet",
  description:
    "Projektinformation om en upphandling. Anmäl intresse för att bli inbjuden till underlag och anbud.",
};

export default async function UpphandlingDetaljPage({ params }: Props) {
  const { id } = await params;
  return <NavetUpphandlingDetalj upphandlingId={id} />;
}
