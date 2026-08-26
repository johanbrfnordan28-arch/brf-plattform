"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { OppnaStangIkon } from "@/components/OppnaStangKnapp";
import { ContentSection } from "@/components/ContentSection";
import { DokumentbankPanel } from "@/components/dokumentbank/DokumentbankPanel";
import type { DokumentbankMall } from "@/components/dokumentbank/mallar";
import {
  arInramadUpphandlingsGrupp,
  kategoriId,
  skapaDokumentId,
  standardDokumentPlatser,
  upphandlingsGrupper,
  type UpphandlingsGrupp,
  type UpphandlingsKategori,
} from "@/components/upphandling/kategorier";
import {
  lasUpphandlingKategoriDokument,
  sparaUpphandlingKategoriDokument,
  upphandlingKategoriDokumentStorageKey,
  type DokumentRef,
  type KategoriDokumentState,
} from "@/components/upphandling/upphandling-dokument-lager";
import {
  formatDatum,
  formatTidpunkt,
  hamtaSpårbarhetForUpphandling,
  hamtaStyrelseBeslut,
  hamtaUtvarderingForUpphandling,
  hamtaUpphandlingsStatus,
  harTillrackligaGodkannanden,
  kravStyrelseGodkannanden,
  lasUpphandlingLager,
  publiceraUpphandling,
  sparaUpphandlingLager,
  statusEtikett,
  uppdateraKategoriMeta,
  upphandlingStorageKey,
  type KategoriUpphandlingMeta,
} from "@/components/upphandling/upphandling-lager";
import { DriftUpphandlingSchemaPanel } from "@/components/upphandling/DriftUpphandlingSchemaPanel";
import {
  StyrelseBeslutSektion,
  StyrelseGodkannandeSektion,
} from "@/components/upphandling/StyrelseUpphandlingPanel";

type KategoriState = KategoriDokumentState;

type VäljMål =
  | { typ: "plats"; kategoriId: string; platsId: string }
  | { typ: "extra"; kategoriId: string; extraId: string }
  | null;

/** Kategorier + dokumentbank i egna sektioner (banken före publicering). */
export function UpphandlingSidaInnehall() {
  const [kategorier, setKategorier] = useState<Record<string, KategoriState>>(
    {},
  );
  const [meta, setMeta] = useState<Record<string, KategoriUpphandlingMeta>>({});
  const [väljMål, setVäljMål] = useState<VäljMål>(null);
  const [senastValdBank, setSenastValdBank] = useState<string | null>(null);
  const [publiceringsFel, setPubliceringsFel] = useState<Record<string, string>>({});
  const [hydrated, setHydrated] = useState(false);
  const [lagerVersion, setLagerVersion] = useState(0);
  const skipFirstKategoriSave = useRef(true);

  function uppdateraFranLager() {
    const lager = lasUpphandlingLager();
    setMeta(lager.kategorier);
    setLagerVersion((v) => v + 1);
  }

  useEffect(() => {
    const lager = lasUpphandlingLager();
    setMeta(lager.kategorier);
    setKategorier(lasUpphandlingKategoriDokument());
    skipFirstKategoriSave.current = true;
    setHydrated(true);

    function onStorage(event: StorageEvent) {
      if (event.key === upphandlingStorageKey()) uppdateraFranLager();
      if (event.key === upphandlingKategoriDokumentStorageKey()) {
        setKategorier(lasUpphandlingKategoriDokument());
        skipFirstKategoriSave.current = true;
      }
    }
    function onCustom() {
      uppdateraFranLager();
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener("upphandling-lager-uppdaterad", onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("upphandling-lager-uppdaterad", onCustom);
    };
  }, []);

  useEffect(() => {
    if (!hydrated || Object.keys(kategorier).length === 0) return;
    if (skipFirstKategoriSave.current) {
      skipFirstKategoriSave.current = false;
      return;
    }
    sparaUpphandlingKategoriDokument(kategorier);
  }, [kategorier, hydrated]);

  function uppdateraMeta(kategoriKey: string, patch: Partial<KategoriUpphandlingMeta>) {
    const lager = lasUpphandlingLager();
    const nytt = uppdateraKategoriMeta(lager, kategoriKey, patch);
    sparaUpphandlingLager(nytt);
    setMeta(nytt.kategorier);
    setPubliceringsFel((current) => {
      const next = { ...current };
      delete next[kategoriKey];
      return next;
    });
  }

  function publicera(kategoriKey: string, kategoriNamn: string) {
    const lager = lasUpphandlingLager();
    const result = publiceraUpphandling(lager, kategoriKey, kategoriNamn);
    if ("fel" in result) {
      setPubliceringsFel((current) => ({ ...current, [kategoriKey]: result.fel }));
      return;
    }
    sparaUpphandlingLager(result.lager);
    uppdateraFranLager();
    setPubliceringsFel((current) => {
      const next = { ...current };
      delete next[kategoriKey];
      return next;
    });
  }

  function toggleKategori(id: string) {
    setKategorier((current) => ({
      ...current,
      [id]: { ...current[id], öppen: !current[id].öppen },
    }));
  }

  function sättPlatsDokument(
    kategoriKey: string,
    platsId: string,
    dokument: DokumentRef | null,
  ) {
    setKategorier((current) => ({
      ...current,
      [kategoriKey]: {
        ...current[kategoriKey],
        platser: { ...current[kategoriKey].platser, [platsId]: dokument },
      },
    }));
  }

  function sättExtraDokument(
    kategoriKey: string,
    extraId: string,
    dokument: DokumentRef | null,
  ) {
    setKategorier((current) => ({
      ...current,
      [kategoriKey]: {
        ...current[kategoriKey],
        extra: current[kategoriKey].extra.map((rad) =>
          rad.id === extraId ? { ...rad, dokument } : rad,
        ),
      },
    }));
  }

  function laddaUppPlats(kategoriKey: string, platsId: string, fil: File | null) {
    if (!fil) return;
    sättPlatsDokument(kategoriKey, platsId, { filnamn: fil.name, källa: "upload" });
  }

  function laddaUppExtra(kategoriKey: string, extraId: string, fil: File | null) {
    if (!fil) return;
    sättExtraDokument(kategoriKey, extraId, { filnamn: fil.name, källa: "upload" });
  }

  function läggTillExtraDokument(kategoriKey: string) {
    setKategorier((current) => ({
      ...current,
      [kategoriKey]: {
        ...current[kategoriKey],
        extra: [
          ...current[kategoriKey].extra,
          {
            id: skapaDokumentId(),
            etikett: "Kompletterande dokument",
            dokument: null,
          },
        ],
      },
    }));
  }

  function taBortExtra(kategoriKey: string, extraId: string) {
    setKategorier((current) => ({
      ...current,
      [kategoriKey]: {
        ...current[kategoriKey],
        extra: current[kategoriKey].extra.filter((rad) => rad.id !== extraId),
      },
    }));
  }

  function väljFrånBank(mall: DokumentbankMall) {
    setSenastValdBank(mall.id);
    if (!väljMål) return;

    const ref: DokumentRef = {
      filnamn: mall.filnamn,
      källa: "bank",
      bankId: mall.id,
    };

    if (väljMål.typ === "plats") {
      sättPlatsDokument(väljMål.kategoriId, väljMål.platsId, ref);
    } else {
      sättExtraDokument(väljMål.kategoriId, väljMål.extraId, ref);
    }
    setVäljMål(null);
  }

  const kategoriProps = {
    kategorier,
    meta,
    hydrated,
    lagerVersion,
    publiceringsFel,
    väljMål,
    onToggle: toggleKategori,
    onUppdateraMeta: uppdateraMeta,
    onPublicera: publicera,
    onUppdaterad: uppdateraFranLager,
    onVäljPlatsBank: (key: string, platsId: string) =>
      setVäljMål({ typ: "plats", kategoriId: key, platsId }),
    onVäljExtraBank: (key: string, extraId: string) =>
      setVäljMål({ typ: "extra", kategoriId: key, extraId }),
    onUploadPlats: laddaUppPlats,
    onUploadExtra: laddaUppExtra,
    onLäggTillExtra: läggTillExtraDokument,
    onTaBortExtra: taBortExtra,
    onRensaPlats: (key: string, platsId: string) =>
      sättPlatsDokument(key, platsId, null),
    onRensaExtra: (key: string, extraId: string) =>
      sättExtraDokument(key, extraId, null),
  };

  return (
    <>
      <ContentSection title="Så arbetar styrelsen" plain>
        <div className="rounded-xl border border-primary/25 bg-[#eef6f0]/50 p-5 text-sm leading-relaxed text-foreground">
          <ol className="list-decimal space-y-2 pl-5">
            <li>
              Ta in en <strong>projektledare</strong> (kategori under Konsulter &
              specialisttjänster) som hjälper styrelsen ta fram handlingarna —
              beskrivning, underlag och anbudsunderlag.
            </li>
            <li>Ladda upp eller hämta mallar till förfrågningsunderlaget per kategori.</li>
            <li>
              När handlingarna är i slutskedet: anlita en{" "}
              <strong>besiktningsman/kvinna</strong> som får i uppgift att läsa
              handlingarna utifrån det hen senare ska besiktiga. På det sätt
              minimeras kostnader för oklarheter och tilläggsarbeten i
              efterhand.
            </li>
            <li>
              När projektledare och besiktningsman är klara ska styrelsen godkänna
              handlingarna — två styrelseledamöter — innan de släpps för
              upphandling.
            </li>
            <li>Ange sista anbudsdag och publicera till BRF Företags sida.</li>
            <li>
              Efter anbudsutvärdering godkänner två ledamöter beslutet och registrerar
              protokollfört och/eller mejlbeslut — spårbart för framtiden.
            </li>
            <li>
              Inkomna anbud hanteras av BRF Företag och visas <strong>inte</strong> för
              styrelsen.
            </li>
          </ol>
        </div>
      </ContentSection>

      <ContentSection title="Kategorier och dokument" plain>
        <div className="space-y-8">
          {upphandlingsGrupper.map((grupp) => (
            <UpphandlingsGruppSektion key={grupp.id} grupp={grupp} {...kategoriProps} />
          ))}
        </div>
      </ContentSection>

      <ContentSection title="Dokumentbank" plain>
        <div className="space-y-4">
          {väljMål && (
            <p className="rounded-lg border border-primary/40 bg-[#e8f3ec] px-4 py-3 text-sm text-primary-dark">
              Du har valt en plats i en kategori — välj en mall nedan så kopplas den
              till rätt dokumentplats.
            </p>
          )}
          <DokumentbankPanel onVälj={väljFrånBank} aktivVal={senastValdBank} />
        </div>
      </ContentSection>
    </>
  );
}

function gruppSektionKlass(gruppId: UpphandlingsGrupp["id"]): string {
  if (!arInramadUpphandlingsGrupp(gruppId)) return "";
  return "rounded-2xl border-2 border-dashed border-primary/35 bg-[#eef6f0]/60 p-4 sm:p-6";
}

type UpphandlingsGruppSektionProps = {
  grupp: UpphandlingsGrupp;
  kategorier: Record<string, KategoriState>;
  meta: Record<string, KategoriUpphandlingMeta>;
  hydrated: boolean;
  lagerVersion: number;
  publiceringsFel: Record<string, string>;
  väljMål: VäljMål;
  onToggle: (id: string) => void;
  onUppdateraMeta: (kategoriKey: string, patch: Partial<KategoriUpphandlingMeta>) => void;
  onPublicera: (kategoriKey: string, kategoriNamn: string) => void;
  onUppdaterad: () => void;
  onVäljPlatsBank: (kategoriKey: string, platsId: string) => void;
  onVäljExtraBank: (kategoriKey: string, extraId: string) => void;
  onUploadPlats: (kategoriKey: string, platsId: string, fil: File | null) => void;
  onUploadExtra: (kategoriKey: string, extraId: string, fil: File | null) => void;
  onLäggTillExtra: (kategoriKey: string) => void;
  onTaBortExtra: (kategoriKey: string, extraId: string) => void;
  onRensaPlats: (kategoriKey: string, platsId: string) => void;
  onRensaExtra: (kategoriKey: string, extraId: string) => void;
};

function UpphandlingsGruppSektion({
  grupp,
  kategorier,
  meta,
  hydrated,
  lagerVersion,
  publiceringsFel,
  väljMål,
  onToggle,
  onUppdateraMeta,
  onPublicera,
  onUppdaterad,
  onVäljPlatsBank,
  onVäljExtraBank,
  onUploadPlats,
  onUploadExtra,
  onLäggTillExtra,
  onTaBortExtra,
  onRensaPlats,
  onRensaExtra,
}: UpphandlingsGruppSektionProps) {
  const inramad = arInramadUpphandlingsGrupp(grupp.id);
  const sektionKlass = inramad ? gruppSektionKlass(grupp.id) : "";

  return (
    <section
      className={sektionKlass}
      aria-labelledby={`grupp-${grupp.id}`}
      id={`grupp-${grupp.id}`}
    >
      <header className={inramad ? "mb-4" : "mb-3"}>
        <h3 className="text-lg font-semibold text-foreground">{grupp.titel}</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted">{grupp.beskrivning}</p>
      </header>
      <ul className="space-y-3">
        {grupp.kategorier.map((namn) => {
          const key = kategoriId(namn);
          const state = kategorier[key];
          if (!state) return null;
          return (
            <KategoriKort
              key={key}
              kategoriKey={key}
              namn={namn as UpphandlingsKategori}
              state={state}
              meta={meta[key]}
              hydrated={hydrated}
              lagerVersion={lagerVersion}
              publiceringsFel={publiceringsFel[key]}
              väljMål={väljMål}
              onToggle={() => onToggle(key)}
              onUppdateraMeta={(patch) => onUppdateraMeta(key, patch)}
              onPublicera={() => onPublicera(key, namn)}
              onUppdaterad={onUppdaterad}
              onVäljPlatsBank={(platsId) => onVäljPlatsBank(key, platsId)}
              onVäljExtraBank={(extraId) => onVäljExtraBank(key, extraId)}
              onUploadPlats={(platsId, fil) => onUploadPlats(key, platsId, fil)}
              onUploadExtra={(extraId, fil) => onUploadExtra(key, extraId, fil)}
              onLäggTillExtra={() => onLäggTillExtra(key)}
              onTaBortExtra={(extraId) => onTaBortExtra(key, extraId)}
              onRensaPlats={(platsId) => onRensaPlats(key, platsId)}
              onRensaExtra={(extraId) => onRensaExtra(key, extraId)}
            />
          );
        })}
      </ul>
    </section>
  );
}

type KategoriKortProps = {
  kategoriKey: string;
  namn: UpphandlingsKategori;
  state: KategoriState;
  meta?: KategoriUpphandlingMeta;
  hydrated: boolean;
  lagerVersion: number;
  publiceringsFel?: string;
  väljMål: VäljMål;
  onToggle: () => void;
  onUppdateraMeta: (patch: Partial<KategoriUpphandlingMeta>) => void;
  onPublicera: () => void;
  onUppdaterad: () => void;
  onVäljPlatsBank: (platsId: string) => void;
  onVäljExtraBank: (extraId: string) => void;
  onUploadPlats: (platsId: string, fil: File | null) => void;
  onUploadExtra: (extraId: string, fil: File | null) => void;
  onLäggTillExtra: () => void;
  onTaBortExtra: (extraId: string) => void;
  onRensaPlats: (platsId: string) => void;
  onRensaExtra: (extraId: string) => void;
};

function KategoriKort({
  kategoriKey,
  namn,
  state,
  meta,
  hydrated,
  lagerVersion,
  publiceringsFel,
  väljMål,
  onToggle,
  onUppdateraMeta,
  onPublicera,
  onUppdaterad,
  onVäljPlatsBank,
  onVäljExtraBank,
  onUploadPlats,
  onUploadExtra,
  onLäggTillExtra,
  onTaBortExtra,
  onRensaPlats,
  onRensaExtra,
}: KategoriKortProps) {
  const antalIfyllda =
    Object.values(state.platser).filter(Boolean).length +
    state.extra.filter((rad) => rad.dokument).length;

  void lagerVersion;
  const lager = lasUpphandlingLager();
  const publicerad = meta?.publiceradId
    ? lager.publicerade.find((u) => u.id === meta.publiceradId)
    : undefined;
  const utvardering = meta?.publiceradId
    ? hamtaUtvarderingForUpphandling(meta.publiceradId)
    : undefined;
  const beslut = meta?.publiceradId
    ? hamtaStyrelseBeslut(lager, meta.publiceradId)
    : undefined;
  const status = publicerad
    ? hamtaUpphandlingsStatus(publicerad, utvardering, beslut)
    : null;

  return (
    <li className="rounded-xl border border-border bg-surface shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left sm:px-5"
        aria-expanded={state.öppen}
      >
        <span>
          <span className="block text-base font-semibold text-foreground">{namn}</span>
          <span className="mt-1 block text-sm text-muted">
            Tre standarddokument + möjlighet att lägga till fler
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          {publicerad && (
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary-dark">
              {status === "beslutat" ? "Beslutat" : "Publicerad"}
            </span>
          )}
          {antalIfyllda > 0 && (
            <span className="rounded-full bg-[#eef6f0] px-2.5 py-0.5 text-xs font-medium text-primary-dark">
              {antalIfyllda} dokument
            </span>
          )}
          <OppnaStangIkon oppen={state.öppen} />
        </span>
      </button>

      {state.öppen && (
        <div className="space-y-4 border-t border-border px-4 pb-5 pt-4 sm:px-5">
          <DriftUpphandlingSchemaPanel kategoriNamn={namn} />

          {standardDokumentPlatser.map((plats) => (
            <DokumentRad
              key={plats.id}
              etikett={plats.etikett}
              dokument={state.platser[plats.id]}
              aktivBank={
                väljMål?.typ === "plats" &&
                väljMål.kategoriId === kategoriKey &&
                väljMål.platsId === plats.id
              }
              onUpload={(fil) => onUploadPlats(plats.id, fil)}
              onFrånBank={() => onVäljPlatsBank(plats.id)}
              onRensa={() => onRensaPlats(plats.id)}
            />
          ))}

          {state.extra.map((rad) => (
            <DokumentRad
              key={rad.id}
              etikett={rad.etikett}
              dokument={rad.dokument}
              aktivBank={
                väljMål?.typ === "extra" &&
                väljMål.kategoriId === kategoriKey &&
                väljMål.extraId === rad.id
              }
              onUpload={(fil) => onUploadExtra(rad.id, fil)}
              onFrånBank={() => onVäljExtraBank(rad.id)}
              onRensa={() => onRensaExtra(rad.id)}
              onTaBort={() => onTaBortExtra(rad.id)}
            />
          ))}

          <button
            type="button"
            onClick={onLäggTillExtra}
            className="rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
          >
            + Lägg till dokument
          </button>

          {hydrated && (
            <PubliceringsPanel
              kategoriKey={kategoriKey}
              kategoriNamn={namn}
              meta={meta}
              lagerVersion={lagerVersion}
              publicerad={publicerad}
              status={status}
              utvardering={utvardering}
              publiceringsFel={publiceringsFel}
              onUppdateraMeta={onUppdateraMeta}
              onPublicera={onPublicera}
              onUppdaterad={onUppdaterad}
            />
          )}
        </div>
      )}
    </li>
  );
}

type PubliceringsPanelProps = {
  kategoriKey: string;
  kategoriNamn: string;
  meta?: KategoriUpphandlingMeta;
  lagerVersion: number;
  publicerad?: ReturnType<typeof lasUpphandlingLager>["publicerade"][number];
  status: ReturnType<typeof hamtaUpphandlingsStatus> | null;
  utvardering?: ReturnType<typeof hamtaUtvarderingForUpphandling>;
  publiceringsFel?: string;
  onUppdateraMeta: (patch: Partial<KategoriUpphandlingMeta>) => void;
  onPublicera: () => void;
  onUppdaterad: () => void;
};

function PubliceringsPanel({
  kategoriKey,
  kategoriNamn,
  meta,
  lagerVersion,
  publicerad,
  status,
  utvardering,
  publiceringsFel,
  onUppdateraMeta,
  onPublicera,
  onUppdaterad,
}: PubliceringsPanelProps) {
  void lagerVersion;
  const komplett = meta?.förfrågningsunderlagKomplett ?? false;
  const publiceringsGodkannanden = meta?.publiceringsGodkannanden ?? [];
  const kanPublicera =
    komplett && harTillrackligaGodkannanden(publiceringsGodkannanden);
  const spårbarhet = publicerad
    ? hamtaSpårbarhetForUpphandling(lasUpphandlingLager(), publicerad.id)
    : [];

  return (
    <div className="mt-6 space-y-4 rounded-xl border border-primary/25 bg-[#eef6f0]/40 p-4 sm:p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">
          Styrelse · spårbart
        </p>
        <h4 className="mt-1 text-sm font-semibold text-foreground">Publicering</h4>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          Två styrelseledamöter godkänner innan upphandlingen publiceras på BRF Företags
          sida. Alla steg loggas för framtida spårbarhet.
        </p>
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-background p-3">
        <input
          type="checkbox"
          checked={komplett}
          onChange={(event) =>
            onUppdateraMeta({ förfrågningsunderlagKomplett: event.target.checked })
          }
          className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
        />
        <span>
          <span className="block text-sm font-medium text-foreground">
            Förfrågningsunderlaget är komplett
          </span>
          <span className="mt-0.5 block text-xs text-muted">
            Styrelsen intygar att beskrivning, underlag och anbudsformulär är på plats
            för {kategoriNamn.toLowerCase()}.
          </span>
        </span>
      </label>

      <StyrelseGodkannandeSektion
        rubrik="Godkännande inför publicering"
        beskrivning={`Minst ${kravStyrelseGodkannanden} olika styrelseledamöter måste godkänna innan upphandlingen kan publiceras.`}
        godkannanden={publiceringsGodkannanden}
        kategoriKey={kategoriKey}
        typ="publicering"
        inaktiverad={!komplett}
        onUppdaterad={onUppdaterad}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-foreground">Titel på upphandling</span>
          <input
            type="text"
            value={meta?.titel ?? ""}
            onChange={(event) => onUppdateraMeta({ titel: event.target.value })}
            placeholder={`T.ex. ${kategoriNamn} — Brf …`}
            className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-foreground">Ort</span>
          <input
            type="text"
            value={meta?.ort ?? ""}
            onChange={(event) => onUppdateraMeta({ ort: event.target.value })}
            placeholder="T.ex. Stockholm"
            className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm sm:col-span-2 sm:max-w-xs">
          <span className="font-medium text-foreground">Sista anbudsdag</span>
          <input
            type="date"
            value={meta?.sistaAnbudsdag ?? ""}
            onChange={(event) =>
              onUppdateraMeta({ sistaAnbudsdag: event.target.value })
            }
            className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </label>
      </div>

      {publiceringsFel && (
        <p className="text-sm text-red-700" role="alert">
          {publiceringsFel}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onPublicera}
          disabled={!kanPublicera}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {publicerad ? "Uppdatera publicering" : "Publicera upphandling"}
        </button>
        {!harTillrackligaGodkannanden(publiceringsGodkannanden) && komplett && (
          <p className="text-xs text-muted">
            Väntar på {kravStyrelseGodkannanden - publiceringsGodkannanden.length}{" "}
            godkännande till.
          </p>
        )}
        {publicerad && (
          <Link
            href="/upphandling"
            className="text-sm font-medium text-primary hover:text-primary-dark"
          >
            Visa på företagssidan →
          </Link>
        )}
      </div>

      {publicerad && (
        <div className="rounded-lg border border-border bg-background p-4 text-sm">
          <p className="font-medium text-foreground">
            {status ? statusEtikett(status) : "Publicerad"}
          </p>
          <p className="mt-1 text-muted">
            Sista anbudsdag: {formatDatum(publicerad.sistaAnbudsdag)}
          </p>
          <p className="mt-2 text-xs text-muted">
            Inkomna anbud hanteras av BRF Företag och visas inte för styrelsen.
          </p>
        </div>
      )}

      {utvardering && publicerad && (
        <>
          <div className="rounded-lg border-2 border-primary/30 bg-surface p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">
              Anbudsutvärdering till styrelsen
            </p>
            <p className="mt-2 text-sm leading-relaxed text-foreground">
              {utvardering.sammanfattning}
            </p>
            <p className="mt-3 text-sm font-medium text-foreground">
              {utvardering.rekommendation}
            </p>
            <p className="mt-2 text-xs text-muted">
              Levererad {formatDatum(utvardering.levererad)} — grund för styrelsens beslut.
            </p>
          </div>

          <StyrelseBeslutSektion
            upphandlingId={publicerad.id}
            onUppdaterad={onUppdaterad}
          />
        </>
      )}

      {publicerad && spårbarhet.length > 0 && !utvardering && (
        <details className="rounded-lg border border-border bg-background/80 p-4">
          <summary className="cursor-pointer text-sm font-semibold text-foreground">
            Spårbarhetslogg ({spårbarhet.length})
          </summary>
          <ol className="mt-3 space-y-2 border-t border-border pt-3">
            {spårbarhet.map((rad) => (
              <li key={rad.id} className="text-xs leading-relaxed text-muted">
                <span className="font-medium text-foreground">
                  {formatTidpunkt(rad.tidpunkt)}
                </span>
                {" · "}
                {rad.beskrivning}
              </li>
            ))}
          </ol>
        </details>
      )}
    </div>
  );
}

type DokumentRadProps = {
  etikett: string;
  dokument: DokumentRef | null;
  aktivBank: boolean;
  onUpload: (fil: File | null) => void;
  onFrånBank: () => void;
  onRensa: () => void;
  onTaBort?: () => void;
};

function DokumentRad({
  etikett,
  dokument,
  aktivBank,
  onUpload,
  onFrånBank,
  onRensa,
  onTaBort,
}: DokumentRadProps) {
  return (
    <div className="rounded-lg border border-border bg-background/80 p-4">
      <p className="text-sm font-medium text-foreground">{etikett}</p>
      {dokument ? (
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-foreground">
            {dokument.filnamn}
            <span className="ml-2 text-xs text-muted">
              ({dokument.källa === "bank" ? "dokumentbank" : "uppladdad"})
            </span>
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onRensa}
              className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted hover:text-foreground"
            >
              Ta bort
            </button>
            {onTaBort && (
              <button
                type="button"
                onClick={onTaBort}
                className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted hover:border-red-300 hover:text-red-700"
              >
                Radera rad
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          <label className="cursor-pointer rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-dark">
            Ladda upp fil
            <input
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,application/pdf"
              className="sr-only"
              onChange={(event) => onUpload(event.target.files?.[0] ?? null)}
            />
          </label>
          <button
            type="button"
            onClick={onFrånBank}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
              aktivBank
                ? "border-primary bg-[#e2f0e6] text-primary-dark"
                : "border-primary text-primary-dark hover:bg-[#e2f0e6]"
            }`}
          >
            Från dokumentbanken
          </button>
        </div>
      )}
    </div>
  );
}
