import type { Metadata } from "next";
import { headers } from "next/headers";
import { BrfForetagHome } from "@/components/BrfForetagHome";
import { DelaForeningslankRuta } from "@/components/forening/DelaForeningslankRuta";
import { SkapaForeningPaForeningssidan } from "@/components/forening/SkapaForeningPaForeningssidan";
import { genereraForeningBootstrapInlineScript } from "@/lib/forening-aktivera-inline";
import { foreningForstasidaMetadata } from "@/lib/forening-metadata-server";

export async function generateMetadata(): Promise<Metadata> {
  return foreningForstasidaMetadata();
}

function hamtaForeningslankFranHeaders(headerList: Headers): string {
  const host =
    headerList.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    headerList.get("host") ||
    "localhost:3000";
  const proto =
    headerList.get("x-forwarded-proto")?.split(",")[0]?.trim() || "http";
  return `${proto}://${host}/forening`;
}

type PageProps = {
  searchParams: Promise<{
    ny?: string;
    foreningId?: string;
    namn?: string;
  }>;
};

export default async function ForeningPage({ searchParams }: PageProps) {
  const headerList = await headers();
  const foreningslank = hamtaForeningslankFranHeaders(headerList);
  const params = await searchParams;
  const skaBootstrapa =
    params.ny === "1" &&
    params.foreningId &&
    params.foreningId !== "grundmall" &&
    params.namn?.trim();

  return (
    <>
      {skaBootstrapa && (
        <script
          dangerouslySetInnerHTML={{
            __html: genereraForeningBootstrapInlineScript(
              params.foreningId!,
              params.namn!.trim(),
            ),
          }}
        />
      )}
      <SkapaForeningPaForeningssidan />
      <DelaForeningslankRuta initialUrl={foreningslank} />
      <BrfForetagHome mode="forening" />
    </>
  );
}
