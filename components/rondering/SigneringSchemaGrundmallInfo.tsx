/** Kort vägledning — själva schemat ligger i hopfällbara sektioner under. */
export function SigneringSchemaGrundmallInfo() {
  return (
    <div className="rounded-xl border border-primary/30 bg-[#eef6f0] p-4 text-sm">
      <p className="font-semibold text-primary-dark">Schemat är uppdelat i delar</p>
      <p className="mt-2 leading-relaxed text-foreground">
        Öppna en sektion i taget (till exempel Utvändigt, Invändigt eller
        Trapphus). Delarna hör till samma schema — det som är ibockat följer med
        till offert, avtal och kvittens.
      </p>
      <p className="mt-2 text-xs text-muted">
        Använd + / − på varje del. «Öppna alla sektioner» visar hela schemat om ni
        behöver överblick.
      </p>
    </div>
  );
}
