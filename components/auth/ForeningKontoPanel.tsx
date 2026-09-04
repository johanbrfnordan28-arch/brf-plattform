"use client";

import { useState } from "react";
import Link from "next/link";
import { BytLosenordForm } from "@/components/auth/BytLosenordForm";
import { MittLosenordKort } from "@/components/auth/MittLosenordKort";

/**
 * Styrelsens kontosida — spara/visa lösenord + byt lösenord på samma ställe.
 */
export function ForeningKontoPanel() {
  const [nyckel, setNyckel] = useState(0);

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-border bg-surface p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Konto
        </p>
        <h2 className="mt-1 text-xl font-bold text-foreground">
          Ditt inloggningskonto
        </h2>
        <p className="mt-2 text-sm text-muted">
          Här hanterar du ditt eget lösenord. Andra i styrelsen ser aldrig ditt
          lösenord — och du ser aldrig deras.
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted">
          <li>
            <strong className="font-medium text-foreground">
              Spara/visa mitt lösenord
            </strong>{" "}
            — se det lösenord som sparats för dig (aldrig andras)
          </li>
          <li>
            <strong className="font-medium text-foreground">Byt lösenord</strong>{" "}
            — nuvarande lösenord fylls i automatiskt när du är inloggad
          </li>
        </ul>
      </div>

      <MittLosenordKort key={nyckel} />

      <BytLosenordForm
        inbaddad
        onLyckat={() => setNyckel((n) => n + 1)}
      />

      <p className="text-sm text-muted">
        Glömt lösenordet?{" "}
        <Link
          href="/konto/glomt-losenord"
          className="font-medium text-primary-dark underline"
        >
          Återställ via e-post
        </Link>
        . Översikt över vilka som har inloggning finns under{" "}
        <Link
          href="/forening/uppgifter#inloggning"
          className="font-medium text-primary-dark underline"
        >
          Uppgifter → Inloggning
        </Link>
        .
      </p>
    </div>
  );
}
