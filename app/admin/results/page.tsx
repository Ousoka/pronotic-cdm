import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/security";
import { saveResultAction } from "@/lib/actions";
import { TeamName } from "@/components/team-name";

export default async function AdminResultsPage() {
  await requireAdmin();
  const matches = await prisma.worldCupMatch.findMany({ orderBy: [{ kickoffAt: "asc" }] });

  return (
    <div>
      <div className="mb-8">
        <p className="font-bold uppercase tracking-wider text-yas-blue">Admin</p>
        <h1 className="text-4xl font-black">Résultats & correction</h1>
        <p className="mt-2 text-slate-500">Enregistrer un résultat marque le match comme terminé et recalcule les points : score exact 3 pts, bon résultat 1 pt.</p>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {matches.map((m) => (
          <form action={saveResultAction} className="card grid gap-4" key={m.id}>
            <input type="hidden" name="matchId" value={m.id} />
            <div>
              <p className="badge inline-flex">{m.status}</p>
              <div className="mt-3 grid gap-2 rounded-3xl bg-slate-50 p-4">
                <TeamName team={m.homeTeam} size="sm" />
                <p className="text-xs font-black uppercase tracking-[.25em] text-slate-300">vs</p>
                <TeamName team={m.awayTeam} size="sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Score {m.homeTeam}</label><input className="input mt-2" name="homeScore" type="number" min="0" max="30" required defaultValue={m.homeScore ?? 0} /></div>
              <div><label className="label">Score {m.awayTeam}</label><input className="input mt-2" name="awayScore" type="number" min="0" max="30" required defaultValue={m.awayScore ?? 0} /></div>
            </div>
            <button className="btn-primary" type="submit">Enregistrer le résultat & calculer les points</button>
          </form>
        ))}
      </div>
    </div>
  );
}
