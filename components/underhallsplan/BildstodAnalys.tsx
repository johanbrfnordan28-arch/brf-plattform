"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  bildKomponentAktiv,
  bildKomponenter,
  skapaDemoAnalys,
  type StyrelseBedömning,
} from "@/components/underhallsplan/bildanalys";
import {
  hamtaPosterForAr,
  hamtaTidigareAr,
  lasBildSomDataUrl,
  lasBildstodLager,
  skapaBildstodPostId,
  sparaBildstodLager,
  taBortBildstodPost,
  upsertBildstodPost,
  type BildstodPost,
  type KartYtaData,
} from "@/components/underhallsplan/bildstod-lager";
import { KartYtaHjalp } from "@/components/underhallsplan/KartYtaHjalp";
import { GoogleKartLankar } from "@/components/underhallsplan/GoogleKartLankar";
import { hamtaPrimarAdress } from "@/components/underhallsplan/kart-lankar";
import type { KomponentDetaljData } from "@/components/underhallsplan/komponentregister";
import type { Grunduppgifter } from "@/components/underhallsplan/types";

type BildstodAnalysProps = {
  unlocked: boolean;
  activeComponents: string[];
  grund: Grunduppgifter;
  komponentDetaljer: Record<string, KomponentDetaljData>;
  onOverforYtaTillRegister?: (
    komponent: "Tak" | "Fasad",
    kvm: number,
  ) => void;
  /** Innevarande kalenderår — arbetsyta och nya poster. */
  aktuelltAr?: number;
  planStartAr?: number;
};

const bedömningLabels: Record<StyrelseBedömning, string> = {
  stammer: "Analysen stämmer",
  stammer_inte: "Analysen stämmer inte",
  kontroll_behovs: "Behöver kontroll på plats",
};

function formateraDatum(iso: string): string {
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

export function BildstodAnalys({
  unlocked,
  activeComponents,
  grund,
  komponentDetaljer,
  onOverforYtaTillRegister,
  aktuelltAr: aktuelltArProp,
  planStartAr,
}: BildstodAnalysProps) {
  const boareaKvm =
    Number.parseInt(grund.boarea.replace(/\s/g, ""), 10) || 0;
  const aktuelltAr = aktuelltArProp ?? new Date().getFullYear();

  const aktivaBildKomponenter = useMemo(
    () => bildKomponenter.filter((name) => bildKomponentAktiv(name, activeComponents)),
    [activeComponents],
  );

  const [poster, setPoster] = useState<BildstodPost[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [analyzingKeys, setAnalyzingKeys] = useState<Set<string>>(new Set());
  const [extraSlots, setExtraSlots] = useState(2);
  const [öppetHistorikAr, setÖppetHistorikAr] = useState<number | null>(null);
  const [sparFel, setSparFel] = useState<string | null>(null);

  useEffect(() => {
    const lager = lasBildstodLager();
    setPoster(lager.poster);
    setHydrated(true);
  }, []);

  const persist = useCallback((next: BildstodPost[]) => {
    setPoster(next);
    const result = sparaBildstodLager({ poster: next });
    setSparFel(result.ok ? null : result.message);
  }, []);

  const posterAktuelltAr = useMemo(
    () => hamtaPosterForAr({ poster }, aktuelltAr),
    [poster, aktuelltAr],
  );

  const tidigareAr = useMemo(
    () => hamtaTidigareAr({ poster }, aktuelltAr),
    [poster, aktuelltAr],
  );

  function hamtaPost(komponentKey: string): BildstodPost | undefined {
    return posterAktuelltAr.find((p) => p.komponentKey === komponentKey);
  }

  function sparaPost(patch: Omit<BildstodPost, "uppdaterad" | "ar"> & { ar?: number }) {
    const befintlig = poster.find(
      (p) => p.ar === aktuelltAr && p.komponentKey === patch.komponentKey,
    );
    const post: BildstodPost = {
      id: befintlig?.id ?? patch.id ?? skapaBildstodPostId(),
      ar: patch.ar ?? aktuelltAr,
      komponentKey: patch.komponentKey,
      komponentEtikett: patch.komponentEtikett,
      fileName: patch.fileName ?? null,
      previewDataUrl: patch.previewDataUrl ?? null,
      kalla: patch.kalla ?? null,
      analysis: patch.analysis ?? null,
      bedömning: patch.bedömning ?? null,
      styrelseNotering: patch.styrelseNotering ?? befintlig?.styrelseNotering ?? "",
      kartYta: patch.kartYta ?? befintlig?.kartYta,
      uppdaterad: new Date().toISOString(),
    };
    persist(upsertBildstodPost({ poster }, post).poster);
  }

  function uppdateraKartYta(
    komponentKey: string,
    komponentEtikett: string,
    kartYta: KartYtaData,
  ) {
    const befintlig = hamtaPost(komponentKey);
    sparaPost({
      id: befintlig?.id ?? skapaBildstodPostId(),
      komponentKey,
      komponentEtikett,
      fileName: befintlig?.fileName ?? null,
      previewDataUrl: befintlig?.previewDataUrl ?? null,
      kalla: befintlig?.kalla ?? null,
      analysis: befintlig?.analysis ?? null,
      bedömning: befintlig?.bedömning ?? null,
      styrelseNotering: befintlig?.styrelseNotering ?? "",
      kartYta,
    });
  }

  async function handleUpload(
    komponentKey: string,
    komponentEtikett: string,
    file: File | null,
  ) {
    if (!file) return;
    const previewDataUrl = await lasBildSomDataUrl(file);
    const befintlig = hamtaPost(komponentKey);
    sparaPost({
      id: befintlig?.id ?? skapaBildstodPostId(),
      komponentKey,
      komponentEtikett,
      fileName: file.name,
      previewDataUrl,
      kalla: "upload",
      analysis: null,
      bedömning: null,
      styrelseNotering: befintlig?.styrelseNotering ?? "",
    });
  }

  function analysera(komponentKey: string, komponentEtikett: string) {
    const post = hamtaPost(komponentKey);
    if (!post?.previewDataUrl) return;

    setAnalyzingKeys((s) => new Set(s).add(komponentKey));
    window.setTimeout(() => {
      setAnalyzingKeys((s) => {
        const next = new Set(s);
        next.delete(komponentKey);
        return next;
      });
      sparaPost({
        ...post,
        komponentEtikett,
        analysis: skapaDemoAnalys(komponentKey),
        bedömning: null,
      });
    }, 1400);
  }

  function setBedömning(komponentKey: string, bedömning: StyrelseBedömning) {
    const post = hamtaPost(komponentKey);
    if (!post) return;
    sparaPost({ ...post, bedömning });
  }

  function setNotering(komponentKey: string, styrelseNotering: string) {
    const post = hamtaPost(komponentKey);
    if (!post) return;
    sparaPost({ ...post, styrelseNotering });
  }

  function taBortAktuell(komponentKey: string) {
    const post = hamtaPost(komponentKey);
    if (!post) return;
    persist(taBortBildstodPost({ poster }, post.id).poster);
  }

  const lockedClass = !unlocked ? "pointer-events-none opacity-50" : "";

  if (!hydrated) {
    return (
      <p className="text-sm text-muted">Laddar bildstöd…</p>
    );
  }

  return (
    <div>
      <p className="text-sm leading-relaxed text-muted">
        Ladda upp bilder eller mät ytor med kartor (Google Earth, satellit, Street View).
        För tak och fasad kan du jämföra uppmätt yta med registret och för över m².
        Sparas per kalenderår — <span className="font-medium text-foreground">{aktuelltAr}</span>.
        {planStartAr != null && planStartAr !== aktuelltAr && (
          <span className="block mt-1 text-xs">
            Underhållsplanen startar {planStartAr}; koppla bedömningar till komponenterna
            i registret när du planerar åtgärder.
          </span>
        )}
      </p>
      {sparFel && (
        <p className="mt-2 text-sm font-medium text-red-700" role="alert">
          {sparFel}
        </p>
      )}

      {!unlocked && (
        <p className="mt-4 rounded-lg border border-dashed border-border bg-background px-4 py-3 text-sm text-muted">
          Spara komponentregistret i steg 3 först — därefter öppnas bildstödet.
        </p>
      )}

      <div className={`mt-6 space-y-6 ${lockedClass}`}>
        <div className="rounded-xl border-2 border-amber-200/80 bg-amber-50/90 p-4 sm:p-5">
          <p className="text-sm font-semibold text-amber-950">
            Föreningen avgör — inte systemet
          </p>
          <p className="mt-2 text-sm leading-relaxed text-amber-950/90">
            Bildanalysen är ett stöd vid inventering, inte ett beslut. Styrelsen ska
            alltid bedöma om förslaget stämmer. Underhållsbeslut tas av föreningen.
          </p>
        </div>

        {unlocked &&
          (activeComponents.includes("Tak") ||
            activeComponents.includes("Fasad")) && (
            <div className="rounded-xl border-2 border-[#b8d4c4] bg-[#f7fbf8] p-4 sm:p-5">
              <GoogleKartLankar
                adress={hamtaPrimarAdress(grund.adresser)}
                kontext={
                  activeComponents.includes("Tak") &&
                  activeComponents.includes("Fasad")
                    ? "allmant"
                    : activeComponents.includes("Fasad")
                      ? "fasad"
                      : "tak"
                }
              />
            </div>
          )}

        <div className="rounded-xl border border-primary/25 bg-[#eef6f0]/50 px-4 py-3">
          <p className="text-sm font-semibold text-primary-dark">
            Arbetsyta {aktuelltAr}
          </p>
          <p className="mt-1 text-xs text-muted">
            {posterAktuelltAr.length === 0
              ? "Inga bilder sparade för innevarande år ännu."
              : `${posterAktuelltAr.length} sparad${posterAktuelltAr.length === 1 ? "" : "e"} post${posterAktuelltAr.length === 1 ? "" : "er"} — sparas automatiskt i webbläsaren.`}
          </p>
        </div>

        {aktivaBildKomponenter.length === 0 && unlocked && (
          <p className="rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted">
            Aktivera komponenter som Tak, Fasad eller Trapphus i registret (steg 3) för
            att få bildrutor kopplade till dem.
          </p>
        )}

        {aktivaBildKomponenter.map((komponent) => {
          const post = hamtaPost(komponent);
          const visaKartYta = komponent === "Tak" || komponent === "Fasad";
          return (
            <BildUppladdningsRuta
              key={komponent}
              titel={komponent}
              post={post}
              analyzing={analyzingKeys.has(komponent)}
              onUpload={(file) => handleUpload(komponent, komponent, file)}
              onAnalyze={() => analysera(komponent, komponent)}
              onBedömning={(value) => setBedömning(komponent, value)}
              onNoteringChange={(text) => setNotering(komponent, text)}
              onTaBort={() => taBortAktuell(komponent)}
              webHint={
                visaKartYta
                  ? "Öppna Google Earth eller Maps ovan, ta skärmbild och ladda upp här om du vill mäta i verktyget."
                  : undefined
              }
              kartYtaBlock={
                visaKartYta ? (
                  <KartYtaHjalp
                    typ={komponent}
                    adresser={grund.adresser}
                    bildUrl={post?.previewDataUrl ?? null}
                    boareaKvm={boareaKvm}
                    komponentData={komponentDetaljer[komponent]}
                    kartYta={post?.kartYta}
                    onKartYtaChange={(data) =>
                      uppdateraKartYta(komponent, komponent, data)
                    }
                    onOverforTillRegister={
                      onOverforYtaTillRegister
                        ? (kvm) => onOverforYtaTillRegister(komponent, kvm)
                        : undefined
                    }
                  />
                ) : undefined
              }
            />
          );
        })}

        {Array.from({ length: extraSlots }, (_, index) => {
          const key = `extra-${index + 1}`;
          const titel = `Kompletterande bild ${index + 1}`;
          return (
            <BildUppladdningsRuta
              key={key}
              titel={titel}
              post={hamtaPost(key)}
              analyzing={analyzingKeys.has(key)}
              onUpload={(file) => handleUpload(key, titel, file)}
              onAnalyze={() => analysera(key, titel)}
              onBedömning={(value) => setBedömning(key, value)}
              onNoteringChange={(text) => setNotering(key, text)}
              onTaBort={() => taBortAktuell(key)}
            />
          );
        })}

        <button
          type="button"
          onClick={() => setExtraSlots((count) => count + 1)}
          className="rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
        >
          + Lägg till bildruta
        </button>

        {tidigareAr.length > 0 && (
          <div className="border-t border-border pt-6">
            <h3 className="text-sm font-semibold text-foreground">Historik — tidigare år</h3>
            <p className="mt-1 text-xs text-muted">
              Sparade bedömningar från tidigare inventeringar. Endast läsning — nya bilder
              läggs under {aktuelltAr}.
            </p>
            <ul className="mt-4 space-y-2">
              {tidigareAr.map((ar) => {
                const arPoster = hamtaPosterForAr({ poster }, ar);
                const isOpen = öppetHistorikAr === ar;
                return (
                  <li
                    key={ar}
                    className="overflow-hidden rounded-xl border border-border bg-background/80"
                  >
                    <button
                      type="button"
                      onClick={() => setÖppetHistorikAr(isOpen ? null : ar)}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-[#eef6f0]/40"
                    >
                      <span className="text-sm font-semibold text-foreground">{ar}</span>
                      <span className="text-xs text-muted">
                        {arPoster.length} post{arPoster.length === 1 ? "" : "er"}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="space-y-3 border-t border-border px-4 py-3">
                        {arPoster.map((p) => (
                          <HistorikKort key={p.id} post={p} />
                        ))}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function HistorikKort({ post }: { post: BildstodPost }) {
  return (
    <div className="rounded-lg border border-border bg-white p-3">
      <p className="text-sm font-semibold text-foreground">
        {post.komponentEtikett}
        <span className="ml-2 text-xs font-normal text-muted">
          {formateraDatum(post.uppdaterad)}
        </span>
      </p>
      {post.previewDataUrl && (
        <div className="mt-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.previewDataUrl}
            alt=""
            className="max-h-40 w-full rounded-lg border border-border object-cover sm:max-w-xs"
          />
        </div>
      )}
      {!post.previewDataUrl && post.fileName && (
        <p className="mt-2 text-xs text-muted">Bild: {post.fileName} (ej sparad i historik)</p>
      )}
      {post.analysis && (
        <p className="mt-2 text-xs text-foreground">
          <span className="text-muted">Bedömd typ: </span>
          {post.analysis.bedömdTyp}
        </p>
      )}
      {post.bedömning && (
        <p className="mt-1 text-xs font-medium text-primary-dark">
          {bedömningLabels[post.bedömning]}
        </p>
      )}
      {post.styrelseNotering.trim() && (
        <p className="mt-2 text-xs text-muted">{post.styrelseNotering}</p>
      )}
    </div>
  );
}

type BildUppladdningsRutaProps = {
  titel: string;
  post: BildstodPost | undefined;
  analyzing: boolean;
  onUpload: (file: File | null) => void;
  onAnalyze: () => void;
  onBedömning: (value: StyrelseBedömning) => void;
  onNoteringChange: (text: string) => void;
  onTaBort: () => void;
  extraAction?: React.ReactNode;
  webHint?: string;
  kartYtaBlock?: React.ReactNode;
};

function BildUppladdningsRuta({
  titel,
  post,
  analyzing,
  onUpload,
  onAnalyze,
  onBedömning,
  onNoteringChange,
  onTaBort,
  extraAction,
  webHint,
  kartYtaBlock,
}: BildUppladdningsRutaProps) {
  const previewUrl = post?.previewDataUrl ?? null;

  return (
    <div className="rounded-xl border border-border bg-background/80 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">{titel}</p>
        {post && (
          <button
            type="button"
            onClick={onTaBort}
            className="text-xs text-muted hover:text-red-700"
          >
            Ta bort för i år
          </button>
        )}
      </div>
      {webHint && <p className="mt-1 text-xs text-muted">{webHint}</p>}
      {post && (
        <p className="mt-1 text-xs text-muted">
          Senast uppdaterad {formateraDatum(post.uppdaterad)}
          {post.fileName && !previewUrl && " · miniatyr sparades inte (stor fil)"}
        </p>
      )}

      {kartYtaBlock}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <label className="inline-flex cursor-pointer rounded-lg border border-dashed border-primary/50 bg-white px-4 py-3 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]">
          Välj bild
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => onUpload(event.target.files?.[0] ?? null)}
          />
        </label>
        {extraAction}
        {previewUrl && (
          <button
            type="button"
            onClick={onAnalyze}
            disabled={analyzing}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
          >
            {analyzing ? "Analyserar…" : "Analysera bild"}
          </button>
        )}
      </div>

      {previewUrl && (
        <div className="mt-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt={`Uppladdad bild för ${titel}`}
            className="max-h-56 w-full rounded-lg border border-border object-cover sm:max-w-md"
          />
          {post?.fileName && (
            <p className="mt-2 text-xs text-muted">
              {post.fileName}
              {post.kalla === "web" && " · hämtad från nätet"}
            </p>
          )}
        </div>
      )}

      {post?.analysis && (
        <div className="mt-4 rounded-lg border border-border bg-white p-4">
          <p className="text-sm font-semibold text-primary-dark">
            Förslag från analys
          </p>
          <p className="mt-2 text-sm text-foreground">
            <span className="text-muted">Bedömd typ: </span>
            {post.analysis.bedömdTyp}
          </p>
          <p className="mt-1 text-xs text-muted">
            Osäkerhetsgrad: {post.analysis.osakerhetsgrad}
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-foreground">
            {post.analysis.observationer.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-muted">{post.analysis.förslag}</p>

          <div className="mt-4 border-t border-border pt-4">
            <p className="text-sm font-semibold text-foreground">
              Föreningens bedömning
            </p>
            <p className="mt-1 text-xs text-muted">
              Markera om analysen stämmer. Sparas för {post.ar}.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(Object.keys(bedömningLabels) as StyrelseBedömning[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => onBedömning(key)}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                    post.bedömning === key
                      ? "border-primary bg-[#e2f0e6] text-primary-dark"
                      : "border-border bg-background text-foreground hover:border-primary/50"
                  }`}
                >
                  {bedömningLabels[key]}
                </button>
              ))}
            </div>
            {post.bedömning && (
              <p className="mt-2 text-sm font-medium text-primary-dark">
                Registrerat: {bedömningLabels[post.bedömning]}
              </p>
            )}
          </div>

          <label className="mt-4 block">
            <span className="text-xs font-medium text-muted">
              Anteckning till framtida inventering (valfritt)
            </span>
            <textarea
              value={post.styrelseNotering}
              onChange={(e) => onNoteringChange(e.target.value)}
              rows={2}
              placeholder="t.ex. Fuktmätning bokad våren 2027"
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            />
          </label>
        </div>
      )}
    </div>
  );
}
