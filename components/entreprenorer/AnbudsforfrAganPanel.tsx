"use client";

import { useState } from "react";
import { useAktivForeningsNamn } from "@/components/forening/useAktivForeningsNamn";
import type { Entreprenor } from "@/components/entreprenorer/entreprenorer";

interface Props {
  valda: Entreprenor[];
  onStang: () => void;
}

function kopieraText(text: string, setSparad: (v: boolean) => void) {
  navigator.clipboard.writeText(text).then(() => {
    setSparad(true);
    setTimeout(() => setSparad(false), 2000);
  });
}

export function AnbudsforfrAganPanel({ valda, onStang }: Props) {
  const foreningsNamn = useAktivForeningsNamn();
  const arDag = new Date().toISOString().split("T")[0];

  const [projektNamn, setProjektNamn] = useState("");
  const [beskrivning, setBeskrivning] = useState("");
  const [sistaAnbudsdag, setSistaAnbudsdag] = useState("");
  const [kontaktperson, setKontaktperson] = useState("");
  const [kopiadAdresser, setKopiadAdresser] = useState(false);
  const [kopiadText, setKopiadText] = useState(false);
  const [visaForhandsgranskning, setVisaForhandsgranskning] = useState(false);

  const emails = valda.map((e) => e.epost).filter(Boolean);

  function byggMeddelande(): string {
    const projekt = projektNamn.trim() || "[Projekt ej angivet]";
    const besk = beskrivning.trim() || "[Beskrivning ej angiven]";
    const sista = sistaAnbudsdag || "[Datum ej angivet]";
    const kontakt = kontaktperson.trim() || "[Kontaktperson ej angiven]";

    return [
      `Hej,`,
      ``,
      `Vi kontaktar er angående ett projekt i vår bostadsrättsförening och önskar ett anbud.`,
      ``,
      `Projekt: ${projekt}`,
      ``,
      `Projektbeskrivning:`,
      besk,
      ``,
      `Sista dag för inlämning av anbud: ${sista}`,
      ``,
      `Kontaktperson hos oss: ${kontakt}`,
      ``,
      `Vi ber er att återkomma med ert anbud senast ${sista}.`,
      `Har ni frågor är ni välkomna att kontakta oss.`,
      ``,
      `Med vänliga hälsningar`,
      foreningsNamn,
    ].join("\n");
  }

  function oppnaEpost() {
    const amne = encodeURIComponent(
      `Anbudsförfrågan — ${projektNamn.trim() || "Projekt"}`,
    );
    const kropp = encodeURIComponent(byggMeddelande());
    const till = emails[0] ?? "";
    const bcc = emails.slice(1).join(",");
    const bccDel = bcc ? `&bcc=${encodeURIComponent(bcc)}` : "";
    window.open(`mailto:${till}?subject=${amne}${bccDel}&body=${kropp}`);
  }

  const inputKlass =
    "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

  return (
    <div className="rounded-xl border-2 border-primary/30 bg-[#eef6f0] p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Anbudsförfrågan
          </h3>
          <p className="mt-0.5 text-sm text-muted">
            Skickas till:{" "}
            <span className="font-medium text-foreground">
              {valda.map((e) => e.foretagsnamn).join(", ")}
            </span>
          </p>
        </div>
        <button
          type="button"
          onClick={onStang}
          className="rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted hover:text-foreground"
        >
          Stäng
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">
            Projektnamn / ärende
          </label>
          <input
            type="text"
            value={projektNamn}
            onChange={(e) => setProjektNamn(e.target.value)}
            placeholder="t.ex. Takbyte 2025"
            className={inputKlass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">
            Kontaktperson (er)
          </label>
          <input
            type="text"
            value={kontaktperson}
            onChange={(e) => setKontaktperson(e.target.value)}
            placeholder="Namn och ev. telefon"
            className={inputKlass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">
            Sista anbudsdag
          </label>
          <input
            type="date"
            value={sistaAnbudsdag}
            min={arDag}
            onChange={(e) => setSistaAnbudsdag(e.target.value)}
            className={inputKlass}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-muted">
            Projektbeskrivning
          </label>
          <textarea
            value={beskrivning}
            onChange={(e) => setBeskrivning(e.target.value)}
            rows={3}
            placeholder="Beskriv vad arbetet gäller, ungefärlig omfattning, eventuella krav…"
            className={`${inputKlass} resize-none`}
          />
        </div>
      </div>

      {/* Förhandsgranskning */}
      {visaForhandsgranskning && (
        <div className="mt-4 rounded-lg border border-border bg-white p-4">
          <p className="mb-2 text-xs font-medium text-muted">
            Förhandsgranskning av e-post
          </p>
          <pre className="whitespace-pre-wrap font-sans text-sm text-foreground">
            {byggMeddelande()}
          </pre>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {/* Öppna e-postklient */}
        <button
          type="button"
          onClick={oppnaEpost}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="h-4 w-4"
            aria-hidden
          >
            <path d="M1.75 2h12.5c.966 0 1.75.784 1.75 1.75v8.5A1.75 1.75 0 0 1 14.25 14H1.75A1.75 1.75 0 0 1 0 12.25v-8.5C0 2.784.784 2 1.75 2ZM1.5 5.854v6.396c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V5.854l-5.55 3.656a1.75 1.75 0 0 1-1.9 0L1.5 5.854Zm13 -1.737-6.23 4.108a.25.25 0 0 1-.27 0L1.5 4.117V3.75c0-.138.112-.25.25-.25h12.5c.138 0 .25.112.25.25v.367Z" />
          </svg>
          Öppna i e-postklient
        </button>

        {/* Kopiera e-postadresser */}
        <button
          type="button"
          onClick={() => kopieraText(emails.join(", "), setKopiadAdresser)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40"
        >
          {kopiadAdresser ? "✓ Kopierade!" : "Kopiera e-postadresser"}
        </button>

        {/* Kopiera meddelandetext */}
        <button
          type="button"
          onClick={() => kopieraText(byggMeddelande(), setKopiadText)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40"
        >
          {kopiadText ? "✓ Kopierat!" : "Kopiera meddelandetext"}
        </button>

        {/* Förhandsgranskning */}
        <button
          type="button"
          onClick={() => setVisaForhandsgranskning((v) => !v)}
          className="text-sm text-muted underline hover:text-foreground"
        >
          {visaForhandsgranskning ? "Dölj förhandsgranskning" : "Förhandsgranska"}
        </button>
      </div>

      <p className="mt-3 text-xs text-muted">
        "Öppna i e-postklient" öppnar din e-post med mottagarna och meddelandet
        förifyllt. Du kan granska och skicka därifrån.
      </p>
    </div>
  );
}
