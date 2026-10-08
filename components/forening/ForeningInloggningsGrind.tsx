"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import {
  harForeningBehorighet,
  harLokalForeningBehorighet,
} from "@/lib/forening-behorighet-klient";
import { arKundForening, KUND_LOGIN_PATH, TEST_LOGIN_PATH } from "@/lib/forening-kund";
import { byggMedlemFelanmalanLank } from "@/lib/forening-medlem";
import {
  FORENING_AKTIV_EVENT,
  lasAktivForeningId,
  lasForeningProfil,
} from "@/lib/forening-registry";

type Lage =
  | { typ: "kontrollerar" }
  | { typ: "oppen" }
  | { typ: "last"; id: string; namn: string; kund: boolean };

/** Visar styrelsens sidor bara när webbläsaren har behörighet till aktiv förening. */
export function ForeningInloggningsGrind({ children }: { children: React.ReactNode }) {
  const [lage, setLage] = useState<Lage>({ typ: "kontrollerar" });
  const kontrollId = useRef(0);

  useLayoutEffect(() => {
    function kontrollera() {
      const id = lasAktivForeningId();
      const nr = ++kontrollId.current;
      if (harLokalForeningBehorighet(id)) {
        setLage({ typ: "oppen" });
        return;
      }
      setLage({ typ: "kontrollerar" });
      void harForeningBehorighet(id).then((ok) => {
        if (nr !== kontrollId.current) return;
        if (ok) {
          setLage({ typ: "oppen" });
          return;
        }
        const profil = lasForeningProfil(id);
        setLage({
          typ: "last",
          id,
          namn: profil?.namn || "Föreningen",
          kund: arKundForening(profil),
        });
      });
    }
    kontrollera();
    window.addEventListener(FORENING_AKTIV_EVENT, kontrollera);
    return () => window.removeEventListener(FORENING_AKTIV_EVENT, kontrollera);
  }, []);

  if (lage.typ === "oppen") return <>{children}</>;
  if (lage.typ === "kontrollerar") {
    return <div className="min-h-[60vh]" aria-busy="true" />;
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-lg px-4 py-16">
        <div className="rounded-2xl border-2 border-primary/30 bg-white p-6 shadow-sm">
          <p className="text-3xl" aria-hidden>
            🔒
          </p>
          <h1 className="mt-3 text-xl font-bold text-foreground">
            Styrelsens sidor är låsta
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            <strong className="text-foreground">{lage.namn}</strong> öppnas bara för
            styrelsen. Logga in med BankID eller med e-post och lösenord.
          </p>
          <Link
            href={lage.kund ? KUND_LOGIN_PATH : TEST_LOGIN_PATH}
            className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Logga in som styrelse
          </Link>
          <div className="mt-5 border-t border-border pt-4 text-sm text-muted">
            Bor du i föreningen och vill anmäla ett fel?{" "}
            <Link
              href={byggMedlemFelanmalanLank(lage.id)}
              className="font-medium text-primary-dark underline hover:no-underline"
            >
              Gör en felanmälan
            </Link>
            .
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
