import { prisma } from "@/lib/prisma";
import { Trophy, Medal } from "lucide-react";

export default async function LeaderboardPage() {
  const rows = await prisma.user.findMany({
    where: { predictions: { some: {} } },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      predictions: { select: { totalPoints: true, scorePoints: true, outcomePoints: true } }
    }
  });

  const ranking = rows
    .map((user) => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
      total: user.predictions.reduce((s, p) => s + p.totalPoints, 0),
      exact: user.predictions.reduce((s, p) => s + p.scorePoints, 0),
      outcome: user.predictions.reduce((s, p) => s + p.outcomePoints, 0),
      count: user.predictions.length
    }))
    .sort((a, b) => b.total - a.total || b.exact - a.exact || b.outcome - a.outcome || a.name.localeCompare(b.name));

  return (
    <div>
      <div className="mb-8">
        <p className="font-bold uppercase tracking-wider text-yas-blue">Classement</p>
        <h1 className="text-4xl font-black">Ranking YAS</h1>
        <p className="mt-2 text-sm text-slate-500">Score exact : 3 pts • Bon résultat (victoire, défaite ou nul) : 1 pt.</p>
      </div>
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-yas-navy text-white">
              <tr>
                <th className="px-5 py-4">#</th>
                <th className="px-5 py-4">Participant</th>
                <th className="px-5 py-4">Total</th>
                <th className="px-5 py-4">Scores exacts</th>
                <th className="px-5 py-4">Bons résultats</th>
                <th className="px-5 py-4">Pronostics</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((r, i) => (
                <tr key={r.id} className="border-t border-slate-100">
                  <td className="px-5 py-4 font-black">{i < 3 ? <Medal className="inline text-yas-yellow" /> : i + 1}</td>
                  <td className="px-5 py-4"><p className="font-bold">{r.name}</p><p className="text-xs text-slate-500">{r.email}</p></td>
                  <td className="px-5 py-4 text-2xl font-black text-yas-blue">{r.total}</td>
                  <td className="px-5 py-4">{r.exact}</td>
                  <td className="px-5 py-4">{r.outcome}</td>
                  <td className="px-5 py-4">{r.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {ranking.length === 0 && <div className="p-10 text-center text-slate-500"><Trophy className="mx-auto mb-3" /> Aucun classement pour le moment.</div>}
      </div>
    </div>
  );
}
