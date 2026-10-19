"use client";

import { useEffect, useState } from "react";
import {
  arFakturaUppgifterKlara,
  fakturaFranProfil,
  hamtaAntalLagenheterForFaktura,
  skickaForeningFakturaKlient,
  type ForeningFakturaUppgifter as FakturaForm,
} from "@/lib/forening-faktura";
import {
  FORENING_AKTIV_EVENT,
  sparaForeningProfil,
  type ForeningProfil,
} from "@/lib/forening-registry";

type Props = {
  profil: ForeningProfil;
  onSparad: (profil: ForeningProfil) => void;
};

export function ForeningFakturaUppgifter({ profil, onSparad }: Props) {
  const [form, setForm] = useState<FakturaForm>(() => fakturaFranProfil(profil));
  const [sparad, setSparad] = useState(false);
  const [skickar, setSkickar] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [fel, setFel] = useState<string | null>(null);

  useEffect(() => {
    setForm(fakturaFranProfil(profil));
  }, [profil.id]);

  function spara(nasta: FakturaForm = form): ForeningProfil {
    const uppdaterad: ForeningProfil = {
      ...profil,
      fakturaEpost: nasta.epost.trim(),
      fakturaAdress: nasta.adress.trim(),
      fakturaPostnummer: nasta.postnummer.trim(),
      fakturaOrt: nasta.ort.trim(),
      fakturaReferens: nasta.referens.trim(),
    };
    sparaForeningProfil(uppdaterad);
    onSparad(uppdaterad);
    setSparad(true);
    return uppdaterad;
  }

  async function skickaFaktura() {
    setFel(null);
    setStatus(null);
    if (!arFakturaUppgifterKlara(form)) {
      setFel("Ange fakturaadress och e-post dit fakturan ska skickas.");
      return;
    }
    const antal = hamtaAntalLagenheterForFaktura();
    if (antal < 1) {
      setFel(
        "Antal lägenheter saknas. Komplettera under grunduppgifter och försök igen.",
      );
      return;
    }
    const sparadProfil = spara();
    setSkickar(true);
    try {
      const resultat = await skickaForeningFakturaKlient({
        foreningId: sparadProfil.id,
        foreningsNamn: sparadProfil.namn,
        organisationsnummer: sparadProfil.organisationsnummer,
        faktura: form,
        antalLagenheter: antal,
      });
      if (!resultat.ok) {
        setFel(resultat.meddelande);
        return;
      }
      const medSkickad: ForeningProfil = {
        ...sparadProfil,
        fakturaSkickadTidpunkt: new Date().toISOString(),
      };
      sparaForeningProfil(medSkickad, { tyst: true });
      window.dispatchEvent(new Event(FORENING_AKTIV_EVENT));
      onSparad(medSkickad);
      setStatus(resultat.meddelande);
    } catch (e) {
      setFel(e instanceof Error ? e.message : "Kunde inte skicka fakturan.");
    } finally {
      setSkickar(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-sm sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        Fakturering
      </p>
      <h3 className="mt-1 text-lg font-semibold text-foreground">
        Vart ska fakturan skickas?
      </h3>
      <p className="mt-2 text-sm text-muted">
        Organisationsnummer och föreningsnamn hämtas från grunduppgifterna.
        Här anger ni bara fakturamottagare — sedan kan fakturan skickas direkt.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block text-sm sm:col-span-2">
          <span className="font-medium text-foreground">E-post för faktura</span>
          <input
            type="email"
            value={form.epost}
            onChange={(e) => {
              setForm({ ...form, epost: e.target.value });
              setSparad(false);
            }}
            placeholder="ekonomi@exempel.se"
            className="mt-1 w-full rounded-lg border border-border px-3 py-2"
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="font-medium text-foreground">Fakturaadress</span>
          <input
            type="text"
            value={form.adress}
            onChange={(e) => {
              setForm({ ...form, adress: e.target.value });
              setSparad(false);
            }}
            placeholder="Hämtas från grunduppgifter om ni inte ändrar"
            className="mt-1 w-full rounded-lg border border-border px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-foreground">Postnummer</span>
          <input
            type="text"
            value={form.postnummer}
            onChange={(e) => {
              setForm({ ...form, postnummer: e.target.value });
              setSparad(false);
            }}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2"
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
            className="mt-1 w-full rounded-lg border border-border px-3 py-2"
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="font-medium text-foreground">
            Referens (valfritt)
          </span>
          <input
            type="text"
            value={form.referens}
            onChange={(e) => {
              setForm({ ...form, referens: e.target.value });
              setSparad(false);
            }}
            placeholder="t.ex. att: kassör"
            className="mt-1 w-full rounded-lg border border-border px-3 py-2"
          />
        </label>
      </div>

      {fel && (
        <p
          className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {fel}
        </p>
      )}
      {status && (
        <p className="mt-3 text-sm text-primary-dark" role="status">
          {status}
        </p>
      )}
      {profil.fakturaSkickadTidpunkt && !status && (
        <p className="mt-3 text-sm text-muted">
          Senast skickad{" "}
          {new Date(profil.fakturaSkickadTidpunkt).toLocaleString("sv-SE")}.
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => spara()}
          className="rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
        >
          {sparad ? "Fakturauppgifter sparade" : "Spara fakturauppgifter"}
        </button>
        <button
          type="button"
          onClick={() => void skickaFaktura()}
          disabled={skickar}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
        >
          {skickar ? "Skickar faktura …" : "Skicka faktura nu"}
        </button>
      </div>
    </div>
  );
}
