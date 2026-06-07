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
      intro="Sök entreprenör för ert projekt. Vi tar referenser på företagen i registret och rekommenderar att ni även tar egna referenser innan ni väljer entreprenör."
    >
      <EntreprenorerRegister />
    </ModulePage>
  );
}
