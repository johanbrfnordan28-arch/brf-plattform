"use client";

import { useMemo, useState } from "react";
import {
  KomponentAccordionLista,
  KomponentAccordionRad,
  UnderkomponentKort,
  UnderkomponentKortLista,
} from "@/components/underhallsplan/KomponentTrädUi";
import { RenoveringDelFormular } from "@/components/underhallsplan/RenoveringDelFormular";
import { formateraBalkongRenoveringMeta } from "@/components/underhallsplan/BalkongRenoveringFalt";
import { BALKONGER_UNDERKOMPONENT_ID } from "@/components/underhallsplan/balkonger";
import {
  createRenoveringId,
  formatKostnad,
  type KommandeAtgardOverride,
  type UtfördRenovering,
} from "@/components/underhallsplan/renoveringar";
import {
  delFormTillRenovering,
  kommandeAtgardOverridesFranState,
  nastaArInputsFranOverrides,
  nastaArOverridesFranInputs,
  renoveringTillDelForm,
  tomRenoveringDelForm,
} from "@/components/underhallsplan/renovering-del-form";
import {
  gissaInkluderadeUnderkomponenter,
  hamtaHuvudUnderkomponentIdForRenovering,
} from "@/components/underhallsplan/renovering-inkludering";
import { forhandsvisaNastaAtgarder } from "@/components/underhallsplan/renovering-planering";
import {
  hamtaKomponentMall,
  underkomponenterIRenoveringshistorik,
  type KomponentDetaljData,
} from "@/components/underhallsplan/komponentregister";
import type { PlanKostnaderNormaliserade } from "@/components/underhallsplan/plan-kostnader";

type ValdDel = {
  komponent: string;
  underkomponentId: string;
  del: string;
};

type RenoveringshistorikKomponentTrädProps = {
  komponenter: readonly string[];
  renoveringar: UtfördRenovering[];
  planStartAr: number;
  planKostnader?: PlanKostnaderNormaliserade;
  komponentDetaljer?: Record<string, KomponentDetaljData>;
  onLaggTill: (post: UtfördRenovering) => void;
  onUppdatera: (post: UtfördRenovering) => void;
  onTaBort: (id: string) => void;
};

function posterForHelaKomponenten(
  renoveringar: UtfördRenovering[],
  komponent: string,
): UtfördRenovering[] {
  return renoveringar.filter(
    (r) => r.komponent === komponent && !r.underkomponentId?.trim(),
  );
}

function posterForDel(
  renoveringar: UtfördRenovering[],
  komponent: string,
  underkomponentId: string,
): UtfördRenovering[] {
  return renoveringar.filter(
    (r) =>
      r.komponent === komponent &&
      (r.underkomponentId === underkomponentId ||
        (underkomponentId === "fasadmaterial" &&
          r.underkomponentId === "puts") ||
        (!r.underkomponentId &&
          r.del ===
            hamtaKomponentMall(komponent).underkomponenter.find(
              (u) => u.id === underkomponentId,
            )?.etikett)),
  );
}

export function RenoveringshistorikKomponentTräd({
  komponenter,
  renoveringar,
  planStartAr,
  planKostnader,
  komponentDetaljer,
  onLaggTill,
  onUppdatera,
  onTaBort,
}: RenoveringshistorikKomponentTrädProps) {
  const [öppenKomponent, setÖppenKomponent] = useState<string | null>(null);
  const [aktivDel, setAktivDel] = useState<ValdDel | null>(null);
  const [redigerarId, setRedigerarId] = useState<string | null>(null);
  const [delForm, setDelForm] = useState(tomRenoveringDelForm);
  const [nastaArInputs, setNastaArInputs] = useState<Record<string, string>>({});
  const [kommandeAtgardOverrides, setKommandeAtgardOverrides] = useState<
    Record<string, KommandeAtgardOverride>
  >({});
  const [inkluderadeUnderkomponenter, setInkluderadeUnderkomponenter] = useState<
    string[]
  >([]);

  const fordelningKontext = komponentDetaljer
    ? { komponentDetaljer }
    : undefined;

  function avbrytForm() {
    setAktivDel(null);
    setRedigerarId(null);
    setDelForm(tomRenoveringDelForm());
    setNastaArInputs({});
    setKommandeAtgardOverrides({});
    setInkluderadeUnderkomponenter([]);
  }

  function öppnaKomponent(namn: string) {
    setÖppenKomponent((current) => {
      if (current === namn) {
        avbrytForm();
        return null;
      }
      return namn;
    });
  }

  function startaLaggTillHelaKomponenten(komponent: string) {
    setRedigerarId(null);
    setAktivDel({
      komponent,
      underkomponentId: "",
      del: "Hela komponenten (entreprenad)",
    });
    setDelForm(tomRenoveringDelForm());
    setNastaArInputs({});
    setKommandeAtgardOverrides({});
    setInkluderadeUnderkomponenter([]);
    setÖppenKomponent(komponent);
  }

  function startaLaggTill(del: ValdDel) {
    setRedigerarId(null);
    setAktivDel(del);
    const form = tomRenoveringDelForm();
    if (del.underkomponentId === BALKONGER_UNDERKOMPONENT_ID) {
      form.balkongTyp = "utvandig-balkong";
      form.balkongAtgard = "renovering";
    }
    setDelForm(form);
    setNastaArInputs({});
    setKommandeAtgardOverrides({});
    setInkluderadeUnderkomponenter([]);
    setÖppenKomponent(del.komponent);
  }

  function öppnaRedigera(post: UtfördRenovering) {
    const ukId =
      post.underkomponentId ??
      hamtaKomponentMall(post.komponent).underkomponenter.find(
        (u) => u.etikett === post.del,
      )?.id ??
      "";
    setÖppenKomponent(post.komponent);
    setRedigerarId(post.id);
    setAktivDel({
      komponent: post.komponent,
      underkomponentId: ukId,
      del: post.del ?? "",
    });
    setDelForm(renoveringTillDelForm(post));
    const bas = forhandsvisaNastaAtgarder(
      post,
      planStartAr,
      planKostnader,
      fordelningKontext,
    );
    setNastaArInputs(nastaArInputsFranOverrides(bas, post.nastaAtgardArOverrides));
    setKommandeAtgardOverrides(post.kommandeAtgardOverrides ?? {});
    const huvudUk = hamtaHuvudUnderkomponentIdForRenovering(
      post.komponent,
      ukId,
    );
    setInkluderadeUnderkomponenter(
      post.inkluderadeUnderkomponenter ??
        (huvudUk ? gissaInkluderadeUnderkomponenter(post, huvudUk) : []),
    );
  }

  const utkastPost = useMemo(() => {
    if (!aktivDel) return null;
    const befintlig = redigerarId
      ? renoveringar.find((r) => r.id === redigerarId)
      : undefined;
    return delFormTillRenovering({
      form: delForm,
      komponent: aktivDel.komponent,
      underkomponentId: aktivDel.underkomponentId,
      del: aktivDel.del,
      id: redigerarId ?? "utkast",
      kalla: befintlig?.kalla,
      nastaAtgardArOverrides: befintlig?.nastaAtgardArOverrides,
      kommandeAtgardOverrides,
      inkluderadeUnderkomponenter,
    });
  }, [
    aktivDel,
    delForm,
    redigerarId,
    renoveringar,
    kommandeAtgardOverrides,
    inkluderadeUnderkomponenter,
  ]);

  const planeradeBas = useMemo(() => {
    if (!utkastPost || (utkastPost.kostnadKr ?? 0) <= 0) return [];
    return forhandsvisaNastaAtgarder(
      utkastPost,
      planStartAr,
      planKostnader,
      fordelningKontext,
    );
  }, [utkastPost, planStartAr, planKostnader, fordelningKontext]);

  const planerade = useMemo(() => {
    if (!utkastPost || planeradeBas.length === 0) return planeradeBas;
    const overrides = nastaArOverridesFranInputs(planeradeBas, nastaArInputs);
    return forhandsvisaNastaAtgarder(
      {
        ...utkastPost,
        nastaAtgardArOverrides: overrides,
        kommandeAtgardOverrides,
      },
      planStartAr,
      planKostnader,
      fordelningKontext,
    );
  }, [
    utkastPost,
    planeradeBas,
    nastaArInputs,
    kommandeAtgardOverrides,
    planStartAr,
    planKostnader,
    fordelningKontext,
  ]);

  function sparaDelRenovering(event: React.FormEvent) {
    event.preventDefault();
    if (!aktivDel) return;

    const id = redigerarId ?? createRenoveringId();
    const befintlig = redigerarId
      ? renoveringar.find((r) => r.id === redigerarId)
      : undefined;
    const overrides = nastaArOverridesFranInputs(planeradeBas, nastaArInputs);
    const atgardOverrides = kommandeAtgardOverridesFranState(
      planeradeBas,
      kommandeAtgardOverrides,
    );
    const post = delFormTillRenovering({
      form: delForm,
      komponent: aktivDel.komponent,
      underkomponentId: aktivDel.underkomponentId,
      del: aktivDel.del,
      id,
      kalla: befintlig?.kalla,
      nastaAtgardArOverrides: overrides,
      kommandeAtgardOverrides: atgardOverrides,
      inkluderadeUnderkomponenter:
        inkluderadeUnderkomponenter.length > 0
          ? inkluderadeUnderkomponenter
          : undefined,
    });
    if (!post) return;

    if (redigerarId) onUppdatera(post);
    else onLaggTill(post);
    avbrytForm();
  }

  return (
    <div className="rounded-xl border border-border bg-background/80 p-4 sm:p-5">
      <p className="text-sm font-semibold text-foreground">
        Kostnader för utförda entreprenader
      </p>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        Öppna en komponent. Använd &quot;Hela komponenten&quot; när anbud eller
        faktura avser hela taket, fasaden eller motsvarande — annars lägg till
        kostnad per underdel (t.ex. enskild balkong eller hiss).
      </p>

      <KomponentAccordionLista className="mt-4">
        {komponenter.map((namn) => {
          const mall = hamtaKomponentMall(namn);
          const ärÖppen = öppenKomponent === namn;
          const antalKomp = renoveringar.filter((r) => r.komponent === namn).length;
          const helaKomponentPoster = posterForHelaKomponenten(
            renoveringar,
            namn,
          );
          const formHelaKomponent =
            aktivDel?.komponent === namn &&
            aktivDel.underkomponentId === "" &&
            (!redigerarId ||
              helaKomponentPoster.some((p) => p.id === redigerarId));
          const rader = komponentDetaljer?.[namn]?.underkomponenter ?? [];
          const synligaUnderkomponenter = [
            ...underkomponenterIRenoveringshistorik(
              mall,
              (ukId) => posterForDel(renoveringar, namn, ukId).length > 0,
            ).filter((uk) => {
              const rad = rader.find((r) => r.id === uk.id);
              return rad?.medIPlan !== false;
            }),
            ...rader
              .filter((r) => r.ärEgen && r.medIPlan !== false)
              .map((r) => ({
                id: r.id,
                etikett: r.etikett,
                defaultMåttenhet: r.måttenhet,
                måttHint: "Egen del från fastighetens delar.",
              })),
          ];

          return (
            <KomponentAccordionRad
              key={namn}
              namn={namn}
              undertitel={`${synligaUnderkomponenter.length} underkomponenter${
                antalKomp > 0 ? ` · ${antalKomp} renoveringar` : ""
              }`}
              isOpen={ärÖppen}
              onToggle={() => öppnaKomponent(namn)}
            >
              <div className="mb-4 rounded-lg border border-primary/25 bg-[#eef6f0]/40 px-3 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-medium text-foreground">
                    Hela {namn.toLowerCase()} — total entreprenadkostnad
                  </p>
                  <button
                    type="button"
                    onClick={() => startaLaggTillHelaKomponenten(namn)}
                    className="rounded-lg border border-primary px-2.5 py-1 text-xs font-medium text-primary-dark hover:bg-[#e2f0e6]"
                  >
                    + Lägg till utfört arbete (hela komponenten)
                  </button>
                </div>
                {helaKomponentPoster.length > 0 && (
                  <ul className="mt-2 space-y-2">
                    {helaKomponentPoster.map((post) => (
                      <li
                        key={post.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/80 bg-white px-2.5 py-2 text-sm"
                      >
                        <span>
                          {post.ar} · {post.titel}
                          {post.kostnadKr != null && (
                            <span className="ml-1 font-medium tabular-nums">
                              {formatKostnad(post.kostnadKr)}
                            </span>
                          )}
                        </span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => öppnaRedigera(post)}
                            className="text-xs text-primary-dark underline"
                          >
                            Redigera
                          </button>
                          <button
                            type="button"
                            onClick={() => onTaBort(post.id)}
                            className="text-xs text-red-700 underline"
                          >
                            Ta bort
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                {formHelaKomponent &&
                  aktivDel?.komponent === namn &&
                  aktivDel.underkomponentId === "" && (
                    <div className="mt-3">
                      <RenoveringDelFormular
                        rubrik={
                          redigerarId
                            ? `Redigera — hela ${namn}`
                            : `Utfört arbete — hela ${namn}`
                        }
                        komponentNamn={namn}
                        form={delForm}
                        onFormChange={setDelForm}
                        visaStambyteKlumpsumma={false}
                        visaBalkongFalt={false}
                        besiktningRadioName={`bes-hela-${namn}-${redigerarId ?? "ny"}`}
                        planerade={planerade}
                        nastaArInputs={nastaArInputs}
                        onNastaArChange={(id, ar) =>
                          setNastaArInputs((c) => ({ ...c, [id]: ar }))
                        }
                        kommandeAtgardOverrides={kommandeAtgardOverrides}
                        onKommandeAtgardOverrideChange={(id, override) =>
                          setKommandeAtgardOverrides((c) => ({
                            ...c,
                            [id]: override,
                          }))
                        }
                        underkomponentId=""
                        inkluderadeUnderkomponenter={inkluderadeUnderkomponenter}
                        onInkluderadeChange={setInkluderadeUnderkomponenter}
                        utkastRenovering={utkastPost}
                        planKostnader={planKostnader}
                        redigerar={Boolean(redigerarId)}
                        onSubmit={sparaDelRenovering}
                        onAvbryt={avbrytForm}
                      />
                    </div>
                  )}
              </div>
              {synligaUnderkomponenter.length === 0 ? (
                <p className="text-xs text-muted">
                  Inga underkomponenter definierade — använd formuläret nedan.
                </p>
              ) : (
                <UnderkomponentKortLista>
                  {synligaUnderkomponenter.map((uk) => {
                    const poster = posterForDel(renoveringar, namn, uk.id);
                    const delVal: ValdDel = {
                      komponent: namn,
                      underkomponentId: uk.id,
                      del: uk.etikett,
                    };
                    const formÖppen =
                      aktivDel?.komponent === namn &&
                      aktivDel.underkomponentId === uk.id;
                    const ärBalkonger = uk.id === BALKONGER_UNDERKOMPONENT_ID;
                    const balkongRegisterPoster =
                      ärBalkonger && komponentDetaljer?.Balkonger
                        ? (komponentDetaljer.Balkonger.balkongRegister?.[
                            BALKONGER_UNDERKOMPONENT_ID
                          ] ?? [])
                        : undefined;

                    return (
                      <UnderkomponentKort
                        key={uk.id}
                        etikett={uk.etikett}
                        hint={uk.måttHint}
                        visaAktivVäxel={false}
                        headerAction={
                          <button
                            type="button"
                            onClick={() => startaLaggTill(delVal)}
                            className="rounded-lg border border-primary px-2.5 py-1 text-xs font-medium text-primary-dark hover:bg-[#e2f0e6]"
                          >
                            {ärBalkonger
                              ? "+ Lägg till utfört arbete (balkong)"
                              : "+ Lägg till utfört arbete"}
                          </button>
                        }
                      >
                        {poster.length > 0 && (
                          <ul className="space-y-2">
                            {poster.map((post) => {
                              const ärRedigering =
                                redigerarId === post.id && formÖppen;
                              const balkongMeta = formateraBalkongRenoveringMeta(post);
                              return (
                                <li
                                  key={post.id}
                                  className={`rounded-md border px-2.5 py-2 text-sm ${
                                    ärRedigering
                                      ? "border-primary bg-[#eef6f0]/60"
                                      : "border-border/80 bg-background"
                                  }`}
                                >
                                  <div className="flex flex-wrap items-start justify-between gap-2">
                                    <button
                                      type="button"
                                      onClick={() => öppnaRedigera(post)}
                                      className="min-w-0 flex-1 text-left"
                                    >
                                      <p className="font-medium text-foreground">
                                        {post.ar} — {post.titel}
                                      </p>
                                      <p className="text-xs text-muted">
                                        {formatKostnad(post.kostnadKr)}
                                        {(post.avdragProcent ?? 0) > 0 &&
                                          ` · avdrag ${post.avdragProcent}%`}
                                        {balkongMeta && ` · ${balkongMeta}`}
                                      </p>
                                    </button>
                                    <div className="flex shrink-0 gap-2">
                                      <button
                                        type="button"
                                        onClick={() => öppnaRedigera(post)}
                                        className="text-xs font-medium text-primary-dark hover:underline"
                                      >
                                        Redigera
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (redigerarId === post.id) avbrytForm();
                                          onTaBort(post.id);
                                        }}
                                        className="text-xs text-muted hover:text-red-700"
                                      >
                                        Ta bort
                                      </button>
                                    </div>
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        )}

                        {formÖppen && (
                          <RenoveringDelFormular
                            rubrik={
                              redigerarId
                                ? `Redigera — ${namn} / ${uk.etikett}`
                                : ärBalkonger
                                  ? `Utfört arbete — balkong, ${namn}`
                                  : `Utfört arbete — ${namn} / ${uk.etikett}`
                            }
                            komponentNamn={namn}
                            form={delForm}
                            onFormChange={setDelForm}
                            visaStambyteKlumpsumma={uk.id === "stambyte"}
                            visaBalkongFalt={ärBalkonger}
                            balkongRegisterPoster={balkongRegisterPoster}
                            besiktningRadioName={`bes-${uk.id}-${redigerarId ?? "ny"}`}
                            planerade={planerade}
                            nastaArInputs={nastaArInputs}
                            onNastaArChange={(id, ar) =>
                              setNastaArInputs((c) => ({ ...c, [id]: ar }))
                            }
                            kommandeAtgardOverrides={kommandeAtgardOverrides}
                            onKommandeAtgardOverrideChange={(id, override) =>
                              setKommandeAtgardOverrides((c) => ({
                                ...c,
                                [id]: override,
                              }))
                            }
                            underkomponentId={uk.id}
                            inkluderadeUnderkomponenter={inkluderadeUnderkomponenter}
                            onInkluderadeChange={setInkluderadeUnderkomponenter}
                            utkastRenovering={utkastPost}
                            planKostnader={planKostnader}
                            redigerar={Boolean(redigerarId)}
                            onSubmit={sparaDelRenovering}
                            onAvbryt={avbrytForm}
                          />
                        )}
                      </UnderkomponentKort>
                    );
                  })}
                </UnderkomponentKortLista>
              )}
            </KomponentAccordionRad>
          );
        })}
      </KomponentAccordionLista>
    </div>
  );
}
