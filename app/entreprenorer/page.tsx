import type { Metadata } from "next";
import { EntreprenorerRegister } from "@/components/entreprenorer/EntreprenorerRegister";
import { ModulePage } from "@/components/ModulePage";

export const metadata: Metadata = {
  title: "Entreprenörer — BRF Företag",
  description:
    "Sök entreprenör för ert projekt bland godkända företag i registret.",
};

export default function EntreprenorerPage() {
  return (
    <ModulePage
      title="Entreprenörer"
      icon="🏗️"
      intro="Sök bland rekommenderade entreprenörer. Kontrollera egna referenser, beställ skriftligt och var medveten om att företag kan byta ägare och personal."
    >
      <EntreprenorerRegister
        sokRubrik="Sök i det centrala registret"
        sokIngress="Här visas företag vi har referenser på. Ni ansvarar själva för avtal, uppföljning och slutligt val."
      />
    </ModulePage>
  );
}
