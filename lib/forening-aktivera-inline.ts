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
    function lasProfilJson(raw) {
      if (!raw) return null;
      try {
        var p = JSON.parse(raw);
        if (p && p.id === id) return p;
      } catch (eParse) {}
      return null;
    }
    var befintlig = null;
    try {
      befintlig = lasProfilJson(localStorage.getItem(profilKey));
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
    if (!befintlig) {
      try {
        befintlig = lasProfilJson(sessionStorage.getItem("${SENAST_SKAPAD_PROFIL_KEY}"));
      } catch (e0c) {}
    }
    if (!befintlig) {
      try {
        var ck = document.cookie.match(/(?:^|; )brf_senast_profil=([^;]*)/);
        if (ck) befintlig = lasProfilJson(decodeURIComponent(ck[1]));
      } catch (e0d) {}
    }
    var profil = (befintlig && befintlig.id !== "${GRUNDMALL_FORENING_ID}")
      ? befintlig
      : {
          id: id,
          namn: namn,
          skapadTidpunkt: new Date().toISOString(),
          organisationsnummer: "",
          epost: "",
          postadress: "",
          postnummer: "",
          ort: "",
          kontaktperson: "",
          grundinfoPaborjad: false
        };
    if (namn && !(profil.namn && String(profil.namn).trim())) profil.namn = namn;
    var profilJson = JSON.stringify(profil);
    var skaSkrivaProfil = true;
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

/**
 * JSON som ska ligga i en script-tagg. `<` måste bli \\u003c, annars kan
 * ett namn som innehåller `</script>` avsluta taggen och köra egen kod.
 */
function inbaddadJsStrang(value: string): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

/** Inline-skript på /forening när ny=1 — sparar profil innan React hydrerar. */
export function genereraForeningBootstrapInlineScript(
  foreningId: string,
  namn: string,
): string {
  const id = inbaddadJsStrang(foreningId);
  const namnJson = inbaddadJsStrang(namn);
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
