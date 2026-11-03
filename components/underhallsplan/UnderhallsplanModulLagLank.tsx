import {
  PLAN_LAGKRAV_KNAPP_OPPNA,
  PLAN_LAGKRAV_MODUL_ANKAR_ID,
} from "@/components/underhallsplan/plan-lagkrav";

/** Kort länk från wizard till modulens informationsruta (samma sida). */
export function UnderhallsplanModulLagLank() {
  return (
    <p className="mt-3 text-sm text-muted">
      <a
        href={`#${PLAN_LAGKRAV_MODUL_ANKAR_ID}`}
        className="font-medium text-primary-dark underline-offset-2 hover:underline"
      >
        {PLAN_LAGKRAV_KNAPP_OPPNA}
      </a>
      <span className="text-muted"> — informationsrutan högst upp i modulen.</span>
    </p>
  );
}
