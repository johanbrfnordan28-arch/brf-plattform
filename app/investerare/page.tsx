import type { Metadata } from "next";
import { InvesterarDemo } from "@/components/investerare/InvesterarDemo";

export const metadata: Metadata = {
  title: "Investerardemo — BRF-plattformen",
  description:
    "Guidad demo med förifylld testförening och snabblänkar till underhållsplan, upphandling och föreningsportalen.",
  robots: { index: false, follow: false },
};

export default function InvesterarePage() {
  return <InvesterarDemo />;
}
