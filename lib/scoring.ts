import "server-only";
import { prisma } from "@/lib/prisma";

function outcome(home: number, away: number) {
  if (home > away) return "HOME";
  if (home < away) return "AWAY";
  return "DRAW";
}

export async function scoreMatch(matchId: string) {
  const match = await prisma.worldCupMatch.findUnique({
    where: { id: matchId },
    include: { predictions: true }
  });

  if (!match || match.status !== "FINISHED" || match.homeScore === null || match.awayScore === null) return;

  const actualOutcome = outcome(match.homeScore, match.awayScore);

  await prisma.$transaction(
    match.predictions.map((prediction) => {
      const exactScore = prediction.predictedHome === match.homeScore && prediction.predictedAway === match.awayScore;
      const predictedOutcome = outcome(prediction.predictedHome, prediction.predictedAway);
      const scorePoints = exactScore ? 3 : 0;
      const outcomePoints = !exactScore && predictedOutcome === actualOutcome ? 1 : 0;
      const totalPoints = scorePoints + outcomePoints;

      return prisma.prediction.update({
        where: { id: prediction.id },
        data: { scorePoints, outcomePoints, totalPoints, isCorrected: true, correctedAt: new Date() }
      });
    })
  );
}
