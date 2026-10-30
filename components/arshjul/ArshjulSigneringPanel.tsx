"use client";

import { useMemo, useState } from "react";
import type { ArshjulBilaga, ArshjulHandelse } from "@/components/arshjul/arshjul";
import {
  skapaSigneradBilaga,
  sparaSigneratArshjulDokument,
  tomArshjulSignering,
  type ArshjulDokumentSignering,
} from "@/components/arshjul/arshjul-dokument-signering";
import { BankIdAvtalSignering } from "@/components/bankid/BankIdAvtalSignering";
import { BankIdEnkelSignering } from "@/components/bankid/BankIdEnkelSignering";
import {
  harTillrackligaBankIdSignaturer,
  laggTillBankIdSignatur,
  type BankIdSignatur,
} from "@/lib/bankid-signering";
import { lasAktivForeningId, lasForeningProfil } from "@/lib/forening-registry";

type Props = {
  handelse: ArshjulHandelse;
  onSpara: (patch: Partial<ArshjulHandelse>) => void;
};

export function ArshjulSigneringPanel({ handelse, onSpara }: Props) {
  const bilagor = handelse.bilagor ?? [];
  const signering = useMemo((): ArshjulDokumentSignering | null => {
    if (handelse.signering) return handelse.signering;
    if (!bilagor[0]) return null;
    const bas = tomArshjulSignering(bilagor[0].id);
    if (handelse.bankid?.namn || handelse.bankid?.epost) {
      bas.undertecknare[0] = {
        namn: handelse.bankid.namn ?? "",
        epost: handelse.bankid.epost ?? "",
      };
    }
    return bas;
  }, [handelse.signering, handelse.bankid, bilagor]);

  const [fel, setFel] = useState<string | null>(null);

  const valtBilaga = bilagor.find((b) => b.id === signering?.bilagaId);
  const profil = lasForeningProfil(lasAktivForeningId());
  const ledamoter = profil?.styrelseledamoter ?? [];

  function uppdateraSignering(patch: Partial<ArshjulDokumentSignering>) {
    if (!signering) return;
    onSpara({ signering: { ...signering, ...patch } });
  }

  function signera(signatur: BankIdSignatur) {
    if (!signering) return;
    const result = laggTillBankIdSignatur(
      signering.signaturer,
      { ...signatur, part: "forening" },
      signering.kravSignaturer,
    );
    if (!result.ok) {
      setFel(result.fel);
      return;
    }
    setFel(null);
    const nasta = { ...signering, signaturer: result.signaturer };
    if (
      harTillrackligaBankIdSignaturer(
        result.signaturer,
        signering.kravSignaturer,
      )
    ) {
      fardigstallSignering(nasta, result.signaturer);
      return;
    }
    uppdateraSignering({ signaturer: result.signaturer });
  }

  function fardigstallSignering(
    aktuell: ArshjulDokumentSignering,
    signaturer: BankIdSignatur[],
  ) {
    const bilaga = bilagor.find((b) => b.id === aktuell.bilagaId);
    if (!bilaga) {
      setFel("Dokumentet hittades inte.");
      return;
    }
    const signerad = skapaSigneradBilaga(bilaga, handelse.titel, signaturer);
    const tid = new Date().toISOString();
    const ar = new Date().getFullYear();
    sparaSigneratArshjulDokument({
      id: `ark-${Date.now().toString(36)}`,
      ar,
      handelseId: handelse.id,
      handelseTitel: handelse.titel,
      originalFilnamn: bilaga.filnamn,
      filnamn: signerad.filnamn,
      dataUrl: signerad.dataUrl,
      signaturer,
      signeradTid: tid,
    });
    const nyaBilagor = [...bilagor, signerad];
    onSpara({
      bilagor: nyaBilagor,
      signering: {
        ...aktuell,
        signaturer,
        klar: true,
        signeradTid: tid,
        signeradBilagaId: signerad.id,
      },
    });
  }

  if (bilagor.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-[#f7f9f8] p-3 text-sm text-muted">
        Ladda upp dagordning eller protokoll ovan innan ni kan begära BankID-godkännande.
      </div>
    );
  }

  const lasningOk = Boolean(signering?.lasningBekraftad);
  const signeringOppen =
    lasningOk && !signering?.klar && valtBilaga;

  return (
    <div className="rounded-xl border border-primary/25 bg-[#f7fbf8] p-3 space-y-4">
      <div>
        <p className="text-sm font-medium text-foreground">
          BankID-godkännande kopplat till dokument
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          1) Välj dokument och läs igenom · 2) Ange vem som ska signera (en eller
          två personer) · 3) Signera — signaturerna sparas på dokumentet och i
          mappen Signerade dokument för året.
        </p>
      </div>

      <label className="block text-sm">
        <span className="font-medium text-foreground">Dokument att godkänna</span>
        <select
          value={handelse.signering?.bilagaId ?? bilagor[0]?.id ?? ""}
          onChange={(e) => {
            const bilagaId = e.target.value;
            if (!bilagaId) return;
            onSpara({
              signering: tomArshjulSignering(bilagaId),
            });
          }}
          disabled={Boolean(signering?.klar)}
          className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
        >
          {bilagor.map((b) => (
            <option key={b.id} value={b.id}>
              {b.filnamn}
            </option>
          ))}
        </select>
      </label>

      {valtBilaga && (
        <div className="flex flex-wrap gap-2">
          <a
            href={valtBilaga.dataUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-primary/50 bg-white px-3 py-1.5 text-xs font-medium text-primary-dark hover:bg-[#eef6f0]"
          >
            Öppna och läs dokument
          </a>
          <a
            href={valtBilaga.dataUrl}
            download={valtBilaga.filnamn}
            className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted hover:text-foreground"
          >
            Ladda ned
          </a>
        </div>
      )}

      {signering && !signering.klar && (
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={signering.lasningBekraftad}
            onChange={(e) =>
              uppdateraSignering({
                lasningBekraftad: e.target.checked,
                lasningBekraftadTid: e.target.checked
                  ? new Date().toISOString()
                  : undefined,
              })
            }
            className="mt-1"
          />
          <span>
            Styrelsen har tagit del av dokumentet och kan begära signering
          </span>
        </label>
      )}

      {signering && lasningOk && !signering.klar && (
        <>
          <fieldset className="space-y-2">
            <legend className="text-xs font-semibold text-foreground">
              Antal undertecknare
            </legend>
            <label className="mr-4 inline-flex items-center gap-2 text-sm">
              <input
                type="radio"
                checked={signering.kravSignaturer === 1}
                onChange={() =>
                  uppdateraSignering({ kravSignaturer: 1, signaturer: [] })
                }
              />
              En person
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="radio"
                checked={signering.kravSignaturer === 2}
                onChange={() =>
                  uppdateraSignering({ kravSignaturer: 2, signaturer: [] })
                }
              />
              Två personer
            </label>
          </fieldset>

          <div className="grid gap-3 sm:grid-cols-2">
            {[0, 1].map((i) => {
              if (i === 1 && signering.kravSignaturer === 1) return null;
              return (
                <label key={i} className="block text-xs text-muted">
                  Undertecknare {i + 1} — namn
                  <input
                    value={signering.undertecknare[i]?.namn ?? ""}
                    onChange={(e) => {
                      const undertecknare = [...signering.undertecknare];
                      undertecknare[i] = {
                        ...undertecknare[i],
                        namn: e.target.value,
                      };
                      uppdateraSignering({ undertecknare });
                    }}
                    className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-1.5 text-sm text-foreground"
                  />
                </label>
              );
            })}
          </div>

          {signeringOppen &&
            (signering.kravSignaturer === 2 ? (
              <BankIdAvtalSignering
                part="forening"
                partEtikett="Styrelsen"
                signaturer={signering.signaturer}
                ledamoter={ledamoter}
                disabled={!signering.undertecknare[0]?.namn?.trim()}
                disabledOrsak="Ange minst undertecknare 1 innan signering."
                onSignera={(sig) => signera(sig)}
              />
            ) : (
              <BankIdEnkelSignering
                part="forening"
                partEtikett="Styrelsen"
                signaturer={signering.signaturer}
                forvaltNamn={signering.undertecknare[0]?.namn}
                disabled={!signering.undertecknare[0]?.namn?.trim()}
                disabledOrsak="Ange namn på undertecknare innan signering."
                onSignera={(sig) => signera(sig)}
              />
            ))}
        </>
      )}

      {signering?.klar && signering.signeradBilagaId && (
        <div className="rounded-lg border border-primary/30 bg-[#eef6f0] px-3 py-2 text-sm text-primary-dark">
          <p className="font-medium">Signering klar och dokument sparat.</p>
          {bilagor.find((b) => b.id === signering.signeradBilagaId) && (
            <a
              href={
                bilagor.find((b) => b.id === signering.signeradBilagaId)!.dataUrl
              }
              download={
                bilagor.find((b) => b.id === signering.signeradBilagaId)!.filnamn
              }
              className="mt-1 inline-block text-xs font-medium underline"
            >
              Ladda ned signerat dokument
            </a>
          )}
        </div>
      )}

      {fel && (
        <p className="text-xs text-red-800" role="alert">
          {fel}
        </p>
      )}
    </div>
  );
}
