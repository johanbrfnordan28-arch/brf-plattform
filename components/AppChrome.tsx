"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/Footer";
import { ForeningHeader } from "@/components/ForeningHeader";
import { ForeningAktivator } from "@/components/forening/ForeningAktivator";
import { ForeningSidTitel } from "@/components/forening/ForeningSidTitel";
import { ForeningDataScope } from "@/components/forening/ForeningDataScope";
import { ForeningPlattformSync } from "@/components/forening/ForeningPlattformSync";
import { Header } from "@/components/Header";

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
          <ForeningSidTitel />
          <ForeningPlattformSync />
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
