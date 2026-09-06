"use client";

import { useState } from "react";
import { BytLosenordForm } from "@/components/auth/BytLosenordForm";
import { MittLosenordKort } from "@/components/auth/MittLosenordKort";

type Props = {
  epost: string;
  losenord: string;
  foreningId: string;
  foreningStartPath: string;
};

/**
 * Efter lyckad inloggning: lösenordet är sparat — möjlighet att byta eller gå vidare.
 */
export function EfterInloggningLosenordPanel({
  epost,
  losenord,
  foreningStartPath,
}: Props) {
  const [visaByte, setVisaByte] = useState(false);
  const [nyckel, setNyckel] = useState(0);

  function gaVidare() {
    window.location.assign(foreningStartPath);
  }

  return (
    <div className="mx-auto max-w-lg space-y-5 px-4">
      <section className="rounded-2xl border-2 border-primary/30 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">
          Inloggad
        </p>
        <h2 className="mt-1 text-xl font-bold text-foreground">
          Lösenordet är sparat
        </h2>
        <p className="mt-2 text-sm text-muted">
          Du är inloggad som{" "}
          <strong className="font-medium text-foreground">{epost}</strong>.
          Lösenordet sparades automatiskt — bara du kan se det. Du kan byta det
          nu eller fortsätta till föreningen.
        </p>

        {!visaByte && (
          <div className="mt-4 rounded-lg border border-border bg-surface px-3 py-2 text-sm">
            <span className="font-medium text-foreground">Sparat lösenord: </span>
            <code className="font-mono text-foreground">{losenord}</code>
          </div>
        )}

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={gaVidare}
            className="brf-knapp-gron px-5 py-2.5 text-sm shadow-sm"
          >
            Fortsätt till föreningen
          </button>
          <button
            type="button"
            onClick={() => setVisaByte((v) => !v)}
            className="rounded-lg border border-border bg-white px-5 py-2.5 text-sm font-medium text-foreground hover:border-primary/40"
          >
            {visaByte ? "Dölj byte av lösenord" : "Byt lösenord nu"}
          </button>
        </div>
      </section>

      {visaByte ? (
        <BytLosenordForm
          inbaddad
          onLyckat={() => {
            setNyckel((n) => n + 1);
          }}
        />
      ) : (
        <MittLosenordKort key={nyckel} kompakt />
      )}
    </div>
  );
}
