import { prisma } from "@/lib/prisma";
import { MatchCard } from "@/components/match-card";

export default async function MatchesPage() {
  const matches = await prisma.worldCupMatch.findMany({
    orderBy: [{ kickoffAt: "asc" }],
    include: { predictions: { select: { id: true } } }
  });

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <p className="font-bold uppercase tracking-wider text-yas-blue">Pronostics</p>
          <h1 className="text-4xl font-black">Matchs disponibles</h1>
        </div>
        <p className="max-w-xl text-sm text-slate-500">Choisis un match avant le coup d’envoi et indique uniquement ton score. Aucun compte à créer.</p>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {matches.map((match) => <MatchCard key={match.id} match={match} predictionCount={match.predictions.length} />)}
      </div>
      {matches.length === 0 && <div className="card text-center text-slate-500">Aucun match n’a encore été créé.</div>}
    </div>
  );
}
