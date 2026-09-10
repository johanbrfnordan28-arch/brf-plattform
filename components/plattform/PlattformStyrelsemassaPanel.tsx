"use client";

import { useCallback, useEffect, useState } from "react";
import {
  STYRELSEMASSA_LEAD_EVENT,
  listaStyrelsemassaLeadsLokal,
  sammanfattaStyrelsemassaLeadsLokal,
  type StyrelsemassaLeadLokal,
} from "@/lib/styrelsemassa-lager";

type LeadRad = {
  id: string;
  foreningsNamn: string;
  epost: string;
  kontaktperson: string;
  telefon: string;
  status: "lank_skickad" | "skapade_test";
  kalla?: "massa_sjalv" | "personal" | "massa_lank";
  inbjudenAvNamn?: string;
  skapadTidpunkt: string;
  testSkapadTidpunkt: string | null;
  foreningStatus?: string | null;
};

type Sammanfattning = {
  totalt: number;
  lankSkickad: number;
  skapadeTest: number;
  enbartTest: number;
};

const STATUS_ETIKETT: Record<LeadRad["status"], string> = {
  lank_skickad: "Länk skickad",
  skapade_test: "Skapade testförening",
};

const KALLA_ETIKETT: Record<
  NonNullable<LeadRad["kalla"]>,
  string
> = {
  massa_sjalv: "Mejla länk",
  personal: "Personalinbjudan",
  massa_lank: "Mäss-länk",
};

function formatTid(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("sv-SE", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function franLokal(l: StyrelsemassaLeadLokal): LeadRad {
  return {
    id: l.id,
    foreningsNamn: l.foreningsNamn,
    epost: l.epost,
    kontaktperson: l.kontaktperson,
    telefon: l.telefon,
    status: l.status,
    skapadTidpunkt: l.skapad,
    testSkapadTidpunkt: l.testSkapad,
  };
}

/**
 * Personalvy: styrelsemässa — länkar skickade och vem som skapade test senare.
 */
export function PlattformStyrelsemassaPanel() {
  const [leads, setLeads] = useState<LeadRad[]>([]);
  const [sammanfattning, setSammanfattning] = useState<Sammanfattning>({
    totalt: 0,
    lankSkickad: 0,
    skapadeTest: 0,
    enbartTest: 0,
  });
  const [demoLage, setDemoLage] = useState(false);

  const ladda = useCallback(async () => {
    const res = await fetch("/api/plattform/styrelsemassa");
    if (res.ok) {
      const data = (await res.json()) as {
        leads: LeadRad[];
        sammanfattning: Sammanfattning;
        demoLage?: boolean;
      };
      if (data.demoLage) {
        setDemoLage(true);
        const lokala = listaStyrelsemassaLeadsLokal().map(franLokal);
        const sum = sammanfattaStyrelsemassaLeadsLokal(
          listaStyrelsemassaLeadsLokal(),
        );
        setLeads(lokala);
        setSammanfattning({
          ...sum,
          enbartTest: sum.skapadeTest,
        });
        return;
      }
      setDemoLage(false);
      setLeads(data.leads ?? []);
      setSammanfattning(
        data.sammanfattning ?? {
          totalt: 0,
          lankSkickad: 0,
          skapadeTest: 0,
          enbartTest: 0,
        },
      );
      return;
    }

    setDemoLage(true);
    const lokala = listaStyrelsemassaLeadsLokal().map(franLokal);
    const sum = sammanfattaStyrelsemassaLeadsLokal(
      listaStyrelsemassaLeadsLokal(),
    );
    setLeads(lokala);
    setSammanfattning({ ...sum, enbartTest: sum.skapadeTest });
  }, []);

  useEffect(() => {
    void ladda();
    function refresh() {
      void ladda();
    }
    window.addEventListener(STYRELSEMASSA_LEAD_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(STYRELSEMASSA_LEAD_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [ladda]);

  return (
    <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-foreground">
        Inbjudningar och mässa
      </h2>
      <p className="mt-1 text-sm text-muted">
        Mejlad länk, personlig inbjudan och uppföljning — vem som skapade test
        senare.
      </p>

      {demoLage ? (
        <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
          Demoläge — listan i denna webbläsare. Med databas synkas alla
          registreringar från mässan.
        </p>
      ) : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(
          [
            ["Länkar skickade", sammanfattning.totalt],
            ["Väntar på svar", sammanfattning.lankSkickad],
            ["Skapade test", sammanfattning.skapadeTest],
            ["Enbart test (ej kund)", sammanfattning.enbartTest],
          ] as const
        ).map(([etikett, varde]) => (
          <div
            key={etikett}
            className="rounded-xl border border-border bg-[#fafcfa] px-3 py-4 text-center"
          >
            <p className="text-2xl font-bold text-foreground">{varde}</p>
            <p className="text-xs text-muted">{etikett}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border text-xs uppercase text-muted">
            <tr>
              <th className="py-2 pr-3">Förening</th>
              <th className="py-2 pr-3">Kontakt</th>
              <th className="py-2 pr-3">Källa</th>
              <th className="py-2 pr-3">Skickad</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2">Test skapad</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((rad) => (
              <tr key={rad.id} className="border-b border-border/60">
                <td className="py-2 pr-3 font-medium">{rad.foreningsNamn}</td>
                <td className="py-2 pr-3">
                  <div>{rad.kontaktperson || "—"}</div>
                  <div className="text-xs text-muted">{rad.epost}</div>
                  {rad.telefon ? (
                    <div className="text-xs text-muted">{rad.telefon}</div>
                  ) : null}
                </td>
                <td className="py-2 pr-3 text-xs">
                  {rad.kalla ? KALLA_ETIKETT[rad.kalla] : "—"}
                  {rad.inbjudenAvNamn ? (
                    <div className="text-muted">{rad.inbjudenAvNamn}</div>
                  ) : null}
                </td>
                <td className="py-2 pr-3 whitespace-nowrap">
                  {formatTid(rad.skapadTidpunkt)}
                </td>
                <td className="py-2 pr-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      rad.status === "skapade_test"
                        ? "bg-[#eef6f0] text-primary-dark"
                        : "bg-amber-50 text-amber-900"
                    }`}
                  >
                    {STATUS_ETIKETT[rad.status]}
                    {rad.foreningStatus === "kund" ? " · kund" : ""}
                  </span>
                </td>
                <td className="py-2 whitespace-nowrap">
                  {formatTid(rad.testSkapadTidpunkt)}
                </td>
              </tr>
            ))}
            {leads.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-4 text-muted">
                  Inga registreringar ännu. Skicka inbjudan ovan eller använd
                  «Mejla mig en länk» på huvudsidan.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
