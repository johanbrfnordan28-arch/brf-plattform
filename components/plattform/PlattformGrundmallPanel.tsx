"use client";

import {
  GRUNDMALL_FORENING_ID,
  GRUNDMALL_NAMN,
  sattAktivForeningId,
} from "@/lib/forening-registry";

/**
 * Personal: öppna och underhåll den centrala grundmallen
 * (komponenter/underhåll som föreningar kan importera från).
 */
export function PlattformGrundmallPanel() {
  function oppna(path: string) {
    sattAktivForeningId(GRUNDMALL_FORENING_ID);
    window.location.href = path;
  }

  return (
    <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-foreground">Central grundmall</h2>
      <p className="mt-1 text-sm text-muted">
        {GRUNDMALL_NAMN} är vår gemensamma mall för underhållsplan och
        komponenter. Föreningar kan importera saknade delar härifrån till sin
        egen plan. Endast personal ska redigera mallen — den syns inte som val
        när en styrelse skapar sin förening.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => oppna("/forening/underhallsplan")}
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          Öppna grundmall — underhållsplan
        </button>
        <button
          type="button"
          onClick={() => oppna("/forening")}
          className="rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground hover:border-primary/40"
        >
          Öppna grundmall — startsida
        </button>
      </div>
    </section>
  );
}
