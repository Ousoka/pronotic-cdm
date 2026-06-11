import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scoreMatch } from "@/lib/scoring";
import { env } from "@/lib/env";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!env.cronSecret || authHeader !== `Bearer ${env.cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const finishedMatches = await prisma.worldCupMatch.findMany({
    where: { status: "FINISHED", homeScore: { not: null }, awayScore: { not: null } },
    select: { id: true }
  });

  for (const match of finishedMatches) await scoreMatch(match.id);
  return NextResponse.json({ ok: true, scored: finishedMatches.length });
}
