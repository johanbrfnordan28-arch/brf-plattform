"use client";

import Link from "next/link";
import { KortGuideFilm } from "@/components/guider/KortGuideFilm";
import { energiGuideFilm } from "@/components/energi/energi-guide-film";
import {
  energiBelysningAtgarder,
  energiFonsterAtgarder,
  energiTakAtgarder,
  energiVarmeAtgarder,
  type EnergiAtgard,
} from "@/components/energi/energi-atgarder";
import { LivslangdForklaringPanel } from "@/components/underhallsplan/LivslangdForklaringPanel";

function AtgardLista({
  rubrik,
  atgarder,
  id,
}: {
  rubrik: string;
  atgarder: EnergiAtgard[];
  id?: string;
}) {
  return (
    <div
      id={id}
      className="scroll-mt-24 rounded-xl border border-border bg-surface p-4 sm:p-5"
    >
      <h3 className="text-lg font-semibold text-foreground">{rubrik}</h3>
      <ul className="mt-4 space-y-4">
        {atgarder.map((a) => (
          <li
            key={a.id}
            className="rounded-lg border border-border bg-background px-4 py-3"
          >
            <p className="font-medium text-foreground">{a.titel}</p>
            <p className="mt-1 text-sm text-muted">{a.beskrivning}</p>
            <p className="mt-2 text-xs text-primary-dark">
              {a.effekt === "drift" && "Främst lägre driftkostnad"}
              {a.effekt === "livslangd" &&
                "Främst längre livslängd / bättre funktion"}
              {a.effekt === "bade" && "Både driftkostnad och livslängd"}
            </p>
            {a.tips && (
              <p className="mt-1 text-xs text-muted">
                <span className="font-medium text-foreground">Tips:</span>{" "}
                {a.tips}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function EnergiModul() {
  return (
    <div className="space-y-8">
      <LivslangdForklaringPanel />

      <div>
        <h2 className="text-xl font-bold text-foreground">Inspirationsfilm</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Kort demo om värme och belysning — samma upplägg som under Guider &amp; tips.
          Byt till riktig video när den finns inlagd.
        </p>
        <ul className="mt-4">
          <li>
            <KortGuideFilm film={energiGuideFilm} />
          </li>
        </ul>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AtgardLista
          id="varme"
          rubrik="Värmesystem"
          atgarder={energiVarmeAtgarder}
        />
        <AtgardLista rubrik="Belysning" atgarder={energiBelysningAtgarder} />
        <AtgardLista id="tak" rubrik="Tak" atgarder={energiTakAtgarder} />
        <AtgardLista
          id="fonster"
          rubrik="Fönster"
          atgarder={energiFonsterAtgarder}
        />
      </div>

      <div className="rounded-xl border border-primary/30 bg-[#eef6f0] p-4 text-sm text-muted">
        <p className="font-semibold text-primary-dark">Koppling till övriga moduler</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <Link href="/forening/underhallsplan" className="text-primary-dark underline">
              Underhållsplan
            </Link>{" "}
            — planera tekniska byten och löpande underhåll (steg 3)
          </li>
          <li>
            <Link href="/forening/rondering" className="text-primary-dark underline">
              Rondering
            </Link>{" "}
            — takavvattning, belysning och undercentral i drift
          </li>
          <li>
            <Link href="/forening/upphandling" className="text-primary-dark underline">
              Upphandling
            </Link>{" "}
            — större energi-, tak- och fönsterprojekt
          </li>
        </ul>
        <p className="mt-3 text-xs">
          Modulen byggs ut löpande — fler åtgärder (t.ex. ventilation och solceller) kan
          läggas till efter behov.
        </p>
      </div>
    </div>
  );
}
