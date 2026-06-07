"use client";

import {
  foreningEgenskapEtiketter,
  hamtaForeslaEgenskaperFranLager,
  type ForeningEgenskap,
  type ForeningEgenskaper,
} from "@/components/rondering/forening-egenskaper";

type RonderingForeningEgenskaperProps = {
  egenskaper: ForeningEgenskaper;
  onChange: (egenskaper: ForeningEgenskaper) => void;
};

const grupper: { rubrik: string; nycklar: ForeningEgenskap[] }[] = [
  {
    rubrik: "Gemensamma utrymmen",
    nycklar: [
      "trapphus",
      "kallare",
      "soprum",
      "tvattstuga",
      "hiss",
      "cykelforrad",
      "foreningslokal",
      "gemensamToalett",
    ],
  },
  {
    rubrik: "Byggnad och utemiljö",
    nycklar: [
      "tak",
      "balkonger",
      "markOchGard",
      "lekplats",
      "garage",
      "fleraByggnader",
      "verksamhetslokaler",
    ],
  },
];

export function RonderingForeningEgenskaper({
  egenskaper,
  onChange,
}: RonderingForeningEgenskaperProps) {
  const franPlan = hamtaForeslaEgenskaperFranLager();

  function toggle(key: ForeningEgenskap) {
    onChange({ ...egenskaper, [key]: !egenskaper[key] });
  }

  function hamtaFranUnderhallsplan() {
    if (!franPlan) return;
    onChange(franPlan);
  }

  return (
    <div className="rounded-xl border border-primary/20 bg-[#eef6f0]/50 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Föreningens egenskaper
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Styr vilka punkter som ingår i checklistorna. Avmarkera det som inte
            finns i er fastighet — t.ex. hiss, tvättstuga eller lekplats.
          </p>
        </div>
        {franPlan && (
          <button
            type="button"
            onClick={hamtaFranUnderhallsplan}
            className="rounded-lg border border-primary bg-white px-3 py-2 text-xs font-medium text-primary-dark hover:bg-[#eef6f0]"
          >
            Hämta från underhållsplan
          </button>
        )}
      </div>

      {!franPlan && (
        <p className="mt-3 text-xs text-muted">
          Tips: spara grunduppgifter och komponenter i underhållsplanen (steg 1–3)
          — då kan egenskaperna föreslås automatiskt.
        </p>
      )}

      <div className="mt-4 space-y-4">
        {grupper.map((grupp) => (
          <div key={grupp.rubrik}>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              {grupp.rubrik}
            </p>
            <ul className="mt-2 grid gap-2 sm:grid-cols-2">
              {grupp.nycklar.map((key) => (
                <li key={key}>
                  <label className="flex cursor-pointer gap-2 rounded-lg border border-border bg-white px-3 py-2 text-sm hover:border-primary/30">
                    <input
                      type="checkbox"
                      checked={egenskaper[key]}
                      onChange={() => toggle(key)}
                      disabled={key === "trapphus"}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-primary"
                    />
                    <span className="text-foreground">
                      {foreningEgenskapEtiketter[key]}
                      {key === "trapphus" && (
                        <span className="ml-1 text-xs text-muted">(alltid)</span>
                      )}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
