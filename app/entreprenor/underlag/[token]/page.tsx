import type { Metadata } from "next";
import { ModulePage } from "@/components/ModulePage";
import { EntreprenorUnderlagVy } from "@/components/upphandling/EntreprenorUnderlagVy";

type Props = { params: Promise<{ token: string }> };

export const metadata: Metadata = {
  title: "Förfrågningsunderlag — Styrelse-Navet",
  description:
    "Inbjuden entreprenör — förfrågningsunderlag och anbud via Styrelse-Navet.",
};

export default async function EntreprenorUnderlagPage({ params }: Props) {
  const { token } = await params;
  return (
    <ModulePage
      title="Förfrågningsunderlag"
      icon="📎"
      intro="Endast för inbjudna, godkända entreprenörer. Anbud skickas till Styrelse-Navet och syns inte på föreningssidan."
    >
      <EntreprenorUnderlagVy token={token} />
    </ModulePage>
  );
}
