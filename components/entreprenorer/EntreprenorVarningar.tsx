/** Gemensamma råd vid val av entreprenör — visas på förenings- och publiksida. */
export function EntreprenorVarningar() {
  return (
    <section className="rounded-xl border border-primary/25 bg-[#eef6f0]/50 p-4 sm:p-5">
      <p className="text-sm font-semibold text-foreground">
        Referenser, beställning och uppföljning
      </p>
      <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-muted">
        <li>
          <span className="font-medium text-foreground">Kontrollera referenser.</span>{" "}
          Ta egna referenser från andra föreningar eller beställare innan ni
          tecknar avtal — även om företaget finns i vårt rekommenderade register.
        </li>
        <li>
          <span className="font-medium text-foreground">Beställ korrekt.</span>{" "}
          Upprätta skriftlig beställning eller avtal med tydlig omfattning, tidplan
          och pris. Otydliga muntliga överenskommelser ger onödiga tvister.
        </li>
        <li>
          <span className="font-medium text-foreground">Ägare och personal kan bytas.</span>{" "}
          Företag kan byta ägare, ledning och hantverkare. Det som fungerade förra
          året behöver inte vara samma kvalitet idag — följ upp löpande och
          uppdatera er lista när erfarenheten förändras.
        </li>
      </ul>
    </section>
  );
}
