"use client";

import { useEffect, useState } from "react";
import {
  PRIS_ENHET_ETIKETTER,
  PRISLISTOR_STATE_EVENT,
  lasPrislistorState,
  sparaPrislistorState,
  skapaUnikPrislistaId,
  skapaUnikPrisPostId,
  tomPrislista,
  tomPrisPost,
  type PrisEnhet,
  type Prislista,
  type PrisPost,
  type PrislistorState,
} from "@/components/prislistor/prislistor-lager";

// ── Hjälpkomponenter ──────────────────────────────────────────────────────────

const inputKlass =
  "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

function formatDatum(iso: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("sv-SE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

// ── Prispostformulär ─────────────────────────────────────────────────────────

interface PrisPostFormularProps {
  initVarden: PrisPost;
  onSpara: (post: PrisPost) => void;
  onAvbryt: () => void;
}

function PrisPostFormular({ initVarden, onSpara, onAvbryt }: PrisPostFormularProps) {
  const [post, setPost] = useState<PrisPost>(initVarden);

  function upd<K extends keyof PrisPost>(key: K, value: PrisPost[K]) {
    setPost((p) => ({ ...p, [key]: value }));
  }

  return (
    <div className="rounded-lg border border-primary/20 bg-[#f7fbf8] p-3">
      <div className="grid gap-2 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-muted">
            Beskrivning
          </label>
          <input
            type="text"
            value={post.beskrivning}
            onChange={(e) => upd("beskrivning", e.target.value)}
            placeholder="t.ex. Putsreparation fasad"
            className={inputKlass}
            autoFocus
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">
            Enhet
          </label>
          <select
            value={post.enhet}
            onChange={(e) => upd("enhet", e.target.value as PrisEnhet)}
            className={inputKlass}
          >
            {(Object.keys(PRIS_ENHET_ETIKETTER) as PrisEnhet[]).map((e) => (
              <option key={e} value={e}>
                {PRIS_ENHET_ETIKETTER[e]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">
            Pris (kr)
          </label>
          <input
            type="number"
            min="0"
            value={post.prisKr}
            onChange={(e) => upd("prisKr", e.target.value)}
            placeholder="t.ex. 450"
            className={inputKlass}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-muted">
            Notering (valfri)
          </label>
          <input
            type="text"
            value={post.notering}
            onChange={(e) => upd("notering", e.target.value)}
            placeholder="Ytterligare info…"
            className={inputKlass}
          />
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => onSpara(post)}
          disabled={!post.beskrivning.trim()}
          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-dark disabled:opacity-40"
        >
          Spara post
        </button>
        <button
          type="button"
          onClick={onAvbryt}
          className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted hover:text-foreground"
        >
          Avbryt
        </button>
      </div>
    </div>
  );
}

// ── Prislistformulär ──────────────────────────────────────────────────────────

interface PrislistFormularProps {
  initVarden: Partial<Prislista>;
  onSpara: (leverantor: string, kategori: string, fr: string, tom: string) => void;
  onAvbryt: () => void;
}

function PrislistaFormular({ initVarden, onSpara, onAvbryt }: PrislistFormularProps) {
  const [leverantor, setLeverantor] = useState(initVarden.leverantorNamn ?? "");
  const [kategori, setKategori] = useState(initVarden.kategori ?? "");
  const [fr, setFr] = useState(initVarden.giltigFran ?? "");
  const [tom, setTom] = useState(initVarden.giltigTom ?? "");

  return (
    <div className="rounded-xl border-2 border-dashed border-primary/30 bg-[#f7fbf8] p-4">
      <h3 className="mb-3 text-sm font-semibold text-foreground">
        {initVarden.id ? "Redigera prislista" : "Ny prislista"}
      </h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">
            Leverantörens namn
          </label>
          <input
            type="text"
            value={leverantor}
            onChange={(e) => setLeverantor(e.target.value)}
            placeholder="t.ex. Fasadbolaget AB"
            className={inputKlass}
            autoFocus
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">
            Kategori
          </label>
          <input
            type="text"
            value={kategori}
            onChange={(e) => setKategori(e.target.value)}
            placeholder="t.ex. Fasad, VVS, Tak…"
            className={inputKlass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">
            Giltig från
          </label>
          <input
            type="date"
            value={fr}
            onChange={(e) => setFr(e.target.value)}
            className={inputKlass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">
            Giltig t.o.m.
          </label>
          <input
            type="date"
            value={tom}
            onChange={(e) => setTom(e.target.value)}
            className={inputKlass}
          />
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => onSpara(leverantor, kategori, fr, tom)}
          disabled={!leverantor.trim()}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-40"
        >
          {initVarden.id ? "Uppdatera" : "Skapa prislista"}
        </button>
        <button
          type="button"
          onClick={onAvbryt}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted hover:text-foreground"
        >
          Avbryt
        </button>
      </div>
    </div>
  );
}

// ── Huvud-komponent ───────────────────────────────────────────────────────────

export function PrislistorModul() {
  const [hydrated, setHydrated] = useState(false);
  const [state, setState] = useState<PrislistorState>({ version: 1, listor: [] });
  const [expandadLista, setExpandadLista] = useState<string | null>(null);
  const [visaSkapaPrislistaForm, setVisaSkapaPrislistaForm] = useState(false);
  const [redigerarPrislistaId, setRedigerarPrislistaId] = useState<string | null>(null);
  const [visaPostFormFor, setVisaPostFormFor] = useState<string | null>(null);
  const [redigerarPostId, setRedigerarPostId] = useState<string | null>(null);
  const [bekraftaTaBortListaId, setBekraftaTaBortListaId] = useState<string | null>(null);

  useEffect(() => {
    setState(lasPrislistorState());
    setHydrated(true);
    const hantera = () => setState(lasPrislistorState());
    window.addEventListener(PRISLISTOR_STATE_EVENT, hantera);
    return () => window.removeEventListener(PRISLISTOR_STATE_EVENT, hantera);
  }, []);

  function sparaOchUppdatera(nyState: PrislistorState) {
    sparaPrislistorState(nyState);
    setState(nyState);
  }

  function skapaNyPrislista(
    leverantor: string,
    kategori: string,
    fr: string,
    tom: string,
  ) {
    const nu = new Date().toISOString();
    const ny: Prislista = {
      ...tomPrislista(leverantor, kategori),
      giltigFran: fr,
      giltigTom: tom,
    };
    sparaOchUppdatera({ ...state, listor: [...state.listor, ny] });
    setVisaSkapaPrislistaForm(false);
    setExpandadLista(ny.id);
  }

  function uppdateraPrislistaMetadata(
    id: string,
    leverantor: string,
    kategori: string,
    fr: string,
    tom: string,
  ) {
    const nu = new Date().toISOString();
    sparaOchUppdatera({
      ...state,
      listor: state.listor.map((l) =>
        l.id === id
          ? {
              ...l,
              leverantorNamn: leverantor,
              kategori,
              giltigFran: fr,
              giltigTom: tom,
              uppdateradTidpunkt: nu,
            }
          : l,
      ),
    });
    setRedigerarPrislistaId(null);
  }

  function taBortPrislista(id: string) {
    sparaOchUppdatera({
      ...state,
      listor: state.listor.filter((l) => l.id !== id),
    });
    setBekraftaTaBortListaId(null);
    if (expandadLista === id) setExpandadLista(null);
  }

  function laggTillPost(listaId: string, post: PrisPost) {
    const nu = new Date().toISOString();
    sparaOchUppdatera({
      ...state,
      listor: state.listor.map((l) =>
        l.id === listaId
          ? {
              ...l,
              poster: [...l.poster, { ...post, id: skapaUnikPrisPostId() }],
              uppdateradTidpunkt: nu,
            }
          : l,
      ),
    });
    setVisaPostFormFor(null);
  }

  function uppdateraPost(listaId: string, post: PrisPost) {
    const nu = new Date().toISOString();
    sparaOchUppdatera({
      ...state,
      listor: state.listor.map((l) =>
        l.id === listaId
          ? {
              ...l,
              poster: l.poster.map((p) => (p.id === post.id ? post : p)),
              uppdateradTidpunkt: nu,
            }
          : l,
      ),
    });
    setRedigerarPostId(null);
  }

  function taBortPost(listaId: string, postId: string) {
    const nu = new Date().toISOString();
    sparaOchUppdatera({
      ...state,
      listor: state.listor.map((l) =>
        l.id === listaId
          ? {
              ...l,
              poster: l.poster.filter((p) => p.id !== postId),
              uppdateradTidpunkt: nu,
            }
          : l,
      ),
    });
  }

  if (!hydrated) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-24 rounded-xl bg-border/40" />
        <div className="h-24 rounded-xl bg-border/40" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {state.listor.length === 0 && !visaSkapaPrislistaForm && (
        <div className="rounded-xl border border-border bg-surface p-8 text-center">
          <p className="text-muted">Inga prislistor tillagda ännu.</p>
          <p className="mt-1 text-sm text-muted">
            Skapa en prislista per leverantör och kategori.
          </p>
        </div>
      )}

      {/* Lista med prislistor */}
      <div className="space-y-4">
        {state.listor.map((lista) =>
          redigerarPrislistaId === lista.id ? (
            <PrislistaFormular
              key={lista.id}
              initVarden={lista}
              onSpara={(lev, kat, fr, tom) =>
                uppdateraPrislistaMetadata(lista.id, lev, kat, fr, tom)
              }
              onAvbryt={() => setRedigerarPrislistaId(null)}
            />
          ) : (
            <div
              key={lista.id}
              className="rounded-xl border border-border bg-surface shadow-sm"
            >
              {/* Header */}
              <div className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-foreground">
                      {lista.leverantorNamn}
                    </h3>
                    {lista.kategori && (
                      <span className="rounded-full bg-border/50 px-2 py-0.5 text-xs text-muted">
                        {lista.kategori}
                      </span>
                    )}
                    <span className="rounded-full bg-[#e2f0e6] px-2 py-0.5 text-xs font-medium text-primary-dark">
                      {lista.poster.length} prisposter
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted">
                    {lista.giltigFran && (
                      <span>Fr.o.m. {lista.giltigFran}</span>
                    )}
                    {lista.giltigTom && <span>T.o.m. {lista.giltigTom}</span>}
                    <span>Uppdaterad {formatDatum(lista.uppdateradTidpunkt)}</span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandadLista(
                        expandadLista === lista.id ? null : lista.id,
                      )
                    }
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted hover:text-foreground"
                  >
                    {expandadLista === lista.id ? "Dölj" : "Visa poster"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRedigerarPrislistaId(lista.id);
                      setExpandadLista(null);
                    }}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted hover:text-foreground"
                  >
                    Redigera
                  </button>
                  {bekraftaTaBortListaId === lista.id ? (
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => taBortPrislista(lista.id)}
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                      >
                        Ta bort
                      </button>
                      <button
                        type="button"
                        onClick={() => setBekraftaTaBortListaId(null)}
                        className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted"
                      >
                        Avbryt
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setBekraftaTaBortListaId(lista.id)}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted hover:border-red-300 hover:text-red-600"
                    >
                      Ta bort
                    </button>
                  )}
                </div>
              </div>

              {/* Expanderat — prisposter */}
              {expandadLista === lista.id && (
                <div className="border-t border-border px-4 pb-4 pt-3">
                  {lista.poster.length > 0 ? (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-left text-xs font-medium text-muted">
                          <th className="pb-2 pr-4">Beskrivning</th>
                          <th className="pb-2 pr-4">Pris</th>
                          <th className="pb-2 pr-4">Enhet</th>
                          <th className="pb-2 pr-4">Notering</th>
                          <th className="pb-2" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {lista.poster.map((post) =>
                          redigerarPostId === post.id ? (
                            <tr key={post.id}>
                              <td colSpan={5} className="py-2">
                                <PrisPostFormular
                                  initVarden={post}
                                  onSpara={(p) => uppdateraPost(lista.id, p)}
                                  onAvbryt={() => setRedigerarPostId(null)}
                                />
                              </td>
                            </tr>
                          ) : (
                            <tr key={post.id}>
                              <td className="py-2 pr-4 font-medium text-foreground">
                                {post.beskrivning}
                              </td>
                              <td className="py-2 pr-4 text-foreground">
                                {post.prisKr
                                  ? parseInt(post.prisKr).toLocaleString("sv-SE")
                                  : "—"}{" "}
                                kr
                              </td>
                              <td className="py-2 pr-4 text-muted">
                                {PRIS_ENHET_ETIKETTER[post.enhet]}
                              </td>
                              <td className="py-2 pr-4 text-muted">
                                {post.notering || "—"}
                              </td>
                              <td className="py-2">
                                <div className="flex gap-1">
                                  <button
                                    type="button"
                                    onClick={() => setRedigerarPostId(post.id)}
                                    className="text-xs text-muted underline hover:text-foreground"
                                  >
                                    Redigera
                                  </button>
                                  <span className="text-muted/40">·</span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      taBortPost(lista.id, post.id)
                                    }
                                    className="text-xs text-muted underline hover:text-red-600"
                                  >
                                    Ta bort
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  ) : (
                    <p className="mb-3 text-sm text-muted">
                      Inga prisposter tillagda ännu.
                    </p>
                  )}

                  {visaPostFormFor === lista.id ? (
                    <div className="mt-3">
                      <PrisPostFormular
                        initVarden={tomPrisPost()}
                        onSpara={(p) => laggTillPost(lista.id, p)}
                        onAvbryt={() => setVisaPostFormFor(null)}
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setVisaPostFormFor(lista.id)}
                      className="mt-3 flex items-center gap-1.5 text-sm font-medium text-primary-dark hover:underline"
                    >
                      <span className="text-lg leading-none">+</span>
                      Lägg till prispost
                    </button>
                  )}
                </div>
              )}
            </div>
          ),
        )}
      </div>

      {/* Skapa ny prislista */}
      {visaSkapaPrislistaForm ? (
        <PrislistaFormular
          initVarden={{}}
          onSpara={skapaNyPrislista}
          onAvbryt={() => setVisaSkapaPrislistaForm(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setVisaSkapaPrislistaForm(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-4 text-sm font-medium text-muted transition-colors hover:border-primary/40 hover:text-primary-dark"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="h-4 w-4"
            aria-hidden
          >
            <path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
          </svg>
          Lägg till prislista från leverantör
        </button>
      )}
    </div>
  );
}
