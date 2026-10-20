"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { navigeraTillNyForening } from "@/lib/skapa-forening-navigering";
import { skapaForeningMedKontoKlient } from "@/lib/auth/skapa-forening-klient";
import { sparaBackupTillServerBestEffort } from "@/lib/forening-backup";
import { STYRELSE_ROLLER } from "@/lib/styrelse-ledamot";
import {
  INTEGRITETSPOLICY_PATH,
  PUB_PATH,
  VILLKOR_PATH,
  VILLKOR_VERSION,
} from "@/lib/juridik";
import {
  arGrundmallForening,
  lasAktivForeningId,
  lasForeningProfil,
} from "@/lib/forening-registry";
import { TEST_LOGIN_PATH } from "@/lib/forening-kund";
import {
  MAX_LAGENHETER_VID_SKAPANDE,
  parseAntalLagenheter,
} from "@/lib/forening-start-data";

type Props = {
  kompakt?: boolean;
};

const BRF_PREFIX = "Brf ";

/**
 * Ett formulär, en knapp — skapa förening med namn, kontakt och e-post.
 */
export function SkapaForeningPanel({ kompakt = false }: Props) {
  const [namn, setNamn] = useState(BRF_PREFIX);
  const [skapareNamn, setSkapareNamn] = useState("");
  const [skapareEpost, setSkapareEpost] = useState("");
  const [skapareRoll, setSkapareRoll] = useState<string>("Ordförande");
  const [organisationsnummer, setOrganisationsnummer] = useState("");
  const [adresser, setAdresser] = useState<string[]>([""]);
  const [postnummer, setPostnummer] = useState("");
  const [ort, setOrt] = useState("");
  const [antalLagenheter, setAntalLagenheter] = useState("");
  const [antalVaningar, setAntalVaningar] = useState("");
  const [fel, setFel] = useState<string | null>(null);
  const [redanSkapadNamn, setRedanSkapadNamn] = useState<string | null>(null);
  const [losenSkickas, setLosenSkickas] = useState(false);
  const [losenSkickad, setLosenSkickad] = useState<string | null>(null);
  const [nyttLosenord, setNyttLosenord] = useState<string | null>(null);
  const [skapar, setSkapar] = useState(false);
  const [skapatNamn, setSkapatNamn] = useState<string | null>(null);
  const [losenInfo, setLosenInfo] = useState<{
    losenord: string;
    epost: string;
    mejlVia: string;
    meddelande: string;
  } | null>(null);
  const [skickarIgen, setSkickarIgen] = useState(false);
  const [skickaIgenMeddelande, setSkickaIgenMeddelande] = useState<string | null>(
    null,
  );
  const [skickaIgenFel, setSkickaIgenFel] = useState<string | null>(null);
  const checkboxRef = useRef<HTMLInputElement>(null);
  const villkorRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const skaFokuseraSkapa =
      window.location.hash === "#skapa-forening" ||
      new URLSearchParams(window.location.search).get("skapa") === "1";
    if (!skaFokuseraSkapa) return;
    const sektion = document.getElementById("skapa-forening");
    sektion?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => {
      document.getElementById("skapa-forening-namn")?.focus();
    }, 400);
  }, []);

  function arStyrelseBekraftat(): boolean {
    return Boolean(checkboxRef.current?.checked);
  }

  async function korSkapa(trimmatNamn: string) {
    setFel(null);
    setRedanSkapadNamn(null);
    setLosenSkickad(null);
    setNyttLosenord(null);
    setSkapatNamn(null);
    setLosenInfo(null);
    setSkapar(true);
    try {
      const aktivId = lasAktivForeningId();
      if (!arGrundmallForening(aktivId)) {
        await sparaBackupTillServerBestEffort(aktivId);
      }

      const resultat = await skapaForeningMedKontoKlient({
        foreningsNamn: trimmatNamn,
        skapareNamn,
        skapareEpost,
        skapareRoll,
        villkorVersion: VILLKOR_VERSION,
        startGrund: {
          organisationsnummer,
          adresser,
          postnummer,
          ort,
          antalLagenheter,
          antalVaningar,
        },
      });
      setSkapatNamn(resultat.profil.namn);
      if (resultat.tillfalligtLosenord) {
        setLosenInfo({
          losenord: resultat.tillfalligtLosenord,
          epost: resultat.epost,
          mejlVia: resultat.mejlVia,
          meddelande: resultat.meddelande,
        });
        setSkapar(false);
        return;
      }
      navigeraTillNyForening(resultat.profil);
      window.setTimeout(() => {
        if (window.location.pathname.includes("prova-gratis")) {
          setSkapar(false);
          setFel(
            "Sidan bytte inte automatiskt. Prova att ladda om sidan eller öppna /forening i en ny flik.",
          );
        }
      }, 4000);
    } catch (e) {
      const text = e instanceof Error ? e.message : "Kunde inte skapa föreningen.";
      if (/finns redan/i.test(text)) {
        setRedanSkapadNamn(trimmatNamn);
        setFel(null);
      } else {
        setFel(text);
      }
      setSkapar(false);
    }
  }

  function hanteraSkapa(event?: React.SyntheticEvent) {
    event?.preventDefault();
    const trimmatNamn = namn.trim();
    if (!arStyrelseBekraftat()) {
      setFel("Bocka i rutan: du tillhör styrelsen (eller har mandat).");
      return;
    }
    if (!villkorRef.current?.checked) {
      setFel(
        "Godkänn villkoren och personuppgiftsbiträdesavtalet för föreningens räkning.",
      );
      return;
    }
    if (!trimmatNamn || trimmatNamn.toLowerCase() === "brf") {
      setFel("Döp föreningen — t.ex. Brf Solsidan 1.");
      return;
    }
    if (!skapareNamn.trim()) {
      setFel("Ange ditt namn.");
      return;
    }
    if (!skapareEpost.trim() || !skapareEpost.includes("@")) {
      setFel("Ange en giltig e-postadress — dit skickas lösenordet.");
      return;
    }
    if (!organisationsnummer.trim()) {
      setFel("Ange föreningens organisationsnummer.");
      return;
    }
    if (!adresser.map((a) => a.trim()).some(Boolean)) {
      setFel("Ange minst en fastighetsadress.");
      return;
    }
    if (!postnummer.trim() || !ort.trim()) {
      setFel("Ange postnummer och ort.");
      return;
    }
    const antal = parseAntalLagenheter(antalLagenheter);
    if (antal < 1) {
      setFel("Ange antal lägenheter (minst 1).");
      return;
    }
    if (antal > MAX_LAGENHETER_VID_SKAPANDE) {
      setFel(
        `Ange högst ${MAX_LAGENHETER_VID_SKAPANDE} lägenheter vid skapandet.`,
      );
      return;
    }
    void korSkapa(trimmatNamn);
  }

  if (losenInfo) {
    return (
      <div className={`brf-panel-gron ${kompakt ? "p-5" : "p-6 sm:p-8"}`}>
        <h2 className="text-lg font-bold text-foreground sm:text-xl">
          {skapatNamn} är skapad
        </h2>
        <p className="mt-2 text-sm text-muted">{losenInfo.meddelande}</p>
        <div className="mt-4 rounded-lg border border-primary/30 bg-white p-4 text-sm">
          <p>
            <span className="font-medium">E-post:</span> {losenInfo.epost}
          </p>
          {losenInfo.losenord ? (
            <p className="mt-2">
              <span className="font-medium">Tillfälligt lösenord:</span>{" "}
              <code className="rounded bg-surface px-2 py-0.5 font-mono text-foreground">
                {losenInfo.losenord}
              </code>
            </p>
          ) : (
            <p className="mt-2 text-muted">
              Använd ditt befintliga lösenord (mejlet bekräftar kopplingen).
            </p>
          )}
          <p className="mt-2 text-xs text-muted">
            Lösenordet skickas också till e-posten. När du loggar in kan du spara
            det eller byta till ett eget under Konto.
          </p>
        </div>

        {losenInfo.losenord ? (
          <div className="mt-3">
            <button
              type="button"
              disabled={skickarIgen}
              onClick={async () => {
                setSkickaIgenFel(null);
                setSkickaIgenMeddelande(null);
                setSkickarIgen(true);
                try {
                  const res = await fetch("/api/auth/skicka-losenord", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      epost: losenInfo.epost,
                      losenord: losenInfo.losenord,
                      foreningsNamn: skapatNamn || "er förening",
                      genereraNytt: true,
                      arSkickaIgen: true,
                    }),
                  });
                  const data = (await res.json()) as {
                    fel?: string;
                    meddelande?: string;
                    tillfalligtLosenord?: string;
                  };

                  if (!res.ok) {
                    setSkickaIgenFel(
                      data.fel || "Kunde inte skicka lösenordet igen.",
                    );
                    return;
                  }

                  if (data.tillfalligtLosenord) {
                    const { hamtaLokalKonto, sparaLokalKonto } = await import(
                      "@/lib/auth/lokal-konto"
                    );
                    const konto = hamtaLokalKonto(losenInfo.epost);
                    if (konto) {
                      sparaLokalKonto({
                        ...konto,
                        losenord: data.tillfalligtLosenord,
                      });
                    }
                    setLosenInfo((prev) =>
                      prev
                        ? { ...prev, losenord: data.tillfalligtLosenord! }
                        : prev,
                    );
                  }

                  setSkickaIgenMeddelande(
                    data.meddelande ||
                      "Ett nytt tillfälligt lösenord har skickats till din e-post.",
                  );
                } catch (e) {
                  setSkickaIgenFel(
                    e instanceof Error
                      ? e.message
                      : "Kunde inte nå servern.",
                  );
                } finally {
                  setSkickarIgen(false);
                }
              }}
              className="text-sm font-medium text-primary-dark underline hover:no-underline disabled:opacity-50"
            >
              {skickarIgen
                ? "Skickar …"
                : "Skicka lösenordet igen via e-post"}
            </button>
            {skickaIgenMeddelande ? (
              <p className="mt-2 text-sm text-primary-dark" role="status">
                {skickaIgenMeddelande}
              </p>
            ) : null}
            {skickaIgenFel ? (
              <p className="mt-2 text-sm text-red-800" role="alert">
                {skickaIgenFel}
              </p>
            ) : null}
          </div>
        ) : null}

        <button
          type="button"
          className="brf-knapp-gron mt-4 px-6 py-3 text-base shadow-sm"
          onClick={() => {
            const profil = lasForeningProfil(lasAktivForeningId());
            if (profil) navigeraTillNyForening(profil);
            else window.location.href = "/forening";
          }}
        >
          Gå till föreningen
        </button>
        <Link
          href="/styrelse-login"
          className="mt-3 block text-sm font-medium text-primary-dark hover:underline"
        >
          Eller öppna inloggning
        </Link>
      </div>
    );
  }

  return (
    <div className={`brf-panel-gron ${kompakt ? "p-5" : "p-6 sm:p-8"}`}>
      <h2 className="text-lg font-bold text-foreground sm:text-xl">
        Skapa vår förening
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Ni får en egen sida med{" "}
        <strong className="text-foreground">ert föreningsnamn</strong>. Adress,
        org.nr och antal lägenheter sparas direkt och synkas till
        föreningsuppgifter, underhållsplan och lägenhetsregister. Ett tillfälligt
        lösenord skickas till din e-post.
      </p>
      <p className="mt-2 rounded-lg border border-amber-200/80 bg-amber-50/90 px-3 py-2 text-sm text-amber-950">
        <strong>Endast styrelsen</strong> ska skapa föreningens sida.
        Entreprenörer och medlemmar loggar in via länkar som styrelsen delar —
        inte genom att skapa en ny förening här.
      </p>

      <form onSubmit={hanteraSkapa} className="mt-4 space-y-4">
        <label className="block text-sm">
          <span className="font-medium text-foreground">Föreningens namn</span>
          <input
            id="skapa-forening-namn"
            type="text"
            value={namn}
            onChange={(e) => setNamn(e.target.value)}
            placeholder="t.ex. Brf Eken 12"
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-foreground"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            disabled={skapar}
          />
        </label>

        <label className="block text-sm">
          <span className="font-medium text-foreground">Ditt namn</span>
          <input
            type="text"
            value={skapareNamn}
            onChange={(e) => setSkapareNamn(e.target.value)}
            placeholder="För- och efternamn"
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-foreground"
            autoComplete="name"
            disabled={skapar}
          />
        </label>

        <label className="block text-sm">
          <span className="font-medium text-foreground">Din e-post</span>
          <input
            type="email"
            value={skapareEpost}
            onChange={(e) => setSkapareEpost(e.target.value)}
            placeholder="namn@exempel.se"
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-foreground"
            autoComplete="email"
            disabled={skapar}
          />
          <span className="mt-1 block text-xs text-muted">
            Hit skickas det tillfälliga lösenordet.
          </span>
        </label>

        <label className="block text-sm">
          <span className="font-medium text-foreground">Din roll i styrelsen</span>
          <select
            value={skapareRoll}
            onChange={(e) => setSkapareRoll(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-foreground"
            disabled={skapar}
          >
            {STYRELSE_ROLLER.map((roll) => (
              <option key={roll} value={roll}>
                {roll}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="font-medium text-foreground">Organisationsnummer</span>
          <input
            type="text"
            value={organisationsnummer}
            onChange={(e) => setOrganisationsnummer(e.target.value)}
            placeholder="t.ex. 769623-8166"
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-foreground"
            autoComplete="off"
            disabled={skapar}
          />
        </label>

        <div>
          <p className="text-sm font-medium text-foreground">Fastighetsadresser</p>
          <p className="mt-0.5 text-xs text-muted">
            En rad per husadress. Första adressen används som postadress.
          </p>
          <div className="mt-2 space-y-2">
            {adresser.map((adress, index) => (
              <div key={`skapa-adress-${index}`} className="flex gap-2">
                <input
                  type="text"
                  value={adress}
                  onChange={(e) => {
                    const nasta = [...adresser];
                    nasta[index] = e.target.value;
                    setAdresser(nasta);
                  }}
                  placeholder="t.ex. Storgatan 12"
                  className="min-w-0 flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground"
                  disabled={skapar}
                />
                {adresser.length > 1 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setAdresser((nu) => {
                        const nasta = nu.filter((_, i) => i !== index);
                        return nasta.length > 0 ? nasta : [""];
                      })
                    }
                    className="rounded-lg border border-border px-3 text-sm text-muted hover:text-foreground"
                    disabled={skapar}
                  >
                    Ta bort
                  </button>
                ) : null}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setAdresser((nu) => [...nu, ""])}
            className="mt-2 text-sm font-medium text-primary-dark hover:underline"
            disabled={skapar}
          >
            + Lägg till adress
          </button>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="font-medium text-foreground">Postnummer</span>
              <input
                type="text"
                value={postnummer}
                onChange={(e) => setPostnummer(e.target.value)}
                placeholder="123 45"
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-foreground"
                autoComplete="postal-code"
                disabled={skapar}
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-foreground">Ort</span>
              <input
                type="text"
                value={ort}
                onChange={(e) => setOrt(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-foreground"
                autoComplete="address-level2"
                disabled={skapar}
              />
            </label>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="font-medium text-foreground">Antal lägenheter</span>
            <input
              type="text"
              inputMode="numeric"
              value={antalLagenheter}
              onChange={(e) => setAntalLagenheter(e.target.value)}
              placeholder="t.ex. 24"
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-foreground"
              disabled={skapar}
            />
            <span className="mt-1 block text-xs text-muted">
              Skapas som tomma poster i lägenhetsregistret.
            </span>
          </label>
          <label className="block text-sm">
            <span className="font-medium text-foreground">Antal våningar</span>
            <input
              type="text"
              inputMode="numeric"
              value={antalVaningar}
              onChange={(e) => setAntalVaningar(e.target.value)}
              placeholder="t.ex. 4"
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-foreground"
              disabled={skapar}
            />
          </label>
        </div>

        <label className="flex cursor-pointer items-start gap-3 text-sm">
          <input
            ref={checkboxRef}
            type="checkbox"
            defaultChecked={false}
            disabled={skapar}
            className="mt-1 h-4 w-4 shrink-0 rounded border-border accent-[#5a9a6e]"
          />
          <span className="text-muted">
            Jag bekräftar att jag är styrelseledamot eller har styrelsens mandat
            att skapa föreningens sida.
          </span>
        </label>

        <label className="flex cursor-pointer items-start gap-3 text-sm">
          <input
            ref={villkorRef}
            type="checkbox"
            defaultChecked={false}
            disabled={skapar}
            className="mt-1 h-4 w-4 shrink-0 rounded border-border accent-[#5a9a6e]"
          />
          <span className="text-muted">
            Jag godkänner{" "}
            <Link
              href={VILLKOR_PATH}
              target="_blank"
              className="font-medium text-primary-dark underline hover:no-underline"
            >
              villkoren
            </Link>{" "}
            och{" "}
            <Link
              href={PUB_PATH}
              target="_blank"
              className="font-medium text-primary-dark underline hover:no-underline"
            >
              personuppgiftsbiträdesavtalet
            </Link>{" "}
            för föreningens räkning, och har läst{" "}
            <Link
              href={INTEGRITETSPOLICY_PATH}
              target="_blank"
              className="font-medium text-primary-dark underline hover:no-underline"
            >
              integritetspolicyn
            </Link>
            .
          </span>
        </label>

        {redanSkapadNamn ? (
          <div
            className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950"
            role="status"
          >
            <p className="font-semibold">
              {redanSkapadNamn} är redan skapad
            </p>
            <p className="mt-1">
              Logga in på den föreningen. Om lösenordet saknas skickar vi ett
              nytt till {skapareEpost.trim() || "e-posten ni angav"}.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href={`${TEST_LOGIN_PATH}?q=${encodeURIComponent(redanSkapadNamn)}`}
                className="brf-knapp-gron px-4 py-2 text-sm"
              >
                Logga in på {redanSkapadNamn}
              </Link>
              <button
                type="button"
                disabled={losenSkickas || !skapareEpost.includes("@")}
                onClick={() => {
                  void (async () => {
                    setLosenSkickas(true);
                    setLosenSkickad(null);
                    setNyttLosenord(null);
                    setFel(null);
                    try {
                      const res = await fetch("/api/auth/glomt-losenord", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          epost: skapareEpost.trim(),
                          namn: skapareNamn.trim(),
                          foreningsNamn: redanSkapadNamn,
                        }),
                      });
                      const data = (await res.json()) as {
                        fel?: string;
                        meddelande?: string;
                        tillfalligtLosenord?: string;
                      };
                      if (!res.ok) {
                        setFel(data.fel || "Kunde inte skicka nytt lösenord.");
                        return;
                      }
                      if (data.tillfalligtLosenord) {
                        setNyttLosenord(data.tillfalligtLosenord);
                      }
                      setLosenSkickad(
                        data.meddelande ||
                          "Om kontot finns har ett nytt lösenord skickats till e-posten.",
                      );
                    } catch {
                      setFel("Kunde inte nå servern för att skicka lösenord.");
                    } finally {
                      setLosenSkickas(false);
                    }
                  })();
                }}
                className="rounded-lg border border-amber-400 bg-white px-4 py-2 text-sm font-medium text-amber-950 hover:bg-amber-100 disabled:opacity-50"
              >
                {losenSkickas ? "Skickar …" : "Skicka nytt lösenord"}
              </button>
            </div>
            {nyttLosenord ? (
              <p className="mt-3">
                Nytt lösenord:{" "}
                <code className="rounded bg-white px-2 py-0.5 font-mono">
                  {nyttLosenord}
                </code>
              </p>
            ) : null}
            {losenSkickad ? (
              <p className="mt-2 text-primary-dark">{losenSkickad}</p>
            ) : null}
          </div>
        ) : null}

        {fel && (
          <p
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
            role="alert"
          >
            {fel}
          </p>
        )}

        {skapar && !fel && (
          <div
            className="rounded-lg border border-primary/30 bg-white/90 px-4 py-3 text-sm"
            role="status"
            aria-live="polite"
          >
            <p className="font-medium text-primary-dark">
              {skapatNamn
                ? `${skapatNamn} skapas …`
                : "Skapar er förening och skickar lösenord …"}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={skapar}
          className="brf-knapp-gron px-6 py-3 text-base shadow-sm disabled:opacity-50"
        >
          {skapar ? "Skapar …" : "Skapa förening"}
        </button>
      </form>
    </div>
  );
}
