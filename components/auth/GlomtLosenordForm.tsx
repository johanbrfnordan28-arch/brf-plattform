"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { hamtaKontoKontext } from "@/lib/auth/konto-kontext";
import { begärLokalAterstallning } from "@/lib/auth/lokal-aterstallning";

export function GlomtLosenordForm() {
  const [epost, setEpost] = useState("");
  const [fel, setFel] = useState<string | null>(null);
  const [meddelande, setMeddelande] = useState<string | null>(null);
  const [lokalLank, setLokalLank] = useState<string | null>(null);
  const [laddar, setLaddar] = useState(false);

  useEffect(() => {
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
    setLokalLank(null);
    setLaddar(true);
    try {
      const res = await fetch("/api/auth/glomt-losenord", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ epost }),
      });
      const data = (await res.json()) as { fel?: string; meddelande?: string; aterstallningsLank?: string };

      if (res.ok) {
        setMeddelande(
          data.meddelande ||
            "Om kontot finns skickas en återställningslänk till e-postadressen.",
        );
        if (data.aterstallningsLank) {
          setLokalLank(data.aterstallningsLank);
        }
        return;
      }

      // Demoläge utan databas — lokal återställning + mejl om Resend finns
      if (res.status === 503 || /databas/i.test(data.fel || "")) {
        const lokal = begärLokalAterstallning(epost);
        if (!lokal.ok) {
          setFel(lokal.fel);
          return;
        }
        if (lokal.lank) {
          setLokalLank(lokal.lank);
          try {
            const mejlRes = await fetch("/api/auth/glomt-losenord", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                epost,
                aterstallningsLank: lokal.lank,
              }),
            });
            const mejlData = (await mejlRes.json()) as {
              meddelande?: string;
              mejlVia?: string;
            };
            if (mejlRes.ok && mejlData.mejlVia === "resend") {
              setMeddelande(
                mejlData.meddelande ||
                  "Återställningslänken har skickats till din e-post.",
              );
            } else {
              setMeddelande(lokal.meddelande);
            }
          } catch {
            setMeddelande(lokal.meddelande);
          }
        } else {
          setMeddelande(lokal.meddelande);
        }
        return;
      }

      setFel(data.fel || "Kunde inte skicka återställning.");
    } catch {
      const lokal = begärLokalAterstallning(epost);
      if (!lokal.ok) {
        setFel(lokal.fel);
      } else {
        setMeddelande(lokal.meddelande);
        if (lokal.lank) setLokalLank(lokal.lank);
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
        Ange e-postadressen som användes när föreningen skapades. Du får en länk
        för att välja nytt lösenord — använd detta om du inte kan logga in. Redan
        inne i föreningen? Gå till{" "}
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
      {lokalLank ? (
        <div className="rounded-lg border border-border bg-surface p-3">
          <p className="text-xs font-medium text-foreground">
            Din återställningslänk
          </p>
          <p className="mt-1 break-all text-xs text-primary-dark">{lokalLank}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Link
              href={lokalLank}
              className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              Öppna länken
            </Link>
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard.writeText(lokalLank);
              }}
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium"
            >
              Kopiera
            </button>
          </div>
        </div>
      ) : null}
      <button
        type="submit"
        disabled={laddar}
        className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
      >
        {laddar ? "Skickar …" : "Skicka återställningslänk"}
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
