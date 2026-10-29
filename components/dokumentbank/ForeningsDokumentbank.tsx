"use client";

import { useEffect, useRef, useState } from "react";
import {
  DOKUMENT_STATUS_ETIKETTER,
  FORENINGS_DOK_EVENT,
  lasForeningsDokument,
  laddaNedDokument,
  skapaForeningsDokumentId,
  sparaForeningsDokument,
  type DokumentStatus,
  type ForeningsDokument,
} from "@/components/dokumentbank/forening-dokumenter-lager";
import {
  OMRADE_ETIKETTER,
  dokumentbankMallar,
  hamtaMall,
  type DokumentMallOmrade,
  type DokumentbankMall,
} from "@/components/dokumentbank/mallar";
import {
  DOKUMENTBANK_EGNA_EVENT,
  hamtaAllaUpphandlingsMallar,
  lasEgnaDokumentbankMallar,
  läggTillEgenDokumentbankMall,
  taBortEgenDokumentbankMall,
} from "@/components/dokumentbank/dokumentbank-lager";
import {
  hamtaForeningsDokumentInnehall,
  skapaInnehallFranMall,
} from "@/components/dokumentbank/forening-dokument-innehall";
import { LaggTillIProjektDialog } from "@/components/dokumentbank/LaggTillIProjektDialog";
import { ForeningsDokumentRedigeraPanel } from "@/components/dokumentbank/ForeningsDokumentRedigeraPanel";
import {
  arEntreprenadAvtalDokument,
  byggSignaturStatusText,
} from "@/components/dokumentbank/forening-dokument-avtal";
import { hamtaAvtalFormForMall } from "@/components/dokumentbank/mallar/entreprenadavtal-mallar";
import { tomDokumentEntreprenor } from "@/components/dokumentbank/forening-dokumenter-lager";
import { DokumentForhandsgranskaDialog } from "@/components/dokumentbank/DokumentForhandsgranskaDialog";
import {
  DOKUMENT_LAYOUT_ETIKETTER,
  STANDARD_DOKUMENT_LAYOUT,
  type DokumentLayoutTema,
} from "@/components/dokumentbank/dokument-layout";
import { taBortDokumentFil } from "@/components/dokumentbank/forening-dokument-fil-lager";
import { skapaForeningsDokumentFranFil } from "@/components/dokumentbank/forening-dokument-uppladdning";
import {
  laddaNedForeningsDokumentFil,
  oppnaForeningsDokumentPreview,
} from "@/components/dokumentbank/forening-dokument-visning";
import { lasFilSomText } from "@/components/dokumentbank/forening-dokument-fil-lager";
import { skapaForeningsDokumentEgenkontroll } from "@/components/dokumentbank/forening-dokument-egenkontroll";
import { arEgenkontrollMallId } from "@/components/dokumentbank/mallar/egenkontroll-mallar";
import { arEgenkontrollDokument } from "@/components/dokumentbank/forening-dokument-egenkontroll";
import { laddaNerAnbudsUtvarderingExcel } from "@/components/dokumentbank/exportera-anbuds-utvardering-excel";
import { laddaNerProjektUppfoljningExcel } from "@/components/dokumentbank/exportera-projekt-uppföljning-excel";

function harAnbudsUtvarderingExcel(mallId: string): boolean {
  return (
    mallId === "anbuds-utvardering-standard" ||
    mallId === "anbudsformular-standard"
  );
}

function harProjektUppfoljningExcel(mallId: string): boolean {
  return mallId === "projekt-uppföljning-payback";
}

function laddaExcelForMall(mallId: string): void {
  if (harAnbudsUtvarderingExcel(mallId)) {
    laddaNerAnbudsUtvarderingExcel();
    return;
  }
  if (harProjektUppfoljningExcel(mallId)) {
    laddaNerProjektUppfoljningExcel();
  }
}

// ── Hjälp ─────────────────────────────────────────────────────────────────────

const STATUS_FARGER: Record<DokumentStatus, string> = {
  utkast: "bg-amber-50 text-amber-800 border-amber-200",
  klar: "bg-[#eef6f0] text-primary-dark border-primary/30",
  arkiverad: "bg-border/20 text-muted border-border",
};

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

// ── Skapar-kopia-dialog ────────────────────────────────────────────────────────

interface SkapaKopiaFormProps {
  mall: DokumentbankMall;
  onSpara: (titel: string) => void;
  onAvbryt: () => void;
}

function SkapaKopiaForm({ mall, onSpara, onAvbryt }: SkapaKopiaFormProps) {
  const [titel, setTitel] = useState("");

  return (
    <div className="mt-2 rounded-lg border border-primary/30 bg-[#f7fbf8] p-3">
      <p className="mb-2 text-xs font-medium text-muted">
        Namnge kopian efter projektet (vad det gäller och år), t.ex. Takbyte 2026
        eller Stambyte 2025 — inte dokumenttypen först.
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          value={titel}
          placeholder="T.ex. Takbyte 2026"
          onChange={(e) => setTitel(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && titel.trim()) onSpara(titel);
            if (e.key === "Escape") onAvbryt();
          }}
          autoFocus
          className="flex-1 rounded-lg border border-border bg-white px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="button"
          onClick={() => titel.trim() && onSpara(titel)}
          disabled={!titel.trim()}
          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-dark disabled:opacity-40"
        >
          Skapa kopia
        </button>
        <button
          type="button"
          onClick={onAvbryt}
          className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted hover:text-foreground"
        >
          Avbryt
        </button>
      </div>
    </div>
  );
}

interface SkapaEgenkontrollKopiaFormProps {
  mall: DokumentbankMall;
  onSpara: (input: {
    titel: string;
    huvudentreprenorNamn: string;
    huvudArbetsledareNamn: string;
    underentreprenorNamn: string;
    underArbetsledareNamn: string;
    utforareNamn: string[];
  }) => void;
  onAvbryt: () => void;
}

function SkapaEgenkontrollKopiaForm({
  mall,
  onSpara,
  onAvbryt,
}: SkapaEgenkontrollKopiaFormProps) {
  const [titel, setTitel] = useState(mall.titel);
  const [huvudForetag, setHuvudForetag] = useState("");
  const [huvudLedare, setHuvudLedare] = useState("");
  const [underForetag, setUnderForetag] = useState("");
  const [underLedare, setUnderLedare] = useState("");
  const [utforare1, setUtforare1] = useState("");
  const [utforare2, setUtforare2] = useState("");

  const kanSkapa = titel.trim();

  return (
    <div className="mt-2 space-y-3 rounded-lg border border-primary/30 bg-[#f7fbf8] p-3">
      <p className="text-xs font-medium text-muted">
        Föreningen granskar kontrollplanen här. Huvudentreprenören har
        huvudansvar för att ifyllnad, avvikelser och BankID-signering blir
        kompletta — det görs under Granska och redigera, inte i
        förhandsgranska (som är skrivskyddad).
      </p>
      <label className="block text-xs text-muted">
        Projektnamn (t.ex. Takbyte 2026 eller Stambyte 2025)
        <input
          value={titel}
          onChange={(e) => setTitel(e.target.value)}
          placeholder="T.ex. Takbyte 2026"
          className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-1.5 text-sm"
        />
      </label>
      <details className="rounded-lg border border-border/80 bg-white/80 px-3 py-2">
        <summary className="cursor-pointer text-xs font-medium text-muted">
          Förifyll entreprenör och signering (valfritt — kan göras senare)
        </summary>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <label className="text-xs text-muted">
            Huvudentreprenör (företag)
            <input
              value={huvudForetag}
              onChange={(e) => setHuvudForetag(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-1.5 text-sm"
            />
          </label>
          <label className="text-xs text-muted">
            Huvudentreprenör — arbetsledare (BankID)
            <input
              value={huvudLedare}
              onChange={(e) => setHuvudLedare(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-1.5 text-sm"
            />
          </label>
          <label className="text-xs text-muted">
            Underentreprenör (företag)
            <input
              value={underForetag}
              onChange={(e) => setUnderForetag(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-1.5 text-sm"
            />
          </label>
          <label className="text-xs text-muted">
            Underentreprenör — arbetsledare (BankID)
            <input
              value={underLedare}
              onChange={(e) => setUnderLedare(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-1.5 text-sm"
            />
          </label>
          <label className="text-xs text-muted">
            Utförare 1
            <input
              value={utforare1}
              onChange={(e) => setUtforare1(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-1.5 text-sm"
            />
          </label>
          <label className="text-xs text-muted">
            Utförare 2
            <input
              value={utforare2}
              onChange={(e) => setUtforare2(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-1.5 text-sm"
            />
          </label>
        </div>
      </details>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={!kanSkapa}
          onClick={() =>
            kanSkapa &&
            onSpara({
              titel: titel.trim(),
              huvudentreprenorNamn: huvudForetag.trim(),
              huvudArbetsledareNamn: huvudLedare.trim(),
              underentreprenorNamn: underForetag.trim(),
              underArbetsledareNamn: underLedare.trim(),
              utforareNamn: [utforare1.trim(), utforare2.trim()].filter(Boolean),
            })
          }
          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
        >
          Skapa kopia
        </button>
        <button
          type="button"
          onClick={onAvbryt}
          className="rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted"
        >
          Avbryt
        </button>
      </div>
    </div>
  );
}

// ── Mina dokument ─────────────────────────────────────────────────────────────

function EgetDokumentUppladdning({
  onSparad,
}: {
  onSparad: (dok: ForeningsDokument) => void;
}) {
  const [fel, setFel] = useState<string | null>(null);
  const [laddar, setLaddar] = useState(false);

  async function hanteraFil(fil: File | null) {
    if (!fil) return;
    setFel(null);
    setLaddar(true);
    try {
      const result = await skapaForeningsDokumentFranFil(fil);
      if (!result.ok) {
        setFel(result.fel);
        return;
      }
      onSparad(result.dokument);
    } finally {
      setLaddar(false);
    }
  }

  return (
    <div className="rounded-2xl border border-dashed border-primary/35 bg-gradient-to-br from-[#eef6f0]/80 to-white p-5">
      <p className="text-sm font-semibold text-foreground">
        Ladda upp eget dokument
      </p>
      <p className="mt-1 text-sm text-muted">
        PDF, Word eller text sparas i er förening (webbläsaren). Textfiler kan
        redigeras och förhandsgranskas med layout.
      </p>
      <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark">
        {laddar ? "Laddar upp…" : "Välj fil att spara"}
        <input
          type="file"
          accept=".pdf,.doc,.docx,.txt,application/pdf,text/plain"
          className="sr-only"
          disabled={laddar}
          onChange={(e) => {
            void hanteraFil(e.target.files?.[0] ?? null);
            e.target.value = "";
          }}
        />
      </label>
      {fel && <p className="mt-2 text-xs text-red-700">{fel}</p>}
    </div>
  );
}

interface MinaDokumentProps {
  dokument: ForeningsDokument[];
  onUppdatera: (id: string, patch: Partial<ForeningsDokument>) => void;
  onTaBort: (id: string) => void;
  onSparadUppladdning: (dok: ForeningsDokument) => void;
}

function MinaDokument({
  dokument,
  onUppdatera,
  onTaBort,
  onSparadUppladdning,
}: MinaDokumentProps) {
  const [redigerarId, setRedigerarId] = useState<string | null>(null);
  const [bekraftaId, setBekraftaId] = useState<string | null>(null);
  const [laggTillProjektId, setLaggTillProjektId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <EgetDokumentUppladdning onSparad={onSparadUppladdning} />
      <p className="text-sm text-muted">
        Kopior från mallar är redigerbara här. Lägg till dem i projektets
        undermappar — samma kopia används i projektet när ni klickar Redigera
        där.
      </p>
      {dokument.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted">
          Inga dokument ännu. Ladda upp en fil ovan eller skapa en kopia under
          Mallkatalog.
        </p>
      ) : null}
    <div className="space-y-3">
      {dokument.map((dok) => {
        const mall = hamtaMall(dok.mallId);
        const harInnehall = Boolean(
          dok.innehall?.trim() ||
            mall?.textInnehall ||
            arEgenkontrollDokument(dok),
        );

        return (
          <div
            key={dok.id}
            className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm"
          >
            <div className="border-b border-border bg-[#f7fbf8] px-4 py-3 sm:px-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{dok.titel}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {dok.dokumentKalla === "fil"
                      ? "Uppladdad fil"
                      : `Mall: ${dok.mallTitel}`}
                    {" · "}
                    {OMRADE_ETIKETTER[dok.omrade as DokumentMallOmrade] ??
                      dok.omrade}
                  </p>
                </div>
                {dok.layoutTema && (
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs text-primary-dark ring-1 ring-primary/25">
                    {DOKUMENT_LAYOUT_ETIKETTER[dok.layoutTema]?.titel ??
                      dok.layoutTema}
                  </span>
                )}
              </div>
            </div>
            <div className="p-4 sm:p-5">
            {redigerarId === dok.id ? (
              <ForeningsDokumentRedigeraPanel
                dokument={dok}
                onSpara={(patch) => onUppdatera(dok.id, patch)}
                onStang={() => setRedigerarId(null)}
              />
            ) : (
              /* Visning */
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_FARGER[dok.status]}`}
                    >
                      {DOKUMENT_STATUS_ETIKETTER[dok.status]}
                    </span>
                    {arEntreprenadAvtalDokument(dok) && (
                      <span className="rounded-full bg-[#eef6f0] px-2 py-0.5 text-xs text-primary-dark">
                        {dok.avtalForm ?? "Entreprenad"} · {byggSignaturStatusText(dok)}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    Skapad {formatDatum(dok.skapadDatum)}
                    {dok.uppdateradDatum !== dok.skapadDatum &&
                      ` · Uppdaterad ${formatDatum(dok.uppdateradDatum)}`}
                  </p>
                  {dok.notering && (
                    <p className="mt-1 text-xs text-muted/80">{dok.notering}</p>
                  )}
                  {(dok.koppladeProjektId?.length ?? 0) > 0 && (
                    <p className="mt-1 text-xs text-primary-dark">
                      Kopplat till {dok.koppladeProjektId!.length} projekt
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => oppnaForeningsDokumentPreview(dok)}
                    className="rounded-lg border border-primary/60 bg-[#eef6f0] px-2.5 py-1.5 text-xs font-medium text-primary-dark"
                  >
                    Förhandsgranska
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setLaggTillProjektId(
                        laggTillProjektId === dok.id ? null : dok.id,
                      )
                    }
                    className="rounded-lg border border-primary px-2.5 py-1.5 text-xs font-medium text-primary-dark hover:bg-[#e2f0e6]"
                  >
                    Lägg till i projekt
                  </button>
                  {(harInnehall || dok.dokumentKalla === "fil") && (
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          dok.dokumentKalla === "fil" &&
                          laddaNedForeningsDokumentFil(dok)
                        ) {
                          return;
                        }
                        const innehall = hamtaForeningsDokumentInnehall(dok);
                        laddaNedDokument(dok.mallFilnamn, innehall);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-dark"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        className="h-3 w-3"
                        aria-hidden
                      >
                        <path d="M8.75 2.75a.75.75 0 0 0-1.5 0v5.69L5.03 6.22a.75.75 0 0 0-1.06 1.06l3.5 3.5a.75.75 0 0 0 1.06 0l3.5-3.5a.75.75 0 0 0-1.06-1.06L8.75 8.44V2.75Z" />
                        <path d="M3.5 9.75a.75.75 0 0 0-1.5 0v1.5A2.75 2.75 0 0 0 4.75 14h6.5A2.75 2.75 0 0 0 14 11.25v-1.5a.75.75 0 0 0-1.5 0v1.5c0 .69-.56 1.25-1.25 1.25h-6.5c-.69 0-1.25-.56-1.25-1.25v-1.5Z" />
                      </svg>
                      Ladda ned
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setRedigerarId(dok.id)}
                    className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted hover:text-foreground"
                  >
                    {arEgenkontrollDokument(dok)
                      ? "Granska och redigera"
                      : "Redigera"}
                  </button>
                  {bekraftaId === dok.id ? (
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          onTaBort(dok.id);
                          setBekraftaId(null);
                        }}
                        className="rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                      >
                        Ta bort
                      </button>
                      <button
                        type="button"
                        onClick={() => setBekraftaId(null)}
                        className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted"
                      >
                        Avbryt
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setBekraftaId(dok.id)}
                      className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted hover:border-red-300 hover:text-red-600"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            )}
            {laggTillProjektId === dok.id && (
              <LaggTillIProjektDialog
                dokument={dok}
                onStang={() => setLaggTillProjektId(null)}
                onKlar={() => setLaggTillProjektId(null)}
              />
            )}
            </div>
          </div>
        );
      })}
    </div>
    </div>
  );
}

// ── Mallkatalog ───────────────────────────────────────────────────────────────

interface MallKatalogProps {
  onSkapaKopia: (
    mall: DokumentbankMall,
    titel: string,
    tema: DokumentLayoutTema,
    egenkontroll?: {
      huvudentreprenorNamn: string;
      huvudArbetsledareNamn: string;
      underentreprenorNamn: string;
      underArbetsledareNamn: string;
      utforareNamn: string[];
    },
  ) => void;
}

function MallKatalog({ onSkapaKopia }: MallKatalogProps) {
  const [skaparKopiaFor, setSkaparKopiaFor] = useState<string | null>(null);
  const [forhandsgranskaMall, setForhandsgranskaMall] =
    useState<DokumentbankMall | null>(null);
  const [filterOmrade, setFilterOmrade] = useState<string>("alla");
  const [egnaLaddadeMallar, setEgnaLaddadeMallar] = useState(
    lasEgnaDokumentbankMallar(),
  );

  useEffect(() => {
    const hantera = () =>
      setEgnaLaddadeMallar(lasEgnaDokumentbankMallar());
    window.addEventListener(DOKUMENTBANK_EGNA_EVENT, hantera);
    return () => window.removeEventListener(DOKUMENTBANK_EGNA_EVENT, hantera);
  }, []);

  async function laddaUppEgen(fil: File | null) {
    if (!fil) return;
    let text: string | undefined;
    if (fil.type.startsWith("text/") || /\.txt$/i.test(fil.name)) {
      try {
        text = await lasFilSomText(fil);
      } catch {
        text = undefined;
      }
    }
    läggTillEgenDokumentbankMall(fil.name, undefined, text);
    setEgnaLaddadeMallar(lasEgnaDokumentbankMallar());
  }

  const omraden = Object.keys(OMRADE_ETIKETTER) as DokumentMallOmrade[];

  const visadeMallar =
    filterOmrade === "alla"
      ? dokumentbankMallar
      : dokumentbankMallar.filter((m) => m.omrade === filterOmrade);

  const omradesGrupper = omraden.reduce<
    Partial<Record<DokumentMallOmrade, DokumentbankMall[]>>
  >((acc, omrade) => {
    const mallar = visadeMallar.filter((m) => m.omrade === omrade);
    if (mallar.length > 0) acc[omrade] = mallar;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilterOmrade("alla")}
          className={`rounded-full border px-3 py-1 text-sm ${filterOmrade === "alla" ? "border-primary bg-[#e2f0e6] text-primary-dark" : "border-border text-muted hover:text-foreground"}`}
        >
          Alla
        </button>
        {omraden.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => setFilterOmrade(o)}
            className={`rounded-full border px-3 py-1 text-sm ${filterOmrade === o ? "border-primary bg-[#e2f0e6] text-primary-dark" : "border-border text-muted hover:text-foreground"}`}
          >
            {OMRADE_ETIKETTER[o]}
          </button>
        ))}
      </div>

      {filterOmrade === "avtal" && (
        <p className="rounded-lg border border-primary/25 bg-[#eef6f0]/80 px-3 py-2 text-xs text-primary-dark">
          ABT 06 (totalentreprenad) och AB 04 (utförande) är separata mallar.
          Skapa även bilagor tidsplan och lyftplan — de hör ihop och ska levereras
          vid eller direkt efter kontraktssignering.
        </p>
      )}
      {filterOmrade === "egenkontroll" && (
        <p className="rounded-lg border border-primary/25 bg-[#eef6f0]/80 px-3 py-2 text-xs text-primary-dark">
          Föreningen anpassar kontrollplanen (även utan entreprenör). Entreprenören
          fyller i och signerar med BankID när arbetet utförs.
        </p>
      )}
      {filterOmrade === "upphandling" && (
        <p className="rounded-lg border border-primary/25 bg-[#eef6f0]/80 px-3 py-2 text-xs text-primary-dark">
          Anbudsformuläret och utvärderingsmallen hänger ihop. Excel-mallen räknar
          skillnad i kronor och procent mot lägsta anbud (huvud, optioner och
          ÄTA-scenario).
        </p>
      )}

      {/* Mallar per område */}
      {(
        Object.entries(omradesGrupper) as [
          DokumentMallOmrade,
          DokumentbankMall[],
        ][]
      ).map(([omrade, mallar]) => (
        <div key={omrade}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
            {OMRADE_ETIKETTER[omrade]}
          </p>
          <div className="space-y-2">
            {mallar.map((mall) => (
              <div key={mall.id}>
                <div className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">
                      {mall.titel}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-muted">
                      {mall.beskrivning}
                    </p>
                    {mall.textInnehall && (
                      <span className="mt-2 inline-block rounded-full bg-[#eef6f0] px-2.5 py-0.5 text-xs font-medium text-primary-dark">
                        Textmall · förhandsgranska
                      </span>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setForhandsgranskaMall(mall)}
                      className="rounded-lg border border-primary/50 bg-[#eef6f0] px-3 py-2 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
                    >
                      Förhandsgranska
                    </button>
                    {(harAnbudsUtvarderingExcel(mall.id) ||
                      harProjektUppfoljningExcel(mall.id)) && (
                      <button
                        type="button"
                        onClick={() => laddaExcelForMall(mall.id)}
                        className="rounded-lg border border-primary px-3 py-2 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
                      >
                        Ladda ned Excel
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setSkaparKopiaFor(
                          skaparKopiaFor === mall.id ? null : mall.id,
                        )
                      }
                      className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
                    >
                      {arEgenkontrollMallId(mall.id)
                        ? "Skapa egenkontroll"
                        : "Skapa kopia"}
                    </button>
                  </div>
                </div>
                {skaparKopiaFor === mall.id &&
                  (arEgenkontrollMallId(mall.id) ? (
                    <SkapaEgenkontrollKopiaForm
                      mall={mall}
                      onSpara={(input) => {
                        onSkapaKopia(
                          mall,
                          input.titel,
                          STANDARD_DOKUMENT_LAYOUT,
                          {
                            huvudentreprenorNamn: input.huvudentreprenorNamn,
                            huvudArbetsledareNamn: input.huvudArbetsledareNamn,
                            underentreprenorNamn: input.underentreprenorNamn,
                            underArbetsledareNamn: input.underArbetsledareNamn,
                            utforareNamn: input.utforareNamn,
                          },
                        );
                        setSkaparKopiaFor(null);
                      }}
                      onAvbryt={() => setSkaparKopiaFor(null)}
                    />
                  ) : (
                    <SkapaKopiaForm
                      mall={mall}
                      onSpara={(titel) => {
                        onSkapaKopia(mall, titel, STANDARD_DOKUMENT_LAYOUT);
                        setSkaparKopiaFor(null);
                      }}
                      onAvbryt={() => setSkaparKopiaFor(null)}
                    />
                  ))}
              </div>
            ))}
          </div>
        </div>
      ))}

      {forhandsgranskaMall ? (
        <DokumentForhandsgranskaDialog
          mall={forhandsgranskaMall}
          open
          onStang={() => setForhandsgranskaMall(null)}
          onSkapaKopia={(titel, tema) => {
            onSkapaKopia(forhandsgranskaMall, titel, tema);
            setForhandsgranskaMall(null);
          }}
        />
      ) : null}

      {/* Egna uppladdningar som mallar */}
      <div className="rounded-2xl border border-dashed border-border bg-surface p-5">
        <p className="text-sm font-semibold text-foreground">
          Egna mallar i katalogen
        </p>
        <p className="mt-1 text-sm text-muted">
          Ladda upp en fil som blir en mall ni kan förhandsgranska och skapa
          kopior från — sparas per förening.
        </p>
        <label className="mt-3 inline-flex cursor-pointer rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]">
          Välj fil
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            className="sr-only"
            onChange={(e) => {
              void laddaUppEgen(e.target.files?.[0] ?? null);
              e.target.value = "";
            }}
          />
        </label>
        {egnaLaddadeMallar.length > 0 && (
          <ul className="mt-4 space-y-2">
            {egnaLaddadeMallar.map((m) => (
              <li
                key={m.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-white px-3 py-2"
              >
                <span className="text-sm text-foreground">
                  {m.titel}{" "}
                  <span className="text-xs text-muted">· {m.uppladdad}</span>
                </span>
                <div className="flex gap-1">
                  {m.textInnehall && (
                    <button
                      type="button"
                      onClick={() => setForhandsgranskaMall(m)}
                      className="rounded-lg border border-primary/40 px-2 py-1 text-xs text-primary-dark"
                    >
                      Förhandsgranska
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      taBortEgenDokumentbankMall(m.id);
                      setEgnaLaddadeMallar(lasEgnaDokumentbankMallar());
                    }}
                    className="rounded-lg px-2 py-1 text-xs text-muted hover:text-red-600"
                  >
                    Ta bort
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ── Huvud-komponent ───────────────────────────────────────────────────────────

export function ForeningsDokumentbank() {
  const [hydrated, setHydrated] = useState(false);
  const [dokument, setDokument] = useState<ForeningsDokument[]>([]);
  const [aktivFlik, setAktivFlik] = useState<"mina" | "mallar">("mina");

  function laddaDokument() {
    setDokument(lasForeningsDokument().dokument);
  }

  useEffect(() => {
    laddaDokument();
    setHydrated(true);
    window.addEventListener(FORENINGS_DOK_EVENT, laddaDokument);
    return () => window.removeEventListener(FORENINGS_DOK_EVENT, laddaDokument);
  }, []);

  function sparaNyttDokument(nyttDok: ForeningsDokument) {
    const befintliga = lasForeningsDokument();
    sparaForeningsDokument({
      ...befintliga,
      dokument: [nyttDok, ...befintliga.dokument],
    });
    laddaDokument();
    setAktivFlik("mina");
  }

  function skapaKopia(
    mall: DokumentbankMall,
    titel: string,
    layoutTema: DokumentLayoutTema = STANDARD_DOKUMENT_LAYOUT,
    egenkontrollInput?: {
      huvudentreprenorNamn: string;
      huvudArbetsledareNamn: string;
      underentreprenorNamn: string;
      underArbetsledareNamn: string;
      utforareNamn: string[];
    },
  ) {
    const nu = new Date().toISOString();
    const docTitel = titel.trim() || mall.titel;
    const avtalForm = hamtaAvtalFormForMall(mall.id);

    if (arEgenkontrollMallId(mall.id)) {
      const input = egenkontrollInput ?? {
        huvudentreprenorNamn: "",
        huvudArbetsledareNamn: "",
        underentreprenorNamn: "",
        underArbetsledareNamn: "",
        utforareNamn: [] as string[],
      };
      const bas = skapaForeningsDokumentEgenkontroll(mall, {
        docTitel,
        egenkontrollInput: input,
      });
      if (layoutTema !== STANDARD_DOKUMENT_LAYOUT) {
        bas.layoutTema = layoutTema;
      }
      sparaNyttDokument(bas);
      return;
    }

    const innehall = mall.textInnehall
      ? skapaInnehallFranMall(mall, docTitel)
      : undefined;
    const nyttDok: ForeningsDokument = {
      id: skapaForeningsDokumentId(),
      mallId: mall.id,
      mallTitel: mall.titel,
      mallFilnamn: mall.filnamn,
      titel: docTitel,
      status: "utkast",
      skapadDatum: nu,
      uppdateradDatum: nu,
      notering: "",
      omrade: mall.omrade,
      dokumentKalla: "mall",
      layoutTema,
      ...(innehall ? { innehall } : {}),
      koppladeProjektId: [],
      ...(avtalForm
        ? {
            avtalForm,
            entreprenor: tomDokumentEntreprenor(),
            entreprenorSignaturer: [],
            foreningSignaturer: [],
          }
        : {}),
    };
    sparaNyttDokument(nyttDok);
  }

  function uppdateraDokument(id: string, patch: Partial<ForeningsDokument>) {
    const state = lasForeningsDokument();
    sparaForeningsDokument({
      ...state,
      dokument: state.dokument.map((d) =>
        d.id === id
          ? { ...d, ...patch, uppdateradDatum: new Date().toISOString() }
          : d,
      ),
    });
    laddaDokument();
  }

  function taBortDokument(id: string) {
    taBortDokumentFil(id);
    const state = lasForeningsDokument();
    sparaForeningsDokument({
      ...state,
      dokument: state.dokument.filter((d) => d.id !== id),
    });
    laddaDokument();
  }

  if (!hydrated) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-10 rounded-lg bg-border/40" />
        <div className="h-20 rounded-xl bg-border/40" />
        <div className="h-20 rounded-xl bg-border/40" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Flikar */}
      <div className="flex gap-1 rounded-xl border border-border bg-surface p-1">
        <button
          type="button"
          onClick={() => setAktivFlik("mina")}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            aktivFlik === "mina"
              ? "bg-white shadow-sm text-foreground"
              : "text-muted hover:text-foreground"
          }`}
        >
          Mina dokument
          {dokument.length > 0 && (
            <span className="ml-1.5 rounded-full bg-[#e2f0e6] px-1.5 py-0.5 text-xs font-semibold text-primary-dark">
              {dokument.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setAktivFlik("mallar")}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            aktivFlik === "mallar"
              ? "bg-white shadow-sm text-foreground"
              : "text-muted hover:text-foreground"
          }`}
        >
          Mallkatalog
          <span className="ml-1.5 rounded-full bg-border/40 px-1.5 py-0.5 text-xs text-muted">
            {dokumentbankMallar.length}
          </span>
        </button>
      </div>

      {aktivFlik === "mina" ? (
        <MinaDokument
          dokument={dokument}
          onUppdatera={uppdateraDokument}
          onTaBort={taBortDokument}
          onSparadUppladdning={sparaNyttDokument}
        />
      ) : (
        <MallKatalog onSkapaKopia={skapaKopia} />
      )}
    </div>
  );
}
