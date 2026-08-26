export const DEV_GITHUB_REPO = "johanbrfnordan28-arch/brf-plattform";
export const DEV_GITHUB_URL = `https://github.com/${DEV_GITHUB_REPO}`;
export const DEV_VERCEL_URL = "https://vercel.com/new";

export const DEV_PUBLICERA_COMMAND = "PUBLICERA-GITHUB.command";
export const DEV_PUBLICERA_SCRIPT = "scripts/publicera.sh";
export const DEV_NPM_COMMAND = "npm run publicera";

export const DEV_PUBLICERA_STEG = [
  "Lägger till alla ändringar (git add)",
  "Committar med kort beskrivning (git commit)",
  "Pushar till GitHub (git push)",
] as const;
