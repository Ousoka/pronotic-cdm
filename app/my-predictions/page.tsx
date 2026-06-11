import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/security";

export default async function MyPredictionsPage() {
  const user = await requireUser();
  const predictions = await prisma.prediction.findMany({
    where: { userId: user.id },
    orderBy: { match: { kickoffAt: "asc" } },
    include: { match: true }
  });

  return (
    <div>
      <div className="mb-8"><p className="font-bold uppercase tracking-wider text-yas-blue">My account</p><h1 className="text-4xl font-black">My predictions</h1></div>
      <div className="grid gap-4">
        {predictions.map((p) => (
          <div className="card flex flex-col justify-between gap-4 md:flex-row md:items-center" key={p.id}>
            <div>
              <p className="badge inline-flex">{p.match.status}</p>
              <h2 className="mt-3 text-2xl font-black">{p.match.homeTeam} {p.predictedHome} - {p.predictedAway} {p.match.awayTeam}</h2>
              {p.match.status === "FINISHED" && <p className="mt-1 text-sm text-slate-500">Final result: {p.match.homeScore} - {p.match.awayScore}</p>}
            </div>
            <div className="text-right">
              <p className="text-4xl font-black text-yas-blue">{p.totalPoints}</p>
              <p className="text-xs font-bold uppercase text-slate-400">points</p>
              {p.match.status === "SCHEDULED" && <Link className="mt-3 inline-flex text-sm font-bold text-yas-blue" href={`/pronostic/${p.matchId}`}>Edit</Link>}
            </div>
          </div>
        ))}
        {predictions.length === 0 && <div className="card text-center"><p className="text-slate-500">No predictions yet.</p><Link className="btn-primary mt-4" href="/matches">Start now</Link></div>}
      </div>
    </div>
  );
}
