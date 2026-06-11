import type { MatchStatus, RoundType } from "@prisma/client";

type MatchLike = {
  round: RoundType | string;
  status: MatchStatus | string;
  homeTeam: string;
  awayTeam: string;
  kickoffAt: Date;
  lockedAt?: Date | null;
};

const PLACEHOLDER_PATTERNS = [
  /\bgroup\s+[a-l]\b/i,
  /\bmatch\s+\d+\b/i,
  /\bwinners?\b/i,
  /\blosers?\b/i,
  /\brunners?-up\b/i,
  /\bthird\s+place\b/i,
  /\bthird-place\b/i,
  /\btbd\b/i,
  /à\s+déterminer/i
];

export function hasPlaceholderTeam(match: Pick<MatchLike, "homeTeam" | "awayTeam">) {
  const text = `${match.homeTeam} ${match.awayTeam}`;
  return PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(text));
}

export function isPredictionClosed(match: MatchLike, now = new Date()) {
  const lockDate = match.lockedAt ?? match.kickoffAt;
  return now >= lockDate || match.status !== "SCHEDULED" || hasPlaceholderTeam(match);
}
