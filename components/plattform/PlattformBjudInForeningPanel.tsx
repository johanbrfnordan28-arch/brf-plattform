"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  HUVUDSIDA_MASSA_QUERY,
  MASSA_PATH,
} from "@/lib/massa-lank";
import type { InbjudanTexter } from "@/lib/inbjudan-texter";

const MALL_HJALP =
  "Platshållare: {foreningsNamn}, {kontaktperson}, {avsandareNamn}, {massaNamn}, {lank}, {hälsning}";

type Flik = "personlig" | "mallar" | "massa" | "texter";

type InbjudanMall = {
  id: string;
  agareEpost: string;
  titel: string;
  avsandareNamn: string;
  mejlAmne: string;
  mejlMall: string;
  arStandard: boolean;
  kanRedigera: boolean;
};

const TOM_MALL_FORM = {
  titel: "",
  avsandareNamn: "",
  mejlAmne: "",
  mejlMall: "",
  arStandard: false,
};

export function PlattformBjudInForeningPanel() {
  const [flik, setFlik] = useState<Flik>("personlig");
  const [basUrl, setBasUrl] = useState("");
  const [demoLage, setDemoLage] = useState(false);
  const [inloggadEpost, setInloggadEpost] = useState("");

  const [foreningsNamn, setForeningsNamn] = useState("");
  const [kontaktperson, setKontaktperson] = useState("");
  const [epost, setEpost] = useState("");
  const [avsandareNamn, setAvsandareNamn] = useState("");
  const [valdMallId, setValdMallId] = useState("");
  const [skickar, setSkickar] = useState(false);

  const [mallar, setMallar] = useState<InbjudanMall[]>([]);
  const [redigerarMallId, setRedigerarMallId] = useState<string | null>(null);
  const [mallForm, setMallForm] = useState(TOM_MALL_FORM);
  const [spararMall, setSpararMall] = useState(false);

  const [texter, setTexter] = useState<InbjudanTexter | null>(null);
  const [spararTexter, setSpararTexter] = useState(false);

  const [meddelande, setMeddelande] = useState<string | null>(null);
  const [fel, setFel] = useState<string | null>(null);

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

  const laddaMallar = useCallback(async () => {
    const res = await fetch("/api/plattform/inbjudan-mallar");
    if (!res.ok) return;
    const data = (await res.json()) as {
      mallar: InbjudanMall[];
      demoLage?: boolean;
    };
    setMallar(data.mallar ?? []);
    if (data.demoLage) setDemoLage(true);
  }, []);

  useEffect(() => {
    setBasUrl(window.location.origin);
    void fetch("/api/auth/session")
      .then((r) => r.json())
      .then((s: { epost?: string }) => setInloggadEpost(s.epost ?? ""))
      .catch(() => null);
    void laddaTexter();
    void laddaMallar();
  }, [laddaTexter, laddaMallar]);

  useEffect(() => {
    if (valdMallId || mallar.length === 0) return;
    const minStandard = mallar.find(
      (m) => m.arStandard && m.agareEpost === inloggadEpost,
    );
    const minForsta = mallar.find((m) => m.agareEpost === inloggadEpost);
    const val = minStandard ?? minForsta;
    if (val) {
      setValdMallId(val.id);
      if (val.avsandareNamn) setAvsandareNamn(val.avsandareNamn);
    }
  }, [mallar, inloggadEpost, valdMallId]);

  function valjMall(mallId: string) {
    setValdMallId(mallId);
    const mall = mallar.find((m) => m.id === mallId);
    if (mall?.avsandareNamn) setAvsandareNamn(mall.avsandareNamn);
  }

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
          mallId: valdMallId || undefined,
        }),
      });
      const data = (await res.json()) as {
        fel?: string;
        meddelande?: string;
        mejlVia?: string;
      };
      if (!res.ok) throw new Error(data.fel ?? "Kunde inte skicka.");
      setMeddelande(
        data.meddelande ??
          (data.mejlVia === "resend" || data.mejlVia === "smtp"
            ? "Inbjudan skickad."
            : "Inbjudan registrerad."),
      );
      setForeningsNamn("");
      setKontaktperson("");
      setEpost("");
      void laddaMallar();
    } catch (error) {
      setFel(error instanceof Error ? error.message : "Något gick fel.");
    } finally {
      setSkickar(false);
    }
  }

  function startaNyMall() {
    setRedigerarMallId(null);
    setMallForm({
      titel: "",
      avsandareNamn: "",
      mejlAmne: texter?.personligMejlAmne ?? "",
      mejlMall: texter?.personligMejlMall ?? "",
      arStandard: mallar.every((m) => m.agareEpost !== inloggadEpost),
    });
    setFlik("mallar");
  }

  function startaRedigeraMall(mall: InbjudanMall) {
    setRedigerarMallId(mall.id);
    setMallForm({
      titel: mall.titel,
      avsandareNamn: mall.avsandareNamn,
      mejlAmne: mall.mejlAmne,
      mejlMall: mall.mejlMall,
      arStandard: mall.arStandard,
    });
  }

  async function sparaMall(e: FormEvent) {
    e.preventDefault();
    setFel(null);
    setMeddelande(null);
    setSpararMall(true);
    try {
      const arRedigering = Boolean(redigerarMallId);
      const res = await fetch("/api/plattform/inbjudan-mallar", {
        method: arRedigering ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          arRedigering
            ? { id: redigerarMallId, ...mallForm }
            : mallForm,
        ),
      });
      const data = (await res.json()) as { fel?: string; mall?: InbjudanMall };
      if (!res.ok) throw new Error(data.fel ?? "Kunde inte spara mall.");
      setMeddelande(arRedigering ? "Mallen är uppdaterad." : "Mall sparad.");
      setRedigerarMallId(null);
      setMallForm(TOM_MALL_FORM);
      await laddaMallar();
      if (data.mall) {
        setValdMallId(data.mall.id);
        if (data.mall.avsandareNamn) setAvsandareNamn(data.mall.avsandareNamn);
      }
    } catch (error) {
      setFel(error instanceof Error ? error.message : "Något gick fel.");
    } finally {
      setSpararMall(false);
    }
  }

  async function taBortMall(id: string) {
    if (!window.confirm("Ta bort mallen?")) return;
    setFel(null);
    try {
      const res = await fetch(
        `/api/plattform/inbjudan-mallar?id=${encodeURIComponent(id)}`,
        { method: "DELETE" },
      );
      const data = (await res.json()) as { fel?: string };
      if (!res.ok) throw new Error(data.fel ?? "Kunde inte ta bort.");
      if (valdMallId === id) setValdMallId("");
      await laddaMallar();
      setMeddelande("Mallen är borttagen.");
    } catch (error) {
      setFel(error instanceof Error ? error.message : "Något gick fel.");
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
      setMeddelande("Texterna är sparade — gäller mässa och som utgångspunkt för nya mallar.");
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

  const massaLank = basUrl ? `${basUrl}${HUVUDSIDA_MASSA_QUERY}` : "";
  const massaQrLank = basUrl ? `${basUrl}${MASSA_PATH}` : "";

  const minaMallar = mallar.filter((m) => m.agareEpost === inloggadEpost);
  const teamMallar = mallar.filter((m) => m.agareEpost !== inloggadEpost);

  return (
    <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-foreground">Bjud in föreningar</h2>
      <p className="mt-1 text-sm text-muted">
        Skapa en personlig mall, skicka inbjudan till en namngiven person, eller
        dela mäss-länk till huvudsidan.
      </p>

      {demoLage ? (
        <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
          Demoläge — mallar och inbjudningar sparas när DATABASE_URL är satt.
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {(
          [
            ["personlig", "Skicka inbjudan"],
            ["mallar", "Mina mallar"],
            ["massa", "Styrelsemässa"],
            ["texter", "Mäss-texter"],
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
            Välj din sparade mall och skicka till mottagaren. Mejlet länkar till
            huvudsidan.
          </p>

          <label className="block text-sm">
            <span className="font-medium">Inbjudningsmall</span>
            <select
              value={valdMallId}
              onChange={(e) => valjMall(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2"
            >
              <option value="">Global standard (under Mäss-texter)</option>
              {minaMallar.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.titel}
                  {m.arStandard ? " ★" : ""}
                </option>
              ))}
              {teamMallar.length > 0 ? (
                <optgroup label="Kollegors mallar">
                  {teamMallar.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.titel} ({m.agareEpost})
                    </option>
                  ))}
                </optgroup>
              ) : null}
            </select>
          </label>

          <button
            type="button"
            onClick={startaNyMall}
            className="text-sm font-medium text-primary-dark underline"
          >
            + Skapa ny personlig mall
          </button>

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
              value={avsandareNamn}
              onChange={(e) => setAvsandareNamn(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2"
              placeholder="Fylls i från mall om du lämnar tomt"
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

      {flik === "mallar" ? (
        <div className="mt-5 space-y-6">
          <p className="text-sm text-muted">
            Varje person skapar egna mallar. Alla i teamet kan använda varandras
            mallar — men bara ägaren kan redigera sin egen.
          </p>

          {mallar.length > 0 ? (
            <ul className="space-y-2">
              {mallar.map((mall) => (
                <li
                  key={mall.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <div>
                    <span className="font-medium">{mall.titel}</span>
                    {mall.arStandard ? (
                      <span className="ml-2 text-xs text-primary-dark">★ standard</span>
                    ) : null}
                    <div className="text-xs text-muted">{mall.agareEpost}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        valjMall(mall.id);
                        setFlik("personlig");
                      }}
                      className="text-xs font-medium text-primary-dark underline"
                    >
                      Använd
                    </button>
                    {mall.kanRedigera ? (
                      <>
                        <button
                          type="button"
                          onClick={() => startaRedigeraMall(mall)}
                          className="text-xs font-medium underline"
                        >
                          Redigera
                        </button>
                        <button
                          type="button"
                          onClick={() => void taBortMall(mall.id)}
                          className="text-xs font-medium text-red-700 underline"
                        >
                          Ta bort
                        </button>
                      </>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">Inga sparade mallar ännu.</p>
          )}

          <form onSubmit={(e) => void sparaMall(e)} className="space-y-3 rounded-xl border border-dashed border-primary/30 bg-[#fafcfa] p-4">
            <h3 className="font-semibold text-foreground">
              {redigerarMallId ? "Redigera mall" : "Ny personlig mall"}
            </h3>
            <p className="text-xs text-muted">{MALL_HJALP}</p>
            <label className="block text-sm">
              <span className="font-medium">Mallnamn</span>
              <input
                required
                value={mallForm.titel}
                onChange={(e) =>
                  setMallForm((f) => ({ ...f, titel: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-border px-3 py-2"
                placeholder="T.ex. Johans inbjudan till BRF"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Ditt namn i mejlet (avsändare)</span>
              <input
                value={mallForm.avsandareNamn}
                onChange={(e) =>
                  setMallForm((f) => ({ ...f, avsandareNamn: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-border px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Mejlamne</span>
              <input
                required
                value={mallForm.mejlAmne}
                onChange={(e) =>
                  setMallForm((f) => ({ ...f, mejlAmne: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-border px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Mejltext</span>
              <textarea
                required
                rows={8}
                value={mallForm.mejlMall}
                onChange={(e) =>
                  setMallForm((f) => ({ ...f, mejlMall: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 font-mono text-xs"
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={mallForm.arStandard}
                onChange={(e) =>
                  setMallForm((f) => ({ ...f, arStandard: e.target.checked }))
                }
              />
              Använd som min standardmall
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={spararMall}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {spararMall ? "Sparar…" : redigerarMallId ? "Uppdatera mall" : "Spara mall"}
              </button>
              {redigerarMallId ? (
                <button
                  type="button"
                  onClick={() => {
                    setRedigerarMallId(null);
                    setMallForm(TOM_MALL_FORM);
                  }}
                  className="rounded-lg border border-border px-4 py-2 text-sm"
                >
                  Avbryt
                </button>
              ) : null}
            </div>
          </form>
        </div>
      ) : null}

      {flik === "massa" ? (
        <div className="mt-5 space-y-4 text-sm">
          <p className="text-muted">
            Efter styrelsemässan: dela länken muntligt, QR eller mejla via
            formuläret på huvudsidan.
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
        </div>
      ) : null}

      {flik === "texter" && texter ? (
        <form onSubmit={(e) => void sparaTexter(e)} className="mt-5 space-y-4">
          <p className="text-sm text-muted">
            Globala texter för mässa och som utgångspunkt när nya personliga mallar
            skapas.
          </p>
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
            <span className="font-medium">Global mejlamne (personlig inbjudan)</span>
            <input
              value={texter.personligMejlAmne}
              onChange={(e) =>
                uppdateraText("personligMejlAmne", e.target.value)
              }
              className="mt-1 w-full rounded-lg border border-border px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Global mejltext (personlig inbjudan)</span>
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
