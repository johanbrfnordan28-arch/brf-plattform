"use client";

import { useState } from "react";

const rodKlass =
  "inline-flex h-9 items-center whitespace-nowrap rounded-lg bg-red-600 px-3.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50";

export function LoggaUtKnapp({ className }: { className?: string }) {
  const [loggarUt, setLoggarUt] = useState(false);

  async function loggaUt() {
    setLoggarUt(true);
    try {
      const { rensaLokalSession } = await import("@/lib/auth/lokal-session");
      rensaLokalSession();
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      /* fortsätt till startsidan ändå */
    }
    window.location.href = "/";
  }

  return (
    <button
      type="button"
      disabled={loggarUt}
      onClick={() => void loggaUt()}
      className={className ?? rodKlass}
    >
      {loggarUt ? "Loggar ut…" : "Logga ut"}
    </button>
  );
}
