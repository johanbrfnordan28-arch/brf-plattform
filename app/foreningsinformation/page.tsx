import type { Metadata } from "next";
import Link from "next/link";
import { ContentSection } from "@/components/ContentSection";
import { ModulePage } from "@/components/ModulePage";
import { antalForeningsHuvudmappar, foreningsHuvudmappar } from "@/components/foreningsinformation/mappar";

export const metadata: Metadata = {
  title: "Styrning och Dokument — BRF Företag",
  description:
    "Styrelsearkiv, stadgar, protokoll och övriga dokument för BRF.",
};

export default function ForeningsinformationPage() {
  return (
    <ModulePage
      title="Styrning och Dokument"
      icon="📁"
      intro={`En central plats för föreningens dokument — ${antalForeningsHuvudmappar} huvudmappar: Styrelse Arkiv, besiktningar (hiss), service (undercentral), ventilation och tioårsbesiktningar.`}
    >
      <ContentSection title={`Struktur — ${antalForeningsHuvudmappar} huvudmappar`}>
        <ul className="space-y-4 text-foreground">
          {foreningsHuvudmappar.map((huvud) => (
            <li key={huvud.id}>
              <p className="font-semibold">{huvud.titel}</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
                {huvud.undermappar.map((under) => (
                  <li key={under.id}>
                    {under.titel}
                    {under.barn && under.barn.length > 0 && (
                      <ul className="mt-1 list-disc space-y-0.5 pl-5">
                        {under.barn.map((child) => (
                          <li key={child.id}>
                            {child.titel}
                            {child.dynamiskaUndermappar && (
                              <span className="text-muted">
                                {" "}
                                (egna undermappar)
                              </span>
                            )}
                            {child.barn && child.barn.length > 0 && (
                              <ul className="mt-0.5 list-disc space-y-0.5 pl-5">
                                {child.barn.map((grandchild) => (
                                  <li key={grandchild.id}>{grandchild.titel}</li>
                                ))}
                              </ul>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </ContentSection>

      <ContentSection title="Uppladdning i föreningens miljö">
        <p>
          Efter inloggning kan styrelsen ladda upp dokument i varje mapp — samma
          upplägg som juridikmodulens dombibliotek.
        </p>
        <Link
          href="/styrelse-login"
          className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          Logga in för att hantera dokument
        </Link>
      </ContentSection>
    </ModulePage>
  );
}
