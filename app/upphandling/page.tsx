import type { Metadata } from "next";
import { AktuellaUpphandlingarSida } from "@/components/upphandling/AktuellaUpphandlingarSida";

export const metadata: Metadata = {
  title: "Aktuella upphandlingar — Styrelse-Navet",
  description:
    "Aktuella upphandlingar via Styrelse-Navet. Begränsad publik information — underlag och anbud endast för inbjudna entreprenörer.",
};

export default function UpphandlingPage() {
  return <AktuellaUpphandlingarSida />;
}
