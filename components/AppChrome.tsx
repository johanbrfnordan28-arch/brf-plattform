"use client";

import { Footer } from "@/components/Footer";
import { ForeningHeader } from "@/components/ForeningHeader";
import { ForeningAktivator } from "@/components/forening/ForeningAktivator";
import { ForeningAutoSynk } from "@/components/forening/ForeningAutoSynk";
import { ForeningSidTitel } from "@/components/forening/ForeningSidTitel";
import { ForeningDataScope } from "@/components/forening/ForeningDataScope";
import { ForeningPlattformSync } from "@/components/forening/ForeningPlattformSync";
import { ForeningUppgifterGate } from "@/components/forening/ForeningUppgifterGate";
import { ForeningVillkorGate } from "@/components/forening/ForeningVillkorGate";
import { Header } from "@/components/Header";
import { usePathname } from "next/navigation";

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isSigneringOnly = pathname.startsWith("/signering");
  const isForeningAktivera = pathname === "/forening/aktivera";
  const isForening = pathname.startsWith("/forening");

  if (isSigneringOnly) {
    return <>{children}</>;
  }

  if (isForeningAktivera) {
    return (
      <>
        <ForeningAktivator />
        {children}
      </>
    );
  }

  return (
    <>
      {isForening ? (
        <>
          <ForeningAktivator />
          <ForeningUppgifterGate />
          <ForeningVillkorGate />
          <ForeningSidTitel />
          <ForeningPlattformSync />
          <ForeningAutoSynk />
          <ForeningHeader />
        </>
      ) : (
        <Header />
      )}
      {isForening ? <ForeningDataScope>{children}</ForeningDataScope> : children}
      <Footer />
    </>
  );
}
