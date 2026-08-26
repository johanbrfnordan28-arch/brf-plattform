import { execSync } from "child_process";

function git(cmd: string): string {
  return execSync(cmd, { encoding: "utf8", cwd: process.cwd() }).trim();
}

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return Response.json({ error: "Ej tillgänglig i produktion" }, { status: 404 });
  }

  try {
    const branch = git("git branch --show-current");
    const remote = git("git remote get-url origin");
    const porcelain = git("git status --porcelain");
    const lines = porcelain ? porcelain.split("\n").filter(Boolean) : [];

    let ahead = 0;
    let behind = 0;
    try {
      const counts = git(`git rev-list --left-right --count origin/${branch}...HEAD`);
      const [behindStr, aheadStr] = counts.split(/\s+/);
      behind = Number(behindStr) || 0;
      ahead = Number(aheadStr) || 0;
    } catch {
      // Origin-branch saknas ännu — ok vid första push.
    }

    return Response.json({
      branch,
      remote,
      hasChanges: lines.length > 0,
      changedCount: lines.length,
      changedFiles: lines.slice(0, 12),
      ahead,
      behind,
    });
  } catch {
    return Response.json({ error: "Kunde inte läsa git-status" }, { status: 500 });
  }
}
