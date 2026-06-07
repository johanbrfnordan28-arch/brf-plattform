type ContentSectionProps = {
  title: string;
  children: React.ReactNode;
  /** plain = inget text-muted runt barn (t.ex. formulär och register) */
  plain?: boolean;
  id?: string;
};

export function ContentSection({ title, children, plain, id }: ContentSectionProps) {
  return (
    <article
      id={id}
      className="rounded-2xl border border-border bg-surface p-6 sm:p-8"
    >
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      {plain ? (
        <div className="mt-6">{children}</div>
      ) : (
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted">{children}</div>
      )}
    </article>
  );
}
