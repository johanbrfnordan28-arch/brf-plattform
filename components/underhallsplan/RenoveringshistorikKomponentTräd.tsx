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
import { renoveringMaterialEtikett } from "@/components/underhallsplan/renovering-material";
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
        Välj komponent och underkomponent
      </p>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        Klicka på en komponent för att se alla underkomponenter. Lägg till eller
        redigera poster per tillfälle — t.ex. hiss, balkonger etapp 1 och 2.
      </p>

      <KomponentAccordionLista className="mt-4">
        {komponenter.map((namn) => {
          const mall = hamtaKomponentMall(namn);
          const ärÖppen = öppenKomponent === namn;
          const antalKomp = renoveringar.filter((r) => r.komponent === namn).length;
          const synligaUnderkomponenter = underkomponenterIRenoveringshistorik(
            mall,
            (ukId) => posterForDel(renoveringar, namn, ukId).length > 0,
          );

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
                            {ärBalkonger ? "+ Lägg till balkong" : "+ Lägg till här"}
                          </button>
                        }
                      >
                        {poster.length > 0 && (
                          <ul className="space-y-2">
                            {poster.map((post) => {
                              const ärRedigering =
                                redigerarId === post.id && formÖppen;
                              const balkongMeta = formateraBalkongRenoveringMeta(post);
                              const materialText = renoveringMaterialEtikett(post.material);
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
                                        {materialText && ` · ${materialText}`}
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
                                  ? `Ny balkongrenovering — ${namn}`
                                  : `Ny renovering — ${namn} / ${uk.etikett}`
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
