"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { lasUnderhallsplanState } from "@/components/underhallsplan/underhallsplan-lager";
import {
  adresserFranProfilOchPlan,
  synkaGrundFormTillUnderhallsplan,
} from "@/lib/forening-grund-synk";
import {
  arGrundmallForening,
  FORENING_AKTIV_EVENT,
  lasAktivForeningId,
  lasForeningProfil,
  repareraForeningRegistry,
  sparaForeningProfil,
  type ForeningProfil,
} from "@/lib/forening-registry";
import {
  forstaKontaktpersonFranStyrelse,
  skapaTomStyrelseLedamot,
  STYRELSE_ROLLER,
  type StyrelseLedamot,
} from "@/lib/styrelse-ledamot";

function lasAktivProfil(): ForeningProfil | null {
  repareraForeningRegistry();
  const id = lasAktivForeningId();
  const profil = lasForeningProfil(id);
  if (!profil || arGrundmallForening(profil.id)) return null;
  return profil;
}

type FormState = {
  adresser: string[];
  postnummer: string;
  ort: string;
  antalLagenheter: string;
  antalVaningar: string;
  styrelseledamoter: StyrelseLedamot[];
};

function formFranProfil(profil: ForeningProfil): FormState {
  const plan = lasUnderhallsplanState();
  return {
    adresser: adresserFranProfilOchPlan(profil, plan?.grund),
    postnummer: profil.postnummer,
    ort: profil.ort,
    antalLagenheter: plan?.grund.antalLagenheter ?? "",
    antalVaningar: plan?.grund.antalVaningar ?? "",
    styrelseledamoter:
      profil.styrelseledamoter.length > 0
        ? profil.styrelseledamoter
        : profil.kontaktperson.trim()
          ? [
              skapaTomStyrelseLedamot({
                namn: profil.kontaktperson.trim(),
                roll: "Ordförande",
              }),
            ]
          : [skapaTomStyrelseLedamot({ roll: "Ordförande" })],
  };
}

export function ForeningGrunduppgifterPanel() {
  const [profil, setProfil] = useState<ForeningProfil | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [redo, setRedo] = useState(false);
  const [sparad, setSparad] = useState(false);
  const [sparFel, setSparFel] = useState<string | null>(null);
  const [bankidPagarId, setBankidPagarId] = useState<string | null>(null);

  const ladda = useCallback(() => {
    const p = lasAktivProfil();
    setProfil(p);
    setForm(p ? formFranProfil(p) : null);
    setRedo(true);
  }, []);

  useEffect(() => {
    ladda();
    window.addEventListener(FORENING_AKTIV_EVENT, ladda);
    return () => window.removeEventListener(FORENING_AKTIV_EVENT, ladda);
  }, [ladda]);

  useEffect(() => {
    setSparad(false);
    setSparFel(null);
  }, [profil?.id]);

  if (!redo) {
    return <p className="text-sm text-muted">Laddar grunduppgifter …</p>;
  }

  if (!profil || !form) {
    return null;
  }

  function setAdress(index: number, varde: string) {
    setForm((current) => {
      if (!current) return current;
      const adresser = [...current.adresser];
      adresser[index] = varde;
      return { ...current, adresser };
    });
    setSparad(false);
  }

  function laggTillAdress() {
    setForm((current) =>
      current ? { ...current, adresser: [...current.adresser, ""] } : current,
    );
    setSparad(false);
  }

  function taBortAdress(index: number) {
    setForm((current) => {
      if (!current) return current;
      const adresser = current.adresser.filter((_, i) => i !== index);
      return { ...current, adresser: adresser.length > 0 ? adresser : [""] };
    });
    setSparad(false);
  }

  function uppdateraLedamot(
    id: string,
    patch: Partial<Pick<StyrelseLedamot, "namn" | "roll">>,
  ) {
    setForm((current) => {
      if (!current) return current;
      return {
        ...current,
        styrelseledamoter: current.styrelseledamoter.map((l) =>
          l.id === id ? { ...l, ...patch } : l,
        ),
      };
    });
    setSparad(false);
  }

  function laggTillLedamot() {
    setForm((current) =>
      current
        ? {
            ...current,
            styrelseledamoter: [
              ...current.styrelseledamoter,
              skapaTomStyrelseLedamot(),
            ],
          }
        : current,
    );
    setSparad(false);
  }

  function taBortLedamot(id: string) {
    setForm((current) => {
      if (!current) return current;
      const kvar = current.styrelseledamoter.filter((l) => l.id !== id);
      return {
        ...current,
        styrelseledamoter:
          kvar.length > 0 ? kvar : [skapaTomStyrelseLedamot({ roll: "Ordförande" })],
      };
    });
    setSparad(false);
  }

  function kopplaBankId(id: string) {
    if (!form) return;
    const ledamot = form.styrelseledamoter.find((l) => l.id === id);
    if (!ledamot?.namn.trim()) {
      setSparFel("Ange ledamotens namn innan BankID kopplas.");
      return;
    }
    setSparFel(null);
    setBankidPagarId(id);
    window.setTimeout(() => {
      setForm((current) => {
        if (!current) return current;
        return {
          ...current,
          styrelseledamoter: current.styrelseledamoter.map((l) =>
            l.id === id
              ? {
                  ...l,
                  bankidKopplad: true,
                  bankidKoppladTidpunkt: new Date().toISOString(),
                }
              : l,
          ),
        };
      });
      setBankidPagarId(null);
      setSparad(false);
    }, 1600);
  }

  function kopplaBortBankId(id: string) {
    setForm((current) => {
      if (!current) return current;
      return {
        ...current,
        styrelseledamoter: current.styrelseledamoter.map((l) =>
          l.id === id
            ? { ...l, bankidKopplad: false, bankidKoppladTidpunkt: "" }
            : l,
        ),
      };
    });
    setSparad(false);
  }

  function spara() {
    if (!profil || !form) return;
    setSparFel(null);
    try {
      const ledamoter = form.styrelseledamoter
        .map((l) => ({ ...l, namn: l.namn.trim(), roll: l.roll.trim() || "Ledamot" }))
        .filter((l) => l.namn || l.bankidKopplad);

      const kontaktperson =
        forstaKontaktpersonFranStyrelse(ledamoter) || profil.kontaktperson;

      const { forstaAdress } = synkaGrundFormTillUnderhallsplan(profil, {
        adresser: form.adresser,
        postnummer: form.postnummer,
        ort: form.ort,
        antalLagenheter: form.antalLagenheter,
        antalVaningar: form.antalVaningar,
      });

      const uppdaterad: ForeningProfil = {
        ...profil,
        postadress: forstaAdress || profil.postadress,
        postnummer: form.postnummer.trim(),
        ort: form.ort.trim(),
        kontaktperson,
        styrelseledamoter:
          ledamoter.length > 0
            ? ledamoter
            : [skapaTomStyrelseLedamot({ roll: "Ordförande" })],
        grundinfoPaborjad: true,
      };

      sparaForeningProfil(uppdaterad);
      setProfil(uppdaterad);
      setForm(formFranProfil(uppdaterad));
      setSparad(true);

      void import("@/lib/forening-server-sync").then(({ synkaForeningTillServer }) => {
        void synkaForeningTillServer(uppdaterad);
      });
    } catch (e) {
      setSparFel(
        e instanceof Error ? e.message : "Kunde inte spara — försök igen.",
      );
    }
  }

  const kopplade = form.styrelseledamoter.filter((l) => l.bankidKopplad).length;

  return (
    <div
      id="grunduppgifter"
      className="scroll-mt-24 rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Grunduppgifter för föreningen
          </h2>
          <p className="mt-1 text-sm text-muted">
            Adresser, storlek och styrelse. Lägenheter, våningar och adresser
            kopieras automatiskt in i underhållsplanens steg 1.
          </p>
        </div>
        <p className="rounded-lg border border-border bg-white px-3 py-2 text-xs text-muted">
          <span className="font-medium text-foreground">{profil.namn}</span>
          {profil.organisationsnummer ? (
            <> · org.nr {profil.organisationsnummer}</>
          ) : (
            <> · org.nr fylls i ovan</>
          )}
        </p>
      </div>

      <div className="mt-5 space-y-6">
        <section>
          <h3 className="text-sm font-semibold text-foreground">Fastighetsadresser</h3>
          <p className="mt-1 text-xs text-muted">
            En rad per husadress. Första adressen används också som postadress.
          </p>
          <div className="mt-3 space-y-2">
            {form.adresser.map((adress, index) => (
              <div key={`adress-${index}`} className="flex gap-2">
                <input
                  type="text"
                  value={adress}
                  onChange={(e) => setAdress(index, e.target.value)}
                  placeholder="t.ex. Storgatan 12"
                  className="min-w-0 flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm"
                />
                {form.adresser.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => taBortAdress(index)}
                    className="rounded-lg border border-border px-3 text-sm text-muted hover:text-foreground"
                  >
                    Ta bort
                  </button>
                ) : null}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={laggTillAdress}
            className="mt-2 text-sm font-medium text-primary-dark hover:underline"
          >
            + Lägg till adress
          </button>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="font-medium text-foreground">Postnummer</span>
              <input
                type="text"
                value={form.postnummer}
                onChange={(e) => {
                  setForm({ ...form, postnummer: e.target.value });
                  setSparad(false);
                }}
                placeholder="123 45"
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-foreground">Ort</span>
              <input
                type="text"
                value={form.ort}
                onChange={(e) => {
                  setForm({ ...form, ort: e.target.value });
                  setSparad(false);
                }}
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2"
              />
            </label>
          </div>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-foreground">Storlek</h3>
          <p className="mt-1 text-xs text-muted">
            Synkas till underhållsplanen (används bland annat för prisnivå).
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="font-medium text-foreground">Antal lägenheter</span>
              <input
                type="text"
                inputMode="numeric"
                value={form.antalLagenheter}
                onChange={(e) => {
                  setForm({ ...form, antalLagenheter: e.target.value });
                  setSparad(false);
                }}
                placeholder="t.ex. 24"
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-foreground">Antal våningar</span>
              <input
                type="text"
                inputMode="numeric"
                value={form.antalVaningar}
                onChange={(e) => {
                  setForm({ ...form, antalVaningar: e.target.value });
                  setSparad(false);
                }}
                placeholder="t.ex. 4"
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2"
              />
            </label>
          </div>
        </section>

        <section>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-sm font-semibold text-foreground">
              Styrelsens medlemmar
            </h3>
            <p className="text-xs text-muted">
              {kopplade} av {form.styrelseledamoter.length} med BankID
            </p>
          </div>
          <p className="mt-1 text-xs text-muted">
            Inloggning till föreningen ska ske via BankID kopplat till styrelsen.
            Demo: simulerad koppling tills riktig e-legitimation finns.
          </p>
          <ul className="mt-3 space-y-3">
            {form.styrelseledamoter.map((ledamot) => (
              <li
                key={ledamot.id}
                className="rounded-lg border border-border bg-white p-3 sm:p-4"
              >
                <div className="grid gap-3 sm:grid-cols-[1fr_10rem_auto]">
                  <label className="block text-sm">
                    <span className="font-medium text-foreground">Namn</span>
                    <input
                      type="text"
                      value={ledamot.namn}
                      onChange={(e) =>
                        uppdateraLedamot(ledamot.id, { namn: e.target.value })
                      }
                      placeholder="För- och efternamn"
                      className="mt-1 w-full rounded-lg border border-border px-3 py-2"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="font-medium text-foreground">Roll</span>
                    <select
                      value={ledamot.roll}
                      onChange={(e) =>
                        uppdateraLedamot(ledamot.id, { roll: e.target.value })
                      }
                      className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2"
                    >
                      {STYRELSE_ROLLER.map((roll) => (
                        <option key={roll} value={roll}>
                          {roll}
                        </option>
                      ))}
                      {!STYRELSE_ROLLER.includes(
                        ledamot.roll as (typeof STYRELSE_ROLLER)[number],
                      ) && ledamot.roll ? (
                        <option value={ledamot.roll}>{ledamot.roll}</option>
                      ) : null}
                    </select>
                  </label>
                  <div className="flex flex-col justify-end gap-2 sm:items-end">
                    {ledamot.bankidKopplad ? (
                      <>
                        <p className="text-xs font-medium text-primary-dark">
                          BankID kopplat
                        </p>
                        <button
                          type="button"
                          onClick={() => kopplaBortBankId(ledamot.id)}
                          className="text-xs text-muted hover:text-foreground"
                        >
                          Koppla bort
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        disabled={bankidPagarId === ledamot.id}
                        onClick={() => kopplaBankId(ledamot.id)}
                        className="rounded-lg bg-primary px-3 py-2 text-xs font-medium text-white hover:bg-primary-dark disabled:opacity-50"
                      >
                        {bankidPagarId === ledamot.id
                          ? "Öppnar BankID…"
                          : "Koppla BankID"}
                      </button>
                    )}
                    {form.styrelseledamoter.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => taBortLedamot(ledamot.id)}
                        className="text-xs text-muted hover:text-foreground"
                      >
                        Ta bort
                      </button>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={laggTillLedamot}
            className="mt-3 text-sm font-medium text-primary-dark hover:underline"
          >
            + Lägg till styrelsemedlem
          </button>
        </section>
      </div>

      {sparFel ? (
        <p
          className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {sparFel}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={spara}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          Spara grunduppgifter
        </button>
        <Link
          href="/forening/underhallsplan#grund"
          className="rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
        >
          Öppna underhållsplan steg 1
        </Link>
      </div>

      {sparad ? (
        <p className="mt-3 text-sm text-primary-dark" role="status">
          Sparat. Adresser, lägenheter och våningar är kopierade till
          underhållsplanen.
        </p>
      ) : null}
    </div>
  );
}
