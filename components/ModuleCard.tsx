import Link from "next/link";

type ModuleCardProps = {
  title: string;
  description: string;
  href?: string;
  icon: string;
};

const cardClassName =
  "group flex flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all";

export function ModuleCard({ title, description, href, icon }: ModuleCardProps) {
  const body = (
    <>
      <span
        className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f3ec] text-xl"
        aria-hidden
      >
        {icon}
      </span>
      <h3
        className={`text-lg font-semibold text-foreground ${
          href ? "group-hover:text-primary-dark" : ""
        }`}
      >
        {title}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{description}</p>
      {href ? (
        <span className="mt-4 text-sm font-medium text-primary group-hover:text-primary-dark">
          Öppna modul →
        </span>
      ) : null}
    </>
  );

  if (!href) {
    return <div className={cardClassName}>{body}</div>;
  }

  return (
    <Link
      href={href}
      className={`${cardClassName} hover:border-primary/40 hover:shadow-md`}
    >
      {body}
    </Link>
  );
}
