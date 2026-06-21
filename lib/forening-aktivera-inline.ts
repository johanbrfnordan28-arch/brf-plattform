import { GRUNDMALL_FORENING_ID } from "@/lib/forening-konstanter";
import {
  FORENING_AKTIV_ID_KEY,
  FORENING_PROFIL_BASE_KEY,
  FORENING_REGISTRY_KEY,
  NYSS_SKAPAD_FLAG_KEY,
  PENDING_AKTIV_FORENING_KEY,
  SENAST_SKAPAD_PROFIL_KEY,
} from "@/lib/forening-registry";

/**
 * Inline JS som speglar bootstrapForeningFranUrl — skriver inte över befintlig profil.
 * Körs före React på /forening/aktivera och /forening?ny=1.
 */
const INLINE_AKTIVERA_BODY = `
    var profilKey = "brf-f-" + id + "--${FORENING_PROFIL_BASE_KEY}";
    var befintlig = null;
    var harProfilKey = false;
    try {
      var rawProfil = localStorage.getItem(profilKey);
      if (rawProfil) {
        harProfilKey = true;
        befintlig = JSON.parse(rawProfil);
      }
    } catch (e0) {}
    if (!befintlig) {
      try {
        var regCheck = localStorage.getItem("${FORENING_REGISTRY_KEY}");
        var regParsed = regCheck ? JSON.parse(regCheck) : { version: 1, poster: [] };
        if (regParsed.poster) {
          for (var ri = 0; ri < regParsed.poster.length; ri++) {
            if (regParsed.poster[ri].id === id) {
              befintlig = regParsed.poster[ri];
              break;
            }
          }
        }
      } catch (e0b) {}
    }
    var skaSkrivaProfil =
      !befintlig ||
      befintlig.id === "${GRUNDMALL_FORENING_ID}" ||
      befintlig.namn !== namn;
    var profil = skaSkrivaProfil
      ? {
          id: id,
          namn: namn,
          skapadTidpunkt: new Date().toISOString(),
          organisationsnummer: befintlig && befintlig.organisationsnummer ? befintlig.organisationsnummer : "",
          epost: befintlig && befintlig.epost ? befintlig.epost : "",
          postadress: befintlig && befintlig.postadress ? befintlig.postadress : "",
          ort: befintlig && befintlig.ort ? befintlig.ort : "",
          kontaktperson: befintlig && befintlig.kontaktperson ? befintlig.kontaktperson : "",
          grundinfoPaborjad: befintlig && befintlig.grundinfoPaborjad ? befintlig.grundinfoPaborjad : false
        }
      : befintlig;
    var profilJson = JSON.stringify(profil);
    try {
      if (skaSkrivaProfil) {
        var regRaw = localStorage.getItem("${FORENING_REGISTRY_KEY}");
        var reg = regRaw ? JSON.parse(regRaw) : { version: 1, poster: [] };
        if (!reg.poster) reg.poster = [];
        var idx = -1;
        for (var i = 0; i < reg.poster.length; i++) {
          if (reg.poster[i].id === id) { idx = i; break; }
        }
        if (idx >= 0) reg.poster[idx] = profil;
        else reg.poster.push(profil);
        localStorage.setItem("${FORENING_REGISTRY_KEY}", JSON.stringify(reg));
      }
      if (skaSkrivaProfil || !harProfilKey) {
        localStorage.setItem(profilKey, profilJson);
      }
      localStorage.setItem("${FORENING_AKTIV_ID_KEY}", id);
    } catch (e) {}
    try {
      sessionStorage.setItem("brf-forening-aktiv-id-session", id);
      sessionStorage.setItem("${SENAST_SKAPAD_PROFIL_KEY}", profilJson);
      sessionStorage.setItem("${NYSS_SKAPAD_FLAG_KEY}", id);
      sessionStorage.removeItem("${PENDING_AKTIV_FORENING_KEY}");
    } catch (e2) {}
    try {
      document.cookie =
        "brf_aktiv_fid=" + encodeURIComponent(id) + ";path=/;max-age=2592000;SameSite=Lax";
      if (profilJson.length < 3500) {
        document.cookie =
          "brf_senast_profil=" + encodeURIComponent(profilJson) + ";path=/;max-age=7200;SameSite=Lax";
      }
    } catch (e3) {}
`;

/**
 * Inline-skript på /forening/aktivera — sparar och skickar vidare till föreningssidan.
 */
export function genereraForeningAktiveraInlineScript(): string {
  return `
(function () {
  try {
    var params = new URLSearchParams(window.location.search);
    var id = params.get("foreningId");
    var namn = (params.get("namn") || "").trim();
    if (!id || id === "${GRUNDMALL_FORENING_ID}" || !namn) {
      window.location.replace("/prova-gratis");
      return;
    }
${INLINE_AKTIVERA_BODY}
    var mal = new URLSearchParams({ ny: "1", foreningId: id, namn: namn });
    window.location.replace("/forening?" + mal.toString());
  } catch (err) {
    console.error("[brf aktivera]", err);
  }
})();
`.trim();
}

/** Inline-skript på /forening när ny=1 — sparar profil innan React hydrerar. */
export function genereraForeningBootstrapInlineScript(
  foreningId: string,
  namn: string,
): string {
  const id = JSON.stringify(foreningId);
  const namnJson = JSON.stringify(namn);
  return `
(function () {
  try {
    var id = ${id};
    var namn = ${namnJson};
    if (!id || id === "${GRUNDMALL_FORENING_ID}" || !namn) return;
${INLINE_AKTIVERA_BODY}
  } catch (err) {
    console.error("[brf bootstrap]", err);
  }
})();
`.trim();
}
