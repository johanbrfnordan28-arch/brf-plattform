"use client";

import { useState } from "react";
import { OppnaStangKnapp } from "@/components/OppnaStangKnapp";
import {
  fastighetsdelGrupper,
  hamtaKomponentMall,
} from "@/components/underhallsplan/komponentregister";

type FastighetsdelarStegProps = {
  activeComponents: string[];
  onToggle: (namn: string) => void;
  onVidare: () => void;
};

export function FastighetsdelarSteg({
  activeComponents,
  onToggle,
  onVidare,
}: FastighetsdelarStegProps) {
  const [oppen, setOppen] = useState<string | null>("Tak");
  const kandaDelar = new Set<string>(
    fastighetsdelGrupper.flatMap((grupp) => grupp.komponenter),
  );
  const tillagdaDelar = activeComponents.filter((namn) => !kandaDelar.has(namn));

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-muted">
        Alla delar följer med genom hela planen: utförda arbeten, planerat
        underhåll och summeringen. Ta bort det som inte finns på huset. Ju mer
        planen anpassas, desto kortare blir den. En del som läggs till igen
        följer med på samma sätt.
      </p>
      {fastighetsdelGrupper.map((grupp) => (
        <section key={grupp.id} className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">{grupp.titel}</h3>
          <ul className="space-y-2">
            {grupp.komponenter.map((namn) => {
              const aktiv = activeComponents.includes(namn);
              const mall = hamtaKomponentMall(namn);
              const oppenDel = oppen === namn;
              const grupper = new Map<string, string[]>();
              for (const del of mall.underkomponenter) {
                const rubrik = del.grupp ?? "Delar";
                const lista = grupper.get(rubrik) ?? [];
                lista.push(del.etikett);
                grupper.set(rubrik, lista);
              }
              return (
                <li
                  key={namn}
                  className="rounded-xl border border-border bg-white"
                >
                  <div className="flex items-start justify-between gap-3 px-3 py-3">
                    <label className="flex min-w-0 flex-1 items-start gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={aktiv}
                        onChange={() => onToggle(namn)}
                        className="mt-1"
                      />
                      <span>
                        <span className="font-medium text-foreground">{namn}</span>
                        <span className="mt-0.5 block text-xs text-muted">
                          {mall.underkomponenter.length}{" "}
                          {mall.underkomponenter.length === 1
                            ? "underdel"
                            : "underdelar"}
                          {aktiv ? " · med i hela planen" : " · borttagen från planen"}
                        </span>
                      </span>
                    </label>
                    <OppnaStangKnapp
                      oppen={oppenDel}
                      storlek="sm"
                      onClick={() => setOppen(oppenDel ? null : namn)}
                      ariaLabel={
                        oppenDel ? `Stäng ${namn}` : `Öppna ${namn}`
                      }
                    />
                  </div>
                  {oppenDel && (
                    <div className="space-y-3 border-t border-border px-4 py-3">
                      <p className="text-xs text-muted">
                        {mall.deltypSektionTitel}:{" "}
                        {mall.deltyper.map((d) => d.etikett).join(", ")}
                      </p>
                      {mall.deltypHjalp && (
                        <p className="text-xs leading-relaxed text-muted">
                          {mall.deltypHjalp}
                        </p>
                      )}
                      {[...grupper.entries()].map(([rubrik, delar]) => (
                        <div key={rubrik}>
                          <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">
                            {rubrik}
                          </p>
                          <p className="mt-1 text-sm text-foreground">
                            {delar.join(", ")}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
      {tillagdaDelar.length > 0 && (
        <section className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Tillagda delar</h3>
          <ul className="space-y-2">
            {tillagdaDelar.map((namn) => (
              <li
                key={namn}
                className="rounded-xl border border-border bg-white px-3 py-3"
              >
                <label className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked
                    onChange={() => onToggle(namn)}
                    className="mt-1"
                  />
                  <span>
                    <span className="font-medium text-foreground">{namn}</span>
                    <span className="mt-0.5 block text-xs text-muted">
                      Egen del · med i hela planen
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </section>
      )}
      <button
        type="button"
        onClick={onVidare}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
      >
        Gå vidare till utförda arbeten
      </button>
    </div>
  );
}
