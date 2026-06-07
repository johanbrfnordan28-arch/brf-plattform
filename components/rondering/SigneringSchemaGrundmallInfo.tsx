import {
  grupperaSchemaPunkter,
  signeringGrundmall,
} from "@/components/rondering/signering-schema";
import { signeringRollInfo } from "@/components/rondering/signering";

/** Server-renderad översikt — syns även om JavaScript strular i webbläsaren. */
export function SigneringSchemaGrundmallInfo() {
  return (
    <div className="rounded-xl border border-primary/30 bg-[#eef6f0] p-4 text-sm">
      <p className="font-semibold text-primary-dark">
        Grundmall med utvändiga och invändiga detaljer (öppnas i listan nedan)
      </p>
      <div className="mt-3 grid gap-6 lg:grid-cols-2">
        {(["fastighetsskotare", "stadning"] as const).map((roll) => (
          <div key={roll}>
            <p className="font-medium text-foreground">
              {signeringRollInfo[roll].dokument}
            </p>
            <ul className="mt-2 space-y-3">
              {grupperaSchemaPunkter(signeringGrundmall[roll], roll).map((grupp) => (
                <li key={grupp.namn}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">
                    {grupp.namn}
                  </p>
                  <ul className="mt-1 list-disc space-y-0.5 pl-4 text-muted">
                    {grupp.punkter.map((p) => (
                      <li key={p.id}>{p.etikett}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted">
        Kryssrutor och hopfällbara sektioner laddas i fältet under. Ladda om sidan
        om listan inte uppdateras (t.ex. port 3010 i utvecklingsläge).
      </p>
    </div>
  );
}
