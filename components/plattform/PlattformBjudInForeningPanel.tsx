"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  HUVUDSIDA_MASSA_QUERY,
  MASSA_PATH,
} from "@/lib/massa-lank";
import type { InbjudanTexter } from "@/lib/inbjudan-texter";

const MALL_HJALP =
  "Platshållare: {foreningsNamn}, {kontaktperson}, {avsandareNamn}, {massaNamn}, {lank}, {hälsning}";

type Flik = "personlig" | "massa" | "texter";

export function PlattformBjudInForeningPanel() {
  const [flik, setFlik] = useState<Flik>("personlig");
  const [basUrl, setBasUrl] = useState("");
  const [demoLage, setDemoLage] = useState(false);

  const [foreningsNamn, setForeningsNamn] = useState("");
  const [kontaktperson, setKontaktperson] = useState("");
  const [epost, setEpost] = useState("");
  const [avsandareNamn, setAvsandareNamn] = useState("");
  const [skickar, setSkickar] = useState(false);
  const [meddelande, setMeddelande] = useState<string | null>(null);
  const [fel, setFel] = useState<string | null>(null);

  const [texter, setTexter] = useState<InbjudanTexter | null>(null);
  const [spararTexter, setSpararTexter] = useState(false);

  const laddaTexter = useCallback(async () => {
    const res = await fetch("/api/plattform/inbjudan-texter");
    if (!res.ok) return;
    const data = (await res.json()) as {
      texter: InbjudanTexter;
      demoLage?: boolean;
    };
    setTexter(data.texter);
    setDemoLage(Boolean(data.demoLage));
  }, []);

  useEffect(() => {
    setBasUrl(window.location.origin);
    void laddaTexter();
  }, [laddaTexter]);

  const massaLank = basUrl ? `${basUrl}${HUVUDSIDA_MASSA_QUERY}` : "";
  const massaQrLank = basUrl ? `${basUrl}${MASSA_PATH}` : "";
  const inbjudanLank = basUrl ? `${basUrl}/?kalla=inbjudan` : "";

  async function skickaPersonlig(e: FormEvent) {
    e.preventDefault();
    setFel(null);
    setMeddelande(null);
    setSkickar(true);
    try {
      const res = await fetch("/api/plattform/bjud-in-forening", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          foreningsNamn,
          kontaktperson,
          epost,
          avsandareNamn,
        }),
      });
      const data = (await res.json()) as { fel?: string; meddelande?: string };
      if (!res.ok) throw new Error(data.fel ?? "Kunde inte skicka.");
      setMeddelande(data.meddelande ?? "Inbjudan skickad.");
      setForeningsNamn("");
      setKontaktperson("");
      setEpost("");
    } catch (error) {
      setFel(error instanceof Error ? error.message : "Något gick fel.");
    } finally {
      setSkickar(false);
    }
  }

  async function sparaTexter(e: FormEvent) {
    e.preventDefault();
    if (!texter) return;
    setFel(null);
    setMeddelande(null);
    setSpararTexter(true);
    try {
      const res = await fetch("/api/plattform/inbjudan-texter", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texter }),
      });
      const data = (await res.json()) as {
        fel?: string;
        texter?: InbjudanTexter;
      };
      if (!res.ok) throw new Error(data.fel ?? "Kunde inte spara.");
      if (data.texter) setTexter(data.texter);
      setMeddelande("Texterna är sparade — gäller nästa mejl och huvudsidan.");
    } catch (error) {
      setFel(error instanceof Error ? error.message : "Något gick fel.");
    } finally {
      setSpararTexter(false);
    }
  }

  function kopiera(text: string) {
    void navigator.clipboard.writeText(text);
    setMeddelande("Länken är kopierad.");
  }

  function uppdateraText<K extends keyof InbjudanTexter>(
    nyckel: K,
    varde: InbjudanTexter[K],
  ) {
    setTexter((t) => (t ? { ...t, [nyckel]: varde } : t));
  }

  return (
    <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-foreground">Bjud in föreningar</h2>
      <p className="mt-1 text-sm text-muted">
        Skicka inbjudan till en namngiven person, eller dela mäss-länk så
        föreningar kommer till huvudsidan och kan bedöma intresset.
      </p>

      {demoLage ? (
        <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
          Demoläge — personliga inbjudningar mejlas men sparas inte i listan
          förrän DATABASE_URL är satt.
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {(
          [
            ["personlig", "Personlig inbjudan"],
            ["massa", "Styrelsemässa"],
            ["texter", "Texter"],
          ] as const
        ).map(([id, etikett]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFlik(id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              flik === id
                ? "bg-primary text-white"
                : "border border-border bg-white text-foreground"
            }`}
          >
            {etikett}
          </button>
        ))}
      </div>

      {fel ? (
        <p className="mt-3 text-sm text-red-700" role="alert">
          {fel}
        </p>
      ) : null}
      {meddelande ? (
        <p className="mt-3 text-sm text-primary-dark" role="status">
          {meddelande}
        </p>
      ) : null}

      {flik === "personlig" ? (
        <form onSubmit={(e) => void skickaPersonlig(e)} className="mt-5 space-y-3">
          <p className="text-sm text-muted">
            Mejla en inbjudan från en namngiven person. Mottagaren kommer till
            huvudsidan via länken i mejlet.
          </p>
          <label className="block text-sm">
            <span className="font-medium">Föreningens namn</span>
            <input
              required
              value={foreningsNamn}
              onChange={(e) => setForeningsNamn(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2"
              placeholder="Brf Exempel 1"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Mottagarens namn</span>
            <input
              value={kontaktperson}
              onChange={(e) => setKontaktperson(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Mottagarens e-post</span>
            <input
              required
              type="email"
              value={epost}
              onChange={(e) => setEpost(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Inbjudan från (namn i mejlet)</span>
            <input
              required
              value={avsandareNamn}
              onChange={(e) => setAvsandareNamn(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2"
              placeholder="Johan, Styrelse-Navet"
            />
          </label>
          <button
            type="submit"
            disabled={skickar}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {skickar ? "Skickar…" : "Skicka inbjudan"}
          </button>
        </form>
      ) : null}

      {flik === "massa" ? (
        <div className="mt-5 space-y-4 text-sm">
          <p className="text-muted">
            Efter styrelsemässan: dela länken muntligt, QR eller mejla via
            formuläret på huvudsidan. Besökare landar på huvudsidan och ser
            välkomsttexten.
          </p>
          <div className="rounded-xl border border-border bg-[#fafcfa] p-4">
            <p className="font-medium text-foreground">Länk till huvudsidan (mässa)</p>
            <p className="mt-1 break-all font-mono text-xs text-muted">
              {massaLank || "—"}
            </p>
            {massaLank ? (
              <button
                type="button"
                onClick={() => kopiera(massaLank)}
                className="mt-2 text-sm font-medium text-primary-dark underline"
              >
                Kopiera länk
              </button>
            ) : null}
          </div>
          <div className="rounded-xl border border-border bg-[#fafcfa] p-4">
            <p className="font-medium text-foreground">Kort QR-länk (/massa)</p>
            <p className="mt-1 break-all font-mono text-xs text-muted">
              {massaQrLank || "—"}
            </p>
            {massaQrLank ? (
              <button
                type="button"
                onClick={() => kopiera(massaQrLank)}
                className="mt-2 text-sm font-medium text-primary-dark underline"
              >
                Kopiera QR-länk
              </button>
            ) : null}
          </div>
          <div className="rounded-xl border border-dashed border-primary/30 bg-[#eef6f0]/50 p-4">
            <p className="font-medium text-foreground">«Mejla mig en länk»</p>
            <p className="mt-1 text-muted">
              Finns på huvudsidan och skickar mejl med länk till huvudsidan —
              bra när föreningen vill fundera hemma.
            </p>
          </div>
        </div>
      ) : null}

      {flik === "texter" && texter ? (
        <form onSubmit={(e) => void sparaTexter(e)} className="mt-5 space-y-4">
          <p className="text-xs text-muted">{MALL_HJALP}</p>
          <label className="block text-sm">
            <span className="font-medium">Mässans namn</span>
            <input
              value={texter.massaNamn}
              onChange={(e) => uppdateraText("massaNamn", e.target.value)}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Rubrik på huvudsidan (mässa)</span>
            <input
              value={texter.massaHuvudsidaRubrik}
              onChange={(e) =>
                uppdateraText("massaHuvudsidaRubrik", e.target.value)
              }
              className="mt-1 w-full rounded-lg border border-border px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Intro på huvudsidan (mässa)</span>
            <textarea
              rows={3}
              value={texter.massaHuvudsidaIntro}
              onChange={(e) =>
                uppdateraText("massaHuvudsidaIntro", e.target.value)
              }
              className="mt-1 w-full rounded-lg border border-border px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Mejlamne (mässa / mejla länk)</span>
            <input
              value={texter.massaMejlAmne}
              onChange={(e) => uppdateraText("massaMejlAmne", e.target.value)}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Mejltext (mässa / mejla länk)</span>
            <textarea
              rows={8}
              value={texter.massaMejlMall}
              onChange={(e) => uppdateraText("massaMejlMall", e.target.value)}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 font-mono text-xs"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Mejlamne (personlig inbjudan)</span>
            <input
              value={texter.personligMejlAmne}
              onChange={(e) =>
                uppdateraText("personligMejlAmne", e.target.value)
              }
              className="mt-1 w-full rounded-lg border border-border px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Mejltext (personlig inbjudan)</span>
            <textarea
              rows={8}
              value={texter.personligMejlMall}
              onChange={(e) =>
                uppdateraText("personligMejlMall", e.target.value)
              }
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 font-mono text-xs"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Rubrik «Mejla mig en länk»</span>
            <input
              value={texter.mejlaLankRubrik}
              onChange={(e) => uppdateraText("mejlaLankRubrik", e.target.value)}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Intro «Mejla mig en länk»</span>
            <textarea
              rows={2}
              value={texter.mejlaLankIntro}
              onChange={(e) => uppdateraText("mejlaLankIntro", e.target.value)}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2"
            />
          </label>
          <button
            type="submit"
            disabled={spararTexter}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {spararTexter ? "Sparar…" : "Spara texter"}
          </button>
        </form>
      ) : null}

      {flik === "texter" && !texter ? (
        <p className="mt-4 text-sm text-muted">Laddar texter…</p>
      ) : null}
    </section>
  );
}
