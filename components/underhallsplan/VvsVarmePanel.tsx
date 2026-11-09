"use client";

import { useState } from "react";
import { ListaSummeringPanel } from "@/components/underhallsplan/ListaSummeringPanel";
import {
  normaliseraVvsVarmeStam,
  skapaTomVvsVarmeStam,
  summeraVvsVarmeStammar,
  type VvsVarmeStam,
} from "@/components/underhallsplan/vvs-varme";

type VvsVarmePanelProps = {
  poster: VvsVarmeStam[];
  onChange: (poster: VvsVarmeStam[]) => void;
  adresser?: string[];
};

function TextFalt({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="text-xs font-medium text-muted">{label}</span>
      {hint && <span className="mt-0.5 block text-[11px] text-muted">{hint}</span>}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
      />
    </label>
  );
}

export function VvsVarmePanel({
  poster,
  onChange,
  adresser = [],
}: VvsVarmePanelProps) {
  const [antalAttLagga, setAntalAttLagga] = useState("1");
  const rader = poster.map((p, i) => normaliseraVvsVarmeStam(p, i));

  function spara(nasta: VvsVarmeStam[]) {
    onChange(nasta.map((p, i) => normaliseraVvsVarmeStam(p, i)));
  }

  function uppdatera(id: string, patch: Partial<VvsVarmeStam>) {
    spara(rader.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  function läggTill(antal: number) {
    const start = rader.length;
    const nya = Array.from({ length: antal }, (_, i) =>
      skapaTomVvsVarmeStam(`Värmestam ${start + i + 1}`),
    );
    spara([...rader, ...nya]);
  }

  function läggTillFranFalt() {
    const n = Number.parseInt(antalAttLagga, 10);
    läggTill(Number.isFinite(n) && n > 0 ? Math.min(n, 40) : 1);
  }

  return (
    <div className="space-y-4">
      <p className="text-xs leading-relaxed text-muted">
        Grundmall för värmestammar. Varje stam kan döpas och märkas i källaren
        och beskriver var den går upp i fastigheten. Stammarna kan skilja sig
        åt — ändra fälten på den stam det gäller. Stamventiler läggs inte in
        här. De registreras bara under Värmecentral → Stamventiler.
      </p>

      <div className="flex flex-wrap items-end gap-2 rounded-lg border border-primary/30 bg-[#fafcfa] p-3">
        <p className="mr-auto text-sm font-medium text-primary-dark">
          Antal värmestammar: {rader.length} st
        </p>
        <label className="block text-sm">
          <span className="text-xs font-medium text-muted">Lägg till</span>
          <input
            type="number"
            min={1}
            max={40}
            step={1}
            value={antalAttLagga}
            onChange={(e) => setAntalAttLagga(e.target.value)}
            className="mt-1 w-20 rounded-lg border border-border bg-white px-3 py-2 text-sm"
          />
        </label>
        <button
          type="button"
          onClick={läggTillFranFalt}
          className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          + Lägg till stammar
        </button>
      </div>

      {rader.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-white px-3 py-4 text-center text-xs text-muted">
          Inga värmestammar ännu — ange antal och lägg till. Varje stam får
          samma grundmall och kan sedan ändras.
        </p>
      ) : (
        <ul className="space-y-3">
          {rader.map((post, index) => (
            <li
              key={post.id}
              className="rounded-lg border border-border bg-white p-3 sm:p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-primary-dark">
                  {post.namn.trim() || `Värmestam ${index + 1}`}
                </span>
                <button
                  type="button"
                  onClick={() => spara(rader.filter((p) => p.id !== post.id))}
                  className="text-xs text-muted hover:text-red-700"
                >
                  Ta bort
                </button>
              </div>

              <p className="text-xs font-semibold text-primary-dark">I källaren</p>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <TextFalt
                  label="Namn"
                  value={post.namn}
                  onChange={(namn) => uppdatera(post.id, { namn })}
                  placeholder="t.ex. Stam 1"
                  hint="Namnet stammen har där den är märkt."
                />
                <TextFalt
                  label="Märkning"
                  value={post.markningKallare}
                  onChange={(markningKallare) =>
                    uppdatera(post.id, { markningKallare })
                  }
                  placeholder="t.ex. skylt VS-A"
                  hint="Texten på märkningen i källaren."
                />
              </div>

              <p className="mt-4 text-xs font-semibold text-primary-dark">
                Var stammen går upp
              </p>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="text-xs font-medium text-muted">Adress</span>
                  <input
                    type="text"
                    list={adresser.length > 0 ? `vvs-varme-adress-${post.id}` : undefined}
                    value={post.adress}
                    onChange={(e) => uppdatera(post.id, { adress: e.target.value })}
                    placeholder="t.ex. Hannebergsgatan 22"
                    className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                  />
                  {adresser.length > 0 && (
                    <datalist id={`vvs-varme-adress-${post.id}`}>
                      {adresser.map((adress) => (
                        <option key={adress} value={adress} />
                      ))}
                    </datalist>
                  )}
                </label>
                <TextFalt
                  label="Betjänar"
                  value={post.betjanar}
                  onChange={(betjanar) => uppdatera(post.id, { betjanar })}
                  placeholder="t.ex. vardagsrum, 3 rum och kök"
                />
                <TextFalt
                  label="Antal våningar"
                  value={post.vaningar}
                  onChange={(vaningar) => uppdatera(post.id, { vaningar })}
                  placeholder="t.ex. 5"
                />
                <TextFalt
                  label="Antal radiatorer"
                  value={post.radiatorAntal}
                  onChange={(radiatorAntal) =>
                    uppdatera(post.id, { radiatorAntal })
                  }
                  placeholder="t.ex. 12"
                />
                <div className="sm:col-span-2">
                  <TextFalt
                    label="Storlek på rummen"
                    value={post.rumStorlek}
                    onChange={(rumStorlek) => uppdatera(post.id, { rumStorlek })}
                    placeholder="t.ex. vardagsrum 22 m², sovrum 12 m²"
                    hint="Rummen stammen betjänar."
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {rader.length > 0 && (
        <ListaSummeringPanel
          titel="Summering värme"
          rader={summeraVvsVarmeStammar(rader)}
        />
      )}
    </div>
  );
}
