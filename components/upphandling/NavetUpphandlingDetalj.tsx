"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  formatNavetDatum,
  hamtaNavetTeaser,
  NAVET_UPPHANDLING_EVENT,
  navetUpphandlingStorageKey,
  sakraDemoNavetUpphandling,
  type NavetPubliceradTeaser,
} from "@/components/upphandling/navet-upphandling-lager";
import { upphandlingsGrupper } from "@/components/upphandling/kategorier";

type Props = { upphandlingId: string };

export function NavetUpphandlingDetalj({ upphandlingId }: Props) {
  const [teaser, setTeaser] = useState<NavetPubliceradTeaser | null | undefined>(
    undefined,
  );

  useEffect(() => {
    function las() {
      sakraDemoNavetUpphandling();
      setTeaser(hamtaNavetTeaser(upphandlingId) ?? null);
    }
    las();
    function onStorage(event: StorageEvent) {
      if (event.key === navetUpphandlingStorageKey()) las();
    }
    window.addEventListener("storage", onStorage);
    window.addEventListener(NAVET_UPPHANDLING_EVENT, las);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(NAVET_UPPHANDLING_EVENT, las);
    };
  }, [upphandlingId]);

  if (teaser === undefined) {
    return <p className="text-sm text-muted">Laddar…</p>;
  }

  if (!teaser) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface/60 p-6">
        <p className="text-sm text-muted">Upphandlingen hittades inte.</p>
        <Link href="/upphandling" className="mt-3 inline-flex text-sm font-medium text-primary">
          ← Tillbaka till aktuella upphandlingar
        </Link>
      </div>
    );
  }

  const grupp = upphandlingsGrupper.find((g) => g.id === teaser.gruppId);

  return (
    <article className="space-y-6">
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <p className="text-xs font-medium uppercase tracking-wide text-primary-dark">
          {teaser.kategoriNamn}
          {grupp ? ` · ${grupp.titel}` : ""}
        </p>
        <h2 className="mt-2 text-2xl font-bold text-foreground">{teaser.titel}</h2>
        <p className="mt-2 text-muted">{teaser.ort}</p>
        <p className="mt-4 text-sm leading-relaxed text-foreground/90">
          {teaser.kortBeskrivning}
        </p>
        <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted">Sista anbudsdag</dt>
            <dd className="font-medium text-foreground">
              {formatNavetDatum(teaser.sistaAnbudsdag)}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Publicerad</dt>
            <dd className="font-medium text-foreground">
              {formatNavetDatum(teaser.publicerad)}
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-2xl border border-dashed border-primary/40 bg-[#e8f3ec]/50 p-6 sm:p-8">
        <h3 className="font-semibold text-primary-dark">Begränsad publik information</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Här visas inte kontaktuppgifter till föreningen och inte heller
          förfrågningsunderlaget. Styrelse-Navet bjuder in godkända entreprenörer
          via mejl — endast de får tillgång till underlaget och kan lämna anbud.
          Anbudet kommer till oss, inte till föreningen.
        </p>
        <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-muted">
          <li>Oinbjudna ser endast denna sammanfattning</li>
          <li>Inbjudna får en unik länk till underlaget</li>
          <li>Kommunikation och anbud sker via Styrelse-Navet</li>
        </ul>
      </div>

      <Link href="/upphandling" className="inline-flex text-sm font-medium text-primary">
        ← Alla aktuella upphandlingar
      </Link>
    </article>
  );
}
