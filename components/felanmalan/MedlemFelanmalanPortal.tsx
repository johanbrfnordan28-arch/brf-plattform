"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { MedlemFelanmalanForm } from "@/components/felanmalan/MedlemFelanmalanForm";
import {
  filtreraForeningarPaSok,
  hamtaSokSuffix,
  INLOGGNING_BRF_PREFIX,
  MIN_SOK_BOKSTAVER_EFTER_BRF,
  normaliseraBrfSoktext,
  sokKräverFlerBokstaver,
} from "@/lib/forening-inloggning";
import { sokForeningarForMedlem } from "@/lib/forening-sok-klient";
import { listaForeningar, type ForeningProfil } from "@/lib/forening-registry";
import { TEST_LOGIN_PATH } from "@/lib/forening-kund";

function MedlemFelanmalanPortalInre() {
  const searchParams = useSearchParams();
  const foreningIdFranUrl = searchParams.get("foreningId")?.trim() ?? "";

  const [sok, setSok] = useState(INLOGGNING_BRF_PREFIX);
  const [lokalForeningar, setLokalForeningar] = useState<ForeningProfil[]>([]);
  const [serverTraffar, setServerTraffar] = useState<ForeningProfil[]>([]);
  const [serverSokLaddar, setServerSokLaddar] = useState(false);
  const [valdForening, setValdForening] = useState<{
    id: string;
    namn: string;
  } | null>(null);
  const [urlFel, setUrlFel] = useState<string | null>(null);
  const sokReqId = useRef(0);

  useEffect(() => {
    setLokalForeningar(listaForeningar());
  }, []);

  useEffect(() => {
    if (!foreningIdFranUrl) return;
    let avbruten = false;
    void fetch(
      `/api/foreningar/${encodeURIComponent(foreningIdFranUrl)}/publik`,
    )
      .then(async (res) => {
        const data = (await res.json()) as { id?: string; namn?: string; fel?: string };
        if (avbruten) return;
        if (!res.ok || !data.id || !data.namn) {
          setUrlFel(data.fel || "Kunde inte hitta föreningen.");
          return;
        }
        setValdForening({ id: data.id, namn: data.namn });
      })
      .catch(() => {
        if (!avbruten) setUrlFel("Kunde inte nå servern.");
      });
    return () => {
      avbruten = true;
    };
  }, [foreningIdFranUrl]);

  const sammanslagna = useMemo(() => {
    const map = new Map<string, ForeningProfil>();
    for (const f of lokalForeningar) map.set(f.id, f);
    for (const f of serverTraffar) {
      if (!map.has(f.id)) map.set(f.id, f);
    }
    return [...map.values()].sort((a, b) => a.namn.localeCompare(b.namn, "sv"));
  }, [lokalForeningar, serverTraffar]);

  const vantarPaSok = sokKräverFlerBokstaver(sok, sammanslagna);
  const filtrerade = useMemo(
    () => filtreraForeningarPaSok(sammanslagna, sok),
    [sammanslagna, sok],
  );
  const kvarAttSkriva = Math.max(
    0,
    MIN_SOK_BOKSTAVER_EFTER_BRF - hamtaSokSuffix(sok).length,
  );

  useEffect(() => {
    if (valdForening || vantarPaSok) {
      setServerTraffar([]);
      setServerSokLaddar(false);
      return;
    }
    const reqId = ++sokReqId.current;
    setServerSokLaddar(true);
    const timer = window.setTimeout(() => {
      void sokForeningarForMedlem(sok).then((traffar) => {
        if (reqId !== sokReqId.current) return;
        setServerTraffar(traffar);
        setServerSokLaddar(false);
      });
    }, 280);
    return () => window.clearTimeout(timer);
  }, [sok, vantarPaSok, valdForening]);

  if (valdForening) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-primary/30 bg-[#eef6f0] px-4 py-3 text-sm">
          <p className="font-semibold text-primary-dark">{valdForening.namn}</p>
          <p className="mt-1 text-muted">
            Fyll i formuläret nedan. Styrelsen och förvaltaren ser ärendet —
            inte andra medlemmar.
          </p>
          {!foreningIdFranUrl ? (
            <button
              type="button"
              onClick={() => setValdForening(null)}
              className="mt-2 text-xs font-medium text-primary-dark underline hover:no-underline"
            >
              Byt förening
            </button>
          ) : null}
        </div>
        <MedlemFelanmalanForm foreningId={valdForening.id} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {urlFel ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          {urlFel}
        </p>
      ) : null}

      <label className="block text-sm">
        <span className="font-medium text-foreground">Sök er förening</span>
        <input
          value={sok}
          onChange={(e) => setSok(normaliseraBrfSoktext(e.target.value))}
          className="mt-1 w-full rounded-lg border border-border px-3 py-2.5"
          placeholder="Brf …"
          autoComplete="off"
        />
      </label>
      <p className="text-xs text-muted">
        {vantarPaSok
          ? `Skriv ${kvarAttSkriva} bokstav${kvarAttSkriva === 1 ? "" : "er"} till efter Brf`
          : serverSokLaddar
            ? "Söker på servern …"
            : "Välj er förening — ingen lista visas utan sökning."}
      </p>

      <ul className="space-y-2">
        {filtrerade.map((f) => (
          <li key={f.id}>
            <button
              type="button"
              onClick={() => setValdForening({ id: f.id, namn: f.namn })}
              className="w-full rounded-xl border border-border bg-white px-4 py-3 text-left text-sm font-medium text-foreground hover:border-primary/40 hover:bg-[#eef6f0]"
            >
              {f.namn}
            </button>
          </li>
        ))}
        {!vantarPaSok && !serverSokLaddar && filtrerade.length === 0 ? (
          <li className="text-sm text-muted">Ingen träff — kontrollera stavningen.</li>
        ) : null}
      </ul>

      <p className="border-t border-border pt-4 text-xs text-muted">
        Styrelse eller förvaltare?{" "}
        <Link
          href={TEST_LOGIN_PATH}
          className="font-medium text-primary-dark underline hover:no-underline"
        >
          Logga in till testperiod
        </Link>
        {" · "}
        <Link href="/kund-login" className="font-medium text-primary-dark underline hover:no-underline">
          Logga in som kund
        </Link>
      </p>
    </div>
  );
}

export function MedlemFelanmalanPortal() {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-muted">Laddar medlemsportal …</p>
      }
    >
      <MedlemFelanmalanPortalInre />
    </Suspense>
  );
}
