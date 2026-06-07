import type { Metadata } from "next";
import Link from "next/link";
import { ContentSection } from "@/components/ContentSection";
import { ModulePage } from "@/components/ModulePage";

export const metadata: Metadata = {
  title: "Energi & drift — BRF Företag",
  description:
    "Energisparande åtgärder för värme och belysning i bostadsrättsföreningar.",
};

export default function EnergiPage() {
  return (
    <ModulePage
      title="Energi & drift"
      icon="⚡"
      intro="Sänk driftkostnaden genom smarta åtgärder på värme och belysning — utan att blanda ihop dem med stora komponentbyten i underhållsplanen."
    >
      <ContentSection title="Teknisk livslängd vs energiåtgärder">
        <p>
          Ett tak eller en värmecentral byts enligt teknisk livslängd — ofta med
          decenniers intervall. Injustering, LED och styrning är däremot åtgärder ni kan
          göra tidigare och som ofta betalar sig snabbare.
        </p>
      </ContentSection>

      <ContentSection title="Verktyget för styrelsen">
        <p>
          I{" "}
          <strong className="font-medium text-foreground">Grundmall föreningar</strong>{" "}
          finns modulen med tips för värmesystem och belysning, inspirationsfilm och
          koppling till underhållsplan och rondering.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/styrelse-login"
            className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Logga in (demo)
          </Link>
          <Link
            href="/forening/energi"
            className="inline-flex rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
          >
            Gå till modulen
          </Link>
        </div>
      </ContentSection>
    </ModulePage>
  );
}
