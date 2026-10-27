"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { hamtaKontoKontext } from "@/lib/auth/konto-kontext";
import {
  begärLokaltNyttLosenord,
  sparaNyttLosenordFranServer,
} from "@/lib/auth/lokal-aterstallning";
import { hamtaLokalKonto } from "@/lib/auth/lokal-konto";
import {
  mejlLeveransMeddelande,
  mejlSkickades,
} from "@/lib/auth/mejl-konfiguration";
import { lasForeningProfil } from "@/lib/forening-registry";

export function GlomtLosenordForm() {
  const [epost, setEpost] = useState("");
  const [fel, setFel] = useState<string | null>(null);
  const [meddelande, setMeddelande] = useState<string | null>(null);
  const [losenord, setLosenord] = useState<string | null>(null);
  const [laddar, setLaddar] = useState(false);

  useEffect(() => {
    const franLank = new URLSearchParams(window.location.search)
      .get("epost")
      ?.trim();
    if (franLank) setEpost(franLank);
    void hamtaKontoKontext().then((kontext) => {
      if (kontext?.epost) {
        setEpost((nu) => nu || kontext.epost);
      }
    });
  }, []);

  async function skicka(e: React.FormEvent) {
    e.preventDefault();
    setFel(null);
    setMeddelande(null);
    setLosenord(null);
    setLaddar(true);

    const lokalKonto = hamtaLokalKonto(epost);
    const profil = lasForeningProfil(lokalKonto?.foreningId);

    try {
      const res = await fetch("/api/auth/glomt-losenord", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          epost,
          namn: lokalKonto?.namn || profil?.kontaktperson,
          foreningsNamn: profil?.namn,
        }),
      });
      const data = (await res.json()) as {
        fel?: string;
        meddelande?: string;
        tillfalligtLosenord?: string;
        mejlVia?: string;
      };

      if (data.tillfalligtLosenord) {
        sparaNyttLosenordFranServer(
          epost,
          data.tillfalligtLosenord,
          lokalKonto?.foreningId || profil?.id,
          lokalKonto?.namn,
        );
        setLosenord(data.tillfalligtLosenord);
        setMeddelande(
          data.meddelande || mejlLeveransMeddelande(data.mejlVia || ""),
        );
        return;
      }

      if (res.ok) {
        const lokal = begärLokaltNyttLosenord(epost);
        if (lokal.ok) {
          setLosenord(lokal.losenord);
          setMeddelande(
            mejlSkickades(data.mejlVia || "")
              ? data.meddelande || lokal.meddelande
              : `${lokal.meddelande} ${data.meddelande || ""}`.trim(),
          );
          return;
        }
        setMeddelande(
          data.meddelande ||
            "Om kontot finns skickas ett nytt tillfälligt lösenord till e-postadressen.",
        );
        return;
      }

      if (res.status === 503 || /databas/i.test(data.fel || "")) {
        const lokal = begärLokaltNyttLosenord(epost);
        if (!lokal.ok) {
          setFel(lokal.fel);
          return;
        }
        setLosenord(lokal.losenord);
        setMeddelande(lokal.meddelande);
        return;
      }

      setFel(data.fel || "Kunde inte skicka nytt lösenord.");
    } catch {
      const lokal = begärLokaltNyttLosenord(epost);
      if (!lokal.ok) {
        setFel(lokal.fel);
      } else {
        setLosenord(lokal.losenord);
        setMeddelande(lokal.meddelande);
      }
    } finally {
      setLaddar(false);
    }
  }

  return (
    <form
      onSubmit={skicka}
      className="mx-auto max-w-md space-y-4 rounded-2xl border border-border bg-white p-6 shadow-sm"
    >
      <h1 className="text-xl font-bold text-foreground">Glömt lösenord</h1>
      <p className="text-sm text-muted">
        Ange e-postadressen som användes när föreningen skapades. Ett nytt
        tillfälligt lösenord skickas till mejlen. Du behöver inte det gamla
        lösenordet. Redan inne i föreningen? Gå till{" "}
        <Link href="/forening/konto" className="font-medium underline">
          Konto → Byt lösenord
        </Link>
        .
      </p>
      <label className="block text-sm">
        <span className="font-medium">E-post</span>
        <input
          type="email"
          value={epost}
          onChange={(e) => setEpost(e.target.value)}
          className="mt-1 w-full rounded-lg border border-border px-3 py-2"
          required
          autoComplete="email"
        />
      </label>
      {fel ? (
        <p
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {fel}
        </p>
      ) : null}
      {meddelande ? (
        <p
          className="rounded-lg border border-primary/30 bg-[#eef6f0] px-3 py-2 text-sm text-primary-dark"
          role="status"
        >
          {meddelande}
        </p>
      ) : null}
      {losenord ? (
        <div className="rounded-lg border border-border bg-surface p-3">
          <p className="text-xs font-medium text-foreground">
            Ditt tillfälliga lösenord
          </p>
          <code className="mt-1 block break-all font-mono text-sm text-foreground">
            {losenord}
          </code>
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard.writeText(losenord);
            }}
            className="mt-2 text-sm font-medium text-primary-dark underline"
          >
            Kopiera
          </button>
        </div>
      ) : null}
      <button
        type="submit"
        disabled={laddar}
        className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
      >
        {laddar ? "Skickar …" : "Skicka nytt lösenord"}
      </button>
      <Link
        href="/styrelse-login"
        className="block text-sm text-primary-dark underline"
      >
        Tillbaka till inloggning
      </Link>
    </form>
  );
}
