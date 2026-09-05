"use client";

import { FormEvent, useEffect, useState } from "react";
import { NavetBankIdGrind } from "@/components/upphandling/NavetBankIdGrind";
import {
  bjudInEntreprenor,
  formatNavetDatum,
  hamtaInbjudningarFor,
  hamtaIntressenFor,
  hamtaNavetAnbudFor,
  hamtaNavetPublicerade,
  hamtaEntreprenor,
  mailtoInbjudan,
  markeraIntresseInbjuden,
  NAVET_UPPHANDLING_EVENT,
  navetUpphandlingStorageKey,
  registreraMejlAnbud,
  skapaNavetUpphandling,
  uppdateraNavetTeaser,
  type NavetAnbud,
  type NavetInbjudan,
  type NavetIntresse,
  type NavetPubliceradTeaser,
} from "@/components/upphandling/navet-upphandling-lager";

type ProjektFalt = {
  titel: string;
  ort: string;
  stadsdel: string;
  fastighetsInfo: string;
  omfattning: string;
  deadline: string;
  forening: string;
  beskrivning: string;
};

const TOMMA_FALT: ProjektFalt = {
  titel: "",
  ort: "",
  stadsdel: "",
  fastighetsInfo: "",
  omfattning: "",
  deadline: "",
  forening: "",
  beskrivning: "",
};

function faltFranTeaser(t: NavetPubliceradTeaser): ProjektFalt {
  return {
    titel: t.titel,
    ort: t.ort === "—" ? "" : t.ort,
    stadsdel: t.stadsdel,
    fastighetsInfo: t.fastighetsInfo,
    omfattning: t.omfattning,
    deadline: t.sistaAnbudsdag,
    forening: t.foreningIntern,
    beskrivning: t.kortBeskrivning,
  };
}

function ProjektFaltGrid({
  varde,
  onChange,
  idPrefix,
}: {
  varde: ProjektFalt;
  onChange: (nasta: ProjektFalt) => void;
  idPrefix: string;
}) {
  function satt<K extends keyof ProjektFalt>(nyckel: K, v: ProjektFalt[K]) {
    onChange({ ...varde, [nyckel]: v });
  }
  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <label className="block text-sm sm:col-span-2">
        <span className="font-medium text-foreground">Namn på upphandlingen</span>
        <input
          id={`${idPrefix}-titel`}
          required
          value={varde.titel}
          onChange={(e) => satt("titel", e.target.value)}
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
          placeholder="t.ex. Omläggning tak Brf Exempel"
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium text-foreground">Ort</span>
        <input
          value={varde.ort}
          onChange={(e) => satt("ort", e.target.value)}
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
          placeholder="Stockholm"
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium text-foreground">Stadsdel</span>
        <input
          value={varde.stadsdel}
          onChange={(e) => satt("stadsdel", e.target.value)}
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
          placeholder="t.ex. Södermalm"
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium text-foreground">Sista anbudsdag</span>
        <input
          type="date"
          value={varde.deadline}
          onChange={(e) => satt("deadline", e.target.value)}
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium text-foreground">Förening (endast intern)</span>
        <input
          value={varde.forening}
          onChange={(e) => satt("forening", e.target.value)}
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
        />
      </label>
      <label className="block text-sm sm:col-span-2">
        <span className="font-medium text-foreground">
          Basinformation om fastigheten
        </span>
        <textarea
          rows={3}
          value={varde.fastighetsInfo}
          onChange={(e) => satt("fastighetsInfo", e.target.value)}
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
          placeholder="Byggår, hustyp, ungefärlig yta, antal lägenheter … (inga handlingar)"
        />
      </label>
      <label className="block text-sm sm:col-span-2">
        <span className="font-medium text-foreground">Vad som ska utföras</span>
        <textarea
          rows={3}
          value={varde.omfattning}
          onChange={(e) => satt("omfattning", e.target.value)}
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
          placeholder="Kort beskrivning av uppdragets omfattning"
        />
      </label>
      <label className="block text-sm sm:col-span-2">
        <span className="font-medium text-foreground">
          Kort publik ingress (utan kontakt)
        </span>
        <textarea
          rows={2}
          value={varde.beskrivning}
          onChange={(e) => satt("beskrivning", e.target.value)}
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
        />
      </label>
    </div>
  );
}

export function InternNavetUpphandlingPanel() {
  const [lista, setLista] = useState<NavetPubliceradTeaser[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [valdId, setValdId] = useState("");
  const [inbjudningar, setInbjudningar] = useState<NavetInbjudan[]>([]);
  const [intressen, setIntressen] = useState<NavetIntresse[]>([]);
  const [anbud, setAnbud] = useState<NavetAnbud[]>([]);

  const [ny, setNy] = useState<ProjektFalt>(TOMMA_FALT);
  const [redigera, setRedigera] = useState<ProjektFalt>(TOMMA_FALT);
  const [skapaFel, setSkapaFel] = useState<string | null>(null);
  const [uppdateraFel, setUppdateraFel] = useState<string | null>(null);
  const [uppdateraOk, setUppdateraOk] = useState(false);

  const [epost, setEpost] = useState("");
  const [foretag, setForetag] = useState("");
  const [senasteLank, setSenasteLank] = useState<string | null>(null);
  const [senasteMailto, setSenasteMailto] = useState<string | null>(null);
  const [inbjudFel, setInbjudFel] = useState<string | null>(null);

  const [mejlEpost, setMejlEpost] = useState("");
  const [mejlForetag, setMejlForetag] = useState("");
  const [mejlSumma, setMejlSumma] = useState("");
  const [mejlMeddelande, setMejlMeddelande] = useState("");
  const [mejlFel, setMejlFel] = useState<string | null>(null);
  const [mejlOk, setMejlOk] = useState(false);

  function uppdatera(forceId?: string) {
    const pub = hamtaNavetPublicerade();
    setLista(pub);
    const id = forceId || valdId || pub[0]?.id || "";
    if (forceId) setValdId(forceId);
    else if (!valdId && pub[0]) setValdId(pub[0].id);
    if (id) {
      setInbjudningar(hamtaInbjudningarFor(id));
      setIntressen(hamtaIntressenFor(id));
      setAnbud(hamtaNavetAnbudFor(id));
      const teaser = pub.find((u) => u.id === id);
      if (teaser) setRedigera(faltFranTeaser(teaser));
    } else {
      setInbjudningar([]);
      setIntressen([]);
      setAnbud([]);
      setRedigera(TOMMA_FALT);
    }
  }

  useEffect(() => {
    function refresh() {
      uppdatera();
    }
    uppdatera();
    setHydrated(true);
    function onStorage(event: StorageEvent) {
      if (event.key === navetUpphandlingStorageKey()) refresh();
    }
    window.addEventListener("storage", onStorage);
    window.addEventListener(NAVET_UPPHANDLING_EVENT, refresh);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(NAVET_UPPHANDLING_EVENT, refresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!valdId) return;
    setInbjudningar(hamtaInbjudningarFor(valdId));
    setIntressen(hamtaIntressenFor(valdId));
    setAnbud(hamtaNavetAnbudFor(valdId));
    const teaser = hamtaNavetPublicerade().find((u) => u.id === valdId);
    if (teaser) setRedigera(faltFranTeaser(teaser));
    setSenasteLank(null);
    setSenasteMailto(null);
    setUppdateraOk(false);
    setMejlOk(false);
  }, [valdId]);

  function onSkapa(event: FormEvent) {
    event.preventDefault();
    setSkapaFel(null);
    try {
      const skapad = skapaNavetUpphandling({
        titel: ny.titel,
        ort: ny.ort,
        stadsdel: ny.stadsdel,
        fastighetsInfo: ny.fastighetsInfo,
        omfattning: ny.omfattning,
        sistaAnbudsdag: ny.deadline,
        foreningIntern: ny.forening,
        kortBeskrivning: ny.beskrivning,
      });
      setNy(TOMMA_FALT);
      uppdatera(skapad.id);
    } catch (error) {
      setSkapaFel(error instanceof Error ? error.message : "Kunde inte skapa.");
    }
  }

  function onUppdatera(event: FormEvent) {
    event.preventDefault();
    setUppdateraFel(null);
    setUppdateraOk(false);
    if (!valdId) return;
    try {
      uppdateraNavetTeaser(valdId, {
        titel: redigera.titel,
        ort: redigera.ort,
        stadsdel: redigera.stadsdel,
        fastighetsInfo: redigera.fastighetsInfo,
        omfattning: redigera.omfattning,
        sistaAnbudsdag: redigera.deadline,
        foreningIntern: redigera.forening,
        kortBeskrivning: redigera.beskrivning,
      });
      setUppdateraOk(true);
      uppdatera(valdId);
    } catch (error) {
      setUppdateraFel(
        error instanceof Error ? error.message : "Kunde inte uppdatera.",
      );
    }
  }

  function onBjudIn(event: FormEvent) {
    event.preventDefault();
    setInbjudFel(null);
    setSenasteLank(null);
    setSenasteMailto(null);
    try {
      const { lank, inbjudan } = bjudInEntreprenor({
        upphandlingId: valdId,
        epost,
        foretagsnamn: foretag,
      });
      const absolut =
        typeof window !== "undefined" ? `${window.location.origin}${lank}` : lank;
      const vald = lista.find((u) => u.id === valdId);
      setSenasteLank(absolut);
      setSenasteMailto(
        mailtoInbjudan({
          epost: inbjudan.epost,
          titel: vald?.titel ?? "Upphandling",
          lank: absolut,
        }),
      );
      setEpost("");
      setForetag("");
      uppdatera(valdId);
    } catch (error) {
      setInbjudFel(
        error instanceof Error ? error.message : "Kunde inte skapa inbjudan.",
      );
    }
  }

  function onMejlAnbud(event: FormEvent) {
    event.preventDefault();
    setMejlFel(null);
    setMejlOk(false);
    if (!valdId) {
      setMejlFel("Välj en upphandling först.");
      return;
    }
    const summa = Number(mejlSumma.replace(/\s/g, "").replace(",", "."));
    try {
      registreraMejlAnbud({
        upphandlingId: valdId,
        epost: mejlEpost,
        foretagsnamn: mejlForetag,
        anbudSummaKr: summa,
        meddelande: mejlMeddelande,
      });
      setMejlEpost("");
      setMejlForetag("");
      setMejlSumma("");
      setMejlMeddelande("");
      setMejlOk(true);
      uppdatera(valdId);
    } catch (error) {
      setMejlFel(
        error instanceof Error ? error.message : "Kunde inte registrera anbud.",
      );
    }
  }

  if (!hydrated) {
    return <p className="text-sm text-muted">Laddar intern upphandling…</p>;
  }

  const vald = lista.find((u) => u.id === valdId);

  return (
    <NavetBankIdGrind rubrik="BankID — projektinformation och anbud">
      <div className="space-y-10">
        <p className="rounded-lg border border-border bg-background/80 px-4 py-3 text-sm leading-relaxed text-muted">
          På den publika sidan visas stadsdel, basinformation om fastigheten och
          vad som ska utföras.{" "}
          <strong className="font-medium text-foreground">
            Inga handlingar laddas upp publikt
          </strong>{" "}
          — underlag mejlas ut. Anbud som kommer in via mejl registreras här.
        </p>

        <form
          onSubmit={onSkapa}
          className="rounded-xl border border-border bg-surface p-5 shadow-sm"
        >
          <h3 className="font-semibold text-foreground">Skapa projekt att upphandla</h3>
          <p className="mt-1 text-sm text-muted">
            Fyll i projektinformationen som syns publikt. Handlingar mejlar ni
            separat till inbjudna entreprenörer.
          </p>
          <ProjektFaltGrid varde={ny} onChange={setNy} idPrefix="ny" />
          {skapaFel && (
            <p className="mt-3 text-sm text-red-700" role="alert">
              {skapaFel}
            </p>
          )}
          <button
            type="submit"
            className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Skapa och publicera projektinformation
          </button>
        </form>

        {lista.length === 0 ? (
          <p className="text-sm text-muted">
            Inga upphandlingar ännu. Skapa ett projekt ovan.
          </p>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-foreground">
                Välj upphandling
              </label>
              <select
                value={valdId}
                onChange={(e) => setValdId(e.target.value)}
                className="mt-1 w-full max-w-xl rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                {lista.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.titel}
                    {u.stadsdel ? ` · ${u.stadsdel}` : u.ort ? ` · ${u.ort}` : ""}
                  </option>
                ))}
              </select>
              {vald && (
                <p className="mt-2 text-sm text-muted">
                  Intern: {vald.foreningIntern} · Sista anbudsdag{" "}
                  {formatNavetDatum(vald.sistaAnbudsdag)} · Publik sida:{" "}
                  <a className="text-primary" href={`/upphandling/${vald.id}`}>
                    /upphandling/{vald.id}
                  </a>
                </p>
              )}
            </div>

            <form
              onSubmit={onUppdatera}
              className="rounded-xl border border-border bg-surface p-5 shadow-sm"
            >
              <h3 className="font-semibold text-foreground">
                Uppdatera projektinformation
              </h3>
              <p className="mt-1 text-sm text-muted">
                Ändringar syns direkt på den publika projektinformationsrutan.
              </p>
              <ProjektFaltGrid
                varde={redigera}
                onChange={setRedigera}
                idPrefix="edit"
              />
              {uppdateraFel && (
                <p className="mt-3 text-sm text-red-700" role="alert">
                  {uppdateraFel}
                </p>
              )}
              {uppdateraOk && (
                <p className="mt-3 text-sm text-primary-dark" role="status">
                  Sparat.
                </p>
              )}
              <button
                type="submit"
                className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
              >
                Spara uppdatering
              </button>
            </form>

            <form
              onSubmit={onMejlAnbud}
              className="rounded-xl border border-dashed border-primary/40 bg-[#e8f3ec]/40 p-5"
            >
              <h3 className="font-semibold text-primary-dark">
                Registrera anbud från mejl
              </h3>
              <p className="mt-1 text-sm text-muted">
                När entreprenören mejlar in sitt anbud registrerar ni det här.
                Andra anbudsgivare ser varken varandra eller beloppen.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="font-medium text-foreground">E-post</span>
                  <input
                    required
                    type="email"
                    value={mejlEpost}
                    onChange={(e) => setMejlEpost(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
                  />
                </label>
                <label className="block text-sm">
                  <span className="font-medium text-foreground">Företagsnamn</span>
                  <input
                    value={mejlForetag}
                    onChange={(e) => setMejlForetag(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
                  />
                </label>
                <label className="block text-sm">
                  <span className="font-medium text-foreground">Anbudsbelopp (kr)</span>
                  <input
                    required
                    inputMode="decimal"
                    value={mejlSumma}
                    onChange={(e) => setMejlSumma(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
                    placeholder="1 250 000"
                  />
                </label>
                <label className="block text-sm sm:col-span-2">
                  <span className="font-medium text-foreground">
                    Anteckning från mejl{" "}
                    <span className="font-normal text-muted">(valfritt)</span>
                  </span>
                  <textarea
                    rows={2}
                    value={mejlMeddelande}
                    onChange={(e) => setMejlMeddelande(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
                  />
                </label>
              </div>
              {mejlFel && (
                <p className="mt-3 text-sm text-red-700" role="alert">
                  {mejlFel}
                </p>
              )}
              {mejlOk && (
                <p className="mt-3 text-sm text-primary-dark" role="status">
                  Mejlanbud registrerat.
                </p>
              )}
              <button
                type="submit"
                className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
              >
                Registrera mejlanbud
              </button>
            </form>

            <form
              onSubmit={onBjudIn}
              className="rounded-xl border border-dashed border-primary/40 bg-[#e8f3ec]/40 p-5"
            >
              <h3 className="font-semibold text-primary-dark">
                Mejla inbjudan / underlag
              </h3>
              <p className="mt-1 text-sm text-muted">
                Skapa en personlig referenslänk och öppna mejlklienten. Underlaget
                skickar ni som bilaga i mejlet — det publiceras inte på den
                publika sidan.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="font-medium text-foreground">E-post</span>
                  <input
                    required
                    type="email"
                    value={epost}
                    onChange={(e) => setEpost(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
                  />
                </label>
                <label className="block text-sm">
                  <span className="font-medium text-foreground">Företagsnamn</span>
                  <input
                    value={foretag}
                    onChange={(e) => setForetag(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
                  />
                </label>
              </div>
              {inbjudFel && (
                <p className="mt-3 text-sm text-red-700" role="alert">
                  {inbjudFel}
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
                >
                  Skapa inbjudan
                </button>
                {senasteMailto && (
                  <a
                    href={senasteMailto}
                    className="inline-flex rounded-lg border border-primary bg-[#eef6f0] px-4 py-2 text-sm font-medium text-primary-dark"
                  >
                    Öppna mejl
                  </a>
                )}
              </div>
              {senasteLank && (
                <div className="mt-4 rounded-lg border border-border bg-background p-3">
                  <p className="text-xs font-medium text-muted">Referenslänk</p>
                  <p className="mt-1 break-all text-sm text-foreground">{senasteLank}</p>
                  <button
                    type="button"
                    className="mt-2 text-sm font-medium text-primary"
                    onClick={() => navigator.clipboard?.writeText(senasteLank)}
                  >
                    Kopiera länk
                  </button>
                </div>
              )}
            </form>

            <div>
              <h3 className="font-semibold text-foreground">
                Intresseanmälningar (endast intern vy)
              </h3>
              <p className="mt-1 text-sm text-muted">
                Entreprenörer som vill lämna offert. Bjud in dem och mejla
                underlaget.
              </p>
              {intressen.length === 0 ? (
                <p className="mt-2 text-sm text-muted">Inga intresseanmälningar ännu.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {intressen.map((i) => (
                    <li
                      key={i.id}
                      className="rounded-lg border border-border bg-surface px-4 py-3 text-sm"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-foreground">
                            {i.foretagsnamn}{" "}
                            <span className="font-normal text-muted">({i.epost})</span>
                          </p>
                          <p className="mt-1 text-xs text-muted">
                            {i.telefon ? `${i.telefon} · ` : ""}
                            {formatNavetDatum(i.skapad)} · {i.status}
                          </p>
                          {i.meddelande && (
                            <p className="mt-2 text-sm text-foreground/90">{i.meddelande}</p>
                          )}
                        </div>
                        {i.status === "ny" && (
                          <button
                            type="button"
                            className="rounded-lg border border-primary bg-[#eef6f0] px-3 py-1.5 text-xs font-medium text-primary-dark"
                            onClick={() => {
                              try {
                                const { lank } = bjudInEntreprenor({
                                  upphandlingId: valdId,
                                  epost: i.epost,
                                  foretagsnamn: i.foretagsnamn,
                                });
                                markeraIntresseInbjuden(i.id);
                                const absolut =
                                  typeof window !== "undefined"
                                    ? `${window.location.origin}${lank}`
                                    : lank;
                                const valdTeaser = lista.find((u) => u.id === valdId);
                                setSenasteLank(absolut);
                                setSenasteMailto(
                                  mailtoInbjudan({
                                    epost: i.epost,
                                    titel: valdTeaser?.titel ?? "Upphandling",
                                    lank: absolut,
                                  }),
                                );
                                uppdatera(valdId);
                              } catch (error) {
                                setInbjudFel(
                                  error instanceof Error
                                    ? error.message
                                    : "Kunde inte bjuda in.",
                                );
                              }
                            }}
                          >
                            Bjud in (mejla underlag)
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-foreground">
                Inbjudna (endast intern vy)
              </h3>
              {inbjudningar.length === 0 ? (
                <p className="mt-2 text-sm text-muted">Inga inbjudningar ännu.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {inbjudningar.map((i) => {
                    const ent = hamtaEntreprenor(i.entreprenorId);
                    return (
                      <li
                        key={i.id}
                        className="rounded-lg border border-border bg-surface px-4 py-3 text-sm"
                      >
                        <p className="font-medium text-foreground">
                          {ent?.foretagsnamn ?? i.epost}{" "}
                          <span className="font-normal text-muted">({i.epost})</span>
                        </p>
                        <p className="mt-1 text-xs text-muted">
                          {i.forstaOppning
                            ? `Öppnad ${formatNavetDatum(i.forstaOppning)}`
                            : "Ej öppnad"}{" "}
                          · referens /entreprenor/underlag/{i.token}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-foreground">
                Inkomna anbud (endast intern vy)
              </h3>
              <p className="mt-1 text-sm text-muted">
                Portal- och mejlanbud. Anbudsgivare ser varken varandra eller
                andras anbud.
              </p>
              {anbud.length === 0 ? (
                <p className="mt-2 text-sm text-muted">Inga anbud inlämnade ännu.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {anbud.map((a) => (
                    <li
                      key={a.id}
                      className="rounded-lg border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm"
                    >
                      <p className="font-medium text-foreground">
                        {a.entreprenorNamn} — {a.anbudSummaKr.toLocaleString("sv-SE")}{" "}
                        kr
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {a.epost} · {formatNavetDatum(a.inlamnad)} ·{" "}
                        {a.kanal === "email" ? "Via mejl" : "Via portal"}
                      </p>
                      {a.meddelande && (
                        <p className="mt-2 text-sm text-foreground/90">{a.meddelande}</p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </NavetBankIdGrind>
  );
}
