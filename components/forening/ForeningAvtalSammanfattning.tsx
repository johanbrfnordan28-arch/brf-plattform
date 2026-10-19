"use client";

import Link from "next/link";
import { AvtalsForetradareLista } from "@/components/forening/AvtalsForetradareLista";
import { SvenskAdressBlock } from "@/components/forening/SvenskAdressBlock";
import { avtalsPartFranProfil } from "@/lib/forening-avtal-part";
import { hamtaSynkadForeningGrund } from "@/lib/forening-grund-synk";
import type { ForeningProfil } from "@/lib/forening-registry";
import { kanGodkannaAvtal } from "@/lib/forening-kund";

/**
 * Visar registrerade grunduppgifter på avtalet — redigering sker bara
 * under Föreningsuppgifter.
 */
export function ForeningAvtalSammanfattning({
  profil,
}: {
  profil: ForeningProfil;
}) {
  const check = kanGodkannaAvtal(profil);
  const synkad = hamtaSynkadForeningGrund(profil);
  const part = avtalsPartFranProfil(profil);

  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        Parterna på avtalet
      </p>
      <h3 className="mt-1 font-serif text-lg font-semibold text-foreground">
        {profil.namn}
      </h3>
      <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium text-muted">Organisationsnummer</dt>
          <dd className="mt-0.5 font-medium text-foreground">
            {synkad.organisationsnummer || profil.organisationsnummer || "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-muted">Adress</dt>
          <dd className="mt-0.5 font-medium text-foreground">
            <SvenskAdressBlock
              className="text-sm font-medium leading-relaxed text-foreground"
              gator={part.gatadresser}
              gata={part.postadress}
              postnummer={part.postnummer}
              ort={part.ort}
              tomText="—"
            />
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-muted">Lägenheter</dt>
          <dd className="mt-0.5 font-medium text-foreground">
            {synkad.antalLagenheter.trim() || "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-muted">E-post styrelse</dt>
          <dd className="mt-0.5 font-medium text-foreground">
            {profil.epost || "—"}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs font-medium text-muted">
            Personer som tecknar / beställer (två krävs för BankID)
          </dt>
          <dd className="mt-2">
            <AvtalsForetradareLista
              personer={part.foretradare ?? []}
              tomText="—"
            />
          </dd>
        </div>
      </dl>
      {check.ok ? (
        <p className="mt-4 text-sm text-primary-dark">
          Uppgifterna hämtas från registreringen. Saknas något kompletterar ni
          under{" "}
          <Link
            href="/forening/uppgifter#grunduppgifter"
            className="font-medium underline hover:no-underline"
          >
            grunduppgifter
          </Link>
          .
        </p>
      ) : (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          Saknas: {check.saknas.join(", ")}. Komplettera under{" "}
          <Link
            href="/forening/uppgifter#grunduppgifter"
            className="font-medium underline hover:no-underline"
          >
            grunduppgifter
          </Link>{" "}
          — sedan kan två personer signera avtalet.
        </p>
      )}
    </div>
  );
}
