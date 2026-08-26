import type { Metadata } from "next";
import { ModulePage } from "@/components/ModulePage";
import { PubliceradeUpphandlingarPanel } from "@/components/upphandling/PubliceradeUpphandlingarPanel";
import { BRF_NAVET_NAMN } from "@/lib/forening-konstanter";

export const metadata: Metadata = {
  title: `Upphandling — ${BRF_NAVET_NAMN}`,
  description:
    "Publicerade upphandlingar från BRF-föreningar — titel, ort, kategori och sista anbudsdag.",
};

export default function UpphandlingPage() {
  return (
    <ModulePage
      title="Upphandling"
      icon="📋"
      intro="Aktuella uppdrag som föreningar publicerat. Anbud och offerter visas inte här — bara det som styrelsen valt att lägga ut."
    >
      <PubliceradeUpphandlingarPanel publik />
    </ModulePage>
  );
}
