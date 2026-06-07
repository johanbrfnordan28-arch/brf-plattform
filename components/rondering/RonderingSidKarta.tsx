import Link from "next/link";

export function RonderingSidKarta() {
  return (
    <nav
      aria-label="Innehåll på ronderingssidan"
      className="rounded-2xl border-2 border-primary bg-[#eef6f0] p-5 sm:p-6"
    >
      <p className="text-sm font-semibold text-primary-dark">Var justerar jag schemat?</p>
      <p className="mt-2 text-sm leading-relaxed text-foreground">
        Gå till{" "}
        <strong>Grundmall föreningar → Rondering & avvikelser</strong> (adressen{" "}
        <code className="rounded bg-white/80 px-1.5 py-0.5 text-xs">/forening/rondering</code>
        ). Där finns månadsschemat <em>överst</em> på sidan — inte under den publika
        sidan &quot;Rondering&quot; utan inloggning.
      </p>
      <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-foreground">
        <li>
          <a
            href="#manadssignering-schema"
            className="font-medium text-primary-dark underline underline-offset-2 hover:text-primary"
          >
            Justera moment i månadsschema
          </a>
          {" "}
          — bocka i/ur som vid nyckelkvittering
        </li>
        <li>
          <a
            href="#manadssignering-lankar"
            className="font-medium text-primary-dark underline underline-offset-2 hover:text-primary"
          >
            Kopiera signeringslänk
          </a>
          {" "}
          till fastighetsskötare eller städ
        </li>
        <li>
          <a
            href="#upphandling-schema"
            className="font-medium text-primary-dark underline underline-offset-2 hover:text-primary"
          >
            Bifoga schema vid upphandling
          </a>
          {" "}
          — städ/rondering + vite, ID06, entreprenör
        </li>
        <li>
          <a
            href="#checklistor"
            className="font-medium text-primary-dark underline underline-offset-2 hover:text-primary"
          >
            Checklistor och avvikelser
          </a>
          {" "}
          — operativ rondering (annat än månadssignering)
        </li>
      </ol>
      <p className="mt-4 text-xs text-muted">
        I demo sparas schemat i webbläsaren. Använd{" "}
        <strong>Förhandsgranska</strong> i samma webbläsare efter att ni bockat i moment.
      </p>
      <Link
        href="#manadssignering-schema"
        className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
      >
        Hoppa till schema — justera moment
      </Link>
    </nav>
  );
}
