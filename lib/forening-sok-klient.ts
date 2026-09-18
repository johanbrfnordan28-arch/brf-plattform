import type { ForeningServerDto } from "@/lib/forening-server";
import {
  hamtaSokSuffix,
  MIN_SOK_BOKSTAVER_EFTER_BRF,
} from "@/lib/forening-inloggning";
import {
  normaliseraForeningProfil,
  sparaForeningProfil,
  type ForeningProfil,
} from "@/lib/forening-registry";

export function profilFranSokTraff(
  dto: Pick<ForeningServerDto, "id" | "namn" | "avtalGodkant">,
): ForeningProfil {
  return normaliseraForeningProfil({
    id: dto.id,
    namn: dto.namn,
    avtalGodkant: dto.avtalGodkant,
  });
}

/** Sparar träff i registret så namn-inloggning fungerar i webbläsaren. */
export function registreraSokTraff(
  dto: Pick<ForeningServerDto, "id" | "namn" | "avtalGodkant">,
): ForeningProfil {
  const profil = profilFranSokTraff(dto);
  sparaForeningProfil(profil, { tyst: true, synkaServer: false });
  return profil;
}

/**
 * Söker skapade föreningar på servern (minst 3 bokstäver efter Brf).
 * Används när föreningen saknas lokalt — t.ex. ny webbläsare eller rensad cache.
 */
export async function sokForeningarPaServerKlient(opts: {
  soktext: string;
  lage: "test" | "kund";
}): Promise<ForeningProfil[]> {
  if (hamtaSokSuffix(opts.soktext).length < MIN_SOK_BOKSTAVER_EFTER_BRF) {
    return [];
  }

  try {
    const res = await fetch(
      `/api/foreningar/sok?q=${encodeURIComponent(opts.soktext.trim())}`,
    );
    if (!res.ok) return [];
    const data = (await res.json()) as {
      foreningar?: Array<
        Pick<ForeningServerDto, "id" | "namn" | "avtalGodkant">
      >;
    };
    const lista = data.foreningar ?? [];
    const filtrerade =
      opts.lage === "kund"
        ? lista.filter((f) => f.avtalGodkant)
        : lista.filter((f) => !f.avtalGodkant);

    return filtrerade.map((dto) => registreraSokTraff(dto));
  } catch {
    return [];
  }
}
