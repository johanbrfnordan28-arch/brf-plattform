import type { Metadata } from "next";
import { cookies } from "next/headers";
import { GRUNDMALL_FORENING_ID, GRUNDMALL_NAMN } from "@/lib/forening-registry";
import { hamtaHubbNamn } from "@/lib/hubb-namn";

const COOKIE_AKTIV_ID = "brf_aktiv_fid";
const COOKIE_PROFIL = "brf_senast_profil";

type ForeningProfilCookie = {
  id?: string;
  namn?: string;
};

function decodeCookieValue(varde: string): string {
  try {
    return decodeURIComponent(varde);
  } catch {
    return varde;
  }
}

export async function hamtaAktivForeningsNamnServer(): Promise<string> {
  const c = await cookies();
  const profilRaw = c.get(COOKIE_PROFIL)?.value;
  if (profilRaw) {
    try {
      const profil = JSON.parse(decodeCookieValue(profilRaw)) as ForeningProfilCookie;
      if (profil.namn?.trim()) return profil.namn.trim();
    } catch {
      /* ignore */
    }
  }

  const aktivId = decodeCookieValue(c.get(COOKIE_AKTIV_ID)?.value ?? "");
  if (aktivId && aktivId !== GRUNDMALL_FORENING_ID) {
    return aktivId;
  }

  return GRUNDMALL_NAMN;
}

export async function foreningForstasidaMetadata(): Promise<Metadata> {
  const c = await cookies();
  const aktivId = decodeCookieValue(c.get(COOKIE_AKTIV_ID)?.value ?? "");
  return {
    title: hamtaHubbNamn(aktivId || null),
    description: "Styrelseflöde för upphandling, underhållsplan och dokumentation.",
  };
}

export async function foreningModulMetadata(modul: string): Promise<Metadata> {
  const namn = await hamtaAktivForeningsNamnServer();
  return { title: `${namn} — ${modul}` };
}
