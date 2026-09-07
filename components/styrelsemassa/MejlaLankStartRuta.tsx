import { MessanSkickaLankForm } from "@/components/styrelsemassa/MessanSkickaLankForm";

/** Startsida — egen ruta bredvid inloggning. */
export function MejlaLankStartRuta() {
  return (
    <div className="flex h-full min-h-[18rem] flex-col rounded-2xl border border-border bg-[#f7f9f8] p-6 shadow-sm sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7f74]">
        Fundera i lugn och ro
      </p>
      <h3 className="mt-2 text-xl font-bold text-foreground">
        Mejla mig en länk
      </h3>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
        Inte redo att skapa föreningen nu? Lämna namn och e-post — vi mejlar en
        länk så ni kan börja provperioden när det passar.
      </p>
      <MessanSkickaLankForm inlagd kompakt />
    </div>
  );
}
