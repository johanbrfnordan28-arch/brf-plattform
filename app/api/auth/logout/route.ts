import { NextResponse } from "next/server";
import { rensaSessionCookie } from "@/lib/auth/session";

export async function POST() {
  await rensaSessionCookie();
  return NextResponse.json({ ok: true });
}
