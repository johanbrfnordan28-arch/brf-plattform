import { execSync } from "child_process";
import path from "path";

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return Response.json({ error: "Ej tillgänglig i produktion" }, { status: 404 });
  }

  if (process.platform !== "darwin") {
    return Response.json(
      { error: "Knappen fungerar bara på macOS. Kör npm run publicera i terminalen." },
      { status: 400 },
    );
  }

  const commandPath = path.join(process.cwd(), "PUBLICERA-GITHUB.command");

  try {
    execSync(`open "${commandPath}"`);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Kunde inte öppna PUBLICERA-GITHUB.command" }, { status: 500 });
  }
}
