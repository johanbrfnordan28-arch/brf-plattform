"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  DEMO_BANKID_IDENTITETER,
  hittaForeningarForPerson,
  hittaKundViaOrganisationsnummer,
  maskeraPersonnummer,
  sakraDemoKundForeningar,
  sparaInloggningsSession,
  startaForeningEfterInloggning,
  type DemoBankIdIdentitet,
  type InloggningsSession,
} from "@/lib/kund-inloggning";
import {
  GRUNDMALL_FORENING_ID,
  markeraPendingAktivForening,
  sattAktivForeningId,
  type ForeningProfil,
} from "@/lib/forening-registry";
import { BRF_NAVET_NAMN, NAVET_INLOGGNING_LABEL } from "@/lib/forening-konstanter";
import { PROVA_GRATIS_PATH } from "@/lib/skapa-testforening-lank";

type BankidSteg = "idle" | "pågår" | "klar";
type Vy = "kund" | "valj-forening" | "anstalld";

export function KundLoginModul() {
  const [vy, setVy] = useState<Vy>("kund");
  const [valdIdentitet, setValdIdentitet] = useState<string>(
    DEMO_BANKID_IDENTITETER[0]?.id ?? "",
  );
  const [bankidSteg, setBankidSteg] = useState<BankidSteg>("idle");
  const [fel, setFel] = useState("");
  const [minaForeningar, setMinaForeningar] = useState<ForeningProfil[]>([]);
  const [sessionUtkast, setSessionUtkast] = useState<InloggningsSession | null>(
    null,
  );
  const [supportOrg, setSupportOrg] = useState("");
  const [visaAnstalld, setVisaAnstalld] = useState(false);

  useEffect(() => {
    sakraDemoKundForeningar();
  }, []);

  function identitet(): DemoBankIdIdentitet | null {
    return (
      DEMO_BANKID_IDENTITETER.find((d) => d.id === valdIdentitet) ?? null
    );
  }

  function aktiveraForening(foreningId: string, session: InloggningsSession) {
    sparaInloggningsSession({ ...session, foreningId });
    markeraPendingAktivForening(foreningId);
    sattAktivForeningId(foreningId);
    window.location.assign(startaForeningEfterInloggning(foreningId));
  }

  function startaBankId() {
    const id = identitet();
    if (!id) {
      setFel("Välj vilken person som identifierar sig med BankID.");
      return;
    }
    setFel("");
    setBankidSteg("pågår");
    window.setTimeout(() => {
      setBankidSteg("klar");
      slutforEfterBankId(id);
    }, 1400);
  }

  function slutforEfterBankId(id: DemoBankIdIdentitet) {
    const session: InloggningsSession = {
      typ: id.typ,
      namn: id.namn,
      personnummer: id.personnummer,
      support: id.support,
      inloggadTidpunkt: new Date().toISOString(),
    };

    if (id.typ === "anstalld") {
      sparaInloggningsSession(session);
      setSessionUtkast(session);
      setVy("anstalld");
      return;
    }

    const foreningar = hittaForeningarForPerson(id.personnummer);
    if (foreningar.length === 0) {
      setFel(
        "Ingen behörighet hittades för dig. Be er styrelse lägga till dig under Inloggningsbehörigheter, eller kontakta support.",
      );
      setBankidSteg("idle");
      return;
    }
    if (foreningar.length === 1) {
      aktiveraForening(foreningar[0].id, session);
      return;
    }
    setSessionUtkast(session);
    setMinaForeningar(foreningar);
    setVy("valj-forening");
  }

  function loggaInGrundmall() {
    const s = sessionUtkast;
    if (!s || s.typ !== "anstalld") return;
    sparaInloggningsSession({ ...s, foreningId: GRUNDMALL_FORENING_ID });
    markeraPendingAktivForening(GRUNDMALL_FORENING_ID);
    sattAktivForeningId(GRUNDMALL_FORENING_ID);
    window.location.assign("/forening");
  }

  function supportOppnaKund() {
    const s = sessionUtkast;
    if (!s?.support) {
      setFel("Endast support kan öppna kundföreningar för hjälp.");
      return;
    }
    const kund = hittaKundViaOrganisationsnummer(supportOrg);
    if (!kund) {
      setFel(
        "Ingen kund hittades med det organisationsnumret. Kontrollera numret — vi visar inte kundlistor.",
      );
      return;
    }
    setFel("");
    aktiveraForening(kund.id, s);
  }

  if (vy === "valj-forening" && sessionUtkast) {
    return (
      <div className="mx-auto max-w-lg space-y-5 px-4">
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">
            BankID bekräftat
          </p>
          <h2 className="mt-1 text-xl font-bold text-foreground">
            Välj förening
          </h2>
          <p className="mt-2 text-sm text-muted">
            Du ({sessionUtkast.namn}) har behörighet i flera föreningar. Endast
            dina egna visas här.
          </p>
          <ul className="mt-5 space-y-3">
            {minaForeningar.map((f) => (
              <li key={f.id}>
                <button
                  type="button"
                  onClick={() => aktiveraForening(f.id, sessionUtkast)}
                  className="flex w-full items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 text-left transition-colors hover:border-primary/50 hover:bg-[#eef6f0]"
                >
                  <span>
                    <span className="block font-semibold text-foreground">
                      {f.namn}
                    </span>
                    <span className="text-xs text-muted">{f.ort}</span>
                  </span>
                  <span className="text-sm font-medium text-primary-dark">
                    Öppna →
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (vy === "anstalld" && sessionUtkast) {
    return (
      <div className="mx-auto max-w-lg space-y-5 px-4">
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">
            {BRF_NAVET_NAMN} · Personal
          </p>
          <h2 className="mt-1 text-xl font-bold text-foreground">
            Hej {sessionUtkast.namn}
          </h2>
          <p className="mt-2 text-sm text-muted">
            Inloggad som anställd
            {sessionUtkast.support ? " med supportbehörighet" : ""}. Kundlistor
            visas aldrig — öppna kund via organisationsnummer när ni ska hjälpa
            till.
          </p>

          <div className="mt-5 space-y-3">
            <button
              type="button"
              onClick={loggaInGrundmall}
              className="brf-knapp-gron w-full px-5 py-3 text-sm"
            >
              {NAVET_INLOGGNING_LABEL} (grundmodul)
            </button>
            <Link
              href="/intern"
              className="flex w-full items-center justify-center rounded-xl border border-border bg-surface px-5 py-3 text-sm font-medium text-foreground hover:border-primary/50"
            >
              Intern portal
            </Link>
          </div>

          {sessionUtkast.support && (
            <div className="mt-6 rounded-xl border border-primary/25 bg-[#eef6f0]/60 p-4">
              <p className="text-sm font-semibold text-foreground">
                Hjälp en kund
              </p>
              <p className="mt-1 text-xs text-muted">
                Ange kundens organisationsnummer. Ni ser inte hur många kunder
                vi har — bara den ni söker upp.
              </p>
              <label className="mt-3 block text-xs font-medium text-foreground">
                Organisationsnummer
                <input
                  value={supportOrg}
                  onChange={(e) => setSupportOrg(e.target.value)}
                  placeholder="769600-XXXX"
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                />
              </label>
              <button
                type="button"
                onClick={supportOppnaKund}
                className="brf-knapp-gron mt-3 w-full px-4 py-2.5 text-sm"
              >
                Öppna kundförening
              </button>
              <p className="mt-2 text-[11px] text-muted">
                Demo-exempel (endast för er internt): 769600-1111 eller
                769600-2222
              </p>
            </div>
          )}

          {fel && (
            <p
              className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
              role="alert"
            >
              {fel}
            </p>
          )}

          <button
            type="button"
            onClick={() => {
              setVy("kund");
              setBankidSteg("idle");
              setSessionUtkast(null);
              setFel("");
            }}
            className="mt-4 text-sm text-muted underline hover:text-foreground"
          >
            Tillbaka till kundinloggning
          </button>
        </div>
      </div>
    );
  }

  const kundIdentiteter = DEMO_BANKID_IDENTITETER.filter((d) => d.typ === "kund");
  const anstalldIdentiteter = DEMO_BANKID_IDENTITETER.filter(
    (d) => d.typ === "anstalld",
  );
  const aktivaIdentiteter = visaAnstalld ? anstalldIdentiteter : kundIdentiteter;

  return (
    <div className="mx-auto max-w-lg space-y-5 px-4">
      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold text-primary-dark">
          Befintliga kunder
        </p>
        <h2 className="mt-1 text-xl font-bold text-foreground sm:text-2xl">
          Logga in med BankID
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Identifiera dig med BankID. Du kommer bara in i föreningar där
          styrelsen har gett dig behörighet. Styrelsen lägger till och tar bort
          personer under Uppgifter. Personal från {BRF_NAVET_NAMN} kan alltid
          logga in för att hjälpa till. Vi visar aldrig en lista över våra
          kunder.
        </p>

        <div className="mt-6 space-y-3">
          <p className="text-xs font-medium text-foreground">
            {visaAnstalld
              ? "Välj anställd (demo-BankID)"
              : "Välj din identitet (demo-BankID)"}
          </p>
          <ul className="space-y-2">
            {aktivaIdentiteter.map((d) => {
              const vald = valdIdentitet === d.id;
              return (
                <li key={d.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setValdIdentitet(d.id);
                      setBankidSteg("idle");
                      setFel("");
                    }}
                    className={`flex w-full flex-col rounded-xl border px-4 py-3 text-left transition-colors ${
                      vald
                        ? "border-primary bg-[#eef6f0]"
                        : "border-border bg-surface hover:border-primary/40"
                    }`}
                  >
                    <span className="font-semibold text-foreground">
                      {d.namn}
                    </span>
                    <span className="text-xs text-muted">
                      {maskeraPersonnummer(d.personnummer)} · {d.beskrivning}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <button
          type="button"
          disabled={bankidSteg === "pågår"}
          onClick={startaBankId}
          className={`brf-knapp-gron mt-6 w-full px-5 py-3.5 text-base font-semibold ${
            bankidSteg === "klar" ? "opacity-90" : ""
          }`}
        >
          {bankidSteg === "pågår"
            ? "Öppnar BankID…"
            : bankidSteg === "klar"
              ? "BankID klart"
              : "Logga in med BankID"}
        </button>

        {fel && (
          <p
            className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
            role="alert"
          >
            {fel}
          </p>
        )}

        <p className="mt-4 text-xs leading-relaxed text-muted">
          Demo utan riktig BankID-koppling. I produktion öppnas BankID-appen och
          personuppgifter hämtas säkert — föreningar löses ut från behörighet,
          aldrig från en publik katalog.
        </p>
      </div>

      <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-4 text-center">
        <p className="text-sm text-muted">
          Vill ni bara testa plattformen?{" "}
          <Link
            href={PROVA_GRATIS_PATH}
            className="font-medium text-primary-dark underline hover:no-underline"
          >
            Pröva gratis
          </Link>
        </p>
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={() => {
            setVisaAnstalld((v) => !v);
            setBankidSteg("idle");
            setFel("");
            const nasta = !visaAnstalld;
            const lista = nasta ? anstalldIdentiteter : kundIdentiteter;
            setValdIdentitet(lista[0]?.id ?? "");
          }}
          className="text-xs text-muted underline hover:text-foreground"
        >
          {visaAnstalld
            ? "Tillbaka till kundinloggning"
            : `Anställd hos ${BRF_NAVET_NAMN}?`}
        </button>
      </div>
    </div>
  );
}
