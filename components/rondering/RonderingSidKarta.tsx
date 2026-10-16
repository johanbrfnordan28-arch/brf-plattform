import Link from "next/link";

export function RonderingSidKarta() {
  return (
    <nav
      aria-label="Innehåll på ronderingssidan"
      className="rounded-2xl border-2 border-primary bg-[#eef6f0] p-5 sm:p-6"
    >
      <p className="text-sm font-semibold text-primary-dark">Så här gör ni</p>
      <p className="mt-2 text-sm leading-relaxed text-foreground">
        Börja med föreningens eget schema. Det blir underlag för offert och avtal.
        När entreprenören godkänt avtalet kvitteras varje utfört uppdrag.
      </p>
      <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-foreground">
        <li>
          <a
            href="#manadssignering-schema"
            className="font-medium text-primary-dark underline underline-offset-2 hover:text-primary"
          >
            Justera schema
          </a>
          {" "}
          — lägg till och ta bort moment för städ och rondering
        </li>
        <li>
          <a
            href="#drift-offert-avtal"
            className="font-medium text-primary-dark underline underline-offset-2 hover:text-primary"
          >
            Offert och avtal
          </a>
          {" "}
          — skicka underlag och låt vald part godkänna med BankID
        </li>
        <li>
          <a
            href="#drift-uppdrag"
            className="font-medium text-primary-dark underline underline-offset-2 hover:text-primary"
          >
            Skapa uppdrag
          </a>
          {" "}
          — kvittens per städning eller rondering
        </li>
        <li>
          <a
            href="#upphandling-schema"
            className="font-medium text-primary-dark underline underline-offset-2 hover:text-primary"
          >
            Bifoga schema vid upphandling
          </a>
        </li>
        <li>
          <a
            href="#checklistor"
            className="font-medium text-primary-dark underline underline-offset-2 hover:text-primary"
          >
            Checklistor och avvikelser
          </a>
        </li>
      </ol>
      <Link
        href="#manadssignering-schema"
        className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
      >
        Hoppa till schema
      </Link>
    </nav>
  );
}
