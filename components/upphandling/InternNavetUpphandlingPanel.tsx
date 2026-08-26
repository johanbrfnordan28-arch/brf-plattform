"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  bjudInEntreprenor,
  formatNavetDatum,
  hamtaInbjudningarFor,
  hamtaNavetAnbudFor,
  hamtaNavetPublicerade,
  hamtaNavetUnderlag,
  hamtaEntreprenor,
  laggTillNavetDokument,
  mailtoInbjudan,
  NAVET_UPPHANDLING_EVENT,
  navetUpphandlingStorageKey,
  skapaNavetUpphandling,
  taBortNavetDokument,
  type NavetAnbud,
  type NavetInbjudan,
  type NavetPubliceradTeaser,
  type NavetUnderlagDokument,
} from "@/components/upphandling/navet-upphandling-lager";

const MAX_DATA_URL_BYTES = 180_000;

export function InternNavetUpphandlingPanel() {
  const [lista, setLista] = useState<NavetPubliceradTeaser[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [valdId, setValdId] = useState("");
  const [dokument, setDokument] = useState<NavetUnderlagDokument[]>([]);
  const [inbjudningar, setInbjudningar] = useState<NavetInbjudan[]>([]);
  const [anbud, setAnbud] = useState<NavetAnbud[]>([]);

  const [nyTitel, setNyTitel] = useState("");
  const [nyOrt, setNyOrt] = useState("");
  const [nyDeadline, setNyDeadline] = useState("");
  const [nyForening, setNyForening] = useState("");
  const [nyBeskrivning, setNyBeskrivning] = useState("");
  const [skapaFel, setSkapaFel] = useState<string | null>(null);

  const [dokEtikett, setDokEtikett] = useState("");
  const [dokFil, setDokFil] = useState<File | null>(null);
  const [dokFel, setDokFel] = useState<string | null>(null);

  const [epost, setEpost] = useState("");
  const [foretag, setForetag] = useState("");
  const [senasteLank, setSenasteLank] = useState<string | null>(null);
  const [senasteMailto, setSenasteMailto] = useState<string | null>(null);
  const [inbjudFel, setInbjudFel] = useState<string | null>(null);

  function uppdatera(forceId?: string) {
    const pub = hamtaNavetPublicerade();
    setLista(pub);
    const id = forceId || valdId || pub[0]?.id || "";
    if (forceId) setValdId(forceId);
    else if (!valdId && pub[0]) setValdId(pub[0].id);
    if (id) {
      setDokument(hamtaNavetUnderlag(id)?.dokument ?? []);
      setInbjudningar(hamtaInbjudningarFor(id));
      setAnbud(hamtaNavetAnbudFor(id));
    } else {
      setDokument([]);
      setInbjudningar([]);
      setAnbud([]);
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
    setDokument(hamtaNavetUnderlag(valdId)?.dokument ?? []);
    setInbjudningar(hamtaInbjudningarFor(valdId));
    setAnbud(hamtaNavetAnbudFor(valdId));
    setSenasteLank(null);
    setSenasteMailto(null);
  }, [valdId]);

  function onSkapa(event: FormEvent) {
    event.preventDefault();
    setSkapaFel(null);
    try {
      const skapad = skapaNavetUpphandling({
        titel: nyTitel,
        ort: nyOrt,
        sistaAnbudsdag: nyDeadline,
        foreningIntern: nyForening,
        kortBeskrivning: nyBeskrivning,
      });
      setNyTitel("");
      setNyOrt("");
      setNyDeadline("");
      setNyForening("");
      setNyBeskrivning("");
      uppdatera(skapad.id);
    } catch (error) {
      setSkapaFel(error instanceof Error ? error.message : "Kunde inte skapa.");
    }
  }

  async function onLaddaUpp(event: FormEvent) {
    event.preventDefault();
    setDokFel(null);
    if (!valdId) {
      setDokFel("Välj en upphandling först.");
      return;
    }
    if (!dokFil) {
      setDokFel("Välj en fil.");
      return;
    }

    try {
      let dataUrl: string | undefined;
      if (dokFil.size <= MAX_DATA_URL_BYTES) {
        dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(new Error("Kunde inte läsa filen."));
          reader.readAsDataURL(dokFil);
        });
      }

      laggTillNavetDokument(valdId, {
        etikett: dokEtikett || dokFil.name,
        filnamn: dokFil.name,
        dataUrl,
      });
      setDokEtikett("");
      setDokFil(null);
      uppdatera(valdId);
    } catch (error) {
      setDokFel(error instanceof Error ? error.message : "Uppladdning misslyckades.");
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

  if (!hydrated) {
    return <p className="text-sm text-muted">Laddar intern upphandling…</p>;
  }

  const vald = lista.find((u) => u.id === valdId);

  return (
    <div className="space-y-10">
      <form
        onSubmit={onSkapa}
        className="rounded-xl border border-border bg-surface p-5 shadow-sm"
      >
        <h3 className="font-semibold text-foreground">Skapa upphandling</h3>
        <p className="mt-1 text-sm text-muted">
          Namnge uppdraget. Underlag kan laddas upp nu eller senare — allt lagras
          på denna låsta sida.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block text-sm sm:col-span-2">
            <span className="font-medium text-foreground">Namn på upphandlingen</span>
            <input
              required
              value={nyTitel}
              onChange={(e) => setNyTitel(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
              placeholder="t.ex. Omläggning tak Brf Exempel"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-foreground">Ort (publik teaser)</span>
            <input
              value={nyOrt}
              onChange={(e) => setNyOrt(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-foreground">Sista anbudsdag</span>
            <input
              type="date"
              value={nyDeadline}
              onChange={(e) => setNyDeadline(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-foreground">Förening (endast intern)</span>
            <input
              value={nyForening}
              onChange={(e) => setNyForening(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="font-medium text-foreground">
              Kort publik beskrivning (utan kontakt)
            </span>
            <textarea
              rows={2}
              value={nyBeskrivning}
              onChange={(e) => setNyBeskrivning(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
            />
          </label>
        </div>
        {skapaFel && (
          <p className="mt-3 text-sm text-red-700" role="alert">
            {skapaFel}
          </p>
        )}
        <button
          type="submit"
          className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          Skapa och publicera teaser
        </button>
      </form>

      {lista.length === 0 ? (
        <p className="text-sm text-muted">
          Inga upphandlingar ännu. Skapa en ovan för att ladda upp underlag och
          bjuda in entreprenörer.
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
                  {u.titel} · {u.ort}
                </option>
              ))}
            </select>
            {vald && (
              <p className="mt-2 text-sm text-muted">
                Intern: {vald.foreningIntern} · Sista anbudsdag{" "}
                {formatNavetDatum(vald.sistaAnbudsdag)} · Publik teaser:{" "}
                <a className="text-primary" href={`/upphandling/${vald.id}`}>
                  /upphandling/{vald.id}
                </a>
              </p>
            )}
          </div>

          <form
            onSubmit={onLaddaUpp}
            className="rounded-xl border border-dashed border-primary/40 bg-[#e8f3ec]/40 p-5"
          >
            <h3 className="font-semibold text-primary-dark">
              Ladda upp förfrågningsunderlag
            </h3>
            <p className="mt-1 text-sm text-muted">
              Handlingarna syns bara för inbjudna entreprenörer (och här internt).
              Mindre filer sparas lokalt i demo; större sparas som filnamn.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="font-medium text-foreground">Etikett</span>
                <input
                  value={dokEtikett}
                  onChange={(e) => setDokEtikett(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
                  placeholder="t.ex. AF-del / ritning"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-foreground">Fil</span>
                <input
                  type="file"
                  onChange={(e) => setDokFil(e.target.files?.[0] ?? null)}
                  className="mt-1 w-full text-sm"
                />
              </label>
            </div>
            {dokFel && (
              <p className="mt-3 text-sm text-red-700" role="alert">
                {dokFel}
              </p>
            )}
            <button
              type="submit"
              className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
            >
              Ladda upp
            </button>
            <ul className="mt-4 space-y-2">
              {dokument.length === 0 ? (
                <li className="text-sm text-muted">Inga dokument ännu.</li>
              ) : (
                dokument.map((d) => (
                  <li
                    key={`${d.etikett}-${d.filnamn}-${d.uppladdad ?? ""}`}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  >
                    <span>
                      <span className="font-medium text-foreground">{d.etikett}</span>
                      <span className="text-muted"> — {d.filnamn}</span>
                    </span>
                    <button
                      type="button"
                      className="text-xs font-medium text-red-700"
                      onClick={() => {
                        taBortNavetDokument(valdId, d.filnamn, d.etikett);
                        uppdatera(valdId);
                      }}
                    >
                      Ta bort
                    </button>
                  </li>
                ))
              )}
            </ul>
          </form>

          <form
            onSubmit={onBjudIn}
            className="rounded-xl border border-dashed border-primary/40 bg-[#e8f3ec]/40 p-5"
          >
            <h3 className="font-semibold text-primary-dark">
              Mejla inbjudan till entreprenör
            </h3>
            <p className="mt-1 text-sm text-muted">
              Skapar unik länk till underlaget. Öppna mejlklienten eller kopiera
              länken. Inbjudna och anbud syns inte för andra anbudsgivare.
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
                <p className="text-xs font-medium text-muted">Personlig länk</p>
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
              Inbjudna (endast intern vy)
            </h3>
            <p className="mt-1 text-sm text-muted">
              Listan syns inte för entreprenörer eller föreningen.
            </p>
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
                        · /entreprenor/underlag/{i.token}
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
              Anbudsgivare ser varken varandra eller andras anbud.
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
                      {a.epost} · {formatNavetDatum(a.inlamnad)}
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
  );
}
