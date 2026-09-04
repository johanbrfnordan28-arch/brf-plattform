"use client";

import { useState } from "react";
import type { TipsPunkt } from "@/lib/tips-data";

interface Props {
  tips: TipsPunkt[];
  /** Valfri rubrik — standard: "Tips för dig som styrelse" */
  rubrik?: string;
}

export function TipsPanel({ tips, rubrik = "Tips & råd" }: Props) {
  const [dold, setDold] = useState(false);

  if (dold) {
    return (
      <button
        type="button"
        onClick={() => setDold(false)}
        className="mb-2 flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted hover:text-foreground"
      >
        💡 Visa tips
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-primary/20 bg-[#eef6f0]/70 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">💡</span>
          <p className="text-sm font-semibold text-primary-dark">{rubrik}</p>
        </div>
        <button
          type="button"
          onClick={() => setDold(true)}
          className="rounded px-1.5 py-0.5 text-xs text-muted hover:text-foreground"
          aria-label="Dölj tips"
        >
          Dölj
        </button>
      </div>

      <ul className="space-y-3">
        {tips.map((t, i) => (
          <li key={i} className="flex gap-3">
            <span className="mt-0.5 shrink-0 text-base leading-tight" aria-hidden>
              {t.ikon}
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">{t.titel}</p>
              <p className="mt-0.5 text-sm leading-relaxed text-muted">{t.text}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-3 border-t border-primary/15 pt-3">
        <a
          href="/forening/guider"
          className="text-xs font-medium text-primary-dark hover:underline"
        >
          Visa alla guider och filmer →
        </a>
      </div>
    </div>
  );
}
