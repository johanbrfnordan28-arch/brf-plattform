"use client";

import { useEffect, useState } from "react";
import { MessanSkickaLankForm } from "@/components/styrelsemassa/MessanSkickaLankForm";

/** Startsida — egen ruta bredvid inloggning. */
export function MejlaLankStartRuta() {
  const [rubrik, setRubrik] = useState("Mejla mig en länk");
  const [intro, setIntro] = useState(
    "Inte redo att skapa föreningen nu? Lämna namn och e-post — vi mejlar en länk till huvudsidan så ni kan börja när det passar.",
  );

  useEffect(() => {
    void fetch("/api/inbjudan/texter")
      .then((r) => r.json())
      .then(
        (data: { mejlaLankRubrik?: string; mejlaLankIntro?: string }) => {
          if (data.mejlaLankRubrik) setRubrik(data.mejlaLankRubrik);
          if (data.mejlaLankIntro) setIntro(data.mejlaLankIntro);
        },
      )
      .catch(() => null);
  }, []);

  return (
    <div className="flex h-full min-h-[18rem] flex-col rounded-2xl border border-border bg-[#f7f9f8] p-6 shadow-sm sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7f74]">
        Fundera i lugn och ro
      </p>
      <h3 className="mt-2 text-xl font-bold text-foreground">{rubrik}</h3>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{intro}</p>
      <MessanSkickaLankForm inlagd kompakt />
    </div>
  );
}
