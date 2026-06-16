"use client";

import { useEffect, useRef, useState } from "react";
import {
  domMappar,
  skapaDokumentId,
  type DomMappDefinition,
} from "@/components/juridik/domar";
import {
  juridikDelatBibliotekNotis,
  juridikFriskrivningKort,
  juridikKostnadTvister,
  juridikStyrelseAnsvar,
} from "@/components/juridik/juridik-innehall";
import {
  JURIDIK_BIBLIOTEK_EVENT,
  lasJuridikBibliotek,
  skapaJuridikId,
  skapaTomtJuridikBibliotek,
  sparaJuridikBibliotek,
  tipsKategoriEtikett,
  type JuridikBibliotekState,
  type JuridikTipsKategori,
  type JuridikTipsRad,
  type JuridikUppladdatDokument,
} from "@/components/juridik/juridik-lager";
import {
  DOMAR_EGNA_MAPPAR_EVENT,
  DOMAR_EGNA_MAPPAR_KEY_BASE,
  EGNA_MAPPAR_EVENT,
  EGNA_MAPPAR_KEY_BASE,
} from "@/components/juridik/juridik-egna-mappar-lager";
import { EgnaJuridikMapparSektion } from "@/components/juridik/EgnaJuridikMapparSektion";

export function JuridikModul() {
  const [bibliotek, setBibliotek] = useState<JuridikBibliotekState>(
    skapaTomtJuridikBibliotek(),
  );
  const [mappUi, setMappUi] = useState<Record<string, { öppen: boolean }>>({});
  const [hydrated, setHydrated] = useState(false);
  const skipFirstSave = useRef(true);
  const [pågåendeUppladdning, setPågåendeUppladdning] = useState<string | null>(
    null,
  );
  const [visarTipsForm, setVisarTipsForm] = useState(false);
  const [tipsTitel, setTipsTitel] = useState("");
  const [tipsText, setTipsText] = useState("");
  const [tipsKategori, setTipsKategori] =
    useState<JuridikTipsKategori>("allmant");

  useEffect(() => {
    setBibliotek(lasJuridikBibliotek());
    setMappUi(
      Object.fromEntries(domMappar.map((m) => [m.id, { öppen: false }])),
    );
    skipFirstSave.current = true;
    setHydrated(true);

    function synka() {
      setBibliotek(lasJuridikBibliotek());
      skipFirstSave.current = true;
    }
    window.addEventListener(JURIDIK_BIBLIOTEK_EVENT, synka);
    return () => {
      window.removeEventListener(JURIDIK_BIBLIOTEK_EVENT, synka);
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (skipFirstSave.current) {
      skipFirstSave.current = false;
      return;
    }
    sparaJuridikBibliotek(bibliotek);
  }, [bibliotek, hydrated]);

  function toggleMapp(id: string) {
    setMappUi((current) => ({
      ...current,
      [id]: { öppen: !current[id]?.öppen },
    }));
  }

  function läggTillDom(mappId: string, fil: File | null) {
    if (!fil) return;
    const dokument: JuridikUppladdatDokument = {
      id: skapaDokumentId(),
      filnamn: fil.name,
      uppladdad: new Date().toLocaleDateString("sv-SE"),
    };
    setBibliotek((current) => ({
      ...current,
      mappar: {
        ...current.mappar,
        [mappId]: {
          dokument: [...(current.mappar[mappId]?.dokument ?? []), dokument],
        },
      },
    }));
    setPågåendeUppladdning(null);
  }

  function taBortDom(mappId: string, dokumentId: string) {
    setBibliotek((current) => ({
      ...current,
      mappar: {
        ...current.mappar,
        [mappId]: {
          dokument: (current.mappar[mappId]?.dokument ?? []).filter(
            (doc) => doc.id !== dokumentId,
          ),
        },
      },
    }));
  }

  function läggTillTips(fil?: File | null) {
    const titel = tipsTitel.trim();
    const text = tipsText.trim();
    if (!titel || !text) return;
    const tips: JuridikTipsRad = {
      id: skapaJuridikId("tips"),
      titel,
      text,
      kategori: tipsKategori,
      uppladdad: new Date().toLocaleDateString("sv-SE"),
      filnamn: fil?.name,
    };
    setBibliotek((current) => ({
      ...current,
      tips: [tips, ...current.tips],
    }));
    setTipsTitel("");
    setTipsText("");
    setTipsKategori("allmant");
    setVisarTipsForm(false);
  }

  function taBortTips(id: string) {
    setBibliotek((current) => ({
      ...current,
      tips: current.tips.filter((t) => t.id !== id),
    }));
  }

  if (!hydrated) {
    return (
      <p className="text-sm text-muted">Laddar juridikbibliotek…</p>
    );
  }

  return (
    <div className="space-y-10">
      <section className="rounded-2xl border-2 border-primary/35 bg-[#eef6f0] p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">
          Viktigt att veta
        </p>
        <h2 className="mt-2 text-xl font-bold text-foreground">
          {juridikStyrelseAnsvar.rubrik}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-foreground">
          {juridikStyrelseAnsvar.ingress}
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-foreground">
          {juridikStyrelseAnsvar.punkter.map((punkt) => (
            <li key={punkt}>{punkt}</li>
          ))}
        </ul>
        <p className="mt-4 rounded-lg border border-primary/25 bg-white/70 px-4 py-3 text-sm text-muted">
          {juridikFriskrivningKort}
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          {juridikKostnadTvister.rubrik}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {juridikKostnadTvister.ingress}
        </p>
        <ul className="mt-4 space-y-3">
          {juridikKostnadTvister.råd.map((rad) => (
            <li
              key={rad.titel}
              className="rounded-xl border border-border bg-background/80 p-4"
            >
              <p className="font-medium text-foreground">{rad.titel}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                {rad.text}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          Domar och avgöranden
        </h2>
        <p className="mt-2 text-sm text-muted">
          Vägledande domar samlade per ämne. Öppna en mapp, läs vägledningen och
          ladda upp aktuella domar som kan hjälpa styrelser i liknande ärenden.
        </p>
        <p className="mt-3 rounded-lg border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm text-amber-950">
          {juridikDelatBibliotekNotis}
        </p>

        <ul className="mt-4 space-y-3">
          {domMappar.map((mapp) => (
            <DomMappRad
              key={mapp.id}
              mapp={mapp}
              dokument={bibliotek.mappar[mapp.id]?.dokument ?? []}
              öppen={mappUi[mapp.id]?.öppen ?? false}
              visarUppladdning={pågåendeUppladdning === mapp.id}
              onToggle={() => toggleMapp(mapp.id)}
              onVisaUppladdning={() => setPågåendeUppladdning(mapp.id)}
              onUpload={(fil) => läggTillDom(mapp.id, fil)}
              onTaBort={(dokumentId) => taBortDom(mapp.id, dokumentId)}
            />
          ))}
        </ul>

        <EgnaJuridikMapparSektion
          storageKeyBase={DOMAR_EGNA_MAPPAR_KEY_BASE}
          eventName={DOMAR_EGNA_MAPPAR_EVENT}
          tomMeddelande=""
          className="mt-3 space-y-3"
        />
      </section>

      {/* Egna mappar */}
      <section className="border-t border-border pt-8">
        <h2 className="text-lg font-semibold text-foreground">Egna mappar</h2>
        <p className="mt-1 text-sm text-muted">
          Skapa egna mappar för föreningens dokument, beslut och korrespondens.
          Mapparna namnger ni själva och är enbart synliga för er förening.
        </p>
        <EgnaJuridikMapparSektion
          storageKeyBase={EGNA_MAPPAR_KEY_BASE}
          eventName={EGNA_MAPPAR_EVENT}
          tomMeddelande="Inga egna mappar skapade ännu."
        />
      </section>

      <section className="border-t border-border pt-8">
        <h2 className="text-lg font-semibold text-foreground">Tips och råd</h2>
        <p className="mt-2 text-sm text-muted">
          Korta råd inför möten med medlemmar, inför kontakt med juridiskt ombud
          eller för att undvika onödiga kostnader. Ladda upp nya råd som kan
          hjälpa andra styrelser — materialet delas i hela plattformen.
        </p>

        {bibliotek.tips.length > 0 ? (
          <ul className="mt-4 space-y-3">
            {bibliotek.tips.map((tips) => (
              <li
                key={tips.id}
                className="rounded-xl border border-border bg-surface p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                    {tipsKategoriEtikett(tips.kategori)}
                  </span>
                  <button
                    type="button"
                    onClick={() => taBortTips(tips.id)}
                    className="text-xs text-muted hover:text-red-700"
                  >
                    Ta bort
                  </button>
                </div>
                <p className="mt-2 font-semibold text-foreground">{tips.titel}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  {tips.text}
                </p>
                {tips.filnamn && (
                  <p className="mt-2 text-xs text-muted">
                    Bilaga: {tips.filnamn} · {tips.uppladdad}
                  </p>
                )}
                {!tips.filnamn && (
                  <p className="mt-2 text-xs text-muted">
                    Tillagt {tips.uppladdad}
                  </p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted">
            Inga uppladdade tips ännu. Lägg till det första rådet nedan.
          </p>
        )}

        <div className="mt-5">
          {!visarTipsForm ? (
            <button
              type="button"
              onClick={() => setVisarTipsForm(true)}
              className="rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
            >
              Lägg till tips eller råd
            </button>
          ) : (
            <div className="rounded-xl border border-dashed border-primary/40 bg-[#eef6f0]/50 p-4 sm:p-5">
              <p className="text-sm font-semibold text-foreground">
                Nytt tips till biblioteket
              </p>
              <label className="mt-3 block text-sm">
                <span className="text-xs font-medium text-muted">Rubrik</span>
                <input
                  value={tipsTitel}
                  onChange={(e) => setTipsTitel(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                  placeholder="Ex. Förbered protokoll innan juristmöte"
                />
              </label>
              <label className="mt-3 block text-sm">
                <span className="text-xs font-medium text-muted">Kategori</span>
                <select
                  value={tipsKategori}
                  onChange={(e) =>
                    setTipsKategori(e.target.value as JuridikTipsKategori)
                  }
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                >
                  <option value="allmant">Allmänt råd</option>
                  <option value="mote-medlem">Inför möte med medlem</option>
                  <option value="juridiskt-ombud">Inför juridiskt ombud</option>
                  <option value="kostnadstvist">Minska kostnader vid tvist</option>
                </select>
              </label>
              <label className="mt-3 block text-sm">
                <span className="text-xs font-medium text-muted">Text</span>
                <textarea
                  value={tipsText}
                  onChange={(e) => setTipsText(e.target.value)}
                  rows={4}
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                  placeholder="Kort och konkret råd som andra styrelser kan använda som underlag."
                />
              </label>
              <label className="mt-3 inline-flex cursor-pointer rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-foreground hover:border-primary/50">
                Välj bilaga (valfritt)
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  className="sr-only"
                  onChange={(e) => {
                    const fil = e.target.files?.[0];
                    if (fil && tipsTitel.trim() && tipsText.trim()) {
                      läggTillTips(fil);
                    }
                    e.target.value = "";
                  }}
                />
              </label>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => läggTillTips()}
                  disabled={!tipsTitel.trim() || !tipsText.trim()}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
                >
                  Spara tips
                </button>
                <button
                  type="button"
                  onClick={() => setVisarTipsForm(false)}
                  className="rounded-lg border border-border px-4 py-2 text-sm text-muted"
                >
                  Avbryt
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

type DomMappRadProps = {
  mapp: DomMappDefinition;
  dokument: JuridikUppladdatDokument[];
  öppen: boolean;
  visarUppladdning: boolean;
  onToggle: () => void;
  onVisaUppladdning: () => void;
  onUpload: (fil: File | null) => void;
  onTaBort: (dokumentId: string) => void;
};

function DomMappRad({
  mapp,
  dokument,
  öppen,
  visarUppladdning,
  onToggle,
  onVisaUppladdning,
  onUpload,
  onTaBort,
}: DomMappRadProps) {
  return (
    <li className="rounded-xl border border-border bg-surface shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-3 px-4 py-4 text-left sm:px-5"
        aria-expanded={öppen}
      >
        <span
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e2f0e6] text-sm text-primary-dark"
          aria-hidden
        >
          {öppen ? "−" : "+"}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-base font-semibold text-foreground">
            {mapp.titel}
          </span>
          <span className="mt-1 block text-sm text-muted">{mapp.beskrivning}</span>
          {dokument.length > 0 && (
            <span className="mt-2 inline-block rounded-full bg-[#eef6f0] px-2.5 py-0.5 text-xs font-medium text-primary-dark">
              {dokument.length}{" "}
              {dokument.length === 1 ? "dom uppladdad" : "domar uppladdade"}
            </span>
          )}
        </span>
      </button>

      {öppen && (
        <div className="border-t border-border px-4 pb-5 pt-4 sm:px-5">
          <p className="text-sm leading-relaxed text-foreground">{mapp.vägledning}</p>
          <p className="mt-2 text-xs text-muted">
            Använd som underlag inför styrelsebeslut och möten — inte som färdigt
            beslut.
          </p>

          {dokument.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {dokument.map((doc) => (
                <li
                  key={doc.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{doc.filnamn}</p>
                    <p className="text-xs text-muted">Uppladdad {doc.uppladdad}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-dark"
                      title="Demo: öppna uppladdad dom"
                    >
                      Läs dom
                    </button>
                    <button
                      type="button"
                      onClick={() => onTaBort(doc.id)}
                      className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted hover:border-red-300 hover:text-red-700"
                    >
                      Ta bort
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 rounded-lg border border-dashed border-border px-3 py-2.5 text-sm text-muted">
              Inga domar uppladdade ännu i denna mapp.
            </p>
          )}

          <div className="mt-4">
            {!visarUppladdning ? (
              <button
                type="button"
                onClick={onVisaUppladdning}
                className="rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
              >
                Ladda upp vägledande dom
              </button>
            ) : (
              <div className="rounded-lg border border-dashed border-primary/40 bg-[#eef6f0]/50 p-4">
                <p className="text-sm font-medium text-foreground">
                  Ladda upp dom till gemensamt bibliotek
                </p>
                <p className="mt-1 text-xs text-muted">
                  PDF eller annat dokument — syns för alla föreninger (demo).
                </p>
                <label className="mt-3 inline-flex cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark">
                  Välj fil
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf"
                    className="sr-only"
                    onChange={(event) => onUpload(event.target.files?.[0] ?? null)}
                  />
                </label>
              </div>
            )}
          </div>
        </div>
      )}
    </li>
  );
}
