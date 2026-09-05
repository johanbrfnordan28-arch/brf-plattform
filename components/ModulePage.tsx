import { ForeningModulKontakt } from "@/components/forening/ForeningModulKontakt";
import { PlattformHjalpBanner } from "@/components/plattform/PlattformHjalpBanner";
import { ModuleBackLink } from "@/components/ModuleBackLink";

type ModulePageProps = {
  title: string;
  icon: string;
  intro: string;
  children: React.ReactNode;
};

export function ModulePage({ title, icon, intro, children }: ModulePageProps) {
  return (
    <main>
      <section className="border-b border-border bg-surface/60">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <ModuleBackLink />
          <div className="mt-6 flex items-start gap-4">
            <span
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#e8f3ec] text-2xl"
              aria-hidden
            >
              {icon}
            </span>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {title}
              </h1>
              <p className="mt-3 max-w-2xl text-lg leading-relaxed text-muted">
                {intro}
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <PlattformHjalpBanner kompakt className="mb-4" />
        <ForeningModulKontakt />
        <div className="space-y-8">{children}</div>
      </section>
    </main>
  );
}
