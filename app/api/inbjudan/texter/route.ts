import { NextResponse } from "next/server";
import { databasArKonfigurerad } from "@/lib/db";
import {
  hamtaInbjudanTexter,
  hamtaInbjudanTexterStandard,
  publikaInbjudanTexter,
} from "@/lib/inbjudan-texter";

/** Publika texter för huvudsida och «mejla länk»-formulär. */
export async function GET() {
  try {
    const texter = databasArKonfigurerad()
      ? await hamtaInbjudanTexter()
      : hamtaInbjudanTexterStandard();
    return NextResponse.json(publikaInbjudanTexter(texter));
  } catch {
    return NextResponse.json(publikaInbjudanTexter(hamtaInbjudanTexterStandard()));
  }
}
