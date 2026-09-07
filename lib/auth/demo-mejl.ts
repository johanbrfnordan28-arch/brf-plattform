import { arGiltigEpost, normaliseraEpost } from "@/lib/auth/epost";
import {
  byggAterstallningsMejl,
  byggLosenordMejl,
  skickaMejlDirekt,
} from "@/lib/auth/mejl";
import { genereraTillfalligtLosenord } from "@/lib/auth/losenord";

/** Mejla lösenord utan databas — demoläge/mässa (kräver RESEND_API_KEY). */
export async function skickaLosenordDemoMejl(opts: {
  epost: string;
  losenord?: string;
  foreningsNamn: string;
  mottagarNamn?: string;
  basUrl: string;
  arSkickaIgen?: boolean;
  genereraNytt?: boolean;
}): Promise<{
  mejlVia: "resend" | "ingen";
  tillfalligtLosenord: string;
}> {
  const epost = normaliseraEpost(opts.epost);
  if (!arGiltigEpost(epost)) {
    throw new Error("Ange en giltig e-postadress.");
  }

  const foreningsNamn = opts.foreningsNamn.trim();
  if (!foreningsNamn) {
    throw new Error("Ange föreningens namn.");
  }

  const tillfalligtLosenord =
    opts.genereraNytt || !opts.losenord?.trim()
      ? genereraTillfalligtLosenord(12)
      : opts.losenord.trim();

  const loginUrl = `${opts.basUrl.replace(/\/$/, "")}/styrelse-login`;
  const mejl = await skickaMejlDirekt(
    byggLosenordMejl({
      foreningsNamn,
      mottagarNamn: opts.mottagarNamn?.trim() || "",
      epost,
      losenord: tillfalligtLosenord,
      loginUrl,
      arSkickaIgen: opts.arSkickaIgen,
    }),
  );

  return { mejlVia: mejl.via, tillfalligtLosenord };
}

/** Mejla lokal återställningslänk utan databas. */
export async function skickaAterstallningDemoMejl(opts: {
  epost: string;
  aterstallningsLank: string;
  namn?: string;
}): Promise<{ mejlVia: "resend" | "ingen" }> {
  const epost = normaliseraEpost(opts.epost);
  if (!arGiltigEpost(epost)) {
    throw new Error("Ange en giltig e-postadress.");
  }

  const lank = opts.aterstallningsLank.trim();
  if (!lank.startsWith("http")) {
    throw new Error("Ogiltig återställningslänk.");
  }

  const mejl = await skickaMejlDirekt(
    byggAterstallningsMejl({
      epost,
      namn: opts.namn?.trim() || "",
      länk: lank,
    }),
  );

  return { mejlVia: mejl.via };
}
